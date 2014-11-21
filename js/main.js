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

var selectedStyle = [new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.1)'
  }),
  stroke: new ol.style.Stroke({
    color: 'yellow',
    width: 2
  })
})];

var vector = new ol.layer.Vector({
  source: new ol.source.TopoJSON({
    url: 'data/ecoregions.topojson' // in default 3857 projection
  }),
  style: function(feature, resolution) {
    //console.log(feature.values_.WF_mallard);
    return styleArray;
  }
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

var getData = function(feature) {
  var medians = [Math.random(), Math.random(), Math.random()];
  var d = {
    waterfowlabundance: Math.random(),
    waterfowlrichness: Math.random(),
    waterfowlirreplaceability: Math.random(),
    migratoryabundance: Math.random(),
    migratoryrichness: Math.random(),
    migratoryirreplaceability: Math.random(),
    threatenedplants: Math.random(),
    threatenedamphibians: Math.random(),
    threatenedinvertebrates: Math.random(),
    opprecreation: Math.random(),
    threats: {
      future: Math.random(),
      current: Math.random()
    },
    cost: {
      crop: {
        min: 0,
        firstQuartile: medians[0]/2,
        median: medians[0],
        thirdQuartile: medians[0] + (1 - medians[0]/2),
        max: 1
      },
      wetland: {
        min: 0,
        firstQuartile: medians[1]/2,
        median: medians[1],
        thirdQuartile: medians[1] + (1 - medians[1]/2),
        max: 1
      },
      forest: {
        min: 0,
        firstQuartile: medians[2]/2,
        median: medians[2],
        thirdQuartile: medians[2] + (1 - medians[2]/2),
        max: 1
      }
    }
  };

  return d;
};
  
var config = {
  barwidth: 300,
  margin: {top: 12, right: 12, bottom: 40, left: 70},
  scatter: {width: 140, height: 140}
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
    .attr("x", config.scatter.width)
    .attr("y", 36)
    .style("text-anchor", "end")
    .text("Current Threats");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", -46)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Future Threats");

svg.append("circle").attr("class", "dot");


d3.selectAll(".hist")
  .selectAll(".histbar")
    .data([0.2, 0.4, 0.6, 0.4, 0.1])  // 9 bins
  .enter().append("div")
    .attr("class", "histbar")
    .style("width", function(d){ return Math.round(d*200) + 'px';})
    .text(function(d) { return d; });

function redraw(data) {
  for (var variable in data) {
    var d = data[variable];
    if (variable === 'cost') {

    } else if (variable === 'threats') {

      svg.selectAll("circle.dot")
          .data([d])
          .transition()
          .duration(1000)
          .attr("class", "dot")
          .attr("r", 6.5)
          .attr("cx", function(d) { console.log(d); return x(d.current); })
          .attr("cy", function(d) { return y(d.future); })
          .style("fill", function(d) { return "#2c3e50"; });

    } else {
      d3.select("." + variable)
          .data([d])
          .transition()
          .duration(1000)
          .style("background-color", function(d) {return ramp(d); })
          .style("color", function(d) {return textramp(d); })
          .style("width", function(d) { return d * config.barwidth + "px"; })
    }
  }
}


var displayFeatureInfo = function(pixel) {
  var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    return feature;
  });
  var info = document.getElementById('info');
  var title = document.getElementById('title');

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
  $('#map').height($(window).height() - 64);
  $('#map').width($(window).width()/2 - 24);
  map.updateSize();
};
window.onload = resizeMap;
window.onresize = resizeMap;