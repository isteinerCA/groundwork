import type { Program } from "@/lib/types/program";

type GradeResult = Pick<
  Program,
  "gradeCompletedMin" | "gradeCompletedMax" | "gradeDisplay" | "gradeSource" | "stateRestriction"
>;

const AGE_TO_GRADE: [number, number][] = [
  [11, 5],
  [12, 6],
  [13, 7],
  [14, 8],
  [15, 9],
  [16, 10],
  [17, 11],
  [18, 12],
  [19, 12],
];

function ageRangeToGrades(minAge: number, maxAge: number): [number, number] {
  const gradesInRange = AGE_TO_GRADE.filter(
    ([age]) => age >= minAge && age <= maxAge,
  ).map(([, grade]) => grade);

  if (gradesInRange.length === 0) {
    return [Math.max(5, minAge - 6), Math.min(12, maxAge - 6)];
  }

  return [Math.min(...gradesInRange), Math.max(...gradesInRange)];
}

function parseGradeNumber(token: string): number | null {
  const t = token.toLowerCase();
  const ord = t.match(/(\d+)(?:st|nd|rd|th)?/);
  if (ord) return Number(ord[1]);

  const named: Record<string, number> = {
    freshman: 9,
    sophomore: 10,
    junior: 11,
    senior: 12,
    soph: 10,
    jr: 11,
    sr: 12,
  };
  for (const [key, grade] of Object.entries(named)) {
    if (t.includes(key)) return grade;
  }
  return null;
}

/** Rising grade N → completed grade N−1 for summer filter matching. */
function risingToCompleted(grade: number): number {
  return Math.max(1, grade - 1);
}

