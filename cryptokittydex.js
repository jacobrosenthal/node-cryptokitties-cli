#!/usr/bin/env node
var util = require('./util')
var fetch = require('./fetch')
var fs = require('fs');  // file system
var moment = require('moment-timezone');
var level = require('level')

var getDateString = function(){
  // currently resolves to 52.216.163.59
  // https://ip-ranges.amazonaws.com/ip-ranges.json currnentlyappears to be us-east-1
  // https://docs.aws.amazon.com/general/latest/gr/rande.html North virginia
  // new available some time after 3am
  var timeEST = moment.tz(moment(), 'EST')
  if(timeEST.hours()>=4){
    return timeEST.format('YYYYMMDD')
  }else{
    return timeEST.subtract(1, 'd').format('YYYYMMDD')
  }
}

var split = function(kai){
  var pures = [];
  for(var i = 0; i<kai.length; i+=4){
    var purity = kai.substring(i,i+4)
    pures.push(purity)
  }
  return pures
}

var kaiIsPure = function(kai){
  return (/(.)\1/.test(kai))
}

var countPures = function(kaiArry){
  return kaiArry.reduce(function(accumulator, currentValue){
    if (kaiIsPure(currentValue.slice(2))) {
      return accumulator + 1
    }else{
      return accumulator
    }
  }, 0)
}

var join = async function(results){

    var db = level(getDateString() + '.db', {valueEncoding: 'json'})
    
    for(var i = 0; i<=results.length-1; i++){
      try {
        var auction = results[i]
        var cryptokittydex = await db.get(auction.kitty.id)
        if(cryptokittydex){
          cryptokittydex.genes_kai_array = split(cryptokittydex.genes_kai)
          cryptokittydex.purity = countPures(cryptokittydex.genes_kai_array)
          auction.cryptokittydex = cryptokittydex
        }
      }catch (NotFoundError) {}
    }
    return results
};

var yargs = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('fetch', 'fetch todays cryptokittydex (note: hundreds mbs)', (yargs) => {
  }, fetch.bind(null, getDateString()))
  .command('merge', 'fetch todays cryptokittydex (note: hundreds mbs)', (yargs) => {
    yargs.positional('sort', {
      alias: 'input',
      describe: 'an input json file from cli to run against cryptokittydex',
      default: ''
    })
  }, async function(yargs) {

	var results = require(__dirname + '/' + yargs.input);
	results = await join(results)

  results = results.filter(auction => {
  	if(auction.cryptokittydex)
  		return kaiIsPure(auction.cryptokittydex.genes_kai_array[4].slice(2))
  	return false
  })

  results = results.filter(auction => auction.cryptokittydex.genes_kai_array[4].slice(2) !== "dd");
  results = results.filter(auction => auction.cryptokittydex.genes_kai_array[4].slice(2) !== "11");
  results = results.filter(auction => auction.cryptokittydex.genes_kai_array[4].slice(2) !== "66");
  // results = results.filter(auction => auction.cryptokittydex.genes_kai_array[4].slice(2) !== "88");
  // results = results.filter(auction => auction.cryptokittydex.genes_kai_array[4].slice(2) !== "44");

  // results = results.sort((a,b)=> a.current_price - b.current_price)
  // results = results.reverse()

  results = results.sort((a,b)=> a.cryptokittydex.purity - b.cryptokittydex.purity)

  results = results.map(util.prettyPrice);

  results.forEach(function(auction){
    console.log("id: ", auction.kitty.id)
    console.log("price: ", auction.current_price)
    console.log("wild: ", auction.cryptokittydex.genes_kai_array[4])
    console.log("purity: ", auction.cryptokittydex.purity)
  })
  // console.log(JSON.stringify(results, null, 2))
  })
  .argv

