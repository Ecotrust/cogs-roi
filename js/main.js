/* global d3 */
/* jshint bitwise: false */

var raster = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'sat'})
});

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
    url: 'data/ecoregions.topojson' // in default 3857 projection
  }),
  style: function(feature, resolution) {
    return styleArray;
  },
  change: function(state) { console.log(state); }
});

var map = new ol.Map({
  layers: [raster, vector],
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

  var medians = [getFeatureAttr(feature, "AvgCost_In")];

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
    threats: {
      climate:            getFeatureAttr(feature, "ClimateCha"),
      development:        getFeatureAttr(feature, "Developmen"),
    },
    costs: [
      // Boxplots
      {
        type: 'forest',
        min: medians[0] - 0.2,
        firstQuartile: medians[0]/2,
        median: medians[0],
        thirdQuartile: medians[0] * 1.3,
        max: medians[0] + 0.2
      },
      {
        type: 'agriculture',
        min: medians[0] - 0.15,
        firstQuartile: medians[0]/2,
        median: medians[0],
        thirdQuartile: medians[0] * 1.3,
        max: medians[0] + 0.35
      },
      {
        type: 'wetland',
        min: medians[0] - 0.25,
        firstQuartile: medians[0]/2,
        median: medians[0],
        thirdQuartile: medians[0] * 1.3,
        max: medians[0] + 0.35
      },
      {
        type: 'pasture',
        min: medians[0] - 0.1,
        firstQuartile: medians[0]/2,
        median: medians[0],
        thirdQuartile: medians[0] * 1.3,
        max: medians[0] + 0.3
      }
    ]
  };

  return d;
};
  
var config = {
  barwidth: 300,
  margin: {top: 12, right: 12, bottom: 40, left: 70},
  scatter: {width: 140, height: 140},
  animationDuration: 1000
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

var svg = d3.select("svg.threats-scatter")
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

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + config.scatter.height + ")")
    .call(xAxis)
  .append("text")
    .attr("class", "label")
    .attr("x", config.scatter.width/2)
    .attr("y", 36)
    .style("text-anchor", "middle")
    .text("Climate Change");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", -1 * config.scatter.height/2)
    .attr("y", -46)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Development");

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

function costWidth(d){
  return Math.round((d.max-d.min) * 100) + 20 + 'px';
}

function costOffset(d) {
  return (60 + (d.min * 240)) + 'px';
}

function costText(d) {
  return d.type;
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

    } else if (variable === 'threats') {

      svg.selectAll("circle.dot")
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