# Development Guide

This document provides an overview of the project structure and development workflow for the Telegram Observability library, an open source project built by and for the community.

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

We're thrilled that you're interested in contributing to Telegram Observability! This project is maintained by the community, and we value every contribution, no matter how small.

### Ways to Contribute

1. **Code Contributions**
   - Fix bugs
   - Implement new features
   - Improve performance
   - Add tests
   - Refactor code

2. **Documentation**
   - Improve existing documentation
   - Add code examples
   - Write tutorials
   - Translate documentation

3. **Community Support**
   - Answer questions
   - Help triage issues
   - Review pull requests
   - Share your use cases

### Getting Started

1. **Set Up Your Environment**
   ```bash
   # Fork and clone the repository
   git clone https://github.com/wenhongg/telegram-observability.git
   cd telegram-observability

   # Install dependencies
   pnpm install
   ```

2. **Find Something to Work On**
   - Check the [issues](https://github.com/wenhongg/telegram-observability/issues) for good first issues
   - Look for bugs or features you'd like to implement
   - Consider improving documentation or tests

3. **Make Your Changes**
   - Create a new branch for your work
   - Follow the coding standards
   - Write tests for new features
   - Update documentation as needed

4. **Submit Your Changes**
   - Push your changes to your fork
   - Create a pull request
   - Follow the pull request template
   - Be responsive to feedback

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use meaningful variable and function names
   - Add comments for complex logic
   - Keep functions small and focused

2. **Testing**
   - Write tests for new features
   - Ensure all tests pass
   - Maintain good test coverage
   - Add tests for bug fixes

3. **Documentation**
   - Update README.md for significant changes
   - Add JSDoc comments for new functions
   - Keep examples up to date
   - Document breaking changes

4. **Pull Requests**
   - Keep PRs focused and small
   - Include tests and documentation
   - Follow the commit message format
   - Be responsive to review comments

### Need Help?

- Join our [community chat](https://t.me/your-community-link)
- Open an issue for questions
- Ask for help in pull requests
- Reach out to maintainers

Remember: Every contribution, no matter how small, helps make this project better for everyone!

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