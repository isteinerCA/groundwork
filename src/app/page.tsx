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
import { WaitlistSignup } from "@/components/marketing/waitlist-signup";

export default function HomePage() {
  return (
    <>
      <SiteHeader logoPriority />
      <main>
        <LandingHero />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <WaitlistSignup source="home" className="mb-4" />
        </div>
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
