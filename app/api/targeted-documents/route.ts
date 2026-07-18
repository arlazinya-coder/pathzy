import { NextResponse } from "next/server";
import { createTargetedProfessionalDocumentPackage, TargetedDocumentError, updateTargetedDocumentApproval } from "@/lib/job-intelligence";
import type { TargetedDocumentApprovalState } from "@/lib/job-intelligence/job-intelligence.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "PATHZY needs a quick setup before preparing targeted documents." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to prepare targeted documents." }, { status: 401 }) };
  }

  return { supabase, user };
}

function safeJsonError(error: unknown) {
  if (error instanceof TargetedDocumentError) {
    return NextResponse.json({ error: error.userMessage }, { status: error.status });
  }
  console.error("[targeted-documents] failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "We could not prepare targeted documents yet. Please review the job match and try again." }, { status: 500 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      analysisId?: string;
      includeApplicationEmail?: boolean;
      includeLinkedInMessage?: boolean;
      includeRecruiterMessage?: boolean;
    };
    if (!body.analysisId) {
      return NextResponse.json({ error: "Match analysis id is required." }, { status: 400 });
    }
    const targetedDocuments = await createTargetedProfessionalDocumentPackage(auth.supabase, auth.user.id, {
      analysisId: body.analysisId,
      includeApplicationEmail: body.includeApplicationEmail,
      includeLinkedInMessage: body.includeLinkedInMessage,
      includeRecruiterMessage: body.includeRecruiterMessage
    });
    return NextResponse.json({ targetedDocuments });
  } catch (caught) {
    return safeJsonError(caught);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { documentId?: string; approvalState?: TargetedDocumentApprovalState };
    if (!body.documentId || !body.approvalState) {
      return NextResponse.json({ error: "Document id and approval state are required." }, { status: 400 });
    }
    if (!["draft", "review_required", "approved", "changes_requested", "archived"].includes(body.approvalState)) {
      return NextResponse.json({ error: "Unsupported approval state." }, { status: 400 });
    }
    const document = await updateTargetedDocumentApproval(auth.supabase, auth.user.id, {
      documentId: body.documentId,
      approvalState: body.approvalState
    });
    return NextResponse.json({ document });
  } catch (caught) {
    return safeJsonError(caught);
  }
}
