function updateMaxOffering()
{
  if(!isUpdateMaxOffering()) return;

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
      var minimum_size = getMinimumSize();
      if(size > minimum_size)
        convertTo("USDT", "BCH", size);
      else
        Logger.log("Convert size " + size + " is smaller than " + MINIMUM_SIZE + ", do nothing");
    }
    else
    {
      if(size > 0 && data.result[i].minRate != null) 
        updateOffering(data.result[i].coin, data.result[i].lendable, data.result[i].minRate);
      else
        Logger.log("Size is " + size + ", do nothing");
    }
  }
}

function updateNewLendingHistory()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("History");
  var a2 = sheet.getRange("A2").getValue();
  if(!isValidDate(a2)) return;

  var start_time = (new Date(sheet.getRange("A2").getValue()).getTime() + 1000)/1000;
  var params = "start_time="+start_time;
  var json_result = _get("spot_margin/lending_history", null, params);
  Logger.log(json_result);

  var data = JSON.parse(json_result).result;

  for(i = 0; i < data.length; i++)
  {
    var new_time = new Date(data[i].time);
    var coin = data[i].coin;
    var size = data[i].size;
    var rate = data[i].rate * 24 * 365;
    var proceeds = data[i].proceeds;
    var values = [
      [new_time, coin, size, rate, proceeds]
    ];

    sheet.insertRowAfter(1);
    sheet.getRange("A2:E2").setValues(values);
    
    sheet.getRange("A2").setHorizontalAlignment("left");
    sheet.getRange("B2").setHorizontalAlignment("left");
    sheet.getRange("C2").setHorizontalAlignment("right");
    sheet.getRange("D2").setHorizontalAlignment("right");
    sheet.getRange("D2").setNumberFormat("0.00%");
    sheet.getRange("E2").setHorizontalAlignment("right");
  }
}

function getMinimumSize()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Configuration");
  var sheet_minimum_size = sheet.getRange("B3").getValue();

  return (MINIMUM_SIZE < sheet_minimum_size) ? MINIMUM_SIZE : sheet_minimum_size;
}

function isUpdateMaxOffering()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Configuration");
  var sheet_update_max_offering = sheet.getRange("B4").getValue();
  if(UPDATE_OFFERING == 0 || sheet_update_max_offering == 0)
    return false;
  return true;
}

function isConvertToBCH()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Configuration");
  var now = new Date();
  var bch_price = getQuote("BCH/USDT");
  sheet.getRange("B2").setValue(bch_price);
  sheet.getRange("E1").setValue("Data were last updated at " + Utilities.formatDate(now, "GMT+8", "yyyy-MM-dd HH:mm:ss"));

  return (bch_price < sheet.getRange("B1").getValue() || bch_price < BCH_THRESHOLD);
}

function getQuote(name)
{
  var json_result = _get("markets/" + name);
  // Logger.log(json_result);
  var quote = JSON.parse(json_result).result;
  return quote.price;
}

function getBestOffers()
{
  var json_result = _get("spot_margin/lending_rates");
  var data = JSON.parse(json_result);

  var rateinfos = data.result;
  for(i = 0; i < rateinfos.length; i++)
  {
    var coin = rateinfos[i].coin;
    var previous = rateinfos[i].previous * 24 * 365;
    var estimate = rateinfos[i].estimate * 24 * 365;

    if(estimate > MINIMUM_RATE)
      Logger.log("coin: " + coin + ", prev rate: " + previous + ", next rate: " + estimate);
  }
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
