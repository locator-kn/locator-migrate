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

    let collection = db.collection('messages');
    fse.readJson('./olddata/userIdMapping.json', (err, userIdMappings) => {
        if (err) {
            throw err;
        }

        fse.readJson('./olddata/conversationIdMapping.json', (err, conversationIdMapping) => {
            if (err) {
                throw err;
            }

            fse.readJson('./olddata/messages.json', function (err, packageObj) {
                packageObj.forEach(elem => {
                    delete elem._rev;
                    delete elem.type;
                    delete elem._attachments;
                    delete elem.to;
                    delete elem.create_date;
                    delete elem._id;
                    userIdMappings.forEach(idObject => {
                        if (elem.from === idObject.oldId) {
                            elem.from = idObject.newId;
                        }
                    });

                    conversationIdMapping.forEach(idObject => {
                        if (elem.conversation_id === idObject.oldId) {
                            elem.conversation_id = idObject.newId;
                        }
                    });

                    elem.message_type = 'text';

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