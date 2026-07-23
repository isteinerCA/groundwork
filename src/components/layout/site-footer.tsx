import Link from "next/link";
import { getDataVerifiedAt } from "@/lib/programs";

export function SiteFooter({ showAbout = true }: { showAbout?: boolean }) {
  const verifiedAt = getDataVerifiedAt();

  return (
    <footer id="about" className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {showAbout ? (
          <>
            <h2 className="text-2xl">About this list</h2>
            {verifiedAt && (
              <p className="mt-2 text-sm font-medium text-[var(--color-amber)]">
                Last verified: {verifiedAt}
              </p>
            )}
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
              <p>
                We put this directory together because, as parents, we&apos;ve hit the same walls
                over and over: scattered information, outdated program pages, and hours spent
                cross-referencing dates and costs across dozens of websites. We built Groundwork
                to save other parents that time and hassle — a single place to start exploring
                options for your kid&apos;s summer.
              </p>
              <p>That said, a few honest caveats:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  This isn&apos;t a complete list. There are hundreds of summer programs out
                  there, and new ones launch every year. We&apos;ve focused on programs we came
                  across in our own research, not an exhaustive catalog.
                </li>
                <li>
                  Details change. Dates, pricing, eligibility requirements, and application
                  deadlines shift year to year — sometimes mid-season. What&apos;s listed here
                  reflects what was publicly posted at the time we last checked, not a live feed
                  from each program.
                </li>
                <li>
                  Always verify before you apply. Click through to the program&apos;s official
                  website to confirm current details before you commit time or money. Treat this
                  list as a starting point for your research, not a final answer.
                </li>
                <li>
                  Most programs don&apos;t publish exact acceptance rates. We estimated
                  competitiveness based on how programs describe themselves. Free and fully funded
                  programs are usually the most competitive, since funding (not payment) caps the
                  seats.
                </li>
              </ul>
              <p>
                If you spot something outdated, missing, or just plain wrong,{" "}
                <Link href="/contact" className="font-medium text-[var(--color-navy-light)]">
                  contact us or report an issue
                </Link>
                .
              </p>
            </div>
          </>
        ) : null}
        <p
          className={`text-xs text-[var(--color-text-muted)] ${showAbout ? "mt-10 border-t border-[var(--color-border)] pt-6" : ""}`}
        >
          © {new Date().getFullYear()} Groundwork · Summer Programs Explorer
        </p>
      </div>
    </footer>
  );
}
