import json
import tempfile
import unittest
from pathlib import Path

from api.app import create_app


FIXTURES = Path(__file__).parent / "fixtures"


class DataApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(
            TESTING=True,
            INDICATORS_DIR=FIXTURES / "indicators",
            ZONES_FILE=FIXTURES / "geojson" / "zones_population.geojson",
            ZONE_FEATURE_COUNT=1,
        )
        self.client = self.app.test_client()

    def test_indicator_catalog_detail_and_scenario_filter(self):
        catalog = self.client.get("/api/indicateurs")
        self.assertEqual(catalog.status_code, 200)
        self.assertEqual(
            catalog.get_json(),
            [
                {
                    "code": "mock_population",
                    "libelle": "Indicateur fictif de test",
                    "unite": "personnes",
                }
            ],
        )

        detail = self.client.get(
            "/api/indicateurs/mock_population?scenario=tendanciel"
        )
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(
            [point["annee"] for point in detail.get_json()["series"]],
            [2025],
        )
        self.assertEqual(
            self.client.get("/api/indicateurs/inconnu").status_code,
            404,
        )
        self.assertEqual(
            self.client.get(
                "/api/indicateurs/mock_population?scenario=inconnu"
            ).status_code,
            404,
        )

    def test_zones_returns_geojson_and_rejects_invalid_year(self):
        response = self.client.get("/api/zones?annee=2018")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["type"], "FeatureCollection")
        self.assertEqual(len(payload["features"]), 1)
        self.assertEqual(
            set(payload["features"][0]["properties"]),
            {"nom", "pop_2018", "pop_2025", "pop_2035"},
        )
        self.assertEqual(self.client.get("/api/zones?annee=2020").status_code, 400)

    def test_zones_rejects_coordinates_outside_geographic_ranges(self):
        fixture_path = FIXTURES / "geojson" / "zones_population.geojson"
        geojson = json.loads(fixture_path.read_text(encoding="utf-8"))
        geojson["features"][0]["geometry"]["coordinates"][0][1] = [300, 3.8]

        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "zones.geojson"
            path.write_text(json.dumps(geojson), encoding="utf-8")
            self.app.config["ZONES_FILE"] = path
            response = self.client.get("/api/zones")

        self.assertEqual(response.status_code, 503)

    def test_missing_indicator_asset_returns_service_unavailable(self):
        with tempfile.TemporaryDirectory() as directory:
            self.app.config["INDICATORS_DIR"] = Path(directory)
            response = self.client.get("/api/indicateurs")

        self.assertEqual(response.status_code, 503)
        self.assertIn("erreur", response.get_json())

    def test_p1_assets_remain_required_outside_test_fixtures(self):
        del self.app.config["INDICATORS_DIR"]
        del self.app.config["ZONES_FILE"]
        del self.app.config["ZONE_FEATURE_COUNT"]

        self.assertEqual(self.client.get("/api/indicateurs").status_code, 503)
        self.assertEqual(self.client.get("/api/zones").status_code, 503)


if __name__ == "__main__":
    unittest.main()
