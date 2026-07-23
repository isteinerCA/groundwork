import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomePricingSection } from "@/components/marketing/home-pricing-section";
import {
  AdminSection,
  CategoriesSection,
  FinePrintSection,
  FinalCtaSection,
  HowItWorksSection,
  LandingHero,
  ProblemSection,
  WorkspaceSection,
} from "@/components/marketing/landing-sections";
import { getPreviewPrograms } from "@/lib/programs/preview-programs";
import { getPrograms } from "@/lib/programs";
import { filterPrograms } from "@/lib/data/filter-programs";
import { DEFAULT_SEARCH_FILTERS } from "@/lib/types/program";

export default function HomePage() {
  const programs = getPrograms();
  const previewPrograms = getPreviewPrograms(programs, 2);
  const previewResultCount = filterPrograms(programs, {
    ...DEFAULT_SEARCH_FILTERS,
    gradesCompleted: [10],
  }).length;

  return (
    <>
      <SiteHeader logoPriority />
      <main>
        <LandingHero
          previewPrograms={previewPrograms}
          previewResultCount={previewResultCount}
        />
        <ProblemSection />
        <CategoriesSection />
        <FinePrintSection />
        <HowItWorksSection />
        <WorkspaceSection />
        <HomePricingSection />
        <FinalCtaSection />
        <AdminSection />
      </main>
      <SiteFooter showAbout={false} />
    </>
  );
}
