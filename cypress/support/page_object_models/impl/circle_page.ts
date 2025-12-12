import Page from "../base_page";

class CirclePage extends Page {

    public constructor() {
        super("/circle", "Treasure Hunt");
    }

    verify(): void {
        super.verify();
        // Verify that we're on the circle page by checking for circle-specific elements
        cy.get('#map').should('exist');
    }

    setLatitude(value: string): void {
        cy.contains('label', 'Latitude:')
            .parent()
            .find('input[type=number]')
            .first()
            .clear()
            .type(value);
    }

    setLongitude(value: string): void {
        cy.contains('label', 'Longitude:')
            .parent()
            .find('input[type=number]')
            .first()
            .clear()
            .type(value);
    }

    setRadius(value: string): void {
        cy.get('#radius').clear().type(value);
    }

    clickCreateButton(): void {
        cy.get('button').contains('Click to create').click();
    }

    verifyCircleCounterShows(count: number): void {
        cy.contains('Circles')
            .parent()
            .should('contain.text', count.toString());
    }

    verifyMapHasShape(): void {
        // Leaflet draws shapes as SVG elements with interactive classes
        cy.get('#map').find('svg').should('exist');
        cy.get('#map').find('.leaflet-interactive').should('exist');
    }

    verifySelectedCircleIsShown(): void {
        // After clicking a drawn circle the Selected Circle area should no longer show 'None'
        cy.get('.circle-box').contains('Selected Circle:').should('not.contain.text', 'None');
    }
}

export default new CirclePage();
