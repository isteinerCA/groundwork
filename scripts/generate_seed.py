#!/usr/bin/env python3
"""Generate data/seed/programs.json from CSV. Run: python3 scripts/generate_seed.py"""
from __future__ import annotations

import csv
import json
import re
from calendar import monthrange
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data/source/summer-programs.csv"
FLAGS_PATH = ROOT / "data/seed/flags.json"
OUT_PATH = ROOT / "data/seed/programs.json"

CATEGORIES = {
    "Artificial Intelligence": "artificial-intelligence",
    "STEM/Engineering": "stem-engineering",
    "College-Credit Pre-College": "college-credit-pre-college",
    "Marine Science": "marine-science",
    "Writing/Humanities": "writing-humanities",
    "Traditional Camp": "traditional-camp",
    "Outdoor/Wilderness": "outdoor-wilderness",
    "Cultural Exchange": "cultural-exchange",
    "Leadership/Gifted": "leadership-gifted",
    "Mathematics": "mathematics",
    "Biomedical": "biomedical",
    "Arts": "arts",
}


def slugify(name: str, track: str = "") -> str:
    base = f"{name} {track}".strip()
    s = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")
    return s[:100]


def normalize_admission(raw: str) -> tuple[str, str]:
    t = raw.strip()
    lower = t.lower()
    if re.search(r"first[- ]?come|^rolling$|open enrollment", lower):
        return "first_come", t
    if re.search(r"highly competitive|highly selective|\d+% acceptance", lower):
        return "highly_competitive", t
    if "highly" in lower or "competitive" in lower:
        return "highly_competitive", t
    if re.search(r"first[- ]?come|first come", lower):
        return "first_come", t
    if "rolling" in lower and "selective" not in lower:
        return "first_come", t
    return "application", t


def _strip_ancillary_fees(raw: str) -> str:
    s = raw
    s = re.sub(
        r"(?:\+\s*)?\$\s*[\d,]+(?:\.\d+)?\s*(?:non[- ]?refundable\s+)?application fees?",
        "",
        s,
        flags=re.I,
    )
    s = re.sub(r"application fees?\s*(?:[:.]?\s*)?\$\s*[\d,]+(?:\.\d+)?", "", s, flags=re.I)
    s = re.sub(r"\(\+\s*\$\s*[\d,]+(?:\.\d+)?\s*reading fees?\)", "", s, flags=re.I)
    s = re.sub(r"(?:\+\s*)?\$\s*[\d,]+(?:\.\d+)?\s*reading fees?", "", s, flags=re.I)
    return s


def parse_price(raw: str) -> dict:
    t = raw.strip()
    if not t:
        return {"priceDisplay": t, "priceMin": None, "priceMax": None, "priceUnknown": True, "fullyFunded": False}
    if re.search(r"contact program", t, re.I):
        return {"priceDisplay": t, "priceMin": None, "priceMax": None, "priceUnknown": True, "fullyFunded": False}
    if re.search(r"^free$|fully funded|free \(fully funded\)|free/subsidized|\$0\b", t, re.I):
        return {"priceDisplay": t, "priceMin": 0, "priceMax": 0, "priceUnknown": False, "fullyFunded": True}
    nums = [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*(?:\.\d+)?", _strip_ancillary_fees(t))]
    if not nums:
        return {"priceDisplay": t, "priceMin": None, "priceMax": None, "priceUnknown": True, "fullyFunded": False}
    return {
        "priceDisplay": t,
        "priceMin": min(nums),
        "priceMax": max(nums),
        "priceUnknown": False,
        "fullyFunded": min(nums) == 0 and max(nums) == 0,
    }


def normalize_format(raw: str) -> dict:
    display = raw.strip() or "Varies"
    lower = display.lower()
    tags = set()
    has_online = bool(re.search(r"\bonline\b", lower))
    has_res = bool(re.search(r"residential|expedition|overnight|homestay", lower))
    has_comm = "commuter" in lower
    has_day = "day" in lower and not has_comm
    if has_online:
        tags.add("online")
    if has_res or lower == "varies":
        tags.add("residential")
    if has_comm or has_day:
        tags.add("commuter")
    if not tags:
        tags.add("residential")
    return {"formatDisplay": display, "formatTags": sorted(tags)}


def parse_length_days(raw: str) -> dict:
    lower = raw.strip().lower()
    if not lower or "self-paced" in lower or "varies" in lower:
        return {"lengthMinDays": None, "lengthMaxDays": None}
    day_values = []
    week_range = re.search(r"(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*weeks?", lower)
    if week_range:
        day_values.extend(
            [round(float(week_range.group(1)) * 7), round(float(week_range.group(2)) * 7)]
        )
    for match in re.finditer(r"(\d+(?:\.\d+)?)\s*weeks?", lower):
        day_values.append(round(float(match.group(1)) * 7))
    day_range = re.search(r"(\d+)\s*[-–]\s*(\d+)\s*days?", lower)
    if day_range:
        day_values.extend([int(day_range.group(1)), int(day_range.group(2))])
    for match in re.finditer(r"(\d+)\s*days?", lower):
        day_values.append(int(match.group(1)))
    if not day_values:
        return {"lengthMinDays": None, "lengthMaxDays": None}
    return {"lengthMinDays": min(day_values), "lengthMaxDays": max(day_values)}


def normalize_duration(raw: str) -> dict:
    display = raw.strip()
    length = parse_length_days(display)
    bucket_days = length["lengthMinDays"] or length["lengthMaxDays"] or 0
    if bucket_days < 14:
        bucket = "under_2_weeks"
    elif bucket_days <= 28:
        bucket = "two_to_four_weeks"
    else:
        bucket = "four_plus_weeks"
    return {"durationBucket": bucket, "lengthDisplay": display, **length}


MONTH_BY_TOKEN = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}

