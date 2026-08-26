import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/inspection/inspection.constants";
import type { DocumentInspectionResult } from "@/lib/documents/inspection";
import { DocumentInspectionWarnings } from "./DocumentInspectionWarnings";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DocumentInspectionSummary({ inspection }: { inspection: DocumentInspectionResult | null | undefined }) {
  if (!inspection) return null;
  const primaryLanguage = inspection.languages.find((language) => language.primary) ?? inspection.languages[0];
  const rows = [
    ["Document type", DOCUMENT_TYPE_LABELS[inspection.documentType.value] ?? titleCase(inspection.documentType.value)],
    ["Pages", String(inspection.file.pageCount)],
    ["Language", primaryLanguage ? primaryLanguage.name : "Unknown"],
    ["Format", titleCase(inspection.source.type)],
    ["OCR", inspection.source.ocrRequired ? `Required - ${inspection.source.ocrReason ?? "text needs OCR"}` : "Not required"],
    ["Layout", `${inspection.layout.columnCount} column${inspection.layout.columnCount === 1 ? "" : "s"}`],
    ["Tables", inspection.layout.hasTables ? `Yes (${inspection.layout.tableCount})` : "No"],
    ["Images", inspection.layout.hasImages ? `Yes (${inspection.layout.imageCount})` : "No"],
    ["Quality", titleCase(inspection.quality.overall)],
    ["Confidence", percent(inspection.confidence.overall)]
  ];
  return (
    <section className="pathzy-status-success mt-4 rounded-[18px] border p-4" aria-label="Document inspection summary">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em]">Document Inspection Complete</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-[14px] border border-white/10 bg-white/7 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/42">{label}</p>
            <p className="mt-1 text-sm font-black text-white/84">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[14px] border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white/72">
        {inspection.recommendedPipeline.manualReviewRequired ? "Manual review recommended before extraction." : "Ready for extraction."}
      </p>
      <DocumentInspectionWarnings warnings={inspection.warnings} />
    </section>
  );
}
