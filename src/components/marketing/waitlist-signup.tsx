"use client";

import { useState, type FormEvent } from "react";
import { btnPrimary } from "@/components/ui/button-styles";
import { trackEvent } from "@/lib/analytics";
import { type WaitlistSource } from "@/lib/waitlist/constants";

interface WaitlistSignupProps {
  source: WaitlistSource;
  className?: string;
}

export function WaitlistSignup({ source, className = "" }: WaitlistSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      trackEvent("waitlist_signup", { source });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className={`rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 px-5 py-4 ${className}`}
      >
        <p className="font-medium text-emerald-900">
          Thank you for signing up. We will let you know when the 2027 list is available.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-sage)_35%] bg-[var(--color-sage-soft)] px-5 py-4 ${className}`}
    >
      <p className="text-sm text-[var(--color-navy)]">
        Explore Summer is currently updating for 2027 programs. Sign up to be the first one to know
        when the 2027 list is ready.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor={`waitlist-email-${source}`}>
          Email address
        </label>
        <input
          id={`waitlist-email-${source}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          placeholder="you@example.com"
          className="field-input min-w-0 flex-1 bg-white"
        />
        <button type="submit" disabled={submitting} className={`${btnPrimary} shrink-0`}>
          {submitting ? "Signing up…" : "Notify me"}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
