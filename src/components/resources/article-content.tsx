import type { ArticleBlock } from "@/lib/constants/resources";

export function ArticleContent({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-[var(--color-text)]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "subheading":
            return (
              <h2 key={index} className="pt-2 text-xl font-normal">
                {block.text}
              </h2>
            );
          case "list":
            return (
              <ul
                key={index}
                className="list-disc space-y-2 pl-5 text-[var(--color-text-muted)]"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "tip":
            return (
              <aside
                key={index}
                className="rounded-[var(--radius-lg)] border border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-5 py-4"
              >
                <p className="text-sm font-semibold tracking-wide text-[var(--color-navy)] uppercase">
                  Groundwork tip
                </p>
                <p className="mt-2 text-[var(--color-text)]">{block.text}</p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
