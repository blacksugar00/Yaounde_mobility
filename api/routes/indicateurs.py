from pathlib import Path

from flask import Blueprint, jsonify, request

indicateurs_bp = Blueprint("indicateurs", __name__, url_prefix="/api")
INDICATEURS_DIR = Path(__file__).resolve().parents[1].parent / "data" / "indicateurs"


def missing_asset():
    return jsonify(
        erreur="Assets indicateurs absents",
        detail="Aucun JSON d'indicateurs n'est livré à M0.",
    ), 503


@indicateurs_bp.get("/indicateurs")
def liste_indicateurs():
    if not INDICATEURS_DIR.exists() or not list(INDICATEURS_DIR.glob("*.json")):
        return missing_asset()
    return jsonify([])


@indicateurs_bp.get("/indicateurs/<code>")
def detail_indicateur(code):
    if not list(INDICATEURS_DIR.glob("*.json")):
        return missing_asset()
    return jsonify(
        erreur="Indicateur absent",
        code=code,
        detail="Le code n'est pas présent dans les assets P1 disponibles.",
    ), 404