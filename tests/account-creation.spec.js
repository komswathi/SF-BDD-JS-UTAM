
const loginPage = require('../pageObjects/login.page.js');
const accountCreationPage = require('../pageObjects/account.creation.page.js');

describe('utam-examples', () => {
  beforeEach(async () => {
    await loginPage.logInSalesforce();
  });

  it('navigate to the accounts tab in the sales app and create an account record', async () => {
    const testData = {
    accountData : {
      'Rating': 'Hot',
        'Account Name': 'UTAM Test Account',
        'Phone': '555-1234567',
        'Fax': '1234',
        'Account Number': '1234',
        'Website': 'test',
        'Account Site': 'test',
        'Ticker Symbol': 'test',
        'Type': 'Other',
        'Ownership': 'Public',
        'Industry': 'Banking',
        'Employees': '4',
        'Annual Revenue' : '2345',
        'SIC Code' : '1234567',
        'Customer Priority': 'Low',
        'SLA' : 'Silver',
        'SLA Expiration Date' : '',
        'SLA Serial Number': '123',
        'Number of Locations' : '4',
        'Upsell Opportunity' : 'No',
        'Active' : 'Yes',
        'Description': 'test'
    },
      addressData: {
        'Billing Country': 'United Kingdom',
        //'Billing Street' : 'test billing street',
        //'Billing City' : 'test billing city',
        //'Billing State/Province' : 'None',
        //'Billing Zip/Postal Code' : 'test billing zip',
        //'Shipping Country' : 'United Kingdom',
        //'Shipping Street' : 'test shipping street',
        //'Shipping City' : 'test shipping city',
        //'Shipping State/Province' : 'None',
        //'Shipping Zip/Postal Code' : 'test shipping zip'
    }
    };



    await loginPage.openAppLauncherAndChooseApp('Sales');
    let actualAppName = await loginPage.getAppContextName();
    expect(actualAppName).toEqual('Sales');
    await accountCreationPage.chooseAppNavBar('Accounts');
    await accountCreationPage.verifyAccountsSortedRecent();
    await accountCreationPage.createAccount(testData);
    await accountCreationPage.searchForAccount();
    await accountCreationPage.verifyAccountDisplay();
  });
});
