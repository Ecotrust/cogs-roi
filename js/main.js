/* global d3 */
/* jshint bitwise: false */

$(document).ready(function() {

  var styleArray = [new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.0)'
    }),
    stroke: new ol.style.Stroke({
      color: 'white',
      width: 0.5
    })
  })];

  var styleCache = {};

  function selectedStyle(feature, resolution) {
    var text = feature.get('US_L3NAME');

    if (!styleCache[text]) {
      styleCache[text] = [new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: 'yellow',
          width: 2
        })
        // Problem: multipart labels with no collision detection
        // https://groups.google.com/forum/#!searchin/ol3-dev/label/ol3-dev/Yp7EOiwiycE/YdpNU6-eDToJ
        // text: new ol.style.Text({
        //   font: '14px Calibri,sans-serif',
        //   text: text,
        //   fill: new ol.style.Fill({
        //     color: '#000'
        //   }),
        //   stroke: new ol.style.Stroke({
        //     color: 'rgba(255, 255, 255, 0.7)',
        //     width: 3
        //   })
        // })
      })];
    }
    return styleCache[text];
  }

  var vector = new ol.layer.Vector({
    source: new ol.source.TopoJSON({
      url: 'data/ecoregions.topojson'
    }),
    style: function(feature, resolution) {
      return styleArray;
    },
    change: function(state) {
      console.log(state);
    },
    title: "US Ecoregions (level 3)"

  });

  var map = new ol.Map({
    layers: [
      new ol.layer.Group({
        title: "Basemaps",
        layers: [
          new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'sat'}),
            title: "Mapquest Satellite",
            type: "base"
          }),
          new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'osm'}),
            title: "Mapquest",
            visible: false,
            type: "base"
          })
        ]
      }),
      new ol.layer.Group({
        title: "Overlays",
        layers: [

          new ol.layer.Image({
            extent: [-13884991, 2870341, -7455066, 6338219],
            title: "US States",
            visible: false,
            source: new ol.source.ImageWMS({
              url: 'http://demo.opengeo.org/geoserver/wms',
              params: {'LAYERS': 'topp:states'},
              serverType: 'geoserver'
            })
          }),
          // For tiled, see http://openlayers.org/en/v3.0.0/examples/wms-tiled.js 

          new ol.layer.Image({
            extent: [-13884991, 2870341, -7455066, 6338219],
            title: "Projects",
            visible: false,
            source: new ol.source.ImageWMS({
              url: 'https://www.sciencebase.gov/arcgis/services/Catalog/54933e61e4b06a960f00e72e/MapServer/WmsServer',
              params: {'LAYERS': '0'}
            })
          }),

          new ol.layer.Image({
            extent: [-13884991, 2870341, -7455066, 6338219],
            title: "Land Value Scenario",
            visible: false,
            source: new ol.source.ImageWMS({
              url: 'https://www.sciencebase.gov/arcgis/services/Catalog/54934d9ce4b0bb067209b73a/MapServer/WMSServer',
              params: {'LAYERS': '0'}
            })
          }),

          new ol.layer.Image({
            extent: [-13884991, 2870341, -7455066, 6338219],
            title: "Climate Change Scenario",
            visible: false,
            source: new ol.source.ImageWMS({
              url: 'https://www.sciencebase.gov/arcgis/services/Catalog/54934eebe4b0bb067209b73e/MapServer/WMSServer',
              params: {'LAYERS': '0'}
            })
          }),

          vector
        ]
      })
    ],
    target: 'map',
    view: new ol.View({
      center: [-10953577, 4801185],
      zoom: 4
    })
  });


  // Select interaction handles the highlighting
  var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click,
    style: selectedStyle
  });
  map.addInteraction(selectClick);

  var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Legend' // Optional label for button
  });
  map.addControl(layerSwitcher);

  function getFeatureAttr(feature, attr) {
    if (feature === undefined) {
      return 0;
    } else {
      var val = feature.get(attr);
      if (val === undefined) {
        console.log("WARNING", attr, val);
        val = 0;
      }
      return val;
      //console.log(attr, val);
    }
  }

  var getData = function(feature) {

    // var medians = [getFeatureAttr(feature, "AvgCost_In")];

    var d = {
      landbirdabundance:    getFeatureAttr(feature, "LandBirdAb"),
      landbirdhabitat:      getFeatureAttr(feature, "LandBirdHa"),
      shorebirdabundance:   getFeatureAttr(feature, "ShoreBirdA"),
      shorebirdhabitat:     getFeatureAttr(feature, "ShorebirdH"),
      waterbirdabundance:   getFeatureAttr(feature, "WaterbirdA"),
      waterbirdhabitat:     getFeatureAttr(feature, "WaterbirdH"),
      waterfowlabundance:   getFeatureAttr(feature, "WaterfowlA"),
      waterfowlhabitat:     getFeatureAttr(feature, "WaterfowlH"),
      threatenedfish:       getFeatureAttr(feature, "TEFishes_I"),
      threatenedmammals:    getFeatureAttr(feature, "TEMammals_"),
      threatenedreptiles:   getFeatureAttr(feature, "TEReptiles"),
      threatenedbirds:      getFeatureAttr(feature, "TEBirds_In"),
      threatenedplants:     getFeatureAttr(feature, "TEPlants_I"),
      threatenedamphibians: getFeatureAttr(feature, "TEAmphib_I"),
      roi: {
        roi:                getFeatureAttr(feature, "ROI"),
        currentInvestment:  getFeatureAttr(feature, "CurExpendi"),
      },
      threats: {
        climate:            getFeatureAttr(feature, "ClimateCha"),
        development:        getFeatureAttr(feature, "Developmen"),
      },
      costs: [
        // Boxplots
        {
          type: 'Forest',
          min: getFeatureAttr(feature, "Forest_MIN"),
          mean: getFeatureAttr(feature, "Forest_MEA"),
          max: getFeatureAttr(feature, "Forest_MAX")
        },
        {
          type: 'Agriculture',
          min: getFeatureAttr(feature, "Ag_MIN"),
          mean: getFeatureAttr(feature, "Ag_MEAN"),
          max: getFeatureAttr(feature, "Ag_MAX")
        },
        {
          type: 'Rangeland',
          min: getFeatureAttr(feature, "Range_MIN"),
          mean: getFeatureAttr(feature, "Range_MEAN"),
          max: getFeatureAttr(feature, "Range_MAX")
        },
        {
          type: 'Pasture',
          min: getFeatureAttr(feature, "Pasture_MI"),
          mean: getFeatureAttr(feature, "Pasture_ME"),
          max: getFeatureAttr(feature, "Pasture_MA")
        }
      ]
    };

    return d;
  };
    
  var config = {
    barwidth: 300,
    margin: {top: 12, right: 12, bottom: 40, left: 58},
    scatter: {width: 200, height: 150},
    animationDuration: 1000,
  };

  var ramp = d3.scale.threshold()
      .domain([0.2, 0.4, 0.6, 0.8])
      .range(["#cccccc", "#B6B9EF", "#9799C3", "#666893", "#2c3e50"]);

  var textramp = d3.scale.threshold()
      .domain([0.6])
      .range(["black", "white"]);

  var x = d3.scale.linear().range([0, config.scatter.width]);
  var y = d3.scale.linear().range([config.scatter.height, 0]);

  var xAxis = d3.svg.axis().ticks(3).scale(x).orient("bottom");
  var yAxis = d3.svg.axis().ticks(3).scale(y).orient("left");

  var svg = d3.selectAll("svg.scatter")
      .attr("width", config.scatter.width + config.margin.left + config.margin.right)
      .attr("height", config.scatter.height + config.margin.top + config.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");

  svg.append("rect")
      .attr('x', 0)
      .attr('y', 0)
      .style("fill", '#f9f9f9')
      .attr('width', config.scatter.width)
      .attr('height', config.scatter.height);

  // Axis labels
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + config.scatter.height + ")")
      // .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", config.scatter.width/2)
      .attr("y", 26)
      .style("text-anchor", "middle");

  svg.append("g")
      .attr("class", "y axis")
      // .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("x", -1 * config.scatter.height/2)
      .attr("y", -26)
      .attr("dy", ".71em")
      .style("text-anchor", "middle");


  // Grids
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + config.scatter.height + ")")
    .call(xAxis
        .tickSize(-1 * config.scatter.height, 0, 0)
        .tickFormat("")
  );

  svg.append("g")
    .attr("class", "grid")
    .call(yAxis
        .tickSize(-1 * config.scatter.width, 0, 0)
        .tickFormat("")
  );

  svg.append("circle").attr("class", "dot");

  var svgRoi = d3.select("svg.roi-scatter");
  var svgThreats = d3.select("svg.threats-scatter");

  svgRoi.select("g.x text.label").text("Current Investment");
  svgRoi.select("g.y text.label").text("Return on Investment");

  quads = svgRoi.append("g");

  function labelQuadrants(elem, labels) {
    var x, y;
    var lineHeight = 20;

    for (var quadrant in labels) {
      switch(quadrant) {
        case "UL":
            x = 110; y = 40; break;
        case "UR":
            x = 205; y = 40; break;
        case "LL":
            x = 110; y = 120; break;
        case "LR":
            x = 205; y = 120; break;
      }
      var words = labels[quadrant].split(" ");
      for (var i=0; i < words.length; i++) {
        elem.append("text")
          .attr("class", "quadrant")
          .text(words[i])
          .attr("transform", "translate(" + x + "," + y + ")");
        y += lineHeight;
      }
    }
  }

  function colorQuadrants(elem, colors) {
    console.log(elem);

    var x = config.margin.left;
    var y = config.margin.top;
    var width = config.scatter.width / 2.0;
    var height = config.scatter.height / 2.0;

    var xOffset = 0;
    var yOffset = 0;

    for (var quadrant in colors) {
      switch(quadrant) {
        case "UL":
            xOffset = 0; yOffset = 0; break;
        case "UR":
            xOffset = 1; yOffset = 0; break;
        case "LL":
            xOffset = 0; yOffset = 1; break;
        case "LR":
            xOffset = 1; yOffset = 1; break;
      }
      elem.append("rect")
        .attr("fill", colors[quadrant])
        .attr("x", x + (xOffset * width))
        .attr("y", y + (yOffset * height))
        .attr("width", width)
        .attr("height", height);
    };
  }


  colorQuadrants(quads,
    {'UL': '#4f6228',
     'UR': '#c3d69b',
     'LL': '#d99694',
     'LR': '#ffff99'}
  );

  labelQuadrants(quads,
    {'UL': "Increase Investment",
     'UR': "Continue Investing",
     'LL': "Low Priority",
     'LR': "Evaluate Further"}
  );

  // svgRoi.append("circle").attr("class", "dot");

  svgThreats.select("g.x text.label").text("Climate Change");
  svgThreats.select("g.y text.label").text("Development");

  d3.select("#cost-container")
    .selectAll(".boxplot")
    .data(getData()['costs'])
  .enter().append("div")
    .attr("class", "boxplot")
    .style("width", 0)
    .text(function(d) { return d.type; });

  function barwidth(d) {
    return d * config.barwidth + "px";
  }

  function threatsX(d) {
    return x(d.climate);
  }

  function threatsY(d) {
    return y(d.development);
  }

  function roiX(d) {
    return x(d.currentInvestment);
  }

  function roiY(d) {
    var raw = d.roi;
    // TODO scale in GIS analysis step 
    var scaled = ((raw + 7) / 41.7);
    return y(scaled);
  }

  function scaleRawCost(cost) {
    // TODO this should be done in the GIS Analysis step
    var absmin = 18.0;
    var absmax = 12438.0;

    var scaled = (cost - absmin) / (absmax - absmin);
    return scaled;
  }

  function costWidth(d){
    var scaledMin = scaleRawCost(d.min);
    var scaledMax = scaleRawCost(d.max);
    var rawWidth = scaledMax - scaledMin;

    return Math.round(rawWidth * 250) + 'px';
  }

  function costOffset(d) {
    var scaledMin = scaleRawCost(d.min);
    return Math.round(scaledMin * 250) + 'px';
  }

  function costText(d) {
    return d.type + " ($" + Math.round(d.mean) + ")";
  }

  function redraw(data) {
    for (var variable in data) {
      var d = data[variable];
      if (variable === 'costs') {
        
        d3.select("#cost-container")
          .selectAll(".boxplot")
          .data(d)
          .text(costText)
          .transition()
          .duration(config.animationDuration)
          .style("margin-left", costOffset)
          .style("width", costWidth);

      } else if (variable === 'roi') {

        svgRoi.selectAll("circle.dot")
            .data([d])
            .transition()
            .duration(config.animationDuration)
            .attr("class", "dot")
            .attr("r", 6.5)
            .attr("cx", roiX)
            .attr("cy", roiY);

      } else if (variable === 'threats') {

        svgThreats.selectAll("circle.dot")
            .data([d])
            .transition()
            .duration(config.animationDuration)
            .attr("class", "dot")
            .attr("r", 6.5)
            .attr("cx", threatsX)
            .attr("cy", threatsY);

      } else {
        
        d3.select("." + variable)
            .data([d])
            .transition()
            .duration(config.animationDuration)
            .style("background-color", ramp)
            .style("color", textramp)
            .style("width", barwidth);

      }
    }
  }

  var displayFeatureInfo = function(pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
      return feature;
    });
    var info = document.getElementById('info');
    var title = document.getElementById('selected-ecoregion');

    if (feature) {
      title.innerHTML = feature.get('US_L3NAME');
      data = getData(feature);
      redraw(data);
    } else {
      title.innerHTML = '&nbsp;';
    }
  };

  map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);
  });

  var resizeMap = function(){
    $('#map').height($(window).height() - 68);
    $('#map').width($(window).width()/2 - 24);
    map.updateSize();
  };
  window.onload = resizeMap;
  window.onresize = resizeMap;

  vector.on('change', function(a){
    var title = document.getElementById('selected-ecoregion');
    title.innerHTML = "Select an Ecoregion to begin";
  });

}); // end document ready