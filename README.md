# ftx_autolender
This project demonstrates how to implement an auto lender that could programmatically update offered size in a subaccount for all coins.

# preparation
- In FTX website, go to Profile -> Api to "CREATE API KEY" for your account. You could get YOUR_FTX_API_KEY and YOUR_FTX_SECRET here. 
- Create subaccount in your wallet with YOUR_SUBACCOUNT_NAME, e.g. AutoLend. 

# configuration
Replace below variable in configuration.gs. 
```javascript
FTX_API_KEY = 'YOUR_FTX_API_KEY';
FTX_SECRET = 'YOUR_FTX_SECRET';
FTX_SUBACCOUNT = 'YOUR_SUBACCOUNT_NAME';
BCH_THRESHOLD = 500;
MINIMUM_SIZE = 5;
```
# setup
1. In Google Apps Script, create a project and copy/paste all to your script. 
2. Add a hourly trigger to execute updateMaxOffering() function. 

# features
- When BCH price drop below BCH_THRESHOLD, it will convert available balance of USDT to BCH. If you don't want this feature, simply change BCH_THRESHOLD to 0 to disable it. 
- Set MINUMUM_SIZE to avoid buying size too small issue. 
