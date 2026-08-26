import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { professionalIdentityCvDocument, professionalIdentityCvSyncStatus } from "@/lib/professional-identity/professional-identity-cv-model";
import { getProfessionalIdentityReadModel } from "@/lib/professional-identity/professional-identity-read-service";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { createCurrentProfessionalPhotoView } from "@/lib/professional-identity/professional-photo";
import { loadSavedProfessionalDocument } from "@/lib/professional-identity/saved-professional-documents";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function ProfessionalCvPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cv");
  const [unlocked, canExport, identityReadModel, discoveryResult, savedCvDocument] = await Promise.all([
    canCurrentUserUseProfessionalIdentityTools(supabase, user.id),
    canCurrentUserExportProfessionalDocuments(supabase, user.id),
    getProfessionalIdentityReadModel(supabase, user),
    supabase.from("discovery_responses").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
    loadSavedProfessionalDocument(supabase, user.id, { tool: "cv" })
  ]);
  const { data: discovery } = discoveryResult;
  const defaultTemplateName = "Atlas Professional";
  const discoverySnapshot = identityReadModel.discovery as Record<string, unknown> | null;
  const lastUpdated =
    identityReadModel.profile?.updated_at ??
    (typeof discoverySnapshot?.created_at === "string" ? discoverySnapshot.created_at : null);
  const generatedCvDocument = professionalIdentityCvDocument(identityReadModel.values, {
    templateName: defaultTemplateName,
    lastUpdated
  });
  const initialCvDocument = savedCvDocument ?? generatedCvDocument;
  const cvSyncStatus = professionalIdentityCvSyncStatus(identityReadModel.values, initialCvDocument?.updated_at ?? lastUpdated);
  const canonicalProfessionalPhoto = await createCurrentProfessionalPhotoView(supabase, identityReadModel.values.professional_photo_asset, { userId: user.id, expiresIn: 600 });

  return (
    <div className="page-pad mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
      <ProfessionalIdentityTool
        tool="cv"
        title="My CV"
        description="PATHZY reads your current Professional Identity and turns it into a recruiter-ready CV model for preview and export."
        trustNote="Factual edits belong in Professional Identity. CV controls only change presentation, template and document output."
        locked={!unlocked}
        exportLocked={!canExport}
        initialDocument={initialCvDocument}
        canonicalProfessionalPhoto={canonicalProfessionalPhoto}
        cvSyncStatus={cvSyncStatus}
        guidance={!discovery ? {
          recommendation: "Complete Career Discovery first.",
          why: "Your CV can use Professional Identity now. Completing Career Discovery later may help PATHZY improve recommendations.",
          impact: "+10 Job Readiness",
          followHref: "/discovery",
          followLabel: "Complete Discovery first",
          continueLabel: "Continue with synced CV"
        } : null}
        defaultOptions={{ cvType: "Entry-Level CV", language: "english", templateName: initialCvDocument?.template_name ?? defaultTemplateName }}
        fields={[
          { name: "cvType", label: "CV type", type: "select", options: ["Entry-Level CV", "Graduate CV", "Internship CV", "Career Change CV", "Professional CV"] }
        ]}
      />
    </div>
  );
}
