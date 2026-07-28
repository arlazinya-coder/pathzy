import Link from "next/link";
import { Card, PageHeader, ProgressBar } from "@/components/ui";
import { ProfileActionEditor, ProfessionalIdentityReviewActions, type ProfessionalIdentityValues, type ProfileActionRow } from "@/components/professional-identity/profile-action-editor";
import { professionalIdentityRequiredChecks, professionalIdentitySectionHref } from "@/lib/navigation/auth-routing";
import { getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { normalizeLanguageCode, normalizeProfessionalDocumentLanguageChoice } from "@/lib/language/language-preferences";
import { pathzyPhase2T, pathzyT, professionalIdentityImportanceLabel, professionalIdentitySectionTranslations } from "@/lib/language/pathzy-i18n";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type SummaryStatus = "Required" | "Recommended" | "Optional";

function listFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function textFrom(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean).join(", ");
  return "";
}

function firstAvailableList(...values: unknown[]) {
  for (const value of values) {
    const list = listFrom(value);
    if (list.length) return list;
  }
  return [];
}

function displayValue(value: string | string[]) {
  const values = Array.isArray(value) ? value.map((item) => item.trim()).filter(Boolean) : [value.trim()].filter(Boolean);
  return values.length ? values.join(", ") : "";
}

