from pathlib import Path
import json

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/donnees_longues.csv"
DICTIONARY = ROOT / "data/raw/dictionnaire_indicateurs.csv"
OUTPUT = ROOT / "data/indicateurs"
SOURCE_LABEL = "donnees_longues.csv"  # a aligner avec le contrat A

REQUIRED_DATA = {
    "code_indicateur", "indicateur", "unite", "annee",
    "scenario", "valeur", "statut", "origine",
}
REQUIRED_DICTIONARY = {"code_indicateur", "indicateur", "unite"}

# Totaux GES du classeur d'origine : doubles comptes, remplaces par
# ges_total_recalcule et ges_par_habitant_recalcule.
EXCLUDED = {
    "4.2__total_ges_en_kg_an",
    "4.2__total_ges_par_an_et_par_habitant_en_kg",
}
# Les deux seuls indicateurs de la section 4.2 qui ne sont pas des GES.
TEMPS_CODES = {
    "4.2__duree_moyenne_dun_deplacement_en_mode_motorise_min",
    "4.2__temps_passe_dans_les_transports_motorises_hab_jour_min",
}

THEMES = {
    "population": lambda c: c.startswith("1.1__"),
    "deplacements": lambda c: c.startswith("1.2__"),
    "parts_modales": lambda c: c.startswith("part_modale__"),
    "parc": lambda c: c.startswith("1.7__"),
    "ges": lambda c: c.startswith("ges_") or (
        c.startswith("4.2__") and c not in TEMPS_CODES
    ),
    "temps": lambda c: c in TEMPS_CODES,
    "corridors": lambda c: c.startswith("corridors__"),
}


def main():
    if not SOURCE.is_file() or not DICTIONARY.is_file():
        raise FileNotFoundError(
            "Sources manquantes: placer les deux CSV dans data/raw/."
        )

    data = pd.read_csv(SOURCE, encoding="utf-8-sig")
    dictionary = pd.read_csv(DICTIONARY, encoding="utf-8-sig")

    missing_data = REQUIRED_DATA - set(data.columns)
    missing_dictionary = REQUIRED_DICTIONARY - set(dictionary.columns)
    if missing_data or missing_dictionary:
        raise ValueError(
            f"Schema inattendu: CSV={sorted(missing_data)}, "
            f"dictionnaire={sorted(missing_dictionary)}"
        )

    if len(data) != 16328 or data["code_indicateur"].nunique() != 311:
        raise ValueError(
            "Jeu inattendu: le plan attend 16 328 lignes et 311 codes; "
            f"trouve {len(data)} lignes et "
            f"{data['code_indicateur'].nunique()} codes."
        )
    if data["code_indicateur"].isna().any():
        raise ValueError("Le CSV contient un code d'indicateur vide.")
    if dictionary["code_indicateur"].duplicated().any():
        raise ValueError("Le dictionnaire contient des codes dupliques.")

    numeric = pd.to_numeric(data["valeur"], errors="coerce")
    if numeric.isna().any():
        raise ValueError("Valeurs vides ou non numeriques dans le CSV.")
    data["valeur"] = numeric
    data["annee"] = pd.to_numeric(data["annee"], errors="raise").astype(int)

    key = ["code_indicateur", "annee", "scenario"]
    if data.duplicated(key, keep=False).any():
        raise ValueError("Doublons sur code/annee/scenario.")

    metadata = dictionary[["code_indicateur", "indicateur", "unite"]].rename(
        columns={"indicateur": "libelle_dictionnaire",
                 "unite": "unite_dictionnaire"})
    data = data.merge(metadata, on="code_indicateur", how="left",
                      validate="many_to_one")
    conflict = (
        data["unite_dictionnaire"].notna() & data["unite"].notna()
        & data["unite_dictionnaire"].astype(str).str.strip().ne(
            data["unite"].astype(str).str.strip())
    )
    if conflict.any():
        raise ValueError("Unites CSV/dictionnaire divergentes.")
    data["libelle"] = data["libelle_dictionnaire"].fillna(data["indicateur"])
    data["unite_finale"] = data["unite_dictionnaire"].fillna(data["unite"])

    # Chaque code doit appartenir a un seul theme.
    owners = {}
    for code in data["code_indicateur"].unique():
        if code in EXCLUDED:
            continue
        hits = [t for t, f in THEMES.items() if f(code)]
        if len(hits) > 1:
            raise ValueError(f"{code} appartient a plusieurs themes: {hits}")
        if hits:
            owners[code] = hits[0]

    OUTPUT.mkdir(parents=True, exist_ok=True)
    written = 0
    for theme in THEMES:
        codes = {c for c, t in owners.items() if t == theme}
        selected = data[data["code_indicateur"].isin(codes)]
        indicators = []
        for code, rows in selected.groupby("code_indicateur", sort=True):
            first = rows.iloc[0]
            indicators.append({
                "code": code,
                "libelle": first["libelle"],
                "unite": first["unite_finale"],
                "source": SOURCE_LABEL,
                "series": [
                    {
                        "scenario": r.scenario,
                        "annee": int(r.annee),
                        "valeur": float(r.valeur),
                        "statut": r.statut,
                        "origine": r.origine,
                    }
                    for r in rows.sort_values(["scenario", "annee"]).itertuples()
                ],
            })
        if not indicators:
            raise ValueError(f"Theme vide: {theme}")
        target = OUTPUT / f"{theme}.json"
        target.write_text(
            json.dumps(indicators, ensure_ascii=False, indent=2,
                       allow_nan=False),
            encoding="utf-8",
        )
        written += 1
        print(f"{target.relative_to(ROOT)}: {len(indicators)} indicateurs")

    unused = sorted(set(data["code_indicateur"]) - set(owners))
    print(f"{written} fichiers; {len(owners)} indicateurs exportes; "
          f"{len(unused)} non exportes (hors des 7 themes ou exclus).")


if __name__ == "__main__":
    main()