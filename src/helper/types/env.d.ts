export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit";
            ENV: "dev" | "uat" | "prod";
            BASEURL: string;
            HEADLESS?: "true" | "false";
        }
    }

    var browser: import("@playwright/test").Browser;
    var context: import("@playwright/test").BrowserContext;
    var page: import("@playwright/test").Page;
}

export interface TestUser {
    username: string;
    password: string;
}

export interface ShippingInfo {
    firstName: string;
    lastName: string;
    postalCode: string;
}

export interface PageElements {
    [key: string]: string;
}