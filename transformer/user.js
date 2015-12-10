'use strict';

const fse = require('fs-extra');
const request = require('request');
const Grid = require('gridfs-stream');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

var databaseInstance = {}

const url = 'mongodb://localhost:27017/test22';

MongoClient.connect(url, function(err, db) {
    databaseInstance = db;

    let collection = db.collection('userTest2');

    fse.readJson('./olddata/users.json', function (err, packageObj) {
        let transformedUsers = [];
        packageObj.forEach(elem => {
            delete elem._rev;
            delete elem.type;
            delete elem._attachments;

            transformedUsers.push(elem);
        });

        insertImageAndDecorateObject(packageObj, 0, packageObj.length, newUser => {

            console.log('packageObj', packageObj[0]);
            return;
        });
        return
        //console.log(transformedUsers)
        collection.insertMany(transformedUsers).then(succ => {
            console.log(succ);
            db.close();
        }).catch(err => {
            db.close();
            console.error(err);
        });

        //console.log(packageObj) // => 0.1.3
    });
});


function insertImageAndDecorateObject(arr, idx, maxlength, callback) {

    let user = arr[idx];

    let gfs = Grid(databaseInstance, mongo);

    let writestream = gfs.createWriteStream({
        filename: 'profile.jpeg'
    });

    console.log('user.picture:', user.picture);

    let imgPath = user.picture || '';
    if (!imgPath.length || imgPath.startsWith('http')) {
        console.log('skipping, no image to upload');
        idx++;
        return insertImageAndDecorateObject(arr, idx, maxlength, callback);

    } else {
        imgPath = 'https://locator-app.com' + user.picture;
    }

    console.log('streaming img:', imgPath);

    request.get(imgPath).pipe(writestream);


    writestream.on('close', function (file) {
        // do something with `file`
        console.log('fileid', file._id);
        arr[idx].profile = '/api/v1/users/' + file._id + '/profile.jpeg';
        if(idx >= maxlength - 1) {
            console.log('done with streaming');
            return callback(arr);
        }
        idx++;
        return insertImageAndDecorateObject(arr, idx, maxlength, callback);
    });


    writestream.on('error', function (file) {
        console.log('An error occurred!', err);
        throw err;
    });

}