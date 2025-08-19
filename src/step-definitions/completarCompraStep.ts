import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import LoginPage from "../pages/iniciarSesionValidoPage";
import ProductsPage from "../pages/agregarProductoCarritoComprasPage";
import CartPage from "../pages/verProductoCarritoPage";
import CheckoutPage from "../pages/completarCompraPage";
import { ShippingInfo } from "../helper/types/env";

// Set timeout for all steps in this file
setDefaultTimeout(60000);

let loginPage: LoginPage;
let productsPage: ProductsPage;
let cartPage: CartPage;
let checkoutPage: CheckoutPage;

// Default test shipping information
const defaultShippingInfo: ShippingInfo = {
    firstName: "Jorge",
    lastName: "Muñoz",
    postalCode: "12345"
};

Given('que el usuario tiene productos en el carrito', async () => {
    loginPage = new LoginPage();
    productsPage = new ProductsPage();
    cartPage = new CartPage();
    checkoutPage = new CheckoutPage();
    
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTestUser('standard');
    await productsPage.addFirstProductToCart();
    await cartPage.goToCart();
});

When('procede al checkout', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.startCheckout();
});

When('completa la información de envío', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.fillShippingInfoFromObject(defaultShippingInfo);
});

When('confirma la compra', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.finishCheckout();
});

Then('debería ver un mensaje de confirmación de compra exitosa', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.verifySuccessMessage();
});

// Additional step definitions for checkout process
When('completa la información de envío con nombre {string}, apellido {string} y código postal {string}', 
async (firstName: string, lastName: string, postalCode: string) => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    
    const customShippingInfo: ShippingInfo = {
        firstName,
        lastName,
        postalCode
    };
    
    await checkoutPage.fillShippingInfoFromObject(customShippingInfo);
});

When('el usuario procede al checkout completo', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.completeCheckoutWithTestData();
});

Then('debería ver el resumen de la orden', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    
    // Verify we can get order summary without errors
    const summary = await checkoutPage.getOrderSummary();
    
    if (summary.total <= 0) {
        throw new Error("Order total should be greater than 0");
    }
});

When('cancela el proceso de checkout', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.cancelCheckout();
});

When('intenta continuar sin completar campos requeridos', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.validateRequiredFields();
});

Then('debería ver un mensaje de error de campos requeridos', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.verifyCheckoutError();
});

When('regresa a la página de productos', async () => {
    if (!checkoutPage) {
        checkoutPage = new CheckoutPage();
    }
    await checkoutPage.backToProducts();
});

Given('que el usuario ha completado una compra exitosa', async () => {
    // Setup complete flow
    loginPage = new LoginPage();
    productsPage = new ProductsPage();
    cartPage = new CartPage();
    checkoutPage = new CheckoutPage();
    
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTestUser('standard');
    await productsPage.addFirstProductToCart();
    await cartPage.goToCart();
    await checkoutPage.completeCheckoutWithTestData();
});
