(function(){
    
    function createMap(){
        var map = L.map('map').setView([39.3210,-111.0937],6);

        //add OSm base tilelayer
        L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=ba21c9a366fa43c7b8f5af4065ed9c9f', {
            attribution: 'Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //call getData function
        getData(map);
        //addFilters();
        
    };
    function shopPopup(feature,layer){
        var popupContent = "<h3><b>" + feature.properties["Company"] + "</b></h3><p>" +feature.properties["given_address"] + "</p>";
        layer.bindPopup(popupContent);
    };
    function colorShops(feature,latlng){
        var shop = feature.properties["Company"]
        if (shop === "Swig"){
            return "#e41a1c"
        } else if (shop === "Fiiz Drinks"){
            return "#377eb8"
        } else if (shop === "Sodalicious"){
            return "#984ea3"
        } else if (shop === "Twisted Sugar"){
            return "#4daf4a"
        } else if (shop === "Quench It!"){
            return "#ff7f00"
        } else {
            return "black"
        }
    };
    function createShopSymbols(data,map){
        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        L.geoJson(data, {
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        }).addTo(map);
    }
    function hotDrinkFilter(data,map){
        map.eachLayer(function(layer){
            if (layer.feature){map.removeLayer(layer)}
        })

        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        L.geoJson(data, {
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup,
            filter: function(feature){if (feature.properties['Hot_Chocolate'] == 'Y'){return true}}
        }).addTo(map);
    };
    //used cmrRose response from https://gis.stackexchange.com/questions/283070/filter-geojson-by-attribute-in-leaflet-using-a-button for help with filtering
    function addFilters(data,map){
        $('#panel').append('<p>Sells</p>')
        $('#panel').append('<p><input type="checkbox" id="hot_drinks">Hot Drinks</input></p>')
        $('#panel').append('<p><input type="checkbox" id="frozen_drinks">Frozen Drinks</input></p>');
        $('#panel').append('<p><input type="checkbox" id="cookies">Cookies</input></p>');
        $('#panel').append('<p><input type="checkbox" id="italian_soda">Italian Soda</input></p>');
        $('#panel').append('<p><input type="checkbox" id="kids_drinks">Fun Kids Drinks</input></p>');
        $('#panel').append('<p><input type="checkbox" id="tea">Iced Tea</input></p>');
        $('#panel').append('<p><input type="checkbox" id="popcorn">Popcorn</input></p>');
        $('#panel').append('<p><input type="checkbox" id="12oz">12 oz. Option</input></p>');
        $('#panel').append('<p><input type="range" min="$1.50" max ="$2.50" id="price">Base Price</input>');  

        $('#hot_drinks').on("input",hotDrinkFilter(data,map));
    };

    function addCounty(data,map){
        $('#panel').append('<label class="switch"><input type="checkbox"><span class="slider">Counties</span></label>')
    }
    
    function getData(map){
        //load the data
        $.ajax("data/map.geojson", {
            dataType: "json",
            success: function(response){
                createShopSymbols(response,map);
                addFilters(response,map);
                addCounty(response,map);
                //chart(response);
            }
        });
    };
    
    
    //d3-graph-gallery.com
    /*function chart(data){
        var width = 450
            height = 450
            margin = 40

        var radius = Math.min(width, height) / 2 - margin

        var chart = d3.select("#intro")
            .append("svg")
            .attr("width",width)
            .attr("height",height)
            .attr("class","chart");
        var chartG = d3.select(".chart")
            .append("g")
            .attr("class","chartG")
            .attr("transform","translate(" + width/2 + "," + height/2 + ")");
        var shopData = data;
        console.log(shopData)
        //console.log(shopData["Company"].count())
        var shopArray = [];
        for (var i=0; i<shopData.length; i++){
            var object = shopData[i]
            var val = object["Company"];
            console.log(shopData[i]["Company"])
            shopArray.push(val);
        }

        //var shopCount = {count(shopArray[0]),shopArray[1],shopArray[2],shopArray[3],shopArray[4]};
        
        console.log(shopArray);
        var color = d3.scaleOrdinal()
            .domain(shopArray)
            .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"]);
        var pie = d3.pie()
            .value(function(d) {return d.value})
        var data_ready = pie(d3.entries(shopArray))
        chartG.selectAll(".slices")
            .data(data_ready)
            .enter()
            .append("path")
            .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
            .attr("fill",function(d){return(color(d.shopCount.key))})
            .style("stroke","black")
            .style("stroke-width","2px")
            .style("opacity",0.7)
    }*/
    $(document).ready(createMap);
}) ();

