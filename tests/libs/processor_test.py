import textwrap

import pytest

from viewer.libs import build_ocp_diag_result_data
from viewer.libs.meltan_record_builder import MeltanResultRecordBuilder
from viewer.libs.record_builder import ArtifactParseError


def check_start_and_end_presence_in_records(ocp_diag_data_content: str):
    processor = build_ocp_diag_result_data.Processor(MeltanResultRecordBuilder())
    for index, line in enumerate(ocp_diag_data_content.splitlines()):
        processor.add(line, index)

    return [
        processor.is_test_run_start_present,
        processor.is_test_run_end_present,
    ]


def test_processor_testrun_start_end():
    assert check_start_and_end_presence_in_records("") == [
        False,
        False,
    ]

    assert check_start_and_end_presence_in_records(
        """{"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}"""
    ) == [True, False]
    assert check_start_and_end_presence_in_records(
        """{"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"PASS","status":"COMPLETE"}},"sequenceNumber":1,"timestamp":"timestamp 1"}"""
    ) == [False, True]
    assert (
        check_start_and_end_presence_in_records(
            textwrap.dedent(
                """\
                {"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}
                {"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"PASS","status":"COMPLETE"}},"sequenceNumber":1,"timestamp":"timestamp 1"}"""
            )
        )
        == [True, True]
    )


def test_processor_validate():
    processor = build_ocp_diag_result_data.Processor(MeltanResultRecordBuilder())
    with pytest.raises(ArtifactParseError) as excinfo:
        processor.validate()
    assert "TestRunStart should be present." in str(excinfo.value)

    # parse json with no testRunEnd
    processor.add(
        """{"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}""",
        0,
    )
    processor.validate()
    assert "TestRunEnd should be present." not in str(excinfo.value)
