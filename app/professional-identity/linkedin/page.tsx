import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import {
  professionalIdentityLinkedInDocument,
  professionalIdentityLinkedInSyncStatus
} from "@/lib/professional-identity/professional-identity-linkedin-model";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import type { GeneratedProfessionalDocument } from "@/lib/professional-identity/professional-identity-types";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type LinkedInSearchParams = {
  documentId?: string;
};

async function loadExistingLinkedInDocument(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  documentId?: string
): Promise<GeneratedProfessionalDocument | null> {
  if (!documentId) return null;
  const { data, error } = await supabase
    .from("user_documents")
    .select("id,document_title,content_text,content_json,template_name,updated_at,created_at")
    .eq("user_id", userId)
    .eq("id", documentId)
    .maybeSingle();
  if (error || !data) return null;
  const contentJson = data.content_json && typeof data.content_json === "object" ? data.content_json as Record<string, unknown> : null;
  return {
    id: data.id,
    tool: "linkedin",
    title: data.document_title ?? "LinkedIn profile optimization",
    content: data.content_text ?? "",
    contentJson,
    template_name: data.template_name ?? null,
    updated_at: data.updated_at ?? data.created_at ?? null,
    created_at: data.created_at ?? null,
    fields: contentJson && "fields" in contentJson ? contentJson.fields as GeneratedProfessionalDocument["fields"] : undefined
  };
}

export default async function LinkedinPage({ searchParams }: { searchParams?: Promise<LinkedInSearchParams> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/linkedin");
  const params = searchParams ? await searchParams : {};
  const [unlocked, canExport, identity, savedDocument] = await Promise.all([
    canCurrentUserUseProfessionalIdentityTools(supabase, user.id),
    canCurrentUserExportProfessionalDocuments(supabase, user.id),
    getProfessionalIdentityReadModelSafe(supabase, user, "linkedin professional identity"),
    loadExistingLinkedInDocument(supabase, user.id, params.documentId)
  ]);
  const manualOverride = Boolean(savedDocument?.contentJson && (savedDocument.contentJson as Record<string, unknown>).linkedInVersion && ((savedDocument.contentJson as Record<string, unknown>).linkedInVersion as Record<string, unknown>).manualOverride);
  const initialDocument = savedDocument ?? professionalIdentityLinkedInDocument(identity.values, {
    lastUpdated: identity.profile?.updated_at ?? null,
    documentId: params.documentId,
    language: identity.values.professional_document_language === "french" ? "french" : "english",
    manualOverride
  });
  const linkedInSyncStatus = professionalIdentityLinkedInSyncStatus(identity.values, {
    lastUpdated: initialDocument?.updated_at ?? null,
    profileUpdatedAt: identity.profile?.updated_at ?? null,
    manualOverride
  });
  const firstMissing = linkedInSyncStatus.missingSections[0];

  return (
    <div className="page-pad mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <ProfessionalIdentityTool
        tool="linkedin"
        title="My LinkedIn"
        description="PATHZY already knows your professional background. It helps you present it properly on LinkedIn."
        trustNote="PATHZY does not log into LinkedIn. You copy and apply suggestions yourself."
        locked={!unlocked}
        exportLocked={!canExport}
        initialDocument={initialDocument}
        linkedInSyncStatus={linkedInSyncStatus}
        guidance={firstMissing ? {
          recommendation: "Your LinkedIn profile needs a little more information.",
          why: `${firstMissing.label}: ${firstMissing.missingFields.join(", ")}`,
          impact: "Stronger LinkedIn positioning",
          followHref: firstMissing.href,
          followLabel: `Edit ${firstMissing.label}`,
          continueLabel: "Return to LinkedIn"
        } : null}
        defaultOptions={{ language: identity.values.professional_document_language === "french" ? "french" : "english" }}
        fields={[]}
      />
    </div>
  );
}
