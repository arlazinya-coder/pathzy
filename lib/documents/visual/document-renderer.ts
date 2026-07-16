import type { DocumentRenderer, DocumentRenderInput, RenderedDocument } from "./visual-reading.types";
import { VISUAL_READING_LIMITS } from "./visual-reading.constants";

function checksum(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  return Math.abs(hash).toString(16);
}

export class LocalMetadataDocumentRenderer implements DocumentRenderer {
  async render(input: DocumentRenderInput): Promise<RenderedDocument> {
    const pages = Array.from({ length: Math.min(input.pageCount, VISUAL_READING_LIMITS.maxPagesPerRun) }, (_, index) => ({
      pageNumber: index + 1,
      width: VISUAL_READING_LIMITS.renderWidth,
      height: input.sourceType === "image" ? VISUAL_READING_LIMITS.renderWidth : VISUAL_READING_LIMITS.renderHeight,
      mimeType: "image/png",
      checksum: checksum(`${input.documentId}:${input.pageCount}:${input.mimeType}:${index}`)
    }));
    return { documentId: input.documentId, pages, createdAt: new Date().toISOString() };
  }
}
