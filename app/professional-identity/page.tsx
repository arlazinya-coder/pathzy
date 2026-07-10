import { ProfileActionEditor, type ProfileActionRow } from "@/components/professional-identity/profile-action-editor";
import { ButtonLink, Card, PageHeader, ProgressBar } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const tools = [
  {
    title: "My Documents",
    href: "/professional-identity/documents",
    button: "Open Documents",
    statusKey: null,
    readiness: 100,
    action: "View, edit, copy, download, rename, duplicate, and delete saved drafts."
  },
  {
    title: "CV",
    href: "/professional-identity/cv",
    button: "Create My CV",
    statusKey: "cv_status",
    readiness: 25,
    action: "Create an honest CV from your PATHZY profile."
  },
  {
    title: "Cover Letter",
    href: "/professional-identity/cover-letter",
    button: "Create My Cover Letter",
    statusKey: "cover_letter_status",
    readiness: 15,
    action: "Prepare a reusable cover letter draft."
  },
  {
    title: "LinkedIn Profile",
    href: "/professional-identity/linkedin",
    button: "Improve My LinkedIn",
    statusKey: "linkedin_status",
    readiness: 20,
    action: "Strengthen your headline, About section, and skills."
  },
  {
    title: "Recruiter Message",
    href: "/professional-identity/recruiter-message",
    button: "Create Recruiter Message",
    statusKey: null,
    readiness: 10,
    action: "Write a short, human outreach message."
  },
  {
    title: "Follow-up Email",
    href: "/professional-identity/follow-up",
    button: "Create Follow-up Email",
    statusKey: null,
    readiness: 10,
    action: "Follow up professionally after applying."
  },
  {
    title: "Career Passport",
    href: "/professional-identity/career-passport",
    button: "Create Career Passport",
    statusKey: "career_passport_status",
    readiness: 20,
    action: "Summarize your career goal, skills, strengths, and next action."
  },
  {
    title: "Supporting Documents",
    href: "/professional-identity/documents",
    button: "Open Documents",
    statusKey: null,
    readiness: 10,
    action: "Keep certificates, diplomas, references, and portfolio proof close to your applications."
  },
  {
    title: "Certificates",
    href: "/professional-identity/documents",
    button: "Add Certificates",
    statusKey: null,
    readiness: 10,
    action: "Organize certificates that support the roles you want."
  },
  {
    title: "Diplomas",
    href: "/professional-identity/documents",
    button: "Add Diplomas",
    statusKey: null,
    readiness: 10,
    action: "Store education documents employers may ask for."
  },
  {
    title: "References",
    href: "/professional-identity/documents",
    button: "Add References",
    statusKey: null,
    readiness: 10,
    action: "Prepare people and details you can use as references."
  },
  {
    title: "Portfolio",
    href: "/professional-identity/documents",
    button: "Add Portfolio",
    statusKey: null,
    readiness: 10,
    action: "Collect proof of work, projects, writing, designs, or case studies."
  },
  {
    title: "Job Readiness",
    href: "/skills",
    button: "View Growth",
    statusKey: null,
    readiness: 15,
    action: "Review the skills and habits that improve your employment chances."
  }
] as const;

function labelStatus(status?: string | null) {
  return (status ?? "not_started").replace(/_/g, " ");
}

