function createMap(){
    var map = L.map('map').setView([39.3210,-111.0937],6);

    //add OSm base tilelayer
    L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=ba21c9a366fa43c7b8f5af4065ed9c9f', {
        attribution: 'Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};
function getData(map){
    //load the data
    $.ajax("data/map.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "red",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add to map
            L.geoJson(response,{
                pointToLayer: function(feature, latlng){
                    return L.circleMarker(latlng,geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};
$(document).ready(createMap);