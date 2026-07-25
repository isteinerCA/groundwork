import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomePricingSection } from "@/components/marketing/home-pricing-section";
import { ProgramGallerySection } from "@/components/marketing/program-gallery-section";
import {
  AdminSection,
  CategoriesSection,
  FinePrintSection,
  LandingHero,
  ProblemHowItWorksSection,
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
        <LandingHero previewPrograms={previewPrograms} />
        <ProblemHowItWorksSection />
        <CategoriesSection />
        <FinePrintSection />
        <ProgramGallerySection />
        <WorkspaceSection />
        <HomePricingSection />
        <AdminSection />
      </main>
      <SiteFooter />
    </>
  );
}
