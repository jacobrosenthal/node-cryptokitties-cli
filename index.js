#!/usr/bin/env node
var util = require('./util')

var argv = require('yargs')
  .usage('Usage: $0 --order=asc --limit=5')
  .option('limit', {
    default: 20
  })
  .option('orderBy', {
    describe: 'Choose an option',
    choices: (["purr_count", "current_price", "age"]),
    default: 'current_price'
  })
  .option('orderDirection', {
    describe: 'Choose a direction',
    choices: (["desc", "asc"]),
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


if(argv.sort){
  console.log(argv.s);
}

util.apiCall(argv)
