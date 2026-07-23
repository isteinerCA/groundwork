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

export default function HomePage() {
  const programs = getPrograms();
  const previewPrograms = getPreviewPrograms(programs, 3);

  return (
    <>
      <SiteHeader logoPriority />
      <main>
        <LandingHero programCount={programs.length} previewPrograms={previewPrograms} />
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
