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
const loginForm = readFileSync("components/auth/login-form.tsx", "utf8");
const registerForm = readFileSync("components/auth/register-form.tsx", "utf8");
const resetPasswordForm = readFileSync("components/auth/reset-password-form.tsx", "utf8");
const updatePasswordForm = readFileSync("components/auth/update-password-form.tsx", "utf8");
const authCallback = readFileSync("app/auth/callback/route.ts", "utf8");
const onboardingPage = readFileSync("app/onboarding/page.tsx", "utf8");
const onboardingApi = readFileSync("app/api/onboarding/route.ts", "utf8");
const onboardingFlow = readFileSync("components/onboarding/onboarding-flow.tsx", "utf8");
const supabaseMiddleware = readFileSync("lib/supabase/middleware.ts", "utf8");
const rootLayout = readFileSync("app/layout.tsx", "utf8");
const roadmapLayout = readFileSync("app/roadmap/layout.tsx", "utf8");
const professionalIdentityLayout = readFileSync("app/professional-identity/layout.tsx", "utf8");
const opportunitiesLayout = readFileSync("app/opportunities/layout.tsx", "utf8");
const applicationsLayout = readFileSync("app/applications/layout.tsx", "utf8");
const skillsLayout = readFileSync("app/skills/layout.tsx", "utf8");
const billingLayout = readFileSync("app/billing/layout.tsx", "utf8");
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
const roadmapPage = readFileSync("app/roadmap/page.tsx", "utf8");
const professionalIdentityPage = readFileSync("app/professional-identity/page.tsx", "utf8");
const profileActionEditor = readFileSync("components/professional-identity/profile-action-editor.tsx", "utf8");
const professionalProfileApi = readFileSync("app/api/professional-profile/route.ts", "utf8");
const professionalCvPage = readFileSync("app/professional-identity/cv/page.tsx", "utf8");
const professionalCoverLetterPage = readFileSync("app/professional-identity/cover-letter/page.tsx", "utf8");
const applicationsPage = readFileSync("app/applications/page.tsx", "utf8");
const skillsPage = readFileSync("app/skills/page.tsx", "utf8");
const billingPage = readFileSync("app/billing/page.tsx", "utf8");
const settingsPage = readFileSync("app/settings/page.tsx", "utf8");
const permissions = readFileSync("lib/navigation/permissions.ts", "utf8");
const entitlements = readFileSync("lib/access/entitlements.ts", "utf8");
const betaEntitlementsApi = readFileSync("app/api/admin/beta-entitlements/route.ts", "utf8");
const entitlementMigration = readFileSync("supabase/migrations/20260716120000_create_user_entitlements.sql", "utf8");
const exportStandard = readFileSync("docs/PATHZY_EXPORT_STANDARD.md", "utf8");
const documentTemplateEngine = readFileSync("lib/professional-identity/document-template-engine.ts", "utf8");
const documentDownloads = readFileSync("components/professional-identity/document-downloads.ts", "utf8");
const professionalIdentityTool = readFileSync("components/professional-identity/professional-identity-tool.tsx", "utf8");
const templateMiniPreview = readFileSync("components/professional-identity/template-mini-preview.tsx", "utf8");
const myDocumentsClient = readFileSync("components/professional-identity/my-documents-client.tsx", "utf8");
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
    setTimeout,
    clearTimeout
  }, { filename: absolutePath });
  return module.exports;
}

for (const section of ["Navigation", "Hero", "Features", "How PATHZY Works", "Career Journey", "Pricing", "Testimonials", "FAQ", "Footer"]) {
  assert.match(homepage, new RegExp(`data-home-section="${section}"`), `Homepage must include the ${section} landing section.`);
}
assert.match(homepage, /Do not remove landing sections without updating homepage regression test\./, "Homepage must warn maintainers to update the regression test before removing landing sections.");
assert.match(homepage, /const startHref = user \? PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES\.SIGNUP;/, "Welcome Start Free must send logged-out users to signup and logged-in users to My Employment Journey.");
assert.match(homepage, /const loginHref = user \? PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES\.LOGIN;/, "Welcome Login must send logged-out users to login and logged-in users to My Employment Journey.");
assert.match(homepage, /<a href=\{startHref\}[\s\S]*>Start Free<\/a>/, "Welcome navigation must include a Start Free link.");
assert.match(homepage, /<a href=\{loginHref\}[\s\S]*>Login<\/a>/, "Welcome navigation must include a Login link.");
assert.doesNotMatch(homepage, /href=\{appRoutes\.pricing\}|href=\{PATHZY_ROUTES\.BILLING\}|href="\/pricing"|href="\/billing"/, "Welcome Start Free/Login actions must not point to Pricing or Billing.");
assert.match(signupPage, /<RegisterForm \/>/, "Canonical /signup must own the account creation form.");
assert.match(loginForm, /redirectTo = searchParams\?\.get\("redirectTo"\) \|\| PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY/, "Login must default to My Employment Journey.");
assert.match(loginForm, /encodeURIComponent\(PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY\)/, "Google login callback must return to My Employment Journey.");
assert.match(registerForm, /emailRedirectTo: `\$\{window\.location\.origin\}\/auth\/callback\?next=\$\{encodeURIComponent\(appRoutes\.onboarding\)\}`/, "Signup confirmation must preserve new-user onboarding.");
assert.match(registerForm, /router\.replace\(appRoutes\.onboarding\)/, "Immediate signup sessions must enter onboarding.");
assert.match(authCallback, /requestUrl\.searchParams\.get\("next"\) \|\| PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY/, "Auth callback must default to My Employment Journey.");
assert.match(supabaseMiddleware, /url\.pathname = appRoutes\.roadmap;/, "Logged-in users opening auth pages must go to My Employment Journey.");
assert.match(onboardingPage, /redirect\(PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY\)/, "Completed onboarding visits must go to My Employment Journey.");
assert.match(onboardingApi, /redirectTo: PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY/, "Onboarding completion API must send users to My Employment Journey.");
assert.match(onboardingFlow, /router\.replace\(data\.redirectTo \?\? PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY\)/, "Onboarding UI must use the API redirect to My Employment Journey.");
assert.match(updatePasswordForm, /router\.replace\(PATHZY_ROUTES\.MY_EMPLOYMENT_JOURNEY\)/, "Password update should return to My Employment Journey.");
assert.match(resetPasswordForm, /href=\{PATHZY_ROUTES\.LOGIN\}/, "Reset password should link back to canonical Login.");
assert.doesNotMatch(`${homepage}\n${loginForm}\n${registerForm}\n${authCallback}\n${onboardingPage}\n${onboardingApi}\n${onboardingFlow}\n${supabaseMiddleware}\n${updatePasswordForm}`, /\/dashboard/, "Welcome/auth/onboarding entry flow must not use the old dashboard route.");
assert.doesNotMatch(rootLayout, /AppShell/, "Public root layout must not wrap the landing page in the authenticated app shell.");
assert.match(supabaseServer, /requireAuthenticatedUser\(redirectTo = "\/roadmap"\)/, "Protected-route login fallback must default to My Employment Journey.");
for (const [key, route] of [
  ["WELCOME_HOME", "/"],
  ["LOGIN", "/login"],
  ["SIGNUP", "/signup"],
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
  ["/applications", applicationsLayout],
  ["/skills", skillsLayout],
  ["/billing", billingLayout],
  ["/settings", settingsLayout]
]) {
  assert.match(routeLayout, /<AppShell>\{children\}<\/AppShell>/, `${routeName} must render inside the authenticated app shell.`);
}

