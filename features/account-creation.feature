@regression
Feature: Account Creation in Salesforce Sales App

  Background:
    Given I am logged into Salesforce

  @account
  Scenario: Create account record with full account and address details
    When I open app launcher and choose "Sales"
    Then app context should display "Sales"
    When I navigate to "Accounts" tab
    When I verify accounts are sorted by recent
    When I create account with following details
      | Field                    | Value                |
      | Rating                   | Hot                  |
      | Account Name             | UTAM Test Account    |
      | Phone                    | 555-1234567          |
      | Fax                      | 1234                 |
      | Account Number           | 1234                 |
      | Website                  | test                 |
      | Account Site             | test                 |
      | Ticker Symbol            | test                 |
      | Type                     | Other                |
      | Ownership                | Public               |
      | Industry                 | Banking              |
      | Employees                | 4                    |
      | Annual Revenue           | 2345                 |
      | SIC Code                 | 1234567              |
      | Customer Priority        | Low                  |
      | SLA                      | Silver               |
      | SLA Serial Number        | 123                  |
      | Number of Locations      | 4                    |
      | Upsell Opportunity       | No                   |
      | Active                   | Yes                  |
      | Description              | test                 |
      | Billing Country          | United Kingdom       |
    When I search for the created account
    Then account should be displayed in the list


  @account1
  Scenario: Create account
    When I open app launcher and choose "Sales"
    Then app context should display "Sales"
    When I navigate to "Accounts" tab