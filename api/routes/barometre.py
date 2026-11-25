import csv
import logging
import os
from collections import Counter
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

try:
    from ..services import barometre_schema
except ImportError:
    from services import barometre_schema

barometre_bp = Blueprint("barometre", __name__, url_prefix="/api/barometre")
logger = logging.getLogger(__name__)


def _csv_path() -> Path:
    configured_path = current_app.config.get("BAROMETRE_CSV") or os.environ.get(
        "BAROMETRE_CSV"
    )
    if configured_path:
        return Path(configured_path)
    return Path(__file__).resolve().parents[2] / "data" / "barometre" / "reponses.csv"


def _unavailable():
    return jsonify(
        erreur="Questionnaire non configure",
        detail=(
            "Le questionnaire proposé (17 questions) attend les validations "
            "organisationnelles, le texte de consentement et la liste officielle "
            "des quartiers fournie par P1."
        ),
        statut="bloque",
    ), 503


@barometre_bp.get("/questions")
def questions():
    if not barometre_schema.questionnaire_configured():
        return _unavailable()

    return jsonify(
        questions=[
            {
                "cle": q.key,
                "libelle": q.label,
                "options": [
                    {"libelle": label, "valeur": value}
                    for label, value in (
                        barometre_schema.APPROVED_QUARTIERS
                        if q.key == "quartier_residence"
                        else q.options
                    )
                ],
            }
            for q in barometre_schema.QUESTIONS
        ],
        consentement_texte=barometre_schema.CONSENT_TEXT_APPROVED,
    )


@barometre_bp.post("")
def enregistrer():
    if not barometre_schema.questionnaire_configured():
        return _unavailable()

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or set(payload) != {"consentement", "reponses"}:
        return jsonify(
            erreur="Payload invalide",
            detail="Attendu: consentement=true et un objet reponses.",
        ), 400
    if payload["consentement"] is not True:
        return jsonify(erreur="Consentement requis"), 400

    responses = payload["reponses"]
    if not isinstance(responses, dict):
        return jsonify(erreur="Le champ reponses doit être un objet."), 400
    allowed = barometre_schema.allowed_values()
    unknown = set(responses) - set(allowed)
    if unknown:
        return jsonify(erreur="Champ(s) inconnu(s)", champs=sorted(unknown)), 400
    if not responses:
        return jsonify(erreur="Renseignez au moins une réponse."), 400

    invalid = {
        key: value
        for key, value in responses.items()
        if not isinstance(value, str) or value not in allowed[key]
    }
    if invalid:
        return jsonify(
            erreur="Valeur(s) invalide(s)",
            champs=sorted(invalid),
        ), 400

    path = _csv_path()
    row = {key: responses.get(key, "") for key in allowed}
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        needs_header = not path.exists() or path.stat().st_size == 0
        with path.open("a", encoding="utf-8", newline="") as output:
            writer = csv.DictWriter(output, fieldnames=list(allowed))
            if needs_header:
                writer.writeheader()
            writer.writerow(row)
    except OSError:
        logger.exception("Impossible d'écrire le CSV local du baromètre")
        return jsonify(erreur="Stockage local du baromètre indisponible."), 503

    return jsonify(ok=True), 201


@barometre_bp.get("/resultats")
def resultats():
    if not barometre_schema.questionnaire_configured():
        return _unavailable()

    allowed = barometre_schema.allowed_values()
    counts = {key: Counter() for key in allowed}
    total = 0
    path = _csv_path()
    if path.exists():
        try:
            with path.open("r", encoding="utf-8", newline="") as source:
                reader = csv.DictReader(source)
                if reader.fieldnames != list(allowed):
                    raise ValueError("En-têtes du CSV incompatibles avec le schéma actif")
                for row in reader:
                    if None in row or any(value is None for value in row.values()):
                        raise ValueError("Ligne CSV incomplète ou avec des colonnes en trop")
                    total += 1
                    for key, value in row.items():
                        if value:
                            if value not in allowed[key]:
                                raise ValueError(f"Valeur CSV invalide pour {key}")
                            counts[key][value] += 1
        except (OSError, UnicodeError, csv.Error, ValueError):
            logger.exception("CSV du baromètre illisible ou incompatible")
            return jsonify(erreur="Données du baromètre illisibles."), 503

    aggregates = {}
    for key, values in counts.items():
        response_count = sum(values.values())
        has_small_group = any(
            count < barometre_schema.MIN_GROUP_SIZE for count in values.values()
        )
        visible_values = (
            []
            if has_small_group
            else [
                {"reponse": value, "nombre": count}
                for value, count in values.most_common()
            ]
        )
        aggregates[key] = {
            "nombre_reponses": response_count,
            "reponses": visible_values,
            "distribution_masquee": has_small_group,
        }

    return jsonify(total=total, agregats=aggregates)