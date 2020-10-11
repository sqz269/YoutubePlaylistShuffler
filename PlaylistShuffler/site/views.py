from flask import Blueprint, render_template, request, make_response, Response

site = Blueprint("site", __name__, template_folder="template", static_folder="static", static_url_path="/site/static")

@site.route("/")
def index():
    resp: Response = make_response(render_template('index.html'))
    if 'apiKey' not in request.cookies:
        resp.set_cookie('apiKey', '')
    if 'clientId' not in request.cookies:
        resp.set_cookie('clientId', '')
    return render_template("index.html")