SUMMER_YEAR = 2026


def _month_num(token: str) -> int | None:
    cleaned = token.strip().lower().rstrip(".")
    if cleaned in MONTH_BY_TOKEN:
        return MONTH_BY_TOKEN[cleaned]
    for key, value in MONTH_BY_TOKEN.items():
        if cleaned.startswith(key):
            return value
    return None


def _default_day(modifier: str | None, position: str) -> int:
    if not modifier:
        return 1 if position == "start" else 28
    lower = modifier.lower()
    if "early" in lower:
        return 1 if position == "start" else 10
    if "mid" in lower:
        return 10 if position == "start" else 20
    if "late" in lower:
        return 15 if position == "start" else 28
    return 1 if position == "start" else 28


def _make_date(year: int, month: int, day: int) -> date:
    last = monthrange(year, month)[1]
    return date(year, month, min(max(day, 1), last))


def _month_last_day(year: int, month: int) -> date:
    return date(year, month, monthrange(year, month)[1])


def parse_dates_display(raw: str) -> dict:
    display = raw.strip()
    if not display:
        return {"dateStart": None, "dateEnd": None, "datesParseQuality": "unknown"}

    lower = display.lower()
    if any(term in lower for term in ("available anytime", "self-paced", "year-round")):
        return {"dateStart": None, "dateEnd": None, "datesParseQuality": "unknown"}

    if re.search(r"\bsummer\b", lower) and not re.search(
        r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b", lower
    ):
        return {
            "dateStart": f"{SUMMER_YEAR}-06-01",
            "dateEnd": f"{SUMMER_YEAR}-08-31",
            "datesParseQuality": "approximate",
        }

    collected: list[date] = []
    has_exact_day = False

    # Same-month numeric range: Jun 15-26
    for match in re.finditer(
        r"(?P<mod>early|mid|late)?\s*(?P<m1>[A-Za-z]+)\.?\s*(?P<d1>\d{1,2})\s*[-–—]\s*(?P<d2>\d{1,2})",
        display,
        re.I,
    ):
        month = _month_num(match.group("m1"))
        if not month:
            continue
        start_day = int(match.group("d1"))
        end_day = int(match.group("d2"))
        collected.extend(
            [
                _make_date(SUMMER_YEAR, month, start_day),
                _make_date(SUMMER_YEAR, month, end_day),
            ]
        )
        has_exact_day = True

    # Cross-month range: Jul 5 - Aug 1, Jun 28-Jul 24
    for match in re.finditer(
        r"(?P<mod1>early|mid|late)?\s*(?P<m1>[A-Za-z]+)\.?\s*(?P<d1>\d{1,2})?\s*[-–—]\s*(?P<mod2>early|mid|late)?\s*(?P<m2>[A-Za-z]+)\.?\s*(?P<d2>\d{1,2})?",
        display,
        re.I,
    ):
        month1 = _month_num(match.group("m1"))
        month2 = _month_num(match.group("m2"))
        if not month1 or not month2:
            continue
        if month1 == month2 and match.group("d1") and match.group("d2") and not match.group("d2"):
            continue
        day1 = (
            int(match.group("d1"))
            if match.group("d1")
            else _default_day(match.group("mod1"), "start")
        )
        day2 = (
            int(match.group("d2"))
            if match.group("d2")
            else _default_day(match.group("mod2"), "end")
        )
        if month1 == month2 and match.group("d1") and match.group("d2"):
            continue  # handled by same-month rule above
        collected.extend(
            [
                _make_date(SUMMER_YEAR, month1, day1),
                _make_date(SUMMER_YEAR, month2, day2),
            ]
        )
        if match.group("d1") and match.group("d2"):
            has_exact_day = True

    # Month-only spans: Jun - Aug, Jun & Jul
    for match in re.finditer(
        r"(?P<mod1>early|mid|late)?\s*(?P<m1>[A-Za-z]+)\.?\s*(?:[-–—&]|and)\s*(?P<mod2>early|mid|late)?\s*(?P<m2>[A-Za-z]+)\.?",
        display,
        re.I,
    ):
        month1 = _month_num(match.group("m1"))
        month2 = _month_num(match.group("m2"))
        if not month1 or not month2:
            continue
        start_day = _default_day(match.group("mod1"), "start")
        end_day = _default_day(match.group("mod2"), "end")
        collected.extend(
            [
                _make_date(SUMMER_YEAR, month1, start_day),
                _make_date(SUMMER_YEAR, month2, end_day),
            ]
        )

    # Single month with optional modifier: Mid-July, Early June
    for match in re.finditer(
        r"(?P<mod>early|mid|late)\s*(?P<m1>[A-Za-z]+)\.?|(?P<m2>[A-Za-z]+)\.?\s*(?P=mod)",
        display,
        re.I,
    ):
        month_token = match.group("m1") or match.group("m2")
        month = _month_num(month_token or "")
        if not month:
            continue
        modifier = match.group("mod")
        collected.extend(
            [
                _make_date(SUMMER_YEAR, month, _default_day(modifier, "start")),
                _make_date(SUMMER_YEAR, month, _default_day(modifier, "end")),
            ]
        )

    # Standalone month tokens when no ranges matched yet
    if not collected:
        for match in re.finditer(r"\b([A-Za-z]{3,9})\.?\b", display):
            month = _month_num(match.group(1))
            if month:
                collected.extend(
                    [_make_date(SUMMER_YEAR, month, 1), _month_last_day(SUMMER_YEAR, month)]
                )

    if not collected:
        return {"dateStart": None, "dateEnd": None, "datesParseQuality": "unknown"}

    start = min(collected)
    end = max(collected)
    quality = "exact" if has_exact_day else "approximate"
    return {
        "dateStart": start.isoformat(),
        "dateEnd": end.isoformat(),
        "datesParseQuality": quality,
    }


