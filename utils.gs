function isValidDate(d) {
  if ( Object.prototype.toString.call(d) !== "[object Date]" )
    return false;
  return !isNaN(d.getTime());
}

function isFavoriteCoin(coin)
{
  var favoriteCoins = FAVORITE_COINS.filter(element => element == coin);
  if(favoriteCoins.length == 0)
    return false;
  return true;
}

function getPositions()
{
  var json_result = _get("spot_margin/lending_info");
  Logger.log(json_result);
}

function getQuote(name)
{
  var json_result = _get("markets/" + name);
  // Logger.log(json_result);
  var quote = JSON.parse(json_result).result;
  return quote.price;
}

function getQuoteWithResult(name)
{
  var json_result = _get("markets/" + name);
  var result = JSON.parse(json_result);
  return result;
}

function getBestOffer()
{
  var json_result = _get("spot_margin/lending_rates");
  var data = JSON.parse(json_result);
  var offers = new Array();
  var bestEstimate = 0;
  var bestOffer;
  var bFindBestOffer = false;

  var rateinfos = data.result;
  for(i = 0; i < rateinfos.length; i++)
  {
    var coin = rateinfos[i].coin;
    var previous = rateinfos[i].previous * 24 * 365;
    var estimate = rateinfos[i].estimate * 24 * 365;
    if(estimate > MINIMUM_RATE && isFavoriteCoin(coin))
    {
      Logger.log("coin: " + coin + ", prev rate: " + previous + ", next rate: " + estimate);
      var offer = {
        "coin": coin,
        "previous": previous,
        "estimate": estimate
      }
      offers.push(offer);
      if(estimate > bestEstimate)
      {
        bestEstimate = estimate;
        bestOffer = offer;
        bFindBestOffer = true;
      }
    }
  }

  return { "success": bFindBestOffer, "offer": bestOffer};
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
  
  while(true)
  {
    var json_result = _post("otc/quotes", payload);
    var convert_record = [];
    Logger.log(json_result);
    var quote = JSON.parse(json_result);
    if(!quote.success) break;
    var quoteId = quote.result.quoteId;
    json_result = _get("otc/quotes/" + quoteId);
    Logger.log(json_result);
    var quoteResult = JSON.parse(json_result);
    if(!quoteResult.success) break;
    json_result = _post("otc/quotes/"+ quoteId + "/accept");
    var acceptResult = JSON.parse(json_result);
    if(!acceptResult.success) break;

    // Record convert result here. 
    convert_record.push(new Date(String(acceptResult.result.fill.time)));
    convert_record.push(quoteResult.result.fromCoin);
    convert_record.push(quoteResult.result.toCoin);
    convert_record.push(quoteResult.result.cost);
    convert_record.push(quoteResult.result.proceeds);
    convert_record.push(quoteResult.result.price);
    convert_record.push(acceptResult.result.fill.feeRate);
    convert_record.push(acceptResult.result.fill.fee);
    convert_record.push(acceptResult.result.fill.feeCurrency);

    return { "success": true, "result": convert_record};
  }

  return { "success": false, "result": "Something went wrong during convertion"};
}

function getMinimumSize()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Configuration");
  var sheet_minimum_size = sheet.getRange("B3").getValue();

  return (MINIMUM_SIZE < sheet_minimum_size) ? MINIMUM_SIZE : sheet_minimum_size;
}
