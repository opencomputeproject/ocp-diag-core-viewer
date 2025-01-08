"""Defined subcommands used by ocp_diag_result_viewer."""
import http.server
import io
import json
from typing import TextIO

import bs4
import requests
import tabulate
from immutabledict import immutabledict

from viewer.libs.build_ocp_diag_result_data import build_ocp_diag_test_data_js
from viewer.libs.classifier import ResultClassifier


class ArtifactParseError(Exception):
    pass


COLORS = immutabledict(
    {
        "FATAL": "\x1b[1m\033[91m",  # red and bold
        "ERROR": "\033[91m",  # bold
        "WARNING": "\033[93m",  # yellow
        "INFO": "\033[92m",  # green
        "DEBUG": "\033[0m",  # white
        "RESET": "\x1b[0m",  # reset any style
    }
)

SEVERITY_LEVEL = {"FATAL": 5, "ERROR": 4, "WARNING": 3, "INFO": 2, "DEBUG": 1}

PASTEBIN = "/google/src/head/depot/eng/tools/pastebin"


def wrap_color(severity: str) -> str:
    return COLORS[severity] + severity + COLORS["RESET"]


def log(
    display_color: bool,
    loglevel: str,
    ocp_diag_data_content: str,
    writer: TextIO,
):
    """Runs log subcommand.

    Args:
      display_color: If false, colorful output will be disabled.
      loglevel: Level included and above will be printed.
      ocp_diag_data_content: String of log data.
      writer: File-like object to write logging results to.

    Returns:

    Raises:
      JSONDecodeError: If json data format is invalid.
      ArtifactParseError: If the content of ocp diag test log is invalid.
    """
    result_records = []
    record_builder = ResultClassifier().classify(ocp_diag_data_content)

    for line in ocp_diag_data_content.splitlines():
        try:
            ocp_diag_result = json.loads(line)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Test result is not of valid JSON format. Current line: {line}",
                e.doc,
                e.pos,
            ) from e

        try:
            record = record_builder.build_record(ocp_diag_result)
        except ArtifactParseError as e:
            raise ArtifactParseError(
                "Unable to parse OCP diag test result, sequence number {}: {}".format(
                    ocp_diag_result["sequenceNumber"], ocp_diag_result
                )
            ) from e
        if SEVERITY_LEVEL[record["severity"]] >= SEVERITY_LEVEL[loglevel]:
            result_records.append(
                [
                    record["sequenceNumber"],
                    record["timestamp"],
                    record["severity"]
                    if not display_color
                    else wrap_color(record["severity"]),
                    record["stage"] if "stage" in record else "",
                    record["step_name"] if "step_name" in record else "",
                    record["category"] if "category" in record else "",
                    record["message"],
                ]
            )

    print(
        tabulate.tabulate(
            result_records,
            headers=[
                "Seq Num",
                "Timestamp",
                "Severity",
                "Stage",
                "Name",
                "Category",
                "Message",
            ],
            tablefmt="presto",
            showindex=False,
        ),
        file=writer,
    )


def html_replace_external_files(
    soup: bs4.BeautifulSoup,
    app_bundle_content: dict[str, str],
    styles_content: str,
) -> None:
    """Replace external files in html beautiful soup object.

    Args:
      soup: Beautifulsoup object of html file which will be modified.
      app_bundle_content: Content in app build js files.
      styles_content: Content in styles.css.
    """
    for key, val in app_bundle_content.items():
        soup.find("script", attrs={"src": key}).extract()
        app_bundle_tag = soup.new_tag("script")
        app_bundle_tag.string = val
        soup.find("body").append(app_bundle_tag)

    soup.find(
        "link", attrs={"rel": "stylesheet", "href": "/styles.css"}
    ).extract()
    styles_tag = soup.new_tag("style")
    styles_tag.string = styles_content
    soup.find("head").append(styles_tag)


def html(
    ocp_diag_data_content: str,
    index_html_content: str,
    app_bundle_content: dict[str, str],
    styles_content: str,
    output_writer: TextIO,
) -> None:
    """Generates html file from ocp diag log and html template.

    Args:
      ocp_diag_data_content: String of ocp diag log data.
      index_html_content: Html file template.
      output_writer: File-like object to write html output file.
    """
    index_html_soup = bs4.BeautifulSoup(index_html_content, "html.parser")

    ocp_diag_test_data_js = "const OCP_DIAG_RESULT_RECORDS = [{}];".format(
        ",".join(build_ocp_diag_test_data_js(ocp_diag_data_content))
    )

    index_html_soup.find("script", attrs={"src": "/scripts.js"}).extract()
    ocp_diag_test_data_tag = index_html_soup.new_tag("script")
    ocp_diag_test_data_tag.string = ocp_diag_test_data_js
    index_html_soup.find("body").append(ocp_diag_test_data_tag)
    html_replace_external_files(
        index_html_soup,
        app_bundle_content,
        styles_content,
    )
    print(str(index_html_soup), file=output_writer)


class HttpHandler(http.server.SimpleHTTPRequestHandler):
    """Http handler for serving the input html content.

    Attributes:
      html_content: String of html content to serve.
    """

    def __init__(self, html_content):  # pylint: disable=super-init-not-called
        self.html_content = html_content

    def __call__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Returns html content in unicode for any GET request."""
        self.send_response(200)
        self.end_headers()
        self.wfile.write(bytes(self.html_content, "UTF-8"))


def serve(
    ocp_diag_data_content,
    index_html_content,
    app_bundle_content,
    styles_content,
    port,
):
    """Starts a http server to serve ocp diag content.

    Args:
      ocp_diag_data_content: String of ocp diag log data.
      index_html_content: Html file template.
      port: Port to listen.
    """
    html_content_stream = io.StringIO()
    html(
        ocp_diag_data_content,
        index_html_content,
        app_bundle_content,
        styles_content,
        html_content_stream,
    )
    handler = HttpHandler(html_content_stream.getvalue())

    with http.server.HTTPServer(("", port), handler) as httpd:
        print(
            "HTTP server running at "
            f"http://{httpd.server_name}:{httpd.server_port}"
        )
        httpd.serve_forever()
