# ftx_autolender
This project demonstrate how to implement an auto lender that could programmatically update offered size in a subaccount for all coins.

# preparation
- In FTX website, go to Profile -> Api to "CREATE API KEY" for your account. You could get YOUR_FTX_API_KEY and YOUR_FTX_SECRET here. 
- Create subaccount in your wallent with YOUR_SUBACCOUNT_NAME, e.g. AutoLend. 

# configuration
Replace below variable at the begining of ftx_autolender.gs. 
FTX_API_KEY = 'YOUR_FTX_API_KEY';
FTX_SECRET = 'YOUR_FTX_SECRET';
FTX_SUBACCOUNT = 'YOUR_SUBACCOUNT_NAME';

# setup
1. In Google Apps Script, create a project and copy/paste all to your script. 
2. Add a hourly trigger to execute updateMaxOffering() function. 

