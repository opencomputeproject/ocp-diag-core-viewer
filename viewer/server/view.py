from flask import Blueprint, render_template

from viewer.libs.build_ocp_diag_result_data import build_ocp_diag_test_data_js
from viewer.server.middlewares import login_required
from viewer.server.storage import get_storage

view_blueprint = Blueprint("view", __name__, url_prefix="/view")


def generate_data(data: list[str], batch_size=1000):
    for i in range(0, len(data), batch_size):
        yield "\n".join(data[i : i + batch_size]) + "\n"


@view_blueprint.route("/result/<string:share_id>")
def fetch_result_with_id(share_id):
    content = get_storage().download(share_id)
    built_content = build_ocp_diag_test_data_js(content)
    return generate_data(built_content)


@view_blueprint.route("/<string:share_id>", strict_slashes=False)
@login_required
def display_file_share_id(share_id):
    return render_template("index.html")
