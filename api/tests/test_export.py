import csv
import io
import json
import tempfile
import unittest
from pathlib import Path

from api.app import create_app


FIXTURES = Path(__file__).parent / "fixtures"


def _rows(response):
    text = response.get_data(as_text=True)
    return list(csv.DictReader(io.StringIO(text.lstrip("﻿"))))


class ExportApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(
            TESTING=True,
            INDICATORS_DIR=FIXTURES / "indicators",
            ZONES_FILE=FIXTURES / "geojson" / "zones_population.geojson",
            ZONE_FEATURE_COUNT=1,
        )
        self.client = self.app.test_client()
        fixture = json.loads(
            (FIXTURES / "indicators" / "mock_mobility.json").read_text(encoding="utf-8")
        )
        self.indicator = fixture[0]

    def test_full_csv_export_preserves_every_point_unchanged(self):
        response = self.client.get("/api/export/indicateurs.csv")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content_type.startswith("text/csv"))
        self.assertIn("attachment", response.headers["Content-Disposition"])

        rows = _rows(response)
        self.assertEqual(len(rows), len(self.indicator["series"]))
        for row, point in zip(rows, self.indicator["series"]):
            self.assertEqual(row["code"], self.indicator["code"])
            self.assertEqual(row["unite"], self.indicator["unite"])
            self.assertEqual(row["scenario"], point["scenario"])
            self.assertEqual(int(row["annee"]), point["annee"])
            self.assertEqual(float(row["valeur"]), point["valeur"])
            self.assertEqual(row["origine"], point["origine"])

    def test_single_indicator_export_and_scenario_filter(self):
        code = self.indicator["code"]
        response = self.client.get(f"/api/export/indicateurs/{code}.csv?scenario=tendanciel")
        self.assertEqual(response.status_code, 200)
        self.assertIn(f'{code}.csv', response.headers["Content-Disposition"])
        rows = _rows(response)
        self.assertTrue(rows)
        self.assertEqual({row["scenario"] for row in rows}, {"tendanciel"})

        self.assertEqual(self.client.get("/api/export/indicateurs/inconnu.csv").status_code, 404)
        self.assertEqual(
            self.client.get(f"/api/export/indicateurs/{code}.csv?scenario=inconnu").status_code,
            404,
        )

    def test_missing_indicator_assets_return_503(self):
        with tempfile.TemporaryDirectory() as directory:
            self.app.config["INDICATORS_DIR"] = Path(directory)
            response = self.client.get("/api/export/indicateurs.csv")
        self.assertEqual(response.status_code, 503)

    def test_geojson_export_downloads_layers_and_rejects_unknown(self):
        zones = self.client.get("/api/export/geojson/zones_population.geojson")
        self.assertEqual(zones.status_code, 200)
        self.assertIn("attachment", zones.headers["Content-Disposition"])
        self.assertEqual(json.loads(zones.get_data(as_text=True))["type"], "FeatureCollection")

        bus = self.client.get("/api/export/geojson/reseau_bus.geojson")
        self.assertEqual(bus.status_code, 200)
        self.assertGreater(len(json.loads(bus.get_data(as_text=True))["features"]), 0)

        self.assertEqual(self.client.get("/api/export/geojson/inconnue.geojson").status_code, 404)

    def test_barometre_raw_answers_are_never_exported(self):
        self.assertEqual(self.client.get("/api/export/barometre.csv").status_code, 404)
        self.assertEqual(self.client.get("/api/export/reponses.csv").status_code, 404)


if __name__ == "__main__":
    unittest.main()
