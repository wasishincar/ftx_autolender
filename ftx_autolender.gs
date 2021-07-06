function updateMaxOffering()
{
  var convertToBCH = isConvertToBCH();
  var json_result = _get("spot_margin/lending_info");
  var data = JSON.parse(json_result);
  
  Logger.log(json_result);

  for(i = 0; i < data.result.length; i++)
  {
    var coin = data.result[i].coin;
    var size = data.result[i].lendable - data.result[i].locked;
    if(coin == "USDT" && convertToBCH)
    {
      if(size > MINIMUM_SIZE)
        convertTo("USDT", "BCH", size);
      else
        Logger.log("Convert size too small, do nothing");
    }
    else
    {
      if(size > 0 && data.result[i].minRate != null)
      {    
        updateOffering(data.result[i].coin, data.result[i].lendable, data.result[i].minRate);
      }
    }
  }
}

function isConvertToBCH()
{
  var bch_price = getQuote("BCH/USDT");

  return (bch_price < BCH_THRESHOLD);
}

function getQuote(name)
{
  var json_result = _get("/markets/" + name);
  // Logger.log(json_result);
  var quote = JSON.parse(json_result).result;
  return quote.price;
}

function updateOffering(coin, size, rate)
{
  Logger.log("Update offers for " + coin);
  var payload = 
  {
    "coin": coin,
    "size": size,
    "rate": rate
  }
  _post("spot_margin/offers", payload);
}

function convertTo(fromCurrency, toCurrency, size)
{
  Logger.log("Convert from " + size + " " + fromCurrency + " to " + toCurrency);
  var payload = 
  {
    "fromCoin": fromCurrency,
    "toCoin": toCurrency,
    "size": size
  }
  var json_result = _post("otc/quotes", payload);
  Logger.log(json_result);
  var quote = JSON.parse(json_result);
  var quoteId = quote.result.quoteId;
  json_result = _get("otc/quotes/" + quoteId);
  Logger.log(json_result);
  json_result = _post("otc/quotes/"+ quoteId + "/accept");
}


