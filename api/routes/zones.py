import logging
from pathlib import Path
from typing import Any

from flask import Blueprint, current_app, jsonify, request

try:
    from ..services.data_loader import DataAssetError, ZONES_FILE, load_zones
except ImportError:
    from services.data_loader import DataAssetError, ZONES_FILE, load_zones


logger = logging.getLogger(__name__)
zones_bp = Blueprint("zones", __name__, url_prefix="/api")
VALID_YEARS = {"2018", "2025", "2035"}


@zones_bp.get("/zones")
def zones():
    year = request.args.get("annee", "2018")
    if year not in VALID_YEARS:
        return jsonify(
            erreur="Année invalide.",
            annees_valides=sorted(VALID_YEARS),
        ), 400

    path = Path(current_app.config.get("ZONES_FILE", ZONES_FILE))
    expected_count = current_app.config.get("ZONE_FEATURE_COUNT", 105)
    try:
        content: dict[str, Any] = load_zones(path, expected_count)
    except DataAssetError:
        logger.exception("GeoJSON zones asset is missing or invalid")
        return jsonify(erreur="Données géographiques absentes ou invalides."), 503

    return jsonify(content)
