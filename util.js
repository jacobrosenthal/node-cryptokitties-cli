var cryptokittiesContrib = require("cryptokitties-contrib");
var ck = new cryptokittiesContrib();

var apiCall = function (argv){
  ck.listAuctions(type = "sale", status="open", limit=argv.limit, offset=0, orderBy=argv.orderBy, orderDirection=argv.orderDirection, search=argv.keywords)
  .then(function(arrayOfAuctions) {
    if(argv.pretty){
      arrayOfAuctions = arrayOfAuctions.map(prettyPrice);
    }
    console.log(JSON.stringify(arrayOfAuctions, null, 2))
  })
}

var coerceSort = function(argv){
  switch(argv.sort){
    case 'youngest':
      argv.orderDirection = "desc";
      argv.orderBy = "";
      break;
    case 'oldest':
      argv.orderDirection = "asc";
      argv.orderBy = "";
      break;
    case 'cheapest':
      argv.orderDirection = "asc";
      argv.orderBy = "current_price";
      break;
    case 'expensive':
      argv.orderDirection = "desc";
      argv.orderBy = "current_price";
      break;
    case 'likes':
      argv.orderDirection = "desc";
      argv.orderBy = "purr_count";
      break;
    default:
      throw new Error("Bad sort option - landed in swtich default")
  }
  console.log(argv)
  return argv
}

var coerceOrderBy = function(argv){
  if(argv.orderBy === 'age'){
    argv.orderBy = "";
  }
}

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

module.exports = {
  prettyPrice,
  toFloat,
  coerceOrderBy,
  coerceSort,
  apiCall
}
