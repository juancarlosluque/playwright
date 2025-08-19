import { BasePage } from "../helper/pages/basePage";
import { PageElements } from "../helper/types/env";

export default class InvalidLoginPage extends BasePage {
    protected elements: PageElements = {
        usernameInput: "[data-test='username']",
        passwordInput: "[data-test='password']",
        loginBtn: "[data-test='login-button']",
        errorMessage: "[data-test='error']",
        // Fallback selectors
        usernameInputFallback: "//div[@class='form_group']//input[1]",
        passwordInputFallback: "//div[@class='form_group']//input[2]",
        loginBtnFallback: "//input[@class='submit-button btn_action']",
        errorMessageFallback: "//h3[contains(@data-test,'error')]"
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
        const usernameSelector = await this.getAvailableSelector([
            this.elements.usernameInput,
            this.elements.usernameInputFallback
        ]);
        await this.verifyElementVisible(usernameSelector);
    }

    /**
     * Attempts login with invalid credentials
     */
    async attemptInvalidLogin(username: string, password: string): Promise<void> {
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
            
            // Wait for error to appear
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            throw new Error(`Failed to attempt invalid login: ${error}`);
        }
    }

    /**
     * Verifies that an error message is displayed for invalid credentials
     */
    async verifyInvalidLoginError(): Promise<void> {
        try {
            const errorSelector = await this.getAvailableSelector([
                this.elements.errorMessage,
                this.elements.errorMessageFallback,
                "//h3[contains(text(),'Epic sadface')]"
            ]);
            
            await this.verifyElementVisible(errorSelector);
            
            const errorText = await this.getElementText(errorSelector);
            
            // Verify the error message contains expected text
            const expectedErrors = [
                "Username and password do not match",
                "Epic sadface",
                "do not match any user"
            ];
            
            const hasExpectedError = expectedErrors.some(expectedError => 
                errorText.toLowerCase().includes(expectedError.toLowerCase())
            );
            
            if (!hasExpectedError) {
                throw new Error(`Error message "${errorText}" does not contain expected content`);
            }
            
        } catch (error) {
            throw new Error(`Invalid login error verification failed: ${error}`);
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

    // Legacy methods for backward compatibility
    async navigateToOrangePage(): Promise<void> {
        await this.navigateToLoginPage();
    }

    async login(user: string, password: string): Promise<void> {
        await this.attemptInvalidLogin(user, password);
    }
}
