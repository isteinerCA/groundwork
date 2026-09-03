export function ResourceSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[var(--color-sage)] bg-[var(--color-sage-soft)] px-5 py-3.5 sm:px-6 sm:py-4">
      <h2 className="text-xl leading-snug sm:text-2xl md:text-[1.75rem]">{title}</h2>
      <p className="mt-1.5 text-sm leading-snug text-[var(--color-text-muted)] sm:mt-2 sm:leading-relaxed">
        {description}
      </p>
    </div>
  );
}
