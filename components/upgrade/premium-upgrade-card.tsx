import Link from "next/link";

const defaultBenefits = [
  "Unlimited Mentor conversations",
  "Interview Coach",
  "Application Review",
  "Employment Analytics",
  "Priority Processing",
  "Mock interview practice",
  "Salary negotiation support",
  "Faster career guidance"
];

export function PremiumUpgradeCard({
  title = "You\u2019ve reached today\u2019s Mentor limit.",
  subtitle = "Upgrade to Starter to continue building your employment plan without daily limits.",
  benefits = defaultBenefits,
  primaryLabel = "Upgrade to Starter - $9.99/month",
  secondaryLabel = "Come back tomorrow",
  trustNote = "No long-term commitment. Upgrade when you\u2019re ready.",
  onSecondary
}: {
  title?: string;
  subtitle?: string;
  benefits?: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
  trustNote?: string;
  onSecondary?: () => void;
}) {
  return (
    <section className="surface overflow-hidden rounded-[28px] p-5 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_.82fr] lg:items-center">
        <div>
          <span className="inline-flex rounded-full bg-[#39d98a]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#9df0c4]">
            Premium unlock
          </span>
          <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            <span className="gradient-text">{title}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/66 md:text-lg">{subtitle}</p>
          <p className="mt-3 text-sm font-bold text-white/48">Free users get limited Mentor messages each day. No credit card required.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/billing" className="inline-flex min-h-12 items-center justify-center rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_42px_rgba(91,140,255,.32)] transition hover:-translate-y-0.5">
              {primaryLabel}
            </Link>
            <button
              onClick={onSecondary}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-extrabold text-white/82 transition hover:-translate-y-0.5"
            >
              {secondaryLabel}
            </button>
          </div>
          <p className="mt-4 text-sm font-bold text-white/45">{trustNote}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/7 p-4 md:p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Included when you upgrade</p>
          <div className="mt-4 grid gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-[16px] border border-white/10 bg-black/10 px-4 py-3 text-sm font-bold text-white/72">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
