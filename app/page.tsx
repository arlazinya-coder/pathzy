import { Badge, ButtonLink, Card } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { getCurrentUser } from "@/lib/supabase/server";

const simpleBenefits = [
  ["Career plan", "Understand your direction and what to do next."],
  ["Professional documents", "Build your CV, cover letter, LinkedIn profile, and Career Passport."],
  ["Applications", "Find opportunities, apply, and track your progress."],
  ["Interview preparation", "Practice how to explain your story with confidence."]
] as const;

export default async function LandingPage() {
  const user = await getCurrentUser();
  const startHref = user ? "/dashboard" : "/signup";

  return (
    <div className="page-pad">
      <section className="container grid min-h-[calc(100vh-10rem)] place-items-center py-12 text-center">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <Badge>The Employment Support System</Badge>
            <h1 className="mt-7 text-6xl font-black leading-none tracking-normal md:text-8xl">
              <span className="gradient-text">PATHZY</span>
            </h1>
            <p className="mt-5 text-2xl font-black leading-tight text-white md:text-4xl">The Employment Support System</p>
            <p className="mt-3 text-xl font-bold text-white/68">From Potential to Employment.</p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/62 md:text-lg">
              PATHZY helps you build your career plan, professional documents, applications, and interview preparation step by step.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={startHref}>Start Free</ButtonLink>
              <ButtonLink href="/login" variant="secondary">Login</ButtonLink>
            </div>
            <p className="mt-4 text-sm font-bold text-white/48">No credit card required.</p>
          </div>
        </Reveal>
      </section>

      <section className="container grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {simpleBenefits.map(([title, body], index) => (
          <Reveal key={title} delay={0.04 * index}>
            <Card>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-white/58">{body}</p>
            </Card>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