AGE_TO_GRADE = [(11, 5), (12, 6), (13, 7), (14, 8), (15, 9), (16, 10), (17, 11), (18, 12), (19, 12)]


def _age_range_to_grades(min_age: int, max_age: int) -> tuple[int, int]:
    grades_in_range = [g for age, g in AGE_TO_GRADE if min_age <= age <= max_age]
    if not grades_in_range:
        return max(5, min_age - 6), min(12, max_age - 6)
    return min(grades_in_range), max(grades_in_range)


def _parse_grade_number(token: str) -> int | None:
    t = token.lower()
    ord_match = re.search(r"(\d+)(?:st|nd|rd|th)?", t)
    if ord_match:
        return int(ord_match.group(1))
    named = {
        "freshman": 9,
        "sophomore": 10,
        "junior": 11,
        "senior": 12,
        "soph": 10,
        "jr": 11,
        "sr": 12,
    }
    for key, grade in named.items():
        if key in t:
            return grade
    return None


def _rising_grade(completed: int) -> int:
    return max(5, completed)


def _current_grade(completed: int) -> int:
    return min(12, completed + 1)


def normalize_grade(raw: str) -> dict:
    """Port of src/lib/data/normalize-grade.ts for seed generation."""
    display = raw.strip()
    lower = display.lower()

    state = None
    state_match = re.search(r"\b([a-z]{2})\s+(?:residents?|high school|only)\b", lower)
    if state_match:
        state = state_match.group(1).upper()
    if "ca high school" in lower or "california residents" in lower:
        state = "CA"

    ages = re.search(r"ages?\s*(\d+)\s*[–-]\s*(\d+)", lower, re.I)
    if ages:
        min_g, max_g = _age_range_to_grades(int(ages.group(1)), int(ages.group(2)))
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": min_g,
            "gradeCompletedMax": max_g,
            "gradeSource": "age",
            "stateRestriction": state,
        }

    grade_range = re.search(r"grades?\s*(\d+)\s*[–-]\s*(\d+)", lower, re.I)
    if grade_range:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": int(grade_range.group(1)),
            "gradeCompletedMax": int(grade_range.group(2)),
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if "completing grades" in lower:
        completing = re.search(r"completing grades?\s*(\d+)\s*[–-]\s*(\d+)", lower, re.I)
        if completing:
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": int(completing.group(1)),
                "gradeCompletedMax": int(completing.group(2)),
                "gradeSource": "grade",
                "stateRestriction": state,
            }

    if "rising" in lower and re.search(r"soph\s*/?\s*jr\s*/?\s*sr", lower):
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 9,
            "gradeCompletedMax": 11,
            "gradeSource": "mixed",
            "stateRestriction": state,
        }

    if "rising" in lower and re.search(r"jr\s*/?\s*sr", lower):
        age_match = re.search(r"\((\d+)\s+by\s+(?:jun|july)", lower, re.I)
        if age_match:
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": 10,
                "gradeCompletedMax": 11,
                "gradeSource": "mixed",
                "stateRestriction": state,
            }
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 10,
            "gradeCompletedMax": 11,
            "gradeSource": "mixed",
            "stateRestriction": state,
        }

    if "rising" in lower:
        nums = [int(m.group(1)) for m in re.finditer(r"(\d+)(?:st|nd|rd|th)?", lower)]
        if len(nums) >= 2:
            completed = [_rising_grade(n - 1) for n in nums]
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": min(completed),
                "gradeCompletedMax": max(completed),
                "gradeSource": "mixed",
                "stateRestriction": state,
            }
        g = _parse_grade_number(lower.replace("rising", ""))
        if g:
            completed = _rising_grade(g - 1)
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": completed,
                "gradeCompletedMax": completed,
                "gradeSource": "grade",
                "stateRestriction": state,
            }
        if "junior" in lower:
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": 10,
                "gradeCompletedMax": 10,
                "gradeSource": "grade",
                "stateRestriction": state,
            }
        if "senior" in lower:
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": 11,
                "gradeCompletedMax": 11,
                "gradeSource": "grade",
                "stateRestriction": state,
            }
        if "soph" in lower:
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": 9,
                "gradeCompletedMax": 9,
                "gradeSource": "grade",
                "stateRestriction": state,
            }

    if "current junior" in lower:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 11,
            "gradeCompletedMax": 11,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if "current sophomore" in lower:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 10,
            "gradeCompletedMax": 10,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if "entering" in lower or "completed" in lower:
        span = re.search(r"(\d+)(?:st|nd|rd|th)?\s*[–-]\s*(\d+)", lower)
        if span:
            a, b = int(span.group(1)), int(span.group(2))
            min_g = _rising_grade(a - 1) if "entering" in lower else a
            max_g = _rising_grade(b - 1) if "entering" in lower else b
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": min(min_g, max_g),
                "gradeCompletedMax": max(min_g, max_g),
                "gradeSource": "grade",
                "stateRestriction": state,
            }
        single = _parse_grade_number(lower)
        if single:
            completed = _rising_grade(single - 1) if "entering" in lower else single
            return {
                "gradeDisplay": display,
                "gradeCompletedMin": completed,
                "gradeCompletedMax": completed,
                "gradeSource": "grade",
                "stateRestriction": state,
            }

    if re.search(r"\b(?:hs|high school)\s+sophomores?\b", lower) or re.search(
        r"\b(?:hs|high school)\s+soph\b", lower
    ):
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 9,
            "gradeCompletedMax": 9,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if re.search(r"\b(?:hs|high school)\s+juniors?\b", lower) or lower in {"juniors", "junior"}:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 10,
            "gradeCompletedMax": 10,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if re.search(r"\b(?:hs|high school)\s+seniors?\b", lower) or lower in {"seniors", "senior"}:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 11,
            "gradeCompletedMax": 11,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    if "high school" in lower or "hs " in lower:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 8,
            "gradeCompletedMax": 12,
            "gradeSource": "mixed",
            "stateRestriction": state,
        }

    if "middle" in lower or "grades 6" in lower:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": 6,
            "gradeCompletedMax": 8,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    single_grade = _parse_grade_number(lower)
    if single_grade:
        completed = (
            _current_grade(single_grade) - 1 if "current" in lower else single_grade
        )
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": completed,
            "gradeCompletedMax": completed,
            "gradeSource": "grade",
            "stateRestriction": state,
        }

    return {
        "gradeDisplay": display,
        "gradeCompletedMin": 6,
        "gradeCompletedMax": 12,
        "gradeSource": "mixed",
        "stateRestriction": state,
    }


