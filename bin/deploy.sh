#!/bin/bash

rev=$(git rev-parse --short HEAD)

cd public

git init
git config user.name "Travis CI "
git config user.email "travis@travis-ci.org"

git remote add upstream "https://$GITHUB_TOKEN@github.com/egeis/jekyll-business-casual.git"
git fetch upstream && git reset upstream/gh-pages

touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:gh-pages