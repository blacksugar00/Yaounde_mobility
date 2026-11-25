import pandas as pd
import json
import os

# --- CONFIGURATION ---
# On récupère le dossier où se trouve CE script
DOSSIER_ACTUEL = os.path.dirname(os.path.abspath(__file__))

# Les fichiers sont dans le même dossier que le script
FICHIER_EXCEL = os.path.join(DOSSIER_ACTUEL, "donnees_mobilite_yaounde_propres.xlsx")
FICHIER_JSON = os.path.join(DOSSIER_ACTUEL, "parts_modales.json")

def extraire_parts_modales():
    print(f"Recherche du fichier à cet emplacement : {FICHIER_EXCEL}")
    
    if not os.path.exists(FICHIER_EXCEL):
        print("❌ ERREUR : Le fichier Excel est introuvable.")
        print("Vérifie que le nom du fichier est exactement 'donnees_mobilite_yaounde_propres.xlsx'")
        return

    print("Lecture du fichier Excel...")
    # On lit uniquement l'onglet 'donnees_longues'
    df = pd.read_excel(FICHIER_EXCEL, sheet_name="donnees_longues")
    
    # 1. Filtrer uniquement les parts modales
    df_pm = df[df["code_indicateur"].str.startswith("part_modale__", na=False)].copy()
    
    # 2. S'assurer que l'année est un entier
    df_pm["annee"] = df_pm["annee"].astype(int)
    
    liste_indicateurs = []
    
    # 3. Grouper par indicateur (code_indicateur)
    for code, group in df_pm.groupby("code_indicateur"):
        premiere_ligne = group.iloc[0]
        
        indicateur_obj = {
            "code": code,
            "libelle": premiere_ligne["indicateur"],
            "unite": premiere_ligne["unite"],
            "source": "donnees_mobilite_yaounde_propres.xlsx",
            "series": []
        }
        
        # 4. Construire le tableau des séries
        for _, row in group.iterrows():
            serie = {
                "scenario": row["scenario"],
                "annee": int(row["annee"]),
                "valeur": float(row["valeur"]),
                "origine": row["origine"]
            }
            indicateur_obj["series"].append(serie)
            
        # Trier les séries par année puis par scénario
        indicateur_obj["series"].sort(key=lambda x: (x["annee"], x["scenario"]))
        
        liste_indicateurs.append(indicateur_obj)

    # 5. Écrire le fichier JSON
    with open(FICHIER_JSON, "w", encoding="utf-8") as f:
        json.dump(liste_indicateurs, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Succès ! {len(liste_indicateurs)} indicateurs exportés vers :")
    print(f"   {FICHIER_JSON}")

if __name__ == "__main__":
    extraire_parts_modales()