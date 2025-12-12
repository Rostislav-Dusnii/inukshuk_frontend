Feature: My Location
    Background:
        Given I am authenticated

    Scenario: center on user location via My Location button
    When I open the "circle" page with geolocation "50.8466429" "4.7266831"
    And I wait until the map is ready
    And I click a button labelled 'My Location'
        Then the user location marker is shown
