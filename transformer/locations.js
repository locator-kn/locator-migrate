'use strict';

const fse = require('fs-extra');
const request = require('request');
const Grid = require('gridfs-stream');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const sanitize = require("sanitize-filename");


var databaseInstance = {};

const url = 'mongodb://localhost:27017/locator';

MongoClient.connect(url, function (err, db) {
    databaseInstance = db;

    let collection = db.collection('locations');

    fse.readJson('./olddata/userIdMapping.json', (err, userIdMappings) => {
        if (err) {
            throw err;
        }

        fse.readJson('./olddata/locations.json', function (err, packageObj) {
            let transformedUsers = [];
            packageObj.forEach(elem => {
                delete elem._rev;
                delete elem.type;
                delete elem._attachments;

                // lets get a new id by mongodb
                delete elem._id;

                // rewrite old userid with new one
                // the userid property has been renamed from userid to user_id
                userIdMappings.forEach(idObject => {
                    if(elem.userid === idObject.oldId) {
                        delete elem.userid;
                        elem.user_id = idObject.newId;
                    }
                });
                // create empty array for upcomming categories
                elem.categories = [];

                // rename schoenhiers to favorites
                elem.favorites = elem.schoenhiers || 0;
                delete elem.schoenhiers;

                transformedUsers.push(elem);
            });

            insertImageAndDecorateObject(packageObj, 0, 5, newLocations => {
                newLocations.forEach(location => {
                    delete location.images.picture;
                    location.geotag = {type: "Point", coordinates: [location.geotag.long, location.geotag.lat]}
                });
                collection.insertMany(newLocations).then(succ => {
                    console.log(succ);
                    db.close();
                }).catch(err => {
                    db.close();
                    console.error(err);
                });
            });
        });
    });
});


var insertImageAndDecorateObject = (arr, idx, maxlength, callback)=> {
    if (idx >= maxlength) {
        console.log('all images streamed', arr[0].images);

        return callback(arr);
    }

    let location = arr[idx];

    let filenameFromTitle = replaceIllegalChars(sanitize(location.title));

    let base = location.images.picture || '';
    let xlargePath = '';
    let largePath = '';
    let normalPath = '';
    let smallPath = '';
    let ext = '';
    if (!base.length || base.startsWith('http')) {
        console.log('skipping, no image to upload');
        idx++;
        return insertImageAndDecorateObject(arr, idx, maxlength, callback);

    } else {
        let basePath = 'https://locator-app.com' + base;
        xlargePath = basePath + '?size=max';
        largePath = basePath + '?size=mid';
        normalPath = basePath + '?size=small';
        smallPath = basePath + '?size=mobileThumb';
        ext = location.images.picture.split('.')[1];
    }

    streaming(filenameFromTitle, ext, xlargePath, arr, idx, maxlength, 'xlarge')
        .then((newArray) => {
            return streaming(filenameFromTitle, ext, largePath, newArray, idx, maxlength, 'large')
        })
        .then((newArray) => {
            return streaming(filenameFromTitle, ext, normalPath, newArray, idx, maxlength, 'normal')
        })
        .then((newArray) => {
            return streaming(filenameFromTitle, ext, smallPath, newArray, idx, maxlength, 'small')
        })
        .then((newArray) => {
            idx++;
            return insertImageAndDecorateObject(newArray, idx, maxlength, callback);
        });

};

function streaming(filenameFromTitle, ext, path, arr, idx, maxlength, objectPropertyName) {
    return new Promise((resolve, reject) => {

        let gfs = Grid(databaseInstance, mongo);

        let fullFileName = filenameFromTitle + ext;

        // stream picture
        let largewritestream = gfs.createWriteStream({
            filename: fullFileName
        });
        console.time(fullFileName + ' (' + objectPropertyName + ')');
        request.get(path).pipe(largewritestream);


        largewritestream.on('close', file => {

            console.log('size:', objectPropertyName);
            console.timeEnd(fullFileName + ' (' + objectPropertyName + ')');
            //console.log(fullFileName, 'streamed successful', file._id);

            arr[idx].images[objectPropertyName] = '/api/v1/locations/' + file._id + '/' + filenameFromTitle + ext;

            return resolve(arr);
        });

        largewritestream.on('error', err => {
            console.log('Error streaming thumb in database', err);
            throw err;
        });
    });
}

function replaceIllegalChars(string) {
    let value = string.toLowerCase();
    value = value.replace(/ä/g, 'ae');
    value = value.replace(/ö/g, 'oe');
    value = value.replace(/ü/g, 'ue');
    value = value.replace(/ß/g, 'ss');
    value = value.replace(/&/g, 'und');
    value = value.replace(/'/g, '');
    value = value.replace(/\(/g, '_');
    value = value.replace(/\)/g, '_');
    value = value.replace(/ /g, '_');
    return value + '.';
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