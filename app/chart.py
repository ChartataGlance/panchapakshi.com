from __future__ import annotations

from datetime import datetime

from .swetest import SwetestError, get_rise_set, run_swetest

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]
SIGN_SHORT = {
    "Aries": "Ari", "Taurus": "Tau", "Gemini": "Gem", "Cancer": "Can",
    "Leo": "Leo", "Virgo": "Vir", "Libra": "Lib", "Scorpio": "Sco",
    "Sagittarius": "Sag", "Capricorn": "Cap", "Aquarius": "Aqu", "Pisces": "Pis",
}
PLANET_SHORT = {
    "Sun": "Su", "Moon": "Mo", "Mercury": "Me", "Venus": "Ve", "Mars": "Ma",
    "Jupiter": "Ju", "Saturn": "Sa", "Uranus": "Ur", "Neptune": "Ne", "Pluto": "Pl",
    "true Node": "Ra", "mean Node": "Ra", "Ketu": "Ke", "Ascendant": "As",
}
TITHI_NAMES = [
    "Prathamai", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Pournami", "Prathamai", "Dvitiya", "Tritiya",
    "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami",
    "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
]


def sign_for_longitude(lon: float) -> dict:
    lon = lon % 360
    idx = int(lon // 30)
    in_sign = lon - idx * 30
    deg = int(in_sign)
    minute = int((in_sign - deg) * 60)
    return {
        "longitude": round(lon, 6),
        "sign": SIGNS[idx],
        "sign_index": idx,
        "degree": deg,
        "minute": minute,
        "display": f"{deg}°{minute:02d}' {SIGNS[idx]}",
    }


def calculate_tithi(sun_lon: float, moon_lon: float) -> dict:
    elongation = (moon_lon - sun_lon) % 360
    num = int(elongation // 12) + 1
    paksha = "Shukla Paksha" if num <= 15 else "Krishna Paksha"
    progress = ((elongation % 12) / 12) * 100
    return {
        "number": num,
        "name": TITHI_NAMES[num - 1],
        "paksha": paksha,
        "elongation": round(elongation, 6),
        "progress_percent": round(progress, 2),
        "remaining_percent": round(100 - progress, 2),
        "display": f"{TITHI_NAMES[num - 1]} ({paksha})",
    }


def _swetest_chart(utc_dt: datetime, lat: float, lon: float) -> str:
    date = utc_dt.date().isoformat()
    day, month, year = date.split("-")[2], date.split("-")[1], date.split("-")[0]
    return run_swetest([
        f"-b{day}.{month}.{year}",
        f"-ut{utc_dt.strftime('%H:%M')}",
        "-p0123456789t",
        "-sid1",
        f"-topo{lon},{lat},0",
        f"-house{lon},{lat},O",
        "-fPls",
        "-g,",
        "-head",
    ]).output


def _hm_to_minutes(value: str) -> float:
    parts = value.split(":")
    hour = int(parts[0])
    minute = int(parts[1]) if len(parts) > 1 else 0
    second = float(parts[2]) if len(parts) > 2 else 0
    return hour * 60 + minute + (second / 60)


def _minutes_to_hms(value: float) -> str:
    seconds = int(round((value % 1440) * 60)) % 86400
    return f"{seconds // 3600:02d}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"


def build_day_night(date: str, time: str, lat: float, lon: float) -> dict | None:
    """Day/night from swetest sunrise/sunset, shifted to local mean time by longitude.

    This avoids timezone/DST databases and uses only selected date/time + coordinates.
    """
    try:
        raw = get_rise_set(date, lat, lon).output
    except SwetestError:
        return None

    import re
    match = re.search(r"rise\s+\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}:\d+(?:\.\d+)?)\s+set\s+\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}:\d+(?:\.\d+)?)", raw)
    if not match:
        return None
    offset_minutes = lon * 4  # local mean solar time; 1 degree longitude = 4 minutes
    sunrise = (_hm_to_minutes(match.group(1)) + offset_minutes) % 1440
    sunset = (_hm_to_minutes(match.group(2)) + offset_minutes) % 1440
    selected = _hm_to_minutes(time)
    if sunrise <= sunset:
        is_day = sunrise <= selected < sunset
    else:
        is_day = selected >= sunrise or selected < sunset
    return {
        "period": "day" if is_day else "night",
        "sunrise": _minutes_to_hms(sunrise),
        "sunset": _minutes_to_hms(sunset),
        "method": "swetest sunrise/sunset + longitude local mean time",
        "raw": raw,
    }


def build_chart(date: str, time: str, timezone: str, lat: float, lon: float) -> dict:
    try:
        local_dt = datetime.fromisoformat(f"{date}T{time}")
    except ValueError as exc:
        return {"error": f"Invalid date/time: {exc}"}

    # User-selected clock time is passed directly to swetest.
    # No timezone conversion is applied; latitude/longitude are used for topocentric houses/positions.
    raw = _swetest_chart(local_dt, lat, lon)

    planets = []
    asc = None
    node_lon = None
    for line in raw.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 2:
            continue
        name = parts[0]
        try:
            longitude = float(parts[1])
            speed = float(parts[2]) if len(parts) > 2 else None
        except ValueError:
            continue
        if name.startswith("house") or name in {"MC", "ARMC", "Vertex", "equat. Asc.", "co-Asc. W.Koch", "co-Asc Munkasey", "Polar Asc."}:
            continue
        if name == "mean Node":
            continue
        if name == "true Node":
            node_lon = longitude
        item = {
            "name": name,
            "short": PLANET_SHORT.get(name, name[:2]),
            "speed": round(speed, 6) if speed is not None else None,
            **sign_for_longitude(longitude),
        }
        if name == "Ascendant":
            asc = item
        else:
            planets.append(item)

    if node_lon is not None:
        planets.append({"name": "Ketu", "short": "Ke", "speed": None, **sign_for_longitude(node_lon + 180)})

    by_sign = {sign: [] for sign in SIGNS}
    if asc:
        by_sign[asc["sign"]].append(asc)
    for planet in planets:
        by_sign[planet["sign"]].append(planet)

    sun = next((p for p in planets if p["name"] == "Sun"), None)
    moon = next((p for p in planets if p["name"] == "Moon"), None)
    tithi = calculate_tithi(sun["longitude"], moon["longitude"]) if sun and moon else None

    return {
        "local": local_dt.isoformat(),
        "swetest_time": local_dt.isoformat(),
        "latitude": lat,
        "longitude": lon,
        "ayanamsha": "Lahiri sidereal",
        "ascendant": asc,
        "planets": planets,
        "by_sign": by_sign,
        "tithi": tithi,
        "day_night": build_day_night(date, time, lat, lon),
        "raw": raw,
    }
