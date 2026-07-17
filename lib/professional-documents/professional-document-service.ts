import type { SupabaseClient } from "@supabase/supabase-js";
import { canonicalProfileToCvModel, getOrCreateCanonicalProfile, saveProfessionalIdentityView, viewFreshnessFor } from "@/lib/canonical-profile";
import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import type { CvModel } from "@/components/professional-identity/document-downloads";
import { buildCvContentFromCanonicalProfile, buildCvViewFromContent } from "./cv-content-builder";
import { defaultCvViewConfiguration, CV_ENGINE_VERSION, CV_RENDERING_ENGINE_VERSION, CV_TEMPLATE_VERSION } from "./cv-configuration";
import { reviewCvQuality } from "./cv-quality";
import { resolveProfessionalDocumentTemplate } from "./professional-document-templates";
import type { CvPurpose, CvViewConfiguration, ProfessionalDocument } from "./professional-document.types";

type Supabase = SupabaseClient;

export type CreateCanonicalCvDocumentInput = {
  userId: string;
  name?: string;
  purpose?: CvPurpose;
  language?: "en" | "fr";
  targetRole?: string;
  targetIndustry?: string;
  targetJobId?: string;
  templateId?: string;
};

export type CanonicalCvDocumentResult = {
  profile: CanonicalProfessionalIdentity;
  cvModel: CvModel;
  document: ProfessionalDocument;
};

function selectedEntitiesFromConfiguration(configuration: CvViewConfiguration) {
  return {
    employmentIds: configuration.selectedEntityIds.employment,
    educationIds: configuration.selectedEntityIds.education,
    certificationIds: configuration.selectedEntityIds.certifications,
    skillIds: configuration.selectedEntityIds.skills,
    languageIds: configuration.selectedEntityIds.languages,
    projectIds: configuration.selectedEntityIds.projects,
    achievementIds: []
  };
}

function documentFromCanonicalProfile(profile: CanonicalProfessionalIdentity, input: CreateCanonicalCvDocumentInput): ProfessionalDocument {
  const configuration = defaultCvViewConfiguration({
    purpose: input.purpose ?? "general",
    language: input.language ?? "en",
    targetRole: input.targetRole,
    targetIndustry: input.targetIndustry,
    targetJobId: input.targetJobId
  });
  configuration.selectedEntityIds = {
    employment: profile.employment.filter((item) => item.status !== "archived").map((item) => item.id),
    education: profile.education.filter((item) => item.reviewStatus !== "archived").map((item) => item.id),
    certifications: profile.certifications.filter((item) => item.status !== "archived").map((item) => item.id),
    skills: profile.skills.filter((item) => item.status !== "archived" && item.explicitness !== "unconfirmed_implied").map((item) => item.id),
    projects: profile.projects.filter((item) => item.status !== "archived").map((item) => item.id),
    languages: profile.languages.filter((item) => item.status !== "archived").map((item) => item.id)
  };
  const content = buildCvContentFromCanonicalProfile(profile, configuration);
  const warnings = reviewCvQuality(content, configuration);
  const template = resolveProfessionalDocumentTemplate(input.templateId);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    canonicalProfileId: profile.id,
    profileVersion: profile.version,
    type: "cv",
    status: warnings.some((warning) => warning.severity === "blocking") ? "ready_with_warnings" : "ready",
    name: input.name ?? (input.targetRole ? `${input.targetRole} CV` : "General CV"),
    language: configuration.language,
    target: {
      targetRole: input.targetRole,
      targetIndustry: input.targetIndustry,
      targetJobId: input.targetJobId
    },
    configuration,
    selectedEntities: selectedEntitiesFromConfiguration(configuration),
    content,
    template: {
      templateId: template.id,
      templateVersion: template.version,
      layoutVariant: template.layout
    },
    generation: {
      contentEngineVersion: CV_ENGINE_VERSION,
      renderingEngineVersion: CV_RENDERING_ENGINE_VERSION,
      generatedAt: now
    },
    freshness: viewFreshnessFor({ profileVersion: profile.version, configuration: {} }, profile.version),
    warnings,
    createdAt: now,
    updatedAt: now
  };
}

