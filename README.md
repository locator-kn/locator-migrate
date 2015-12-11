# locator-migrate

this repo contains code to migrate the data for [locator-app.com](https://locator-app.com) from couchdb to mongodb.

## What to do?

The following assumes you have all documents downloaded from the current couchdb and named the result `allData.json`.

clone repo and cd into
```
git clone https://github.com/locator-kn/locator-migrate.git && cd $_
```

install dependencies
```
npm i
```

split up the data by type and do some cleanup

```
node index.js
```

now you should find the split up data in the `olddata` directory

now, you can run the files you want to have in your local mongo, eg.:
```
node transformer/user.js
```



### locations
```
   {
     "_id": "62b9a189b9fc4a957362b53ad425bc54",
     "userid": "62b9a189b9fc4a957362b53ad425224c",
     "preLocation": false,
     "create_date": "2015-07-25T11:23:44.734Z",
     "images": {
       "googlemap": "https://maps.googleapis.com/maps/api/staticmap?zoom=15&markers=48.0594021,8.464086899999984",
       "xlarge": "/api/v1/locations/566b560fafcf5db0c41f7111/mauritius.jpeg",
       "large": "/api/v1/locations/566b560fafcf5db0c41f7113/mauritius.jpeg",
       "normal": "/api/v1/locations/566b560fafcf5db0c41f7115/mauritius.jpeg",
       "small": "/api/v1/locations/566b560fafcf5db0c41f7117/mauritius.jpeg"
     },
     "modified_date": "2015-07-25T11:26:33.448Z",
     "tags": [
       "Cocktails",
       "Essen",
       "Abschalten",
       "Schwenningen"
     ],
     "title": "Mauritius",
     "description": "Ein Ort um mit Freunden abzuschalten und den Tag am besten zu beenden. Mit Cocktails und eine große Auswahl von Essen.",
     "city": {
       "title": "Villingen-Schwenningen, Deutschland",
       "place_id": "ChIJeXNc6WaWkEcRoInfpbdrHwQ",
       "id": "ChIJeXNc6WaWkEcRoInfpbdrHwQ"
     },
     "geotag": {
       "type": "Point",
       "coordinates": [
         8.464086899999984,
         48.0594021
       ]
     },
     "delete": false,
     "public": true
   }
```