def detect_international(location: str) -> bool:
    if re.search(r",\s*[A-Z]{2}\b", location) and not re.search(r",\s*UK\b", location, re.I):
        if re.search(r",\s*(CA|NY|MA|PA|TX|FL|IL|WA|OR|NC|GA|VA|MD|OH|MI|IN|TN|AZ|CO|UT|NM|HI|AL|SC|LA|MO|WI|MN|IA|KS|NE|OK|KY|CT|RI|NH|VT|ME|DE|NJ|WV|ID|MT|WY|ND|SD|NV|AR|MS|DC)\b", location):
            return False
    return bool(re.search(r"global|china|bahamas|wales|uk|bvi|canada|eleuthera|paraguay|panama|costa rica|peru|fiji|alps|chamonix|europe|japan|international", location, re.I))


def load_flag_rules():
    if not FLAGS_PATH.exists():
        return []
    return json.loads(FLAGS_PATH.read_text())


def merge_flags(name: str, slug: str, csv_flags: list, rules: list) -> list:
    by_id = {}
    for rule in rules:
        inc = rule.get("match", {}).get("nameIncludes", "")
        if inc and inc in name:
            for f in rule.get("flags", []):
                by_id[f["id"]] = f
    for f in csv_flags:
        by_id[f["id"]] = f
    return list(by_id.values())


