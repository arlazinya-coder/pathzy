import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile, saveProfessionalIdentityView, viewFreshnessFor } from "@/lib/canonical-profile";
import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import type { CvModel } from "@/components/professional-identity/document-downloads";
import { cvModelFromCvContent } from "./cv-content-adapter";
import { buildCvContentFromCanonicalProfile, buildCvViewFromContent } from "./cv-content-builder";
import { defaultCvViewConfiguration, CV_ENGINE_VERSION, CV_RENDERING_ENGINE_VERSION, CV_TEMPLATE_VERSION } from "./cv-configuration";
import { reviewCvQuality } from "./cv-quality";
import { fieldText } from "./presentation-fields";
import { deterministicProfessionalDocumentWriter } from "./professional-document-writer";
import { resolveProfessionalDocumentTemplate } from "./professional-document-templates";
import { validateProfessionalDocument } from "./professional-document-validation";
import type { CoverLetterResult, CvContent, CvPurpose, CvViewConfiguration, PresentationField, ProfessionalDocument } from "./professional-document.types";

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

function maybeUuid(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function collectPresentationFields(content: CvContent) {
  const rows: Array<{ fieldType: string; field: PresentationField }> = [
    { fieldType: "header.fullName", field: content.header.fullName },
    { fieldType: "header.targetRole", field: content.header.targetRole }
  ];
  for (const [key, field] of Object.entries(content.header)) {
    if (key === "fullName" || key === "targetRole" || !field) continue;
    rows.push({ fieldType: `header.${key}`, field: field as PresentationField });
  }
  if (content.professionalSummary) rows.push({ fieldType: "professionalSummary", field: content.professionalSummary });
  for (const skill of content.skills) rows.push({ fieldType: `skills.${skill.id}.name`, field: skill.name });
  for (const employment of content.employment) {
    rows.push({ fieldType: `employment.${employment.id}.role`, field: employment.role });
    rows.push({ fieldType: `employment.${employment.id}.employer`, field: employment.employer });
    if (employment.location) rows.push({ fieldType: `employment.${employment.id}.location`, field: employment.location });
    if (employment.dateRange) rows.push({ fieldType: `employment.${employment.id}.dateRange`, field: employment.dateRange });
    employment.bullets.forEach((field, index) => rows.push({ fieldType: `employment.${employment.id}.bullet.${index}`, field }));
  }
  for (const education of content.education) {
    rows.push({ fieldType: `education.${education.id}.qualification`, field: education.qualification });
    rows.push({ fieldType: `education.${education.id}.institution`, field: education.institution });
    if (education.fieldOfStudy) rows.push({ fieldType: `education.${education.id}.fieldOfStudy`, field: education.fieldOfStudy });
    if (education.date) rows.push({ fieldType: `education.${education.id}.date`, field: education.date });
  }
  for (const certification of content.certifications) {
    rows.push({ fieldType: `certifications.${certification.id}.name`, field: certification.name });
    if (certification.issuer) rows.push({ fieldType: `certifications.${certification.id}.issuer`, field: certification.issuer });
    if (certification.date) rows.push({ fieldType: `certifications.${certification.id}.date`, field: certification.date });
  }
  for (const project of content.projects) {
    rows.push({ fieldType: `projects.${project.id}.name`, field: project.name });
    if (project.role) rows.push({ fieldType: `projects.${project.id}.role`, field: project.role });
    if (project.description) rows.push({ fieldType: `projects.${project.id}.description`, field: project.description });
    if (project.impact) rows.push({ fieldType: `projects.${project.id}.impact`, field: project.impact });
  }
  for (const language of content.languages) {
    rows.push({ fieldType: `languages.${language.id}.language`, field: language.language });
    if (language.proficiency) rows.push({ fieldType: `languages.${language.id}.proficiency`, field: language.proficiency });
  }
  for (const section of content.additionalSections) {
    section.fields.forEach((field, index) => rows.push({ fieldType: `${section.type}.${section.id}.${index}`, field }));
  }
  return rows.filter((row) => fieldText(row.field));
}

async function enrichCvContentWithGroundedWriting(profile: CanonicalProfessionalIdentity, configuration: CvViewConfiguration, content: CvContent) {
  if (!fieldText(content.professionalSummary)) {
    const summary = await deterministicProfessionalDocumentWriter.generateProfessionalSummary({ profile, configuration });
    content.professionalSummary = summary.field;
  }
  for (const employment of content.employment) {
    employment.bullets = await Promise.all(
      employment.bullets.map(async (bullet) => {
        if (bullet.userApproved || bullet.sourceType !== "canonical") return bullet;
        const improved = await deterministicProfessionalDocumentWriter.improveExperienceBullet({
          canonicalEntityId: employment.id,
          sourceText: fieldText(bullet),
          targetRole: configuration.targetRole,
          language: configuration.language,
          sourceFactIds: bullet.sourceFactIds.length ? bullet.sourceFactIds : [employment.id]
        });
        return improved.unsupportedClaimDetected ? bullet : improved.field;
      })
    );
  }
  return content;
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
  document.content = await enrichCvContentWithGroundedWriting(profile, document.configuration as CvViewConfiguration, document.content as CvContent);
  document.warnings = [
    ...reviewCvQuality(document.content as CvContent, document.configuration as CvViewConfiguration, document.freshness.status),
    ...validateProfessionalDocument(document)
  ];
  document.status = document.warnings.some((warning) => warning.severity === "blocking") ? "ready_with_warnings" : "ready";
  const cvModel = cvModelFromCvContent(document.content as CvContent);
  const view = buildCvViewFromContent(profile, document.configuration as CvViewConfiguration, document.content as CvContent);
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

async function persistProfessionalDocumentFields(supabase: Supabase, document: ProfessionalDocument) {
  if (document.type !== "cv") return;
  const content = document.content as CvContent;
  const fields = collectPresentationFields(content).map(({ fieldType, field }) => ({
    document_id: document.id,
    user_id: document.userId,
    canonical_entity_id: maybeUuid(field.canonicalEntityId),
    canonical_field_path: field.canonicalFieldPath ?? null,
    field_type: fieldType,
    presentation_value: field.presentationValue,
    source_type: field.sourceType,
    user_approved: field.userApproved,
    generated_for_target_job_id: field.generatedForTargetJobId ?? null,
    generation_metadata_json: {
      sourceFactIds: field.sourceFactIds,
      approvalState: field.approvalState,
      unsupportedClaimDetected: field.unsupportedClaimDetected,
      language: field.language
    },
    approval_state: field.approvalState,
    source_fact_ids: field.sourceFactIds,
    unsupported_claim_detected: field.unsupportedClaimDetected,
    field_language: field.language,
    original_canonical_value: field.originalCanonicalValue ?? null,
    approved_master_value: field.approvedMasterValue ?? null,
    updated_at: new Date().toISOString()
  }));
  await supabase.from("professional_document_fields").delete().eq("document_id", document.id).eq("user_id", document.userId);
  if (!fields.length) return;
  const { error } = await supabase.from("professional_document_fields").insert(fields);
  if (error) throw error;
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
  await persistProfessionalDocumentFields(supabase, document);
  return data;
}

function documentFromRow(row: any): ProfessionalDocument {
  return {
    id: row.id,
    userId: row.user_id,
    canonicalProfileId: row.canonical_profile_id,
    profileVersion: row.profile_version,
    type: row.document_type,
    status: row.status,
    name: row.name,
    language: row.language,
    target: {
      targetRole: row.target_role ?? undefined,
      targetJobId: row.target_job_id ?? undefined
    },
    configuration: row.configuration_json ?? {},
    selectedEntities: row.selected_entities_json ?? { employmentIds: [], educationIds: [], certificationIds: [], skillIds: [], languageIds: [], projectIds: [], achievementIds: [] },
    content: row.content_json ?? {},
    template: {
      templateId: row.template_id,
      templateVersion: row.template_version
    },
    generation: {
      contentEngineVersion: CV_ENGINE_VERSION,
      renderingEngineVersion: CV_RENDERING_ENGINE_VERSION,
      generatedAt: row.created_at,
      regeneratedAt: row.updated_at
    },
    freshness: {
      profileVersionUsed: row.profile_version,
      currentProfileVersion: row.profile_version,
      status: row.freshness_status,
      changedEntityIds: []
    },
    warnings: row.warnings_json ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listProfessionalDocuments(supabase: Supabase, input: { userId: string; type?: "cv" | "cover_letter"; includeArchived?: boolean }) {
  let query = supabase.from("professional_documents").select("*").eq("user_id", input.userId).order("updated_at", { ascending: false });
  if (input.type) query = query.eq("document_type", input.type);
  if (!input.includeArchived) query = query.neq("status", "archived");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(documentFromRow);
}

export async function loadProfessionalDocument(supabase: Supabase, input: { userId: string; documentId: string }) {
  const { data, error } = await supabase.from("professional_documents").select("*").eq("user_id", input.userId).eq("id", input.documentId).maybeSingle();
  if (error) throw error;
  return data ? documentFromRow(data) : null;
}

export async function refreshProfessionalDocumentFreshness(supabase: Supabase, input: { userId: string; documentId: string; changedEntityIds?: string[] }) {
  const [document, profile] = await Promise.all([
    loadProfessionalDocument(supabase, input),
    getOrCreateCanonicalProfile(supabase, input.userId)
  ]);
  if (!document) return null;
  const freshness = viewFreshnessFor({
    profileVersion: document.profileVersion,
    configuration: {
      selectedEmploymentIds: document.selectedEntities.employmentIds,
      selectedEducationIds: document.selectedEntities.educationIds,
      selectedSkillIds: document.selectedEntities.skillIds,
      selectedCertificationIds: document.selectedEntities.certificationIds
    }
  }, profile.version, input.changedEntityIds ?? []);
  const warnings = validateProfessionalDocument({ ...document, freshness });
  const status = freshness.status === "current" ? document.status : "stale";
  const { data, error } = await supabase
    .from("professional_documents")
    .update({ freshness_status: freshness.status, status, warnings_json: [...document.warnings, ...warnings], updated_at: new Date().toISOString() })
    .eq("user_id", input.userId)
    .eq("id", input.documentId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? documentFromRow(data) : null;
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

export async function createCoverLetterDocumentDraft(supabase: Supabase, input: { userId: string; targetRole: string; companyName?: string; jobDescription?: string; language?: "en" | "fr"; name?: string; targetJobId?: string }) {
  const profile = await getOrCreateCanonicalProfile(supabase, input.userId);
  const result: CoverLetterResult = await deterministicProfessionalDocumentWriter.generateCoverLetter({
    profile,
    targetRole: input.targetRole,
    companyName: input.companyName,
    jobDescription: input.jobDescription,
    language: input.language ?? "en"
  });
  const now = new Date().toISOString();
  const document: ProfessionalDocument = {
    id: crypto.randomUUID(),
    userId: input.userId,
    canonicalProfileId: profile.id,
    profileVersion: profile.version,
    type: "cover_letter",
    status: result.warnings.some((warning) => warning.severity === "blocking") ? "ready_with_warnings" : "draft",
    name: input.name ?? `${input.targetRole} Cover Letter`,
    language: input.language ?? "en",
    target: {
      targetRole: input.targetRole,
      targetJobId: input.targetJobId
    },
    configuration: {
      targetRole: input.targetRole,
      targetJobId: input.targetJobId,
      companyName: input.companyName,
      language: input.language ?? "en"
    },
    selectedEntities: {
      employmentIds: profile.employment.filter((item) => item.status !== "archived").slice(0, 3).map((item) => item.id),
      educationIds: profile.education.filter((item) => item.reviewStatus !== "archived").slice(0, 2).map((item) => item.id),
      certificationIds: profile.certifications.filter((item) => item.status !== "archived").slice(0, 3).map((item) => item.id),
      skillIds: profile.skills.filter((item) => item.status !== "archived" && item.explicitness !== "unconfirmed_implied").slice(0, 8).map((item) => item.id),
      languageIds: profile.languages.filter((item) => item.status !== "archived").map((item) => item.id),
      projectIds: profile.projects.filter((item) => item.status !== "archived").slice(0, 3).map((item) => item.id),
      achievementIds: profile.achievements.filter((item) => item.status !== "archived").slice(0, 3).map((item) => item.id)
    },
    content: result.content,
    template: {
      templateId: "professional-letter",
      templateVersion: CV_TEMPLATE_VERSION,
      layoutVariant: "single_column"
    },
    generation: {
      contentEngineVersion: CV_ENGINE_VERSION,
      renderingEngineVersion: CV_RENDERING_ENGINE_VERSION,
      generatedAt: now
    },
    freshness: viewFreshnessFor({ profileVersion: profile.version, configuration: {} }, profile.version),
    warnings: result.warnings,
    createdAt: now,
    updatedAt: now
  };
  await persistProfessionalDocument(supabase, document);
  console.info("[professional-documents] cover-letter draft created", { userId: input.userId, profileId: profile.id, profileVersion: profile.version });
  return { profile, document };
}

export async function createUpdatedProfessionalDocumentCopy(supabase: Supabase, input: { userId: string; documentId: string; name?: string }) {
  const existing = await loadProfessionalDocument(supabase, input);
  if (!existing) throw new Error("Document was not found for this user.");
  if (existing.type !== "cv") return duplicateProfessionalDocument(supabase, { userId: input.userId, documentId: input.documentId, name: input.name });
  const configuration = existing.configuration as CvViewConfiguration;
  return createCanonicalCvDocument(supabase, {
    userId: input.userId,
    name: input.name ?? `${existing.name} updated`,
    purpose: configuration.purpose,
    language: configuration.language,
    targetRole: existing.target?.targetRole,
    targetIndustry: existing.target?.targetIndustry,
    targetJobId: existing.target?.targetJobId,
    templateId: existing.template.templateId
  });
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
