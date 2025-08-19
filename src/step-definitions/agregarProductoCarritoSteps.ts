import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import LoginPage from "../pages/iniciarSesionValidoPage";
import ProductsPage from "../pages/agregarProductoCarritoComprasPage";

// Set timeout for all steps in this file
setDefaultTimeout(60000);

let loginPage: LoginPage;
let productsPage: ProductsPage;

Given('que el usuario ha iniciado sesión con credenciales válidas', async () => {
    loginPage = new LoginPage();
    productsPage = new ProductsPage();
    
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTestUser('standard');
    await loginPage.verifySuccessfulLogin();
    await productsPage.verifyProductsDisplayed();
});

When('agrega un producto al carrito desde la lista de productos', async () => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.addFirstProductToCart();
    await productsPage.waitBetweenSteps();
});

Then('el ícono del carrito debería mostrar {int} producto', async (expectedCount: number) => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.verifyCartCount(expectedCount);
    await productsPage.waitBetweenSteps();
});

Then('el ícono del carrito debería mostrar {int} productos', async (expectedCount: number) => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.verifyCartCount(expectedCount);
});

// Additional step definitions for cart functionality
When('agrega {int} producto(s) al carrito', async (count: number) => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.addMultipleProductsToCart(count);
});

When('agrega el producto {string} al carrito', async (productName: string) => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.addProductToCartByName(productName);
});

Then('el carrito debería estar vacío', async () => {
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.verifyCartCount(0);
});

Given('que el usuario está en la página de productos', async () => {
    if (!loginPage) {
        loginPage = new LoginPage();
        await loginPage.navigateToLoginPage();
        await loginPage.loginWithTestUser('standard');
    }
    
    if (!productsPage) {
        productsPage = new ProductsPage();
    }
    await productsPage.verifyProductsDisplayed();
});
