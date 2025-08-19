import { BasePage } from "../helper/pages/basePage";
import { PageElements } from "../helper/types/env";

export default class CartPage extends BasePage {
    protected elements: PageElements = {
        // Cart navigation
        cartIcon: "[data-test='shopping-cart-link']",
        cartBadge: ".shopping_cart_badge",
        
        // Cart content
        cartContainer: "[data-test='cart-contents-container']",
        cartItems: "[data-test='inventory-item']",
        cartItemNames: "[data-test='inventory-item-name']",
        cartItemDescriptions: "[data-test='inventory-item-desc']",
        cartItemPrices: "[data-test='inventory-item-price']",
        
        // Cart actions
        removeButtons: "[data-test*='remove']",
        continueShoppingBtn: "[data-test='continue-shopping']",
        checkoutBtn: "[data-test='checkout']",
        
        // Cart status
        emptyCartMessage: ".removed_cart_item",
        
        // Fallback selectors
        cartIconFallback: "//a[@class='shopping_cart_link']",
        cartItemsFallback: "//div[@class='cart_item']",
        cartItemNamesFallback: "//div[@class='inventory_item_name']"
    };

    /**
     * Navigates to the cart page
     */
    async goToCart(): Promise<void> {
        try {
            const cartIconSelector = await this.getAvailableSelector([
                this.elements.cartIcon,
                this.elements.cartIconFallback
            ]);
            
            await this.clickElement(cartIconSelector);
            await this.waitForPageLoad();
            
            // Verify we're on the cart page
            await this.verifyElementVisible(this.elements.cartContainer || "#cart_contents_container");
            
        } catch (error) {
            throw new Error(`Failed to navigate to cart: ${error}`);
        }
    }

    /**
     * Verifies that products are present in the cart
     */
    async verifyProductInCart(): Promise<void> {
        try {
            const cartItemsSelector = await this.getAvailableSelector([
                this.elements.cartItems,
                this.elements.cartItemsFallback
            ]);
            
            const cartItems = this.page.locator(cartItemsSelector);
            const count = await cartItems.count();
            
            if (count === 0) {
                throw new Error("No products found in the cart");
            }
            
        } catch (error) {
            throw new Error(`Cart product verification failed: ${error}`);
        }
    }

    /**
     * Verifies that a specific product is in the cart by name
     */
    async verifySpecificProductInCart(productName: string): Promise<void> {
        try {
            const cartItemNamesSelector = await this.getAvailableSelector([
                this.elements.cartItemNames,
                this.elements.cartItemNamesFallback
            ]);
            
            const productNames = this.page.locator(cartItemNamesSelector);
            const count = await productNames.count();
            
            let found = false;
            for (let i = 0; i < count; i++) {
                const name = await productNames.nth(i).textContent();
                if (name?.trim() === productName) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                throw new Error(`Product "${productName}" not found in cart`);
            }
            
        } catch (error) {
            throw new Error(`Specific product verification failed: ${error}`);
        }
    }

    /**
     * Gets all product names in the cart
     */
    async getCartProductNames(): Promise<string[]> {
        try {
            const cartItemNamesSelector = await this.getAvailableSelector([
                this.elements.cartItemNames,
                this.elements.cartItemNamesFallback
            ]);
            
            const productNameElements = this.page.locator(cartItemNamesSelector);
            const count = await productNameElements.count();
            const names: string[] = [];
            
            for (let i = 0; i < count; i++) {
                const name = await productNameElements.nth(i).textContent();
                if (name) {
                    names.push(name.trim());
                }
            }
            
            return names;
            
        } catch (error) {
            throw new Error(`Failed to get cart product names: ${error}`);
        }
    }

    /**
     * Gets the number of items in the cart
     */
    async getCartItemCount(): Promise<number> {
        try {
            const cartItemsSelector = await this.getAvailableSelector([
                this.elements.cartItems,
                this.elements.cartItemsFallback
            ]);
            
            const cartItems = this.page.locator(cartItemsSelector);
            return await cartItems.count();
            
        } catch (error) {
            return 0;
        }
    }

    /**
     * Removes a product from cart by name
     */
    async removeProductFromCart(productName: string): Promise<void> {
        try {
            // Convert product name to data-test format
            const dataTestName = productName.toLowerCase().replace(/\s+/g, '-');
            const removeSelector = `[data-test="remove-${dataTestName}"]`;
            
            await this.clickElement(removeSelector);
            
            // Wait for the item to be removed
            await this.page.waitForTimeout(1000);
            
        } catch (error) {
            throw new Error(`Failed to remove product "${productName}" from cart: ${error}`);
        }
    }

    /**
     * Clears all items from the cart
     */
    async clearCart(): Promise<void> {
        try {
            const removeButtons = this.page.locator(this.elements.removeButtons);
            const count = await removeButtons.count();
            
            // Remove items one by one
            for (let i = count - 1; i >= 0; i--) {
                await removeButtons.nth(i).click();
                await this.page.waitForTimeout(500); // Wait between removals
            }
            
        } catch (error) {
            throw new Error(`Failed to clear cart: ${error}`);
        }
    }

    /**
     * Continues shopping (goes back to products page)
     */
    async continueShopping(): Promise<void> {
        try {
            await this.clickElement(this.elements.continueShoppingBtn);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to continue shopping: ${error}`);
        }
    }

    /**
     * Proceeds to checkout
     */
    async proceedToCheckout(): Promise<void> {
        try {
            await this.clickElement(this.elements.checkoutBtn);
            await this.waitForPageLoad();
            
        } catch (error) {
            throw new Error(`Failed to proceed to checkout: ${error}`);
        }
    }

    /**
     * Verifies the cart is empty
     */
    async verifyCartIsEmpty(): Promise<void> {
        try {
            const cartItems = this.page.locator(this.elements.cartItems);
            const count = await cartItems.count();
            
            if (count > 0) {
                throw new Error(`Expected empty cart, but found ${count} items`);
            }
            
        } catch (error) {
            throw new Error(`Empty cart verification failed: ${error}`);
        }
    }

    /**
     * Gets the total price of items in cart (if displayed)
     */
    async getTotalPrice(): Promise<number> {
        try {
            const priceElements = this.page.locator(this.elements.cartItemPrices);
            const count = await priceElements.count();
            let total = 0;
            
            for (let i = 0; i < count; i++) {
                const priceText = await priceElements.nth(i).textContent();
                const price = parseFloat(priceText?.replace('$', '') || '0');
                total += price;
            }
            
            return total;
            
        } catch (error) {
            throw new Error(`Failed to calculate total price: ${error}`);
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
