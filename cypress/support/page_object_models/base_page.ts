import IPage from "./ipage";

class Page implements IPage {
    public static instance: Page = new Page();
    protected shortUrl: string;
    protected url: string;
    protected pageTitle: string;

    constructor(
        url: string = "",
        pageTitle: string = "Treasure Hunt"
    ) {
        this.shortUrl = url;
        // Guard against a null/undefined baseUrl coming from config/environment.
        // If baseUrl is null or undefined, fall back to an empty string so we do not
        // end up with the string "null/..." when concatenating.
        const base = Cypress.config().baseUrl ?? "";
        this.url = base + url;
        this.pageTitle = pageTitle;
    }

    visit(): void {
        cy.log(this.url);
        cy.visit(this.url);
    }

    verify(): void {
        // verifyUrl
        if (!this.url.endsWith('dynamic')) {
            cy.url().should("eq", this.url);
        }
        this.verifyPageTitle();
        this.verifyHeader(); // Verify the header
        this.verifyNavigationLinks(); // Verify navigation links
    }

    reload(): void {
        cy.reload();
    }

    verifyPageTitle() {
        cy.title().should("eq", this.pageTitle);
    }

    verifyHeader() {
        cy.get("header").should("be.visible"); // Ensure the header is visible
    }

    verifyLoggedInUser() {
        // Check if the user is logged in by verifying the welcome message
        cy.get("#welcomMessage").should("contain", "Welcome");
        cy.get('a[href="/login"]').should("contain", "Logout");
    }

    verifyNotLoggedInUser() {
        // Check if the user is not logged in by verifying the Login link is visible
        cy.get('a[href="/login"]').should("be.visible");
        cy.get('a[href="/login"]').should("contain", "Login");
    }

    static isLoggedIn(): boolean {
        cy.get('header')
            .then(($header) => {
                if (!$header.find('#welcomMessage').length) {
                    return false;
                }
                if (!$header.find('#logout').length) {
                    return false;
                }
                return true;
            })
        return false;
    }

    verifyNavigationLinks() {
        // Ensure that all navigation links are visible and functional
        cy.get('a[href="/login"]').should("have.text", "LoginMapLogin");
    }

    verifyHeaderButtonByText(text: string) {
        cy.get("header a").contains(text).should("be.visible");
    }

    logout() {
        cy.get('a[href="/login"]').click();
    }

    visitLoginPage() {
        cy.get('a[href="/login"]').click();
    }

    clickHeaderButtonByText(text: string) {
        cy.wait(3000); // DO NOT REMOVE, ELSE THE PIPELINE FAILS.
        cy.get("header a").contains(text).click({ force: true }) // DO NOT REMOVE FORCE, ELSE THE PIPELINE FAILS.
    }

    static clickLinkByText(text: string) {
        cy.get('a').contains(text).click()
    }

    static verifyButtonExistsWithLabel(label: string) {
        cy.get("button").contains(label).should("be.visible");
    }

    static existsButton(label: string) {
        cy.get("button").contains(label).should("exist");
    }

    static notExistsButton(label: string) {
        cy.get("button").contains(label).should("not.exist");
    }
}

export default Page;