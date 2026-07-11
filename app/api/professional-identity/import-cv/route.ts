import { NextResponse } from "next/server";
import { canCurrentUserUseProfessionalIdentityTools, createImportedCvDraft } from "@/lib/professional-identity/professional-identity-service";
import { CvImportError, importCvFromUpload, validateCvImportFile } from "@/lib/professional-identity/cv-import";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const safeFailure = "We could not complete the CV import. Your existing PATHZY information is safe.";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to import your CV." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      fileName?: string;
      fileType?: string;
      fileSize?: number;
      base64?: string;
      templateName?: string;
    };
    const upload = {
      fileName: body.fileName ?? "",
      fileType: body.fileType ?? "",
      fileSize: body.fileSize ?? 0,
      base64: body.base64 ?? ""
    };

    validateCvImportFile(upload);

    if (!(await canCurrentUserUseProfessionalIdentityTools(auth.supabase, auth.user.id))) {
      return NextResponse.json({
        upgradeRequired: true,
        feature: "professional_identity",
        plan: "starter",
        limit: 0
      });
    }

    const imported = importCvFromUpload(upload);
    const document = await createImportedCvDraft(auth.supabase, auth.user.id, imported, body.templateName);

    return NextResponse.json({
      document,
      importSummary: {
        counts: imported.counts,
        reviewItems: imported.reviewItems,
        confidence: imported.confidence,
        message: "We've prepared your CV."
      }
    });
  } catch (caught) {
    if (caught instanceof CvImportError) {
      return NextResponse.json({ error: caught.userMessage }, { status: 400 });
    }

    console.error("[professional-identity] CV import failed", caught instanceof Error ? caught.message : caught);
    return NextResponse.json({ error: safeFailure }, { status: 500 });
  }
}
