#!/usr/bin/env bash

echo "this will be awesome"
echo "..."

echo "getting data from couchdb"
curl locator.in.htwg-konstanz.de:5984/app/_all_docs?include_docs=true > allData.json

echo "splitting data"
node index.js

echo "\n creating users"
node transformer/user.js

echo "\n creating locations"
node transformer/locations.js


echo "\n creating conversations"
node transformer/conversations.js

echo "\n creating messages"
node transformer/messages.js
