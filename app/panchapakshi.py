from __future__ import annotations

from dataclasses import dataclass
from datetime import date as Date
from pathlib import Path
import json

from .chart import build_chart

WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
WEEKDAY_TAMIL = {
    "sunday": "ஞாயிறு",
    "monday": "திங்கள்",
    "tuesday": "செவ்வாய்",
    "wednesday": "புதன்",
    "thursday": "வியாழன்",
    "friday": "வெள்ளி",
    "saturday": "சனி",
}
BIRD_ICONS = {"Vulture": "🦅", "Owl": "🦉", "Crow": "🐦‍⬛", "Cock": "🐓", "Peacock": "🦚", "Unknown": "❔"}
ACTIVITY_TAMIL = {"Eat": "ஊண்", "Walk": "நடை", "Rule": "அரசு", "Sleep": "துயில்", "Death": "சாவு"}
ACTIVITY_ICONS = {"Eat": "🍚", "Walk": "🚶", "Rule": "👑", "Sleep": "🛌", "Death": "☠️"}
ATCHARAM = {
    "shukla": {"Cock": "எ", "Crow": "உ", "Owl": "இ", "Vulture": "அ", "Peacock": "ஒ"},
    "krishna": {"Cock": "அ", "Crow": "ஒ", "Owl": "உ", "Vulture": "இ", "Peacock": "எ"},
}

# One compact source of truth for Panchapakshi rows.
TABLES = {
    "shukla_day": {
        "acts": ["Eat", "Walk", "Rule", "Sleep", "Death"],
        "minutes": {"Eat": 30, "Walk": 36, "Rule": 48, "Sleep": 18, "Death": 12},
        "birds": [
            ["Vulture", "Owl", "Crow", "Cock", "Peacock"],
            ["Owl", "Crow", "Cock", "Peacock", "Vulture"],
            ["Vulture", "Owl", "Crow", "Cock", "Peacock"],
            ["Owl", "Crow", "Cock", "Peacock", "Vulture"],
            ["Crow", "Cock", "Peacock", "Vulture", "Owl"],
            ["Cock", "Peacock", "Vulture", "Owl", "Crow"],
            ["Peacock", "Vulture", "Owl", "Crow", "Cock"],
        ],
    },
    "shukla_night": {
        "acts": ["Eat", "Rule", "Death", "Walk", "Sleep"],
        "minutes": {"Eat": 30, "Rule": 48, "Death": 12, "Walk": 36, "Sleep": 18},
        "birds": [
            ["Crow", "Cock", "Peacock", "Vulture", "Owl"],
            ["Cock", "Peacock", "Vulture", "Owl", "Crow"],
            ["Crow", "Cock", "Peacock", "Vulture", "Owl"],
            ["Cock", "Peacock", "Vulture", "Owl", "Crow"],
            ["Peacock", "Vulture", "Owl", "Crow", "Cock"],
            ["Vulture", "Owl", "Crow", "Cock", "Peacock"],
            ["Owl", "Crow", "Cock", "Peacock", "Vulture"],
        ],
    },
    "krishna_day": {
        "acts": ["Eat", "Death", "Sleep", "Rule", "Walk"],
        "minutes": {"Eat": 48, "Death": 30, "Sleep": 12, "Rule": 18, "Walk": 36},
        "birds": [
            ["Cock", "Crow", "Owl", "Vulture", "Peacock"],
            ["Peacock", "Cock", "Crow", "Owl", "Vulture"],
            ["Cock", "Crow", "Owl", "Vulture", "Peacock"],
            ["Crow", "Owl", "Vulture", "Peacock", "Cock"],
            ["Owl", "Vulture", "Peacock", "Cock", "Crow"],
            ["Vulture", "Peacock", "Cock", "Crow", "Owl"],
            ["Peacock", "Cock", "Crow", "Owl", "Vulture"],
        ],
    },
    "krishna_night": {
        "acts": ["Eat", "Sleep", "Walk", "Death", "Rule"],
        "minutes": {"Eat": 42, "Sleep": 18, "Walk": 42, "Death": 24, "Rule": 18},
        "birds": [
            ["Vulture", "Peacock", "Cock", "Crow", "Owl"],
            ["Cock", "Crow", "Owl", "Vulture", "Peacock"],
            ["Vulture", "Peacock", "Cock", "Crow", "Owl"],
            ["Owl", "Vulture", "Peacock", "Cock", "Crow"],
            ["Crow", "Owl", "Vulture", "Peacock", "Cock"],
            ["Peacock", "Cock", "Crow", "Owl", "Vulture"],
            ["Cock", "Crow", "Owl", "Vulture", "Peacock"],
        ],
    },
}

ADHIKARA_PADU = {
    "shukla_day": [("Vulture", "Owl"), ("Owl", "Crow"), ("Vulture", "Cock"), ("Owl", "Peacock"), ("Crow", "Vulture"), ("Cock", "Owl"), ("Peacock", "Vulture")],
    "shukla_night": [("Crow", "Owl"), ("Cock", "Crow"), ("Crow", "Cock"), ("Cock", "Peacock"), ("Peacock", "Vulture"), ("Vulture", "Owl"), ("Owl", "Vulture")],
    "krishna_day": [("Cock", "Crow"), ("Peacock", "Owl"), ("Cock", "Vulture"), ("Crow", "Peacock"), ("Owl", "Cock"), ("Vulture", "Peacock"), ("Peacock", "Cock")],
    "krishna_night": [("Vulture", "Crow"), ("Cock", "Owl"), ("Vulture", "Vulture"), ("Owl", "Peacock"), ("Crow", "Cock"), ("Peacock", "Peacock"), ("Unknown", "Cock")],
}

