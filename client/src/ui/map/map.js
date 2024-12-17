
import { Candidats } from "./../../data/data-candidats.js";
import { Lycees } from "./../../data/data-lycees.js";

import'leaflet.markercluster';

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
        if (layer instanceof L.MarkerClusterGroup || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            const candidatCount = cluster.getAllChildMarkers().reduce((total, marker) => {
                return total + (marker.options.candidatCount || 0);
            }, 0);

            return L.divIcon({
                html: `<div style="background-color: rgba(0, 123, 255, 0.9); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white;">${candidatCount}</div>`,
                className: 'marker-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });

    if (zoomLevel >= 12) {
        // Marqueurs individuels par lycée
        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);

            const candidatCount = Candidats.getPremiereCandidatureAvecUAI().filter(candidat => 
                candidat.UAIEtablissementorigine === lycee.numero_uai
            ).length;

            if (candidatCount > 0) {
                const marker = L.marker([latitude, longitude], { candidatCount })
                    .bindPopup(
                        `<b>${lycee.appellation_officielle}</b><br>` +
                        `Nombre de candidatures: ${candidatCount}`
                    );
                map.addLayer(marker);
            }
        });
    } else if (zoomLevel >= 9) {
        const villes = {};

        // Regrouper les données par ville
        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
            const ville = lycee.libelle_commune;

            if (!villes[ville]) {
                villes[ville] = { latitude, longitude, count: 0 };
            }

            const candidatCount = Candidats.getPremiereCandidatureAvecUAI().filter(candidat => 
                candidat.UAIEtablissementorigine === lycee.numero_uai
            ).length;

            villes[ville].count += candidatCount;
        });

        // Ajouter les clusters par ville
        Object.keys(villes).forEach(ville => {
            const data = villes[ville];
            if (data.count > 0) {
                const marker = L.marker([data.latitude, data.longitude], { candidatCount: data.count })
                    .bindPopup(
                        `<b>${ville}</b><br>` +
                        `Nombre de candidatures: ${data.count}`
                    );
                markerCluster.addLayer(marker);
            }
        });
    } else {
        const regions = {};

        // Regrouper les données par région
        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
            const region = lycee.libelle_departement;

            if (!regions[region]) {
                regions[region] = { latitude, longitude, count: 0 };
            }

            const candidatCount = Candidats.getPremiereCandidatureAvecUAI().filter(candidat => 
                candidat.UAIEtablissementorigine === lycee.numero_uai
            ).length;

            regions[region].count += candidatCount;
        });

        // Ajouter les clusters par région
        Object.keys(regions).forEach(region => {
            const data = regions[region];
            if (data.count > 0) {
                const marker = L.marker([data.latitude, data.longitude], { candidatCount: data.count })
                    .bindPopup(
                        `<b>${region}</b><br>` +
                        `Nombre de candidatures: ${data.count}`
                    );
                markerCluster.addLayer(marker);
            }
        });
    }

    // Ajouter les clusters à la carte
    map.addLayer(markerCluster);

    // Gérer les clics sur les clusters pour afficher un popup
    markerCluster.on('clusterclick', function(event) {
        const cluster = event.layer;
        const totalCandidats = cluster.getAllChildMarkers().reduce((total, marker) => {
            return total + (marker.options.candidatCount || 0);
        }, 0);

        L.popup()
            .setLatLng(cluster.getLatLng())
            .setContent(
                cluster.getAllChildMarkers().map(marker => marker.getPopup().getContent()).join('<br>')
            )
            .openOn(map);
    });
};



// Réaction au changement de zoom
map.on('zoomend', V.renderLycees);







C.init();