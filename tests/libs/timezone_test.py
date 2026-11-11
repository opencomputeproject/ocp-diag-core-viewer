import datetime
import io
import re
import textwrap

import pytest

from viewer import viewer_runner
from viewer.libs import timezone


@pytest.mark.parametrize(
    "timestamp, expected",
    [
        # PST, keeps nanoseconds.
        ("2021-11-29T05:52:21.879371116Z", "2021-11-28 21:52:21.879371116 PST"),
        # PDT.
        ("2021-10-12T14:09:43.548601100Z", "2021-10-12 07:09:43.548601100 PDT"),
        # No fraction.
        ("2021-10-12T14:09:43Z", "2021-10-12 07:09:43 PDT"),
        # Non-UTC offset in the input.
        ("2021-10-12T14:09:43.5+08:00", "2021-10-11 23:09:43.5 PDT"),
        # Around DST transitions in 2024: starts 2024-03-10 10:00 UTC,
        # ends 2024-11-03 09:00 UTC.
        ("2024-03-10T09:59:59Z", "2024-03-10 01:59:59 PST"),
        ("2024-03-10T10:00:00Z", "2024-03-10 03:00:00 PDT"),
        ("2024-11-03T08:59:59Z", "2024-11-03 01:59:59 PDT"),
        ("2024-11-03T09:00:00Z", "2024-11-03 01:00:00 PST"),
    ],
)
def test_convert_timestamp_mtv(timestamp, expected):
    assert timezone.convert_timestamp(timestamp, timezone.MTV) == expected


@pytest.mark.parametrize(
    "timestamp",
    [
        "2021-11-29T05:52:21.879371116Z",
        "2021-10-12T14:09:43.548601100Z",
        "2024-03-10T09:59:59Z",
        "2024-03-10T10:00:00Z",
        "2024-11-03T08:59:59Z",
        "2024-11-03T09:00:00Z",
        "2023-07-01T00:00:00Z",
        "2023-01-01T00:00:00Z",
    ],
)
def test_pacific_fallback_matches_zoneinfo(timestamp):
    zoneinfo = pytest.importorskip("zoneinfo")
    # Python 3.10 fromisoformat() can't parse >6 fractional digits or "Z".
    dt = datetime.datetime.fromisoformat(
        re.sub(r"\.\d+", "", timestamp).replace("Z", "+00:00")
    )
    expected = dt.astimezone(zoneinfo.ZoneInfo("America/Los_Angeles"))
    actual = timezone._to_pacific_fallback(dt)
    assert actual.utcoffset() == expected.utcoffset()
    assert actual.tzname() == expected.tzname()
    assert actual.replace(tzinfo=None) == expected.replace(tzinfo=None)


def test_convert_timestamp_utc_is_unchanged():
    ts = "2021-11-29T05:52:21.879371116Z"
    assert timezone.convert_timestamp(ts, timezone.UTC) == ts


def test_convert_timestamp_local(monkeypatch):
    result = timezone.convert_timestamp(
        "2021-10-12T14:09:43.548601100Z", timezone.LOCAL
    )
    assert result.startswith("20")
    assert ".548601100 " in result


@pytest.mark.parametrize(
    "timestamp", ["", "timestamp 0", "2021-13-45T99:00:00Z"]
)
def test_convert_timestamp_invalid_is_unchanged(timestamp):
    assert timezone.convert_timestamp(timestamp, timezone.MTV) == timestamp


def test_convert_timestamp_unknown_timezone():
    with pytest.raises(ValueError):
        timezone.convert_timestamp("2021-10-12T14:09:43Z", "mars")


def test_log_with_mtv_timezone():
    content = textwrap.dedent(
        """\
        {"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"2021-11-29T05:52:21.879371116Z"}
        {"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"PASS","status":"COMPLETE"}},"sequenceNumber":1,"timestamp":"2021-11-29T05:52:22Z"}"""
    )
    output = io.StringIO()
    viewer_runner.log(
        display_color=False,
        loglevel="DEBUG",
        ocp_diag_data_content=content,
        writer=output,
        timezone=timezone.MTV,
    )
    assert "2021-11-28 21:52:21.879371116 PST" in output.getvalue()
    assert "2021-11-28 21:52:22 PST" in output.getvalue()
