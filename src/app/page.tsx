import { getPrograms, getDataVerifiedAt } from "@/lib/programs";
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

export default function HomePage() {
  const programCount = getPrograms().length;
  const dataVerifiedAt = getDataVerifiedAt();

  return (
    <>
      <SiteHeader logoPriority />
      <main>
        <LandingHero programCount={programCount} dataVerifiedAt={dataVerifiedAt} />
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
