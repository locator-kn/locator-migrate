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

    let collection = db.collection('conversations');

    fse.readJson('./olddata/conversations.json', function (err, packageObj) {



        packageObj.forEach(elem => {
            delete elem._rev;
            delete elem.type;

            delete elem[elem.user_1 + '_read'];
            delete elem[elem.user_2 + '_read'];
            //delete elem.create_date;

            elem.participants = [];
            elem.participants.push({
                'user_id': elem.user_1,
                'last_read': 0
            });
            elem.participants.push({
                'user_id': elem.user_2,
                'last_read': 0
            });

            delete elem.user_1;
            delete elem.user_2;


        });


        collection.insertMany(packageObj).then(succ => {
            console.log(succ);
            db.close();
        }).catch(err => {
            db.close();
            console.error(err);
        });
    });
});




function replaceIllegalChars(string)
{
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
 {
 "_id": "012bb2568b1842959293402b06d3f998",
 "conversation_id": "012bb2568b1842959293402b06b42170",
 "from": "012bb2568b1842959293402b06b3681b",
 "message": "Pi pa Po",
 "timestamp": 1437494100931,
 "type": "text"
 }
 */