import { TelegramConsole } from '../TelegramConsole';
import { LogMessage, LogLevel } from '../types';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Create a mock function for sendLog that properly handles async
const mockSendLog = jest.fn<(log: LogMessage) => Promise<void>>().mockImplementation(async (log: LogMessage) => {
  // Simulate network delay
  await new Promise(resolve => setImmediate(resolve));
});

// Mock the TelegramBotHandler
jest.mock('../utils/telegramBotHandler', () => {
  return {
    TelegramBotHandler: jest.fn().mockImplementation(() => ({
      sendLog: mockSendLog,
    })),
  };
});

const longMessage = 'This is a very long message that should be truncated '.repeat(100);

describe('TelegramConsole', () => {
  let telegramConsole: TelegramConsole;

  beforeEach(() => {
    jest.clearAllMocks();
    telegramConsole = new TelegramConsole({
      botToken: 'test-token',
      chatId: 'test-chat-id',
      overrideConsole: false,
      minLogLevel: 'log',
    });
  });

  afterEach(() => {
    telegramConsole.restoreConsole();
  });

  describe('Message Formatting', () => {
    it('should format simple log messages correctly', async () => {
      telegramConsole.log('New user has entered the chat');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendLog).toHaveBeenCalled();
      const lastCall = mockSendLog.mock.calls[mockSendLog.mock.calls.length - 1];
      const logMessage = lastCall[0];

      // Check log level
      expect(logMessage.level).toBe('log');

      // Check message format
      const messageLines = logMessage.message.split('\n');
      expect(messageLines[0]).toMatch(/^\[LOG\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(messageLines[1]).toBe('New user has entered the chat');
      expect(messageLines.length).toBe(2); // Should only have timestamp and message lines
    });

    it('should format messages with metadata and error objects correctly', async () => {
      const metadata = {
        userId: '123',
        action: 'login',
        details: { page: 'home', timeSpent: 5000 },
      };
      const error = new Error('Test error');
      
      telegramConsole.error('Operation failed', error, metadata);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendLog).toHaveBeenCalled();
      const lastCall = mockSendLog.mock.calls[mockSendLog.mock.calls.length - 1];
      const logMessage = lastCall[0];

      // Check log level
      expect(logMessage.level).toBe('error');

      // Check message format
      const messageLines = logMessage.message.split('\n');
      expect(messageLines[0]).toMatch(/^\[ERROR\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(messageLines[1]).toBe('Operation failed Test error');
      expect(messageLines[2]).toBe('');  // Empty line from \n\n
      expect(messageLines[3]).toBe('Metadata:');
      expect(messageLines[4]).toContain('userId: "123"');
      expect(messageLines[5]).toContain('action: "login"');
      expect(messageLines[6]).toContain('details: {"page":"home","timeSpent":5000}');

      // Check metadata object
      expect(logMessage.metadata).toEqual(metadata);
    });
  });

  describe('Message Truncation', () => {
    it('should truncate messages exceeding max length', async () => {
      telegramConsole.log(longMessage);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendLog).toHaveBeenCalled();
      const lastCall = mockSendLog.mock.calls[mockSendLog.mock.calls.length - 1];
      const logMessage = lastCall[0];
      expect(logMessage.message.length).toBeLessThanOrEqual(4096);
      expect(logMessage.message.endsWith('...')).toBe(true);
    });

    it('should respect custom max length', async () => {
      const customConsole = new TelegramConsole({
        botToken: 'test-token',
        chatId: 'test-chat-id',
        maxLogLength: 100,
        overrideConsole: false,
        minLogLevel: 'log',
      });

      customConsole.log(longMessage);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendLog).toHaveBeenCalled();
      const lastCall = mockSendLog.mock.calls[mockSendLog.mock.calls.length - 1];
      const logMessage = lastCall[0];
      expect(logMessage.message.length).toBeLessThanOrEqual(100);
      expect(logMessage.message.endsWith('...')).toBe(true);
    });
  });

  describe('Log Levels', () => {
    it('should respect minLogLevel', async () => {
      const customConsole = new TelegramConsole({
        botToken: 'test-token',
        chatId: 'test-chat-id',
        minLogLevel: 'warn',
        overrideConsole: false,
      });

      customConsole.log('This should not be sent');
      customConsole.info('This should not be sent');
      customConsole.warn('This should be sent');
      customConsole.error('This should be sent');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSendLog).toHaveBeenCalledTimes(2);
      const calls = mockSendLog.mock.calls;
      const firstCall = calls[0][0];
      const secondCall = calls[1][0];
      expect(firstCall.level).toBe('warn');
      expect(secondCall.level).toBe('error');
    });
  });

  describe('Log Queue Processing', () => {
    it('should process logs in order', async () => {
      const messages: string[] = [];
      mockSendLog.mockImplementation(async (log: LogMessage) => {
        messages.push(log.message);
        await new Promise(resolve => setImmediate(resolve));
      });

      telegramConsole.log('First');
      telegramConsole.info('Second');
      telegramConsole.warn('Third');
      telegramConsole.error('Fourth');

      await new Promise(resolve => setTimeout(resolve, 100));

      const messageContents = messages.map(msg => {
        const lines = msg.split('\n');
        return lines[lines.length - 1];
      });

      expect(messageContents).toEqual(['First', 'Second', 'Third', 'Fourth']);
    });

    it('should handle sendLog errors gracefully', async () => {
      mockSendLog.mockRejectedValueOnce(new Error('Failed to send log'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      telegramConsole.log('Test message');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to process log queue:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
}); 