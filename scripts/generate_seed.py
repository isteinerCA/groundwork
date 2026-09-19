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
CSV_2027_PATH = ROOT / "data/source/summer-programs-2027.csv"
FLAGS_PATH = ROOT / "data/seed/flags.json"
DAY_TO_DAY_PATH = ROOT / "data/seed/day-to-day.json"
PARTICIPANT_GENDER_PATH = ROOT / "data/seed/participant-gender.json"
OUT_PATH = ROOT / "data/seed/programs.json"

PARTICIPANT_GENDER_IDS = {"coed", "boys", "girls", "girls-inclusive"}

PUBLISHED_REVIEW_STATUSES = {"verified", "provisional", "awaiting_source"}
DEFAULT_REVIEW_STATUS = "provisional"
LEGACY_CATALOG_SEASON_YEAR = 2026


def parse_review_status(raw: str | None) -> str:
    normalized = re.sub(r"\s+", "_", (raw or "").strip().lower())
    if normalized == "needs_review":
        return "needs_review"
    if normalized in PUBLISHED_REVIEW_STATUSES:
        return normalized
    return DEFAULT_REVIEW_STATUS


def parse_season_year(raw: str | None) -> int:
    try:
        year = int((raw or "").strip())
        if 2000 <= year <= 2100:
            return year
    except ValueError:
        pass
    return LEGACY_CATALOG_SEASON_YEAR


def csv_cell(row: dict, *keys: str) -> str:
    for key in keys:
        value = (row.get(key) or "").strip()
        if value:
            return value
    return ""


def parse_yes_no(raw: str) -> bool:
    return raw.strip().lower() == "yes"


def parse_optional_int(raw: str) -> int | None:
    if not raw.strip():
        return None
    try:
        return int(raw.strip())
    except ValueError:
        return None


def parse_optional_number(raw: str) -> float | None:
    if not raw.strip():
        return None
    try:
        return float(raw.replace(",", "").strip())
    except ValueError:
        return None


def parse_iso_date(raw: str) -> str | None:
    value = raw.strip()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return None
    try:
        date.fromisoformat(value)
    except ValueError:
        return None
    return value


def format_iso_date_range(start: str, end: str) -> str:
    start_date = date.fromisoformat(start)
    end_date = date.fromisoformat(end)
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    if start_date.year == end_date.year and start_date.month == end_date.month:
        if start_date.day == end_date.day:
            return f"{month_names[start_date.month - 1]} {start_date.day}, {start_date.year}"
        return f"{month_names[start_date.month - 1]} {start_date.day}–{end_date.day}, {start_date.year}"
    return (
        f"{month_names[start_date.month - 1]} {start_date.day} – "
        f"{month_names[end_date.month - 1]} {end_date.day}, {start_date.year}"
    )


def parse_dates_parse_quality(raw: str) -> str | None:
    value = raw.strip().lower()
    if value in {"exact", "approximate", "unknown"}:
        return value
    return None


def parse_dates_from_csv(row: dict, season_year: int) -> dict:
    date_start = parse_iso_date(csv_cell(row, "Date Start"))
    date_end = parse_iso_date(csv_cell(row, "Date End"))
    quality_override = parse_dates_parse_quality(csv_cell(row, "Dates Parse Quality"))
    dates_display = csv_cell(row, "Dates Display", "Dates 2027", "Dates 2026")

    if date_start and date_end:
        if not dates_display:
            dates_display = format_iso_date_range(date_start, date_end)
        return {
            "datesDisplay": dates_display,
            "dateStart": date_start,
            "dateEnd": date_end,
            "datesParseQuality": quality_override or "exact",
        }

    parsed = parse_dates_display(dates_display, season_year)
    if not dates_display and parsed.get("dateStart") and parsed.get("dateEnd"):
        dates_display = format_iso_date_range(parsed["dateStart"], parsed["dateEnd"])
    return {
        "datesDisplay": dates_display,
        **parsed,
        "datesParseQuality": quality_override or parsed.get("datesParseQuality", "unknown"),
    }


def parse_grades_from_csv(row: dict) -> dict:
    display = csv_cell(row, "Grades Display", "Grades")
    min_override = parse_optional_int(csv_cell(row, "Grade Completed Min"))
    max_override = parse_optional_int(csv_cell(row, "Grade Completed Max"))
    parsed = normalize_grade(display or "Grades 6-12")
    if not parsed.get("stateRestriction"):
        parsed.pop("stateRestriction", None)

    if (
        min_override is not None
        and max_override is not None
        and 1 <= min_override <= 12
        and 1 <= max_override <= 12
        and min_override <= max_override
    ):
        parsed["gradeDisplay"] = display or f"Grades {min_override}–{max_override}"
        parsed["gradeCompletedMin"] = min_override
        parsed["gradeCompletedMax"] = max_override
    return parsed


