import logging
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

try:
    from ..services.data_loader import DataAssetError, INDICATORS_DIR, load_indicators
except ImportError:
    from services.data_loader import DataAssetError, INDICATORS_DIR, load_indicators


logger = logging.getLogger(__name__)
indicateurs_bp = Blueprint("indicateurs", __name__, url_prefix="/api")


def _read_indicators():
    directory = Path(current_app.config.get("INDICATORS_DIR", INDICATORS_DIR))
    try:
        return load_indicators(directory)
    except DataAssetError:
        logger.exception("Indicator assets are missing or invalid")
        return None


@indicateurs_bp.get("/indicateurs")
def liste_indicateurs():
    indicators = _read_indicators()
    if indicators is None:
        return jsonify(erreur="Données indicateurs absentes ou invalides."), 503

    return jsonify(
        [
            {
                "code": indicator["code"],
                "libelle": indicator["libelle"],
                "unite": indicator["unite"],
            }
            for indicator in indicators
        ]
    )


@indicateurs_bp.get("/indicateurs/<code>")
def detail_indicateur(code: str):
    indicators = _read_indicators()
    if indicators is None:
        return jsonify(erreur="Données indicateurs absentes ou invalides."), 503

    indicator = next((item for item in indicators if item["code"] == code), None)
    if indicator is None:
        return jsonify(erreur="Indicateur inconnu.", code=code), 404

    scenario = request.args.get("scenario")
    if scenario is None:
        return jsonify(indicator)

    series = [
        point for point in indicator["series"] if point["scenario"] == scenario
    ]
    if not series:
        return jsonify(
            erreur="Scenario indisponible pour cet indicateur.",
            code=code,
            scenario=scenario,
        ), 404
    return jsonify({**indicator, "series": series})
