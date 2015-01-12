cp -r index.html css/ data/ecoregions.topjson js/ output
MSG="publish gh-pages"
# requires pip install ghp-import
ghp-import output -m "$MSG"
git push origin gh-pages
echo
echo "DON'T FORGET TO COMMIT/PUSH MASTER"
echo "git status"
echo "git commit -a -m \"$MSG\""
echo "git push origin master" 
