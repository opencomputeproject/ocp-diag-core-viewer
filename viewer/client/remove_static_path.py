import importlib.resources as pkg_resources

import bs4

from viewer.client import files


def remove_static_path(file_path=None):
    """Removes the static prefix in index.html"""
    if file_path is None:
        file_path = pkg_resources.files(files).joinpath("index.html")
    index_html_soup = bs4.BeautifulSoup(file_path.read_text(), "html.parser")
    for style in index_html_soup.find_all("link"):
        if (
            style.get("href") is not None
            and style.get("href") == "/static/styles.css"
        ):
            style["href"] = "/styles.css"

    for script in index_html_soup.find_all("script"):
        if script.get("src") is not None and script.get("src").startswith(
            "/static"
        ):
            script["src"] = script.get("src")[7:]

    file_path.write_text(index_html_soup.prettify())
