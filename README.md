# panchapakshi.com

A simplified Panchapakshi FastAPI project.

## Structure

```text
app/main.py                 FastAPI routes
app/panchapakshi.py         Panchapakshi calculation + tables
app/chart.py                Tithi and sunrise/sunset helper
app/swetest.py              Swiss Ephemeris CLI wrapper
app/templates/index.html    Small HTML shell
app/static/js/app.js        Frontend rendering
app/static/style.css        Styles
```

## Run

```bash
cd /home/sami/panchapakshi.com
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open: http://localhost:8000

## API

```text
GET /api/panchapakshi?date=2026-06-13&time=12:00&lat=13.0827&lon=80.2707
GET /api/tables
GET /health
```

Requires `swetest` in PATH for live tithi and sunrise/sunset.
