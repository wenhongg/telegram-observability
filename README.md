# Telegram Observability

A React and Next.js library for sending application logs and metrics to Telegram.

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

```typescript
import { TelegramConsole } from 'telegram-observability';

// Initialize the console with default configuration
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  // All other settings use defaults:
  // - minLogLevel: 'error' (only errors are logged)
  // - maxLogLength: 2048 (logs longer than this will be truncated)
});

// Logs are processed in order, even when called in quick succession
console.log('First log');
console.info('Second log');
console.warn('Third log');
console.error('Fourth log');

// All logs will be sent to Telegram in the correct order:
// 1. First log
// 2. Second log
// 3. Third log
// 4. Fourth log

// Change minimum log level at runtime
telegramConsole.setMinLogLevel('info'); // Now logs info, warn, and error
console.info('This will be sent to Telegram', { 
  userId: '123',
  action: 'login'
});

// Change maximum log length at runtime
telegramConsole.setMaxLogLength(4096); // Increase max length to 4096 characters

// Restore original console methods
telegramConsole.restoreConsole();
```

## Default Configuration

The library comes with sensible defaults that can be overridden:

```typescript
// Default configuration values
{
  minLogLevel: 'error',    // Only log errors by default
  maxLogLength: 2048,      // Truncate logs longer than 2048 characters
}
```

You can override these defaults when creating a new instance:

```typescript
const telegramConsole = new TelegramConsole({
  botToken: 'YOUR_BOT_TOKEN',
  chatId: 'YOUR_CHAT_ID',
  minLogLevel: 'info',     // Override default to log more levels
  maxLogLength: 4096,      // Override default to allow longer logs
});
```

## Log Levels

The library supports the following log levels, ordered by severity:

1. `log` - General logging information
2. `info` - Informational messages
3. `warn` - Warning messages
4. `error` - Error messages (default minimum level)

Note: `console.debug` is not supported as it's typically used for development debugging and not meant for production logging.

When you set a minimum log level, only messages at that level or higher will be sent to Telegram. For example:
- If `minLogLevel` is not specified, only `error` messages will be sent (default)
- If `minLogLevel` is set to `'info'`, only `info`, `warn`, and `error` messages will be sent
- If `minLogLevel` is set to `'warn'`, only `warn` and `error` messages will be sent
- If `minLogLevel` is set to `'error'`, only `error` messages will be sent

## Log Processing

The library ensures that logs are processed in the correct order, even when multiple console methods are called in quick succession. This is achieved through an internal queue system that:

1. Collects logs in the order they are called
2. Processes them sequentially
3. Maintains order even when network latency varies

For example:
```typescript
console.log('First');
console.info('Second');
console.warn('Third');
console.error('Fourth');

// All logs will be sent to Telegram in this exact order
```

This behavior is particularly important for:
- Debugging sequences of events
- Maintaining chronological order of operations
- Ensuring error context is preserved
- Tracking user flows and application state

## Log Length

The library automatically truncates logs that exceed the maximum length (default: 2048 characters). This helps ensure compatibility with Telegram's message length limits and prevents overly large log messages.

```typescript
// Long log message will be truncated
console.log('A very long message...' + '...'.repeat(1000));

// You can increase the maximum length if needed
telegramConsole.setMaxLogLength(4096);
```

## Log Metadata

The library automatically extracts metadata from your log messages. Any object passed as an argument to console methods will be included in the metadata:

```typescript
// Simple metadata
console.log('User action', { userId: '123', action: 'login' });

// Error with stack trace
console.error('API error', new Error('Failed to fetch data'));

// Complex metadata
console.info('Payment processed', {
  amount: 100,
  currency: 'USD',
  paymentMethod: 'credit_card',
  metadata: {
    cardLast4: '1234',
    transactionId: 'tx_123'
  }
});
```

Metadata is automatically extracted and structured as follows:
- For regular objects: All properties are included in metadata
- For Error objects: `error` and `stack` properties are automatically included
- For mixed arguments: String arguments form the message, objects become metadata

## Usage

### 1. Set up environment variables

Create a `.env.local` file in your Next.js project root:

```env
# For client-side usage (with NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_chat_id

# For server-side usage
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. Client-side usage

```tsx
// components/LogButton.tsx
'use client';

import { TelegramConsole } from 'telegram-observability';
import { useEffect } from 'react';

export function LogButton() {
  useEffect(() => {
    const telegramConsole = new TelegramConsole({
      botToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN!,
      chatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID!,
      // Using default configuration
    });

    // Logs will be processed in order
    console.log('Component mounted', { 
      mountTime: performance.now()
    });
    console.info('Component initialized', { 
      component: 'LogButton',
      timestamp: new Date()
    });
    console.warn('Component warning', { 
      severity: 'medium',
      context: 'user interaction'
    });
    console.error('Component error', { 
      component: 'LogButton',
      error: 'Failed to initialize'
    });

    // Cleanup: restore original console methods
    return () => telegramConsole.restoreConsole();
  }, []);

  return <button>Log Something</button>;
}
```

### 3. Server-side usage

```typescript
// pages/api/some-api-route.ts
import { TelegramConsole } from 'telegram-observability';

const telegramConsole = new TelegramConsole({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
  minLogLevel: 'warn', // Override default to log warnings and errors
  maxLogLength: 4096,  // Override default to allow longer logs
});

export default async function handler(req, res) {
  try {
    // Logs will be processed in order
    console.log('Request received', { 
      requestId: req.headers['x-request-id']
    });
    console.info('API request details', {
      endpoint: '/api/some-api-route',
      method: req.method,
      headers: req.headers
    });

    // Your API logic here
    res.status(200).json({ success: true });
  } catch (error) {
    // Error logs will be processed in order
    console.warn('API warning', { 
      endpoint: '/api/some-api-route',
      method: req.method,
      warning: 'Rate limit approaching'
    });
    console.error('API error occurred', error, {
      endpoint: '/api/some-api-route',
      method: req.method,
      userId: req.headers['x-user-id']
    });

    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 4. Server Components (Next.js 13+)

```tsx
// app/components/ServerComponent.tsx
import { TelegramConsole } from 'telegram-observability';

export default async function ServerComponent() {
  const telegramConsole = new TelegramConsole({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    chatId: process.env.TELEGRAM_CHAT_ID!,
    minLogLevel: 'info', // Override default to log info, warn, and error
    maxLogLength: 4096,  // Override default to allow longer logs
  });

  // Logs will be processed in order
  console.log('Component rendering', { 
    component: 'ServerComponent',
    renderTime: new Date()
  });
  console.info('Server component details', {
    props: { /* component props */ },
    environment: process.env.NODE_ENV
  });

  return <div>Server Component</div>;
}
```

## Features

- Automatically intercepts and forwards console methods to Telegram
- Configurable minimum log level (defaults to 'error')
- Configurable maximum log length (defaults to 2048 characters)
- Preserves original console functionality
- Support for all console methods (log, info, warn, error)
- Properly formats objects and arrays
- Automatic metadata extraction from log arguments
- Special handling for Error objects (includes stack traces)
- Ordered log processing (maintains chronological order)
- Change minimum log level at runtime
- Change maximum log length at runtime
- Restore original console methods when needed
- Support for both client-side and server-side logging
- TypeScript support

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development mode:
   ```bash
   pnpm dev
   ```
4. Build the package:
   ```bash
   pnpm build
   ```

## License

ISC 