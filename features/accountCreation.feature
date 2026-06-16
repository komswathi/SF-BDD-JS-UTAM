Feature: Salesforce Account Creation via UTAM

  Background:
    Given I logged into Salesforce as "DEVELOPER_USER"

  @test
  Scenario: Create account in Sales app via app launcher
    When I open app launcher and search for "Sales" app
    Then I verify that the app context switches to "Sales"
#    When I navigate to Accounts tab
#    Then recently viewed list displays
#    When I click New account
#    When I fill Account Information
#      | Rating | Account Name      | Phone       | Fax  | Account Number | Website | Account Site | Ticker Symbol | Type  | Ownership | Industry | Employees | Annual Revenue | SIC Code |
#      | Hot    | UTAM Test Account | 555-1234567 | 1234 | 1234           | test    | test         | test          | Other | Public    | Banking  | 4         | 2345           | 1234567  |
#    When I fill Address Information
#      | Billing Country | Billing Street | Billing City | Billing Zip/Postal Code | Shipping Country | Shipping Street | Shipping City | Shipping Zip/Postal Code |
#      | United Kingdom  | test           | London       | ABC DEF                 | United Kingdom   | test            | London        | ABC DEF                  |
#    When I fill Additional Information
#      | Customer Priority | SLA    | SLA Serial Number | Number of Locations | Upsell Opportunity | Active | Description |
#      | Low               | Silver | 123               | 4                   | No                 | Yes    | test        |
#    And I save account
#    Then I verify that "Account has been created successfully" message is displayed