import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { Barre } from "./ui/graphic/barre.js";

let C = {};

C.init = async function () {
  V.init();
};

let V = {
  header: document.querySelector("#header"),
  barre: document.querySelector("#barre"),
};

V.init = function () {
  V.renderHeader();
  V.renderBarre();
};

V.renderHeader = function () {
  V.header.innerHTML = HeaderView.render();
};

V.renderBarre = async function () {
  Barre.init();

  // Récupération des candidats ayant un TypeDiplomeCode de 1 ou 2
  let postbacCandidat = Candidats.getCandidatsAvecDiplomeCode1ou2();
  let candidatBac = Candidats.getPremiereCandidatureAvecUAI();

  // Chargement des données des lycées pour obtenir les noms des départements
  let lycees = await Lycees.getAll();
  let departementsMap = {};

  // Construire une correspondance "Code département" -> "Nom du département"
  lycees.forEach((lycee) => {
    let codeDepartement = lycee.code_departement;
    if (codeDepartement.length === 3 && codeDepartement.startsWith("9")) {
      return; // Ignorer les codes de département à trois caractères commençant par 9
    }
    codeDepartement = codeDepartement.padStart(2, "0").substring(1, 3); // Normaliser sur 2 caractères

    departementsMap[codeDepartement] = lycee.libelle_departement;
  });

  // Trier les départements par code
  let sortedDepartement = Object.keys(departementsMap).sort((a, b) =>
    a.localeCompare(b)
  );

  // Afficher les départements triés
  let sortedDepartements = sortedDepartement.map((codeDepartement) => {
    return `${departementsMap[codeDepartement]} (${codeDepartement})`;
  });

  //datadepartement

  // Calculer le nombre de candidats par département
  let candidatsParDepartement = {};
  postbacCandidat.forEach((candidat) => {
    let codePostal = candidat.CodePostalCommune;
    if (codePostal && codePostal.length >= 2) {
      let codeDepartement = codePostal.substring(0, 2); // Les deux premiers chiffres du code postal

      if (!candidatsParDepartement[codeDepartement]) {
        candidatsParDepartement[codeDepartement] = 0;
      }

      candidatsParDepartement[codeDepartement]++;
    }
  });

  // Trier les départements par code
  let sortedCandidatsParDepartement = Object.keys(departementsMap).sort(
    (a, b) => a.localeCompare(b)
  );

  // Affichage du résultat : Nom du département et nombre de candidats
  sortedCandidatsParDepartement.forEach((codeDepartement) => {
    let nombreCandidats = candidatsParDepartement[codeDepartement] || 0;
    let nomDepartement =
      departementsMap[codeDepartement] || `Inconnu (${codeDepartement})`;
    return nombreCandidats, nomDepartement;
  });

  // Affichage du résultat : Nom du département et nombre de candidats
  let candidatsCounts = sortedCandidatsParDepartement.map((codeDepartement) => {
    let nombreCandidats = candidatsParDepartement[codeDepartement] || 0;
    let nomDepartement =
      departementsMap[codeDepartement] || `Inconnu (${codeDepartement})`;

    return nombreCandidats;
  });

  // Calculer le nombre de candidats par département pour chaque type de diplôme
  let candidatsGeneraleParDepartement = {};
  let candidatsSTI2DParDepartement = {};
  let candidatsAutreParDepartement = {};

  candidatBac.forEach((candidat) => {
    let codePostal = candidat.CodePostalCommune;
    if (codePostal && codePostal.length >= 2) {
      let codeDepartement = codePostal.substring(0, 2); // Les deux premiers chiffres du code postal

      if (!candidatsGeneraleParDepartement[codeDepartement]) {
        candidatsGeneraleParDepartement[codeDepartement] = 0;
      }
      if (!candidatsSTI2DParDepartement[codeDepartement]) {
        candidatsSTI2DParDepartement[codeDepartement] = 0;
      }
      if (!candidatsAutreParDepartement[codeDepartement]) {
        candidatsAutreParDepartement[codeDepartement] = 0;
      }

      if (candidat.diplome === "Générale") {
        candidatsGeneraleParDepartement[codeDepartement]++;
      } else if (candidat.diplome === "STI2D") {
        candidatsSTI2DParDepartement[codeDepartement]++;
      } else {
        candidatsAutreParDepartement[codeDepartement]++;
      }
    }
  });

  // Affichage du résultat : Nom du département et nombre de candidats par type de diplôme
  sortedCandidatsParDepartement.forEach((codeDepartement) => {
    let nombreCandidatsGenerale =
      candidatsGeneraleParDepartement[codeDepartement] || 0;
    let nombreCandidatsSTI2D =
      candidatsSTI2DParDepartement[codeDepartement] || 0;
    let nombreCandidatsAutre =
      candidatsAutreParDepartement[codeDepartement] || 0;
    let nomDepartement =
      departementsMap[codeDepartement] || `Inconnu (${codeDepartement})`;
    return (
      nombreCandidatsGenerale,
      nombreCandidatsSTI2D,
      nombreCandidatsAutre,
      nomDepartement
    );
  });

  // Préparer les données pour la mise à jour de la barre
  let candidatsGeneraleCounts = sortedCandidatsParDepartement.map(
    (codeDepartement) => candidatsGeneraleParDepartement[codeDepartement] || 0
  );
  let candidatsSTI2DCounts = sortedCandidatsParDepartement.map(
    (codeDepartement) => candidatsSTI2DParDepartement[codeDepartement] || 0
  );
  let candidatsAutreCounts = sortedCandidatsParDepartement.map(
    (codeDepartement) => candidatsAutreParDepartement[codeDepartement] || 0
  );

  // Ajouter un slider pour définir le seuil de candidatures
  let seuilSlider = document.createElement("input");
  seuilSlider.type = "range";
  seuilSlider.min = 0;
  seuilSlider.max = Math.max(...candidatsCounts);
  seuilSlider.value = 3; // Valeur a modifier pour le seuil initial
  seuilSlider.style.width = "100%";
  V.barre.appendChild(seuilSlider);

  seuilSlider.addEventListener("input", () => {
    let seuil = parseInt(seuilSlider.value);
    let autresDepartementsCount = 0;
    let autresGeneraleCount = 0;
    let autresSTI2DCount = 0;
    let autresAutreCount = 0;

    let filteredDepartements = sortedCandidatsParDepartement.filter(
      (codeDepartement) => {
        let count = candidatsParDepartement[codeDepartement] || 0;
        if (count <= seuil) {
          autresDepartementsCount += count;
          autresGeneraleCount +=
            candidatsGeneraleParDepartement[codeDepartement] || 0;
          autresSTI2DCount +=
            candidatsSTI2DParDepartement[codeDepartement] || 0;
          autresAutreCount +=
            candidatsAutreParDepartement[codeDepartement] || 0;
          return false;
        }
        return true;
      }
    );

    let filteredDepartementsNames = filteredDepartements.map(
      (codeDepartement) => departementsMap[codeDepartement]
    );

    let filteredCandidatsCounts = filteredDepartements.map(
      (codeDepartement) => candidatsParDepartement[codeDepartement] || 0
    );

    let filteredGeneraleCounts = filteredDepartements.map(
      (codeDepartement) => candidatsGeneraleParDepartement[codeDepartement] || 0
    );

    let filteredSTI2DCounts = filteredDepartements.map(
      (codeDepartement) => candidatsSTI2DParDepartement[codeDepartement] || 0
    );

    let filteredAutreCounts = filteredDepartements.map(
      (codeDepartement) => candidatsAutreParDepartement[codeDepartement] || 0
    );

    // Ajouter les "Autres départements" aux données filtrées
    filteredDepartementsNames.push("Autres départements");
    filteredCandidatsCounts.push(autresDepartementsCount);
    filteredGeneraleCounts.push(autresGeneraleCount);
    filteredSTI2DCounts.push(autresSTI2DCount);
    filteredAutreCounts.push(autresAutreCount);

    Barre.updateData(
      filteredDepartementsNames,
      filteredCandidatsCounts,
      filteredGeneraleCounts,
      filteredSTI2DCounts,
      filteredAutreCounts
    );
  });

  // Initialiser la barre avec le seuil par défaut
  seuilSlider.dispatchEvent(new Event("input"));
};

C.init();
