import os
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/raw/Noms_zones.shp"
CSV = ROOT / "data/raw/donnees_longues.csv"
OUTPUT = ROOT / "data/geojson/zones_population.geojson"
# Champ verifie sur Noms_zones.dbf : NOM_ZONE (unique, 105 valeurs).
ZONE_NAME_FIELD = os.environ.get("ZONE_NAME_FIELD", "NOM_ZONE")
POP_FIELDS = ["pop_2018", "pop_2025", "pop_2035"]
POP_CODE = "1.1__population_urbaine_de_l_aire_metropolitaine"
MAX_GAP = 0.005  # ecart tolere entre somme des zones et CSV (0,5 %)

zones = gpd.read_file(SOURCE)
print("CRS:", zones.crs)
print("Colonnes:", list(zones.columns))
print("Nombre de zones:", len(zones))
if zones.crs is None:
    raise ValueError("CRS absent: le fichier .prj est requis.")
required = {ZONE_NAME_FIELD, "ID_ZONE", *POP_FIELDS}
missing = required - set(zones.columns)
if missing:
    raise ValueError(f"Champs manquants: {sorted(missing)}")
if len(zones) != 105:
    raise ValueError(f"105 zones attendues; {len(zones)} trouvees.")

output = zones[["ID_ZONE", ZONE_NAME_FIELD, *POP_FIELDS, "geometry"]].rename(
    columns={"ID_ZONE": "id_zone", ZONE_NAME_FIELD: "nom"}
)
output["id_zone"] = output["id_zone"].astype(int)

# Dans le .dbf, les accents de 10 noms sont deja perdus a la source
# (caractere de remplacement U+FFFD). Les 10 cas sont des "e accent aigu"
# (entree, complement, Yaounde) : on les restaure, en bloquant tout autre cas.
# Sans fichier .cpg, GDAL lit ces octets en latin-1 : meme caractere perdu,
# affiche "\u00ef\u00bf\u00bd". On le ramene au meme marqueur.
output["nom"] = (
    output["nom"].astype(str).str.strip()
    .str.replace("\u00ef\u00bf\u00bd", "\ufffd", regex=False)
)
for bad in output.loc[output["nom"].str.contains("\ufffd"), "nom"]:
    for i, ch in enumerate(bad):
        if ch == "\ufffd" and bad[max(i - 1, 0):i + 2] not in {
            "r\ufffde", "l\ufffdm", "d\ufffd ",
        }:
            raise ValueError(f"Caractere corrompu inattendu dans: {bad!r}")
output["nom"] = output["nom"].str.replace("\ufffd", "\u00e9", regex=False)
if output["nom"].duplicated().any() or (output["nom"] == "").any():
    raise ValueError("Noms de zones vides ou dupliques.")

for field in POP_FIELDS:
    numeric = pd.to_numeric(output[field], errors="coerce")
    if numeric.isna().any():
        raise ValueError(f"Valeurs vides ou non numeriques dans {field}.")
    if (numeric < 0).any():
        raise ValueError(f"Valeurs negatives dans {field}.")
    output[field] = numeric.round().astype(int)

# Controle de coherence avec le CSV (population de l'aire metropolitaine).
ref = pd.read_csv(CSV, encoding="utf-8-sig")
ref = ref[(ref["code_indicateur"] == POP_CODE)
          & (ref["scenario"] == "tendanciel")]
for field in POP_FIELDS:
    year = int(field.split("_")[1])
    csv_value = float(ref.loc[ref["annee"] == year, "valeur"].iloc[0])
    total = float(output[field].sum())
    gap = abs(total - csv_value) / csv_value
    print(f"{field}: zones={total:,.0f} csv={csv_value:,.0f} ecart={gap:.3%}")
    if gap > MAX_GAP:
        raise ValueError(f"{field}: somme des zones differente du CSV.")

# Pas de simplification : le fichier fait deja moins de 100 Ko, et simplifier
# chaque polygone separement cree des chevauchements entre zones voisines.
output.geometry = output.geometry.force_2d()
if output.geometry.is_empty.any() or (~output.geometry.is_valid).any():
    raise ValueError("Geometries vides ou invalides.")
output = output.to_crs("EPSG:4326")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
output.to_file(OUTPUT, driver="GeoJSON", COORDINATE_PRECISION=5)
print(f"{OUTPUT.relative_to(ROOT)}: {len(output)} zones, "
      f"{OUTPUT.stat().st_size / 1024:.0f} Ko")