export const INQUIRY_TYPES = [
  {
    id: "update",
    label: "Update program info",
    sla: "We aim to review updates within 5 business days.",
  },
  {
    id: "dispute_flag",
    label: "Dispute a flag or hidden detail",
    sla: "Disputes are reviewed within 5 business days.",
  },
  {
    id: "add_new",
    label: "Add a new program",
    sla: "New program requests may take up to 30 days to verify and publish.",
  },
  {
    id: "other",
    label: "Other",
    sla: "We respond to other inquiries within 5–10 business days.",
  },
] as const;

export type InquiryTypeId = (typeof INQUIRY_TYPES)[number]["id"];

export interface ContactFormPayload {
  name: string;
  email: string;
  programName: string;
  inquiryType: InquiryTypeId;
  message: string;
  websiteUrl: string;
}

/** Program name + URL fields apply only to listing changes. */
export function inquiryRequiresProgramFields(type: InquiryTypeId): boolean {
  return type === "update" || type === "add_new";
}

export function inquiryRequiresProgramUrl(type: InquiryTypeId): boolean {
  return type === "add_new";
}

export function slaForInquiry(type: InquiryTypeId): string {
  return INQUIRY_TYPES.find((t) => t.id === type)?.sla ?? INQUIRY_TYPES[3].sla;
}
