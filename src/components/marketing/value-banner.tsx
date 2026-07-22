export function ValueBanner() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-parchment-dark)] px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="shrink-0 text-[var(--color-navy)]" aria-hidden>
          <svg viewBox="0 0 80 80" className="h-20 w-20" fill="none">
            <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="40,16 44,36 40,32 36,36" fill="currentColor" />
            <text x="40" y="58" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="serif">
              N
            </text>
          </svg>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl">Organize. Compare. Decide with confidence.</h2>
          <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
            Groundwork is your working document through the summer program search — from first
            filter to final shortlist, with the fine print included.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "Compare side by side", desc: "Evaluate fit across price, selectivity, and format." },
              { title: "Track deadlines", desc: "Enter your own dates and stay ahead of application season." },
              { title: "Document insights", desc: "Keep notes from info sessions and alumni calls in one place." },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
              >
                <p className="font-medium text-[var(--color-navy)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