export function normalizeGrade(raw: string): GradeResult {
  const gradeDisplay = raw.trim();
  const lower = gradeDisplay.toLowerCase();

  let stateRestriction: string | undefined;
  const stateMatch = lower.match(/\b([a-z]{2})\s+(?:residents?|high school|only)\b/);
  if (stateMatch) stateRestriction = stateMatch[1].toUpperCase();
  if (lower.includes("ca high school") || lower.includes("california residents")) {
    stateRestriction = "CA";
  }

  // Current-grade phrasing ("6th-7th grade") — same number for current and completed.
  const ordinalGradeRange = lower.match(
    /(\d+)(?:st|nd|rd|th)[-–](\d+)(?:st|nd|rd|th)?\s+grades?\b/i,
  );
  if (ordinalGradeRange) {
    return {
      gradeDisplay,
      gradeCompletedMin: Number(ordinalGradeRange[1]),
      gradeCompletedMax: Number(ordinalGradeRange[2]),
      gradeSource: "grade",
      stateRestriction,
    };
  }

  if (lower.includes("completing grades")) {
    const m = lower.match(/completing grades?\s*(\d+)\s*[–-]\s*(\d+)/i);
    if (m) {
      return {
        gradeDisplay,
        gradeCompletedMin: Number(m[1]),
        gradeCompletedMax: Number(m[2]),
        gradeSource: "grade",
        stateRestriction,
      };
    }
  }

  // Plain "Grades X–Y" at the start (current/completed convention — no −1).
  const gradeRange = lower.match(/^\s*grades?\s*(\d+)\s*[–-]\s*(\d+)/i);
  if (gradeRange) {
    return {
      gradeDisplay,
      gradeCompletedMin: Number(gradeRange[1]),
      gradeCompletedMax: Number(gradeRange[2]),
      gradeSource: "grade",
      stateRestriction,
    };
  }

  const currentGrade = lower.match(/\bcurrent\s+(\d+)(?:st|nd|rd|th)\b/);
  if (currentGrade) {
    const grade = Number(currentGrade[1]);
    return {
      gradeDisplay,
      gradeCompletedMin: grade,
      gradeCompletedMax: grade,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  const hasRisingLanguage = /\brising\b/i.test(lower) && !/\bnot rising\b/i.test(lower);

  // Rising language — translate site grade to completed grade (−1).
  if (hasRisingLanguage && /soph\s*\/?\s*jr\s*\/?\s*sr/.test(lower)) {
    return {
      gradeDisplay,
      gradeCompletedMin: 9,
      gradeCompletedMax: 11,
      gradeSource: "mixed",
      stateRestriction,
    };
  }

  if (hasRisingLanguage && /jr\s*\/?\s*sr/.test(lower)) {
    const ageMatch = lower.match(/\((\d+)\s+by\s+(?:jun|july)/i);
    if (ageMatch) {
      return {
        gradeDisplay,
        gradeCompletedMin: 10,
        gradeCompletedMax: 11,
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    return {
      gradeDisplay,
      gradeCompletedMin: 10,
      gradeCompletedMax: 11,
      gradeSource: "mixed",
      stateRestriction,
    };
  }

  if (hasRisingLanguage) {
    const gradeRangeInRising = lower.match(/grades?\s*(\d+)\s*[–-]\s*(\d+)/i);
    if (gradeRangeInRising) {
      const a = Number(gradeRangeInRising[1]);
      const b = Number(gradeRangeInRising[2]);
      return {
        gradeDisplay,
        gradeCompletedMin: risingToCompleted(Math.min(a, b)),
        gradeCompletedMax: risingToCompleted(Math.max(a, b)),
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    const nums = [...lower.matchAll(/(\d+)(?:st|nd|rd|th)?/g)]
      .map((m) => Number(m[1]))
      .filter((n) => n >= 3 && n <= 12);
    if (nums.length >= 2) {
      return {
        gradeDisplay,
        gradeCompletedMin: risingToCompleted(Math.min(...nums)),
        gradeCompletedMax: risingToCompleted(Math.max(...nums)),
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    const g = parseGradeNumber(lower.replace("rising", ""));
    if (g) {
      const completed = risingToCompleted(g);
      return {
        gradeDisplay,
        gradeCompletedMin: completed,
        gradeCompletedMax: completed,
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    if (lower.includes("junior")) {
      return {
        gradeDisplay,
        gradeCompletedMin: 10,
        gradeCompletedMax: 10,
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    if (lower.includes("senior")) {
      return {
        gradeDisplay,
        gradeCompletedMin: 11,
        gradeCompletedMax: 11,
        gradeSource: "mixed",
        stateRestriction,
      };
    }
    if (lower.includes("soph")) {
      return {
        gradeDisplay,
        gradeCompletedMin: 9,
        gradeCompletedMax: 9,
        gradeSource: "mixed",
        stateRestriction,
      };
    }
  }

  if (lower.includes("current junior")) {
    return {
      gradeDisplay,
      gradeCompletedMin: 11,
      gradeCompletedMax: 11,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  if (lower.includes("current sophomore")) {
    return {
      gradeDisplay,
      gradeCompletedMin: 10,
      gradeCompletedMax: 10,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  const ages = lower.match(/ages?\s*(\d+)\s*[–-]\s*(\d+)/i);
  if (ages) {
    const [minG, maxG] = ageRangeToGrades(Number(ages[1]), Number(ages[2]));
    return {
      gradeDisplay,
      gradeCompletedMin: minG,
      gradeCompletedMax: maxG,
      gradeSource: "age",
      stateRestriction,
    };
  }

  if (lower.includes("entering") || lower.includes("completed") || lower.includes("completing")) {
    const m = lower.match(/(\d+)(?:st|nd|rd|th)?\s*[–-]\s*(\d+)/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      return {
        gradeDisplay,
        gradeCompletedMin: Math.min(a, b),
        gradeCompletedMax: Math.max(a, b),
        gradeSource: "grade",
        stateRestriction,
      };
    }
    const single = parseGradeNumber(lower);
    if (single) {
      return {
        gradeDisplay,
        gradeCompletedMin: single,
        gradeCompletedMax: single,
        gradeSource: "grade",
        stateRestriction,
      };
    }
  }

  if (/\b(?:hs|high school)\s+sophomores?\b/.test(lower) || /\b(?:hs|high school)\s+soph\b/.test(lower)) {
    return {
      gradeDisplay,
      gradeCompletedMin: 10,
      gradeCompletedMax: 10,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  if (/\b(?:hs|high school)\s+juniors?\b/.test(lower) || lower === "juniors" || lower === "junior") {
    return {
      gradeDisplay,
      gradeCompletedMin: 11,
      gradeCompletedMax: 11,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  if (/\b(?:hs|high school)\s+seniors?\b/.test(lower) || lower === "seniors" || lower === "senior") {
    return {
      gradeDisplay,
      gradeCompletedMin: 12,
      gradeCompletedMax: 12,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  if (lower.includes("high school") || lower.includes("hs ")) {
    return {
      gradeDisplay,
      gradeCompletedMin: 9,
      gradeCompletedMax: 12,
      gradeSource: "mixed",
      stateRestriction,
    };
  }

  if (lower.includes("middle") || lower.includes("grades 6")) {
    return {
      gradeDisplay,
      gradeCompletedMin: 6,
      gradeCompletedMax: 8,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  const singleGrade = parseGradeNumber(lower);
  if (singleGrade) {
    return {
      gradeDisplay,
      gradeCompletedMin: singleGrade,
      gradeCompletedMax: singleGrade,
      gradeSource: "grade",
      stateRestriction,
    };
  }

  return {
    gradeDisplay,
    gradeCompletedMin: 6,
    gradeCompletedMax: 12,
    gradeSource: "mixed",
    stateRestriction,
  };
}

export function gradeMatchesFilter(
  program: Pick<Program, "gradeCompletedMin" | "gradeCompletedMax">,
  gradesCompleted: number[],
): boolean {
  if (gradesCompleted.length === 0) return false;
  return gradesCompleted.some(
    (g) => g >= program.gradeCompletedMin && g <= program.gradeCompletedMax,
  );
}
