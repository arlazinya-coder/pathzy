import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import {
  professionalIdentityLinkedInDocument,
  professionalIdentityLinkedInSyncStatus
} from "@/lib/professional-identity/professional-identity-linkedin-model";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { createCurrentProfessionalPhotoView } from "@/lib/professional-identity/professional-photo";
import { loadSavedProfessionalDocument } from "@/lib/professional-identity/saved-professional-documents";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type LinkedInSearchParams = {
  documentId?: string;
};

export default async function LinkedinPage({ searchParams }: { searchParams?: Promise<LinkedInSearchParams> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/linkedin");
  const params = searchParams ? await searchParams : {};
  const [unlocked, canExport, identity, savedDocument] = await Promise.all([
    canCurrentUserUseProfessionalIdentityTools(supabase, user.id),
    canCurrentUserExportProfessionalDocuments(supabase, user.id),
    getProfessionalIdentityReadModelSafe(supabase, user, "linkedin professional identity"),
    loadSavedProfessionalDocument(supabase, user.id, { tool: "linkedin", documentId: params.documentId })
  ]);
  const manualOverride = Boolean(savedDocument?.contentJson && (savedDocument.contentJson as Record<string, unknown>).linkedInVersion && ((savedDocument.contentJson as Record<string, unknown>).linkedInVersion as Record<string, unknown>).manualOverride);
  const canonicalProfessionalPhoto = await createCurrentProfessionalPhotoView(supabase, identity.values.professional_photo_asset, { userId: user.id, expiresIn: 600 });
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
        canonicalProfessionalPhoto={canonicalProfessionalPhoto}
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
