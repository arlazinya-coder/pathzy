"use client";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded-md bg-black/30 px-1.5 py-0.5 text-[0.92em] text-white/86">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="grid gap-3">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const firstLine = lines[0] ?? "";

        if (firstLine.startsWith("### ")) {
          return (
            <h3 key={`${block}-${index}`} className="text-lg font-black text-white">
              {renderInline(firstLine.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        if (firstLine.startsWith("## ")) {
          return (
            <h2 key={`${block}-${index}`} className="text-xl font-black text-white">
              {renderInline(firstLine.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        if (firstLine.startsWith("# ")) {
          return (
            <h2 key={`${block}-${index}`} className="text-xl font-black text-white">
              {renderInline(firstLine.replace(/^#\s+/, ""))}
            </h2>
          );
        }

        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={`${block}-${index}`} className="grid gap-2 pl-4">
              {lines.map((line) => (
                <li key={line} className="list-disc leading-7">
                  {renderInline(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={`${block}-${index}`} className="grid gap-2 pl-4">
              {lines.map((line) => (
                <li key={line} className="list-decimal leading-7">
                  {renderInline(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block}-${index}`} className="leading-7">
            {lines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
