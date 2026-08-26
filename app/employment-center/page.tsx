import Link from "next/link";
import { appRoutes } from "@/lib/navigation/routes";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const employmentCenterTools = [
  {
    label: "My Professional Profile",
    description: "Review the identity PATHZY uses to guide every document and job action.",
    href: appRoutes.professionalIdentity
  },
  {
    label: "CV Builder",
    description: "Create, import, review, and improve your recruiter-ready CV.",
    href: appRoutes.professionalIdentityCv
  },
  {
    label: "Cover Letter",
    description: "Prepare a focused cover letter from your profile, CV, and job details.",
    href: appRoutes.professionalIdentityCoverLetter
  },
  {
    label: "LinkedIn",
    description: "Shape your headline, About section, experience, skills, and keywords.",
    href: appRoutes.professionalIdentityLinkedin
  },
  {
    label: "My Documents",
    description: "Access saved CVs, cover letters, LinkedIn drafts, uploads, and supporting files.",
    href: appRoutes.documents
  },
  {
    label: "Career Passport",
    description: "Prepare a broader employment-ready profile summary when needed.",
    href: appRoutes.professionalIdentityCareerPassport
  }
] as const;

export default async function EmploymentCenterPage() {
  await requireAuthenticatedUser(appRoutes.employmentCenter);

  return (
    <main className="container page-pad">
      <section className="rounded-[34px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Employment Center</p>
        <div className="mt-4 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#111827] md:text-5xl">Build the materials employers will see.</h1>
          <p className="mt-4 text-base leading-7 text-[#6B7280]">
            Create and manage your professional profile, CV, cover letter, LinkedIn content, and supporting documents from one place.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Employment Center tools">
        {employmentCenterTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[28px] border border-[#e5e7eb] bg-white p-6 shadow-[0_14px_42px_rgba(17,24,39,.06)] transition hover:-translate-y-0.5 hover:border-[rgba(217,58,70,.32)] hover:shadow-[0_18px_55px_rgba(217,58,70,.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          >
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#111827]">{tool.label}</h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">{tool.description}</p>
            <span className="mt-5 inline-flex rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white transition group-hover:bg-[var(--brand-primary-hover)]">
              Open
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
