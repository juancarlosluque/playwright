/**
 * Cucumber.js configuration file
 * Supports multiple execution modes and environments
 */

const common = {
    // Feature file patterns
    paths: [
        "src/features/**/*.feature"
    ],
    
    // Step definitions and hooks
    require: [
        "src/step-definitions/**/*.ts",
        "src/hooks/**/*.ts"
    ],
    
    // TypeScript support
    requireModule: [
        "ts-node/register"
    ],
    
    // Output formats
    format: [
        "progress-bar",
        "html:./test-results/reports/cucumber-report.html",
        "json:./test-results/reports/cucumber-report.json",
        ...(process.env.CI ? ["junit:./test-results/reports/junit-report.xml"] : [])
    ],
    
    // Format options
    formatOptions: {
        snippetInterface: "async-await",
        colorsEnabled: true
    },
    
    // Execution options
    dryRun: false,
    failFast: process.env.FAIL_FAST === "true",
    strict: true,
    
    // Step timeout configuration (in milliseconds)
    timeout: 60000, // 60 seconds for steps to complete
    
    // Parallel execution
    parallel: getParallelWorkers(),
    
    // Tags for test filtering
    tags: process.env.npm_config_tags || process.env.TAGS || "",
    
    // Retry configuration
    retry: process.env.CI ? 2 : 1, // At least 1 retry for stability
    
    // World parameters (shared test context)
    worldParameters: {
        environment: process.env.ENV || "dev",
        browser: process.env.BROWSER || "chrome",
        headless: process.env.HEADLESS === "true",
        baseUrl: process.env.BASEURL
    }
};

/**
 * Determines the number of parallel workers based on environment
 */
function getParallelWorkers() {
    if (process.env.PARALLEL) {
        return parseInt(process.env.PARALLEL);
    }
    
    // Default parallel settings
    if (process.env.CI) {
        return 2; // Conservative for CI
    } else if (process.env.ENV === "dev") {
        return 1; // Sequential for debugging
    } else {
        return Math.max(1, require('os').cpus().length - 1);
    }
}

/**
 * Environment-specific configurations
 */
const environments = {
    dev: {
        ...common,
        parallel: 1, // Always sequential in dev for easier debugging
        retry: 0, // No retries in dev
        format: [
            "progress-bar",
            "html:./test-results/reports/cucumber-report.html",
            "json:./test-results/reports/cucumber-report.json"
        ]
    },
    
    uat: {
        ...common,
        parallel: 2,
        retry: 1,
        retryTagFilter: "@flaky"
    },
    
    prod: {
        ...common,
        parallel: 1,
        retry: 2,
        retryTagFilter: "@flaky",
        strict: true,
        failFast: true
    },
    
    ci: {
        ...common,
        parallel: 2,
        retry: 2,
        retryTagFilter: "@flaky",
        format: [
            "progress",
            "html:./test-results/reports/cucumber-report.html",
            "json:./test-results/reports/cucumber-report.json",
            "junit:./test-results/reports/junit-report.xml"
        ]
    }
};

// Export configuration based on environment or use common as default
const currentEnv = process.env.ENV || "dev";
const envConfig = environments[currentEnv] || common;

// Add profile-specific overrides
if (process.env.PROFILE) {
    const profiles = {
        smoke: {
            tags: "@smoke",
            parallel: 1
        },
        regression: {
            tags: "not @skip",
            parallel: getParallelWorkers()
        },
        critical: {
            tags: "@critical",
            parallel: 2,
            failFast: true
        }
    };
    
    const profileConfig = profiles[process.env.PROFILE];
    if (profileConfig) {
        Object.assign(envConfig, profileConfig);
    }
}

module.exports = {
    default: envConfig
};