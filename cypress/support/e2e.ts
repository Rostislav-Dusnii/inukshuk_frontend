// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import home_page from './page_object_models/impl/home_page';
import login_page from './page_object_models/impl/login_page';
import { getToken } from '@util/auth';
import { getAllLecturersUrl, getAllSchedulesUrl, resetDatabaseUrl } from './urls';
import Page from './page_object_models/base_page';

Cypress.Commands.add("login", (username, password) => {
  cy.session([username, password], () => {
    cy.intercept('POST', '**/login').as('loginRequest');
    login_page.expressLogin(username, password);
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
    });
    home_page.verify();
    home_page.verifyLoggedInUser();
    cy.window().then((win) => {
      const loggedInUserData = win.sessionStorage.getItem("loggedInUser");
      expect(loggedInUserData).to.exist;
    });
  });

});

Cypress.Commands.add("logout", () => {
  home_page.visit();
  home_page.verify();
  const loggedIn = Page.isLoggedIn();
  if (!loggedIn) {
    return;
  }
  cy.intercept('POST', '**/logout').as('logoutRequest');
  home_page.logout();
  cy.wait('@logoutRequest').then((interception) => {
    expect(interception.response?.statusCode).to.equal(200);
  });
  home_page.verifyNotLoggedInUser();
});

// Cypress.Commands.add("getLecturersFromBackend", () => {
//   return cy.request<Lecturer[]>({
//     method: "GET",
//     url: getAllLecturersUrl,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${getToken()}`,
//     },
//   }).then((response) => {
//     expect(response.status).to.eq(200);
//     return response.body;
//   });
// });

// Cypress.Commands.add("getSchedulesFromBackend", () => {
//   return cy.request<Schedule[]>({
//     method: "GET",
//     url: getAllSchedulesUrl,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${getToken()}`,
//     },
//   }).then((response) => {
//     expect(response.status).to.eq(200);
//     return response.body;
//   });
// });

// Cypress.Commands.add("resetDatabase", () => {
//   return cy.request<String>({
//     method: "GET",
//     url: resetDatabaseUrl,
//   }).then((response) => {
//     expect(response.status).to.eq(200);
//     return response.body;
//   });
// });

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      // getLecturersFromBackend(): Chainable<Lecturer[]>;
      // getSchedulesFromBackend(): Chainable<Schedule[]>;
      // resetDatabase(): Chainable<String>;
    }
  }
}