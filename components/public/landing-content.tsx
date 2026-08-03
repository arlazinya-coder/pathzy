"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { LanguageSelector, usePathzyLanguage } from "@/components/language/language-selector";
import { pathzyPhase2T, pathzyT, publicLandingContent } from "@/lib/language/pathzy-i18n";

export const PATHZY_PUBLIC_BRAND = "PATHZY";

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-white/62 md:text-lg">{body}</p>
    </div>
  );
}

function PublicBrandMark() {
  return (
    <a
      href="#top"
      aria-label="PATHZY home"
      className="inline-flex min-w-[7.5rem] shrink-0 items-center rounded-full px-3 py-2 text-base font-black uppercase tracking-[0.14em] text-white antialiased"
    >
      {PATHZY_PUBLIC_BRAND}
    </a>
  );
}

export function LandingContent({ startHref, loginHref }: { startHref: string; loginHref: string }) {
  const { language } = usePathzyLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const content = publicLandingContent[language];
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);
  const navItems = [
    [t("public.nav.home"), "#top"],
    [t("public.nav.features"), "#features"],
    [t("public.nav.how"), "#how-pathzy-works"],
    [t("public.nav.journey"), "#career-journey"],
    [t("public.nav.testimonials"), "#testimonials"],
    [t("public.nav.faq"), "#faq"]
  ] as const;
  const menuLabel = language === "fr" ? "Menu" : "Menu";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const firstLink = menuPanelRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="page-pad">
      {/* Do not remove landing sections without updating homepage regression test. */}
      <nav aria-label="Landing navigation" data-home-section="Navigation" className="container mb-6 overflow-visible rounded-[24px] border border-white/10 bg-white/7 p-3 text-sm font-extrabold text-white/72 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <PublicBrandMark />
          <div className="hidden min-w-0 flex-1 items-center justify-start gap-1.5 pl-3 xl:flex">
            {navItems.map(([item, href]) => (
              <a
                key={item}
                href={href}
                aria-current={href === "#top" ? "page" : undefined}
                className="whitespace-nowrap rounded-full px-3 py-2 text-[0.78rem] leading-none transition hover:bg-white/10 aria-[current=page]:bg-white/12 aria-[current=page]:text-white"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <LanguageSelector persistAuthenticated={false} label={pathzyPhase2T(language, "language.selector.public")} />
            <a href={startHref} className="hidden min-h-10 whitespace-nowrap rounded-full bg-[var(--pathzy-red)] px-4 py-2.5 text-xs font-extrabold leading-none text-white shadow-[0_14px_34px_rgba(217,58,70,.18)] transition hover:bg-[var(--pathzy-red-dark)] sm:inline-flex sm:items-center">{t("public.nav.start")}</a>
            <a href={loginHref} className="hidden min-h-10 whitespace-nowrap rounded-full border border-white/12 px-4 py-2.5 text-xs font-extrabold leading-none text-white transition hover:bg-white/10 sm:inline-flex sm:items-center">{t("public.nav.login")}</a>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuLabel}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((current) => !current)}
              className="min-h-10 rounded-full border border-white/12 px-4 py-2.5 text-xs font-extrabold leading-none text-white transition hover:bg-white/10 xl:hidden"
            >
              {menuLabel}
            </button>
          </div>
        </div>
        <div
          id={menuId}
          ref={menuPanelRef}
          hidden={!menuOpen}
          className="mt-3 grid gap-2 rounded-[20px] border border-white/10 bg-black/10 p-3 xl:hidden"
        >
          {navItems.map(([item, href]) => (
            <a
              key={item}
              href={href}
              aria-current={href === "#top" ? "page" : undefined}
              onClick={closeMenu}
              className="rounded-full px-3 py-2 transition hover:bg-white/10 focus:bg-white/10 aria-[current=page]:bg-white/12 aria-[current=page]:text-white"
            >
              {item}
            </a>
          ))}
          <a href={startHref} onClick={closeMenu} className="rounded-full bg-[var(--pathzy-red)] px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-[var(--pathzy-red-dark)] sm:hidden">
            {t("public.nav.start")}
          </a>
          <a href={loginHref} onClick={closeMenu} className="rounded-full border border-white/12 px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-white/10 sm:hidden">
            {t("public.nav.login")}
          </a>
        </div>
      </nav>

      <section id="top" data-home-section="Hero" className="container grid min-h-[clamp(30rem,calc(100svh-8rem),42rem)] place-items-center py-8 text-center md:py-10">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <Badge>{t("public.hero.eyebrow")}</Badge>
            <h1 className="mx-auto mt-6 max-w-[12ch] text-[clamp(3rem,7vw,6.35rem)] font-black leading-[0.98] tracking-normal sm:max-w-[13ch]">
              <span className="gradient-text">{t("public.hero.title")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[48rem] text-base leading-7 text-white/66 md:text-lg md:leading-8">{t("public.hero.body")}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
