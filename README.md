# 🎭 Playwright Test Automation Framework

Automated testing framework using Playwright and Cucumber for end-to-end testing of the SauceDemo application.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Reports](#reports)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Cross-browser testing** (Chrome, Firefox, WebKit)
- **Multi-environment support** (dev, uat, prod)
- **Page Object Model** implementation
- **Cucumber BDD** scenarios
- **HTML reporting** with screenshots
- **TypeScript** support
- **Parallel execution** support
- **CI/CD ready**

## 🔧 Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

## 📦 Installation

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd playwrightLab
npm install
```

### Step 2: Install Playwright Browsers

```bash
npm run install:browsers
```

### Step 3: Verify Installation

```bash
npm run type-check
```

## ⚙️ Configuration

### Environment Variables

The framework supports multiple environments through environment files:

- `src/helper/env/.env.dev` - Development environment
- `src/helper/env/.env.uat` - UAT environment  
- `src/helper/env/.env.prod` - Production environment

### Browser Configuration

Supported browsers:
- `chrome` (default)
- `firefox`
- `webkit`

## 🚀 Running Tests

### Quick Start

```bash
# Run tests in development environment with Chrome
npm run test:dev

# Run tests in UAT environment
npm run test:uat
```

### Advanced Usage

```bash
# Run with Firefox
npm run test:dev:firefox

# Run with WebKit
npm run test:dev:webkit

# Run in headless mode
npm run test:headless

# Run with parallel execution
npm run test:parallel
```

### Custom Commands

```bash
# Run specific scenarios by tags
npx cucumber-js --tags "@smoke"

# Run with custom environment
cross-env ENV=dev BROWSER=firefox npm run test:dev
```

## 📁 Project Structure

```
playwrightLab/
├── src/
│   ├── features/           # Cucumber feature files
│   ├── pages/             # Page Object Model classes
│   ├── step-definitions/  # Cucumber step definitions
│   ├── hooks/             # Test hooks (setup/teardown)
│   └── helper/
│       ├── browsers/      # Browser management
│       ├── config/        # Test configuration
│       ├── env/          # Environment setup
│       ├── pages/        # Base page class
│       └── types/        # TypeScript definitions
├── test-results/
│   ├── reports/          # HTML reports
│   ├── screenshots/      # Failure screenshots
│   └── videos/          # Test execution videos
├── config/               # Cucumber configuration
└── package.json
```

## 📝 Writing Tests

### Feature Files

Create feature files in `src/features/`:

```gherkin
Feature: User Login

  Scenario: Successful login
    Given the user navigates to login page
    When enters valid credentials
    Then should see the products page
```

### Page Objects

Extend the BasePage class:

```typescript
import { BasePage } from "../helper/pages/basePage";

export default class LoginPage extends BasePage {
    protected elements = {
        usernameInput: "[data-test='username']",
        passwordInput: "[data-test='password']",
        loginButton: "[data-test='login-button']"
    };

    async login(username: string, password: string): Promise<void> {
        await this.typeText(this.elements.usernameInput, username);
        await this.typeText(this.elements.passwordInput, password);
        await this.clickElement(this.elements.loginButton);
    }
}
```

### Step Definitions

```typescript
import { Given, When, Then } from "@cucumber/cucumber";
import LoginPage from "../pages/loginPage";

let loginPage: LoginPage;

Given('the user navigates to login page', async () => {
    loginPage = new LoginPage();
    await loginPage.navigateToLoginPage();
});
```

## 📊 Reports

### Generate Reports

```bash
# Generate HTML report
npm run report

# Clean old reports
npm run clean:reports
```

### Report Features

- **HTML dashboard** with test results
- **Screenshots** on failures
- **Execution summary** with pass/fail rates
- **Environment information**
- **Test duration** and timing details

Reports are generated in `test-results/reports/`

## 🧹 Maintenance

### Cleanup Commands

```bash
# Clean all generated files
npm run clean

# Clean only reports
npm run clean:reports

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔍 Troubleshooting

### Common Issues

1. **Browser not found**
   ```bash
   npm run install:browsers
   ```

2. **Environment variable not set**
   ```bash
   cross-env ENV=dev BROWSER=chrome npm run test:dev
   ```

3. **Port conflicts**
   - Check if other applications are using the same ports
   - Kill existing browser processes

4. **Timeout issues**
   - Increase timeout values in `testConfig.ts`
   - Check network connectivity

### Debug Mode

```bash
# Enable step screenshots
cross-env STEP_SCREENSHOTS=true npm run test:dev

# Run with slow motion
cross-env SLOW_MO=1000 npm run test:dev
```

### Support

For issues and questions:
1. Check the troubleshooting section
2. Review test logs in `test-results/`
3. Check browser console for errors
4. Verify environment configuration

## 🏗️ Architecture

### Design Patterns

- **Page Object Model**: Encapsulates page elements and actions
- **Factory Pattern**: Browser and environment management
- **Singleton Pattern**: Configuration management
- **Builder Pattern**: Test data creation

### Key Components

- **BasePage**: Common page functionality
- **BrowserManager**: Cross-browser support
- **EnvironmentManager**: Environment configuration
- **ReportGenerator**: Test reporting

## 🚀 CI/CD Integration

The framework is ready for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run install:browsers
    npm run test:dev
    npm run report
```

## 📄 License

This project is licensed under the ISC License.