import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";


let C = {};

C.init = async function(){
    V.init();
    console.log(Candidats.getAll());
    console.log(Lycees.getAll());
}




let V = {
    header: document.querySelector("#header")
};

V.init = function(){
    V.renderHeader();
    V.renderLycees();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();
}



var map = L.map('map').setView([45.83,1.26], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//methode a utiliser

var marker = L.marker([45.83,1.26]).addTo(map);

var circle = L.circle([45.83,1.26], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);


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
    var markers = L.markerClusterGroup();

    Lycees.getAll().forEach(lycee => {
        // Vérifie si un candidat est lié à ce lycée pour l'année scolaire 0
        const hasCandidat = Candidats.getAll().some(candidat => 
            candidat.Scolarite.some(scolarite => 
                scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0
            )
        );

        if (hasCandidat) {
            // Ajoute un marqueur sur la carte pour ce lycée ainsi que le nombre de candidatures de se lycée
            const candidatCount = Candidats.getAll().filter(candidat => 
                candidat.Scolarite.some(scolarite => 
                    scolarite.UAIEtablissementorigine === lycee.numero_uai && scolarite.AnneeScolaireCode === 0
                )
            ).length;

            var marker = L.marker([parseFloat(lycee.latitude), parseFloat(lycee.longitude)])
                .bindPopup(`${lycee.appellation_officielle}<br>Nombre de candidatures: ${candidatCount}`);
            
            markers.addLayer(marker);
        }
    });

    map.addLayer(markers);
};




C.init();