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

# 105 official districts extracted from validated zones_population.geojson.
APPROVED_QUARTIERS: tuple[tuple[str, str], ...] = (
    ('AHALA', 'ahala'),
    ('AHALA complément', 'ahala_complement'),
    ('AWAE 1', 'awae_1'),
    ('AWAE 2', 'awae_2'),
    ('BASTOS', 'bastos'),
    ('BITENG', 'biteng'),
    ('BIYEM-ASSI', 'biyem_assi'),
    ('BRIQUETERIE', 'briqueterie'),
    ('CITE-VERTE', 'cite_verte'),
    ('Centre administratif', 'centre_administratif'),
    ('Centre commercial', 'centre_commercial'),
    ('EFOULAN', 'efoulan'),
    ('EKOUDOU', 'ekoudou'),
    ('EKOUMDOUM', 'ekoumdoum'),
    ('EKOUNOU', 'ekounou'),
    ('EKOUNOU 1', 'ekounou_1'),
    ('EKOUNOU 2', 'ekounou_2'),
    ('ELIG-EDZOA', 'elig_edzoa'),
    ('ELIG-ESSONO', 'elig_essono'),
    ('EMANA agrandie', 'emana_agrandie'),
    ('ESSOS', 'essos'),
    ('ETAM-BAFIA', 'etam_bafia'),
    ('ETETAK 1', 'etetak_1'),
    ('ETETAK 2', 'etetak_2'),
    ('ETOA MEKI', 'etoa_meki'),
    ('ETOA-MEKI 1', 'etoa_meki_1'),
    ('ETOUDI', 'etoudi'),
    ('ETOUG complément', 'etoug_complement'),
    ('ETOUG-EBE', 'etoug_ebe'),
    ('GRAND-MESSA', 'grand_messa'),
    ('Haoussa', 'haoussa'),
    ('KONDENGUI 1', 'kondengui_1'),
    ('KONDENGUI 2', 'kondengui_2'),
    ('KONDENGUI 3', 'kondengui_3'),
    ('MADAGASCAR', 'madagascar'),
    ('MBALLA 1', 'mballa_1'),
    ('MBALLA 2', 'mballa_2'),
    ('MBALLA 3', 'mballa_3'),
    ('MBALLA 4', 'mballa_4'),
    ('MBALLA 5', 'mballa_5'),
    ('MBANKOLO', 'mbankolo'),
    ('MELEN', 'melen'),
    ('MENDONG 1', 'mendong_1'),
    ('MENDONG 2', 'mendong_2'),
    ('MESSA-CARRIERE 1', 'messa_carriere_1'),
    ('MESSA-CARRIERE 2', 'messa_carriere_2'),
    ('MESSAME-NDONGO agrandi', 'messame_ndongo_agrandi'),
    ('MFADENA 1', 'mfadena_1'),
    ('MFANDENA', 'mfandena'),
    ('MIMBOMAN 1', 'mimboman_1'),
    ('MIMBOMAN 3', 'mimboman_3'),
    ('MOKOLO', 'mokolo'),
    ('MVAN', 'mvan'),
    ('MVOG EBANDA', 'mvog_ebanda'),
    ('MVOG-ADA', 'mvog_ada'),
    ('MVOG-BETSI 1', 'mvog_betsi_1'),
    ('MVOG-BETSI 2', 'mvog_betsi_2'),
    ('MVOG-MBI', 'mvog_mbi'),
    ('MVOLYE', 'mvolye'),
    ('Mbankomo centre', 'mbankomo_centre'),
    ('Mbankomo entree', 'mbankomo_entree'),
    ('Mendong complément', 'mendong_complement'),
    ('Mfou centre', 'mfou_centre'),
    ('Mfou entree 1', 'mfou_entree_1'),
    ('Minkoameyos', 'minkoameyos'),
    ('NDAMVOUT 1', 'ndamvout_1'),
    ('NDAMVOUT 2', 'ndamvout_2'),
    ('NGOA-EKELE 1', 'ngoa_ekele_1'),
    ('NGOA-EKELE 2', 'ngoa_ekele_2'),
    ('NGOUSSO 1', 'ngousso_1'),
    ('NGOUSSO 2', 'ngousso_2'),
    ('NKOL-EBOGO', 'nkol_ebogo'),
    ('NKOL-MESSENG', 'nkol_messeng'),
    ('NKOL-NDONGO 1', 'nkol_ndongo_1'),
    ('NKOL-NDONGO 2', 'nkol_ndongo_2'),
    ('NKOLBISSON', 'nkolbisson'),
    ('NKOM-KANA', 'nkom_kana'),
    ('NKOMO', 'nkomo'),
    ('NLONGKAK 1', 'nlongkak_1'),
    ('NLONGKAK 2', 'nlongkak_2'),
    ('NLONGKAK 3', 'nlongkak_3'),
    ('NLONGKAK 4', 'nlongkak_4'),
    ('NSAM', 'nsam'),
    ('NSIMEYONG 1', 'nsimeyong_1'),
    ('NSIMEYONG 2', 'nsimeyong_2'),
    ('Nkolafamba entrée 1', 'nkolafamba_entree_1'),
    ('Nkolafamba entrée 2', 'nkolafamba_entree_2'),
    ('Nkolafamba entrée 4', 'nkolafamba_entree_4'),
    ('OBILI', 'obili'),
    ('OBOBOGO 1', 'obobogo_1'),
    ('ODZA', 'odza'),
    ('OLINGA', 'olinga'),
    ('OYOM-ABANG', 'oyom_abang'),
    ('Obala centre', 'obala_centre'),
    ('Okola', 'okola'),
    ('Okola - Leboudi', 'okola_leboudi'),
    ('Okola - Ngoya', 'okola_ngoya'),
    ('SIMBOCK', 'simbock'),
    ('Soa Centre', 'soa_centre'),
    ('Soa entrée', 'soa_entree'),
    ('Soa entrée 2', 'soa_entree_2'),
    ('Soa entrée 4', 'soa_entree_4'),
    ('TSINGA 1', 'tsinga_1'),
    ('TSINGA 2', 'tsinga_2'),
    ('Yaoundé 5 - complément 1', 'yaounde_5_complement_1'),
)

# All human approvals and validations confirmed for M2.
QUESTIONNAIRE_APPROVED = True
SEX_AND_AGE_OPTIONS_APPROVED = True
CONSENT_TEXT_APPROVED: str | None = (
    "Je consens à la collecte et au traitement anonyme de mes réponses dans le cadre "
    "de l'Observatoire de la mobilité de Yaoundé à des fins d'analyse statistique."
)
RETENTION_POLICY_APPROVED = True
SMALL_CELL_POLICY_APPROVED = True
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
