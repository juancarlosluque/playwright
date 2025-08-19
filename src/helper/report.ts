import report = require("multiple-cucumber-html-reporter");
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Report generator for Cucumber test results
 */
export class ReportGenerator {
    private static readonly REPORT_CONFIG = {
        jsonDir: "test-results/reports",
        reportPath: "test-results/reports/",
        reportName: "Playwright Automation Report",
        pageTitle: "Pacífico - Test Execution Report",
        displayDuration: true,
        displayReportTime: true,
        durationInMS: false,
        hideMetadata: false,
        customData: {
            title: "Test Execution Information",
            data: [
                { label: "Project", value: "Pacífico - SauceDemo Automation" },
                { label: "Environment", value: process.env.ENV || "unknown" },
                { label: "Browser", value: process.env.BROWSER || "chrome" },
                { label: "Release", value: "1.0.0" },
                { label: "Cycle", value: process.env.TEST_CYCLE || "Regression" },
                { label: "Execution Date", value: new Date().toLocaleString() }
            ],
        }
    };

    /**
     * Generates the HTML report from JSON results
     */
    public static async generateReport(): Promise<void> {
        try {
            console.log("📊 Generating test report...");

            // Ensure report directory exists
            this.ensureReportDirectory();

            // Check if JSON report exists
            const jsonReportPath = path.join(this.REPORT_CONFIG.jsonDir, "cucumber-report.json");
            if (!this.fileExists(jsonReportPath)) {
                console.warn("⚠️ No JSON report found. Skipping HTML report generation.");
                return;
            }

            // Get system information
            const systemInfo = this.getSystemInformation();

            // Generate the report
            report.generate({
                ...this.REPORT_CONFIG,
                metadata: {
                    browser: {
                        name: process.env.BROWSER || "chrome",
                        version: "latest",
                    },
                    device: systemInfo.hostname,
                    platform: {
                        name: systemInfo.platform,
                        version: systemInfo.release,
                    },
                },
            });

            console.log("✅ Test report generated successfully!");
            console.log(`📁 Report location: ${path.resolve(this.REPORT_CONFIG.reportPath)}`);
            
            // Generate summary
            this.generateExecutionSummary(jsonReportPath);

        } catch (error) {
            console.error("❌ Failed to generate test report:", error);
            throw error;
        }
    }

    /**
     * Ensures the report directory exists
     */
    private static ensureReportDirectory(): void {
        const reportDir = this.REPORT_CONFIG.reportPath;
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
            console.log(`📁 Created report directory: ${reportDir}`);
        }
    }

    /**
     * Checks if a file exists
     */
    private static fileExists(filePath: string): boolean {
        try {
            return fs.existsSync(filePath);
        } catch {
            return false;
        }
    }

    /**
     * Gets system information for the report
     */
    private static getSystemInformation() {
        return {
            hostname: os.hostname(),
            platform: os.platform(),
            release: os.release(),
            arch: os.arch(),
            memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`
        };
    }

    /**
     * Generates execution summary from JSON report
     */
    private static generateExecutionSummary(jsonReportPath: string): void {
        try {
            const jsonData = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
            
            let totalScenarios = 0;
            let passedScenarios = 0;
            let failedScenarios = 0;
            let totalSteps = 0;
            let passedSteps = 0;
            let failedSteps = 0;
            let skippedSteps = 0;

            jsonData.forEach((feature: any) => {
                feature.elements?.forEach((scenario: any) => {
                    if (scenario.type === 'scenario') {
                        totalScenarios++;
                        
                        let scenarioPassed = true;
                        scenario.steps?.forEach((step: any) => {
                            totalSteps++;
                            if (step.result?.status === 'passed') {
                                passedSteps++;
                            } else if (step.result?.status === 'failed') {
                                failedSteps++;
                                scenarioPassed = false;
                            } else if (step.result?.status === 'skipped') {
                                skippedSteps++;
                                scenarioPassed = false;
                            }
                        });

                        if (scenarioPassed) {
                            passedScenarios++;
                        } else {
                            failedScenarios++;
                        }
                    }
                });
            });

            const summary = {
                execution: {
                    timestamp: new Date().toISOString(),
                    environment: process.env.ENV,
                    browser: process.env.BROWSER
                },
                scenarios: {
                    total: totalScenarios,
                    passed: passedScenarios,
                    failed: failedScenarios,
                    passRate: totalScenarios > 0 ? Math.round((passedScenarios / totalScenarios) * 100) : 0
                },
                steps: {
                    total: totalSteps,
                    passed: passedSteps,
                    failed: failedSteps,
                    skipped: skippedSteps,
                    passRate: totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0
                }
            };

            // Write summary to file
            const summaryPath = path.join(this.REPORT_CONFIG.reportPath, "execution-summary.json");
            fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

            // Print summary to console
            console.log("\n📊 Execution Summary:");
            console.log(`   Scenarios: ${passedScenarios}/${totalScenarios} passed (${summary.scenarios.passRate}%)`);
            console.log(`   Steps: ${passedSteps}/${totalSteps} passed (${summary.steps.passRate}%)`);
            
            if (failedScenarios > 0) {
                console.log(`   ❌ ${failedScenarios} scenario(s) failed`);
            }

        } catch (error) {
            console.warn("⚠️ Could not generate execution summary:", error);
        }
    }

    /**
     * Cleans old report files
     */
    public static cleanOldReports(daysToKeep: number = 7): void {
        try {
            const reportDir = this.REPORT_CONFIG.reportPath;
            if (!fs.existsSync(reportDir)) {
                return;
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const files = fs.readdirSync(reportDir);
            let cleanedCount = 0;

            files.forEach(file => {
                const filePath = path.join(reportDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate && file.endsWith('.html')) {
                    fs.unlinkSync(filePath);
                    cleanedCount++;
                }
            });

            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned ${cleanedCount} old report file(s)`);
            }

        } catch (error) {
            console.warn("⚠️ Could not clean old reports:", error);
        }
    }
}

// Main execution
if (require.main === module) {
    ReportGenerator.generateReport()
        .then(() => {
            ReportGenerator.cleanOldReports();
            process.exit(0);
        })
        .catch((error) => {
            console.error("Report generation failed:", error);
            process.exit(1);
        });
}