import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import LoginPage from "../pages/iniciarSesionValidoPage";
import ProductsPage from "../pages/agregarProductoCarritoComprasPage";
import CartPage from "../pages/verProductoCarritoPage";

// Set timeout for all steps in this file
setDefaultTimeout(60000);

let loginPage: LoginPage;
let productsPage: ProductsPage;
let cartPage: CartPage;

Given('que el usuario ha agregado productos al carrito', async () => {
    loginPage = new LoginPage();
    productsPage = new ProductsPage();
    cartPage = new CartPage();
    
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTestUser('standard');
    await productsPage.addFirstProductToCart();
});

When('navega al carrito de compras', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.goToCart();
});

Then('debería ver los productos previamente agregados', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.verifyProductInCart();
});

// Additional step definitions for cart verification
Given('que el usuario ha agregado {int} producto(s) al carrito', async (count: number) => {
    if (!loginPage) {
        loginPage = new LoginPage();
        await loginPage.navigateToLoginPage();
        await loginPage.loginWithTestUser('standard');
    }
    
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.addMultipleProductsToCart(count);
    
    if (!cartPage) {
        cartPage = new CartPage();
    }
});

When('el usuario navega al carrito', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.goToCart();
});

Then('debería ver {int} producto(s) en el carrito', async (expectedCount: number) => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    
    const actualCount = await cartPage.getCartItemCount();
    if (actualCount !== expectedCount) {
        throw new Error(`Expected ${expectedCount} products in cart, but found ${actualCount}`);
    }
});

Then('debería ver el producto {string} en el carrito', async (productName: string) => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.verifySpecificProductInCart(productName);
});

When('remueve el producto {string} del carrito', async (productName: string) => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.removeProductFromCart(productName);
});

When('limpia el carrito', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.clearCart();
});

Then('el carrito debería estar vacío', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.verifyCartIsEmpty();
});

When('continúa comprando', async () => {
    if (!cartPage) {
        cartPage = new CartPage();
    }
    await cartPage.continueShopping();
});
