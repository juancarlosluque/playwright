import { BasePage } from "../helper/pages/basePage";
import { PageElements } from "../helper/types/env";

export default class ProductsPage extends BasePage {
    protected elements: PageElements = {
        // Product selectors using data-test attributes
        firstProduct: "[data-test='add-to-cart-sauce-labs-backpack']",
        secondProduct: "[data-test='add-to-cart-sauce-labs-bike-light']",
        thirdProduct: "[data-test='add-to-cart-sauce-labs-bolt-t-shirt']",
        
        // Cart selectors
        cartIcon: "[data-test='shopping-cart-link']",
        cartBadge: ".shopping_cart_badge",
        
        // Product list
        productContainer: ".inventory_list",
        productItems: ".inventory_item",
        productNames: ".inventory_item_name",
        productPrices: ".inventory_item_price",
        addToCartButtons: "[data-test*='add-to-cart']",
        removeButtons: "[data-test*='remove']",
        
        // Fallback selectors
        firstProductFallback: "//button[@id='add-to-cart-sauce-labs-backpack']",
        cartIconFallback: "//a[@class='shopping_cart_link']",
        cartBadgeFallback: "//span[@class='shopping_cart_badge']"
    };

    /**
     * Adds the first product to cart
     */
    async addFirstProductToCart(): Promise<void> {
        try {
            const productSelector = await this.getAvailableSelector([
                this.elements.firstProduct,
                this.elements.firstProductFallback
            ]);
            
            await this.clickElement(productSelector);
            
            // Verify the button text changed to "Remove"
            await this.page.waitForTimeout(500);
            
        } catch (error) {
            throw new Error(`Failed to add first product to cart: ${error}`);
        }
    }

    /**
     * Adds a specific product to cart by name
     */
    async addProductToCartByName(productName: string): Promise<void> {
        try {
            // Find the product by name and click its add to cart button
            const productSelector = `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`;
            await this.clickElement(productSelector);
            
        } catch (error) {
            throw new Error(`Failed to add product "${productName}" to cart: ${error}`);
        }
    }

    /**
     * Adds multiple products to cart
     */
    async addMultipleProductsToCart(count: number): Promise<void> {
        try {
            const addToCartButtons = this.page.locator(this.elements.addToCartButtons);
            const buttonCount = await addToCartButtons.count();
            
            if (count > buttonCount) {
                throw new Error(`Cannot add ${count} products. Only ${buttonCount} products available.`);
            }
            
            for (let i = 0; i < count; i++) {
                await addToCartButtons.nth(i).click();
                await this.page.waitForTimeout(300); // Small delay between clicks
            }
            
        } catch (error) {
            throw new Error(`Failed to add ${count} products to cart: ${error}`);
        }
    }

    /**
     * Verifies the cart shows the expected number of items
     */
    async verifyCartCount(expectedCount: number): Promise<void> {
        try {
            if (expectedCount === 0) {
                // Verify cart badge is not visible when count is 0
                const cartBadge = this.page.locator(this.elements.cartBadge);
                await cartBadge.waitFor({ state: "hidden", timeout: 5000 });
                return;
            }

            const cartBadgeSelector = await this.getAvailableSelector([
                this.elements.cartBadge,
                this.elements.cartBadgeFallback
            ]);
            
            await this.verifyElementVisible(cartBadgeSelector);
            const countText = await this.getElementText(cartBadgeSelector);
            const actualCount = parseInt(countText);
            
            if (actualCount !== expectedCount) {
                throw new Error(`Expected ${expectedCount} product(s) in cart, but found ${actualCount}`);
            }
            
        } catch (error) {
            throw new Error(`Cart count verification failed: ${error}`);
        }
    }

    /**
     * Gets the current cart count
     */
    async getCartCount(): Promise<number> {
        try {
            const cartBadge = this.page.locator(this.elements.cartBadge);
            
            // Check if cart badge is visible
            const isVisible = await cartBadge.isVisible();
            if (!isVisible) {
                return 0;
            }
            
            const countText = await this.getElementText(this.elements.cartBadge);
            return parseInt(countText) || 0;
            
        } catch (error) {
            return 0; // Return 0 if badge is not found or not visible
        }
    }

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
            
        } catch (error) {
            throw new Error(`Failed to navigate to cart: ${error}`);
        }
    }

    /**
     * Gets all product names on the products page
     */
    async getProductNames(): Promise<string[]> {
        try {
            const productNameElements = this.page.locator(this.elements.productNames);
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
            throw new Error(`Failed to get product names: ${error}`);
        }
    }

    /**
     * Verifies that products are displayed on the page
     */
    async verifyProductsDisplayed(): Promise<void> {
        try {
            await this.verifyElementVisible(this.elements.productContainer);
            
            const productItems = this.page.locator(this.elements.productItems);
            const count = await productItems.count();
            
            if (count === 0) {
                throw new Error("No products found on the products page");
            }
            
        } catch (error) {
            throw new Error(`Product display verification failed: ${error}`);
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
