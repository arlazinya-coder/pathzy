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
assert.match(professionalCvPage, /requireAuthenticatedUser\("\/professional-identity\/cv"\)/, "All users must reach the same canonical CV Builder route.");
assert.match(professionalCoverLetterPage, /requireAuthenticatedUser\("\/professional-identity\/cover-letter"\)/, "All users must reach the same canonical Cover Letter route.");
assert.match(professionalCvPage, /locked=\{!unlocked\}[\s\S]*exportLocked=\{!canExport\}/, "CV Builder must allow creation/editing while locking only export actions for free users.");
assert.match(professionalCoverLetterPage, /locked=\{!unlocked\}[\s\S]*exportLocked=\{!canExport\}/, "Cover Letter Builder must allow creation/editing while locking only export actions for free users.");
assert.match(professionalIdentityPage, /button: "My CV"/, "Professional Profile must label the existing CV workspace as My CV.");
assert.match(professionalCvPage, /title="My CV"/, "CV workspace page header must use the My CV label.");
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
assert.doesNotMatch(professionalIdentityTool, /previewZoom|setPreviewZoom|Fit width|75%|100%|125%/, "CV builder must not show manual zoom controls in the stabilized layout.");
assert.doesNotMatch(professionalIdentityTool, /max-h-\[calc\(100vh-.*overflow-auto/, "CV builder must not use nested scroll containers for editor or preview.");
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
const cvGalleryIndex = professionalIdentityTool.indexOf("Template gallery");
const cvEditorIndex = professionalIdentityTool.indexOf("Structured editor");
const cvPreviewIndex = professionalIdentityTool.indexOf("Live preview engine");
const cvNextActionIndex = professionalIdentityTool.indexOf("Your CV is ready. What would you like to do next?");
assert.equal(professionalIdentityTool.indexOf("CV generated"), -1, "CV Builder must not render the old generated/version management card.");
assert.doesNotMatch(professionalIdentityTool, /CV version name|Content source: one CV model\.|When I save content edits, also update linked CV versions|Duplicate CV/, "CV Builder must keep technical version controls out of the visible workspace.");
assert.match(professionalIdentityTool, /Live preview engine[\s\S]*Regenerate[\s\S]*Upload CV[\s\S]*Download PDF[\s\S]*Designed Preview[\s\S]*ATS Preview/, "Live Preview Engine must contain CV management and preview/output actions.");
assert.ok(cvEditorIndex > -1 && cvPreviewIndex > cvEditorIndex && cvGalleryIndex > cvPreviewIndex && cvNextActionIndex > cvGalleryIndex, "CV page flow must be editor, live preview workspace, template gallery, then next-action area.");
assert.equal((professionalIdentityTool.match(/Template gallery/g) ?? []).length, 1, "CV Builder must render one Template Gallery instance.");
assert.equal((professionalIdentityTool.match(/Structured editor/g) ?? []).length, 1, "CV Builder must render one Structured Editor instance.");
assert.equal((professionalIdentityTool.match(/Live preview engine/g) ?? []).length, 1, "CV Builder must render one Live Preview instance.");
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
assert.match(professionalIdentityTool, /tool === "cv" \? "grid gap-5 lg:grid-cols-4"/, "CV workspace must use the normal app grid layout.");
assert.match(professionalIdentityTool, /<Card className=\{tool === "cv" \? "lg:col-span-1"/, "CV editor must stay in the normal left editing zone.");
assert.match(professionalIdentityTool, /<Card className="lg:col-span-3">/, "CV A4 preview must stay in the normal layout beside the editing zone.");
assert.doesNotMatch(professionalIdentityTool, /cvStudioMode|setCvStudioMode|xl:sticky|xl:max-h-\[calc\(100vh-112px\)\]|xl:overflow-y-auto/, "CV editor must not use the rejected complex sticky or independent-scroll studio architecture.");
assert.doesNotMatch(professionalIdentityTool, /absolute|fixed|z-\[|z-[1-9]/, "CV preview/gallery repair must not use positioning or z-index hacks.");
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
assert.match(documentDownloads, /export type CoverLetterData = \{[\s\S]*fullName: string;[\s\S]*companyName: string;[\s\S]*bodyParagraphs: string\[\];[\s\S]*designSystem: CvTemplateName;[\s\S]*\};/, "Cover Letter foundation must define one structured coverLetterData source of truth.");
assert.match(documentDownloads, /export function serializeCoverLetterData/, "Cover Letter content text must serialize from coverLetterData.");
assert.match(documentDownloads, /export function renderCoverLetterHtmlFromData/, "Cover Letter preview must render from coverLetterData.");
assert.match(documentDownloads, /export function simpleCoverLetterPdfDocument[\s\S]*pdfFromLayout\(buildCoverLetterLayoutFromData\(data\)\)/, "Cover Letter PDF must export from the same coverLetterData renderer.");
assert.match(documentDownloads, /export function coverLetterPdfFilename/, "Cover Letter PDF export must use a dedicated clean filename helper.");
assert.match(documentDownloads, /PATHZY_Cover_Letter_\$\{company\}_\$\{jobTitle\}_\$\{stamp\}\.pdf/, "Cover Letter filename must include company, job title, and date.");
assert.match(documentDownloads, /function resolveCoverLetterDesign/, "Cover Letter renderer must have design-system-specific layout tokens.");
assert.match(documentDownloads, /headerStyle: "minimal"/, "ATS cover letter must use a minimal recruiter-friendly header style.");
assert.match(documentDownloads, /headerStyle: "accented"/, "Professional cover letter must use an accented business header style.");
assert.match(documentDownloads, /headerStyle: "executive"/, "Executive cover letter must use an executive letterhead style.");
assert.match(documentDownloads, /const coverDesign = resolveCoverLetterDesign\(cover\.designSystem\)/, "Cover Letter layout must resolve the selected design system.");
assert.match(documentDownloads, /coverDesign\.paragraphSpacing/, "Cover Letter design systems must change section rhythm, not just color.");
assert.match(documentDownloads, /coverDesign\.nameSize/, "Cover Letter design systems must change typography, not just color.");
assert.match(documentDownloads, /coverDesign\.headerStyle === "executive"[\s\S]*premiumTemplate\.amber/, "Executive cover letter must include a distinct premium accent treatment.");
assert.match(professionalIdentityService, /const coverLetterData: CoverLetterData = \{[\s\S]*companyName: company,[\s\S]*jobTitle: role,[\s\S]*designSystem: templateName[\s\S]*\};/, "Cover Letter generation must create structured coverLetterData.");
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
assert.match(professionalIdentityTool, /previewCoverLetterData/, "Cover Letter preview must use a stable debounced preview data state.");
assert.match(professionalIdentityTool, /setTimeout\(\(\) => \{\s*setPreviewCoverLetterData\(coverLetterData\);\s*\}, 260\);/, "Cover Letter live preview must debounce updates to avoid shaking while typing.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? "grid gap-5 lg:grid-cols-2"/, "Cover Letter workspace must split editor and preview into two columns on desktop.");
assert.match(professionalIdentityTool, /tool === "cover-letter" \? "lg:col-span-2"/, "Cover Letter generator card must sit above the editor and preview columns.");
assert.match(professionalIdentityTool, /renderCoverLetterEditor\(\)[\s\S]*tool === "cover-letter" \? \([\s\S]*Live preview[\s\S]*renderCoverLetterHtmlFromData\(previewCoverLetterData\)/, "Cover Letter editor and live A4 preview must render at the same time.");
for (const sectionName of ["1. Personal Header", "2. Employer Details", "3. Greeting", "4. Opening Paragraph", "5. Body Paragraphs", "6. Closing Paragraph", "7. Signature"]) {
  assert.match(professionalIdentityTool, new RegExp(sectionName.replace(/[.]/g, "\\.")), `Cover Letter editor must include ${sectionName}.`);
}
assert.match(professionalIdentityTool, /Add paragraph/, "Cover Letter body paragraphs must support adding a paragraph.");
assert.match(professionalIdentityTool, /draft\.bodyParagraphs = next;/, "Cover Letter body paragraphs must support editing and ordering through coverLetterData.");

console.log("PATHZY journey and export standard regression tests passed.");