export default async function ProfessionalIdentityPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity");
  const [context, { data: profile }, { data: discovery }, { data: uploadedDocuments }] = await Promise.all([
    getProfessionalIdentityContext(supabase, user.id),
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,education,field_of_study,current_status,career_goal,linkedin_url,portfolio_url,language,has_certificates")
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
  const identity = context?.identity;
  const score = context?.score;
  const answers = (discovery?.answers ?? {}) as Record<string, unknown>;
  const skillText = Array.isArray(answers.skills) ? answers.skills.join(", ") : typeof answers.skills === "string" ? answers.skills : "";
  const profileRows: ProfileActionRow[] = [
    { label: "Name", value: profile?.full_name ?? "", section: "name", fields: [{ name: "full_name", label: "Full name", value: profile?.full_name ?? "" }] },
    { label: "Email", value: profile?.email ?? user.email ?? "", section: "email", fields: [{ name: "email", label: "Email", value: profile?.email ?? user.email ?? "" }] },
    { label: "Phone", value: profile?.phone ?? "", section: "phone", fields: [{ name: "phone", label: "Phone", value: profile?.phone ?? "" }] },
    {
      label: "City/Country",
      value: [profile?.city, profile?.country].filter(Boolean).join(", "),
      section: "location",
      fields: [
        { name: "city", label: "City", value: profile?.city ?? "" },
        { name: "country", label: "Country", value: profile?.country ?? "" }
      ]
    },
    { label: "Education", value: profile?.education ?? "", section: "education", fields: [{ name: "education", label: "Education", value: profile?.education ?? "" }] },
    { label: "Field of study", value: profile?.field_of_study ?? "", section: "field_of_study", fields: [{ name: "field_of_study", label: "Field of study", value: profile?.field_of_study ?? "" }] },
    { label: "Current status", value: profile?.current_status ?? "", section: "current_status", fields: [{ name: "current_status", label: "Current status", value: profile?.current_status ?? "" }, { name: "employment_status", label: "Employment status", value: profile?.current_status ?? "" }] },
    { label: "Selected career direction", value: profile?.career_goal ?? context?.score.nextRecommendedAction ?? "", section: "career_goal", fields: [{ name: "career_goal", label: "Career goal", value: profile?.career_goal ?? "" }, { name: "preferred_path", label: "Preferred path", value: profile?.career_goal ?? "" }] },
    { label: "Skills", value: skillText, section: "skills", fields: [{ name: "skills", label: "Skills", value: skillText, type: "textarea" }] },
    { label: "Languages", value: profile?.language ?? "", section: "languages", fields: [{ name: "language", label: "Language", value: profile?.language ?? "" }] },
    { label: "Experience", value: typeof answers.personal_background === "string" ? answers.personal_background : "", section: "experience", fields: [{ name: "personal_background", label: "Experience", value: typeof answers.personal_background === "string" ? answers.personal_background : "", type: "textarea" }] },
    { label: "Projects", value: typeof answers.interests === "string" ? answers.interests : "", section: "projects", fields: [{ name: "interests", label: "Projects or interests", value: typeof answers.interests === "string" ? answers.interests : "", type: "textarea" }] },
    { label: "Certifications", value: profile?.has_certificates ? "Certificates available to upload later" : "", section: "certifications", fields: [{ name: "has_certificates", label: "Certificates or qualifications", value: profile?.has_certificates ? "Yes" : "" }] },
    { label: "Achievements", value: typeof answers.achievements === "string" ? answers.achievements : "", section: "achievements", fields: [{ name: "achievements", label: "Achievements", value: typeof answers.achievements === "string" ? answers.achievements : "", type: "textarea" }] },
    { label: "References", value: typeof answers.references === "string" ? answers.references : "", section: "references", fields: [{ name: "references", label: "References", value: typeof answers.references === "string" ? answers.references : "", type: "textarea" }] },
    { label: "Uploaded documents", value: uploadedDocuments?.map((document) => document.document_title).join(", ") ?? "", section: "uploaded_documents", fields: [], href: appRoutes.documents }
  ];
  const missing = profileRows.filter((row) => !row.value.trim()).map((row) => row.label);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Build your professional profile">
        Create the documents and profile you need to apply with confidence.
      </PageHeader>

      <div className="mb-6 grid gap-5 lg:grid-cols-[.72fr_1fr]">
        <Card>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Professional Profile Progress</p>
          <strong className="mt-3 block text-6xl font-black">{score?.totalScore ?? 0}<span className="text-xl text-white/45">/100</span></strong>
          <p className="mt-3 text-xl font-black text-[#9df0c4]">{score?.label ?? "Not Started"}</p>
          <div className="mt-5"><ProgressBar value={score?.totalScore ?? 0} /></div>
        </Card>
        <Card>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Next document step</p>
          <p className="mt-3 text-2xl font-black leading-9">{identity?.next_action ?? "Build your first CV from your PATHZY profile."}</p>
          <p className="mt-3 leading-7 text-white/58">PATHZY improves wording and positioning, but you review every document before using it.</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Review My Information</p>
            <h2 className="mt-3 text-3xl font-black">Check what PATHZY will use in your documents.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/62">Your CV is stronger when your profile, education, skills, projects, and documents are complete. Missing items are shown clearly so PATHZY does not invent facts.</p>
          </div>
        </div>
        <ProfileActionEditor rows={profileRows} />
        {missing.length ? (
          <p className="mt-5 rounded-[18px] border border-[#f8c45d]/25 bg-[#f8c45d]/10 px-4 py-3 text-sm font-bold leading-6 text-[#ffe2a8]">
            Missing important information: {missing.join(", ")}.
          </p>
        ) : null}
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const status = tool.statusKey ? identity?.[tool.statusKey] : context?.latest_recruiter_message && tool.title === "Recruiter Message" ? "draft" : context?.latest_follow_up_email && tool.title === "Follow-up Email" ? "draft" : "not_started";
          const readiness = status && status !== "not_started" ? Math.max(45, tool.readiness * 4) : tool.readiness;

          return (
            <Card key={tool.title}>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-black">{tool.title}</h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold capitalize text-white/58">{labelStatus(status)}</span>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm font-bold text-white/50">
                  <span>Readiness</span>
                  <span>{Math.min(100, readiness)}%</span>
                </div>
                <ProgressBar value={Math.min(100, readiness)} />
              </div>
              <p className="mt-4 min-h-[72px] leading-7 text-white/62">{tool.action}</p>
              <div className="mt-5">
                <ButtonLink href={tool.href}>{tool.button}</ButtonLink>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
