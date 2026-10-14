Feature: Proceso de compra en Sauce Demo


Scenario: Inicio de sesión con credenciales válidas
    Given que el usuario navega hacia la página de inicio de sesión de Sauce Demo
    When ingresa el nombre de usuario "standard_user" y la contraseña "secret_sauce"
    Then debería ser redirigido a la página de productos


Scenario: Inicio de sesión con credenciales inválidas
    Given que un usuario navega hacia la página de inicio de sesión de Sauce Demo
    When ingreso el nombre de usuario "usuario_invalido" y la contraseña "clave_invalida"
    Then debería ver un mensaje de error indicando que las credenciales son incorrectas

Scenario: Agregar un producto al carrito desde la página de productos
    Given que el usuario ha iniciado sesión con credenciales válidas
    When agrega un producto al carrito desde la lista de productos
    Then el ícono del carrito debería mostrar 1 producto

Scenario: Ver productos en el carrito de compras
    Given que el usuario ha agregado productos al carrito
    When navega al carrito de compras
    Then debería ver los productos previamente agregados

Scenario: Completar el proceso de compra
    Given que el usuario tiene productos en el carrito
    When procede al checkout
    And completa la información de envío
    And confirma la compra
    Then debería ver un mensaje de confirmación de compra exitosa