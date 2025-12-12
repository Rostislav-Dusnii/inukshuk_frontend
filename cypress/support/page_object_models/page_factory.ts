import Page from "./base_page";
import home_page from "./impl/home_page";
import login_page from "./impl/login_page";
import circle_page from "./impl/circle_page";

export const page_to_POM_mapping: Record<string, Page> = {
    "home": home_page,
    "login": login_page,
    "circle": circle_page,
};

class PageFactory {
    public static getPage(page: string): Page {
        const pageObject = page_to_POM_mapping[page];
        if (pageObject) {
            return pageObject;
        } else {
            throw new Error(`Page ${page} not found`);
        }
    }
}

export default PageFactory;