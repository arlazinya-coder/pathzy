import { NextResponse } from "next/server";
import {
  compactDocumentTitle,
  isVaultDocumentCategory,
  isVaultDocumentType,
  sanitizeVaultFileName,
  validateVaultUploadInput,
  vaultDocumentFromRow,
  vaultDocumentStorageContract,
  vaultDocumentTypeForCategory,
  vaultStoragePath,
  vaultUploadErrorMessage,
  type VaultDocumentCategory,
  type VaultDocumentType
} from "@/lib/professional-identity/document-vault";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireDocumentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: vaultUploadErrorMessage("storage_unavailable"), code: "storage_unavailable" }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to manage your documents.", code: "session_expired" }, { status: 401 }) };
  }

  return { supabase, user };
}

function storageFailureCode(error: { statusCode?: string | number; message?: string } | null | undefined) {
  const status = String(error?.statusCode ?? "");
  const message = String(error?.message ?? "").toLowerCase();
  if (status === "404" || message.includes("bucket") && (message.includes("not found") || message.includes("does not exist"))) {
    return "storage_unavailable";
  }
  if (status === "401" || status === "403" || message.includes("permission") || message.includes("policy") || message.includes("row-level")) {
    return "storage_permission_denied";
  }
  return "upload_failed";
}

function storageFailureDiagnostic(error: { statusCode?: string | number; error?: string; message?: string } | null | undefined) {
  if (process.env.NODE_ENV !== "development") return undefined;
  return {
    statusCode: error?.statusCode ?? "unknown",
    error: error?.error ?? "storage_error",
    message: error?.message ?? "Supabase storage request failed."
  };
}

function storageFailureResponse(error: { statusCode?: string | number; error?: string; message?: string } | null | undefined, action: "open" | "upload") {
  const code = storageFailureCode(error);
  const status = code === "storage_permission_denied" ? 403 : code === "upload_failed" ? 500 : 503;
  console.warn("[document-vault] storage request failed", {
    action,
    code,
    statusCode: error?.statusCode ?? "unknown",
    message: error?.message ?? "Supabase storage request failed."
  });
  const diagnostic = storageFailureDiagnostic(error);
  return NextResponse.json(
    {
      error: vaultUploadErrorMessage(code),
      code,
      ...(diagnostic ? { diagnostic } : {})
    },
    { status }
  );
}

