"""Tests for build_meltan_result_data."""

import json
import textwrap
import unittest
from unittest import mock

import pytest

from viewer.libs import build_ocp_diag_result_data
from viewer.libs.meltan_record_builder import MeltanResultRecordBuilder


def testBuildTestDataJs_JsonDecodeFailure():
    meltan_data_content = (
        '{"invalid json format":"with extra trailing ' 'parenthesis"}}'
    )
    with pytest.raises(
        json.JSONDecodeError,
        match="Test result is not of valid JSON format.",
    ):
        build_ocp_diag_result_data.build_ocp_diag_test_data_js(meltan_data_content)


def testBuildTestDataJs_Success():
    meltan_data_content = textwrap.dedent(
        """\
        {"testRunArtifact":{"testRunStart":{"name":"NAME","version":"1"}},"sequenceNumber":0,"timestamp":"timestamp 0"}
        {"testRunArtifact":{"testRunEnd":{"name":"NAME","result":"PASS","status":"COMPLETE"}},"sequenceNumber":1,"timestamp":"timestamp 1"}"""
    )
    with mock.patch.object(
        MeltanResultRecordBuilder, "build_record"
    ) as mock_fn:
        mock_fn.side_effect = lambda _: {}
        assert (
            build_ocp_diag_result_data.build_ocp_diag_test_data_js(
                meltan_data_content
            )
            == ["{}","{}"]
        )
