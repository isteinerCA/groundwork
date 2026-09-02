import Link from "next/link";
import type { ArticleBlock, ArticleListItem } from "@/lib/constants/resources";

function renderParagraphText(text: string, links?: { text: string; slug: string }[]) {
  if (!links?.length) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let remaining = text;

  for (const link of links) {
    const index = remaining.indexOf(link.text);
    if (index === -1) {
      continue;
    }

    if (index > 0) {
      parts.push(remaining.slice(0, index));
    }

    parts.push(
      <Link
        key={`${link.slug}-${index}`}
        href={`/resources/${link.slug}`}
        className="font-medium text-[var(--color-navy)] underline decoration-[var(--color-sage)] underline-offset-[0.2em] hover:decoration-[var(--color-navy)]"
      >
        {link.text}
      </Link>,
    );

    remaining = remaining.slice(index + link.text.length);
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

function renderListItem(item: ArticleListItem, links?: { text: string; slug: string }[]) {
  if (typeof item === "string") {
    return renderParagraphText(item, links);
  }

  return (
    <>
      <strong className="font-semibold text-[var(--color-navy)]">{item.lead}</strong>
      {renderParagraphText(item.text, links)}
    </>
  );
}

function listItemKey(item: ArticleListItem) {
  return typeof item === "string" ? item : `${item.lead}${item.text}`;
}

export function ArticleContent({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-[var(--color-text)]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={index}>{renderParagraphText(block.text, block.links)}</p>
            );
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
                className={
                  block.tone === "default"
                    ? "list-disc space-y-2 pl-5 text-[var(--color-text)]"
                    : "list-disc space-y-2 pl-5 text-[var(--color-text-muted)]"
                }
              >
                {block.items.map((item) => (
                  <li key={listItemKey(item)}>{renderListItem(item, block.links)}</li>
                ))}
              </ul>
            );
          case "footnote":
            return (
              <p
                key={index}
                className="-mt-1 text-sm italic leading-relaxed text-[var(--color-text-muted)]"
              >
                {block.text}
              </p>
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
