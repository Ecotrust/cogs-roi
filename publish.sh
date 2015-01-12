rm -rf output
mkdir -p output
cp -r index.html css/ js/ output
mkdir -poutput/data
cp -r data/ecoregions.topojson output/data
MSG="publish gh-pages"
# requires pip install ghp-import
ghp-import output -m "$MSG"
git push origin gh-pages
echo
echo "DON'T FORGET TO COMMIT/PUSH MASTER"
echo "git status"
echo "git commit -a -m \"$MSG\""
echo "git push origin master" 
