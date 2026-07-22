const CONTACT_PROGRAM_PATTERN = /contact program/i;
const FREE_PATTERNS = [
  /^free$/i,
  /fully funded/i,
  /free \(fully funded\)/i,
  /free\/subsidized/i,
  /free \(sponsored\)/i,
  /\$0\b/,
];

export interface ParsedPrice {
  priceDisplay: string;
  priceMin: number | null;
  priceMax: number | null;
  priceUnknown: boolean;
  fullyFunded: boolean;
}

function extractNumbers(value: string): number[] {
  const matches = value.match(/\d[\d,]*(?:\.\d+)?/g);
  if (!matches) return [];
  return matches.map((m) => Number(m.replace(/,/g, "")));
}

/**
 * Parses CSV price strings into structured fields.
 * "Contact program" → priceUnknown: true, null min/max.
 */
export function parsePrice(raw: string): ParsedPrice {
  const priceDisplay = raw.trim();

  if (!priceDisplay) {
    return {
      priceDisplay,
      priceMin: null,
      priceMax: null,
      priceUnknown: true,
      fullyFunded: false,
    };
  }

  if (CONTACT_PROGRAM_PATTERN.test(priceDisplay)) {
    return {
      priceDisplay,
      priceMin: null,
      priceMax: null,
      priceUnknown: true,
      fullyFunded: false,
    };
  }

  const fullyFunded = FREE_PATTERNS.some((p) => p.test(priceDisplay));

  if (fullyFunded) {
    return {
      priceDisplay,
      priceMin: 0,
      priceMax: 0,
      priceUnknown: false,
      fullyFunded: true,
    };
  }

  const numbers = extractNumbers(priceDisplay);

  if (numbers.length === 0) {
    return {
      priceDisplay,
      priceMin: null,
      priceMax: null,
      priceUnknown: true,
      fullyFunded: false,
    };
  }

  const priceMin = Math.min(...numbers);
  const priceMax = Math.max(...numbers);

  return {
    priceDisplay,
    priceMin,
    priceMax,
    priceUnknown: false,
    fullyFunded: priceMin === 0 && priceMax === 0,
  };
}
