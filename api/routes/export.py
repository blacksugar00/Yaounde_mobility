"""F11/F12 — export des indicateurs (CSV) et des couches GeoJSON.

Les valeurs sont reprises telles quelles depuis les assets préparés par P1 :
aucun recalcul, aucun arrondi. Les réponses brutes du baromètre ne sont jamais
exportées (seuls les agrégats anonymisés sont publics, via /api/barometre/resultats).
"""

import csv
import io
import json
from pathlib import Path

from flask import Blueprint, Response, current_app, jsonify, request

try:
    from .indicateurs import _read_indicators
    from ..services.data_loader import (
        DataAssetError,
        GEOJSON_DIR,
        GEOJSON_LAYER_FILES,
        ZONES_FILE,
        load_geojson_layer,
        load_zones,
    )
except ImportError:
    from routes.indicateurs import _read_indicators
    from services.data_loader import (
        DataAssetError,
        GEOJSON_DIR,
        GEOJSON_LAYER_FILES,
        ZONES_FILE,
        load_geojson_layer,
        load_zones,
    )


export_bp = Blueprint("export", __name__, url_prefix="/api/export")

CSV_COLUMNS = (
    "code",
    "libelle",
    "unite",
    "scenario",
    "annee",
    "valeur",
    "statut",
    "origine",
    "source",
)


def _csv_response(indicators, filename: str, scenario: str | None) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(CSV_COLUMNS)
    for indicator in indicators:
        for point in indicator["series"]:
            if scenario is not None and point["scenario"] != scenario:
                continue
            writer.writerow(
                (
                    indicator["code"],
                    indicator["libelle"],
                    indicator["unite"],
                    point["scenario"],
                    point["annee"],
                    point["valeur"],
                    point.get("statut") or "",
                    point["origine"],
                    indicator["source"],
                )
            )
    # BOM UTF-8 : les accents s'affichent correctement à l'ouverture dans Excel.
    body = "﻿" + buffer.getvalue()
    return Response(
        body,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "text/csv; charset=utf-8",
        },
    )


@export_bp.get("/indicateurs.csv")
def export_tous_indicateurs():
    indicators = _read_indicators()
    if indicators is None:
        return jsonify(erreur="Données indicateurs absentes ou invalides."), 503
    scenario = request.args.get("scenario") or None
    return _csv_response(indicators, "indicateurs_yaounde.csv", scenario)


@export_bp.get("/indicateurs/<code>.csv")
def export_indicateur(code: str):
    indicators = _read_indicators()
    if indicators is None:
        return jsonify(erreur="Données indicateurs absentes ou invalides."), 503
    indicator = next((item for item in indicators if item["code"] == code), None)
    if indicator is None:
        return jsonify(erreur="Indicateur inconnu.", code=code), 404
    scenario = request.args.get("scenario") or None
    if scenario is not None and not any(
        point["scenario"] == scenario for point in indicator["series"]
    ):
        return jsonify(
            erreur="Scenario indisponible pour cet indicateur.",
            code=code,
            scenario=scenario,
        ), 404
    safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in code)
    return _csv_response([indicator], f"{safe_name}.csv", scenario)


@export_bp.get("/geojson/<layer>.geojson")
def export_geojson(layer: str):
    filename = GEOJSON_LAYER_FILES.get(layer)
    if filename is None:
        return jsonify(
            erreur="Couche GeoJSON inconnue.",
            couche=layer,
            couches_valides=sorted(GEOJSON_LAYER_FILES),
        ), 404

    try:
        if layer == "zones_population":
            path = Path(current_app.config.get("ZONES_FILE", ZONES_FILE))
            expected_count = current_app.config.get("ZONE_FEATURE_COUNT", 105)
            content = load_zones(path, expected_count)
        else:
            directory = Path(current_app.config.get("GEOJSON_DIR", GEOJSON_DIR))
            content = load_geojson_layer(directory / filename)
    except DataAssetError:
        current_app.logger.exception("GeoJSON layer %s is missing or invalid", layer)
        return jsonify(erreur="Données géographiques absentes ou invalides."), 503

    return Response(
        json.dumps(content, ensure_ascii=False),
        mimetype="application/geo+json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
