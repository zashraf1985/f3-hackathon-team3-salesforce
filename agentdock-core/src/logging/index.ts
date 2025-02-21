/**
 * @fileoverview Core logging system for AgentDock.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum LogCategory {
  AGENT = 'agent',
  NODE = 'node',
  CONFIG = 'config',
  LLM = 'llm',
  API = 'api',
  STORAGE = 'storage',
  SYSTEM = 'system'
}

class Logger {
  private static instance: Logger;
  private static levelColors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m'  // Red
  };

  private static reset = '\x1b[0m';
  private logLevel: LogLevel = LogLevel.DEBUG;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatConsole(level: LogLevel, category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    const color = Logger.levelColors[level];
    const timestamp = new Date().toISOString();
    const prefix = `${color}[${level.toUpperCase()}]${Logger.reset}`;
    const categoryStr = `[${category}]`;
    const componentStr = `[${component}]`;
    
    console.log(`${prefix} ${timestamp} ${categoryStr} ${componentStr} ${message}`);
    if (metadata && Object.keys(metadata).length > 0) {
      console.log('Metadata:', metadata);
    }
  }

  private formatBrowser(level: LogLevel, category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    const styles = {
      [LogLevel.DEBUG]: 'color: #0ea5e9', // Blue
      [LogLevel.INFO]: 'color: #22c55e',  // Green
      [LogLevel.WARN]: 'color: #eab308',  // Yellow
      [LogLevel.ERROR]: 'color: #ef4444'  // Red
    };

    const timestamp = new Date().toISOString();
    console.groupCollapsed(
      `%c[${level.toUpperCase()}]%c ${timestamp} %c[${category}]%c [${component}] ${message}`,
      styles[level],
      'color: gray',
      'color: purple',
      'color: black'
    );
    if (metadata) {
      console.log('Metadata:', metadata);
    }
    console.trace('Stack trace:');
    console.groupEnd();
  }

  async debug(category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (typeof window === 'undefined') {
      this.formatConsole(LogLevel.DEBUG, category, component, message, metadata);
    } else {
      this.formatBrowser(LogLevel.DEBUG, category, component, message, metadata);
    }
  }

  async info(category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    if (typeof window === 'undefined') {
      this.formatConsole(LogLevel.INFO, category, component, message, metadata);
    } else {
      this.formatBrowser(LogLevel.INFO, category, component, message, metadata);
    }
  }

  async warn(category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    if (typeof window === 'undefined') {
      this.formatConsole(LogLevel.WARN, category, component, message, metadata);
    } else {
      this.formatBrowser(LogLevel.WARN, category, component, message, metadata);
    }
  }

  async error(category: LogCategory, component: string, message: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    if (typeof window === 'undefined') {
      this.formatConsole(LogLevel.ERROR, category, component, message, metadata);
    } else {
      this.formatBrowser(LogLevel.ERROR, category, component, message, metadata);
    }
  }
}

export const logger = Logger.getInstance(); 