def main():
    verified = date.today().isoformat()
    rules = load_flag_rules()
    programs = []

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        for i, row in enumerate(csv.DictReader(f)):
            cat = CATEGORIES.get(row["Primary Category"].strip())
            if not cat:
                print(f"Skip unknown category: {row['Primary Category']}")
                continue
            track = (row.get("Track/Session") or "").strip()
            slug = slugify(row["Program Name"], track)
            admission_type, admission_display = normalize_admission(row["Admission Type"])
            price = parse_price(row["Price"])
            fmt = normalize_format(row.get("Format", ""))
            dur = normalize_duration(row.get("Length", ""))
            dates = parse_dates_display(row.get("Dates 2026") or "")
            grades = normalize_grade(row["Grades"])
            csv_flags = []
            if row.get("Flags", "").strip():
                try:
                    csv_flags = json.loads(row["Flags"])
                except json.JSONDecodeError:
                    pass
            flags = merge_flags(row["Program Name"], slug, csv_flags, rules)
            programs.append({
                "id": f"prog-{i+1}",
                "slug": slug,
                "name": row["Program Name"].strip(),
                "category": cat,
                "secondaryTags": [t.strip() for t in re.split(r"[,;]", row.get("Secondary Tags", "")) if t.strip()],
                **({"trackDetail": track} if track else {}),
                **grades,
                "admissionType": admission_type,
                "admissionDisplay": admission_display,
                **fmt,
                **dur,
                "datesDisplay": (row.get("Dates 2026") or "").strip(),
                **dates,
                "locationDisplay": row["Location"].strip(),
                "isInternational": detect_international(row["Location"]),
                "hasCollegeCredit": bool(re.match(r"^yes", row.get("Credit", ""), re.I)),
                "creditDisplay": row.get("Credit", "").strip(),
                **price,
                "financialAidAvailable": bool(re.search(r"aid|scholar|need-based|subsid", row["Price"], re.I)),
                "websiteUrl": row["URL"].strip(),
                "flags": flags,
                "dataVerifiedAt": verified,
            })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps({"verifiedAt": verified, "count": len(programs), "programs": programs}, indent=2))
    print(f"Wrote {len(programs)} programs → {OUT_PATH}")


if __name__ == "__main__":
    main()
