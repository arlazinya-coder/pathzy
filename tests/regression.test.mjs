import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboard = readFileSync("app/dashboard/page.tsx", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");
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
const routes = readFileSync("lib/navigation/routes.ts", "utf8");
const applicationsPage = readFileSync("app/applications/page.tsx", "utf8");
const skillsPage = readFileSync("app/skills/page.tsx", "utf8");
const billingPage = readFileSync("app/billing/page.tsx", "utf8");
const exportStandard = readFileSync("docs/PATHZY_EXPORT_STANDARD.md", "utf8");
const documentDownloads = readFileSync("components/professional-identity/document-downloads.ts", "utf8");
const professionalIdentityTool = readFileSync("components/professional-identity/professional-identity-tool.tsx", "utf8");
const myDocumentsClient = readFileSync("components/professional-identity/my-documents-client.tsx", "utf8");
const cvBuilderPage = readFileSync("app/cv-builder/page.tsx", "utf8");
const professionalIdentityService = readFileSync("lib/professional-identity/professional-identity-service.ts", "utf8");
const coverLetterGeneration = professionalIdentityService.match(/export async function generateCoverLetter[\s\S]*?export async function generateLinkedInProfile/)?.[0] ?? "";

for (const section of ["Navigation", "Hero", "Features", "How PATHZY Works", "Career Journey", "Pricing", "Testimonials", "FAQ", "Footer"]) {
  assert.match(homepage, new RegExp(`data-home-section="${section}"`), `Homepage must include the ${section} landing section.`);
}
assert.match(homepage, /Do not remove landing sections without updating homepage regression test\./, "Homepage must warn maintainers to update the regression test before removing landing sections.");
assert.doesNotMatch(rootLayout, /AppShell/, "Public root layout must not wrap the landing page in the authenticated app shell.");
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

assert.match(dashboard, /const currentStep = getNextMilestone\(progressInputs\);/, "Dashboard journey CTA must use the Progress Engine next milestone.");
assert.match(dashboard, /<ButtonLink href=\{currentStep\.href\}>Continue My Journey<\/ButtonLink>/, "Dashboard must send Continue My Journey to the current Progress Engine step.");
assert.doesNotMatch(progressEngine, /founding-members/, "Progress Engine must never send onboarding missions to the Founder flow.");
assert.doesNotMatch(dashboard, /href="\/founding-members"/, "Dashboard must not link mission CTAs into the Founder flow.");
assert.doesNotMatch(dashboard, /XP Progress|Career DNA|Smart Notifications|Founder Premium|Applications Sent/, "Dashboard must stay simple and avoid old control-center clutter.");
assert.doesNotMatch(dashboard, /PathzyTimeline/, "Dashboard must not repeat the journey with a second timeline block.");
assert.match(dashboard, /Up next/, "Dashboard must show the next journey step without duplicating the current step.");
assert.match(dashboard, /Later/, "Dashboard must show a short later list for orientation.");
assert.match(timeline, /PATHZY Timeline/, "Timeline must use the PATHZY Timeline name.");
assert.doesNotMatch(timeline, /Coming soon/, "Timeline must not label normal journey steps as coming soon.");
assert.match(appShell, /key=\{`\$\{item\.href\}-\$\{item\.label\}`\}/, "Navigation links must use a unique key fallback.");
assert.match(navigation, /label: "My Employment Journey", href: appRoutes\.roadmap/, "My Employment Journey must route to /roadmap.");
assert.match(navigation, /label: "My Professional Profile", href: appRoutes\.professionalIdentity/, "My Professional Profile must route to /professional-identity.");
assert.match(navigation, /label: "Find Opportunities", href: appRoutes\.opportunities/, "Find Opportunities must route to /opportunities.");
assert.match(navigation, /label: "My Applications", href: appRoutes\.applications/, "My Applications must route to /applications.");
assert.match(navigation, /label: "Skills & Career Growth", href: appRoutes\.skills/, "Skills & Career Growth must route to /skills.");
assert.match(navigation, /label: "Billing", href: appRoutes\.billing/, "Billing must route to /billing.");
assert.match(navigation, /label: "Settings", href: appRoutes\.settings/, "Settings must route to /settings.");
assert.match(routes, /applications: "\/applications"/, "The canonical Applications route must exist.");
assert.match(routes, /skills: "\/skills"/, "The canonical Skills route must exist.");
assert.match(routes, /billing: "\/billing"/, "The canonical Billing route must exist.");
assert.match(applicationsPage, /EmploymentTrackerPage/, "The /applications entry point must reuse the existing application tracker implementation.");
assert.match(skillsPage, /ProgressPage/, "The /skills entry point must reuse the existing skills and growth implementation.");
assert.match(billingPage, /PricingPage/, "The /billing entry point must reuse the existing billing/pricing implementation.");
assert.doesNotMatch(navigation, /label: "Profile"/, "Main navigation must not include a duplicate Profile label.");
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
assert.match(professionalIdentityTool, /Design changes only the layout\./, "CV Builder must explain that design changes do not erase content.");
assert.match(myDocumentsClient, /function saveCvVersionPatch/, "My Documents must allow saved CV versions to be renamed or switched to another design.");
assert.match(myDocumentsClient, /cvVersion: \{ \.\.\.version, versionName: title, createdAt: now, updatedAt: now, lastDownloadedAt: null \}/, "Duplicated CV documents must get fresh version metadata.");
assert.match(myDocumentsClient, /renderCvHtmlFromModel\(selectedCvModel, selectedCvVersion\?\.designSystem/, "Saved CV preview must render from the selected version design metadata.");
assert.match(myDocumentsClient, /lastDownloadedAt: downloadedAt/, "Downloaded CV versions must store lastDownloadedAt metadata.");
assert.match(documentDownloads, /return \{ name: cv\.fullName, targetRole: cv\.targetRole, contact: contactLines\(cv\), sections \};/, "CV renderer must map fullName and targetRole to separate output fields.");
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
assert.match(documentDownloads, /for \(const layoutPage of layout\.pages\)/, "PDF export must include every generated page.");
assert.match(documentDownloads, /function roundedRectPath/, "PDF export must render rounded CV cards instead of flattening preview cards into plain rectangles.");
assert.match(documentDownloads, /function circlePath/, "PDF export must render circular markers so the visual language matches preview.");
assert.match(documentDownloads, /simplePdfDocumentFromModel[\s\S]*pdfFromLayout\(buildCvLayoutFromModel\(cv, templateName\)\)/, "PDF export must use the same CV layout renderer as preview.");
assert.match(documentDownloads, /pathzyEliteDesignSystem/, "CV renderer must use the shared PATHZY elite document design system.");
for (const templateName of ["ATS Friendly", "Modern Blue", "Professional Green", "Graduate Fresh", "Executive Premium"]) {
  assert.match(documentDownloads, new RegExp(`"${templateName}"[\\s\\S]*identity:`), `${templateName} must have its own design identity.`);
}
assert.match(documentDownloads, /resolveCvTemplateDesign\(templateName\)/, "Template choice must resolve to a real document design.");
assert.match(documentDownloads, /nameSize[\s\S]*roleSize[\s\S]*sectionTitleSize[\s\S]*bodySize[\s\S]*bodyLineHeight/, "Document design system must define a typography scale.");
assert.match(documentDownloads, /headerHeight[\s\S]*sidebarWidth[\s\S]*columnGap[\s\S]*cardRadius[\s\S]*chipRadius/, "Document design system must define spacing and layout tokens.");
assert.match(professionalIdentityTool, /simplePdfDocumentFromModel\(document\.title, cvModel, templateName\)/, "CV export must use the same structured model as preview.");
assert.match(myDocumentsClient, /simplePdfDocumentFromModel\(selected\.title, selectedCvModel/, "Saved CV PDF export must use the structured CV model.");
assert.doesNotMatch(`${professionalIdentityTool}\n${myDocumentsClient}\n${cvBuilderPage}`, /Download DOCX|downloadDocx|downloadWord|Download Text|text export|download text|download PDF, or download DOCX/i, "Normal user flow must not expose DOCX or text export.");
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
