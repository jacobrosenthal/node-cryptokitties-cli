var cryptokittiesContrib = require("cryptokitties-contrib");
var ck = new cryptokittiesContrib();

var apiCall = function (argv){
  ck.listAuctions(type = "sale", status="open", limit=argv.limit, offset=0, orderBy="current_price", orderDirection=argv.order, search=argv.search)
  .then(function(arrayOfAuctions) {
    if(argv.pretty){
      arrayOfAuctions = arrayOfAuctions.map(prettyPrice);
    }
    console.log(JSON.stringify(arrayOfAuctions, null, 2))
  })
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
  apiCall
}