export async function createCanonicalCvDocument(supabase: Supabase, input: CreateCanonicalCvDocumentInput): Promise<CanonicalCvDocumentResult> {
  const profile = await getOrCreateCanonicalProfile(supabase, input.userId);
  const document = documentFromCanonicalProfile(profile, input);
  const cvModel = canonicalProfileToCvModel(profile, document.configuration as CvViewConfiguration);
  const view = buildCvViewFromContent(profile, document.configuration as CvViewConfiguration, document.content as any);
  await saveProfessionalIdentityView(supabase, view);
  await persistProfessionalDocument(supabase, document);
  console.info("[professional-documents] CV created", {
    userId: input.userId,
    profileId: profile.id,
    profileVersion: profile.version,
    purpose: (document.configuration as CvViewConfiguration).purpose,
    warningCount: document.warnings.length
  });
  return { profile, cvModel, document };
}

export async function persistProfessionalDocument(supabase: Supabase, document: ProfessionalDocument) {
  const { data, error } = await supabase
    .from("professional_documents")
    .upsert(
      {
        id: document.id,
        user_id: document.userId,
        canonical_profile_id: document.canonicalProfileId,
        profile_version: document.profileVersion,
        document_type: document.type,
        name: document.name,
        status: document.status,
        language: document.language,
        purpose: (document.configuration as CvViewConfiguration).purpose ?? null,
        target_role: document.target?.targetRole ?? null,
        target_job_id: document.target?.targetJobId ?? null,
        template_id: document.template.templateId,
        template_version: document.template.templateVersion,
        configuration_json: document.configuration,
        content_json: document.content,
        selected_entities_json: document.selectedEntities,
        freshness_status: document.freshness.status,
        warnings_json: document.warnings,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function duplicateProfessionalDocument(supabase: Supabase, input: { userId: string; documentId: string; name?: string }) {
  const { data: document, error } = await supabase.from("professional_documents").select("*").eq("user_id", input.userId).eq("id", input.documentId).maybeSingle();
  if (error) throw error;
  if (!document) throw new Error("Document was not found for this user.");
  const now = new Date().toISOString();
  const copy = {
    ...document,
    id: crypto.randomUUID(),
    name: input.name ?? `${document.name} copy`,
    created_at: now,
    updated_at: now,
    archived_at: null
  };
  const { data: created, error: insertError } = await supabase.from("professional_documents").insert(copy).select("*").maybeSingle();
  if (insertError) throw insertError;
  console.info("[professional-documents] CV duplicated", { userId: input.userId, sourceDocumentId: input.documentId, documentId: created?.id });
  return created;
}

export async function renameProfessionalDocument(supabase: Supabase, input: { userId: string; documentId: string; name: string }) {
  const { data, error } = await supabase.from("professional_documents").update({ name: input.name.trim(), updated_at: new Date().toISOString() }).eq("user_id", input.userId).eq("id", input.documentId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function archiveProfessionalDocument(supabase: Supabase, input: { userId: string; documentId: string }) {
  const { data, error } = await supabase.from("professional_documents").update({ status: "archived", archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("user_id", input.userId).eq("id", input.documentId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordProfessionalDocumentExport(supabase: Supabase, input: { userId: string; documentId: string; profileVersion: number; exportType: "pdf" | "docx"; templateVersion: string; storagePath?: string | null; checksum?: string | null }) {
  const { data, error } = await supabase
    .from("professional_document_exports")
    .insert({
      document_id: input.documentId,
      user_id: input.userId,
      profile_version: input.profileVersion,
      export_type: input.exportType,
      template_version: input.templateVersion,
      storage_path: input.storagePath ?? null,
      checksum: input.checksum ?? null
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  console.info("[professional-documents] export completed", { userId: input.userId, documentId: input.documentId, exportType: input.exportType });
  return data;
}

export function legacyCvCompatibilityMetadata(input: { canonicalProfileId: string; profileVersion: number; templateName?: string | null; purpose?: CvPurpose }) {
  return {
    professionalDocument: {
      canonicalProfileId: input.canonicalProfileId,
      profileVersion: input.profileVersion,
      purpose: input.purpose ?? "general",
      templateVersion: CV_TEMPLATE_VERSION,
      source: "phase7_canonical_profile_view",
      compatibility: "legacy_cv_model_preserved"
    },
    cvView: {
      templateName: input.templateName ?? "Modern ATS",
      profileVersion: input.profileVersion
    }
  };
}

