import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import InvalidLoginPage from "../pages/iniciarSesionInvalidoPage";

// Set timeout for all steps in this file
setDefaultTimeout(60000);

let invalidLoginPage: InvalidLoginPage;

Given('que un usuario navega hacia la página de inicio de sesión de Sauce Demo', async () => {
    invalidLoginPage = new InvalidLoginPage();
    await invalidLoginPage.navigateToLoginPage();
});

When('ingreso el nombre de usuario {string} y la contraseña {string}', async (username: string, password: string) => {
    if (!invalidLoginPage) {
        invalidLoginPage = new InvalidLoginPage();
    }
    await invalidLoginPage.attemptInvalidLogin(username, password);
});

Then('debería ver un mensaje de error indicando que las credenciales son incorrectas', async () => {
    if (!invalidLoginPage) {
        invalidLoginPage = new InvalidLoginPage();
    }
    await invalidLoginPage.verifyInvalidLoginError();
});

// Additional step definitions for invalid login scenarios
When('el usuario intenta iniciar sesión con credenciales inválidas', async () => {
    if (!invalidLoginPage) {
        invalidLoginPage = new InvalidLoginPage();
        await invalidLoginPage.navigateToLoginPage();
    }
    await invalidLoginPage.attemptInvalidLogin("invalid_user", "invalid_password");
});

When('el usuario intenta iniciar sesión con usuario bloqueado', async () => {
    if (!invalidLoginPage) {
        invalidLoginPage = new InvalidLoginPage();
        await invalidLoginPage.navigateToLoginPage();
    }
    await invalidLoginPage.attemptInvalidLogin("locked_out_user", "secret_sauce");
});

Then('debería ver un mensaje de error de usuario bloqueado', async () => {
    if (!invalidLoginPage) {
        invalidLoginPage = new InvalidLoginPage();
    }
    await invalidLoginPage.verifyInvalidLoginError();
});