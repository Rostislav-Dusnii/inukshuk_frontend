import Page from "../base_page";

class LoginPage extends Page {

    public constructor() {
        super("/login", "Login");
    }

    verify(): void {
        super.verify();
        cy.get("form h1").should("contain", "Login");
        cy.get("#username").should("be.visible");
        cy.get("#password").should("be.visible");
        cy.get("button[type=submit]").should("be.visible");
    }

    enterUsername(username: string) {
        cy.get("#username").type(username);
    }

    enterPassword(password: string) {
        cy.get("#password").type(password);
    }

    expressLogin(username: string, password: string) {
        this.visit();
        this.submitForm(username, password);
    }

    clickLogin() {
        cy.get("button[type=submit]").click();
    }

    submitForm(username: string, password: string) {
        this.enterUsername(username);
        this.enterPassword(password);
        this.clickLogin();
    }

    verifyLoginSuccess() {
        this.verifyStatusMessage("Login successful. Redirecting to homepage...", "success");
    }

    verifyStatusMessage(expectedMessage: string, expectedType: 'success' | 'error') {
        cy.get("form p.status").then(($li) => {
            // Check if the message and type match
            cy.wrap($li).should("contain.text", expectedMessage);
            cy.wrap($li).should('have.class', expectedType === 'success' ? 'text-green-500' : 'text-red-500');
        });
    }

    verifyNavigationLinks() {
        // Ensure that all navigation links are visible and functional
        cy.get('a[href="/login"]').should("have.text", "LoginMap");
    }
}

export default new LoginPage();