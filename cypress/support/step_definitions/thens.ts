import { Then } from "@badeball/cypress-cucumber-preprocessor";
import Page from "../page_object_models/base_page";
import circle_page from "../page_object_models/impl/circle_page";
import PageFactory from "../page_object_models/page_factory";
import login_page from "../page_object_models/impl/login_page";

Then(
    "I am redirected to the {string} page",
    (page: string) => {
        const pageObject = PageFactory.getPage(page);
        pageObject.verify();
    }
)

Then(
    "I see a button labeled {string}",
    (label: string) => {
        cy.get("button").contains(label).should("be.visible");
    }
)

Then(
    "I see text {string}",
    (text: string) => {
        cy.contains(text).should('be.visible');
    }
)

Then(
    "the circle counter shows {int}",
    (count: number) => {
        circle_page.verifyCircleCounterShows(count);
    }
)

Then(
    "the map has a shape",
    () => {
        circle_page.verifyMapHasShape();
    }
)

Then(
    "the selected circle is shown",
    () => {
        circle_page.verifySelectedCircleIsShown();
    }
)

Then(
    'the user location marker is shown',
    () => {
        cy.get('#map').find('.user-location-marker').should('exist');
    }
);

Then('there exists a button with label {string}', (label: string) => {
    Page.existsButton(label);
});

Then('there not exists a button with label {string}', (label: string) => {
    Page.notExistsButton(label);
});