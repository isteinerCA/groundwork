"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { INQUIRY_TYPES, type InquiryTypeId } from "@/lib/contact/types";
import { trackEvent } from "@/lib/analytics";

interface ContactFormProps {
  initialProgramName?: string;
}

export function ContactForm({ initialProgramName = "" }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [programName, setProgramName] = useState(initialProgramName);
  const [inquiryType, setInquiryType] = useState<InquiryTypeId>("update");
  const [message, setMessage] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ referenceId: string; sla: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedSla = INQUIRY_TYPES.find((t) => t.id === inquiryType)?.sla;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          programName,
          inquiryType,
          message,
          websiteUrl,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        referenceId?: string;
        sla?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess({
        referenceId: data.referenceId ?? "",
        sla: data.sla ?? "",
      });
      trackEvent("contact_form_submitted", { inquiry_type: inquiryType });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mt-8 rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg text-emerald-900">Thank you — we received your message.</h2>
        {success.referenceId && (
          <p className="mt-2 text-sm text-emerald-800">
            Reference: <span className="font-mono">{success.referenceId}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-emerald-800">{success.sla}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <Field label="Your name" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className="field-input"
        />
      </Field>

      <Field label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          className="field-input"
        />
      </Field>

      <Field label="Program name" required>
        <input
          type="text"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. MIT RSI"
          className="field-input"
        />
      </Field>

      <Field label="Inquiry type" required>
        <select
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value as InquiryTypeId)}
          className="field-input"
        >
          {INQUIRY_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedSla && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{selectedSla}</p>
        )}
      </Field>

      <Field label="Program website (optional)">
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://"
          maxLength={500}
          className="field-input"
        />
      </Field>

      <Field label="Message" required>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          placeholder="What's outdated, missing, or incorrect?"
          className="field-input"
        />
      </Field>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[var(--radius-md)] bg-[var(--color-navy)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-navy)]">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
