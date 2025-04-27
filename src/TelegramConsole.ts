import { TelegramBotHandler } from './utils/telegramBotHandler';
import { TelegramConsoleConfig, LogMessage, LogLevel } from './types';
import { DEFAULT_CONFIG } from './defaults';

// Maximum allowed log length (Telegram's message limit)
const MAX_ALLOWED_LENGTH = 4096;
// Minimum allowed log length (to ensure meaningful messages)
const MIN_ALLOWED_LENGTH = 32;

export class TelegramConsole {
  private botHandler: TelegramBotHandler;
  private originalConsole: Console;
  private minLogLevel: LogLevel;
  private maxLogLength: number;
  private overrideConsole: boolean;
  // Queue to store logs in the order they were created
  private logQueue: LogMessage[] = [];
  // Flag to prevent concurrent processing of the queue
  private isProcessing: boolean = false;

  constructor(config: TelegramConsoleConfig) {
    this.botHandler = new TelegramBotHandler(config);
    this.originalConsole = { ...console };
    this.minLogLevel = config.minLogLevel ?? DEFAULT_CONFIG.MIN_LOG_LEVEL;
    this.overrideConsole = config.overrideConsole ?? DEFAULT_CONFIG.OVERRIDE_CONSOLE;
    // Ensure maxLogLength is within valid range
    this.maxLogLength = Math.max(
      MIN_ALLOWED_LENGTH,
      Math.min(
        config.maxLogLength ?? DEFAULT_CONFIG.MAX_LOG_LENGTH,
        MAX_ALLOWED_LENGTH
      )
    );

    if (this.overrideConsole) {
      this.overrideConsoleMethods();
    }
  }

  // Public logging methods
  public log(...args: any[]): void {
    this.queueLog('log', ...args);
  }

  public info(...args: any[]): void {
    this.queueLog('info', ...args);
  }

  public warn(...args: any[]): void {
    this.queueLog('warn', ...args);
  }

  public error(...args: any[]): void {
    this.queueLog('error', ...args);
  }

  /**
   * Set the minimum log level
   */
  setMinLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }

  /**
   * Set the maximum log length
   * @param length - Maximum length in characters (will be capped between 32 and 4096)
   */
  setMaxLogLength(length: number): void {
    this.maxLogLength = Math.max(
      MIN_ALLOWED_LENGTH,
      Math.min(length, MAX_ALLOWED_LENGTH)
    );
  }

  /**
   * Restore original console methods
   */
  restoreConsole(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      log: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.minLogLevel];
  }

  private overrideConsoleMethods(): void {
    // Override console.log
    console.log = (...args) => {
      this.originalConsole.log(...args);
      if (this.shouldLog('log')) {
        this.queueLog('log', ...args);
      }
    };

    // Override console.info
    console.info = (...args) => {
      this.originalConsole.info(...args);
      if (this.shouldLog('info')) {
        this.queueLog('info', ...args);
      }
    };

    // Override console.warn
    console.warn = (...args) => {
      this.originalConsole.warn(...args);
      if (this.shouldLog('warn')) {
        this.queueLog('warn', ...args);
      }
    };

    // Override console.error
    console.error = (...args) => {
      this.originalConsole.error(...args);
      if (this.shouldLog('error')) {
        this.queueLog('error', ...args);
      }
    };
  }

  private extractMessageAndMetadata(args: any[]): { message: string; metadata: Record<string, any> } {
    const metadata: Record<string, any> = {};
    const messageParts: string[] = [];

    args.forEach(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // If it's an Error object, handle it specially
        if (arg instanceof Error) {
          messageParts.push(arg.message);
        } else {
          // For other objects, add them to metadata
          Object.assign(metadata, arg);
        }
      } else {
        messageParts.push(String(arg));
      }
    });

    return {
      message: messageParts.join(' '),
      metadata,
    };
  }

  /**
   * Formats a log message for Telegram
   * @param level - The log level
   * @param message - The log message
   * @param metadata - Additional metadata
   * @returns Formatted message string
   */
  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${level.toUpperCase()}] ${timestamp}\n${message}`;

    // Add metadata if present
    if (metadata && Object.keys(metadata).length > 0) {
      formattedMessage += '\n\nMetadata:';
      for (const [key, value] of Object.entries(metadata)) {
        formattedMessage += `\n${key}: ${JSON.stringify(value)}`;
      }
    }

    return formattedMessage;
  }

  /**
   * Adds a log to the queue and triggers processing
   * This method is synchronous to ensure logs are queued immediately
   * without waiting for network operations
   * 
   * @param level - The log level
   * @param message - The log message
   * @param metadata - Additional metadata for the log
   */
  private queueLog(level: LogLevel, ...args: any[]): void {
    // If the log level is below the minimum log level, do nothing
    // This applies for calls directly to the TelegramConsole instance
    if (!this.shouldLog(level)) {
      return;
    }

    const { message, metadata } = this.extractMessageAndMetadata(args);
    const formattedMessage = this.formatMessage(level, message, metadata);

    // Truncate the message if it exceeds the maximum length
    const truncatedMessage = formattedMessage.length > this.maxLogLength
      ? formattedMessage.substring(0, this.maxLogLength - 3) + '...'
      : formattedMessage;

    const log: LogMessage = {
      level,
      message: truncatedMessage,
      timestamp: new Date().toISOString(),
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Add the log to the queue
    this.logQueue.push(log);
    // Start processing the queue
    this.processQueue();
  }

  /**
   * Processes the log queue sequentially
   * This method ensures logs are sent to Telegram in the correct order
   * and handles any errors that occur during sending
   * 
   * The method is asynchronous but doesn't block the main thread
   * Logs are processed one at a time to maintain order
   */
  private async processQueue(): Promise<void> {
    // If already processing or queue is empty, do nothing
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    // Set processing flag to prevent concurrent processing
    this.isProcessing = true;

    try {
      // Process logs in order until queue is empty
      while (this.logQueue.length > 0) {
        // Get the next log from the queue
        const log = this.logQueue[0];
        // Send the log to Telegram
        await this.botHandler.sendLog(log);
        // Remove the processed log from the queue
        this.logQueue.shift();
      }
    } catch (error) {
      // Log any errors that occur during processing
      // This ensures the queue system remains operational
      console.error('Failed to process log queue:', error);
    } finally {
      // Reset processing flag when done
      this.isProcessing = false;
    }
  }
} 