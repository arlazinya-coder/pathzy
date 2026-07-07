import { Card } from "@/components/ui";

function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <Card className={tall ? "min-h-[300px]" : "min-h-[170px]"}>
      <div className="shimmer h-4 w-36 rounded-full bg-white/10" />
      <div className="shimmer mt-5 h-10 w-2/3 rounded-2xl bg-white/10" />
      <div className="shimmer mt-4 h-4 w-full rounded-full bg-white/10" />
      <div className="shimmer mt-3 h-4 w-4/5 rounded-full bg-white/10" />
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="container page-pad">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <SkeletonCard tall />
        <SkeletonCard tall />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SkeletonCard tall />
        <SkeletonCard tall />
      </div>
    </div>
  );
}
