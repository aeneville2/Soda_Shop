(function(){
    
    function createMap(){
        var map = L.map('map').setView([39.3210,-111.0937],6);

        //add OSm base tilelayer
        L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=ba21c9a366fa43c7b8f5af4065ed9c9f', {
            attribution: 'Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //call getData function
        getData(map);
        //createCounties(map);
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
    //used https://gis.stackexchange.com/questions/312737/filtering-interactive-leaflet-map-with-dropdown-menu response from IvanSanchez for help with layers extend
    function createShopSymbols(data,map){
        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        var allShops = L.geoJson(data, {
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var hotDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Hot_Chocolate"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var frozenDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Frozen_Drinks"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var cookies = L.geoJson(data, {
            filter: function(feature){return feature.properties["Cookies"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var kidsDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Kids_Drinks"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var popcorn = L.geoJson(data, {
            filter: function(feature){return feature.properties["Popcorn"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var smallSize = L.geoJson(data, {
            filter: function(feature){return feature.properties["Smallest_Size"] == '12 oz.'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var allLayers = L.layerGroup([allShops,hotDrinks,frozenDrinks,cookies,kidsDrinks,popcorn,smallSize]).addTo(map);
        
        var layerControl = L.control.layers(null,{
            "All Shops": allShops,
            "Hot Drinks": hotDrinks,
            "Frozen Drinks": frozenDrinks,
            "Cookies": cookies,
            "Special Kids Drinks": kidsDrinks,
            "Popcorn": popcorn,
            "12 oz. Option": smallSize
        },{collapsed: false}).addTo(map);
        //allShops.addTo(map);
    };
    
    //used cmrRose response from https://gis.stackexchange.com/questions/283070/filter-geojson-by-attribute-in-leaflet-using-a-button for help with filtering
    function addFilters(data,map){
        $('#panel').append('<p><input type="range" min="$1.50" max ="$2.50" id="price">Base Price</input>');  
    };

    function addCounty(map){
        $('#panel').append('<input type="checkbox" id="counties">Counties</input>')
        //$('#counties').on("input",createCounties(map))
        $("#counties").on('click',function(){
            if ($(this).is(':checked')){
                createCounties(map);
            } 
        });
    
        //when checkbox is unchecked then remove average symbols layer from the map
        $("#counties").on('click',function(){
            if (! $(this).is(':checked')){
                removeCounties(map);

            }
        });
    };

    function addReset(data,map){
        $('#panel').append('<button id="reset">Reset</button>')

        $('#reset').on('click',function(){
            removeCounties(map);
            map.setView([39.3210,-111.0937]);
            map.setZoom(6);
            map.eachLayer(function(layer){
                if (layer.feature){
                    map.removeLayer(layer)
                }
            });
            $('.leaflet-control-layers').remove();
            createShopSymbols(data,map);
        })
    };

    function removeCounties(map){
        map.eachLayer(function(layer){
            if (layer.feature && layer.options.fillColor == "blue"){
                map.removeLayer(layer)
            }
        })
    };

    function createCounties(map){
        var counties = $.ajax("data/Utah_County_Boundaries.geojson", {
            dataType: "json",
            success: function(response){
                L.geoJson(response, {
                    pointToLayer: function(feature,latlng){
                        return L.polygon(latlng);
                    },
                    style: function(feature){
                        return{fillColor: "blue"}
                    }
                }).addTo(map);
            }
        });
        //counties.addTo(map)
        //$('#counties').on("input",function(){counties.addTo(map);})
    };
    
    function getData(map){
        
        //load the data
        $.ajax("data/map.geojson", {
            dataType: "json",
            success: function(response){
                createShopSymbols(response,map);
                addFilters(response,map);
                addCounty(map);
                addReset(response,map);
                chart(response);
            }
        });
    };
    
    
    //d3-graph-gallery.com
    function chart(data){
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
        var shopData = {a:16,b:37,c:42,d:2,e:101};
        console.log(shopData)
        //console.log(shopData["Company"].count())
        /*var shopArray = [];
        for (var i=0; i<shopData.length; i++){
            var object = shopData[i]
            var val = object["Company"];
            console.log(shopData[i]["Company"])
            shopArray.push(val);
        }*/

        //var shopCount = {count(shopArray[0]),shopArray[1],shopArray[2],shopArray[3],shopArray[4]};
        
        //console.log(shopArray);
        var color = d3.scaleOrdinal()
            .domain(shopData)
            .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"]);
        var pie = d3.pie()
            .value(function(d) {return d.value})
        var data_ready = pie(d3.entries(shopData))
        chartG.selectAll(".slices")
            .data(data_ready)
            .enter()
            .append("path")
            .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
            .attr("fill",function(d){return(color(d.shopData.key))})
            .style("stroke","black")
            .style("stroke-width","2px")
            .style("opacity",0.7)
    }
    $(document).ready(createMap);
}) ();

