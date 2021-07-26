function convertToBestOffer() {
  var ret = getBestOffer();
  if(ret.success)
  {
    var best_coin = ret.offer.coin;
    Logger.log("Best offer is " + best_coin + " with " + ret.offer.estimate);
    convertAvailableBalanceToUsdt(best_coin);
    if(best_coin != "USDT")
      convertUsdtToBestCoin(best_coin);

    updateOfferForBestCoin(best_coin);
  }
  else
  {
    Logger.log("No good offer, wait for next run");
  }
}

function updateOfferForBestCoin(target_coin)
{
    var json_result = _get("spot_margin/lending_info");
    var data = JSON.parse(json_result);
    for(i = 0; i < data.result.length; i++)
    {
      var coin = data.result[i].coin;
      var size = data.result[i].lendable - data.result[i].locked;
      var min_rate = (data.result[i].minRate == null) ? 0.0000010045 : data.result[i].minRate;
      if(size > 0 && coin == target_coin)
      {
        updateOffering(data.result[i].coin, data.result[i].lendable, min_rate);
      }
    }
}

function convertUsdtToBestCoin(best_coin)
{
  var json_result = _get("spot_margin/lending_info");
  var data = JSON.parse(json_result);
  var convert_size = 0;

  for(i = 0; i < data.result.length; i++)
  {
    if(data.result[i].coin == "USDT")
    {
      convert_size = data.result[i].lendable - data.result[i].locked;
      var ret = convertTo("USDT", best_coin, convert_size);
      if(ret.success)
        updateConvertHistory(ret.result);
    }
  }
}

function convertAvailableBalanceToUsdt(target_coin)
{
    var json_result = _get("spot_margin/lending_info");
    var data = JSON.parse(json_result);

    // This section will convert all available balance of coins to USDT except USDT and target coin, which is the best offer. 
    for(i = 0; i < data.result.length; i++)
    {
      var coin = data.result[i].coin;
      var size = data.result[i].lendable - data.result[i].locked;

      if(size < 0.00000001) continue;
      if(coin == target_coin || coin == "USDT") continue;

      Logger.log("Try to convert " + size + " " + coin + " to USDT");
      var quote_result = getQuoteWithResult(coin + "/USDT");
      if(!quote_result.success) continue;
      var price = quote_result.result.price;
      var usdt_size = size * price;
      Logger.log(coin + " amount: " + size + ", USDT value: " + usdt_size);
      var ret = convertTo(coin, "USDT", size);
      if(ret.success)
        updateConvertHistory(ret.result);
      else
        Logger.log(ret.result);
    }
}

function updateConvertHistory(record)
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Convert History");
  var values = [ record ];

  sheet.insertRowAfter(1);
  Utilities.sleep(3000);
  SpreadsheetApp.flush();
  sheet.getRange("A2:I2").setValues(values);
}
