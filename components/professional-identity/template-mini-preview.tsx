import type { DocumentTemplateMetadata } from "@/lib/professional-identity/document-template-engine";

function Bars({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-1" : "grid gap-1.5"}>
      <div className="h-1.5 w-full rounded-full bg-black/16" />
      <div className="h-1.5 w-5/6 rounded-full bg-black/12" />
      <div className="h-1.5 w-3/4 rounded-full bg-black/12" />
    </div>
  );
}

function Blocks({ columns = "grid gap-1.5" }: { columns?: string }) {
  return (
    <div className={columns}>
      <div className="h-5 rounded bg-black/10" />
      <div className="h-5 rounded bg-black/10" />
    </div>
  );
}

export function TemplateMiniPreview({ template }: { template: DocumentTemplateMetadata }) {
  const { layout } = template.thumbnail;

  return (
    <div className="cv-template-mini-preview h-32 overflow-hidden rounded-[16px] border border-white/10 p-3" style={{ background: template.thumbnail.background }}>
      {layout === "single" || layout === "international" ? (
        <div className="grid content-start gap-2">
          <div className="h-2.5 w-24 rounded-full" style={{ background: template.thumbnail.accent }} />
          <div className={layout === "international" ? "h-px w-full bg-black/22" : "h-1.5 w-4/5 rounded-full bg-black/18"} />
          <Bars compact={layout === "international"} />
          <Blocks />
        </div>
      ) : layout === "executive" || layout === "consulting" || layout === "technical" ? (
        <div className="grid h-full grid-cols-[1fr_.34fr] gap-3">
          <div className="grid content-start gap-2">
            <div className="h-2.5 w-24 rounded-full" style={{ background: template.thumbnail.accent }} />
            <div className={layout === "consulting" ? "h-1 w-14 rounded-full" : "h-1.5 w-4/5 rounded-full bg-black/18"} style={layout === "consulting" ? { background: template.thumbnail.accent } : undefined} />
            <Bars compact={layout === "consulting"} />
            <Blocks columns={layout === "technical" ? "grid grid-cols-2 gap-1.5" : "grid gap-1.5"} />
          </div>
          <div className="rounded-lg p-2" style={{ background: `${template.thumbnail.accent}24` }}>
            <div className="h-2 w-8 rounded-full" style={{ background: template.thumbnail.accent }} />
            <div className="mt-3 grid gap-1.5">
              <div className="h-1.5 w-full rounded-full bg-black/16" />
              <div className="h-1.5 w-3/4 rounded-full bg-black/12" />
              <div className="h-1.5 w-5/6 rounded-full bg-black/12" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid h-full grid-cols-[.36fr_1fr] gap-3">
          <div className="rounded-lg p-2" style={{ background: `${template.thumbnail.accent}24` }}>
            <div className="h-2 w-8 rounded-full" style={{ background: template.thumbnail.accent }} />
            <div className="mt-3 grid gap-1.5">
              <div className="h-1.5 w-full rounded-full bg-black/16" />
              <div className="h-1.5 w-3/4 rounded-full bg-black/12" />
              <div className="h-1.5 w-5/6 rounded-full bg-black/12" />
            </div>
          </div>
          <div className="grid content-start gap-2">
            <div className="h-2.5 w-20 rounded-full" style={{ background: template.thumbnail.accent }} />
            <div className="h-1.5 w-4/5 rounded-full bg-black/18" />
            <Bars compact={layout === "graduate"} />
            <Blocks columns={layout === "creative" ? "mt-1 grid grid-cols-[1fr_.48fr] gap-1.5" : "grid gap-1.5"} />
          </div>
        </div>
      )}
    </div>
  );
}

