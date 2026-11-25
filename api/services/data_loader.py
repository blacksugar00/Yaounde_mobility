import json
import math
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[2]
INDICATORS_DIR = ROOT_DIR / "data" / "indicateurs"
ZONES_FILE = ROOT_DIR / "data" / "geojson" / "zones_population.geojson"
ZONE_PROPERTIES = {"nom", "pop_2018", "pop_2025", "pop_2035"}
OPTIONAL_ZONE_PROPERTIES = {"id_zone"}
SERIES_FIELDS = {"scenario", "annee", "valeur", "origine"}


class DataAssetError(RuntimeError):
    """Raised when a prepared data asset is missing or violates its contract."""


def _read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise DataAssetError(f"Unable to read valid JSON from {path}") from error


def _is_number(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
    )


def _is_position(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) >= 2
        and all(_is_number(ordinate) for ordinate in value)
        and -180 <= value[0] <= 180
        and -90 <= value[1] <= 90
    )


def _is_linear_ring(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) >= 4
        and all(_is_position(position) for position in value)
        and value[0][:2] == value[-1][:2]
    )


def _is_polygon_coordinates(value: Any) -> bool:
    return (
        isinstance(value, list)
        and bool(value)
        and all(_is_linear_ring(ring) for ring in value)
    )


@lru_cache(maxsize=8)
def load_indicators(directory: Path = INDICATORS_DIR) -> list[dict[str, Any]]:
    files = sorted(directory.glob("*.json")) if directory.is_dir() else []
    if not files:
        raise DataAssetError(f"No indicator JSON assets found in {directory}")

    indicators: list[dict[str, Any]] = []
    seen_codes: set[str] = set()
    for path in files:
        content = _read_json(path)
        if not isinstance(content, list):
            raise DataAssetError(f"{path.name} must contain a JSON list")

        for item in content:
            if not isinstance(item, dict):
                raise DataAssetError(f"Invalid indicator record in {path.name}")
            required_fields = {"code", "libelle", "unite", "source", "series"}
            if not required_fields.issubset(item):
                raise DataAssetError(f"Missing indicator fields in {path.name}")
            if any(
                not isinstance(item[field], str) or not item[field].strip()
                for field in ("code", "libelle", "unite", "source")
            ):
                raise DataAssetError(f"Invalid indicator metadata in {path.name}")

            code = item["code"]
            if code in seen_codes:
                raise DataAssetError(f"Duplicate indicator code: {code}")
            series = item["series"]
            if not isinstance(series, list):
                raise DataAssetError(f"Invalid series for indicator {code}")
            for point in series:
                if not isinstance(point, dict) or not SERIES_FIELDS.issubset(point):
                    raise DataAssetError(f"Invalid series point for indicator {code}")
                if (
                    not isinstance(point["scenario"], str)
                    or not point["scenario"].strip()
                    or not isinstance(point["origine"], str)
                    or not point["origine"].strip()
                    or not isinstance(point["annee"], int)
                    or isinstance(point["annee"], bool)
                    or not _is_number(point["valeur"])
                ):
                    raise DataAssetError(f"Invalid series values for indicator {code}")
                if "statut" in point and point["statut"] is not None and not isinstance(
                    point["statut"], str
                ):
                    raise DataAssetError(f"Invalid series status for indicator {code}")

            seen_codes.add(code)
            indicators.append(item)

    if not indicators:
        raise DataAssetError(f"No indicator records found in {directory}")

    return indicators


@lru_cache(maxsize=8)
def load_zones(
    path: Path = ZONES_FILE,
    expected_feature_count: int = 105,
) -> dict[str, Any]:
    content = _read_json(path)
    if not isinstance(content, dict) or content.get("type") != "FeatureCollection":
        raise DataAssetError("The GeoJSON root must be a FeatureCollection")

    features = content.get("features")
    if (
        not isinstance(features, list)
        or len(features) != expected_feature_count
        or expected_feature_count < 1
    ):
        raise DataAssetError(
            f"Expected {expected_feature_count} GeoJSON features in {path.name}"
        )

    seen_zone_ids: set[int | str] = set()
    for feature in features:
        if not isinstance(feature, dict) or feature.get("type") != "Feature":
            raise DataAssetError(f"Invalid GeoJSON feature in {path.name}")
        if "id" in feature:
            raise DataAssetError(f"Unexpected feature identifier in {path.name}")
        geometry = feature.get("geometry")
        if not isinstance(geometry, dict):
            raise DataAssetError(f"Invalid geometry in {path.name}")
        geometry_type = geometry.get("type")
        coordinates = geometry.get("coordinates")
        if geometry_type == "Polygon":
            valid_geometry = _is_polygon_coordinates(coordinates)
        elif geometry_type == "MultiPolygon":
            valid_geometry = (
                isinstance(coordinates, list)
                and bool(coordinates)
                and all(_is_polygon_coordinates(polygon) for polygon in coordinates)
            )
        else:
            valid_geometry = False
        if not valid_geometry:
            raise DataAssetError(f"Invalid geometry in {path.name}")

        properties = feature.get("properties")
        if not isinstance(properties, dict):
            raise DataAssetError(f"Invalid zone properties in {path.name}")
        property_names = set(properties)
        if property_names not in (
            ZONE_PROPERTIES,
            ZONE_PROPERTIES | OPTIONAL_ZONE_PROPERTIES,
        ):
            raise DataAssetError(f"Invalid zone properties in {path.name}")
        if not isinstance(properties["nom"], str) or not properties["nom"].strip():
            raise DataAssetError(f"Invalid zone name in {path.name}")
        if any(not _is_number(properties[key]) for key in ZONE_PROPERTIES - {"nom"}):
            raise DataAssetError(f"Invalid population values in {path.name}")
        if "id_zone" in properties:
            zone_id = properties["id_zone"]
            if (
                isinstance(zone_id, bool)
                or not isinstance(zone_id, (int, str))
                or (isinstance(zone_id, str) and not zone_id.strip())
                or zone_id in seen_zone_ids
            ):
                raise DataAssetError(f"Invalid or duplicate zone id in {path.name}")
            seen_zone_ids.add(zone_id)

    return content
