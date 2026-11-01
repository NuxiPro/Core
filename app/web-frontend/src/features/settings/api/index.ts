// Point d'entrée unique des appels API settings — un GET global (stratégie :
// 1 requête côté serveur, découpe par tab côté front).
export { getSettings, type UserSettings } from "./settings";
