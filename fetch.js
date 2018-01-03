var request = require('request');
var zlib = require('zlib');
var csv = require('csv-parser')
var level = require('level')
var through2 = require('through2')
var fs = require('fs');

const URL = 'http://assets.cryptokittydex.com.s3.amazonaws.com/data/'

var fetch = function(dateString,a,b){
  const DBNAME = dateString + '.db'
  if (fs.existsSync(DBNAME)) {
    return
  }

  //todo figure out when they update and only check in that timezone's 12:01
  //dont create db unless we get a file
  var db;
  var gunzip = zlib.createGunzip();

  request(URL + dateString + '.csv.gz')
  .on('response', function(response) {
    if (response.statusCode === 200){
      db = level(DBNAME, {valueEncoding: 'json'})
      return
    }
    console.log("downloading " + URL + dateString + '.csv.gz' + " failed")
    this.abort();
  })
  .pipe(gunzip)
  .on('error', function(err) {
  })
  .pipe(csv())
  .pipe(through2.obj(function (row, enc, callback) {
    db.put(parseInt(row.id), row, callback)
  }))
}

module.exports = fetch