assert.match(nextActionEngine, /export async function getPathzyNextAction/, "PATHZY must expose one shared next action journey engine.");
assert.match(dashboard, /redirect\(appRoutes\.roadmap\)/, "Legacy /dashboard must redirect to My Employment Journey.");
assert.match(roadmapPage, /Welcome back to PATHZY/, "Authenticated landing page must show a warm PATHZY welcome.");
assert.match(roadmapPage, /Welcome, \{firstName\}/, "Authenticated landing page must render the safe first-name value.");
assert.match(roadmapPage, /safeFirstToken\(user\?\.user_metadata\?\.display_name\)/, "First name fallback must use account display name before generic fallback.");
assert.match(roadmapPage, /const firstName = profileFirstName \|\| accountFirstName \|\| "there";/, "First name fallback must safely use 'there' instead of undefined, null, or email.");
assert.match(roadmapPage, /Start with your CV, and PATHZY will guide you through the process\./, "Authenticated landing page must keep the concise welcome guidance.");
assert.match(roadmapPage, /Your employment journey, guided step by step/, "Authenticated landing page must include the PATHZY journey guidance card.");
assert.match(roadmapPage, /We guide you step by step — from building your professional profile and CV to preparing for opportunities and moving toward employment\./, "Welcome card must use the approved explanatory copy.");
assert.match(roadmapPage, /You don't need to figure out everything at once\. Start with the next step, and PATHZY will help you move forward from there\./, "Welcome card must include the supporting guidance copy.");
assert.match(roadmapPage, /eyebrow: "WELCOME TO PATHZY"[\s\S]*button: ""[\s\S]*href: ""/, "Welcome card must not include a CTA button or link.");
for (const label of ["Build My CV", "Upload My Old CV", "Upgrade My CV"]) {
  assert.match(roadmapPage, new RegExp(`button: "${label}"`), `Authenticated landing page must render ${label}.`);
}
assert.equal((roadmapPage.match(/button: "Build My CV"/g) ?? []).length, 1, "Authenticated landing page must render one Build My CV button.");
assert.doesNotMatch(roadmapPage, /button: "Start My Journey"/, "Authenticated landing page must not render Start My Journey during this product stage.");
assert.match(roadmapPage, /href: `\$\{appRoutes\.professionalIdentityCv\}\?intent=build`/, "Build My CV must open the existing CV workspace with build intent.");
assert.match(roadmapPage, /href: `\$\{appRoutes\.professionalIdentityCv\}\?intent=upload`/, "Upload My Old CV must open the existing CV workspace with upload intent.");
assert.match(roadmapPage, /href: `\$\{appRoutes\.professionalIdentityCv\}\?intent=upgrade`/, "Upgrade My CV must open the existing CV workspace with upgrade intent.");
assert.equal((roadmapPage.match(/appRoutes\.professionalIdentityCv/g) ?? []).length, 3, "The three authenticated landing CTA buttons must use the single canonical CV workspace route.");
assert.equal((roadmapPage.match(/key=\{action\.eyebrow\}/g) ?? []).length, 1, "Authenticated landing page must render the dashboard action card collection once.");
assert.match(roadmapPage, /grid gap-5 lg:grid-cols-2/, "Authenticated landing cards must use a responsive grid.");
assert.doesNotMatch(roadmapPage, /row-span|featured/, "Authenticated landing page must not keep one oversized recommendation card.");
assert.doesNotMatch(roadmapPage, /overflow-x-auto|whitespace-nowrap|min-w-\[/, "Authenticated landing page must not require horizontal scrolling on mobile.");
assert.doesNotMatch(roadmapPage, /Sample Career Plan|Your 90-day control center|Continue My Journey|Interactive 90-day plan|Compare careers/, "Authenticated landing page must not show the previous crowded journey content.");
assert.match(roadmapPage, /getPathzyNextAction/, "Phase 9F dashboard must use the shared next-action engine.");
assert.match(roadmapPage, /buildDashboardAttentionItems/, "Phase 9F dashboard must derive attention cards from one shared operating-system helper.");
assert.match(roadmapPage, /summarizeApplicationTracker/, "Phase 9F dashboard must use shared tracker summary logic.");
assert.match(roadmapPage, /buildCareerAnalytics/, "Phase 9F dashboard must use the shared analytics service.");
assert.match(roadmapPage, /PathzyTimeline/, "Phase 9F dashboard must render the existing PATHZY Timeline component.");
assert.match(roadmapPage, /buildCareerPlanSuggestions/, "Phase 9F dashboard must surface Career Plan suggestions without mutating the plan automatically.");
assert.match(roadmapPage, /PATHZY_OPERATING_AREAS/, "Phase 9F dashboard must expose the unified workspace map.");
assert.match(roadmapPage, /safeQuery/, "Phase 9F dashboard must use safe partial-failure query handling.");
assert.match(roadmapPage, /Unknown outcomes are not counted as rejection|Unknown outcomes are not counted as rejection|Unknown outcomes are not treated as rejection/, "Phase 9F dashboard must preserve honest analytics wording.");
assert.match(operatingSystem, /applicationEventsForPathzyTimeline/, "Phase 9F must reuse application tracker timeline signals for the PATHZY Timeline.");
assert.match(operatingSystem, /buildCareerPlanSuggestions[\s\S]*You stay in control|without PATHZY changing your plan automatically|Do not automatically modify/, "Phase 9F must connect Career Plan suggestions without automatic mutation.");
assert.match(legacyCvBuilderPage, /redirect\(appRoutes\.professionalIdentityCv\)/, "Legacy /cv-builder must redirect to the canonical CV Builder.");
assert.match(legacyEmploymentTrackerPage, /redirect\(appRoutes\.applications\)/, "Legacy /employment-tracker must redirect to My Applications.");
assert.match(legacyProgressPage, /redirect\(appRoutes\.skills\)/, "Legacy /progress must redirect to Skills & Career Growth.");
assert.match(legacyProfilePage, /redirect\(appRoutes\.settings\)/, "Legacy /profile must redirect to Settings.");
assert.match(legacyRegisterPage, /redirect\(appRoutes\.signup\)/, "Legacy /register must redirect to Sign Up.");
assert.match(nextActionEngine, /label: "Complete onboarding"[\s\S]*destinationRoute: appRoutes\.onboarding/, "Brand-new users must receive onboarding guidance.");
assert.match(nextActionEngine, /if \(milestone\.key === "profile"\) return "Complete My Professional Profile";/, "Users with incomplete profile information must be guided to My Professional Profile.");
assert.match(nextActionEngine, /if \(milestone\.key === "profile"\) return appRoutes\.professionalIdentity;/, "Profile gaps must route to My Professional Profile, not Billing.");
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
assert.match(appShell, /<Link href=\{appRoutes\.roadmap\}[\s\S]*Back to My Employment Journey[\s\S]*<\/Link>/, "Authenticated pages must provide a clear universal return action to My Employment Journey.");
assert.match(operatingSystem, /export const PATHZY_OPERATING_AREAS/, "Phase 9F must centralize the unified employment operating-system map.");
for (const label of ["Home", "Professional Identity", "Documents", "Jobs", "Applications", "Interview Preparation", "Career Plan", "Career Analytics", "Coach", "Settings"]) {
  assert.match(operatingSystem, new RegExp(`label: "${label}"`), `Unified navigation must include ${label}.`);
}
assert.match(operatingSystem, /getOperatingNavigation/, "Unified navigation must be derived from the operating-system map.");
assert.match(navigation, /export const navigation = getOperatingNavigation\(\);/, "Authenticated navigation must read from the unified operating-system map.");
assert.match(operatingSystem, /href: appRoutes\.documents/, "Documents must route to the canonical documents workspace.");
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
assert.match(billingPage, /PricingPage/, "The /billing entry point must reuse the existing billing/pricing implementation.");
assert.doesNotMatch(navigation, /label: "Profile"/, "Main navigation must not include a duplicate Profile label.");
assert.doesNotMatch(floatingMentorButton, /\/dashboard|\/employment-tracker|\/progress/, "Contextual Mentor routing must not reference legacy app routes.");
assert.ok(/profile: "\/onboarding"/.test(journeyRouter) || /profile: appRoutes\.onboarding/.test(journeyRouter), "Profile completion must route to the profile setup flow, not membership profile.");
assert.doesNotMatch(journeyRouter, /founding-members|pricing|settings|\/profile"/, "Journey Router must not send Continue My Journey to Founder, Billing, Settings, or membership profile.");

const expectedOrder = [
  ["\"/onboarding\"", "appRoutes.onboarding"],
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
  ["\"/applications\"", "appRoutes.applications"]
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
assert.doesNotMatch(navigation, /label: "My Documents"/, "My Documents must stay inside My Professional Profile, not main navigation.");
assert.doesNotMatch(navigation, /label: "Founding Members"/, "Founder access must not be in normal navigation.");
assert.match(permissions, /export function canCreateCV[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Free and premium users must be able to create CVs on the same route.");
assert.match(permissions, /export function canUseProfessionalIdentity[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Professional Identity access must depend on authentication, not paid membership.");
assert.match(permissions, /export function canUsePremiumTemplates[\s\S]*return normalizePermissionContext\(context\)\.isAuthenticated;/, "Free users must be able to preview available premium designs.");
assert.match(permissions, /export function canExportProfessionalDocuments[\s\S]*return hasPremiumAccess\(context\);/, "Only premium document export/download actions should require paid or Founder access.");
assert.match(entitlements, /export type AccessLevel = "founder" \| "beta_full" \| "trial" \| "paid_pro" \| "paid_premium" \| "expired" \| "free"/, "PATHZY must define the complete founder, beta, trial, paid, expired and free access model.");
assert.match(entitlements, /export function canAccessFeature\(entitlements:[\s\S]*feature: EntitlementFeature\): boolean/, "All feature gates must use the shared entitlement access decision.");
assert.match(entitlements, /if \(entitlements\.isAdmin \|\| entitlements\.isFounder\) return true;/, "Founder and admin accounts must have permanent full access through the central helper.");
assert.match(entitlements, /if \(entitlements\.isBetaFull \|\| entitlements\.isTrial \|\| entitlements\.isPaid\) return true;/, "Active beta, trial and paid users must unlock restricted actions through the same helper.");
assert.match(entitlements, /\["founder", "beta_full", "paid_premium", "paid_pro", "trial", "expired", "free"\]/, "Expired beta users must retain an explicit expired state instead of being treated as deleted users.");
assert.match(entitlements, /const status: EntitlementStatus = accessLevel === "expired" \? "expired"/, "Expired access must map to an explicit expired entitlement status.");
assert.match(entitlements, /Your private beta access has ended\. Your documents are safe/, "Expired beta messaging must explain that user documents remain safe.");
assert.match(permissions, /canAccessFeature\([\s\S]*"document_export"\)/, "Existing premium export gates must delegate to the central entitlement helper.");
assert.match(professionalIdentityService, /userCanAccessFeature\(supabase, userId, "professional_identity"\)/, "Professional Identity access must use the shared entitlement helper.");
assert.match(professionalIdentityService, /getUserEntitlements\(supabase, userId\)[\s\S]*canExportProfessionalDocuments/, "Professional document export gates must read shared entitlements before deciding access.");
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
assert.match(professionalIdentityPage, /button: "My CV"/, "Professional Profile must label the existing CV workspace as My CV.");
assert.match(professionalCvPage, /title="My CV"/, "CV workspace page header must use the My CV label.");
assert.match(professionalCoverLetterPage, /title="My Cover Letter"/, "Cover Letter workspace page header must use the My Cover Letter label.");
assert.match(professionalCvPage, /Build your professional CV[\s\S]*PATHZY will prepare the first draft, and you can review, edit and improve it before downloading\./, "My CV page must show the explanatory intro card before the workspace.");
assert.match(professionalCvPage, /Create your cover letter[\s\S]*Build Cover Letter/, "My CV page must show the cover letter next-step intro card.");
assert.match(professionalCvPage, /ButtonLink href=\{PATHZY_ROUTES\.COVER_LETTER\}>Build Cover Letter<\/ButtonLink>/, "Build Cover Letter must use the canonical Cover Letter route.");
assert.match(professionalCoverLetterPage, /Build your professional cover letter[\s\S]*PATHZY will prepare your first draft for you to review and improve\./, "My Cover Letter page must show the explanatory intro card before the workspace.");
assert.match(professionalCoverLetterPage, /Optimise your LinkedIn[\s\S]*Optimise LinkedIn/, "My Cover Letter page must show the LinkedIn next-step intro card.");
assert.match(professionalCoverLetterPage, /ButtonLink href=\{PATHZY_ROUTES\.LINKEDIN_OPTIMIZER\}>Optimise LinkedIn<\/ButtonLink>/, "Optimise LinkedIn must use the canonical LinkedIn route.");
assert.match(professionalCoverLetterPage, /mb-6 grid gap-4 md:grid-cols-2/, "My Cover Letter intro cards must use the same two-card desktop architecture as My CV.");
const myCvIntroIndex = professionalCvPage.indexOf("Build your professional CV");
const coverLetterIntroIndex = professionalCvPage.indexOf("Create your cover letter");
const cvToolIndex = professionalCvPage.indexOf("<ProfessionalIdentityTool");
assert.ok(myCvIntroIndex > -1 && coverLetterIntroIndex > myCvIntroIndex && cvToolIndex > coverLetterIntroIndex, "My CV intro cards must render below the page heading and before the existing CV workspace.");
const myCvIntroCard = professionalCvPage.slice(myCvIntroIndex, coverLetterIntroIndex);
assert.doesNotMatch(myCvIntroCard, /ButtonLink|<Link|href=|<button/, "The My CV explanatory intro card must not contain a button or link.");
const myCoverLetterIntroIndex = professionalCoverLetterPage.indexOf("Build your professional cover letter");
const linkedInIntroIndex = professionalCoverLetterPage.indexOf("Optimise your LinkedIn");
const coverLetterToolIndex = professionalCoverLetterPage.indexOf("<ProfessionalIdentityTool");
assert.ok(myCoverLetterIntroIndex > -1 && linkedInIntroIndex > myCoverLetterIntroIndex && coverLetterToolIndex > linkedInIntroIndex, "My Cover Letter intro cards must render below the page heading and before the existing Cover Letter workspace.");
const myCoverLetterIntroCard = professionalCoverLetterPage.slice(myCoverLetterIntroIndex, linkedInIntroIndex);
assert.doesNotMatch(myCoverLetterIntroCard, /ButtonLink|<Link|href=|<button/, "The My Cover Letter explanatory intro card must not contain a button or link.");
assert.match(settingsPage, />My CV<\/ButtonLink>/, "Settings shortcut must use the My CV label.");
assert.match(navigation, /"My CV"/, "Shared user-facing product data must use the My CV label.");
assert.doesNotMatch(`${professionalIdentityPage}\n${professionalCvPage}\n${settingsPage}\n${navigation}\n${readFileSync("app/qa-pathzy-journey/page.tsx", "utf8")}`, /Create My CV/, "Relevant user-facing CV workspace labels must not say Create My CV.");
assert.match(professionalIdentityPage, /<ProfileActionEditor rows=\{profileRows\} \/>/, "Professional Profile information rows must use the shared inline profile action editor.");
assert.doesNotMatch(professionalIdentityPage, /appRoutes\.settings|href="\/settings"|href=\{appRoutes\.billing\}|href="\/billing"|href="\/profile"|href="\/roadmap"|href="\/onboarding"/, "Professional Profile Edit/Add Missing Info actions must not leave the profile workflow for Settings, Billing, legacy profile, Journey, or onboarding.");
assert.match(profileActionEditor, /export const profileSectionActions/, "Professional Profile actions must be centralized in profileSectionActions.");
for (const sectionName of ["name", "email", "phone", "location", "currentStatus", "education", "fieldOfStudy", "careerDirection", "experience", "skills", "languages", "projects", "certificates", "achievements", "references"]) {
  assert.match(profileActionEditor, new RegExp(`${sectionName}: \\{`), `${sectionName} must open its own exact Professional Profile editor.`);
}
for (const editorName of ["Name editor", "Email editor", "Phone editor", "Location editor", "Current Status editor", "Education editor", "Field of Study editor", "Career Direction editor", "Experience editor", "Skills editor", "Languages editor", "Projects editor", "Certificates editor", "Achievements editor", "References editor"]) {
  assert.match(profileActionEditor, new RegExp(editorName), `${editorName} must be available from My Professional Profile.`);
}
assert.match(profileActionEditor, /fetch\("\/api\/professional-profile"/, "Professional Profile Save must persist through the dedicated profile save endpoint.");
assert.match(profileActionEditor, /router\.refresh\(\)/, "Professional Profile Save must refresh the page so updated data appears immediately.");
assert.match(profileActionEditor, /Save returns to \/professional-identity/, "Professional Profile Save must return users to My Professional Profile.");
assert.match(profileActionEditor, /Cancel returns to \/professional-identity without saving/, "Professional Profile Cancel must keep users on My Professional Profile without saving.");
assert.match(profileActionEditor, /Open Documents/, "Uploaded documents must open My Documents rather than Settings.");
assert.doesNotMatch(profileActionEditor, /appRoutes\.settings|\/settings|\/billing|membership|\/roadmap|\/onboarding/, "Profile action editor must not route profile fixes to Settings, Billing, membership, Journey, or onboarding.");
assert.match(professionalProfileApi, /from\("user_profiles"\)\.upsert/, "Professional Profile save endpoint must create or update the user's profile row.");
assert.match(professionalProfileApi, /from\("discovery_responses"\)/, "Professional Profile save endpoint must update discovery-backed profile sections.");
assert.match(professionalProfileApi, /updatePathzyBrain/, "Professional Profile save endpoint must refresh employment readiness after saving.");
assert.match(professionalProfileApi, /redirectTo: "\/professional-identity"/, "Professional Profile save endpoint must report the canonical return destination.");
assert.doesNotMatch(professionalProfileApi, /\/settings|\/billing|\/roadmap|\/onboarding/, "Professional Profile save endpoint must not redirect profile edits to unrelated workflows.");
assert.match(professionalIdentityTool, /Free users can build, edit, save, and preview core documents/, "Free users must not be told that saving is locked.");
assert.doesNotMatch(professionalIdentityTool, /download, save, and export/, "Upgrade copy must not imply free users cannot save documents.");

assert.match(exportStandard, /PATHZY is the editor\./, "Export standard must define PATHZY as the editor.");
assert.match(exportStandard, /PDF is the final published document\./, "Export standard must define PDF as the final document.");
assert.match(exportStandard, /The CV model is the single source of truth/, "Export standard must require the CV model as source of truth.");
assert.match(exportStandard, /Premium visual quality is required, not optional\./, "Export standard must require premium visual quality.");
assert.match(professionalIdentityTool, /draft\.fullName = event\.target\.value;/, "Full name editing must allow spaces while typing.");
assert.match(professionalIdentityTool, /draft\.targetRole = event\.target\.value;/, "Target role editing must allow spaces while typing.");
assert.doesNotMatch(professionalIdentityTool, /event\.target\.value\.trim\(\)/, "Editor inputs must not trim while the user is typing.");
assert.match(professionalIdentityTool, /normalizeCvModelForExport\(cvModel\)/, "Saved CV drafts must store the cleaned CV model without mutating fields while typing.");
assert.match(professionalIdentityTool, /type CvVersionMetadata = \{[\s\S]*designSystem: string;[\s\S]*versionName: string;[\s\S]*createdAt: string;[\s\S]*updatedAt: string;[\s\S]*lastDownloadedAt: string \| null;[\s\S]*\};/, "CV design versions must store explicit design and timestamp metadata.");
assert.match(professionalIdentityTool, /function cvContentJson\(document: GeneratedProfessionalDocument \| null, cvModel: CvModel, metadata: CvVersionMetadata\)/, "CV content JSON must keep cvModel and cvVersion as separate concepts.");
assert.match(professionalIdentityTool, /cvModel: normalizeCvModelForExport\(cvModel\),[\s\S]*cvVersion: metadata/, "CV version saves must use one CV model plus separate version metadata.");
assert.match(professionalIdentityTool, /function duplicateCvVersion/, "CV Builder must let users duplicate a CV design version.");
assert.match(professionalIdentityTool, /function renameCvVersion/, "CV Builder must let users rename a CV design version.");
assert.match(professionalIdentityTool, /Template switching changes presentation only\. Your CV model, edits, and saved content stay the same\./, "CV Builder must explain that design changes do not erase content without showing technical version controls.");
assert.match(myDocumentsClient, /function saveCvVersionPatch/, "My Documents must allow saved CV versions to be renamed or switched to another design.");
assert.match(myDocumentsClient, /cvVersion: \{ \.\.\.version, versionName: title, createdAt: now, updatedAt: now, lastDownloadedAt: null \}/, "Duplicated CV documents must get fresh version metadata.");
assert.match(myDocumentsClient, /renderCvHtmlFromModel\(selectedCvModel, selectedCvVersion\?\.designSystem/, "Saved CV preview must render from the selected version design metadata.");
assert.match(myDocumentsClient, /lastDownloadedAt: downloadedAt/, "Downloaded CV versions must store lastDownloadedAt metadata.");
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
assert.match(professionalIdentityTool, /const next = \{ \.\.\.document, content, contentJson: \{ \.\.\.\(document\.contentJson \?\? \{\}\), cvModel: draft, cvVersion: version \}/, "CV draft changes must preserve the structured CV model and active version metadata for reload.");
assert.match(professionalIdentityTool, /window\.localStorage\.setItem\(recoveryKey, JSON\.stringify\(next\)\);/, "CV draft edits must be recoverable from browser storage.");
assert.match(professionalIdentityTool, /previewCvModel/, "CV preview must use a stable debounced preview model.");
assert.match(professionalIdentityTool, /setTimeout\(\(\) => \{\s*setPreviewCvModel\(cvModel\);\s*\}, 260\);/, "CV preview updates must be debounced to reduce layout shaking while typing.");
assert.match(professionalIdentityTool, /if \(immediatePreview\) setPreviewCvModel\(draft\);/, "CV section changes must be able to update preview immediately for hide/add visibility.");
assert.match(professionalIdentityTool, /function sectionStatus/, "CV editor must show explicit section visibility status.");
assert.match(professionalIdentityTool, /"Visible"/, "CV editor statuses must include Visible.");
assert.match(professionalIdentityTool, /"Empty"/, "CV editor statuses must include Empty.");
assert.match(professionalIdentityTool, /"Hidden"/, "CV editor statuses must include Hidden.");
assert.match(professionalIdentityTool, /const skillGroupSections = \[[\s\S]*Core[\s\S]*Technical[\s\S]*Professional[\s\S]*\];/, "CV Skills editor must expose Core, Technical, and Professional skill groups.");
assert.match(professionalIdentityTool, /function renderSkillsSection/, "CV Skills must use a dedicated grouped editor card.");
assert.match(professionalIdentityTool, /function renderSkillGroup/, "Each CV skill group must use the shared repeatable item controls.");
assert.match(professionalIdentityTool, /focusedNewRepeatableItem/, "CV repeatable sections must share one Add item focus mechanism.");
assert.match(professionalIdentityTool, /autoFocus=\{focusedNewRepeatableItem === `\$\{title\}-\$\{index\}`\}/, "Repeatable CV items must autofocus newly added blank items.");
assert.match(professionalIdentityTool, /setFocusedNewRepeatableItem\(`\$\{title\}-\$\{next\.length - 1\}`\)/, "Add item must create a new blank editable item and focus it.");
for (const sectionName of ["Certifications", "Achievements", "References", "Volunteer Experience", "Awards", "Publications", "Conferences", "Professional Memberships", "Interests", "Portfolio Links"]) {
  assert.match(professionalIdentityTool, new RegExp(`"${sectionName}"`), `${sectionName} must remain available as a repeatable CV section.`);
}
assert.match(professionalIdentityTool, /type CvPreviewScaleMode = "fit_page" \| "fit_width" \| "custom"/, "CV preview must support fit-page, fit-width, and custom zoom modes.");
assert.match(professionalIdentityTool, /const cvA4Page = \{ width: 794, height: 1123 \}/, "CV preview scaling must use the same A4 page dimensions as the export renderer.");
assert.match(professionalIdentityTool, /ResizeObserver\(calculateScale\)/, "CV preview must recalculate fit-page scaling when its viewport changes.");
assert.match(professionalIdentityTool, /availableWidth \/ cvA4Page\.width[\s\S]*availableHeight \/ cvA4Page\.height/, "CV Fit Page must account for both preview width and height.");
assert.match(professionalIdentityTool, /Fit Page[\s\S]*Fit Width[\s\S]*aria-label="Zoom Out"[\s\S]*aria-label="Zoom In"/, "CV preview must expose Fit Page, Fit Width, Zoom Out, and Zoom In controls.");
assert.match(professionalIdentityTool, /Edit CV[\s\S]*Preview CV/, "Mobile CV workspace must use Edit CV and Preview CV tabs.");
assert.match(professionalIdentityTool, /const scaledWidth = cvA4Page\.width \* cvPreviewScale[\s\S]*style=\{\{ width: scaledWidth, minHeight:/, "Mobile CV preview must reserve only the scaled A4 width to prevent horizontal overflow.");
assert.match(documentDownloads, /if \(clean\.length\) sections\.push\(\{ title, items: clean \}\);/, "Empty CV sections must be hidden from preview and PDF.");
assert.match(documentDownloads, /forbiddenOutputPatterns[\s\S]*\/pathzy\/i[\s\S]*\/will not invent\/i[\s\S]*\/add your\/i/, "Export renderer must filter internal PATHZY guidance and placeholders.");
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
assert.match(documentDownloads, /simplePdfDocumentFromModel[\s\S]*pdfFromLayout\(buildCvLayoutFromModel\(cv, templateName\)\)/, "PDF export must use the same CV layout renderer as preview.");
assert.match(documentDownloads, /export function renderCvHtmlFromModel\(cv: CvModel, templateName\?: string, activeSection\?: string\)[\s\S]*buildCvLayoutFromModel\(cv, templateName, activeSection\)/, "Designed Preview must use the shared CV layout renderer.");
assert.match(documentDownloads, /export function renderAtsCvHtmlFromModel\(cvInput: CvModel\)[\s\S]*cv\.fullName[\s\S]*cv\.targetRole[\s\S]*sections\.map/, "ATS Preview must keep header fields separate from semantic sections.");
assert.match(documentDownloads, /pathzyEliteDesignSystem/, "CV renderer must use the shared PATHZY elite document design system.");
assert.match(documentDownloads, /function buildSingleColumnCvLayout/, "ATS and International templates must have a true single-column A4 layout path.");
assert.match(documentDownloads, /premiumTemplate\.identity === "ats" \|\| premiumTemplate\.identity === "international"[\s\S]*buildSingleColumnCvLayout/, "Modern ATS and International Standard must render structurally different single-column CV layouts.");
assert.match(documentDownloads, /function printableCvSections/, "Single-column layouts must render real CV sections from the canonical model without creating another content source.");
assert.match(documentDownloads, /rightRail = \["executive", "consulting", "engineering"\]\.includes/, "Executive, Consulting, and Engineering templates must use a visibly different right-rail document architecture.");
assert.match(documentDownloads, /graduate: \["Professional Summary", "Education", "Projects", "Internships"/, "Graduate Elite must use an education-first document architecture after the Summary section.");
assert.match(documentDownloads, /healthcare: \["Professional Summary", "Certifications", "Education", "Professional Experience"/, "Healthcare Professional must elevate credentials and education near the top after the Summary section.");
assert.match(documentDownloads, /engineering: \["Professional Summary", "Projects", "Professional Experience"/, "Engineering must prioritize technical projects and experience after the Summary section.");
for (const templateName of ["Executive Black", "Modern ATS", "Google Style", "Microsoft Professional", "Deloitte Consulting", "Creative Premium", "Healthcare Professional", "Graduate Elite", "Engineering", "International Standard"]) {
  assert.match(documentTemplateEngine, new RegExp(`name: "${templateName}"`), `${templateName} must be registered in the reusable template engine.`);
  assert.match(documentDownloads, new RegExp(`"${templateName}"[\\s\\S]*identity:`), `${templateName} must have its own design identity.`);
}
assert.match(documentTemplateEngine, /atsCharacteristic[\s\S]*recruiterCharacteristic[\s\S]*bestFor[\s\S]*thumbnail/, "Template gallery metadata must include honest ATS/recruiter characteristics, best-for labels, and thumbnails.");
assert.doesNotMatch(documentTemplateEngine, /atsRating|recruiterRating/, "Template gallery metadata must not use invented static ATS or recruiter percentage ratings.");
assert.match(professionalIdentityService, /premiumDocumentTemplates = documentTemplateGallery/, "Professional Identity service must reuse the shared template gallery.");
assert.match(professionalIdentityTool, /documentTemplateGallery\.map/, "CV Builder must render the shared visual template gallery.");
assert.match(professionalIdentityTool, /Template gallery[\s\S]*Choose a recruiter-ready design/, "CV Builder must expose a visual template gallery.");
assert.match(professionalIdentityTool, /\[grid-template-columns:repeat\(auto-fit,minmax\(220px,1fr\)\)\]/, "CV Builder template gallery must use a responsive minimum-width card grid.");
assert.match(professionalIdentityTool, /<TemplateMiniPreview template=\{template\} \/>/, "CV Builder template gallery must use the shared architecture mini preview component.");
assert.match(templateMiniPreview, /cv-template-mini-preview/, "CV Builder template gallery must show lightweight mini document previews instead of abstract skeleton-only cards.");
for (const layout of ["single", "international", "executive", "consulting", "technical", "creative", "graduate"]) {
  assert.match(templateMiniPreview, new RegExp(layout), `Template mini preview must represent the ${layout} architecture.`);
}
assert.doesNotMatch(professionalIdentityTool, /lg:flex-row lg:items-start lg:justify-between/, "CV gallery parent must not use the old stretched desktop flex-row layout.");
assert.doesNotMatch(professionalIdentityTool, /min-h-\[330px\]/, "CV template cards must use natural content height, not fixed minimum card height.");
assert.match(professionalIdentityTool, /template\.atsCharacteristic[\s\S]*template\.recruiterCharacteristic/, "CV Builder template cards must show honest characteristics instead of static percentages.");
assert.doesNotMatch(professionalIdentityTool, /ATS \{template\.atsRating\}%|Recruiter \{template\.recruiterRating\}%/, "CV Builder template cards must not show fake ATS or recruiter percentages.");
assert.match(professionalIdentityTool, /onClick=\{\(\) => updateValue\("templateName", template\.name\)\}/, "Template cards must switch instantly while preserving the same CV model.");
assert.match(professionalIdentityTool, /Template switching changes presentation only\. Your CV model, edits, and saved content stay the same\./, "CV Builder must explain that switching templates preserves data.");
assert.match(professionalIdentityTool, /renderCvHtmlFromModel\(previewCvModel, templateName, activeCvSection\)/, "Designed Preview must render the selected template from the live canonical CV model.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, cvModel, templateName\)/, "PDF export path must stay aligned to the selected template and canonical CV model.");
assert.match(professionalIdentityTool, /Improve your CV/, "CV Builder must show Improve your CV recommendations instead of generic missing-field messages.");
assert.match(professionalIdentityTool, /Add \{parsedCv\.missing\.join\(", "\)\.toLowerCase\(\)\}/, "CV recommendations must be based on the structured CV model gaps.");
assert.doesNotMatch(professionalCvPage, /premiumDocumentTemplates\.map|TemplateMiniPreview/, "CV page wrapper must not render a second template gallery after the editor workspace.");
const cvEditorIndex = professionalIdentityTool.indexOf("Structured editor");
const cvPreviewIndex = professionalIdentityTool.indexOf("Live preview engine");
const cvGalleryIndex = professionalIdentityTool.indexOf("Choose a recruiter-ready design", cvPreviewIndex + 1);
const cvNextActionIndex = professionalIdentityTool.indexOf("Your CV is ready. What would you like to do next?");
assert.equal(professionalIdentityTool.indexOf("CV generated"), -1, "CV Builder must not render the old generated/version management card.");
assert.doesNotMatch(professionalIdentityTool, /CV version name|Content source: one CV model\.|When I save content edits, also update linked CV versions|Duplicate CV/, "CV Builder must keep technical version controls out of the visible workspace.");
assert.match(professionalIdentityTool, /Live preview engine[\s\S]*Regenerate[\s\S]*Upload CV[\s\S]*Download PDF[\s\S]*Designed Preview[\s\S]*ATS Preview/, "Live Preview Engine must contain CV management and preview/output actions.");
assert.ok(cvEditorIndex > -1 && cvPreviewIndex > cvEditorIndex && cvGalleryIndex > cvPreviewIndex && cvNextActionIndex > cvGalleryIndex, "CV page flow must be editor, live preview workspace, template gallery, then next-action area.");
assert.equal((professionalIdentityTool.match(/Choose a recruiter-ready design/g) ?? []).length, 2, "CV and Cover Letter must each render one My CV-style Template Gallery instance.");
assert.equal((professionalIdentityTool.match(/Structured editor/g) ?? []).length, 1, "CV Builder must render one Structured Editor instance.");
assert.equal((professionalIdentityTool.match(/Live preview engine/g) ?? []).length, 2, "CV and Cover Letter must each render one Live Preview Engine instance.");
for (const sectionLabel of ["Header", "Summary", "Experience", "Education", "Skills", "Projects", "Certifications", "More"]) {
  assert.match(professionalIdentityTool, new RegExp(`label: "${sectionLabel}"`), `CV Document Studio section navigator must include ${sectionLabel}.`);
}
assert.match(professionalIdentityTool, /function renderCvSectionNavigator/, "CV editor must render a vertical accordion section navigator.");
assert.match(professionalIdentityTool, /data-cv-editor-accordion="primary"/, "CV primary sections must be rendered as a vertical accordion.");
assert.match(professionalIdentityTool, /aria-expanded=\{isOpen\}[\s\S]*aria-controls=\{panelId\}/, "CV accordion buttons must expose expanded state and panel controls.");
assert.match(professionalIdentityTool, /onClick=\{\(\) => toggleCvPrimarySection\(item\)\}/, "CV accordion headings must expand and collapse primary sections.");
assert.match(professionalIdentityTool, /setActiveCvSection\(""\)/, "Clicking an open primary accordion section must collapse it without clearing CV data.");
assert.match(professionalIdentityTool, /function renderCvAccordionContent/, "CV accordion must render the existing editor inside the open section row.");
assert.doesNotMatch(professionalIdentityTool, /function renderActiveCvEditor/, "CV editor must not use the old detached active-editor block.");
assert.doesNotMatch(professionalIdentityTool, /overflow-x-auto[\s\S]{0,120}cvPrimaryNavigation|lg:grid-cols-4[\s\S]{0,160}cvPrimaryNavigation/, "CV primary sections must not use the old horizontal tab/grid selector.");
assert.match(professionalIdentityTool, /data-cv-editor-accordion="optional"/, "More must render optional sections as a nested vertical accordion.");
assert.match(professionalIdentityTool, /activeCvSection === title[\s\S]*setActiveCvSection\("More"\)/, "Clicking an open optional section must collapse it back to More.");
assert.match(professionalIdentityTool, /data-cv-editor-form-flow="single-column"/, "Expanded CV accordion editors must use a single-column field flow.");
assert.doesNotMatch(professionalIdentityTool, /renderHeaderEditor[\s\S]*sm:grid-cols-2/, "Header expanded accordion content must not place editable fields in two columns.");
assert.match(professionalIdentityTool, /Full name[\s\S]*Target role[\s\S]*Email[\s\S]*Phone[\s\S]*City[\s\S]*Country[\s\S]*LinkedIn[\s\S]*Portfolio/, "Header editor must preserve all existing fields in vertical order.");
assert.match(professionalIdentityTool, /tool === "cv" \? "grid gap-5 lg:grid-cols-2 lg:items-stretch"/, "CV workspace must use a 50/50 desktop editor and preview layout.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? "grid gap-5 lg:grid-cols-4"/, "Cover Letter workspace must keep its existing four-column layout.");
assert.match(professionalIdentityTool, /tool === "cv" \? `\$\{cvMobileTab === "edit" \? "block" : "hidden"\} lg:block lg:h-\[calc\(100vh_-_164px\)\] lg:min-h-\[680px\] lg:overflow-y-auto`/, "CV editor must be independently scrollable in the desktop 50% column and tabbed on mobile.");
assert.match(professionalIdentityTool, /cvMobileTab === "preview" \? "block" : "hidden"[\s\S]*lg:h-\[calc\(100vh_-_164px\)\] lg:min-h-\[680px\] lg:overflow-hidden/, "CV preview must stay in a viewport-controlled desktop column and switch behind the Preview CV mobile tab.");
assert.match(professionalIdentityTool, /renderCvPreviewViewer\(\)/, "CV A4 preview must render through the shared fit-page preview viewer.");
assert.match(professionalIdentityTool, /ref=\{cvPreviewViewportRef\}[\s\S]*aria-label="Live CV A4 preview"/, "CV preview viewer must measure the real preview viewport.");
assert.match(professionalIdentityTool, /function renderCvCompactStatus/, "CV Health and save state must be compact in the editor heading area.");
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
assert.match(myDocumentsClient, /documentTemplateGallery\.map/, "My Documents must use the same template engine for saved CV versions.");
assert.match(documentTemplateEngine, /legacyTemplateAliases[\s\S]*"ATS Friendly": "Modern ATS"/, "Legacy saved template names must normalize to canonical templates.");
assert.match(documentDownloads, /resolveCvTemplateDesign\(templateName\)/, "Template choice must resolve to a real document design.");
assert.match(documentDownloads, /nameSize[\s\S]*roleSize[\s\S]*sectionTitleSize[\s\S]*bodySize[\s\S]*bodyLineHeight/, "Document design system must define a typography scale.");
assert.match(documentDownloads, /headerHeight[\s\S]*sidebarWidth[\s\S]*columnGap[\s\S]*cardRadius[\s\S]*chipRadius/, "Document design system must define spacing and layout tokens.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, cvModel, templateName\)/, "CV export must use the same structured model as preview.");
assert.match(myDocumentsClient, /simplePdfDocumentFromModel\(selected\.title, selectedCvModel/, "Saved CV PDF export must use the structured CV model.");
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
assert.match(professionalIdentityPage, /getCanonicalProfileSummary\(supabase, user\.id\)/, "My Professional Profile must read the shared canonical profile summary.");
assert.match(professionalIdentityPage, /<CanonicalProfileOverview summary=\{canonicalSummary\} \/>/, "My Professional Profile must show the canonical identity overview without replacing existing editors.");
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
assert.match(documentDownloads, /export type CoverLetterData = \{[\s\S]*fullName: string;[\s\S]*professionalTitle: string;[\s\S]*companyName: string;[\s\S]*subject: string;[\s\S]*motivationParagraph: string;[\s\S]*evidenceParagraph: string;[\s\S]*companyAlignmentParagraph: string;[\s\S]*designSystem: CoverLetterTemplateName;[\s\S]*\};/, "Cover Letter foundation must define one canonical structured CoverLetterData source of truth.");
for (const templateName of ["Executive Black", "Modern ATS", "Google Style", "Microsoft Professional", "Deloitte Consulting", "Executive Signature", "Global Corporate", "Tech Minimal", "Creative Professional", "Graduate First Step"]) {
  assert.match(documentDownloads, new RegExp(`name: "${templateName}"`), `${templateName} must be registered in the cover letter template gallery.`);
}
assert.match(documentDownloads, /export function serializeCoverLetterData/, "Cover Letter content text must serialize from coverLetterData.");
assert.match(documentDownloads, /export function renderCoverLetterHtmlFromData/, "Cover Letter preview must render from coverLetterData.");
assert.match(documentDownloads, /export function simpleCoverLetterPdfDocument[\s\S]*pdfFromLayout\(buildCoverLetterLayoutFromData\(data\)\)/, "Cover Letter PDF must export from the same coverLetterData renderer.");
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
assert.match(documentDownloads, /premiumTemplate = resolveCvTemplateDesign\(coverDesign\.cvTemplate\)/, "Cover Letter rendering must use cover-letter design tokens without changing CV content.");
assert.match(documentDownloads, /coverDesign\.paragraphSpacing/, "Cover Letter design systems must change section rhythm, not just color.");
assert.match(documentDownloads, /coverDesign\.nameSize/, "Cover Letter design systems must change typography, not just color.");
assert.match(documentDownloads, /coverDesign\.headerStyle === "executive"[\s\S]*premiumTemplate\.amber/, "Executive cover letter must include a distinct premium accent treatment.");
assert.match(professionalIdentityService, /const templateName = normalizeCoverLetterTemplate\(options\.templateName\);/, "Cover Letter generation must use the cover-letter template family.");
assert.match(professionalIdentityService, /const coverLetterData: CoverLetterData = \{[\s\S]*professionalTitle: goal,[\s\S]*companyName: company,[\s\S]*jobTitle: role,[\s\S]*motivationParagraph:[\s\S]*evidenceParagraph:[\s\S]*companyAlignmentParagraph:[\s\S]*designSystem: templateName[\s\S]*\};/, "Cover Letter generation must create the expanded structured coverLetterData.");
assert.match(professionalIdentityService, /contentJson: \{ coverLetterData \}/, "Cover Letter save must persist coverLetterData.");
assert.match(professionalIdentityService, /async function getLatestCvModel/, "Cover Letter generation must read saved CV data when available.");
assert.match(coverLetterGeneration, /getLatestCvModel\(supabase, userId\)/, "Cover Letter generation must use the user's latest CV context.");
assert.match(coverLetterGeneration, /jobDescriptionFocus\(options\.jobDescription\)/, "Cover Letter generation must use the job description to shape the letter.");
assert.match(coverLetterGeneration, /coverLetterCvFacts\(latestCv, fallbackSkills\)/, "Cover Letter generation must summarize CV facts instead of copying the CV word-for-word.");
assert.doesNotMatch(coverLetterGeneration, /PATHZY|will not invent|Template:|Add your full name/, "Generated cover letters must not contain internal PATHZY wording, template notes, or placeholders.");
assert.match(professionalIdentityTool, /coverLetterDataFromUnknown/, "Cover Letter UI must hydrate coverLetterData from saved documents.");
assert.match(professionalIdentityTool, /renderCoverLetterHtmlFromData\(coverLetterData\)/, "Cover Letter preview must use coverLetterData.");
assert.match(professionalIdentityTool, /simpleCoverLetterPdfDocument\(exportCoverLetterData\)/, "Cover Letter download must use cleaned coverLetterData.");
assert.match(professionalIdentityTool, /coverLetterPdfFilename\(exportCoverLetterData\)/, "Cover Letter download must use the clean cover letter PDF filename.");
assert.match(professionalIdentityTool, /const saveOk = await saveDocument\(true\);[\s\S]*if \(!saveOk\) return;/, "Cover Letter download must not continue if saving the latest edits fails.");
assert.doesNotMatch(professionalIdentityTool, /cover-letter[\s\S]{0,220}docx/i, "Cover Letter user flow must not expose DOCX export.");
assert.match(professionalIdentityTool, /function updateCoverLetterDraft/, "Cover Letter editor must update coverLetterData as the source of truth.");
assert.match(professionalIdentityTool, /contentJson: \{ \.\.\.\(document\.contentJson \?\? \{\}\), coverLetterData: draft \}/, "Cover Letter edits must preserve coverLetterData for save and recovery.");
assert.match(professionalIdentityTool, /function renderCoverLetterEditor/, "Cover Letter must have a structured editor.");
assert.match(professionalIdentityTool, /function renderCoverLetterTemplateGallery/, "Cover Letter Studio must expose a letter-specific template gallery.");
assert.match(professionalIdentityTool, /function renderCoverLetterMiniPreview/, "Cover Letter template cards must show real mini document previews.");
assert.match(professionalIdentityTool, /coverLetterTemplateGallery\.map/, "Cover Letter template gallery must render all letter-specific templates.");
assert.match(professionalIdentityTool, /Template switching changes presentation only\. Your cover letter content, edits, application details and saved data stay the same\./, "Cover Letter template switching must explain that content is preserved.");
assert.match(professionalIdentityTool, /template_name: draft\.designSystem,[\s\S]*coverLetterData: draft/, "Cover Letter template switching must update presentation without losing content.");
assert.doesNotMatch(professionalCoverLetterPage, /premiumDocumentTemplates|documentTemplateGallery\.map/, "Cover Letter page must not render the old borrowed CV template strip.");
assert.match(professionalIdentityTool, /previewCoverLetterData/, "Cover Letter preview must use a stable debounced preview data state.");
assert.match(professionalIdentityTool, /setTimeout\(\(\) => \{\s*setPreviewCoverLetterData\(coverLetterData\);\s*\}, 260\);/, "Cover Letter live preview must debounce updates to avoid shaking while typing.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? "grid gap-5 lg:grid-cols-4"/, "Cover Letter workspace must keep its stable four-column desktop grid.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? "lg:col-span-1"/, "Cover Letter structured editor must keep the left-column span.");
assert.match(professionalIdentityTool, /<Card className="lg:col-span-3">[\s\S]*Live preview engine[\s\S]*\{selectedTemplateMetadata\.name\} Cover Letter/, "Cover Letter live preview must use the same right-column preview card span as My CV.");
assert.match(professionalIdentityTool, /renderCoverLetterCompactStatus\(\)/, "Cover Letter editor must show Cover Letter Health in the structured editor.");
assert.match(professionalIdentityTool, /Cover Letter Health/, "Cover Letter health label must be visible.");
assert.match(professionalIdentityTool, /const \[coverLetterHealthExpanded, setCoverLetterHealthExpanded\] = useState\(false\)/, "Cover Letter Health disclosure must be collapsed by default.");
assert.match(professionalIdentityTool, /aria-expanded=\{coverLetterHealthExpanded\}[\s\S]*aria-controls=\{panelId\}[\s\S]*setCoverLetterHealthExpanded/, "Cover Letter Health disclosure must use the existing accessible Expand/Collapse pattern.");
assert.match(professionalIdentityTool, /Designed Preview shows the print-ready A4 document that the PDF export uses\./, "Cover Letter preview must use the same preview explanation as My CV.");
assert.match(professionalIdentityTool, /Regenerate[\s\S]*Generate Draft[\s\S]*Download PDF[\s\S]*Designed Preview/, "Cover Letter live preview must expose generation, PDF, and designed preview actions.");
assert.match(professionalIdentityTool, /Draft details[\s\S]*Language[\s\S]*Premium template[\s\S]*fields\.map/, "Cover Letter draft inputs must remain available inside the live preview engine.");
assert.match(professionalCoverLetterPage, /name: "jobDescription"/, "Cover Letter route must still provide the optional job description input.");
assert.match(professionalIdentityTool, /renderCoverLetterEditor\(\)[\s\S]*tool === "cover-letter" \? \([\s\S]*Live preview engine[\s\S]*renderCoverLetterHtmlFromData\(previewCoverLetterData\)/, "Cover Letter editor and real A4 preview must render at the same time.");
assert.match(professionalIdentityTool, /function renderCoverLetterTemplateGallery\(\)[\s\S]*<Card className="lg:col-span-4">/, "Cover Letter template gallery must sit outside the workspace columns like My CV.");
assert.match(professionalIdentityTool, /Choose a recruiter-ready design[\s\S]*renderCoverLetterMiniPreview\(template\)[\s\S]*Best for: \{template\.bestFor\}/, "Cover Letter gallery must use My CV gallery architecture with real mini previews and best-for labels.");
assert.match(professionalIdentityTool, /template\.architecture\.replace\("-", " "\)} layout[\s\S]*PDF ready/, "Cover Letter template cards must show attribute labels.");
assert.doesNotMatch(professionalIdentityTool, /tool !== "cv" \? \([\s\S]*tool === "cover-letter" \? "lg:col-span-2"/, "Cover Letter must not use the old full-width generator card above the workspace.");
assert.match(professionalIdentityTool, /function renderDocumentNextActions\(\)/, "Professional document next-actions must use one shared renderer.");
assert.match(professionalIdentityTool, /Your CV is ready\. What would you like to do next\?/, "The existing CV next-actions heading must be preserved.");
assert.match(professionalIdentityTool, /Your cover letter is ready\. What would you like to do next\?/, "Cover Letter must show a document-specific next-actions heading.");
assert.match(professionalIdentityTool, /Your LinkedIn profile is ready\. What would you like to do next\?/, "LinkedIn must show a document-specific next-actions heading.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? \([\s\S]*Return to My CV[\s\S]*Optimise LinkedIn[\s\S]*Find Opportunities[\s\S]*Ask Your Mentor[\s\S]*Improve Cover Letter/, "Cover Letter next-actions must avoid linking back to the current page.");
assert.match(professionalIdentityTool, /tool === "linkedin" \? \([\s\S]*Return to My CV[\s\S]*Build Cover Letter[\s\S]*Find Opportunities[\s\S]*Ask Your Mentor[\s\S]*Improve LinkedIn/, "LinkedIn next-actions must avoid linking back to the current page.");
for (const sectionName of ["1. Personal Header", "2. Application Details", "3. Greeting", "4. Opening Paragraph", "5. Motivation / Why This Role", "6. Evidence / Why Me", "7. Company Alignment", "8. Additional Paragraphs", "9. Closing Paragraph", "10. Sign-off"]) {
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
assert.match(opportunitiesHub, /JobIntelligencePanel/, "Opportunities UI must display more than a single match percentage.");
assert.match(opportunitiesHub, /User reviews before applying/, "Opportunities UI must keep the user in control.");
assert.match(opportunitiesHub, /Inspect a job advert/, "Opportunities UI must expose the Phase 8A job import flow.");
assert.match(opportunitiesHub, /Paste text[\s\S]*Manual entry[\s\S]*Upload file[\s\S]*Job link/, "Job import UI must support pasted, manual, uploaded and URL input modes.");
assert.match(opportunitiesHub, /Review imported job[\s\S]*Save Job Review/, "Job import UI must show a review action after successful import.");
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
assert.match(opportunitiesHub, /Review the job analysis[\s\S]*Confirm Job Analysis/, "Phase 8B UI must let the user review and confirm the analysis.");
assert.match(opportunitiesHub, /No match score is created in Phase 8B/, "Phase 8B UI must not introduce matching or scoring.");
assert.match(opportunitiesHub, /Add requirement[\s\S]*Importance[\s\S]*Mandatory[\s\S]*Preferred[\s\S]*Optional[\s\S]*Unclear/, "Phase 8B UI must let users add and move requirements between importance categories.");
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