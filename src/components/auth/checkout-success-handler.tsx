"use client";

import { useSession } from "next-auth/react";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function CheckoutSuccessHandler() {
  const params = useSearchParams();
  const { update } = useSession();
  const checkout = params.get("checkout");

  useEffect(() => {
    if (checkout === "success") {
      trackEvent("payment_completed");
      void update();
    }
  }, [checkout, update]);

  if (checkout !== "success") return null;

  return (
    <p className="mb-6 rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      Payment received — your season pass is active. Start saving programs!
    </p>
  );
}
