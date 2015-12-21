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
    fse.readJson('./olddata/userIdMapping.json', (err, userIdMappings) => {
        if (err) {
            console.error('pls create users first by running node transformers/user.js');
            throw err;
        }

        fse.readJson('./olddata/conversations.json', function (err, packageObj) {
            if(err) {
                console.error('pls split up documents first by running node index.js');
                throw err;
            }
            let conversationIds = [];

            packageObj.forEach(elem => {
                delete elem._rev;
                delete elem.type;

                conversationIds.push({oldId: elem._id});
                delete elem._id;

                delete elem[elem.user_1 + '_read'];
                delete elem[elem.user_2 + '_read'];
                //delete elem.create_date;

                elem.participants = [];
                userIdMappings.forEach(userObj => {
                    if (elem.user_1 === userObj.oldId) {
                        elem.user_1 = userObj.newId;
                    }
                    if (elem.user_2 === userObj.oldId) {
                        elem.user_2 = userObj.newId;
                    }
                });
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
                //console.log(succ);
                succ.insertedIds.forEach((id, idx) => {
                    conversationIds[idx].newId = id;
                });
                fse.writeJson('./olddata/conversationIdMapping.json', conversationIds, (err, data) => {
                    console.log(err || data);
                    db.close();
                });
            }).catch(err => {
                db.close();
                console.error(err);
            });
        });
    });
});


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
 {
 "_id": "012bb2568b1842959293402b06d3f998",
 "conversation_id": "012bb2568b1842959293402b06b42170",
 "from": "012bb2568b1842959293402b06b3681b",
 "message": "Pi pa Po",
 "timestamp": 1437494100931,
 "type": "text"
 }
 */