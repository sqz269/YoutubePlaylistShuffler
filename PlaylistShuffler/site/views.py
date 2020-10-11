from flask import Blueprint, render_template, request

site = Blueprint("site", __name__, template_folder="template", static_folder="static", static_url_path="/site/static")

@site.route("/")
def index():
    return render_template("index.html")
