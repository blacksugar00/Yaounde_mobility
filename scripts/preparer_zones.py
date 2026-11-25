"""Point d'entrée P1 pour préparer le GeoJSON des zones.

À M0, aucune donnée cartographique n'est créée ou inventée.
"""

import argparse


def main() -> int:
    parser = argparse.ArgumentParser(description="Préparer le GeoJSON des zones P1")
    parser.add_argument("--source", required=False)
    parser.add_argument("--output", default="data/geojson/zones_population.geojson")
    args = parser.parse_args()
    parser.exit(
        2,
        "M1/P1 requis: aucune source cartographique n'est livrée à M0 "
        f"(sortie={args.output}).\n",
    )


if __name__ == "__main__":
    raise SystemExit(main())