BIRD_RELATIONS = {
    "Crow": {"friends": ["Vulture", "Cock", "Peacock"], "enemies": ["Owl"]},
    "Cock": {"friends": ["Peacock", "Cock"], "enemies": ["Vulture", "Owl"]},
    "Peacock": {"friends": ["Crow", "Cock"], "enemies": ["Vulture", "Owl"]},
    "Owl": {"friends": ["Vulture", "Cock", "Peacock"], "enemies": ["Crow"]},
    "Vulture": {"friends": ["Crow"], "enemies": ["Cock", "Owl", "Peacock"]},
}


def hm_to_minutes(value: str) -> float:
    parts = value.split(":")
    hour = int(parts[0])
    minute = int(parts[1]) if len(parts) > 1 else 0
    second = float(parts[2]) if len(parts) > 2 else 0
    return hour * 60 + minute + second / 60


def minutes_to_hms(value: float) -> str:
    seconds = int(round(value * 60)) % 86400
    return f"{seconds // 3600:02d}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"


def weekday_key(date_text: str) -> tuple[int, str]:
    # Python Monday=0; JS/Sunday table Sunday=0.
    py = Date.fromisoformat(date_text).weekday()
    idx = (py + 1) % 7
    return idx, WEEKDAYS[idx]


def paksha_key(tithi: dict | None) -> str:
    return "krishna" if "krishna" in str((tithi or {}).get("paksha", "")).lower() else "shukla"


def day_night_stats(day_night: dict | None, time: str) -> dict:
    if not day_night:
        return {"elapsed": 0, "total": 720, "progress": 0, "remaining": 720}
    selected = hm_to_minutes(time)
    sunrise = hm_to_minutes(day_night["sunrise"])
    sunset = hm_to_minutes(day_night["sunset"])
    if day_night["period"] == "day":
        total = max(1, sunset - sunrise)
        elapsed = selected - sunrise
    else:
        total = max(1, (1440 - sunset) + sunrise)
        elapsed = selected - sunset if selected >= sunset else selected + 1440 - sunset
    elapsed = max(0, min(total, elapsed))
    return {"elapsed": elapsed, "total": total, "progress": elapsed / total * 100, "remaining": total - elapsed}


def rows_for(paksha: str, period: str, weekday_index: int, samam: int, total_period_minutes: float) -> list[dict]:
    key = f"{paksha}_{period}"
    table = TABLES[key]
    birds = table["birds"][weekday_index]
    adhikara, padu = ADHIKARA_PADU[key][weekday_index]
    samam_length = total_period_minutes / 5
    ratio = samam_length / 144
    cursor = (samam - 1) * samam_length
    rows = []
    for i, bird in enumerate(birds):
        activity = table["acts"][(i + samam - 1) % 5]
        duration = table["minutes"][activity] * ratio
        start = cursor
        end = cursor + duration
        cursor = end
        rows.append({
            "slot": i + 1,
            "bird": bird,
            "bird_icon": BIRD_ICONS.get(bird, ""),
            "atcharam": ATCHARAM[paksha].get(bird, ""),
            "activity": activity,
            "activity_tamil": ACTIVITY_TAMIL[activity],
            "activity_icon": ACTIVITY_ICONS[activity],
            "duration_minutes": round(duration, 2),
            "duration": minutes_to_hms(duration),
            "start_minutes": round(start, 2),
            "end_minutes": round(end, 2),
            "is_adhikara": bird == adhikara,
            "is_padu": bird == padu,
        })
    return rows


def calculate_panchapakshi(date: str, time: str, lat: float, lon: float, timezone: str = "UTC") -> dict:
    chart = build_chart(date, time, timezone, lat, lon)
    if "error" in chart:
        return chart

    paksha = paksha_key(chart.get("tithi"))
    period = (chart.get("day_night") or {}).get("period", "day")
    weekday_index, weekday = weekday_key(date)
    stats = day_night_stats(chart.get("day_night"), time)
    samam = max(1, min(5, int(stats["elapsed"] // (stats["total"] / 5)) + 1))
    rows = rows_for(paksha, period, weekday_index, samam, stats["total"])
    active = next((row for row in rows if stats["elapsed"] >= row["start_minutes"] and stats["elapsed"] < row["end_minutes"]), rows[-1])
    adhikara, padu = ADHIKARA_PADU[f"{paksha}_{period}"][weekday_index]
    relations = BIRD_RELATIONS.get(adhikara, {"friends": [], "enemies": []})
    relation = "same" if active["bird"] == adhikara else "friend" if active["bird"] in relations["friends"] else "enemy" if active["bird"] in relations["enemies"] else "neutral"

    return {
        "date": date,
        "time": time,
        "latitude": lat,
        "longitude": lon,
        "weekday": weekday,
        "weekday_tamil": WEEKDAY_TAMIL[weekday],
        "paksha": paksha,
        "paksha_tamil": "வளர்பிறை" if paksha == "shukla" else "தேய்பிறை",
        "period": period,
        "period_tamil": "பகல்" if period == "day" else "இரவு",
        "sunrise": (chart.get("day_night") or {}).get("sunrise"),
        "sunset": (chart.get("day_night") or {}).get("sunset"),
        "tithi": chart.get("tithi"),
        "stats": stats,
        "samam": samam,
        "adhikara": adhikara,
        "padu": padu,
        "relations": relations,
        "relation_to_adhikara": relation,
        "active": active,
        "rows": rows,
    }


def export_tables() -> dict:
    return {"tables": TABLES, "adhikara_padu": ADHIKARA_PADU, "atcharam": ATCHARAM, "relations": BIRD_RELATIONS}
