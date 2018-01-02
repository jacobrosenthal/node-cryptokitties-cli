#!/usr/bin/env node
var util = require('./util')

var argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('search', 'search and high level sort like the website', (yargs) => {
    yargs.positional('sort', {
      alias: 's',
      describe: 'Choose an option to sort by',
      choices: (["youngest", "oldest", "cheapest", "expensive", "likes"]),
      default: 'youngest'
    })
  }, (yargs)=>{
    //todo i dont love this, isnt there a way to get yargs to generate this?
    yargs=util.fixArgs(yargs)
    util.apiCall(yargs);
  })
  .command('api', 'low level api access', (yargs) => {
    yargs.positional('orderBy', {
      describe: 'Choose an option',
      choices: (["purr_count", "current_price", "age"]),
      default: 'current_price'
    })
    yargs.positional('orderDirection', {
      describe: 'Choose a direction',
      choices: (["desc", "asc"]),
      default: 'asc'
    })
  }, util.apiCall)
  .option('limit', {
    default: 20
  })
  .option('keywords', {
    default: ''
  })
  .option('pretty', {
    alias: 'p',
    default: false
  })
  .argv
