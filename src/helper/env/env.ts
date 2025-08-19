import * as dotenv from 'dotenv';
import { EnvironmentConfig } from '../config/testConfig';

/**
 * Environment configuration loader
 */
export class EnvironmentManager {
    private static instance: EnvironmentManager;
    private isLoaded = false;

    private constructor() {}

    public static getInstance(): EnvironmentManager {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }

    /**
     * Loads environment configuration based on ENV variable
     */
    public loadEnvironment(): void {
        if (this.isLoaded) {
            return; // Prevent multiple loads
        }

        const environment = process.env.ENV;
        
        if (!environment) {
            throw new Error("❌ ENV environment variable is required. Use: dev, uat, or prod");
        }

        try {
            // Load environment-specific .env file
            const envPath = `src/helper/env/.env.${environment}`;
            const result = dotenv.config({
                override: true,
                path: envPath
            });

            if (result.error) {
                console.warn(`⚠️ Could not load ${envPath}, using defaults`);
            }

            // Set default values based on environment
            this.setEnvironmentDefaults(environment as keyof typeof EnvironmentConfig);
            
            // Validate required environment variables
            this.validateEnvironment();
            
            this.isLoaded = true;
            console.log(`✅ Environment loaded: ${environment}`);
            
        } catch (error) {
            throw new Error(`❌ Failed to load environment "${environment}": ${error}`);
        }
    }

    /**
     * Sets default values for environment-specific configurations
     */
    private setEnvironmentDefaults(environment: keyof typeof EnvironmentConfig): void {
        const config = EnvironmentConfig[environment];
        
        if (!config) {
            throw new Error(`❌ Environment "${environment}" is not supported. Use: dev, uat, or prod`);
        }

        // Set BASEURL if not already set
        if (!process.env.BASEURL) {
            process.env.BASEURL = config.baseUrl;
        }

        // Set browser default if not set
        if (!process.env.BROWSER) {
            process.env.BROWSER = "chrome";
        }

        // Set headless default if not set
        if (!process.env.HEADLESS) {
            process.env.HEADLESS = environment === "prod" ? "true" : "false";
        }
    }

    /**
     * Validates that all required environment variables are set
     */
    private validateEnvironment(): void {
        const required = ['ENV', 'BASEURL', 'BROWSER'];
        const missing: string[] = [];

        for (const variable of required) {
            if (!process.env[variable]) {
                missing.push(variable);
            }
        }

        if (missing.length > 0) {
            throw new Error(
                `❌ Missing required environment variables: ${missing.join(', ')}`
            );
        }

        // Validate browser value
        const validBrowsers = ['chrome', 'firefox', 'webkit'];
        const browser = process.env.BROWSER?.toLowerCase();
        if (browser && !validBrowsers.includes(browser)) {
            throw new Error(
                `❌ Invalid browser "${browser}". Supported browsers: ${validBrowsers.join(', ')}`
            );
        }

        // Validate environment value
        const validEnvironments = ['dev', 'uat', 'prod'];
        const env = process.env.ENV?.toLowerCase();
        if (env && !validEnvironments.includes(env)) {
            throw new Error(
                `❌ Invalid environment "${env}". Supported environments: ${validEnvironments.join(', ')}`
            );
        }
    }

    /**
     * Gets the current environment configuration
     */
    public getEnvironmentConfig() {
        if (!this.isLoaded) {
            this.loadEnvironment();
        }

        const environment = process.env.ENV as keyof typeof EnvironmentConfig;
        return EnvironmentConfig[environment];
    }

    /**
     * Prints current environment configuration for debugging
     */
    public printEnvironmentInfo(): void {
        if (!this.isLoaded) {
            this.loadEnvironment();
        }

        console.log("🔧 Environment Configuration:");
        console.log(`   ENV: ${process.env.ENV}`);
        console.log(`   BROWSER: ${process.env.BROWSER}`);
        console.log(`   BASEURL: ${process.env.BASEURL}`);
        console.log(`   HEADLESS: ${process.env.HEADLESS}`);
    }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use EnvironmentManager.getInstance().loadEnvironment() instead
 */
export const getEnv = (): void => {
    EnvironmentManager.getInstance().loadEnvironment();
};

// Export singleton instance
export const environmentManager = EnvironmentManager.getInstance();