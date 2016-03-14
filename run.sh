#!/usr/bin/env bash

echo "this will be awesome"
echo "..."

echo "getting data from couchdb"
node getAllData.js

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


echo "\n\n all done, doing some cleanup"
cd olddata/ && rm -rf * && cd -

echo "\n bye bye"

