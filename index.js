#!/usr/bin/env node
var cryptokittiesContrib = require("cryptokitties-contrib");
var ck = new cryptokittiesContrib();

var argv = require('yargs')
  .usage('Usage: $0 --order=asc --limit=5')
  .option('limit', {
    default: 20
  })
  .option('order', {
    default: 'asc'
  })
  .option('search', {
    default: ''
  })
  .option('pretty', {
    alias: 'p',
    default: false
  })
  .option('sort', {
    alias: 's',
    choices: ('s', ["youngest", "oldest", "cheapest", "expensive", "likes"]),
    default: ''
  })
  .argv

var toFloat = function(val){
  return val / 1000000000000000000;
}

var prettyPrice = function(obj, index, array){
  if(obj.start_price){
    obj.start_price = toFloat(obj.start_price)
  }
  if(obj.end_price){
    obj.end_price = toFloat(obj.end_price)
  }
  if(obj.current_price){
    obj.current_price = toFloat(obj.current_price)
  }
  return obj;
};

if(argv.sort){
  console.log(argv.s);
}

ck.listAuctions(type = "sale", status="open", limit=argv.limit, offset=0, orderBy="current_price", orderDirection=argv.order, search=argv.search)
.then(function(arrayOfAuctions) {

  if(argv.pretty){
    arrayOfAuctions = arrayOfAuctions.map(prettyPrice);
  }
  console.log(JSON.stringify(arrayOfAuctions, null, 2))
})

