declare module 'multiple-cucumber-html-reporter' {
  interface ReportOptions {
    jsonDir?: string;
    reportPath?: string;
    reportName?: string;
    pageTitle?: string;
    displayDuration?: boolean;
    displayReportTime?: boolean;
    durationInMS?: boolean;
    hideMetadata?: boolean;
    metadata?: {
      browser?: {
        name?: string;
        version?: string;
      };
      device?: string;
      platform?: {
        name?: string;
        version?: string;
      };
    };
    customData?: {
      title?: string;
      data?: Array<{
        label?: string;
        value?: string;
      }>;
    };
  }

  interface Reporter {
    generate(options: ReportOptions): void;
  }

  const reporter: Reporter;
  export = reporter;
}
