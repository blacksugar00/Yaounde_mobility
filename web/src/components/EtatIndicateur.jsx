// Affiche l'état d'un chargement (chargement / erreur avec "Réessayer" / non disponible), sinon le graphique.
export default function EtatIndicateur({ etat, titre, children }) {
  const boite = { minHeight: "10rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "0.75rem", color: "#4b5563" };

  if (etat.statut === "chargement") {
    return <div style={boite} role="status">Chargement de « {titre} »…</div>;
  }
  if (etat.statut === "erreur") {
    return (
      <div style={boite} role="alert">
        <span>Impossible de charger « {titre} » : {etat.erreur}</span>
        <button type="button" onClick={etat.reessayer}
          style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}>
          Réessayer
        </button>
      </div>
    );
  }
  if (etat.statut === "vide") {
    return <div style={boite}>Donnée non disponible pour « {titre} ».</div>;
  }
  return children(etat.data);
}
