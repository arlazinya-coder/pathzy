import { Badge, ButtonLink, Card } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { getCurrentUser } from "@/lib/supabase/server";

const features = [
  ["Career Discovery", "Understand your strengths, interests, lifestyle goals, and best next career direction."],
  ["Professional Documents", "Create a recruiter-ready CV, cover letter, LinkedIn profile, and Career Passport."],
  ["Opportunity Support", "Find roles, internships, scholarships, and practical next steps connected to your goal."],
  ["Interview Readiness", "Practice how to explain your story, projects, strengths, and growth areas with confidence."]
] as const;

const steps = [
  ["1", "Discover your path", "Answer simple questions so PATHZY can understand where you are and what you want."],
  ["2", "Build your proof", "Create documents, portfolio signals, skills, and application materials that employers understand."],
  ["3", "Apply with focus", "Track opportunities, prepare interviews, and keep moving toward employment every week."]
] as const;

const journey = [
  "Complete Profile",
  "Career Discovery",
  "Choose Career Goal",
  "Create CV",
  "Create Cover Letter",
  "Find Opportunities",
  "Track Applications",
  "Interview Practice",
  "Employment"
] as const;

const pricing = [
  ["Free", "$0", "Start your employment journey with discovery, previews, and guided next steps."],
  ["Starter", "$9.99/month", "Unlock downloads, saves, and premium professional document actions."],
  ["Pro", "$24.99/month", "Add deeper coaching, application review, and interview preparation."],
  ["Premium", "$49.99/month", "For advanced career growth, executive positioning, and priority support."]
] as const;

const testimonials = [
  ["Arlene", "PATHZY made the next step feel clear instead of overwhelming."],
  ["Junior applicant", "I finally understood what to fix before applying."],
  ["Career changer", "The journey helped me connect my skills to real opportunities."]
] as const;

const faqs = [
  ["Is PATHZY only a CV builder?", "No. PATHZY is an employment support system. Documents are one part of the journey."],
  ["Can I start for free?", "Yes. You can begin with discovery, guidance, previews, and core journey steps."],
  ["What changes with Premium?", "Premium unlocks advanced actions such as exports, unlimited AI support, and premium templates."],
  ["Who is PATHZY for?", "Students, graduates, unemployed job seekers, career changers, and anyone building employability."]
] as const;

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-white/62 md:text-lg">{body}</p>
    </div>
  );
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  const startHref = user ? PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES.SIGNUP;
  const loginHref = user ? PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES.LOGIN;

  return (
    <div className="page-pad">
      {/* Do not remove landing sections without updating homepage regression test. */}
      <nav aria-label="Landing navigation" data-home-section="Navigation" className="container mb-8 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/7 p-3 text-sm font-extrabold text-white/72 backdrop-blur md:flex-row md:items-center md:justify-between">
        <a href="#top" className="rounded-full px-3 py-2 text-white">Home</a>
        <div className="flex flex-wrap gap-2">
          {["Features", "How PATHZY Works", "Career Journey", "Pricing", "Testimonials", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full px-3 py-2 transition hover:bg-white/10">{item}</a>
          ))}
          <a href={startHref} className="rounded-full px-3 py-2 text-white transition hover:bg-white/10">Start Free</a>
          <a href={loginHref} className="rounded-full px-3 py-2 text-white transition hover:bg-white/10">Login</a>
        </div>
      </nav>

      <section id="top" data-home-section="Hero" className="container grid min-h-[calc(100vh-12rem)] place-items-center py-12 text-center">
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <Badge>The AI Employment Support System</Badge>
            <h1 className="mt-7 text-5xl font-black leading-none tracking-normal md:text-8xl">
              <span className="gradient-text">From Potential to Employment.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/66 md:text-xl">
              PATHZY helps people discover direction, build professional documents, find opportunities, prepare for interviews, and move toward employment one step at a time.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={startHref}>Start Free</ButtonLink>
              <ButtonLink href={loginHref} variant="secondary">Login</ButtonLink>
            </div>
            <p className="mt-4 text-sm font-bold text-white/48">No credit card required. We guide you every step of the way.</p>
          </div>
        </Reveal>
      </section>

      <section id="features" data-home-section="Features" className="container py-12">
        <SectionHeader eyebrow="Features" title="Everything points toward employability." body="PATHZY brings the pieces of career support into one calm journey instead of scattered tools." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, body], index) => (
            <Reveal key={title} delay={0.04 * index}>
              <Card>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/58">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how-pathzy-works" data-home-section="How PATHZY Works" className="container py-12">
        <SectionHeader eyebrow="How PATHZY Works" title="A simple path from confusion to action." body="You always know where you are, why it matters, and what to do next." />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(([number, title, body], index) => (
            <Reveal key={title} delay={0.05 * index}>
              <Card>
                <span className="inline-grid h-11 w-11 place-items-center rounded-2xl blue-purple text-lg font-black">{number}</span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/58">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="career-journey" data-home-section="Career Journey" className="container py-12">
        <SectionHeader eyebrow="Career Journey" title="Your journey stays visible." body="PATHZY keeps the employment path clear from first profile setup to interviews and employment." />
        <Card>
          <div className="grid gap-3 md:grid-cols-3">
            {journey.map((item, index) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/36">Step {index + 1}</p>
                <h3 className="mt-2 text-lg font-black">{item}</h3>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="pricing" data-home-section="Pricing" className="container py-12">
        <SectionHeader eyebrow="Pricing" title="Start free. Upgrade when action matters." body="Everyone gets one shared PATHZY workflow. Paid plans unlock premium actions, not a different product." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pricing.map(([name, price, body], index) => (
            <Reveal key={name} delay={0.04 * index}>
              <Card className={name === "Starter" ? "border-[#5B8CFF]/40 bg-[#5B8CFF]/10" : ""}>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{name}</p>
                <h3 className="mt-3 text-3xl font-black">{price}</h3>
                <p className="mt-3 leading-7 text-white/58">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="testimonials" data-home-section="Testimonials" className="container py-12">
        <SectionHeader eyebrow="Testimonials" title="Built for people who need clarity." body="PATHZY should feel practical, encouraging, and useful from the first session." />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map(([name, quote], index) => (
            <Reveal key={name} delay={0.05 * index}>
              <Card>
                <p className="text-lg font-bold leading-8 text-white/78">"{quote}"</p>
                <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{name}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" data-home-section="FAQ" className="container py-12">
        <SectionHeader eyebrow="FAQ" title="Questions before you begin." body="PATHZY is designed to feel simple even when your career situation feels complicated." />
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <Card key={question}>
              <h3 className="text-xl font-black">{question}</h3>
              <p className="mt-3 leading-7 text-white/58">{answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer data-home-section="Footer" className="container border-t border-white/10 py-10">
        <div className="flex flex-col gap-4 text-sm font-bold text-white/50 md:flex-row md:items-center md:justify-between">
          <p>PATHZY - The AI Employment Support System</p>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