function jsonValue(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function safeTitle(title: FormDataEntryValue | null, fileName: string, type: VaultDocumentType) {
  const value = typeof title === "string" ? title.trim() : "";
  return compactDocumentTitle(value || sanitizeVaultFileName(fileName).replace(/\.[^.]+$/, "").replace(/-/g, " "), type);
}

export async function GET(request: Request) {
  const auth = await requireDocumentUser();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Document is required." }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("user_documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Document was not found." }, { status: 404 });
  const document = vaultDocumentFromRow(data as Record<string, unknown>);
  if (!document) return NextResponse.json({ error: "This item is not a vault document." }, { status: 400 });
  if (!document.storagePath) return NextResponse.json({ document, signedUrl: null });

  const { data: signed, error: signError } = await auth.supabase.storage
    .from(vaultDocumentStorageContract.bucketName)
    .createSignedUrl(document.storagePath, 300);

  if (signError || !signed?.signedUrl) {
    return storageFailureResponse(signError, "open");
  }

  return NextResponse.json({ document, signedUrl: signed.signedUrl });
}

export async function POST(request: Request) {
  const auth = await requireDocumentUser();
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a document to upload.", code: "missing_file" }, { status: 400 });
  }

  const requestedType = formData.get("documentType");
  const requestedCategory = formData.get("category");
  const documentType = isVaultDocumentType(requestedType)
    ? requestedType
    : vaultDocumentTypeForCategory(isVaultDocumentCategory(requestedCategory) ? requestedCategory : "other");
  const vaultCategory = isVaultDocumentCategory(requestedCategory) && requestedCategory !== "all" ? requestedCategory : "other";
  const validation = validateVaultUploadInput({ fileName: file.name, mimeType: file.type, sizeBytes: file.size });
  if (!validation.ok) {
    const code = validation.errors[0] ?? "upload_failed";
    return NextResponse.json({ error: vaultUploadErrorMessage(code), code, validation }, { status: 400 });
  }

  const replacingId = typeof formData.get("replaceDocumentId") === "string" ? String(formData.get("replaceDocumentId")) : "";
  const documentId = replacingId || crypto.randomUUID();
  const storagePath = vaultStoragePath(auth.user.id, documentId, file.name);
  const now = new Date().toISOString();
  const bytes = await file.arrayBuffer();
  const title = safeTitle(formData.get("title"), file.name, documentType);
  const textContent = file.type === "text/plain" ? Buffer.from(bytes).toString("utf8").slice(0, 25_000) : "";

  let previousStoragePath: string | null = null;
  try {
    if (replacingId) {
      const { data: existing, error: existingError } = await auth.supabase
        .from("user_documents")
        .select("*")
        .eq("id", replacingId)
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (existingError || !existing) return NextResponse.json({ error: "Document was not found." }, { status: 404 });
      const existingVaultDocument = vaultDocumentFromRow(existing as Record<string, unknown>);
      if (!existingVaultDocument || existingVaultDocument.source !== "uploaded") {
        return NextResponse.json({ error: "Only uploaded files can be replaced from My Documents." }, { status: 400 });
      }
      previousStoragePath = existingVaultDocument.storagePath;
    }

    const { error: uploadError } = await auth.supabase.storage
      .from(vaultDocumentStorageContract.bucketName)
      .upload(storagePath, bytes, { contentType: file.type, upsert: true });

    if (uploadError) {
      return storageFailureResponse(uploadError, "upload");
    }

    const contentJson = {
      original_file_name: sanitizeVaultFileName(file.name),
      original_file_type: file.type,
      original_file_size: file.size,
      storage_path: storagePath,
      vault_category: vaultCategory,
      source: "my_documents_upload"
    };

    const write = replacingId
      ? auth.supabase
          .from("user_documents")
          .update({
            document_type: documentType,
            document_title: title,
            content_text: textContent,
            content_json: contentJson,
            file_url: storagePath,
            status: "ready",
            updated_at: now
          })
          .eq("id", replacingId)
          .eq("user_id", auth.user.id)
          .select("*")
          .single()
      : auth.supabase
          .from("user_documents")
          .insert({
            id: documentId,
            user_id: auth.user.id,
            document_type: documentType,
            document_title: title,
            content_text: textContent,
            content_json: contentJson,
            file_url: storagePath,
            status: "ready",
            version_number: 1,
            created_at: now,
            updated_at: now
          })
          .select("*")
          .single();

    const { data, error } = await write;
    if (error) {
      await auth.supabase.storage.from(vaultDocumentStorageContract.bucketName).remove([storagePath]);
      throw error;
    }

    if (previousStoragePath && previousStoragePath !== storagePath) {
      await auth.supabase.storage.from(vaultDocumentStorageContract.bucketName).remove([previousStoragePath]);
    }

    return NextResponse.json({ document: vaultDocumentFromRow(data as Record<string, unknown>) });
  } catch (caught) {
    console.error("[document-vault] upload failed", { userId: auth.user.id, message: caught instanceof Error ? caught.message : "Unknown error" });
    return NextResponse.json({ error: vaultUploadErrorMessage("upload_failed"), code: "upload_failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDocumentUser();
  if ("error" in auth) return auth.error;
  const body = await request.json() as { id?: string; title?: string; category?: VaultDocumentCategory; documentType?: VaultDocumentType; status?: "draft" | "final" | "archived" };
  if (!body.id) return NextResponse.json({ error: "Document is required." }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("user_documents")
    .select("*")
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (existingError || !existing) return NextResponse.json({ error: "Document was not found." }, { status: 404 });
  const existingRow = existing as Record<string, unknown>;
  const existingDocument = vaultDocumentFromRow(existingRow);
  if (!existingDocument) return NextResponse.json({ error: "This item is not a vault document." }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.title === "string" && body.title.trim()) update.document_title = compactDocumentTitle(body.title, existingDocument.documentType);
  const nextType = isVaultDocumentType(body.documentType)
    ? body.documentType
    : body.category && body.category !== "all"
      ? vaultDocumentTypeForCategory(body.category)
      : null;
  if (nextType && existingDocument.source === "uploaded") update.document_type = nextType;
  if (body.status === "final") update.status = "ready";
  if (body.status === "draft" || body.status === "archived") update.status = body.status;
  if (existingDocument.source === "uploaded") {
    update.content_json = {
      ...jsonValue(existingRow.content_json),
      vault_category: nextType ? vaultDocumentFromRow({ ...existingRow, document_type: nextType })?.category : existingDocument.category
    };
  }

  const { data, error } = await auth.supabase
    .from("user_documents")
    .update(update)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Could not save this document." }, { status: 500 });
  return NextResponse.json({ document: vaultDocumentFromRow(data as Record<string, unknown>) });
}

export async function DELETE(request: Request) {
  const auth = await requireDocumentUser();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Document is required." }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("user_documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (existingError || !existing) return NextResponse.json({ error: "Document was not found." }, { status: 404 });
  const document = vaultDocumentFromRow(existing as Record<string, unknown>);
  if (!document) return NextResponse.json({ error: "This item is not a vault document." }, { status: 400 });

  const { error } = await auth.supabase.from("user_documents").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "Could not delete this document." }, { status: 500 });
  if (document.storagePath) {
    await auth.supabase.storage.from(vaultDocumentStorageContract.bucketName).remove([document.storagePath]);
  }
  return NextResponse.json({ ok: true });
}
