type Statut = "Inactif" | "Actif" | "Suspendu" | "En attente";
// Fonction de validation du statut
const isValidStatus = (statut: string): statut is Statut => {
  return ["Inactif", "Actif", "Suspendu", "En attente"].includes(statut);
};
export default isValidStatus;
