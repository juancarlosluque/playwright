import { BasePage } from "../helper/pages/basePage";
import { PageElements, ShippingInfo } from "../helper/types/env";
import { TestConfig } from "../helper/config/testConfig";

export default class CheckoutPage extends BasePage {
    protected elements: PageElements = {
        // Checkout step 1 - Cart
        checkoutBtn: "[data-test='checkout']",
        
        // Checkout step 2 - Information
        firstNameInput: "[data-test='firstName']",
        lastNameInput: "[data-test='lastName']",
        postalCodeInput: "[data-test='postalCode']",
        continueBtn: "[data-test='continue']",
        cancelBtn: "[data-test='cancel']",
        errorMessage: "[data-test='error']",
        
        // Checkout step 3 - Overview
        finishBtn: "[data-test='finish']",
        backBtn: "[data-test='back-to-products']",
        summaryContainer: "[data-test='checkout-summary-container']",
        itemTotal: ".summary_subtotal_label",
        tax: ".summary_tax_label",
        total: ".summary_total_label",
        
        // Checkout step 4 - Complete
        successMessage: "[data-test='complete-header']",
        successDescription: "[data-test='complete-text']",
        successContainer: "[data-test='checkout-complete-container']",
        backHomeBtn: "[data-test='back-to-products']",
        
        // Fallback selectors
        checkoutBtnFallback: "//button[@id='checkout']",
        firstNameInputFallback: "//input[@id='first-name']",
        lastNameInputFallback: "//input[@id='last-name']",
        postalCodeInputFallback: "//input[@id='postal-code']",
        continueBtnFallback: "//input[@id='continue']",
        finishBtnFallback: "//button[@id='finish']",
        successContainerFallback: "//div[@id='checkout_complete_container']"
    };

    /**
     * Starts the checkout process from cart page
     */
    async startCheckout(): Promise<void> {
        try {
            const checkoutSelector = await this.getAvailableSelector([
                this.elements.checkoutBtn,
                this.elements.checkoutBtnFallback
            ]);
            
            await this.clickElement(checkoutSelector);
            await this.waitForPageLoad();
            
            // Verify we're on the checkout information page
            const firstNameSelector = await this.getAvailableSelector([
                this.elements.firstNameInput,
                this.elements.firstNameInputFallback
            ]);
            await this.verifyElementVisible(firstNameSelector);
            
        } catch (error) {
            throw new Error(`Failed to start checkout: ${error}`);
        }
    }

