from __future__ import annotations

from datetime import datetime

from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .chart import build_chart
from .panchapakshi import calculate_panchapakshi, export_tables
from .swetest import SwetestError, is_available

app = FastAPI(title="panchapakshi.com")
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")
templates.env.cache = None


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    now = datetime.now().replace(second=0, microsecond=0)
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "today": now.date().isoformat(),
            "time": now.strftime("%H:%M"),
            "swetest_available": is_available(),
        },
    )


@app.get("/api/panchapakshi")
def api_panchapakshi(
    date: str,
    time: str,
    lat: float = Query(default=13.0827),
    lon: float = Query(default=80.2707),
    timezone: str = Query(default="UTC"),
):
    try:
        return calculate_panchapakshi(date, time, lat, lon, timezone)
    except SwetestError as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=400)


@app.get("/api/chart")
def api_chart(date: str, time: str, lat: float = 13.0827, lon: float = 80.2707, timezone: str = "UTC"):
    try:
        return build_chart(date, time, timezone, lat, lon)
    except SwetestError as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)


@app.get("/api/tables")
def api_tables():
    return export_tables()


@app.get("/health")
def health():
    return {"ok": True, "swetest_available": is_available()}
