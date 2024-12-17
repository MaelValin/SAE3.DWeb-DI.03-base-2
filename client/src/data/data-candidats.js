

let data = await fetch("./src/data/json/candidatures.json");
data = await data.json();

let Candidats = {}

Candidats.getAll = function(){
    return data;
}
Candidats.getPremiereCandidatureAvecUAI = function() {
    const toutesLesCandidatures = Candidats.getAll();

    // Filtrer et trouver la première scolarité avec un UAI
    const resultats = toutesLesCandidatures.map(candidat => {
        const premiereScolariteAvecUAI = candidat.Scolarite
            .filter(scolarite => scolarite.UAIEtablissementorigine && scolarite.UAIEtablissementorigine !== '')
            .reduce((premier, actuel) => {
                return (premier === null || actuel.AnneeScolaireCode < premier.AnneeScolaireCode) ? actuel : premier;
            }, null);

        if (premiereScolariteAvecUAI) {
            return {
                candidatId: candidat.DonneesCandidats.NumeroDossierCandidat,
                sexe: candidat.DonneesCandidats.Sexe,
                premiereAnneeScolaire: premiereScolariteAvecUAI.AnneeScolaireLibelle,
                UAIEtablissementorigine: premiereScolariteAvecUAI.UAIEtablissementorigine,
                NomEtablissementOrigine: premiereScolariteAvecUAI.NomEtablissementOrigine,
                CommuneEtablissementOrigine: premiereScolariteAvecUAI.CommuneEtablissementOrigineLibelle,
                CodePostalCommune: premiereScolariteAvecUAI.CommuneEtablissementOrigineCodePostal,
                diplome: candidat.Baccalaureat.SerieDiplomeCode,
            };
        }

        return null;
    }).filter(resultat => resultat !== null); // Exclure les entrées nulles

    return resultats;
};




export { Candidats };