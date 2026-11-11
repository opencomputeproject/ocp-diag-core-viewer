"""A command line tool for viewing ocp diag result log."""
import importlib.resources as pkg_resources
import pathlib
import platform
import sys

import click

from viewer import viewer_runner
from viewer.client import files
from viewer.libs import timezone as tz

if sys.version_info.major < 3 or sys.version_info.minor < 8:
    sys.tracebacklimit = 0
    raise Exception(
        f"'ocp-diag-result-viewer' requires a different Python: {platform.python_version()} not in '>=3.9'"
    )


@click.group()
def main() -> None:
    pass


@main.command()
@click.argument("filepath", type=click.Path(exists=True))
@click.option(
    "--color/--no-color",
    " /-C",
    default=True,
    help="Use a monochrome color scheme1.",
)
@click.option(
    "--loglevel",
    "-l",
    default="INFO",
    type=click.Choice(
        ["DEBUG", "INFO", "WARNING", "ERROR", "FATAL"], case_sensitive=False
    ),
    help="Any level above and including the specified level will be printed. Default “INFO”.",
)
@click.option(
    "--output", "-o", default="", help="Write to file instead of stdout."
)
@click.option(
    "--timezone",
    "-z",
    default=tz.UTC,
    type=click.Choice(tz.TIMEZONES, case_sensitive=False),
    help="Timezone to display timestamps in. Default “utc” (as in the result"
    " file). “mtv” is America/Los_Angeles.",
)
def log(
    filepath: str, color: bool, loglevel: str, output: str, timezone: str
) -> None:
    """Generates readable log output from ocp diag result file."""
    with open(filepath, "r") as file:
        ocp_diag_result_data_content = file.read()

    if output:
        # Create directory of output file if not exist.
        pathlib.Path(output).parent.mkdir(parents=True, exist_ok=True)
        with open(output, "w") as writer:
            viewer_runner.log(
                color,
                loglevel,
                ocp_diag_result_data_content,
                writer,
                timezone.lower(),
            )
    else:
        viewer_runner.log(
            color,
            loglevel,
            ocp_diag_result_data_content,
            sys.stdout,
            timezone.lower(),
        )


@main.command()
@click.argument("filepath", type=click.Path(exists=True))
@click.option(
    "--output",
    "-o",
    default="ocp.html",
    help="Write to file instead of ocp.html",
)
def html(filepath: str, output: str) -> None:
    """Generates html file from ocp diag result file."""

    # Create directory of output file if not exist.
    pathlib.Path(output).parent.mkdir(parents=True, exist_ok=True)
    with open(output, "w+") as output_writer:
        viewer_runner.html(
            pathlib.Path(filepath).read_text(),
            pkg_resources.read_text(files, "index.html"),
            {
                "/main.js": pkg_resources.read_text(files, "main.js"),
                "/polyfills.js": pkg_resources.read_text(files, "polyfills.js"),
                "/runtime.js": pkg_resources.read_text(files, "runtime.js"),
            },
            pkg_resources.read_text(files, "styles.css"),
            output_writer,
        )


@main.command()
@click.argument("filepath", type=click.Path(exists=True))
@click.option(
    "--port", "-p", default=8000, type=int, help="Port to listen. Default 8000."
)
def serve(filepath: str, port: int = 8000):
    """Runs an http server which serves ocp diag result file."""

    viewer_runner.serve(
        pathlib.Path(filepath).read_text(),
        pkg_resources.read_text(files, "index.html"),
        {
            "/main.js": pkg_resources.read_text(files, "main.js"),
            "/polyfills.js": pkg_resources.read_text(files, "polyfills.js"),
            "/runtime.js": pkg_resources.read_text(files, "runtime.js"),
        },
        pkg_resources.read_text(files, "styles.css"),
        port,
    )


@main.command()
@click.argument("filepath", type=click.Path(exists=True))
def share(filepath: str):
    """Share a result to OCP Diag Result Viewer service."""

    print(viewer_runner.upload(filepath))


if __name__ == "__main__":
    main()
