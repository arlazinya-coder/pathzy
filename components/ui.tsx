import Link from "next/link";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/72">
      {children}
    </span>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const classes =
    variant === "primary"
      ? "blue-purple text-white shadow-[0_16px_42px_rgba(91,140,255,.32)]"
      : "border border-white/12 bg-white/8 text-white/82";

  return (
    <Link href={href} className={`tap-target inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-extrabold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8fb0ff] ${classes}`}>
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`surface reveal-card rounded-[24px] p-5 md:p-7 ${className}`}>{children}</section>;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 grid gap-4 md:mb-10">
      <Badge>{eyebrow}</Badge>
      <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal md:text-6xl">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="max-w-3xl text-base leading-7 text-white/66 md:text-lg">{children}</p>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <div className="progress-fill h-full rounded-full blue-purple" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
