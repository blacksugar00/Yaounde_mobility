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

    def test_p1_geojson_accepts_and_preserves_optional_zone_ids(self):
        del self.app.config["ZONES_FILE"]
        del self.app.config["ZONE_FEATURE_COUNT"]

        response = self.client.get("/api/zones?annee=2018")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(len(payload["features"]), 105)
        self.assertEqual(
            set(payload["features"][0]["properties"]),
            {"id_zone", "nom", "pop_2018", "pop_2025", "pop_2035"},
        )

    def test_missing_indicator_asset_returns_service_unavailable(self):
        with tempfile.TemporaryDirectory() as directory:
            self.app.config["INDICATORS_DIR"] = Path(directory)
            response = self.client.get("/api/indicateurs")

        self.assertEqual(response.status_code, 503)
        self.assertIn("erreur", response.get_json())

    def test_react_build_serves_root_and_client_routes(self):
        with tempfile.TemporaryDirectory() as directory:
            build_dir = Path(directory)
            (build_dir / "index.html").write_text(
                "<main>Observatoire</main>", encoding="utf-8"
            )
            (build_dir / "assets").mkdir()
            (build_dir / "assets" / "app.js").write_text(
                "console.log('app');", encoding="utf-8"
            )
            self.app.config["REACT_BUILD_DIR"] = build_dir

            root = self.client.get("/")
            client_route = self.client.get("/carte")
            asset = self.client.get("/assets/app.js")

        self.assertEqual(root.status_code, 200)
        self.assertIn("Observatoire", root.get_data(as_text=True))
        self.assertEqual(client_route.status_code, 200)
        self.assertIn("Observatoire", client_route.get_data(as_text=True))
        self.assertEqual(asset.status_code, 200)
        self.assertEqual(asset.get_data(as_text=True), "console.log('app');")
        root.close()
        client_route.close()
        asset.close()

    def test_unknown_api_route_remains_a_json_404(self):
        response = self.client.get("/api/route-inconnue")

        self.assertEqual(response.status_code, 404)
        self.assertIn("erreur", response.get_json())
        self.assertNotIn("<html", response.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
