rm -rf output

# copy static content
mkdir output
cp -r docs.html index.html css/ js/ output

# only copy the topojson data
mkdir output/data
cp -r data/ecoregions.topojson output/data

MSG="publish gh-pages"
# requires pip install ghp-import
ghp-import output -m "$MSG"
git push origin gh-pages

echo
echo "gh-pages branch published; don't forget to push to master as well"
