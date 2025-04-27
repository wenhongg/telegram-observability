# Telegram Observability

A powerful logging tool that sends console logs to Telegram, perfect for monitoring your applications in real-time.

## Features

- 📱 Send logs directly to Telegram
- 🔄 Ordered log processing
- 📊 Multiple log levels (log, info, warn, error)
- 🔍 Rich metadata support
- 🚀 Works in both browser and Node.js environments
- ⚡️ Non-blocking async logging
- 🔒 Configurable minimum log level
- 📝 Customizable message formatting

## Installation

```bash
# Using npm
npm install telegram-observability

# Using yarn
yarn add telegram-observability

# Using pnpm
pnpm add telegram-observability
```

## Quick Start

### 1. Set Up Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions to:
   - Choose a name for your bot
   - Choose a username for your bot (must end in 'bot')
4. BotFather will give you a token that looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - This is your `botToken`
   - ⚠️ Keep this token secret and never share it publicly

### 2. Get Your Chat ID

There are two ways to get your chat ID:

#### Method 1: Using a Bot
1. Start a chat with your new bot
2. Send any message to the bot
3. Visit this URL in your browser (replace with your bot token):
   ```
   https://api.telegram.org/bot<YourBOTToken>/getUpdates
   ```
4. Look for the `"chat":{"id":` field in the response
   - The number after `"id":` is your `chatId`

#### Method 2: Using @userinfobot
1. Search for [@userinfobot](https://t.me/userinfobot) on Telegram
2. Start a chat and send any message
3. The bot will reply with your chat ID

### 3. Basic Usage

```typescript
import { TelegramConsole } from 'telegram-observability';

// Create a new instance
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN', // From BotFather
  chatId: 'YOUR_CHAT_ID',    // From getUpdates or @userinfobot
  overrideConsole: false,     // Set to true if you want to override global console
});

// Direct usage without overriding console
telegramConsole.log('Hello, world!');
telegramConsole.info('User logged in');
telegramConsole.warn('High memory usage detected');
telegramConsole.error('Failed to connect to database');

// With metadata
telegramConsole.log('User action', {
  userId: '123',
  action: 'login',
  timestamp: new Date().toISOString()
});
```

### Overriding Global Console

If you want to override the global console methods:

```typescript
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  overrideConsole: true, // This will override global console methods
});

// Now all console calls will be sent to Telegram
console.log('This will be sent to Telegram');
console.info('So will this');
console.warn('And this');
console.error('And this too');
```

## Log Levels

The library supports the following log levels:
- `log`: General logging
- `info`: Informational messages
- `warn`: Warning messages
- `error`: Error messages

By default, only `error` level logs are sent. You can change this using the `minLogLevel` configuration:

```typescript
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  minLogLevel: 'info', // Will send info, warn, and error logs
});
```

## Log Processing

The library uses an internal queue system to ensure logs are processed in the order they are created, even when called in quick succession:

```typescript
// These logs will be processed in order, regardless of network latency
telegramConsole.log('First message');
telegramConsole.info('Second message');
telegramConsole.warn('Third message');
telegramConsole.error('Fourth message');
```

## Log Metadata

You can attach metadata to your logs for better context:

```typescript
telegramConsole.log('User action', {
  userId: '123',
  action: 'login',
  details: {
    browser: 'Chrome',
    version: '120.0.0'
  }
});
```

The metadata will be formatted and included in the Telegram message.

## Configuration Options

```typescript
interface TelegramConsoleConfig {
  botToken: string;
  chatId: string;
  overrideConsole?: boolean;
  minLogLevel?: LogLevel;
  maxLogLength?: number;
  enabled?: boolean;
}
```

- `botToken`: Your Telegram bot token (required)
- `chatId`: The chat ID to send logs to (required)
- `overrideConsole`: Whether to override global console methods (default: false)
- `minLogLevel`: Minimum log level to send (default: 'error')
- `maxLogLength`: Maximum length of log messages (default: 4096)
- `enabled`: Whether logging is enabled (default: true)

## Usage in Different Environments

### Browser

```typescript
import { TelegramConsole } from 'telegram-observability';

const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
});

// Use directly
telegramConsole.log('Browser log');

// Or override console
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  overrideConsole: true,
});

console.log('This will be sent to Telegram');
```

### Node.js

```typescript
import { TelegramConsole } from 'telegram-observability';

const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
});

// Use directly
telegramConsole.log('Server log');

// Or override console
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  overrideConsole: true,
});

console.log('This will be sent to Telegram');
```

## Error Handling

The library handles errors gracefully:
- Failed log sends are caught and logged to console.error
- The queue continues processing even if individual logs fail
- Network errors don't block the application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 