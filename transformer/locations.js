'use strict';

const fse = require('fs-extra');
const request = require('request');
const Grid = require('gridfs-stream');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

var databaseInstance = {};

const url = 'mongodb://localhost:27017/locator';

MongoClient.connect(url, function (err, db) {
    databaseInstance = db;

    let collection = db.collection('locations');

    fse.readJson('./olddata/locations.json', function (err, packageObj) {
        let transformedUsers = [];
        packageObj.forEach(elem => {
            delete elem._rev;
            delete elem.type;
            delete elem._attachments;

            transformedUsers.push(elem);
        });

        insertImageAndDecorateObject(packageObj, 0, packageObj.length, newUser => {

            collection.insertMany(newUser).then(succ => {
                console.log(succ);
                db.close();
            }).catch(err => {
                db.close();
                console.error(err);
            });
        });
    });
});


function insertImageAndDecorateObject(arr, idx, maxlength, callback) {

    let user = arr[idx];

    console.log('user.picture:', user.picture);

    let imgPath = user.picture || '';
    if (!imgPath.length || imgPath.startsWith('http')) {
        console.log('skipping, no image to upload');
        idx++;
        return insertImageAndDecorateObject(arr, idx, maxlength, callback);

    } else {
        // TODO use maximum image size
        imgPath = 'https://locator-app.com' + user.picture + '';
    }

    console.log('streaming img:', imgPath);


    let gfs = Grid(databaseInstance, mongo);

    let writestream = gfs.createWriteStream({
        filename: 'profile.jpeg'
    });
    request.get(imgPath).pipe(writestream);


    writestream.on('close', function (file) {
        // do something with `file`
        console.log('fileid', file._id);
        arr[idx].picture = '/api/v1/users/' + file._id + '/profile.jpeg';
        if (idx >= maxlength - 1) {
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

/*
    let location = {
        "_id": "012bb2568b1842959293402b06c98e15",
        "_rev": "10-635f9c7df3c2dec7fa6ded84e842d5da",
        "type": "location",
        "userid": "89e09a2739e6ca2d544e779fbdc62693",
        "preLocation": false,
        "create_date": "2015-07-21T15:21:48.252Z",
        "images": {
            "picture": "/api/v1/locations/012bb2568b1842959293402b06c98e15/supertrip.jpeg",
            "googlemap": "https://maps.googleapis.com/maps/api/staticmap?zoom=15&markers=48.269733,7.721381999999949"
        },
        "modified_date": "2015-11-30T15:44:49.025Z",
        "tags": [
            "Europa",
            "Freizeitpark",
            "spaß",
            "achterbahn",
            "rust",
            "kindheitserinnerungen"
        ],
        "title": "Europa Park",
        "description": "Schönen Tag im Europa Park verbringen!",
        "city": {
            "title": "Rust, Deutschland",
            "place_id": "ChIJrR6otoE5kUcRIIbfpbdrHwQ",
            "id": "ChIJrR6otoE5kUcRIIbfpbdrHwQ"
        },
        "geotag": {
            "long": 7.721381999999949,
            "lat": 48.269733
        },
        "delete": false,
        "public": true,
        "schoenhiers": 0,
        "_attachments": {
            "mobileThumb": {
                "content_type": "image/jpeg",
                "revpos": 7,
                "digest": "md5-i1vDIBawl8bseJgBEpg8tA==",
                "length": 9333,
                "stub": true
            },
            "small": {
                "content_type": "image/jpeg",
                "revpos": 6,
                "digest": "md5-7JF+FvDrrdAwW1NupKf03w==",
                "length": 42130,
                "stub": true
            },
            "max": {
                "content_type": "image/jpeg",
                "revpos": 5,
                "digest": "md5-gPoWz1EXU47fBwtbE5hGJw==",
                "length": 424787,
                "stub": true
            },
            "mobile": {
                "content_type": "image/jpeg",
                "revpos": 4,
                "digest": "md5-DY1sSnjNjlni32b7ETBt7Q==",
                "length": 89601,
                "stub": true
            },
            "mid": {
                "content_type": "image/jpeg",
                "revpos": 2,
                "digest": "md5-PU19Ud0MqYuhRU6SLIGl0A==",
                "length": 121291,
                "stub": true
            }
        }
    }


    // first long, then lat!!
    var point = { type: "Point", coordinates: [ 40, 5 ] }
*/