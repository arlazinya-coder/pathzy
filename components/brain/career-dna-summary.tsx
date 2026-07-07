import { Card } from "@/components/ui";
import type { ReadinessResult } from "@/lib/pathzy-brain/types";

export function CareerDnaSummary({ careerDna }: { careerDna: ReadinessResult["careerDna"] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Career DNA</p>
          <h2 className="mt-2 text-2xl font-black">{careerDna.strongestCareerDirection}</h2>
        </div>
        <span className="rounded-full bg-[#39d98a]/15 px-3 py-1 text-xs font-extrabold text-[#9df0c4]">{careerDna.confidenceLevel}</span>
      </div>
      <div className="mt-5 grid gap-3">
        <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">First career focus</p>
          <p className="mt-2 font-black text-white/78">{careerDna.firstCareerFocus}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">Work style</p>
          <p className="mt-2 text-sm leading-6 text-white/62">{careerDna.workStyle}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">Recommended careers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {careerDna.recommendedCareers.map((career) => (
              <span key={career} className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/68">{career}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