function initialsFor(name: string, email?: string | null) {
  const source = name.trim() || email?.split("@")[0] || "PATHZY";
  return source.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function statusClasses(status: SummaryStatus, hasValue: boolean) {
  if (status === "Required") return hasValue ? "bg-[#ecfdf5] text-[#047857]" : "bg-[#fef2f2] text-[#b91c1c]";
  if (status === "Recommended") return hasValue ? "bg-[#eff6ff] text-[#2563EB]" : "bg-[#fffbeb] text-[#92400e]";
  return hasValue ? "bg-[#f3f4f6] text-[#374151]" : "bg-[#f9fafb] text-[#9CA3AF]";
}

export default async function ProfessionalIdentityPage({ searchParams }: { searchParams?: Promise<{ section?: string; review?: string; stage?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity");
  const [context, { data: profile }, { data: discovery }, { data: uploadedDocuments }] = await Promise.all([
    getProfessionalIdentityContext(supabase, user.id),
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,education,field_of_study,current_status,career_goal,preferred_path,linkedin_url,portfolio_url,language,has_certificates,onboarding_completed")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("document_title,document_type")
      .eq("user_id", user.id)
      .in("document_type", ["uploaded_document", "old_cv", "supporting_document"])
      .limit(10)
  ]);
  const score = context?.score;
  const answers = (discovery?.answers ?? {}) as Record<string, unknown>;
  const interfaceLanguage = normalizeLanguageCode(profile?.language);
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(interfaceLanguage, key);
  const phase2T = (key: Parameters<typeof pathzyPhase2T>[1]) => pathzyPhase2T(interfaceLanguage, key);
  const sectionName = (key: string, fallback: string) => professionalIdentitySectionTranslations[interfaceLanguage]?.[key] ?? fallback;
  const statusLabel = (status: SummaryStatus) => {
    if (status === "Required") return professionalIdentityImportanceLabel(interfaceLanguage, "required");
    if (status === "Recommended") return professionalIdentityImportanceLabel(interfaceLanguage, "recommended");
    return professionalIdentityImportanceLabel(interfaceLanguage, "optional");
  };
  const professionalIdentityValues: Partial<ProfessionalIdentityValues> = {
    profilePhoto: textFrom(answers.profile_photo),
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? "",
    current_status: profile?.current_status ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
    nationality: textFrom(answers.nationality),
    work_authorization: textFrom(answers.work_authorization),
    career_goal: profile?.career_goal ?? profile?.preferred_path ?? "",
    professional_summary: textFrom(answers.professional_summary),
    education: firstAvailableList(answers.education_history, profile?.education),
    field_of_study: profile?.field_of_study ?? "",
    experience: firstAvailableList(answers.experience_history, answers.personal_background),
    skills: firstAvailableList(answers.skills),
    projects: firstAvailableList(answers.projects_history, answers.interests),
    achievements: firstAvailableList(answers.achievements_list, answers.achievements),
    certificates: firstAvailableList(answers.certificates_list, answers.certifications, profile?.has_certificates ? "Certificates available" : ""),
    licences: firstAvailableList(answers.licences),
    languages: firstAvailableList(answers.languages, profile?.language),
    references: firstAvailableList(answers.references_list, answers.references),
    linkedin_url: profile?.linkedin_url ?? "",
    portfolio_url: profile?.portfolio_url ?? "",
    github_url: textFrom(answers.github_url),
    behance_url: textFrom(answers.behance_url),
    website_url: textFrom(answers.website_url),
    preferred_roles: firstAvailableList(answers.preferred_roles),
    industries: firstAvailableList(answers.industries),
    employment_type: textFrom(answers.employment_type),
    salary_expectations: textFrom(answers.salary_expectations),
    availability: textFrom(answers.availability),
    work_type: textFrom(answers.work_type),
    relocation: textFrom(answers.relocation),
    interface_language: profile?.language ? normalizeLanguageCode(profile.language) : "",
    professional_document_language: textFrom(answers.professional_document_language) ? normalizeProfessionalDocumentLanguageChoice(textFrom(answers.professional_document_language)) : "",
    career_coach_intro_seen: answers.career_coach_intro_seen === true || textFrom(answers.career_coach_intro_seen) === "true" ? "true" : ""
  };
  const profileRows: ProfileActionRow[] = [
    { section: "uploadedDocuments", label: sectionName("uploadedDocuments", "Uploaded documents"), value: uploadedDocuments?.map((document) => document.document_title).join(", ") ?? "", helper: phase2T("identity.ui.openDocuments") }
  ];
  const requiredChecks = professionalIdentityRequiredChecks(profile, discovery, user);
  const requiredComplete = requiredChecks.every((item) => item.complete);
  const showReview = !params.section && (params.review === "1" || (requiredComplete && !profile?.onboarding_completed));
  const completionPercent = Math.max(score?.totalScore ?? 0, Math.round((requiredChecks.filter((item) => item.complete).length / requiredChecks.length) * 72));
  const reviewSections: Array<{ label: string; status: SummaryStatus; value: string | string[]; editSection: string }> = [
    { label: sectionName("profile", "Profile"), status: "Required", value: professionalIdentityValues.current_status ?? "", editSection: "profile" },
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
  const recommendedMissing = reviewSections.filter((section) => section.status === "Recommended" && !displayValue(section.value)).length;
  const optionalMissing = reviewSections.filter((section) => section.status === "Optional" && !displayValue(section.value)).length;
  const firstMissingCheck = requiredChecks.find((item) => !item.complete);
  const firstMissingLabel = firstMissingCheck ? sectionName(firstMissingCheck.section, firstMissingCheck.label) : phase2T("identity.review.highlightedSection");

  return (
    <div className="container page-pad">
      <PageHeader eyebrow={t("identity.page.eyebrow")} title={showReview ? t("identity.page.reviewTitle") : t("identity.page.title")}>
        {showReview
          ? t("identity.page.reviewBody")
          : t("identity.page.body")}
      </PageHeader>

      {showReview ? (
        <div className="grid gap-6">
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#eff6ff] text-xl font-semibold text-[#2563EB]">
                  {initialsFor(profile?.full_name ?? "", user.email)}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2563EB]">{requiredComplete ? phase2T("identity.review.requiredComplete") : phase2T("identity.review.requiredNeedsAttention")}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[#111827]">{profile?.full_name || phase2T("identity.review.defaultName")}</h2>
                  <p className="mt-2 text-[#6B7280]">{[profile?.career_goal ?? profile?.preferred_path, profile?.city, profile?.country].filter(Boolean).join(" - ") || phase2T("identity.review.defaultBody")}</p>
                </div>
              </div>
              <div className="w-full max-w-xs">
                <div className="mb-2 flex justify-between text-sm font-semibold text-[#6B7280]">
                  <span>Professional Identity</span>
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
            </div>
          </Card>

          <Card>
            <div className="grid gap-4">
              {reviewSections.map((section) => {
                const value = displayValue(section.value);
                return (
                  <div key={section.label} className="flex flex-col gap-3 rounded-[22px] border border-[#e5e7eb] bg-white p-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#111827]">{section.label}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses(section.status, Boolean(value))}`}>
                          {value ? statusLabel(section.status) : `${statusLabel(section.status)} ${phase2T("identity.review.missing")}`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#6B7280]">{value || (section.status === "Required" ? phase2T("identity.review.addRequired") : phase2T("identity.review.improveLater"))}</p>
                    </div>
                    <Link href={professionalIdentitySectionHref(section.editSection as never)} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-sm font-bold text-[#374151] transition hover:border-[#2563EB] hover:text-[#2563EB]">
                      {phase2T("identity.review.edit")}
                    </Link>
                  </div>
                );
              })}
            </div>
            {!requiredComplete ? (
              <div className="mt-6 rounded-[22px] border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold leading-6 text-[#991b1b]">
                {phase2T("identity.review.notComplete")} {firstMissingLabel}.
              </div>
            ) : null}
            <ProfessionalIdentityReviewActions editHref={professionalIdentitySectionHref(firstMissingCheck?.section ?? "personal_information")} />
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-5 lg:grid-cols-[.72fr_1fr]">
            <Card>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2563EB]">{phase2T("identity.review.progressTitle")}</p>
              <strong className="mt-3 block text-6xl font-semibold text-[#111827]">{completionPercent}<span className="text-xl text-[#9CA3AF]">%</span></strong>
              <p className="mt-3 text-lg font-semibold text-[#6B7280]">{requiredComplete ? phase2T("identity.ui.reviewBeforeHome") : phase2T("identity.review.keepGoing")}</p>
              <div className="mt-5"><ProgressBar value={completionPercent} /></div>
            </Card>
            <Card>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2563EB]">{phase2T("identity.review.why")}</p>
              <p className="mt-3 text-2xl font-semibold leading-9 text-[#111827]">{phase2T("identity.review.whyTitle")}</p>
              <p className="mt-3 leading-7 text-[#6B7280]">{phase2T("identity.review.whyBody")}</p>
            </Card>
          </div>

          <Card>
            <ProfileActionEditor rows={profileRows} initialSection={params.section} initialIntroStage={params.stage === "welcome" ? "welcome" : undefined} initialValues={professionalIdentityValues} />
          </Card>
        </>
      )}
    </div>
  );
}
