"use client";

import { Badge, ButtonLink, Card } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { LanguageSelector, usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T, pathzyT, publicLandingContent } from "@/lib/language/pathzy-i18n";

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-white/62 md:text-lg">{body}</p>
    </div>
  );
}

export function LandingContent({ startHref, loginHref }: { startHref: string; loginHref: string }) {
  const { language } = usePathzyLanguage();
  const content = publicLandingContent[language];
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);
  const navItems = [
    [t("public.nav.features"), "#features"],
    [t("public.nav.how"), "#how-pathzy-works"],
    [t("public.nav.journey"), "#career-journey"],
    [t("public.nav.pricing"), "#pricing"],
    [t("public.nav.testimonials"), "#testimonials"],
    [t("public.nav.faq"), "#faq"]
  ] as const;

  return (
    <div className="page-pad">
      {/* Do not remove landing sections without updating homepage regression test. */}
      <nav aria-label="Landing navigation" data-home-section="Navigation" className="container mb-8 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/7 p-3 text-sm font-extrabold text-white/72 backdrop-blur md:flex-row md:items-center md:justify-between">
        <a href="#top" className="rounded-full px-3 py-2 text-white">{t("public.nav.home")}</a>
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map(([item, href]) => (
            <a key={item} href={href} className="rounded-full px-3 py-2 transition hover:bg-white/10">{item}</a>
          ))}
          <a href={startHref} className="rounded-full px-3 py-2 text-white transition hover:bg-white/10">{t("public.nav.start")}</a>
          <a href={loginHref} className="rounded-full px-3 py-2 text-white transition hover:bg-white/10">{t("public.nav.login")}</a>
          <LanguageSelector persistAuthenticated={false} label={pathzyPhase2T(language, "language.selector.public")} />
        </div>
      </nav>

      <section id="top" data-home-section="Hero" className="container grid min-h-[calc(100vh-12rem)] place-items-center py-12 text-center">
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <Badge>{t("public.hero.eyebrow")}</Badge>
            <h1 className="mt-7 text-5xl font-black leading-none tracking-normal md:text-8xl">
              <span className="gradient-text">{t("public.hero.title")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/66 md:text-xl">{t("public.hero.body")}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={startHref}>{t("public.nav.start")}</ButtonLink>
              <ButtonLink href={loginHref} variant="secondary">{t("public.nav.login")}</ButtonLink>
            </div>
            <p className="mt-4 text-sm font-bold text-white/48">{t("public.hero.trust")}</p>
          </div>
        </Reveal>
      </section>

      <section id="features" data-home-section="Features" className="container py-12">
        <SectionHeader eyebrow={t("public.features.eyebrow")} title={t("public.features.title")} body={t("public.features.body")} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.features.map(([title, body], index) => (
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
        <SectionHeader eyebrow={content.sectionHeaders.how[0]} title={content.sectionHeaders.how[1]} body={content.sectionHeaders.how[2]} />
        <div className="grid gap-4 md:grid-cols-3">
          {content.steps.map(([number, title, body], index) => (
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
        <SectionHeader eyebrow={content.sectionHeaders.journey[0]} title={content.sectionHeaders.journey[1]} body={content.sectionHeaders.journey[2]} />
        <Card>
          <div className="grid gap-3 md:grid-cols-3">
            {content.journey.map((item, index) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/36">{content.stepLabel} {index + 1}</p>
                <h3 className="mt-2 text-lg font-black">{item}</h3>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="pricing" data-home-section="Pricing" className="container py-12">
        <SectionHeader eyebrow={content.sectionHeaders.pricing[0]} title={content.sectionHeaders.pricing[1]} body={content.sectionHeaders.pricing[2]} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.pricing.map(([name, price, body], index) => (
            <Reveal key={name} delay={0.04 * index}>
              <Card className={name === "Starter" ? "border-[var(--pathzy-red)]/40 bg-[var(--pathzy-red)]/10" : ""}>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{name}</p>
                <h3 className="mt-3 text-3xl font-black">{price}</h3>
                <p className="mt-3 leading-7 text-white/58">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="testimonials" data-home-section="Testimonials" className="container py-12">
        <SectionHeader eyebrow={content.sectionHeaders.testimonials[0]} title={content.sectionHeaders.testimonials[1]} body={content.sectionHeaders.testimonials[2]} />
        <div className="grid gap-4 md:grid-cols-3">
          {content.testimonials.map(([name, quote], index) => (
            <Reveal key={name} delay={0.05 * index}>
              <Card>
                <p className="text-lg font-bold leading-8 text-white/78">&quot;{quote}&quot;</p>
                <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{name}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" data-home-section="FAQ" className="container py-12">
        <SectionHeader eyebrow={content.sectionHeaders.faq[0]} title={content.sectionHeaders.faq[1]} body={content.sectionHeaders.faq[2]} />
        <div className="grid gap-4 md:grid-cols-2">
          {content.faqs.map(([question, answer]) => (
            <Card key={question}>
              <h3 className="text-xl font-black">{question}</h3>
              <p className="mt-3 leading-7 text-white/58">{answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer data-home-section="Footer" className="container border-t border-white/10 py-10">
        <div className="flex flex-col gap-4 text-sm font-bold text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{content.footer}</p>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy">{pathzyPhase2T(language, "public.footer.privacy")}</a>
            <a href="/terms">{pathzyPhase2T(language, "public.footer.terms")}</a>
            <a href="/contact">{pathzyPhase2T(language, "public.footer.contact")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
