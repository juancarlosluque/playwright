import { chromium, firefox, webkit, Browser, LaunchOptions } from "@playwright/test";

interface BrowserConfig extends LaunchOptions {
    headless: boolean;
    args: string[];
}

export class BrowserManager {
    private static readonly DEFAULT_CONFIG: BrowserConfig = {
        headless: process.env.HEADLESS === "true",
        args: [
            "--ignore-certificate-errors",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor"
        ]
    };

    private static getBrowserConfig(): BrowserConfig {
        const environment = process.env.ENV || "dev";
        
        // Set slowMo based on environment and explicit setting
        let slowMo = 0;
        if (process.env.SLOW_MO) {
            slowMo = parseInt(process.env.SLOW_MO);
        } else {
            // Default slowMo values by environment
            switch (environment) {
                case "dev":
                    slowMo = 600; // Moderate speed for development/demo
                    break;
                case "uat":
                    slowMo = 300; // Moderate for UAT
                    break;
                case "prod":
                    slowMo = 0; // Fast for production
                    break;
                default:
                    slowMo = 400;
            }
        }

        return {
            ...this.DEFAULT_CONFIG,
            slowMo
        };
    }

    public static async launchBrowser(): Promise<Browser> {
        const browserType = process.env.BROWSER?.toLowerCase() || "chrome";
        const config = this.getBrowserConfig();

        try {
            switch (browserType) {
                case "chrome":
                case "chromium":
                    return await chromium.launch(config);
                case "firefox":
                    return await firefox.launch(config);
                case "webkit":
                case "safari":
                    return await webkit.launch(config);
                default:
                    throw new Error(`Browser "${browserType}" no es soportado. Use: chrome, firefox, o webkit`);
            }
        } catch (error) {
            throw new Error(`Error al lanzar el browser ${browserType}: ${error}`);
        }
    }
}

// Mantenemos la función legacy para compatibilidad
export const invokeBrowser = (): Promise<Browser> => {
    return BrowserManager.launchBrowser();
};