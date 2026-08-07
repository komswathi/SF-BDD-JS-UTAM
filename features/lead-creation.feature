@regression
Feature: Lead Creation in Salesforce Sales App

  Background:
    Given I am logged into Salesforce

  @lead
  Scenario: Create Lead
    When I open app launcher and choose "Sales"
    Then app context should display "Sales"
    When I navigate to "Leads" tab