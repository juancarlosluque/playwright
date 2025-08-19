import { Page, Locator, expect } from "@playwright/test";
import { TestConfig } from "../config/testConfig";
import { PageElements } from "../types/env";

export abstract class BasePage {
    protected page: Page;
    protected abstract elements: PageElements;

    constructor(page?: Page) {
        this.page = page || global.page;
    }

    /**
     * Navigates to a specific URL
     */
    async navigateTo(url: string): Promise<void> {
        try {
            await this.page.goto(url, {
                waitUntil: TestConfig.waitStrategies.domContentLoaded,
                timeout: TestConfig.timeouts.navigation
            });
            
            // Wait for page to be ready
            await this.page.waitForTimeout(TestConfig.delays.afterNavigation);
        } catch (error) {
            throw new Error(`Error navigating to ${url}: ${error}`);
        }
    }

    /**
     * Waits for an element to be visible
     */
    async waitForElement(selector: string, timeout: number = TestConfig.timeouts.default): Promise<Locator> {
        try {
            const element = this.page.locator(selector);
            await element.waitFor({ state: "visible", timeout });
            return element;
        } catch (error) {
            throw new Error(`Element ${selector} not found within ${timeout}ms: ${error}`);
        }
    }

    /**
     * Clicks on an element with retry logic
     */
    async clickElement(selector: string, retries: number = 3): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                const element = await this.waitForElement(selector);
                await element.click();
                
                // Wait after clicking for visual feedback
                await this.page.waitForTimeout(TestConfig.delays.afterClick);
                return;
            } catch (error) {
                if (i === retries - 1) {
                    throw new Error(`Failed to click element ${selector} after ${retries} attempts: ${error}`);
                }
                await this.page.waitForTimeout(TestConfig.errorHandling.retryDelay);
            }
        }
    }

    /**
     * Types text in an input field
     */
    async typeText(selector: string, text: string, options?: { clear?: boolean }): Promise<void> {
        try {
            const element = await this.waitForElement(selector);
            
            if (options?.clear) {
                await element.clear();
                await this.page.waitForTimeout(200);
            }
            
            // Type with realistic speed
            await element.fill(text);
            
            // Wait after typing for visual feedback
            await this.page.waitForTimeout(TestConfig.delays.afterType);
        } catch (error) {
            throw new Error(`Failed to type text in ${selector}: ${error}`);
        }
    }

    /**
     * Gets text content from an element
     */
    async getElementText(selector: string): Promise<string> {
        try {
            const element = await this.waitForElement(selector);
            const text = await element.textContent();
            return text?.trim() || "";
        } catch (error) {
            throw new Error(`Failed to get text from ${selector}: ${error}`);
        }
    }

    /**
     * Verifies that an element is visible
     */
    async verifyElementVisible(selector: string): Promise<void> {
        try {
            // Wait before verification for stability
            await this.page.waitForTimeout(TestConfig.delays.beforeVerification);
            
            const element = this.page.locator(selector);
            await expect(element).toBeVisible({ timeout: TestConfig.timeouts.verification });
        } catch (error) {
            throw new Error(`Element ${selector} is not visible: ${error}`);
        }
    }

    /**
     * Verifies that text is present in an element
     */
    async verifyElementText(selector: string, expectedText: string): Promise<void> {
        try {
            // Wait before verification for stability
            await this.page.waitForTimeout(TestConfig.delays.beforeVerification);
            
            const element = this.page.locator(selector);
            await expect(element).toHaveText(expectedText, { timeout: TestConfig.timeouts.verification });
        } catch (error) {
            throw new Error(`Element ${selector} does not contain expected text "${expectedText}": ${error}`);
        }
    }

    /**
     * Takes a screenshot for debugging
     */
    async takeScreenshot(name?: string): Promise<Buffer> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = name || `screenshot-${timestamp}`;
        
        return await this.page.screenshot({
            path: `test-results/debug-screenshots/${screenshotName}.png`,
            fullPage: true
        });
    }

    /**
     * Waits for the page to load completely
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState(TestConfig.waitStrategies.networkIdle, {
            timeout: TestConfig.timeouts.navigation
        });
        
        // Additional wait for visual stability
        await this.page.waitForTimeout(TestConfig.delays.afterNavigation);
    }

    /**
     * Wait between test steps for better visualization
     */
    async waitBetweenSteps(): Promise<void> {
        await this.page.waitForTimeout(TestConfig.delays.betweenSteps);
    }

    /**
     * Wait between actions for better visualization
     */
    async waitBetweenActions(): Promise<void> {
        await this.page.waitForTimeout(TestConfig.delays.betweenActions);
    }
}