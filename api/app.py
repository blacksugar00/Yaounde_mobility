from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import safe_join

try:
    from .routes.indicateurs import indicateurs_bp
    from .routes.zones import zones_bp
    from .routes.barometre import barometre_bp
except ImportError:
    from routes.indicateurs import indicateurs_bp
    from routes.zones import zones_bp
    from routes.barometre import barometre_bp


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config["REACT_BUILD_DIR"] = Path(__file__).resolve().parent / "static"
    app.config["MAX_CONTENT_LENGTH"] = 4 * 1024
    CORS(app)

    @app.get("/api/sante")
    def sante():
        return jsonify(statut="ok")

    app.register_blueprint(indicateurs_bp)
    app.register_blueprint(zones_bp)
    app.register_blueprint(barometre_bp)

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_react(path: str):
        if path == "api" or path.startswith("api/"):
            return jsonify(erreur="Route API introuvable"), 404

        build_dir = Path(app.config["REACT_BUILD_DIR"])
        if path:
            asset_path = safe_join(str(build_dir), path)
            if asset_path is not None and Path(asset_path).is_file():
                return send_from_directory(build_dir, path)

        index_path = build_dir / "index.html"
        if index_path.is_file():
            return send_from_directory(build_dir, "index.html")
        return jsonify(erreur="Build React indisponible"), 404

    return app


app = create_app()