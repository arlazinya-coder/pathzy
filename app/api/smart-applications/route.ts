import { NextResponse } from "next/server";
import { prepareSmartApplicationWorkspace, SmartApplicationError, updateSmartApplicationApproval, updateSmartApplicationSupportingDocuments } from "@/lib/applications/smart-application-service";
import type { SmartApplicationApprovals } from "@/lib/applications/smart-application.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "PATHZY needs a quick setup before preparing your application workspace." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to prepare an application workspace." }, { status: 401 }) };
  }

  return { supabase, user };
}

function safeJsonError(error: unknown) {
  if (error instanceof SmartApplicationError) {
    return NextResponse.json({ error: error.userMessage }, { status: error.status });
  }
  console.error("[smart-applications] failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "We could not prepare this application workspace yet. Your documents are safe." }, { status: 500 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { analysisId?: string; createAnotherVersion?: boolean };
    if (!body.analysisId) {
      return NextResponse.json({ error: "Match analysis id is required." }, { status: 400 });
    }
    const result = await prepareSmartApplicationWorkspace(auth.supabase, auth.user.id, {
      analysisId: body.analysisId,
      createAnotherVersion: Boolean(body.createAnotherVersion)
    });
    return NextResponse.json(result);
  } catch (caught) {
    return safeJsonError(caught);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      applicationId?: string;
      approval?: keyof SmartApplicationApprovals;
      supportingDocumentIds?: string[];
      value?: boolean;
    };
    if (!body.applicationId) {
      return NextResponse.json({ error: "Application id is required." }, { status: 400 });
    }
    if (Array.isArray(body.supportingDocumentIds)) {
      const application = await updateSmartApplicationSupportingDocuments(auth.supabase, auth.user.id, {
        applicationId: body.applicationId,
        supportingDocumentIds: body.supportingDocumentIds
      });
      return NextResponse.json({ application });
    }
    if (!body.approval) {
      return NextResponse.json({ error: "Approval is required." }, { status: 400 });
    }
    if (!["cv", "coverLetter", "applicationMessage", "supportingDocuments", "packageApproved"].includes(body.approval)) {
      return NextResponse.json({ error: "Unsupported approval type." }, { status: 400 });
    }
    const application = await updateSmartApplicationApproval(auth.supabase, auth.user.id, {
      applicationId: body.applicationId,
      approval: body.approval,
      value: Boolean(body.value)
    });
    return NextResponse.json({ application });
  } catch (caught) {
    return safeJsonError(caught);
  }
}
