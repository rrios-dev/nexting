# Nexting

[![npm version](https://badge.fury.io/js/nexting.svg)](https://badge.fury.io/js/nexting)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/workflow/status/rrios-dev/nexting/CI)](https://github.com/rrios-dev/nexting/actions)

A lightweight, type-safe library boilerplate for TypeScript/JavaScript with server actions, API controllers, and React hooks integration.

## Features

- ✅ **Server Actions** with type-safe input/output validation
- ✅ **API Controllers** for structured endpoint creation
- ✅ **React Hooks** for server action integration (SWR-based)
- ✅ **Error Handling** with structured error responses
- ✅ **Professional Logging** system with multiple formatters and transports
- ✅ **Full TypeScript** support with strict type inference
- ✅ **Universal/Isomorphic** - works in both server and client environments
- ✅ **Modular exports** - import only what you need
- ✅ **Tests included** with complete coverage

## Installation

```bash
npm install nexting
# or
yarn add nexting
# or
pnpm add nexting
```

## Important: Environment-Specific Imports

**🚨 CRITICAL**: To avoid "window is not defined" errors in server environments, use specific imports:

### Backend/Server Usage
```typescript
// ✅ CORRECT - Server-safe imports
import { makeServerAction, makeApiController, createLogger } from 'nexting/server';
// or
import { makeServerAction, createLogger } from 'nexting'; // Main export is server-safe

// ❌ WRONG - Don't import client code in server
import { makeServerActionMutationHook } from 'nexting'; // This would fail
```

### Frontend/Client Usage
```typescript
// ✅ CORRECT - Client-specific imports
import { makeServerActionImmutableHook, makeServerActionMutationHook } from 'nexting/client';
```

### Universal Usage
```typescript
// ✅ CORRECT - Safe in both environments
import { ServerError, parseServerError, zod } from 'nexting';
```

## Quick Start

### Server Action with Type Safety
```typescript
import { makeServerAction, zod } from 'nexting/server';

const createUserAction = makeServerAction({
  input: zod.object({
    name: zod.string(),
    email: zod.string().email(),
  }),
  handler: async ({ name, email }) => {
    // Type-safe handler - name and email are properly typed
    const user = await db.user.create({ data: { name, email } });
    return { id: user.id, name: user.name };
  },
});
```

### React Hook for Server Actions
```typescript
import { makeServerActionMutationHook } from 'nexting/client';

const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

// In your component
function UserForm() {
  const { trigger, isMutating, error } = useCreateUser.useAction();
  
  const handleSubmit = async (data: { name: string; email: string }) => {
    await trigger(data);
  };
  
  return (/* your form */);
}
```

## Basic Usage

```typescript
import { createLogger, LogLevel } from './logger';

// Basic logger
const logger = createLogger({
  level: LogLevel.INFO,
  context: 'APP',
});

await logger.info('Application started');
await logger.error('Connection error', { database: 'primary' });
```

## Request Logging

```typescript
import { createRequestLogger } from './logger';

const requestLogger = createRequestLogger();

// In your API handler
export async function handleRequest(request: Request) {
  const requestId = await requestLogger.logRequest(request);
  
  try {
    const startTime = Date.now();
    
    // Your logic here...
    const result = await processRequest(request);
    
    const duration = Date.now() - startTime;
    await requestLogger.logResponse(requestId, 200, duration);
    
    return result;
  } catch (error) {
    await requestLogger.logError(requestId, error);
    throw error;
  }
}
```

## Advanced Configuration

### Logger with JSON format for production

```typescript
import { createLogger, LogLevel, JsonFormatter } from './logger';

const prodLogger = createLogger({
  level: LogLevel.WARN,
  context: 'PROD',
  formatter: new JsonFormatter(),
});
```

### Logger with multiple transports

```typescript
import { 
  createLogger, 
  ConsoleTransport, 
  FileTransport,
  PrettyFormatter 
} from './logger';

const logger = createLogger({
  level: LogLevel.DEBUG,
  context: 'APP',
  formatter: new PrettyFormatter(),
  transports: [
    new ConsoleTransport(),
    new FileTransport({ 
      filename: './logs/app.log',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10 
    })
  ],
});
```

## Child Loggers

Child loggers inherit configuration from the parent but extend the context:

```typescript
const mainLogger = createLogger({ context: 'APP' });
const authLogger = mainLogger.child('AUTH');
const dbLogger = mainLogger.child('DATABASE');

await authLogger.info('User authenticated'); // [APP:AUTH]
await dbLogger.error('Connection lost');     // [APP:DATABASE]
```

## Log Levels

```typescript
// In priority order (ERROR = highest priority)
await logger.error('Critical error');    // Always shown
await logger.warn('Warning');           // Shown if level >= WARN
await logger.info('Information');       // Shown if level >= INFO  
await logger.debug('Debug info');       // Shown if level >= DEBUG
await logger.trace('Detailed trace');   // Shown if level >= TRACE
```

## Metadata and Request IDs

```typescript
// With metadata
await logger.info('User logged in', {
  userId: '123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// With request ID for tracking
await logger.error('Processing error', { error: 'timeout' }, 'req_123');
```

## Available Formatters

### PrettyFormatter (Development)
```
2023-12-01T10:30:00.000Z [INFO]  [APP] [req_123] User authenticated
  Metadata: {
    "userId": "123",
    "method": "POST"
  }
```

### JsonFormatter (Production)
```json
{
  "timestamp": "2023-12-01T10:30:00.000Z",
  "level": "INFO",
  "message": "User authenticated",
  "context": "APP",
  "requestId": "req_123",
  "metadata": {
    "userId": "123",
    "method": "POST"
  }
}
```

### SimpleFormatter (Minimalist)
```
2023-12-01T10:30:00.000Z [INFO] [APP] User authenticated
```

## Environment Configuration

```typescript
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = createLogger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  context: 'SERVER',
  formatter: isDevelopment ? new PrettyFormatter() : new JsonFormatter(),
  transports: isDevelopment 
    ? [new ConsoleTransport()]
    : [
        new ConsoleTransport(),
        new FileTransport({ filename: './logs/app.log' })
      ]
});
```

## Extensibility

### Custom Formatter

```typescript
import { LogFormatter, LogEntry } from './logger-types';

class CustomFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return `[${entry.level}] ${entry.message}`;
  }
}

logger.setFormatter(new CustomFormatter());
```

### Custom Transport

```typescript
import { LogTransport, LogEntry } from './logger-types';

class DatabaseTransport implements LogTransport {
  async log(formattedMessage: string, entry: LogEntry): Promise<void> {
    // Send to database, external service, etc.
    await this.sendToDatabase(entry);
  }
}

logger.addTransport(new DatabaseTransport());
```

## API Reference

### Logger Interface

```typescript
interface Logger {
  error(message: string, metadata?: Record<string, any>, requestId?: string): Promise<void>;
  warn(message: string, metadata?: Record<string, any>, requestId?: string): Promise<void>;
  info(message: string, metadata?: Record<string, any>, requestId?: string): Promise<void>;
  debug(message: string, metadata?: Record<string, any>, requestId?: string): Promise<void>;
  trace(message: string, metadata?: Record<string, any>, requestId?: string): Promise<void>;
  child(context: string): Logger;
  setLevel(level: LogLevel): void;
  setFormatter(formatter: LogFormatter): void;
  addTransport(transport: LogTransport): void;
}
```

### RequestLogger Interface

```typescript
interface RequestLogger {
  logRequest(request: Request): Promise<string>;
  logResponse(requestId: string, status: number, duration: number): Promise<void>;
  logError(requestId: string, error: Error | unknown): Promise<void>;
}
```

### Configuration Types

```typescript
interface LoggerConfig {
  level: LogLevel;
  context: string;
  formatter?: LogFormatter;
  transports?: LogTransport[];
}

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}
```

## Best Practices

1. **Use descriptive contexts** to facilitate debugging
2. **Include relevant metadata** instead of concatenating strings
3. **Use appropriate levels** based on message importance
4. **Configure file rotation** to avoid huge files
5. **Use JSON in production** for automatic parsing
6. **Track requests** with unique IDs for complete traceability
7. **Create child loggers** for different modules/components
8. **Structure metadata** consistently across your application
9. **Avoid logging sensitive information** like passwords or API keys
10. **Use async logging** to prevent blocking operations

## API Integration

```typescript
// middleware.ts
import { requestLogger } from './logger';

export async function loggingMiddleware(
  request: Request,
  next: (request: Request) => Promise<Response>
): Promise<Response> {
  const requestId = await requestLogger.logRequest(request);
  const startTime = Date.now();
  
  try {
    const response = await next(request);
    const duration = Date.now() - startTime;
    
    await requestLogger.logResponse(
      requestId, 
      response.status, 
      duration
    );
    
    return response;
  } catch (error) {
    await requestLogger.logError(requestId, error);
    throw error;
  }
}
```

## Performance Considerations

- **Async Operations**: All logging operations are asynchronous to prevent blocking
- **Memory Efficient**: Transports handle buffering and batching internally
- **File Rotation**: Automatic rotation prevents disk space issues
- **Context Reuse**: Child loggers reuse parent configuration for efficiency
- **Metadata Serialization**: Efficient JSON serialization for structured data

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
# or
pnpm test
```

Run tests with coverage:

```bash
npm run test:coverage
# or
yarn test:coverage
# or
pnpm test:coverage
```

## Troubleshooting

### Common Issues

**Issue: Logs not appearing**
- Check if the log level is appropriate for your message level
- Verify transport configuration
- Ensure async operations are properly awaited

**Issue: File transport not working**
- Check file permissions for the log directory
- Verify disk space availability
- Ensure the directory exists or can be created

**Issue: High memory usage**
- Configure file rotation with appropriate limits
- Check for circular references in metadata
- Consider using structured logging instead of large objects

**Issue: Performance problems**
- Use appropriate log levels in production
- Avoid logging in tight loops
- Consider batching for high-volume scenarios

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const logger = createLogger({
  level: LogLevel.DEBUG,
  context: 'DEBUG',
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rrios-dev/nexting.git
cd nexting

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Maintain test coverage above 90%
- Follow the existing code formatting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release with core logging functionality
- Support for multiple formatters and transports
- Request logging capabilities
- Full TypeScript support
- Comprehensive test suite

### v1.1.0
- Added file rotation support
- Improved performance for high-volume logging
- Enhanced error handling
- Added more configuration options

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [issues](https://github.com/yourusername/nexting/issues)
3. Create a new issue with detailed information
4. For urgent issues, contact the maintainers

## Acknowledgments

- Inspired by popular logging libraries like Winston and Pino
- Built with TypeScript for type safety
- Designed for modern Node.js applications
- Community feedback and contributions 