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
    if(coin == "USDT")
    {
      if(convertToBCH)
      {
        var minimum_size = getMinimumSize();
        if(size > minimum_size)
        {
          var ret = convertTo("USDT", "BCH", size);
          if(ret.success)
          {
            updateConvertHistory(ret.result);
            updateNextDipValue();
          }
        }
        else
        {
          Logger.log("Convert size " + size + " is smaller than " + minimum_size + ", do nothing");
          updateOffering(data.result[i].coin, (data.result[i].lendable - BUY_SIZE_FOR_BCH), data.result[i].minRate);
        }
      }
      else
      {
        updateOffering(data.result[i].coin, data.result[i].lendable, data.result[i].minRate);
      }
    }
    else
    {
      if(size > 0 && data.result[i].minRate != null) 
        updateOffering(data.result[i].coin, data.result[i].lendable, data.result[i].minRate);
    }
  }
}

function updateNewLendingHistory()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("History");
  var dashboard = SpreadsheetApp.getActive().getSheetByName("Dashboard");
  var a2 = sheet.getRange("A2").getValue();
  if(!isValidDate(a2)) 
  {
    sheet.deleteRow(2);
    return;
  }
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

  dashboard.getRange("C4").setValue(getQuote("BCH/USDT"));
  dashboard.getRange("D4").setValue(getQuote("BNB/USDT"));
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

  return (bch_price < sheet.getRange("B1").getValue());
}

function updateNextDipValue()
{
  var sheet = SpreadsheetApp.getActive().getSheetByName("Configuration");
  var current_dip_price = sheet.getRange("B1").getValue();
  if( current_dip_price > 50)
    current_dip_price -= 50;
  sheet.getRange("B1").setValue(current_dip_price);

  Logger.log("Update next dip threshold to " + current_dip_price);
}


