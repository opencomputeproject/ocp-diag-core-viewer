"""Tests for viewer_runner."""

import io
import json
import os
from pathlib import Path
import textwrap

import bs4
import pytest
from viewer import viewer_runner
from viewer.libs.meltan_record_builder import MeltanResultRecordBuilder


def get_test_data_content(filename):
    return Path(
        os.path.join(os.path.dirname(__file__), "testdata", filename)
    ).read_text()


@pytest.fixture
def ocp_diag_log():
    return textwrap.dedent(
        """\
        {"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}
        {"testRunArtifact":{"log":{"severity":"DEBUG","text":"Text 0"}},"sequenceNumber":1,"timestamp":"timestamp 1"}
        {"testRunArtifact":{"log":{"severity":"INFO","text":"Text 1"}},"sequenceNumber":2,"timestamp":"timestamp 2"}
        {"testRunArtifact":{"log":{"severity":"WARNING","text":"Text 2"}},"sequenceNumber":3,"timestamp":"timestamp 3"}
        {"testRunArtifact":{"log":{"severity":"ERROR","text":"Text 3"}},"sequenceNumber":4,"timestamp":"timestamp 4"}
        {"testRunArtifact":{"log":{"severity":"FATAL","text":"Text 4"}},"sequenceNumber":5,"timestamp":"timestamp 5"}
        {"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"NOT_APPLICABLE","status":"ERROR"}},"sequenceNumber":6,"timestamp":"timestamp 6"}"""
    )


@pytest.fixture
def output_stream():
    out = io.StringIO()
    yield out
    out.close()


@pytest.fixture
def test_file_path():
    return os.path.join(os.path.dirname(__file__), "testdata", "test_file.txt")


@pytest.fixture
def test_index_file_contents():
    index_path = os.path.join(os.path.dirname(__file__), "testdata", "index.html")
    with open(index_path, 'r') as file:
        file.seek(0)
        return file.read()


def test_log_color(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=True,
        loglevel="DEBUG",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )
    assert get_test_data_content("color_output.txt") == output_stream.getvalue()


def test_log_no_color(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="DEBUG",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    for value in viewer_runner.COLORS.values():
        assert not value in output_stream.getvalue()


def test_log_debug_level(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="DEBUG",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    for level_string in ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"]:
        assert level_string in output_stream.getvalue()


def testLog_InfoLevelSuccess(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="INFO",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    assert "DEBUG" not in output_stream.getvalue()
    for level_string in ["INFO", "WARNING", "ERROR", "FATAL"]:
        assert level_string in output_stream.getvalue()


def testLog_WarningLevelSuccess(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="WARNING",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    for level_string in ["DEBUG", "INFO"]:
        assert level_string not in output_stream.getvalue()
    for level_string in ["WARNING", "ERROR", "FATAL"]:
        assert level_string in output_stream.getvalue()


def testLog_ErrorLevelSuccess(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="ERROR",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    for level_string in ["DEBUG", "INFO", "WARNING"]:
        assert level_string not in output_stream.getvalue()
    for level_string in ["ERROR", "FATAL"]:
        assert level_string in output_stream.getvalue()


def testLog_FatalLevelSuccess(ocp_diag_log, output_stream):
    viewer_runner.log(
        display_color=False,
        loglevel="FATAL",
        ocp_diag_data_content=ocp_diag_log,
        writer=output_stream,
    )

    for level_string in ["DEBUG", "INFO", "WARNING", "ERROR"]:
        assert level_string not in output_stream.getvalue()
    assert "FATAL" in output_stream.getvalue()


def testLog_JsonDecodeFailure():
    invalid_ocp_diag_log = str(
        '{"invalid json format":"with extra trailing parenthesis"}}\n'
    )

    with pytest.raises(
        json.JSONDecodeError,
        match="Test result is not of valid JSON format",
    ):
        viewer_runner.log(
            display_color=False,
            loglevel="FATAL",
            ocp_diag_data_content=invalid_ocp_diag_log,
            writer=io.StringIO(),
        )


def testHtmlReplaceExternalFiles_Success(test_index_file_contents):
    app_bundle_content = "// this is app_bundle.js"
    styles_content = "/* this is styles.css */"
    soup = bs4.BeautifulSoup(
        test_index_file_contents,
        "html.parser",
    )

    viewer_runner.html_replace_external_files(
        soup, {"/main.js": app_bundle_content}, styles_content
    )

    assert soup.find("script", string="// this is app_bundle.js") is not None

    assert soup.find("style", string="/* this is styles.css */") is not None


def testHtml_Success(output_stream, test_index_file_contents):
    ocp_diag_data_content = """{"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}
        {"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"PASS","status":"COMPLETE"}},"sequenceNumber":1,"timestamp":"timestamp 1"}"""
    viewer_runner.html(
        ocp_diag_data_content,
        test_index_file_contents,
        {"/main.js": "// this is app_bundle.js"},
        "/* this is styles.css */",
        output_stream,
    )

    output_records = []
    for line in ocp_diag_data_content.splitlines():
        ocp_diag_result = json.loads(line)
        record = MeltanResultRecordBuilder().build_record(ocp_diag_result)
        output_records.append(json.dumps(record))

    output_soup = bs4.BeautifulSoup(output_stream.getvalue(), "html.parser")
    assert (
        output_soup.find(
            "script",
            string="const OCP_DIAG_RESULT_RECORDS = [{}];".format(
                ",".join(output_records)
            ),
        )
        is not None
    )


def testUploadSuccess(requests_mock, test_file_path):
    requests_mock.post(
        f"{viewer_runner.MELTAN_RESULT_VIEWER_URL}/upload",
        status_code=200,
        json={"share_id": "12345"},
    )
    log = viewer_runner.upload(test_file_path)
    assert log == f"{viewer_runner.MELTAN_RESULT_VIEWER_URL}/view/12345"


def testUploadError(requests_mock, test_file_path):
    requests_mock.post(
        f"{viewer_runner.MELTAN_RESULT_VIEWER_URL}/upload",
        status_code=404,
        reason="Not Found",
    )
    log = viewer_runner.upload(test_file_path)

    assert log.find("Request failed with status 404") is not None
    assert log.find("Not Found") is not None