    /**
     * Fills shipping information form
     */
    async fillShippingInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
        try {
            const firstNameSelector = await this.getAvailableSelector([
                this.elements.firstNameInput,
                this.elements.firstNameInputFallback
            ]);
            
            const lastNameSelector = await this.getAvailableSelector([
                this.elements.lastNameInput,
                this.elements.lastNameInputFallback
            ]);
            
            const postalCodeSelector = await this.getAvailableSelector([
                this.elements.postalCodeInput,
                this.elements.postalCodeInputFallback
            ]);
            
            const continueSelector = await this.getAvailableSelector([
                this.elements.continueBtn,
                this.elements.continueBtnFallback
            ]);

            // Clear and fill form fields
            await this.typeText(firstNameSelector, firstName, { clear: true });
            await this.typeText(lastNameSelector, lastName, { clear: true });
            await this.typeText(postalCodeSelector, postalCode, { clear: true });
            
            // Continue to overview
            await this.clickElement(continueSelector);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to fill shipping information: ${error}`);
        }
    }

    /**
     * Fills shipping information using ShippingInfo object
     */
    async fillShippingInfoFromObject(shippingInfo: ShippingInfo): Promise<void> {
        await this.fillShippingInfo(
            shippingInfo.firstName,
            shippingInfo.lastName,
            shippingInfo.postalCode
        );
    }

    /**
     * Finishes the checkout process
     */
    async finishCheckout(): Promise<void> {
        try {
            const finishSelector = await this.getAvailableSelector([
                this.elements.finishBtn,
                this.elements.finishBtnFallback
            ]);
            
            await this.clickElement(finishSelector);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to finish checkout: ${error}`);
        }
    }

    /**
     * Verifies successful purchase completion
     */
    async verifySuccessMessage(): Promise<void> {
        try {
            const successSelector = await this.getAvailableSelector([
                this.elements.successContainer,
                this.elements.successContainerFallback
            ]);
            
            await this.verifyElementVisible(successSelector);
            
            // Verify success header
            const headerText = await this.getElementText(this.elements.successMessage);
            if (!headerText.toLowerCase().includes("thank you") && 
                !headerText.toLowerCase().includes("complete")) {
                throw new Error(`Unexpected success header: ${headerText}`);
            }
            
        } catch (error) {
            throw new Error(`Success message verification failed: ${error}`);
        }
    }

    /**
     * Verifies checkout error message
     */
    async verifyCheckoutError(expectedError?: string): Promise<void> {
        try {
            await this.verifyElementVisible(this.elements.errorMessage);
            
            if (expectedError) {
                await this.verifyElementText(this.elements.errorMessage, expectedError);
            }
            
        } catch (error) {
            throw new Error(`Checkout error verification failed: ${error}`);
        }
    }

    /**
     * Gets the order summary information
     */
    async getOrderSummary(): Promise<{
        itemTotal: number;
        tax: number;
        total: number;
    }> {
        try {
            const itemTotalText = await this.getElementText(this.elements.itemTotal);
            const taxText = await this.getElementText(this.elements.tax);
            const totalText = await this.getElementText(this.elements.total);
            
            const itemTotal = parseFloat(itemTotalText.replace(/[^0-9.]/g, ''));
            const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
            const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
            
            return {
                itemTotal,
                tax,
                total
            };
            
        } catch (error) {
            throw new Error(`Failed to get order summary: ${error}`);
        }
    }

    /**
     * Verifies the order total matches expected amount
     */
    async verifyOrderTotal(expectedTotal: number, tolerance: number = 0.01): Promise<void> {
        try {
            const summary = await this.getOrderSummary();
            const difference = Math.abs(summary.total - expectedTotal);
            
            if (difference > tolerance) {
                throw new Error(
                    `Order total mismatch. Expected: ${expectedTotal}, Actual: ${summary.total}`
                );
            }
            
        } catch (error) {
            throw new Error(`Order total verification failed: ${error}`);
        }
    }

    /**
     * Cancels the checkout process
     */
    async cancelCheckout(): Promise<void> {
        try {
            await this.clickElement(this.elements.cancelBtn);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to cancel checkout: ${error}`);
        }
    }

    /**
     * Goes back to products page after successful checkout
     */
    async backToProducts(): Promise<void> {
        try {
            await this.clickElement(this.elements.backHomeBtn);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to return to products page: ${error}`);
        }
    }

    /**
     * Completes entire checkout process with default test data
     */
    async completeCheckoutWithTestData(): Promise<void> {
        const testShippingInfo: ShippingInfo = {
            firstName: "Test",
            lastName: "User",
            postalCode: "12345"
        };
        
        await this.startCheckout();
        await this.fillShippingInfoFromObject(testShippingInfo);
        await this.finishCheckout();
        await this.verifySuccessMessage();
    }

    /**
     * Validates required fields in shipping form
     */
    async validateRequiredFields(): Promise<void> {
        try {
            // Try to continue without filling fields
            const continueSelector = await this.getAvailableSelector([
                this.elements.continueBtn,
                this.elements.continueBtnFallback
            ]);
            
            await this.clickElement(continueSelector);
            
            // Should show error message
            await this.verifyElementVisible(this.elements.errorMessage);
            
        } catch (error) {
            throw new Error(`Required field validation failed: ${error}`);
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
}
