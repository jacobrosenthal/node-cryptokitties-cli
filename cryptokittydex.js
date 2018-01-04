#!/usr/bin/env node
var fetch = require('./fetch')
var fs = require('fs');  // file system
var moment = require('moment-timezone');
var level = require('level')
var JSONStream = require('JSONStream')
var through2 = require('through2')
var concat = require('concat-stream')

var undoc1=[]
var undoc2=[]
var undoc3=[]
var mouth=['f','b','a','g'] //happygokitty, saycheese, pouty, soserious
var wild=['d','1'] //santa, dracula, note thesearent actually common, but.. im looking for something more rare and less chrerised currently
var color=['7','5']//kittencream, granitegrey
var patternColor=['7','9','f'] //royalpurple, swampgreen, chocolate
var bodyColor=['7'] //aquamarine
var eyeType=['7','8','k'] //crazy, thicccbrowz, raisedbrow
var eyeColor=['3','6','8'] //topaz, sizzurp, strawberry
var pattern=['a','g'] // luckystripe, totesbasic
var body=['e','d','f','c'] //sphynx, munchkin, ragamuffin, himalayan

locations = {};
Array.prototype.push.call(locations, undoc1);
Array.prototype.push.call(locations, undoc2);
Array.prototype.push.call(locations, undoc3);
Array.prototype.push.call(locations, mouth);
Array.prototype.push.call(locations, wild);
Array.prototype.push.call(locations, color);
Array.prototype.push.call(locations, patternColor);
Array.prototype.push.call(locations, bodyColor);
Array.prototype.push.call(locations, eyeType);
Array.prototype.push.call(locations, eyeColor);
Array.prototype.push.call(locations, pattern);
Array.prototype.push.call(locations, body);

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
  if(/(.)\1/.test(kai))
    return true;
  else return false
}

var countPures = function(kaiArry){
  return kaiArry.reduce(function(accumulator, currentValue){
    var r1d1 = currentValue.slice(2)
    if (kaiIsPure(r1d1)) {
      return accumulator + 1
    }else{
      return accumulator
    }
  }, 0)
}

var countRares = function(kaiArry){
  return kaiArry.reduce(function(accumulator, currentValue, idx){
    var r1d1 = currentValue.slice(2)
    if (kaiIsPure(r1d1) && !locations[idx].includes(r1d1[0])){
      return accumulator + 1
    }else{
      return accumulator
    }

  }, 0)
}

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
  }, function(yargs) {

    var db = level(getDateString() + '.db', {valueEncoding: 'json'})

    var stream = fs.createReadStream(__dirname + '/' + yargs.input).pipe(JSONStream.parse('*'))
    .pipe(through2.obj(function(auction, enc, cb){
      var self = this;
      db.get(auction.kitty.id, function(key,cryptokittydex){
        if(cryptokittydex){
          auction.cryptokittydex = cryptokittydex
          self.push(auction)
        }
        cb()
      })

    }))
    .pipe(through2.obj(function(auction, enc, cb){
      auction.cryptokittydex.genes_kai_array = split(auction.cryptokittydex.genes_kai)
      auction.cryptokittydex.purity = countPures(auction.cryptokittydex.genes_kai_array)
      auction.cryptokittydex.rarePures = countRares(auction.cryptokittydex.genes_kai_array)
      this.push(auction)
      cb();
    }))
    .pipe(through2.obj(function(auction,enc,cb){

      var passthrough = true

      // passthrough = passthrough && (auction.cryptokittydex.genes_kai_array[10].slice(2) == "dd")
      //                   && (auction.cryptokittydex.genes_kai_array[11].slice(2) == "bb")
      //                   && (auction.cryptokittydex.genes_kai_array[8].slice(3) == "i")
      //                   && (auction.cryptokittydex.genes_kai_array[3].slice(3) == "a")

      passthrough = passthrough && kaiIsPure(auction.cryptokittydex.genes_kai_array[0].slice(2))
                        || kaiIsPure(auction.cryptokittydex.genes_kai_array[1].slice(2))
                        || kaiIsPure(auction.cryptokittydex.genes_kai_array[4].slice(2))

      passthrough = passthrough && auction.current_price<=20000000000000000 //.02


      passthrough = passthrough  && (auction.kitty.status.cooldown_index-1 < 1)

      if(passthrough)
        this.push(auction)
      cb()



    }))
    .pipe(concat(function(results){

      // // sort by total purity traits
      // // results = results.sort((a,b)=> a.cryptokittydex.purity - b.cryptokittydex.purity)

      // // // sort by amount of rare pures
      // // results = results.sort((a,b)=> a.cryptokittydex.rarePures - b.cryptokittydex.rarePures)

      // sort by price
      results = results.sort((a,b)=> a.current_price - b.current_price)
      results = results.reverse()

      // translate price for printing
      results = results.map(prettyPrice);
      // results = results.map(prettyPure);

      results.forEach(function(auction){
        console.log("id:\t\t", auction.kitty.id)
        console.log("price:\t\t", auction.current_price)
        console.log("gen:\t\t", auction.kitty.generation)
        console.log("pures:\t\t", auction.cryptokittydex.purity)
        console.log("rarePure:\t", auction.cryptokittydex.rarePures)
        console.log("behbehs:\t", auction.kitty.status.cooldown_index-1)
        console.log("kai:\t\t", "\"uuuu uuuu uuuu mmmm wwww cccc pcpc cbcb eeee cece pppp bbbb\"")
        console.log("    \t\t", JSON.stringify(auction.cryptokittydex.genes_kai_array.join(" "), null, 2))

        console.log("----------------");
      })
      // console.log(JSON.stringify(results, null, 2))
    }))
  })
  .argv
