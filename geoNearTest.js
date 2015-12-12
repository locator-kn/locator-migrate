'use strict';
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/locator', (err, db) => {
    let collection = db.collection("locations");

    collection.ensureIndex({'geotag.coordinates':"2dsphere"}, (err, result) => {
        collection.geoNear(9.169668, 47.668771, {limit: 15, maxDistance: 1000, spherical: true}, (err, docs) => {
            console.log(err || docs.results);
            docs.results.forEach(elem => {
                console.log('distance:', elem.dis);
                console.log('location:', elem.obj.title);
                console.log('location:', elem.obj.geotag.coordinates);

            })
            db.close();
        });

    })
});
