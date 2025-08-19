import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import LoginPage from "../pages/iniciarSesionValidoPage";
import { TestConfig } from "../helper/config/testConfig";

// Set timeout for all steps in this file
setDefaultTimeout(60000);

let loginPage: LoginPage;

// Initialize page object before scenarios
Given('que el usuario navega hacia la página de inicio de sesión de Sauce Demo', async () => {
    loginPage = new LoginPage();
    await loginPage.navigateToLoginPage();
    await loginPage.waitBetweenSteps();
});

When('ingresa el nombre de usuario {string} y la contraseña {string}', async (username: string, password: string) => {
    if (!loginPage) {
        loginPage = new LoginPage();
    }
    await loginPage.login(username, password);
    await loginPage.waitBetweenSteps();
});

Then('debería ser redirigido a la página de productos', async () => {
    if (!loginPage) {
        loginPage = new LoginPage();
    }
    await loginPage.verifySuccessfulLogin();
    await loginPage.waitBetweenSteps();
});

// Alternative step definitions for different scenarios
Given('que el usuario ha iniciado sesión exitosamente', async () => {
    loginPage = new LoginPage();
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithTestUser('standard');
    await loginPage.verifySuccessfulLogin();
});

When('el usuario inicia sesión con credenciales válidas', async () => {
    if (!loginPage) {
        loginPage = new LoginPage();
        await loginPage.navigateToLoginPage();
    }
    await loginPage.loginWithTestUser('standard');
});

When('el usuario inicia sesión con el usuario {string}', async (userType: string) => {
    if (!loginPage) {
        loginPage = new LoginPage();
        await loginPage.navigateToLoginPage();
    }
    
    const validUserTypes = ['standard', 'locked', 'problem'] as const;
    if (!validUserTypes.includes(userType as any)) {
        throw new Error(`Invalid user type: ${userType}. Valid types: ${validUserTypes.join(', ')}`);
    }
    
    await loginPage.loginWithTestUser(userType as keyof typeof TestConfig.testUsers);
});