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

export default function HomePage() {
  return (
    <>
      <SiteHeader logoPriority />
      <main>
        <LandingHero />
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
