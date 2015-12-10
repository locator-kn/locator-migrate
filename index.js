'use strict';
const fs = require('fs');
const request = require('request');


const wsLocations = fs.createWriteStream('./olddata/locations.json');
const wsTrips = fs.createWriteStream('./olddata/trips.json');
const wsMessages = fs.createWriteStream('./olddata/messages.json');
const wsUsers = fs.createWriteStream('./olddata/users.json');
const wsConversations = fs.createWriteStream('./olddata/conversations.json');
const wsSchoenhiers = fs.createWriteStream('./olddata/schoenhiers.json');
const wsImage = fs.createWriteStream('./image.jpeg');


const allData = require('./allData.json');

console.log('total elements', allData.total_rows);
//console.log(allData.rows[0]);
console.time('locations filter');
wsLocations.on('error', function(err) { console.error(err); });
const locations = allData.rows.filter(elem => {
    let loc = elem.doc;
    return loc.type === 'location' && !loc.preLocation;
}).map(elem => {
    return elem.doc;
});

const prelocations = allData.rows.filter(elem => {
    let loc = elem.doc;
    return loc.type === 'location' && loc.preLocation;
}).map(elem => {
    return elem.doc;
});

const trips = allData.rows.filter(elem => {
    let trip = elem.doc;
    return trip.type === 'trip';
}).map(elem => {
    return elem.doc;
});

const messages = allData.rows.filter(elem => {
    let mess = elem.doc;
    return mess.type === 'message' && !mess.message.startsWith('Herzlich Willkommen im Chat von Locator') && !mess.message.startsWith('Übrigens:') && !mess.message.startsWith('Wenn du uns Feedback');
}).map(elem => {
    return elem.doc;
});

const conversations = allData.rows.filter(elem => {
    let conversation = elem.doc;
    return conversation.type === 'conversation'
}).map(elem => {
    return elem.doc;
});


const users = allData.rows.filter(elem => {
    let user = elem.doc;
    return user.type === 'user'
}).map(elem => {
    return elem.doc;
});


const schoenhiers = allData.rows.filter(elem => {
    let sh = elem.doc;
    return sh.type === 'schoenhiers'
}).map(elem => {
    return elem.doc;
});

const designDocs = allData.rows.filter(elem => {
    let sh = elem.doc;
    return sh._id.startsWith('_design');
}).map(elem => {
    return elem.doc;
});



wsLocations.write(JSON.stringify(locations));
wsLocations.end();

wsTrips.write(JSON.stringify(trips));
wsTrips.end();

wsMessages.write(JSON.stringify(messages));
wsMessages.end();

wsConversations.write(JSON.stringify(conversations));
wsConversations.end();

wsUsers.write(JSON.stringify(users));
wsUsers.end();


wsSchoenhiers.write(JSON.stringify(schoenhiers));
wsSchoenhiers.end();


request.get('https://locator-app.com/api/v1/locations/90dd0bb7f23c628dddf94ba236ed5e25/supertrip.jpeg').pipe(wsImage)

console.timeEnd('locations filter');
console.log('locations:', locations.length);
console.log('prelocations:', prelocations.length);
console.log('trips:', trips.length);
console.log('messages:', messages.length);
console.log('conversations:', conversations.length);
console.log('user:', users.length);
console.log('schoenhiers:', schoenhiers.length);
console.log('designDocs:', designDocs.length);

console.log('docs left:', allData.total_rows - (locations.length + prelocations.length + trips.length + messages.length + users.length + conversations.length + schoenhiers.length + designDocs.length), '(some of them might be the welcome messages)')