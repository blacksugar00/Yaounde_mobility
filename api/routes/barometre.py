import os
from pathlib import Path

from flask import Blueprint, jsonify, request

barometre_bp = Blueprint("barometre", __name__, url_prefix="/api/barometre")
FIELDS = {}
ALLOWED = {}


def unavailable():
    return jsonify(
        erreur="Questionnaire non configure",
        detail="Le schema officiel 6-8 questions n'a pas ete approuve.",
        statut="bloque",
    ), 503


@barometre_bp.post("")
def enregistrer():
    if not FIELDS:
        return unavailable()
    return unavailable()


@barometre_bp.get("/resultats")
def resultats():
    if not FIELDS:
        return unavailable()
    return unavailable()