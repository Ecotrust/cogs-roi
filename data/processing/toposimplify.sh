#!/bin/bash

# to create ecoregions_joined_albers.shp, see join.sh

echo "Reproject to web mercator"
ogr2ogr -overwrite -t_srs epsg:3857 -f "ESRI Shapefile" \
    ecoregions_joined_3857.shp ecoregions_joined_albers.shp ecoregions_joined_albers

echo "Convert to topojson and simplify"
topojson --cartesian \
    --properties \
    --simplify-proportion 0.04 \
    -q 1E6 \
    -o ecoregions.topojson \
    ecoregions_joined_3857.shp
