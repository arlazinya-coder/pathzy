import type { DocumentInspectionResult } from "./inspection.types";
import { countMatches } from "./inspection.utils";

export function detectLayout(input: { text: string; mimeType: string; pageCount: number; rawText?: string }): Pick<DocumentInspectionResult, "layout" | "readingOrder"> {
  const lines = input.text.split("\n").map((line) => line.trim()).filter(Boolean);
  const tableRows = lines.filter((line) => /\t| {3,}| : |;.*;|(\bgrade\b|\bcredits?\b).*(\bmodule\b|\bcourse\b)/i.test(line));
  const twoColumnSignals = lines.filter((line) => /\s{5,}| {2,}[A-Z][a-z]+/.test(line) && line.length > 42).length;
  const columnCount = twoColumnSignals >= Math.max(3, lines.length * 0.08) ? 2 : 1;
  const imageCount = input.mimeType.startsWith("image/") ? 1 : countMatches(input.rawText ?? "", /\/Subtype\s*\/Image/g);
  const hasImages = imageCount > 0;
  const lower = input.text.toLowerCase();
  const hasHeaders = lines.slice(0, 5).some((line) => /email|phone|linkedin|curriculum|resume|cv|name/i.test(line));
  const hasFooters = /page\s+\d+|\d+\s*\/\s*\d+/.test(lower);
  const complexity = tableRows.length > 3 || columnCount > 1 || imageCount > 2 ? "complex" : tableRows.length || imageCount ? "moderate" : "simple";

  const readingOrder = Array.from({ length: Math.max(1, input.pageCount) }, (_, index) => {
    const page = index + 1;
    return columnCount > 1
      ? [
          { page, regionId: `p${page}-header`, order: 1, regionType: "header" as const },
          { page, regionId: `p${page}-left`, order: 2, regionType: "left_column" as const },
          { page, regionId: `p${page}-main`, order: 3, regionType: "main_column" as const },
          { page, regionId: `p${page}-footer`, order: 4, regionType: "footer" as const }
        ]
      : [
          { page, regionId: `p${page}-header`, order: 1, regionType: "header" as const },
          { page, regionId: `p${page}-main`, order: 2, regionType: "main_column" as const },
          { page, regionId: `p${page}-footer`, order: 3, regionType: "footer" as const }
        ];
  }).flat();

  return {
    layout: {
      columnCount,
      columnCountByPage: Array.from({ length: Math.max(1, input.pageCount) }, () => columnCount),
      hasTables: tableRows.length > 0,
      tableCount: Math.max(0, Math.min(tableRows.length, Math.ceil(tableRows.length / 3))),
      hasImages,
      imageCount,
      hasProfilePhoto: /photo|profile picture|portrait/i.test(input.text) || (hasImages && /cv|resume|curriculum/i.test(lower)),
      hasLogos: /logo|company mark|brand/i.test(lower),
      hasSignatures: /signature|signed|kind regards|sincerely|cordialement/i.test(lower),
      hasStamps: /stamp|cachet/i.test(lower),
      hasQrCodes: /qr|quick response/i.test(lower),
      hasHeaders,
      hasFooters,
      readingOrderDetected: true,
      complexity
    },
    readingOrder
  };
}
