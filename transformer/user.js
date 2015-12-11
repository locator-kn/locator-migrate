'use strict';

const fse = require('fs-extra');
const request = require('request');
const Grid = require('gridfs-stream');
const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

var databaseInstance = {};

const url = 'mongodb://localhost:27017/locator';

MongoClient.connect(url, (err, db) => {
    databaseInstance = db;

    let collection = db.collection('users');

    fse.readJson('./../olddata/users.json', (err, packageObj) => {

        if (err) {
            console.log('Error reading user files', err);
            throw err;
        }
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


var insertImageAndDecorateObject = (arr, idx, maxlength, callback)=> {

    let user = arr[idx];

    console.log('user.picture:', user.picture);

    let imgPath = user.picture || '';
    let thumbPath = '';
    let ext = '';
    if (!imgPath.length || imgPath.startsWith('http')) {
        console.log('skipping, no image to upload');
        idx++;
        return insertImageAndDecorateObject(arr, idx, maxlength, callback);

    } else {
        imgPath = 'https://locator-app.com' + user.picture;
        thumbPath = 'https://locator-app.com' + user.picture + '?size=userThumb';
        ext = user.picture.split('.')[1];
    }

    console.log('streaming img:', imgPath);


    let gfs = Grid(databaseInstance, mongo);

    let writestream = gfs.createWriteStream({
        filename: 'profile.' + ext
    });

    // get normal picture
    request.get(imgPath).pipe(writestream);


    writestream.on('close', file => {
        // do something with `file`
        console.log('picture streamed successful', file._id);
        arr[idx].picture = '/api/v1/users/' + file._id + '/profile.' + ext;


        // stream thumbnail picture
        let thumbwritestream = gfs.createWriteStream({
            filename: 'profileThumb.' + ext
        });
        request.get(thumbPath).pipe(thumbwritestream);


        thumbwritestream.on('close', file => {
            console.log('thumb streamed successful', file._id);

            arr[idx].thumb = '/api/v1/users/' + file._id + '/profileThumb.' + ext;

            if (idx >= maxlength - 1) {
                console.log('done with streaming');
                return callback(arr);
            }
            idx++;
            return insertImageAndDecorateObject(arr, idx, maxlength, callback);
        });

        thumbwritestream.on('error', err => {
            console.log('Error streaming thumb in database', err);
            throw err;
        })
    });


    writestream.on('error', err => {
        console.log('Error streaming picture in database', err);
        throw err;
    });

};