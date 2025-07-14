/**
 * Simple server-side logger utility
 * Replacement for the deleted middleware logger
 */

import { env } from '@/env.server';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogParams =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | Record<string, unknown>
  | readonly LogParams[];

// Environment-aware logging
const SHOW_LOGS = env.NODE_ENV === 'development' || env.LOG_SERVICES === 'true';

class ServerLogger {
  private prefix: string;

  constructor(prefix: string = 'Server') {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: string, ...args: LogParams[]): void {
    if (!SHOW_LOGS && level !== 'error') return;

    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${this.prefix}:${level}]`;

    switch (level) {
      case 'debug': {
        console.debug(logPrefix, message, ...args);
        break;
      }
      case 'info': {
        console.log(logPrefix, message, ...args);
        break;
      }
      case 'warn': {
        console.warn(logPrefix, message, ...args);
        break;
      }
      case 'error': {
        console.error(logPrefix, message, ...args);
        break;
      }
    }
  }

  debug(message: string, ...args: LogParams[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: LogParams[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: LogParams[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: LogParams[]): void {
    this.log('error', message, ...args);
  }

  // Create a child logger with extended prefix
  child(prefix: string): ServerLogger {
    return new ServerLogger(`${this.prefix}:${prefix}`);
  }
}

// Export default logger instance
export const logger = new ServerLogger();
