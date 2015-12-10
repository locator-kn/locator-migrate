'use strict';

const fse = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/test22';

MongoClient.connect(url, function(err, db) {
    let collection = db.collection('userTest2');

    fse.readJson('./olddata/users.json', function (err, packageObj) {
        let transformedUsers = packageObj.map(elem => {
            delete elem._rev;
            delete elem.type;
            delete elem._attachments;
            return elem;
        });
        //console.log(transformedUsers)
        collection.insertMany(transformedUsers).then(succ => {
            console.log(succ);
            db.close()
        }).catch(err => {
            db.close()
            console.error(err);
        })

        //console.log(packageObj) // => 0.1.3
    });
});
