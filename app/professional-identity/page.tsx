import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PageHeader, ProgressBar } from "@/components/ui";
import { ProfessionalPhotoAvatar } from "@/components/professional-identity/professional-photo-avatar";
import { ProfileActionEditor, ProfessionalIdentityReviewActions, type ProfessionalIdentityValues, type ProfileActionRow } from "@/components/professional-identity/profile-action-editor";
import { professionalIdentityReviewHref, professionalIdentitySectionHref, resolvePathzyNextRoute } from "@/lib/navigation/auth-routing";
import { getProfessionalIdentityReadModel } from "@/lib/professional-identity/professional-identity-read-service";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { pathzyPhase2T, pathzyT, professionalIdentityImportanceLabel, professionalIdentitySectionText, professionalIdentityStepText } from "@/lib/language/pathzy-i18n";
import { appRoutes, routeBuilders, type ProfessionalIdentityOnboardingStage } from "@/lib/navigation/routes";
import { createCurrentProfessionalPhotoView } from "@/lib/professional-identity/professional-photo";
import { currentSituationDisplayLabel } from "@/lib/professional-identity/current-situation";
import { experienceEntryDateLabel, selectCanonicalProfessionalIdentityExperiences, type ProfessionalIdentityExperienceEntry } from "@/lib/professional-identity/professional-identity-experience";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type SummaryStatus = "Required" | "Recommended" | "Optional";
const professionalIdentityIntroStages: ProfessionalIdentityOnboardingStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"];

function displayValue(value: unknown) {
  if (Array.isArray(value)) {
    const values = value.map((item) => typeof item === "string" ? item.trim() : JSON.stringify(item)).filter(Boolean);
    return values.length ? values.join(", ") : "";
  }
  return typeof value === "string" ? value.trim() : "";
}

function experienceDisplayTitle(entry: ProfessionalIdentityExperienceEntry) {
  return [entry.role, entry.company].filter(Boolean).join(" - ");
}

