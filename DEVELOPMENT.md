# Development Guide

This document provides an overview of the project structure and development workflow for the Telegram Observability library.

## Project Structure

```
telegram-observability/
├── src/
│   ├── __tests__/           # Test files
│   │   └── TelegramConsole.test.ts
│   ├── defaults.ts          # Default configuration values
│   ├── TelegramConsole.ts   # Main class implementation
│   ├── types.ts             # TypeScript type definitions
│   └── utils/
│       └── telegramBotHandler.ts  # Telegram API interaction
├── .gitignore              # Git ignore rules
├── .gitattributes          # Git file handling rules
├── .gitmessage             # Git commit message template
├── jest.config.js          # Jest configuration
├── package.json            # Project dependencies and scripts
├── pnpm-lock.yaml          # PNPM lock file
├── rollup.config.js        # Rollup bundler configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Available Scripts

The following scripts are available in the project:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the project
pnpm build

# Lint the code
pnpm lint

# Format the code
pnpm format

# Run type checking
pnpm typecheck
```

## Development Workflow

### 1. Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### 2. Development

1. Make your changes in the `src` directory
2. Run tests to ensure your changes work:
   ```bash
   pnpm test
   ```
3. Build the project to verify the build process:
   ```bash
   pnpm build
   ```

### 3. Testing

The project uses Jest for testing. Tests are located in the `src/__tests__` directory.

- Run all tests:
  ```bash
  pnpm test
  ```
- Run tests in watch mode:
  ```bash
  pnpm test:watch
  ```

### 4. Building

The project uses Rollup for bundling. The build configuration is in `rollup.config.js`.

- Build the project:
  ```bash
  pnpm build
  ```

### 5. Code Quality

- Run linting:
  ```bash
  pnpm lint
  ```
- Format code:
  ```bash
  pnpm format
  ```
- Check types:
  ```bash
  pnpm typecheck
  ```

## Code Structure

### Main Components

1. `TelegramConsole` (`src/TelegramConsole.ts`)
   - Main class that handles logging
   - Manages log queue and processing
   - Provides logging methods (log, info, warn, error)

2. `types.ts`
   - Contains TypeScript type definitions
   - Defines interfaces for configuration and log messages

3. `defaults.ts`
   - Contains default configuration values
   - Centralizes default settings

4. `telegramBotHandler.ts`
   - Handles communication with Telegram API
   - Manages bot token and chat ID
   - Sends messages to Telegram

### Testing Structure

Tests are organized to cover:
- Basic logging functionality
- Log levels and filtering
- Message formatting
- Queue processing
- Error handling
- Configuration options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## Git Workflow

The project uses conventional commits. Please follow the commit message format in `.gitmessage`.

Example commit message:
```
feat(core): add new logging functionality

- Implement new Telegram logging system
- Add support for different log levels
- Add metadata support

Closes #123
```

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a new release tag
4. Publish to npm

## Troubleshooting

### Common Issues

1. **Tests failing**
   - Ensure all dependencies are installed
   - Check for TypeScript errors
   - Verify test environment setup

2. **Build errors**
   - Check Rollup configuration
   - Verify TypeScript configuration
   - Ensure all dependencies are properly typed

3. **Type errors**
   - Run type checking
   - Update type definitions if needed
   - Check for missing type declarations

## Support

For development-related questions or issues, please:
1. Check the existing documentation
2. Search for similar issues
3. Open a new issue if needed 