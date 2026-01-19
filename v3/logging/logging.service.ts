import { ELogSeverityLevel } from './types';

//TODO: implement configuration of logging using env variables
export class LoggerService {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.DEFAULT, message, context);
  }

  debug(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.DEBUG, message, context);
  }

  info(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.INFO, message, context);
  }

  notice(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.NOTICE, message, context);
  }

  warning(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.WARNING, message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printLog(ELogSeverityLevel.ERROR, message, context, trace);
  }

  critical(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.CRITICAL, message, context);
  }

  alert(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.ALERT, message, context);
  }

  emergency(message: any, context?: string) {
    this.printLog(ELogSeverityLevel.EMERGENCY, message, context);
  }

  private printLog(level: ELogSeverityLevel, message: any, context?: string, trace?: string) {
    // Google Cloud Run structured logging format
    const logEntry = {
      severity: level,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      component: context || this.context,
      timestamp: new Date().toISOString(),
      ...(trace && {
        stack_trace: trace,
      }),
    };

    // For Cloud Run, ALWAYS use console.log - Cloud Logging reads the severity field
    console.log(JSON.stringify(logEntry));
  }
}

export const loggerService = new LoggerService('qapline-backend');
