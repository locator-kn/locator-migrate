'use strict';
const fs = require('fs');
const request = require('request');

const wsAllDocs = fs.createWriteStream('./allData.json');

request.get('http://locator.in.htwg-konstanz.de:5984/app/_all_docs?include_docs=true').pipe(wsAllDocs);
