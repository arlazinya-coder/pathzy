import type { InspectionWarning } from "@/lib/documents/inspection";

export function DocumentInspectionWarnings({ warnings }: { warnings: InspectionWarning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="mt-4 grid gap-2" aria-label="Document inspection warnings">
      {warnings.map((warning, index) => (
        <div key={`${warning.code}-${index}`} className="rounded-[14px] border border-[#ffcc66]/25 bg-[#ffcc66]/10 p-3 text-sm leading-6 text-[#ffe3a3]">
          <strong className="block text-xs uppercase tracking-[0.12em] text-[#ffe3a3]/80">{warning.severity}</strong>
          {warning.message}
        </div>
      ))}
    </div>
  );
}
