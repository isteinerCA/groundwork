import type { AdmissionTypeId } from "@/lib/constants/admission-types";

const FIRST_COME_PATTERNS = [
  /^first[- ]?come/i,
  /^rolling$/i,
  /open enrollment/i,
  /first[- ]?come\/rolling/i,
];

const HIGHLY_COMPETITIVE_PATTERNS = [
  /highly competitive/i,
  /highly selective/i,
  /highly selective application/i,
  /\(\s*~\s*\d+%\s*acceptance\s*\)/i,
  /\d+% acceptance/i,
];

const APPLICATION_PATTERNS = [
  /^application$/i,
  /^selective$/i,
  /selective application/i,
  /rolling application/i,
  /moderate selectivity/i,
  /application \(transcripts/i,
];

/**
 * Maps free-text CSV admission strings to one of three PRD enums.
 * Order matters: check highly competitive before generic "selective".
 */
export function normalizeAdmissionType(raw: string): {
  admissionType: AdmissionTypeId;
  admissionDisplay: string;
} {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return { admissionType: "application", admissionDisplay: trimmed };
  }

  if (FIRST_COME_PATTERNS.some((p) => p.test(trimmed))) {
    return { admissionType: "first_come", admissionDisplay: trimmed };
  }

  if (HIGHLY_COMPETITIVE_PATTERNS.some((p) => p.test(trimmed))) {
    return { admissionType: "highly_competitive", admissionDisplay: trimmed };
  }

  if (APPLICATION_PATTERNS.some((p) => p.test(trimmed))) {
    return { admissionType: "application", admissionDisplay: trimmed };
  }

  // Heuristics for compound strings
  if (lower.includes("highly") || lower.includes("competitive")) {
    return { admissionType: "highly_competitive", admissionDisplay: trimmed };
  }

  if (lower.includes("first-come") || lower.includes("first come")) {
    return { admissionType: "first_come", admissionDisplay: trimmed };
  }

  if (lower.includes("rolling") && !lower.includes("selective")) {
    return { admissionType: "first_come", admissionDisplay: trimmed };
  }

  if (lower.includes("selective") || lower.includes("application")) {
    return { admissionType: "application", admissionDisplay: trimmed };
  }

  // Safe default — preserves raw string for display
  return { admissionType: "application", admissionDisplay: trimmed };
}