function renderReviewValue(section: { editSection: string; value: unknown }, interfaceLanguage: "en" | "fr") {
  if (section.editSection === "experience") {
    const entries = selectCanonicalProfessionalIdentityExperiences(section.value);
    if (!entries.length) return null;
    return (
      <div className="mt-3 grid gap-3">
        {entries.map((entry, index) => {
          const dates = experienceEntryDateLabel(entry);
          return (
            <div key={entry.id || `${entry.role}-${index}`} className="rounded-[18px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B7280]">{interfaceLanguage === "fr" ? "Experience" : "Experience"} {index + 1}</p>
              <p className="mt-2 text-base font-semibold text-[#111827]">{experienceDisplayTitle(entry) || entry.role || entry.company}</p>
              {dates ? <p className="mt-1 text-sm font-semibold text-[#6B7280]">{dates}</p> : null}
              {entry.location ? <p className="mt-1 text-sm text-[#6B7280]">{entry.location}</p> : null}
              {entry.description ? <p className="mt-2 text-sm leading-6 text-[#6B7280]">{entry.description}</p> : null}
              {entry.achievements.length ? (
                <ul className="mt-2 grid gap-1 text-sm leading-6 text-[#6B7280]">
                  {entry.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }
  if (Array.isArray(section.value)) {
    const values = section.value.map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean);
    if (!values.length) return null;
    return (
      <div className="mt-3 grid gap-2">
        {values.map((item, index) => (
          <p key={`${item}-${index}`} className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm leading-6 text-[#6B7280]">{item}</p>
        ))}
      </div>
    );
  }
  const value = displayValue(section.value);
  return value ? <p className="mt-2 text-sm leading-6 text-[#6B7280]">{value}</p> : null;
}

function initialsFor(name: string, email?: string | null) {
  const source = name.trim() || email?.split("@")[0] || "PATHZY";
  return source.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function statusClasses(status: SummaryStatus, hasValue: boolean) {
  if (status === "Required") return hasValue ? "bg-[#ecfdf5] text-[#047857]" : "bg-[#fef2f2] text-[#b91c1c]";
  if (status === "Recommended") return hasValue ? "bg-[rgba(217,58,70,.12)] text-[var(--brand-primary)]" : "bg-[#fffbeb] text-[#92400e]";
  return hasValue ? "bg-[#f3f4f6] text-[#374151]" : "bg-[#f9fafb] text-[#9CA3AF]";
}

export default async function ProfessionalIdentityPage({ searchParams }: { searchParams?: Promise<{ section?: string; review?: string; stage?: string; returnTo?: string; finish?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity");
  const [identityReadModel, { data: uploadedDocuments }] = await Promise.all([
    getProfessionalIdentityReadModel(supabase, user),
    supabase
      .from("user_documents")
      .select("document_title,document_type")
      .eq("user_id", user.id)
      .in("document_type", ["uploaded_document", "old_cv", "supporting_document"])
      .limit(10)
  ]);
  const { profile, discovery, values: professionalIdentityValues, completion: identityCompletion, requiredChecks } = identityReadModel;
  let editorInitialValues = professionalIdentityValues as Partial<ProfessionalIdentityValues>;
  const interfaceLanguage = normalizeLanguageCode(professionalIdentityValues.interface_language ?? profile?.language);
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(interfaceLanguage, key);
  const phase2T = (key: Parameters<typeof pathzyPhase2T>[1]) => pathzyPhase2T(interfaceLanguage, key);
  const sectionName = (key: string, fallback: string) => professionalIdentitySectionText(interfaceLanguage, key, fallback);
  const statusLabel = (status: SummaryStatus) => {
    if (status === "Required") return professionalIdentityImportanceLabel(interfaceLanguage, "required");
    if (status === "Recommended") return professionalIdentityImportanceLabel(interfaceLanguage, "recommended");
    return professionalIdentityImportanceLabel(interfaceLanguage, "optional");
  };
  const profileRows: ProfileActionRow[] = [
    { section: "uploadedDocuments", label: sectionName("uploadedDocuments", "Uploaded documents"), value: uploadedDocuments?.map((document) => document.document_title).join(", ") ?? "", helper: phase2T("identity.ui.openDocuments") }
  ];
  const requiredComplete = requiredChecks.every((item) => item.complete);
  const setupComplete = Boolean(profile?.onboarding_completed);
  const professionalPhotoView = await createCurrentProfessionalPhotoView(supabase, professionalIdentityValues.professional_photo_asset, { userId: user.id, expiresIn: 600 });
  if (professionalPhotoView?.signedUrl) {
    editorInitialValues = {
      ...editorInitialValues,
      professional_photo_asset: professionalPhotoView
    };
  }
  const showReview = !params.section && params.review === "1";
  const reviewSections: Array<{ label: string; status: SummaryStatus; value: unknown; editSection: string }> = [
    { label: sectionName("profile", "Profile"), status: "Required", value: currentSituationDisplayLabel(interfaceLanguage, professionalIdentityValues.current_status) || professionalIdentityValues.current_status || "", editSection: "profile" },
    { label: sectionName("photo", "Photo"), status: "Optional", value: professionalIdentityValues.profilePhoto ?? "", editSection: "photo" },
    { label: sectionName("personal_information", "Personal Information"), status: "Required", value: [professionalIdentityValues.full_name, professionalIdentityValues.email, professionalIdentityValues.phone, professionalIdentityValues.current_status].filter(Boolean).join(" - "), editSection: "personal_information" },
    { label: sectionName("location", "Location"), status: "Required", value: [professionalIdentityValues.city, professionalIdentityValues.country].filter(Boolean).join(", "), editSection: "location" },
    { label: sectionName("nationality", "Nationality"), status: "Required", value: professionalIdentityValues.nationality ?? "", editSection: "nationality" },
    { label: sectionName("work_authorization", "Work Authorization"), status: "Required", value: professionalIdentityValues.work_authorization ?? "", editSection: "work_authorization" },
    { label: sectionName("career_goal", "Career Goal"), status: "Required", value: professionalIdentityValues.career_goal ?? "", editSection: "career_goal" },
    { label: sectionName("professional_summary", "Professional Summary"), status: "Recommended", value: professionalIdentityValues.professional_summary ?? "", editSection: "professional_summary" },
    { label: sectionName("education", "Education"), status: "Required", value: professionalIdentityValues.education ?? [], editSection: "education" },
    { label: sectionName("experience", "Experience"), status: "Recommended", value: professionalIdentityValues.experience ?? [], editSection: "experience" },
    { label: sectionName("skills", "Skills"), status: "Required", value: professionalIdentityValues.skills ?? [], editSection: "skills" },
    { label: sectionName("projects", "Projects"), status: "Recommended", value: professionalIdentityValues.projects ?? [], editSection: "projects" },
    { label: sectionName("achievements", "Achievements"), status: "Recommended", value: professionalIdentityValues.achievements ?? [], editSection: "achievements" },
    { label: sectionName("certificates", "Certificates"), status: "Recommended", value: professionalIdentityValues.certificates ?? [], editSection: "certificates" },
    { label: sectionName("licences", "Licences"), status: "Optional", value: professionalIdentityValues.licences ?? [], editSection: "licences" },
    { label: sectionName("languages", "Languages"), status: "Recommended", value: professionalIdentityValues.languages ?? [], editSection: "languages" },
    { label: sectionName("references", "References"), status: "Optional", value: professionalIdentityValues.references ?? [], editSection: "references" },
    { label: sectionName("portfolio", "Portfolio"), status: "Recommended", value: [professionalIdentityValues.portfolio_url, professionalIdentityValues.github_url, professionalIdentityValues.website_url, professionalIdentityValues.behance_url].filter(Boolean).join(" - "), editSection: "portfolio" },
    { label: sectionName("social_profiles", "Social Profiles"), status: "Recommended", value: professionalIdentityValues.linkedin_url ?? "", editSection: "social_profiles" },
    { label: sectionName("preferences", "Preferences"), status: "Required", value: [professionalIdentityValues.interface_language, professionalIdentityValues.professional_document_language].filter(Boolean).join(", "), editSection: "preferences" },
    { label: sectionName("employment_preferences", "Employment Preferences"), status: "Required", value: [professionalIdentityValues.employment_type, professionalIdentityValues.work_type, ...(professionalIdentityValues.preferred_roles ?? []), ...(professionalIdentityValues.industries ?? [])].filter(Boolean).join(", "), editSection: "employment_preferences" },
    { label: sectionName("salary_expectations", "Salary Expectations"), status: "Optional", value: professionalIdentityValues.salary_expectations ?? "", editSection: "salary_expectations" },
    { label: sectionName("availability", "Availability"), status: "Required", value: professionalIdentityValues.availability ?? "", editSection: "availability" }
  ];
  const rawCompletionPercent = identityCompletion.percentage;
  const recommendedMissing = reviewSections.filter((section) => section.status === "Recommended" && !displayValue(section.value)).length;
  const optionalMissing = reviewSections.filter((section) => section.status === "Optional" && !displayValue(section.value)).length;
  const firstMissingCheck = requiredChecks.find((item) => !item.complete);
  const firstMissingLabel = firstMissingCheck ? sectionName(firstMissingCheck.section, firstMissingCheck.label) : phase2T("identity.review.highlightedSection");
  const missingRequiredChecks = requiredChecks.filter((item) => !item.complete);
  const lastUpdated = profile?.updated_at ? new Intl.DateTimeFormat(interfaceLanguage === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(profile.updated_at)) : phase2T("identity.review.notAvailable");
  const reviewHref = professionalIdentityReviewHref();
  const resumeHref = firstMissingCheck ? professionalIdentitySectionHref(firstMissingCheck.section) : reviewHref;
  const routeDecision = resolvePathzyNextRoute({
    authenticated: true,
    profile,
    discovery,
    user
  });
  const stageForState: Partial<Record<typeof routeDecision.currentState, ProfessionalIdentityOnboardingStage>> = {
    welcome_pending: "welcome",
    interface_language_pending: "interfaceLanguage",
    authenticated_language_pending: "interfaceLanguage",
    document_language_pending: "documentLanguage",
    coach_intro_pending: "careerCoach",
    professional_identity_intro_pending: "professionalIdentityIntroduction"
  };
  const identityProgressStarted = Boolean(
    setupComplete ||
      routeDecision.currentState === "identity_in_progress" ||
      routeDecision.currentState === "identity_review_pending" ||
      routeDecision.currentState === "identity_finish_pending" ||
      routeDecision.currentState === "diagnosis_pending" ||
      routeDecision.currentState === "diagnosis_complete" ||
      routeDecision.currentState === "home_ready"
  );
  const completionPercent = identityProgressStarted ? rawCompletionPercent : 0;
  const sectionStatus = (section: (typeof reviewSections)[number]) => {
    const value = displayValue(section.value);
    if (section.status === "Optional" && !value) return t("identity.status.optional");
    if (section.status === "Required" && !value) return phase2T("identity.review.missingRequiredInformation");
    if (!value) return t("identity.status.needsAttention");
    return t("identity.status.completed");
  };
  const requestedStage = professionalIdentityIntroStages.includes(params.stage as ProfessionalIdentityOnboardingStage) ? params.stage as ProfessionalIdentityOnboardingStage : null;
  const resolvedStage = requestedStage ?? stageForState[routeDecision.currentState] ?? null;
  const resolvedSection = params.section ?? (routeDecision.currentState === "identity_in_progress" ? routeDecision.resumeSection : undefined);
  const showEditor = Boolean(resolvedSection || resolvedStage);
  const showFocusedSetup = Boolean(resolvedStage);
  const requestedStageDestination = requestedStage ? routeBuilders.professionalIdentityOnboardingStage(requestedStage) : "";
  const requestedFinishDestination = params.finish === "1" ? routeBuilders.professionalIdentityFinish() : "";
  const setupRouteStates = new Set([
    "welcome_pending",
    "interface_language_pending",
    "document_language_pending",
    "coach_intro_pending",
    "professional_identity_intro_pending",
    "identity_not_started",
    "identity_in_progress",
    "identity_review_pending",
    "identity_finish_pending",
    "diagnosis_pending",
    "diagnosis_complete",
    "home_ready"
  ]);
  if (setupComplete && requestedStage) {
    redirect(appRoutes.professionalIdentity);
  }
  if (!params.section && params.review !== "1" && setupRouteStates.has(routeDecision.currentState)) {
    const currentDestination = requestedStageDestination || requestedFinishDestination || appRoutes.professionalIdentity;
    if (routeDecision.destination !== currentDestination) {
      redirect(routeDecision.destination);
    }
  }

  return (
    <div className="container page-pad">
      {!showFocusedSetup ? (
        <PageHeader eyebrow={t("identity.page.eyebrow")} title={showReview ? t("identity.page.reviewTitle") : showEditor ? t("identity.page.title") : phase2T("identity.overview.title")}>
          {showReview
            ? t("identity.page.reviewBody")
            : showEditor
              ? t("identity.page.body")
              : phase2T("identity.overview.body")}
        </PageHeader>
      ) : null}

      {showReview ? (
        <div className="grid gap-6">
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <ProfessionalPhotoAvatar
                  photo={professionalPhotoView}
                  alt={sectionName("photo", "Photo")}
                  fallback={initialsFor(profile?.full_name ?? "", user.email)}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-[rgba(217,58,70,.12)] text-xl font-semibold text-[var(--brand-primary)]"
                  fallbackClassName="grid h-full w-full place-items-center"
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{requiredComplete ? phase2T("identity.review.requiredComplete") : phase2T("identity.review.requiredNeedsAttention")}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[#111827]">{profile?.full_name || phase2T("identity.review.defaultName")}</h2>
                  <p className="mt-2 text-[#6B7280]">{[profile?.career_goal ?? profile?.preferred_path, profile?.city, profile?.country].filter(Boolean).join(" - ") || phase2T("identity.review.defaultBody")}</p>
                </div>
              </div>
              <div className="w-full max-w-xs">
                <div className="mb-2 flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>{phase2T("home.identityLabel")}</span>
                  <span>{completionPercent}% {phase2T("identity.review.complete")}</span>
                </div>
                <ProgressBar value={completionPercent} />
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.required")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{requiredChecks.filter((item) => item.complete).length}/{requiredChecks.length}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.recommendedMissing")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{recommendedMissing}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.optionalMissing")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{optionalMissing}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.lastUpdated")}</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">{lastUpdated}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="grid gap-4">
              {reviewSections.map((section) => {
                const value = displayValue(section.value);
                return (
                  <div id={`identity-review-${section.editSection}`} key={section.label} className="scroll-mt-28 flex flex-col gap-3 rounded-[22px] border border-[#e5e7eb] bg-white p-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#111827]">{section.label}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(section.status, Boolean(value))}`}>
                          {value ? statusLabel(section.status) : `${statusLabel(section.status)} ${phase2T("identity.review.missing")}`}
                        </span>
                      </div>
                      {value ? renderReviewValue(section, interfaceLanguage) : <p className="mt-2 text-sm leading-6 text-[#6B7280]">{section.status === "Required" ? phase2T("identity.review.addRequired") : phase2T("identity.review.improveLater")}</p>}
                    </div>
                    <Link href={professionalIdentitySectionHref(section.editSection as never, "review")} aria-label={`${phase2T("identity.review.editSection")}: ${section.label}`} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-bold text-[#374151] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                      {phase2T("identity.review.editSection")}
                    </Link>
                  </div>
                );
              })}
            </div>
            {!requiredComplete ? (
              <div className="mt-6 rounded-[22px] border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold leading-6 text-[#991b1b]">
                <p>{phase2T("identity.review.missingRequiredInformation")}: {firstMissingLabel}.</p>
                <div className="mt-3 grid gap-2">
                  {missingRequiredChecks.map((item) => (
                    <Link key={item.section} href={professionalIdentitySectionHref(item.section, "review")} className="inline-flex min-h-11 items-center justify-between gap-3 rounded-full border border-[#fecaca] bg-white px-4 py-2 text-sm font-bold text-[#991b1b]">
                      <span>{sectionName(item.section, item.label)} - {professionalIdentityStepText(interfaceLanguage, item.section, "guidance", item.guidance)}</span>
                      <span>{phase2T("identity.review.completeSection")}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 rounded-[22px] border border-[rgba(217,58,70,.22)] bg-[rgba(217,58,70,.1)] p-4 text-sm leading-6 text-[#7f1d1d]">
              <p className="font-bold">{phase2T("identity.sync.changed")}</p>
              <p>{phase2T("identity.sync.mayNeedUpdates")}</p>
              <p className="mt-2 font-semibold">{phase2T("identity.sync.dependents")}</p>
            </div>
            <ProfessionalIdentityReviewActions editHref={professionalIdentitySectionHref(firstMissingCheck?.section ?? "personal_information", "review")} requiredComplete={requiredComplete} setupComplete={setupComplete} />
          </Card>
        </div>
      ) : showEditor ? (
        <>
          {!showFocusedSetup ? (
            <div className="mb-6 grid gap-5 lg:grid-cols-[.72fr_1fr]">
              <Card>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{phase2T("identity.review.progressTitle")}</p>
                <strong className="mt-3 block text-6xl font-semibold text-[#111827]">{completionPercent}<span className="text-xl text-[#9CA3AF]">%</span></strong>
                <p className="mt-3 text-lg font-semibold text-[#6B7280]">{requiredComplete ? phase2T("identity.ui.reviewBeforeHome") : phase2T("identity.review.keepGoing")}</p>
                <div className="mt-5"><ProgressBar value={completionPercent} /></div>
              </Card>
              <Card>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{phase2T("identity.review.why")}</p>
                <p className="mt-3 text-2xl font-semibold leading-9 text-[#111827]">{phase2T("identity.review.whyTitle")}</p>
                <p className="mt-3 leading-7 text-[#6B7280]">{phase2T("identity.review.whyBody")}</p>
              </Card>
            </div>
          ) : null}

          {showFocusedSetup ? (
            <ProfileActionEditor
              rows={profileRows}
              initialSection={resolvedSection}
              initialIntroStage={resolvedStage ?? undefined}
              initialValues={editorInitialValues}
              returnTo={params.returnTo}
            />
          ) : (
            <Card>
              <ProfileActionEditor
                rows={profileRows}
                initialSection={resolvedSection}
                initialIntroStage={resolvedStage ?? undefined}
                initialValues={editorInitialValues}
                returnTo={params.returnTo}
              />
            </Card>
          )}
        </>
      ) : (
        <div className="grid gap-6">
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <ProfessionalPhotoAvatar
                  photo={professionalPhotoView}
                  alt={sectionName("photo", "Photo")}
                  fallback={initialsFor(profile?.full_name ?? "", user.email)}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-[rgba(217,58,70,.12)] text-xl font-semibold text-[var(--brand-primary)]"
                  fallbackClassName="grid h-full w-full place-items-center"
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{setupComplete ? phase2T("identity.overview.setupComplete") : phase2T("identity.overview.setupInProgress")}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[#111827]">{profile?.full_name || phase2T("identity.review.defaultName")}</h2>
                  <p className="mt-2 text-[#6B7280]">{[profile?.career_goal ?? profile?.preferred_path, profile?.city, profile?.country].filter(Boolean).join(" - ") || phase2T("identity.review.defaultBody")}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={reviewHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--brand-primary-hover)]">
                  {t("onboarding.review")}
                </Link>
                {!requiredComplete ? (
                  <Link href={resumeHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                    {phase2T("identity.overview.resumeSetup")}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.required")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{requiredChecks.filter((item) => item.complete).length}/{requiredChecks.length}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.lastUpdated")}</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">{lastUpdated}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.syncStatus")}</p>
                <p className="mt-2 text-base font-semibold text-[#111827]">{phase2T("identity.review.upToDate")}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">{phase2T("identity.review.complete")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{completionPercent}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">{phase2T("identity.overview.sectionsTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{phase2T("identity.overview.sectionsBody")}</p>
              </div>
              <Link href={reviewHref} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-5 py-2 text-sm font-bold text-[#374151] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                {t("onboarding.review")}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {reviewSections.map((section, index) => {
                const value = displayValue(section.value);
                return (
                  <div key={section.label} className="rounded-[20px] border border-[#e5e7eb] bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#111827]">{index + 1}. {section.label}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(section.status, Boolean(value))}`}>{sectionStatus(section)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6B7280]">{value || (section.status === "Required" ? phase2T("identity.review.addRequired") : phase2T("identity.review.improveLater"))}</p>
                    <Link href={professionalIdentitySectionHref(section.editSection as never)} aria-label={`${phase2T("identity.review.editSection")}: ${section.label}`} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-bold text-[#374151] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]">
                      {phase2T("identity.review.editSection")}
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
