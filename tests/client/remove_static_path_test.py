from bs4 import BeautifulSoup
import pytest

from viewer.client.remove_static_path import remove_static_path

@pytest.fixture()
def index_file_path(tmp_path):
    test_file = tmp_path / "index.html"
    test_file.write_text("<body><script src='/static/main.js'></script><link href='/static/styles.css' rel='stylesheet'/></body>")

    return test_file

def testRemoveStaticFolderFromScriptName(index_file_path):
    remove_static_path(index_file_path)
    soup = BeautifulSoup(index_file_path.read_text(), "html.parser")
    scripts = soup.find("script")
    assert scripts["src"] == "/main.js"
    style = soup.find("link", attrs={"rel": "stylesheet"})
    assert style["href"] == "/styles.css"


def testRemoveStaticFolderDefaultPath(tmp_path, monkeypatch):
    test_file = tmp_path / "index.html"
    test_file.write_text(
        "<body><script src='/static/main.js'></script>"
        "<link href='/static/styles.css' rel='stylesheet'/></body>"
    )
    monkeypatch.setattr(
        "viewer.client.remove_static_path.pkg_resources.files",
        lambda _: tmp_path,
    )
    remove_static_path()
    soup = BeautifulSoup(test_file.read_text(), "html.parser")
    assert soup.find("script")["src"] == "/main.js"
    assert soup.find("link", attrs={"rel": "stylesheet"})["href"] == "/styles.css"
