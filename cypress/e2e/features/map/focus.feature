Feature: Focus
    Background:
        Given I am authenticated

    Scenario: creating a new circle focuses and shows it immediately
        When I open the "circle" page
        And I set latitude to "50.8466429"
        And I set longitude to "4.7266831"
        And I set radius to "150"
        And I click a button labelled 'Click to create'
        Then the circle counter shows 1
        And the map has a shape
        When I click a button labelled 'Click to create'
        Then the circle counter shows 2
        And the map has a shape
