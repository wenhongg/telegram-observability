export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export interface TelegramConsoleConfig {
  botToken: string;
  chatId: string;
  minLogLevel?: LogLevel;
  maxLogLength?: number;
  overrideConsole?: boolean;
}

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: {
    // Stack trace for errors
    stack?: string;
    // Error details for error logs
    error?: string;
    // Additional context about the log
    context?: Record<string, any>;
    // Source of the log (e.g., 'client', 'server', 'api')
    source?: string;
    // Any other relevant metadata
    [key: string]: any;
  };
} 