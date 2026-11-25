"""Proposed barometre contract; collection stays disabled until approvals land."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Question:
    key: str
    label: str
    options: tuple[tuple[str, str], ...]


QUESTIONS = (
    Question("sexe", "Quel est votre sexe ?", (("Femme", "femme"), ("Homme", "homme"))),
    Question(
        "tranche_age",
        "Dans quelle tranche d’âge vous situez-vous ?",
        (
            ("18–24 ans", "18_24"),
            ("25–34 ans", "25_34"),
            ("35–44 ans", "35_44"),
            ("45–54 ans", "45_54"),
            ("55–64 ans", "55_64"),
            ("65 ans ou plus", "65_plus"),
        ),
    ),
    Question("quartier_residence", "Dans quel quartier résidez-vous ?", ()),
    Question(
        "taille_foyer",
        "Combien de personnes vivent dans votre foyer ?",
        tuple((str(count), str(count)) for count in range(1, 8))
        + (("8 ou plus", "8_plus"),),
    ),
    Question(
        "vehicules_foyer",
        "Combien de véhicules votre foyer possède-t-il ?",
        tuple((str(count), str(count)) for count in range(4))
        + (("4 ou plus", "4_plus"),),
    ),
    Question(
        "permis_conduire",
        "Avez-vous un permis de conduire valide ?",
        (("Oui", "oui"), ("Non", "non")),
    ),
    Question(
        "abonnement_transport",
        "Avez-vous actuellement un abonnement de transport collectif ?",
        (("Oui", "oui"), ("Non", "non")),
    ),
    Question(
        "mode_principal",
        "Quel moyen de déplacement utilisez-vous le plus souvent à Yaoundé ?",
        (
            ("Marche à pied", "marche"),
            ("Moto-taxi", "moto_taxi"),
            ("Taxi", "taxi"),
            ("Bus ou autocar", "bus_autocar"),
            ("Voiture personnelle", "voiture_personnelle"),
            ("Voiture partagée", "voiture_partagee"),
            ("Vélo", "velo"),
        ),
    ),
    Question(
        "motif_principal",
        "Quel est le motif principal de vos déplacements ?",
        (
            ("Travail", "travail"),
            ("Études", "etudes"),
            ("Achats", "achats"),
            ("Loisirs", "loisirs"),
            ("Autres motifs", "autres_motifs"),
        ),
    ),
    Question(
        "duree_trajet",
        "Combien de temps dure habituellement un de vos trajets ?",
        (
            ("Moins de 15 minutes", "moins_15"),
            ("De 15 à moins de 30 minutes", "15_30"),
            ("De 30 à moins de 45 minutes", "30_45"),
            ("De 45 minutes à moins d’une heure", "45_60"),
            ("D’une heure à moins d’une heure 30", "60_90"),
            ("Une heure 30 ou plus", "90_plus"),
        ),
    ),
    Question(
        "frequence_taxi",
        "À quelle fréquence utilisez-vous un taxi ?",
        (
            ("Très souvent", "tres_souvent"),
            ("Souvent", "souvent"),
            ("Parfois", "parfois"),
            ("Rarement", "rarement"),
            ("Jamais", "jamais"),
        ),
    ),
    Question(
        "frequence_moto_taxi",
        "À quelle fréquence utilisez-vous une moto-taxi ?",
        (
            ("Très souvent", "tres_souvent"),
            ("Souvent", "souvent"),
            ("Parfois", "parfois"),
            ("Rarement", "rarement"),
            ("Jamais", "jamais"),
        ),
    ),
    Question(
        "situation_moto_taxi",
        "Dans quelle situation choisissez-vous principalement une moto-taxi ?",
        (
            ("Pour contourner les embouteillages", "embouteillages"),
            ("Lorsque je suis pressé(e)", "urgence"),
            ("Pour un trajet court", "trajet_court"),
            (
                "Pour rejoindre une destination difficile d’accès ou peu desservie",
                "destination_peu_desserte",
            ),
            (
                "Lorsque mon moyen de transport habituel n’est pas disponible",
                "mode_habituel_indisponible",
            ),
        ),
    ),
    Question(
        "securite_taxi",
        "Dans quelle mesure vous sentez-vous en sécurité lorsque vous prenez un taxi à Yaoundé ?",
        (
            ("Tout à fait en sécurité", "tres_en_securite"),
            ("Plutôt en sécurité", "plutot_en_securite"),
            ("Ni en sécurité ni en insécurité", "neutre"),
            ("Plutôt en insécurité", "plutot_en_insecurite"),
            ("Pas du tout en sécurité", "pas_du_tout_en_securite"),
        ),
    ),
    Question(
        "preoccupation_moto_taxi",
        "Quel aspect des moto-taxis vous préoccupe le plus, s’il y en a un ?",
        (
            ("La sécurité du trajet", "securite"),
            ("La conduite dans la circulation", "conduite_circulation"),
            ("Le coût", "cout"),
            ("Le confort ou l’exposition aux intempéries", "confort_intemperies"),
            ("La disponibilité ou le temps d’attente", "disponibilite_attente"),
            ("Aucun aspect ne me préoccupe particulièrement", "aucune_preoccupation"),
        ),
    ),
    Question(
        "critere_choix",
        "Quel critère compte le plus dans le choix de votre moyen de déplacement ?",
        (
            ("La durée du trajet", "duree"),
            ("Le coût", "cout"),
            ("La sécurité", "securite"),
            ("La disponibilité", "disponibilite"),
            ("Le confort", "confort"),
            ("La facilité d’accès à la destination", "acces_destination"),
        ),
    ),
    Question(
        "priorite_mobilite",
        "Quelle amélioration devrait être prioritaire pour les déplacements à Yaoundé ?",
        (
            ("Améliorer la sécurité", "securite"),
            ("Réduire les embouteillages et la durée des trajets", "reduction_congestion"),
            ("Rendre les déplacements plus abordables", "cout"),
            (
                "Améliorer la disponibilité et la régularité des transports collectifs",
                "transports_collectifs",
            ),
            ("Améliorer les conditions de déplacement à pied", "deplacements_pietons"),
            ("Faciliter l’accès aux quartiers moins bien desservis", "acces_quartiers"),
        ),
    ),
)

# P1 must supply these pairs from the validated geographic source. No values are guessed.
APPROVED_QUARTIERS: tuple[tuple[str, str], ...] = ()

# These gates must only be changed after the corresponding human approvals.
QUESTIONNAIRE_APPROVED = False
SEX_AND_AGE_OPTIONS_APPROVED = False
CONSENT_TEXT_APPROVED: str | None = None
RETENTION_POLICY_APPROVED = False
SMALL_CELL_POLICY_APPROVED = False
MIN_GROUP_SIZE = 5


def allowed_values() -> dict[str, frozenset[str]]:
    values = {
        question.key: frozenset(value for _, value in question.options)
        for question in QUESTIONS
    }
    values["quartier_residence"] = frozenset(value for _, value in APPROVED_QUARTIERS)
    return values


def questionnaire_configured() -> bool:
    district_values = [value for _, value in APPROVED_QUARTIERS]
    return (
        QUESTIONNAIRE_APPROVED
        and SEX_AND_AGE_OPTIONS_APPROVED
        and bool(APPROVED_QUARTIERS)
        and all(label and value for label, value in APPROVED_QUARTIERS)
        and len(district_values) == len(set(district_values))
        and bool(CONSENT_TEXT_APPROVED)
        and RETENTION_POLICY_APPROVED
        and SMALL_CELL_POLICY_APPROVED
        and MIN_GROUP_SIZE >= 2
        and all(
            question.options
            for question in QUESTIONS
            if question.key != "quartier_residence"
        )
    )
