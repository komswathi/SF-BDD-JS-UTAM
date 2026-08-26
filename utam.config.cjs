module.exports = {
  pageObjectsFileMask: ['force-app/**/__utam__/**/*.utam.json'],
  alias: {
    'utam-sfdx/': 'salesforce-utam-e2e-testing/',
    'utam-lightning/': 'salesforce-pageobjects/lightning/',
    'utam-records/': 'salesforce-pageobjects/records/',
    'utam-flexipage/': 'salesforce-pageobjects/flexipage/',
    'utam-record-flexipage/': 'salesforce-pageobjects/record/flexipage/'
  }
};
