import { After, AfterAll, AfterStep, Before, BeforeAll, Status } from "@cucumber/cucumber";
import { BrowserManager } from "../helper/browsers/browserManager";
import { getEnv } from "../helper/env/env";
import { TestConfig } from "../helper/config/testConfig";

/**
 * Global test setup - runs once before all scenarios
 */
BeforeAll(async function () {
    console.log("🚀 Initializing test environment...");
    
    try {
        // Load environment variables
        getEnv();
        
        // Launch browser
        global.browser = await BrowserManager.launchBrowser();
        console.log(`✅ Browser launched successfully: ${process.env.BROWSER || 'chrome'}`);
        
    } catch (error) {
        console.error("❌ Failed to initialize test environment:", error);
        throw error;
    }
});

/**
 * Scenario setup - runs before each scenario
 */
Before(async function (scenario) {
    try {
        // Create new browser context for isolation
        global.context = await global.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            // Enable video recording for debugging
            recordVideo: TestConfig.errorHandling.takeScreenshotOnFailure ? {
                dir: 'test-results/videos/',
                size: { width: 1920, height: 1080 }
            } : undefined
        });
        
        // Create new page
        global.page = await global.context.newPage();
        
        // Set default timeouts
        global.page.setDefaultTimeout(TestConfig.timeouts.default);
        global.page.setDefaultNavigationTimeout(TestConfig.timeouts.navigation);
        
        console.log(`📋 Starting scenario: ${scenario.pickle.name}`);
        
    } catch (error) {
        console.error("❌ Failed to setup scenario:", error);
        throw error;
    }
});

/**
 * Scenario cleanup - runs after each scenario
 */
After(async function (scenario) {
    try {
        // Take screenshot on failure
        if (scenario.result?.status === Status.FAILED && TestConfig.errorHandling.takeScreenshotOnFailure) {
            const screenshot = await global.page.screenshot({
                path: `test-results/debug-screenshots/failed-${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`,
                fullPage: true
            });
            await this.attach(screenshot, "image/png");
        }
        
        // Close page and context
        if (global.page) {
            await global.page.close();
        }
        
        if (global.context) {
            await global.context.close();
        }
        
        const status = scenario.result?.status === Status.PASSED ? "✅" : "❌";
        console.log(`${status} Scenario completed: ${scenario.pickle.name}`);
        
    } catch (error) {
        console.error("❌ Error during scenario cleanup:", error);
    }
});

/**
 * Global cleanup - runs once after all scenarios
 */
AfterAll(async function () {
    try {
        if (global.browser) {
            await global.browser.close();
            console.log("✅ Browser closed successfully");
        }
    } catch (error) {
        console.error("❌ Error during global cleanup:", error);
    }
});

/**
 * Step screenshot and delay - runs after each step
 */
AfterStep(async function (step) {
    try {
        // Add delay between steps for better visualization in dev mode
        if (process.env.ENV === "dev") {
            await global.page.waitForTimeout(TestConfig.delays.betweenSteps);
        }
        
        // Only take step screenshots in development environment
        if (process.env.ENV === "dev" && process.env.STEP_SCREENSHOTS === "true") {
            const screenshot = await global.page.screenshot({
                type: "png",
                fullPage: false
            });
            await this.attach(screenshot, "image/png");
        }
    } catch (error) {
        console.warn("⚠️ Failed to take step screenshot:", error);
        // Don't throw error as this is non-critical
    }
});

/**
 * Handle uncaught exceptions in tests
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

