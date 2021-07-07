function _get(url_api, content = null, params = null) {
  try {
    var url = FTX_END_POINT + url_api;
    var now = new Date();

    var payload = now.getTime() + "GET/api/" + url_api;
    if (params)
    {
      url += "?" + encodeURI(params);
      payload += "?" + encodeURI(params);
    }
    if (content)
      payload += content;
    
    var encodedPayload = encodeURI(payload);
    var encodedSecret = encodeURI(FTX_SECRET);

    var signature = Utilities.computeHmacSha256Signature(encodedPayload, encodedSecret).reduce(function (str, chr) {
      chr = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr.length == 1 ? '0' : '') + chr;
    }, '');

    var options = {
      "method": "GET",
      "headers": {
        "FTX-KEY": FTX_API_KEY,
        "FTX-SIGN": signature,
        "FTX-TS": String(now.getTime()),
        "FTX-SUBACCOUNT" : FTX_SUBACCOUNT
      },
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var json = response.getContentText();

    return json;
  }
  catch (e) {
    Logger.log(e);
    return "Error";
  }
}

function _post(url_api, content)
{
  try {
    var url = FTX_END_POINT + url_api;
    var now = new Date();

    var payload = now.getTime() + "POST/api/" + url_api;
    
    if (content)
      payload += JSON.stringify(content);
    var encodedSecret = encodeURI(FTX_SECRET);

    var signature = Utilities.computeHmacSha256Signature(payload, encodedSecret).reduce(function (str, chr) {
      chr = (chr < 0 ? chr + 256 : chr).toString(16);
      return str + (chr.length == 1 ? '0' : '') + chr;
    }, '');

    var options = {
      "Auth" : true,
      "method": "POST",
      "headers": {
        "FTX-KEY": FTX_API_KEY,
        "FTX-SIGN": signature,
        "FTX-TS": String(now.getTime()),
        "FTX-SUBACCOUNT" : FTX_SUBACCOUNT
      },
      "contentType" : "application/json",
      "payload" : JSON.stringify(content)
    };

    var response = UrlFetchApp.fetch(FTX_END_POINT + url_api, options);

    if(response.getResponseCode() == 200)
    {
      var json = response.getContentText();

      Logger.log("result: " + json);
      return json;
    }

    Logger.log("result: something wrong")
    return "Error";
  }
  catch (e) {
    Logger.log(e);
    return "Error";
  }
}
