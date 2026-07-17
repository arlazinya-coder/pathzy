import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const professionalDocumentTypes = readFileSync("lib/professional-documents/professional-document.types.ts", "utf8");
const professionalDocumentService = readFileSync("lib/professional-documents/professional-document-service.ts", "utf8");
const professionalDocumentsMigration = readFileSync("supabase/migrations/20260716193000_create_professional_documents.sql", "utf8");
const jobIntelligenceTypes = readFileSync("lib/job-intelligence/job-intelligence.types.ts", "utf8");
const jobRequirementParser = readFileSync("lib/job-intelligence/job-requirement-parser.ts", "utf8");
const jobMatchEngine = readFileSync("lib/job-intelligence/job-match-engine.ts", "utf8");
const jobTargetedCvBridge = readFileSync("lib/job-intelligence/targeted-cv-bridge.ts", "utf8");
const jobIntelligenceService = readFileSync("lib/job-intelligence/job-intelligence-service.ts", "utf8");
const jobIntelligenceTranslations = readFileSync("lib/job-intelligence/job-intelligence-translations.ts", "utf8");
const jobIntelligenceMigration = readFileSync("supabase/migrations/20260717103000_create_job_intelligence.sql", "utf8");
const opportunitiesPage = readFileSync("app/opportunities/page.tsx", "utf8");
const opportunitiesHub = readFileSync("components/opportunities/opportunities-hub.tsx", "utf8");
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
  const localRequire = (request) => {
    if (request.startsWith("node:")) return require(request.replace(/^node:/, ""));
    if (request.startsWith("@/")) {
      const candidate = path.resolve(request.replace(/^@\//, ""));
      return loadProductionTsModule(candidate.endsWith(".ts") || candidate.endsWith(".tsx") ? candidate : `${candidate}.ts`);
    }
    if (request.startsWith(".")) {
      const candidate = path.resolve(path.dirname(absolutePath), request);
      return loadProductionTsModule(candidate.endsWith(".ts") || candidate.endsWith(".tsx") ? candidate : `${candidate}.ts`);
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
assert.match(navigation, /label: "My Employment Journey", href: appRoutes\.roadmap/, "My Employment Journey must route to /roadmap.");
assert.match(navigation, /label: "My Professional Profile", href: appRoutes\.professionalIdentity/, "My Professional Profile must route to /professional-identity.");
assert.match(navigation, /label: "Find Opportunities", href: appRoutes\.opportunities/, "Find Opportunities must route to /opportunities.");
assert.match(navigation, /label: "My Applications", href: appRoutes\.applications/, "My Applications must route to /applications.");
assert.match(navigation, /label: "Skills & Career Growth", href: appRoutes\.skills/, "Skills & Career Growth must route to /skills.");
assert.match(navigation, /label: "Billing", href: appRoutes\.billing/, "Billing must route to /billing.");
assert.match(navigation, /label: "Settings", href: appRoutes\.settings/, "Settings must route to /settings.");
const authenticatedNavigationBlock = navigation.match(/export const navigation = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
const authenticatedNavigationItems = [...authenticatedNavigationBlock.matchAll(/\{ label: "([^"]+)", href: appRoutes\.([a-zA-Z]+) \}/g)].map((match) => ({
  label: match[1],
  route: match[2]
}));
assert.deepEqual(authenticatedNavigationItems, [
  { label: "My Employment Journey", route: "roadmap" },
  { label: "My Professional Profile", route: "professionalIdentity" },
  { label: "Find Opportunities", route: "opportunities" },
  { label: "My Applications", route: "applications" },
  { label: "Skills & Career Growth", route: "skills" },
  { label: "Billing", route: "billing" },
  { label: "Settings", route: "settings" }
], "Authenticated navigation must contain exactly the seven canonical PATHZY sections in order.");
assert.match(appShell, /const loggedInNavigation: NavigationItem\[\] = \[\.\.\.navigation\];/, "Desktop and mobile authenticated navigation must both read the same canonical seven-item list.");
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
assert.match(cvImportPipeline, /extractPdfText\(buffer: Buffer\)/, "CV import must extract text from text-based PDFs server-side.");
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
assert.match(documentInspectionService, /validateInspectionInput\(input\)[\s\S]*sampleNativeText[\s\S]*detectDocumentSource[\s\S]*detectDocumentType[\s\S]*selectProcessingStrategy/, "Inspection service must orchestrate validation, sampling, source detection, type detection and strategy selection.");
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
assert.match(cvImportRoute, /createUploadShell[\s\S]*inspectAndPersistDocument[\s\S]*importCvFromUpload/, "CV import must inspect and persist the uploaded document before extraction and mapping.");
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
assert.match(cvImportRoute, /inspectAndPersistDocument[\s\S]*runAndPersistVisualReading[\s\S]*importCvFromUpload/, "CV import must visually read and persist the document after inspection and before semantic extraction.");
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
assert.match(cvImportRoute, /inspectAndPersistDocument[\s\S]*runAndPersistVisualReading[\s\S]*runAndPersistSemanticUnderstanding[\s\S]*importCvFromUpload/, "CV import must run inspection, visual reading and semantic understanding before extraction mapping.");
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
assert.match(professionalDocumentService, /getOrCreateCanonicalProfile\(supabase, input\.userId\)/, "Professional documents must use the canonical professional identity as source of truth.");
assert.match(professionalDocumentService, /persistProfessionalDocument/, "Phase 7 must persist generated documents through a dedicated document service.");
for (const tableName of ["professional_documents", "professional_document_fields", "professional_document_exports"]) {
  assert.match(professionalDocumentsMigration, new RegExp(`create table if not exists public\\.${tableName}`), `Phase 7 migration must create ${tableName}.`);
  assert.match(professionalDocumentsMigration, new RegExp(`alter table public\\.${tableName} enable row level security`), `${tableName} must enable RLS.`);
}
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
for (const tableName of ["job_intelligence_analyses", "job_intelligence_requirements", "job_intelligence_evidence"]) {
  assert.match(jobIntelligenceMigration, new RegExp(`create table if not exists public\\.${tableName}`), `Phase 8 migration must create ${tableName}.`);
  assert.match(jobIntelligenceMigration, new RegExp(`alter table public\\.${tableName} enable row level security`), `${tableName} must enable RLS.`);
}
assert.match(jobIntelligenceMigration, /references public\.canonical_professional_profiles\(id\) on delete cascade/, "Job Intelligence analyses must reference canonical professional profiles.");
assert.match(jobIntelligenceMigration, /auth\.uid\(\) = user_id/g, "Job Intelligence RLS policies must restrict every table to the owning user.");
for (const label of ["Job Intelligence", "Analyse de l'offre", "Evidence found", "Preuves trouvees", "Prepare truthful CV", "Preparer un CV honnete"]) {
  assert.match(jobIntelligenceTranslations, new RegExp(label), `Phase 8 translations must include ${label}.`);
}
assert.match(opportunitiesPage, /getOrCreateCanonicalProfile\(supabase, user\.id\)/, "Opportunities must read the canonical profile before job analysis.");
assert.match(opportunitiesPage, /analyzeJobAgainstCanonicalProfile\(\{ profile: canonicalProfile, job, userId: user\.id \}\)/, "Opportunities must use the shared Job Intelligence matcher.");
assert.match(opportunitiesHub, /JobIntelligencePanel/, "Opportunities UI must display more than a single match percentage.");
assert.match(opportunitiesHub, /User reviews before applying/, "Opportunities UI must keep the user in control.");
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

console.log("PATHZY journey and export standard regression tests passed.");
