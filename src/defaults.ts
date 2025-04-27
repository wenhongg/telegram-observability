import { LogLevel } from './types';

/**
 * Default configuration values for the TelegramConsole
 */
export const DEFAULT_CONFIG = {
  /**
   * Default minimum log level
   * Only logs at or above this level will be sent to Telegram
   * Default is 'error' to minimize noise in production
   */
  MIN_LOG_LEVEL: 'error' as LogLevel,

  /**
   * Default maximum log length
   * Logs longer than this will be truncated
   * Default is 2048 characters to comply with Telegram's message length limits
   * (4096 characters is the maximum allowed by Telegram)
   */
  MAX_LOG_LENGTH: 2048,

  /**
   * Whether to override the global console methods
   * Default is false to avoid unexpected behavior
   */
  OVERRIDE_CONSOLE: false,
} as const; 