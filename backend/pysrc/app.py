from flask import flask

app = Flask(__name__)

@app.route("/words")
def words():
    return render_template()