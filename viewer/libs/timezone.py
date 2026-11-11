"""Converts RFC 3339 timestamps in OCP diag results to a display timezone."""

import datetime
import re

UTC = "utc"
MTV = "mtv"
LOCAL = "local"
TIMEZONES = (UTC, MTV, LOCAL)

_RFC3339_PATTERN = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2})[Tt ]"
    r"(?P<time>\d{2}:\d{2}:\d{2})"
    r"(?P<fraction>\.\d+)?"
    r"(?P<offset>[Zz]|[+-]\d{2}:\d{2})$"
)

_PACIFIC_STANDARD = datetime.timezone(datetime.timedelta(hours=-8), "PST")
_PACIFIC_DAYLIGHT = datetime.timezone(datetime.timedelta(hours=-7), "PDT")


def _nth_sunday(year: int, month: int, n: int) -> datetime.date:
    first = datetime.date(year, month, 1)
    first_sunday = first + datetime.timedelta(days=(6 - first.weekday()) % 7)
    return first_sunday + datetime.timedelta(weeks=n - 1)


def _to_pacific_fallback(dt: datetime.datetime) -> datetime.datetime:
    """Converts to US Pacific time without relying on the tz database.

    Uses the US DST rule in effect since 2007: from the second Sunday of March
    02:00 PST (10:00 UTC) to the first Sunday of November 02:00 PDT
    (09:00 UTC).
    """
    utc = dt.astimezone(datetime.timezone.utc)
    dst_start = datetime.datetime.combine(
        _nth_sunday(utc.year, 3, 2),
        datetime.time(10, tzinfo=datetime.timezone.utc),
    )
    dst_end = datetime.datetime.combine(
        _nth_sunday(utc.year, 11, 1),
        datetime.time(9, tzinfo=datetime.timezone.utc),
    )
    if dst_start <= utc < dst_end:
        return utc.astimezone(_PACIFIC_DAYLIGHT)
    return utc.astimezone(_PACIFIC_STANDARD)


def _to_pacific(dt: datetime.datetime) -> datetime.datetime:
    try:
        import zoneinfo  # pylint: disable=import-outside-toplevel

        return dt.astimezone(zoneinfo.ZoneInfo("America/Los_Angeles"))
    except Exception:  # pylint: disable=broad-except
        # The tz database may be unavailable (e.g. minimal prod images).
        return _to_pacific_fallback(dt)


def convert_timestamp(timestamp: str, timezone: str) -> str:
    """Converts an RFC 3339 timestamp to the given display timezone.

    Args:
      timestamp: e.g. "2021-11-29T05:52:21.879371116Z".
      timezone: One of TIMEZONES. For UTC, the timestamp is returned as-is so
        the output stays identical to the original result file.

    Returns:
      For MTV / local, "YYYY-MM-DD HH:MM:SS[.fraction] TZ" keeping the original
      sub-second precision, e.g. "2021-11-28 21:52:21.879371116 PST".
      The input is returned unchanged if it is not a valid RFC 3339 timestamp.
    """
    if timezone == UTC:
        return timestamp
    match = _RFC3339_PATTERN.match(timestamp or "")
    if not match:
        return timestamp

    offset = match["offset"]
    if offset in ("Z", "z"):
        offset = "+00:00"
    try:
        dt = datetime.datetime.fromisoformat(
            f"{match['date']}T{match['time']}{offset}"
        )
    except ValueError:
        return timestamp

    if timezone == MTV:
        converted = _to_pacific(dt)
    elif timezone == LOCAL:
        converted = dt.astimezone()
    else:
        raise ValueError(f"Unknown timezone: {timezone}")

    fraction = match["fraction"] or ""
    return (
        converted.strftime("%Y-%m-%d %H:%M:%S")
        + fraction
        + " "
        + (converted.tzname() or converted.strftime("%z"))
    )