def parse_duration_from_csv(row: dict) -> dict:
    duration = normalize_duration(csv_cell(row, "Length Display", "Length") or "Unknown")
    min_override = parse_optional_int(csv_cell(row, "Length Min Days"))
    max_override = parse_optional_int(csv_cell(row, "Length Max Days"))
    if min_override is not None:
        duration["lengthMinDays"] = min_override
    if max_override is not None:
        duration["lengthMaxDays"] = max_override
    if duration.get("lengthMinDays") is not None and duration.get("lengthMaxDays") is None:
        duration["lengthMaxDays"] = duration["lengthMinDays"]
    if duration.get("lengthMaxDays") is not None and duration.get("lengthMinDays") is None:
        duration["lengthMinDays"] = duration["lengthMaxDays"]
    return duration


def parse_price_from_csv(row: dict) -> dict:
    price_display = csv_cell(row, "Price Display", "Price")
    parsed = parse_price(price_display)
    min_override = parse_optional_number(csv_cell(row, "Price Min"))
    max_override = parse_optional_number(csv_cell(row, "Price Max"))
    fully_funded_raw = csv_cell(row, "Fully Funded")
    financial_aid_raw = csv_cell(row, "Financial Aid Available")

    if min_override is not None:
        parsed["priceMin"] = min_override
    if max_override is not None:
        parsed["priceMax"] = max_override
    if fully_funded_raw:
        parsed["fullyFunded"] = parse_yes_no(fully_funded_raw)
    if min_override is not None or max_override is not None:
        parsed["priceUnknown"] = False

    financial_aid = (
        parse_yes_no(financial_aid_raw)
        if financial_aid_raw
        else bool(re.search(r"aid|scholar|need-based|subsid", price_display, re.I))
    )
    return {**parsed, "financialAidAvailable": financial_aid}


def parse_credit_from_csv(row: dict) -> dict:
    credit_display = csv_cell(row, "Credit Display", "Credit")
    has_credit_raw = csv_cell(row, "Has College Credit")
    has_college_credit = (
        parse_yes_no(has_credit_raw) if has_credit_raw else bool(re.match(r"^yes", credit_display, re.I))
    )
    return {"creditDisplay": credit_display, "hasCollegeCredit": has_college_credit}


def detect_international_from_csv(row: dict, location_display: str) -> bool:
    country = csv_cell(row, "Country").lower()
    if country and country not in {"us", "usa", "united states"}:
        return True
    return detect_international(location_display)


US_STATE_ABBRS = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
    "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
    "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
}

STATE_NAME_TO_ABBR = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY", "district of columbia": "DC",
}


def parse_location_state_from_csv(row: dict) -> str | None:
    """US state/DC abbreviation from the CSV State column — location, not residency."""
    raw = csv_cell(row, "State", "State Abbr").strip()
    if not raw:
        return None
    if len(raw) == 2 and raw.isalpha():
        abbr = raw.upper()
        return abbr if abbr in US_STATE_ABBRS else None
    return STATE_NAME_TO_ABBR.get(raw.lower())


def parse_state_restriction_from_grades(raw: str) -> str | None:
    """Actual residency limit from eligibility text — not the location State column."""
    trimmed = raw.strip()
    if not trimmed:
        return None
    lower = trimmed.lower()
    abbr_match = re.search(r"\b([A-Z]{2})\s+(?:residents?|high school students?)\b", trimmed)
    if abbr_match and abbr_match.group(1) in US_STATE_ABBRS:
        return abbr_match.group(1)
    for name, abbr in STATE_NAME_TO_ABBR.items():
        if (
            f"{name} residents" in lower
            or f"{name} resident" in lower
            or f"{name} high school students" in lower
        ):
            return abbr
    if "california residents" in lower or re.search(r"\bca high school\b", lower):
        return "CA"
    return None


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
    "Business/Entrepreneurship": "business-entrepreneurship",
    "International Relations/Diplomacy": "international-relations",
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


