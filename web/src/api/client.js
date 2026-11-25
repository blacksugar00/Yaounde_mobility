import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

async function request(promise) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.erreur
      ?? error?.message
      ?? "Erreur API inconnue";
    throw new Error(message);
  }
}

export const getIndicateurs = () => request(api.get("/indicateurs"));

export const getIndicateur = (code, scenario) =>
  request(api.get(`/indicateurs/${encodeURIComponent(code)}`, {
    params: scenario ? { scenario } : {},
  }));

export const getZones = (annee) =>
  request(api.get("/zones", { params: { annee } }));

export const getResultats = () =>
  request(api.get("/barometre/resultats"));

export const getQuestions = () =>
  request(api.get("/barometre/questions"));

export const postBarometre = (reponse) =>
  request(api.post("/barometre", reponse));
