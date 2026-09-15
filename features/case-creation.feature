@regression
Feature: Account Creation in Salesforce Sales App

  Background:
    Given I am logged into Salesforce

  @case
  Scenario: Create account record with full account and address details"
    When I navigate to "Cases" tab
    And I create a case
    Then I verify the following sections are displayed
      | Case Information        |
      | Web Information         |
      | Additional Information  |
      | Description Information |

  @test
  Scenario: Verify the edit case works successfully
    When I navigate to "Cases" tab
    And I search for the existing case "00001035"
    And I click on the row "1" and wait for the url to contain "/lightning/r/Case/"
    And I read all the values from the Details tab