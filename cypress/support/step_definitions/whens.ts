import { When } from "@badeball/cypress-cucumber-preprocessor";
import home_page from "../page_object_models/impl/home_page";
import circle_page from "../page_object_models/impl/circle_page";
import PageFactory from "../page_object_models/page_factory";
import Page from "../page_object_models/base_page";

When(
    "I click button labeled {string} on the header",
    (buttonLabel: string) => {
        home_page.verifyHeaderButtonByText(buttonLabel);
        home_page.clickHeaderButtonByText(buttonLabel);
    }
)

When(
    "I click a button labelled {string}",
    (label: string) => {
        cy.get('button').contains(label).click();
    }
)

When(
    "I click a link labelled {string}",
    (label: string) => {
        Page.clickLinkByText(label)
    }
)


When(
    "I navigate to the {string} page",
    (page: string) => {
        const pageObject = PageFactory.getPage(page);
        pageObject.visit();
        pageObject.verify();
    }
)

When(
    "I open the {string} page",
    (page: string) => {
        const pageObject = PageFactory.getPage(page);
        pageObject.visit();
        pageObject.verify();
    }
)

When(
    "I set latitude to {string}",
    (value: string) => {
        circle_page.setLatitude(value);
    }
)

When(
    "I set longitude to {string}",
    (value: string) => {
        circle_page.setLongitude(value);
    }
)

When(
    "I set radius to {string}",
    (value: string) => {
        circle_page.setRadius(value);
    }
)

When(
    "I set geolocation to {string} {string}",
    (lat: string, lng: string) => {
        // Ensure navigator.geolocation.getCurrentPosition is overridden reliably.
        cy.window().then((win: any) => {
            const makeSuccess = () => ({ coords: { latitude: Number(lat), longitude: Number(lng), accuracy: 10 } });

            try {
                // Try to stub method if possible
                if (win.navigator && win.navigator.geolocation && win.navigator.geolocation.getCurrentPosition) {
                    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success: any) => {
                        success(makeSuccess());
                    });
                } else {
                    // Define a geolocation object on navigator (useful if it's non-configurable in some envs)
                    const geo = {
                        getCurrentPosition: (success: any) => success(makeSuccess()),
                        watchPosition: (_s: any) => -1,
                        clearWatch: (_id: any) => {},
                    };
                    try {
                        Object.defineProperty(win.navigator, 'geolocation', {
                            configurable: true,
                            writable: true,
                            value: geo,
                        });
                    } catch (e) {
                        // fallback: attach directly (may fail in strict environments)
                        // @ts-ignore
                        win.navigator.geolocation = geo;
                    }
                }
            } catch (e) {
                // As a last resort, attempt to set on window for code that references window.navigator.geolocation directly
                // @ts-ignore
                win.geolocation = {
                    getCurrentPosition: (success: any) => success(makeSuccess()),
                };
            }
        });
    }
)

When(
    "I open the {string} page with geolocation {string} {string}",
    (page: string, lat: string, lng: string) => {
        // Visit the page but stub geolocation before any script runs using onBeforeLoad
        cy.visit(`/${page}`, {
            onBeforeLoad(win: any) {
                const makeSuccess = () => ({ coords: { latitude: Number(lat), longitude: Number(lng), accuracy: 10 } });
                const geo = {
                    getCurrentPosition: (success: any) => success(makeSuccess()),
                    watchPosition: (_s: any) => -1,
                    clearWatch: (_id: any) => {},
                };

                try {
                    Object.defineProperty(win.navigator, 'geolocation', {
                        configurable: true,
                        writable: true,
                        value: geo,
                    });
                } catch (e) {
                    // fallback
                    // @ts-ignore
                    win.navigator.geolocation = geo;
                }
            },
        });
    }
)

When('I wait until the map is ready', () => {
    // Wait for Leaflet to render its panes and SVG. This avoids clicking buttons before the map has initialized.
    cy.get('#map', { timeout: 20000 })
      .should('exist')
      .then(($map) => {
          // wait for either the SVG (for overlays) or the leaflet panes to appear
          cy.wrap($map).find('svg', { timeout: 20000 }).should('exist');
      });
});

When(
    "I reload the page",
    () => {
        Page.instance.reload();
    }
)

When('wait {string} ms', (duration: string) => {
    cy.wait(Number(duration))
});