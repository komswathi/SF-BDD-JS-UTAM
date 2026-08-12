@regression
Feature: Account Creation in Salesforce Sales App

  Background:
    Given I am logged into Salesforce

  @account
  Scenario: Create account record with full account and address details
#    When I open app launcher and choose "Sales"
#    Then app context should display "Sales"
    When I navigate to "Accounts" tab
    When I verify accounts are sorted by recent
    When I create account with following details
      | Rating | Account Name      | Phone       | Fax  | Account Number | Website | Account Site | Ticker Symbol | Type  | Ownership | Industry | Employees | Annual Revenue | SIC Code | Billing Country | Shipping Country | Billing Street | Shipping Street | Billing City | Shipping City | Billing Zip/Postal Code | Shipping Zip/Postal Code | Customer Priority | SLA    | SLA Serial Number | Number of Locations | Upsell Opportunity | Active | Description |
      | Hot    | UTAM Test Account | 555-1234567 | 1234 | 1234           | test    | test         | test          | Other | Public    | Banking  | 4         | 2345           | 1234567  | United Kingdom  | United Kingdom   | test           | test            | London       | London        | test                    | test                     | Low               | Silver | 123               | 4                   | No                 | Yes    | test        |
    When I search for the created account
    Then account should be displayed in the list


  @account1
  Scenario: Create account
    When I open app launcher and choose "Sales"
    Then app context should display "Sales"
    When I navigate to "Accounts" tab