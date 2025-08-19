/**
 * Test configuration constants and settings
 */
export const TestConfig = {
    // Timeout configurations
    timeouts: {
        default: 15000,
        extended: 25000,
        short: 8000,
        navigation: 30000,
        action: 5000, // For clicks, typing, etc.
        verification: 10000 // For assertions and verifications
    },

    // Wait strategies and delays
    waitStrategies: {
        networkIdle: 'networkidle' as const,
        domContentLoaded: 'domcontentloaded' as const,
        load: 'load' as const
    },

    // Interaction delays (in milliseconds)
    delays: {
        betweenActions: 800, // Delay between user actions
        afterNavigation: 1500, // Wait after page navigation
        afterClick: 600, // Wait after clicking elements
        afterType: 400, // Wait after typing text
        beforeVerification: 1000, // Wait before assertions
        betweenSteps: 800 // Wait between test steps
    },

    // Test data
    testUsers: {
        standard: {
            username: 'standard_user',
            password: 'secret_sauce'
        },
        locked: {
            username: 'locked_out_user',
            password: 'secret_sauce'
        },
        problem: {
            username: 'problem_user',
            password: 'secret_sauce'
        }
    },

    // Selectors optimization
    selectorStrategies: {
        preferDataTestId: true,
        fallbackToXPath: true,
        useStableSelectors: true
    },

    // Performance settings
    performance: {
        lazyLoadPages: true,
        reuseContext: false,
        parallelExecution: true
    },

    // Error handling
    errorHandling: {
        maxRetries: 3,
        retryDelay: 1000,
        takeScreenshotOnFailure: true,
        detailedErrorMessages: true
    }
};

/**
 * Environment-specific configurations
 */
export const EnvironmentConfig = {
    dev: {
        baseUrl: 'https://www.saucedemo.com',
        apiTimeout: 10000,
        slowMo: 100
    },
    uat: {
        baseUrl: 'https://uat.saucedemo.com',
        apiTimeout: 15000,
        slowMo: 50
    },
    prod: {
        baseUrl: 'https://www.saucedemo.com',
        apiTimeout: 20000,
        slowMo: 0
    }
};
