import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require(path.resolve("node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/lib/typescript.js"));

const dashboard = readFileSync("app/dashboard/page.tsx", "utf8");
const legacyCvBuilderPage = readFileSync("app/cv-builder/page.tsx", "utf8");
const legacyEmploymentTrackerPage = readFileSync("app/employment-tracker/page.tsx", "utf8");
const legacyProgressPage = readFileSync("app/progress/page.tsx", "utf8");
const legacyProfilePage = readFileSync("app/profile/page.tsx", "utf8");
const legacyRegisterPage = readFileSync("app/register/page.tsx", "utf8");
const signupPage = readFileSync("app/signup/page.tsx", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");
const landingContent = readFileSync("components/public/landing-content.tsx", "utf8");
const signupContent = readFileSync("components/auth/signup-content.tsx", "utf8");
const loginContent = readFileSync("components/auth/login-content.tsx", "utf8");
const loginForm = readFileSync("components/auth/login-form.tsx", "utf8");
const registerForm = readFileSync("components/auth/register-form.tsx", "utf8");
const logoutButton = readFileSync("components/auth/logout-button.tsx", "utf8");
const resetPasswordForm = readFileSync("components/auth/reset-password-form.tsx", "utf8");
const updatePasswordForm = readFileSync("components/auth/update-password-form.tsx", "utf8");
const authCallback = readFileSync("app/auth/callback/route.ts", "utf8");
const onboardingPage = readFileSync("app/onboarding/page.tsx", "utf8");
const onboardingApi = readFileSync("app/api/onboarding/route.ts", "utf8");
const onboardingFlow = readFileSync("components/onboarding/onboarding-flow.tsx", "utf8");
const supabaseMiddleware = readFileSync("lib/supabase/middleware.ts", "utf8");
const rootLayout = readFileSync("app/layout.tsx", "utf8");
const appGlobals = readFileSync("app/globals.css", "utf8");
const roadmapLayout = readFileSync("app/roadmap/layout.tsx", "utf8");
const professionalIdentityLayout = readFileSync("app/professional-identity/layout.tsx", "utf8");
const opportunitiesLayout = readFileSync("app/opportunities/layout.tsx", "utf8");
const employmentCenterLayout = readFileSync("app/employment-center/layout.tsx", "utf8");
const employmentCenterPage = readFileSync("app/employment-center/page.tsx", "utf8");
const applicationsLayout = readFileSync("app/applications/layout.tsx", "utf8");
const skillsLayout = readFileSync("app/skills/layout.tsx", "utf8");
const billingLayout = readFileSync("app/billing/layout.tsx", "utf8");
const pricingPage = readFileSync("app/pricing/page.tsx", "utf8");
const pricingContent = readFileSync("app/pricing/pricing-content.tsx", "utf8");
const settingsLayout = readFileSync("app/settings/layout.tsx", "utf8");
const progressEngine = readFileSync("lib/progress/progress-engine.ts", "utf8");
const launchService = readFileSync("lib/launch/launch-service.ts", "utf8");
const timeline = readFileSync("components/journey/pathzy-timeline.tsx", "utf8");
const navigation = readFileSync("lib/pathzy-data.ts", "utf8");
const appShell = readFileSync("components/app-shell.tsx", "utf8");
const journeyRouter = readFileSync("lib/progress/journey-router.ts", "utf8");
const nextActionEngine = readFileSync("lib/progress/next-action-engine.ts", "utf8");
const operatingSystem = readFileSync("lib/operating-system/employment-operating-system.ts", "utf8");
const routes = readFileSync("lib/navigation/routes.ts", "utf8");
const authRouting = readFileSync("lib/navigation/auth-routing.ts", "utf8");
const redirects = readFileSync("lib/navigation/redirects.ts", "utf8");
const authSessionSafety = readFileSync("lib/auth/session-safety.ts", "utf8");
const authFormErrors = readFileSync("lib/auth/auth-form-errors.ts", "utf8");
const supabaseBrowserClient = readFileSync("lib/supabase/client.ts", "utf8");
const authorization = readFileSync("lib/access/authorization.ts", "utf8");
const languagePreferences = readFileSync("lib/language/language-preferences.ts", "utf8");
const pathzyI18n = readFileSync("lib/language/pathzy-i18n.ts", "utf8");
const employmentReadinessCheck = readFileSync("lib/readiness/employment-readiness-check.ts", "utf8");
const languageSelector = readFileSync("components/language/language-selector.tsx", "utf8");
const serverLanguage = readFileSync("lib/language/server-language.ts", "utf8");
const errorNormalization = readFileSync("lib/errors/error-normalization.ts", "utf8");
const languageSettingsForm = readFileSync("components/settings/language-settings-form.tsx", "utf8");
const roadmapPage = readFileSync("app/roadmap/page.tsx", "utf8");
const professionalIdentityPage = readFileSync("app/professional-identity/page.tsx", "utf8");
const professionalIdentityReviewRoute = readFileSync("app/professional-identity/review/page.tsx", "utf8");
const professionalIdentitySectionRoute = readFileSync("app/professional-identity/section/[sectionId]/page.tsx", "utf8");
const professionalIdentityApi = readFileSync("app/api/professional-identity/route.ts", "utf8");
const profileActionEditor = readFileSync("components/professional-identity/profile-action-editor.tsx", "utf8");
const professionalPhotoApi = readFileSync("app/api/professional-identity/photo/route.ts", "utf8");
const professionalIdentityCompletion = readFileSync("lib/professional-identity/professional-identity-completion.ts", "utf8");
const professionalIdentityExperience = readFileSync("lib/professional-identity/professional-identity-experience.ts", "utf8");
const professionalIdentityCvModel = readFileSync("lib/professional-identity/professional-identity-cv-model.ts", "utf8");
const coverLetterIntelligence = readFileSync("lib/professional-identity/cover-letter-intelligence.ts", "utf8");
const professionalIdentityReadService = readFileSync("lib/professional-identity/professional-identity-read-service.ts", "utf8");
const professionalIdentityDiscoveryCompatibility = readFileSync("lib/professional-identity/professional-identity-discovery-compatibility.ts", "utf8");
const professionalIdentityAutosave = readFileSync("lib/professional-identity/use-professional-identity-autosave.ts", "utf8");
const professionalIdentityWriteService = readFileSync("lib/professional-identity/professional-identity-write-service.ts", "utf8");
const professionalIdentitySync = readFileSync("lib/professional-identity/professional-identity-sync.ts", "utf8");
const savedProfessionalDocuments = readFileSync("lib/professional-identity/saved-professional-documents.ts", "utf8");
const currentSituationContract = readFileSync("lib/professional-identity/current-situation.ts", "utf8");
const cvConfiguration = readFileSync("lib/professional-documents/cv-configuration.ts", "utf8");
const employmentIntelligenceDomainIndex = readFileSync("lib/employment-intelligence/domain/index.ts", "utf8");
const employmentIntelligenceInputContract = readFileSync("lib/employment-intelligence/domain/employment-intelligence-input.ts", "utf8");
const employmentIntelligenceProfileContract = readFileSync("lib/employment-intelligence/domain/employment-intelligence-profile.ts", "utf8");
const employmentOpportunityMatchingContract = readFileSync("lib/employment-intelligence/domain/opportunity-matching.ts", "utf8");
const employmentIntelligenceCollectionInvariants = readFileSync("lib/employment-intelligence/domain/collection-invariants.ts", "utf8");
const employmentIntelligenceCountryContract = readFileSync("lib/employment-intelligence/domain/country-context.ts", "utf8");
const employmentIntelligenceEngineIndex = readFileSync("lib/employment-intelligence/engine/index.ts", "utf8");
const employmentSharedIntelligenceEngine = readFileSync("lib/employment-intelligence/engine/build-shared-intelligence.ts", "utf8");
const employmentIntelligenceEngineSource = [
  "lib/employment-intelligence/engine/assess-evidence.ts",
  "lib/employment-intelligence/engine/build-shared-intelligence.ts",
  "lib/employment-intelligence/engine/assess-readiness.ts",
  "lib/employment-intelligence/engine/build-explanations.ts",
  "lib/employment-intelligence/engine/calculate-confidence.ts",
  "lib/employment-intelligence/engine/detect-barriers.ts",
  "lib/employment-intelligence/engine/detect-missing-information.ts",
  "lib/employment-intelligence/engine/engine-types.ts",
  "lib/employment-intelligence/engine/engine-version.ts",
  "lib/employment-intelligence/engine/evaluate-pathways.ts",
  "lib/employment-intelligence/engine/extract-signals.ts",
  "lib/employment-intelligence/engine/fixtures.ts",
  "lib/employment-intelligence/engine/generate-employment-intelligence.ts",
  "lib/employment-intelligence/engine/identify-strengths.ts",
  "lib/employment-intelligence/engine/index.ts",
  "lib/employment-intelligence/engine/normalize-input.ts",
  "lib/employment-intelligence/engine/select-support-intensity.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const employmentCountryContextSource = [
  "lib/employment-intelligence/country/country-employment-context.ts",
  "lib/employment-intelligence/country/generic-country-context.ts",
  "lib/employment-intelligence/country/resolve-country-context.ts",
  "lib/employment-intelligence/country/country-context-registry.ts",
  "lib/employment-intelligence/country/adapters/south-africa/data-status.ts",
  "lib/employment-intelligence/country/adapters/south-africa/source-registry.ts",
  "lib/employment-intelligence/country/adapters/south-africa/regions.ts",
  "lib/employment-intelligence/country/adapters/south-africa/qualification-framework.ts",
  "lib/employment-intelligence/country/adapters/south-africa/work-authorisation-context.ts",
  "lib/employment-intelligence/country/adapters/south-africa/pathway-context.ts",
  "lib/employment-intelligence/country/adapters/south-africa/job-level-mapping.ts",
  "lib/employment-intelligence/country/adapters/south-africa/practical-access-context.ts",
  "lib/employment-intelligence/country/adapters/south-africa/language-context.ts",
  "lib/employment-intelligence/country/adapters/south-africa/recruitment-conventions.ts",
  "lib/employment-intelligence/country/adapters/south-africa/evidence-requirements.ts",
  "lib/employment-intelligence/country/adapters/south-africa/south-africa-context.ts",
  "lib/employment-intelligence/country/adapters/south-africa/fixtures.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const adaptiveDiagnosisSource = [
  "lib/employment-intelligence/diagnosis/diagnosis-version.ts",
  "lib/employment-intelligence/diagnosis/question-types.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-models.ts",
  "lib/employment-intelligence/diagnosis/question-registry.ts",
  "lib/employment-intelligence/diagnosis/branching-rules.ts",
  "lib/employment-intelligence/diagnosis/adaptive-question-engine.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-progress.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-persistence.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-suggestion-builder.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-result-builder.ts",
  "lib/employment-intelligence/diagnosis/diagnosis-input-mapper.ts",
  "lib/employment-intelligence/diagnosis/fixtures.ts",
  "lib/employment-intelligence/diagnosis/index.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const employmentNextActionSource = [
  "lib/employment-intelligence/actions/action-version.ts",
  "lib/employment-intelligence/actions/action-models.ts",
  "lib/employment-intelligence/actions/action-registry.ts",
  "lib/employment-intelligence/actions/action-completion.ts",
  "lib/employment-intelligence/actions/action-dependencies.ts",
  "lib/employment-intelligence/actions/action-priority.ts",
  "lib/employment-intelligence/actions/action-eligibility.ts",
  "lib/employment-intelligence/actions/action-explainability.ts",
  "lib/employment-intelligence/actions/secondary-action-selector.ts",
  "lib/employment-intelligence/actions/next-best-action-engine.ts",
  "lib/employment-intelligence/actions/career-plan-engine.ts",
  "lib/employment-intelligence/actions/fixtures.ts",
  "lib/employment-intelligence/actions/index.ts",
  "lib/employment-intelligence/domain/next-best-action.ts",
  "lib/employment-intelligence/domain/career-plan.ts",
  "lib/employment-intelligence/engine/generate-employment-intelligence.ts",
  "lib/employment-intelligence/engine/index.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const employmentIntelligencePersistenceSource = [
  "lib/employment-intelligence/persistence/persistence-models.ts",
  "lib/employment-intelligence/persistence/versioning.ts",
  "lib/employment-intelligence/persistence/idempotency.ts",
  "lib/employment-intelligence/persistence/persistence-errors.ts",
  "lib/employment-intelligence/persistence/persistence-mappers.ts",
  "lib/employment-intelligence/repositories/employment-intelligence-repository.ts",
  "lib/employment-intelligence/repositories/action-recommendation-repository.ts",
  "lib/employment-intelligence/repositories/career-plan-repository.ts",
  "lib/employment-intelligence/repositories/action-history-repository.ts",
  "lib/employment-intelligence/repositories/recompute-attempt-repository.ts",
  "lib/employment-intelligence/application/employment-intelligence-orchestrator.ts",
  "lib/employment-intelligence/application/recompute-employment-intelligence.ts",
  "lib/employment-intelligence/application/get-employment-intelligence.ts",
  "lib/employment-intelligence/application/mark-intelligence-stale.ts",
  "lib/employment-intelligence/application/action-recommendation-service.ts",
  "lib/employment-intelligence/application/career-plan-service.ts",
  "lib/employment-intelligence/application/employment-intelligence-service.ts",
  "lib/employment-intelligence/api/schemas.ts",
  "lib/employment-intelligence/api/responses.ts",
  "lib/employment-intelligence/api/errors.ts",
  "lib/employment-intelligence/events/intelligence-events.ts",
  "lib/employment-intelligence/events/stale-triggers.ts",
  "app/api/employment-intelligence/route.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const employmentIntelligencePersistenceMigration = readFileSync("supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql", "utf8");
const employmentIntelligenceUiSource = [
  "app/roadmap/page.tsx",
  "app/roadmap/career-plan/page.tsx",
  "app/discovery/results/page.tsx",
  "components/employment-intelligence/employment-action-card.tsx",
  "components/employment-intelligence/employment-intelligence-home.tsx",
  "components/employment-intelligence/employment-position-summary.tsx",
  "components/employment-intelligence/career-plan-preview.tsx",
  "components/employment-intelligence/intelligence-freshness-panel.tsx",
  "components/employment-intelligence/readiness-details.tsx",
  "components/employment-intelligence/empty-intelligence-state.tsx",
  "lib/employment-intelligence/client/employment-intelligence-client.ts",
  "lib/employment-intelligence/client/use-employment-intelligence.ts",
  "lib/employment-intelligence/client/use-next-best-actions.ts",
  "lib/employment-intelligence/client/use-career-plan.ts",
  "lib/employment-intelligence/client/employment-intelligence-view-model.ts",
  "lib/employment-intelligence/client/employment-intelligence-query-keys.ts",
  "lib/navigation/routes.ts"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const professionalProfileApi = readFileSync("app/api/professional-profile/route.ts", "utf8");
const discoveryFlow = readFileSync("components/discovery/discovery-flow.tsx", "utf8");
const discoveryAnswerState = readFileSync("lib/discovery/discovery-answer-state.ts", "utf8");
const generateRoadmapApi = readFileSync("app/api/generate-roadmap/route.ts", "utf8");
const professionalCvPage = readFileSync("app/professional-identity/cv/page.tsx", "utf8");
const professionalCoverLetterPage = readFileSync("app/professional-identity/cover-letter/page.tsx", "utf8");
const professionalLinkedInPage = readFileSync("app/professional-identity/linkedin/page.tsx", "utf8");
const professionalCareerPassportPage = readFileSync("app/professional-identity/career-passport/page.tsx", "utf8");
const applicationsPage = readFileSync("app/applications/page.tsx", "utf8");
const missionSystem = readFileSync("components/missions/mission-system.tsx", "utf8");
const documentWorkspaceStatusSurfaces = [
  "components/documents/DocumentInspectionStatus.tsx",
  "components/documents/DocumentInspectionSummary.tsx",
  "components/documents/DocumentVisualReadingStatus.tsx",
  "components/documents/DocumentVisualReadingSummary.tsx",
  "components/documents/DocumentSemanticUnderstandingStatus.tsx",
  "components/documents/DocumentSemanticUnderstandingSummary.tsx",
  "components/documents/DocumentReasoningSummary.tsx",
  "components/auth/auth-notice.tsx"
].map((filePath) => readFileSync(filePath, "utf8")).join("\n");
const skillsPage = readFileSync("app/skills/page.tsx", "utf8");
const billingPage = readFileSync("app/billing/page.tsx", "utf8");
const settingsPage = readFileSync("app/settings/page.tsx", "utf8");
const permissions = readFileSync("lib/navigation/permissions.ts", "utf8");
const coreDocumentDownloadAccess = readFileSync("lib/access/core-document-download-access.ts", "utf8");
const entitlements = readFileSync("lib/access/entitlements.ts", "utf8");
const betaEntitlementsApi = readFileSync("app/api/admin/beta-entitlements/route.ts", "utf8");
const entitlementMigration = readFileSync("supabase/migrations/20260716120000_create_user_entitlements.sql", "utf8");
const exportStandard = readFileSync("docs/PATHZY_EXPORT_STANDARD.md", "utf8");
const documentTemplateEngine = readFileSync("lib/professional-identity/document-template-engine.ts", "utf8");
const professionalPhotoContract = readFileSync("lib/professional-identity/professional-photo.ts", "utf8");
const documentDownloads = readFileSync("components/professional-identity/document-downloads.ts", "utf8");
const professionalIdentityTool = readFileSync("components/professional-identity/professional-identity-tool.tsx", "utf8");
const professionalPhotoAvatar = readFileSync("components/professional-identity/professional-photo-avatar.tsx", "utf8");
const careerPassportProjection = readFileSync("lib/professional-identity/career-passport-projection.ts", "utf8");
const professionalIdentityCoverLetterModel = readFileSync("lib/professional-identity/professional-identity-cover-letter-model.ts", "utf8");
const professionalIdentityLinkedInModel = readFileSync("lib/professional-identity/professional-identity-linkedin-model.ts", "utf8");
const templateMiniPreview = readFileSync("components/professional-identity/template-mini-preview.tsx", "utf8");
const myDocumentsPage = readFileSync("app/professional-identity/documents/page.tsx", "utf8");
const myDocumentsClient = readFileSync("components/professional-identity/my-documents-client.tsx", "utf8");
const documentVaultContract = readFileSync("lib/professional-identity/document-vault.ts", "utf8");
const documentVaultApi = readFileSync("app/api/professional-identity/documents/route.ts", "utf8");
const cvBuilderPage = readFileSync("app/cv-builder/page.tsx", "utf8");
const supabaseServer = readFileSync("lib/supabase/server.ts", "utf8");
const floatingMentorButton = readFileSync("components/mentor/floating-mentor-button.tsx", "utf8");
const professionalIdentityService = readFileSync("lib/professional-identity/professional-identity-service.ts", "utf8");
const cvImportPipeline = readFileSync("lib/professional-identity/cv-import.ts", "utf8");
const cvInterpretationEngine = readFileSync("lib/professional-identity/cv-interpretation-engine.ts", "utf8");
const cvImportRoute = readFileSync("app/api/professional-identity/import-cv/route.ts", "utf8");
const documentInspectionTypes = readFileSync("lib/documents/inspection/inspection.types.ts", "utf8");
const documentInspectionConstants = readFileSync("lib/documents/inspection/inspection.constants.ts", "utf8");
const documentInspectionSchema = readFileSync("lib/documents/inspection/inspection.schema.ts", "utf8");
const documentInspectionService = readFileSync("lib/documents/inspection/document-inspection.service.ts", "utf8");
const documentTypeDetector = readFileSync("lib/documents/inspection/document-type-detector.ts", "utf8");
const languageDetector = readFileSync("lib/documents/inspection/language-detector.ts", "utf8");
const scanDetector = readFileSync("lib/documents/inspection/scan-detector.ts", "utf8");
const layoutDetector = readFileSync("lib/documents/inspection/layout-detector.ts", "utf8");
const qualityAnalyzer = readFileSync("lib/documents/inspection/quality-analyzer.ts", "utf8");
const processingStrategy = readFileSync("lib/documents/inspection/processing-strategy.ts", "utf8");
const documentInspectionMigration = readFileSync("supabase/migrations/20260716133000_create_document_inspections.sql", "utf8");
const documentInspectionSummary = readFileSync("components/documents/DocumentInspectionSummary.tsx", "utf8");
const documentInspectionStatus = readFileSync("components/documents/DocumentInspectionStatus.tsx", "utf8");
const documentVisualTypes = readFileSync("lib/documents/visual/visual-reading.types.ts", "utf8");
const documentVisualService = readFileSync("lib/documents/visual/visual-reading.service.ts", "utf8");
const documentVisualReader = readFileSync("lib/documents/visual/local-visual-reader.ts", "utf8");
const documentVisualRenderer = readFileSync("lib/documents/visual/document-renderer.ts", "utf8");
const documentVisualPrompt = readFileSync("lib/documents/visual/visual-prompt.ts", "utf8");
const documentVisualCostControl = readFileSync("lib/documents/visual/visual-cost-control.ts", "utf8");
const documentVisualMigration = readFileSync("supabase/migrations/20260716143000_create_document_visual_readings.sql", "utf8");
const documentVisualSummary = readFileSync("components/documents/DocumentVisualReadingSummary.tsx", "utf8");
const documentVisualStatus = readFileSync("components/documents/DocumentVisualReadingStatus.tsx", "utf8");
const documentSemanticTypes = readFileSync("lib/documents/semantic/semantic.types.ts", "utf8");
const documentSemanticService = readFileSync("lib/documents/semantic/semantic-understanding.service.ts", "utf8");
const documentSemanticReader = readFileSync("lib/documents/semantic/local-semantic-reader.ts", "utf8");
const documentSemanticClassifiers = readFileSync("lib/documents/semantic/semantic-classifiers.ts", "utf8");
const documentSemanticDate = readFileSync("lib/documents/semantic/date-understanding.ts", "utf8");
const documentSemanticSchema = readFileSync("lib/documents/semantic/semantic.schema.ts", "utf8");
const documentSemanticPrompt = readFileSync("lib/documents/semantic/semantic-prompt.ts", "utf8");
const documentSemanticConstants = readFileSync("lib/documents/semantic/semantic.constants.ts", "utf8");
const documentSemanticMigration = readFileSync("supabase/migrations/20260716153000_create_document_semantic_readings.sql", "utf8");
const documentSemanticSummary = readFileSync("components/documents/DocumentSemanticUnderstandingSummary.tsx", "utf8");
const documentSemanticStatus = readFileSync("components/documents/DocumentSemanticUnderstandingStatus.tsx", "utf8");
const documentReasoningTypes = readFileSync("lib/documents/reasoning/reasoning.types.ts", "utf8");
const documentReasoningService = readFileSync("lib/documents/reasoning/career-reasoning.service.ts", "utf8");
const documentReasoningUtils = readFileSync("lib/documents/reasoning/reasoning-utils.ts", "utf8");
const documentReasoningProvider = readFileSync("lib/documents/reasoning/reasoning-provider.ts", "utf8");
const documentReasoningSchema = readFileSync("lib/documents/reasoning/reasoning.schema.ts", "utf8");
const documentReasoningConstants = readFileSync("lib/documents/reasoning/reasoning.constants.ts", "utf8");
const documentReasoningMigration = readFileSync("supabase/migrations/20260716170000_create_career_reasoning_cases.sql", "utf8");
const documentReasoningSummary = readFileSync("components/documents/DocumentReasoningSummary.tsx", "utf8");
const canonicalProfileTypes = readFileSync("lib/canonical-profile/canonical-profile.types.ts", "utf8");
const canonicalProfileService = readFileSync("lib/canonical-profile/canonical-profile-service.ts", "utf8");
const canonicalProfileQuality = readFileSync("lib/canonical-profile/canonical-profile-quality.ts", "utf8");
const canonicalProfileValidation = readFileSync("lib/canonical-profile/canonical-profile-validation.ts", "utf8");
const canonicalProfileView = readFileSync("lib/canonical-profile/canonical-profile-view.ts", "utf8");
const canonicalProfileTranslations = readFileSync("lib/canonical-profile/canonical-profile-translations.ts", "utf8");
const canonicalProfileOverview = readFileSync("components/professional-identity/canonical-profile-overview.tsx", "utf8");
const canonicalProfileMigration = readFileSync("supabase/migrations/20260716183000_create_canonical_professional_identity.sql", "utf8");
const canonicalIdentityModel = readFileSync("lib/canonical-profile/canonical-professional-identity.model.ts", "utf8");
const canonicalIdentityValidation = readFileSync("lib/canonical-profile/canonical-professional-identity.validation.ts", "utf8");
const canonicalCompatibilityAdapter = readFileSync("lib/canonical-profile/canonical-profile-compatibility-adapter.ts", "utf8");
const canonicalProfileRepository = readFileSync("lib/canonical-profile/canonical-profile-repository.ts", "utf8");
const canonicalIdentityService = readFileSync("lib/canonical-profile/canonical-professional-identity-service.ts", "utf8");
const canonicalProfileVersioning = readFileSync("lib/canonical-profile/canonical-profile-versioning.ts", "utf8");
const canonicalProfileIndex = readFileSync("lib/canonical-profile/index.ts", "utf8");
const canonicalPhase2aMigration = readFileSync("supabase/migrations/20260718210000_phase_2a_canonical_profile_foundation_scaffold.sql", "utf8");
const professionalPhotoStorageMigration = readFileSync("supabase/migrations/20260803120000_create_professional_photo_storage.sql", "utf8");
const employmentDocumentStorageMigration = readFileSync("supabase/migrations/20260805120000_create_employment_document_storage.sql", "utf8");
const professionalDocumentTypes = readFileSync("lib/professional-documents/professional-document.types.ts", "utf8");
const professionalDocumentService = readFileSync("lib/professional-documents/professional-document-service.ts", "utf8");
const professionalDocumentAdapter = readFileSync("lib/professional-documents/cv-content-adapter.ts", "utf8");
const professionalDocumentSelector = readFileSync("lib/professional-documents/cv-content-selector.ts", "utf8");
const professionalDocumentValidation = readFileSync("lib/professional-documents/professional-document-validation.ts", "utf8");
const professionalDocumentsMigration = readFileSync("supabase/migrations/20260716193000_create_professional_documents.sql", "utf8");
const professionalDocumentFieldMigration = readFileSync("supabase/migrations/20260717120000_extend_professional_document_fields.sql", "utf8");
const jobIntelligenceTypes = readFileSync("lib/job-intelligence/job-intelligence.types.ts", "utf8");
const jobRequirementParser = readFileSync("lib/job-intelligence/job-requirement-parser.ts", "utf8");
const jobMatchEngine = readFileSync("lib/job-intelligence/job-match-engine.ts", "utf8");
const jobTargetedCvBridge = readFileSync("lib/job-intelligence/targeted-cv-bridge.ts", "utf8");
const jobIntelligenceService = readFileSync("lib/job-intelligence/job-intelligence-service.ts", "utf8");
const jobImportService = readFileSync("lib/job-intelligence/job-import-service.ts", "utf8");
const jobUnderstandingProvider = readFileSync("lib/job-intelligence/job-understanding-provider.ts", "utf8");
const jobUnderstandingService = readFileSync("lib/job-intelligence/job-understanding-service.ts", "utf8");
const profileJobMatchEngine = readFileSync("lib/job-intelligence/profile-job-match-engine.ts", "utf8");
const profileJobMatchService = readFileSync("lib/job-intelligence/profile-job-match-service.ts", "utf8");
const targetedDocumentStrategy = readFileSync("lib/job-intelligence/targeted-document-strategy.ts", "utf8");
const targetedDocumentService = readFileSync("lib/job-intelligence/targeted-document-service.ts", "utf8");
const jobIntelligenceTranslations = readFileSync("lib/job-intelligence/job-intelligence-translations.ts", "utf8");
const jobIntelligenceMigration = readFileSync("supabase/migrations/20260717103000_create_job_intelligence.sql", "utf8");
const jobImportsApi = readFileSync("app/api/job-imports/route.ts", "utf8");
const jobImportsMigration = readFileSync("supabase/migrations/20260718120000_create_job_imports.sql", "utf8");
const jobUnderstandingApi = readFileSync("app/api/job-understanding/route.ts", "utf8");
const jobUnderstandingMigration = readFileSync("supabase/migrations/20260718133000_create_job_understandings.sql", "utf8");
const profileJobMatchApi = readFileSync("app/api/job-match-analysis/route.ts", "utf8");
const profileJobMatchMigration = readFileSync("supabase/migrations/20260718143000_create_job_match_analyses.sql", "utf8");
const targetedDocumentsApi = readFileSync("app/api/targeted-documents/route.ts", "utf8");
const targetedDocumentsMigration = readFileSync("supabase/migrations/20260718153000_extend_professional_documents_for_targeting.sql", "utf8");
const smartApplicationTypes = readFileSync("lib/applications/smart-application.types.ts", "utf8");
const smartApplicationService = readFileSync("lib/applications/smart-application-service.ts", "utf8");
const applicationTrackerService = readFileSync("lib/applications/application-tracker-service.ts", "utf8");
const smartApplicationsApi = readFileSync("app/api/smart-applications/route.ts", "utf8");
const smartApplicationsMigration = readFileSync("supabase/migrations/20260718163000_extend_employment_applications_for_smart_workspace.sql", "utf8");
const applicationTrackerMigration = readFileSync("supabase/migrations/20260718170000_extend_application_tracker_phase9b.sql", "utf8");
const opportunitiesPage = readFileSync("app/opportunities/page.tsx", "utf8");
const opportunitiesHub = readFileSync("components/opportunities/opportunities-hub.tsx", "utf8");
const opportunitiesTypes = readFileSync("lib/opportunities/types.ts", "utf8");
const opportunitiesMatching = readFileSync("lib/opportunities/matching.ts", "utf8");
const opportunitiesPrepareApi = readFileSync("app/api/opportunities/prepare/route.ts", "utf8");
const jobProviderTypes = readFileSync("lib/opportunities/providers/types.ts", "utf8");
const adzunaProviderSource = readFileSync("lib/opportunities/providers/adzuna-provider.ts", "utf8");
const jobProviderServerSource = readFileSync("lib/opportunities/providers/server.ts", "utf8");
const employmentTrackerClient = readFileSync("components/employment-tracker/employment-tracker-client.tsx", "utf8");
const employmentTrackerPage = readFileSync("app/employment-tracker/page.tsx", "utf8");
const employmentTrackerApi = readFileSync("app/api/employment-tracker/route.ts", "utf8");
const interviewPrepClient = readFileSync("components/interview/interview-prep-client.tsx", "utf8");
const interviewPrepApi = readFileSync("app/api/interview-prep/route.ts", "utf8");
const interviewPrepService = readFileSync("lib/interview/interview-prep-service.ts", "utf8");
const interviewPrepTypes = readFileSync("lib/interview/interview-prep.types.ts", "utf8");
const interviewPrepMigration = readFileSync("supabase/migrations/20260718180000_extend_interview_preps_for_application_prep.sql", "utf8");
const followUpTypes = readFileSync("lib/follow-up/follow-up.types.ts", "utf8");
const followUpService = readFileSync("lib/follow-up/follow-up-service.ts", "utf8");
const followUpApi = readFileSync("app/api/application-follow-ups/route.ts", "utf8");
const followUpMigration = readFileSync("supabase/migrations/20260718190000_create_application_follow_ups.sql", "utf8");
const careerAnalyticsService = readFileSync("lib/analytics/career-analytics-service.ts", "utf8");
const legacyMedicalCvFixture = readFileSync("tests/fixtures/legacy-medical-cv.txt", "utf8");
const cvImportFixtureMatrix = readFileSync("tests/fixtures/cv-import-matrix.txt", "utf8");
const cvInterpretationFixtureMatrix = readFileSync("tests/fixtures/cv-interpretation-general-matrix.txt", "utf8");
const coverLetterGeneration = professionalIdentityService.match(/export async function generateCoverLetter[\s\S]*?export async function generateLinkedInProfile/)?.[0] ?? "";
const linkedInGeneration = professionalIdentityService.match(/export async function generateLinkedInProfile[\s\S]*?export async function generateRecruiterMessage/)?.[0] ?? "";

const runtimeModuleCache = new Map();
function loadProductionTsModule(filePath) {
  const absolutePath = path.resolve(filePath);
  if (runtimeModuleCache.has(absolutePath)) return runtimeModuleCache.get(absolutePath).exports;
  const source = readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX
    }
  }).outputText;
  const module = { exports: {} };
  runtimeModuleCache.set(absolutePath, module);
  const resolveLocalTs = (candidate) => {
    const withExtension = candidate.endsWith(".ts") || candidate.endsWith(".tsx") ? candidate : `${candidate}.ts`;
    if (existsSync(withExtension)) return withExtension;
    const withTsx = candidate.endsWith(".ts") || candidate.endsWith(".tsx") ? candidate : `${candidate}.tsx`;
    if (existsSync(withTsx)) return withTsx;
    const indexTs = path.join(candidate, "index.ts");
    if (existsSync(indexTs)) return indexTs;
    const indexTsx = path.join(candidate, "index.tsx");
    if (existsSync(indexTsx)) return indexTsx;
    return withExtension;
  };
  const localRequire = (request) => {
    if (request.startsWith("node:")) return require(request.replace(/^node:/, ""));
    if (request.startsWith("@/")) {
      const candidate = path.resolve(request.replace(/^@\//, ""));
      return loadProductionTsModule(resolveLocalTs(candidate));
    }
    if (request.startsWith(".")) {
      const candidate = path.resolve(path.dirname(absolutePath), request);
      return loadProductionTsModule(resolveLocalTs(candidate));
    }
    return require(request);
  };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: localRequire,
    Buffer,
    console,
    TextDecoder,
    TextEncoder,
    URL,
    URLSearchParams,
    process,
    setTimeout,
    clearTimeout
  }, { filename: absolutePath });
  return module.exports;
}

const routeRuntime = loadProductionTsModule("lib/navigation/routes.ts");
const authRoutingRuntime = loadProductionTsModule("lib/navigation/auth-routing.ts");
const permissionsRuntime = loadProductionTsModule("lib/navigation/permissions.ts");
const coreDocumentDownloadAccessRuntime = loadProductionTsModule("lib/access/core-document-download-access.ts");
const supabaseConfigRuntime = loadProductionTsModule("lib/supabase/config.ts");
const authFormErrorsRuntime = loadProductionTsModule("lib/auth/auth-form-errors.ts");
const languagePreferenceRuntime = loadProductionTsModule("lib/language/language-preferences.ts");
const pathzyI18nRuntime = loadProductionTsModule("lib/language/pathzy-i18n.ts");
const errorNormalizationRuntime = loadProductionTsModule("lib/errors/error-normalization.ts");
const authorizationRuntime = loadProductionTsModule("lib/access/authorization.ts");
const authSessionRuntime = loadProductionTsModule("lib/auth/session-safety.ts");
const currentSituationRuntime = loadProductionTsModule("lib/professional-identity/current-situation.ts");
const professionalIdentityCompletionRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-completion.ts");
const professionalIdentityExperienceRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-experience.ts");
const professionalIdentityCvModelRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-cv-model.ts");
const professionalIdentityCoverLetterModelRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-cover-letter-model.ts");
const coverLetterIntelligenceRuntime = loadProductionTsModule("lib/professional-identity/cover-letter-intelligence.ts");
const professionalPhotoRuntime = loadProductionTsModule("lib/professional-identity/professional-photo.ts");
const documentVaultRuntime = loadProductionTsModule("lib/professional-identity/document-vault.ts");
const careerPassportProjectionRuntime = loadProductionTsModule("lib/professional-identity/career-passport-projection.ts");
const professionalIdentityLinkedInModelRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-linkedin-model.ts");
const documentTemplateEngineRuntime = loadProductionTsModule("lib/professional-identity/document-template-engine.ts");
const documentDownloadsRuntime = loadProductionTsModule("components/professional-identity/document-downloads.ts");
const professionalIdentityWriteRuntime = loadProductionTsModule("lib/professional-identity/professional-identity-write-service.ts");
const employmentIntelligenceDomainRuntime = loadProductionTsModule("lib/employment-intelligence/domain/index.ts");
const employmentIntelligenceEngineRuntime = loadProductionTsModule("lib/employment-intelligence/engine/index.ts");
const employmentIntelligenceViewModelRuntime = loadProductionTsModule("lib/employment-intelligence/client/employment-intelligence-view-model.ts");

function assertUniqueValues(values, message) {
  assert.equal(new Set(values).size, values.length, message);
}

function assertCanonicalCodes(values, message) {
  for (const value of values) {
    assert.match(value, /^[A-Z0-9_]+$/, `${message}: ${value}`);
  }
}

assert.equal(routeRuntime.routeBuilders.professionalIdentitySection("career_goal"), "/professional-identity?section=career_goal", "Route builder must create canonical Professional Identity section URLs.");
assert.equal(authRoutingRuntime.professionalIdentitySectionHref("nationality", "review"), "/professional-identity?section=nationality&returnTo=%2Fprofessional-identity%3Freview%3D1", "Edit from Review must carry a safe typed return-to-review context.");
assert.equal(authRoutingRuntime.normalizeProfessionalIdentitySection("careerGoal"), "career_goal", "Legacy Professional Identity section aliases must normalize to canonical section IDs.");
assert.equal(authRoutingRuntime.normalizeProfessionalIdentitySection("not-a-real-section"), "profile", "Unknown Professional Identity sections must fall back safely.");
assert.equal(routeRuntime.routeBuilders.cvWorkspace({ intent: "build", documentId: "doc-1" }), "/professional-identity/cv?intent=build&documentId=doc-1", "CV route builder must own CV query strings.");
assert.equal(routeRuntime.routeBuilders.coverLetterWorkspace({ applicationId: "app-1", jobId: "job-1" }), "/professional-identity/cover-letter?applicationId=app-1&jobId=job-1", "Cover Letter route builder must own application/job query strings.");
assert.equal(routeRuntime.routeBuilders.applicationDetail("app-42"), "/applications?applicationId=app-42", "Application detail route builder must keep Applications separate from Employment Center.");
assert.equal(routeRuntime.safeRedirectDestination("https://evil.example/phish", "/roadmap"), "/roadmap", "Unsafe external return URLs must be rejected.");
assert.equal(routeRuntime.safeRedirectDestination("/login?redirectTo=/applications", "/roadmap"), "/roadmap", "Auth routes must not be accepted as post-auth return targets.");
assert.equal(routeRuntime.safeRedirectDestination("/applications?applicationId=app-1", "/roadmap"), "/applications?applicationId=app-1", "Safe internal deep links must preserve useful query strings.");
assert.equal(authSessionRuntime.authRedirectForStatus("anonymous", "/applications").destination, "/login?redirectTo=%2Fapplications", "Anonymous sessions must preserve safe protected return URLs.");
assert.equal(authSessionRuntime.authRedirectForStatus("expired", "https://evil.example").destination, "/login?redirectTo=%2Froadmap", "Expired sessions must reject unsafe return URLs.");
assert.equal(authSessionRuntime.authRedirectForStatus("password_recovery", "/roadmap").destination, "/auth/update-password", "Password recovery must keep the reset destination.");
assert.equal(supabaseConfigRuntime.getSupabasePublicConfigStatus({ url: undefined, anonKey: "sb_publishable_test" }).url, "missing", "Supabase config checks must detect a missing public URL before auth requests are attempted.");
assert.equal(supabaseConfigRuntime.getSupabasePublicConfigStatus({ url: "not-a-url", anonKey: "sb_publishable_test" }).url, "malformed", "Supabase config checks must detect malformed public URLs before auth requests are attempted.");
assert.equal(supabaseConfigRuntime.getSupabasePublicConfigStatus({ url: "https://example.supabase.co", anonKey: undefined }).anonKey, "missing", "Supabase config checks must detect a missing public anon key before auth requests are attempted.");
assert.equal(supabaseConfigRuntime.getSupabasePublicConfigStatus({ url: "https://example.supabase.co", anonKey: "short" }).anonKey, "malformed", "Supabase config checks must detect malformed public anon keys before auth requests are attempted.");
assert.equal(supabaseConfigRuntime.getSupabasePublicConfigStatus({ url: "https://example.supabase.co", anonKey: "sb_publishable_validshape" }).configured, true, "Supabase config checks must accept valid public Supabase URL and publishable key shapes.");
assert.equal(authFormErrorsRuntime.isAuthNetworkFailure(new TypeError("NetworkError when attempting to fetch resource.")), true, "Auth forms must classify browser NetworkError failures as retryable network failures.");
assert.equal(authFormErrorsRuntime.friendlyAuthError(new TypeError("NetworkError when attempting to fetch resource."), "signup"), authFormErrorsRuntime.AUTH_NETWORK_USER_MESSAGE, "Signup network failures must use a safe user-facing retry message.");
assert.equal(authFormErrorsRuntime.friendlyAuthError(new TypeError("Failed to fetch"), "login"), authFormErrorsRuntime.AUTH_NETWORK_USER_MESSAGE, "Login network failures must use the same safe retry message.");
assert.doesNotMatch(authFormErrorsRuntime.friendlyAuthError(new TypeError("NetworkError when attempting to fetch resource."), "signup"), /NetworkError|supabase\.co|eyJ|sb_publishable_/i, "Auth network errors must not render raw browser internals or key-like values.");
assert.match(supabaseBrowserClient, /export function createPathzyAuthFetch/, "Supabase browser auth must use a shared PATHZY fetch boundary.");
assert.match(supabaseBrowserClient, /global:\s*{\s*fetch:\s*createPathzyAuthFetch\(\)/s, "Supabase browser auth must install the shared fetch boundary.");
assert.match(supabaseBrowserClient, /AUTH_FETCH_TIMEOUT_MS/, "Supabase browser auth must bound network failures instead of leaving login loading indefinitely.");
assert.match(supabaseBrowserClient, /new Response\(/, "Supabase browser auth network failures must be converted to normal auth responses before Supabase internals log raw fetch errors.");
assert.doesNotMatch(supabaseBrowserClient, /console\.error/, "Supabase browser auth must not emit raw network errors through console.error.");
assert.equal(languagePreferenceRuntime.suggestedLanguageFromBrowser("fr-ZA,fr;q=0.9,en;q=0.8"), "fr", "Browser French should suggest French without using flags.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("fr-FR"), "fr", "Regional French locales must normalize to the supported French dictionary key.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("fr-CA"), "fr", "Canadian French locales must normalize to the supported French dictionary key.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("en-US"), "en", "Regional English locales must normalize to the supported English dictionary key.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("English"), "en", "Legacy English labels must normalize to the supported English dictionary key.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("Français"), "fr", "French display labels must normalize to the supported French dictionary key.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage(undefined, "fr-FR"), "fr", "Missing language values must fall back to the saved interface language before English.");
assert.equal(languagePreferenceRuntime.normalizeSupportedLanguage("zz-ZZ", "fr"), "fr", "Unsupported locales must fall back to the saved interface language.");
assert.equal(pathzyI18nRuntime.pathzyT("fr-FR", "public.nav.home"), "Accueil", "Shared pathzyT must normalize regional French values before lookup.");
assert.equal(pathzyI18nRuntime.pathzyT("en-US", "public.nav.home"), "Home", "Shared pathzyT must normalize regional English values before lookup.");
assert.equal(pathzyI18nRuntime.pathzyT(undefined, "public.nav.home"), "Home", "Shared pathzyT must survive a transient undefined language.");
assert.equal(pathzyI18nRuntime.pathzyPhase2T("french", "identity.ui.foundationValue"), "Identité Professionnelle", "Phase 2 translations must normalize legacy French values before lookup.");
assert.equal(pathzyI18nRuntime.professionalIdentitySectionText("fr-FR", "profile", "Profile"), "Profil", "Professional Identity section labels must normalize regional French values.");
assert.equal(pathzyI18nRuntime.professionalIdentityFieldText("french", "current_status", "label", "Current status"), "Situation actuelle", "Professional Identity field labels must normalize legacy French values.");
assert.equal(pathzyI18nRuntime.professionalIdentityStepText("fr-FR", "profile", "title", "Profile"), "Profil", "Professional Identity step copy must normalize regional French values.");
assert.equal(pathzyI18nRuntime.localizedProfessionalTitle("fr-FR", "data analyst"), "Analyste de données", "Known professional titles must localize through the normalized interface language.");
assert.equal(pathzyI18nRuntime.localizedProfessionalTitle("fr-FR", undefined), "Direction professionnelle en cours", "Professional title fallback must not crash on undefined values.");
assert.equal(pathzyI18nRuntime.getEmploymentDiagnosisSteps("fr-FR")[0].title, "Situation personnelle", "Employment Diagnosis questions must normalize regional French values.");
const resolvedLanguages = languagePreferenceRuntime.resolveLanguagePreferences({ language: "english", interface_language: "fr", professional_document_language: "en" });
assert.equal(resolvedLanguages.interface, "fr", "Interface language preference must resolve independently.");
assert.equal(resolvedLanguages.professional_document, "en", "Professional document language must not be changed by interface language.");
assert.equal(languagePreferenceRuntime.updateLanguagePreference(resolvedLanguages, "interface", "en").professional_document, "en", "Changing interface language must not mutate document language.");
assert.equal(currentSituationRuntime.normalizeCurrentSituation("Diplômé"), "graduate", "French current-situation labels must normalize to stable canonical values.");
assert.equal(currentSituationRuntime.normalizeCurrentSituation("En reconversion"), "career_transition", "Career-transition labels must not be stored as translated UI text.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("french", "employed"), "Salarié", "Legacy French language values must render current-situation labels without crashing.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("english", "employed"), "Employed", "Legacy English language values must render current-situation labels without crashing.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("fr-FR", "employed"), "Salarié", "Regional French language values must render current-situation labels without crashing.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("en-US", "employed"), "Employed", "Regional English language values must render current-situation labels without crashing.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel(undefined, "employed", "fr"), "Salarié", "Missing language values must use the saved language fallback for current-situation labels.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("zz-ZZ", "employed", "fr"), "Salarié", "Unsupported locales must use the saved language fallback for current-situation labels.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("fr", "legacy free text"), "legacy free text", "Legacy situation values must not crash or erase display data when they cannot be canonicalized.");
assert.equal(currentSituationRuntime.currentSituationDisplayLabel("fr", "career_transition"), "En reconversion", "Canonical current-situation values must display in French without changing stored data.");
assert.equal(
  professionalIdentityCompletionRuntime.professionalIdentityValuesFromSources({ language: "french", current_status: "employed" }, { answers: {} }, { email: "n@example.com" }).interface_language,
  "fr",
  "Professional Identity hydration must normalize legacy French profile language before the client renders enum labels."
);
const frenchCurrentSituationProfilePatch = professionalIdentityWriteRuntime.profilePatchForProfessionalIdentitySection({ id: "user-1", email: "n@example.com" }, "profile", { current_status: "Diplômé" });
assert.equal(frenchCurrentSituationProfilePatch.current_status, "graduate", "Saving a French current-situation label must store the canonical enum in current_status.");
assert.equal(frenchCurrentSituationProfilePatch.employment_status, "graduate", "Saving a French current-situation label must store the canonical enum in employment_status.");
assert.equal(Boolean(frenchCurrentSituationProfilePatch.updated_at), true, "Profile current-situation patches must retain write metadata.");
const frenchCurrentSituationDiscoveryPatch = professionalIdentityWriteRuntime.discoveryPatchForProfessionalIdentitySection("profile", { current_status: "En reconversion" });
assert.equal(frenchCurrentSituationDiscoveryPatch.current_status, "career_transition", "Saving Profile Current Situation must dual-write canonical current_status answers.");
assert.equal(frenchCurrentSituationDiscoveryPatch.employment_status, "career_transition", "Saving Profile Current Situation must dual-write canonical employment_status answers.");
assert.equal(
  Object.keys(professionalIdentityWriteRuntime.discoveryPatchForProfessionalIdentitySection("personal_information", { full_name: "Nicka" })).length,
  0,
  "Saving an unrelated partial personal-information payload must not erase the persisted current situation."
);
const emptyCurrentSituationProfilePatch = professionalIdentityWriteRuntime.profilePatchForProfessionalIdentitySection({ id: "user-1" }, "profile", { current_status: "" });
assert.equal("current_status" in emptyCurrentSituationProfilePatch, false, "Empty pre-hydration Profile defaults must not overwrite current_status with null.");
assert.equal("employment_status" in emptyCurrentSituationProfilePatch, false, "Empty pre-hydration Profile defaults must not overwrite employment_status with null.");
assert.equal(Boolean(emptyCurrentSituationProfilePatch.updated_at), true, "Empty Profile patches must retain write metadata without clearing data.");
assertUniqueValues(employmentIntelligenceDomainRuntime.readinessBands, "Phase 3A readiness bands must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.readinessBands, "Phase 3A readiness bands must use language-independent canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.readinessDimensions, "Phase 3A readiness dimensions must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.readinessDimensions, "Phase 3A readiness dimensions must use language-independent canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.barrierSeverityLevels, "Phase 3A barrier severities must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.barrierSeverityLevels, "Phase 3A barrier severities must use canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.pathwayCodes, "Phase 3A pathway codes must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.pathwayCodes, "Phase 3A pathway codes must be language-independent.");
assertUniqueValues(employmentIntelligenceDomainRuntime.jobLevels, "Phase 3A job levels must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.jobLevels, "Phase 3A job levels must be respectful internal canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.careerPlanHorizons, "Phase 3A Career Plan horizons must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.careerPlanHorizons, "Phase 3A Career Plan horizons must be canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.evidenceTypes, "Phase 3A evidence types must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.evidenceTypes, "Phase 3A evidence types must be canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.confidenceLevels, "Phase 3A confidence levels must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.confidenceLevels, "Phase 3A confidence levels must be canonical codes.");
assertUniqueValues(employmentIntelligenceDomainRuntime.intelligenceStaleStatuses, "Phase 3A stale statuses must be unique.");
assertCanonicalCodes(employmentIntelligenceDomainRuntime.intelligenceStaleStatuses, "Phase 3A stale statuses must be canonical codes.");
assert.equal(employmentIntelligenceDomainRuntime.inputProvenanceStates.includes("UNKNOWN"), true, "Phase 3A must represent unknown explicitly.");
assert.equal(employmentIntelligenceDomainRuntime.inputProvenanceStates.includes("FALSE"), false, "Phase 3A must not represent unknown as false.");
assert.equal(employmentIntelligenceDomainRuntime.pathwayCodes.includes("LEARNERSHIP"), true, "Phase 3A must include learnership as a canonical pathway code.");
assert.equal(employmentIntelligenceDomainRuntime.supportIntensityLevels.includes("HUMAN_SUPPORT_RECOMMENDED"), true, "Phase 3A must define human-support recommendation without treating it as user worth.");
assert.equal(employmentIntelligenceDomainRuntime.isValidNextBestActionSet({ primary: {}, secondary: [{}, {}, {}] }), true, "Phase 3A must support exactly one primary and up to three secondary actions.");
assert.equal(employmentIntelligenceDomainRuntime.isValidNextBestActionSet({ primary: {}, secondary: [{}, {}, {}, {}] }), false, "Phase 3A must reject more than three secondary actions.");
for (const forbidden of employmentIntelligenceDomainRuntime.phase3aForbiddenCanonicalTerms) {
  assert.equal(employmentIntelligenceDomainRuntime.readinessBands.includes(forbidden), false, `Phase 3A readiness bands must not use stigmatizing term ${forbidden}.`);
}
assert.match(employmentIntelligenceProfileContract, /engineVersion: string;/, "Phase 3A Employment Intelligence Profile must require an engine version.");
assert.match(employmentIntelligenceProfileContract, /staleStatus: EmploymentIntelligenceStaleStatus;/, "Phase 3A Employment Intelligence Profile must carry stale status.");
assert.match(employmentIntelligenceCollectionInvariants, /mergeDuplicateEvidenceRecords[\s\S]*employmentEvidenceDisplayCode[\s\S]*canonicalizeEmploymentIntelligenceProfile/, "Phase 3A must centralize Employment Intelligence collection de-duplication at the domain boundary.");
assert.doesNotMatch(employmentIntelligenceInputContract, /EmploymentIntelligenceProfile/, "Phase 3A derived profile must not be usable as canonical identity input.");
assert.match(employmentIntelligenceCountryContract, /sourceMetadata: CountrySourceMetadata\[\];/, "Phase 3A country adapters must require source metadata.");
assert.match(employmentIntelligenceCountryContract, /SPECIFICATION_ONLY_NO_LIVE_FACTS/, "Phase 3A South Africa adapter must remain a specification without live unstable facts.");
assert.match(employmentIntelligenceDomainIndex, /Consumers may read Employment Intelligence\. Consumers must not independently recalculate it\./, "Phase 3A must lock the consumer dependency rule.");
assert.equal(employmentIntelligenceDomainRuntime.employmentIntelligenceAiBoundary.mustNotDetermine.includes("work_eligibility"), true, "Phase 3A AI boundary must block AI-owned work eligibility decisions.");
assert.equal(employmentIntelligenceDomainRuntime.employmentIntelligenceAiBoundary.mustNotDetermine.includes("ownership"), true, "Phase 3A AI boundary must block AI-owned ownership decisions.");
assert.match(employmentIntelligenceEngineIndex, /generateEmploymentIntelligence/, "Phase 3B must expose one deterministic Employment Intelligence orchestrator.");
assert.doesNotMatch(employmentIntelligenceEngineSource, /from\s+["'](?:@\/)?(?:app|components)\//, "Phase 3B engine must not import UI or route modules.");
assert.doesNotMatch(employmentIntelligenceEngineSource, /supabase|createClient|fetch\(|openai|anthropic|aiProvider|prisma|drizzle/i, "Phase 3B engine must not use AI providers, network calls, database clients, or persistence.");
assert.match(employmentIntelligenceEngineSource, /EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3B\s*=\s*"3B\.1"/, "Phase 3B engine must carry explicit semantic engine version.");
assert.match(employmentIntelligenceEngineSource, /rule_changes[\s\S]*taxonomy_changes[\s\S]*score_mapping_changes[\s\S]*bug_fixes_affecting_output[\s\S]*country_context_interpretation_changes/, "Phase 3B must document engine-version change rules.");
const phase3bContext = { assessedAt: "2026-08-04T00:00:00.000Z" };
const phase3bFixtures = employmentIntelligenceEngineRuntime.phase3bEmploymentIntelligenceFixtures;
assert.equal(Object.keys(phase3bFixtures).length >= 18, true, "Phase 3B fixture corpus must cover broad user segments, not one candidate.");
const phase3bEmptyProfile = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.emptyProfile, phase3bContext);
assert.equal(phase3bEmptyProfile.readinessDimensions.length, employmentIntelligenceDomainRuntime.readinessDimensions.length, "Phase 3B must assess all 14 readiness dimensions.");
assert.equal(phase3bEmptyProfile.readinessDimensions.some((dimension) => dimension.band === "NOT_ASSESSED"), true, "Phase 3B must preserve unknown as NOT_ASSESSED instead of inventing a negative score.");
assert.equal(phase3bEmptyProfile.missingInformation.includes("WORK_AUTHORIZATION_UNCLEAR"), true, "Phase 3B must surface missing work authorization as missing information.");
assert.equal(phase3bEmptyProfile.barriers.some((barrier) => barrier.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY"), true, "Phase 3B must separate work eligibility uncertainty from general employability.");
assert.equal(phase3bEmptyProfile.engineVersion, employmentIntelligenceEngineRuntime.EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3E, "Generated profiles must include the current deterministic engine version.");
assert.equal(phase3bEmptyProfile.staleStatus, "CURRENT", "Phase 3B generated profiles must carry stale status.");
assert.match(employmentIntelligenceProfileContract, /candidateContext: CandidateContextAssessment;/, "Employment Intelligence Profile must expose reusable candidate classification.");
assert.match(employmentIntelligenceProfileContract, /careerDirection: CareerDirection;/, "Employment Intelligence Profile must expose grounded career direction.");
assert.match(employmentIntelligenceProfileContract, /skillIntelligence: SkillIntelligenceSummary;/, "Employment Intelligence Profile must expose normalized skill evidence.");
assert.match(employmentIntelligenceProfileContract, /opportunityMatcherContract: OpportunityMatcherContract;/, "Employment Intelligence Profile must expose a future Opportunity Matcher contract.");
assert.match(employmentOpportunityMatchingContract, /export type NormalizedJobOpportunity[\s\S]*closingDate\?: string;[\s\S]*workAuthorizationRequirements\?: string\[]/, "Employment Intelligence must define the normalized future job opportunity contract.");
assert.match(employmentOpportunityMatchingContract, /eligibilityStatus[\s\S]*suitabilityScore[\s\S]*criticalBarriers[\s\S]*recommendedAction/, "Opportunity matching must separate hard eligibility from professional suitability.");
assert.match(employmentSharedIntelligenceEngine, /export function classifyCandidateContext/, "Shared Employment Intelligence engine must classify candidate context outside page UI.");
assert.match(employmentSharedIntelligenceEngine, /export function deriveCareerDirections/, "Shared Employment Intelligence engine must derive career direction for downstream jobs and documents.");
assert.match(employmentSharedIntelligenceEngine, /export function buildSkillIntelligence/, "Shared Employment Intelligence engine must normalize skill evidence.");
assert.match(employmentSharedIntelligenceEngine, /export function explainOpportunityMatch/, "Shared Employment Intelligence engine must expose explainable opportunity matching.");
assert.match(employmentIntelligenceEngineSource, /classifyCandidateContext[\s\S]*deriveCareerDirections[\s\S]*buildSkillIntelligence[\s\S]*buildOpportunityMatcherContract/, "Employment Intelligence generation must populate the shared opportunity-facing profile fields.");
assert.equal(Array.isArray(phase3bEmptyProfile.candidateContext.primaryContexts), true, "Candidate classification must be present on generated profiles.");
assert.equal(phase3bEmptyProfile.careerDirection.primaryTargets.length > 0, true, "Career direction must remain present even when provisional.");
assert.equal(phase3bEmptyProfile.skillIntelligence.normalizedSkills.length, 0, "Empty profiles must not invent skills.");
assert.equal(phase3bEmptyProfile.opportunityMatcherContract.consumes, "EmploymentIntelligenceProfile", "Jobs must consume Employment Intelligence rather than recalculating Professional Identity.");
assertCanonicalCodes(phase3bEmptyProfile.readinessDimensions.map((dimension) => dimension.key), "Phase 3B readiness output must use canonical dimension codes.");
assertCanonicalCodes(phase3bEmptyProfile.pathwayRecommendations.map((pathway) => pathway.pathwayCode), "Phase 3B pathway output must use canonical pathway codes.");
assertUniqueValues(phase3bEmptyProfile.pathwayRecommendations.map((pathway) => pathway.pathwayCode), "Phase 3B pathway recommendations must not duplicate pathways.");
assertUniqueValues(phase3bEmptyProfile.strengths.map((strength) => employmentIntelligenceDomainRuntime.employmentEvidenceDisplayCode(strength)), "Phase 3B displayed strength codes must not duplicate.");
assertUniqueValues(phase3bEmptyProfile.barriers.map((barrier) => barrier.definitionCode), "Phase 3B barrier codes must not duplicate.");
assertUniqueValues(phase3bEmptyProfile.secondaryActions.map((action) => action.actionCode), "Phase 3B secondary action codes must not duplicate.");
assertUniqueValues(phase3bEmptyProfile.careerPlan.steps.map((step) => step.stepId ?? step.id), "Phase 3B Career Plan step keys must be stable and unique.");
assert.deepEqual(
  Object.values(employmentIntelligenceDomainRuntime.employmentIntelligenceCollectionInvariantReport(phase3bEmptyProfile)),
  [true, true, true, true, true, true],
  "Phase 3B generated profiles must satisfy Employment Intelligence collection invariants."
);
assert.equal(phase3bEmptyProfile.readinessDimensions.every((dimension) => Number.isFinite(dimension.optionalScore ?? 0)), true, "Phase 3B readiness dimensions must never emit NaN scores.");
const phase3bGraduateProfile = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.graduateNoExperience, phase3bContext);
assert.equal(phase3bGraduateProfile.candidateContext.primaryContexts.includes("GRADUATE_OR_EMERGING_TALENT"), true, "Graduate/no-experience candidates must be classified without treating them as automatically unqualified.");
assert.equal(phase3bGraduateProfile.candidateContext.primaryContexts.includes("NO_FORMAL_EXPERIENCE"), true, "No formal experience must be a context signal, not a negative conclusion.");
assert.equal(phase3bGraduateProfile.skillIntelligence.normalizedSkills.some((skill) => skill.canonicalName.toLowerCase().includes("spreadsheet")), true, "Graduate skills must be normalized from Professional Identity.");
const phase3bExecutiveProfile = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.seniorExecutive, phase3bContext);
assert.equal(phase3bExecutiveProfile.candidateContext.primaryContexts.includes("EXPERIENCED_PROFESSIONAL"), true, "Experienced candidates must receive different candidate-context weighting.");
assert.equal(phase3bExecutiveProfile.candidateContext.weightingNotes.some((note) => /Experience, achievements and specialization/.test(note)), true, "Experienced candidate weighting must privilege experience and achievements.");
const phase3bTechnicalProfile = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.technicalProjects, phase3bContext);
assert.equal(phase3bTechnicalProfile.skillIntelligence.normalizedSkills.some((skill) => skill.canonicalName === "SQL" && skill.evidenceStates.includes("PROJECT_EVIDENCED")), true, "Skill intelligence must deduplicate equivalent skills and retain project evidence.");
assert.equal(phase3bTechnicalProfile.skillIntelligence.skillsNeedingEvidence.every((skill) => skill.unsupportedClaim), true, "Unsupported skills must stay marked as needing evidence.");
const blockedLicenceMatch = employmentIntelligenceEngineRuntime.explainOpportunityMatch({
  opportunity: {
    id: "security-role",
    source: "fixture",
    title: "Security Officer",
    employer: "Example Employer",
    status: "ACTIVE",
    requirements: [{ id: "licence", label: "Security registration", category: "LICENCE", importance: "MANDATORY" }],
    requiredSkills: [],
    preferredSkills: [],
    requiredEducation: [],
    licences: ["Security registration"],
    languages: []
  },
  careerDirection: phase3bGraduateProfile.careerDirection,
  skillIntelligence: phase3bGraduateProfile.skillIntelligence,
  missingInformation: [],
  evidenceSummary: { assessments: [], evidenceGaps: [], strongestSupportedAssets: phase3bGraduateProfile.strengths, unsupportedClaims: [], conflicts: [], overallEvidenceConfidence: phase3bGraduateProfile.confidence }
});
assert.notEqual(blockedLicenceMatch.eligibilityStatus, "ELIGIBLE", "Mandatory missing licence must affect eligibility separately from suitability.");
assert.equal(Number.isFinite(blockedLicenceMatch.suitabilityScore), true, "Opportunity suitability may still be scored while eligibility is conditional or blocked.");
assert.equal(blockedLicenceMatch.reasons.some((reason) => /Eligibility and suitability are evaluated separately/.test(reason)), true, "Opportunity matches must explain eligibility and suitability separately.");
const expiredMatch = employmentIntelligenceEngineRuntime.explainOpportunityMatch({
  opportunity: {
    id: "expired-role",
    source: "fixture",
    title: "Junior Analyst",
    employer: "Example Employer",
    status: "EXPIRED",
    requirements: [],
    requiredSkills: ["spreadsheet analysis"],
    preferredSkills: [],
    requiredEducation: [],
    licences: [],
    languages: []
  },
  careerDirection: phase3bGraduateProfile.careerDirection,
  skillIntelligence: phase3bGraduateProfile.skillIntelligence,
  missingInformation: [],
  evidenceSummary: { assessments: [], evidenceGaps: [], strongestSupportedAssets: phase3bGraduateProfile.strengths, unsupportedClaims: [], conflicts: [], overallEvidenceConfidence: phase3bGraduateProfile.confidence }
});
assert.equal(expiredMatch.recommendedAction, "DO_NOT_RECOMMEND_NOW", "Expired opportunities must not be recommended as current opportunities.");
const duplicateDiagnosisEvidence = [
  {
    id: "diagnosis-experience",
    subject: "employment_diagnosis",
    evidenceType: "SELF_REPORTED",
    sourceReference: "employment_diagnosis:experience",
    supportingField: "experience",
    confidence: phase3bEmptyProfile.confidence,
    verifiedStatus: "KNOWN",
    timestamp: "2026-08-04T00:00:00.000Z",
    engineVersion: "test"
  },
  {
    id: "diagnosis-skills",
    subject: "employment_diagnosis",
    evidenceType: "SELF_REPORTED",
    sourceReference: "employment_diagnosis:skills",
    supportingField: "skills",
    confidence: phase3bEmptyProfile.confidence,
    verifiedStatus: "KNOWN",
    timestamp: "2026-08-04T00:00:00.000Z",
    engineVersion: "test"
  }
];
const mergedDiagnosisEvidence = employmentIntelligenceDomainRuntime.mergeDuplicateEvidenceRecords(duplicateDiagnosisEvidence);
assert.equal(mergedDiagnosisEvidence.length, 1, "Duplicate employment_diagnosis evidence must merge into one displayed strength.");
assert.match(mergedDiagnosisEvidence[0].internalNotes.join(" "), /experience[\s\S]*skills|skills[\s\S]*experience/, "Merged duplicate evidence must preserve distinct supporting fields.");
const duplicateViewModel = employmentIntelligenceViewModelRuntime.buildEmploymentHomeViewModel({
  status: "current",
  intelligence: {
    overallReadiness: phase3bEmptyProfile.overallReadiness,
    supportIntensity: phase3bEmptyProfile.supportIntensity,
    strengths: duplicateDiagnosisEvidence,
    barriers: [phase3bEmptyProfile.barriers[0], phase3bEmptyProfile.barriers[0]].filter(Boolean),
    readinessDimensions: [phase3bEmptyProfile.readinessDimensions[0], phase3bEmptyProfile.readinessDimensions[0]].filter(Boolean),
    nextBestAction: phase3bEmptyProfile.nextBestAction,
    secondaryActions: [phase3bEmptyProfile.secondaryActions[0], phase3bEmptyProfile.secondaryActions[0]].filter(Boolean)
  },
  actions: { primary: phase3bEmptyProfile.nextBestAction, secondary: [phase3bEmptyProfile.secondaryActions[0], phase3bEmptyProfile.secondaryActions[0]].filter(Boolean) },
  careerPlan: { ...phase3bEmptyProfile.careerPlan, steps: [phase3bEmptyProfile.careerPlan.steps[0], phase3bEmptyProfile.careerPlan.steps[0]].filter(Boolean) }
}, "en");
assert.equal(JSON.stringify(duplicateViewModel.position.strongestAssets), JSON.stringify(["Employment diagnosis"]), "Phase 3G view model must display one readable merged strongest asset for duplicate evidence subjects.");
assertUniqueValues(duplicateViewModel.position.barriers.map((barrier) => barrier.code), "Phase 3G view model barrier keys must be unique.");
assertUniqueValues(duplicateViewModel.dimensions.map((dimension) => dimension.key), "Phase 3G view model readiness dimension keys must be unique.");
assertUniqueValues(duplicateViewModel.secondaryActions.map((action) => action.code), "Phase 3G view model secondary action keys must be unique.");
assertUniqueValues((duplicateViewModel.careerPlan?.nextSteps ?? []).map((step) => step.id), "Phase 3G Career Plan preview keys must be unique.");
const malformedCareerPlanViewModel = employmentIntelligenceViewModelRuntime.buildEmploymentHomeViewModel({
  status: "current",
  intelligence: {
    overallReadiness: phase3bEmptyProfile.overallReadiness,
    supportIntensity: phase3bEmptyProfile.supportIntensity,
    nextBestAction: phase3bEmptyProfile.nextBestAction
  },
  actions: {
    primary: {
      ...phase3bEmptyProfile.nextBestAction,
      blockedBy: undefined,
      supportingEvidence: undefined,
      reasonCodes: undefined
    },
    secondary: []
  },
  careerPlan: {
    ...phase3bEmptyProfile.careerPlan,
    progress: undefined,
    steps: [
      {
        id: "legacy-step",
        actionCode: "UNKNOWN_LEGACY_ACTION",
        title: "Legacy saved step",
        reason: "Old saved Career Plan payload",
        horizon: "UNKNOWN_HORIZON",
        state: "UNKNOWN_STATE",
        evidence: undefined,
        dependencies: undefined,
        completionCriteria: undefined
      },
      {
        id: "legacy-step",
        actionCode: "UNKNOWN_LEGACY_ACTION",
        title: "Duplicate legacy saved step",
        reason: "Duplicate old saved Career Plan payload",
        horizon: "UNKNOWN_HORIZON",
        state: "UNKNOWN_STATE"
      }
    ]
  }
}, "fr");
assert.equal(malformedCareerPlanViewModel.primaryAction?.state, "ready", "Phase 3 release blocker: missing action arrays must not crash action rendering.");
assert.equal(malformedCareerPlanViewModel.primaryAction?.stateLabel, "Prêt à commencer", "Phase 3 release blocker: action states must render as user-facing translated labels.");
assert.equal(malformedCareerPlanViewModel.primaryAction?.why.length, 0, "Phase 3 release blocker: missing action reasons and evidence must normalize to an empty why list.");
assert.equal(Boolean(malformedCareerPlanViewModel.primaryAction?.whySentence.trim()), true, "Phase 3 action cards must expose one user-facing why sentence instead of raw reason codes.");
assert.doesNotMatch(JSON.stringify({
  title: malformedCareerPlanViewModel.primaryAction?.title,
  explanation: malformedCareerPlanViewModel.primaryAction?.explanation,
  whySentence: malformedCareerPlanViewModel.primaryAction?.whySentence
}), /identity\.incomplete|source_of_truth\.required|urgency=|impact=|effort=|state=|ELIGIBLE|URGENT_SUPPORT|LOW/, "Phase 3 action-card presentation must not expose raw action reason keys or debug metadata.");
assert.equal(malformedCareerPlanViewModel.careerPlan?.totalSteps, 1, "Phase 3 release blocker: duplicate or legacy Career Plan steps must normalize before rendering.");
assert.equal(malformedCareerPlanViewModel.careerPlan?.nextSteps[0]?.href, "/employment-center", "Phase 3 release blocker: missing action references must fall back to the Employment Center.");
assert.equal(malformedCareerPlanViewModel.careerPlan?.nextSteps[0]?.horizon, "Cette semaine", "Phase 3 release blocker: unknown horizons must use a safe translated fallback horizon.");
assert.equal(malformedCareerPlanViewModel.careerPlan?.nextSteps[0]?.state, "Prêt à commencer", "Phase 3 release blocker: missing translations must fall back to a safe display label.");
assert.doesNotMatch(JSON.stringify(malformedCareerPlanViewModel), /UNKNOWN_HORIZON|UNKNOWN_STATE|employment_diagnosis|STRUCTURED_GUIDANCE|SKILLED_EMPLOYMENT/, "Phase 3 release blocker: Career Plan view models must not expose raw canonical codes to users.");
const practicalAccessActionCard = employmentIntelligenceViewModelRuntime.buildEmploymentActionViewModel({
  actionCode: "PLAN_PRACTICAL_ACCESS",
  title: "Raw title should be replaced",
  plainLanguageTitle: "Raw title should be replaced",
  explanation: "raw explanation",
  plainLanguageExplanation: "raw explanation",
  reason: "practical_constraints.support_not_judgement",
  reasonCodes: ["practical_constraints.support_not_judgement", "access_shapes_workflow"],
  expectedOutcome: "impact=URGENT_SUPPORT",
  urgency: "HIGH",
  impact: "URGENT_SUPPORT",
  effort: "LOW",
  state: "ELIGIBLE",
  blockedBy: [],
  supportingEvidence: [],
  confidence: phase3bEmptyProfile.confidence,
  presentationMode: "PLAIN_LANGUAGE",
  supportDestination: "employment_center",
  route: "/employment-center"
}, "en");
assert.equal(practicalAccessActionCard?.title, "Plan around practical constraints", "Practical access action must use a plain user-facing title.");
assert.equal(practicalAccessActionCard?.explanation, "Choose steps that fit your transport, internet, device or schedule.", "Practical access action must use a short supportive explanation.");
assert.equal(practicalAccessActionCard?.whySentence, "PATHZY recommends this because practical access may affect which opportunities are realistic right now.", "Practical access action must use the approved plain-language why sentence.");
assert.doesNotMatch(JSON.stringify({
  title: practicalAccessActionCard?.title,
  explanation: practicalAccessActionCard?.explanation,
  whySentence: practicalAccessActionCard?.whySentence
}), /practical_constraints|access_shapes_workflow|urgency=|impact=|effort=|state=|ELIGIBLE|URGENT_SUPPORT|LOW/, "Practical access action presentation must hide raw reason keys and debug metadata.");
const emptyCareerPlanViewModel = employmentIntelligenceViewModelRuntime.buildEmploymentHomeViewModel({
  status: "current",
  intelligence: { overallReadiness: phase3bEmptyProfile.overallReadiness, supportIntensity: phase3bEmptyProfile.supportIntensity },
  careerPlan: { ...phase3bEmptyProfile.careerPlan, steps: undefined, progress: undefined }
}, "en");
assert.equal(emptyCareerPlanViewModel.careerPlan?.totalSteps, 0, "Phase 3 release blocker: missing Career Plan steps array must render as an empty recoverable plan.");
assert.equal(emptyCareerPlanViewModel.careerPlan?.nextSteps.length, 0, "Phase 3 release blocker: empty Career Plan horizon must render without crashing.");
assert.match(employmentIntelligenceUiSource, /normalizeCareerPlanForRendering\(\(detail as \{ careerPlan\?: unknown \}\)\.careerPlan\)/, "Full Career Plan page must normalize persisted plan JSON before rendering steps.");
assert.match(employmentIntelligenceUiSource, /key=\{step\.id\}/, "Career Plan step rendering must use stable persisted step keys instead of array indexes.");
assert.equal(employmentIntelligenceUiSource.includes("grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))]"), true, "Secondary action cards must use a responsive auto-fit grid instead of forced narrow columns.");
assert.equal(employmentIntelligenceUiSource.includes("grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]"), true, "Employment Position and Readiness cards must use content-driven responsive grids.");
assert.match(employmentIntelligenceUiSource, /flex h-full min-w-0 flex-col[\s\S]*action\.whySentence[\s\S]*grid gap-2 sm:grid-cols-\[1fr_auto_auto\]/, "Action cards must render one visible why sentence and keep controls in a normal-flow footer.");
assert.match(employmentIntelligenceUiSource, /\[overflow-wrap:anywhere\][\s\S]*\[overflow-wrap:anywhere\][\s\S]*\[overflow-wrap:anywhere\]/, "Career Plan presentation must wrap long English and French content safely.");
const phase3bGraduate = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.graduateNoExperience, phase3bContext);
assert.equal(phase3bGraduate.pathwayRecommendations.some((pathway) => ["GRADUATE_PROGRAMME", "INTERNSHIP", "LEARNERSHIP", "ENTRY_LEVEL_EMPLOYMENT"].includes(pathway.pathwayCode)), true, "Phase 3B must support graduates without treating no formal experience as fatal.");
assert.equal(phase3bGraduate.suitableJobLevels.includes("GRADUATE"), true, "Phase 3B must indicate graduate job level for education-first profiles.");
const phase3bTechnical = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.technicalProjects, phase3bContext);
assert.equal(phase3bTechnical.suitableJobLevels.includes("TECHNICAL"), true, "Phase 3B must recognize technical project evidence.");
assert.equal(phase3bTechnical.pathwayRecommendations.some((pathway) => ["SKILLS_FIRST_TRANSITION", "FREELANCE_WORK", "PROFESSIONAL_EMPLOYMENT", "SKILLED_EMPLOYMENT"].includes(pathway.pathwayCode)), true, "Phase 3B must connect technical evidence to skills-first or professional pathways.");
const phase3bCleaner = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.cleanerInformalExperience, phase3bContext);
assert.equal(phase3bCleaner.suitableRoleFamilies.includes("PRACTICAL_SERVICE_OR_OPERATIONAL_EXPERIENCE"), true, "Phase 3B must count informal practical experience as strength.");
assert.equal(phase3bCleaner.pathwayRecommendations.some((pathway) => ["ENTRY_LEVEL_EMPLOYMENT", "TEMPORARY_WORK", "PART_TIME_WORK", "INFORMAL_OR_COMMUNITY_WORK"].includes(pathway.pathwayCode)), true, "Phase 3B must support service and informal work pathways.");
const phase3bLimitedInternet = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.limitedInternet, phase3bContext);
assert.equal(["STRUCTURED_GUIDANCE", "HIGH_SUPPORT", "HUMAN_SUPPORT_RECOMMENDED"].includes(phase3bLimitedInternet.supportIntensity), true, "Phase 3B limited internet should increase support intensity, not reduce user capability.");
const phase3bTransport = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.transportConstraint, phase3bContext);
assert.equal(phase3bTransport.barriers.some((barrier) => barrier.definitionCode === "PRACTICAL_ACCESS_CONSTRAINT"), true, "Phase 3B must detect transport access as a practical constraint.");
assert.notEqual(phase3bTransport.readinessDimensions.find((dimension) => dimension.key === "SKILLS_READINESS")?.band, "NOT_ASSESSED", "Phase 3B transport constraints must not erase unrelated skills readiness.");
const phase3bLowLiteracy = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.lowLiteracySupport, phase3bContext);
assert.equal(["STRUCTURED_GUIDANCE", "HIGH_SUPPORT", "HUMAN_SUPPORT_RECOMMENDED"].includes(phase3bLowLiteracy.supportIntensity), true, "Phase 3B low literacy support should produce accessible guidance intensity.");
assert.equal(JSON.stringify(phase3bLowLiteracy).includes("unemployable"), false, "Phase 3B must never label a user unemployable.");
const phase3bBeforeInput = JSON.stringify(phase3bFixtures.technicalProjects);
const firstDeterministicRun = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.technicalProjects, phase3bContext);
const secondDeterministicRun = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(phase3bFixtures.technicalProjects, phase3bContext);
assert.deepEqual(secondDeterministicRun, firstDeterministicRun, "Phase 3B engine output must be deterministic for the same input and context.");
assert.equal(JSON.stringify(phase3bFixtures.technicalProjects), phase3bBeforeInput, "Phase 3B engine must not mutate Professional Identity or Diagnosis input.");
const phase3bTrace = employmentIntelligenceEngineRuntime.generateEmploymentIntelligenceWithTrace(phase3bFixtures.emptyProfile, phase3bContext);
assert.equal(phase3bTrace.intermediate.signals.length > 10, true, "Phase 3B trace must expose deterministic signal extraction for testing.");
assert.equal(phase3bTrace.intermediate.missingInformation.some((item) => item.blocksConclusion), true, "Phase 3B missing information must mark blockers without pretending to know the answer.");
assert.equal(phase3bTrace.profile.explanations.every((explanation) => Array.isArray(explanation.reasons) && explanation.confidence), true, "Phase 3B explanations must be structured and confidence-bearing.");
assert.doesNotMatch(employmentCountryContextSource, /salary:\s*\d|market demand is high|you qualify|current programme openings/i, "Phase 3C must not invent salary values, market-demand claims, programme openings, or eligibility conclusions.");
assert.match(employmentCountryContextSource, /SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION\s*=\s*"3C\.1"/, "Phase 3C South Africa adapter must have an explicit adapter version.");
assert.match(employmentCountryContextSource, /Nationality is never used as work authorization|Do not infer work authorization from nationality/i, "Phase 3C must lock nationality away from work authorization.");
assert.match(employmentCountryContextSource, /UNAVAILABLE[\s\S]*ZA_CURRENT_SALARY_DATA_UNAVAILABLE[\s\S]*ZA_CURRENT_PROGRAMME_OPENINGS_UNAVAILABLE[\s\S]*ZA_CURRENT_MARKET_DEMAND_UNAVAILABLE/, "Phase 3C must represent unavailable current-sensitive South Africa data explicitly.");
const zaResolution = employmentIntelligenceEngineRuntime.resolveCountryEmploymentContext({ countryCode: "ZA", regionCode: "GP", asOfDate: "2026-08-04T00:00:00.000Z" });
assert.equal(zaResolution.context.countryCode, "ZA", "Phase 3C country resolution must resolve ZA to the South Africa adapter.");
assert.equal(zaResolution.adapterVersion, "3C.1", "Phase 3C ZA resolution must expose adapter version.");
assert.equal(zaResolution.context.sourceMetadata.length >= 5, true, "Phase 3C ZA context must include source metadata contracts.");
assertUniqueValues(zaResolution.sourceRegistry.map((source) => source.sourceId), "Phase 3C source IDs must be unique.");
assert.equal(zaResolution.sourceRegistry.every((source) => source.status && source.confidence && Array.isArray(source.topicsCovered)), true, "Phase 3C sources must include status, confidence, and topics.");
assert.equal(zaResolution.context.unavailableDataMarkers.includes("ZA_CURRENT_SALARY_DATA_UNAVAILABLE"), true, "Phase 3C salary data must default to unavailable without a source.");
assert.equal(zaResolution.context.salaryDataContract.currency, "ZAR", "Phase 3C salary boundary must use ZAR.");
assert.equal(Array.isArray(zaResolution.context.salaryDataContract.values) && zaResolution.context.salaryDataContract.values.length === 0, true, "Phase 3C salary boundary must not include invented salary values.");
const unsupportedCountryResolution = employmentIntelligenceEngineRuntime.resolveCountryEmploymentContext({ countryCode: "BR", regionCode: "SP" });
assert.equal(unsupportedCountryResolution.context.countryCode, "BR", "Unsupported countries must keep the requested country code while using the generic adapter.");
assert.equal(unsupportedCountryResolution.context.unavailableDataMarkers.includes("COUNTRY_ADAPTER_UNAVAILABLE"), true, "Unsupported country resolution must mark country adapter data unavailable.");
const missingCountryResolution = employmentIntelligenceEngineRuntime.resolveCountryEmploymentContext({});
assert.equal(missingCountryResolution.context.countryCode, "GENERIC", "Missing country must resolve safely to generic context.");
const invalidProvinceResolution = employmentIntelligenceEngineRuntime.resolveCountryEmploymentContext({ countryCode: "ZA", regionCode: "BAD" });
assert.equal(invalidProvinceResolution.context.unavailableDataMarkers.includes("ZA_REGION_CONTEXT_UNAVAILABLE"), true, "Invalid ZA province must be marked unavailable instead of crashing.");
const zaProvinceCodes = zaResolution.context.regionModel.provinces.map((province) => province.provinceCode);
assert.equal(zaProvinceCodes.sort().join(","), "EC,FS,GP,KZN,LP,MP,NC,NW,WC", "Phase 3C must include all nine South African province codes.");
assertUniqueValues(zaProvinceCodes, "Phase 3C province codes must be unique.");
assert.equal(zaResolution.context.regionModel.provinces.every((province) => province.labels.en && province.labels.fr && province.provinceCode), true, "Phase 3C province labels must support English and French without changing canonical codes.");
const zaQualificationContexts = zaResolution.context.qualificationFramework.qualificationContexts;
assert.equal(zaQualificationContexts.every((qualification) => qualification.nqfLevel === null), true, "Phase 3C must not assign NQF levels without reliable mapping evidence.");
assert.equal(zaQualificationContexts.some((qualification) => qualification.qualificationType === "foreign" && qualification.recognitionStatus === "UNKNOWN"), true, "Phase 3C foreign qualification context must keep recognition evidence-aware.");
assert.equal(zaQualificationContexts.some((qualification) => qualification.qualificationType === "matric_incomplete" && qualification.pathwayImplications.includes("SKILLS_FIRST_TRANSITION")), true, "Phase 3C non-matric users must retain skills-first pathways.");
assert.equal(zaResolution.context.qualificationFramework.tvetTradeContext.eligibilityStates.includes("PROGRAMME_DATA_UNAVAILABLE"), true, "Phase 3C TVET/trade context must mark programme data unavailable when not sourced.");
assert.equal(zaResolution.context.workAuthorisationContext.states.includes("UNKNOWN"), true, "Phase 3C work authorization context must support UNKNOWN.");
assert.equal(zaResolution.context.workAuthorisationContext.states.includes("USER_DECLINED"), true, "Phase 3C work authorization context must support USER_DECLINED.");
assert.match(JSON.stringify(zaResolution.context.workAuthorisationContext.rules), /Do not infer work authorization from nationality/, "Phase 3C work authorization rules must reject nationality inference.");
assert.equal(zaResolution.context.jobTaxonomyMapping.securitySectorContext.dependencyMarkers.includes("registration_or_licence_dependency"), true, "Phase 3C security context must expose registration or licence dependency.");
assert.equal(zaResolution.context.jobTaxonomyMapping.serviceRoleEvidenceContext.evidenceExamples.includes("informal references"), true, "Phase 3C service context must support informal references.");
assert.equal(zaResolution.context.languageContext.supportedCurrentPresentationLanguages.includes("fr"), true, "Phase 3C language context must preserve current French presentation support.");
assert.equal(zaResolution.context.transportGeographicContext.lowLiteracySupport.rule.includes("must not become stigma"), true, "Phase 3C low-literacy support must increase guidance without stigma.");
assert.equal(zaResolution.context.formalInformalEmploymentContext.supportedModes.includes("informal_employment"), true, "Phase 3C must support informal employment context.");
const zaFixtures = employmentIntelligenceEngineRuntime.phase3cSouthAfricaEmploymentFixtures;
assert.equal(Object.keys(zaFixtures).length >= 18, true, "Phase 3C must provide at least 18 fictional South Africa fixtures.");
const zaGraduate = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.gautengGraduateIctNoExperience, phase3bContext);
assert.equal(zaGraduate.countryContext.countryCode, "ZA", "Phase 3C generated profiles must preserve ZA country context.");
assert.equal(zaGraduate.pathwayRecommendations.some((pathway) => ["GRADUATE_PROGRAMME", "INTERNSHIP", "LEARNERSHIP"].includes(pathway.pathwayCode)), true, "Phase 3C graduate context must support graduate/internship/learnership evaluation.");
const zaForeign = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.foreignQualifiedProfessionalRecognitionUnknown, phase3bContext);
assert.equal(zaForeign.missingInformation.includes("ZA_FOREIGN_QUALIFICATION_RECOGNITION_UNKNOWN"), true, "Phase 3C foreign qualification must create recognition uncertainty.");
assert.equal(zaForeign.barriers.some((barrier) => barrier.definitionCode === "QUALIFICATION_RECOGNITION_UNCERTAINTY"), true, "Phase 3C recognition uncertainty must map to a qualification barrier.");
assert.equal(zaForeign.pathwayRecommendations.some((pathway) => pathway.pathwayCode === "QUALIFICATION_RECOGNITION"), true, "Phase 3C recognition uncertainty must keep qualification-recognition pathway available.");
const zaSecurity = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.securityRegistrationUnknown, phase3bContext);
assert.equal(zaSecurity.missingInformation.includes("ZA_SECURITY_REGISTRATION_EVIDENCE_UNKNOWN"), true, "Phase 3C security pathway must expose registration evidence uncertainty.");
assert.equal(zaSecurity.barriers.some((barrier) => barrier.definitionCode === "LICENCE_OR_REGISTRATION_EVIDENCE_MISSING"), true, "Phase 3C security evidence uncertainty must map to a licence or registration barrier.");
const zaCleaner = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.cleanerInformalReference, phase3bContext);
assert.equal(zaCleaner.suitableRoleFamilies.includes("PRACTICAL_SERVICE_OR_OPERATIONAL_EXPERIENCE"), true, "Phase 3C cleaner/service context must respect informal evidence.");
const zaNonMatric = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.nonMatricSkillsFirst, phase3bContext);
assert.equal(zaNonMatric.pathwayRecommendations.some((pathway) => ["ENTRY_LEVEL_EMPLOYMENT", "SKILLS_FIRST_TRANSITION", "INFORMAL_OR_COMMUNITY_WORK"].includes(pathway.pathwayCode)), true, "Phase 3C non-matric users must retain multiple practical pathways.");
const zaSmartphone = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.smartphoneOnlyLimitedData, phase3bContext);
assert.equal(["STRUCTURED_GUIDANCE", "HIGH_SUPPORT", "HUMAN_SUPPORT_RECOMMENDED"].includes(zaSmartphone.supportIntensity), true, "Phase 3C smartphone-only limited data should increase support intensity.");
const zaRural = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.ruralTransportLimitations, phase3bContext);
assert.equal(zaRural.barriers.some((barrier) => barrier.definitionCode === "PRACTICAL_ACCESS_CONSTRAINT"), true, "Phase 3C rural transport limitations must affect practical access.");
assert.notEqual(zaRural.overallReadiness.readinessBand, "STRONG", "Phase 3C practical uncertainty should lower confidence without capability stigma.");
const zaNationalityOnly = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.unknownWorkAuthorisation, phase3bContext);
assert.equal(zaNationalityOnly.missingInformation.includes("WORK_AUTHORIZATION_UNCLEAR"), true, "Phase 3C nationality must not satisfy work authorization.");
assert.equal(zaNationalityOnly.barriers.some((barrier) => barrier.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY"), true, "Phase 3C unknown authorization must remain an uncertainty barrier.");
assert.equal(JSON.stringify(zaNationalityOnly).includes("unemployable"), false, "Phase 3C must never label a user unemployable.");
const zaBeforeInput = JSON.stringify(zaFixtures.gautengGraduateIctNoExperience);
const zaFirstRun = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.gautengGraduateIctNoExperience, phase3bContext);
const zaSecondRun = employmentIntelligenceEngineRuntime.generateEmploymentIntelligence(zaFixtures.gautengGraduateIctNoExperience, phase3bContext);
assert.deepEqual(zaSecondRun, zaFirstRun, "Phase 3C ZA adapter and engine integration must be deterministic.");
assert.equal(JSON.stringify(zaFixtures.gautengGraduateIctNoExperience), zaBeforeInput, "Phase 3C adapter integration must not mutate Professional Identity or Diagnosis inputs.");
const normalizedEventFailure = errorNormalizationRuntime.normalizePathzyError({ type: "error", target: "window" }, "Keep the current screen safe.");
assert.equal(normalizedEventFailure.originalType, "event", "Browser event-like failures must be normalized before they can reach the Next.js overlay.");
assert.equal(normalizedEventFailure.userMessage, "Keep the current screen safe.", "Event-like failures must receive a human fallback message.");
assert.doesNotMatch(errorNormalization, /\[object Event\]|\[object Object\]/, "Error normalization must not stringify raw browser events or objects into user messages.");
assert.equal(authorizationRuntime.authorizeOwnerAccess({ userId: "user-1", role: "user" }, { ownerUserId: "user-2" }).allowed, false, "Owner authorization must deny cross-user access.");
assert.equal(authorizationRuntime.authorizeOwnerAccess({ userId: "user-1", role: "user" }, { ownerUserId: "user-1" }).allowed, true, "Owner authorization must allow owned resources.");
assert.equal(authorizationRuntime.authorizeOwnerAccess({ userId: "admin-1", role: "admin" }, { ownerUserId: "user-1", sensitive: true }).audit.required, true, "Admin access must require audit logging hooks.");
assert.equal(authorizationRuntime.normalizePathzyRole("service_role"), "background_service", "Background service role must be represented separately from user roles.");

const completeIdentityProfile = {
  full_name: "Nicka Candida",
  email: "nicka@example.com",
  city: "Johannesburg",
  country: "South Africa",
  current_status: "Graduate",
  career_goal: "Data Analyst",
  education: "Diploma",
  language: "english",
  onboarding_completed: false
};
const completeIdentityDiscovery = {
  answers: {
    nationality: "South African",
    work_authorization: "Authorized to work",
    skills: ["Excel", "SQL"],
    employment_type: "Full-time",
    availability: "Immediately"
  }
};
const completeReadinessAnswers = {
  current_situation: "First-time job seeker",
  main_support_needed: "Professional profile",
  existing_cv_status: "Yes, but it needs improvement",
  immediate_employment_goal: "Find a job",
  current_readiness: "I have some information but need guidance"
};
const completeReadinessDiscovery = {
  answers: {
    ...completeIdentityDiscovery.answers,
    welcome_completed: true,
    pathzy_onboarding_state: "identity_started",
    professional_document_language: "same_as_interface",
    career_coach_intro_seen: true,
    employment_readiness_check: completeReadinessAnswers,
    employment_readiness_check_step: 4,
    employment_readiness_check_status: "complete",
    employment_readiness_check_completed: true
  }
};
const languageNeutralAnswers = {
  ...completeReadinessDiscovery.answers,
  languages: [],
  interface_language: "en",
  professional_document_language: "same_as_interface"
};
const englishCompletionValues = professionalIdentityCompletionRuntime.professionalIdentityValuesFromSources(
  { ...completeIdentityProfile, language: "english" },
  { answers: languageNeutralAnswers },
  { email: "nicka@example.com" }
);
const frenchCompletionValues = professionalIdentityCompletionRuntime.professionalIdentityValuesFromSources(
  { ...completeIdentityProfile, language: "french" },
  { answers: { ...languageNeutralAnswers, interface_language: "fr" } },
  { email: "nicka@example.com" }
);
const englishCompletion = professionalIdentityCompletionRuntime.calculateProfessionalIdentityCompletion(englishCompletionValues);
const frenchCompletion = professionalIdentityCompletionRuntime.calculateProfessionalIdentityCompletion(frenchCompletionValues);
const englishMissingSectionIds = englishCompletion.sections.filter((section) => !section.complete).map((section) => section.key);
const frenchMissingSectionIds = frenchCompletion.sections.filter((section) => !section.complete).map((section) => section.key);
assert.equal(englishCompletion.percentage, frenchCompletion.percentage, "The same canonical Professional Identity must have the same completion percentage in English and French.");
assert.equal(englishCompletion.requiredChecks.filter((check) => !check.complete).length, frenchCompletion.requiredChecks.filter((check) => !check.complete).length, "The same canonical Professional Identity must have the same required-missing count in English and French.");
assert.deepEqual(englishMissingSectionIds, frenchMissingSectionIds, "The same canonical Professional Identity must have the same missing section IDs in English and French.");
assert.equal(englishCompletionValues.languages.length, 0, "Interface/profile language must not be treated as the professional spoken-language section.");
assert.equal(frenchCompletionValues.languages.length, 0, "French interface/profile language must not be treated as the professional spoken-language section.");
const professionalIdentityCvValues = professionalIdentityCompletionRuntime.professionalIdentityValuesFromSources(
  {
    ...completeIdentityProfile,
    full_name: "Nicka Candida",
    phone: "+27 11 000 0000",
    linkedin_url: "https://linkedin.com/in/nicka",
    portfolio_url: "https://portfolio.example"
  },
  {
    answers: {
      ...completeReadinessDiscovery.answers,
      professional_summary: "Early career data analyst focused on practical reporting.",
      education_history: ["Diploma in Information Technology"],
      experience_history: ["Data intern | Example Company | Built weekly reports"],
      skills: ["Excel", "SQL", "Communication"],
      projects_history: ["Community dashboard project"],
      achievements: ["Improved report turnaround"],
      certificates_list: ["Google Data Analytics"],
      languages: ["English | Professional"]
    }
  },
  { email: "nicka@example.com" }
);
const professionalIdentityCv = professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity(professionalIdentityCvValues);
assert.equal(professionalIdentityCv.fullName, "Nicka Candida", "Professional Identity values must automatically populate the CV full name.");
assert.equal(professionalIdentityCv.targetRole, "Data Analyst", "Professional Identity career goal must automatically populate the CV target role.");
assert.ok(professionalIdentityCv.coreSkills.includes("SQL"), "Professional Identity skills must automatically populate the CV skill model.");
assert.equal(professionalIdentityCv.professionalExperience[0]?.role, "Data intern", "Professional Identity experience role must populate the CV role field.");
assert.equal(professionalIdentityCv.professionalExperience[0]?.company, "Example Company", "Professional Identity experience company must populate the CV company field.");
assert.deepEqual(Array.from(professionalIdentityCv.professionalExperience[0]?.achievements ?? []), ["Built weekly reports"], "Professional Identity experience evidence must populate CV achievements without flattening into the role.");
const professionalIdentityCvDocument = professionalIdentityCvModelRuntime.professionalIdentityCvDocument(professionalIdentityCvValues, { templateName: "Modern ATS", lastUpdated: "2026-08-24T10:00:00.000Z" });
assert.equal(professionalIdentityCvDocument.contentJson.source, "professional_identity", "Automatic CV documents must mark Professional Identity as their source.");
assert.deepEqual(professionalIdentityCvDocument.contentJson.cvModel, professionalIdentityCv, "Automatic CV preview and export must use the same normalized CV model derived from Professional Identity.");
assert.equal(professionalIdentityCvModelRuntime.professionalIdentityHrefForCvSection("Education"), "/professional-identity?section=education&returnTo=%2Fprofessional-identity%2Fcv", "CV section edit links must preserve a route back to the CV workspace.");
const twoExperienceFixture = [
  {
    id: "exp-pathzy-founder",
    role: "Founder & Product Owner",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Building an employment operating system for guided career support.",
    achievements: ["Designed the Professional Identity workflow."]
  },
  {
    id: "exp-avolito-marketing",
    role: "Co-founder & Marketing Lead",
    company: "AVOLITO Beverages",
    location: "Johannesburg",
    startDate: "2026",
    endDate: "Present",
    description: "Coordinating launch planning, brand messaging and early marketing operations.",
    achievements: ["Prepared go-to-market content."]
  }
];
const structuredIdentityValues = professionalIdentityCompletionRuntime.normalizeProfessionalIdentityCompletionValues({
  ...professionalIdentityCvValues,
  experience: twoExperienceFixture,
  projects: ["PATHZY product workspace"],
  achievements: ["Prepared go-to-market content", "Built launch checklist"],
  certificates: ["Product strategy course", "Marketing certificate"],
  education: ["Diploma in Business | Entrepreneurship | Example College | 2024"]
});
const normalizedExperienceEntries = professionalIdentityExperienceRuntime.normalizeProfessionalIdentityExperienceEntries(structuredIdentityValues.experience);
assert.equal(normalizedExperienceEntries.length, 2, "Two Professional Identity experiences must remain two normalized records.");
assert.equal(normalizedExperienceEntries.map((entry) => entry.role).join(" -> "), "Founder & Product Owner -> Co-founder & Marketing Lead", "Experience ordering must be preserved.");
assert.equal(normalizedExperienceEntries.map((entry) => entry.company).join(" -> "), "PATHZY -> AVOLITO Beverages", "Each experience company must stay attached to the correct role.");
assert.equal(normalizedExperienceEntries.map((entry) => professionalIdentityExperienceRuntime.experienceEntryDateLabel(entry)).join(" -> "), "2025 - Present -> 2026 - Present", "Each experience date range must stay attached to the correct role.");
const canonicalExperienceSelectorFixture = professionalIdentityExperienceRuntime.selectCanonicalProfessionalIdentityExperiences({
  experience_entries: twoExperienceFixture,
  experience_history: ["Legacy Experience | Old Company | 2024 - 2025 | This old value must not win."],
  personal_background: "Legacy Experience | Old Company | 2024 - 2025 | This old value must not win."
});
assert.equal(canonicalExperienceSelectorFixture.length, 2, "The shared canonical Experience selector must prefer structured experience_entries over legacy text fields.");
assert.equal(canonicalExperienceSelectorFixture.some((entry) => /Legacy Experience|Old Company/.test(JSON.stringify(entry))), false, "Legacy Experience compatibility fields must not override structured canonical Experience records.");
const canonicalExperienceSelectorWithLegacyExperienceAlias = professionalIdentityExperienceRuntime.selectCanonicalProfessionalIdentityExperiences({
  experience: [
    "Co-founder & Marketing Lead - AVOLITO Beverages - 2026 - Present - Co-founder & Marketing Lead AVOLITO Beverages 2026 - Present Coordinating launch planning, brand messaging and early marketing operations."
  ],
  experience_entries: [
    {
      id: "exp-avolito-marketing",
      role: "Co-founder & Marketing Lead",
      company: "AVOLITO Beverages",
      location: "Johannesburg",
      startDate: "2026",
      endDate: "Present",
      description: "Coordinating launch planning, brand messaging and early marketing operations.",
      achievements: []
    }
  ],
  experience_history: ["Co-founder & Marketing Lead | AVOLITO Beverages | 2026 - Present | This legacy text must not win."]
});
assert.equal(canonicalExperienceSelectorWithLegacyExperienceAlias.length, 1, "A stale legacy experience alias must not override canonical structured experience_entries.");
assert.equal(canonicalExperienceSelectorWithLegacyExperienceAlias[0].description, "Coordinating launch planning, brand messaging and early marketing operations.", "The canonical selector must return the clean structured AVOLITO description, not the legacy grey duplicate text.");
assert.equal((JSON.stringify(canonicalExperienceSelectorWithLegacyExperienceAlias).match(/Co-founder & Marketing Lead/g) ?? []).length, 1, "The legacy experience alias must not put the AVOLITO role into both role and description.");
const duplicateLegacyExperienceFixture = professionalIdentityExperienceRuntime.normalizeProfessionalIdentityExperienceEntries([
  {
    id: "exp-pathzy-founder",
    role: "Founder & Product Owner",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Founder & Product Owner - PATHZY - 2025 - Present - Building an employment operating system for guided career support.",
    sourceText: "Founder & Product Owner | PATHZY | Johannesburg | 2025 - Present | Building an employment operating system for guided career support.",
    achievements: [
      "Founder & Product Owner | PATHZY | Johannesburg | 2025 - Present | Building an employment operating system for guided career support.",
      "Designed the Professional Identity workflow."
    ]
  },
  {
    id: "exp-avolito-marketing",
    role: "Co-founder & Marketing Lead",
    company: "AVOLITO Beverages",
    location: "Johannesburg",
    startDate: "2026",
    endDate: "Present",
    raw: "Co-founder & Marketing Lead | AVOLITO Beverages | Johannesburg | 2026 - Present | Coordinating launch planning, brand messaging and early marketing operations.",
    achievements: ["Prepared go-to-market content."]
  }
]);
assert.equal(duplicateLegacyExperienceFixture.length, 2, "Legacy composite sourceText/raw fields must not create extra Professional Identity experience records.");
assert.equal(duplicateLegacyExperienceFixture[0].description, "Building an employment operating system for guided career support.", "Professional Identity Review must not show a second grey duplicate paragraph from structured Experience 1.");
assert.deepEqual(Array.from(duplicateLegacyExperienceFixture[0].achievements), ["Designed the Professional Identity workflow."], "Composite legacy achievements must be removed while genuine achievements remain.");
assert.equal(duplicateLegacyExperienceFixture[1].description, "Coordinating launch planning, brand messaging and early marketing operations.", "A raw legacy record may fill missing description without duplicating role/company/dates.");
const avolitoGreyDuplicateFixture = professionalIdentityExperienceRuntime.selectCanonicalProfessionalIdentityExperiences([
  {
    id: "exp-avolito-marketing",
    role: "Co-founder & Marketing Lead",
    company: "AVOLITO Beverages",
    location: "Johannesburg",
    startDate: "2026",
    endDate: "Present",
    description: "Co-founder & Marketing Lead AVOLITO Beverages 2026 – Present Coordinating launch planning, brand messaging and early marketing operations.",
    achievements: []
  }
]);
assert.equal(avolitoGreyDuplicateFixture.length, 1, "One saved AVOLITO Experience must remain one canonical record.");
assert.equal(avolitoGreyDuplicateFixture[0].description, "Coordinating launch planning, brand messaging and early marketing operations.", "The grey Review description must not repeat role, company or dates from the same structured AVOLITO Experience.");
assert.equal((JSON.stringify(avolitoGreyDuplicateFixture).match(/Co-founder & Marketing Lead/g) ?? []).length, 1, "The AVOLITO role must appear only in the canonical role field, not again inside description.");
assert.equal((JSON.stringify(avolitoGreyDuplicateFixture).match(/AVOLITO Beverages/g) ?? []).length, 1, "The AVOLITO company must appear only in the canonical company field, not again inside description.");
const punctuationLightLegacyExperienceFixture = professionalIdentityExperienceRuntime.normalizeProfessionalIdentityExperienceEntries([
  {
    id: "exp-pathzy-founder",
    role: "Founder & Product Owner",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Founder & Product Owner - PATHZY 2025 – Present – Building an employment operating system for guided career support.",
    achievements: []
  }
]);
assert.equal(punctuationLightLegacyExperienceFixture.length, 1, "One canonical Experience with a punctuation-light legacy description must remain one Experience record.");
assert.equal(punctuationLightLegacyExperienceFixture[0].description, "Building an employment operating system for guided career support.", "Legacy Experience descriptions with loose spacing or en dashes must not render role/company/dates again in the grey body copy.");
assert.equal((JSON.stringify(punctuationLightLegacyExperienceFixture).match(/Founder & Product Owner/g) ?? []).length, 1, "The canonical Experience role must appear once in normalized output, not again inside description.");
const punctuationLightIdentityValues = professionalIdentityCompletionRuntime.normalizeProfessionalIdentityCompletionValues({
  ...professionalIdentityCvValues,
  experience: punctuationLightLegacyExperienceFixture
});
const punctuationLightCvModel = professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity(punctuationLightIdentityValues);
assert.equal(punctuationLightCvModel.professionalExperience.length, 1, "CV must receive one Experience record from a punctuation-light legacy duplicate.");
assert.equal((JSON.stringify(punctuationLightCvModel.professionalExperience).match(/Founder & Product Owner/g) ?? []).length, 1, "CV must not receive a second legacy Experience role inside the description.");
const punctuationLightLinkedInProjection = professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity(punctuationLightIdentityValues, { language: "english" });
assert.equal(punctuationLightLinkedInProjection.experience.length, 1, "LinkedIn must receive one Experience record from a punctuation-light legacy duplicate.");
assert.equal(punctuationLightLinkedInProjection.experience[0].description.includes("Founder & Product Owner"), false, "LinkedIn must not receive a second legacy Experience role inside the description.");
assert.equal(punctuationLightLinkedInProjection.experience[0].description.includes("PATHZY 2025"), false, "LinkedIn must not receive second legacy Experience metadata inside the description.");
const punctuationLightCoverLetterEvidence = coverLetterIntelligenceRuntime.selectCoverLetterEvidence(punctuationLightIdentityValues, { role: "Product Lead", company: "Example Employer", source: "manual" });
const punctuationLightExperienceEvidence = punctuationLightCoverLetterEvidence.selectedEvidence.filter((item) => item.type === "experience");
assert.equal(punctuationLightExperienceEvidence.length, 1, "Cover Letter intelligence must receive each punctuation-light Experience once.");
assert.equal(punctuationLightExperienceEvidence[0].sourceText.includes("Founder & Product Owner"), true, "Cover Letter intelligence must preserve the canonical structured Experience label.");
assert.equal(punctuationLightExperienceEvidence[0].sourceText.includes("PATHZY 2025"), false, "Cover Letter intelligence must not receive a legacy duplicate Experience sentence as source text.");
const duplicateLegacyShadowRecordFixture = professionalIdentityExperienceRuntime.normalizeProfessionalIdentityExperienceEntries([
  {
    id: "exp-pathzy-founder",
    role: "Founder & Product Owner",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Building an employment operating system for guided career support.",
    achievements: []
  },
  "Founder & Product Owner - PATHZY - Johannesburg - 2025 - Present - Building an employment operating system for guided career support."
]);
assert.equal(duplicateLegacyShadowRecordFixture.length, 1, "A legacy composite shadow record must merge into the canonical structured Experience entry.");
assert.equal(duplicateLegacyShadowRecordFixture[0].description, "Building an employment operating system for guided career support.", "Merged legacy Experience must keep one clean description rather than a second combined paragraph.");
const similarRolesAtSameEmployerFixture = professionalIdentityExperienceRuntime.normalizeProfessionalIdentityExperienceEntries([
  {
    id: "exp-pathzy-product",
    role: "Founder & Product Owner",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Leading product strategy and Professional Identity design.",
    achievements: []
  },
  {
    id: "exp-pathzy-operations",
    role: "Operations Lead",
    company: "PATHZY",
    location: "Johannesburg",
    startDate: "2025",
    endDate: "Present",
    description: "Coordinating delivery operations and release planning.",
    achievements: []
  }
]);
assert.equal(similarRolesAtSameEmployerFixture.length, 2, "Similar roles at the same employer must remain separate canonical Experience records.");
assert.equal(similarRolesAtSameEmployerFixture.map((entry) => entry.role).join(" -> "), "Founder & Product Owner -> Operations Lead", "Distinct Experience role ordering must be preserved after deduplication.");
const staleLegacyAfterSaveValues = professionalIdentityCompletionRuntime.professionalIdentityValuesFromSources(
  completeIdentityProfile,
  {
    answers: {
      ...completeReadinessDiscovery.answers,
      experience_entries: [
        {
          id: "exp-new-current",
          role: "Updated Product Lead",
          company: "New PATHZY Studio",
          location: "Johannesburg",
          startDate: "2026",
          endDate: "Present",
          description: "Leading the refreshed Professional Identity experience after the latest save.",
          achievements: ["Improved source-of-truth persistence."]
        }
      ],
      experience: ["Old Product Assistant | Legacy Company | 2024 - 2025 | This stale experience alias should not render after save."],
      experience_history: ["Old Product Assistant | Legacy Company | 2024 - 2025 | This value should not render after save."],
      personal_background: "Old Product Assistant | Legacy Company | 2024 - 2025 | This value should not render after save."
    }
  },
  { email: "nicka@example.com" }
);
const savedExperienceEntries = professionalIdentityExperienceRuntime.selectCanonicalProfessionalIdentityExperiences(staleLegacyAfterSaveValues.experience);
assert.equal(savedExperienceEntries.length, 1, "After saving edited Experience, Review must read the latest canonical entry rather than old legacy fields.");
assert.equal(savedExperienceEntries[0].role, "Updated Product Lead", "Review must show the new saved Experience value immediately.");
assert.equal(savedExperienceEntries.some((entry) => /Old Product Assistant|Legacy Company/.test(JSON.stringify(entry))), false, "Review must not render stale pre-edit Experience values after save.");
const staleLegacyCvModel = professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity(staleLegacyAfterSaveValues);
const staleLegacyCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel(staleLegacyCvModel, "PATHZY Signature Professional");
assert.match(staleLegacyCvHtml, /Updated Product Lead[\s\S]*New PATHZY Studio/, "CV projection must show the new saved Experience value after returnTo navigation.");
assert.doesNotMatch(staleLegacyCvHtml, /Old Product Assistant|Legacy Company/, "CV projection must not show stale pre-edit Experience values after save.");
const staleLegacyLinkedIn = professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity(staleLegacyAfterSaveValues, { language: "english" });
assert.equal(staleLegacyLinkedIn.experience[0]?.role, "Updated Product Lead", "LinkedIn projection must show the new saved Experience value after returnTo navigation.");
assert.equal(staleLegacyLinkedIn.experience.some((entry) => /Old Product Assistant|Legacy Company/.test(JSON.stringify(entry))), false, "LinkedIn projection must not show stale pre-edit Experience values after save.");
const staleLegacyCoverLetterEvidence = coverLetterIntelligenceRuntime.selectCoverLetterEvidence(staleLegacyAfterSaveValues, { role: "Product Lead", company: "Example Employer", source: "manual", requirements: ["Professional Identity persistence"] });
const staleLegacyCoverLetterExperience = staleLegacyCoverLetterEvidence.selectedEvidence.filter((item) => item.type === "experience");
assert.equal(staleLegacyCoverLetterExperience.length, 1, "Evidence / Why Me must receive the newly saved Experience once after reload.");
assert.match(staleLegacyCoverLetterExperience[0].label, /Updated Product Lead[\s\S]*New PATHZY Studio/, "Evidence / Why Me must use the new canonical Experience label after save.");
assert.doesNotMatch(JSON.stringify(staleLegacyCoverLetterEvidence), /Old Product Assistant|Legacy Company/, "Evidence / Why Me must not receive stale legacy Experience aliases after save.");
const staleLegacyCoverLetterData = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(staleLegacyAfterSaveValues, { role: "Product Lead", company: "Example Employer", source: "manual", requirements: ["Professional Identity persistence"] }, { language: "english", templateName: "PATHZY Signature Letter" });
assert.match(staleLegacyCoverLetterData.evidenceParagraph, /Updated Product Lead[\s\S]*New PATHZY Studio|New PATHZY Studio[\s\S]*Updated Product Lead/, "Cover Letter Evidence / Why Me paragraph must mention the new canonical Experience once.");
assert.doesNotMatch(staleLegacyCoverLetterData.evidenceParagraph, /Old Product Assistant|Legacy Company/, "Cover Letter Evidence / Why Me paragraph must not include stale legacy Experience text.");
assert.equal((staleLegacyCoverLetterData.evidenceParagraph.match(/Updated Product Lead/g) ?? []).length, 1, "Cover Letter Evidence / Why Me must not duplicate the newly saved role.");
const staleLegacyCoverLetterDocument = professionalIdentityCoverLetterModelRuntime.professionalIdentityCoverLetterDocument(staleLegacyAfterSaveValues, { role: "Product Lead", company: "Example Employer", source: "manual", requirements: ["Professional Identity persistence"] }, { language: "english", templateName: "PATHZY Signature Letter", lastUpdated: "2026-08-26T00:00:00.000Z" });
assert.equal(staleLegacyCoverLetterDocument?.contentJson?.coverLetterVersion?.intelligence?.selectedEvidence?.filter((item) => item.type === "experience").length, 1, "Cover Letter generation payload must carry the selected Experience evidence once.");
assert.doesNotMatch(JSON.stringify(staleLegacyCoverLetterDocument?.contentJson), /Old Product Assistant|Legacy Company/, "Cover Letter generation payload must not carry stale legacy Experience text.");
const avolitoIdentityValues = professionalIdentityCompletionRuntime.normalizeProfessionalIdentityCompletionValues({
  ...professionalIdentityCvValues,
  experience: avolitoGreyDuplicateFixture,
  skills: ["Launch planning", "Marketing coordination"],
  projects: [],
  achievements: []
});
const avolitoCvModel = professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity(avolitoIdentityValues);
assert.equal(avolitoCvModel.professionalExperience.length, 1, "CV must receive the AVOLITO Experience once after canonical normalization.");
assert.equal(avolitoCvModel.professionalExperience[0].role, "Co-founder & Marketing Lead", "CV must preserve the AVOLITO role as a structured field.");
assert.equal(avolitoCvModel.professionalExperience[0].company, "AVOLITO Beverages", "CV must preserve the AVOLITO company as a structured field.");
assert.equal(avolitoCvModel.professionalExperience[0].achievements[0].includes("Co-founder & Marketing Lead"), false, "CV body evidence must not repeat the AVOLITO role after source normalization.");
assert.equal(avolitoCvModel.professionalExperience[0].achievements[0].includes("AVOLITO Beverages 2026"), false, "CV body evidence must not repeat the AVOLITO company/date composite after source normalization.");
const avolitoLinkedInProjection = professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity(avolitoIdentityValues, { language: "english" });
assert.equal(avolitoLinkedInProjection.experience.length, 1, "LinkedIn must receive the AVOLITO Experience once after canonical normalization.");
assert.equal(avolitoLinkedInProjection.experience[0].description.includes("Co-founder & Marketing Lead"), false, "LinkedIn description must not repeat the AVOLITO role after source normalization.");
assert.equal(avolitoLinkedInProjection.experience[0].description.includes("AVOLITO Beverages 2026"), false, "LinkedIn description must not repeat the AVOLITO company/date composite after source normalization.");
const avolitoCoverLetterEvidence = coverLetterIntelligenceRuntime.selectCoverLetterEvidence(avolitoIdentityValues, { role: "Marketing Coordinator", company: "Example Employer", source: "manual" });
const avolitoExperienceEvidence = avolitoCoverLetterEvidence.selectedEvidence.filter((item) => item.type === "experience");
assert.equal(avolitoExperienceEvidence.length, 1, "Cover Letter intelligence must receive the AVOLITO Experience once.");
assert.equal(avolitoExperienceEvidence[0].sourceText.includes("Co-founder & Marketing Lead"), true, "Cover Letter intelligence must keep the canonical AVOLITO role label.");
assert.equal(avolitoExperienceEvidence[0].sourceText.includes("AVOLITO Beverages 2026"), false, "Cover Letter intelligence must not receive a legacy AVOLITO composite sentence as source text.");
assert.match(professionalIdentityExperience, /export type ProfessionalIdentityExperienceEntry = \{[\s\S]*role: string;[\s\S]*company: string;[\s\S]*description: string;[\s\S]*achievements: string\[\]/, "Professional Identity must define a structured shared ExperienceEntry contract.");
assert.match(professionalIdentityExperience, /export function selectCanonicalProfessionalIdentityExperiences/, "Professional Identity must expose one shared canonical Experience selector for Review, documents and intelligence.");
assert.match(professionalIdentityPage, /function renderReviewValue[\s\S]*selectCanonicalProfessionalIdentityExperiences\(section\.value\)[\s\S]*experienceEntryDateLabel\(entry\)[\s\S]*Experience[\s\S]*index \+ 1/, "Review My Information must render Professional Identity experience through the shared canonical selector instead of one joined paragraph.");
const structuredCvModel = professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity(structuredIdentityValues);
assert.equal(structuredCvModel.professionalExperience.length, 2, "Two Professional Identity experiences must become two CV experience records.");
assert.equal(structuredCvModel.professionalExperience.map((entry) => entry.role).join(" -> "), "Founder & Product Owner -> Co-founder & Marketing Lead", "CV experience ordering must be preserved.");
assert.equal(structuredCvModel.professionalExperience[0].achievements.includes("Building an employment operating system for guided career support."), true, "CV Experience 1 description must stay attached to Experience 1.");
assert.equal(structuredCvModel.professionalExperience[1].achievements.includes("Coordinating launch planning, brand messaging and early marketing operations."), true, "CV Experience 2 description must stay attached to Experience 2.");
const structuredCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel(structuredCvModel, "PATHZY Signature Professional");
assert.match(structuredCvHtml, /Founder &amp; Product Owner[\s\S]*PATHZY \| Johannesburg \| 2025 \| Present[\s\S]*Building an employment operating system[\s\S]*Co-founder &amp; Marketing Lead[\s\S]*AVOLITO Beverages \| Johannesburg \| 2026 \| Present[\s\S]*Coordinating launch planning/, "Designed CV preview must render each Professional Identity experience separately.");
assert.equal((structuredCvHtml.match(/Founder &amp; Product Owner/g) ?? []).length, 1, "CV must not duplicate Experience 1.");
assert.equal((structuredCvHtml.match(/Co-founder &amp; Marketing Lead/g) ?? []).length, 1, "CV must not duplicate Experience 2.");
const longStructuredCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel({
  ...structuredCvModel,
  professionalExperience: Array.from({ length: 14 }, (_, index) => ({
    ...structuredCvModel.professionalExperience[index % structuredCvModel.professionalExperience.length],
    role: `Structured Role ${index + 1}`,
    achievements: ["Managed a long realistic responsibility narrative with enough detail to require natural document flow across the A4 preview without overlap or clipping."]
  }))
}, "PATHZY Signature Professional");
assert.ok((longStructuredCvHtml.match(/class="cv-render-page-frame"/g) ?? []).length > 1, "Long structured Professional Identity experience must reflow to additional CV pages.");
const problematicCvFixture = {
  ...professionalIdentityCv,
  fullName: "Florent Kalanda",
  targetRole: "Laboratory Technician",
  email: "florent@example.com",
  phone: "+27 11 222 3333",
  city: "Johannesburg",
  country: "South Africa",
  professionalSummary: "Laboratory professional with practical experience in sample processing, records, quality procedures and multidisciplinary team support.",
  coreSkills: ["Sample processing", "Quality control", "Record keeping", "Team communication", "Safety procedures", "Inventory support"],
  technicalSkills: ["Microscopy", "Laboratory information systems", "Specimen preparation", "Equipment maintenance"],
  professionalExperience: [
    {
      role: "Laboratory Technician | Target Laboratory | Johannesburg | 2022 - 2024 | Prepared and processed samples while maintaining quality records for supervisor review | Supported equipment checks and daily laboratory workflow coordination",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      achievements: []
    }
  ],
  education: [
    { qualification: "BTech degree in ICT", institution: "Vaal University of Technology", fieldOfStudy: "Information and Communication Technology | Information Technology", year: "2021", status: "Completed" }
  ],
  certifications: [
    { name: "Good Laboratory Practice", provider: "Training Provider", year: "2023", credentialUrl: "REF. NO. 12345" }
  ],
  references: { availableUponRequest: true, items: [] }
};
const signatureCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel(problematicCvFixture, "PATHZY Signature Professional");
const signatureCvPdf = documentDownloadsRuntime.simplePdfDocumentFromModel("Signature CV", problematicCvFixture, "PATHZY Signature Professional");
assert.match(signatureCvHtml, /data-pathzy-cv-document-root="candidate-cv-only"/, "Designed Preview must render inside a dedicated candidate CV document root.");
assert.equal((signatureCvHtml.match(/class="cv-render-page-frame"/g) ?? []).length, 1, "A normal one-page Signature CV fixture must produce one real A4 page frame.");
assert.match(signatureCvHtml, /Laboratory Technician[\s\S]*Target Laboratory \| Johannesburg \| 2022 - 2024[\s\S]*Prepared and processed samples/, "Experience must render role, metadata and body evidence as separate structured lines.");
assert.doesNotMatch(signatureCvHtml, /Laboratory Technician \| Target Laboratory \| Johannesburg \| 2022 - 2024 \| Prepared/, "Experience renderer must not collapse role, date and body copy into one uncontrolled pipe-delimited line.");
assert.match(signatureCvHtml, /BTech - Information &amp; Communication Technology[\s\S]*Vaal University of Technology \| 2021 \| Completed/, "Education must render normalized qualification and institution metadata separately.");
assert.doesNotMatch(signatureCvHtml, /Information and Communication Technology \| Information Technology/, "Education normalization must suppress overlapping field-of-study duplicates.");
assert.equal((signatureCvHtml.match(/>EDUCATION<\/div>/g) ?? []).length, 1, "Education must appear exactly once in the Signature CV document.");
assert.equal((signatureCvHtml.match(/>CERTIFICATIONS<\/div>/g) ?? []).length, 1, "Certifications must appear exactly once in the Signature CV document.");
assert.equal((signatureCvHtml.match(/LinkedIn:/g) ?? []).length, 1, "LinkedIn must render once in the recruiter-facing header and must not be duplicated in side links.");
assert.doesNotMatch(signatureCvHtml, /Employment Center|Applications|Interview Preparation|Career Analytics|Settings|Logout|Your Mentor/, "Application navigation must never render inside the candidate CV preview root.");
assert.doesNotMatch(signatureCvPdf, /Employment Center|Applications|Interview Preparation|Career Analytics|Settings|Logout|Your Mentor/, "PDF export must never contain PATHZY application chrome.");
assert.doesNotMatch(signatureCvHtml, /salary|employment diagnosis|PATHZY score|work authorization|nationality/i, "Internal employment intelligence and sensitive profile fields must be excluded from the recruiter-facing Signature CV by default.");
const unseparatedSignatureCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel({
  ...problematicCvFixture,
  coreSkills: ["Communication", "Communication"],
  professionalSkills: ["Communication", "Record keeping"],
  technicalSkills: ["Communication", "Laboratory information systems"],
  professionalExperience: [
    {
      role: "Co-founder & Marketing Lead AVOLITO Beverages 2026 Present Contributing to the development of a beverage business through marketing coordination and launch planning.",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      achievements: []
    }
  ],
  projects: [],
  achievements: []
}, "PATHZY Signature Professional");
assert.match(unseparatedSignatureCvHtml, /Co-founder &amp; Marketing Lead[\s\S]*AVOLITO Beverages \| 2026 - Present[\s\S]*Contributing to the development/, "Unseparated imported experience must be parsed into role, organization, date and evidence lines.");
assert.doesNotMatch(unseparatedSignatureCvHtml, /Co-founder &amp; Marketing Lead AVOLITO Beverages 2026 Present Contributing/, "Unseparated imported experience must not render as one collapsed title line.");
assert.equal((unseparatedSignatureCvHtml.match(/>Communication<\/div>/g) ?? []).length, 1, "Duplicate skills from the canonical model must render once in the Signature CV.");
assert.doesNotMatch(unseparatedSignatureCvHtml, />PROJECTS<\/div>|>ACHIEVEMENTS<\/div>/, "Empty optional Signature CV sections must not render placeholder headings.");
const longSignatureCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel({
  ...problematicCvFixture,
  professionalExperience: Array.from({ length: 10 }, (_, index) => ({
    role: `Operations Coordinator ${index + 1}`,
    company: "Example Organisation",
    location: "Remote",
    startDate: "2020",
    endDate: "2024",
    current: false,
    achievements: [
      "Coordinated detailed weekly reporting, stakeholder updates, records, schedules, issue tracking and follow-through across a busy operational environment with changing priorities."
    ]
  }))
}, "PATHZY Signature Professional");
assert.ok((longSignatureCvHtml.match(/class="cv-render-page-frame"/g) ?? []).length > 1, "Long Signature CV content must create additional A4 pages instead of overlapping or compressing text.");
assert.match(professionalIdentityTool, /border border-\[#f2d3c2\]\/16 bg-\[#121411\] p-5 text-\[#fffaf2\][\s\S]*Your CV is ready[\s\S]*text-\[#fffaf2\][\s\S]*Create your cover letter[\s\S]*text-\[#e7ded0\]\/82/, "The CV next-step card must keep readable light text on its dark premium surface.");
const completeDiagnosisDiscovery = {
  answers: {
    ...completeReadinessDiscovery.answers,
    identity_review_completed: true,
    identity_reviewed: true,
    setup_finished: true,
    setup_completed: true,
    employment_diagnosis_status: "complete",
    employment_diagnosis_completed: true,
    diagnosis_completed: true,
    pathzy_onboarding_state: "diagnosis_completed"
  }
};
const routeDecisionCases = [
  {
    name: "unauthenticated",
    input: { authenticated: false, requestedDestination: "/applications" },
    state: "unauthenticated",
    destination: "/login?redirectTo=%2Fapplications"
  },
  {
    name: "language pending",
    input: { authenticated: true, interfaceLanguageSelected: false, profile: completeIdentityProfile, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "welcome_completed" } } },
    state: "interface_language_pending",
    destination: "/professional-identity?stage=interfaceLanguage"
  },
  {
    name: "identity not started",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: null, discovery: null, user: { email: null } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new account row only",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com" }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new account with default language metadata",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english" }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new account with legacy default onboarding step",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "English", onboarding_step: 1 }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new French account with legacy default onboarding step",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "fr", onboarding_step: 1 }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new account with empty professional identity compatibility row",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "English", onboarding_step: 1, professional_identity_score: 9, cv_status: "not_started" }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "new account with empty canonical compatibility row",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "English", onboarding_step: 1, current_version: 1, completion_percentage: 9 }, discovery: { answers: {} } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "empty user profile row",
    input: { authenticated: true, profile: { full_name: null, email: null, language: null }, discovery: { answers: {} }, user: { email: "new@example.com" } },
    state: "welcome_pending",
    destination: "/professional-identity?stage=welcome"
  },
  {
    name: "welcome complete only",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "welcome_completed" } } },
    state: "interface_language_pending",
    destination: "/professional-identity?stage=interfaceLanguage"
  },
  {
    name: "interface language complete",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "interface_language_completed", interface_language: "english" } } },
    state: "document_language_pending",
    destination: "/professional-identity?stage=documentLanguage"
  },
  {
    name: "document language complete",
    input: { authenticated: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "document_language_completed", interface_language: "english", professional_document_language: "same_as_interface" } } },
    state: "coach_intro_pending",
    destination: "/professional-identity?stage=careerCoach"
  },
  {
    name: "Professional Identity introduction pending after Career Coach",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "coach_intro_completed", professional_document_language: "same_as_interface", career_coach_intro_seen: true } } },
    state: "professional_identity_intro_pending",
    destination: "/professional-identity?stage=professionalIdentityIntroduction"
  },
  {
    name: "legacy readiness answers do not skip the Professional Identity introduction",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "coach_intro_completed", professional_document_language: "same_as_interface", career_coach_intro_seen: true, employment_readiness_check: { current_situation: "First-time job seeker" }, employment_readiness_check_step: 1, employment_readiness_check_status: "in_progress" } } },
    state: "professional_identity_intro_pending",
    destination: "/professional-identity?stage=professionalIdentityIntroduction"
  },
  {
    name: "Professional Identity introduction complete before identity fields",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: { language: "english" }, discovery: { answers: { welcome_completed: true, pathzy_onboarding_state: "professional_identity_intro_completed", interface_language: "english", professional_document_language: "same_as_interface", career_coach_intro_seen: true, professional_identity_intro_seen: true } } },
    state: "identity_not_started",
    destination: "/professional-identity?section=profile"
  },
  {
    name: "identity partially complete",
    input: { authenticated: true, interfaceLanguageSelected: true, profile: { full_name: "Nicka Candida", email: "nicka@example.com", language: "english", onboarding_step: 2 }, discovery: completeReadinessDiscovery },
    state: "identity_in_progress",
    destination: "/professional-identity?section=profile"
  },
  {
    name: "identity ready for review",
    input: { authenticated: true, profile: completeIdentityProfile, discovery: completeReadinessDiscovery },
    state: "identity_review_pending",
    destination: "/professional-identity?review=1"
  },
  {
    name: "finish pending",
    input: { authenticated: true, profile: completeIdentityProfile, discovery: completeReadinessDiscovery, reviewCompleted: true, setupFinished: false },
    state: "identity_finish_pending",
    destination: "/professional-identity?finish=1"
  },
  {
    name: "returning completed setup goes home",
    input: { authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true }, discovery: completeReadinessDiscovery, diagnosisComplete: false },
    state: "home_ready",
    destination: "/roadmap"
  },
  {
    name: "post setup completion cannot fall back to public landing",
    input: { authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true }, discovery: completeReadinessDiscovery, requestedDestination: "/" },
    state: "home_ready",
    destination: "/roadmap"
  },
  {
    name: "home ready",
    input: { authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true }, discovery: completeDiagnosisDiscovery, requestedDestination: "/employment-center" },
    state: "home_ready",
    destination: "/employment-center"
  },
  {
    name: "diagnosis completion stored in discovery",
    input: {
      authenticated: true,
      profile: { ...completeIdentityProfile, onboarding_completed: true },
      discovery: {
        answers: {
          ...completeReadinessDiscovery.answers,
          identity_reviewed: true,
          setup_completed: true,
          employment_diagnosis_status: "complete",
          employment_diagnosis_completed: true,
          diagnosis_completed: true,
          pathzy_onboarding_state: "diagnosis_completed"
        }
      },
      requestedDestination: "/roadmap"
    },
    state: "home_ready",
    destination: "/roadmap"
  },
  {
    name: "home ready with optional identity gaps",
    input: {
      authenticated: true,
      profile: { ...completeIdentityProfile, onboarding_completed: true },
      discovery: {
        answers: {
          ...completeReadinessDiscovery.answers,
          identity_review_completed: true,
          setup_finished: true,
          diagnosis_completed: true,
          employment_diagnosis_completed: true,
          pathzy_onboarding_state: "diagnosis_completed",
          professional_summary: "",
          projects: [],
          references: []
        }
      }
    },
    state: "home_ready",
    destination: "/roadmap"
  },
  {
    name: "unsafe completed return",
    input: { authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true }, discovery: completeDiagnosisDiscovery, requestedDestination: "https://evil.example/app" },
    state: "home_ready",
    destination: "/roadmap"
  },
  {
    name: "home ready public landing return",
    input: { authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true }, discovery: completeDiagnosisDiscovery, requestedDestination: "/" },
    state: "home_ready",
    destination: "/roadmap"
  }
];
for (const routeCase of routeDecisionCases) {
  const decision = authRoutingRuntime.resolvePathzyNextRoute(routeCase.input);
  assert.equal(decision.currentState, routeCase.state, `Onboarding resolver must identify ${routeCase.name}.`);
  assert.equal(decision.destination, routeCase.destination, `Onboarding resolver must route ${routeCase.name} correctly.`);
  assert.equal(Boolean(decision.reason), true, `Onboarding resolver must explain ${routeCase.name}.`);
  assert.doesNotMatch(decision.destination, /cover-letter/, `Cover Letter must never appear as onboarding next action for ${routeCase.name}.`);
}
assert.equal(
  authRoutingRuntime.resolvePathzyNextRoute({ authenticated: true, profile: completeIdentityProfile, discovery: { answers: { ...completeReadinessDiscovery.answers, skills: [], professional_summary: "" } } }).currentState,
  "identity_in_progress",
  "Missing required fields must block setup."
);
assert.equal(
  authRoutingRuntime.resolvePathzyNextRoute({ authenticated: true, profile: { ...completeIdentityProfile, onboarding_completed: true, career_goal: "" }, discovery: completeReadinessDiscovery }).destination,
  "/roadmap",
  "Returning users with completed setup must go to Home even when Professional Identity can still be improved."
);
const availabilityWithoutPreferenceDecision = authRoutingRuntime.resolvePathzyNextRoute({
  authenticated: true,
  profile: completeIdentityProfile,
  discovery: { answers: { ...completeReadinessDiscovery.answers, employment_type: "", preferred_roles: [], industries: [], work_type: "", availability: "Immediately" } }
});
assert.equal(availabilityWithoutPreferenceDecision.currentState, "identity_in_progress", "Availability alone must not complete Employment Preferences.");
assert.equal(availabilityWithoutPreferenceDecision.destination, "/professional-identity?section=employment_preferences", "Users with Availability but no employment preference must be routed to the exact missing section.");
assert.equal(
  authRoutingRuntime.resolvePathzyNextRoute({ authenticated: true, profile: completeIdentityProfile, discovery: completeReadinessDiscovery }).currentState,
  "identity_review_pending",
  "Missing optional sections must not permanently block setup."
);
assert.equal(
  authRoutingRuntime.resolvePathzyNextRoute({
    authenticated: true,
    profile: { ...completeIdentityProfile, current_status: null, employment_status: null },
    discovery: { answers: { ...completeReadinessDiscovery.answers, current_status: "Diplômé", employment_status: "graduate" } }
  }).currentState,
  "identity_review_pending",
  "A persisted current situation in the Professional Identity compatibility row must survive refresh/logout-login and keep routing out of step 1."
);
assert.match(generateRoadmapApi, /mode === "complete"[\s\S]*buildEmploymentDiagnosisResult\(nextSession\)[\s\S]*recomputeEmploymentIntelligence[\s\S]*redirectTo: appRoutes\.diagnosisResults/, "Adaptive Employment Diagnosis completion must persist a structured result and route to persisted Diagnosis Results.");
assert.match(professionalIdentityWriteService, /diagnosis_completed: true[\s\S]*pathzy_onboarding_state: "diagnosis_completed"/, "The single Professional Identity write service must persist the canonical home-ready diagnosis state.");
assert.match(professionalIdentityDiscoveryCompatibility, /professionalIdentityCompatibilityScore[\s\S]*employment_diagnosis[\s\S]*-1000[\s\S]*selectProfessionalIdentityDiscoveryRow[\s\S]*professionalIdentityCompatibilityScore\(row\) >= 0/, "Professional Identity reads must not allow a diagnosis row to mask identity data.");
assert.match(professionalIdentityReadService, /selectProfessionalIdentityDiscoveryRow[\s\S]*selectEmploymentDiagnosisDiscoveryRow[\s\S]*diagnosisWorkflowFlags/, "Professional Identity reads may merge diagnosis workflow flags without using diagnosis answers as identity data.");
assert.match(professionalIdentityWriteService, /selectProfessionalIdentityDiscoveryRow[\s\S]*withProfessionalIdentityRecordType[\s\S]*update\(payload\)/, "Professional Identity writes must target the selected identity compatibility row instead of the newest arbitrary discovery row.");
assert.match(adaptiveDiagnosisSource, /withEmploymentDiagnosisRecordType[\s\S]*employment_diagnosis_session[\s\S]*employment_diagnosis_result/, "Employment Diagnosis persistence must write a diagnosis-marked session/result rather than replacing Professional Identity answers.");
assert.match(discoveryFlow, /nextPayload\.redirectTo \?\? appRoutes\.authenticatedHome/, "Employment Diagnosis must follow the API's canonical post-completion redirect.");
assert.doesNotMatch(discoveryFlow, /router\.replace\(appRoutes\.roadmap\)/, "Employment Diagnosis must not hardcode a route that can drift from the canonical Home route.");

for (const section of ["Navigation", "Hero", "Features", "How PATHZY Works", "Career Journey", "Testimonials", "FAQ", "Footer"]) {
  assert.match(landingContent, new RegExp(`data-home-section="${section}"`), `Homepage must include the ${section} landing section.`);
}
assert.doesNotMatch(landingContent, /data-home-section="Pricing"|id="pricing"|public\.nav\.pricing|#pricing|content\.pricing/, "Public landing must not render Pricing/Tarifs navigation or a public pricing section.");
assert.match(landingContent, /Do not remove landing sections without updating homepage regression test\./, "Homepage must warn maintainers to update the regression test before removing landing sections.");
assert.match(landingContent, /export const PATHZY_PUBLIC_BRAND = "PATHZY"/, "Public header brand must use one canonical PATHZY brand constant.");
assert.match(landingContent, /function PublicBrandMark\(\)[\s\S]*\{PATHZY_PUBLIC_BRAND\}/, "Public header must render the canonical brand through the shared brand mark.");
assert.doesNotMatch(landingContent, /PATHZY\.ai|pathzy\.ai|PATHZYAI|PATHZY AI|PATHY/, "Public header source must never render PATHZY.ai, pathzy.ai, PATHZYAI, PATHZY AI, or PATHY.");
assert.match(pathzyI18n, /"public\.nav\.home": "Home"[\s\S]*"public\.nav\.home": "Accueil"/, "Public navigation must translate Home to Accueil from the shared dictionary.");
assert.match(homepage, /const startHref = user \? PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES\.SIGNUP;/, "Welcome Start Free must send logged-out users to signup and logged-in users to My Employment Journey.");
assert.match(homepage, /const loginHref = user \? PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES\.LOGIN;/, "Welcome Login must send logged-out users to login and logged-in users to My Employment Journey.");
assert.match(landingContent, /<a href=\{startHref\}[\s\S]*>\{t\("public\.nav\.start"\)\}<\/a>/, "Welcome navigation must include a translated Start Free link.");
assert.match(landingContent, /<a href=\{loginHref\}[\s\S]*>\{t\("public\.nav\.login"\)\}<\/a>/, "Welcome navigation must include a translated Login link.");
assert.match(landingContent, /<LanguageSelector persistAuthenticated=\{false\}/, "Public landing page must expose a pre-auth EN/FR language selector.");
assert.match(landingContent, /const navItems = \[[\s\S]*\[t\("public\.nav\.home"\), "#top"\][\s\S]*\[t\("public\.nav\.features"\), "#features"\]/, "Public header must keep Home/Accueil as the first navigation item after the PATHZY brand.");
assert.doesNotMatch(landingContent, /\[t\("public\.nav\.pricing"\), "#pricing"\]/, "Public header must not include Pricing/Tarifs in English or French navigation.");
assert.match(landingContent, /hidden min-w-0 flex-1 items-center justify-start gap-1\.5 pl-3 xl:flex[\s\S]*aria-current=\{href === "#top" \? "page" : undefined\}[\s\S]*whitespace-nowrap rounded-full px-3 py-2 text-\[0\.78rem\]/, "Public landing secondary navigation must only use the full desktop row when there is enough width and keep Home/Accueil visibly active.");
assert.match(landingContent, /aria-expanded=\{menuOpen\}[\s\S]*aria-controls=\{menuId\}[\s\S]*xl:hidden/, "Public landing must expose an accessible responsive menu instead of squeezing translated navigation labels.");
assert.match(landingContent, /event\.key !== "Escape"[\s\S]*menuButtonRef\.current\?\.focus\(\)[\s\S]*window\.addEventListener\("keydown", onKeyDown\)/, "Public landing responsive menu must close with Escape and restore focus to the trigger.");
assert.match(landingContent, /LanguageSelector persistAuthenticated=\{false\}[\s\S]*href=\{startHref\}[\s\S]*min-h-10[\s\S]*href=\{loginHref\}[\s\S]*min-h-10[\s\S]*aria-expanded=\{menuOpen\}/, "Public landing must keep compact language selector, primary CTA, login and menu trigger visible in the header priority group.");
assert.match(landingContent, /<PublicBrandMark \/>[\s\S]*navItems\.map[\s\S]*<LanguageSelector persistAuthenticated=\{false\}/, "Public header must use the same brand, navigation, language and action structure for English and French.");
assert.match(landingContent, /menuPanelRef[\s\S]*navItems\.map[\s\S]*aria-current=\{href === "#top" \? "page" : undefined\}/, "Responsive menu must retain Home/Accueil and its visible active state.");
assert.match(landingContent, /sm:hidden[\s\S]*\{t\("public\.nav\.start"\)\}[\s\S]*sm:hidden[\s\S]*\{t\("public\.nav\.login"\)\}/, "Responsive menu must include compact Start/Commencer and Login/Connexion actions when header space is tight.");
assert.match(landingContent, /min-w-\[7\.5rem\][\s\S]*tracking-\[0\.14em\]/, "PATHZY brand mark must preserve spacing so the Z remains visually distinct from the Y and first nav item.");
assert.match(landingContent, /min-h-\[clamp\(30rem,calc\(100svh-8rem\),42rem\)\]/, "Public landing hero must use content-aware viewport height instead of rigid full-screen sizing.");
assert.match(landingContent, /text-\[clamp\(3rem,7vw,6\.35rem\)\][\s\S]*max-w-\[48rem\]/, "Public landing hero must use fluid typography and a readable body max width for English and French.");
assert.match(pathzyI18n, /De votre potentiel à l'emploi\./, "Public French landing headline must be translated from the shared dictionary.");
assert.doesNotMatch(`${homepage}\n${landingContent}`, /href=\{appRoutes\.pricing\}|href=\{PATHZY_ROUTES\.BILLING\}|href="\/pricing"|href="\/billing"/, "Welcome Start Free/Login actions must not point to Pricing or Billing.");
assert.match(pricingPage, /redirect\(routeBuilders\.login\("\/billing"\)\)/, "Legacy public /pricing must redirect through login to authenticated Billing instead of rendering public subscription details.");
assert.match(signupPage, /<SignupContent \/>/, "Canonical /signup must render the translated signup content.");
assert.match(signupContent, /<RegisterForm \/>/, "Translated signup content must own the account creation form.");
assert.match(signupContent, /<LanguageSelector persistAuthenticated=\{false\}/, "Signup must expose a pre-auth EN/FR language selector.");
assert.match(loginContent, /<LanguageSelector persistAuthenticated=\{false\}/, "Login must expose a pre-auth EN/FR language selector.");
assert.match(loginForm, /redirectTo = searchParams\?\.get\("redirectTo"\) \|\| PATHZY_ROUTES\.HOME/, "Login must default to authenticated Home.");
assert.match(loginForm, /fetch\("\/api\/auth\/bootstrap"[\s\S]*body: JSON\.stringify\(\{ redirectTo \}\)/, "Login must use the shared bootstrap redirect decision.");
assert.match(loginForm, /encodeURIComponent\(PATHZY_ROUTES\.HOME\)/, "Google login callback must default to authenticated Home.");
assert.match(registerForm, /const welcomeDestination = routeBuilders\.professionalIdentityWelcome\(\);/, "Signup must resolve the first-time Welcome destination through the route builder.");
assert.match(registerForm, /emailRedirectTo: `\$\{window\.location\.origin\}\/auth\/callback\?next=\$\{encodeURIComponent\(welcomeDestination\)\}`/, "Signup confirmation must send new users to the Welcome stage.");
assert.match(registerForm, /window\.location\.replace\(welcomeDestination\)/, "Immediate signup sessions must enter the Welcome stage with a full navigation after auth cookie changes.");
assert.doesNotMatch(registerForm, /name="country"|name="age"|name="education"|name="current_status"/, "Signup must collect only full name, email, and password before account creation.");
assert.match(registerForm, /friendlyAuthError\(caught, "signup", language\)/, "Signup must normalize thrown network failures through the shared auth error helper.");
assert.match(registerForm, /finally \{[\s\S]*setLoading\(false\);[\s\S]*\}/, "Signup loading state must reset after failures so the user can retry.");
assert.match(registerForm, /disabled=\{loading \|\| !isSupabaseConfigured\(\)\}/, "Signup submit must prevent duplicate requests while loading or misconfigured.");
assert.match(loginForm, /friendlyAuthError\(caught, "login", language\)/, "Login must normalize thrown network failures through the shared auth error helper.");
assert.match(loginForm, /friendlyAuthError\(caught, "oauth", language\)/, "OAuth login must normalize thrown network failures through the shared auth error helper.");
assert.match(loginForm, /window\.location\.replace\(destination\)/, "Login must use full navigation after auth cookie changes instead of a client RSC transition.");
assert.match(loginForm, /finally \{[\s\S]*setLoading\(false\);[\s\S]*\}/, "Login loading state must reset after failures so the user can retry.");
assert.match(loginForm, /disabled=\{loading \|\| !isSupabaseConfigured\(\)\}/, "Login submit must prevent duplicate requests while loading or misconfigured.");
assert.doesNotMatch(loginForm, /console\.info\("\[PATHZY auth\] Starting email\/password login", \{ email \}\)/, "Login diagnostics must not log user email addresses.");
assert.doesNotMatch(`${registerForm}\n${loginForm}\n${authFormErrors}`, /NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|sb_publishable_|eyJ[a-zA-Z0-9_-]+/g, "Auth form source must not render or log secret/public key values.");
assert.match(authCallback, /const rawNext = requestUrl\.searchParams\.get\("next"\);[\s\S]*safeRedirectDestination\(rawNext, PATHZY_ROUTES\.HOME\)/, "Auth callback must default to authenticated Home through a sanitized destination.");
assert.match(authCallback, /getPostAuthDestination\(supabase!, session\.user, next\)/, "Auth callback must use the shared Professional Identity/Home post-auth decision.");
assert.match(supabaseMiddleware, /getPostAuthDestination\(supabase, user, appRoutes\.authenticatedHome\)/, "Logged-in users opening auth pages must use the shared Professional Identity/Home decision.");
assert.match(onboardingPage, /redirect\(profile\?\.onboarding_completed \? appRoutes\.authenticatedHome : appRoutes\.professionalIdentity\)/, "Legacy onboarding route must redirect into the Professional Identity-first flow or Home.");
assert.match(onboardingApi, /redirectTo: PATHZY_ROUTES\.PROFESSIONAL_IDENTITY/, "Legacy onboarding completion API must return users to Professional Identity instead of a CV-first flow.");
assert.match(onboardingFlow, /router\.replace\(data\.redirectTo \?\? PATHZY_ROUTES\.PROFESSIONAL_IDENTITY\)/, "Legacy onboarding UI fallback must return to Professional Identity.");
assert.match(updatePasswordForm, /router\.replace\(PATHZY_ROUTES\.HOME\)/, "Password update should return to authenticated Home.");
assert.match(resetPasswordForm, /href=\{PATHZY_ROUTES\.LOGIN\}/, "Reset password should link back to canonical Login.");
assert.match(resetPasswordForm, /PATHZY_ROUTES\.AUTH_CALLBACK[\s\S]*PATHZY_ROUTES\.RESET_PASSWORD/, "Password reset links must use canonical auth callback and reset routes.");
assert.doesNotMatch(`${homepage}\n${loginForm}\n${registerForm}\n${authCallback}\n${onboardingPage}\n${onboardingApi}\n${onboardingFlow}\n${supabaseMiddleware}\n${updatePasswordForm}`, /\/dashboard/, "Welcome/auth/onboarding entry flow must not use the old dashboard route.");
assert.doesNotMatch(rootLayout, /AppShell/, "Public root layout must not wrap the landing page in the authenticated app shell.");
assert.match(supabaseServer, /requireAuthenticatedUser\(redirectTo: string = appRoutes\.authenticatedHome\)/, "Protected-route login fallback must default to canonical authenticated Home.");
assert.match(redirects, /return appRoutes\.authenticatedHome;/, "Unknown authenticated redirect states must not fall back to the legacy dashboard.");
assert.match(redirects, /safePostAuthDestination\(next, appRoutes\.authenticatedHome\)/, "Post-auth redirect fallback must sanitize intended routes through the shared helper.");
assert.match(authRouting, /firstIncompleteProfessionalIdentitySection/, "Auth routing must centralize incomplete Professional Identity detection.");
for (const section of ["profile", "personal_information", "location", "nationality", "work_authorization", "career_goal", "education", "skills", "preferences", "employment_preferences", "availability"]) {
  assert.match(professionalIdentityCompletion, new RegExp(`key: "${section}"[\\s\\S]*importance: "required"`), `Post-auth Professional Identity routing must be able to resume ${section} through the shared completion engine.`);
}
assert.match(authRouting, /resolvePathzyNextRoute[\s\S]*routeBuilders\.professionalIdentitySection\(resumeSection\)/, "Incomplete Professional Identity users must resume the correct section.");
assert.match(authRouting, /currentState === "welcome_pending"[\s\S]*routeBuilders\.professionalIdentityWelcome\(\)/, "Brand-new users must enter the Welcome stage instead of jumping to identity fields.");
assert.match(authRouting, /currentState === "interface_language_pending"[\s\S]*professionalIdentityOnboardingStage\("interfaceLanguage"\)/, "Users who completed Welcome only must resume at Interface Language.");
assert.match(authRouting, /currentState === "document_language_pending"[\s\S]*professionalIdentityOnboardingStage\("documentLanguage"\)/, "Users who selected interface language must resume at Professional Document Language.");
assert.match(authRouting, /currentState === "coach_intro_pending"[\s\S]*professionalIdentityOnboardingStage\("careerCoach"\)/, "Users who completed language setup must resume at Career Coach introduction.");
assert.match(authRouting, /resolvePathzyNextRoute[\s\S]*routeBuilders\.professionalIdentityReview\(\)/, "Required-complete users must be routed to Review My Information before Home.");
assert.match(authRouting, /safePostAuthDestination\(input\.requestedDestination, appRoutes\.authenticatedHome\)/, "Complete users must return to a safe intended route or Home.");
assert.match(authRouting, /pathname === appRoutes\.home[\s\S]*return fallback/, "Authenticated post-setup routing must never treat the public landing page as a valid completed-user destination.");
assert.match(authRouting, /routeMatches\(destinationPathname, appRoutes\.billing\)[\s\S]*appRoutes\.foundingMembers[\s\S]*appRoutes\.pricing[\s\S]*return appRoutes\.authenticatedHome/, "Founder, pricing, and billing routes must not intercept post-auth defaults.");
assert.match(supabaseMiddleware, /const intendedPath = `\$\{request\.nextUrl\.pathname\}\$\{request\.nextUrl\.search\}`/, "Protected route redirects must preserve the intended path and query string.");
assert.match(supabaseMiddleware, /isProtected && user && path !== appRoutes\.professionalIdentity[\s\S]*getPostAuthDestination\(supabase, user, intendedPath\)/, "Protected authenticated routes must use centralized Professional Identity completion coverage.");
assert.match(professionalIdentityPage, /searchParams[\s\S]*resolvedSection = params\.section \?\? \(routeDecision\.currentState === "identity_in_progress" \? routeDecision\.resumeSection : undefined\)[\s\S]*initialSection=\{resolvedSection\}/, "Professional Identity must pass the canonical resume section to the existing editor.");
assert.match(professionalIdentityPage, /professionalIdentityIntroStages[\s\S]*"welcome"[\s\S]*"interfaceLanguage"[\s\S]*"documentLanguage"[\s\S]*"careerCoach"[\s\S]*"professionalIdentityIntroduction"/, "Professional Identity page must recognize every focused onboarding stage.");
assert.match(professionalIdentityPage, /routeDecision = resolvePathzyNextRoute[\s\S]*setupRouteStates[\s\S]*diagnosis_pending[\s\S]*home_ready[\s\S]*redirect\(routeDecision\.destination\)/, "Professional Identity page must redirect setup-complete users through the canonical diagnosis/home resolver instead of rendering a stale overview.");
assert.match(professionalIdentityPage, /setupComplete && requestedStage[\s\S]*redirect\(appRoutes\.professionalIdentity\)/, "Completed users must not repeat a stale Welcome or setup stage URL.");
assert.match(professionalIdentityPage, /stageForState[\s\S]*welcome_pending: "welcome"[\s\S]*professional_identity_intro_pending: "professionalIdentityIntroduction"/, "Professional Identity page must render first-time setup mode from resolver state even before a redirect completes.");
assert.match(professionalIdentityPage, /resolvedStage = requestedStage \?\? stageForState\[routeDecision\.currentState\][\s\S]*showEditor = Boolean\(resolvedSection \|\| resolvedStage\)/, "First-time resolver states must select the guided editor, not the returning-user overview.");
assert.match(professionalIdentityPage, /identityProgressStarted[\s\S]*completionPercent = identityProgressStarted \? rawCompletionPercent : 0/, "New users must show 0% Professional Identity progress until identity setup has actually started.");
assert.match(professionalIdentityCompletion, /professionalIdentityCompletionSections[\s\S]*key: "profile"[\s\S]*key: "availability"/, "Professional Identity completion must define the locked 23-section model in one shared engine.");
assert.equal((professionalIdentityCompletion.match(/key: "/g) ?? []).length, 23, "Professional Identity completion must keep exactly 23 sections.");
assert.match(professionalIdentityCompletion, /calculateProfessionalIdentityCompletion\(values[\s\S]*Math\.round\(\(completedSections \/ sections\.length\) \* 100\)/, "Professional Identity completion percentage must be calculated once from the shared 23-section engine.");
assert.match(professionalIdentityReadService, /loadProfessionalIdentitySources[\s\S]*from\("user_profiles"\)[\s\S]*from\("discovery_responses"\)/, "Phase 2.6 read service must centralize the transitional Professional Identity source rows.");
assert.doesNotMatch(professionalIdentityReadService, /\.select\("[^"]*(setup_finished|identity_review_completed|employment_diagnosis_completed)[^"]*"\)/, "Professional Identity profile reads must not select workflow flags that do not exist on user_profiles.");
assert.doesNotMatch(authRouting, /profile\?\.(setup_finished|identity_review_completed|employment_diagnosis_completed)/, "Workflow resolver must read setup, review and diagnosis completion from discovery-owned state, not missing user_profiles columns.");
assert.match(professionalIdentityReadService, /professionalIdentityValuesFromSources\(profile, discovery, user\)[\s\S]*calculateProfessionalIdentityCompletion\(values\)[\s\S]*professionalIdentityRequiredChecksFromValues\(values\)/, "Phase 2.6 read service must expose one hydrated identity state, completion and required-check model.");
assert.match(professionalIdentityPage, /getProfessionalIdentityReadModel\(supabase, user\)[\s\S]*values: professionalIdentityValues[\s\S]*completion: identityCompletion[\s\S]*requiredChecks/, "Review and Editor must consume the shared Professional Identity read model instead of rebuilding profile state locally.");
assert.match(professionalIdentityReadService, /noStore\(\)[\s\S]*loadProfessionalIdentitySources\(supabase, user\.id\)/, "Professional Identity Review reads must bypass stale route cache before loading the canonical profile and discovery sources.");
assert.match(profileActionEditor, /calculateProfessionalIdentityCompletion\(values\)[\s\S]*progress = identityCompletion\.percentage/, "The guided editor must use the same shared completion percentage as Review.");
assert.match(profileActionEditor, /professionalIdentityMissingFields\(step\.key as ProfessionalIdentityCompletionSectionKey, values\)/, "Disabled Continue guidance must use the shared missing-field engine.");
assert.match(authRouting, /loadProfessionalIdentitySources\(supabase, user\.id\)/, "Post-auth routing must load Professional Identity through the shared read service.");
assert.match(authRouting, /professionalIdentityRequiredChecksFromValues\(professionalIdentityValuesFromSources\(profile, discovery, user\)\)/, "Returning-user routing must use the shared Professional Identity required-check engine.");
assert.doesNotMatch(professionalIdentityPage, /score\?\.totalScore[\s\S]*requiredChecks\.filter\(\(item\) => item\.complete\)\.length \/ requiredChecks\.length\) \* 72/, "Professional Identity completion must not fall back to the old mixed document-score/required-check formula that caused percentage drops after login.");
assert.match(professionalIdentityPage, /initialIntroStage=\{resolvedStage \?\? undefined\}/, "Professional Identity must preserve explicit and resolver-derived focused onboarding stages including stage=welcome.");
assert.match(profileActionEditor, /sectionAliases[\s\S]*requestedStep[\s\S]*requestedIndex/, "Professional Identity editor must open the requested unfinished guided section.");
assert.match(profileActionEditor, /normalizePathzyError/, "Professional Identity editor must normalize non-Error save failures before showing user-facing messages.");
assert.match(professionalIdentityAutosave, /const persistStep = useCallback[\s\S]*try \{[\s\S]*fetch\("\/api\/professional-profile"[\s\S]*catch \(caught\)[\s\S]*normalizePathzyError\(caught, pathzyT\(activeLanguage, "onboarding\.save\.error"\)\)/, "Professional Identity autosave must catch rejected browser events in the shared client save pipeline instead of leaking them to the dev overlay.");
assert.match(profileActionEditor, /async function finishSetup\(\)[\s\S]*try \{[\s\S]*fetch\("\/api\/professional-profile"[\s\S]*catch \(caught\)[\s\S]*normalizePathzyError\(caught, pathzyPhase2T\(language, "identity\.finish\.failure"\)\)/, "Professional Identity finish setup must catch rejected browser events instead of leaking them to the dev overlay.");
assert.match(professionalProfileApi, /finishProfessionalIdentitySetupWrite[\s\S]*loadProfessionalIdentitySources\(supabase, user\.id\)[\s\S]*resolvePathzyNextRoute/, "Finish Setup must return the canonical workflow resolver destination after completion.");
assert.match(profileActionEditor, /router\.push\(typeof data\.redirectTo === "string" \? data\.redirectTo : `\$\{appRoutes\.discovery\}\?reason=setup-complete`\)[\s\S]*window\.setTimeout\(\(\) => router\.refresh\(\), 0\)/, "Finish Setup fallback must continue to Employment Diagnosis and refresh the destination instead of leaving stale authenticated state.");
assert.match(professionalProfileApi, /Cache-Control", "no-store"/, "Professional Identity save responses must not be cached after successful or failed saves.");
assert.match(professionalProfileApi, /revalidateProfessionalIdentityReview[\s\S]*"\/professional-identity"[\s\S]*"\/professional-identity\/review"[\s\S]*"\/professional-identity\/cv"[\s\S]*"\/professional-identity\/cover-letter"[\s\S]*"\/professional-identity\/linkedin"[\s\S]*"\/discovery\/results"[\s\S]*"\/roadmap"[\s\S]*"\/opportunities"[\s\S]*"\/applications"/, "Saving Professional Identity must invalidate Review, document projections, Employment Intelligence, Opportunities and Applications.");
assert.match(professionalIdentityReadService, /\.select\("id,answers,generated_result,created_at"\)[\s\S]*\.order\("created_at", \{ ascending: false \}\)/, "Professional Identity reads must use the indexed discovery freshness column instead of stale compatibility ordering.");
assert.match(professionalIdentityWriteService, /const refreshedAt = new Date\(\)\.toISOString\(\)[\s\S]*created_at: refreshedAt[\s\S]*\.update\(payload\)/, "Professional Identity saves must refresh the compatibility row timestamp so later reads pick up the newest saved value without a new migration.");
assert.match(profileActionEditor, /const returnDestination = returnTo === "review"[\s\S]*safeRedirectDestination\(returnTo, appRoutes\.professionalIdentity\)[\s\S]*const shouldReturnAfterSave = Boolean\(returnDestination\)/, "Professional Identity editor must preserve safe returnTo destinations for Review, CV, Cover Letter, LinkedIn and future projections.");
assert.match(profileActionEditor, /function returnToSavedDestination\(sectionKey\?: string\)[\s\S]*router\.push\(destination\)[\s\S]*window\.setTimeout\(\(\) => router\.refresh\(\), 0\)/, "Returning from a saved edit section must refresh the destination payload after navigating back.");
assert.match(profileActionEditor, /const saved = await persistStep\(activeStep, values\);[\s\S]*if \(saved === false\) return;[\s\S]*shouldReturnAfterSave[\s\S]*returnToSavedDestination\(activeStep\.key\)/, "Return navigation must not continue after a failed save and must return only through the shared refresh helper.");
for (const [key, route] of [
  ["LANDING", "/"],
  ["WELCOME_HOME", "/"],
  ["LOGIN", "/login"],
  ["SIGNUP", "/signup"],
  ["AUTH_CALLBACK", "/auth/callback"],
  ["FORGOT_PASSWORD", "/auth/reset-password"],
  ["RESET_PASSWORD", "/auth/update-password"],
  ["PROFESSIONAL_IDENTITY", "/professional-identity"],
  ["HOME", "/roadmap"],
  ["EMPLOYMENT_CENTER", "/employment-center"],
  ["MY_EMPLOYMENT_JOURNEY", "/roadmap"],
  ["MY_PROFESSIONAL_PROFILE", "/professional-identity"],
  ["CV_BUILDER", "/professional-identity/cv"],
  ["COVER_LETTER", "/professional-identity/cover-letter"],
  ["LINKEDIN_OPTIMIZER", "/professional-identity/linkedin"],
  ["MY_DOCUMENTS", "/professional-identity/documents"],
  ["FIND_OPPORTUNITIES", "/opportunities"],
  ["MY_APPLICATIONS", "/applications"],
  ["INTERVIEW_PREPARATION", "/interview"],
  ["CAREER_ANALYTICS", "/applications#career-analytics"],
  ["COACH", "/mentor"],
  ["SKILLS_CAREER_GROWTH", "/skills"],
  ["BILLING", "/billing"],
  ["SETTINGS", "/settings"]
]) {
  assert.match(routes, new RegExp(`${key}: "${route.replaceAll("/", "\\/")}"`), `PATHZY_ROUTES.${key} must be ${route}.`);
}
assert.match(routes, /MY_EMPLOYMENT_JOURNEY: "My Employment Journey"/, "The user-facing label for /roadmap must stay My Employment Journey.");
assert.doesNotMatch(routes, /MY_EMPLOYMENT_JOURNEY: "Roadmap"/, "The product section name must not be Roadmap.");
for (const [key, route] of [
  ["dashboard", "/dashboard"],
  ["cvBuilder", "/cv-builder"],
  ["employmentTracker", "/employment-tracker"],
  ["progress", "/progress"],
  ["pricing", "/pricing"],
  ["register", "/register"]
]) {
  assert.match(routes, new RegExp(`${key}: "${route.replaceAll("/", "\\/")}"`), `Legacy route ${route} must be reported centrally until it is redirected or removed in a later phase.`);
}
for (const [routeName, routeLayout] of [
  ["/roadmap", roadmapLayout],
  ["/professional-identity", professionalIdentityLayout],
  ["/opportunities", opportunitiesLayout],
  ["/employment-center", employmentCenterLayout],
  ["/applications", applicationsLayout],
  ["/skills", skillsLayout],
  ["/billing", billingLayout],
  ["/settings", settingsLayout]
]) {
  assert.match(routeLayout, /<AppShell>\{children\}<\/AppShell>/, `${routeName} must render inside the authenticated app shell.`);
}

assert.match(nextActionEngine, /export async function getPathzyNextAction/, "PATHZY must expose one shared next action journey engine.");
assert.match(dashboard, /redirect\(appRoutes\.roadmap\)/, "Legacy /dashboard must redirect to My Employment Journey.");
assert.match(roadmapPage, /greetingFor\(interfaceLanguage\)[\s\S]*firstName|firstName[\s\S]*greetingFor\(interfaceLanguage\)/, "Authenticated Home must render a personalized localized safe greeting.");
assert.match(roadmapPage, /safeFirstToken\(user\?\.user_metadata\?\.display_name\)/, "First name fallback must use account display name before generic fallback.");
assert.match(roadmapPage, /pathzyPhase2T\(language, "home\.greeting\.fallbackName"\)/, "First name fallback must be localized instead of rendering undefined, null, or email.");
assert.match(roadmapPage, /const professionalDirection = localizedProfessionalTitle\(interfaceLanguage, profile\?\.career_goal \|\| profile\?\.preferred_path \|\| ""\);/, "Authenticated Home must show the user's current or target professional direction with localized fallbacks.");
assert.match(roadmapPage, /getProfessionalIdentityReadModelSafe\(supabase, user, "employment intelligence home identity"\)[\s\S]*getDetailedEmploymentIntelligence\(supabase, user\.id\)/, "Authenticated Home must use the shared Professional Identity read model and persisted Employment Intelligence service.");
assert.match(appShell, /getProfessionalIdentityReadModelSafe\(supabase, user, "app shell identity"\)[\s\S]*profile: identityReadModel\?\.profile[\s\S]*discovery: identityReadModel\?\.discovery/, "Authenticated app shell workflow gating must use the shared Professional Identity read model.");
assert.match(nextActionEngine, /getProfessionalIdentityReadModelSafe\(supabase, user, "next action identity"\)[\s\S]*identityReadModel\.profile[\s\S]*identityReadModel\.discovery/, "Continue and next-action decisions must use the same Professional Identity read model as Home and setup routing.");
assert.match(roadmapPage, /buildEmploymentHomeViewModel\(intelligence, language\)[\s\S]*buildNextStep\(language, missingRequired, model\.primaryAction\)/, "Authenticated Home must use persisted intelligence only to choose one next best step.");
assert.doesNotMatch(roadmapPage, /<EmploymentIntelligenceHome|IntelligenceFreshnessPanel|EmploymentPositionSummary|CareerPlanPreview|ReadinessDetails/, "Default Home must not mount the dense Employment Intelligence dashboard blocks.");
assert.match(employmentIntelligenceUiSource, /IntelligenceFreshnessPanel[\s\S]*EmploymentActionCard[\s\S]*EmploymentPositionSummary[\s\S]*CareerPlanPreview[\s\S]*secondaryActions/, "Phase 3G Home must keep a focused four-section intelligence hierarchy.");
assert.match(employmentIntelligenceUiSource, /ButtonLink href=\{appRoutes\.employmentCenter\}/, "Employment Center entry must open the canonical Employment Center route.");
assert.doesNotMatch(roadmapPage, /secondaryHref=\{appRoutes\.applications\}[\s\S]*secondaryLabel="Track Applications"/, "Authenticated Home must not shortcut users into Applications before they apply.");
assert.match(employmentIntelligenceUiSource, /appRoutes\.careerPlan[\s\S]*appRoutes\.employmentCenter/, "Phase 3G Home must route Career Plan and Employment Center through central route constants.");
assert.match(employmentIntelligenceUiSource, /appRoutes\.coach|appRoutes\.mentor/, "Phase 3G tools and action destinations must preserve the existing Coach route.");
assert.doesNotMatch(roadmapPage, /button: "Start My Journey"|dashboardActions|key=\{action\.eyebrow\}/, "Authenticated Home must not render the previous CV-first dashboard action collection.");
assert.doesNotMatch(roadmapPage, /row-span|featured/, "Authenticated landing page must not keep one oversized recommendation card.");
assert.doesNotMatch(roadmapPage, /overflow-x-auto|whitespace-nowrap|min-w-\[/, "Authenticated landing page must not require horizontal scrolling on mobile.");
assert.doesNotMatch(roadmapPage, /Sample Career Plan|Your 90-day control center|Continue My Journey|Interactive 90-day plan|Compare careers/, "Authenticated landing page must not show the previous crowded journey content.");
assert.doesNotMatch(roadmapPage, /UP TO DATE|TOOLS|TODAY|Secondary actions|EmploymentPositionSummary|CareerPlanPreview|Career Plan block/, "Default Home must not show the removed Up To Date, Tools, Today, position summary, secondary actions, or Career Plan blocks.");
for (const homeDestination of ["appRoutes.professionalIdentity", "appRoutes.employmentCenter", "appRoutes.opportunities", "appRoutes.applications"]) {
  assert.match(roadmapPage, new RegExp(homeDestination.replace(/[.]/g, "\\.")), `Simple Home navigation must include ${homeDestination}.`);
}
assert.match(roadmapPage, /Your PATHZY[\s\S]*Next best step|Votre PATHZY[\s\S]*Prochaine etape/, "Default Home must use the simplified Your PATHZY and Next Best Step hierarchy.");
assert.match(roadmapPage, /professionalIdentitySectionHref\(firstMissing\.section, appRoutes\.roadmap\)/, "Completed users with Professional Identity gaps must see an update recommendation instead of being redirected away from Home.");
assert.match(roadmapPage, /getDetailedEmploymentIntelligence/, "Phase 3G Home must use the persisted Employment Intelligence service instead of legacy dashboard summary queries.");
assert.doesNotMatch(roadmapPage, /getPathzyNextAction|summarizeApplicationTracker|buildCareerAnalytics|safeQuery/, "Phase 3G Home must not mix legacy dashboard intelligence sources with persisted Employment Intelligence.");
assert.match(operatingSystem, /applicationEventsForPathzyTimeline/, "Phase 9F must reuse application tracker timeline signals for the PATHZY Timeline.");
assert.match(operatingSystem, /buildCareerPlanSuggestions[\s\S]*You stay in control|without PATHZY changing your plan automatically|Do not automatically modify/, "Phase 9F must connect Career Plan suggestions without automatic mutation.");
assert.match(legacyCvBuilderPage, /redirect\(appRoutes\.professionalIdentityCv\)/, "Legacy /cv-builder must redirect to the canonical CV Builder.");
assert.match(legacyEmploymentTrackerPage, /redirect\(appRoutes\.applications\)/, "Legacy /employment-tracker must redirect to My Applications.");
assert.match(legacyProgressPage, /redirect\(appRoutes\.skills\)/, "Legacy /progress must redirect to Skills & Career Growth.");
assert.match(legacyProfilePage, /redirect\(appRoutes\.settings\)/, "Legacy /profile must redirect to Settings.");
assert.match(legacyRegisterPage, /redirect\(appRoutes\.signup\)/, "Legacy /register must redirect to Sign Up.");
assert.match(nextActionEngine, /label: "Complete Professional Identity"[\s\S]*destinationRoute,/, "Brand-new users must receive Professional Identity guidance.");
assert.match(nextActionEngine, /profileResumeRoute\(typedProfile, user, typedDiscovery\)/, "Continue must resume the current unfinished Professional Identity section when profile setup is incomplete.");
assert.match(nextActionEngine, /if \(milestone\.key === "profile"\) return "Complete My Professional Profile";/, "Users with incomplete profile information must be guided to My Professional Profile.");
assert.match(nextActionEngine, /milestone\.key === "profile" \? profileResumeRoute\(typedProfile, user, typedDiscovery\) : routeForMilestone\(milestone\)/, "Profile gaps must resume the unfinished Professional Identity step, not Billing.");
assert.match(nextActionEngine, /cvComplete: hasCv/, "Users with completed profiles must receive CV guidance when CV is missing.");
assert.match(nextActionEngine, /coverLetterComplete: hasCoverLetter/, "Users with a CV must receive cover letter guidance when cover letter is missing.");
assert.match(nextActionEngine, /opportunitiesSaved: applicationActions\.filter\(\(action\) => action\.saved\)\.length/, "Users with documents must receive opportunity guidance.");
assert.match(nextActionEngine, /if \(inputs\.opportunitiesSaved <= 0\) return milestoneByKey\(milestones, "opportunities"\);[\s\S]*if \(inputs\.applicationsSent <= 0\) return milestoneByKey\(milestones, "applications"\);/, "Users with documents must receive opportunity guidance before application guidance.");
assert.match(nextActionEngine, /if \(inputs\.trackerEntries <= 0 \|\| !inputs\.activeApplicationTracked\) return milestoneByKey\(milestones, "applications"\);/, "Users with applications must receive tracking guidance before interview guidance.");
assert.match(nextActionEngine, /if \(milestone\.key === "applications" && inputs\.applicationsSent > 0\) return "Track application";/, "Application guidance must become tracking guidance after an application is started.");
assert.match(nextActionEngine, /interviewPrepComplete/, "Users with applications must receive interview guidance.");
assert.match(nextActionEngine, /if \(inputs\.employmentReadinessScore < 80\) return skillsMilestone\(\);/, "The next action engine must guide users to improve missing skills after interview preparation.");
assert.doesNotMatch(nextActionEngine, /billing|pricing|founding-members/, "The next action engine must not send users to Billing, Pricing, or Founder flows for incomplete information.");
assert.doesNotMatch(progressEngine, /founding-members/, "Progress Engine must never send onboarding missions to the Founder flow.");
assert.doesNotMatch(roadmapPage, /href="\/founding-members"/, "My Employment Journey must not link CTAs into the Founder flow.");
assert.doesNotMatch(roadmapPage, /XP Progress|Career DNA|Smart Notifications|Founder Premium|Applications Sent/, "My Employment Journey must avoid old dashboard/control-center clutter.");
assert.match(timeline, /PATHZY Timeline/, "Timeline must use the PATHZY Timeline name.");
assert.doesNotMatch(timeline, /Coming soon/, "Timeline must not label normal journey steps as coming soon.");
assert.match(appShell, /key=\{`\$\{item\.href\}-\$\{item\.label\}`\}/, "Navigation links must use a unique key fallback.");
assert.match(appShell, /<Link href=\{user \? appRoutes\.roadmap : appRoutes\.home\}/, "PATHZY logo must send logged-out visitors home and logged-in users to My Employment Journey.");
assert.match(appShell, /<Link href=\{appRoutes\.roadmap\}[\s\S]*Home[\s\S]*<\/Link>/, "Authenticated pages must provide a clear universal return action to Home.");
assert.match(operatingSystem, /export const PATHZY_OPERATING_AREAS/, "Phase 9F must centralize the unified employment operating-system map.");
for (const label of ["Home", "Professional Identity", "Employment Center", "Jobs", "Applications", "Interview Preparation", "Career Plan", "Career Analytics", "Coach", "Settings"]) {
  assert.match(operatingSystem, new RegExp(`label: "${label}"`), `Unified navigation must include ${label}.`);
}
assert.match(operatingSystem, /getOperatingNavigation/, "Unified navigation must be derived from the operating-system map.");
assert.match(navigation, /export const navigation = getOperatingNavigation\(\);/, "Authenticated navigation must read from the unified operating-system map.");
assert.match(operatingSystem, /href: appRoutes\.employmentCenter/, "Employment Center must route to the canonical hub instead of Applications.");
assert.match(employmentCenterPage, /requireAuthenticatedUser\(appRoutes\.employmentCenter\)/, "Employment Center must be a protected authenticated hub.");
assert.match(employmentCenterPage, /href: appRoutes\.documents/, "Employment Center must expose the existing documents workspace without replacing it.");
assert.match(operatingSystem, /href: appRoutes\.opportunities/, "Jobs must route to the existing opportunities and job intelligence workspace.");
assert.match(operatingSystem, /href: appRoutes\.applications/, "Applications must route to the existing tracker workspace.");
assert.match(operatingSystem, /href: appRoutes\.interview/, "Interview Preparation must route to the existing interview workspace.");
assert.match(operatingSystem, /href: appRoutes\.careerAnalytics/, "Career Analytics must route to the analytics section without a duplicate page.");
assert.match(operatingSystem, /href: appRoutes\.mentor/, "Coach must route to the existing mentor workspace.");
assert.match(appShell, /const loggedInNavigation: NavigationItem\[\] = \[\.\.\.navigation\];/, "Desktop and mobile authenticated navigation must both read the same unified navigation list.");
assert.doesNotMatch(appShell, /navigation\.filter/, "Authenticated navigation must not vary by hiding or reshaping shared navigation items in the shell.");
assert.match(routes, /applications: PATHZY_ROUTES\.MY_APPLICATIONS/, "The Applications app route must use the canonical /applications definition.");
assert.match(routes, /skills: PATHZY_ROUTES\.SKILLS_CAREER_GROWTH/, "The Skills app route must use the canonical /skills definition.");
assert.match(routes, /billing: PATHZY_ROUTES\.BILLING/, "The Billing app route must use the canonical /billing definition.");
assert.match(applicationsPage, /EmploymentTrackerPage/, "The /applications entry point must reuse the existing application tracker implementation.");
assert.match(skillsPage, /ProgressPageContent/, "The /skills entry point must reuse the existing skills and growth implementation.");
assert.match(billingPage, /PricingContent/, "The /billing entry point must reuse the existing authenticated pricing implementation.");
assert.match(pricingContent, /pricingPlans\.filter/, "Authenticated Billing must preserve the existing pricing plan rendering.");
assert.doesNotMatch(navigation, /label: "Profile"/, "Main navigation must not include a duplicate Profile label.");
assert.doesNotMatch(floatingMentorButton, /\/dashboard|\/employment-tracker|\/progress/, "Contextual Mentor routing must not reference legacy app routes.");
assert.match(journeyRouter, /profile: appRoutes\.professionalIdentity/, "Profile completion must route to Professional Identity, not old onboarding or membership profile.");
assert.doesNotMatch(journeyRouter, /founding-members|pricing|settings|\/profile"/, "Journey Router must not send Continue My Journey to Founder, Billing, Settings, or membership profile.");

const expectedOrder = [
  ["\"/professional-identity\"", "appRoutes.professionalIdentity"],
  ["\"/discovery\"", "appRoutes.discovery"],
  ["\"/roadmap\"", "appRoutes.roadmap"],
  ["\"/professional-identity/cv\"", "appRoutes.professionalIdentityCv"],
  ["\"/professional-identity/cover-letter\"", "appRoutes.professionalIdentityCoverLetter"],
  ["\"/professional-identity/linkedin\"", "appRoutes.professionalIdentityLinkedin"],
  ["\"/professional-identity/career-passport\"", "appRoutes.professionalIdentityCareerPassport"],
  ["\"/opportunities\"", "appRoutes.opportunities"],
  ["\"/applications\"", "appRoutes.applications"],
  ["\"/interview\"", "appRoutes.interview"],
  ["\"/skills\"", "appRoutes.skills"],
  ["\"/roadmap\"", "appRoutes.roadmap"]
];

let previousIndex = -1;
for (const routeReferences of expectedOrder) {
  const indexes = routeReferences.map((routeReference) => journeyRouter.indexOf(routeReference, previousIndex + 1)).filter((index) => index > previousIndex);
  const index = indexes.length ? Math.min(...indexes) : -1;
  assert.ok(index > previousIndex, `Journey route ${routeReferences.join(" or ")} must appear in the expected onboarding order.`);
  previousIndex = index;
}

const expectedKeys = [
  "profile",
  "discovery",
  "choose_career",
  "cv",
  "cover_letter",
  "linkedin",
  "career_passport",
  "opportunities",
  "applications",
  "interview_prep",
  "employment"
];

previousIndex = -1;
for (const key of expectedKeys) {
  const index = progressEngine.indexOf(`key: "${key}"`, previousIndex + 1);
  assert.ok(index > previousIndex, `Progress milestone ${key} must appear in the expected journey order.`);
  previousIndex = index;
}

assert.match(launchService, /export async function getMembershipState/, "Membership reads must go through one shared state helper.");
assert.match(launchService, /export async function claimFounderMembership/, "Founder claims must go through one explicit claim helper.");
assert.match(launchService, /export async function getOrCreateLaunchMembership[\s\S]*return getLaunchMembership\(supabase, userId\);/, "Legacy getOrCreate helper must be read-only.");
assert.match(authSessionSafety, /export type AuthSessionStatus[\s\S]*"expired"[\s\S]*"email_verification_required"[\s\S]*"password_recovery"/, "Phase 2C must model expired sessions, email verification, and password recovery centrally.");
assert.match(authSessionSafety, /safeRedirectDestination\(requestedDestination, appRoutes\.authenticatedHome\)/, "Auth session redirects must use the central safe redirect guard.");
assert.match(authCallback, /rawNext\?\.startsWith\(appRoutes\.authUpdatePassword\)[\s\S]*safeRedirectDestination\(rawNext, PATHZY_ROUTES\.HOME\)/, "Auth callback must sanitize ordinary return URLs while preserving password recovery.");
assert.match(logoutButton, /window\.location\.replace\(appRoutes\.login\)/, "Logout must use the central login route with full navigation after auth cookie changes.");
assert.match(languagePreferences, /export type LanguagePreferenceLayer[\s\S]*"interface"[\s\S]*"professional_document"[\s\S]*"career_coach"[\s\S]*"interview_practice"[\s\S]*"notification_email"/, "Phase 2C must model independent PATHZY language preference layers.");
assert.match(languagePreferences, /languagePreferenceStorageMap[\s\S]*user_profiles\.language[\s\S]*professional_identity\.language[\s\S]*pathzy_brain\.language[\s\S]*interview_preps\.language/, "Language architecture must document current compatibility storage without adding a new schema.");
assert.match(languageSettingsForm, /profileLanguagePatchForInterface/, "Settings must write the interface language through the shared language preference helper.");
assert.match(authorization, /export const pathzyRoles = \["user", "founder_user", "support", "admin", "super_admin", "background_service"\]/, "Phase 2C must define the supported PATHZY role model.");
assert.match(authorization, /authorizeOwnerAccess[\s\S]*This resource belongs to another PATHZY user/, "Authorization must centrally deny cross-user resource access.");
assert.match(authorization, /authorizeFeatureAccess[\s\S]*canAccessFeature/, "Authorization must keep feature access delegated to the shared entitlement service.");
assert.match(authorization, /audit:[\s\S]*required:[\s\S]*event:/, "Authorization decisions must include audit logging hooks.");
assert.doesNotMatch(navigation, /label: "My Documents"/, "My Documents must stay inside My Professional Profile, not main navigation.");
assert.doesNotMatch(navigation, /label: "Founding Members"/, "Founder access must not be in normal navigation.");
assert.match(permissions, /export function canCreateCV[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Free and premium users must be able to create CVs on the same route.");
assert.match(permissions, /export function canUseProfessionalIdentity[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Professional Identity access must depend on authentication, not paid membership.");
assert.match(permissions, /export function canUsePremiumTemplates[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Free users must be able to preview available premium designs.");
assert.match(coreDocumentDownloadAccess, /currentCoreDocumentDownloadAccess = "allowed"/, "Core document download access must have one shared current product decision.");
assert.match(permissions, /export function canExportProfessionalDocuments[\s\S]*return canDownloadCoreDocument\(context\);/, "Core document export/download actions must use the shared current download-access helper.");
assert.equal(coreDocumentDownloadAccessRuntime.canDownloadCoreDocument({ isAuthenticated: true, accessLevel: "free" }), true, "Authenticated users must be able to download core PATHZY documents.");
assert.equal(permissionsRuntime.canExportProfessionalDocuments({ isAuthenticated: true, accessLevel: "free" }), true, "Free authenticated users must not be redirected to pricing when downloading core documents.");
assert.equal(permissionsRuntime.canExportProfessionalDocuments({ isAuthenticated: false, role: "guest" }), false, "Logged-out visitors must still authenticate before downloading user documents.");
assert.match(entitlements, /export type AccessLevel = "founder" \| "beta_full" \| "trial" \| "paid_pro" \| "paid_premium" \| "expired" \| "free"/, "PATHZY must define the complete founder, beta, trial, paid, expired and free access model.");
assert.match(entitlements, /export function canAccessFeature\(entitlements:[\s\S]*feature: EntitlementFeature\): boolean/, "All feature gates must use the shared entitlement access decision.");
assert.match(entitlements, /if \(entitlements\.isAdmin \|\| entitlements\.isFounder\) return true;/, "Founder and admin accounts must have permanent full access through the central helper.");
assert.match(entitlements, /if \(entitlements\.isBetaFull \|\| entitlements\.isTrial \|\| entitlements\.isPaid\) return true;/, "Active beta, trial and paid users must unlock restricted actions through the same helper.");
assert.match(entitlements, /\["founder", "beta_full", "paid_premium", "paid_pro", "trial", "expired", "free"\]/, "Expired beta users must retain an explicit expired state instead of being treated as deleted users.");
assert.match(entitlements, /const status: EntitlementStatus = accessLevel === "expired" \? "expired"/, "Expired access must map to an explicit expired entitlement status.");
assert.match(entitlements, /Your private beta access has ended\. Your documents are safe/, "Expired beta messaging must explain that user documents remain safe.");
assert.match(entitlements, /feature === "professional_identity"[\s\S]*feature === "document_export"/, "Current core document export gates must remain allowed while future premium entitlement architecture stays available.");
assert.match(professionalIdentityService, /userCanAccessFeature\(supabase, userId, "professional_identity"\)/, "Professional Identity access must use the shared entitlement helper.");
assert.match(professionalIdentityService, /canCurrentUserExportProfessionalDocuments[\s\S]*return canExportProfessionalDocuments\(\{ isAuthenticated: Boolean\(userId\) \}\);/, "Professional document export gates must use the shared current core-document access decision without an extra entitlement fetch.");
assert.match(launchService, /getUserEntitlements\(supabase, userId\)[\s\S]*entitlements\.isFounder \|\| entitlements\.isAdmin \|\| entitlements\.isBetaFull \|\| entitlements\.isTrial \|\| entitlements\.isPaid/, "Launch access and Mentor usage must receive the shared full-access state.");
assert.match(appShell, /entitlements\?\.badge === "FOUNDING TESTER"[\s\S]*title=\{entitlements\.message \?\? undefined\}[\s\S]*FOUNDING TESTER/, "Active founder or beta users must see the private beta badge in the authenticated shell.");
assert.match(entitlementMigration, /create table if not exists public\.user_entitlements/, "The beta entitlement migration must create a dedicated entitlement table.");
assert.match(entitlementMigration, /access_level text not null check \(access_level in \('founder', 'beta_full', 'trial', 'paid_pro', 'paid_premium', 'expired'\)\)/, "The entitlement table must constrain supported access levels.");
assert.match(entitlementMigration, /alter table public\.user_entitlements enable row level security;/, "The entitlement table must have RLS enabled.");
assert.match(entitlementMigration, /create or replace function public\.touch_user_entitlements_last_seen\(\)/, "Last-login tracking must use a narrow database function instead of broad user update policies.");
assert.match(entitlementMigration, /create policy "Users can read own entitlements"/, "Users must be able to read only their own entitlement status.");
assert.doesNotMatch(entitlementMigration, /create policy "Users can update own entitlement/, "Ordinary users must not be able to modify entitlement rows.");
assert.match(entitlementMigration, /create policy "Admins can manage entitlements"[\s\S]*p\.is_admin = true or p\.founder = true or p\.membership_type = 'Admin'/, "Only admins or founders may manage beta entitlements.");
assert.match(betaEntitlementsApi, /canAccessFeature\(entitlements, "admin_beta_management"\)/, "Beta management API must be protected by the shared admin entitlement gate.");
for (const action of ["invite", "grant", "extend", "revoke"]) {
  assert.match(betaEntitlementsApi, new RegExp(action), `Beta management workflow must support ${action}.`);
}
assert.match(betaEntitlementsApi, /completion: \{[\s\S]*onboarding:[\s\S]*cv:[\s\S]*coverLetter:[\s\S]*linkedin:[\s\S]*careerPassport:/, "Beta management must expose only high-level completion signals.");
assert.doesNotMatch(betaEntitlementsApi, /content_text|content_json|document_title/, "Beta tester lists must not expose CV contents or sensitive document contents.");
assert.match(professionalCvPage, /requireAuthenticatedUser\("\/professional-identity\/cv"\)/, "All users must reach the same canonical CV Builder route.");
assert.match(professionalCoverLetterPage, /requireAuthenticatedUser\("\/professional-identity\/cover-letter"\)/, "All users must reach the same canonical Cover Letter route.");
assert.match(professionalCvPage, /locked=\{!unlocked\}[\s\S]*exportLocked=\{!canExport\}/, "CV Builder must allow creation/editing while locking only export actions for free users.");
assert.match(professionalCoverLetterPage, /locked=\{!unlocked\}[\s\S]*exportLocked=\{!canExport\}/, "Cover Letter Builder must allow creation/editing while locking only export actions for free users.");
assert.doesNotMatch(professionalIdentityPage, /button: "My CV"|tools = \[/, "Professional Identity setup must not render the old document tool grid.");
assert.match(professionalCvPage, /title="My CV"/, "CV workspace page header must use the My CV label.");
assert.match(professionalCoverLetterPage, /title="My Cover Letter"/, "Cover Letter workspace page header must use the My Cover Letter label.");
assert.match(professionalIdentityTool, /function renderCvDocumentBar[\s\S]*MY CV[\s\S]*Professional CV/, "My CV must introduce the document through the compact document studio bar.");
assert.doesNotMatch(professionalCvPage, /professionalIdentityHref|ButtonLink href=\{professionalIdentityHref\}>Professional Identity<\/ButtonLink>|Synced with Professional Identity\./, "My CV page must not render the old persistent Professional Identity status/action card.");
assert.match(professionalIdentityTool, /Your CV is ready[\s\S]*Create your cover letter[\s\S]*PATHZY_ROUTES\.COVER_LETTER/, "My CV must show one consolidated cover-letter next-step card after the document studio.");
assert.match(professionalIdentityTool, /function renderCoverLetterDocumentBar[\s\S]*MY COVER LETTER[\s\S]*statusLabel[\s\S]*✓ Saved/, "My Cover Letter must show a compact saved/status state in the workspace controls.");
assert.match(professionalCoverLetterPage, /getProfessionalIdentityReadModelSafe\(supabase, user, "cover letter professional identity"\)/, "My Cover Letter page must read the canonical Professional Identity model before creating a letter.");
assert.match(professionalCoverLetterPage, /resolveCoverLetterJobContext\(supabase, user\.id, params\)/, "My Cover Letter page must resolve saved-job, application, pasted, or manual job context.");
assert.match(professionalCoverLetterPage, /loadSavedProfessionalDocument\(supabase, user\.id,[\s\S]*tool: "cover-letter"/, "My Cover Letter page must load persisted owned cover-letter documents from the shared saved-document loader.");
assert.match(professionalCoverLetterPage, /professionalIdentityCoverLetterDocument\(identity\.values, jobContext/, "My Cover Letter page must seed new letters from Professional Identity plus job context.");
assert.match(professionalCoverLetterPage, /coverLetterSyncStatus=\{coverLetterSyncStatus\}/, "My Cover Letter page must pass source-of-truth sync status into the shared document workspace.");
assert.match(professionalIdentityTool, /Your cover letter is ready[\s\S]*Prepare for interview[\s\S]*PATHZY_ROUTES\.INTERVIEW_PREPARATION/, "My Cover Letter next step must live below the document studio and guide users toward interview preparation.");
assert.match(professionalCoverLetterPage, /coverLetterJobHref=\{jobHref\}/, "My Cover Letter page must pass the resolved job/application destination into the shared workspace.");
assert.match(professionalCoverLetterPage, /page-pad mx-auto w-full max-w-\[1560px\]/, "My Cover Letter wrapper must use the same wide document workspace container as My CV.");
const myCvIntroIndex = professionalCvPage.indexOf("Professional CV");
const cvToolIndex = professionalCvPage.indexOf("<ProfessionalIdentityTool");
assert.ok(cvToolIndex > -1 && myCvIntroIndex > -1, "My CV wrapper must mount the CV document studio.");
const myCvHeaderBlock = professionalCvPage.slice(myCvIntroIndex, cvToolIndex);
assert.doesNotMatch(myCvHeaderBlock, /Professional Identity<\/ButtonLink>|Edit Professional Identity|Synced with Professional Identity/, "The My CV header area must not expose persistent Professional Identity correction controls.");
assert.doesNotMatch(myCvHeaderBlock, /Build your professional CV|prepare the first draft|Edit CV/, "The My CV header area must not use the old draft-first CV copy.");
const coverLetterToolIndex = professionalCoverLetterPage.indexOf("<ProfessionalIdentityTool");
const coverLetterDocumentBarIndex = professionalIdentityTool.indexOf("renderCoverLetterDocumentBar()");
const coverLetterWorkspaceIndex = professionalIdentityTool.indexOf('data-cover-letter-workspace-layout="compact-controls-large-preview"', coverLetterDocumentBarIndex);
assert.ok(coverLetterToolIndex > -1 && coverLetterDocumentBarIndex > -1 && coverLetterWorkspaceIndex > coverLetterDocumentBarIndex, "My Cover Letter route must mount the shared workspace with compact controls and a dominant preview area.");
assert.match(professionalIdentityTool, /function renderCoverLetterDocumentBar[\s\S]*Update information[\s\S]*Change Job[\s\S]*Change design/, "The My Cover Letter document bar must provide compact Professional Identity, Job Context, and design navigation.");
assert.match(settingsPage, />My CV<\/ButtonLink>/, "Settings shortcut must use the My CV label.");
assert.match(navigation, /"My CV"/, "Shared user-facing product data must use the My CV label.");
assert.doesNotMatch(`${professionalIdentityPage}\n${professionalCvPage}\n${settingsPage}\n${navigation}\n${readFileSync("app/qa-pathzy-journey/page.tsx", "utf8")}`, /Create My CV/, "Relevant user-facing CV workspace labels must not say Create My CV.");
assert.match(professionalIdentityPage, /professionalIdentityIntroStages\.includes\(params\.stage as ProfessionalIdentityOnboardingStage\)[\s\S]*resolvedStage = requestedStage \?\? stageForState\[routeDecision\.currentState\][\s\S]*<ProfileActionEditor[\s\S]*initialSection=\{resolvedSection\}[\s\S]*initialIntroStage=\{resolvedStage \?\? undefined\}[\s\S]*returnTo=\{params\.returnTo\}/, "Professional Profile information rows must hydrate the shared guided profile editor with validated Welcome, language, coach and Professional Identity introduction stages.");
assert.doesNotMatch(professionalIdentityPage, /appRoutes\.settings|href="\/settings"|href=\{appRoutes\.billing\}|href="\/billing"|href="\/profile"|href="\/roadmap"|href="\/onboarding"/, "Professional Profile Edit/Add Missing Info actions must not leave the profile workflow for Settings, Billing, legacy profile, Journey, or onboarding.");
assert.match(professionalIdentityPage, /showReview[\s\S]*t\("identity\.page\.reviewTitle"\)/, "Professional Identity must render a dedicated translated Review My Information state before Home.");
assert.match(pathzyI18n, /Review My Information[\s\S]*Vérifier mes informations/, "Review My Information copy must be available in English and French.");
assert.match(routes, /PROFESSIONAL_IDENTITY_REVIEW: "\/professional-identity\/review"[\s\S]*PROFESSIONAL_IDENTITY_SECTION_ROOT: "\/professional-identity\/section"/, "Permanent Professional Identity review and section routes must be centrally defined.");
assert.match(professionalIdentityReviewRoute, /redirect\(professionalIdentityReviewHref\(\)\)/, "The canonical Review route must redirect into the single existing review renderer.");
assert.match(professionalIdentitySectionRoute, /professionalIdentitySectionHref\(sectionId, query\.returnTo\)/, "The canonical section route must redirect into the single existing section editor with safe return context.");
assert.match(professionalIdentityPage, /showReview = !params\.section && params\.review === "1"[\s\S]*showEditor = Boolean\(resolvedSection \|\| resolvedStage\)/, "Professional Identity must separate permanent overview, review, edit, and first-time onboarding states.");
assert.match(professionalIdentityPage, /identity\.overview\.title[\s\S]*identity\.overview\.sectionsTitle[\s\S]*reviewSections\.map/, "Professional Identity overview must show a permanent control centre with all sections.");
assert.match(professionalIdentityPage, /ProfessionalIdentityReviewActions/, "Professional Identity review must expose the Finish Setup action.");
assert.match(professionalIdentityPage, /identity\.review\.required[\s\S]*identity\.review\.recommendedMissing[\s\S]*identity\.review\.optionalMissing/, "Professional Identity review must distinguish required, recommended, and optional information.");
assert.match(professionalIdentityPage, /missingRequiredChecks\.map[\s\S]*professionalIdentitySectionHref\(item\.section, "review"\)/, "Review must list required gaps by name with direct completion links.");
assert.match(professionalIdentityPage, /setupComplete=\{setupComplete\}/, "Review actions must know when setup is already complete.");
assert.match(profileActionEditor, /export const profileSectionActions/, "Professional Profile actions must be centralized in profileSectionActions.");
for (const sectionName of ["name", "email", "phone", "location", "currentStatus", "education", "fieldOfStudy", "careerDirection", "experience", "skills", "languages", "projects", "certificates", "achievements", "references"]) {
  assert.match(profileActionEditor, new RegExp(`${sectionName}: \\{`), `${sectionName} must open its own exact Professional Profile editor.`);
}
for (const editorName of ["Name editor", "Email editor", "Phone editor", "Location editor", "Current Status editor", "Education editor", "Field of Study editor", "Career Direction editor", "Experience editor", "Skills editor", "Languages editor", "Projects editor", "Certificates editor", "Achievements editor", "References editor"]) {
  assert.match(profileActionEditor, new RegExp(editorName), `${editorName} must be available from My Professional Profile.`);
}
assert.match(profileActionEditor, /fetch\("\/api\/professional-profile"/, "Professional Profile Save must persist through the dedicated profile save endpoint.");
assert.match(pathzyI18n, /Welcome to PATHZY\.[\s\S]*Bienvenue sur PATHZY\./, "Professional Identity must begin with the approved translated welcome experience.");
assert.match(pathzyI18n, /We're here to help you become visible[\s\S]*Nous sommes l. pour vous aider . devenir visible/, "Professional Identity welcome must explain the premium employment journey in English and French.");
assert.match(profileActionEditor, /Autosave/, "Professional Identity must expose autosave state instead of a manual save workflow.");
assert.match(profileActionEditor, /introStage === "identity" \? formatPathzyStepCount\(activeLanguage, activeIndex \+ 1, journeySteps\.length\) : formatPathzyStepCount/, "Professional Identity must show translated intro-aware and identity step progress.");
assert.match(profileActionEditor, /identity\.status\.completed[\s\S]*identity\.status\.current[\s\S]*identity\.status\.available[\s\S]*identity\.status\.locked/, "Professional Identity sidebar must show completed, current, available, and locked states.");
assert.match(profileActionEditor, /step\.importance/, "Professional Identity sidebar must show required, recommended, and optional states.");
for (const introAction of ["Let's Begin", "Commen.ons", "Continue", "Continuer"]) {
  assert.match(pathzyI18n, new RegExp(introAction), `Professional Identity intro action must include ${introAction}.`);
}
assert.match(profileActionEditor, /onboarding\.review/, "Completed required Professional Identity setup must move users to Review My Information.");
assert.match(profileActionEditor, /action: "finishSetup"/, "Finish Setup must persist completion through the existing profile endpoint.");
assert.doesNotMatch(profileActionEditor, />Save</, "Professional Identity journey must not expose a manual Save button.");
assert.match(profileActionEditor, /missingRequiredSteps[\s\S]*identity\.ui\.continueWith[\s\S]*sectionTitle\(step\)[\s\S]*identity\.ui\.requiredField/, "Blocked final Professional Identity steps must show localized missing required fields and a direct section action.");
assert.match(professionalIdentityAutosave, /clearScheduledSave\(\);[\s\S]*fetch\("\/api\/professional-profile"/, "Forced Professional Identity saves must clear pending debounce timers before sending a request.");
assert.match(professionalIdentityAutosave, /AbortController[\s\S]*activeSave\.current\?\.controller\.abort\(\)/, "Superseded Professional Identity saves must abort stale in-flight browser requests.");
assert.match(professionalIdentityAutosave, /activeSave\.current\?\.signature === signature[\s\S]*return activeSave\.current\.promise/, "Blur or Continue must reuse the same in-flight save instead of duplicating it.");
assert.match(professionalIdentityAutosave, /lastPersistedSignature[\s\S]*lastPersistedSignature\.current\.get\(step\.key\) === signature[\s\S]*return true/, "Unchanged Professional Identity data must not generate another save request.");
assert.match(professionalIdentityAutosave, /setTimeout\(\(\) => \{[\s\S]*persistStep\(step, nextValues, "autosave"\)[\s\S]*\}, debounceMs\)/, "Rapid typing must be collapsed into one debounced background autosave by the shared save pipeline.");
assert.match(professionalProfileApi, /mode\?: "autosave" \| "navigation"/, "Professional Profile save endpoint must distinguish background autosave from navigation saves.");
assert.match(professionalProfileApi, /syncProfessionalIdentityAfterWrite\(supabase, user\.id,[\s\S]*mode: payload\?\.mode \?\? "navigation"/, "Professional Profile save endpoint must route post-write refresh through the shared synchronization engine.");
assert.match(professionalIdentitySync, /if \(options\.mode === "autosave"\) return \{ skipped: true \}/, "Background autosave must avoid unrelated readiness refresh work during typing.");
assert.match(profileActionEditor, /aria-live="polite"[\s\S]*min-w-\[9\.5rem\][\s\S]*min-h-5/, "Professional Identity save status and helper message areas must reserve stable dimensions.");
assert.match(professionalIdentityAutosave, /saveId === latestSave\.current[\s\S]*setAutosaveState\("saved"\)/, "Stale save responses must not overwrite the latest visible save state.");
assert.match(profileActionEditor, /shouldReturnAfterSave[\s\S]*returnToSavedDestination\(activeStep\.key\)/, "Editing a missing section from Review or a projection workspace must return to a refreshed destination after the section is saved without a full document reload.");
assert.doesNotMatch(profileActionEditor, /window\.location\.assign/, "Professional Identity edit and review navigation must avoid full page reloads.");
assert.match(profileActionEditor, /identity\.review\.cancelReturn[\s\S]*identity\.review\.saveReturn/, "Edit from Review must expose Cancel and Save-and-return-to-Review actions.");
assert.match(profileActionEditor, /setupComplete \?[\s\S]*identity\.review\.returnToIdentity[\s\S]*: requiredComplete \?[\s\S]*identity\.finish\.submit/, "Completed users must not see Finish Setup as the primary review action.");
assert.match(profileActionEditor, /if \(step\.key === "employment_preferences"\)[\s\S]*salary_expectations: values\.salary_expectations[\s\S]*availability: values\.availability/, "Employment Preferences saves must preserve salary and availability values shown in that editor.");
assert.match(profileActionEditor, /href=\{appRoutes\.documents\}/, "Uploaded documents must open My Documents rather than Settings.");
assert.doesNotMatch(profileActionEditor, /appRoutes\.settings|\/settings|\/billing|membership|\/roadmap|\/onboarding/, "Profile action editor must not route profile fixes to Settings, Billing, membership, Journey, or onboarding.");
assert.match(profileActionEditor, /type IntroStage = "welcome" \| "interfaceLanguage" \| "documentLanguage" \| "careerCoach" \| "professionalIdentityIntroduction" \| "identity"/, "Phase 2 final onboarding must guide users through Welcome, interface language, document language, Career Coach, Professional Identity introduction, then identity fields.");
assert.equal(routeRuntime.routeBuilders.professionalIdentityIntroduction(), "/professional-identity?stage=professionalIdentityIntroduction", "Professional Identity introduction must have a canonical onboarding route.");
for (const readinessKey of ["current_situation", "main_support_needed", "existing_cv_status", "immediate_employment_goal", "current_readiness"]) {
  assert.match(employmentReadinessCheck, new RegExp(`key: "${readinessKey}"`), `Employment Readiness Check must include ${readinessKey}.`);
  assert.match(employmentReadinessCheck, new RegExp(`"${readinessKey}"`), `Employment Readiness answer keys must include ${readinessKey}.`);
}
assert.match(employmentReadinessCheck, /export function normalizeEmploymentReadinessAnswers\(value: unknown\)[\s\S]*typeof source\[key\] === "string" \? source\[key\] : ""/, "Employment Readiness Check must normalize undefined and null answers before validation.");
assert.match(employmentReadinessCheck, /export function isEmploymentReadinessComplete\(value: unknown\)[\s\S]*normalizeEmploymentReadinessAnswers\(value\)[\s\S]*answers\[key\]\.trim\(\)\.length > 0/, "Employment Readiness completion must trim only normalized string answers.");
assert.match(employmentReadinessCheck, /First-time job seeker[\s\S]*Unemployed and actively searching[\s\S]*Employed and exploring new opportunities[\s\S]*Student or recent graduate[\s\S]*Self-employed or freelancing[\s\S]*Returning to work/, "Employment Readiness Check must ask the approved current-situation question in order.");
assert.match(employmentReadinessCheck, /Career direction[\s\S]*Professional profile[\s\S]*CV and cover letter[\s\S]*Suitable opportunities[\s\S]*Interview preparation[\s\S]*Skills development/, "Employment Readiness Check must ask the approved support-needed question.");
assert.match(employmentReadinessCheck, /Yes[\s\S]*No[\s\S]*Yes, but it needs improvement/, "Employment Readiness Check must ask the approved existing-CV question.");
assert.match(employmentReadinessCheck, /Find a job[\s\S]*Change career[\s\S]*Find an internship or learnership[\s\S]*Build work experience[\s\S]*Find freelance or income opportunities/, "Employment Readiness Check must ask the approved immediate-goal question.");
assert.match(employmentReadinessCheck, /I do not know where to begin[\s\S]*I have some information but need guidance[\s\S]*I am mostly ready and need stronger applications[\s\S]*I am actively applying and need better results/, "Employment Readiness Check must ask the approved current-readiness question.");
assert.match(employmentReadinessCheck, /Premiere recherche d'emploi[\s\S]*CV et lettre de motivation[\s\S]*Trouver un emploi[\s\S]*Je ne sais pas par ou commencer/, "Employment Readiness Check must include French question content.");
assert.doesNotMatch(employmentReadinessCheck, /salary|availability|work_authorization|nationality|fake diagnosis score|readiness score/i, "Employment Readiness Check must not ask Professional Identity fields or create fake scores.");
assert.doesNotMatch(authRouting, /readiness_check_pending|readiness_check_in_progress|readiness_check_complete/, "Auth routing must not insert the old readiness checkpoint into first-time onboarding.");
assert.match(authRouting, /welcome_pending[\s\S]*interface_language_pending[\s\S]*document_language_pending[\s\S]*coach_intro_pending[\s\S]*professional_identity_intro_pending[\s\S]*identity_not_started/, "Auth routing must expose explicit first-time onboarding states before identity setup.");
assert.match(authRouting, /hasAnyIdentityProgress[\s\S]*hasText\(profile\?\.phone\)[\s\S]*hasText\(profile\?\.city\)[\s\S]*hasText\(profile\?\.current_status\)/, "Auth routing must not count auth-only full name or email as Professional Identity progress.");
assert.match(authRouting, /routeBuilders\.professionalIdentityIntroduction\(\)/, "Auth routing must resume the Professional Identity introduction before the identity editor.");
assert.match(authRouting, /!key\.startsWith\("employment_readiness_check"\)[\s\S]*!key\.startsWith\("pathzy_onboarding"\)[\s\S]*\["welcome_completed", "interface_language", "professional_document_language", "career_coach_intro_seen", "professional_identity_intro_seen"\]\.includes\(key\)[\s\S]*hasIdentityAnswerProgress\(value\)/, "Readiness and onboarding answers must not be counted as Professional Identity progress.");
assert.doesNotMatch(authRouting, /hasText\(profile\?\.language\)[\s\S]*interface_language_pending/, "A saved default profile language must not complete the Interface Language setup step by inference.");
assert.match(profileActionEditor, /const introOrder: IntroStage\[\] = \["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"\]/, "Professional Identity intro order must follow the locked five setup screens.");
assert.match(profileActionEditor, /const premiumOnboardingOrder: IntroStage\[\] = \["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"\]/, "Premium onboarding progress must present the five requested orientation screens.");
assert.match(profileActionEditor, /bg-\[#07111f\]/, "Premium onboarding screens must use the calm PATHZY shell.");
for (const onboardingKey of ["onboarding.welcome.subheadline", "onboarding.interface.explanation", "onboarding.document.explanation", "onboarding.coach.support", "identity.intro.title"]) {
  assert.match(profileActionEditor, new RegExp(onboardingKey.replaceAll(".", "\\.")), `Premium onboarding screens must use ${onboardingKey}.`);
}
assert.match(profileActionEditor, /aria-valuenow=\{shellProgress\}[\s\S]*style=\{\{ width: `\$\{shellProgress\}%` \}\}/, "Onboarding progress must use onboarding stage progress before Professional Identity section completion begins.");
assert.match(profileActionEditor, /introStage === "careerCoach"[\s\S]*setIntroStage\("professionalIdentityIntroduction"\)[\s\S]*introStage === "professionalIdentityIntroduction"[\s\S]*persistOnboardingProgress\("professional_identity_intro_completed"\)[\s\S]*persistOnboardingProgress\("identity_started"\)[\s\S]*setIntroStage\("identity"\)/, "Continue must move Career Coach to the Professional Identity introduction, then into identity fields only after explicit action.");
assert.match(profileActionEditor, /activeIndex <= 0[\s\S]*setIntroStage\("professionalIdentityIntroduction"\)/, "Back from the first Professional Identity section must return to the Professional Identity introduction.");
assert.match(profileActionEditor, /if \(introStage !== "identity"\)[\s\S]*return <section className="mt-6">\{renderCurrentStep\(\)\}<\/section>/, "Focused setup stages must not render the 23-section overview/sidebar before Professional Identity starts.");
assert.match(profileActionEditor, /persistOnboardingProgress\("welcome_completed"\)[\s\S]*persistOnboardingProgress\("interface_language_completed"\)[\s\S]*persistOnboardingProgress\("document_language_completed"\)[\s\S]*persistOnboardingProgress\("coach_intro_completed"\)[\s\S]*persistOnboardingProgress\("professional_identity_intro_completed"\)[\s\S]*persistOnboardingProgress\("identity_started"\)/, "Focused onboarding stages must save durable per-user milestones.");
assert.match(profileActionEditor, /autosaveState === "saving"[\s\S]*onboarding\.save\.stillSaving/, "Slow network save behaviour must remain visible during the onboarding and identity flow.");
assert.match(professionalIdentityWriteService, /saveEmploymentReadiness[\s\S]*employment_readiness_check: answers[\s\S]*employment_readiness_check_step: currentStep[\s\S]*employment_readiness_check_status[\s\S]*employment_readiness_check_completed/, "Readiness answers must be stored separately in discovery responses.");
assert.match(professionalIdentityWriteService, /saveProfessionalIdentityOnboardingProgress[\s\S]*pathzy_onboarding_state: state[\s\S]*welcome_completed: true[\s\S]*professional_identity_intro_seen: true[\s\S]*identity_started: true/, "Onboarding progress must be stored separately from Professional Identity fields.");
const readinessSaveSource = professionalIdentityWriteService.slice(professionalIdentityWriteService.indexOf("export async function saveEmploymentReadiness"), professionalIdentityWriteService.indexOf("export async function saveProfessionalIdentityOnboardingProgress"));
assert.doesNotMatch(readinessSaveSource, /career_goal|preferred_roles|industries|employment_type|availability|skills|education|user_profiles/, "Readiness save must not silently overwrite Professional Identity fields.");
assert.doesNotMatch(professionalIdentityPage, /initialReadinessAnswers|initialReadinessStep|initialReadinessComplete/, "Professional Identity page must not wire the legacy readiness checkpoint into final onboarding.");
for (const premiumOnboardingCopy of ["We're here to help you become visible", "We'll guide you step by step as you build", "This controls the language PATHZY uses", "Interface : Fran.ais", "Meet your Career Coach", "Bienvenue sur PATHZY", "Nous vous guidons .tape par .tape"]) {
  assert.match(pathzyI18n, new RegExp(premiumOnboardingCopy), `Premium onboarding copy must include ${premiumOnboardingCopy}.`);
}
for (const identityIntroCopy of ["Everything you enter here becomes the trusted foundation", "Build My Professional Identity", "Tout ce que vous saisissez ici devient la base fiable", "Construire mon Identit. Professionnelle"]) {
  assert.match(pathzyI18n, new RegExp(identityIntroCopy), `Professional Identity introduction copy must include ${identityIntroCopy}.`);
}
assert.match(profileActionEditor, /professionalDocumentLanguageLabels/, "Professional document language must be selected independently from interface language.");
assert.match(profileActionEditor, /career_coach_intro_seen/, "Career Coach orientation completion must be persisted for resume behaviour.");
assert.match(profileActionEditor, /const journeySteps: JourneyStep\[\] = \[[\s\S]*key: "profile"[\s\S]*key: "photo"[\s\S]*key: "personal_information"[\s\S]*key: "preferences"[\s\S]*key: "availability"/, "Professional Identity editor must expose the locked 23-section journey in canonical order.");
assert.match(profileActionEditor, /function renderPhotoSection\(\)[\s\S]*type="file"[\s\S]*accept="image\/jpeg,image\/png,image\/webp"/, "Photo section must render a real JPEG/PNG/WebP file input.");
for (const photoActionKey of ["identity.photo.add", "identity.photo.chooseDevice", "identity.photo.replace", "identity.photo.crop", "identity.photo.remove", "identity.photo.retry"]) {
  assert.match(profileActionEditor, new RegExp(photoActionKey.replace(".", "\\.")), `Photo section must expose ${photoActionKey}.`);
}
assert.match(profileActionEditor, /URL\.createObjectURL[\s\S]*URL\.revokeObjectURL/, "Photo preview may use temporary object URLs but must clean them up.");
assert.doesNotMatch(profileActionEditor, /localStorage\.setItem\([^)]*photo|data:image/i, "Photo section must not persist temporary browser image URLs or base64 data.");
assert.match(profileActionEditor, /catch \(caught\)[\s\S]*setPhotoStatus\("error"\)[\s\S]*setLocalPhotoPreview[\s\S]*URL\.revokeObjectURL[\s\S]*return ""/, "Failed photo uploads must clear temporary previews so an existing durable photo is preserved visually.");
assert.match(profileActionEditor, /professionalPhotoUploadTimeoutMs = 30_000[\s\S]*AbortController[\s\S]*upload_timeout/, "Professional Photo uploads must time out safely instead of leaving the UI stuck uploading.");
assert.match(profileActionEditor, /photoErrorMessage\(data\?\.code, "upload_failed"\)/, "Professional Photo upload errors must be localized from safe API error codes instead of rendering server English text directly.");
assert.match(profileActionEditor, /photoNavigationBlocked[\s\S]*photoBusy[\s\S]*photoStatus === "error"/, "Professional Photo navigation must be blocked while an upload is pending or failed.");
assert.match(profileActionEditor, /goNext\(\{ allowPhotoError: true \}\)/, "Professional Photo optional skip must advance through the same journey flow without treating a failed upload as saved.");
assert.match(profileActionEditor, /identity\.photo\.continueWithout/, "Professional Photo failure state must expose an explicit optional continue-without-photo action.");
assert.match(profileActionEditor, /event\.currentTarget[\s\S]*uploadPhotoFile\(file\)\.finally[\s\S]*input\.value = ""/, "Professional Photo input must clear after an attempt so users can retry the same file.");
assert.match(professionalIdentityPage, /createCurrentProfessionalPhotoView\(supabase, professionalIdentityValues\.professional_photo_asset,[\s\S]*userId: user\.id[\s\S]*professional_photo_asset: professionalPhotoView/, "Professional Identity must regenerate a private signed photo URL through the shared canonical photo selector after refresh or login without persisting the URL.");
assert.match(professionalIdentityPage, /<ProfessionalPhotoAvatar[\s\S]*photo=\{professionalPhotoView\}[\s\S]*fallback=\{initialsFor\(profile\?\.full_name \?\? "", user\.email\)\}/, "Professional Identity profile previews must render the saved canonical photo through the shared Professional Photo avatar.");
assert.match(professionalPhotoApi, /formData\.get\("photo"\)[\s\S]*supabase\.storage[\s\S]*upload\(storagePath[\s\S]*saveMergedDiscoveryAnswers/, "Professional Photo API must upload binary storage first and then persist Professional Identity metadata.");
assert.match(professionalPhotoApi, /createSignedUrl\(asset\.storagePath/, "Professional Photo API must return owner-scoped signed URLs for private photo previews.");
assert.match(professionalPhotoApi, /function storageFailureCode[\s\S]*storage_bucket_missing[\s\S]*storage_permission_denied[\s\S]*storage_unavailable/, "Professional Photo API must classify storage failures without exposing credentials.");
assert.match(professionalPhotoApi, /function storageFailureDiagnostic[\s\S]*process\.env\.NODE_ENV !== "development"[\s\S]*statusCode[\s\S]*message/, "Professional Photo API must expose only sanitized storage diagnostics in development.");
assert.match(professionalPhotoApi, /remove\(\[storagePath\]\)/, "Professional Photo API must clean up a newly uploaded object if metadata persistence fails.");
assert.match(professionalPhotoApi, /export async function DELETE[\s\S]*profile_photo: ""[\s\S]*professional_photo_asset: null/, "Professional Photo API must support removing the canonical photo without deleting the user's Professional Identity.");
assert.doesNotMatch(professionalPhotoApi, /service_role|data:image|base64/i, "Professional Photo API must not use service-role credentials, persisted base64 images, or data URLs.");
assert.match(professionalIdentityWriteService, /\.\.\.\(\(target\?\.answers as Record<string, unknown> \| null\) \?\? \{\}\), \.\.\.answersPatch/, "Professional Identity section saves must merge into the existing identity answers so unrelated saves preserve durable photo metadata.");
const canonicalPhotoNormalizer = professionalPhotoContract.slice(professionalPhotoContract.indexOf("export function professionalPhotoAssetFromUnknown"), professionalPhotoContract.indexOf("export function getCurrentProfessionalPhoto"));
assert.doesNotMatch(canonicalPhotoNormalizer, /signedUrl/, "Canonical Professional Photo normalization must not persist private signed URLs.");
assert.match(professionalPhotoContract, /export function getCurrentProfessionalPhoto[\s\S]*professionalPhotoAssetFromUnknown[\s\S]*photoStatus !== "ready"[\s\S]*return asset/, "Professional Photo must expose one canonical current-photo selector.");
assert.match(professionalPhotoContract, /export async function createCurrentProfessionalPhotoView[\s\S]*getCurrentProfessionalPhoto[\s\S]*createSignedUrl\(asset\.storagePath[\s\S]*return \{ \.\.\.asset, signedUrl: data\.signedUrl \}/, "Professional Photo signed views must be derived from the canonical asset without storing signed URLs.");
assert.match(professionalLinkedInPage, /createCurrentProfessionalPhotoView\(supabase, identity\.values\.professional_photo_asset,[\s\S]*userId: user\.id[\s\S]*canonicalProfessionalPhoto=\{canonicalProfessionalPhoto\}/, "LinkedIn must load the saved Professional Identity photo through the shared canonical photo selector.");
assert.match(professionalIdentityTool, /canonicalProfessionalPhoto\?: ProfessionalPhotoAssetView \| null/, "Document Studio must accept the shared canonical Professional Photo view instead of creating a LinkedIn-specific photo field.");
assert.match(professionalIdentityTool, /profilePhotoAvailable: source\.profilePhotoAvailable === true \|\| Boolean\(canonicalProfessionalPhoto\?\.storagePath && canonicalProfessionalPhoto\.photoStatus === "ready"\)/, "Saved LinkedIn documents must display the latest canonical Professional Identity photo availability.");
assert.match(professionalPhotoAvatar, /export function ProfessionalPhotoAvatar[\s\S]*photo\?\.photoStatus === "ready"[\s\S]*photo\.signedUrl[\s\S]*onError=\{\(\) => setLoadFailed\(true\)\}[\s\S]*aria-label=\{fallbackLabel\}/, "Professional Photo downstream presentation must use one shared avatar component with broken-image fallback.");
assert.match(professionalIdentityTool, /<ProfessionalPhotoAvatar[\s\S]*photo=\{canonicalProfessionalPhoto\}[\s\S]*alt=\{`\$\{model\?\.fullName \|\| "Professional"\} professional profile photo`\}/, "LinkedIn preview must render the saved canonical photo through the shared Professional Photo avatar.");
assert.doesNotMatch(professionalIdentityTool, /\? "Photo" :/, "LinkedIn preview must not render the literal Photo placeholder when a saved Professional Identity photo exists.");
assert.match(professionalCvPage, /createCurrentProfessionalPhotoView\(supabase, identityReadModel\.values\.professional_photo_asset,[\s\S]*userId: user\.id[\s\S]*canonicalProfessionalPhoto=\{canonicalProfessionalPhoto\}/, "My CV must pass the saved Professional Identity photo into photo-enabled CV templates.");
assert.match(professionalCareerPassportPage, /getProfessionalIdentityReadModelSafe\(supabase, user, "career passport professional identity"\)[\s\S]*createCurrentProfessionalPhotoView\(supabase, identityReadModel\.values\.professional_photo_asset,[\s\S]*<ProfessionalSnapshot projection=\{projection\} photoUrl=\{canonicalProfessionalPhoto\?\.signedUrl\}/, "Career Passport must use the saved Professional Identity photo and must not maintain a separate photo source.");
assert.match(professionalCareerPassportPage, /ProfessionalSnapshot[\s\S]*Where I'm Going[\s\S]*<ReadinessSection[\s\S]*What Is Holding Me Back\?[\s\S]*What I Can Offer[\s\S]*My Strengths[\s\S]*<EvidenceSection[\s\S]*Achievements & Progress[\s\S]*Career Focus[\s\S]*Your Next Best Action[\s\S]*Career Passport updated:/, "Career Passport page must render the required living-progress sections in the locked order.");
assert.doesNotMatch(professionalCareerPassportPage, /<ProfessionalIdentityTool|textarea|contentEditable|generateCareerPassportSummary/, "Career Passport must not be another document editor or generation workspace.");
assert.match(careerPassportProjection, /function documentSignals/, "Career Passport must normalize saved PATHZY document progress before projection.");
assert.match(careerPassportProjection, /export function buildCareerPassportProjection[\s\S]*normalizeProfessionalIdentityCompletionValues[\s\S]*selectCanonicalProfessionalIdentityExperiences/, "Career Passport must be a deterministic projection from canonical identity values and the shared Experience selector.");
assert.match(careerPassportProjection, /firstMissingRequired[\s\S]*hasReadyCv[\s\S]*hasSupportingDocuments[\s\S]*evidenceStrengthReady[\s\S]*View opportunities/s, "Career Passport next-best-action priority must use one reusable ordered decision layer.");
assert.match(documentDownloads, /function professionalPhotoForCvTemplate[\s\S]*templateMetadata\(templateName\)\.photoCapability[\s\S]*photoMode === "none"[\s\S]*photo\?\.photoStatus !== "ready"[\s\S]*return photo/, "CV renderer must use the canonical photo only for templates that support a photograph.");
assert.match(documentDownloads, /kind: "image"[\s\S]*src: photo\.signedUrl[\s\S]*alt: "Professional profile photo"[\s\S]*objectPosition: professionalPhotoObjectPosition\(photo\)/, "Photo-enabled CV templates must render the saved Professional Identity photo as an image element with canonical crop metadata.");
assert.match(professionalIdentityTool, /renderCvHtmlFromModel\(previewCvModel, templateName, activeCvSection, canonicalProfessionalPhoto, cvPaletteId\)/, "Designed CV Preview must pass the canonical Professional Identity photo and selected palette to the shared renderer.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, normalizeCvModelForExport\(cvModel\), templateName, canonicalProfessionalPhoto, cvPaletteId\)/, "CV PDF export path must keep the canonical Professional Identity photo and selected palette contract aligned with the shared renderer.");
const savedProfessionalPhotoFixture = {
  photoAssetId: "photo-1",
  userId: "user-1",
  storagePath: "user-1/profile/photo-1.jpg",
  originalFileName: "headshot.jpg",
  mimeType: "image/jpeg",
  fileSize: 128000,
  width: 640,
  height: 640,
  photoStatus: "ready",
  crop: null,
  derivatives: [],
  updatedAt: "2026-08-26T10:00:00.000Z",
  photoConsent: true,
  profileVisibility: "private",
  cvUsageAllowed: true,
  publicSharingAllowed: false
};
const changedProfessionalPhotoFixture = { ...savedProfessionalPhotoFixture, photoAssetId: "photo-2", storagePath: "user-1/profile/photo-2.jpg", updatedAt: "2026-08-26T11:00:00.000Z" };
assert.equal(professionalPhotoRuntime.getCurrentProfessionalPhoto(savedProfessionalPhotoFixture)?.storagePath, "user-1/profile/photo-1.jpg", "Saved ready Professional Identity photo must be the canonical current photo.");
assert.equal(professionalPhotoRuntime.getCurrentProfessionalPhoto({ ...savedProfessionalPhotoFixture, photoStatus: "pending_upload" }), null, "Pending local photo uploads must not be treated as the saved current photo.");
assert.equal(professionalPhotoRuntime.getCurrentProfessionalPhoto({ ...savedProfessionalPhotoFixture, storagePath: "blob:http://localhost/photo" }), null, "Temporary browser photo URLs must never become the canonical current photo.");
assert.equal(professionalPhotoRuntime.getCurrentProfessionalPhoto(changedProfessionalPhotoFixture)?.storagePath, "user-1/profile/photo-2.jpg", "A later saved Professional Identity photo must replace stale downstream photo state.");
const careerPassportFixtureValues = {
  full_name: "Nicka Candida",
  city: "Johannesburg",
  country: "South Africa",
  career_goal: "IT Support",
  current_status: "employed",
  preferred_roles: ["Help Desk Support", "Technical Support"],
  skills: ["Communication", "Microsoft Excel", "IT Support", "Communication", "Customer Service"],
  education: ["BTech Information & Communication Technology"],
  projects: ["PATHZY employment-support technology platform"],
  achievements: [],
  certificates: [],
  experience: [
    { id: "exp-1", role: "Founder & Product Owner", company: "PATHZY", location: "Johannesburg", startDate: "2025", endDate: "Present", description: "Building employment-support technology.", achievements: [] },
    { id: "exp-2", role: "Co-founder & Marketing Lead", company: "AVOLITO Beverages", location: "Johannesburg", startDate: "2026", endDate: "Present", description: "Leading brand and marketing activity.", achievements: [] }
  ],
  professional_photo_asset: savedProfessionalPhotoFixture
};
const careerPassportCompleteChecks = {
  percentage: 100,
  requiredChecks: [
    { section: "career_goal", label: "Career Goal", complete: true, missingFields: [] },
    { section: "skills", label: "Skills", complete: true, missingFields: [] },
    { section: "availability", label: "Availability", complete: true, missingFields: [] }
  ]
};
const careerPassportWithoutDocuments = careerPassportProjectionRuntime.buildCareerPassportProjection({
  values: careerPassportFixtureValues,
  completion: careerPassportCompleteChecks,
  documents: [],
  updatedAt: "2026-08-26T10:00:00.000Z"
});
assert.equal(careerPassportWithoutDocuments.snapshot.name, "Nicka Candida", "Career Passport must use current canonical Professional Identity data.");
assert.equal(careerPassportWithoutDocuments.snapshot.careerDirection, "IT Support", "Career Passport snapshot must use the canonical target direction.");
assert.equal(careerPassportWithoutDocuments.updatedAt, "2026-08-26T10:00:00.000Z", "Career Passport must expose a derived update timestamp without implying manual editing.");
assert.equal(JSON.stringify(careerPassportWithoutDocuments.evidence.experience.map((entry) => entry.role)), JSON.stringify(["Founder & Product Owner", "Co-founder & Marketing Lead"]), "Career Passport must preserve separate canonical experience evidence without duplication.");
assert.equal(careerPassportWithoutDocuments.evidence.experience.some((entry) => "description" in entry), false, "Career Passport evidence must not reproduce full experience descriptions.");
assert.equal(JSON.stringify(careerPassportWithoutDocuments.offer.coreSkills), JSON.stringify(["IT Support", "Communication", "Microsoft Excel", "Customer Service"]), "Career Passport must curate and dedupe core skills instead of dumping repeated profile skills.");
assert.equal(careerPassportWithoutDocuments.nextBestAction.title, "Prepare your professional CV.", "Career Passport must return one highest-priority next action when CV readiness is missing.");
assert.equal(Array.isArray(careerPassportWithoutDocuments.nextBestAction), false, "Career Passport next-best-action engine must not return competing primary actions.");
const careerPassportWithCv = careerPassportProjectionRuntime.buildCareerPassportProjection({
  values: careerPassportFixtureValues,
  completion: careerPassportCompleteChecks,
  documents: [{ documentType: "cv", status: "ready", updatedAt: "2026-08-26T10:30:00.000Z" }],
  updatedAt: "2026-08-26T10:30:00.000Z"
});
assert.equal(careerPassportWithCv.readiness.find((item) => item.label === "CV")?.status, "Ready", "Creating a CV must update Career Passport CV readiness.");
assert.equal(careerPassportWithCv.nextBestAction.title, "Add supporting documents.", "After CV readiness, missing supporting documents should become the next useful action.");
const careerPassportWithSupport = careerPassportProjectionRuntime.buildCareerPassportProjection({
  values: careerPassportFixtureValues,
  completion: careerPassportCompleteChecks,
  documents: [
    { documentType: "cv", status: "ready", updatedAt: "2026-08-26T10:30:00.000Z" },
    { documentType: "certificate", status: "ready", category: "certificates", updatedAt: "2026-08-26T11:00:00.000Z" }
  ],
  updatedAt: "2026-08-26T11:00:00.000Z"
});
assert.equal(careerPassportWithSupport.readiness.find((item) => item.label === "Supporting documents")?.status, "In progress", "Adding eligible supporting documents must update supporting-document readiness.");
assert.equal(careerPassportWithSupport.milestones.find((item) => item.label === "Supporting documents added")?.complete, true, "Saved supporting progress must survive as document signals in the Passport projection.");
const changedTargetPassport = careerPassportProjectionRuntime.buildCareerPassportProjection({
  values: { ...careerPassportFixtureValues, career_goal: "Technical Support" },
  completion: careerPassportCompleteChecks,
  documents: [{ documentType: "cv", status: "ready" }],
  updatedAt: "2026-08-26T12:00:00.000Z"
});
assert.equal(changedTargetPassport.careerFocus[0]?.title, "Technical Support", "Changing target role must change the Career Focus projection.");
const incompleteCareerPassport = careerPassportProjectionRuntime.buildCareerPassportProjection({
  values: { full_name: "New User", professional_photo_asset: savedProfessionalPhotoFixture },
  completion: { percentage: 20, requiredChecks: [{ section: "career_goal", label: "Career Goal", complete: false, missingFields: ["Career goal"] }] },
  documents: [],
  updatedAt: null
});
assert.equal(incompleteCareerPassport.evidence.certificates[0], undefined, "Missing certificates must produce safe empty states rather than invented content.");
assert.equal(incompleteCareerPassport.nextBestAction.title, "Complete Career Goal.", "Critical missing canonical information must outrank low-value actions.");
assert.equal(professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity({ professional_photo_asset: savedProfessionalPhotoFixture }).profilePhotoAvailable, true, "LinkedIn projection must mark a saved Professional Identity photo as available.");
assert.equal(professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity({ professional_photo_asset: null }).profilePhotoAvailable, false, "LinkedIn projection must show the no-photo state when no saved Professional Identity photo exists.");
const photoEnabledCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel({ ...professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity({ full_name: "Photo Candidate", career_goal: "Operations Lead", email: "photo@example.com" }) }, "Executive Black", undefined, { ...savedProfessionalPhotoFixture, signedUrl: "https://example.supabase.co/storage/v1/object/sign/professional-photos/user-1/profile/photo-1.jpg" });
assert.match(photoEnabledCvHtml, /<img class="cv-el"[\s\S]*photo-1\.jpg[\s\S]*Professional profile photo/, "Photo-enabled CV templates must render the canonical Professional Identity photo.");
const noPhotoCvHtml = documentDownloadsRuntime.renderCvHtmlFromModel(professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity({ full_name: "No Photo Template Candidate", career_goal: "Analyst", email: "nophoto@example.com" }), "Modern ATS", undefined, { ...savedProfessionalPhotoFixture, signedUrl: "https://example.supabase.co/storage/v1/object/sign/professional-photos/user-1/profile/photo-1.jpg" });
assert.doesNotMatch(noPhotoCvHtml, /<img class="cv-el"[\s\S]*photo-1\.jpg/, "CV templates intentionally designed without a photograph must remain photo-free.");
const phase2dJourneyStepsSource = profileActionEditor.slice(profileActionEditor.indexOf("const journeySteps"), profileActionEditor.indexOf("const sectionAliases"));
assert.equal((phase2dJourneyStepsSource.match(/\{ key: "/g) ?? []).length, 23, "Phase 2D guided editor must contain exactly 23 Professional Identity sections.");
assert.match(appShell, /<LanguageSelector initialLanguage=\{profileLanguage\} \/>/, "Authenticated shell must expose the permanent interface language selector.");
assert.match(languageSelector, /useState<SupportedLanguageCode>\(\(\) => normalizeLanguageCode\(initialLanguage\)\)/, "Client language state must hydrate from the server-provided initial language instead of browser-only storage.");
assert.doesNotMatch(languageSelector, /localStorage\.getItem\(publicLanguageStorageKey\)/, "Initial language hydration must not prefer localStorage over the server-visible language source.");
assert.match(languageSelector, /useRouter[\s\S]*useTransition[\s\S]*const setLanguage = useCallback\(\(nextLanguage: SupportedLanguageCode\) =>[\s\S]*if \(normalizedLanguage === language\) return;[\s\S]*setLanguageState\(normalizedLanguage\)[\s\S]*persistPublicLanguage\(normalizedLanguage\)[\s\S]*router\.refresh\(\)/, "Changing interface language must update client provider state, persist the cookie, and refresh server-rendered content without a manual browser refresh.");
assert.match(languageSelector, /async function changeLanguage\(nextLanguage: SupportedLanguageCode\)[\s\S]*if \(nextLanguage === language\) return;[\s\S]*setLanguage\(nextLanguage\)/, "Clicking the already active language must not trigger duplicate persistence or refresh work.");
assert.match(serverLanguage, /cookieStore\.get\(interfaceLanguageCookieName\)/, "Server language resolution must read the shared interface language cookie.");
assert.match(serverLanguage, /suggestedLanguageFromBrowser\(headerStore\.get\("accept-language"\)\)/, "New visitors without a cookie should receive a server-rendered browser-language default.");
assert.match(rootLayout, /const initialLanguage = await getServerInterfaceLanguage\(\);[\s\S]*<html lang=\{initialLanguage\}>/, "The root document language must use the same server language source as hydrated client content.");
assert.match(homepage, /<PathzyLanguageProvider initialLanguage=\{initialLanguage\}>[\s\S]*<LandingContent/, "The public landing page must seed client language from the server language source.");
assert.match(appShell, /<PathzyLanguageProvider initialLanguage=\{interfaceLanguage\}>/, "Authenticated pages must seed client language from the same profile or cookie language used by server navigation.");
assert.match(appShell, /focusedOnboarding[\s\S]*journeyDecision\?\.currentState !== "home_ready"[\s\S]*journeyDecision\?\.currentState !== "diagnosis_complete"/, "Focused onboarding shell must hide full navigation until setup/diagnosis state is ready.");
assert.match(appShell, /user && !focusedOnboarding \? <FloatingMentorButton/, "Focused onboarding shell must hide floating mentor during first-time setup.");
assert.match(languagePreferences, /professionalDocumentLanguageLabels[\s\S]*same_as_interface[\s\S]*normalizeProfessionalDocumentLanguageChoice/, "Language preference architecture must support independent document language choices.");
assert.match(languageSelector, /publicLanguageStorageKey[\s\S]*document\.cookie[\s\S]*languageChangedEventName/, "Public language selection must persist before authentication and notify current pages.");
assert.match(profileActionEditor, /const \{ language: storedInterfaceLanguage, setLanguage: setPathzyInterfaceLanguage \} = usePathzyLanguage[\s\S]*current\.interface_language \|\| !storedInterfaceLanguage \? current : \{ \.\.\.current, interface_language: storedInterfaceLanguage \}/, "Professional Identity editor must seed an empty interface-language value without letting presentation switches rewrite canonical progress state.");
assert.match(profileActionEditor, /function updateInterfaceLanguage\(language: SupportedLanguageCode\)[\s\S]*setPathzyInterfaceLanguage\(language\)[\s\S]*updateValue\("interface_language", language\)/, "Professional Identity interface-language choices must update the shared provider while preserving the independent document-language value.");
assert.match(profileActionEditor, /setValues\(\(current\) => \(hasHydrated\.current \? \{ \.\.\.mergedInitialValues, \.\.\.current \} : mergedInitialValues\)\)/, "Professional Identity editor must preserve unsaved typed values when a language switch refreshes server-rendered content.");
assert.match(profileActionEditor, /useProfessionalIdentityAutosave<ProfessionalIdentityValues, JourneyStep>[\s\S]*persistStep[\s\S]*scheduleAutosave[\s\S]*retryActiveSave/, "Professional Identity editor must consume the shared client save pipeline instead of owning autosave request sequencing.");
assert.match(professionalIdentityAutosave, /export function useProfessionalIdentityAutosave[\s\S]*debounceMs = 700[\s\S]*latestSave[\s\S]*activeSave[\s\S]*lastPersistedSignature/, "Professional Identity autosave hook must own debounce, request sequencing and duplicate suppression.");
assert.match(professionalIdentityAutosave, /activeSave\.current\?\.controller\.abort\(\)[\s\S]*saveId === latestSave\.current[\s\S]*lastPersistedSignature\.current\.set/, "Professional Identity autosave hook must abort obsolete requests and ignore stale responses.");
assert.match(professionalIdentityAutosave, /persistOnboardingProgress[\s\S]*section: "onboarding_progress"[\s\S]*retrySave/, "Professional Identity autosave hook must expose onboarding persistence and Retry.");
assert.match(currentSituationContract, /currentSituationValues = \[[\s\S]*"employed"[\s\S]*"unemployed"[\s\S]*"student"[\s\S]*"self_employed"[\s\S]*"career_break"[\s\S]*"career_transition"[\s\S]*"graduate"[\s\S]*"first_time_job_seeker"[\s\S]*"other"/, "Current situation must have one stable language-independent enum contract.");
assert.match(currentSituationContract, /Diplômé[\s\S]*diplômé: "graduate"/, "Current situation compatibility must map the French graduate label to a canonical value.");
assert.match(currentSituationContract, /En reconversion[\s\S]*"en reconversion": "career_transition"/, "Current situation compatibility must map the French career-transition label to a canonical value.");
const currentSituationEditorBlock = profileActionEditor.slice(profileActionEditor.indexOf('field.name === "current_status"'), profileActionEditor.indexOf("function renderList"));
assert.match(currentSituationEditorBlock, /currentSituationValues\.map/, "Profile Current Situation must render from the canonical option list.");
assert.match(currentSituationEditorBlock, /updateValue\("current_status", situation\)/, "Profile Current Situation must save the stable canonical option value.");
assert.match(currentSituationEditorBlock, /currentSituationDisplayLabel\(activeLanguage, situation\)/, "Profile Current Situation must display translated labels through the safe shared resolver.");
assert.doesNotMatch(profileActionEditor, /currentSituationLabels\[activeLanguage\]\[situation\]/, "Professional Identity must not index current-situation labels with an unnormalized runtime language.");
assert.match(currentSituationContract, /normalizeSupportedLanguage\(language, fallbackLanguage\)/, "Current Situation labels must normalize language before lookup.");
assert.match(currentSituationContract, /currentSituationLabels\[resolvedLanguage\]\?\.\[normalized\] \?\? currentSituationLabels\.en\[normalized\]/, "Current Situation labels must fall back safely when a translation key is missing.");
assert.match(profileActionEditor, /const activeLanguage: SupportedLanguageCode = normalizeSupportedLanguage\(storedInterfaceLanguage, values\.interface_language\)/, "Professional Identity active language must follow the shared provider while preserving the saved canonical interface-language value.");
assert.match(pathzyI18n, /function resolvedLanguage\(language\?: string \| null\): SupportedLanguageCode[\s\S]*normalizeSupportedLanguage\(language\)/, "Shared i18n helpers must normalize runtime language values before dictionary lookup.");
assert.match(pathzyI18n, /export function professionalIdentitySectionText\(language: SupportedLanguageCode \| string \| null \| undefined[\s\S]*professionalIdentitySectionTranslations\[normalizedLanguage\]\?\.\[sectionKey\]/, "Professional Identity section labels must be resolved through the shared safe section helper.");
assert.doesNotMatch(profileActionEditor, /professionalIdentitySectionTranslations\[activeLanguage\]/, "Profile editor must not index Professional Identity section translations directly.");
assert.doesNotMatch(professionalIdentityPage, /professionalIdentitySectionTranslations\[interfaceLanguage\]/, "Professional Identity review must not index section translations directly.");
assert.match(professionalIdentityCompletion, /interface_language: normalizeLanguageCode\(firstText\(answers\.interface_language, profile\?\.language\)\)/, "Professional Identity hydration must normalize interface language before passing values to the client.");
assert.match(professionalIdentityCompletion, /languages: answerList\(discovery, "languages"\)/, "Professional Identity hydration must not derive professional spoken languages from the interface/profile language.");
assert.match(professionalIdentityCompletion, /normalizeProfessionalIdentityCompletionValues[\s\S]*current_status: normalizeCurrentSituation[\s\S]*interface_language: interfaceLanguage \? normalizeLanguageCode\(interfaceLanguage\) : ""/, "Professional Identity completion must normalize canonical section values before calculating progress.");
assert.match(cvConfiguration, /normalizeLanguageCode\(language\)[\s\S]*labels\[resolvedLanguage\]\?\.\[purpose\] \?\? labels\.en\[purpose\]/, "Professional document enum label maps must normalize language before lookup.");
for (const sectionName of ["Profil", "Informations personnelles", "Nationalité", "Autorisation de travail", "Objectif professionnel", "Résumé professionnel", "Compétences", "Préférences d'emploi", "Disponibilité"]) {
  assert.match(pathzyI18n, new RegExp(sectionName), `French Professional Identity section translation must include ${sectionName}.`);
}
assert.match(professionalIdentityWriteService, /professionalIdentityWriteSections = new Set\(\[[\s\S]*"profile"[\s\S]*"preferences"/, "Professional Identity write service must accept the new Profile and Preferences sections.");
assert.match(professionalIdentityWriteService, /section === "preferences"[\s\S]*professional_document_language/, "Professional Identity write service must persist the Preferences section document-language field.");
assert.match(professionalIdentityWriteService, /function currentSituationPatch[\s\S]*return currentStatus \? \{ current_status: currentStatus, employment_status: currentStatus \} : \{\}/, "Profile Current Situation must use one canonical compatibility patch and avoid writing empty aliases.");
assert.match(professionalIdentityWriteService, /section === "profile"[\s\S]*currentSituationPatch\(values\)[\s\S]*section === "personalInfo"[\s\S]*currentSituationPatch\(values\)[\s\S]*section === "currentStatus"[\s\S]*currentSituationPatch\(values\)/, "Profile, Personal Information, and legacy Current Status saves must share the same current-situation write path.");
assert.match(professionalIdentityWriteService, /section === "profile" \|\| section === "currentStatus"[\s\S]*return currentSituationPatch\(values\)/, "Profile Current Situation must be dual-written to Professional Identity compatibility answers only when a canonical value exists.");
assert.match(professionalIdentityReadService, /current_status,employment_status/, "Professional Identity read service must load both current_status and employment_status aliases after login.");
assert.match(professionalIdentityCompletion, /normalizeCurrentSituation\(firstText\(profile\?\.current_status, profile\?\.employment_status, answers\.current_status, answers\.employment_status, answers\.currentSituation/, "Professional Identity completion must read current situation from profile and compatibility aliases.");
assert.match(professionalIdentityWriteService, /redirectTo: "\/discovery\?reason=setup-complete"/, "Finish Setup must transition to Employment Diagnosis rather than Home or documents.");
assert.doesNotMatch(professionalProfileApi, /redirectTo: appRoutes\.authenticatedHome/, "Finish Setup must not route directly to Home.");
assert.match(professionalIdentityWriteService, /from\("user_profiles"\)\.upsert/, "Professional Identity write service must create or update the user's profile row.");
assert.match(professionalIdentityWriteService, /from\("discovery_responses"\)/, "Professional Identity write service must update discovery-backed profile sections.");
assert.match(professionalIdentityWriteService, /profilePhoto[\s\S]*employmentPreferences/, "Professional Identity write service must accept the full guided Professional Identity journey.");
assert.match(professionalIdentityWriteService, /section === "availability"\) return \{ availability: textValue\(values, "availability"\) \};/, "Saving Availability must patch only Availability and must not clear existing employment preferences.");
assert.doesNotMatch(professionalProfileApi, /from\("user_profiles"\)\.upsert|from\("discovery_responses"\)|updatePathzyBrain/, "Professional Profile API route must not own storage writes or sync directly.");
assert.match(professionalIdentitySync, /updatePathzyBrain/, "Professional Identity synchronization engine must refresh employment readiness after saving.");
assert.match(professionalProfileApi, /Server-Timing[\s\S]*X-Pathzy-Profile-Save-Duration-Ms/, "Professional Profile save responses must expose safe timing metadata for QA without logging personal values.");
assert.match(professionalProfileApi, /redirectTo: "\/professional-identity"/, "Professional Profile save endpoint must report the canonical return destination.");
const profileSaveSuccessPayload = professionalProfileApi.slice(professionalProfileApi.lastIndexOf("return timedJson({ ok: true, section"));
assert.doesNotMatch(profileSaveSuccessPayload, /\/settings|\/billing|\/roadmap|\/onboarding/, "Professional Profile save endpoint must not redirect profile edits to unrelated workflows.");
assert.match(discoveryAnswerState, /export const discoveryAnswerKeys[\s\S]*personal_background[\s\S]*preferred_career_direction/, "Employment Diagnosis must define one canonical answer-key list for first question through final question.");
assert.match(discoveryAnswerState, /emptyDiscoveryAnswers\(\)[\s\S]*Object\.fromEntries\(discoveryAnswerKeys\.map\(\(key\) => \[key, ""\]\)\)/, "Employment Diagnosis must initialize every question with an empty-string default.");
assert.match(discoveryAnswerState, /safeDiscoveryText\(value: unknown\): string[\s\S]*typeof value === "string" \? value : ""/, "Employment Diagnosis must normalize undefined and null answers to safe strings.");
assert.match(discoveryAnswerState, /normalizeDiscoveryAnswers\(value: unknown\)[\s\S]*safeDiscoveryText\(source\[key\]\)/, "Employment Diagnosis refresh/resume state must rebuild missing answers safely.");
assert.match(discoveryAnswerState, /missingDiscoveryAnswerKeys\(answers: unknown\)[\s\S]*!normalized\[key\]\.trim\(\)/, "Employment Diagnosis required validation must trim only normalized string answers.");
assert.match(pathzyI18n, /export function getEmploymentDiagnosisSteps\(language: SupportedLanguageCode \| string \| null \| undefined\)[\s\S]*resolvedLanguage\(language\)[\s\S]*steps\.map\(\(\[key, title, prompt, placeholder\]/, "Employment Diagnosis must normalize language and convert localized tuple data into renderable question objects before the UI reads title, prompt, and placeholder.");
const diagnosisStepSource = pathzyI18n.slice(pathzyI18n.indexOf("export const employmentDiagnosisSteps"), pathzyI18n.indexOf("export type EmploymentDiagnosisStep"));
assert.equal((diagnosisStepSource.match(/\["personal_background"/g) ?? []).length, 2, "Employment Diagnosis must define Step 1 for both English and French.");
assert.equal((diagnosisStepSource.match(/\["preferred_career_direction"/g) ?? []).length, 2, "Employment Diagnosis must define the final career-direction question for both English and French.");
assert.equal((diagnosisStepSource.match(/\["/g) ?? []).length, 20, "Employment Diagnosis must keep approximately 10 concise sections in each supported language.");
assert.match(adaptiveDiagnosisSource, /EmploymentDiagnosisSession[\s\S]*currentQuestionId[\s\S]*answeredQuestionIds[\s\S]*branchHistory[\s\S]*countryContextVersion/, "Phase 3D must define a canonical diagnosis session model with answer, branch, country, and version metadata.");
assert.match(adaptiveDiagnosisSource, /NOT_STARTED[\s\S]*IN_PROGRESS[\s\S]*PAUSED[\s\S]*COMPLETED[\s\S]*NEEDS_REVIEW[\s\S]*STALE[\s\S]*FAILED/, "Phase 3D must define canonical diagnosis session statuses.");
assert.match(adaptiveDiagnosisSource, /ANSWERED[\s\S]*SKIPPED[\s\S]*USER_DECLINED[\s\S]*NOT_APPLICABLE[\s\S]*UNKNOWN/, "Phase 3D must keep skipped, declined, not-applicable, and unknown answer states distinct.");
assert.match(adaptiveDiagnosisSource, /EMPLOYMENT_SITUATION[\s\S]*JOB_SEARCH_ACTIVITY[\s\S]*APPLICATION_QUALITY[\s\S]*INTERVIEW_HISTORY[\s\S]*IMMEDIATE_INCOME_NEED[\s\S]*COUNTRY_CONTEXT_CLARIFICATION/, "Phase 3D must define the authoritative diagnosis question taxonomy.");
assert.match(adaptiveDiagnosisSource, /SINGLE_SELECT[\s\S]*MULTI_SELECT[\s\S]*YES_NO[\s\S]*DOCUMENT_AVAILABLE[\s\S]*LOCATION_RADIUS[\s\S]*AVAILABILITY_PATTERN/, "Phase 3D must support structured accessible diagnosis question types.");
assert.match(adaptiveDiagnosisSource, /questionIsKnownFromIdentity[\s\S]*skip_when_work_authorisation_confirmed|SKIP_KNOWN_IDENTITY/, "Adaptive diagnosis must skip questions already answered reliably in Professional Identity.");
assert.match(adaptiveDiagnosisSource, /\.sort\(\(a, b\) => a\.priority - b\.priority \|\| a\.questionId\.localeCompare\(b\.questionId\)\)[\s\S]*selectNextDiagnosisQuestion/, "Adaptive diagnosis must use deterministic priority ordering for question selection.");
assert.match(adaptiveDiagnosisSource, /shouldDeferOptional[\s\S]*DEFER_OPTIONAL/, "Adaptive diagnosis must defer optional questions until high-value diagnostic areas are answered.");
assert.match(adaptiveDiagnosisSource, /STANDARD[\s\S]*PLAIN_LANGUAGE[\s\S]*HIGH_GUIDANCE[\s\S]*ASSISTED/, "Adaptive diagnosis must include lower-literacy and assisted presentation modes.");
assert.match(adaptiveDiagnosisSource, /sensitivity[\s\S]*USER_DECLINED[\s\S]*Prefer not to say/, "Sensitive diagnosis questions must expose a prefer-not-to-say option.");
assert.match(adaptiveDiagnosisSource, /buildDiagnosisIdentitySuggestions[\s\S]*status: "PENDING"[\s\S]*source: "EMPLOYMENT_DIAGNOSIS"/, "Diagnosis may create identity suggestions but must not apply them automatically.");
assert.match(adaptiveDiagnosisSource, /mapDiagnosisToEmploymentIntelligenceInput[\s\S]*professionalIdentity[\s\S]*employmentDiagnosis/, "Diagnosis results must map into the Phase 3B intelligence input while preserving Professional Identity as authoritative.");
assert.match(generateRoadmapApi, /generateEmploymentIntelligenceWithTrace[\s\S]*mapDiagnosisToEmploymentIntelligenceInput/, "Diagnosis completion must refresh an Employment Intelligence draft through the deterministic engine.");
assert.match(generateRoadmapApi, /loadOrCreateDiagnosisSession[\s\S]*saveDiagnosisSession/, "Diagnosis must load and save server-backed session state.");
assert.match(generateRoadmapApi, /rowId[\s\S]*saveDiagnosisSession/, "Diagnosis saves must update the current diagnosis row when possible instead of creating arbitrary duplicate sessions.");
assert.doesNotMatch(generateRoadmapApi, /generateOpenAIRoadmap|OpenAI|roadmap_90_days/, "Phase 3D diagnosis must not depend on generative AI or create a final Career Plan.");
assert.match(generateRoadmapApi, /resolveCountryEmploymentContext[\s\S]*countryCodeFromIdentity/, "Adaptive diagnosis must use South Africa or generic country context.");
assert.match(discoveryFlow, /fetch\(`\/api\/generate-roadmap\?language=\$\{activeLanguage\}`/, "Employment Diagnosis UI must load the server-backed adaptive session for the active language.");
assert.match(discoveryFlow, /mode: "save_answer"[\s\S]*questionId: currentQuestion\.questionId[\s\S]*value: currentValue/, "Employment Diagnosis UI must save each answer before advancing.");
assert.match(discoveryFlow, /mode: "complete"[\s\S]*router\.replace\(nextPayload\.redirectTo \?\? appRoutes\.authenticatedHome\)/, "Employment Diagnosis UI must follow the API's canonical post-completion redirect.");
assert.match(discoveryFlow, /answerIsValid\(currentQuestion, currentValue\)[\s\S]*disabled=\{saving \|\| \(Boolean\(currentQuestion\) && !currentAnswerIsValid\)\}/, "Employment Diagnosis Continue must be enabled only when the current adaptive answer is valid.");
assert.match(discoveryFlow, /Array\.isArray\(currentValue\)[\s\S]*toggleMulti/, "Employment Diagnosis UI must safely handle structured multi-select answers.");
assert.doesNotMatch(discoveryFlow, /currentValue\.trim\(\)/, "Employment Diagnosis must not call trim on raw answer values.");
assert.match(adaptiveDiagnosisSource, /phase3dAdaptiveDiagnosisFixtures[\s\S]*graduateNoExperience[\s\S]*cleanerInformalExperience[\s\S]*securityLicenceUncertainty[\s\S]*genericNonZaUser/, "Phase 3D must include fictional adaptive fixtures across the required scenario matrix.");
assert.match(adaptiveDiagnosisSource, /NATIONALITY_NOT_WORK_AUTHORIZATION|Nationality alone is not used|Nationality does not determine work authorisation/i, "Phase 3D must preserve the fairness rule that nationality does not determine work authorisation.");
assert.match(adaptiveDiagnosisSource, /Limited access changes support steps only|does not reduce your capability/, "Limited internet or literacy must change support mode, not capability scoring.");
assert.match(adaptiveDiagnosisSource, /UNKNOWN[\s\S]*USER_DECLINED[\s\S]*NOT_APPLICABLE/, "Unknown, declined, and not-applicable answers must remain canonical codes.");
assert.match(adaptiveDiagnosisSource, /label: \{ en,[\s\S]*fr \}/, "Adaptive question options must support English and French labels without storing translated values as answers.");
assert.doesNotMatch(discoveryFlow, /employmentDiagnosisSteps\[language\] as unknown as DiagnosisStep/, "Employment Diagnosis UI must not cast tuple data to objects and render undefined titles.");
assert.match(generateRoadmapApi, /questionPayload[\s\S]*currentQuestion[\s\S]*progress[\s\S]*canComplete/, "Employment Diagnosis API must expose the current adaptive question, progress, and completion state for QA and clients.");
assert.doesNotMatch(discoveryFlow, /answers\[currentStep\.key\]\.trim\(\)|currentValue\.trim\(\)(?![\s\S]*discovery\.required)/, "Employment Diagnosis must not call trim on raw answer values.");
assert.match(employmentNextActionSource, /EMPLOYMENT_ACTION_ENGINE_VERSION_3E[\s\S]*3E\.1/, "Phase 3E must version the Next-Best-Action and Career Plan engine independently.");
assert.match(employmentNextActionSource, /IDENTITY_COMPLETION[\s\S]*EVIDENCE_STRENGTHENING[\s\S]*EMPLOYMENT_DIAGNOSIS[\s\S]*DOCUMENT_PREPARATION[\s\S]*JOB_SEARCH[\s\S]*APPLICATION_PREPARATION[\s\S]*INTERVIEW_PREPARATION[\s\S]*FOLLOW_UP[\s\S]*SKILL_DEVELOPMENT[\s\S]*PRACTICAL_SUPPORT[\s\S]*PATHWAY_EXPLORATION[\s\S]*HUMAN_SUPPORT/, "Phase 3E must define the required profession-neutral action categories.");
assert.match(employmentNextActionSource, /ELIGIBLE[\s\S]*BLOCKED[\s\S]*ALREADY_COMPLETED[\s\S]*NOT_RELEVANT[\s\S]*DEFERRED/, "Phase 3E actions must have explicit states instead of hidden UI assumptions.");
assert.match(employmentNextActionSource, /COMPLETE_PROFESSIONAL_IDENTITY[\s\S]*COMPLETE_EMPLOYMENT_DIAGNOSIS[\s\S]*CREATE_FIRST_CV[\s\S]*FIND_RELEVANT_OPPORTUNITIES[\s\S]*PREPARE_APPLICATION_PACKAGE[\s\S]*PREPARE_FOR_INTERVIEW/, "Phase 3E must include identity, diagnosis, document, opportunity, application and interview actions.");
assert.match(employmentNextActionSource, /EXPLORE_IMMEDIATE_INCOME_OPTIONS[\s\S]*(?:URGENT_INCOME[\s\S]*longer-term career plan|longer-term career plan[\s\S]*URGENT_INCOME)/i, "Phase 3E must handle immediate income needs without abandoning longer-term planning.");
assert.match(employmentNextActionSource, /priorityBreakdown[\s\S]*actionPriorityWeights[\s\S]*urgency[\s\S]*impact[\s\S]*effort[\s\S]*supportIntensity/, "Phase 3E prioritisation must be explicit and explainable rather than a hidden score.");
assert.match(employmentNextActionSource, /findDependencyCycles[\s\S]*dependencyGraph[\s\S]*unmetActionDependencies/, "Phase 3E must model action dependencies and detect dependency cycles.");
assert.match(employmentNextActionSource, /completedActionCodes[\s\S]*hasCv[\s\S]*hasCoverLetter[\s\S]*hasSubmittedApplication/, "Phase 3E must skip completed actions based on history and existing documents or applications.");
assert.match(employmentNextActionSource, /selectSecondaryActionCandidates[\s\S]*limit = 3[\s\S]*selected\.length >= limit/, "Phase 3E must return only one primary action and a bounded set of secondary actions.");
assert.match(employmentNextActionSource, /determineNextBestActions[\s\S]*primary[\s\S]*secondary/, "Phase 3E must expose one authoritative next-best-action selector.");
assert.match(employmentNextActionSource, /generateCareerPlan[\s\S]*TODAY[\s\S]*THIS_WEEK[\s\S]*THIS_MONTH[\s\S]*NEXT_3_MONTHS[\s\S]*LONGER_TERM/, "Phase 3E must generate a multi-horizon Career Plan.");
assert.match(employmentNextActionSource, /primaryActionCode[\s\S]*dependencyGraph[\s\S]*actionRegistryVersion/, "Phase 3E Career Plan output must reference action codes, dependencies and engine version metadata.");
assert.match(employmentNextActionSource, /STANDARD[\s\S]*PLAIN_LANGUAGE[\s\S]*HIGH_GUIDANCE[\s\S]*ASSISTED/, "Phase 3E actions must preserve accessibility presentation modes inherited from diagnosis.");
assert.match(employmentNextActionSource, /determineNextBestActions[\s\S]*generateCareerPlan[\s\S]*nextBestAction: actionSet\.primary[\s\S]*secondaryActions: actionSet\.secondary[\s\S]*careerPlan/, "Employment Intelligence generation must consume the Phase 3E action engine instead of the Phase 3B preliminary action.");
assert.doesNotMatch(employmentNextActionSource, /generateOpenAIRoadmap|OpenAI|salary estimate|roadmap_90_days|automatic apply|auto-apply/i, "Phase 3E must not introduce generative AI, salary promises, 90-day roadmap copy or automatic applications.");
for (const phase3fTable of [
  "employment_intelligence_profiles",
  "employment_action_recommendations",
  "employment_career_plans",
  "employment_action_history",
  "employment_intelligence_recompute_attempts"
]) {
  assert.match(employmentIntelligencePersistenceMigration, new RegExp(`create table if not exists public\\.${phase3fTable}`), `Phase 3F migration must create ${phase3fTable}.`);
}
assert.match(employmentIntelligencePersistenceMigration, /employment_intelligence_one_current_idx[\s\S]*where status = 'CURRENT'/, "Phase 3F must enforce one CURRENT intelligence profile per user.");
assert.match(employmentIntelligencePersistenceMigration, /alter table public\.employment_intelligence_profiles enable row level security[\s\S]*alter table public\.employment_action_history enable row level security/, "Phase 3F migrations must enable RLS on derived intelligence tables.");
assert.match(employmentIntelligencePersistenceMigration, /auth\.uid\(\) = user_id/, "Phase 3F RLS policies must scope access to auth.uid().");
assert.match(employmentIntelligencePersistenceMigration, /Users can view own employment intelligence profiles[\s\S]*Users can update own employment action history/, "Phase 3F RLS policies must cover intelligence profiles through action history.");
assert.match(employmentIntelligencePersistenceMigration, /finalize_employment_intelligence_current[\s\S]*auth\.uid\(\) <> p_user_id[\s\S]*status = 'SUPERSEDED'[\s\S]*status = 'CURRENT'/, "Phase 3F must finalize current intelligence transactionally with authenticated ownership checks.");
assert.doesNotMatch(employmentIntelligencePersistenceMigration, /\bdrop table\b|\btruncate\b|\bdelete from\b/i, "Phase 3F migration must not destructively remove existing data.");
assert.match(employmentIntelligencePersistenceSource, /stableCanonicalStringify[\s\S]*deterministicInputHash[\s\S]*interface_language[\s\S]*theme|interface_language[\s\S]*theme[\s\S]*stableCanonicalStringify[\s\S]*deterministicInputHash/, "Phase 3F input hashing must be deterministic and ignore presentation-only fields.");
assert.match(employmentIntelligencePersistenceSource, /buildEmploymentIntelligenceInputs[\s\S]*getProfessionalIdentityReadModelSafe[\s\S]*selectEmploymentDiagnosisDiscoveryRow[\s\S]*resolveCountryEmploymentContext/, "Phase 3F recompute inputs must come from Professional Identity, Diagnosis and Country Context.");
assert.match(employmentIntelligencePersistenceSource, /recomputeEmploymentIntelligence[\s\S]*previous_valid_preserved[\s\S]*attemptRepo\.fail/, "Phase 3F recompute must preserve the previous valid result when recomputation fails.");
assert.match(employmentIntelligencePersistenceSource, /recomputeIdempotencyKey[\s\S]*inputSnapshotHash[\s\S]*engineVersion[\s\S]*countryContextVersion/, "Phase 3F recompute must be idempotent across input and engine versions.");
assert.match(employmentIntelligencePersistenceSource, /staleReasonForChangedFields[\s\S]*ignoredStaleFields[\s\S]*interfaceLanguage[\s\S]*documentLanguage[\s\S]*theme/, "Phase 3F stale engine must ignore language and presentation changes.");
assert.match(employmentIntelligencePersistenceSource, /ActionHistoryRepository[\s\S]*validTransitions[\s\S]*Unknown action code[\s\S]*employment_action_history/, "Phase 3F Action History must validate registry action codes and transitions.");
assert.match(employmentIntelligencePersistenceSource, /refreshCareerPlanProgressFromActionHistory[\s\S]*COMPLETED[\s\S]*progress_json/, "Phase 3F Career Plan progress must derive from Action History.");
assert.match(employmentIntelligencePersistenceSource, /createSupabaseServerClient[\s\S]*auth\.supabase\.auth\.getUser[\s\S]*authenticatedUser: auth\.user[\s\S]*auth\.user\.id/, "Phase 3F API must derive ownership from authenticated Supabase user.");
assert.match(employmentIntelligencePersistenceSource, /isEmploymentIntelligenceSchemaUnavailable[\s\S]*PGRST205[\s\S]*PGRST202[\s\S]*schema cache/, "Phase 3F must classify missing Employment Intelligence migration/schema-cache errors safely.");
assert.match(employmentIntelligencePersistenceSource, /getDetailedEmploymentIntelligence[\s\S]*catch \(error\)[\s\S]*safePersistenceError[\s\S]*status: "unavailable"/, "Phase 3F detailed service must return a safe unavailable state instead of throwing raw Supabase errors.");
assert.match(employmentIntelligencePersistenceSource, /safeEmploymentIntelligenceDiagnostic[\s\S]*console\.warn\("\[employment-intelligence\] detailed read fallback used"/, "Phase 3F detailed service must keep sanitized server diagnostics for migration/RLS failures.");
assert.doesNotMatch(employmentIntelligencePersistenceSource, /clientUserId|userId\s*:\s*body\.userId|generateOpenAIRoadmap|OpenAI|salary estimate|live job matching|Phase 3G/i, "Phase 3F must not trust client user IDs or introduce AI, salary, live matching or Phase 3G UI work.");
assert.match(employmentIntelligenceUiSource, /getDetailedEmploymentIntelligence\(supabase, user\.id\)[\s\S]*buildEmploymentHomeViewModel/, "Phase 3G Home must read persisted Employment Intelligence through the Phase 3F service layer.");
assert.match(employmentIntelligenceUiSource, /EmploymentIntelligenceHome[\s\S]*primaryAction[\s\S]*secondaryActions\.map/, "Phase 3G Home must render one primary action and secondary actions from the shared view model.");
assert.match(employmentIntelligenceUiSource, /secondaryActions[\s\S]*\.slice\(0, 3\)/, "Phase 3G must limit secondary actions to three without recalculating priority.");
assert.match(employmentIntelligenceUiSource, /useNextBestActions[\s\S]*updateEmploymentAction[\s\S]*operation: "action_transition"/, "Phase 3G action UI must update persisted Action History through the authenticated API.");
assert.match(employmentIntelligenceUiSource, /CareerPlanPreview[\s\S]*(progressLabel[\s\S]*appRoutes\.careerPlan|appRoutes\.careerPlan[\s\S]*progressLabel)/, "Phase 3G must expose persisted Career Plan progress and route to the full Career Plan.");
assert.match(employmentIntelligenceUiSource, /app\/discovery\/results|DiagnosisResultsPage[\s\S]*getDetailedEmploymentIntelligence[\s\S]*EmploymentActionCard/, "Phase 3G Diagnosis Results must present persisted intelligence rather than raw questionnaire answers.");
assert.match(employmentIntelligenceUiSource, /Employment insights need setup[\s\S]*Phase 3 persistence setup[\s\S]*status === "unavailable"|status === "unavailable"[\s\S]*Employment insights need setup[\s\S]*Phase 3 persistence setup/, "Diagnosis Results must render a safe setup-required state when the Phase 3 persistence migration is missing.");
assert.match(employmentIntelligenceUiSource, /Preparing your employment insights[\s\S]*status === "not_generated"[\s\S]*IntelligenceFreshnessPanel|status === "not_generated"[\s\S]*IntelligenceFreshnessPanel[\s\S]*Preparing your employment insights/, "Diagnosis Results must render a recoverable preparing state when no current intelligence exists.");
assert.doesNotMatch(employmentIntelligenceUiSource, /\{ code, details: null, hint: null, message \}|JSON\.stringify\(.*error|throw error/, "Diagnosis Results UI must never render raw Supabase error objects.");
assert.match(employmentIntelligenceUiSource, /IntelligenceFreshnessPanel[\s\S]*previous results are still available|r\u00e9sultats pr\u00e9c\u00e9dents restent disponibles/, "Phase 3G must preserve previous valid intelligence messaging during update failure.");
assert.match(employmentIntelligenceUiSource, /normalizeLanguageCode[\s\S]*language === "fr"[\s\S]*language === "fr"/, "Phase 3G presentation must support English and French from the same canonical codes.");
assert.match(employmentIntelligenceUiSource, /aria-live="polite"/, "Phase 3G intelligence UI must announce freshness and update states.");
assert.match(employmentIntelligenceUiSource, /action\.whySentence[\s\S]*\{pending \? t\.pending : t\.start\}/, "Phase 3G action cards must show one plain-language why sentence before the primary action.");
assert.doesNotMatch(employmentIntelligenceUiSource, /action\.expectedOutcome|action\.confidenceLabel|action\.effort|action\.stateLabel|action\.why\.map|\{action\.reason\}/, "Phase 3G action cards must not render debug metadata, raw reasons, or reason-code lists.");
assert.match(employmentIntelligenceUiSource, /ProgressBar/, "Phase 3G intelligence UI must include accessible progress semantics.");
assert.match(employmentIntelligenceUiSource, /credentials: "same-origin"[\s\S]*\/api\/employment-intelligence/, "Phase 3G client access must be authenticated and account-scoped through same-origin API calls.");
assert.doesNotMatch(employmentIntelligenceUiSource, /generateEmploymentIntelligenceWithTrace|generateEmploymentIntelligence\(|selectNextBestAction|rankActions|salary estimate|live job matching|OpenAI|clientUserId|body\.userId/, "Phase 3G UI must not recalculate intelligence, add AI/live facts, or trust client user IDs.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface,[\s\S]*\.pathzy-auth-shell \.glass,[\s\S]*\.pathzy-auth-shell \.pathzy-card \{[\s\S]*background: var\(--auth-card\)/, "Authenticated light cards must establish the readable warm-card boundary for shared Card surfaces.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface \.text-white,[\s\S]*\.pathzy-auth-shell \.glass \.text-white,[\s\S]*\.pathzy-auth-shell \.pathzy-card \.text-white[\s\S]*color: var\(--auth-text\) !important/, "Authenticated light cards must prevent white text from remaining on warm-white surfaces.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface \[class\*="text-white\\\\\/"\],[\s\S]*\.pathzy-auth-shell \.pathzy-card \[class\*="text-white\\\\\/"\][\s\S]*color: var\(--auth-muted\) !important/, "Muted text on authenticated light cards must resolve to accessible muted charcoal instead of pale white.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface \[class\*="text-\[#f87171\]"\][\s\S]*color: var\(--pathzy-red-dark\) !important/, "Phase 3 accent text must use readable PATHZY red on authenticated light cards.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface \[class\*="text-\[#93c5fd\]"\][\s\S]*color: var\(--pathzy-red-dark\) !important/, "Phase 3 link accent text must use readable PATHZY red on authenticated light cards.");
assert.match(appGlobals, /\.pathzy-auth-shell \.surface \.blue-purple[\s\S]*color: #ffffff !important/, "Primary buttons on authenticated light cards must keep visible white labels.");
for (const tokenName of [
  "--background-app",
  "--background-elevated",
  "--surface-dark",
  "--surface-light",
  "--surface-subtle",
  "--text-primary",
  "--text-secondary",
  "--text-inverse",
  "--border-default",
  "--focus-ring",
  "--brand-primary",
  "--brand-primary-hover",
  "--brand-primary-pressed",
  "--status-success",
  "--status-warning",
  "--status-danger",
  "--radius-card",
  "--button-height",
  "--input-height"
]) {
  assert.match(appGlobals, new RegExp(`${tokenName}:`), `Global PATHZY design tokens must define ${tokenName}.`);
}
assert.match(appGlobals, /\.blue-purple \{[\s\S]*var\(--brand-primary\)[\s\S]*var\(--brand-primary-hover\)/, "Legacy blue-purple product action class must resolve to the PATHZY red token system.");
assert.match(appGlobals, /\[class\*="bg-\[#5B8CFF"\][\s\S]*background-color: var\(--brand-primary\) !important/, "Global visual guard must remap legacy hard-coded blue product backgrounds to PATHZY red.");
assert.match(appShell, /pathzy-page-shell[\s\S]*bg-\[color-mix\(in_srgb,var\(--background-elevated\)_92%,transparent\)\]/, "Authenticated navigation must use the shared PATHZY shell tokens.");
assert.doesNotMatch(appShell, /overflow-x-auto|whitespace-nowrap/, "Authenticated mobile navigation must wrap without clipped horizontal scrolling.");
assert.doesNotMatch(appShell + "\n" + readFileSync("components/ui.tsx", "utf8"), /#5B8CFF|#7B5CFF|#2563EB|rgba\(91,140,255|rgba\(123,92,255|rgba\(123, 92, 255/, "Core shell and shared UI must not reintroduce the old blue/purple brand palette.");
assert.match(appGlobals, /\.pathzy-control-primary[\s\S]*var\(--brand-primary\)/, "Workspace controls must include the shared primary PATHZY red utility.");
assert.match(appGlobals, /\.pathzy-control-secondary/, "Workspace controls must include the shared secondary utility.");
assert.match(appGlobals, /\.pathzy-status-info/, "Workspace status surfaces must include the shared information utility.");
assert.match(appGlobals, /\.pathzy-status-warning/, "Workspace status surfaces must include the shared warning utility.");
assert.doesNotMatch(
  [
    opportunitiesHub,
    interviewPrepClient,
    employmentTrackerClient,
    missionSystem,
    professionalIdentityTool,
    documentWorkspaceStatusSurfaces
  ].join("\n"),
  /#5B8CFF|#7B5CFF|#7C5CFF|#9D5BFF|#2563EB|#93c5fd|#FFD166|#ffd166|#ffe2a3|#ffe7a3|#aac1ff|#39d98a|#9df0c4|#b9f8d5|#c7d6ff|#ded6ff|bg-blue|border-blue|text-blue/,
  "Authenticated workspace components must use PATHZY tokens/classes instead of retired blue, purple, yellow or ad hoc success palettes."
);
assert.match(opportunitiesHub, /pathzy-control-primary[\s\S]*opportunities\.import\.inspect/, "Job Intelligence primary actions must use the shared PATHZY red control utility and localized copy.");
assert.match(opportunitiesHub, /pathzy-status-info[\s\S]*opportunities\.import\.eyebrow/, "Job Import workspace must use a shared neutral information surface and localized copy instead of a page-specific blue theme.");
assert.match(opportunitiesHub, /usePathzyLanguage\(\)[\s\S]*pathzyPhase2T\(language, key\)/, "Opportunities must read interface language from the shared PATHZY language provider.");
assert.match(opportunitiesHub, /opportunityTabs[\s\S]*opportunities\.tabs\.recommended[\s\S]*opportunities\.tabs\.all/, "Opportunities tabs must be rendered from localized tab keys.");
assert.match(pathzyI18n, /"opportunities\.title": "Opportunities for you"[\s\S]*"opportunities\.title": "Opportunités pour vous"/, "Opportunities workspace must include English and French interface copy.");
assert.match(appShell, /app\.shell\.tagline[\s\S]*public\.footer\.disclaimer/, "The shared app shell footer must render through centralized language copy.");
assert.match(employmentIntelligenceUiSource, /mergeDuplicateEvidenceRecords[\s\S]*uniqueByCode[\s\S]*secondaryActions/, "Phase 3G view models must de-duplicate persisted strength, barrier, dimension and action collections before rendering.");
assert.match(generateRoadmapApi, /recomputeEmploymentIntelligence[\s\S]*trigger: "diagnosis_completed"[\s\S]*redirectTo: appRoutes\.diagnosisResults/, "Diagnosis completion must persist Employment Intelligence through Phase 3F and route to Diagnosis Results.");
for (const saveStatusCopy of [
  "Unsaved changes",
  "Saving...",
  "Still saving...",
  "Could not save",
  "Retry",
  "You can continue when saving finishes.",
  "Modifications non enregistrées",
  "Enregistrement en cours...",
  "Impossible d'enregistrer",
  "Réessayer",
  "Vous pourrez continuer une fois l'enregistrement terminé."
]) {
  assert.match(pathzyI18n, new RegExp(saveStatusCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Professional Identity save status translations must include ${saveStatusCopy}.`);
}
for (const permanentReviewCopy of [
  "Professional Identity Overview",
  "Save and return to Review",
  "Return to Professional Identity",
  "Missing required information",
  "Last updated",
  "Up to date",
  "Vue d'ensemble de l'Identité Professionnelle",
  "Enregistrer et revenir à la vérification",
  "Revenir à l'Identité Professionnelle",
  "Informations obligatoires manquantes",
  "Dernière mise à jour",
  "À jour"
]) {
  assert.match(pathzyI18n, new RegExp(permanentReviewCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Permanent Professional Identity Review copy must include ${permanentReviewCopy}.`);
}
assert.match(professionalIdentityPage, /identity\.sync\.changed[\s\S]*identity\.sync\.dependents/, "Professional Identity changes must show localized downstream sync invalidation without automatic regeneration.");
assert.match(roadmapPage, /normalizeLanguageCode\(identityReadModel\.values\.interface_language \?\? profile\?\.language\)/, "Home must use the Professional Identity interface language as its initial language source.");
assert.match(roadmapPage, /greetingFor\(interfaceLanguage\)/, "Home greeting must be rendered through the localized greeting helper.");
assert.doesNotMatch(roadmapPage, /Good morning|Good afternoon|Good evening|Journey progress|Professional direction in progress/, "Home must not hardcode English greeting, progress, or title fallback copy.");
assert.match(roadmapPage, /localizedProfessionalTitle\(interfaceLanguage, profile\?\.career_goal \|\| profile\?\.preferred_path \|\| ""\)/, "Home career title fallback must be localized when a known translation exists.");
assert.match(profileActionEditor, /const professionalDocumentLanguage:[\s\S]*normalizeProfessionalDocumentLanguageChoice\(values\.professional_document_language\) === "fr"[\s\S]*normalizeProfessionalDocumentLanguageChoice\(values\.professional_document_language\) === "en"[\s\S]*activeLanguage/, "Professional Identity suggestions must resolve the Professional Document Language independently through the shared language normalizer.");
assert.match(profileActionEditor, /pathzyPhase2List\(professionalDocumentLanguage, "identity\.suggestions\.skills"\)/, "Professional Identity skills suggestions must come from the document-language dictionary.");
assert.doesNotMatch(profileActionEditor, /suggestions: \["Communication"[\s\S]*"Data analysis"/, "French profiles must not inherit an English hardcoded skills suggestion array.");
assert.match(pathzyI18n, /"identity\.suggestions\.skills": "Communication\|Microsoft Excel\|Microsoft Word\|Service client\|Résolution de problèmes/, "French skill suggestions must include localized French user-visible text.");
assert.match(professionalIdentityPage, /professionalIdentityStepText\(interfaceLanguage, item\.section, "guidance", item\.guidance\)/, "Review missing-section guidance must be localized through the shared Professional Identity step copy.");
assert.match(professionalIdentityTool, /Free users can build, edit, save, and preview core documents/, "Free users must not be told that saving is locked.");
assert.doesNotMatch(professionalIdentityTool, /download, save, and export/, "Upgrade copy must not imply free users cannot save documents.");

assert.match(exportStandard, /PATHZY is the editor\./, "Export standard must define PATHZY as the editor.");
assert.match(exportStandard, /PDF is the final published document\./, "Export standard must define PDF as the final document.");
assert.match(exportStandard, /The CV model is the single source of truth/, "Export standard must require the CV model as source of truth.");
assert.match(exportStandard, /Premium visual quality is required, not optional\./, "Export standard must require premium visual quality.");
assert.match(professionalIdentityCvModel, /export function cvModelFromProfessionalIdentity/, "CV workspace must use a reusable Professional Identity to CV model transformation layer.");
assert.match(professionalCvPage, /getProfessionalIdentityReadModel\(supabase, user\)[\s\S]*professionalIdentityCvDocument\(identityReadModel\.values/, "My CV must read Professional Identity and create a synchronized CV document before the client renders.");
assert.match(professionalCvPage, /loadSavedProfessionalDocument\(supabase, user\.id, \{ tool: "cv" \}\)[\s\S]*savedCvDocument \?\? generatedCvDocument/, "My CV must hydrate the latest saved CV artifact before falling back to a generated Professional Identity projection.");
assert.match(savedProfessionalDocuments, /from\("user_documents"\)[\s\S]*\.eq\("user_id", userId\)[\s\S]*input\.documentId[\s\S]*\.eq\("id", input\.documentId\)/, "Saved professional document loading must always scope reads by authenticated user before document id.");
assert.match(professionalCvPage, /initialDocument=\{initialCvDocument\}[\s\S]*cvSyncStatus=\{cvSyncStatus\}/, "My CV must pass the Professional Identity-derived CV model and sync status into the shared workspace.");
assert.match(professionalIdentityCvModel, /languages: cleanList\(identity\.languages\)\.map\(splitLanguage\)/, "Professional Identity languages must map into the CV model through canonical values, not interface labels.");
assert.match(professionalIdentityCvModel, /professionalIdentityHrefForCvSection[\s\S]*routeBuilders\.professionalIdentitySection/, "CV section edit actions must route to the matching Professional Identity section with return context.");
assert.match(professionalIdentityTool, /Edit in Professional Identity/, "CV factual section changes must send the user to Professional Identity instead of a duplicate CV form.");
assert.doesNotMatch(professionalIdentityTool, /draft\.fullName = event\.target\.value;|draft\.targetRole = event\.target\.value;/, "CV workspace must not expose a separate factual editor for Professional Identity fields.");
assert.doesNotMatch(professionalIdentityTool, /event\.target\.value\.trim\(\)/, "Editor inputs must not trim while the user is typing.");
assert.match(professionalIdentityTool, /normalizeCvModelForExport\(cvModel\)/, "Saved CV drafts must store the cleaned CV model without mutating fields while typing.");
assert.match(professionalIdentityTool, /type CvVersionMetadata = \{[\s\S]*designSystem: string;[\s\S]*versionName: string;[\s\S]*createdAt: string;[\s\S]*updatedAt: string;[\s\S]*lastDownloadedAt: string \| null;[\s\S]*\};/, "CV design versions must store explicit design and timestamp metadata.");
assert.match(professionalIdentityTool, /function cvContentJson\(document: GeneratedProfessionalDocument \| null, cvModel: CvModel, metadata: CvVersionMetadata\)/, "CV content JSON must keep cvModel and cvVersion as separate concepts.");
assert.match(professionalIdentityTool, /cvModel: normalizeCvModelForExport\(cvModel\),[\s\S]*cvVersion: metadata/, "CV version saves must use one CV model plus separate version metadata.");
assert.match(professionalIdentityTool, /function duplicateCvVersion/, "CV Builder must let users duplicate a CV design version.");
assert.match(professionalIdentityTool, /function renameCvVersion/, "CV Builder must let users rename a CV design version.");
assert.match(professionalIdentityTool, /Presentation changes only\. Your canonical CV content stays the same\./, "CV Builder must explain that design changes do not erase content without showing technical version controls.");
assert.match(myDocumentsPage, /\.filter\(\(row\) => !isWorkflowDocumentType\(row\.document_type\)\)[\s\S]*vaultDocumentFromRow/, "My Documents must filter workflow text artifacts before rendering the employment file vault.");
assert.doesNotMatch(myDocumentsPage, /linkedin_profiles|recruiter_messages|follow_up_emails|career_passport_summaries/, "My Documents must not fall back to legacy workflow text tables.");
assert.match(documentVaultContract, /export type VaultDocumentType =[\s\S]*"cv"[\s\S]*"cover_letter"[\s\S]*"certificate"[\s\S]*"diploma"[\s\S]*"licence"[\s\S]*"reference"[\s\S]*"portfolio_file"[\s\S]*"id_work_document"/, "My Documents must model only real employment-supporting file/document types.");
assert.match(documentVaultContract, /workflowDocumentTypes[\s\S]*"linkedin_profile"[\s\S]*"recruiter_message"[\s\S]*"follow_up_email"[\s\S]*"career_passport"[\s\S]*"application_email"[\s\S]*"linkedin_message"/, "My Documents must explicitly exclude workflow text artifacts from the vault.");
assert.match(documentVaultContract, /vaultCategoryLabels[\s\S]*CVs[\s\S]*Cover Letters[\s\S]*Certificates[\s\S]*Qualifications[\s\S]*Licences[\s\S]*References[\s\S]*Portfolio & Evidence[\s\S]*Other Documents/, "My Documents must expose clear employment file-vault categories.");
assert.match(myDocumentsClient, /Upload document[\s\S]*categoryOrder[\s\S]*visibleDocuments/, "My Documents must provide upload plus compact category filtering.");
assert.doesNotMatch(myDocumentsClient, /<textarea|copyText|duplicateDocument|Document title[\s\S]*<input className="field"/, "My Documents must not be an in-place text editor or duplicate generator.");
assert.match(documentVaultApi, /request\.formData\(\)[\s\S]*vaultDocumentStorageContract\.bucketName[\s\S]*\.upload\(storagePath, bytes/, "My Documents uploads must persist real files to the shared private employment document storage bucket.");
assert.match(documentVaultApi, /\.from\("user_documents"\)[\s\S]*user_id: auth\.user\.id[\s\S]*content_json: contentJson[\s\S]*file_url: storagePath/, "My Documents uploads must create an owned user_documents metadata row with the canonical storage path.");
assert.match(documentVaultApi, /const contentJson = \{[\s\S]*storage_path: storagePath[\s\S]*vault_category: vaultCategory[\s\S]*source: "my_documents_upload"/, "My Documents uploaded document metadata must retain the canonical storage path and selected category without storing a public URL.");
assert.match(documentVaultApi, /\.eq\("id", id\)[\s\S]*\.eq\("user_id", auth\.user\.id\)/, "My Documents open/delete operations must scope reads by authenticated owner and document id.");
assert.match(documentVaultApi, /createSignedUrl\(document\.storagePath, 300\)/, "My Documents Open must use short-lived signed URLs for private uploaded files.");
assert.match(documentVaultApi, /replaceDocumentId[\s\S]*existingVaultDocument\.source !== "uploaded"[\s\S]*previousStoragePath[\s\S]*remove\(\[previousStoragePath\]\)/, "My Documents Replace must preserve metadata ownership and clean up the replaced storage object.");
assert.match(documentVaultApi, /delete\(\)\.eq\("id", id\)\.eq\("user_id", auth\.user\.id\)[\s\S]*remove\(\[document\.storagePath\]\)/, "My Documents Delete must remove owned metadata and the underlying user file.");
assert.match(documentVaultApi, /storageFailureDiagnostic[\s\S]*process\.env\.NODE_ENV !== "development"[\s\S]*diagnostic/, "My Documents storage diagnostics must be sanitized and development-only.");
assert.match(documentVaultApi, /storageFailureResponse[\s\S]*console\.warn\("\[document-vault\] storage request failed"[\s\S]*vaultUploadErrorMessage\(code\)/, "My Documents storage failures must be logged safely without exposing infrastructure text to users.");
assert.match(myDocumentsClient, /downloadGeneratedDocument[\s\S]*downloadBlob[\s\S]*setNotice\("Your file has downloaded to your browser's Downloads folder\."\)/, "Downloading a vault document must be an action and must not create another document record.");
const myDocumentsGeneratedDownloadBlock = myDocumentsClient.slice(myDocumentsClient.indexOf("async function downloadGeneratedDocument"), myDocumentsClient.indexOf("async function saveDocumentPatch"));
assert.doesNotMatch(myDocumentsGeneratedDownloadBlock, /fetch\(/, "Downloading a generated document from My Documents must not create, patch, or duplicate user_documents records.");
assert.doesNotMatch(myDocumentsClient, /downloaded: true|status: "downloaded"|Duplicate/, "Downloaded must not be treated as a visible vault lifecycle status or duplicate document.");
assert.match(myDocumentsClient, /coverLetterDataFromUnknown\(document\.contentJson\?\.coverLetterData, document\.content\)[\s\S]*simpleCoverLetterPdfDocument\(coverLetterData\)[\s\S]*coverLetterPdfFilename\(coverLetterData\)/, "Saved Cover Letter downloads from My Documents must use the structured coverLetterData renderer and filename.");
assert.match(myDocumentsClient, /pendingUploadCategoryRef[\s\S]*uploadFile\(file, \{ category \}\)/, "My Documents upload handler must use the pending category captured before the file picker opens.");
assert.match(myDocumentsClient, /selectedCategory === "all" \? uploadCategory : selectedCategory/, "Empty category upload CTAs must upload into the selected category instead of stale state.");
assert.match(myDocumentsClient, /counts\[category\]/, "My Documents category counts must render from the current client document collection.");
assert.match(myDocumentsClient, /storageServiceUnavailable && !visibleDocuments\.length[\s\S]*Document upload is temporarily unavailable/, "My Documents must not show the normal empty-vault state at the same time as a storage failure.");
assert.doesNotMatch(myDocumentsClient, /Document storage is not ready yet|PATHZY storage is configured|Document storage permissions blocked/, "My Documents must not expose infrastructure storage language to normal users.");
assert.match(myDocumentsClient, /sm:flex-wrap sm:overflow-visible/, "My Documents categories must wrap on larger screens instead of disappearing off-canvas.");
assert.match(myDocumentsClient, /No documents yet\.[\s\S]*No \$\{label\} yet\./, "My Documents empty states must distinguish All Documents from category-specific empty states.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "cv-1", document_type: "cv", document_title: "IT Support CV", status: "ready" })?.category, "cvs", "Saved CV documents must appear once under CVs.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "letter-1", document_type: "cover_letter", document_title: "Maintenance & Support - Cover Letter", status: "ready" })?.category, "cover_letters", "Saved cover letters must appear once under Cover Letters.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "cert-1", document_type: "certificate", document_title: "First Aid Certificate", status: "ready" })?.category, "certificates", "Uploaded certificates must appear under Certificates.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "cover-upload-1", document_type: "supporting_document", document_title: "Cover Letter", status: "ready", content_json: { vault_category: "cover_letters" } })?.category, "cover_letters", "Uploaded supporting files must preserve the selected vault category.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "linkedin-1", document_type: "linkedin_profile", document_title: "LinkedIn About", status: "draft" }), null, "LinkedIn drafts must not appear as My Documents vault items.");
assert.equal(documentVaultRuntime.vaultDocumentFromRow({ id: "follow-1", document_type: "follow_up_email", document_title: "Follow up", status: "draft" }), null, "Follow-up text must not appear as My Documents vault items.");
assert.equal(documentVaultRuntime.validateVaultUploadInput({ fileName: "certificate.pdf", mimeType: "application/pdf", sizeBytes: 1000 }).ok, true, "Vault upload validation must allow supported PDF files.");
assert.equal(documentVaultRuntime.validateVaultUploadInput({ fileName: "script.exe", mimeType: "application/octet-stream", sizeBytes: 1000 }).ok, false, "Vault upload validation must reject unsupported formats.");
assert.equal(documentVaultRuntime.validateVaultUploadInput({ fileName: "certificate.pdf", mimeType: "image/png", sizeBytes: 1000 }).ok, false, "Vault upload validation must reject extension/MIME mismatches server-side.");
assert.equal(documentVaultRuntime.compactDocumentTitle("Letter IT support cover letter", "cover_letter"), "IT Support — Cover Letter", "Generated Cover Letter names must be compact and recruiter-readable.");
assert.equal(documentVaultRuntime.compactDocumentTitle("IT Support CV", "cv"), "IT Support — CV", "Generated CV names must be compact and recruiter-readable.");
assert.equal(documentVaultRuntime.vaultStoragePath("user-a", "doc-1", "Microsoft Azure Fundamentals Certificate.pdf"), "user-a/documents/doc-1/Microsoft-Azure-Fundamentals-Certificate.pdf", "Vault storage paths must remain user-scoped and deterministic.");
assert.match(documentDownloads, /return \{ name: cv\.fullName, targetRole: cv\.targetRole, contact: contactLines\(cv\), sections \};/, "CV renderer must map fullName and targetRole to separate output fields.");
assert.match(documentDownloads, /first\.elements\.push\(\{ kind: "text", x: 52, y: 42[\s\S]*text: cv\.name/, "Designed CV header must render the candidate name from fullName.");
assert.match(documentDownloads, /if \(cv\.targetRole\) first\.elements\.push\(\{ kind: "text"[\s\S]*text: cv\.targetRole/, "Designed CV header must render targetRole as the header role line.");
assert.match(documentDownloads, /cv\.contact\.forEach\(\(item\) => \{[\s\S]*pushWrappedText\(first\.elements, item/, "Designed CV header must render only contact lines from contact data.");
assert.match(documentDownloads, /executive: \["Professional Summary", "Career Goal"/, "Professional Summary must render as a normal main section in executive layouts.");
assert.match(documentDownloads, /modern: \["Professional Summary", "Projects"/, "Professional Summary must render as a normal main section in modern layouts.");
assert.match(documentDownloads, /const order = orders\[premiumTemplate\.identity\] \?\? \["Professional Summary", "Career Goal"/, "Professional Summary must render as a normal main section in fallback layouts.");
assert.doesNotMatch(documentDownloads, /heroSummary|headerSummary|tagline: professionalSummary|subtitle: professionalSummary|intro: professionalSummary|description: professionalSummary/, "Professional Summary must never be mapped into the CV header.");
assert.doesNotMatch(documentDownloads, /pushWrappedText\(first\.elements,\s*section\(cv,\s*"Professional Summary"/, "Designed CV header must not draw Professional Summary text.");
assert.match(documentDownloads, /`FULL NAME: \$\{professionalizeLine\(cv\.name\)\}`/, "Serialized CV must keep full name mapped to full name.");
assert.match(documentDownloads, /`TARGET ROLE: \$\{professionalizeLine\(cv\.targetRole\)\}`/, "Serialized CV must keep target role mapped to target role.");
assert.match(documentDownloads, /\.replace\(\/\\bmicrosoft\\s\+microsoft\\s\+word\\b\/gi, "Microsoft Word"\)/, "CV cleanup must repair Microsoft Microsoft Word.");
assert.doesNotMatch(documentDownloads, /\.replace\(\/\\bword\\b\/gi, "Microsoft Word"\)/, "CV cleanup must not turn Microsoft Word into Microsoft Microsoft Word.");
assert.match(documentDownloads, /const seen = new Set<string>\(\);[\s\S]*seen\.has\(key\)/, "CV cleanup must remove duplicate skills case-insensitively.");
assert.match(professionalIdentityService, /fullName: cvCandidateName\(inputs\),/, "Generated CV model must set fullName from the candidate name.");
assert.match(professionalIdentityService, /targetRole: goal,/, "Generated CV model must set targetRole from the career goal.");
assert.match(professionalIdentityService, /const cvVersion = \{[\s\S]*designSystem: templateName,[\s\S]*versionName: title,[\s\S]*createdAt: now,[\s\S]*updatedAt: now,[\s\S]*lastDownloadedAt: null[\s\S]*\};/, "Generated CVs must create initial CV version metadata.");
assert.match(professionalIdentityService, /contentJson: \{ cvModel, cvVersion \}/, "Generated CVs must save cvModel and cvVersion together.");
assert.match(professionalIdentityCvModel, /contentJson: \{[\s\S]*source: "professional_identity"[\s\S]*cvModel,[\s\S]*cvVersion:/, "Professional Identity-derived CV documents must preserve the structured CV model and active version metadata for preview, PDF, and reload.");
assert.match(professionalIdentityTool, /templateName: nextData\.designSystem/, "Template switching must keep presentation metadata separate from Professional Identity factual data.");
assert.match(professionalIdentityTool, /previewCvModel/, "CV preview must use a stable debounced preview model.");
assert.match(professionalIdentityTool, /setTimeout\(\(\) => \{\s*setPreviewCvModel\(cvModel\);\s*\}, 260\);/, "CV preview updates must be debounced to reduce layout shaking while typing.");
assert.match(professionalIdentityTool, /function sectionStatus/, "CV editor must show explicit section visibility status.");
assert.match(professionalIdentityTool, /"Visible"/, "CV editor statuses must include Visible.");
assert.match(professionalIdentityTool, /"Empty"/, "CV editor statuses must include Empty.");
assert.match(professionalIdentityTool, /"Hidden"/, "CV editor statuses must include Hidden.");
assert.match(professionalIdentityTool, /const skillGroupSections = \[[\s\S]*Core[\s\S]*Technical[\s\S]*Professional[\s\S]*\];/, "CV Skills editor must expose Core, Technical, and Professional skill groups.");
assert.match(professionalIdentityTool, /renderSyncedCvSection\("Core Competencies \/ Skills", skillGroupSections\.flatMap\(\(group\) => cvSectionItems\(group\.title\)\)\)/, "CV Skills must render synchronized summaries from canonical skill groups instead of duplicate editable fields.");
assert.doesNotMatch(professionalIdentityTool, /function renderSkillsSection|function renderSkillGroup|function renderRepeatableSection/, "The CV workspace must not keep old repeatable factual editor renderers.");
for (const sectionName of ["Certifications", "Achievements", "References", "Volunteer Experience", "Awards", "Publications", "Conferences", "Professional Memberships", "Interests", "Portfolio Links"]) {
  assert.match(professionalIdentityTool, new RegExp(`"${sectionName}"`), `${sectionName} must remain available as a repeatable CV section.`);
}
assert.match(professionalIdentityTool, /type CvPreviewScaleMode = "fit_page" \| "fit_width" \| "custom"/, "CV preview must support fit-page, fit-width, and custom zoom modes.");
assert.match(professionalIdentityTool, /const cvA4Page = \{ width: 794, height: 1123 \}/, "CV preview scaling must use the same A4 page dimensions as the export renderer.");
assert.match(professionalIdentityTool, /ResizeObserver\(calculateScale\)/, "CV preview must recalculate fit-page scaling when its viewport changes.");
assert.match(professionalIdentityTool, /availableWidth \/ cvA4Page\.width[\s\S]*availableHeight \/ cvA4Page\.height/, "CV Fit Page must account for both preview width and height.");
assert.match(professionalIdentityTool, /Fit Page[\s\S]*Fit Width[\s\S]*aria-label="Zoom Out"[\s\S]*aria-label="Zoom In"/, "CV preview must expose Fit Page, Fit Width, Zoom Out, and Zoom In controls.");
assert.match(appGlobals, /--text-on-dark-primary:\s*#[0-9a-fA-F]{6};/, "The global design system must expose a primary readable text token for dark surfaces.");
assert.match(appGlobals, /--control-text-dark-default:\s*#[0-9a-fA-F]{6};[\s\S]*--control-text-dark-active:\s*#[0-9a-fA-F]{6};[\s\S]*--control-text-dark-disabled:\s*#[0-9a-fA-F]{6};/, "Dark-surface controls must define readable default, active, and disabled foreground tokens.");
assert.match(appGlobals, /\.pathzy-dark-control[\s\S]*color:\s*var\(--control-text-dark-default\)/, "Shared dark controls must use the readable dark-control default text token.");
assert.match(appGlobals, /\.pathzy-dark-control-active,[\s\S]*\.pathzy-dark-control\[data-active="true"\][\s\S]*color:\s*var\(--control-text-dark-active\)/, "Shared active dark controls must use the active dark-control text token.");
assert.match(appGlobals, /\.pathzy-dark-control:disabled,[\s\S]*\.pathzy-dark-control\[aria-disabled="true"\][\s\S]*opacity:\s*1;[\s\S]*color:\s*var\(--control-text-dark-disabled\)/, "Disabled dark controls must remain legible instead of becoming invisible through opacity.");
assert.match(appGlobals, /\.pathzy-dark-control:focus-visible[\s\S]*outline:\s*2px solid var\(--control-dark-focus\)/, "Dark-surface controls must keep a visible keyboard focus state.");
const cvPreviewToolbarBlock = professionalIdentityTool.slice(
  professionalIdentityTool.indexOf("function renderCvPreviewToolbar()"),
  professionalIdentityTool.indexOf("function renderCvPreviewViewer()"),
);
assert.match(cvPreviewToolbarBlock, /pathzy-dark-control-surface[\s\S]*Designed[\s\S]*Fit Page[\s\S]*Fit Width[\s\S]*pathzy-dark-control-indicator/, "CV preview toolbar controls must use the shared dark-surface control system.");
assert.doesNotMatch(cvPreviewToolbarBlock, /text-white\/(?:5|6|7|8)|disabled:opacity/, "CV preview toolbar must not rely on low-opacity white text or opacity-disabled labels on a dark surface.");
assert.doesNotMatch(professionalIdentityTool, /CvMobileWorkspaceTab|renderCvMobileTabs|Preview CV/, "CV workspace must use the natural Template Gallery -> full A4 Preview flow instead of the old edit/preview tab split.");
assert.doesNotMatch(professionalIdentityTool, /tool === "cv" \? "Professional Identity source"|tool === "cv" \? "Edit Professional Identity"/, "The shared CV workspace branch must not render a persistent Professional Identity source/editor block.");
assert.match(professionalIdentityTool, /const scaledWidth = cvA4Page\.width \* cvPreviewScale[\s\S]*style=\{\{ width: scaledWidth, height:/, "Mobile CV preview must reserve only the scaled A4 width and actual scaled page height to prevent horizontal overflow and blank canvas growth.");
assert.match(documentDownloads, /if \(clean\.length\) sections\.push\(\{ title, items: clean \}\);/, "Empty CV sections must be hidden from preview and PDF.");
assert.match(documentDownloads, /forbiddenOutputPatterns[\s\S]*pathzy\\s\+\(score\|workspace\|dashboard\|application\|guidance\|navigation\|editor\|builder\|support system\)[\s\S]*\/will not invent\/i[\s\S]*\/add your\/i/, "Export renderer must filter internal PATHZY guidance and placeholders without deleting genuine PATHZY employer records.");
assert.match(documentDownloads, /function chunkLines/, "Long CV content must be chunked for pagination.");
assert.match(documentDownloads, /function estimateMainItemHeight/, "Main CV sections must estimate height before pagination.");
assert.match(documentDownloads, /sideOverflow/, "Sidebar overflow must move into paginated content instead of running off Page 1.");
assert.match(documentDownloads, /function splitSideSectionToFit/, "Long sidebar sections must split instead of creating compressed skills or blank page gaps.");
assert.match(documentDownloads, /splitSideSectionToFit\(side, sidebarW, 1038 - sideY\)/, "Sidebar flow must use available page space before pushing overflow into paginated content.");
assert.match(documentDownloads, /function splitLongWord/, "Long unbroken skill names must wrap instead of clipping or overlapping.");
assert.match(documentDownloads, /flatMap\(\(word\) => splitLongWord\(word, width, size\)\)/, "CV text wrapping must break oversized words before layout.");
assert.match(documentDownloads, /"Projects", "Volunteer Experience", "Education"/, "Volunteer Experience must appear after Experience/Projects and before Education.");
assert.match(documentDownloads, /"Achievements", "Awards"/, "Awards must appear after Achievements.");
assert.match(documentDownloads, /"Interests", "References"/, "References must appear at the bottom of main CV sections.");
assert.match(documentDownloads, /"Portfolio \/ LinkedIn \/ GitHub \/ Website", "Languages"/, "Languages must stay near the bottom of the side column.");
assert.match(documentDownloads, /layout\.pages\.map/, "Preview renderer must show every generated page.");
assert.match(documentDownloads, /data-a4-preview="true"/, "Designed Preview must render an explicit A4 document surface.");
assert.match(documentDownloads, /aspect-ratio:210\/297/, "Designed Preview must preserve A4 proportions in the browser.");
assert.match(documentDownloads, /container-type:inline-size/, "A4 document pages must scale responsively inside the available preview width.");
assert.match(documentDownloads, /for \(const layoutPage of layout\.pages\)/, "PDF export must include every generated page.");
assert.match(documentDownloads, /function roundedRectPath/, "PDF export must render rounded CV cards instead of flattening preview cards into plain rectangles.");
assert.match(documentDownloads, /function circlePath/, "PDF export must render circular markers so the visual language matches preview.");
assert.match(documentDownloads, /simplePdfDocumentFromModel[\s\S]*professionalPhoto\?: ProfessionalPhotoAssetView \| null, paletteId\?: string[\s\S]*pdfFromLayout\(buildCvLayoutFromModel\(cv, templateName, undefined, professionalPhoto, paletteId\)\)/, "PDF export must use the same photo-aware and palette-aware CV layout renderer as preview.");
assert.match(documentDownloads, /export function renderCvHtmlFromModel\(cv: CvModel, templateName\?: string, activeSection\?: string, professionalPhoto\?: ProfessionalPhotoAssetView \| null, paletteId\?: string\)[\s\S]*buildCvLayoutFromModel\(cv, templateName, activeSection, professionalPhoto, paletteId\)/, "Designed Preview must use the shared photo-aware and palette-aware CV layout renderer.");
assert.match(documentDownloads, /export function renderAtsCvHtmlFromModel\(cvInput: CvModel\)[\s\S]*cv\.fullName[\s\S]*cv\.targetRole[\s\S]*sections\.map/, "ATS Preview must keep header fields separate from semantic sections.");
assert.match(documentDownloads, /pathzyEliteDesignSystem/, "CV renderer must use the shared PATHZY elite document design system.");
assert.match(documentDownloads, /function buildSingleColumnCvLayout/, "ATS and International templates must have a true single-column A4 layout path.");
assert.match(documentDownloads, /premiumTemplate\.identity === "ats" \|\| premiumTemplate\.identity === "international"[\s\S]*buildSingleColumnCvLayout/, "Modern ATS and International Standard must render structurally different single-column CV layouts.");
assert.match(documentDownloads, /function printableCvSections/, "Single-column layouts must render real CV sections from the canonical model without creating another content source.");
assert.match(documentDownloads, /rightRail = \["executive", "consulting", "engineering"\]\.includes/, "Executive, Consulting, and Engineering templates must use a visibly different right-rail document architecture.");
assert.match(documentDownloads, /graduate: \["Professional Summary", "Education", "Projects", "Internships"/, "Graduate Elite must use an education-first document architecture after the Summary section.");
assert.match(documentDownloads, /healthcare: \["Professional Summary", "Certifications", "Education", "Professional Experience"/, "Healthcare Professional must elevate credentials and education near the top after the Summary section.");
assert.match(documentDownloads, /engineering: \["Professional Summary", "Projects", "Professional Experience"/, "Engineering must prioritize technical projects and experience after the Summary section.");
const activeCvTemplateNames = documentTemplateEngineRuntime.documentTemplateGallery.map((template) => template.name);
assert.equal(documentTemplateEngineRuntime.documentTemplateGallery.length, 50, "Runtime CV template gallery must expose exactly 50 active elite designs.");
assert.equal(new Set(activeCvTemplateNames).size, activeCvTemplateNames.length, "Published active CV template names must be unique.");
for (const template of documentTemplateEngineRuntime.documentTemplateGallery) {
  assert.equal(template.palettes.length, 4, `${template.name} must expose exactly four curated palettes.`);
  assert.equal(new Set(template.palettes.map((palette) => palette.id)).size, 4, `${template.name} palette ids must be unique.`);
  assert.ok(template.palettes.every((palette) => palette.paper && palette.accent && palette.ink), `${template.name} palettes must include printable paper, accent, and ink colours.`);
}
assert.equal(
  documentTemplateEngineRuntime.documentTemplateGallery.flatMap((template) => template.palettes).length,
  200,
  "50 CV designs must produce 200 palette variants without counting palettes as templates."
);
const requiredCvFamilyCounts = new Map([
  ["Executive & Leadership", 8],
  ["Corporate & Professional", 8],
  ["ATS & Minimal", 8],
  ["Technical / IT / Engineering", 7],
  ["Graduate / Early Career", 6],
  ["Creative / Product / Marketing", 5],
  ["Academic / Public Sector / Healthcare", 4],
  ["International / NGO / Career Change", 4]
]);
for (const [family, expectedCount] of requiredCvFamilyCounts) {
  assert.equal(documentTemplateEngineRuntime.documentTemplateGallery.filter((template) => template.family === family).length, expectedCount, `${family} must publish ${expectedCount} active templates.`);
}
for (const retiredName of ["Google Style", "Microsoft Professional", "Deloitte Consulting"]) {
  assert.ok(!activeCvTemplateNames.includes(retiredName), `${retiredName} must not appear in the active CV template gallery.`);
}
const paletteRenderTemplate = documentTemplateEngineRuntime.templateMetadata("Meridian Executive");
const paletteRenderHtml = documentDownloadsRuntime.renderCvHtmlFromModel(
  professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity({ full_name: "Palette Candidate", career_goal: "Operations Lead", email: "palette@example.com" }),
  paletteRenderTemplate.name,
  undefined,
  null,
  paletteRenderTemplate.palettes[1].id
);
assert.match(paletteRenderHtml, new RegExp(paletteRenderTemplate.palettes[1].accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "Designed Preview must apply the selected CV palette accent.");
const pdfColorToken = (hex, stroke = false) => {
  const clean = hex.replace("#", "");
  const values = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map((part) => (Number.parseInt(part, 16) / 255).toFixed(3));
  return `${values.join(" ")} ${stroke ? "RG" : "rg"}`;
};
const paletteRenderPdf = documentDownloadsRuntime.simplePdfDocumentFromModel(
  "Palette Candidate CV",
  professionalIdentityCvModelRuntime.cvModelFromProfessionalIdentity({ full_name: "Palette Candidate", career_goal: "Operations Lead", email: "palette@example.com" }),
  paletteRenderTemplate.name,
  null,
  paletteRenderTemplate.palettes[1].id
);
assert.ok(paletteRenderPdf.startsWith("%PDF-"), "CV export must generate a real PDF body.");
assert.match(paletteRenderPdf, /\/Type \/Page\b/, "CV export must contain at least one PDF page.");
assert.match(paletteRenderPdf, /Palette Candidate/, "CV export must contain the current candidate content.");
assert.match(paletteRenderPdf, new RegExp(pdfColorToken(paletteRenderTemplate.palettes[1].accent).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "PDF export must apply the selected CV palette accent.");
for (const templateName of ["Meridian Executive", "Atlas Professional", "Vanguard ATS", "Regent Corporate", "Horizon Technical", "Lumina Graduate", "Atelier Portfolio", "Keystone Public Service", "Nexus International", "Bridge Career Change"]) {
  assert.ok(activeCvTemplateNames.includes(templateName), `${templateName} must remain registered in the active reusable template engine.`);
}
for (const [legacyName, expectedName] of [
  ["PATHZY Signature Professional", "Atlas Professional"],
  ["Executive Black", "Meridian Executive"],
  ["Modern ATS", "Clarity ATS"],
  ["Google Style", "Horizon Technical"],
  ["Microsoft Professional", "Regent Corporate"],
  ["Deloitte Consulting", "Forge Consultant"],
  ["Creative Premium", "Atelier Portfolio"],
  ["Healthcare Professional", "Clinical Professional"],
  ["Graduate Elite", "Lumina Graduate"],
  ["Engineering", "Horizon Technical"],
  ["International Standard", "Nexus International"]
]) {
  assert.equal(documentTemplateEngineRuntime.normalizeDocumentTemplate(legacyName), expectedName, `${legacyName} must normalize to the new active CV template library.`);
}
assert.match(documentTemplateEngine, /DocumentTemplatePalette[\s\S]*palettes: \[DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette\]/, "CV template registry must model exactly four palettes per template.");
assert.match(documentTemplateEngine, /curateTemplatePalettes[\s\S]*id: `\$\{slug\(name\)\}-\$\{slug\(palette\.name\)\}`/, "CV palettes must be curated metadata on each template, not separate template entries.");
assert.match(documentTemplateEngine, /normalizeDocumentTemplatePalette[\s\S]*templatePaletteMetadata/, "CV palette selection must have shared normalization and metadata lookup helpers.");
assert.match(professionalIdentityTool, /paletteId: string[\s\S]*normalizeDocumentTemplatePalette/, "CV version metadata must persist the selected template palette.");
assert.match(professionalIdentityTool, /templatePalette[\s\S]*setValues[\s\S]*templatePalette: version\.paletteId/, "CV workspace must hydrate the saved template palette after refresh or reload.");
assert.match(professionalIdentityTool, /updateValue\("templatePalette", paletteId\)/, "CV palette swatches must update the same document presentation state as templates.");
assert.match(documentDownloads, /overflow-wrap:anywhere/, "CV renderer must guard against long unbroken text escaping A4 containers.");
assert.match(documentDownloads, /width - 62[\s\S]*cardHeight = Math\.max\(58/, "CV dynamic timeline cards must reserve safe width and height for long experience content.");
assert.match(documentTemplateEngine, /MAX_TEMPLATE_VARIANTS_PER_DESIGN = 1/, "CV template registry must prevent duplicate active template entries for the same underlying design.");
assert.match(documentTemplateEngine, /designKey[\s\S]*templateVariantCounts[\s\S]*validateTemplateVariantLimit\(\)/, "CV template metadata must track design families and enforce variant limits in the shared registry.");
assert.match(documentTemplateEngine, /family[\s\S]*atsClassification[\s\S]*atsCharacteristic[\s\S]*recruiterCharacteristic[\s\S]*bestFor[\s\S]*thumbnail/, "Template gallery metadata must include families, honest ATS classifications, recruiter characteristics, best-for labels, and thumbnails.");
for (const classification of ["ATS HIGH", "ATS BALANCED", "VISUAL / RECRUITER-FIRST"]) {
  assert.match(documentTemplateEngine, new RegExp(classification.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Template gallery must include ${classification} templates.`);
}
assert.match(documentTemplateEngine, /photoCapability: ProfessionalPhotoTemplateCapability/, "CV template metadata must declare a professional-photo capability contract.");
assert.match(documentTemplateEngine, /noPhoto[\s\S]*optionalPhoto[\s\S]*creativePhoto/, "Template photo capability presets must support disabled, optional, and recommended photo architectures.");
assert.match(documentTemplateEngine, /photoMode: "none"/, "At least one CV template must explicitly disable photo rendering.");
assert.match(documentTemplateEngine, /photoMode: "optional"/, "At least one CV template must support optional canonical photo rendering.");
assert.match(documentTemplateEngine, /photoMode: "recommended"/, "At least one CV template must support a photo-recommended architecture.");
assert.match(documentTemplateEngine, /fallbackLayout: "text-only-header"[\s\S]*fallbackLayout: "balanced-header"/, "Photo-capable and photo-disabled templates must both define clean fallback layouts.");
assert.match(professionalPhotoContract, /export type CanonicalProfessionalPhotoAsset[\s\S]*photoAssetId[\s\S]*storagePath[\s\S]*mimeType[\s\S]*fileSize[\s\S]*width[\s\S]*height[\s\S]*photoStatus[\s\S]*crop[\s\S]*derivatives[\s\S]*photoConsent[\s\S]*profileVisibility[\s\S]*cvUsageAllowed[\s\S]*publicSharingAllowed/, "Professional Photo must have a canonical asset model with storage metadata, crop metadata, consent, visibility, and downstream usage controls.");
assert.match(professionalPhotoContract, /PROFESSIONAL_PHOTO_ALLOWED_MIME_TYPES = \["image\/jpeg", "image\/png", "image\/webp"\]/, "Professional Photo uploads must be constrained to JPEG, PNG, and WebP.");
assert.match(professionalPhotoContract, /privateBucketRequired: true[\s\S]*persistBinaryInProfileRecord: false[\s\S]*persistTemporaryBrowserUrls: false[\s\S]*publicSharingDefault: false/, "Professional Photo storage must stay private by default and must not persist binary images or temporary browser URLs in profile records.");
assert.match(professionalPhotoContract, /userScopedPathPattern: "\{userId\}\/profile\/\{photoAssetId\}\.\{extension\}"[\s\S]*return `\$\{userId\}\/profile\/\$\{photoAssetId\}\.\$\{professionalPhotoExtensionForMimeType\(mimeType\)\}`/, "Professional Photo storage paths must be stable owner-scoped profile paths.");
assert.match(professionalPhotoContract, /isTemporaryProfessionalPhotoUrl[\s\S]*blob:[\s\S]*data:/, "Professional Photo contract must reject persisted blob/data URLs.");
assert.match(professionalPhotoContract, /validateProfessionalPhotoUploadInput[\s\S]*unsupported_mime_type[\s\S]*extension_mime_mismatch[\s\S]*file_too_large[\s\S]*image_too_narrow[\s\S]*image_too_short/, "Professional Photo validation must cover MIME, extension, size, and useful image dimensions.");
assert.match(professionalIdentityCompletion, /if \(section === "photo"\)[\s\S]*asset\?\.storagePath[\s\S]*asset\.photoStatus === "ready"/, "Professional Photo completion must depend on a durable ready asset, not a temporary note or object URL.");
assert.match(pathzyI18n, /"identity\.photo\.error\.upload_failed": "Échec du téléversement — Réessayer"/, "French Professional Photo errors must not show the English storage failure copy.");
for (const bucketSignature of [
  "insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)",
  "'professional-photos'",
  "false",
  "5242880",
  "image/jpeg",
  "image/png",
  "image/webp"
]) {
  assert.match(professionalPhotoStorageMigration, new RegExp(bucketSignature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Professional Photo storage migration must include ${bucketSignature}.`);
}
for (const policyName of [
  "Users can read own professional photos",
  "Users can upload own professional photos",
  "Users can update own professional photos",
  "Users can delete own professional photos"
]) {
  assert.match(professionalPhotoStorageMigration, new RegExp(policyName), `Professional Photo storage migration must include ${policyName}.`);
}
assert.match(professionalPhotoStorageMigration, /\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/g, "Professional Photo storage policies must scope objects by authenticated user folder.");
for (const bucketSignature of [
  "insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)",
  "'employment-documents'",
  "false",
  "8388608",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain"
]) {
  assert.match(employmentDocumentStorageMigration, new RegExp(bucketSignature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Employment document storage migration must include ${bucketSignature}.`);
}
for (const policyName of [
  "Users can read own employment documents",
  "Users can upload own employment documents",
  "Users can update own employment documents",
  "Users can delete own employment documents"
]) {
  assert.match(employmentDocumentStorageMigration, new RegExp(policyName), `Employment document storage migration must include ${policyName}.`);
}
assert.match(employmentDocumentStorageMigration, /\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/g, "Employment document storage policies must scope objects by authenticated user folder.");
assert.match(employmentDocumentStorageMigration, /drop constraint if exists user_documents_document_type_check[\s\S]*'licence'[\s\S]*'portfolio_file'[\s\S]*'id_work_document'/, "Employment document storage migration must repair the user_documents type constraint for every current vault document type.");
assert.match(employmentDocumentStorageMigration, /user_documents_user_vault_category_idx[\s\S]*content_json ->> 'vault_category'/, "Employment document storage migration must add a category-aware index for the file vault.");
assert.match(employmentDocumentStorageMigration, /employment_document_user_documents_contract[\s\S]*employment_document_vault_category_index/, "Employment document storage migration must verify the database document contract after applying.");
assert.doesNotMatch(documentTemplateEngine, /atsRating|recruiterRating/, "Template gallery metadata must not use invented static ATS or recruiter percentage ratings.");
assert.match(professionalIdentityService, /premiumDocumentTemplates = documentTemplateGallery/, "Professional Identity service must reuse the shared template gallery.");
assert.match(professionalIdentityTool, /documentTemplateGallery\.map/, "CV Builder must render the shared visual template gallery.");
assert.match(professionalIdentityTool, /Template gallery[\s\S]*Choose a recruiter-ready design/, "CV Builder must expose a visual template gallery.");
assert.match(professionalIdentityTool, /cvTemplateFamily[\s\S]*cvTemplateAtsFilter[\s\S]*cvTemplateSearch/, "CV Builder must keep the 50-template library compact with family, ATS, and search filtering.");
assert.match(professionalIdentityTool, /recommendedDocumentTemplates[\s\S]*Browse all templates[\s\S]*cvTemplateBrowserOpen/, "CV Builder must show a compact selector and open the 50-design template gallery only on demand.");
assert.match(professionalIdentityTool, /\[grid-template-columns:repeat\(auto-fit,minmax\(154px,1fr\)\)\]/, "CV Builder template browser must use a compact responsive metadata grid.");
assert.match(professionalIdentityTool, /<TemplateMiniPreview template=\{template\} \/>/, "CV Builder template gallery must use the shared architecture mini preview component.");
assert.match(templateMiniPreview, /cv-template-mini-preview/, "CV Builder template gallery must show lightweight mini document previews instead of abstract skeleton-only cards.");
for (const layout of ["single", "international", "executive", "consulting", "technical", "creative", "graduate"]) {
  assert.match(templateMiniPreview, new RegExp(layout), `Template mini preview must represent the ${layout} architecture.`);
}
assert.doesNotMatch(professionalIdentityTool, /lg:flex-row lg:items-start lg:justify-between/, "CV gallery parent must not use the old stretched desktop flex-row layout.");
assert.doesNotMatch(professionalIdentityTool, /min-h-\[330px\]/, "CV template cards must use natural content height, not fixed minimum card height.");
assert.match(professionalIdentityTool, /template\.atsClassification[\s\S]*template\.atsCharacteristic/, "CV Builder template cards must show honest ATS classifications and characteristics instead of static percentages.");
assert.doesNotMatch(professionalIdentityTool, /ATS \{template\.atsRating\}%|Recruiter \{template\.recruiterRating\}%/, "CV Builder template cards must not show fake ATS or recruiter percentages.");
assert.match(professionalIdentityTool, /selectTemplate\(template\.name\)[\s\S]*setCvTemplateBrowserOpen\(false\)/, "Template cards must switch instantly, close the browser, and preserve the same CV model.");
assert.match(professionalIdentityTool, /Presentation changes only\. Your canonical CV content stays the same\./, "CV Builder must explain that switching templates preserves data.");
assert.match(professionalIdentityTool, /renderCvHtmlFromModel\(previewCvModel, templateName, activeCvSection, canonicalProfessionalPhoto, cvPaletteId\)/, "Designed Preview must render the selected template and palette from the live canonical CV model and photo source.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, normalizeCvModelForExport\(cvModel\), templateName, canonicalProfessionalPhoto, cvPaletteId\)/, "PDF export path must stay aligned to the selected template, palette, canonical CV model and photo source.");
assert.match(professionalIdentityTool, /Save to My Documents/, "CV and Cover Letter workspaces must expose a clear Save to My Documents action.");
assert.match(professionalIdentityTool, /function saveActionLabel\(\)[\s\S]*Save changes[\s\S]*✓ Saved[\s\S]*Save to My Documents/, "Document workspace save buttons must show Save to My Documents, Save changes, or Saved according to persistence state.");
assert.match(professionalIdentityTool, /if \(exportLocked && !coreDownloadsAllowed\)/, "Current core document PDF downloads must bypass legacy pricing redirects.");
assert.match(professionalIdentityTool, /downloadBusy[\s\S]*Preparing PDF\.\.\.[\s\S]*Download PDF/, "PDF downloads must provide immediate progress feedback and prevent duplicate clicks.");
assert.match(professionalIdentityTool, /const canDownloadPdf = tool === "cv" \? Boolean\(cvModel\) : Boolean\(document\?\.content\)/, "CV PDF downloads must be enabled by the structured current CV model, not stale legacy content text.");
assert.match(professionalIdentityTool, /tool !== "cv" && \(!document\.id \|\| hasUnsavedChanges \|\| saveState === "error" \|\| !saved\)/, "Non-CV PDF downloads must keep the saved-document gate while CV export remains an action on the current CV state.");
assert.match(professionalIdentityTool, /disabled=\{!canDownloadPdf \|\| downloadBusy\}/, "Desktop and mobile PDF buttons must use the shared CV-aware download readiness guard.");
assert.match(professionalIdentityTool, /setDownloadState\("preparing"\)[\s\S]*window\.requestAnimationFrame[\s\S]*setDownloadState\("downloading"\)/, "PDF download clicks must yield a paintable preparing state before synchronous PDF generation starts.");
assert.match(professionalIdentityTool, /catch \(caught\)[\s\S]*console\.warn\("\[professional-identity\] PDF download failed"[\s\S]*We couldn't download your CV\. Please try again\.[\s\S]*We couldn't download your document\. Your document is still saved\. Please try again\./, "PDF export failures must produce controlled CV-specific and document-specific user-facing errors with a sanitized development diagnostic.");
assert.doesNotMatch(professionalIdentityTool, /markDownloaded|downloaded: true|status: "downloaded"/, "Workspace PDF download must not mutate document records or create a Downloaded status.");
assert.match(documentDownloads, /if \(blob\.size <= 0\)[\s\S]*Cannot download an empty file/, "Blob downloads must reject empty files instead of triggering a silent browser no-op.");
assert.match(documentDownloads, /type === "application\/pdf"[\s\S]*!content\.startsWith\("%PDF-"\)[\s\S]*Generated PDF content is invalid/, "PDF downloads must validate generated PDF bytes before handing them to the browser.");
assert.match(documentDownloads, /window\.setTimeout\(\(\) => \{[\s\S]*anchor\.remove\(\);[\s\S]*URL\.revokeObjectURL\(url\);[\s\S]*\}, 1000\)/, "Blob downloads must keep object URLs alive long enough for desktop and mobile browsers to start the download.");
assert.doesNotMatch(documentDownloads, /anchor\.click\(\);\s*anchor\.remove\(\);\s*URL\.revokeObjectURL\(url\);/, "Blob downloads must not revoke the object URL synchronously after clicking the link.");
assert.doesNotMatch(myDocumentsClient, /PremiumUpgradeCard[\s\S]*Upgrade to download/, "Saved core document downloads must not render an upgrade card.");
assert.match(professionalIdentityTool, /Improve your CV/, "CV Builder must show Improve your CV recommendations instead of generic missing-field messages.");
assert.match(professionalIdentityTool, /Add \{parsedCv\.missing\.join\(", "\)\.toLowerCase\(\)\}/, "CV recommendations must be based on the structured CV model gaps.");
assert.doesNotMatch(professionalCvPage, /premiumDocumentTemplates\.map|TemplateMiniPreview/, "CV page wrapper must not render a second template gallery after the editor workspace.");
assert.equal(professionalIdentityTool.indexOf("CV generated"), -1, "CV Builder must not render the old generated/version management card.");
assert.doesNotMatch(professionalIdentityTool, /CV version name|Content source: one CV model\.|When I save content edits, also update linked CV versions|Duplicate CV/, "CV Builder must keep technical version controls out of the visible workspace.");
assert.match(professionalIdentityTool, /function renderCvDocumentBar[\s\S]*Download PDF[\s\S]*Edit information[\s\S]*ATS Preview/, "CV document bar must expose the primary download, information edit, and ATS actions.");
assert.match(professionalIdentityTool, /Document studio[\s\S]*Refresh from Identity[\s\S]*More[\s\S]*Upload CV/, "CV import and refresh actions must be grouped as secondary document-studio controls.");
const cvGalleryCallIndex = professionalIdentityTool.indexOf('{tool === "cv" ? renderCvTemplateGallery() : null}');
const cvIdentityCorrectionIndex = professionalIdentityTool.indexOf('{tool === "cv" ? renderCvIdentityCorrectionCard() : null}');
const cvDocumentBarIndex = professionalIdentityTool.indexOf('{tool === "cv" ? renderCvDocumentBar() : null}');
const cvPreviewCardIndex = professionalIdentityTool.indexOf('<Card className="overflow-hidden border-[#7f1d1d]/18', cvGalleryCallIndex);
const cvNextActionIndex = professionalIdentityTool.indexOf("Your CV is ready", cvPreviewCardIndex);
assert.ok(cvDocumentBarIndex > -1 && cvIdentityCorrectionIndex > cvDocumentBarIndex && cvGalleryCallIndex > cvIdentityCorrectionIndex && cvPreviewCardIndex > cvGalleryCallIndex && cvNextActionIndex > cvPreviewCardIndex, "CV page flow must be document bar, compact Professional Identity correction, template selector, full-width A4 document studio, then next-step area.");
assert.match(professionalIdentityTool, /Want to change your CV information\?[\s\S]*routeBuilders\.professionalIdentityReview\(appRoutes\.professionalIdentityCv\)/, "CV correction strip must route through Professional Identity while preserving return-to-CV context.");
assert.equal((professionalIdentityTool.match(/Choose a recruiter-ready design/g) ?? []).length, 2, "CV and Cover Letter must each render one My CV-style Template Gallery instance.");
assert.equal((professionalIdentityTool.match(/Structured editor/g) ?? []).length, 0, "Cover Letter must not keep the old persistent Structured Editor layout.");
assert.equal((professionalIdentityTool.match(/Live preview engine/g) ?? []).length, 0, "Cover Letter must use Document Studio instead of the old Live Preview Engine label.");
for (const sectionLabel of ["Header", "Summary", "Experience", "Education", "Skills", "Projects", "Certifications", "More"]) {
  assert.match(professionalIdentityTool, new RegExp(`label: "${sectionLabel}"`), `CV Document Studio section navigator must include ${sectionLabel}.`);
}
assert.match(professionalIdentityTool, /function renderCvSectionNavigator/, "CV source-section helpers may remain available for contextual Professional Identity navigation.");
assert.doesNotMatch(professionalIdentityTool, /tool === "cv" \? \([\s\S]*renderCvSectionNavigator\(\)/, "CV workspace must not render the old persistent source-section accordion.");
assert.match(professionalIdentityTool, /data-cv-editor-accordion="primary"/, "CV primary section metadata remains available for contextual source summaries.");
assert.match(professionalIdentityTool, /aria-expanded=\{isOpen\}[\s\S]*aria-controls=\{panelId\}/, "CV accordion buttons must expose expanded state and panel controls.");
assert.match(professionalIdentityTool, /onClick=\{\(\) => toggleCvPrimarySection\(item\)\}/, "CV accordion headings must expand and collapse primary sections.");
assert.match(professionalIdentityTool, /setActiveCvSection\(""\)/, "Clicking an open primary accordion section must collapse it without clearing CV data.");
assert.match(professionalIdentityTool, /function renderCvAccordionContent[\s\S]*renderSyncedCvSection/, "CV accordion must render Professional Identity-synced section summaries inside the open section row.");
assert.doesNotMatch(professionalIdentityTool, /function renderActiveCvEditor/, "CV editor must not use the old detached active-editor block.");
assert.doesNotMatch(professionalIdentityTool, /overflow-x-auto[\s\S]{0,120}cvPrimaryNavigation|lg:grid-cols-4[\s\S]{0,160}cvPrimaryNavigation/, "CV primary sections must not use the old horizontal tab/grid selector.");
assert.match(professionalIdentityTool, /function renderSyncedMoreSections[\s\S]*cvMoreSections\.map\(\(title\) => renderSyncedCvSection\(title, cvSectionItems\(title\)/, "More must render optional sections as Professional Identity-synced summaries.");
assert.doesNotMatch(professionalIdentityTool, /data-cv-editor-accordion="optional"|activeCvSection === title[\s\S]*setActiveCvSection\("More"\)/, "More must not keep the old duplicate optional-section editor.");
assert.match(professionalIdentityTool, /renderSyncedHeaderSection[\s\S]*parsedCv\.fullName[\s\S]*parsedCv\.targetRole[\s\S]*parsedCv\.email[\s\S]*parsedCv\.phone[\s\S]*parsedCv\.city[\s\S]*parsedCv\.country[\s\S]*parsedCv\.linkedIn[\s\S]*parsedCv\.portfolio/, "Header summaries must preserve all Professional Identity-derived header fields.");
assert.match(professionalIdentityTool, /tool === "cv" \|\| tool === "cover-letter" \? "grid gap-5"/, "CV and Cover Letter must stay in the shared document workspace shell.");
assert.match(professionalIdentityTool, /lg:grid-cols-\[minmax\(280px,360px\)_minmax\(0,1fr\)\][\s\S]*data-cover-letter-workspace-layout="compact-controls-large-preview"/, "Cover Letter desktop layout must reserve a compact control rail and dominant preview column.");
assert.match(professionalIdentityTool, /lg:sticky lg:top-24[\s\S]*data-cover-letter-compact-control-area="true"/, "Cover Letter desktop controls must stay compact and independent from the preview area.");
assert.match(professionalIdentityTool, /renderCvTemplateGallery\(\)[\s\S]*<Card className="overflow-hidden border-\[#7f1d1d\]\/18/, "CV template selector must render before the full-width preview card.");
assert.match(professionalIdentityTool, /data-cv-document-studio="true"/, "CV preview must render inside the dedicated document studio container.");
assert.match(professionalIdentityTool, /renderCvPreviewViewer\(\)/, "CV A4 preview must render through the shared fit-page preview viewer.");
assert.match(professionalIdentityTool, /ref=\{cvPreviewViewportRef\}[\s\S]*aria-label="Live CV A4 preview"/, "CV preview viewer must measure the real preview viewport.");
assert.match(professionalIdentityTool, /cvPreviewHtml\.match\(\/<div class="cv-render-page-frame"\/g\)/, "CV page count must count only real rendered A4 page frames, not CSS selectors.");
assert.match(professionalIdentityTool, /style=\{\{ width: scaledWidth, height:/, "CV preview stage must reserve actual scaled page height instead of a giant blank min-height canvas.");
assert.match(professionalIdentityTool, /data-cv-document-stage="true"/, "Application chrome must remain outside the scoped CV document stage.");
assert.match(professionalIdentityTool, /function renderCvCompactStatus/, "CV Health helper remains available without rendering a persistent Professional Identity side block.");
assert.match(professionalIdentityTool, /function saveStatusLabel/, "CV Document Studio must centralize compact save status text.");
assert.doesNotMatch(professionalIdentityTool, /mainCvSections\.slice\(1\)\.map/, "CV editor must not render the old endless stacked section editor.");
assert.match(professionalIdentityTool, /function duplicateCvVersion/, "CV duplicate/version behavior must remain available after the studio refactor.");
assert.match(professionalIdentityTool, /Move up[\s\S]*Move down[\s\S]*Duplicate[\s\S]*Remove/, "CV repeatable item controls must remain available in the studio editor.");
assert.match(documentDownloads, /export function renderAtsCvHtmlFromModel\(cvInput: CvModel\)/, "CV renderer must expose an ATS Preview renderer from the same CV model.");
assert.match(professionalIdentityTool, /const \[cvPreviewMode, setCvPreviewMode\] = useState<"designed" \| "ats">/, "CV Builder must support Designed and ATS preview modes.");
assert.match(professionalIdentityTool, /ATS Preview/, "CV Builder must show an ATS Preview mode alongside the designed preview.");
assert.match(professionalIdentityTool, /renderAtsCvHtmlFromModel\(previewCvModel\)/, "ATS Preview must render from the live CV model.");
assert.match(professionalIdentityTool, /function cvHealthScore\(cv: CvModel \| null\)/, "CV Builder must calculate a CV Health Score from structured CV data.");
assert.match(professionalIdentityTool, /CV Health Score/, "CV Builder must display CV Health Score.");
assert.match(professionalIdentityTool, /Improve your CV: \{recommendation\}/, "CV Health recommendations must be actionable Improve your CV messages.");
assert.match(myDocumentsClient, /openHrefForDocument[\s\S]*\/professional-identity\/cv\?documentId=[\s\S]*\/professional-identity\/cover-letter\?documentId=/, "My Documents must open PATHZY-generated documents in their original workspaces instead of editing them inside the vault.");
assert.match(documentTemplateEngine, /legacyTemplateAliases[\s\S]*"ATS Friendly": "Clarity ATS"/, "Legacy saved template names must normalize to canonical templates.");
assert.match(documentDownloads, /resolveCvTemplateDesign\(templateName, paletteId\)/, "Template and palette choice must resolve to a real document design.");
assert.match(documentDownloads, /nameSize[\s\S]*roleSize[\s\S]*sectionTitleSize[\s\S]*bodySize[\s\S]*bodyLineHeight/, "Document design system must define a typography scale.");
assert.match(documentDownloads, /headerHeight[\s\S]*sidebarWidth[\s\S]*columnGap[\s\S]*cardRadius[\s\S]*chipRadius/, "Document design system must define spacing and layout tokens.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, normalizeCvModelForExport\(cvModel\), templateName, canonicalProfessionalPhoto, cvPaletteId\)/, "CV export must use the same structured model, photo source, and palette as preview.");
assert.match(myDocumentsClient, /function savedCvPaletteId\(document: VaultDocumentRecord\)[\s\S]*cvVersion[\s\S]*paletteId/, "My Documents must read the saved CV palette from version metadata.");
assert.match(myDocumentsClient, /simplePdfDocumentFromModel\(document\.title, cvModelFromUnknown\(document\.contentJson\?\.cvModel, document\.content\), document\.templateName \?\? undefined, undefined, savedCvPaletteId\(document\)\)/, "Saved CV downloads from My Documents must use the structured CV model and preserved palette.");
assert.doesNotMatch(`${professionalIdentityTool}\n${myDocumentsClient}\n${cvBuilderPage}`, /Download DOCX|downloadDocx|downloadWord|Download Text|text export|download text|download PDF, or download DOCX/i, "Normal user flow must not expose DOCX or text export.");
assert.match(cvImportPipeline, /export function validateCvImportFile/, "CV import must validate files before extraction.");
assert.match(cvImportPipeline, /application\/pdf/, "CV import must support PDF files.");
assert.match(cvImportPipeline, /application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/, "CV import must support DOCX files.");
assert.match(cvImportPipeline, /text\/plain/, "CV import must support TXT and pasted-text style files.");
assert.match(cvImportPipeline, /throw new CvImportError\("Unsupported file type\./, "CV import must reject unsupported files with a safe error.");
assert.match(cvImportPipeline, /PDFParse/, "CV import must use a real PDF parser server-side.");
assert.match(cvImportPipeline, /mammoth\.extractRawText/, "CV import must use a real DOCX parser server-side.");
assert.doesNotMatch(cvImportPipeline, /buffer\.toString\("latin1"\)/, "PDF bytes must never be decoded as raw Latin-1 text.");
assert.match(cvImportPipeline, /containsStructuralPdfSyntax/, "CV import must reject structural PDF syntax from extraction output.");
assert.match(cvImportPipeline, /extractDocxText\(buffer: Buffer\)/, "CV import must extract text from DOCX files server-side.");
assert.match(cvImportPipeline, /export type NormalizedCvBlock = \{[\s\S]*blockType: CvBlockType;[\s\S]*sourceFormat: CvSourceFormat;[\s\S]*tableContext: string \| null;[\s\S]*bulletContext: string \| null;/, "CV import must normalize all formats into a shared block model before interpretation.");
assert.match(cvImportPipeline, /export function createNormalizedBlocksFromText/, "CV import must create normalized blocks for TXT and pasted text.");
assert.match(cvImportPipeline, /createNormalizedBlocksFromDocxText/, "CV import must create normalized blocks for DOCX extraction.");
assert.match(cvImportPipeline, /createNormalizedBlocksFromPdfText/, "CV import must create normalized blocks for PDF extraction.");
assert.match(cvImportPipeline, /function classifyBlock/, "CV import must classify blocks before section mapping.");
assert.match(cvImportPipeline, /interpretationForBlocks\(safeBlocks, sourceFormat\)/, "CV import must run extracted content through the general interpretation engine before section placement.");
assert.match(cvImportPipeline, /sectionsFromInterpretation\(interpretation, sectionize\(safeBlocks\)\)/, "CV import must classify sections after reconstruction and semantic interpretation.");
assert.match(cvImportPipeline, /OCR required\./, "CV import must return a typed OCR-required state for insufficient machine-readable text.");
assert.match(cvImportPipeline, /mapImportedTextToCvModel\(text: string\)/, "CV import must map extracted text into the canonical CvModel.");
assert.match(cvImportPipeline, /professionalExperience: semanticExperience\.length \? semanticExperience : fallbackExperience/, "CV import must map semantic ExperienceRecord entities into the existing professionalExperience field.");
assert.match(cvImportPipeline, /education: semanticEducation\.length \? semanticEducation : parseEducation\(sections\.education\)/, "CV import must map semantic EducationRecord entities into the existing education field.");
assert.match(cvImportPipeline, /optionalSections: \{[\s\S]*volunteerExperience[\s\S]*publications[\s\S]*professionalMemberships/, "CV import must map additional sections into the existing optionalSections architecture.");
assert.match(cvImportPipeline, /reviewItemsFor\(mapped\.cvModel, mapped\.normalizedText\.length, mapped\.excludedSensitiveFields\)/, "CV import must flag uncertain imported data for review.");
assert.match(cvImportPipeline, /function lineToPair/, "CV import must pair LABEL: VALUE legacy CV rows before classification.");
assert.match(cvImportPipeline, /secondary\\s\+school\\s\+education[\s\S]*tertiary\\s\+education/, "CV import must recognize secondary and tertiary education headings.");
assert.match(cvImportPipeline, /experiential\\s\+training[\s\S]*practical\\s\+training/, "CV import must recognize experiential and practical training headings.");
assert.match(cvImportPipeline, /expérience\\s\+professionnelle|Formation|formation|Langues|langues/, "CV import must include multilingual section recognition.");
assert.match(cvImportPipeline, /function parseReferences/, "CV import must group reference lines into referee records.");
assert.match(cvImportPipeline, /sensitiveLabelPattern/, "CV import must exclude sensitive personal data from automatic CV import.");
assert.match(cvImportPipeline, /assertPlausibleImport/, "CV import must reject implausible classification results such as dozens of false experiences.");
assert.match(cvImportPipeline, /unclassifiedItems/, "CV import must keep uncertain content unclassified instead of forcing it into Experience.");
for (const requiredArchitectureType of [
  "CvSourceDocument",
  "SourceUnit",
  "BoundaryDecision",
  "ReconstructedBlock",
  "SemanticRole",
  "ExperienceRecord",
  "EducationRecord",
  "CertificationRecord",
  "SkillGroup",
  "ReferenceRecord",
  "LanguageRecord",
  "SourceTrace",
  "ReconciliationItem",
  "InterpretationDiagnostic"
]) {
  assert.match(cvInterpretationEngine, new RegExp(`export type ${requiredArchitectureType}`), `CV interpretation engine must expose ${requiredArchitectureType}.`);
}
for (const requiredArchitectureFunction of [
  "createCvSourceDocument",
  "createSourceUnits",
  "inferBoundaryDecisions",
  "reconstructDocument",
  "inferSemanticRoles",
  "linkSemanticRecords",
  "classifyCanonicalSections",
  "normaliseProfessionalContent",
  "validateSemanticDocument",
  "reconcileSourceToOutput",
  "buildInterpretationDiagnostics",
  "interpretCvSourceDocument"
]) {
  assert.match(cvInterpretationEngine, new RegExp(`export function ${requiredArchitectureFunction}`), `CV interpretation engine must separate ${requiredArchitectureFunction}.`);
}
assert.match(cvInterpretationEngine, /sourceType: "pdf" \| "docx" \| "text" \| "pasted_text"/, "Source abstraction must support PDF, DOCX, text, and pasted CV text.");
assert.match(cvInterpretationEngine, /extractionState: "ok" \| "requires_ocr" \| "failed"/, "Source abstraction must support explicit OCR-required failures.");
assert.match(cvInterpretationEngine, /export type BoundaryRelationship[\s\S]*"same_sentence"[\s\S]*"same_record"[\s\S]*"child_item"[\s\S]*"new_section"[\s\S]*"field_pair"/, "Boundary inference must distinguish sentence, record, child, section, and field-pair relationships.");
assert.match(cvInterpretationEngine, /normaliseProfessionalStatement\(parts: string\[\]\)/, "Professional normalisation must happen after reconstruction rather than on raw extraction.");
assert.doesNotMatch(cvInterpretationEngine, /invent|percent|years of experience|managed a team of|increased revenue/i, "Professional normalisation code must not contain unsupported achievement invention patterns.");
assert.match(professionalIdentityService, /interpretation: imported\.interpretation/, "Imported CV drafts must persist interpretation metadata for traceability.");
const antiHardcodingTerms = [
  "Florent",
  "Kalanda",
  "Vaal University",
  "VUT",
  "Cobas",
  "GeneXpert",
  "ADVIA",
  "laboratory assistant: blood transfusion",
  "01/02/2014"
];
for (const term of antiHardcodingTerms) {
  assert.doesNotMatch(`${cvImportPipeline}\n${cvInterpretationEngine}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `Production CV interpretation code must not hardcode fixture-specific term: ${term}.`);
}
assert.match(cvImportRoute, /staging: imported/, "CV import route must return a staging result before saving the final CV draft.");
assert.match(cvImportRoute, /body\.confirm && body\.staging[\s\S]*createImportedCvDraft/, "CV import route must only create the final imported CV draft after user confirmation.");
assert.match(cvImportRoute, /safeFailure/, "CV import route must not expose raw technical failures to users.");
assert.match(professionalIdentityService, /export async function createImportedCvDraft/, "Imported CV drafts must be created through the professional identity service.");
assert.match(professionalIdentityService, /document_type: "old_cv"[\s\S]*content_text: imported\.normalizedText/, "Imported CV original extracted text must be saved as a recoverable old_cv document.");
assert.match(professionalIdentityService, /contentJson: \{[\s\S]*cvModel,[\s\S]*cvVersion,[\s\S]*cvImport:/, "Imported CV draft must persist the canonical cvModel and import metadata.");
assert.match(professionalIdentityTool, /\/api\/professional-identity\/import-cv/, "CV upload UI must call the real import route.");
assert.match(professionalIdentityTool, /Review Imported CV/, "Successful CV import must pause at a review summary before opening the editor.");
assert.match(professionalIdentityTool, /setCvImportSummary\(data\.importSummary \?\? null\);[\s\S]*setCvImportStatus\("ready"\);[\s\S]*Your PATHZY CV is ready to review/, "Successful CV import must clear the preparing state and show review-ready copy.");
assert.match(professionalIdentityTool, /cvImportStatus === "ready" && pendingImportedCv \? \([\s\S]*id="imported-cv-review"[\s\S]*Review Imported CV/, "Successful CV import must expose a visible review action whenever a staged CV is ready.");
assert.match(professionalIdentityTool, /Review Imported CV[\s\S]*focus-visible:outline/, "Imported CV review action must keep a visible keyboard focus state.");
assert.match(professionalIdentityTool, /confirmImportedCv/, "Reviewing an imported CV must confirm staging before creating the saved draft.");
assert.match(professionalIdentityTool, /setCvDocument\(data\.document, true\)/, "Confirmed imported CV drafts must open the existing structured CV editor.");
assert.doesNotMatch(professionalIdentityTool, /accept="\.pdf,\.docx,\.png|image\/png|image\/jpeg/, "CV import UI must not advertise unsupported image OCR.");
assert.match(professionalIdentityTool, /text\/plain/, "CV import UI must accept TXT files.");
assert.match(professionalIdentityTool, /stayed unclassified for review instead of being guessed/, "CV import review must explain unclassified content safely.");
assert.match(documentInspectionTypes, /export type DocumentType =[\s\S]*"cv"[\s\S]*"cover_letter"[\s\S]*"academic_transcript"[\s\S]*"job_advertisement"[\s\S]*"unknown"/, "Document inspection must define a shared multi-document type model.");
assert.match(documentInspectionTypes, /export type DocumentSourceType = "digital" \| "scanned" \| "image" \| "mixed"/, "Document inspection must classify digital, scanned, image and mixed sources.");
assert.match(documentInspectionTypes, /export type DocumentInspector[\s\S]*inspect\(input: DocumentInspectionInput\): Promise<DocumentInspectionResult>/, "Document inspection must expose provider abstraction contracts.");
for (const threshold of ["maxPageCount", "minNativeCharactersPerPage", "minNativeTextPageRatio", "manualReviewConfidence"]) {
  assert.match(documentInspectionConstants, new RegExp(threshold), `Inspection threshold ${threshold} must live in shared configuration.`);
}
for (const mime of ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"]) {
  assert.match(documentInspectionConstants, new RegExp(mime.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Inspection must support ${mime}.`);
}
assert.match(documentInspectionSchema, /export function validateInspectionInput/, "Upload validation must run before inspection.");
for (const validationCase of ["unsupported_format", "empty_document", "password_protected", "extension_mismatch"]) {
  assert.match(documentInspectionSchema, new RegExp(validationCase), `Upload validation must handle ${validationCase} safely.`);
}
assert.match(scanDetector, /determineOcrRequirement[\s\S]*sourceType === "image"[\s\S]*sourceType === "scanned"[\s\S]*sourceType === "mixed"[\s\S]*Native text appears reliable/, "OCR decision logic must require OCR only when the source or text quality needs it.");
assert.match(documentTypeDetector, /curriculum vitae|r\[ée\]sum\[ée\][\s\S]*lettre de motivation[\s\S]*relev\[ée\] de notes[\s\S]*responsabilit\[ée\]s/, "Document type detection must include English and French signals.");
assert.match(languageDetector, /French[\s\S]*English[\s\S]*mixed|languages/, "Language detection must support English, French and multi-language output.");
assert.match(layoutDetector, /columnCount[\s\S]*hasTables[\s\S]*hasImages[\s\S]*readingOrder/, "Layout detection must produce reusable column, table, image and reading-order data.");
assert.match(qualityAnalyzer, /low_resolution[\s\S]*rotated_page[\s\S]*missing_text_layer/, "Quality analysis must generate actionable warnings.");
for (const strategy of ["native_text", "ocr", "hybrid", "image_ocr", "manual_review"]) {
  assert.match(processingStrategy, new RegExp(`strategy: "${strategy}"`), `Processing strategy selection must cover ${strategy}.`);
}
assert.match(documentInspectionService, /validateInspectionInput\(input\)[\s\S]*sampleNativeDocument[\s\S]*detectDocumentSource[\s\S]*detectDocumentType[\s\S]*selectProcessingStrategy/, "Inspection service must orchestrate validation, sampling, source detection, type detection and strategy selection.");
assert.match(documentInspectionService, /markDocumentInspectionProcessing[\s\S]*markDocumentInspectionFailed[\s\S]*onConflict: "document_id"/, "Inspection persistence must be idempotent and status-driven by document ID.");
assert.match(documentInspectionMigration, /create table if not exists public\.document_inspections/, "Document inspection migration must create a dedicated inspection record linked to documents.");
assert.match(documentInspectionMigration, /document_id uuid not null references public\.user_documents\(id\) on delete cascade/, "Inspection records must link to existing user_documents and clean up with deleted documents.");
assert.match(documentInspectionMigration, /alter table public\.document_inspections enable row level security/, "Document inspections must have RLS enabled.");
assert.match(documentInspectionMigration, /Users can select inspections for own documents[\s\S]*d\.id = document_id and d\.user_id = auth\.uid\(\)/, "Users must only access inspections for their own documents.");
for (const summaryText of ["Document Inspection Complete", "Document type", "OCR", "Confidence", "Ready for extraction"]) {
  assert.match(documentInspectionSummary, new RegExp(summaryText), `Inspection summary UI must show ${summaryText}.`);
}
for (const statusText of ["Inspecting your document", "Checking document type", "Deciding whether OCR is needed"]) {
  assert.match(documentInspectionStatus, new RegExp(statusText), `Upload UI must show ${statusText} before extraction.`);
}
assert.match(cvImportRoute, /await importCvFromUpload\(upload\)[\s\S]*createUploadShell[\s\S]*inspectAndPersistDocument/, "CV import must complete safe extraction before creating records or starting inspection.");
assert.match(cvImportRoute, /recommendedPipeline\.extractionAllowed/, "CV import must stop before extraction when inspection disallows it.");
assert.match(documentVisualTypes, /export type VisualDocumentModel = \{[\s\S]*pages: VisualPage\[\][\s\S]*hierarchy: VisualHierarchyNode\[\][\s\S]*sections: VisualSection\[\][\s\S]*timelines: VisualTimeline\[\][\s\S]*tables: VisualTable\[\][\s\S]*relationships: VisualRelationship\[\][\s\S]*readingOrder: VisualReadingOrderItem\[\]/, "Visual reading must define a canonical visual document model with layout, hierarchy, timelines, tables, relationships and reading order.");
assert.match(documentVisualTypes, /export type DocumentRenderer[\s\S]*render\(input: DocumentRenderInput\): Promise<RenderedDocument>/, "Visual reading must expose a renderer abstraction before provider analysis.");
assert.match(documentVisualTypes, /export type VisualDocumentReader[\s\S]*analyze\(input: \{ inspection: DocumentInspectionResult; rendered: RenderedDocument; nativeText: string; decision: VisualReadingDecision \}\): Promise<VisualDocumentModel>/, "Visual reading must expose a provider abstraction that consumes Phase 2 inspection.");
assert.match(documentVisualService, /runVisualReading[\s\S]*shouldRunVisualReading\(input\.inspection\)[\s\S]*LocalMetadataDocumentRenderer[\s\S]*LocalVisualDocumentReader[\s\S]*validateVisualDocumentModel/, "Visual reading service must orchestrate decision, rendering, provider reading and schema validation.");
assert.match(documentVisualService, /saveVisualReading[\s\S]*from\("document_visual_readings"\)[\s\S]*onConflict: "document_id"[\s\S]*from\("document_visual_pages"\)\.upsert/, "Visual reading persistence must be idempotent and save page-level models.");
assert.match(documentVisualService, /markVisualReadingProcessing[\s\S]*markVisualReadingFailed/, "Visual reading must persist processing and failed states.");
assert.match(documentVisualReader, /buildLocalVisualModel[\s\S]*sections[\s\S]*timelines[\s\S]*tables[\s\S]*icons[\s\S]*relationships/, "Local visual reader must preserve sections, timelines, tables, icons and relationships.");
assert.match(documentVisualReader, /professionalSummary|summary|experience|education|skills|certifications|languages|references/i, "Visual reading must detect document section hierarchy from visual/text regions.");
assert.match(documentVisualRenderer, /class LocalMetadataDocumentRenderer[\s\S]*render/, "Visual reading must isolate document rendering behind a renderer class.");
assert.match(documentVisualPrompt, /not a semantic extraction prompt[\s\S]*visual layout analysis/i, "Visual prompt must separate visual layout reading from semantic extraction.");
assert.match(documentVisualCostControl, /shouldRunVisualReading[\s\S]*native_layout[\s\S]*vision_layout[\s\S]*hybrid_layout/, "Visual reading must centralize cost and mode decisions.");
assert.match(documentVisualMigration, /create table if not exists public\.document_visual_readings/, "Visual reading migration must create a visual document model table.");
assert.match(documentVisualMigration, /create table if not exists public\.document_visual_pages/, "Visual reading migration must create page-level visual records.");
assert.match(documentVisualMigration, /document_id uuid not null references public\.user_documents\(id\) on delete cascade/, "Visual reading records must link to existing user documents.");
assert.match(documentVisualMigration, /alter table public\.document_visual_readings enable row level security[\s\S]*alter table public\.document_visual_pages enable row level security/, "Visual reading tables must enable RLS.");
assert.match(documentVisualMigration, /Users can select own document visual readings[\s\S]*auth\.uid\(\) = user_id[\s\S]*Users can select own document visual pages/, "Visual reading RLS must restrict records to the owning user.");
assert.match(cvImportRoute, /await importCvFromUpload\(upload\)[\s\S]*inspectAndPersistDocument[\s\S]*runAndPersistVisualReading/, "CV import must gate inspection and visual reading on successful extraction.");
assert.match(cvImportRoute, /nativeText: extractedImport\.normalizedText/, "Visual and semantic processing must receive the exact validated extracted text.");
assert.match(cvImportRoute, /visualReading[\s\S]*importSummary/, "CV import response must include the saved visual reading summary for the frontend.");
assert.match(professionalIdentityService, /visual_reading: imported\.visualReading/, "Imported old CV records must preserve visual reading metadata.");
assert.match(professionalIdentityTool, /DocumentVisualReadingStatus[\s\S]*DocumentVisualReadingSummary/, "CV import UI must surface visual reading progress and summary.");
for (const summaryText of ["Visual Reading Complete", "Pages read", "Reading order", "Layout confidence"]) {
  assert.match(documentVisualSummary, new RegExp(summaryText), `Visual reading summary UI must show ${summaryText}.`);
}
for (const statusText of ["Understanding document layout", "Reading page structure", "Preserving reading order"]) {
  assert.match(documentVisualStatus, new RegExp(statusText), `Visual reading status UI must show ${statusText}.`);
}
for (const semanticEntityType of ["profession", "job_title", "qualification", "employer", "language_proficiency", "unknown"]) {
  assert.match(documentSemanticTypes, new RegExp(`"${semanticEntityType}"`), `Semantic ontology must define ${semanticEntityType}.`);
}
assert.match(documentSemanticTypes, /export type SemanticDocumentModel = \{[\s\S]*visualReadingId: string[\s\S]*employment: SemanticEmploymentEntry\[\][\s\S]*education: SemanticEducationEntry\[\][\s\S]*entities: SemanticEntity\[\][\s\S]*relationships: SemanticRelationship\[\][\s\S]*conflicts: SemanticConflict\[\]/, "Semantic model must link to Phase 3 and preserve entities, relationships, entries and conflicts.");
assert.match(documentSemanticTypes, /reviewStatus: ReviewStatus/, "Semantic values must prepare for user review instead of profile overwrite.");
assert.match(documentSemanticConstants, /SEMANTIC_CONFIDENCE_WEIGHTS[\s\S]*sourceText[\s\S]*visualContext[\s\S]*relationshipContext/, "Semantic confidence weights must be centralized.");
assert.match(documentSemanticConstants, /SEMANTIC_STATUS_COPY[\s\S]*Understanding your career information[\s\S]*Compréhension de votre parcours/, "Semantic status copy must include English and French user-facing text.");
for (const semanticValidationCase of ["missing_source_evidence", "duplicate_entity", "invalid_relationship"]) {
  assert.match(documentSemanticSchema, new RegExp(semanticValidationCase), `Semantic validation must reject ${semanticValidationCase}.`);
}
assert.match(documentSemanticDate, /parseSemanticDateRange[\s\S]*present|current|expected|depuis/i, "Semantic date parser must support ranges, current roles and expected dates.");
assert.match(documentSemanticClassifiers, /semanticSectionFor[\s\S]*employment[\s\S]*education[\s\S]*certification[\s\S]*languages/, "Semantic classifiers must map multilingual sections to semantic categories.");
assert.match(documentSemanticClassifiers, /entityTypeForText[\s\S]*Software|software|qualificationPattern[\s\S]*certificationPattern/s, "Semantic classifiers must distinguish professions, qualifications and certifications.");
for (const languageClassifierSignal of ["isHumanLanguage", "programmingTerms", "normalizeLanguageProficiency"]) {
  assert.match(documentSemanticClassifiers, new RegExp(languageClassifierSignal), `Semantic classifiers must include ${languageClassifierSignal}.`);
}
assert.match(documentSemanticReader, /buildLocalSemanticModel[\s\S]*orderedRegions\(input\.visualReading\)[\s\S]*buildEmployment[\s\S]*buildEducation[\s\S]*buildSkills[\s\S]*buildLanguages/, "Semantic reader must consume Phase 3 visual regions and build career structures.");
assert.match(documentSemanticReader, /responsibility[\s\S]*achievement|achievement[\s\S]*responsibility/, "Semantic reader must distinguish responsibilities and achievements.");
assert.match(documentSemanticReader, /conflictWithProfile[\s\S]*career_goal/, "Semantic reader must detect conflicts with the existing profile without overwriting it.");
assert.match(documentSemanticPrompt, /not copywriting[\s\S]*Do not invent missing facts[\s\S]*source region IDs/, "Semantic prompt must prohibit rewriting, hallucination and ungrounded values.");
assert.match(documentSemanticService, /runSemanticUnderstanding[\s\S]*visualReading\.status[\s\S]*buildLocalSemanticModel[\s\S]*validateSemanticDocumentModel/, "Semantic service must require Phase 3 output and validate the model.");
assert.match(documentSemanticService, /saveSemanticUnderstanding[\s\S]*document_semantic_readings[\s\S]*document_semantic_entities[\s\S]*document_semantic_relationships/, "Semantic persistence must save readings, entities and relationships.");
assert.match(documentSemanticService, /onConflict: "document_id"/, "Semantic processing must be idempotent by document.");
assert.match(documentSemanticMigration, /create table if not exists public\.document_semantic_readings/, "Semantic migration must create document-level readings.");
assert.match(documentSemanticMigration, /create table if not exists public\.document_semantic_entities/, "Semantic migration must create entity records.");
assert.match(documentSemanticMigration, /create table if not exists public\.document_semantic_relationships/, "Semantic migration must create relationship records.");
assert.match(documentSemanticMigration, /visual_reading_record_id uuid references public\.document_visual_readings\(id\)/, "Semantic readings must link to Phase 3 visual reading records.");
assert.match(documentSemanticMigration, /alter table public\.document_semantic_readings enable row level security[\s\S]*alter table public\.document_semantic_entities enable row level security[\s\S]*alter table public\.document_semantic_relationships enable row level security/, "Semantic tables must enable RLS.");
assert.match(documentSemanticMigration, /auth\.uid\(\) = user_id/, "Semantic RLS must restrict records to the owning user.");
assert.match(cvImportRoute, /await importCvFromUpload\(upload\)[\s\S]*inspectAndPersistDocument[\s\S]*runAndPersistVisualReading[\s\S]*runAndPersistSemanticUnderstanding/, "Failed extraction must prevent inspection, semantic understanding and career reasoning.");
assert.match(cvImportRoute, /existingProfile[\s\S]*runAndPersistSemanticUnderstanding/, "Semantic understanding must compare existing profile data without overwriting it.");
assert.match(professionalIdentityService, /semantic_reading: imported\.semanticReading/, "Imported old CV records must preserve semantic reading metadata.");
assert.match(professionalIdentityTool, /DocumentSemanticUnderstandingStatus[\s\S]*DocumentSemanticUnderstandingSummary/, "CV import UI must surface semantic processing and summary.");
for (const summaryText of ["Semantic Understanding Complete", "Profession detected", "Employment entries", "Ready for review"]) {
  assert.match(documentSemanticSummary, new RegExp(summaryText), `Semantic summary UI must show ${summaryText}.`);
}
for (const statusText of ["Understanding your career information", "Identifying your profession", "Connecting dates, employers, and roles"]) {
  assert.match(documentSemanticStatus, new RegExp(statusText), `Semantic status UI must show ${statusText}.`);
}
for (const reasoningCaseType of ["possible_same_employment", "possible_same_education", "possible_same_certification", "possible_promotion", "possible_source_confirmation", "insufficient_evidence"]) {
  assert.match(documentReasoningTypes, new RegExp(`"${reasoningCaseType}"`), `Phase 5 reasoning ontology must define ${reasoningCaseType}.`);
}
for (const reasoningConclusion of ["likely_same_entity", "possible_promotion", "one_source_refines_another", "sources_conflict", "requires_user_confirmation"]) {
  assert.match(documentReasoningTypes, new RegExp(`"${reasoningConclusion}"`), `Reasoning conclusions must include ${reasoningConclusion}.`);
}
for (const reasoningSignal of ["same_normalized_organisation", "semantic_title_similarity", "overlapping_date_range", "independent_source_confirmation", "contradictory_dates"]) {
  assert.match(documentReasoningTypes, new RegExp(`"${reasoningSignal}"`), `Reasoning signals must include ${reasoningSignal}.`);
}
assert.match(documentReasoningTypes, /export type ReasoningDecision = \{[\s\S]*supportingEvidence: ReasoningEvidence\[\][\s\S]*contradictingEvidence: ReasoningEvidence\[\][\s\S]*assumptions: ReasoningAssumption\[\][\s\S]*unresolvedQuestions: ReasoningQuestion\[\][\s\S]*requiresUserConfirmation: boolean[\s\S]*reversible: true/, "Reasoning decisions must be explainable, evidence-grounded and reversible.");
assert.match(documentReasoningTypes, /export type CareerReasoningProvider = \{ reason\(input:/, "Phase 5 must expose a provider-neutral reasoning interface.");
assert.match(documentReasoningConstants, /EMPLOYMENT_MATCH_WEIGHTS[\s\S]*organisation[\s\S]*dates[\s\S]*titleMeaning[\s\S]*independentConfirmation/, "Employment match scoring weights must be centralized.");
assert.match(documentReasoningConstants, /EMPLOYMENT_CONTRADICTION_WEIGHTS[\s\S]*incompatibleEmployer[\s\S]*incompatibleDates/, "Contradiction penalties must be centralized.");
assert.match(documentReasoningConstants, /SOURCE_RELIABILITY_WEIGHTS[\s\S]*user_confirmed_profile[\s\S]*reference_letter[\s\S]*cover_letter/, "Source reliability must distinguish authoritative and generated/adapted sources.");
assert.match(documentReasoningUtils, /normalizeOrganisationName[\s\S]*legalSuffixPattern/, "Reasoning must normalize employer suffixes before comparing organisations.");
assert.match(documentReasoningUtils, /customer_service_sales[\s\S]*technology_data[\s\S]*healthcare_clinical[\s\S]*roleFamilyForTitle/, "Reasoning must compare title meaning through cautious occupation families, not raw strings only.");
assert.match(documentReasoningUtils, /compareSemanticDateRanges[\s\S]*"exact"[\s\S]*"compatible"[\s\S]*"overlapping"[\s\S]*"adjacent"[\s\S]*"conflicting"/, "Reasoning must compare date ranges with precision-aware relations.");
assert.match(documentReasoningUtils, /blockingKeysForRecord/, "Reasoning must use blocking keys before candidate case creation.");
for (const blockingKey of ["organisation", "date_window", "role_family", "credential_id"]) {
  assert.match(documentReasoningUtils, new RegExp(blockingKey), `Reasoning blocking keys must include ${blockingKey}.`);
}
assert.match(documentReasoningUtils, /createReasoningFingerprint[\s\S]*REASONING_ENGINE_VERSION[\s\S]*REASONING_TAXONOMY_VERSION/, "Reasoning cases must be idempotent by stable fingerprint.");
assert.match(documentReasoningProvider, /class DeterministicCareerReasoningProvider[\s\S]*supportingEvidence[\s\S]*unresolvedQuestions[\s\S]*proposedActions/, "Phase 5 must provide deterministic explainable reasoning before future AI escalation.");
assert.match(documentReasoningProvider, /class OpenAICareerReasoningProvider[\s\S]*not enabled for Phase 5 deterministic rollout/, "OpenAI reasoning must remain provider-boundary only during Phase 5.");
assert.match(documentReasoningProvider, /Do not invent facts[\s\S]*Do not mutate the profile/, "Reasoning prompt strategy must prohibit fabricated facts and automatic profile mutation.");
assert.match(documentReasoningSchema, /validateReasoningCase/, "Reasoning validation must validate complete cases.");
assert.match(documentReasoningSchema, /validateReasoningDecision[\s\S]*irreversible_decision/, "Reasoning validation must reject incomplete or irreversible decisions.");
assert.match(documentReasoningService, /collectReasoningRecords\(\{ semanticModels[\s\S]*pairRecords[\s\S]*candidateGroupFor[\s\S]*provider\.reason/, "Reasoning service must consume Phase 4 semantic models, group candidates and make decisions.");
assert.match(documentReasoningService, /runAndPersistCareerReasoning[\s\S]*loadCompletedSemanticModels[\s\S]*generateCareerReasoningCases[\s\S]*saveReasoningCases/, "Phase 5 persistence must run across multiple semantic readings.");
assert.match(documentReasoningService, /upsert\(rows, \{ onConflict: "user_id,fingerprint" \}\)/, "Career reasoning persistence must be idempotent by user and fingerprint.");
assert.match(documentReasoningService, /recordReasoningUserDecision/, "Phase 5 must support separate user decision recording.");
assert.match(documentReasoningMigration, /create table if not exists public\.career_reasoning_cases/, "Reasoning migration must create career reasoning cases.");
assert.match(documentReasoningMigration, /create table if not exists public\.career_reasoning_case_entities/, "Reasoning migration must link cases to semantic entities and documents.");
assert.match(documentReasoningMigration, /create table if not exists public\.career_reasoning_user_decisions/, "Reasoning migration must record user decisions separately.");
assert.match(documentReasoningMigration, /create table if not exists public\.career_entity_merges/, "Reasoning migration must preserve merge provenance and reversibility.");
assert.match(documentReasoningMigration, /unique \(user_id, fingerprint\)/, "Reasoning cases must avoid duplicate creation for unchanged evidence.");
assert.match(documentReasoningMigration, /alter table public\.career_reasoning_cases enable row level security[\s\S]*alter table public\.career_reasoning_case_entities enable row level security[\s\S]*alter table public\.career_reasoning_user_decisions enable row level security/, "Reasoning tables must enable RLS.");
assert.match(documentReasoningMigration, /auth\.uid\(\) = user_id/, "Reasoning RLS must restrict access to the owning user.");
assert.match(cvImportRoute, /runAndPersistSemanticUnderstanding[\s\S]*runAndPersistCareerReasoning[\s\S]*reasoning[\s\S]*importSummary/, "CV import must run Phase 5 after semantic understanding and return a reasoning summary.");
assert.match(professionalIdentityTool, /DocumentReasoningSummary[\s\S]*cvImportSummary\?\.reasoning/, "CV import UI must surface Phase 5 career information checks.");
for (const reasoningSummaryText of ["Career Information Check", "Possible matches", "Information conflicts", "Needs confirmation"]) {
  assert.match(documentReasoningSummary, new RegExp(reasoningSummaryText), `Reasoning summary UI must show ${reasoningSummaryText}.`);
}
assert.doesNotMatch(`${documentReasoningService}\n${documentReasoningUtils}\n${documentReasoningProvider}`, /Florent|TARGET|haematology|microbiology|laboratory assistant/i, "Reasoning code must not hardcode fixture-specific candidate or industry terms.");
assert.match(canonicalProfileTypes, /export type CanonicalProfessionalIdentity = \{[\s\S]*version: number;[\s\S]*identity: CanonicalIdentity;[\s\S]*employment: CanonicalEmployment\[];[\s\S]*education: CanonicalEducation\[];[\s\S]*skills: CanonicalSkill\[];[\s\S]*careerTimeline: CanonicalTimelineEvent\[];/, "Phase 6 must define one versioned canonical professional identity.");
assert.match(canonicalProfileTypes, /export type CanonicalValue<T> = \{[\s\S]*status: CanonicalReviewStatus;[\s\S]*confidence: number;[\s\S]*sourceReferences: CanonicalSourceReference\[];[\s\S]*reasoningCaseId\?: string;[\s\S]*userDecisionId\?: string;/, "Canonical values must carry confidence, review status and provenance.");
assert.match(canonicalProfileTypes, /export type CanonicalSourceReference = \{[\s\S]*sourceType: CanonicalSourceType;[\s\S]*documentId\?: string;[\s\S]*semanticEntityId\?: string;[\s\S]*reasoningCaseId\?: string;[\s\S]*originalValue\?: string;/, "Canonical fields must remain traceable to document, semantic, reasoning or user sources.");
for (const entityType of ["CanonicalEmployment", "CanonicalEducation", "CanonicalCertification", "CanonicalLicence", "CanonicalSkill", "CanonicalLanguage", "CanonicalTimelineEvent", "ProfessionalIdentityView", "ViewFieldOverride", "ViewFreshness"]) {
  assert.match(canonicalProfileTypes, new RegExp(`export type ${entityType}`), `Phase 6 must define ${entityType}.`);
}
assert.match(canonicalProfileTypes, /type: ProfessionalIdentityViewType[\s\S]*configuration:[\s\S]*selectedEmploymentIds\?: string\[][\s\S]*profileVersion: number;/, "Professional identity views must reference canonical entity IDs and profile versions.");
assert.match(canonicalProfileTypes, /overrideType: "hide" \| "reorder" \| "presentation_text" \| "shortened_text" \| "targeted_text"/, "CV-specific rewrites must be stored as view overrides, not canonical fact mutations.");
assert.match(canonicalProfileService, /export async function getOrCreateCanonicalProfile/, "Phase 6 must create or load exactly one canonical profile per user.");
assert.match(canonicalProfileService, /export async function getCanonicalProfileSummary[\s\S]*try \{[\s\S]*getOrCreateCanonicalProfile[\s\S]*catch \(error\)[\s\S]*summary fallback used[\s\S]*readiness: "not_ready"/, "Professional Identity must not render raw Supabase schema errors when canonical profile tables are unavailable.");
assert.doesNotMatch(canonicalProfileService, /getCanonicalProfileSummary[\s\S]*catch \(error\)[\s\S]*console\.error/, "Canonical profile summary fallback must not use console.error because Next.js development treats it as a blocking overlay.");
assert.match(canonicalProfileService, /from\("user_profiles"\)/, "Canonical profile initialization must audit legacy user_profiles fields.");
assert.match(canonicalProfileService, /sourceType: "existing_profile"/, "Legacy user_profiles fields must be treated as migrated evidence, not a separate profile system.");
assert.match(canonicalProfileService, /export async function addManualProfileEntity/, "Manual profile entry must go through a canonical command service.");
assert.match(canonicalProfileService, /export async function applyConfirmedReasoningDecision/, "Confirmed Phase 5 reasoning decisions must apply through the canonical profile service.");
assert.match(canonicalProfileService, /career_reasoning_cases/, "Reasoning application must verify the owning reasoning case.");
assert.match(canonicalProfileService, /career_reasoning_user_decisions/, "Reasoning application must record the user decision separately.");
assert.match(canonicalProfileService, /canonical_employments/, "Reasoning application must be able to create canonical employment data.");
assert.match(canonicalProfileService, /createProfileVersion/, "Reasoning application must version the canonical profile change.");
assert.match(canonicalProfileService, /markDependentViewsStale/, "Canonical profile changes must mark older generated views as stale.");
assert.match(canonicalProfileService, /export async function reverseProfileChange/, "Profile changes must be reversible through a rollback command boundary.");
assert.match(canonicalProfileService, /canonicalProfileCommandService/, "Canonical mutations must be exposed from one shared command service.");
assert.doesNotMatch(canonicalProfileService, /console\.(log|info|warn|error)\([^)]*(full_name|email|phone|document_text|content_text)/i, "Canonical profile logs must not include raw personal values or document text.");
assert.match(canonicalProfileQuality, /calculateCanonicalCompletion/, "Profile completion must be centralized.");
assert.match(canonicalProfileQuality, /calculateCanonicalConfidence/, "Profile confidence must be separate from completion.");
assert.match(canonicalProfileQuality, /calculateCanonicalReadiness/, "Readiness must be calculated separately from completion and confidence.");
assert.match(canonicalProfileQuality, /consistency/, "Canonical quality must include consistency.");
assert.match(canonicalProfileValidation, /validateCanonicalEmployment[\s\S]*employment_end_before_start[\s\S]*current_employment_has_end_date/, "Employment validation must catch impossible dates without blocking unusual careers.");
assert.match(canonicalProfileValidation, /validateCanonicalEducation[\s\S]*education_end_before_start/, "Education validation must validate date consistency.");
assert.match(canonicalProfileValidation, /validateCanonicalContact[\s\S]*contact_email_invalid[\s\S]*contact_url_invalid[\s\S]*contact_visibility_invalid/, "Contact validation must centralize email, URL and visibility checks.");
assert.match(canonicalProfileView, /export function buildProfessionalIdentityView/, "Phase 6 must expose a reusable view builder.");
assert.match(canonicalProfileView, /export function canonicalProfileToCvModel/, "Existing CVs must be supported through a compatibility adapter from canonical profile to CvModel.");
assert.match(canonicalProfileView, /export function viewFreshnessFor/, "Views must detect stale profile versions.");
assert.match(canonicalProfileView, /item\.status !== "archived"/, "CV views must exclude archived canonical records.");
assert.match(canonicalProfileView, /fieldOverrides/, "CV views must support field-specific presentation overrides.");
assert.match(canonicalProfileView, /overrideType === "hide"/, "CV views must hide canonical records without deleting canonical facts.");
assert.match(canonicalProfileView, /item\.explicitness !== "unconfirmed_implied"/, "Unconfirmed implied skills must be excluded from confirmed CV output.");
for (const tableName of [
  "canonical_professional_profiles",
  "canonical_employments",
  "canonical_education",
  "canonical_certifications",
  "canonical_licences",
  "canonical_skills",
  "canonical_languages",
  "canonical_timeline_events",
  "canonical_entity_sources",
  "canonical_entity_aliases",
  "canonical_profile_versions",
  "professional_identity_views"
]) {
  assert.match(canonicalProfileMigration, new RegExp(`create table if not exists public\\.${tableName}`), `Canonical migration must create ${tableName}.`);
  assert.match(canonicalProfileMigration, new RegExp(`alter table public\\.${tableName} enable row level security`), `${tableName} must enable RLS.`);
}
assert.match(canonicalProfileMigration, /constraint canonical_professional_profiles_user_unique unique \(user_id\)/, "Canonical profiles must be one per user.");
assert.match(canonicalProfileMigration, /references public\.user_documents\(id\) on delete set null/, "Canonical sources must preserve profile history if supporting documents are removed.");
assert.match(canonicalProfileMigration, /references public\.career_reasoning_cases\(id\) on delete set null/, "Canonical sources must reference Phase 5 reasoning cases.");
assert.match(canonicalProfileMigration, /constraint canonical_profile_versions_unique unique \(profile_id, version_number\)/, "Profile versions must be unique per canonical profile.");
assert.match(canonicalProfileMigration, /auth\.uid\(\) = user_id/g, "Canonical RLS policies must restrict every table to the owning authenticated user.");
for (const text of ["Professional Identity", "Identite professionnelle", "Review needed", "Verification necessaire", "Profile history", "Historique du profil", "Documents and evidence", "Documents et justificatifs"]) {
  assert.match(canonicalProfileTranslations, new RegExp(text), `Canonical profile translations must include ${text}.`);
}
assert.match(canonicalProfileService, /export async function getCanonicalProfileSummary/, "The canonical profile summary service must remain available for downstream Professional Identity tools.");
assert.doesNotMatch(professionalIdentityPage, /CanonicalProfileOverview/, "Professional Identity setup must stay focused and avoid mixing review with separate document/tool overviews.");
assert.match(canonicalProfileOverview, /One profile for every career document\./, "Canonical profile UI must explain the single-source-of-truth model in human language.");
assert.match(canonicalProfileOverview, /Completion[\s\S]*Confidence[\s\S]*Consistency/, "Canonical profile UI must keep completion, confidence and consistency separate.");
assert.match(canonicalIdentityModel, /export const PROFESSIONAL_IDENTITY_SECTION_IDS = \[[\s\S]*"profile"[\s\S]*"photo"[\s\S]*"personal_information"[\s\S]*"work_authorization"[\s\S]*"career_goal"[\s\S]*"professional_summary"[\s\S]*"employment_preferences"[\s\S]*"salary_expectations"[\s\S]*"availability"/, "Phase 2A must lock the 23 authoritative Professional Identity sections in one model file.");
assert.equal((canonicalIdentityModel.match(/^\s*"[^"]+",?$/gm) ?? []).filter((line) => canonicalIdentityModel.slice(canonicalIdentityModel.indexOf("PROFESSIONAL_IDENTITY_SECTION_IDS"), canonicalIdentityModel.indexOf("] as const;")).includes(line.trim())).length, 23, "Phase 2A Professional Identity section list must contain exactly 23 sections.");
assert.match(canonicalIdentityModel, /export type CanonicalSourceSystem = "canonical" \| "legacy_user_profiles" \| "professional_identity" \| "user_documents" \| "professional_documents"/, "Phase 2A model must identify canonical, legacy and transitional source systems.");
assert.match(canonicalIdentityModel, /createEmptyCanonicalProfessionalIdentity[\s\S]*refreshCanonicalProfileQuality[\s\S]*calculateCanonicalCompletion[\s\S]*calculateCanonicalConfidence/, "Phase 2A model must create a versioned canonical identity with centralized quality calculations.");
assert.match(canonicalIdentityValidation, /validateCanonicalProfessionalIdentityModel[\s\S]*missingCoreSections/, "Phase 2A validation must validate the complete canonical identity.");
for (const reusableCanonicalValidator of ["validateCanonicalEmployment", "validateCanonicalEducation", "validateCanonicalContact"]) {
  assert.match(canonicalIdentityValidation, new RegExp(reusableCanonicalValidator), `Phase 2A validation must reuse ${reusableCanonicalValidator}.`);
}
assert.match(canonicalIdentityValidation, /assertCanonicalProfessionalIdentityIsPersistable/, "Phase 2A validation must expose a persistability guard.");
assert.match(canonicalCompatibilityAdapter, /mapLegacyRowsToCanonicalProfessionalIdentity/, "Phase 2A compatibility adapter must expose a single legacy-to-canonical mapper.");
assert.match(canonicalCompatibilityAdapter, /sourceType: "existing_profile"/, "Phase 2A compatibility adapter must preserve legacy source references.");
assert.match(canonicalCompatibilityAdapter, /legacy_user_profiles[\s\S]*professional_identity/, "Phase 2A compatibility adapter must map legacy and transitional rows without creating a competing profile.");
assert.doesNotMatch(canonicalCompatibilityAdapter, /from\("user_documents"\)|last uploaded|latest CV|cv_documents/i, "Phase 2A compatibility adapter must not use the last uploaded CV or document tables as the identity source of truth.");
assert.match(canonicalProfileRepository, /class CanonicalProfileRepository[\s\S]*from\("canonical_professional_profiles"\)[\s\S]*from\("canonical_employments"\)[\s\S]*from\("canonical_education"\)[\s\S]*from\("canonical_skills"\)[\s\S]*from\("canonical_profile_versions"\)/, "Phase 2A repository must centralize canonical profile persistence.");
assert.match(canonicalProfileRepository, /loadLegacyCompatibilityRows[\s\S]*from\("user_profiles"\)[\s\S]*from\("professional_identity"\)/, "Phase 2A repository must read legacy compatibility rows through one boundary.");
assert.doesNotMatch(canonicalProfileRepository, /from\("user_profiles"\)\.upsert|from\("professional_identity"\)\.upsert/, "Phase 2A repository must not write back to legacy profile tables.");
for (const versioningContract of ["canonicalVersionIdempotencyKey", "nextCanonicalProfileVersion", "createCanonicalVersionContext", "assertCanonicalVersionAdvance"]) {
  assert.match(canonicalProfileVersioning, new RegExp(versioningContract), `Phase 2A versioning must provide ${versioningContract}.`);
}
assert.match(canonicalIdentityService, /class CanonicalProfessionalIdentityService[\s\S]*CanonicalProfileRepository[\s\S]*mapLegacyRowsToCanonicalProfessionalIdentity[\s\S]*assertCanonicalProfessionalIdentityIsPersistable[\s\S]*createCanonicalProfileVersionRecord/, "Phase 2A service must orchestrate repository, compatibility adapter, validation and versioning.");
assert.doesNotMatch(canonicalIdentityService, /EmploymentDiagnosis|DocumentGeneration|generateCV|generateCoverLetter|redirect\(/, "Phase 2A service must not implement diagnosis, documents or route changes.");
for (const phase2aExport of [
  "canonical-professional-identity.model",
  "canonical-professional-identity-service",
  "canonical-professional-identity.validation",
  "canonical-profile-compatibility-adapter",
  "canonical-profile-repository",
  "canonical-profile-versioning"
]) {
  assert.match(canonicalProfileIndex, new RegExp(phase2aExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Canonical profile index must export ${phase2aExport}.`);
}
assert.match(canonicalPhase2aMigration, /alter table public\.canonical_profile_versions[\s\S]*add column if not exists source_system[\s\S]*add column if not exists source_record_id[\s\S]*add column if not exists idempotency_key[\s\S]*add column if not exists compatibility_snapshot_json[\s\S]*add column if not exists validation_json/, "Phase 2A migration scaffold must add only canonical version metadata.");
assert.match(canonicalPhase2aMigration, /create unique index if not exists canonical_profile_versions_idempotency_idx[\s\S]*where idempotency_key is not null/, "Phase 2A migration scaffold must make version creation idempotent without blocking old rows.");
assert.doesNotMatch(canonicalPhase2aMigration, /\bdrop\s+table\b|\btruncate\b|\bdelete\s+from\b|\balter table public\.user_profiles\b|\balter table public\.professional_identity\b/i, "Phase 2A migration scaffold must not destructively modify legacy or transitional tables.");
const inspectionScanRuntime = loadProductionTsModule("lib/documents/inspection/scan-detector.ts");
const inspectionTypeRuntime = loadProductionTsModule("lib/documents/inspection/document-type-detector.ts");
const inspectionLanguageRuntime = loadProductionTsModule("lib/documents/inspection/language-detector.ts");
const inspectionStrategyRuntime = loadProductionTsModule("lib/documents/inspection/processing-strategy.ts");
assert.equal(inspectionScanRuntime.determineOcrRequirement({ sourceType: "digital", hasTextLayer: true, textPageRatio: 1, nativeText: "Professional summary with reliable selectable text ".repeat(8), pageCount: 1 }).required, false, "Clean digital documents must skip OCR.");
assert.equal(inspectionScanRuntime.determineOcrRequirement({ sourceType: "scanned", hasTextLayer: false, textPageRatio: 0, nativeText: "", pageCount: 1 }).required, true, "Scanned documents must require OCR.");
assert.equal(inspectionTypeRuntime.detectDocumentType({ filename: "candidate-cv.pdf", mimeType: "application/pdf", text: "Curriculum vitae. Work experience. Education. Skills." }).value, "cv", "Clean digital one-column CV fixture must classify as CV.");
assert.equal(inspectionTypeRuntime.detectDocumentType({ filename: "lettre-motivation.pdf", mimeType: "application/pdf", text: "Lettre de motivation. Candidature pour le poste. Cordialement." }).value, "cover_letter", "French cover letter fixture must classify as cover letter.");
assert.equal(inspectionTypeRuntime.detectDocumentType({ filename: "unknown.bin", mimeType: "application/pdf", text: "unstructured fragment" }).value, "unknown", "Low-confidence documents must remain unknown.");
assert.equal(inspectionLanguageRuntime.detectLanguages("Expérience professionnelle et compétences avec English summary and skills.").length >= 2, true, "Mixed English and French documents must expose multiple language candidates.");
assert.equal(inspectionStrategyRuntime.selectProcessingStrategy({ source: { type: "mixed", ocrRequired: true }, quality: { overall: "fair" }, confidence: { overall: 0.7 }, warnings: [] }).strategy, "hybrid", "Mixed scanned and digital PDFs must use the hybrid strategy.");
assert.equal(inspectionStrategyRuntime.selectProcessingStrategy({ source: { type: "image", ocrRequired: true }, quality: { overall: "fair" }, confidence: { overall: 0.7 }, warnings: [] }).strategy, "image_ocr", "JPG/PNG documents must use image OCR strategy.");
assert.match(legacyMedicalCvFixture, /LABORATORY ASSISTANT: BLOOD TRANSFUSION[\s\S]*PERIOD: 01\/02\/2014-30\/06\/2014[\s\S]*COMPANY\/INSTITUTION: VAAL UNIVERSITY OF TECHNOLOGY/, "Legacy medical CV fixture must cover grouped experience label/value records.");
assert.match(legacyMedicalCvFixture, /TERTIARY EDUCATION[\s\S]*COURSE: BIOMEDICAL TECHNOLOGY/, "Legacy medical CV fixture must cover tertiary education grouping.");
assert.match(legacyMedicalCvFixture, /HOME LANGUAGE: FRENCH[\s\S]*OTHER LANGUAGES: ENGLISH, KISWAHILI/, "Legacy medical CV fixture must cover explicit language extraction.");
assert.match(legacyMedicalCvFixture, /IDENTITY NUMBER:[\s\S]*MARITAL STATUS:/, "Legacy medical CV fixture must cover sensitive personal data exclusion.");
for (const fixtureName of [
  "LEGACY DOCX TABLE STYLE",
  "MODERN ONE COLUMN",
  "TWO COLUMN PDF STYLE EXTRACTION",
  "PLAIN TEXT CV",
  "GRADUATE CV",
  "EXECUTIVE CV",
  "TECHNICAL CV",
  "HEALTHCARE CV",
  "FRENCH CV",
  "MISSING HEADINGS",
  "REFERENCES",
  "SENSITIVE PERSONAL INFORMATION",
  "EMPLOYER BEFORE TITLE",
  "DATES ON SEPARATE LINE",
  "REPEATED HEADER FOOTER"
]) {
  assert.match(cvImportFixtureMatrix, new RegExp(fixtureName), `CV import fixture matrix must include ${fixtureName}.`);
}
for (const fixtureName of [
  "FIXTURE A - EXPERIENCED TECHNICAL PROFESSIONAL",
  "FIXTURE B - ENTRY LEVEL GRADUATE",
  "FIXTURE C - CORPORATE PROFESSIONAL",
  "FIXTURE D - FRAGMENTED PLAIN TEXT",
  "FIXTURE E - TWO COLUMN EXTRACTED ORDER",
  "FIXTURE F - FRENCH CV",
  "FIXTURE G - UNUSUAL HEADINGS",
  "FIXTURE H - DUPLICATE PAGE FURNITURE",
  "FIXTURE I - CONTACT CONTAMINATION",
  "FIXTURE J - SKILL HIERARCHY"
]) {
  assert.match(cvInterpretationFixtureMatrix, new RegExp(fixtureName), `General CV interpretation fixture matrix must include ${fixtureName}.`);
}
for (const invariant of [
  "phone numbers never become languages",
  "email addresses never become skills",
  "date-only values never become job titles",
  "page numbers never become CV content",
  "continuation labels never become CV content",
  "education modules do not merge into qualification names",
  "skill category headings are preserved as categories",
  "wrapped sentences reconstruct correctly",
  "unresolved content is preserved",
  "no fixture-specific names are present in parser implementation"
]) {
  assert.match(cvInterpretationFixtureMatrix, new RegExp(invariant), `General interpretation fixtures must document invariant: ${invariant}.`);
}
const productionCvImport = loadProductionTsModule("lib/professional-identity/cv-import.ts");

function regressionPdf(lines = []) {
  const escaped = lines.map((line) => line.replace(/([\\()])/g, "\\$1"));
  const stream = `BT\n/F1 11 Tf\n50 750 Td\n${escaped.map((line, index) => `${index ? "0 -16 Td\n" : ""}(${line}) Tj`).join("\n")}\nET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream\nendobj`
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body));
    body += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(body, "latin1");
}

async function validDocx(text) {
  const mammothRequire = createRequire(require.resolve("mammoth"));
  const JSZip = mammothRequire("jszip");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${text.split("\n").map((line) => `<w:p><w:r><w:t>${line}</w:t></w:r></w:p>`).join("")}<w:sectPr/></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer" });
}

const readableCvLines = [
  "ALEX MORGAN", "Software Engineer", "alex@example.com", "PROFESSIONAL SUMMARY",
  "Software engineer with eight years of experience building reliable web applications and services.",
  "EXPERIENCE", "Senior Software Engineer - Example Company - 2020 to Present",
  "Built accessible customer platforms, improved delivery quality, and mentored engineering colleagues.",
  "EDUCATION", "Bachelor of Science in Computer Science - Example University - 2016", "SKILLS", "TypeScript, React, Node.js, SQL, testing, accessibility"
];
const parsedPdfText = await productionCvImport.extractPdfText(regressionPdf(readableCvLines));
assert.match(parsedPdfText, /Software Engineer/, "Normal text-based PDF extraction must return human-readable CV text.");
assert.ok(parsedPdfText.length > 160, "Successful PDF extraction must contain meaningful readable content.");
assert.doesNotMatch(parsedPdfText, /%PDF-|\bendobj\b|\bxref\b|\bstream\b|\btrailer\b/i, "Extracted PDF text must not contain PDF structural markers.");
const importedPdf = await productionCvImport.importCvFromUpload({ fileName: "cv.pdf", fileType: "application/pdf", fileSize: regressionPdf(readableCvLines).length, base64: regressionPdf(readableCvLines).toString("base64") });
assert.match(importedPdf.normalizedText, /EXPERIENCE/, "Successful PDF import must pass meaningful text into CV mapping.");
assert.doesNotMatch(JSON.stringify(importedPdf.cvModel), /%PDF-|\bendobj\b|\bxref\b|\bstream\b|\btrailer\b/i, "Imported CV output must not contain PDF syntax.");
assert.equal(productionCvImport.containsStructuralPdfSyntax("%PDF-1.4\n1 0 obj\nstream\nendobj\nxref\ntrailer"), true, "Raw PDF syntax must be rejected by the extraction guard.");
assert.equal(productionCvImport.normalizeCvImportUpload({ fileName: "cv.pdf", fileType: "", fileSize: 100, base64: "AA==" }).fileType, "application/pdf", "Missing browser MIME type must be safely inferred from a supported extension.");
assert.throws(() => productionCvImport.normalizeCvImportUpload({ fileName: "cv.docx", fileType: "application/pdf", fileSize: 100, base64: "AA==" }), /extension does not match MIME/i, "MIME and extension mismatches must be rejected.");

const docxText = await productionCvImport.extractDocxText(await validDocx(readableCvLines.join("\n")));
assert.match(docxText, /Software Engineer/, "DOCX import extraction must remain working.");
const txtText = await productionCvImport.extractTextFromUploadedCv({ fileName: "cv.txt", fileType: "text/plain", fileSize: Buffer.byteLength(readableCvLines.join("\n")), base64: Buffer.from(readableCvLines.join("\n")).toString("base64") });
assert.match(txtText, /Software Engineer/, "TXT import extraction must remain working.");
assert.throws(() => productionCvImport.validateExtractedCvText(`Readable CV text ${"\u0001".repeat(10)} ${"career history ".repeat(20)}`, "txt"), /Binary or document-format syntax/, "Binary-like extracted output must be rejected.");
assert.throws(() => productionCvImport.validateExtractedCvText("", "txt"), /Insufficient readable text/, "Empty extracted output must be rejected.");
assert.throws(() => productionCvImport.validateExtractedCvText(`<w:document>${"employment education skills ".repeat(20)}</w:document>`, "docx"), /Binary or document-format syntax/, "Raw DOCX XML must be rejected.");
await assert.rejects(productionCvImport.extractDocxText(Buffer.from("PK malformed DOCX")), (error) => /could not safely read this DOCX/i.test(error.userMessage), "Malformed DOCX extraction must return a safe error.");

await assert.rejects(
  productionCvImport.extractPdfText(regressionPdf([])),
  (error) => /OCR is required/i.test(error.userMessage),
  "Scanned or image-only PDFs must produce the user-safe OCR-required state."
);
await assert.rejects(
  productionCvImport.extractPdfText(Buffer.from("%PDF-1.4\nthis is not a valid PDF\n%%EOF")),
  (error) => /could not safely read this PDF/i.test(error.userMessage),
  "Malformed PDFs must produce a safe parsing error."
);

const semanticValue = (value) => ({ value, originalText: value, confidence: 0.9, sourceRegionIds: ["region-1"], explicitness: "explicit", requiresReview: false, reviewStatus: "unreviewed" });
const semanticStage = productionCvImport.stageImportedCvFromSemantic(importedPdf, {
  id: "semantic-test", documentId: "document-test", inspectionId: "inspection-test", visualReadingId: "visual-test", userId: "user-test", status: "completed", documentType: "cv",
  identity: { fullName: semanticValue("Alex Morgan"), sourceRegionIds: ["region-1"], confidence: 0.9, requiresReview: false },
  contact: { emails: [semanticValue("alex@example.com")], phones: [], locations: [], websites: [], confidence: 0.9, requiresReview: false },
  professionalProfile: { headline: semanticValue("Software Engineer"), confidence: 0.9, requiresReview: false },
  employment: [{ id: "employment-1", jobTitle: semanticValue("Senior Software Engineer"), employer: semanticValue("Example Company"), startDate: semanticValue("2020"), endDate: semanticValue("Present"), isCurrent: semanticValue(true), responsibilities: [semanticValue("Built accessible customer platforms")], achievements: [], tools: [], technologies: [], skills: [], sourceRegionIds: ["region-1"], confidence: 0.9, requiresReview: false }],
  education: [{ id: "education-1", qualification: semanticValue("Bachelor of Science in Computer Science"), institution: semanticValue("Example University"), endDate: semanticValue("2016"), sourceRegionIds: ["region-2"], confidence: 0.9, requiresReview: false }],
  certifications: [], skills: [{ id: "skill-1", name: "TypeScript", category: "programming_language", sourceRegionIds: ["region-3"], confidence: 0.9, explicitness: "explicit", requiresReview: false, reviewStatus: "unreviewed" }], languages: [], projects: [], awards: [], memberships: [], publications: [], volunteering: [], references: [], entities: [{ id: "entity-1" }], relationships: [], unclassifiedContent: [], conflicts: [], warnings: [], confidence: { identity: 0.9, contact: 0.9, professionalProfile: 0.9, employment: 0.9, education: 0.9, certifications: 0.9, skills: 0.9, languages: 0.9, overall: 0.9 }, createdAt: new Date().toISOString()
});
assert.equal(semanticStage.cvModel.fullName, "Alex Morgan", "Staged CV identity must come from semantic entities.");
assert.equal(semanticStage.cvModel.professionalExperience[0]?.company, "Example Company", "Staged CV employment must come from semantic entities.");
assert.equal(semanticStage.cvModel.education[0]?.institution, "Example University", "Staged CV education must come from semantic entities.");
assert.ok(semanticStage.cvModel.technicalSkills.includes("TypeScript"), "Staged CV skills must come from semantic entities.");

const florentCanonicalCv = productionCvImport.mapImportedTextToCvModel(legacyMedicalCvFixture);
assert.ok(florentCanonicalCv && typeof florentCanonicalCv === "object", "Production CV import must return a CanonicalCv object for CV Studio.");
assert.ok(Array.isArray(florentCanonicalCv.languages), "CanonicalCv must expose structured languages.");
assert.ok(Array.isArray(florentCanonicalCv.professionalExperience), "CanonicalCv must expose structured professionalExperience.");
assert.ok(Array.isArray(florentCanonicalCv.education), "CanonicalCv must expose structured education.");
assert.ok(florentCanonicalCv.languages.every((item) => !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(`${item.language} ${item.level}`)), "No email-shaped value may exist in CanonicalCv languages.");
assert.ok(florentCanonicalCv.languages.every((item) => !/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/.test(`${item.language} ${item.level}`)), "No phone-shaped value may exist in CanonicalCv languages.");
assert.ok(florentCanonicalCv.professionalExperience.every((item) => !/^(?:\d{4}|(?:19|20)\d{2}\s*[-–—]\s*(?:present|current|now|(?:19|20)\d{2}))$/i.test(item.role.trim())), "No date-only value may be a CanonicalCv job title.");
assert.ok(!/\bcontinued\b/i.test(JSON.stringify(florentCanonicalCv)), "Continuation headers must not exist in CanonicalCv content.");
assert.ok(!/(^|["\s])page\s+\d+/i.test(JSON.stringify(florentCanonicalCv)) && !/["\s]\d{1,2}\s*\/\s*\d{1,2}["\s]/.test(JSON.stringify(florentCanonicalCv)), "Page numbers must not exist in CanonicalCv content.");
assert.ok(florentCanonicalCv.professionalExperience.every((item) => !(item.role.includes("|") && !item.company && !item.startDate && !item.endDate)), "Pipe-separated flattened experience strings must not substitute for structured ExperienceRecord data.");
assert.ok(florentCanonicalCv.education.every((item) => item.qualification.length < 180 && !/;.*;.*;/.test(item.qualification)), "Qualification title must not absorb an entire module list.");
assert.ok(florentCanonicalCv.references.items.length >= 2, "References continuing through the import must remain grouped in CanonicalCv references.");
assert.match(documentDownloads, /export type CoverLetterData = \{[\s\S]*fullName: string;[\s\S]*professionalTitle: string;[\s\S]*companyName: string;[\s\S]*subject: string;[\s\S]*motivationParagraph: string;[\s\S]*evidenceParagraph: string;[\s\S]*companyAlignmentParagraph: string;[\s\S]*designSystem: CoverLetterTemplateName;[\s\S]*\};[\s\S]*export type CoverLetterModel = CoverLetterData;/, "Cover Letter foundation must define one canonical structured CoverLetterData/CoverLetterModel source of truth.");
for (const templateName of ["PATHZY Signature Letter", "Executive Black", "Modern ATS", "Google Style", "Microsoft Professional", "Deloitte Consulting", "Executive Signature", "Global Corporate", "Tech Minimal", "Creative Professional", "Graduate First Step"]) {
  assert.match(documentDownloads, new RegExp(`name: "${templateName}"`), `${templateName} must be registered in the cover letter template gallery.`);
}
for (const template of documentDownloadsRuntime.coverLetterTemplateGallery) {
  assert.equal(template.palettes.length, 3, `${template.name} cover letter design must expose exactly three curated palettes.`);
  assert.equal(new Set(template.palettes.map((palette) => palette.id)).size, 3, `${template.name} cover letter palette ids must be unique.`);
  for (const palette of template.palettes) {
    for (const token of ["pageBackground", "primaryText", "secondaryText", "headingText", "candidateNameText", "accent", "divider", "linkContactText"]) {
      assert.match(palette[token], /^#[0-9a-f]{6}$/i, `${template.name} ${palette.name} must define semantic ${token}.`);
    }
    assert.ok(
      documentDownloadsRuntime.coverLetterContrastRatio(palette.candidateNameText, palette.pageBackground) >= 4.5,
      `${template.name} ${palette.name} candidate-name text must be readable on its page background.`
    );
    assert.ok(
      documentDownloadsRuntime.coverLetterContrastRatio(palette.primaryText, palette.pageBackground) >= 4.5,
      `${template.name} ${palette.name} body text must be readable on its page background.`
    );
  }
}
const coverLetterContrastFailures = documentDownloadsRuntime.coverLetterPaletteContrastChecks().filter((check) => !check.pass);
assert.equal(coverLetterContrastFailures.length, 0, "Every Cover Letter template/palette semantic text token must pass WCAG AA contrast for preview and PDF rendering.");
assert.match(documentDownloads, /if \(typeof value !== "string"\) return "PATHZY Signature Letter"/, "Cover Letter generation must default to the benchmark PATHZY Signature Letter template.");
assert.match(documentDownloads, /export function serializeCoverLetterData/, "Cover Letter content text must serialize from coverLetterData.");
assert.match(documentDownloads, /export function renderCoverLetterHtmlFromData/, "Cover Letter preview must render from coverLetterData.");
assert.match(documentDownloads, /export function simpleCoverLetterPdfDocument[\s\S]*pdfFromLayout\(buildCoverLetterLayoutFromData\(data\)\)/, "Cover Letter PDF must export from the same coverLetterData renderer.");
assert.match(documentDownloads, /coverLetterPremiumTemplateForPalette\(coverDesign, coverPalette\)/, "Cover Letter preview and PDF must use the semantic Cover Letter palette contract.");
assert.match(documentDownloads, /candidateNameColor\(headerBackground\)/, "Cover Letter headers must resolve candidate-name text against the actual header background.");
const coverLetterJobContext = {
  source: "pasted_job_description",
  company: "Avolito Beverages",
  role: "Marketing Coordinator",
  location: "Johannesburg",
  jobDescription: "Coordinate launch campaigns, supplier communication and weekly reporting.",
  requirements: ["Marketing coordination", "Weekly reporting", "Stakeholder communication"],
  responsibilities: ["Coordinate launch campaigns", "Prepare reporting updates"],
  hiringManager: ""
};
const signatureCoverLetterData = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(professionalIdentityCvValues, coverLetterJobContext, { templateName: "PATHZY Signature Letter", language: "english" });
assert.equal(signatureCoverLetterData.fullName, "Nicka Candida", "Cover Letter model must draw the candidate name from Professional Identity.");
assert.equal(signatureCoverLetterData.companyName, "Avolito Beverages", "Cover Letter model must draw the organization from Job Context.");
assert.equal(signatureCoverLetterData.jobTitle, "Marketing Coordinator", "Cover Letter model must draw the target role from Job Context.");
assert.equal(signatureCoverLetterData.designSystem, "PATHZY Signature Letter", "Cover Letter model must use the benchmark Signature Letter template.");
const signatureCoverLetterUserText = [
  signatureCoverLetterData.openingParagraph,
  signatureCoverLetterData.motivationParagraph,
  signatureCoverLetterData.evidenceParagraph,
  signatureCoverLetterData.companyAlignmentParagraph,
  signatureCoverLetterData.closingParagraph,
  ...signatureCoverLetterData.bodyParagraphs
].join(" ");
assert.doesNotMatch(signatureCoverLetterUserText, /PATHZY|salary|employment diagnosis|PATHZY score|work authorization|nationality/i, "Generated Cover Letter prose must exclude internal/private fields and product guidance.");
assert.doesNotMatch(signatureCoverLetterData.greeting, /undefined|null|recruiter/i, "Cover Letter must not invent a recruiter name when none is known.");
const supportOpportunityContext = {
  source: "pasted_job_description",
  company: "Metro Services",
  role: "Maintenance Support Assistant",
  location: "Johannesburg",
  jobDescription: "Support maintenance requests, coordinate updates, communicate with customers, and troubleshoot basic service issues. Power BI is preferred.",
  requirements: ["Customer support", "Maintenance coordination", "Basic troubleshooting"],
  responsibilities: ["Coordinate maintenance requests", "Prepare service updates"],
  qualifications: ["Matric or equivalent"],
  hiringManager: ""
};
const supportLetterSelection = coverLetterIntelligenceRuntime.selectCoverLetterEvidence(structuredIdentityValues, supportOpportunityContext, { language: "english" });
assert.ok(supportLetterSelection.jobAnalysis.mandatoryRequirements.length >= 3, "Cover Letter intelligence must analyze explicit job requirements before drafting.");
assert.ok(supportLetterSelection.jobAnalysis.responsibilities.length >= 2, "Cover Letter intelligence must separate responsibilities from candidate requirements.");
assert.ok(supportLetterSelection.selectedEvidence.length <= 4, "Cover Letter intelligence must select a small evidence budget instead of every profile fact.");
assert.ok(supportLetterSelection.selectedSkills.length <= 5, "Cover Letter intelligence must select a bounded relevant skill list.");
assert.equal(new Set(supportLetterSelection.selectedEvidence.map((item) => item.id)).size, supportLetterSelection.selectedEvidence.length, "Cover Letter evidence selection must deduplicate repeated evidence records.");
const supportLetterData = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(structuredIdentityValues, supportOpportunityContext, { templateName: "PATHZY Signature Letter", language: "english" });
const supportLetterText = [
  supportLetterData.openingParagraph,
  supportLetterData.motivationParagraph,
  supportLetterData.evidenceParagraph,
  supportLetterData.companyAlignmentParagraph,
  supportLetterData.closingParagraph,
  ...supportLetterData.bodyParagraphs
].join(" ");
assert.ok(supportLetterText.split(/\s+/).filter(Boolean).length <= 430, "Cover Letter output must stay one-page-oriented instead of becoming a profile dump.");
assert.doesNotMatch(supportLetterText, /Building an employment operating system for guided career support[\s\S]*Building an employment operating system for guided career support/i, "Cover Letter must not duplicate PATHZY Experience descriptions.");
assert.doesNotMatch(supportLetterText, /Coordinating launch planning, brand messaging and early marketing operations[\s\S]*Coordinating launch planning, brand messaging and early marketing operations/i, "Cover Letter must not duplicate AVOLITO Experience descriptions.");
assert.doesNotMatch(supportLetterText, /Founder & Product Owner[\s\S]*2025[\s\S]*Present[\s\S]*Building an employment operating system/i, "Cover Letter must not copy a complete CV-style Experience block.");
assert.doesNotMatch(supportLetterData.evidenceParagraph, /Power BI/i, "Cover Letter evidence paragraph must not claim a missing required or preferred skill.");
const noFormalExperienceValues = professionalIdentityCompletionRuntime.normalizeProfessionalIdentityCompletionValues({
  full_name: "Amina Graduate",
  career_goal: "IT Support Intern",
  education: ["Diploma in Information Technology"],
  experience: [],
  skills: ["Communication", "Troubleshooting", "Customer service"],
  projects: ["Built a help desk ticket tracker for class practice"]
});
const noFormalExperienceLetter = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(noFormalExperienceValues, {
  source: "manual",
  company: "Support Desk Co",
  role: "IT Support Intern",
  requirements: ["Troubleshooting", "Customer service"],
  responsibilities: ["Respond to support tickets"]
}, { templateName: "PATHZY Signature Letter", language: "english" });
assert.doesNotMatch(noFormalExperienceLetter.evidenceParagraph, /extensive professional|years of experience|previous employment/i, "Early-career Cover Letters must not fabricate formal experience.");
assert.match(noFormalExperienceLetter.evidenceParagraph, /Troubleshooting|Customer service|help desk|Information Technology/i, "Early-career Cover Letters must use truthful education, project or skill evidence.");
const careerChangeValues = professionalIdentityCompletionRuntime.normalizeProfessionalIdentityCompletionValues({
  full_name: "Sam Careerchange",
  career_goal: "Customer Support Advisor",
  education: ["Certificate in Business Administration"],
  experience: [{ id: "exp-admin", role: "Office Administrator", company: "Example Office", location: "", startDate: "2021", endDate: "2024", description: "Handled records, scheduling and daily communication.", achievements: ["Resolved client scheduling queries."] }],
  skills: ["Communication", "Administration", "Customer service"]
});
const careerChangeLetter = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(careerChangeValues, {
  source: "manual",
  company: "Client Help Ltd",
  role: "Customer Support Advisor",
  requirements: ["Customer communication", "Record keeping"],
  responsibilities: ["Respond to customer queries"]
}, { templateName: "PATHZY Signature Letter", language: "english" });
assert.match(careerChangeLetter.evidenceParagraph, /Office Administrator|Communication|Customer service|client/i, "Career-change Cover Letters must select transferable evidence instead of dumping old-career history.");
const alternateTemplateLetter = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(structuredIdentityValues, supportOpportunityContext, { templateName: "Executive Black", language: "english" });
assert.equal(alternateTemplateLetter.designSystem, "Executive Black", "Cover Letter template changes must alter presentation metadata.");
assert.equal(alternateTemplateLetter.evidenceParagraph, supportLetterData.evidenceParagraph, "Cover Letter template changes must not regenerate or alter the selected content.");
const supportLetterQuality = coverLetterIntelligenceRuntime.validateCoverLetterDraftQuality(supportLetterData, supportLetterSelection);
assert.equal(supportLetterQuality.valid, true, "Cover Letter quality validation must pass a concise grounded one-page-oriented letter.");
const signatureCoverLetterHtml = documentDownloadsRuntime.renderCoverLetterHtmlFromData(signatureCoverLetterData);
const signatureCoverLetterPdf = documentDownloadsRuntime.simpleCoverLetterPdfDocument(signatureCoverLetterData);
assert.match(signatureCoverLetterHtml, /data-pathzy-cover-letter-document-root="candidate-cover-letter-only"/, "Cover Letter preview must render inside an isolated candidate document root.");
assert.equal((signatureCoverLetterHtml.match(/class="cv-render-page-frame"/g) ?? []).length, 1, "A normal one-page Signature Letter fixture must produce one real A4 page frame.");
assert.match(signatureCoverLetterHtml, /Nicka Candida[\s\S]*Marketing Coordinator[\s\S]*Avolito Beverages[\s\S]*Kind regards/, "Cover Letter preview must render formal letter hierarchy from the normalized model.");
assert.ok(signatureCoverLetterPdf.startsWith("%PDF-1.4"), "Cover Letter export must produce a real PDF payload.");
assert.ok(signatureCoverLetterPdf.length > 1200, "Cover Letter export must produce a non-empty PDF payload.");
assert.match(signatureCoverLetterPdf, /Nicka Candida[\s\S]*Marketing Coordinator[\s\S]*Avolito Beverages[\s\S]*Kind regards/, "Cover Letter PDF must contain the current saved candidate, role, company and closing content.");
assert.doesNotMatch(signatureCoverLetterHtml, /Employment Center|Applications|Interview Preparation|Career Analytics|Settings|Logout|Your Mentor|EN\/FR/, "Application navigation must never render inside the candidate Cover Letter preview root.");
assert.doesNotMatch(signatureCoverLetterPdf, /Employment Center|Applications|Interview Preparation|Career Analytics|Settings|Logout|Your Mentor|pricing/i, "Cover Letter PDF export must never contain application chrome or pricing redirects.");
const longContactCoverLetterData = {
  ...signatureCoverLetterData,
  professionalTitle: "Maintenance & Support",
  jobTitle: "Maintenance & Support",
  companyName: "Avolito Beverages",
  phone: "+27 72 123 4567",
  email: "nicka.candida@example.com",
  linkedIn: "https://www.linkedin.com/in/nicka-candida-maintenance-support-johannesburg-2026",
  city: "Johannesburg",
  country: "South Africa"
};
const longContactCoverLetterHtml = documentDownloadsRuntime.renderCoverLetterHtmlFromData(longContactCoverLetterData);
const longContactCoverLetterPdf = documentDownloadsRuntime.simpleCoverLetterPdfDocument(longContactCoverLetterData);
assert.match(documentDownloads, /function coverLetterContactGroups[\s\S]*data\.phone[\s\S]*data\.email[\s\S]*data\.linkedIn[\s\S]*data\.city, data\.country/, "Cover Letter preview and PDF must use grouped contact rows rather than one unbreakable contact line.");
assert.doesNotMatch(documentDownloads, /coverLetterContactLines\(cover\)\.join\("  \|  "\)/, "Cover Letter header must not render phone, email, LinkedIn and location as one PDF text command.");
assert.match(documentDownloads, /drawContactBlock[\s\S]*wrapText\(group, width, coverDesign\.contactSize\)[\s\S]*currentPage\.elements\.push\(\{ kind: "text"/, "Cover Letter contact layout must pre-wrap bounded text elements before preview or PDF rendering.");
["Nicka Candida", "Maintenance &amp; Support", "Avolito Beverages", "+27 72 123 4567", "nicka.candida@example.com", "Johannesburg, South Africa"].forEach((field) => {
  assert.match(longContactCoverLetterHtml, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Designed Preview must show ${field} from the saved Cover Letter model.`);
});
assert.match(longContactCoverLetterHtml, /linkedin\.com\/in\/nicka-candida-maintenance-s[\s\S]*upport-johannesburg-2026/, "Designed Preview must show the long LinkedIn URL using safe wrapped text.");
["+27 72 123 4567", "nicka.candida@example.com", "Johannesburg, South Africa"].forEach((field) => {
  assert.match(longContactCoverLetterPdf, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Cover Letter PDF must contain visible contact field ${field}.`);
});
assert.match(longContactCoverLetterPdf, /linkedin\.com\/in\/nicka-candida[\s\S]*maintenance-s[\s\S]*upport-johannesburg-2026/, "Cover Letter PDF must contain the safely wrapped long LinkedIn URL from the Designed Preview.");
assert.doesNotMatch(longContactCoverLetterPdf, /\+27 72 123 4567  \|  nicka\.candida@example\.com  \|  https:\/\/www\.linkedin\.com\/in\/nicka-candida-maintenance-support-johannesburg-2026  \|  Johannesburg, South Africa/, "Cover Letter PDF must not emit the full long contact block as one unclipped horizontal text command.");
assert.equal((longContactCoverLetterHtml.match(/class="cv-render-page-frame"/g) ?? []).length, (longContactCoverLetterPdf.match(/\/Type \/Page\b/g) ?? []).length, "Cover Letter Designed Preview and PDF export must agree on page count for the long-contact fixture.");
const longSignatureCoverLetterHtml = documentDownloadsRuntime.renderCoverLetterHtmlFromData({
  ...signatureCoverLetterData,
  bodyParagraphs: Array.from({ length: 16 }, (_, index) => `Additional relevant paragraph ${index + 1} explaining confirmed application evidence, job context and professional fit without adding unsupported facts.`)
});
assert.ok((longSignatureCoverLetterHtml.match(/class="cv-render-page-frame"/g) ?? []).length > 1, "Long Cover Letter content must create another A4 page instead of clipping or overlapping.");
assert.match(documentDownloads, /export function coverLetterPdfFilename/, "Cover Letter PDF export must use a dedicated clean filename helper.");
assert.match(documentDownloads, /\$\{candidate\}_Cover_Letter_\$\{company\}_\$\{jobTitle\}_\$\{stamp\}\.pdf/, "Cover Letter filename must include candidate, company, job title, and date.");
assert.match(documentDownloads, /function resolveCoverLetterDesign/, "Cover Letter renderer must have design-system-specific layout tokens.");
assert.match(documentDownloads, /headerStyle: "minimal"/, "ATS cover letter must use a minimal recruiter-friendly header style.");
assert.match(documentDownloads, /headerStyle: "accented"/, "Professional cover letter must use an accented business header style.");
assert.match(documentDownloads, /headerStyle: "executive"/, "Executive cover letter must use an executive letterhead style.");
assert.match(documentDownloads, /headerStyle: "signature"/, "Executive Signature cover letter must use a signature-specific layout.");
assert.match(documentDownloads, /headerStyle: "technical"/, "Tech Minimal cover letter must use a technical letter layout.");
assert.match(documentDownloads, /headerStyle: "creative"/, "Creative Professional cover letter must use an editorial letter layout.");
assert.match(documentDownloads, /const coverDesign = resolveCoverLetterDesign\(cover\.designSystem\)/, "Cover Letter layout must resolve the selected design system.");
assert.match(documentDownloads, /const coverPalette = coverLetterTemplatePalette\(cover\.designSystem\)[\s\S]*premiumTemplate = coverLetterPremiumTemplateForPalette\(coverDesign, coverPalette\)/, "Cover Letter rendering must use semantic cover-letter palette tokens without changing CV content.");
assert.match(documentDownloads, /coverDesign\.paragraphSpacing/, "Cover Letter design systems must change section rhythm, not just color.");
assert.match(documentDownloads, /coverDesign\.nameSize/, "Cover Letter design systems must change typography, not just color.");
assert.match(documentDownloads, /coverDesign\.headerStyle === "executive"[\s\S]*premiumTemplate\.amber/, "Executive cover letter must include a distinct premium accent treatment.");
assert.match(professionalIdentityCoverLetterModel, /export type CoverLetterJobContext/, "Cover Letter architecture must define a separate job/application context contract.");
assert.match(coverLetterIntelligence, /export function analyzeCoverLetterJobContext/, "Cover Letter intelligence must analyze structured Job Context before drafting.");
assert.match(coverLetterIntelligence, /export function selectCoverLetterEvidence/, "Cover Letter intelligence must select ranked Professional Identity evidence instead of dumping all profile data.");
assert.match(coverLetterIntelligence, /selectedEvidence[\s\S]*slice\(0, 4\)/, "Cover Letter evidence selection must enforce a concise evidence budget.");
assert.match(coverLetterIntelligence, /selectedSkills[\s\S]*slice\(0, 5\)/, "Cover Letter evidence selection must enforce a concise skill budget.");
assert.match(coverLetterIntelligence, /trace:[\s\S]*requirement:[\s\S]*evidenceIds:/, "Cover Letter intelligence must retain internal requirement-to-evidence traceability.");
assert.match(professionalIdentityCoverLetterModel, /export function coverLetterDataFromProfessionalIdentity/, "Cover Letter architecture must transform Professional Identity plus job context into the normalized letter model.");
assert.match(professionalIdentityCoverLetterModel, /export function professionalIdentityCoverLetterDocument/, "Cover Letter architecture must create generated documents from the normalized model.");
assert.match(professionalIdentityCoverLetterModel, /export function professionalIdentityCoverLetterSyncStatus/, "Cover Letter architecture must expose sync status instead of duplicating profile facts in the document editor.");
assert.match(professionalIdentityCoverLetterModel, /professionalIdentityRequiredChecksFromValues\(values\)/, "Cover Letter missing-information checks must use the shared Professional Identity completion engine.");
assert.match(professionalIdentityCoverLetterModel, /!hasJobContext\(jobContext\)[\s\S]*"missing_job_context"[\s\S]*missingSections\.length[\s\S]*"missing_information"/, "Cover Letter sync status must prioritize missing Job Context so the empty state stays actionable.");
assert.match(professionalIdentityCoverLetterModel, /serializeCoverLetterData\(coverLetterData\)/, "Cover Letter content serialization must come from the normalized coverLetterData model.");
assert.match(professionalIdentityCoverLetterModel, /manualOverride: false/, "New source-generated Cover Letters must start without a manual override flag.");
assert.match(professionalIdentityService, /const templateName = normalizeCoverLetterTemplate\(options\.templateName \?\? "PATHZY Signature Letter"\);/, "Cover Letter generation must use the benchmark cover-letter template family by default.");
assert.match(coverLetterGeneration, /professionalIdentityValuesFromSources\(inputs\.profile, \{ answers: inputs\.discoveryAnswers \}/, "Cover Letter generation must read the Professional Identity compatibility model.");
assert.match(coverLetterGeneration, /if \(!company \|\| !role\)[\s\S]*job title and company name are required/, "Cover Letter generation must require job title and company before claiming tailored status.");
assert.doesNotMatch(coverLetterGeneration, /const role = prepareForProfessionalDocument\(options\.role \|\| careerGoal\(inputs\)\)/, "Cover Letter generation must not substitute Professional Identity career goal for missing job context.");
assert.match(coverLetterGeneration, /const jobContext: CoverLetterJobContext = \{[\s\S]*source: options\.jobDescription \? "pasted_job_description" : "manual"/, "Cover Letter generation must separate job context from Professional Identity.");
assert.match(coverLetterGeneration, /coverLetterDataFromProfessionalIdentity\(identityValues, jobContext, \{ templateName, language, tone \}\)/, "Cover Letter generation must create coverLetterData through the shared Professional Identity transformation layer.");
assert.match(professionalIdentityService, /source: "professional_identity_and_job_context"[\s\S]*professionalIdentitySource: "canonical_professional_identity"[\s\S]*jobContext[\s\S]*manualOverride: false/, "Cover Letter save must persist source metadata, job context and manual override state.");
assert.match(professionalIdentityCoverLetterModel, /intelligence:[\s\S]*strategyVersion: "pathzy-cover-letter-evidence-selection-v1"[\s\S]*jobAnalysis[\s\S]*selectedEvidence[\s\S]*trace[\s\S]*qualityWarnings/, "Generated Cover Letter documents must persist evidence-selection trace metadata separately from visual templates.");
assert.match(professionalIdentityTool, /initialDocumentIsPersisted = Boolean\(initialDocument\?\.id[\s\S]*setSaved\(true\)/, "Document workspaces must only claim Saved after a persisted backend document id exists.");
assert.match(professionalIdentityTool, /method: document\.id \? "PATCH" : "POST"[\s\S]*persistDocument:[\s\S]*contentJson[\s\S]*status: "draft"/, "Saving an unsaved generated document must create or update a durable user_documents artifact without regenerating or losing edits.");
assert.match(professionalIdentityApi, /persistDocument[\s\S]*\.eq\("user_id", user\.id\)[\s\S]*\.eq\("document_type", documentType\)[\s\S]*existingId[\s\S]*\.update\(\{[\s\S]*\.insert\(\{[\s\S]*document_type: documentType/, "The Professional Identity API must update the existing owned CV or Cover Letter document before inserting a new user_documents row.");
assert.doesNotMatch(professionalIdentityApi, /downloaded\?: boolean|if \(body\.downloaded\)|status = "downloaded"/, "The Professional Identity API must not treat PDF download as a document lifecycle mutation.");
assert.doesNotMatch(coverLetterGeneration, /getLatestCvModel\(supabase, userId\)/, "Cover Letter generation must not use the latest CV as the factual source of truth.");
assert.match(coverLetterGeneration, /jobDescriptionFocus\(options\.jobDescription\)/, "Cover Letter generation must use the job description to shape the letter.");
assert.doesNotMatch(coverLetterGeneration, /PATHZY Professional Identity|profil PATHZY|will not invent|Template:|Add your full name/, "Generated cover letters must not contain internal source wording, template notes, or placeholders.");
assert.match(professionalIdentityTool, /coverLetterDataFromUnknown/, "Cover Letter UI must hydrate coverLetterData from saved documents.");
assert.match(professionalIdentityTool, /initialCoverLetterData = useMemo/, "Cover Letter UI must hydrate an initial source-generated or saved document without requiring a generate click.");
assert.match(professionalIdentityTool, /renderCoverLetterHtmlFromData\(previewCoverLetterData\)/, "Cover Letter preview must use the debounced coverLetterData preview state.");
assert.match(professionalIdentityTool, /simpleCoverLetterPdfDocument\(exportCoverLetterData\)/, "Cover Letter download must use cleaned coverLetterData.");
assert.match(professionalIdentityTool, /coverLetterPdfFilename\(exportCoverLetterData\)/, "Cover Letter download must use the clean cover letter PDF filename.");
assert.doesNotMatch(professionalIdentityTool, /downloadPdf[\s\S]*saveDocument\(true\)/, "Cover Letter download must not auto-save or create document records; users must save explicitly before export.");
assert.match(professionalIdentityTool, /downloadBlob\(tool === "cover-letter"[\s\S]*coverLetterPdfFilename\(exportCoverLetterData\)[\s\S]*"application\/pdf"[\s\S]*pdf\)/, "Cover Letter download must hand the current structured PDF payload directly to the browser download helper.");
assert.doesNotMatch(professionalIdentityTool, /cover-letter[\s\S]{0,220}docx/i, "Cover Letter user flow must not expose DOCX export.");
assert.match(professionalIdentityTool, /function updateCoverLetterDraft/, "Cover Letter editor must update coverLetterData as the source of truth.");
assert.match(professionalIdentityTool, /manualOverride: Boolean\(existingVersion\.manualOverride\) \|\| manualOverride/, "Cover Letter manual edits must be protected as document-specific overrides.");
assert.match(professionalIdentityTool, /coverLetterContentJson\(document, draft, true\)/, "Cover Letter edits must preserve metadata and mark the draft as manually edited.");
assert.match(professionalIdentityTool, /function renderCoverLetterEditor/, "Cover Letter must have a structured editor.");
assert.match(professionalIdentityTool, /function renderCoverLetterTemplateGallery/, "Cover Letter Studio must expose a letter-specific template gallery.");
assert.match(professionalIdentityTool, /function renderCoverLetterMiniPreview/, "Cover Letter template cards must show real mini document previews.");
assert.match(professionalIdentityTool, /filteredCoverLetterTemplates\.map/, "Cover Letter template gallery must render browsed letter-specific templates.");
assert.match(professionalIdentityTool, /Presentation changes only\. Your candidate and job data stay the same\./, "Cover Letter template switching must explain that content is preserved.");
assert.match(professionalIdentityTool, /template_name: draft\.designSystem,[\s\S]*coverLetterContentJson\(document, draft, false\)/, "Cover Letter template switching must update presentation without losing content or source metadata.");
assert.doesNotMatch(professionalCoverLetterPage, /premiumDocumentTemplates|documentTemplateGallery\.map/, "Cover Letter page must not render the old borrowed CV template strip.");
assert.match(professionalIdentityTool, /previewCoverLetterData/, "Cover Letter preview must use a stable debounced preview data state.");
assert.match(professionalIdentityTool, /setTimeout\(\(\) => \{\s*setPreviewCoverLetterData\(coverLetterData\);\s*\}, 260\);/, "Cover Letter live preview must debounce updates to avoid shaking while typing.");
assert.match(professionalIdentityTool, /data-cover-letter-workspace-layout="compact-controls-large-preview"[\s\S]*data-cover-letter-document-studio="true"/, "Cover Letter workspace must use a compact control area beside a large document studio preview.");
assert.doesNotMatch(professionalIdentityTool, /tool === "cover-letter" \? "lg:col-span-1"|tool === "cover-letter" \? "grid gap-5 lg:grid-cols-4"/, "Cover Letter must not use the old narrow editor and preview column split.");
assert.doesNotMatch(professionalIdentityTool, /renderCoverLetterIdentityCorrectionCard|Your Cover Letter uses your Professional Identity as its source of truth/, "Cover Letter workspace must not render a large persistent Professional Identity source explanation block.");
assert.match(professionalIdentityTool, /function renderCoverLetterDocumentBar[\s\S]*MY COVER LETTER[\s\S]*saveActionLabel\(\)[\s\S]*Download PDF[\s\S]*Update information[\s\S]*Change Job[\s\S]*Change design[\s\S]*Preview/, "Cover Letter document bar must group the primary actions in compact controls.");
assert.match(professionalIdentityTool, /renderCoverLetterCompactStatus\(\)/, "Cover Letter editor must show Cover Letter Health in the structured editor.");
assert.match(professionalIdentityTool, /Cover Letter Health/, "Cover Letter health label must be visible.");
assert.match(professionalIdentityTool, /const \[coverLetterHealthExpanded, setCoverLetterHealthExpanded\] = useState\(false\)/, "Cover Letter Health disclosure must be collapsed by default.");
assert.match(professionalIdentityTool, /aria-expanded=\{coverLetterHealthExpanded\}[\s\S]*aria-controls=\{panelId\}[\s\S]*setCoverLetterHealthExpanded/, "Cover Letter Health disclosure must use the existing accessible Expand/Collapse pattern.");
assert.match(professionalIdentityTool, /Designed Preview shows the print-ready A4 cover letter that the PDF export uses\./, "Cover Letter preview must use the same preview explanation as My CV.");
assert.match(professionalIdentityTool, /Download PDF[\s\S]*Update information[\s\S]*Change Job[\s\S]*Preview[\s\S]*Generate Cover Letter/, "Cover Letter workspace must expose PDF, update information, change job, preview, and generation actions.");
assert.match(professionalIdentityTool, /function renderCoverLetterJobContextEntry[\s\S]*data-cover-letter-job-context-flow="true"/, "Cover Letter job context must be handled by one shared actionable flow.");
assert.match(professionalIdentityTool, /Which opportunity are you applying for\?[\s\S]*Choose a saved job[\s\S]*Paste job description[\s\S]*Enter job details/, "Missing job context must show the user clear next-step options.");
assert.match(professionalIdentityTool, /Job title \/ position[\s\S]*required[\s\S]*Company name[\s\S]*required/, "Manual Cover Letter job details must require only job title and company.");
assert.match(professionalIdentityTool, /Hiring manager \/ recruiter name[\s\S]*placeholder="Optional"/, "Recruiter or hiring manager name must remain optional.");
assert.match(professionalIdentityTool, /Paste the job advert \/ description[\s\S]*Review extracted details[\s\S]*Review the extracted details before generation/, "Pasted job descriptions must be reviewed before generation.");
assert.match(professionalIdentityTool, /coverLetterJobHref[\s\S]*Open saved jobs/, "Saved-job selection must use the existing Opportunities or Saved Jobs route.");
assert.match(professionalIdentityTool, /onClick=\{\(\) => setCoverLetterJobContextMode\("choose"\)\}[\s\S]*Change Job/, "Change Job must open the same job-context flow.");
assert.match(professionalCoverLetterPage, /name: "jobDescription"/, "Cover Letter route must still provide the optional job description input.");
assert.match(professionalCoverLetterPage, /keyRequirements: \(jobContext\.requirements \?\? \[\]\)\.join\("\\n"\)[\s\S]*recruiterName: jobContext\.hiringManager \?\? ""[\s\S]*jobUrl: jobContext\.url \?\? ""/, "Cover Letter route must pass canonical Job Context details into the shared workspace.");
assert.match(professionalIdentityTool, /renderCoverLetterJobAndEditorDisclosure\(\)[\s\S]*renderCoverLetterPreviewViewer\(\)/, "Cover Letter editor controls and real A4 preview must render in the same document studio.");
assert.match(professionalIdentityTool, /function renderCoverLetterTemplateGallery\(\)[\s\S]*data-cover-letter-compact-design="true"[\s\S]*Change design[\s\S]*renderCoverLetterTemplateBrowserOverlay\(selectTemplate\)/, "Cover Letter template gallery must use a compact selected-design control and browser pattern.");
assert.match(professionalIdentityTool, /import \{ createPortal \} from "react-dom"/, "Cover Letter template gallery overlay must portal to the document body instead of staying inside the sticky workspace stacking context.");
assert.match(professionalIdentityTool, /function openCoverLetterTemplateBrowser[\s\S]*coverLetterTemplateBrowserReturnFocusRef[\s\S]*setCoverLetterTemplateBrowserOpen\(true\)/, "Opening Change Design must use one shared path that remembers focus before showing the gallery.");
assert.match(professionalIdentityTool, /function closeCoverLetterTemplateBrowser[\s\S]*setCoverLetterTemplateBrowserOpen\(false\)[\s\S]*coverLetterTemplateBrowserReturnFocusRef\.current\?\.focus/, "Closing or selecting a Cover Letter template must remove the overlay and restore workspace focus.");
assert.match(professionalIdentityTool, /function renderCoverLetterTemplateBrowserOverlay[\s\S]*createPortal\([\s\S]*data-cover-letter-template-browser-overlay="true"[\s\S]*data-overlay-layer="top"[\s\S]*document\.body/, "Cover Letter template gallery must render as the single top overlay above the preview workspace.");
assert.match(professionalIdentityTool, /data-cover-letter-workspace-inert=\{coverLetterTemplateBrowserOpen \? "true" : "false"\}[\s\S]*aria-hidden=\{coverLetterTemplateBrowserOpen\}[\s\S]*inert=\{coverLetterTemplateBrowserOpen \? true : undefined\}/, "When the Cover Letter template gallery is open, the preview workspace behind it must be inert and unavailable for interaction.");
assert.match(professionalIdentityTool, /document\.body\.style\.overflow = "hidden"[\s\S]*document\.body\.style\.overflow = previousOverflow/, "Cover Letter template gallery must lock and restore page scroll without leaving a stale backdrop state.");
assert.match(professionalIdentityTool, /event\.key === "Escape"[\s\S]*setCoverLetterTemplateBrowserOpen\(false\)[\s\S]*event\.key !== "Tab"[\s\S]*last\.focus\(\)/, "Cover Letter template gallery must support Escape-to-close and basic focus trapping.");
assert.match(appGlobals, /--overlay-backdrop:[\s\S]*--z-overlay-backdrop:[\s\S]*--z-overlay-modal:/, "PATHZY overlay layering must use global semantic overlay tokens instead of random page-specific z-index values.");
assert.match(professionalIdentityTool, /Choose a recruiter-ready design[\s\S]*renderCoverLetterMiniPreview\(template\)[\s\S]*Best for: \{template\.bestFor\}/, "Cover Letter gallery must use My CV gallery architecture with real mini previews and best-for labels.");
assert.match(professionalIdentityTool, /template\.architecture\.replace\("-", " "\)} letter[\s\S]*PDF ready/, "Cover Letter template cards must show attribute labels.");
assert.doesNotMatch(professionalIdentityTool, /tool !== "cv" \? \([\s\S]*tool === "cover-letter" \? "lg:col-span-2"/, "Cover Letter must not use the old full-width generator card above the workspace.");
assert.match(professionalIdentityTool, /Previous[\s\S]*Page \{coverLetterCurrentPage\} of \{coverLetterPreviewPageCount\}[\s\S]*Next[\s\S]*Fit Page[\s\S]*Fit Width|Fit Page[\s\S]*Fit Width[\s\S]*Previous[\s\S]*Page \{coverLetterCurrentPage\} of \{coverLetterPreviewPageCount\}[\s\S]*Next/, "Cover Letter preview must expose fit controls, page navigation, and current page count.");
const coverLetterPreviewToolbarBlock = professionalIdentityTool.slice(
  professionalIdentityTool.indexOf("function renderCoverLetterPreviewToolbar()"),
  professionalIdentityTool.indexOf("function renderCoverLetterJobContextEntry()"),
);
assert.match(coverLetterPreviewToolbarBlock, /pathzy-dark-control-surface[\s\S]*Designed Preview[\s\S]*Fit Page[\s\S]*Fit Width[\s\S]*Previous[\s\S]*Page \{coverLetterCurrentPage\} of \{coverLetterPreviewPageCount\}[\s\S]*Next[\s\S]*pathzy-dark-control-indicator/, "Cover Letter preview toolbar controls must use the shared dark-surface control system.");
assert.doesNotMatch(coverLetterPreviewToolbarBlock, /text-white\/(?:5|6|7|8)|disabled:opacity/, "Cover Letter preview toolbar must not rely on low-opacity white text or opacity-disabled labels on a dark surface.");
assert.match(professionalIdentityTool, /onScroll=\{updateCoverLetterCurrentPageFromScroll\}/, "Cover Letter preview must update the current page from the scroll position.");
assert.match(professionalIdentityLinkedInModel, /export type LinkedInProfileModel = \{[\s\S]*headline[\s\S]*about[\s\S]*openToWorkTargets[\s\S]*experience[\s\S]*education[\s\S]*skills[\s\S]*projects[\s\S]*certifications[\s\S]*licences[\s\S]*keywordStrategy[\s\S]*sourceMetadata/, "LinkedIn must have a normalized projection model separate from CV and page-local state.");
assert.match(professionalIdentityLinkedInModel, /source: "professional_identity"/, "LinkedIn profile model must identify Professional Identity as its factual source.");
assert.match(professionalIdentityLinkedInModel, /fullName: string;[\s\S]*professionalTitle: string;[\s\S]*profilePhotoAvailable: boolean;[\s\S]*linkedInUrl: string;[\s\S]*professionalLinks: string\[\]/, "LinkedIn model must carry profile-intro presentation data from Professional Identity.");
assert.match(professionalIdentityLinkedInModel, /skillEvidence: \{[\s\S]*supported: string\[\];[\s\S]*suggestedToDevelop: string\[\]/, "LinkedIn model must distinguish supported skills from suggested skills to develop.");
assert.match(professionalIdentityLinkedInModel, /keywordStrategy: \{[\s\S]*supported: string\[\];[\s\S]*opportunities: string\[\]/, "LinkedIn keyword intelligence must not mix supported keywords and development opportunities.");
assert.match(professionalIdentityLinkedInModel, /dimensions: \{ label: string; complete: boolean; recommendation: string \}\[\]/, "LinkedIn profile strength must be based on explicit dimensions.");
assert.match(professionalIdentityLinkedInModel, /export function linkedinProfileModelFromProfessionalIdentity/, "LinkedIn must transform Professional Identity into the normalized LinkedIn model.");
assert.match(professionalIdentityLinkedInModel, /normalizeProfessionalIdentityCompletionValues\(values\)/, "LinkedIn generation must normalize canonical Professional Identity values before presentation.");
assert.match(professionalIdentityLinkedInModel, /professionalIdentityRequiredChecksFromValues\(identity\)/, "LinkedIn missing information must use the shared Professional Identity completion engine.");
assert.match(professionalIdentityLinkedInModel, /export function serializeLinkedInProfileModel\(model: LinkedInProfileModel\)/, "LinkedIn output must serialize from the normalized LinkedIn model.");
assert.match(professionalIdentityLinkedInModel, /manualOverride: Boolean\(options\.manualOverride\)/, "LinkedIn source-generated documents must preserve manual override state.");
assert.match(professionalIdentityLinkedInModel, /routeBuilders\.professionalIdentitySection\(section, appRoutes\.professionalIdentityLinkedin\)/, "LinkedIn missing-information links must preserve return-to-LinkedIn context.");
const linkedInProjectionFixture = professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity({
  full_name: "Nika Mokoena",
  career_goal: "Data Analyst",
  professional_summary: "Data analyst with practical reporting experience. Data analyst with practical reporting experience.",
  experience: [
    "Data Analyst | Acme Analytics | 2023 - Present | Built dashboards for weekly reporting",
    "Data Analyst | Acme Analytics | 2023 - Present | Built dashboards for weekly reporting"
  ],
  education: ["Diploma in Information Systems | Data Analytics | Example College | 2022"],
  skills: ["SQL", "SQL", "Power BI", "Excel", "Reporting", "Data cleaning"],
  projects: ["Relevant project", "Customer dashboard", "Data Analyst | Acme Analytics | 2023 - Present | Built dashboards for weekly reporting"],
  achievements: ["Customer dashboard", "Reduced reporting turnaround time"],
  certificates: ["Certification", "AWS Cloud Practitioner"],
  licences: [],
  languages: ["English - professional"],
  portfolio_url: "https://example.com"
}, { language: "english" });
assert.equal((linkedInProjectionFixture.about.match(/Data analyst with practical reporting experience\./g) ?? []).length, 1, "LinkedIn About must deduplicate repeated Professional Summary sentences.");
assert.equal(/Built dashboards for weekly reporting/.test(linkedInProjectionFixture.about), false, "LinkedIn About must not append raw Experience descriptions verbatim.");
assert.ok(linkedInProjectionFixture.about.split(/\s+/).length <= 300, "LinkedIn About must stay within the supported 150-300 word target ceiling.");
assert.equal(linkedInProjectionFixture.experience.length, 1, "Duplicate experience records must render once.");
assert.deepEqual({
  role: linkedInProjectionFixture.experience[0].role,
  company: linkedInProjectionFixture.experience[0].company,
  dates: linkedInProjectionFixture.experience[0].dates,
  description: linkedInProjectionFixture.experience[0].description
}, {
  role: "Data Analyst",
  company: "Acme Analytics",
  dates: "2023 - Present",
  description: "Built dashboards for weekly reporting"
}, "LinkedIn Experience must be structured into role, company, dates and description.");
assert.equal(linkedInProjectionFixture.education[0].qualification, "Diploma in Information Systems", "LinkedIn Education must keep qualification structured.");
assert.equal(linkedInProjectionFixture.education[0].field, "Data Analytics", "LinkedIn Education must keep field structured.");
assert.equal(linkedInProjectionFixture.education[0].institution, "Example College", "LinkedIn Education must keep institution structured.");
assert.equal(linkedInProjectionFixture.education[0].dates, "2022", "LinkedIn Education must keep dates structured.");
assert.equal(linkedInProjectionFixture.projects.includes("Relevant project"), false, "LinkedIn Projects must not render placeholder project entries.");
assert.equal(linkedInProjectionFixture.projects.some((item) => /Built dashboards for weekly reporting/.test(item)), false, "LinkedIn Projects must not repeat full Experience records.");
assert.equal(linkedInProjectionFixture.certifications.includes("Certification"), false, "LinkedIn Certifications must not render generic placeholder entries.");
assert.equal(new Set(linkedInProjectionFixture.skills.map((item) => item.toLowerCase())).size, linkedInProjectionFixture.skills.length, "LinkedIn skills must be deduplicated before rendering.");
assert.doesNotMatch(professionalIdentityLinkedInModelRuntime.serializeLinkedInProfileModel(linkedInProjectionFixture), /Relevant project|PATHZY CV|^- Certification$/m, "Serialized LinkedIn profile must not leak placeholder content.");
const structuredLinkedInProjection = professionalIdentityLinkedInModelRuntime.linkedinProfileModelFromProfessionalIdentity(structuredIdentityValues, { language: "english" });
assert.equal(structuredLinkedInProjection.experience.length, 2, "Two Professional Identity experiences must become two LinkedIn experience entries.");
assert.equal(structuredLinkedInProjection.experience.map((entry) => entry.role).join(" -> "), "Founder & Product Owner -> Co-founder & Marketing Lead", "LinkedIn experience ordering must be preserved.");
assert.equal(structuredLinkedInProjection.experience[0].description.includes("Building an employment operating system"), true, "LinkedIn Experience 1 description must stay attached to Experience 1.");
assert.equal(structuredLinkedInProjection.experience[1].description.includes("Coordinating launch planning"), true, "LinkedIn Experience 2 description must stay attached to Experience 2.");
const serializedStructuredLinkedIn = professionalIdentityLinkedInModelRuntime.serializeLinkedInProfileModel(structuredLinkedInProjection);
assert.equal((serializedStructuredLinkedIn.match(/Founder & Product Owner/g) ?? []).length, 1, "Serialized LinkedIn output must not duplicate Experience 1.");
assert.equal((serializedStructuredLinkedIn.match(/Co-founder & Marketing Lead/g) ?? []).length, 1, "Serialized LinkedIn output must not duplicate Experience 2.");
const structuredCoverLetterData = professionalIdentityCoverLetterModelRuntime.coverLetterDataFromProfessionalIdentity(structuredIdentityValues, { company: "Example Employer", role: "Product Marketing Lead", source: "manual" }, { language: "english", templateName: "PATHZY Signature Letter" });
assert.match(structuredCoverLetterData.evidenceParagraph, /Founder & Product Owner|Co-founder & Marketing Lead/, "Cover Letter intelligence must receive separate Professional Identity experience evidence records for selection.");
assert.doesNotMatch(structuredCoverLetterData.evidenceParagraph, /Founder & Product Owner[\s\S]*Co-founder & Marketing Lead[\s\S]*Founder & Product Owner/, "Cover Letter evidence must not duplicate structured experience records.");
const cleanStructuredWriteValues = professionalIdentityWriteRuntime.cleanProfessionalIdentityValues({ experience: twoExperienceFixture });
assert.equal(Array.isArray(cleanStructuredWriteValues.experience), true, "Professional Identity write sanitizer must preserve structured experience arrays.");
assert.equal(typeof cleanStructuredWriteValues.experience[0], "object", "Professional Identity write sanitizer must not convert structured experience records into strings.");
assert.equal(cleanStructuredWriteValues.experience[0].role, "Founder & Product Owner", "Professional Identity write sanitizer must preserve structured experience fields.");
assert.match(professionalIdentityCompletion, /experience: firstExperienceList\(answers\.experience_entries, answers\.experience, answers\.experience_history, answers\.personal_background\)/, "Professional Identity read path must prefer canonical structured experience entries before legacy Experience aliases.");
assert.match(professionalIdentityCompletion, /firstExperienceList[\s\S]*selectCanonicalProfessionalIdentityExperiences/, "Professional Identity read path must delegate Experience precedence to the shared canonical selector.");
assert.match(professionalIdentityCvModel, /selectCanonicalProfessionalIdentityExperiences\(identity\.experience\)/, "CV projection must use the shared canonical Experience selector.");
assert.match(professionalIdentityLinkedInModel, /selectCanonicalProfessionalIdentityExperiences\(identity\.experience\)/, "LinkedIn projection must use the shared canonical Experience selector.");
assert.match(coverLetterIntelligence, /selectCanonicalProfessionalIdentityExperiences\(identity\.experience\)/, "Cover Letter intelligence must use the shared canonical Experience selector.");
assert.match(careerPassportProjection, /selectCanonicalProfessionalIdentityExperiences\(values\.experience\)/, "Career Passport projection must use the shared canonical Experience selector.");
assert.match(professionalIdentityWriteService, /experience: experienceEntries[\s\S]*experience_history: experienceEntries[\s\S]*experience_entries: experienceEntries[\s\S]*personal_background: ""/, "Professional Identity write path must overwrite legacy Experience aliases with structured canonical entries instead of stale full-text copies.");
assert.doesNotMatch(professionalIdentityWriteService, /personal_background: experienceEntries\.map\(experienceEntryToText\)\.join/, "Professional Identity write path must stop storing structured experience as a duplicate concatenated paragraph.");
const knownInputValue = (value) => ({ value, provenance: "KNOWN" });
const normalizedEmploymentInput = employmentIntelligenceEngineRuntime.normalizeEmploymentIntelligenceInput({
  userId: "user-1",
  inputSnapshotVersion: "fixture",
  professionalIdentity: {
    currentSituation: knownInputValue("employed"),
    profileCompletionMetadata: knownInputValue({}),
    location: knownInputValue({}),
    nationality: knownInputValue("South African"),
    workAuthorisation: knownInputValue({}),
    careerGoal: knownInputValue("Product Marketing Lead"),
    summary: knownInputValue("Product builder."),
    education: knownInputValue(structuredIdentityValues.education),
    experience: knownInputValue(structuredIdentityValues.experience),
    skills: knownInputValue(structuredIdentityValues.skills),
    projects: knownInputValue(structuredIdentityValues.projects),
    achievements: knownInputValue(structuredIdentityValues.achievements),
    certificates: knownInputValue(structuredIdentityValues.certificates),
    licences: knownInputValue(structuredIdentityValues.licences),
    languages: knownInputValue(structuredIdentityValues.languages),
    references: knownInputValue(structuredIdentityValues.references),
    portfolio: knownInputValue([]),
    socialProfiles: knownInputValue([]),
    employmentPreferences: knownInputValue({}),
    salaryExpectations: knownInputValue({}),
    availability: knownInputValue({}),
    evidenceMetadata: knownInputValue({})
  },
  employmentDiagnosis: {
    unemploymentDuration: knownInputValue(""),
    applicationActivity: knownInputValue({}),
    interviewHistory: knownInputValue({}),
    barriers: knownInputValue([]),
    transportAccess: knownInputValue(""),
    deviceInternetAccess: knownInputValue(""),
    incomeUrgency: knownInputValue(""),
    careResponsibilities: knownInputValue(""),
    workAuthorisationConstraints: knownInputValue(""),
    documentationAvailability: knownInputValue(""),
    digitalConfidence: knownInputValue(""),
    literacyCommunicationComfort: knownInputValue(""),
    preferredWorkType: knownInputValue(""),
    mobility: knownInputValue(""),
    willingnessToLearn: knownInputValue(""),
    supportNeeds: knownInputValue([]),
    userConfidence: knownInputValue(""),
    immediateGoals: knownInputValue([]),
    longTermGoals: knownInputValue([])
  },
  countryContext: {}
}).input;
assert.equal(normalizedEmploymentInput.professionalIdentity.experience.value.length, 2, "Employment Intelligence must receive each Professional Identity experience separately.");
assert.equal(normalizedEmploymentInput.professionalIdentity.experience.value[1].company, "AVOLITO Beverages", "Employment Intelligence must preserve company data per experience record.");
const normalizedEmploymentInputWithLegacyDuplicate = employmentIntelligenceEngineRuntime.normalizeEmploymentIntelligenceInput({
  ...normalizedEmploymentInput,
  professionalIdentity: {
    ...normalizedEmploymentInput.professionalIdentity,
    experience: knownInputValue([
      ...structuredIdentityValues.experience,
      "Founder & Product Owner - PATHZY - Johannesburg - 2025 - Present - Building an employment operating system for guided career support."
    ])
  }
}).input;
assert.equal(normalizedEmploymentInputWithLegacyDuplicate.professionalIdentity.experience.value.length, 2, "Employment Intelligence must use the shared canonical Experience selector and drop legacy composite duplicates.");
const normalizedEmploymentInputWithAvolitoDuplicate = employmentIntelligenceEngineRuntime.normalizeEmploymentIntelligenceInput({
  ...normalizedEmploymentInput,
  professionalIdentity: {
    ...normalizedEmploymentInput.professionalIdentity,
    experience: knownInputValue(avolitoGreyDuplicateFixture)
  }
}).input;
assert.equal(normalizedEmploymentInputWithAvolitoDuplicate.professionalIdentity.experience.value.length, 1, "Employment Intelligence must receive the cleaned AVOLITO Experience once.");
assert.equal(normalizedEmploymentInputWithAvolitoDuplicate.professionalIdentity.experience.value[0].description.includes("Co-founder & Marketing Lead"), false, "Employment Intelligence must not receive a duplicate AVOLITO role inside the description.");
assert.equal(structuredIdentityValues.education.length, 1, "Education collection must remain a separate record collection.");
assert.equal(structuredIdentityValues.projects.length, 1, "Projects collection must remain a separate record collection.");
assert.equal(structuredIdentityValues.achievements.length, 2, "Achievements collection must preserve separate records.");
assert.equal(structuredIdentityValues.certificates.length, 2, "Certifications collection must preserve separate records.");
assert.match(professionalIdentityService, /linkedinProfileModelFromProfessionalIdentity[\s\S]*serializeLinkedInProfileModel/, "Professional Identity service must use the LinkedIn projection model and serializer.");
assert.match(linkedInGeneration, /professionalIdentityValuesFromSources\(inputs\.profile, \{ answers: inputs\.discoveryAnswers \}/, "LinkedIn generation must read the Professional Identity compatibility model.");
assert.match(linkedInGeneration, /linkedinProfileModelFromProfessionalIdentity\(identityValues, \{ language, profileUpdatedAt: inputs\.profile\?\.updated_at/, "LinkedIn generation must build the profile projection directly from Professional Identity values.");
assert.match(linkedInGeneration, /serializeLinkedInProfileModel\(model\)/, "LinkedIn generation must serialize the normalized LinkedIn model.");
assert.match(linkedInGeneration, /linkedinProfileModel: model[\s\S]*professionalIdentitySource: "canonical_professional_identity"[\s\S]*manualOverride: false/, "LinkedIn saved documents must persist source metadata and start without manual override.");
assert.doesNotMatch(linkedInGeneration, /getLatestCvModel|cvModelFromUnknown|latestCv|cv_documents/, "LinkedIn generation must not use CV documents as the factual source of truth.");
assert.match(professionalLinkedInPage, /getProfessionalIdentityReadModelSafe\(supabase, user, "linkedin professional identity"\)/, "LinkedIn page must read canonical Professional Identity before rendering.");
assert.match(professionalLinkedInPage, /loadSavedProfessionalDocument\(supabase, user\.id, \{ tool: "linkedin", documentId: params\.documentId \}\)/, "LinkedIn page must preserve saved LinkedIn-specific documents across navigation, refresh and login.");
assert.match(professionalLinkedInPage, /professionalIdentityLinkedInDocument\(identity\.values/, "LinkedIn page must seed new projections from Professional Identity automatically.");
assert.match(professionalLinkedInPage, /professionalIdentityLinkedInSyncStatus\(identity\.values/, "LinkedIn page must expose Professional Identity sync status.");
assert.match(professionalLinkedInPage, /linkedInSyncStatus=\{linkedInSyncStatus\}/, "LinkedIn page must pass source-of-truth sync status into the shared document workspace.");
assert.match(professionalLinkedInPage, /title="My LinkedIn"[\s\S]*description="PATHZY already knows your professional background\. It helps you present it properly on LinkedIn\."/ , "LinkedIn page must immediately explain the Professional Identity projection purpose.");
assert.doesNotMatch(professionalLinkedInPage, /PageHeader|Improve My LinkedIn|Copy section by section/, "LinkedIn page must not keep the old generic intro-card layout.");
assert.doesNotMatch(professionalLinkedInPage, /name: "fullName"|name: "education"|name: "experience"|name: "skills"/, "LinkedIn page must not ask users to recreate factual Professional Identity fields.");
assert.match(professionalIdentityTool, /linkedInSyncStatus\?: ProfessionalIdentityLinkedInSyncStatus/, "Shared document workspace must accept LinkedIn source sync status.");
assert.match(professionalIdentityTool, /function linkedInModelFromDocument/, "LinkedIn preview must hydrate from the saved normalized LinkedIn model.");
assert.match(professionalIdentityTool, /function linkedInContentJson/, "LinkedIn save path must preserve LinkedIn source metadata.");
assert.match(professionalIdentityTool, /linkedInContentJson\(document, true\)/, "Manual LinkedIn wording edits must mark the document-specific override without changing Professional Identity.");
assert.match(professionalIdentityTool, /manualOverride: Boolean\(existingVersion\.manualOverride\) \|\| manualOverride/, "Manual LinkedIn customization must not be silently destroyed by later sync operations.");
assert.match(professionalIdentityTool, /data-linkedin-page-height="content-driven"[\s\S]*renderLinkedInStudio\(\)/, "LinkedIn page height must be driven by content instead of a document canvas.");
assert.doesNotMatch(professionalIdentityTool, /#5B8CFF|#8fb0ff|#c7d6ff|blue-purple|#050816/, "Professional document workspaces must use the premium navy, cream, burgundy and PATHZY red palette without legacy light-blue UI accents.");
assert.match(professionalIdentityTool, /scroll-mt-24[\s\S]*data-linkedin-nav-offset="app-shell"/, "LinkedIn content must reserve safe scroll offset below the sticky PATHZY navigation.");
assert.match(professionalIdentityTool, /function renderLinkedInDocumentBar[\s\S]*Synced with Professional Identity[\s\S]*MY LINKEDIN[\s\S]*LinkedIn Professional Profile[\s\S]*Profile Strength:[\s\S]*Target Role:[\s\S]*Edit Information[\s\S]*Optimize Profile[\s\S]*Open LinkedIn/, "LinkedIn workspace must expose the required compact premium header and actions.");
assert.doesNotMatch(professionalIdentityTool, /function renderLinkedInDocumentBar[\s\S]*Copy Profile[\s\S]*function renderLinkedInIdentityCorrectionCard/, "LinkedIn header must not include Copy Profile; full-profile copy belongs in the ready panel.");
assert.match(professionalIdentityTool, /NEED TO CHANGE YOUR INFORMATION\?[\s\S]*Your LinkedIn content uses your Professional Identity\. Update it once and PATHZY keeps this profile synchronized\.[\s\S]*routeBuilders\.professionalIdentityReview\(appRoutes\.professionalIdentityLinkedin\)/, "LinkedIn correction strip must stay compact and route factual edits back to Professional Identity with return context.");
assert.doesNotMatch(professionalIdentityTool, /Source: Professional Identity &gt; \{sourceSection\.replace/, "LinkedIn cards must not repeat source labels inside every section.");
assert.match(professionalIdentityTool, /Copy[\s\S]*Edit Information/, "LinkedIn output must support section-by-section copy and source editing.");
assert.match(professionalIdentityTool, /Don&apos;t have LinkedIn yet\? PATHZY has prepared your profile content\. You can use it when creating your LinkedIn profile\./, "Users without a LinkedIn URL must still be supported.");
assert.match(professionalIdentityTool, /Open LinkedIn/, "Existing LinkedIn URLs may be opened without claiming live synchronization.");
assert.doesNotMatch(professionalIdentityTool, /Updated on LinkedIn|Synced with LinkedIn/, "PATHZY must not claim live LinkedIn updates or synchronization without an integration.");
assert.match(professionalIdentityTool, /Profile Strength: \{model\?\.completeness\.label \?\? "Ready to prepare"\}/, "LinkedIn Profile Strength must use the real calculated completeness label in the compact header.");
assert.match(professionalIdentityTool, /data-linkedin-studio-layout="responsive-card-grid"[\s\S]*data-linkedin-profile-workspace="exact-content-flow"/, "LinkedIn studio must use the exact ordered content flow instead of a narrow rail layout.");
assert.doesNotMatch(professionalIdentityTool, /data-linkedin-optimization-rail="content-height"/, "LinkedIn optimization cards must be part of the responsive grid instead of a separate rail.");
assert.match(professionalIdentityTool, /data-linkedin-section="headline"[\s\S]*data-linkedin-section="about"[\s\S]*data-linkedin-section="experience"[\s\S]*data-linkedin-section="education-skills"[\s\S]*data-linkedin-section="projects-achievements"[\s\S]*data-linkedin-section="certifications-languages-links"[\s\S]*data-linkedin-section="improve-linkedin"[\s\S]*data-linkedin-section="ready-to-use"[\s\S]*data-linkedin-section="next-step"/, "LinkedIn page must follow the exact required section order.");
assert.match(professionalIdentityTool, /IMPROVE YOUR LINKEDIN[\s\S]*slice\(0, 3\)[\s\S]*See full analysis/, "LinkedIn intelligence must be combined into one compact optimization panel with three default recommendations.");
assert.match(professionalIdentityTool, /TOP SKILLS[\s\S]*slice\(0, 8\)[\s\S]*View all skills/, "LinkedIn skills must show top skills first with an on-demand full list.");
assert.match(professionalIdentityTool, /lg:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(0,0\.95fr\)\][^"]*" data-linkedin-section="education-skills"/, "Education and Skills must sit side by side on desktop.");
assert.match(professionalIdentityTool, /lg:grid-cols-3" data-linkedin-section="certifications-languages-links"/, "Certifications, Languages, and Professional Links must use a compact three-column desktop row.");
assert.match(professionalIdentityTool, /item\.role[\s\S]*item\.company[\s\S]*item\.dates[\s\S]*item\.location[\s\S]*item\.description/, "LinkedIn Experience cards must render structured fields instead of one collapsed record string.");
assert.match(professionalIdentityTool, /item\.qualification[\s\S]*item\.field[\s\S]*item\.institution[\s\S]*item\.dates/, "LinkedIn Education cards must render structured fields instead of one concatenated string.");
assert.doesNotMatch(professionalIdentityTool, /data-linkedin-profile-workspace="true"/, "LinkedIn must not reuse the old oversized profile-preview canvas marker.");
assert.match(professionalIdentityTool, /updateLinkedInDraft[\s\S]*linkedInContentJson\(document, true\)[\s\S]*linkedinProfileModel: draft/, "Manual LinkedIn generated wording edits must be protected as projection overrides.");
assert.match(professionalIdentityTool, /function renderDocumentNextActions\(\)/, "Professional document next-actions must use one shared renderer.");
assert.match(professionalIdentityTool, /Your CV is ready[\s\S]*Create Cover Letter[\s\S]*More actions/, "CV next-actions must guide users to one primary cover-letter step with secondary actions under More actions.");
assert.match(professionalIdentityTool, /Your cover letter is ready[\s\S]*Prepare for interview[\s\S]*More actions/, "Cover Letter next-actions must use one primary interview-preparation step with secondary actions under More actions.");
assert.match(professionalIdentityTool, /READY TO USE YOUR PROFILE\?[\s\S]*Copy Full Profile[\s\S]*(Open LinkedIn|Add LinkedIn URL)[\s\S]*NEXT STEP[\s\S]*Understand where you fit in the job market\.[\s\S]*View Employment Intelligence/, "LinkedIn must show the required ready-to-use and Employment Intelligence progression panels.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? \([\s\S]*Return to My CV[\s\S]*Optimise LinkedIn[\s\S]*Find Opportunities[\s\S]*Ask Your Mentor[\s\S]*Improve Cover Letter/, "Cover Letter next-actions must avoid linking back to the current page.");
assert.doesNotMatch(professionalIdentityTool, /tool === "linkedin" \? \(/, "LinkedIn must not use the shared multi-button next-actions panel.");
assert.doesNotMatch(professionalIdentityTool, /renderCoverLetterField\("Full name"|renderCoverLetterField\("Professional title"|renderCoverLetterField\("Email"|renderCoverLetterField\("Phone"|renderCoverLetterField\("City"|renderCoverLetterField\("Country"/, "Cover Letter editor must not expose editable duplicate Professional Identity profile fields.");
assert.match(professionalIdentityTool, /routeBuilders\.professionalIdentityReview\(appRoutes\.professionalIdentityCoverLetter\)[\s\S]*Update information/, "Cover Letter compact controls must preserve return-to-cover-letter context for Professional Identity edits.");
assert.match(professionalIdentityTool, /routeBuilders\.professionalIdentityReview\(appRoutes\.professionalIdentityCoverLetter\)/, "Cover Letter factual corrections must route back to Professional Identity with return context.");
for (const sectionName of ["2. Job / Application Details", "3. Greeting", "4. Opening Paragraph", "5. Motivation / Why This Role", "6. Evidence / Why Me", "7. Company Alignment", "8. Additional Paragraphs", "9. Closing Paragraph", "10. Sign-off"]) {
  assert.match(professionalIdentityTool, new RegExp(sectionName.replace(/[.]/g, "\\.")), `Cover Letter editor must include ${sectionName}.`);
}
assert.match(professionalIdentityTool, /Add paragraph/, "Cover Letter body paragraphs must support adding a paragraph.");
assert.match(professionalIdentityTool, /draft\.bodyParagraphs = next;/, "Cover Letter body paragraphs must support editing and ordering through coverLetterData.");
assert.match(professionalDocumentTypes, /export type ProfessionalDocumentType = "cv" \| "cover_letter" \| "professional_bio" \| "linkedin_profile" \| "application_summary"/, "Phase 7 professional documents must define reusable document types.");
assert.match(professionalDocumentTypes, /export type CvViewConfiguration = \{[\s\S]*purpose: CvPurpose;[\s\S]*targetRole\?: string;[\s\S]*targetJobId\?: string;[\s\S]*selectedEntityIds:/, "Phase 7 CV configuration must be target-aware without duplicating the canonical profile.");
assert.match(professionalDocumentTypes, /export type PresentationField = \{[\s\S]*originalCanonicalValue\?: string;[\s\S]*approvedMasterValue\?: string;[\s\S]*presentationValue: string;[\s\S]*approvalState: PresentationApprovalState;[\s\S]*sourceFactIds: string\[];[\s\S]*unsupportedClaimDetected: boolean;/, "Phase 7 must separate canonical facts, approved wording, document wording, approval state and grounding.");
assert.match(professionalDocumentService, /getOrCreateCanonicalProfile\(supabase, input\.userId\)/, "Professional documents must use the canonical professional identity as source of truth.");
assert.match(professionalDocumentService, /persistProfessionalDocument/, "Phase 7 must persist generated documents through a dedicated document service.");
assert.match(professionalDocumentService, /persistProfessionalDocumentFields/, "Phase 7 must persist document-specific presentation fields separately from canonical facts.");
assert.match(professionalDocumentService, /cvModelFromCvContent\(document\.content as CvContent\)/, "Phase 7 CV Builder compatibility must render from professional-document content, not a second CV content source.");
assert.match(professionalDocumentService, /listProfessionalDocuments/, "Phase 7 must expose a document-library read boundary for multiple CV versions.");
assert.match(professionalDocumentService, /refreshProfessionalDocumentFreshness/, "Phase 7 must detect stale documents when the canonical profile version changes.");
assert.match(professionalDocumentService, /createUpdatedProfessionalDocumentCopy/, "Phase 7 must let users create an updated copy without overwriting older CV versions.");
assert.match(professionalDocumentService, /createCoverLetterDocumentDraft/, "Phase 7 must prepare a cover-letter document foundation after the CV engine boundary.");
assert.match(professionalDocumentAdapter, /export function cvModelFromCvContent\(content: CvContent\)/, "Phase 7 must convert shared CV content into the existing preview/PDF model.");
assert.match(professionalDocumentSelector, /configuration\.selectedEntityIds\.certifications[\s\S]*configuration\.selectedEntityIds\.projects[\s\S]*configuration\.selectedEntityIds\.languages/, "Phase 7 selection must support certifications, projects and languages, not only employment and skills.");
assert.match(professionalDocumentValidation, /validateProfessionalDocument/, "Phase 7 must validate document configuration, grounding and freshness before export.");
for (const tableName of ["professional_documents", "professional_document_fields", "professional_document_exports"]) {
  assert.match(professionalDocumentsMigration, new RegExp(`create table if not exists public\\.${tableName}`), `Phase 7 migration must create ${tableName}.`);
  assert.match(professionalDocumentsMigration, new RegExp(`alter table public\\.${tableName} enable row level security`), `${tableName} must enable RLS.`);
}
for (const column of ["approval_state", "source_fact_ids", "unsupported_claim_detected", "field_language", "original_canonical_value", "approved_master_value"]) {
  assert.match(professionalDocumentFieldMigration, new RegExp(`add column if not exists ${column}`), `Phase 7 field migration must store ${column}.`);
}
const professionalDocumentValidationRuntime = loadProductionTsModule("lib/professional-documents/professional-document-validation.ts");
const validationWarnings = professionalDocumentValidationRuntime.validateCvConfiguration({
  purpose: "general",
  language: "en",
  pagePreference: "automatic",
  sections: [
    { type: "header", visible: true, order: 0 },
    { type: "header", visible: true, order: 1 }
  ],
  selectedEntityIds: { employment: [], education: [], certifications: [], skills: [], projects: [], languages: [] },
  presentationPreferences: { showPhoto: false, showFullAddress: false, showReferences: false, showSkillLevels: false, showDates: true, dateFormat: "MMM yyyy" }
});
assert.equal(validationWarnings.some((warning) => warning.id === "duplicate-section-header"), true, "Phase 7 validation must catch duplicate CV sections.");
assert.match(jobIntelligenceTypes, /export type JobRequirementImportance = "mandatory" \| "preferred" \| "context"/, "Phase 8 must distinguish mandatory, preferred, and context requirements.");
assert.match(jobIntelligenceTypes, /export type JobRequirementCategory =[\s\S]*"skill"[\s\S]*"experience"[\s\S]*"education"[\s\S]*"certification"[\s\S]*"language"/, "Phase 8 must classify job requirements into reusable categories.");
assert.match(jobIntelligenceTypes, /export type JobMatchAnalysis = \{[\s\S]*canonicalProfileId: string;[\s\S]*profileVersion: number;[\s\S]*strengths: JobRequirementMatch\[];[\s\S]*gaps: JobGap\[];[\s\S]*uncertainties: JobRequirementMatch\[];[\s\S]*targetedCvPlan: TargetedCvPreparationPlan;/, "Phase 8 analysis must connect job fit to a canonical profile version and targeted CV plan.");
assert.match(jobIntelligenceTypes, /export type TargetedCvPreparationPlan = \{[\s\S]*cvConfiguration:[\s\S]*truthfulPositioning: string\[];[\s\S]*blockedClaims: string\[];/, "Targeted CV preparation must separate truthful evidence from blocked unsupported claims.");
assert.match(jobRequirementParser, /export function inspectJobAdvertisement/, "Phase 8 must inspect raw job advertisements into structured opportunities.");
assert.match(jobRequirementParser, /mandatorySignals[\s\S]*preferredSignals[\s\S]*inferCategory/, "Job inspection must separate importance and category instead of using a single generic score.");
assert.match(jobMatchEngine, /export function analyzeJobAgainstCanonicalProfile/, "Phase 8 must compare jobs against the canonical professional identity.");
assert.match(jobMatchEngine, /collectEvidence\(profile: CanonicalProfessionalIdentity\)/, "Job matching must collect evidence from CanonicalProfessionalIdentity.");
assert.match(jobMatchEngine, /profile\.skills[\s\S]*profile\.employment[\s\S]*profile\.education[\s\S]*profile\.certifications[\s\S]*profile\.languages[\s\S]*profile\.projects/, "Job matching must consider profile, employment, education, certifications, languages, projects and skills.");
assert.match(jobMatchEngine, /explicitness === "unconfirmed_implied"/, "Job matching must not treat unconfirmed implied skills as verified evidence.");
assert.match(jobMatchEngine, /nextActions:[\s\S]*Prepare truthful targeted CV[\s\S]*Track this opportunity/, "Job Intelligence must guide the user without becoming an automatic application bot.");
assert.doesNotMatch(jobMatchEngine, /from\("user_documents"\)|last uploaded|latest CV|cv_documents/i, "Job matching must not use the last uploaded CV or saved documents as source of truth.");
assert.match(jobTargetedCvBridge, /defaultCvViewConfiguration\(\{[\s\S]*purpose: "targeted"[\s\S]*targetJobId: input\.job\.id/, "Phase 8 must bridge to the Phase 7 targeted CV configuration.");
assert.match(jobTargetedCvBridge, /blockedClaims: input\.gaps\.map/, "Targeted CV preparation must block unsupported job claims.");
assert.match(jobIntelligenceService, /getOrCreateCanonicalProfile\(supabase, input\.userId\)/, "Saved Job Intelligence must load the canonical profile, not create a second professional profile.");
assert.match(jobIntelligenceService, /persistJobIntelligenceAnalysis/, "Job Intelligence must have a persistence boundary for reviewed analyses.");
assert.match(jobIntelligenceTypes, /export type JobImportSourceType = "pasted_text" \| "manual_entry" \| "uploaded_document" \| "public_url" \| "existing_opportunity"/, "Phase 8A must support pasted, manual, uploaded, URL and existing opportunity job imports.");
assert.match(jobIntelligenceTypes, /export type JobImportStatus = "processing" \| "review_required" \| "ready" \| "ocr_required" \| "failed"/, "Phase 8A must model processing, review, OCR-required and failure states.");
assert.match(jobIntelligenceTypes, /export type JobImportRequirementImportance = "mandatory" \| "preferred" \| "optional" \| "unclear"/, "Phase 8A imported requirements must distinguish mandatory, preferred, optional and unclear requirements.");
assert.match(jobImportService, /inspectAndPersistDocument/, "Phase 8A uploaded job adverts must reuse the shared document inspection pipeline.");
assert.match(jobImportService, /extractPdfText[\s\S]*extractDocxText[\s\S]*text\/plain/, "Phase 8A must extract PDF, DOCX and TXT job adverts without creating a second extractor.");
assert.match(jobImportService, /ocr_required[\s\S]*Paste the job description text for now/, "Phase 8A scanned or image job adverts must produce an OCR-required fallback state.");
assert.match(jobImportService, /export async function validatePublicJobUrl/, "Phase 8A public URL import must have a central URL validator.");
assert.match(jobImportService, /unsafeHostnames = new Set\(\["localhost", "0\.0\.0\.0"\]\)/, "Phase 8A public URL import must block local hostnames.");
assert.match(jobImportService, /function isPrivateIp/, "Phase 8A public URL import must check private IP ranges.");
assert.match(jobImportService, /dns\.lookup\(hostname, \{ all: true \}\)/, "Phase 8A public URL import must inspect resolved addresses before fetching.");
assert.match(jobImportService, /responsibilities[\s\S]*requirements[\s\S]*optionalContext/, "Phase 8A must separate responsibilities from candidate requirements.");
assert.match(jobImportService, /suspicious_payment_request[\s\S]*suspicious_personal_data_request[\s\S]*suspicious_shortened_link/, "Phase 8A must flag suspicious job-advert signals.");
assert.doesNotMatch(jobImportService, /getOrCreateCanonicalProfile|analyzeJobAgainstCanonicalProfile/, "Phase 8A job import must not compare against the profile yet.");
assert.match(jobImportsApi, /createJobImport\(auth\.supabase, auth\.user\.id, body\)/, "Phase 8A API must create imports for the authenticated user.");
assert.match(jobImportsApi, /updateJobImportReview\(auth\.supabase, auth\.user\.id/, "Phase 8A API must save review corrections against the owning user.");
assert.match(jobImportsApi, /NextResponse\.json\(\{ jobImport: record \}\)/, "Phase 8A API must return valid JSON success responses.");
assert.match(jobImportsMigration, /create table if not exists public\.job_imports/, "Phase 8A migration must create job_imports.");
assert.match(jobImportsMigration, /source_document_id uuid references public\.user_documents\(id\) on delete set null/, "Job imports must link uploaded adverts to existing user_documents.");
assert.match(jobImportsMigration, /alter table public\.job_imports enable row level security/, "Job imports must enable RLS.");
assert.match(jobImportsMigration, /auth\.uid\(\) = user_id/g, "Job imports RLS must restrict access to the owner.");
for (const tableName of ["job_intelligence_analyses", "job_intelligence_requirements", "job_intelligence_evidence"]) {
  assert.match(jobIntelligenceMigration, new RegExp(`create table if not exists public\\.${tableName}`), `Phase 8 migration must create ${tableName}.`);
  assert.match(jobIntelligenceMigration, new RegExp(`alter table public\\.${tableName} enable row level security`), `${tableName} must enable RLS.`);
}
assert.match(jobIntelligenceMigration, /references public\.canonical_professional_profiles\(id\) on delete cascade/, "Job Intelligence analyses must reference canonical professional profiles.");
assert.match(jobIntelligenceMigration, /auth\.uid\(\) = user_id/g, "Job Intelligence RLS policies must restrict every table to the owning user.");
for (const label of ["Job Intelligence", "Analyse de l'offre", "Evidence found", "Preuves trouvees", "Prepare truthful CV", "Preparer un CV honnete"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label), `Phase 8 translations must include ${label}.`);
}
for (const label of ["Inspect a job advert", "Analyser une offre d'emploi", "Paste the job description here"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label), `Phase 8A translations must include ${label}.`);
}
assert.match(opportunitiesPage, /getOrCreateCanonicalProfile\(supabase, user\.id\)/, "Opportunities must read the canonical profile before job analysis.");
assert.match(opportunitiesPage, /analyzeJobAgainstCanonicalProfile\(\{ profile: canonicalProfile, job, userId: user\.id \}\)/, "Opportunities must use the shared Job Intelligence matcher.");
assert.match(jobProviderTypes, /export type JobProvider = \{[\s\S]*search\(input: JobProviderSearchInput\): Promise<JobProviderSearchResult>/, "Real job providers must use a reusable JobProvider abstraction.");
assert.match(jobProviderTypes, /JobProviderDiagnostics[\s\S]*requestUrl: string;[\s\S]*rawCount: number;[\s\S]*normalizedCount: number;/, "Real job providers must expose sanitized diagnostics without credentials.");
for (const field of ["source", "externalId", "employer", "employmentType", "applicationUrl", "sourceUrl", "lastVerifiedAt"]) {
  assert.match(opportunitiesTypes, new RegExp(`${field}\\??: `), `Normalized opportunities must expose ${field} in the production provider contract.`);
}
assert.match(opportunitiesTypes, /export type NormalizedOpportunity = Opportunity;/, "Jobs must expose a canonical normalized Opportunity model for providers and matching.");
assert.match(opportunitiesTypes, /remoteType: "REMOTE" \| "HYBRID" \| "ON_SITE" \| "UNKNOWN";[\s\S]*responsibilities: string\[];[\s\S]*requirements: string\[];[\s\S]*requiredSkills: string\[];[\s\S]*preferredSkills: string\[];/, "Normalized opportunities must preserve structured requirements and work arrangement.");
assert.match(opportunitiesTypes, /status: "ACTIVE" \| "CLOSING_SOON" \| "EXPIRED" \| "UNKNOWN";/, "Opportunity freshness must use the canonical uppercase status model.");
assert.match(opportunitiesTypes, /OpportunityMatchExplanation[\s\S]*suitabilityLabel[\s\S]*eligibilityStatus[\s\S]*unknowns[\s\S]*recommendation/, "Opportunity matching must expose suitability, eligibility and unknown information separately.");
assert.match(adzunaProviderSource, /process\.env\.ADZUNA_APP_ID[\s\S]*process\.env\.ADZUNA_APP_KEY/, "Adzuna credentials must be read from server environment variables.");
assert.doesNotMatch(adzunaProviderSource + opportunitiesPage + opportunitiesHub, /NEXT_PUBLIC_ADZUNA|ADZUNA_APP_KEY[^;\n]*client/i, "Adzuna credentials must not be exposed through public client variables.");
assert.match(adzunaProviderSource, /https:\/\/api\.adzuna\.com\/v1\/api\/jobs[\s\S]*\/\$\{country\}\/search\/\$\{page\}[\s\S]*app_id[\s\S]*app_key/, "Adzuna provider must call the official search endpoint with app_id and app_key.");
assert.match(adzunaProviderSource, /const diagnosticUrl = url\.toString\(\);[\s\S]*url\.searchParams\.set\("app_id", this\.appId\);[\s\S]*url\.searchParams\.set\("app_key", this\.appKey\);/, "Adzuna diagnostics must capture a request URL before credentials are attached.");
assert.match(jobProviderServerSource, /getProductionJobProvider[\s\S]*new AdzunaJobProvider\(\)/, "The production job provider must be selected behind a server provider factory.");
assert.match(opportunitiesPage, /searchParams/, "Jobs page must accept route search params for controlled live QA.");
assert.match(opportunitiesPage, /query: paramText\(params\.query\)[\s\S]*location: paramText\(params\.location\)[\s\S]*country: paramText\(params\.country\)/, "Jobs page must support controlled server-side provider query, location and country values.");
assert.match(opportunitiesPage, /const \{ filters, \.\.\.providerSearch \} = search;[\s\S]*fetchProductionOpportunities\(\{ \.\.\.providerSearch, resultsPerPage: 20 \}\)/, "Jobs page must fetch normalized provider opportunities without leaking client-only filters into the provider.");
assert.match(opportunitiesPage, /personalizeRealOpportunities\(\{[\s\S]*profile: canonicalProfile[\s\S]*actions:/, "Jobs page must rank real opportunities through the shared Professional Identity matcher.");
assert.match(opportunitiesPage, /pipelineCounts[\s\S]*raw: providerResult\.diagnostics\?\.rawCount[\s\S]*allJobs: personalizedOpportunities\.length[\s\S]*recommended:[\s\S]*nearReach:/, "Jobs page must trace raw, normalized, All Jobs, Recommended and Near Reach counts.");
assert.doesNotMatch(opportunitiesPage, /personalizeOpportunities|opportunityCatalog|discovery_responses|personalizeProviderOpportunities/, "Jobs page must not use the static sample catalog, discovery data, or page-local matching for production vacancies.");
assert.match(opportunitiesMatching, /normalizeOpportunityFreshness[\s\S]*status !== "EXPIRED"/, "Expired jobs must be removed from active recommendations.");
assert.match(opportunitiesMatching, /deduplicateOpportunities[\s\S]*sourceUrl[\s\S]*applicationUrl/, "Opportunity matching must deduplicate vacancies by source, URL and content signals.");
assert.match(opportunitiesMatching, /getOrCreateCanonicalProfile|CanonicalProfessionalIdentity/, "Opportunity matching must use the canonical Professional Identity as candidate truth.");
assert.doesNotMatch(opportunitiesMatching, /user_documents|cv_documents|linkedin/i, "Opportunity matching must not use CV or LinkedIn generated text as candidate truth.");
assert.match(opportunitiesMatching, /PATHZY needs your licence information/, "Unknown licence data must be presented as unknown information, not as a confirmed missing licence.");
assert.match(opportunitiesMatching, /eligibilityStatus[\s\S]*suitabilityScore[\s\S]*recommendationFor/, "Eligibility and suitability must be calculated separately.");
assert.match(opportunitiesMatching, /requiredSkills[\s\S]*preferredSkills/, "Mandatory and preferred requirements must be handled separately.");
for (const providerState of ["providerStatus", "provider_unavailable", "no_jobs_found", "invalid_provider_response"]) {
  assert.match(opportunitiesHub, new RegExp(providerState), `Opportunities UI must handle ${providerState}.`);
}
assert.doesNotMatch(opportunitiesHub, /ADZUNA_APP_ID|ADZUNA_APP_KEY|NEXT_PUBLIC_ADZUNA/, "Jobs UI must never expose provider credential variable names to users.");
assert.match(opportunitiesHub, /opportunities\.provider\.unavailableMessage[\s\S]*opportunities\.inspectAdvert/, "Provider-unavailable state must be user-facing and actionable.");
assert.match(opportunitiesHub, /hasOpportunityProgress[\s\S]*opportunities\.progress\.empty/, "Jobs UI must avoid a giant zero-progress bar when no job actions exist.");
assert.match(opportunitiesHub, /pathzy-readable-workspace/, "Jobs workspace must inherit the shared dark-surface readability system.");
assert.match(pathzyI18n, /PATHZY never substitutes fake vacancies[\s\S]*No fake vacancies are shown/, "Opportunities UI must never substitute fake vacancies.");
assert.match(opportunitiesHub, /opportunities\.tabs\.recommended[\s\S]*opportunities\.tabs\.near[\s\S]*opportunities\.tabs\.saved[\s\S]*opportunities\.tabs\.all/, "Jobs page must expose the simple Recommended, Near Reach, Saved and All Jobs tabs.");
assert.match(opportunitiesHub, /if \(tab === "all"\) return true;/, "All Jobs must not depend on match quality.");
assert.match(opportunitiesHub, /role="tab"[\s\S]*aria-selected=\{activeTab === tab\.id\}[\s\S]*pathzy-dark-control/, "Jobs tabs must use readable accessible dark-surface controls.");
assert.match(opportunitiesHub, /method="GET"[\s\S]*action=\{appRoutes\.opportunities\}[\s\S]*opportunities\.filters\.keyword[\s\S]*name="query"[\s\S]*opportunities\.filters\.location[\s\S]*name="location"[\s\S]*opportunities\.filters\.search[\s\S]*opportunities\.filters\.advanced[\s\S]*opportunities\.filters\.employmentType[\s\S]*opportunities\.filters\.workMode[\s\S]*opportunities\.filters\.salaryFrom[\s\S]*opportunities\.filters\.datePosted[\s\S]*opportunities\.filters\.seniority/, "Jobs page must expose server-backed search with progressive advanced filters.");
assert.match(opportunitiesHub, /opportunities\.bestMatch[\s\S]*opportunities\.actions\.view/, "Jobs page must identify a best match without relying on fake precision.");
assert.match(opportunitiesHub, /opportunities\.stats\.pipelinePrefix[\s\S]*pipelineCounts\.allJobs[\s\S]*opportunities\.stats\.pipelineSuffix/, "Jobs page must show safe pipeline counts for live provider QA.");
assert.match(opportunitiesHub, /STRONG_MATCH: t\("opportunities\.match\.strong"\)[\s\S]*GOOD_MATCH: t\("opportunities\.match\.good"\)[\s\S]*POSSIBLE_MATCH: t\("opportunities\.match\.possible"\)[\s\S]*STRETCH_OPPORTUNITY: t\("opportunities\.match\.stretch"\)/, "Jobs page must translate internal suitability codes into user-facing labels.");
assert.match(opportunitiesHub, /opportunities\.actions\.view[\s\S]*opportunities\.actions\.save[\s\S]*opportunities\.actions\.prepare[\s\S]*opportunities\.actions\.viewOriginal/, "Job cards must expose view, save, prepare and original-source actions.");
assert.doesNotMatch(opportunitiesHub, /Apply on source site/, "Jobs page must not imply PATHZY can apply directly from the card.");
assert.match(opportunitiesHub, /opportunities\.detail\.basics[\s\S]*opportunities\.detail\.match[\s\S]*opportunities\.detail\.whyMatch[\s\S]*opportunities\.detail\.partial[\s\S]*opportunities\.detail\.missing[\s\S]*opportunities\.detail\.eligibility[\s\S]*opportunities\.detail\.beforeApply[\s\S]*opportunities\.detail\.originalPreserved/, "Job details must explain fit, evidence state, eligibility, next steps and original source.");
assert.match(appGlobals, /--text-on-light-primary[\s\S]*--text-on-light-secondary[\s\S]*--text-on-light-muted[\s\S]*\.pathzy-jobs-surface[\s\S]*color: var\(--text-on-light-primary\)/, "Jobs light surfaces must use readable light-surface semantic text tokens.");
assert.match(appGlobals, /:is\(\.pathzy-jobs-surface, \.pathzy-applications-surface \.pathzy-card\)[\s\S]*color: var\(--text-on-light-primary\)/, "Jobs and Applications warm cards must share one surface-aware readable text boundary.");
assert.match(appGlobals, /:is\(\.pathzy-jobs-surface, \.pathzy-applications-surface \.pathzy-card\) \.pathzy-dark-control[\s\S]*color: var\(--text-on-light-primary\)/, "Applications controls on warm cards must not inherit dark-surface pale text.");
assert.doesNotMatch(opportunitiesHub, /sample opportunities for testing|Sample opportunity for testing/, "Production Opportunities UI must not label provider listings as samples.");
assert.match(opportunitiesPrepareApi, /createJobImport\(supabase, user\.id,[\s\S]*sourceType: "existing_opportunity"[\s\S]*opportunityToJobImportText\(opportunity\)/, "Prepare Application must preserve the selected normalized Opportunity as Job Context.");
assert.match(opportunitiesPrepareApi, /pathzy_static_catalog[\s\S]*Only real or verified opportunities/, "Prepare Application must reject production use of the old static catalog source.");
assert.match(opportunitiesPrepareApi, /coverLetterUrl: routeBuilders\.coverLetterWorkspace\(\{ jobId: jobImport\.id \}\)/, "Prepare Application must route to Cover Letter with the saved job context.");
assert.match(professionalCoverLetterPage, /loadJobImportContext[\s\S]*from\("job_imports"\)[\s\S]*requirements: jsonList\(inspection\.requirements\)[\s\S]*responsibilities: jsonList\(inspection\.responsibilities\)/, "Cover Letter must resolve prepared Opportunity job imports automatically.");
const adzunaProviderRuntime = loadProductionTsModule("lib/opportunities/providers/adzuna-provider.ts");
let capturedAdzunaUrl = "";
const adzunaProvider = new adzunaProviderRuntime.AdzunaJobProvider("app-id", "app-key", async (url) => {
  capturedAdzunaUrl = url.toString();
  return {
    ok: true,
    status: 200,
    json: async () => ({
      results: [
        {
          id: 12345,
          title: "Junior Operations Coordinator",
          company: { display_name: "Example Employer" },
          description: "Coordinate daily operations. Must use Microsoft Excel for reporting. Preferred communication skills. Responsible for maintaining weekly records.",
          location: { display_name: "Cape Town, South Africa" },
          contract_time: "full_time",
          contract_type: "permanent",
          salary_min: 180000,
          salary_max: 240000,
          created: "2026-08-20T10:00:00Z",
          redirect_url: "https://www.adzuna.co.za/details/12345",
          category: { label: "Admin Jobs", tag: "admin-jobs" }
        }
      ]
    })
  };
});
const adzunaSearchResult = await adzunaProvider.search({ query: "operations coordinator", country: "South Africa", location: "Cape Town", resultsPerPage: 1 });
assert.match(capturedAdzunaUrl, /api\.adzuna\.com\/v1\/api\/jobs\/za\/search\/1/, "Adzuna provider must use the country-specific search endpoint.");
assert.match(capturedAdzunaUrl, /app_id=app-id/, "Adzuna provider must send app_id server-side.");
assert.match(capturedAdzunaUrl, /app_key=app-key/, "Adzuna provider must send app_key server-side.");
assert.equal(adzunaSearchResult.status.status, "available", "A valid Adzuna response must mark the provider available.");
assert.deepEqual(
  Object.fromEntries(["id", "source", "externalId", "title", "employer", "description", "location", "employmentType", "remoteType", "salaryMin", "salaryMax", "salaryCurrency", "postedAt", "applicationUrl", "sourceUrl", "category", "status", "lastVerifiedAt", "requirements", "responsibilities", "requiredSkills", "preferredSkills"].map((key) => [key, key in adzunaSearchResult.opportunities[0]])),
  {
    id: true,
    source: true,
    externalId: true,
    title: true,
    employer: true,
    description: true,
    location: true,
    employmentType: true,
    remoteType: true,
    salaryMin: true,
    salaryMax: true,
    salaryCurrency: true,
    postedAt: true,
    applicationUrl: true,
    sourceUrl: true,
    category: true,
    status: true,
    lastVerifiedAt: true,
    requirements: true,
    responsibilities: true,
    requiredSkills: true,
    preferredSkills: true
  },
  "Adzuna jobs must normalize into the required PATHZY Opportunity fields."
);
assert.equal(adzunaSearchResult.opportunities[0].source, "adzuna", "Normalized opportunities must retain their source provider.");
assert.equal(adzunaSearchResult.opportunities[0].employer, "Example Employer", "Adzuna company display name must map to employer.");
assert.equal(adzunaSearchResult.opportunities[0].status, "ACTIVE", "Fresh provider jobs must use the canonical active status.");
assert.equal(adzunaSearchResult.opportunities[0].remoteType, "ON_SITE", "Provider work mode must normalize to the canonical remoteType.");
assert.ok(adzunaSearchResult.opportunities[0].requiredSkills.length >= 1, "Provider descriptions must produce structured requirement signals where possible.");
const invalidAdzunaResult = await new adzunaProviderRuntime.AdzunaJobProvider("app-id", "app-key", async () => ({ ok: true, status: 200, json: async () => ({}) })).search({});
assert.equal(invalidAdzunaResult.status.status, "invalid_provider_response", "Invalid provider responses must not create fake opportunities.");
const unavailableAdzunaResult = await new adzunaProviderRuntime.AdzunaJobProvider("", "", async () => ({ ok: true, status: 200, json: async () => ({ results: [] }) })).search({});
assert.equal(unavailableAdzunaResult.status.status, "provider_unavailable", "Missing Adzuna server credentials must produce a provider unavailable state.");
assert.match(opportunitiesHub, /JobIntelligencePanel/, "Opportunities UI must display more than a single match percentage.");
assert.match(opportunitiesHub, /User reviews before applying/, "Opportunities UI must keep the user in control.");
assert.match(opportunitiesHub, /opportunities\.import\.title/, "Opportunities UI must expose the Phase 8A job import flow.");
assert.match(opportunitiesHub, /opportunities\.import\.paste[\s\S]*opportunities\.import\.manual[\s\S]*opportunities\.import\.upload[\s\S]*opportunities\.import\.link/, "Job import UI must support pasted, manual, uploaded and URL input modes.");
assert.match(opportunitiesHub, /opportunities\.import\.review[\s\S]*opportunities\.import\.saveReview/, "Job import UI must show a review action after successful import.");
assert.match(opportunitiesHub, /disabled=\{isBusy\}/, "Job import buttons must avoid duplicate submissions while processing.");
assert.match(opportunitiesHub, /aria-pressed=\{mode === item\.id\}/, "Job import method controls must expose accessible selected state.");
assert.match(jobIntelligenceTypes, /export type JobUnderstandingRequirementType =[\s\S]*"skill"[\s\S]*"experience"[\s\S]*"education"[\s\S]*"certification"[\s\S]*"licence"[\s\S]*"language"[\s\S]*"work_authorization"[\s\S]*"technical"[\s\S]*"behavioural"/, "Phase 8B must define a broad semantic requirement type model.");
assert.match(jobIntelligenceTypes, /export type SemanticJobUnderstanding = \{[\s\S]*jobImportId: string;[\s\S]*responsibilities: StructuredJobResponsibility\[];[\s\S]*requirements: StructuredJobRequirement\[];[\s\S]*applicationDetails: StructuredJobApplicationDetails;[\s\S]*sourceEvidence: JobSourceEvidence\[];/, "Phase 8B must define a structured job-understanding model with evidence.");
assert.match(jobIntelligenceTypes, /export type JobUnderstandingProvider = \{[\s\S]*understandJob\(input: JobUnderstandingInput\): Promise<JobUnderstandingResult>/, "Phase 8B must expose a provider-neutral job understanding interface.");
assert.match(jobUnderstandingProvider, /export class DeterministicJobUnderstandingProvider implements JobUnderstandingProvider/, "Phase 8B must provide a provider implementation behind the shared interface.");
assert.match(jobUnderstandingProvider, /export function normalizeJobConcept/, "Phase 8B must centralize job concept normalization.");
assert.match(jobUnderstandingProvider, /concept: "Microsoft Excel"/, "Phase 8B must normalize equivalent Excel concepts.");
assert.match(jobUnderstandingProvider, /canonicalConceptId: alias\.id/, "Phase 8B must preserve canonical concept references without editing the user's profile.");
assert.match(jobUnderstandingProvider, /inferImportance[\s\S]*mandatory[\s\S]*preferred[\s\S]*optional[\s\S]*unclear/, "Phase 8B must classify requirements by mandatory, preferred, optional and unclear importance.");
assert.match(jobUnderstandingProvider, /toStructuredResponsibility[\s\S]*normalizedConcepts[\s\S]*evidenceFor/, "Phase 8B must extract responsibilities separately with evidence.");
assert.match(jobUnderstandingProvider, /extractMinimumYears[\s\S]*inferProficiency[\s\S]*extractRequiredDocuments/, "Phase 8B must extract years, proficiency and application document details where present.");
assert.match(jobUnderstandingProvider, /Seniority information may be inconsistent/, "Phase 8B must flag conflicting seniority signals.");
assert.match(jobUnderstandingProvider, /validateSemanticJobUnderstanding/, "Phase 8B must validate low-confidence or malformed structured results.");
assert.doesNotMatch(jobUnderstandingProvider, /getOrCreateCanonicalProfile|analyzeJobAgainstCanonicalProfile/, "Phase 8B provider must not perform profile matching.");
assert.match(jobUnderstandingService, /getReviewedJobImport[\s\S]*jobImport\.status !== "ready"/, "Phase 8B must start from a reviewed Phase 8A job import.");
assert.match(jobUnderstandingService, /userApprovedVersion[\s\S]*confirmedAt/, "Phase 8B must preserve user-approved analysis separately from system extraction.");
assert.doesNotMatch(jobUnderstandingService, /from\("canonical_professional_profiles"\)|getOrCreateCanonicalProfile/, "Phase 8B service must not mutate or load the Canonical Professional Identity.");
assert.match(jobUnderstandingApi, /createSemanticJobUnderstanding\(auth\.supabase, auth\.user\.id, body\.jobImportId\)/, "Phase 8B API must create job analysis for the authenticated owner.");
assert.match(jobUnderstandingApi, /updateSemanticJobUnderstandingReview\(auth\.supabase, auth\.user\.id/, "Phase 8B API must save user review corrections for the owning user.");
assert.match(jobUnderstandingMigration, /create table if not exists public\.job_understandings/, "Phase 8B migration must create job_understandings.");
assert.match(jobUnderstandingMigration, /job_import_id uuid not null references public\.job_imports\(id\) on delete cascade/, "Phase 8B records must reference Phase 8A job imports.");
assert.match(jobUnderstandingMigration, /user_approved_json jsonb not null default '\{\}'::jsonb/, "Phase 8B must preserve user-approved analysis state.");
assert.match(jobUnderstandingMigration, /alter table public\.job_understandings enable row level security/, "Phase 8B job understandings must enable RLS.");
assert.match(jobUnderstandingMigration, /auth\.uid\(\) = user_id/g, "Phase 8B RLS must restrict job analysis records to the owning user.");
for (const label of ["Job Analysis", "Responsibilities", "Mandatory Requirements", "Preferred Requirements", "Optional Requirements", "Application Details", "Review Analysis", "Confirm Job Analysis", "Analyse du poste", "ResponsabilitÃ©s", "Exigences obligatoires", "Exigences souhaitÃ©es", "Exigences facultatives", "Informations de candidature", "VÃ©rifier l'analyse", "Confirmer l'analyse du poste"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Phase 8B translations must include ${label}.`);
}
assert.match(opportunitiesHub, /JobUnderstandingReview/, "Opportunities UI must expose the Phase 8B job analysis review.");
assert.match(opportunitiesHub, /opportunities\.analysis\.title[\s\S]*opportunities\.analysis\.confirm/, "Phase 8B UI must let the user review and confirm the analysis.");
assert.match(opportunitiesHub, /opportunities\.analysis\.noPhase8B/, "Phase 8B UI must not introduce matching or scoring.");
assert.match(opportunitiesHub, /opportunities\.analysis\.addRequirement[\s\S]*opportunities\.analysis\.importance[\s\S]*opportunities\.analysis\.mandatory[\s\S]*opportunities\.analysis\.preferred[\s\S]*opportunities\.analysis\.optional[\s\S]*opportunities\.analysis\.unclear/, "Phase 8B UI must let users add and move requirements between importance categories.");
assert.match(jobIntelligenceTypes, /export type RequirementMatchStatus = "confirmed_match" \| "partial_match" \| "transferable_match" \| "not_confirmed" \| "confirmed_gap" \| "unclear" \| "not_applicable"/, "Phase 8C must separate direct, partial, transferable, unclear and gap states.");
assert.match(jobIntelligenceTypes, /export type ProfileJobMatchAnalysis = \{[\s\S]*jobUnderstandingId: string;[\s\S]*canonicalProfileId: string;[\s\S]*canonicalProfileVersion: number;[\s\S]*fitScore\?: number;[\s\S]*analysisConfidence: number;[\s\S]*recommendations: MatchRecommendation\[];/, "Phase 8C must define an explainable profile-job match model.");
assert.match(profileJobMatchEngine, /export function analyzeConfirmedJobAgainstProfile/, "Phase 8C must compare confirmed job understanding against Canonical Professional Identity.");
assert.match(profileJobMatchEngine, /collectProfileEvidence\(profile: CanonicalProfessionalIdentity\)/, "Phase 8C must collect profile evidence from the canonical profile.");
assert.match(profileJobMatchEngine, /calculateProfileExperienceYears[\s\S]*Merged overlapping employment date ranges/, "Phase 8C must calculate duration without double-counting overlapping roles.");
assert.match(profileJobMatchEngine, /transferableConcepts[\s\S]*transferable_match/, "Phase 8C must support transferable matches without treating them as confirmed matches.");
assert.match(profileJobMatchEngine, /confirmed_gap[\s\S]*blockerFor/, "Phase 8C must distinguish confirmed gaps and potential blockers.");
assert.match(profileJobMatchEngine, /fitScore[\s\S]*analysisConfidence[\s\S]*scoreExplanation/, "Phase 8C must keep fit score separate from analysis confidence and explain scoring.");
assert.match(profileJobMatchEngine, /protectedCharacteristicPattern[\s\S]*age[\s\S]*race[\s\S]*gender[\s\S]*religion/, "Phase 8C must exclude protected characteristics from matching evidence.");
assert.match(profileJobMatchEngine, /freshnessForProfileJobMatch/, "Phase 8C must detect stale analyses when profile or job versions change.");
assert.doesNotMatch(profileJobMatchEngine, /from\("canonical_professional_profiles"\)|upsert\(|insert\(|update\(/, "Phase 8C engine must not mutate the canonical profile or database.");
assert.match(profileJobMatchService, /getOrCreateCanonicalProfile\(supabase, userId\)/, "Phase 8C service must load the Canonical Professional Identity as source of truth.");
assert.match(profileJobMatchService, /understanding\.status !== "confirmed"/, "Phase 8C must start from a confirmed job understanding.");
assert.match(profileJobMatchService, /freshnessForProfileJobMatch/, "Phase 8C service must mark stale analyses when versions change.");
assert.doesNotMatch(profileJobMatchService, /from\("user_documents"\)|last uploaded|latest CV/i, "Phase 8C must not use the last uploaded CV as the source of truth.");
assert.match(profileJobMatchApi, /createProfileJobMatchAnalysis\(auth\.supabase, auth\.user\.id, body\.jobUnderstandingId\)/, "Phase 8C API must create matches for the authenticated owner.");
assert.match(profileJobMatchApi, /refreshProfileJobMatchAnalysis\(auth\.supabase, auth\.user\.id, body\.analysisId\)/, "Phase 8C API must support user-triggered refresh.");
assert.match(profileJobMatchMigration, /create table if not exists public\.job_match_analyses/, "Phase 8C migration must create job_match_analyses.");
assert.match(profileJobMatchMigration, /job_understanding_id text not null references public\.job_understandings\(id\) on delete cascade/, "Phase 8C match analyses must reference confirmed job understandings.");
assert.match(profileJobMatchMigration, /canonical_profile_id uuid not null references public\.canonical_professional_profiles\(id\) on delete cascade/, "Phase 8C match analyses must reference canonical professional profiles.");
assert.match(profileJobMatchMigration, /requirement_matches_json jsonb not null default '\[]'::jsonb/, "Phase 8C must preserve requirement-by-requirement match details.");
assert.match(profileJobMatchMigration, /alter table public\.job_match_analyses enable row level security/, "Phase 8C match analyses must enable RLS.");
assert.match(profileJobMatchMigration, /auth\.uid\(\) = user_id/g, "Phase 8C RLS must restrict job matches to the owning user.");
for (const label of ["Job Match", "Fit Score", "Analysis Confidence", "Strong Matches", "Partial Matches", "Missing Requirements", "Information Needed", "Potential Blockers", "Recommended Next Steps", "Prepare Targeted Application", "Correspondance avec le poste", "Score de compatibilitÃ©", "FiabilitÃ© de l'analyse", "Points forts", "Correspondances partielles", "Exigences manquantes", "Informations nÃ©cessaires", "Obstacles potentiels", "Prochaines Ã©tapes recommandÃ©es", "PrÃ©parer une candidature ciblÃ©e"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Phase 8C translations must include ${label}.`);
}
assert.match(opportunitiesHub, /ProfileJobMatchReview/, "Opportunities UI must expose the Phase 8C profile-job match review.");
assert.match(opportunitiesHub, /Fit Score[\s\S]*Analysis Confidence[\s\S]*Readiness/, "Phase 8C UI must separate fit score, confidence and readiness.");
assert.match(opportunitiesHub, /Strong Matches[\s\S]*Partial and Transferable Matches[\s\S]*Missing Requirements[\s\S]*Potential Blockers/, "Phase 8C UI must show match groups separately.");
assert.match(opportunitiesHub, /Prepare Targeted Application/, "Phase 8C UI must hand off to the targeted application flow.");
assert.match(opportunitiesHub, /No profile facts were changed/, "Phase 8C UI must reassure users that matching does not mutate profile facts.");
assert.match(jobIntelligenceTypes, /export type TargetedDocumentStrategy = \{[\s\S]*selectedEmploymentIds: string\[];[\s\S]*gapHandling: Array<\{[\s\S]*exclude_unsupported_claim/, "Phase 8D must define a structured targeting strategy with gap handling.");
assert.match(jobIntelligenceTypes, /export type TargetedDocumentApprovalState = "draft" \| "review_required" \| "approved" \| "changes_requested" \| "archived"/, "Phase 8D must separate generation from document approval.");
assert.match(professionalDocumentTypes, /type ProfessionalDocumentType =[\s\S]*"application_email"[\s\S]*"linkedin_message"[\s\S]*"recruiter_message"/, "Phase 8D optional documents must reuse the professional document model.");
assert.match(professionalDocumentTypes, /targeting\?: \{[\s\S]*jobUnderstandingId\?: string;[\s\S]*jobMatchAnalysisId\?: string;[\s\S]*approvalState\?: TargetedDocumentApprovalState/, "Professional documents must preserve targeting and approval metadata.");
assert.match(professionalDocumentService, /if \(document\.targeting\)[\s\S]*job_understanding_id[\s\S]*job_match_analysis_id[\s\S]*targeting_strategy_json/, "Targeting metadata must be persisted only for targeted documents.");
assert.match(targetedDocumentStrategy, /export function buildTargetedProfessionalDocuments/, "Phase 8D must build targeted document packages through a shared strategy layer.");
assert.match(targetedDocumentStrategy, /buildCvContentFromCanonicalProfile/, "Phase 8D targeted CVs must reuse the Phase 7 CV content builder.");
assert.match(targetedDocumentStrategy, /purpose: "targeted"/, "Phase 8D must create targeted CV configurations.");
assert.match(targetedDocumentStrategy, /type: "cv"/, "Phase 8D must create a new CV document instead of overwriting the master CV.");
assert.match(targetedDocumentStrategy, /sourceType: "targeted_generated"/, "Phase 8D targeted wording must be marked separately from canonical facts.");
assert.match(targetedDocumentStrategy, /unsupportedClaimsBlocked/, "Phase 8D must surface unsupported claims instead of inserting them into documents.");
assert.match(targetedDocumentStrategy, /includeApplicationEmail[\s\S]*includeLinkedInMessage[\s\S]*includeRecruiterMessage/, "Phase 8D must prepare optional messages without making outreach mandatory.");
assert.doesNotMatch(targetedDocumentStrategy, /sendMail|smtp|fetch\(["']https?:\/\/.*apply|submitApplication/i, "Phase 8D must not send applications or outreach automatically.");
assert.doesNotMatch(targetedDocumentStrategy, /from\("canonical_professional_profiles"\)|upsert\(|insert\(|update\(/, "Phase 8D strategy must not mutate the canonical profile or database.");
assert.match(targetedDocumentService, /getOrCreateCanonicalProfile\(supabase, userId\)/, "Phase 8D service must use the Canonical Professional Identity as source of truth.");
assert.match(targetedDocumentService, /persistProfessionalDocument\(supabase, document\)/, "Phase 8D service must save through the existing Professional Document Engine.");
assert.match(targetedDocumentService, /updateTargetedDocumentApproval/, "Phase 8D must support explicit user approval state updates.");
assert.doesNotMatch(targetedDocumentService, /from\("user_documents"\)|last uploaded|latest CV/i, "Phase 8D must not target from the last uploaded CV.");
assert.match(targetedDocumentsApi, /createTargetedProfessionalDocumentPackage\(auth\.supabase, auth\.user\.id/, "Phase 8D API must create targeted documents for the authenticated owner.");
assert.match(targetedDocumentsApi, /updateTargetedDocumentApproval\(auth\.supabase, auth\.user\.id/, "Phase 8D API must update approval for the authenticated owner.");
assert.match(targetedDocumentsMigration, /alter table public\.professional_documents[\s\S]*job_understanding_id text[\s\S]*job_match_analysis_id text/, "Phase 8D migration must extend the existing professional_documents table.");
assert.match(targetedDocumentsMigration, /application_email[\s\S]*linkedin_message[\s\S]*recruiter_message/, "Phase 8D migration must allow optional message document types.");
assert.match(targetedDocumentsMigration, /professional_documents_approval_state_check[\s\S]*review_required[\s\S]*approved[\s\S]*changes_requested/, "Phase 8D migration must preserve document approval states.");
assert.match(targetedDocumentsMigration, /professional_documents_target_job_idx[\s\S]*professional_documents_match_analysis_idx/, "Phase 8D migration must index targeted document lookup paths.");
for (const label of ["Prepare Targeted Documents", "Targeted CV", "Tailored Cover Letter", "Application Email", "LinkedIn Message", "Review Required", "Approved", "Create New Version", "Preparer les documents cibles", "CV cible", "Lettre de motivation personnalisee", "E-mail de candidature", "Message LinkedIn", "Verification necessaire", "Approuve", "Creer une nouvelle version"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Phase 8D translations must include ${label}.`);
}
assert.match(opportunitiesHub, /TargetedDocumentsReview/, "Opportunities UI must expose the Phase 8D targeted document workspace.");
assert.match(opportunitiesHub, /Create truthful documents for this job[\s\S]*copy\.noAutoSend/, "Phase 8D UI must keep the user in control through the shared copy layer.");
assert.match(jobIntelligenceTranslations, /Nothing is sent automatically/, "Phase 8D copy must clearly state that nothing is sent automatically.");
assert.match(opportunitiesHub, /Approve[\s\S]*Request changes/, "Phase 8D UI must expose approval actions.");
assert.match(opportunitiesHub, /Open editor/, "Phase 8D UI must hand documents to existing editors instead of creating a second preview engine.");
assert.match(smartApplicationTypes, /export type SmartApplicationStatus =[\s\S]*"planning"[\s\S]*"preparing_documents"[\s\S]*"review_required"[\s\S]*"ready_to_apply"[\s\S]*"applied"[\s\S]*"archived"/, "Phase 9A must define planning through ready-to-apply application statuses.");
assert.match(smartApplicationTypes, /SmartApplicationChecklistItem[\s\S]*required: boolean;[\s\S]*state: SmartChecklistState/, "Phase 9A must model checklist items with required and completion state.");
assert.match(smartApplicationTypes, /SmartApplicationApprovals[\s\S]*cv: boolean;[\s\S]*coverLetter: boolean;[\s\S]*applicationMessage: boolean;[\s\S]*supportingDocuments: boolean;[\s\S]*packageApproved: boolean/, "Phase 9A must require explicit package approvals.");
assert.match(smartApplicationService, /findExistingApplication[\s\S]*job_match_analysis_id[\s\S]*createAnotherVersion/, "Phase 9A prepare action must be idempotent unless another version is requested.");
assert.match(smartApplicationService, /ensureTargetedDocuments[\s\S]*createTargetedProfessionalDocumentPackage/, "Phase 9A must create or reuse targeted CV and cover letter documents.");
assert.match(smartApplicationService, /checklistFor[\s\S]*job-details-reviewed[\s\S]*targeted-cv-ready[\s\S]*cover-letter-ready[\s\S]*required-documents-attached[\s\S]*user-approval-completed/, "Phase 9A must build the application package checklist.");
assert.match(smartApplicationService, /updateSmartApplicationApproval/, "Phase 9A must support user approval updates.");
assert.match(smartApplicationService, /updateSmartApplicationSupportingDocuments[\s\S]*from\("user_documents"\)[\s\S]*eq\("user_id", userId\)/, "Phase 9A supporting document selection must verify ownership.");
assert.doesNotMatch(smartApplicationService, /sendMail|smtp|submitApplication|fetch\(["']https?:\/\/.*apply/i, "Phase 9A must not send applications automatically.");
assert.match(smartApplicationsApi, /prepareSmartApplicationWorkspace\(auth\.supabase, auth\.user\.id/, "Phase 9A API must prepare workspaces for the authenticated owner.");
assert.match(smartApplicationsApi, /updateSmartApplicationApproval\(auth\.supabase, auth\.user\.id/, "Phase 9A API must update approvals for the authenticated owner.");
assert.match(smartApplicationsApi, /updateSmartApplicationSupportingDocuments\(auth\.supabase, auth\.user\.id/, "Phase 9A API must update supporting documents for the authenticated owner.");
assert.match(smartApplicationsMigration, /alter table public\.employment_applications[\s\S]*job_understanding_id text[\s\S]*job_match_analysis_id text[\s\S]*targeted_cv_document_id uuid[\s\S]*cover_letter_document_id uuid/, "Phase 9A migration must extend the existing employment_applications table.");
assert.match(smartApplicationsMigration, /status_history_json jsonb not null default '\[]'::jsonb/, "Phase 9A migration must add status history foundation.");
assert.match(smartApplicationsMigration, /employment_applications_job_match_idx[\s\S]*employment_applications_readiness_idx/, "Phase 9A migration must index smart application lookup paths.");
for (const label of ["Prepare Application", "Application Workspace", "Application Package", "Ready to Apply", "Review Required", "Supporting Documents", "Approve Package", "Preparer la candidature", "Espace de candidature", "Dossier de candidature", "Pret a postuler", "Verification necessaire", "Documents justificatifs", "Approuver le dossier"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Phase 9A translations must include ${label}.`);
}
for (const label of ["Prepare Application", "Open Application Workspace", "Create another application version"]) {
  assert.match(opportunitiesHub, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Phase 9A opportunity flow must include ${label}.`);
}
assert.match(employmentTrackerPage, /supportingDocuments[\s\S]*user_documents/, "Applications page must load owned supporting document choices without public file URLs.");
assert.match(employmentTrackerClient, /SmartApplicationWorkspace/, "Applications page must render a Smart Application Workspace.");
assert.match(employmentTrackerClient, /Overview[\s\S]*Job Match[\s\S]*Documents[\s\S]*Supporting Documents[\s\S]*Checklist[\s\S]*History/, "Phase 9A workspace must include the required review sections.");
assert.match(employmentTrackerClient, /Approve Package/, "Phase 9A workspace must require explicit package approval.");
assert.match(employmentTrackerClient, /PATHZY does not submit anything automatically/, "Phase 9A workspace must avoid automatic submission.");
for (const status of ["planning", "preparing", "ready_to_apply", "applied", "viewed", "screening", "assessment", "interview_scheduled", "interview_completed", "offer_received", "offer_accepted", "offer_declined", "rejected", "withdrawn", "closed", "archived"]) {
  assert.match(applicationTrackerService, new RegExp(`"${status}"`), `Phase 9B tracker service must support ${status}.`);
  assert.match(applicationTrackerMigration, new RegExp(`'${status}'`), `Phase 9B migration must allow ${status}.`);
}
for (const view of ["all", "preparing", "ready_to_apply", "applied", "interviews", "offers", "follow_up_needed", "closed"]) {
  assert.match(applicationTrackerService, new RegExp(`"${view}"`), `Phase 9B tracker service must define ${view} view.`);
}
for (const eventType of ["application_created", "documents_prepared", "ready_to_apply", "applied", "viewed", "screening", "assessment_received", "interview_invited", "interview_scheduled", "interview_completed", "follow_up", "offer", "rejection", "withdrawal", "note", "document_update", "status_change"]) {
  assert.match(applicationTrackerMigration, new RegExp(`'${eventType}'`), `Phase 9B timeline migration must support ${eventType}.`);
}
assert.match(applicationTrackerMigration, /create table if not exists public\.application_timeline_events[\s\S]*alter table public\.application_timeline_events enable row level security/, "Phase 9B must add an owned immutable application timeline table with RLS.");
assert.match(applicationTrackerMigration, /Users can view own application timeline events[\s\S]*auth\.uid\(\) = user_id[\s\S]*Users can insert own application timeline events[\s\S]*application\.user_id = auth\.uid\(\)/, "Phase 9B timeline RLS must enforce ownership.");
assert.match(applicationTrackerMigration, /closing_date date[\s\S]*planned_application_date date[\s\S]*assessment_deadline date[\s\S]*interview_date timestamptz[\s\S]*expected_response_date date[\s\S]*next_action_date date/, "Phase 9B migration must add tracker date fields.");
assert.match(applicationTrackerMigration, /contacts_json jsonb not null default '\[]'::jsonb/, "Phase 9B migration must store contextual contacts without mutating canonical identity.");
assert.match(applicationTrackerService, /canTransitionApplicationStatus[\s\S]*options: \{ correction\?: boolean \}/, "Phase 9B must implement safe transitions with explicit correction support.");
assert.match(applicationTrackerService, /summarizeApplicationTracker[\s\S]*activeApplications[\s\S]*followUpsDue[\s\S]*interviews[\s\S]*latestApplication[\s\S]*nextAction/, "Phase 9B dashboard summaries must come from the shared tracker service.");
assert.match(applicationTrackerService, /applicationEventsForPathzyTimeline/, "Phase 9B must expose application events for the existing PATHZY Timeline.");
assert.match(employmentTrackerApi, /canTransitionApplicationStatus[\s\S]*correction: body\.correction/, "Phase 9B API must validate status transitions and allow explicit corrections.");
assert.match(employmentTrackerApi, /from\("application_timeline_events"\)\.insert/, "Phase 9B API must write immutable timeline events.");
assert.match(employmentTrackerApi, /status: "archived"[\s\S]*archived_at/, "Phase 9B delete action must safely archive instead of destroying application records.");
assert.match(employmentTrackerPage, /application_timeline_events[\s\S]*eq\("user_id", user\.id\)/, "Phase 9B page must load owned application timeline events.");
assert.match(employmentTrackerClient, /APPLICATION_TRACKER_VIEWS/, "Phase 9B UI must render shared tracker views.");
assert.match(employmentTrackerClient, /Search applications/, "Phase 9B UI must provide application search.");
assert.match(employmentTrackerClient, /Follow-Up Needed/, "Phase 9B UI must expose the follow-up-needed view.");
assert.match(employmentTrackerClient, /isAddApplicationOpen/, "Applications must keep Add Application behind controlled state.");
assert.match(employmentTrackerClient, /AddApplicationForm/, "Applications must render the add form through a dedicated controlled flow.");
assert.match(employmentTrackerClient, /aria-expanded=\{isAddApplicationOpen\}/, "Add Application trigger must expose its expanded state.");
assert.match(employmentTrackerClient, /dateFieldsForStatus[\s\S]*planning[\s\S]*assessment[\s\S]*interview_scheduled[\s\S]*offer_received/, "Add Application must show stage-appropriate date fields.");
assert.match(employmentTrackerClient, /showContactFields/, "Application contacts must be controlled by local disclosure state.");
assert.match(employmentTrackerClient, /Add optional contact/, "Application contacts must be optional in the add flow.");
assert.match(employmentTrackerClient, /aria-expanded=\{showContactFields\}/, "Optional contact disclosure must expose its expanded state.");
assert.match(employmentTrackerClient, /hasApplications[\s\S]*Application signals will appear here later[\s\S]*One clear analytics state is enough/, "Zero-application analytics must show one premium empty state instead of repeated insufficient-data blocks.");
assert.match(employmentTrackerClient, /pathzy-readable-workspace/, "Applications workspace must inherit the shared dark-surface readability system.");
assert.match(employmentTrackerClient, /pathzy-applications-surface/, "Applications workspace must opt into shared warm-card readability for nested cards and controls.");
assert.match(employmentTrackerClient, /role="tab"[\s\S]*aria-selected=\{activeView === view\}[\s\S]*pathzy-dark-control/, "Application board tabs must use readable accessible dark-surface controls.");
assert.match(employmentTrackerClient, /Next Action[\s\S]*Closing date[\s\S]*Interview date[\s\S]*Contacts[\s\S]*Timeline/, "Phase 9B cards must show next actions, dates, contacts, and timeline.");
assert.match(jobIntelligenceTranslations, /Applications[\s\S]*Preparing[\s\S]*Ready to Apply[\s\S]*Add Note[\s\S]*Candidatures[\s\S]*En préparation[\s\S]*Prêt à postuler[\s\S]*Ajouter une note/, "Phase 9B must include English and French tracker copy.");
for (const type of ["screening", "behavioural", "technical", "panel", "case_study", "presentation", "final", "unknown"]) {
  assert.match(interviewPrepTypes, new RegExp(`"${type}"`), `Phase 9C must support ${type} interviews.`);
  assert.match(interviewPrepMigration, new RegExp(`'${type}'`), `Phase 9C migration must allow ${type} interviews.`);
}
for (const category of ["introduction", "motivation", "experience", "behavioural", "technical", "role_specific", "industry", "leadership", "problem_solving", "strengths", "development_area", "career_change", "employment_gap", "salary", "availability", "closing"]) {
  assert.match(interviewPrepTypes, new RegExp(`"${category}"`), `Phase 9C must model ${category} questions.`);
}
assert.match(interviewPrepTypes, /InterviewPrepQuestion[\s\S]*whyAsked[\s\S]*evidenceToUse[\s\S]*answerStructure[\s\S]*pointsToInclude[\s\S]*claimsToAvoid[\s\S]*practiceResponse/, "Phase 9C questions must include why, evidence, structure, points, claims to avoid, and editable practice response.");
assert.match(interviewPrepTypes, /StarStory[\s\S]*sourceCanonicalEntityIds[\s\S]*situation[\s\S]*task[\s\S]*action[\s\S]*result/, "Phase 9C STAR stories must reference canonical evidence.");
assert.match(interviewPrepTypes, /GapResponse[\s\S]*missing_skill[\s\S]*career_change[\s\S]*employment_gap[\s\S]*qualification_uncertainty/, "Phase 9C must model honest gap responses.");
assert.match(interviewPrepTypes, /PracticeResponse[\s\S]*answer[\s\S]*notes[\s\S]*selfRating[\s\S]*evidenceChecklist/, "Phase 9C must store typed practice answers, notes, self-rating, and evidence checklist.");
assert.match(interviewPrepTypes, /InterviewFeedback[\s\S]*relevance[\s\S]*clarity[\s\S]*structure[\s\S]*evidenceUse[\s\S]*conciseness[\s\S]*unsupportedClaims[\s\S]*completeness/, "Phase 9C feedback must assess safe written-answer dimensions.");
assert.match(interviewPrepTypes, /VoicePracticeAdapter[\s\S]*protected_characteristics[\s\S]*emotion_from_voice_or_video/, "Phase 9C must prepare future voice interfaces without unsafe assessments.");
assert.match(interviewPrepTypes, /InterviewPreparationProvider[\s\S]*timeoutMs[\s\S]*createApplicationPreparation/, "Phase 9C must expose a clean provider boundary for future AI interview preparation.");
assert.match(interviewPrepMigration, /alter table public\.interview_preps[\s\S]*application_id uuid[\s\S]*job_understanding_id text[\s\S]*job_match_analysis_id text[\s\S]*canonical_profile_id uuid[\s\S]*targeted_cv_document_id uuid/, "Phase 9C migration must link interview prep to application, job, match, profile, and targeted CV.");
assert.match(interviewPrepMigration, /questions_json jsonb[\s\S]*star_stories_json jsonb[\s\S]*gap_responses_json jsonb[\s\S]*employer_questions_json jsonb[\s\S]*practice_responses_json jsonb[\s\S]*feedback_json jsonb/, "Phase 9C migration must store structured prep, practice, and feedback.");
assert.match(interviewPrepMigration, /interview_preps_application_idx[\s\S]*interview_preps_job_match_idx[\s\S]*interview_preps_status_idx/, "Phase 9C migration must index application prep lookup paths.");
assert.match(interviewPrepService, /buildInterviewQuestions[\s\S]*responsibilities[\s\S]*mandatory[\s\S]*preferred[\s\S]*gaps[\s\S]*targetedCvClaims/, "Phase 9C service must generate questions from job responsibilities, requirements, gaps, and targeted CV claims.");
assert.match(interviewPrepService, /buildStarStories[\s\S]*sourceCanonicalEntityIds/, "Phase 9C service must build STAR stories from canonical evidence.");
assert.match(interviewPrepService, /buildGapResponses[\s\S]*Acknowledge this directly[\s\S]*Do not claim/, "Phase 9C gap responses must be honest and transferable.");
assert.match(interviewPrepService, /buildEmployerQuestions[\s\S]*priorities[\s\S]*team[\s\S]*success_measures[\s\S]*systems[\s\S]*development[\s\S]*challenges[\s\S]*next_steps/, "Phase 9C must create role-specific employer questions.");
assert.match(interviewPrepService, /assessPracticeAnswer[\s\S]*relevance[\s\S]*clarity[\s\S]*structure[\s\S]*evidenceUse[\s\S]*conciseness[\s\S]*completeness/, "Phase 9C must provide safe practice feedback.");
assert.match(interviewPrepService, /withInterviewProviderTimeout[\s\S]*Interview provider timeout/, "Phase 9C must handle provider timeout boundaries.");
assert.match(interviewPrepService, /normalizeInterviewProviderOutput[\s\S]*Array\.isArray\(record\.questions\)/, "Phase 9C must normalize malformed provider output before use.");
assert.doesNotMatch(interviewPrepService, /scoreAccent|appearanceScore|emotionScore|protectedCharacteristicScore|personalityScore/, "Phase 9C must not score accent, appearance, protected characteristics, stereotypes, or emotion.");
assert.match(interviewPrepApi, /createApplicationInterviewPreparation\(auth\.supabase, auth\.user\.id/, "Phase 9C API must create application-linked interview prep for the authenticated owner.");
assert.match(interviewPrepApi, /updateInterviewPracticeResponse\(auth\.supabase, auth\.user\.id/, "Phase 9C API must save typed practice through the authenticated owner.");
assert.match(interviewPrepClient, /Application[\s\S]*Interview type[\s\S]*Practice Questions[\s\S]*STAR Stories[\s\S]*Gap Responses[\s\S]*Questions for the Employer/, "Phase 9C UI must expose the complete structured prep workspace.");
assert.match(interviewPrepClient, /Practice Answer[\s\S]*Self-rating[\s\S]*Evidence checklist[\s\S]*Save Practice/, "Phase 9C UI must support typed practice.");
assert.match(jobIntelligenceTranslations, /Interview Preparation[\s\S]*Practice Questions[\s\S]*STAR Stories[\s\S]*Evidence to Use[\s\S]*Claims to Avoid[\s\S]*Préparation à l’entretien[\s\S]*Questions d’entraînement[\s\S]*Exemples STAR[\s\S]*Éléments à utiliser[\s\S]*Affirmations à éviter/, "Phase 9C must include English and French interview copy.");
for (const type of ["application_follow_up", "recruiter_follow_up", "interview_thank_you", "interview_status_follow_up", "referral_thank_you", "offer_response", "custom"]) {
  assert.match(followUpTypes, new RegExp(`"${type}"`), `Phase 9D must model ${type} follow-ups.`);
  assert.match(followUpService, new RegExp(`"${type}"`), `Phase 9D service must support ${type} follow-ups.`);
  assert.match(followUpMigration, new RegExp(`'${type}'`), `Phase 9D migration must allow ${type} follow-ups.`);
}
for (const status of ["suggested", "scheduled", "drafted", "approved", "sent", "dismissed", "cancelled"]) {
  assert.match(followUpTypes, new RegExp(`"${status}"`), `Phase 9D must model ${status} follow-up status.`);
  assert.match(followUpMigration, new RegExp(`'${status}'`), `Phase 9D migration must allow ${status} follow-up status.`);
}
assert.match(followUpMigration, /create table if not exists public\.application_follow_ups[\s\S]*application_id uuid not null references public\.employment_applications/, "Phase 9D must store follow-ups against tracked applications.");
assert.match(followUpMigration, /alter table public\.application_follow_ups enable row level security/, "Phase 9D follow-ups must enable RLS.");
assert.match(followUpMigration, /Users can view own application follow ups[\s\S]*auth\.uid\(\) = user_id[\s\S]*Users can insert own application follow ups[\s\S]*application\.user_id = auth\.uid\(\)[\s\S]*Users can update own application follow ups/, "Phase 9D RLS must enforce ownership and cross-user protection.");
assert.match(followUpMigration, /application_follow_ups_active_duplicate_idx[\s\S]*status in \('suggested', 'scheduled', 'drafted', 'approved'\)/, "Phase 9D must prevent duplicate active follow-up drafts.");
assert.match(followUpMigration, /recommended_date date[\s\S]*scheduled_date timestamptz[\s\S]*sent_at timestamptz[\s\S]*recipient_json jsonb[\s\S]*approval_json jsonb[\s\S]*timezone text/, "Phase 9D must store timing, recipient, approval, and timezone data.");
for (const helperName of ["isWeekend", "nextBusinessDay", "addBusinessDays"]) {
  assert.match(followUpService, new RegExp(`export function ${helperName}`), `Phase 9D timing must expose ${helperName}.`);
}
assert.match(followUpService, /five to seven business days|five-to-seven-business-day/, "Phase 9D application follow-up timing must use practical five-to-seven-business-day guidance.");
assert.match(followUpService, /within 24 hours[\s\S]*adjusted away from weekends/, "Phase 9D interview thank-you timing must support the 24-hour guidance without ignoring weekends.");
assert.match(followUpService, /expected_response_date[\s\S]*employer response timeline has passed/, "Phase 9D interview status follow-up must respect known employer response timelines.");
assert.match(followUpService, /closing_date[\s\S]*closing date is respected/, "Phase 9D timing must respect closing dates.");
assert.match(followUpService, /withdrawn[\s\S]*closed[\s\S]*archived[\s\S]*No follow-up is recommended/, "Phase 9D must cancel inappropriate follow-ups after withdrawal, closure, or archive.");
assert.match(followUpService, /rejected[\s\S]*No follow-up is recommended after rejection/, "Phase 9D must prevent pressure follow-ups after rejection.");
assert.match(followUpService, /function selectContact/, "Phase 9D must centralize contextual application contact selection.");
for (const contactType of ["recruiter", "hiring_manager", "referral_contact", "interviewer"]) {
  assert.match(followUpService, new RegExp(`"${contactType}"`), `Phase 9D must support ${contactType} contacts without mutating canonical identity.`);
}
assert.match(followUpService, /recipient\.name \? `Hello \$\{recipient\.name\},` : "Hello,"/, "Phase 9D must not invent recipient names.");
assert.match(followUpService, /canMarkFollowUpSent[\s\S]*Add a known recipient[\s\S]*Approve the follow-up/, "Phase 9D must require a known recipient and approval before marking sent.");
assert.doesNotMatch(`${followUpService}\n${followUpApi}`, /sendMail|smtpTransport|nodemailer|mailgun|awsSes|postmark|submitApplication|fetch\(["']https?:\/\/.*mail/i, "Phase 9D must not send communication automatically.");
assert.match(followUpApi, /prepareFollowUpDraft\(application as FollowUpApplicationContext/, "Phase 9D API must prepare grounded drafts from the tracked application context.");
assert.match(followUpApi, /duplicateKeyForFollowUp[\s\S]*\.in\("status", \["suggested", "scheduled", "drafted", "approved"\]\)/, "Phase 9D API must reuse active follow-up drafts instead of creating duplicates.");
assert.match(followUpApi, /canMarkFollowUpSent/, "Phase 9D API must enforce sent-state approval rules server-side.");
assert.match(followUpApi, /event_type: "follow_up"/, "Phase 9D API must write follow-up timeline events into the existing application timeline.");
assert.match(followUpApi, /follow_up_state[\s\S]*next_action[\s\S]*next_action_date/, "Phase 9D API must update tracker follow-up state and next action.");
assert.match(followUpApi, /safeTimezone[\s\S]*Intl\.DateTimeFormat/, "Phase 9D must validate user-controlled timezone input.");
assert.match(employmentTrackerPage, /application_follow_ups[\s\S]*eq\("user_id", user\.id\)/, "Applications page must load owned follow-up records.");
assert.match(employmentTrackerClient, /Follow-Up[\s\S]*Follow-Up Due[\s\S]*Prepare a follow-up[\s\S]*Schedule[\s\S]*Approve[\s\S]*Mark as Sent[\s\S]*Dismiss/, "Tracker UI must expose follow-up due, draft, schedule, approval, sent, and dismiss controls.");
assert.match(employmentTrackerClient, /Nothing is sent automatically/, "Tracker follow-up UI must state that PATHZY does not send automatically.");
assert.match(employmentTrackerClient, /Add a known contact before recording this follow-up as sent/, "Tracker UI must guard unknown recipients.");
assert.match(employmentTrackerClient, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/, "Tracker UI must pass the user's timezone to follow-up timing.");
assert.match(jobIntelligenceTranslations, /Follow-Up[\s\S]*Follow-Up Due[\s\S]*Prepare Follow-Up[\s\S]*Schedule[\s\S]*Approve[\s\S]*Mark as Sent[\s\S]*Dismiss[\s\S]*Relance[\s\S]*Relance a effectuer[\s\S]*Preparer la relance[\s\S]*Planifier[\s\S]*Approuver[\s\S]*Marquer comme envoyee[\s\S]*Ignorer/, "Phase 9D must include English and French follow-up copy.");
assert.match(careerAnalyticsService, /export function buildCareerAnalytics/, "Phase 9E must centralize analytics calculations in a shared service.");
assert.match(careerAnalyticsService, /Unknown outcomes are not counted as rejection/, "Phase 9E conversion methodology must document unknown outcomes.");
assert.match(careerAnalyticsService, /Conversion rates use only known tracker states/, "Phase 9E conversion methodology must document known-outcome calculations.");
assert.match(careerAnalyticsService, /Document performance is correlation only/, "Phase 9E document analytics must avoid causal claims.");
assert.match(careerAnalyticsService, /Private notes, contacts, interview responses and document contents are excluded from analytics/, "Phase 9E analytics must preserve privacy.");
for (const funnelStage of ["prepared", "applied", "employer_response", "screening", "assessment", "interview", "offer", "accepted"]) {
  assert.match(careerAnalyticsService, new RegExp(`${funnelStage}:`), `Phase 9E funnel must include ${funnelStage}.`);
}
for (const metric of ["responseRate", "interviewRate", "offerRate", "averageDaysToResponse", "averageDaysToInterview"]) {
  assert.match(careerAnalyticsService, new RegExp(metric), `Phase 9E response metrics must include ${metric}.`);
}
assert.match(careerAnalyticsService, /groupApplications[\s\S]*byRole[\s\S]*bySource/, "Phase 9E must calculate role and source analytics through the shared service.");
assert.match(careerAnalyticsService, /documentSignals[\s\S]*Not enough data yet[\s\S]*does not prove causation/, "Phase 9E document analytics must use cautious early-signal wording.");
assert.match(careerAnalyticsService, /function recurringGaps/, "Phase 9E must aggregate recurring requirement and gap categories.");
for (const gapCategory of ["confirmed_gap", "evidence_gap", "presentation_gap", "qualification_gap", "experience_gap"]) {
  assert.match(careerAnalyticsService, new RegExp(gapCategory), `Phase 9E must support ${gapCategory}.`);
}
for (const period of ["7d", "30d", "90d", "year", "custom"]) {
  assert.match(careerAnalyticsService, new RegExp(`"${period}"`), `Phase 9E must support ${period} time filtering.`);
}
assert.match(careerAnalyticsService, /function periodRange/, "Phase 9E must centralize period filtering.");
assert.match(careerAnalyticsService, /timezone/, "Phase 9E must carry user timezone context.");
assert.match(careerAnalyticsService, /Not Enough Data Yet[\s\S]*Early signal/, "Phase 9E must show insufficient-data and early-signal states.");
assert.match(careerAnalyticsService, /review follow-ups|Review follow-ups|Practise recurring interview questions|Add verified evidence/, "Phase 9E recommendations must be grounded in tracker and gap evidence.");
assert.match(employmentTrackerPage, /job_match_analyses[\s\S]*professional_documents[\s\S]*eq\("user_id", user\.id\)/, "Applications page must load only owned match/document metadata for analytics.");
assert.match(employmentTrackerClient, /CareerAnalyticsDashboard/, "Applications page must render the Career Analytics dashboard.");
assert.match(employmentTrackerClient, /Career Analytics[\s\S]*Application Funnel[\s\S]*Applications by Role[\s\S]*Applications by Source[\s\S]*CV Performance[\s\S]*Recurring Gaps[\s\S]*Recommended Actions/, "Phase 9E UI must expose the core analytics sections without dozens of charts.");
assert.match(employmentTrackerClient, /7 days[\s\S]*30 days[\s\S]*90 days[\s\S]*This year[\s\S]*Custom[\s\S]*Custom start[\s\S]*Custom end/, "Phase 9E UI must expose standard and custom time filters.");
assert.match(employmentTrackerClient, /Unknown outcomes are not treated as rejection/, "Phase 9E UI must avoid misleading outcome assumptions.");
assert.match(employmentTrackerClient, /CV version \{index \+ 1\}/, "Phase 9E document analytics must avoid exposing employer names or private document titles in the dashboard.");
assert.doesNotMatch(careerAnalyticsService, /employer_name|contact_email|contacts_json|notes\s*[:?]|private_notes|practiceResponse|content_json/, "Phase 9E analytics service must not expose private notes, contacts, interview answers, or document contents.");
assert.match(jobIntelligenceTranslations, /Career Analytics[\s\S]*Application Funnel[\s\S]*Response Rate[\s\S]*Interview Rate[\s\S]*Offer Rate[\s\S]*Applications by Role[\s\S]*Applications by Source[\s\S]*Recurring Gaps[\s\S]*Recommended Actions[\s\S]*Not Enough Data Yet[\s\S]*Early Signal[\s\S]*Analyse de carriere[\s\S]*Parcours des candidatures[\s\S]*Taux de reponse[\s\S]*Taux d'entretien[\s\S]*Taux d'offre[\s\S]*Candidatures par poste[\s\S]*Candidatures par source[\s\S]*Lacunes recurrentes[\s\S]*Actions recommandees[\s\S]*Pas encore assez de donnees[\s\S]*Premiere tendance/, "Phase 9E must include English and French analytics copy.");
const careerAnalyticsRuntime = loadProductionTsModule("lib/analytics/career-analytics-service.ts");
const sampleAnalytics = careerAnalyticsRuntime.buildCareerAnalytics({
  applications: [
    { id: "a1", role: "Data Analyst", company_name: "Hidden", status: "applied", application_date: "2026-07-01", source: "LinkedIn", updated_at: "2026-07-01", targeted_cv_document_id: "cv1" },
    { id: "a2", role: "Data Analyst", company_name: "Hidden", status: "interview_scheduled", application_date: "2026-07-02", interview_date: "2026-07-08", source: "Referral", updated_at: "2026-07-08", targeted_cv_document_id: "cv1" },
    { id: "a3", role: "Support Analyst", company_name: "Hidden", status: "rejected", application_date: "2026-07-03", source: "Job board", updated_at: "2026-07-10" }
  ],
  timelineEvents: [
    { id: "e1", application_id: "a2", event_type: "interview_scheduled", event_at: "2026-07-08T10:00:00.000Z" },
    { id: "e2", application_id: "a3", event_type: "rejection", event_at: "2026-07-10T10:00:00.000Z" }
  ],
  matchAnalyses: [{ id: "m1", gaps_json: [{ title: "SQL evidence", requirementType: "skill" }], requirement_matches_json: [{ requirementText: "Power BI", status: "not_confirmed", requirementType: "tool" }] }],
  professionalDocuments: [{ id: "cv1", name: "Private CV Name", document_type: "cv" }],
  period: { type: "90d" },
  timezone: "Africa/Johannesburg",
  now: new Date("2026-07-18T12:00:00.000Z")
});
assert.equal(sampleAnalytics.funnel.applied, 3, "Phase 9E funnel must count applied and known later outcomes.");
assert.equal(sampleAnalytics.funnel.interview, 1, "Phase 9E funnel must count interview stages.");
assert.equal(sampleAnalytics.metrics.responseRate.value, "67%", "Phase 9E response rate must count known responses without treating unknown applied records as rejection.");
assert.equal(sampleAnalytics.recurringGaps.length >= 1, true, "Phase 9E must aggregate recurring gaps from match analyses.");

const jobParserRuntime = loadProductionTsModule("lib/job-intelligence/job-requirement-parser.ts");
const inspectedJob = jobParserRuntime.inspectJobAdvertisement({
  title: "Junior Data Analyst",
  company: "Example Company",
  rawText: `Job title: Junior Data Analyst
Company: Example Company
Requirements
Must have Excel skills
Required SQL knowledge
Preferred dashboard experience
Responsibilities
Prepare weekly reports`
});
assert.equal(inspectedJob.requirements.some((requirement) => requirement.importance === "mandatory"), true, "Job parser must identify mandatory requirements.");
assert.equal(inspectedJob.requirements.some((requirement) => requirement.importance === "preferred"), true, "Job parser must identify preferred requirements.");
assert.equal(inspectedJob.requirements.some((requirement) => ["skill", "technology"].includes(requirement.category)), true, "Job parser must classify skills and technology requirements.");
const jobUnderstandingRuntime = loadProductionTsModule("lib/job-intelligence/job-understanding-provider.ts");
const provider = new jobUnderstandingRuntime.DeterministicJobUnderstandingProvider();
const reviewedJobText = `Job title: Junior Data Analyst
Organisation: Insight Labs
Location: Johannesburg
Requirements
Must have MS Excel and SQL
Preferred Power BI experience
Bachelor degree would be advantageous
Responsibilities
Prepare monthly reports
Analyse operational data
Apply by sending your CV and cover letter to jobs@example.com
Closing date: 31 July 2026`;
const understoodEnglishJob = await provider.understandJob({
  jobImport: {
    id: "00000000-0000-0000-0000-000000000001",
    userId: "user-1",
    status: "ready",
    sourceType: "pasted_text",
    rawText: reviewedJobText,
    normalizedText: reviewedJobText,
    language: "en",
    inspection: {
      sourceType: "pasted_text",
      sourceLabel: "Pasted job description",
      language: "en",
      layout: { hasResponsibilities: true, hasRequirements: true, hasApplicationInstructions: true, hasClosingDate: true },
      preliminaryDetails: {
        jobTitle: "Junior Data Analyst",
        organisation: "Insight Labs",
        location: "Johannesburg",
        closingDate: "31 July 2026",
        applicationInstructions: "Apply by sending your CV and cover letter to jobs@example.com"
      },
      responsibilities: [
        { id: "responsibility-1", text: "Prepare monthly reports", category: "responsibility", importance: "unclear", sourceLine: "Prepare monthly reports", confidence: 0.8 },
        { id: "responsibility-2", text: "Analyse operational data", category: "responsibility", importance: "unclear", sourceLine: "Analyse operational data", confidence: 0.8 }
      ],
      requirements: [
        { id: "requirement-1", text: "Must have MS Excel and SQL", category: "technology", importance: "mandatory", sourceLine: "Must have MS Excel and SQL", confidence: 0.86 },
        { id: "requirement-2", text: "Preferred Power BI experience", category: "technology", importance: "preferred", sourceLine: "Preferred Power BI experience", confidence: 0.82 },
        { id: "requirement-3", text: "Bachelor degree would be advantageous", category: "education", importance: "preferred", sourceLine: "Bachelor degree would be advantageous", confidence: 0.76 },
        { id: "requirement-4", text: "Customer success experience would be an advantage", category: "experience", importance: "preferred", sourceLine: "Customer success experience would be an advantage", confidence: 0.76 }
      ],
      optionalContext: [],
      missingFields: [],
      warnings: [],
      rawTextHash: "job_import_test",
      inspectedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
});
assert.equal(understoodEnglishJob.understanding.requirements.some((requirement) => requirement.importance === "mandatory"), true, "Phase 8B must keep mandatory requirements.");
assert.equal(understoodEnglishJob.understanding.requirements.some((requirement) => requirement.importance === "preferred"), true, "Phase 8B must keep preferred requirements.");
assert.equal(understoodEnglishJob.understanding.requirements.some((requirement) => requirement.canonicalConceptId === "skill:microsoft-excel"), true, "Phase 8B must normalize MS Excel to Microsoft Excel.");
assert.equal(understoodEnglishJob.understanding.responsibilities.length >= 1, true, "Phase 8B must keep responsibilities separate from requirements.");
assert.equal(Boolean(understoodEnglishJob.understanding.applicationDetails.contactEmail), true, "Phase 8B must extract application contact details.");
const profileJobMatchRuntime = loadProductionTsModule("lib/job-intelligence/profile-job-match-engine.ts");
const now = new Date().toISOString();
const canonicalValue = (value, status = "confirmed", confidence = 0.95) => ({
  value,
  status,
  confidence,
  sourceReferences: [{ sourceType: "user_entry", originalValue: value, sourceConfidence: confidence, addedAt: now }],
  createdAt: now,
  updatedAt: now
});
const profileForMatching = {
  id: "profile-1",
  userId: "user-1",
  version: 3,
  status: "active",
  identity: { fullName: canonicalValue("Nicka Candida") },
  contact: { otherLinks: [] },
  professionalProfile: { targetRoles: [], industries: [], workPreferences: [], professionalSummary: canonicalValue("Data analyst with reporting and customer service experience.") },
  employment: [
    {
      id: "employment-1",
      canonicalTitle: canonicalValue("Customer Service Analyst"),
      titleVariants: [],
      employer: canonicalValue("Example Co"),
      employerAliases: [],
      startDate: { value: { raw: "Jan 2022", year: 2022, month: 1 }, status: "confirmed", confidence: 0.9, sourceReferences: [], createdAt: now, updatedAt: now },
      endDate: { value: { raw: "Dec 2024", year: 2024, month: 12 }, status: "confirmed", confidence: 0.9, sourceReferences: [], createdAt: now, updatedAt: now },
      isCurrent: { value: false, status: "confirmed", confidence: 0.9, sourceReferences: [], createdAt: now, updatedAt: now },
      responsibilities: [{ id: "resp-1", statement: canonicalValue("Prepared monthly reports and resolved customer account issues."), sourceReferences: [] }],
      achievements: [],
      skills: [],
      tools: [],
      technologies: [],
      projects: [],
      status: "confirmed",
      sourceReferences: [],
      confidence: 0.9,
      createdAt: now,
      updatedAt: now
    }
  ],
  education: [{ id: "education-1", qualification: canonicalValue("Bachelor degree"), institution: canonicalValue("Example University"), institutionAliases: [], status: { value: "completed", status: "confirmed", confidence: 0.9, sourceReferences: [], createdAt: now, updatedAt: now }, supportingDocumentIds: [], sourceReferences: [], confidence: 0.88, reviewStatus: "confirmed", createdAt: now, updatedAt: now }],
  certifications: [],
  licences: [],
  skills: [{ id: "skill-1", canonicalName: canonicalValue("Microsoft Excel"), aliases: [], category: "software", explicitness: "explicit", relatedEmploymentIds: [], relatedEducationIds: [], relatedCertificationIds: [], relatedProjectIds: [], sourceReferences: [], confidence: 0.96, status: "confirmed" }],
  languages: [],
  projects: [],
  achievements: [],
  awards: [],
  memberships: [],
  publications: [],
  volunteering: [],
  references: [],
  careerTimeline: [],
  completion: { percentage: 70, missingSections: [], reviewNeededCount: 0 },
  confidence: { overall: 0.82, identity: 0.8, contact: 0.6, employment: 0.9, education: 0.88, skills: 0.96, consistency: 0.9 },
  unresolvedIssues: [],
  createdAt: now,
  updatedAt: now
};
const matchAnalysis = profileJobMatchRuntime.analyzeConfirmedJobAgainstProfile({ profile: profileForMatching, jobUnderstanding: understoodEnglishJob.understanding });
assert.equal(matchAnalysis.requirements.some((match) => match.status === "confirmed_match"), true, "Phase 8C must identify confirmed requirement matches.");
assert.equal(matchAnalysis.requirements.some((match) => match.status === "partial_match" || match.status === "transferable_match"), true, "Phase 8C must identify partial or transferable evidence separately.");
assert.equal(typeof matchAnalysis.fitScore === "number", true, "Phase 8C must calculate a transparent fit score.");
assert.equal(matchAnalysis.analysisConfidence > 0 && matchAnalysis.analysisConfidence <= 1, true, "Phase 8C must calculate analysis confidence separately.");
assert.equal(matchAnalysis.canonicalProfileVersion, 3, "Phase 8C must store the profile version used for matching.");
assert.equal(profileJobMatchRuntime.freshnessForProfileJobMatch({ analysis: matchAnalysis, currentProfileVersion: 4, currentJobUnderstandingVersion: matchAnalysis.jobUnderstandingVersion }).stale, true, "Phase 8C must detect stale analyses after profile changes.");
const targetedDocumentsRuntime = loadProductionTsModule("lib/job-intelligence/targeted-document-strategy.ts");
const profileVersionBeforeTargeting = profileForMatching.version;
const targetedPackage = targetedDocumentsRuntime.buildTargetedProfessionalDocuments({
  userId: "user-1",
  profile: profileForMatching,
  jobUnderstanding: understoodEnglishJob.understanding,
  matchAnalysis,
  includeApplicationEmail: true,
  includeLinkedInMessage: true,
  includeRecruiterMessage: true
});
assert.equal(targetedPackage.documents.some((document) => document.type === "cv" && document.configuration.purpose === "targeted"), true, "Phase 8D must create a new targeted CV using the existing CV model.");
assert.equal(targetedPackage.documents.some((document) => document.type === "cover_letter"), true, "Phase 8D must create a tailored cover-letter document.");
assert.equal(targetedPackage.documents.some((document) => document.type === "application_email"), true, "Phase 8D must prepare an optional application email draft.");
assert.equal(targetedPackage.documents.some((document) => document.type === "linkedin_message"), true, "Phase 8D must prepare an optional LinkedIn message draft.");
assert.equal(targetedPackage.documents.some((document) => document.type === "recruiter_message"), true, "Phase 8D must prepare an optional recruiter message draft.");
assert.equal(targetedPackage.package.documents.every((document) => document.approvalState === "review_required"), true, "Phase 8D documents must require user review before approval.");
assert.equal(targetedPackage.package.strategy.selectedSkillIds.includes("skill-1"), true, "Phase 8D must include verified relevant skills in the targeting strategy.");
assert.equal(targetedPackage.package.unsupportedClaimsBlocked.some((claim) => /Power BI/i.test(claim)), true, "Phase 8D must block unsupported job keywords from being claimed automatically.");
assert.equal(profileForMatching.version, profileVersionBeforeTargeting, "Phase 8D must not mutate the canonical profile while creating targeted documents.");
const targetedCv = targetedPackage.documents.find((document) => document.type === "cv");
assert.equal(targetedCv.name.includes("Targeted CV"), true, "Phase 8D must name the new CV as a targeted version, not overwrite the master CV.");
assert.equal(targetedCv.targeting.jobMatchAnalysisId, matchAnalysis.id, "Phase 8D must preserve the match-analysis reference on the generated document.");
assert.equal(targetedCv.targeting.approvalState, "review_required", "Phase 8D must store review-required state on generated documents.");

console.log("PATHZY journey and export standard regression tests passed.");
