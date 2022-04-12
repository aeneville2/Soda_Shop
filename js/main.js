//script by Aspen Neville, 2022

//wrap in function to bring to local scope
(function(){
    //define width, height, margin, and radius variables for the chart
    var width = 0.25*window.innerWidth
        height = 250
        margin = 20;

    var radius = Math.min(width, height) / 2 - margin;

    //create containers for the pie chart
    var chart = d3.select("#pie-chart-row")
        .append("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("class","chart");
    var chartG = d3.select(".chart")
        .append("g")
        .attr("class","chartG")
        .attr("transform","translate(" + width/2 + "," + height/2 + ")");

    //define categorical color scheme for the shops
    var color = d3.scaleOrdinal(["#e41a1c","#377eb8","#984ea3","#4daf4a","#ff7f00"]);

    //create legend for the pie chart/map
    var legend = d3.legendColor()
        .shape('circle')
        .shapeRadius(8)
        .shapePadding(5)
        .orient('vertical')
        .scale(color)
        .labels(["Swig","Fiiz","Sodalicious","Twisted Sugar","Quench It!"]);
    
    //create a container for the legend
    var legendContainer = d3.select('#pie-chart-legend').append('svg')
    var legendG = legendContainer.append('g')
        .attr('class','pie-legend')
        .attr('transform','translate(20,20)');

    //function to create the map
    function createMap(){
        var map = L.map('map').setView([39.3210,-111.0937],6);

        //add OSm base tilelayer
        L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=ba21c9a366fa43c7b8f5af4065ed9c9f', {
            attribution: 'Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);

        //call getData function to add the data to the map
        getData(map);
    };

    //function to add shop websites conditional on shop type
    function shopWebsite(attribute){
        if (attribute == 'Swig'){
            return 'https://www.swignsweets.com/'
        } else if (attribute == 'Fiiz Drinks'){
            return 'https://fiizdrinks.com/'
        } else if (attribute == 'Sodalicious'){
            return 'https://www.mysodalicious.com/'
        } else if (attribute == 'Twisted Sugar'){
            return 'https://twistedsugar.com/'
        } else if (attribute == 'Quench It!'){
            return 'https://quenchitsoda.com/'
        }
    };

    //function to return the shop logo based on company
    function shopLogo(attribute){
        if (attribute == 'Swig'){
            return 'img/Swig-Icon.png'
        } else if (attribute == 'Fiiz Drinks'){
            return 'img/cropped-logo-fiiz-july-2020.png'
        } else if (attribute == 'Sodalicious'){
            return 'img/Sodalicious.png'
        } else if (attribute == 'Twisted Sugar'){
            return 'img/twisted-sugar-logo.png'
        } else if (attribute == 'Quench It!'){
            return 'img/quench-it-soda.x1.png'
        }
    }

    //function to create the popup for the shops on the map
    function shopPopup(feature,layer){
        var attribute = feature.properties["Company"];
        var website = shopWebsite(attribute);
        var popupContent = "<div style='text-align: center'><img src='" + shopLogo(attribute) + "' height='50px'></div>"
        popupContent += "<div style='line-height:2px;text-align:center;'><p>" +feature.properties["given_address"] + "</p><p><a href=" + website + ">Website</a></p></div>";
        layer.bindPopup(popupContent);
    };

    //function to color the shop symbols on the map categorically based on shop type
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
    //function to create the shop symbols for the map
    function createShopSymbols(data,map){
        //general style properties for the marker symbols
        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        //create a marker layer for all shops in the data
        var allShops = L.geoJson(data, {
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that sell hot chocolate using the filter property
        var hotDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Hot_Chocolate"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that sell frozen drinks using the filter property
        var frozenDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Frozen_Drinks"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that sell cookies using the filter property
        var cookies = L.geoJson(data, {
            filter: function(feature){return feature.properties["Cookies"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that sell kids drinks using the filter property
        var kidsDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Kids_Drinks"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that sell popcorn using the filter property
        var popcorn = L.geoJson(data, {
            filter: function(feature){return feature.properties["Popcorn"] == 'Y'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops that have a 12 oz. size using the filter property
        var smallSize = L.geoJson(data, {
            filter: function(feature){return feature.properties["Smallest_Size"] == '12 oz.'},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a layer group of all of the above layers
        var allLayers = L.layerGroup([allShops,hotDrinks,frozenDrinks,cookies,kidsDrinks,popcorn,smallSize]).addTo(map);
        
        //add the layer group to the map in a control widget on the map that expands to show the options
        var layerControl = L.control.layers(null,{
            "All Shops": allShops,
            "Hot Drinks": hotDrinks,
            "Frozen Drinks": frozenDrinks,
            "Cookies": cookies,
            "Special Kids Drinks": kidsDrinks,
            "Popcorn": popcorn,
            "12 oz. Option": smallSize
        },{collapsed: false}).addTo(map);

        //create an array of each shop's company property for use in the pie chart
        var shopData = data;
        var shopArray = [];
        var shopFeatures = shopData.features;
        for (var i=0; i<shopFeatures.length; i++) {
            var company = shopFeatures[i].properties["Company"]
            shopArray.push(company);
        };
        updateChart(shopArray);
        
        //update the title of the pie chart
        $('#legend-title-row').text("Distribution of Soda Shop Companies in Utah");
    };
    
    //function to show shops based on county
    function createCountyShopSymbols(data,map,selection){
        //define general marker style options
        var geojsonMarkerOptions = {
            radius: 8,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        //create a marker layer for all shops in the selected county
        var allShops = L.geoJson(data, {
            filter: function(feature){return feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that sell hot chocolate
        var hotDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Hot_Chocolate"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that sell frozen drinks
        var frozenDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Frozen_Drinks"] == 'Y'&& feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that sell cookies
        var cookies = L.geoJson(data, {
            filter: function(feature){return feature.properties["Cookies"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that sell kids drinks
        var kidsDrinks = L.geoJson(data, {
            filter: function(feature){return feature.properties["Kids_Drinks"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that sell popcorn
        var popcorn = L.geoJson(data, {
            filter: function(feature){return feature.properties["Popcorn"] == 'Y' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a marker layer for all shops in the selected county that have a 12 oz. option
        var smallSize = L.geoJson(data, {
            filter: function(feature){return feature.properties["Smallest_Size"] == '12 oz.' && feature.properties["county"] == selection},
            pointToLayer: function(feature,latlng){
                geojsonMarkerOptions.fillColor = colorShops(feature,latlng);
                return L.circleMarker(latlng,geojsonMarkerOptions);
            },
            onEachFeature: shopPopup
        });

        //create a layer group of all of the above county layers
        var allLayers = L.layerGroup([allShops,hotDrinks,frozenDrinks,cookies,kidsDrinks,popcorn,smallSize]).addTo(map);
        
        //add the layer group to the map in a control widget on the map that expands to show the options
        var layerControl = L.control.layers(null,{
            "All Shops": allShops,
            "Hot Drinks": hotDrinks,
            "Frozen Drinks": frozenDrinks,
            "Cookies": cookies,
            "Special Kids Drinks": kidsDrinks,
            "Popcorn": popcorn,
            "12 oz. Option": smallSize
        },{collapsed: false}).addTo(map);
    };

    //function to create a selection menu of counties that updates the shop features displayed on the map
    function filterCounty(data,map){
        //create the selection menu
        $('#county-filter-row').append('<select id="select"></select>');
        $('#select').append('<option class="All Counties">All Counties</option>');
        $('#select').append('<option id="Beaver County">Beaver County</option>');
        $('#select').append('<option id="Box Elder County">Box Elder County</option>');
        $('#select').append('<option id="Cache County">Cache County</option>');
        $('#select').append('<option id="Carbon County">Carbon County</option>');
        $('#select').append('<option id="Daggett County">Daggett County</option>');
        $('#select').append('<option id="Davis County">Davis County</option>');
        $('#select').append('<option id="Duchesne County">Duchesne County</option>');
        $('#select').append('<option id="Emery County">Emery County</option>');
        $('#select').append('<option id="Garfield County">Garfield County</option>');
        $('#select').append('<option id="Grand County">Grand County</option>');
        $('#select').append('<option id="Iron County">Iron County</option>');
        $('#select').append('<option id="Juab County">Juab County</option>');
        $('#select').append('<option id="Kane County">Kane County</option>');
        $('#select').append('<option id="Millard County">Millard County</option>');
        $('#select').append('<option id="Morgan County">Morgan County</option>');
        $('#select').append('<option id="Piute County">Piute County</option>');
        $('#select').append('<option id="Rich County">Rich County</option>');
        $('#select').append('<option id="Salt Lake County">Salt Lake County</option>');
        $('#select').append('<option id="San Juan County">San Juan County</option>');
        $('#select').append('<option id="Sanpete County">Sanpete County</option>');
        $('#select').append('<option id="Sevier County">Sevier County</option>');
        $('#select').append('<option id="Summit County">Summit County</option>');
        $('#select').append('<option id="Tooele County">Tooele County</option>');
        $('#select').append('<option id="Uintah County">Uintah County</option>');
        $('#select').append('<option id="Utah County">Utah County</option>');
        $('#select').append('<option id="Wasatch County">Wasatch County</option>');
        $('#select').append('<option id="Washington County">Washington County</option>');
        $('#select').append('<option id="Wayne County">Wayne County</option>');
        $('#select').append('<option id="Weber County">Weber County</option>');

        //add event listener to the selection menu for when the selection changes
        $('#select').on('change',function(){
            //on a change, remove all layers from the map
            map.eachLayer(function(layer){
                if (layer.feature){
                    map.removeLayer(layer)
                }
            });
            //remove the control widget from the map
            $('.leaflet-control-layers').remove();

            //create the appropriate symbols and update the pie chart based on what is selected
            var selection = this.value;
            if (selection == 'All Counties'){
                createShopSymbols(data,map)
            } else {
                createCountyShopSymbols(data,map,selection);
                countyArray(data,selection);
            }
        });
    };

    //add an option for an overlay layer displaying county boundaries
    function addCounty(map){
        //add a checkbox for counties to the appropriate div
        $('#county-row').append('<input type="checkbox" id="counties">Show County Boundaries on Map</input>');

        //when checkbox is checked then add the county overlay to the map
        $("#counties").on('click',function(){
            if ($(this).is(':checked')){
                createCounties(map);
            } 
        });
    
        //when checkbox is unchecked then remove the county overlay from the map
        $("#counties").on('click',function(){
            if (! $(this).is(':checked')){
                removeCounties(map);
            }
        });
    };

    //function to add a reset button to reset the map and all interactives to original state
    function addReset(data,map){
        //add the reset button to the appropriate div
        $('#reset-row').append('<button id="reset">Reset</button>')

        /*when reset button is clicked then remove county layers, reset the map to original extent and zoom,
        remove all layers and the layer control widget from the map, add in the original layer and layer control,
        and return the county selection menu to the first state*/
        $('#reset').on('click',function(){
            removeCounties(map);
            map.setView([39.3210,-111.0937],6);
            map.eachLayer(function(layer){
                if (layer.feature){
                    map.removeLayer(layer)
                }
            });
            $('.leaflet-control-layers').remove();
            createShopSymbols(data,map);

            //https://www.codegrepper.com/code-examples/javascript/jquery+reset+select+to+first+option response from Beautiful Bug
            $('#select').prop('selectedIndex',0);
            $('#price').prop('value',2.50)
        })
    };

    //function to remove the county overlay layer from the map
    function removeCounties(map){
        map.eachLayer(function(layer){
            if (layer.feature && layer.options.fillOpacity == 0){
                map.removeLayer(layer)
            }
        })
    };

    //function to add the county overlay layer to the map behind the shops with appropriate style and tooltip
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

    //function to create an array of just the company property for the features in the selected county to update the pie chart
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

    //function to update the legend title based on which county is selected
    function legendTitle(attribute){
        $('#legend-title-row').text("Distribution of Soda Shop Companies in " + attribute);
    };
    
        //d3-graph-gallery.com/graph/pie_annotation.html and www.tutorialsteacher.com/d3js/create-pie-chart-using-d3js
        //function to create the pie chart to show the distribution by shop type
    function updateChart(shopArray){
        //count the number of each shop type from the array of companies
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

        //create dictionary of each shop type and count
        var shopCount = {'Swig':swig,'Fiiz':fiiz,'Sodalicious':sodalicious,'Twisted Sugar':twistedSugar,'Quench It!':quenchIt}
        
        //variable to create the pie chart
        var pie = d3.pie()
            .value(function(d) {return d.value});
        
        //if the array has no features (county has no shops) then have the pie chart draw solid black
        if (total == 0){
            var emptyArray = {'None':100}
            var data_ready = pie(d3.entries(emptyArray))
            chartG.selectAll('.slices')
                .data(data_ready)
                .enter()
                .append('path')
                //.transition()
                //.delay(500)
                .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
                .attr("fill","#000")
                .style("stroke","black")
                .style("stroke-width","2px")
                .style("opacity",1);
        }
        //otherwise have the pie chart draw according to proportion of each shop type with labels to show percentages
        else {
            var data_ready = pie(d3.entries(shopCount))
            chartG.selectAll(".slices")
                .data(data_ready)
                .enter()
                .append("path")
                //.transition()
                //.delay(500)
                .attr("d",d3.arc().innerRadius(0).outerRadius(radius))
                .attr("fill",function(d,i){return(color(i))})
                .style("stroke","black")
                .style("stroke-width","2px")
                .style("opacity",1);

            chartG.selectAll(".slices")
                .data(data_ready)
                .enter()
                .append("text")
                //.transition()
                //.delay(500)
                .text(function(d) {return Math.round((d.value/total)*100) + "%"})
                .attr("transform",function(d) {return "translate(" + d3.arc().outerRadius(radius).innerRadius(radius-80).centroid(d) + ")";})
                .style("text-anchor","middle")
                .style("font-size",17);
        };

        //call the legend variable to draw the legend
        legendG.call(legend);
    };

    //function to add the shops and associated features to the map and webpage 
    function getData(map){
        //load the data
        $.ajax("data/map.geojson", {
            dataType: "json",
            success: function(response){
                createShopSymbols(response,map);
                //addFilters(response,map);
                addCounty(map);
                addReset(response,map);
                filterCounty(response,map);
                addFilters(response,map);
            }
        });
    };
    
    //when everything is ready, initiate the create map function to draw the map and associated features on the page
    $(document).ready(createMap);
}) ();

