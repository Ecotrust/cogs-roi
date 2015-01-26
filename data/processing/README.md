Data processing


# USFW Delivers to us..

Two datasets:

* cogs-roi/data/processing/original/EcoregionSummaries3.gdb.zip
* cogs-roi/data/processing/original/ROI_Table_Jan6.gdb.zip

The first holds the spatial data, the second holds updated tabular data

# Join

We need to join the two and create an intermediate shapefile.

This is accomplished by the `join.sh` script. Getting the field names right is critical; see `field_names.txt` for more info. If this changes in future data deliveries, the script and field_names doc must be updated as well.

The result of this `join.sh` script is a shapefile named:
`cogs-roi/data/processing/ecoregions_joined_albers.shp`


# Simplify and convert to topojson

This is convered by the `toposimplify.sh` script. Adjust as needed.

Requires the `topojson` command line utility. `npm install -g topojson`


# Move

Finally, move the final ecoregions.topojson to the data dir

`cp ecoregions.topojson ..`

reload the app and proceed.

