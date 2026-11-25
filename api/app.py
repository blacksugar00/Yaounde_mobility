from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS

try:
    from .routes.indicateurs import indicateurs_bp
    from .routes.zones import zones_bp
    from .routes.barometre import barometre_bp
except ImportError:
    from routes.indicateurs import indicateurs_bp
    from routes.zones import zones_bp
    from routes.barometre import barometre_bp


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder=str(Path(__file__).resolve().parent / "static"),
        static_url_path="/",
    )
    CORS(app)

    @app.get("/api/sante")
    def sante():
        return jsonify(statut="ok")

    app.register_blueprint(indicateurs_bp)
    app.register_blueprint(zones_bp)
    app.register_blueprint(barometre_bp)
    return app


app = create_app()