def parse_dates_display(raw: str, season_year: int = LEGACY_CATALOG_SEASON_YEAR) -> dict:
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
            "dateStart": f"{season_year}-06-01",
            "dateEnd": f"{season_year}-08-31",
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
                _make_date(season_year, month, start_day),
                _make_date(season_year, month, end_day),
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
                _make_date(season_year, month1, day1),
                _make_date(season_year, month2, day2),
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
                _make_date(season_year, month1, start_day),
                _make_date(season_year, month2, end_day),
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
                _make_date(season_year, month, _default_day(modifier, "start")),
                _make_date(season_year, month, _default_day(modifier, "end")),
            ]
        )

    # Standalone month tokens when no ranges matched yet
    if not collected:
        for match in re.finditer(r"\b([A-Za-z]{3,9})\.?\b", display):
            month = _month_num(match.group(1))
            if month:
                collected.extend(
                    [_make_date(season_year, month, 1), _month_last_day(season_year, month)]
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

    state = parse_state_restriction_from_grades(display)

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


def load_day_to_day_rules():
    if not DAY_TO_DAY_PATH.exists():
        return []
    return json.loads(DAY_TO_DAY_PATH.read_text())


def load_participant_gender_rules():
    if not PARTICIPANT_GENDER_PATH.exists():
        return []
    return json.loads(PARTICIPANT_GENDER_PATH.read_text())


DAY_TO_DAY_SOURCE_TYPES = {
    "official_policy",
    "program_faq",
    "third_party_synthesis",
    "not_found",
}


def is_valid_day_to_day(day_to_day: dict | None) -> bool:
    if not day_to_day:
        return False
    notes = (day_to_day.get("notes") or "").strip()
    source_type = day_to_day.get("sourceType")
    if not notes:
        return False
    return source_type in DAY_TO_DAY_SOURCE_TYPES


def _match_program_group_id(rule_group_id, program_group_id: str | None) -> bool:
    if not rule_group_id:
        return True
    if not program_group_id:
        return False
    if isinstance(rule_group_id, list):
        return program_group_id in rule_group_id
    return program_group_id == rule_group_id


def curated_rule_matches(match: dict, program: dict) -> bool:
    group_id = match.get("programGroupId")
    if not _match_program_group_id(group_id, program.get("programGroupId")):
        return False

    if not group_id:
        name = program.get("name", "")
        slug = program.get("slug", "")
        inc = match.get("nameIncludes", "")
        slug_inc = match.get("slugIncludes", "")
        if not ((inc and inc in name) or (slug_inc and slug_inc in slug)):
            return False
    else:
        name = program.get("name", "")
        slug = program.get("slug", "")
        inc = match.get("nameIncludes", "")
        slug_inc = match.get("slugIncludes", "")
        if inc and inc not in name:
            return False
        if slug_inc and slug_inc not in slug:
            return False

    offering_label = match.get("offeringLabel")
    if offering_label:
        label = (program.get("trackDetail") or "").strip()
        if label != offering_label:
            return False
    return True


def merge_day_to_day(program: dict, rules: list) -> dict | None:
    matches = [rule for rule in rules if curated_rule_matches(rule.get("match", {}), program)]
    for rule in matches:
        if rule.get("match", {}).get("offeringLabel") and is_valid_day_to_day(rule.get("dayToDay")):
            return rule["dayToDay"]
    for rule in matches:
        if not rule.get("match", {}).get("offeringLabel") and is_valid_day_to_day(rule.get("dayToDay")):
            return rule["dayToDay"]
    return None


def merge_flags(program: dict, csv_flags: list, rules: list) -> list:
    by_id = {}
    for rule in rules:
        if curated_rule_matches(rule.get("match", {}), program):
            for f in rule.get("flags", []):
                by_id[f["id"]] = f
    for f in csv_flags:
        by_id[f["id"]] = f
    return list(by_id.values())


def merge_participant_gender(program: dict, rules: list) -> str:
    for rule in rules:
        if curated_rule_matches(rule.get("match", {}), program):
            gender = rule.get("participantGender")
            if gender in PARTICIPANT_GENDER_IDS:
                return gender
    return "coed"


def load_superseded_from_refresh(refresh_path: Path) -> tuple[set[str], set[str]]:
    """Program groups/names replaced by rows in the rolling 2027 refresh CSV."""
    groups: set[str] = set()
    names: set[str] = set()
    if not refresh_path.exists():
        return groups, names
    with refresh_path.open(newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            if parse_review_status(row.get("Review Status")) == "needs_review":
                continue
            group_id = csv_cell(row, "Program Group ID", "Program Group Id")
            name = row.get("Program Name", "").strip()
            if group_id:
                groups.add(group_id)
            if name:
                names.add(name)
    return groups, names


def is_superseded_legacy_row(row: dict, superseded_groups: set[str], superseded_names: set[str]) -> bool:
    group_id = csv_cell(row, "Program Group ID", "Program Group Id")
    name = row.get("Program Name", "").strip()
    if group_id and group_id in superseded_groups:
        return True
    return bool(name and name in superseded_names)


def build_program_from_row(
    row: dict,
    program_id: str,
    verified: str,
    rules: list,
    day_to_day_rules: list,
    participant_gender_rules: list,
) -> dict | None:
    cat = CATEGORIES.get(row["Primary Category"].strip())
    if not cat:
        print(f"Skip unknown category: {row['Primary Category']}")
        return None
    review_status = parse_review_status(row.get("Review Status"))
    if review_status == "needs_review":
        return None
    track = csv_cell(row, "Track/Session", "Offering Label")
    program_group_id = csv_cell(row, "Program Group ID", "Program Group Id")
    institution = csv_cell(row, "Institution")
    description = csv_cell(row, "Description")
    season_year = parse_season_year(row.get("Season Year"))
    slug = slugify(row["Program Name"], track)
    admission_type, admission_display = normalize_admission(csv_cell(row, "Admission Type"))
    price = parse_price_from_csv(row)
    fmt = normalize_format(csv_cell(row, "Format"))
    dur = parse_duration_from_csv(row)
    dates = parse_dates_from_csv(row, season_year)
    grades = parse_grades_from_csv(row)
    credit = parse_credit_from_csv(row)
    location_display = csv_cell(row, "Location Display", "Location")
    location_state = parse_location_state_from_csv(row)
    csv_flags = []
    if row.get("Flags", "").strip():
        try:
            csv_flags = json.loads(row["Flags"])
        except json.JSONDecodeError:
            pass
    flags = merge_flags(
        {
            "name": row["Program Name"].strip(),
            "slug": slug,
            **({"programGroupId": program_group_id} if program_group_id else {}),
            **({"trackDetail": track} if track else {}),
        },
        csv_flags,
        rules,
    )
    program = {
        "id": program_id,
        "slug": slug,
        "name": row["Program Name"].strip(),
        **({"institution": institution} if institution else {}),
        **({"programGroupId": program_group_id} if program_group_id else {}),
        **({"description": description} if description else {}),
        "category": cat,
        "secondaryTags": [t.strip() for t in re.split(r"[,;]", row.get("Secondary Tags", "")) if t.strip()],
        **({"trackDetail": track} if track else {}),
        **grades,
        "admissionType": admission_type,
        "admissionDisplay": admission_display,
        **fmt,
        **dur,
        **dates,
        "seasonYear": season_year,
        "reviewStatus": review_status,
        "locationDisplay": location_display,
        **({"state": location_state} if location_state else {}),
        "isInternational": detect_international_from_csv(row, location_display),
        **credit,
        **price,
        "websiteUrl": csv_cell(row, "URL"),
        "flags": flags,
        "dataVerifiedAt": verified,
    }
    day_to_day = merge_day_to_day(program, day_to_day_rules)
    if day_to_day:
        program["dayToDay"] = day_to_day
    program["participantGender"] = merge_participant_gender(program, participant_gender_rules)
    return program


def main():
    verified = date.today().isoformat()
    rules = load_flag_rules()
    day_to_day_rules = load_day_to_day_rules()
    participant_gender_rules = load_participant_gender_rules()
    programs = []
    superseded_groups, superseded_names = load_superseded_from_refresh(CSV_2027_PATH)
    next_id = 1

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            if is_superseded_legacy_row(row, superseded_groups, superseded_names):
                continue
            program = build_program_from_row(
                row, f"prog-{next_id}", verified, rules, day_to_day_rules, participant_gender_rules
            )
            if program:
                programs.append(program)
                next_id += 1

    if CSV_2027_PATH.exists():
        with CSV_2027_PATH.open(newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                program = build_program_from_row(
                    row, f"prog-{next_id}", verified, rules, day_to_day_rules, participant_gender_rules
                )
                if program:
                    programs.append(program)
                    next_id += 1

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps({"verifiedAt": verified, "count": len(programs), "programs": programs}, indent=2))
    print(f"Wrote {len(programs)} programs → {OUT_PATH}")


if __name__ == "__main__":
    main()
