"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageContext: Array<[string, string]> = [
  ["/professional-identity/cv", "CV page - help with CV"],
  ["/professional-identity/cover-letter", "Cover letter page - help with applications"],
  ["/professional-identity/linkedin", "LinkedIn page - help with profile wording"],
  ["/professional-identity/career-passport", "Career Passport page - explain professional profile"],
  ["/professional-identity/documents", "Professional Profile documents - help organize documents"],
  ["/professional-identity", "Professional Profile - help choose the next document"],
  ["/roadmap", "Career Plan page - explain next step"],
  ["/opportunities", "Opportunities page - compare jobs and programs"],
  ["/employment-tracker", "Applications page - follow-up and interview help"],
  ["/progress", "Skills page - explain skill gaps"],
  ["/dashboard", "My Employment Journey - suggest the next action"]
];

function contextForPath(pathname: string) {
  return pageContext.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "PATHZY app - general employment support";
}

export function FloatingMentorButton() {
  const pathname = usePathname();
  const context = contextForPath(pathname ?? "");

  return (
    <Link
      href={`/mentor?context=${encodeURIComponent(context)}`}
      className="fixed bottom-5 right-5 z-50 inline-flex min-h-14 items-center justify-center rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_48px_rgba(91,140,255,.38)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8fb0ff]"
    >
      Your Mentor
    </Link>
  );
}
