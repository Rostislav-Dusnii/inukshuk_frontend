import { Given } from "@badeball/cypress-cucumber-preprocessor";
import PageFactory from "../page_object_models/page_factory";

Given(
  "I am on the {string} page",
  (page: string) => {
    const pageObject = PageFactory.getPage(page);
    pageObject.visit();
    pageObject.verify();
  }
);

Given(
  "I am authenticated",
  () => {
    // Set a fake loggedInUser in sessionStorage so pages that require auth won't redirect
    cy.visit('/', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'loggedInUser',
          JSON.stringify({ token: 'fake-token', username: 'test' })
        );
      },
    });
  }
);


Given(
  "I am not authenticated user",
  () => {
    cy.logout();
  }
)

Given(
  "I am logged in as {string} with password {string}",
  (username: string, password: string) => {
    cy.login(username, password);
  }
)



