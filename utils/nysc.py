"""
utils/nysc.py

All NYSC-related business logic lives here.
- Parsing callup numbers and state codes
- Deriving the correct role from a user's data and today's date
- Never import from routers or models — this is a pure utility module
"""

import re
from datetime import date
from dateutil.relativedelta import relativedelta
from typing import Optional


# ─── Constants ────────────────────────────────────────────────────────────────

# Fallback camp start months per batch.
# NYSC dates shift year to year — always prefer user-supplied camp_start_date.
BATCH_CAMP_START_MONTH = {
    "A": 3,    # Batch A — typically March (Jan 2026 was an exception)
    "B": 9,    # Batch B — typically September
    "C": 11,   # Batch C — typically November
}

CAMP_DURATION_WEEKS    = 3    # Camp lasts ~3 weeks
STREAM_OFFSET_WEEKS    = 3    # Stream 2 starts ~3 weeks after Stream 1
SERVICE_DURATION_MONTHS = 11  # Service year = 11 months after camp ends

STATE_PREFIX_MAP = {
    "AB": "Abia", "AD": "Adamawa", "AK": "Akwa Ibom", "AN": "Anambra",
    "BA": "Bauchi", "BY": "Bayelsa", "BE": "Benue", "BO": "Borno",
    "CR": "Cross River", "DE": "Delta", "EB": "Ebonyi", "ED": "Edo",
    "EK": "Ekiti", "EN": "Enugu", "FC": "FCT Abuja", "GO": "Gombe",
    "IM": "Imo", "JI": "Jigawa", "KD": "Kaduna", "KN": "Kano",
    "KT": "Katsina", "KE": "Kebbi", "KO": "Kogi", "KW": "Kwara",
    "LA": "Lagos", "NA": "Nasarawa", "NI": "Niger", "OG": "Ogun",
    "ON": "Ondo", "OS": "Osun", "OY": "Oyo", "PL": "Plateau",
    "RV": "Rivers", "SO": "Sokoto", "TA": "Taraba", "YO": "Yobe",
    "ZA": "Zamfara",
}

# NYSC/FUA/2025/107449
CALLUP_PATTERN = re.compile(r"^NYSC/[A-Z]{2,5}/(\d{4})/(\d+)$", re.IGNORECASE)

# AB/25A/2008 — batch is A, B, or C
STATE_CODE_PATTERN = re.compile(r"^([A-Z]{2})/(\d{2})([ABC])/(\d+)$", re.IGNORECASE)


# ─── Parsing ──────────────────────────────────────────────────────────────────

def parse_callup_number(callup: str) -> Optional[dict]:
    """
    Parses NYSC/FUA/2025/107449 → { year, serial } or None if invalid.
    """
    match = CALLUP_PATTERN.match(callup.strip())
    if not match:
        return None

    year = int(match.group(1))
    if year < 2015 or year > date.today().year + 1:
        return None

    return {"year": year, "serial": match.group(2)}


def parse_state_code(state_code: str) -> Optional[dict]:
    """
    Parses AB/25A/2008 → { state_prefix, state, year, batch, serial } or None.
    """
    match = STATE_CODE_PATTERN.match(state_code.strip())
    if not match:
        return None

    state_prefix = match.group(1).upper()
    year         = 2000 + int(match.group(2))
    batch        = match.group(3).upper()
    serial       = match.group(4)

    if state_prefix not in STATE_PREFIX_MAP:
        return None

    if year < 2015 or year > date.today().year + 1:
        return None

    return {
        "state_prefix": state_prefix,
        "state":        STATE_PREFIX_MAP[state_prefix],
        "year":         year,
        "batch":        batch,
        "serial":       serial,
    }


# ─── Date calculation ─────────────────────────────────────────────────────────

def calculate_nysc_dates(
    year: int,
    batch: str,
    stream: int,
    camp_start_date: Optional[date] = None,
) -> dict:
    """
    Calculates NYSC cycle dates.
    Prefers user-supplied camp_start_date. Falls back to batch/stream estimate.
    """
    if camp_start_date:
        camp_start = camp_start_date
    else:
        camp_month   = BATCH_CAMP_START_MONTH.get(batch.upper(), 3)
        stream_delta = relativedelta(weeks=(stream - 1) * STREAM_OFFSET_WEEKS)
        camp_start   = date(year, camp_month, 1) + stream_delta

    camp_end    = camp_start + relativedelta(weeks=CAMP_DURATION_WEEKS)
    service_end = camp_end + relativedelta(months=SERVICE_DURATION_MONTHS)

    return {
        "camp_start":    camp_start,
        "camp_end":      camp_end,
        "service_start": camp_end,
        "service_end":   service_end,
    }


# ─── Role derivation ──────────────────────────────────────────────────────────

def derive_role(user) -> str:
    """
    Derives the correct role from a user's NYSC data and today's date.

    - landlord / admin         → never auto-changed
    - no state code            → pcm
    - today < camp_end         → incoming_corper
    - camp_end <= today
        < service_end          → outgoing_corper
    - today >= service_end     → alumni
    """
    from dependencies import Role  # local import avoids circular dependency

    if user.role in (Role.landlord, Role.admin):
        return user.role

    if not user.nysc_state_code:
        return Role.pcm

    parsed = parse_state_code(user.nysc_state_code)
    if not parsed:
        return Role.pcm

    stream = user.stream or 1
    dates  = calculate_nysc_dates(
        year            = parsed["year"],
        batch           = parsed["batch"],
        stream          = stream,
        camp_start_date = user.camp_start_date,
    )
    today = date.today()

    if today < dates["camp_end"]:
        return Role.incoming_corper
    elif today < dates["service_end"]:
        return Role.outgoing_corper
    else:
        return Role.alumni