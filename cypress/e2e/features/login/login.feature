Feature: Login
    Background:
        Given I am on the "home" page

    Scenario: Visit Login page
        When I click a link labelled 'Login'
        Then I am redirected to the 'login' page
