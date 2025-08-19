import { BasePage } from "../helper/pages/basePage";
import { TestUser, PageElements } from "../helper/types/env";
import { TestConfig } from "../helper/config/testConfig";

export default class LoginPage extends BasePage {
    protected elements: PageElements = {
        usernameInput: "[data-test='username']",
        passwordInput: "[data-test='password']",
        loginBtn: "[data-test='login-button']",
        errorMessage: "[data-test='error']",
        productsTitle: ".title",
        // Fallback selectors si data-test no está disponible
        usernameInputFallback: "//div[@class='form_group']//input[1]",
        passwordInputFallback: "//div[@class='form_group']//input[2]",
        loginBtnFallback: "//input[@class='submit-button btn_action']"
    };

    /**
     * Navigates to the Sauce Demo login page
     */
    async navigateToLoginPage(): Promise<void> {
        if (!process.env.BASEURL) {
            throw new Error("BASEURL environment variable is not set");
        }
        
        await this.navigateTo(process.env.BASEURL);
        await this.waitForPageLoad();
        
        // Verify we're on the login page
        await this.verifyElementVisible(this.elements.usernameInput || this.elements.usernameInputFallback);
    }

    /**
     * Performs login with given credentials
     */
    async login(username: string, password: string): Promise<void> {
        try {
            // Use data-test selectors first, fallback to XPath if needed
            const usernameSelector = await this.getAvailableSelector([
                this.elements.usernameInput,
                this.elements.usernameInputFallback
            ]);
            
            const passwordSelector = await this.getAvailableSelector([
                this.elements.passwordInput,
                this.elements.passwordInputFallback
            ]);
            
            const loginBtnSelector = await this.getAvailableSelector([
                this.elements.loginBtn,
                this.elements.loginBtnFallback
            ]);

            // Clear and type username
            await this.typeText(usernameSelector, username, { clear: true });
            
            // Clear and type password
            await this.typeText(passwordSelector, password, { clear: true });
            
            // Click login button
            await this.clickElement(loginBtnSelector);
            
            // Wait for navigation
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Login failed for user ${username}: ${error}`);
        }
    }

    /**
     * Login with predefined test user
     */
    async loginWithTestUser(userType: keyof typeof TestConfig.testUsers): Promise<void> {
        const user = TestConfig.testUsers[userType];
        if (!user) {
            throw new Error(`Test user type "${userType}" not found`);
        }
        
        await this.login(user.username, user.password);
    }

    /**
     * Verifies successful login by checking for products page
     */
    async verifySuccessfulLogin(): Promise<void> {
        try {
            await this.verifyElementVisible(this.elements.productsTitle);
            const titleText = await this.getElementText(this.elements.productsTitle);
            
            if (!titleText.toLowerCase().includes("products")) {
                throw new Error(`Expected "Products" title, but found: ${titleText}`);
            }
        } catch (error) {
            throw new Error(`Login verification failed: ${error}`);
        }
    }

    /**
     * Verifies login error message
     */
    async verifyLoginError(expectedError?: string): Promise<void> {
        try {
            await this.verifyElementVisible(this.elements.errorMessage);
            
            if (expectedError) {
                await this.verifyElementText(this.elements.errorMessage, expectedError);
            }
        } catch (error) {
            throw new Error(`Login error verification failed: ${error}`);
        }
    }

    /**
     * Helper method to get the first available selector from a list
     */
    private async getAvailableSelector(selectors: string[]): Promise<string> {
        for (const selector of selectors) {
            try {
                await this.page.locator(selector).waitFor({ 
                    state: "attached", 
                    timeout: 1000 
                });
                return selector;
            } catch {
                continue;
            }
        }
        throw new Error(`None of the selectors are available: ${selectors.join(", ")}`);
    }

    // Legacy method for backward compatibility
    async navigateToOrangePage(): Promise<void> {
        await this.navigateToLoginPage();
    }
}
