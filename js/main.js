(function(){
    var width = 250
        height = 250
        margin = 20;

    var radius = Math.min(width, height) / 2 - margin;

    var chart = d3.select("#pie-chart-row")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("class","chart");
    var chartG = d3.select(".chart")
        .append("g")
        .attr("class","chartG")
        .attr("transform","translate(" + width/2 + "," + height/2 + ")");

    var color = d3.scaleOrdinal(["#e41a1c","#377eb8","#984ea3","#4daf4a","#ff7f00"])

    var legend = d3.legendColor()
        .shape('circle')
        .shapeRadius(4)
        .shapePadding(10)
        .orient('vertical')
        .scale(color)
        .labels(["Swig","Fiiz","Sodalicious","Twisted Sugar","Quench It!"]);
    
    var legendContainer = d3.select('#pie-chart-legend').append('svg')
    var legendG = legendContainer.append('g')
        .attr('class','pie-legend')
        .attr('transform','translate(20,20)')

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
        layer.bindTooltip(popupContent);
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

        var shopData = data;
        console.log(shopData)
       

        var shopArray = [];
        var shopFeatures = shopData.features;
        console.log("shopFeatures",shopFeatures)
        
        for (var i=0; i<shopFeatures.length; i++) {
            var company = shopFeatures[i].properties["Company"]
            shopArray.push(company);
        };

        updateChart(shopArray);
        
        $('#legend-title-row').text("Distribution of Shop Company for Utah");

        /* var countyArray = [];
        var counties = data.features;

        for (var i=0; i<counties.length; i++){
            var county = counties[i].properties["county"];
            countyArray.push(county)
        };
        console.log("countyArray: ",countyArray); */

    };
    
    function createCountyShopSymbols(data,map,selection){
        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        var allShops = L.geoJson(data, {
            filter: function(feature){return feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var hotDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Hot_Chocolate"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var frozenDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Frozen_Drinks"] == 'Y'&& feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var cookies = L.geoJson(data, {
            filter: function(feature){return feature.properties["Cookies"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var kidsDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Kids_Drinks"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var popcorn = L.geoJson(data, {
            filter: function(feature){return feature.properties["Popcorn"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });
        var smallSize = L.geoJson(data, {
            filter: function(feature){return feature.properties["Smallest_Size"] == '12 oz.' && feature.properties["county"] == selection},
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


    }
    function filterCounty(data,map){
        $('#county-filter-row').append('<select id="select"></select>')
        $('#select').append('<option class="All Counties">All Counties</option>')
        $('#select').append('<option id="Beaver County">Beaver County</option>')
        $('#select').append('<option id="Box Elder County">Box Elder County</option>')
        $('#select').append('<option id="Cache County">Cache County</option>')
        $('#select').append('<option id="Carbon County">Carbon County</option>')
        $('#select').append('<option id="Daggett County">Daggett County</option>')
        $('#select').append('<option id="Davis County">Davis County</option>')
        $('#select').append('<option id="Duchesne County">Duchesne County</option>')
        $('#select').append('<option id="Emery County">Emery County</option>')
        $('#select').append('<option id="Garfield County">Garfield County</option>')
        $('#select').append('<option id="Grand County">Grand County</option>')
        $('#select').append('<option id="Iron County">Iron County</option>')
        $('#select').append('<option id="Juab County">Juab County</option>')
        $('#select').append('<option id="Kane County">Kane County</option>')
        $('#select').append('<option id="Millard County">Millard County</option>')
        $('#select').append('<option id="Morgan County">Morgan County</option>')
        $('#select').append('<option id="Piute County">Piute County</option>')
        $('#select').append('<option id="Rich County">Rich County</option>')
        $('#select').append('<option id="Salt Lake County">Salt Lake County</option>')
        $('#select').append('<option id="San Juan County">San Juan County</option>')
        $('#select').append('<option id="Sanpete County">Sanpete County</option>')
        $('#select').append('<option id="Sevier County">Sevier County</option>')
        $('#select').append('<option id="Summit County">Summit County</option>')
        $('#select').append('<option id="Tooele County">Tooele County</option>')
        $('#select').append('<option id="Uintah County">Uintah County</option>')
        $('#select').append('<option id="Utah County">Utah County</option>')
        $('#select').append('<option id="Wasatch County">Wasatch County</option>')
        $('#select').append('<option id="Washington County">Washington County</option>')
        $('#select').append('<option id="Wayne County">Wayne County</option>')
        $('#select').append('<option id="Weber County">Weber County</option>')

        $('#select').on('change',function(){
            map.eachLayer(function(layer){
                if (layer.feature){
                    map.removeLayer(layer)
                }
            });
            $('.leaflet-control-layers').remove();
            var selection = this.value;
            if (selection == 'All Counties'){
                createShopSymbols(data,map)
            } else {
                createCountyShopSymbols(data,map,selection);
                countyArray(data,selection);
            }
            //createCountyShopSymbols(data,map,selection);
            //countyArray(data,selection);
        })
    }
    //used cmrRose response from https://gis.stackexchange.com/questions/283070/filter-geojson-by-attribute-in-leaflet-using-a-button for help with filtering
    function addFilters(data,map){
        $('#filter-row').append('<p><input type="range" min="$1.50" max ="$2.50" id="price">Base Price</input>');  
    };

    function addCounty(map){
        $('#county-row').append('<input type="checkbox" id="counties">Counties</input>')
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
        $('#reset-row').append('<button id="reset">Reset</button>')

        $('#reset').on('click',function(){
            removeCounties(map);
            map.setView([39.3210,-111.0937],6);
            //map.setZoom(6);
            map.eachLayer(function(layer){
                if (layer.feature){
                    map.removeLayer(layer)
                }
            });
            $('.leaflet-control-layers').remove();
            createShopSymbols(data,map);

            //https://www.codegrepper.com/code-examples/javascript/jquery+reset+select+to+first+option response from Beautiful Bug
            $('#select').prop('selectedIndex',0);
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
                        return{color:"black",fillOpacity:0,opacity:1}
                    },
                    onEachFeature: function(feature,layer){
                        layer.bindTooltip(feature.properties["NAME"] + " COUNTY")
                    }
                }).addTo(map).bringToBack();
                
            }
        });
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
                filterCounty(response,map);
                //updateChart(response);
            }
        });
    };

    function countyArray(data,attribute){
        var countyArray = [];
        var countyFeatures = data.features;
        console.log("countyFeatures",countyFeatures)
        for (var i=0; i<countyFeatures.length; i++){
            var county = countyFeatures[i]
            if(county.properties["county"] == attribute){
                var company = county.properties["Company"]
                countyArray.push(company)
            }
        };
        updateChart(countyArray);
        legendTitle(attribute);
        
    };
    function legendTitle(attribute){
        $('#legend-title-row').text("Distribution of Shop Company for " + attribute)
    }
    
     //d3-graph-gallery.com/graph/pie_annotation.html and www.tutorialsteacher.com/d3js/create-pie-chart-using-d3js
    function updateChart(shopArray){
        let swig = 0;
        let fiiz = 0;
        let sodalicious = 0;
        let twistedSugar = 0;
        let quenchIt = 0;
        let other = 0;
        for (var i=0; i<shopArray.length; i++){
            if (shopArray[i] == 'Swig'){
                swig += 1
            } else if (shopArray[i] == 'Fiiz Drinks') {
                fiiz += 1
            } else if (shopArray[i] == 'Sodalicious'){
                sodalicious += 1
            } else if (shopArray[i] == 'Twisted Sugar'){
                twistedSugar += 1
            } else if (shopArray[i] == 'Quench It!'){
                quenchIt += 1
            } else {
                other += 1
            }
        }
        var total = swig + fiiz + sodalicious + twistedSugar + quenchIt;

        var shopCount = {'Swig':swig,'Fiiz':fiiz,'Sodalicious':sodalicious,'Twisted Sugar':twistedSugar,'Quench It!':quenchIt}
        
        console.log(swig,fiiz, sodalicious, twistedSugar, quenchIt, other);
        var pie = d3.pie()
            .value(function(d) {return d.value})
        if (total == 0){
            var emptyArray = {'None':100}
            var data_ready = pie(d3.entries(emptyArray))
            chartG.selectAll('.slices')
                .data(data_ready)
                .enter()
                .append('path')
                .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
                .attr("fill","#000")
                .style("stroke","black")
                .style("stroke-width","2px")
                .style("opacity",1);
        }
        else {
            var data_ready = pie(d3.entries(shopCount))
            chartG.selectAll(".slices")
                .data(data_ready)
                .enter()
                .append("path")
                .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
                .attr("fill",function(d,i){return(color(i))})
                .style("stroke","black")
                .style("stroke-width","2px")
                .style("opacity",1);

            chartG.selectAll(".slices")
                .data(data_ready)
                .enter()
                .append("text")
                .text(function(d) {return Math.round((d.value/total)*100) + "%"})
                .attr("transform",function(d) {return "translate(" + d3.arc().outerRadius(radius).innerRadius(radius-80).centroid(d) + ")";})
                .style("text-anchor","middle")
                .style("font-size",17);
        };
        legendG.call(legend);
    }
    
   
    
    $(document).ready(createMap);
}) ();

