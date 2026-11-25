"""Point d'entrée P1 pour préparer les indicateurs.

Ce socle M0 ne transforme pas les sources métier. L'implémentation P1 doit
charger les CSV locaux sous data/raw sans les copier ni les committer.
"""

import argparse


def main() -> int:
    parser = argparse.ArgumentParser(description="Préparer les fichiers indicateurs P1")
    parser.add_argument("--source", default="data/raw/donnees_longues.csv")
    parser.add_argument("--output", default="data/indicateurs")
    args = parser.parse_args()
    parser.exit(
        2,
        "M1/P1 requis: aucun traitement métier n'est livré à M0 "
        f"(source={args.source}, sortie={args.output}).\n",
    )


if __name__ == "__main__":
    raise SystemExit(main())