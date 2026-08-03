import { NextResponse } from "next/server";
import {
  detectProfessionalPhotoDimensions,
  isAllowedProfessionalPhotoMimeType,
  professionalPhotoAssetFromUnknown,
  professionalPhotoStorageContract,
  professionalPhotoStoragePath,
  professionalPhotoUserMessage,
  sanitizeProfessionalPhotoFileName,
  validateProfessionalPhotoUploadInput,
  type CanonicalProfessionalPhotoAsset,
  type ProfessionalPhotoAssetView
} from "@/lib/professional-identity/professional-photo";
import { saveMergedDiscoveryAnswers } from "@/lib/professional-identity/professional-identity-write-service";
import { selectProfessionalIdentityDiscoveryRow, type DiscoveryCompatibilityRow } from "@/lib/professional-identity/professional-identity-discovery-compatibility";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const signedUrlTtlSeconds = 60 * 10;

async function requirePhotoUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: professionalPhotoUserMessage("storage_unavailable"), code: "storage_unavailable" }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: professionalPhotoUserMessage("session_expired"), code: "session_expired" }, { status: 401 }) };
  }

  return { supabase, user };
}

async function loadPhotoAsset(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string) {
  const { data, error } = await supabase
    .from("discovery_responses")
    .select("id,answers,generated_result,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const identityRow = selectProfessionalIdentityDiscoveryRow((data ?? []) as DiscoveryCompatibilityRow[]);
  return professionalPhotoAssetFromUnknown((identityRow?.answers as Record<string, unknown> | null | undefined)?.professional_photo_asset);
}

async function photoView(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, asset: CanonicalProfessionalPhotoAsset | null): Promise<ProfessionalPhotoAssetView | null> {
  if (!asset || asset.photoStatus !== "ready") return asset;
  const { data, error } = await supabase.storage
    .from(professionalPhotoStorageContract.bucketName)
    .createSignedUrl(asset.storagePath, signedUrlTtlSeconds);
  if (error || !data?.signedUrl) return { ...asset, signedUrl: null };
  return { ...asset, signedUrl: data.signedUrl };
}

function permissionPatchFromForm(formData: FormData, existing?: CanonicalProfessionalPhotoAsset | null) {
  return {
    photoConsent: formData.get("photoConsent") === "true" || existing?.photoConsent === true,
    profileVisibility: formData.get("profileVisibility") === "profile" ? "profile" as const : "private" as const,
    cvUsageAllowed: formData.get("cvUsageAllowed") === "true",
    publicSharingAllowed: formData.get("publicSharingAllowed") === "true"
  };
}

function storageFailureCode(error: unknown) {
  const source = error as { statusCode?: string | number; status?: string | number; error?: string; message?: string } | null;
  const status = String(source?.statusCode ?? source?.status ?? "").trim();
  const message = `${source?.error ?? ""} ${source?.message ?? ""}`.toLowerCase();
  if (status === "404" || message.includes("bucket") && (message.includes("not found") || message.includes("does not exist"))) {
    return "storage_bucket_missing";
  }
  if (status === "401" || status === "403" || message.includes("row-level security") || message.includes("permission") || message.includes("unauthorized")) {
    return "storage_permission_denied";
  }
  return "storage_unavailable";
}

function storageFailureDiagnostic(error: unknown) {
  if (process.env.NODE_ENV !== "development") return undefined;
  const source = error as { statusCode?: string | number; status?: string | number; error?: string; message?: string } | null;
  return {
    statusCode: source?.statusCode ?? source?.status ?? "unknown",
    error: source?.error ?? "storage_error",
    message: source?.message ?? "Supabase storage request failed."
  };
}

export async function GET() {
  const auth = await requirePhotoUser();
  if ("error" in auth) return auth.error;

  try {
    const asset = await loadPhotoAsset(auth.supabase, auth.user.id);
    return NextResponse.json({ photo: await photoView(auth.supabase, asset) });
  } catch {
    return NextResponse.json({ error: professionalPhotoUserMessage("metadata_failed"), code: "metadata_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requirePhotoUser();
  if ("error" in auth) return auth.error;

  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: professionalPhotoUserMessage("empty_file"), code: "empty_file" }, { status: 400 });
    }
    if (!isAllowedProfessionalPhotoMimeType(file.type)) {
      return NextResponse.json({ error: professionalPhotoUserMessage("unsupported_mime_type"), code: "unsupported_mime_type" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const dimensions = detectProfessionalPhotoDimensions(buffer, file.type);
    if (!dimensions) {
      return NextResponse.json({ error: professionalPhotoUserMessage("corrupted_image"), code: "corrupted_image" }, { status: 400 });
    }

    const validation = validateProfessionalPhotoUploadInput({
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      width: dimensions.width,
      height: dimensions.height
    });
    if (!validation.ok) {
      const code = validation.errors[0] ?? "upload_failed";
      return NextResponse.json({ error: professionalPhotoUserMessage(code), code, validation }, { status: 400 });
    }

    const previousAsset = await loadPhotoAsset(auth.supabase, auth.user.id);
    const photoAssetId = crypto.randomUUID();
    const storagePath = professionalPhotoStoragePath(auth.user.id, photoAssetId, file.type);
    const { error: uploadError } = await auth.supabase.storage
      .from(professionalPhotoStorageContract.bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      const code = storageFailureCode(uploadError);
      const status = code === "storage_permission_denied" ? 403 : 503;
      return NextResponse.json({ error: professionalPhotoUserMessage(code), code, diagnostic: storageFailureDiagnostic(uploadError) }, { status });
    }
    uploadedPath = storagePath;

    const now = new Date().toISOString();
    const permissions = permissionPatchFromForm(formData, previousAsset);
    const asset: CanonicalProfessionalPhotoAsset = {
      photoAssetId,
      userId: auth.user.id,
      storagePath,
      originalFileName: sanitizeProfessionalPhotoFileName(file.name),
      mimeType: file.type,
      fileSize: file.size,
      width: dimensions.width,
      height: dimensions.height,
      photoStatus: "ready",
      crop: {
        aspect: "portrait",
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
        focalPointX: 0.5,
        focalPointY: 0.5
      },
      derivatives: [],
      updatedAt: now,
      ...permissions
    };

    const saveResult = await saveMergedDiscoveryAnswers(auth.supabase, auth.user.id, {
      profile_photo: "Professional photo saved",
      professional_photo_asset: asset,
      professional_photo_updated_at: now
    });

    if (saveResult.error) {
      await auth.supabase.storage.from(professionalPhotoStorageContract.bucketName).remove([storagePath]);
      return NextResponse.json({ error: professionalPhotoUserMessage("metadata_failed"), code: "metadata_failed" }, { status: 500 });
    }
    uploadedPath = null;

    if (previousAsset?.storagePath && previousAsset.storagePath !== storagePath) {
      await auth.supabase.storage.from(professionalPhotoStorageContract.bucketName).remove([previousAsset.storagePath]);
    }

    return NextResponse.json({ photo: await photoView(auth.supabase, asset) });
  } catch {
    if (uploadedPath) {
      await auth.supabase.storage.from(professionalPhotoStorageContract.bucketName).remove([uploadedPath]);
    }
    return NextResponse.json({ error: professionalPhotoUserMessage("upload_failed"), code: "upload_failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requirePhotoUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      profileVisibility?: "private" | "profile";
      cvUsageAllowed?: boolean;
      publicSharingAllowed?: boolean;
      crop?: CanonicalProfessionalPhotoAsset["crop"];
    };
    const existing = await loadPhotoAsset(auth.supabase, auth.user.id);
    if (!existing) return NextResponse.json({ photo: null });

    const asset: CanonicalProfessionalPhotoAsset = {
      ...existing,
      profileVisibility: body.profileVisibility === "profile" ? "profile" : "private",
      cvUsageAllowed: body.cvUsageAllowed === true,
      publicSharingAllowed: body.publicSharingAllowed === true,
      crop: body.crop ?? existing.crop,
      updatedAt: new Date().toISOString()
    };

    const saveResult = await saveMergedDiscoveryAnswers(auth.supabase, auth.user.id, {
      profile_photo: "Professional photo saved",
      professional_photo_asset: asset,
      professional_photo_updated_at: asset.updatedAt
    });
    if (saveResult.error) {
      return NextResponse.json({ error: professionalPhotoUserMessage("metadata_failed"), code: "metadata_failed" }, { status: 500 });
    }

    return NextResponse.json({ photo: await photoView(auth.supabase, asset) });
  } catch {
    return NextResponse.json({ error: professionalPhotoUserMessage("metadata_failed"), code: "metadata_failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requirePhotoUser();
  if ("error" in auth) return auth.error;

  try {
    const existing = await loadPhotoAsset(auth.supabase, auth.user.id);
    if (existing?.storagePath) {
      const { error } = await auth.supabase.storage.from(professionalPhotoStorageContract.bucketName).remove([existing.storagePath]);
      if (error) return NextResponse.json({ error: professionalPhotoUserMessage("delete_failed"), code: "delete_failed" }, { status: 500 });
    }

    const saveResult = await saveMergedDiscoveryAnswers(auth.supabase, auth.user.id, {
      profile_photo: "",
      professional_photo_asset: null,
      professional_photo_updated_at: new Date().toISOString()
    });
    if (saveResult.error) {
      return NextResponse.json({ error: professionalPhotoUserMessage("metadata_failed"), code: "metadata_failed" }, { status: 500 });
    }

    return NextResponse.json({ photo: null });
  } catch {
    return NextResponse.json({ error: professionalPhotoUserMessage("delete_failed"), code: "delete_failed" }, { status: 500 });
  }
}
