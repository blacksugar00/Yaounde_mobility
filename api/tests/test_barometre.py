import csv
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from api.app import create_app
from api.services import barometre_schema


class BarometreTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.csv_path = Path(self.temp_dir.name) / "responses.csv"
        self.app = create_app()
        self.app.config.update(TESTING=True, BAROMETRE_CSV=str(self.csv_path))
        self.client = self.app.test_client()
        self.approvals = [
            patch.object(barometre_schema, "QUESTIONNAIRE_APPROVED", True),
            patch.object(barometre_schema, "SEX_AND_AGE_OPTIONS_APPROVED", True),
            patch.object(
                barometre_schema,
                "APPROVED_QUARTIERS",
                (("Centre-ville", "centre_ville"),),
            ),
            patch.object(
                barometre_schema,
                "CONSENT_TEXT_APPROVED",
                "Texte approuvé par l’organisation",
            ),
            patch.object(barometre_schema, "RETENTION_POLICY_APPROVED", True),
            patch.object(barometre_schema, "SMALL_CELL_POLICY_APPROVED", True),
            patch.object(barometre_schema, "MIN_GROUP_SIZE", 2),
        ]
        for approval in self.approvals:
            approval.start()
            self.addCleanup(approval.stop)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_contract_has_seventeen_questions_and_pending_district_list(self):
        self.assertEqual(len(barometre_schema.QUESTIONS), 17)
        self.assertEqual(
            [question.key for question in barometre_schema.QUESTIONS],
            [
                "sexe",
                "tranche_age",
                "quartier_residence",
                "taille_foyer",
                "vehicules_foyer",
                "permis_conduire",
                "abonnement_transport",
                "mode_principal",
                "motif_principal",
                "duree_trajet",
                "frequence_taxi",
                "frequence_moto_taxi",
                "situation_moto_taxi",
                "securite_taxi",
                "preoccupation_moto_taxi",
                "critere_choix",
                "priorite_mobilite",
            ],
        )
        self.assertEqual(
            barometre_schema.allowed_values()["sexe"],
            frozenset({"femme", "homme"}),
        )
        with (
            patch.object(barometre_schema, "QUESTIONNAIRE_APPROVED", False),
            patch.object(barometre_schema, "APPROVED_QUARTIERS", ()),
        ):
            self.assertFalse(barometre_schema.questionnaire_configured())
            self.assertEqual(
                barometre_schema.allowed_values()["quartier_residence"],
                frozenset(),
            )

    def test_disabled_routes_return_503_without_creating_csv(self):
        with patch.object(barometre_schema, "QUESTIONNAIRE_APPROVED", False):
            post = self.client.post(
                "/api/barometre",
                json={"consentement": True, "reponses": {"sexe": "femme"}},
            )
            get = self.client.get("/api/barometre/resultats")

        self.assertEqual(post.status_code, 503)
        self.assertEqual(get.status_code, 503)
        self.assertFalse(self.csv_path.exists())

    def test_partial_submission_writes_blank_columns_and_suppresses_small_groups(self):
        response = self.client.post(
            "/api/barometre",
            json={
                "consentement": True,
                "reponses": {"sexe": "femme", "mode_principal": "marche"},
            },
        )
        self.assertEqual(response.status_code, 201)
        repeated = self.client.post(
            "/api/barometre",
            json={"consentement": True, "reponses": {"sexe": "femme"}},
        )
        self.assertEqual(repeated.status_code, 201)

        with self.csv_path.open(encoding="utf-8", newline="") as source:
            reader = csv.DictReader(source)
            self.assertEqual(
                reader.fieldnames,
                [question.key for question in barometre_schema.QUESTIONS],
            )
            rows = list(reader)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["sexe"], "femme")
        self.assertEqual(rows[0]["quartier_residence"], "")
        self.assertEqual(rows[0]["priorite_mobilite"], "")

        results = self.client.get("/api/barometre/resultats")
        self.assertEqual(results.status_code, 200)
        data = results.get_json()
        self.assertEqual(data["total"], 2)
        self.assertEqual(data["agregats"]["sexe"]["nombre_reponses"], 2)
        self.assertFalse(data["agregats"]["sexe"]["distribution_masquee"])
        self.assertEqual(
            data["agregats"]["sexe"]["reponses"],
            [{"reponse": "femme", "nombre": 2}],
        )
        self.assertTrue(data["agregats"]["mode_principal"]["distribution_masquee"])
        self.assertEqual(data["agregats"]["tranche_age"]["nombre_reponses"], 0)

    def test_invalid_values_and_no_answer_do_not_create_csv(self):
        invalid = self.client.post(
            "/api/barometre",
            json={"consentement": True, "reponses": {"sexe": "autre"}},
        )
        unknown = self.client.post(
            "/api/barometre",
            json={"consentement": True, "reponses": {"adresse": "Centre"}},
        )
        empty = self.client.post(
            "/api/barometre",
            json={"consentement": True, "reponses": {}},
        )
        no_consent = self.client.post(
            "/api/barometre",
            json={"consentement": False, "reponses": {"sexe": "femme"}},
        )
        missing_consent = self.client.post(
            "/api/barometre",
            json={"reponses": {"sexe": "femme"}},
        )

        self.assertEqual(invalid.status_code, 400)
        self.assertEqual(unknown.status_code, 400)
        self.assertEqual(empty.status_code, 400)
        self.assertEqual(no_consent.status_code, 400)
        self.assertEqual(missing_consent.status_code, 400)
        self.assertFalse(self.csv_path.exists())


if __name__ == "__main__":
    unittest.main()
