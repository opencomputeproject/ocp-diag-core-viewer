import os
import shutil
import unittest
from unittest import mock

from viewer.server import view
from viewer.server.view import generate_data


def testDisplayFileShareId(client, testdata, test_dir):
    shutil.copy(
        os.path.join(testdata, "test_share_id.txt"),
        os.path.join(test_dir, "test_share_id.txt"),
    )
    with mock.patch.object(view, "build_ocp_diag_test_data_js") as mock_fn:
        mock_fn.side_effect = lambda text: [text]
        res = client.get("/view/result/test_share_id.txt")
        assert res.data.decode("utf-8") == "Test text\n"

def testGenerateData():
    test_data = ["first line", "second line"]
    assert list(generate_data(test_data)) == ["first line\nsecond line\n"]

def testGenerateDataCustomBatchSize():
    test_data = ["first line", "second line", "third line"]
    assert list(generate_data(test_data, 1)) == ["first line\n", "second line\n", "third line\n"]