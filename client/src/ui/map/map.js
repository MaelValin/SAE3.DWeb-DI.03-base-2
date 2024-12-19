import { Candidats } from "./../../data/data-candidats.js";
import { Lycees } from "./../../data/data-lycees.js";
import { Postal } from "./../../data/data-postal.js";

import './../../../node_modules/leaflet.markercluster/dist/leaflet.markercluster.js';

let C = {};

C.init = async function(){
    V.init();
    //console.log(Candidats.getAll());
    //console.log(Lycees.getAll());
}

let V = {};

V.init = function(){
    V.renderLycees();
    V.renderPostCandidature();
    V.initSlider();
}

var map = L.map('map').setView([45.83, 1.26], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
/*
let distanceVolDoiseau = function(lat_a, lon_a, lat_b, lon_b) {
    let a = Math.PI / 180;
    let lat1 = lat_a * a;
    let lat2 = lat_b * a;
    let lon1 = lon_a * a;
    let lon2 = lon_b * a;

    let t1 = Math.sin(lat1) * Math.sin(lat2);
    let t2 = Math.cos(lat1) * Math.cos(lat2);
    let t3 = Math.cos(lon1 - lon2);
    let t4 = t2 * t3;
    let t5 = t1 + t4;
    let rad_dist = Math.atan(-t5 / Math.sqrt(-t5 * t5 + 1)) + 2 * Math.atan(1);

    return (rad_dist * 3437.74677 * 1.1508) * 1.6093470878864446;
}

let radius = 50; // Default radius in km

V.initSlider = function() {
    let sliderContainer = document.createElement('div');
    sliderContainer.id = 'sliderContainer';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.gap = '10px';

    let radiusLabel = document.createElement('label');
    radiusLabel.for = 'radiusSlider';
    radiusLabel.innerText = 'Radius: ';
    radiusLabel.style.color = 'white';
    radiusLabel.style.fontWeight = 'bold';

    let slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 2;
    slider.max = 650;
    slider.value = radius;
    slider.id = 'radiusSlider';
    slider.style.width = '80%';
    slider.oninput = function() {
        radius = parseInt(this.value);
        radiusValue.innerText = radius + ' km';
        radiusValue.style.color = 'white';
        V.renderLycees();
        V.renderPostCandidature();
    };

    let radiusValue = document.createElement('span');
    radiusValue.id = 'radiusValue';
    radiusValue.innerText = radius + ' km';
    radiusValue.style.color = 'white';
    sliderContainer.appendChild(radiusLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(radiusValue);

    let mapElement = document.getElementById('maps');
    mapElement.appendChild(sliderContainer);
}*/

let radiusCircle;

V.renderLycees = function() {
    const zoomLevel = map.getZoom();

    map.eachLayer(layer => {
        if (layer instanceof L.MarkerClusterGroup || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
if (radiusCircle) {
        map.removeLayer(radiusCircle);
    }

    radiusCircle = L.circle([45.83, 1.26], {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.1,
        radius: radius * 1000
    }).addTo(map);
    
    const markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            let candidatCount = 0;
            cluster.getAllChildMarkers().forEach(marker => {
                candidatCount += marker.options.candidatCount || 0;
            });

            return L.divIcon({
                html: `<div style="background-color: rgba(0, 123, 255, 0.9); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white;">${candidatCount}</div>`,
                className: 'marker-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });

    const getCandidatureDetails = (lycee) => {
        const candidatures = Candidats.getPremiereCandidatureAvecUAI().filter(candidat => 
            candidat.UAIEtablissementorigine === lycee.numero_uai
        );
        
        const details = {
            total: candidatures.length,
            generale: 0,
            sti2d: 0,
            autre: 0
        };

        candidatures.forEach(c => {
            if (c.diplome === 'Générale') {
                details.generale++;
            } else if (c.diplome === 'STI2D') {
                details.sti2d++;
            } else {
                details.autre++;
            }
        });

        return details;
    };

    const limogesLat = 45.83;
    const limogesLon = 1.26;

    if (zoomLevel >= 12) {
        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);

            if (distanceVolDoiseau(limogesLat, limogesLon, latitude, longitude) <= radius) {
                const details = getCandidatureDetails(lycee);

                if (details.total > 0) {
                    const marker = L.marker([latitude, longitude], { candidatCount: details.total })
                        .bindPopup(
                            `<b>${lycee.appellation_officielle}</b><br>` +
                            `Nombre de candidatures: ${details.total}<br>` +
                            `Générale: ${details.generale}<br>` +
                            `STI2D: ${details.sti2d}<br>` +
                            `Autre: ${details.autre}`
                        );
                    map.addLayer(marker);
                }
            }
        });
    } else if (zoomLevel >= 9) {
        const villes = {};

        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
            const ville = lycee.libelle_commune;

            if (distanceVolDoiseau(limogesLat, limogesLon, latitude, longitude) <= radius) {
                if (!villes[ville]) {
                    villes[ville] = { latitude, longitude, details: { total: 0, generale: 0, sti2d: 0, autre: 0 } };
                }

                const details = getCandidatureDetails(lycee);

                villes[ville].details.total += details.total;
                villes[ville].details.generale += details.generale;
                villes[ville].details.sti2d += details.sti2d;
                villes[ville].details.autre += details.autre;
            }
        });

        Object.keys(villes).forEach(ville => {
            const data = villes[ville];
            if (data.details.total > 0) {
                const marker = L.marker([data.latitude, data.longitude], { candidatCount: data.details.total })
                    .bindPopup(
                        `<b>${ville}</b><br>` +
                        `Nombre de candidatures: ${data.details.total}<br>` +
                        `Générale: ${data.details.generale}<br>` +
                        `STI2D: ${data.details.sti2d}<br>` +
                        `Autre: ${data.details.autre}`
                    );
                markerCluster.addLayer(marker);
            }
        });
    } else {
        const regions = {};

        Lycees.getAllValid().forEach(lycee => {
            const latitude = parseFloat(lycee.latitude);
            const longitude = parseFloat(lycee.longitude);
            const region = lycee.libelle_departement;

            if (distanceVolDoiseau(limogesLat, limogesLon, latitude, longitude) <= radius) {
                if (!regions[region]) {
                    regions[region] = { latitude, longitude, details: { total: 0, generale: 0, sti2d: 0, autre: 0 } };
                }

                const details = getCandidatureDetails(lycee);

                regions[region].details.total += details.total;
                regions[region].details.generale += details.generale;
                regions[region].details.sti2d += details.sti2d;
                regions[region].details.autre += details.autre;
            }
        });

        Object.keys(regions).forEach(region => {
            const data = regions[region];
            if (data.details.total > 0) {
                const marker = L.marker([data.latitude, data.longitude], { candidatCount: data.details.total })
                    .bindPopup(
                        `<b>${region}</b><br>` +
                        `Nombre de candidatures: ${data.details.total}<br>` +
                        `Générale: ${data.details.generale}<br>` +
                        `STI2D: ${data.details.sti2d}<br>` +
                        `Autre: ${data.details.autre}`
                    );
                markerCluster.addLayer(marker);
            }
        });
    }

    map.addLayer(markerCluster);

    markerCluster.on('clusterclick', function(event) {
        const cluster = event.layer;
        let totalCandidats = 0;
        cluster.getAllChildMarkers().forEach(marker => {
            totalCandidats += marker.options.candidatCount || 0;
        });

        L.popup()
            .setLatLng(cluster.getLatLng())
            .setContent(
                cluster.getAllChildMarkers().map(marker => marker.getPopup().getContent()).join('<br>')
            )
            .openOn(map);
    });
};

V.renderPostCandidature = function() {
    const markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            let candidatCount = 0;
            cluster.getAllChildMarkers().forEach(marker => {
                candidatCount += marker.options.candidatCount || 0;
            });

            return L.divIcon({
                html: `<div style="background-color: rgba(255, 0, 0, 0.9); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white;">${candidatCount}</div>`,
                className: 'marker-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });

    const limogesLat = 45.83;
    const limogesLon = 1.26;

    Candidats.getCandidatsAvecDiplomeCode1ou2().forEach(async candidat => {
        const postalCode = candidat.CodePostalCommune.substring(0, 2);
        const postalData = Postal.getByPostalCode(postalCode);

        if (postalData && postalData[0] && postalData[0]._geopoint) {
            if (typeof postalData[0]._geopoint === 'string') {
                const coords = postalData[0]._geopoint.split(',');
                const latitude = parseFloat(coords[0]);
                const longitude = parseFloat(coords[1]);

                if (!isNaN(latitude) && !isNaN(longitude)) {
                    if (distanceVolDoiseau(limogesLat, limogesLon, latitude, longitude) <= radius) {
                        const customIcon = L.divIcon({
                            html: `<div style="background-color: rgba(255, 0, 155, 0.9); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white; border:solid 2px white;">1</div>`,
                            className: 'custom-marker',
                            iconSize: L.point(30, 30)
                        });

                        const marker = L.marker([latitude, longitude], {
                            icon: customIcon,
                            candidatCount: 1
                        }).bindPopup(
                            `<b>${candidat.candidatId}</b><br>` +
                            `Sexe: ${candidat.sexe}<br>` +
                            `Année Scolaire: ${candidat.anneeScolaire}<br>` +
                            `Établissement: ${candidat.NomEtablissementOrigine}<br>` +
                            `Commune: ${candidat.CommuneEtablissementOrigine}`
                        );

                        markerCluster.addLayer(marker);
                    }
                } else {
                    console.error('Les coordonnées extraites ne sont pas valides:', coords);
                }
            } else {
                console.error('Format _geopoint invalide:', postalData[0]._geopoint);
            }
        }
    });

    map.addLayer(markerCluster);
};

map.on('zoomend', function() {
    V.renderLycees();
    V.renderPostCandidature();
});

C.init();
