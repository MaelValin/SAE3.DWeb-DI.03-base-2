
import { Candidats } from "./../../data/data-candidats.js";
import { Lycees } from "./../../data/data-lycees.js";



let C = {};

C.init = async function(){
    V.init();
    console.log(Candidats.getAll());
    console.log(Lycees.getAll());
}




let V = {
    
};

V.init = function(){
    
    V.renderLycees();
}



var map = L.map('map').setView([45.83,1.26], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//methode a utiliser

/*var marker = L.marker([45.83,1.26]).addTo(map);

var circle = L.circle([45.83,1.26], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);*/


/*var polygon = L.polygon([
    [45.85,1.22],
    [45.87,1.26],
    [45.83,1.29]
]).addTo(map);*/


/*marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");*/

/*var popup = L.popup()
    .setLatLng([45.83,1.26])
    .setContent("I am a standalone popup.")
    .openOn(map);

    var popup = L.popup();*/



/*    function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);*/

//je veux afficher les lycees sur la carte
V.renderLycees = function() { 
    const zoomLevel = map.getZoom();

    // Supprimer les marqueurs existants
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (zoomLevel >= 12) {
        // Afficher les lycées
        Lycees.getAll().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);

           

            const hasCandidat = Candidats.getAll().some(candidat => 
                candidat.Scolarite.some(scolarite => 
                    scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0 && lycee.latitude !== '' && lycee.longitude !== ''
                )
            );

            if (hasCandidat) {
                const candidatCount = Candidats.getAll().filter(candidat => 
                    candidat.Scolarite.some(scolarite => 
                        scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0 && lycee.latitude !== '' && lycee.longitude !== ''
                    )
                ).length;
                L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup(
                        `<b>${lycee.appellation_officielle}</b><br>` +
                        `Nombre de candidatures: ${candidatCount}`
                    );
            }
        });
    } else if (zoomLevel >= 8) {
        const villes = {};

        // Parcours des lycées pour regrouper les données par ville
        Lycees.getAll().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
        
            const ville = lycee.libelle_commune; // Ville associée au lycée
            if (!villes[ville]) {
                villes[ville] = { latitude, longitude, count: 0 }; // Initialisation de la ville
            }
        
            // Compter les candidatures pour ce lycée
            const candidatCount = Candidats.getAll().filter(candidat => 
                candidat.Scolarite.some(scolarite => 
                    scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0&& lycee.latitude !== '' && lycee.longitude !== ''
                )
            ).length;
        
            villes[ville].count += candidatCount; // Ajouter les candidatures de ce lycée à la ville
        });
        
        // Ajouter les marqueurs pour chaque ville
        Object.keys(villes).forEach(ville => {
            const data = villes[ville];
            if (data.count > 0) { // Ne placer un marqueur que si au moins une candidature est présente
                L.marker([data.latitude, data.longitude])
                    .addTo(map)
                    .bindPopup(
                        `<b>${ville}</b><br>` +
                        `Nombre de candidatures: ${data.count}`
                    );
            }
        });
        
        
    } else {
        const departements = {};

        // Parcours des lycées pour regrouper les données par ville
        Lycees.getAll().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
        
            const departement = lycee.libelle_departement; // departement associée au lycée
            if (!departements[departement]) {
                departements[departement] = { latitude, longitude, count: 0 }; // Initialisation de la departement
            }
        
            // Compter les candidatures pour ce lycée
            const candidatCount = Candidats.getAll().filter(candidat => 
                candidat.Scolarite.some(scolarite => 
                    scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0&& lycee.latitude !== '' && lycee.longitude !== ''
                )
            ).length;
        
            departements[departement].count += candidatCount; // Ajouter les candidatures de ce lycée à la departement
        });
        
        // Ajouter les marqueurs pour chaque departement
        Object.keys(departements).forEach(departement => {
            const data = departements[departement];
            if (data.count > 0) { // Ne placer un marqueur que si au moins une candidature est présente
                L.marker([data.latitude, data.longitude])
                    .addTo(map)
                    .bindPopup(
                        `<b>${departement}</b><br>` +
                        `Nombre de candidatures: ${data.count}`
                    );
            }
        });
    }
};

// Réaction au changement de zoom
map.on('zoomend', V.renderLycees);






C.init();