@regression
Feature: Case Creation in Salesforce Sales App

  Background:
    Given I am logged into Salesforce

  @case
  Scenario: Create case record with full case details
    When I navigate to "Cases" tab
    When I create case with following details
      | Status  | Priority | Case Origin | Contact Name | Account Name      | Type  | Case Reason  | Web Email     | Web Name | Web Company | Web Phone | Subject | Description | Product | Engineering Req Number | Potential Liability | SLA Violation |
      | Working | High     | Email       | Komerav      | UTAM Test Account | Other | Installation | test@test.com | test     | test        | test      | test    | test        | GC1040  | 12345678               | No                  | Yes           |