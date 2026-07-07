import { ButtonLink, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="container page-pad">
      <Card className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Page not found</p>
        <h1 className="mt-3 text-4xl font-black">This PATHZY page is not available.</h1>
        <p className="mt-4 leading-7 text-white/58">Return to your journey and continue with the next best career action.</p>
        <div className="mt-6">
          <ButtonLink href="/dashboard">Open My Journey</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
