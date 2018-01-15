var cryptokittiesContrib = require("cryptokitties-contrib");
var ck = new cryptokittiesContrib();
const MAX = 20


//TODO this request call is probably not written correctly 
var getCurrentPrice = function() {
  return request({
      method: "GET",
      uri: " https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
      json: true,
      orderBy,
      orderDirection,
      type,
      status,
      limit,
      offset,
      search
    }).then(thing=>thing.USD);
}

var prettify = async function(argv, results) {
  var price = await getCurrentPrice();

  for (i=0; i<results.length; i++){
    results[i] = prettyPrice(results[i], price)
  }
}

var apiCall = async function (argv){
  var results =[];
  for(var i = 0; i<= Math.floor(argv.limit/MAX); i++) {
    var offset = i*MAX
    var limit = (offset+MAX>argv.limit) ? (argv.limit % MAX) : MAX
    var set = await ck.listAuctions(type = "sale", status="open", limit=limit, offset=offset, orderBy=argv.orderBy, orderDirection=argv.orderDirection, search=argv.keywords)
    results = results.concat(set)
    var delay = await new Promise((resolve) => setTimeout(resolve, 2500))
  }

  if(argv.pretty){
    results = prettify(argv, results)
  }
  console.log(JSON.stringify(results, null, 2))
  return results
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


var prettyPrice = function(obj, price){

  if(obj.start_price){
    obj.start_price = toFloat(obj.start_price) * price
  }
  if(obj.end_price){
    obj.end_price = toFloat(obj.end_price)  * price
  }
  if(obj.current_price){
    obj.current_price = toFloat(obj.current_price)  * price
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
