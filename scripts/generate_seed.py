#!/usr/bin/env python3
"""Generate data/seed/programs.json from CSV. Run: python3 scripts/generate_seed.py"""
from __future__ import annotations

import csv
import json
import re
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


def parse_price(raw: str) -> dict:
    t = raw.strip()
    if not t:
        return {"priceDisplay": t, "priceMin": None, "priceMax": None, "priceUnknown": True, "fullyFunded": False}
    if re.search(r"contact program", t, re.I):
        return {"priceDisplay": t, "priceMin": None, "priceMax": None, "priceUnknown": True, "fullyFunded": False}
    if re.search(r"^free$|fully funded|free \(fully funded\)|free/subsidized|\$0\b", t, re.I):
        return {"priceDisplay": t, "priceMin": 0, "priceMax": 0, "priceUnknown": False, "fullyFunded": True}
    nums = [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*(?:\.\d+)?", t)]
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
    if has_res or has_comm or has_day or lower == "varies":
        tags.add("residential")
    if not tags:
        tags.add("residential")
    if has_online and (has_res or has_comm):
        tags.add("both")
    return {"formatDisplay": display, "formatTags": sorted(tags)}


def normalize_duration(raw: str) -> dict:
    display = raw.strip()
    lower = display.lower()
    days = 0
    wm = re.search(r"(\d+(?:\.\d+)?)\s*weeks?", lower)
    dm = re.search(r"(\d+)\s*days?", lower)
    if wm:
        days = int(float(wm.group(1)) * 7)
    elif dm:
        days = int(dm.group(1))
    if days < 14:
        bucket = "under_2_weeks"
    elif days <= 28:
        bucket = "two_to_four_weeks"
    else:
        bucket = "four_plus_weeks"
    return {"durationBucket": bucket, "lengthDisplay": display}


def normalize_grade(raw: str) -> dict:
    display = raw.strip()
    lower = display.lower()
    state = None
    if "ca high school" in lower or "california residents" in lower:
        state = "CA"
    m = re.search(r"ages?\s*(\d+)\s*[–-]\s*(\d+)", lower)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": max(5, a - 6),
            "gradeCompletedMax": min(12, b - 6),
            "gradeSource": "age",
            "stateRestriction": state,
        }
    m = re.search(r"(?:completing )?grades?\s*(\d+)\s*[–-]\s*(\d+)", lower)
    if m:
        return {
            "gradeDisplay": display,
            "gradeCompletedMin": int(m.group(1)),
            "gradeCompletedMax": int(m.group(2)),
            "gradeSource": "grade",
            "stateRestriction": state,
        }
    if "current junior" in lower:
        return {"gradeDisplay": display, "gradeCompletedMin": 11, "gradeCompletedMax": 11, "gradeSource": "grade", "stateRestriction": state}
    if "rising junior" in lower or re.search(r"rising.*junior", lower):
        return {"gradeDisplay": display, "gradeCompletedMin": 10, "gradeCompletedMax": 10, "gradeSource": "grade", "stateRestriction": state}
    if "current junior" in lower:
        pass
    if "rising senior" in lower:
        return {"gradeDisplay": display, "gradeCompletedMin": 11, "gradeCompletedMax": 11, "gradeSource": "grade", "stateRestriction": state}
    if "high school" in lower:
        return {"gradeDisplay": display, "gradeCompletedMin": 8, "gradeCompletedMax": 12, "gradeSource": "mixed", "stateRestriction": state}
    return {"gradeDisplay": display, "gradeCompletedMin": 6, "gradeCompletedMax": 12, "gradeSource": "mixed", "stateRestriction": state}


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
