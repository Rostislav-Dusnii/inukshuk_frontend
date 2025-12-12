Feature: Home
    Background:
        Given I am on the "home" page

    Scenario: Homepage shows main content and actions
        Then I see text "Treasure Hunt"
        And I see text "Explore, discover, and complete quests around the world"
        And I see text "Login"
        And I see text "Register"
