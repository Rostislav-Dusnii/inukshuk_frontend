import Page from "../base_page";


class HomePage extends Page {

    public constructor() {
        super("/");
    }

    verify(): void {
        super.verify();
    }

}

export default new HomePage();
