import { ButtonLink, Card } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

const dashboardActions = [
  {
    eyebrow: "WELCOME TO PATHZY",
    title: "Your employment journey, guided step by step",
    question: "",
    body: "PATHZY is your employment support system.\n\nWe guide you step by step - from building your professional profile and CV to preparing for opportunities and moving toward employment.",
    button: "Build My CV",
    href: `${appRoutes.professionalIdentityCv}?intent=build`
  },
  {
    eyebrow: "TODAY'S RECOMMENDATION",
    title: "Build your CV",
    question: "Do you need a new CV?",
    body: "A professional CV is the foundation of every successful job application. PATHZY can help you build yours step by step.",
    button: "Build My CV",
    href: `${appRoutes.professionalIdentityCv}?intent=build`
  },
  {
    eyebrow: "ALREADY HAVE AN OLD CV?",
    title: "Upload and improve your CV",
    question: "",
    body: "Upload your existing PDF or Word CV.\n\nPATHZY will read and organise your information, help you improve it and transform it into a premium PATHZY CV.",
    button: "Upload My Old CV",
    href: `${appRoutes.professionalIdentityCv}?intent=upload`
  },
  {
    eyebrow: "IMPROVE YOUR PATHZY CV",
    title: "Update your information",
    question: "Already created a CV with PATHZY?",
    body: "Add new experience, education, skills, certifications, projects or achievements to keep your CV up to date.",
    button: "Upgrade My CV",
    href: `${appRoutes.professionalIdentityCv}?intent=upgrade`
  }
] as const;

function safeFirstToken(value: unknown) {
  if (typeof value !== "string") return "";
  const clean = value.trim();
  if (!clean || clean.includes("@")) return "";
  return clean.split(/\s+/)[0] ?? "";
}

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const profileResult = user && supabase
    ? await supabase
      .from("user_profiles")
      .select("full_name")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle()
    : { data: null };
  const profileFirstName = safeFirstToken(profileResult.data?.full_name);
  const accountFirstName =
    safeFirstToken(user?.user_metadata?.display_name) ||
    safeFirstToken(user?.user_metadata?.full_name) ||
    safeFirstToken(user?.user_metadata?.name);
  const firstName = profileFirstName || accountFirstName || "there";

  return (
    <main className="container page-pad">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(37,70,180,0.18)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#5B8CFF]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-[#9D7CFF]/18 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9db8ff]">Welcome back to PATHZY</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            Welcome, {firstName}
          </h1>
          <p className="mt-4 text-xl font-extrabold text-[#dfe8ff]">Let's take the next step toward your employment goals.</p>
          <p className="mt-4 text-base leading-7 text-white/68 sm:text-lg">
            Start with your CV, and PATHZY will guide you through the process.
          </p>
        </div>
      </section>

      <section aria-labelledby="cv-actions-heading" className="mt-6">
        <h2 id="cv-actions-heading" className="sr-only">Choose how to work on your CV</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {dashboardActions.map((action) => (
            <Card
              key={action.button}
              className="bg-white/6"
            >
              <div className="flex h-full flex-col">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c7d6ff]">{action.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">{action.title}</h3>
                {action.question ? <p className="mt-3 text-base font-extrabold text-white/82">{action.question}</p> : null}
                <div className="mt-3 space-y-3 text-sm leading-6 text-white/66 sm:text-base">
                  {action.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-6 pt-1 sm:mt-auto sm:pt-6">
                  <ButtonLink href={action.href}>{action.button}</ButtonLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
