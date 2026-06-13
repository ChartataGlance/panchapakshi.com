"""Small wrapper around Swiss Ephemeris `swetest` CLI."""
from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass


class SwetestError(RuntimeError):
    pass


@dataclass
class SwetestResult:
    command: list[str]
    output: str


def is_available() -> bool:
    return shutil.which("swetest") is not None


def run_swetest(args: list[str]) -> SwetestResult:
    exe = shutil.which("swetest")
    if not exe:
        raise SwetestError("swetest not found. Install Swiss Ephemeris and ensure `swetest` is in PATH.")

    command = [exe, *args]
    proc = subprocess.run(command, capture_output=True, text=True, timeout=15)
    if proc.returncode != 0:
        raise SwetestError(proc.stderr.strip() or proc.stdout.strip() or "swetest failed")
    return SwetestResult(command=command, output=proc.stdout.strip())


def get_planets(date_yyyy_mm_dd: str, time_hh_mm: str) -> SwetestResult:
    """Return Sun and Moon sidereal positions for a date/time in UTC.

    Uses Lahiri ayanamsha (-sid1). Caller should convert local time to UTC if needed.
    """
    day, month, year = date_yyyy_mm_dd.split("-")[2], date_yyyy_mm_dd.split("-")[1], date_yyyy_mm_dd.split("-")[0]
    return run_swetest([
        f"-b{day}.{month}.{year}",
        f"-ut{time_hh_mm}",
        "-p01",       # Sun + Moon
        "-sid1",      # Lahiri sidereal
        "-fPls",      # planet, longitude, speed
        "-g,",        # CSV separator
        "-head",
    ])


def get_sun_moon_for_location(date_yyyy_mm_dd: str, time_hh_mm: str, lat: float, lon: float) -> SwetestResult:
    """Return topocentric Sun and Moon sidereal positions for visitor location.

    Date/time must be UTC. Uses Lahiri ayanamsha (-sid1).
    """
    day, month, year = date_yyyy_mm_dd.split("-")[2], date_yyyy_mm_dd.split("-")[1], date_yyyy_mm_dd.split("-")[0]
    return run_swetest([
        f"-b{day}.{month}.{year}",
        f"-ut{time_hh_mm}",
        "-p01",  # Sun + Moon
        "-sid1", # Lahiri sidereal
        f"-topo{lon},{lat},0",
        "-fPls", # planet, longitude, speed
        "-g,",
        "-head",
    ])


def get_rise_set(date_yyyy_mm_dd: str, lat: float, lon: float) -> SwetestResult:
    """Get Sun rise/set information for a location using swetest."""
    day, month, year = date_yyyy_mm_dd.split("-")[2], date_yyyy_mm_dd.split("-")[1], date_yyyy_mm_dd.split("-")[0]
    return run_swetest([
        f"-b{day}.{month}.{year}",
        "-p0",
        f"-geopos{lon},{lat},0",
        "-rise",
    ])
