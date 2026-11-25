from pathlib import Path

from flask import Blueprint, jsonify, request

zones_bp = Blueprint("zones", __name__, url_prefix="/api")
GEOJSON_PATH = Path(__file__).resolve().parents[1].parent / "data" / "geojson" / "zones_population.geojson"


@zones_bp.get("/zones")
def zones():
    if not GEOJSON_PATH.is_file():
        return jsonify(
            erreur="Asset cartographique absent",
            detail="Le GeoJSON des zones n'est pas livré à M0.",
            statut="a_fournir_par_p1",
        ), 503
    annee = request.args.get("annee")
    return jsonify(type="FeatureCollection", features=[]), 200