# Nexting

[![npm version](https://badge.fury.io/js/nexting.svg)](https://badge.fury.io/js/nexting)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, type-safe full-stack library for TypeScript/JavaScript applications. Nexting provides server actions, API controllers, React hooks, error handling, and professional logging - all with complete type safety and inference.

## ✨ Features

- 🎯 **Type-Safe Server Actions** - Create server functions with automatic input/output validation
- 🔌 **API Controllers** - Build RESTful endpoints with structured error handling  
- ⚛️ **React Hooks Integration** - SWR-based hooks for seamless server action integration
- 🛡️ **Comprehensive Error Handling** - Structured error responses with user-friendly messages
- 📊 **Professional Logging System** - Multiple formatters, transports, and request tracking
- 🔍 **Full TypeScript Support** - Complete type inference and strict type checking
- 🌐 **Universal/Isomorphic** - Works in both server and client environments
- 📦 **Modular Exports** - Import only what you need with tree-shaking support
- ✅ **Production Ready** - Comprehensive test coverage and battle-tested

## 📦 Installation

```bash
npm install nexting
# or
yarn add nexting
# or
pnpm add nexting
```

**Peer Dependencies:**
```bash
npm install typescript zod swr
```

## 🚨 Environment-Specific Imports

**Critical**: To avoid runtime errors, use specific imports based on your environment:

### 🖥️ Server/Backend Usage
```typescript
// ✅ Server-safe imports
import { makeServerAction, makeApiController, createLogger } from 'nexting/server';
// or
import { makeServerAction, ServerError } from 'nexting'; // Main export is server-safe
```

### 🌐 Client/Frontend Usage  
```typescript
// ✅ Client-specific imports
import { makeServerActionImmutableHook, makeServerActionMutationHook } from 'nexting/client';
```

### 🔄 Universal Usage
```typescript
// ✅ Safe in both environments
import { ServerError, parseServerError, zod } from 'nexting';
```

## 🚀 Quick Start

### 1. Create a Type-Safe Server Action

```typescript
// actions/user-actions.ts
'use server';
import { makeServerAction, zod } from 'nexting/server';

export const createUserAction = makeServerAction(async ({ name, email }) => {
  // Fully typed parameters
  const user = await db.user.create({ 
    data: { name, email } 
  });
  
  return { 
    id: user.id, 
    name: user.name, 
    email: user.email 
  };
}, {
  validationSchema: zod.object({
    name: zod.string().min(3, 'Name must be at least 3 characters'),
    email: zod.string().email('Invalid email format'),
  }),
});

// Simple action without validation
export const getServerTimeAction = makeServerAction(async () => {
  return { 
    timestamp: new Date().toISOString(),
    message: 'Server is running!' 
  };
});
```

### 2. Use Server Actions in React Components

```typescript
// components/UserForm.tsx
'use client';
import { makeServerActionMutationHook } from 'nexting/client';
import { createUserAction } from '../actions/user-actions';

const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

export function UserForm() {
  const { trigger, isMutating, error } = useCreateUser.useAction({
    options: {
      onSuccess: (user) => {
        console.log('User created:', user);
        // user is fully typed!
      },
      onError: (error) => {
        console.error('Creation failed:', error);
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await trigger({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <button type="submit" disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create User'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### 3. Create API Controllers for RESTful Endpoints

```typescript
// api/users/route.ts
import { makeApiController, zod } from 'nexting/server';

const getUsersController = makeApiController(async (props, { request }) => {
  const users = await db.user.findMany({
    where: props.search ? {
      OR: [
        { name: { contains: props.search } },
        { email: { contains: props.search } },
      ],
    } : {},
    take: props.limit,
    skip: props.offset,
  });

  return {
    users,
    total: users.length,
    page: Math.floor(props.offset / props.limit) + 1,
  };
}, {
  validationSchema: zod.object({
    search: zod.string().optional(),
    limit: zod.number().min(1).max(100).default(10),
    offset: zod.number().min(0).default(0),
  }),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = {
    search: searchParams.get('search') || undefined,
    limit: parseInt(searchParams.get('limit') || '10'),
    offset: parseInt(searchParams.get('offset') || '0'),
  };

  return getUsersController(request, input);
}
```

## 📖 Core Concepts

### 🎯 Server Actions

Server actions are type-safe functions that run on the server with automatic validation and error handling.

#### Basic Server Action
```typescript
import { makeServerAction } from 'nexting/server';

const getDataAction = makeServerAction(async () => {
  const data = await fetchData();
  return { data, timestamp: Date.now() };
});
```

#### Server Action with Validation
```typescript
import { makeServerAction, zod } from 'nexting/server';

const updateProfileAction = makeServerAction(async ({ userId, profile }) => {
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: profile,
  });
  
  return updatedUser;
}, {
  validationSchema: zod.object({
    userId: zod.string().uuid(),
    profile: zod.object({
      name: zod.string().min(1),
      bio: zod.string().max(500).optional(),
    }),
  }),
});
```

#### Error Handling in Server Actions
```typescript
import { makeServerAction, ServerError } from 'nexting/server';

const deleteUserAction = makeServerAction(async ({ userId }) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new ServerError({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
      status: 404,
      uiMessage: 'The user you are trying to delete does not exist.',
    });
  }
  
  await db.user.delete({ where: { id: userId } });
  return { success: true };
}, {
  validationSchema: zod.object({
    userId: zod.string().uuid(),
  }),
});
```

### 🔌 API Controllers

API controllers provide a structured way to create RESTful endpoints with automatic request/response handling.

```typescript
import { makeApiController, zod, StatusCodes } from 'nexting/server';

const createPostController = makeApiController(async (data, { request }) => {
  // Get user from request headers/auth
  const userId = request.headers.get('user-id');
  
  const post = await db.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  
  return {
    post,
    message: 'Post created successfully',
  };
}, {
  validationSchema: zod.object({
    title: zod.string().min(1).max(200),
    content: zod.string().min(1),
    tags: zod.array(zod.string()).optional(),
  }),
});

// Use in your API route
export async function POST(request: Request) {
  const body = await request.json();
  return createPostController(request, body);
}
```

### ⚛️ React Hooks

Nexting provides two types of hooks for different use cases:

#### Mutation Hooks (for Create, Update, Delete operations)
```typescript
import { makeServerActionMutationHook } from 'nexting/client';

const useCreatePost = makeServerActionMutationHook({
  key: 'create-post',
  action: createPostAction,
});

function CreatePostForm() {
  const { trigger, isMutating, error, data } = useCreatePost.useAction({
    options: {
      onSuccess: (post) => {
        // Redirect or show success message
        router.push(`/posts/${post.id}`);
      },
      onError: (error) => {
        toast.error(error.uiMessage || error.message);
      },
    },
  });

  const handleSubmit = async (formData: PostFormData) => {
    await trigger(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

#### Immutable Hooks (for Read operations with caching)
```typescript
import { makeServerActionImmutableHook } from 'nexting/client';

const useUserProfile = makeServerActionImmutableHook({
  key: 'user-profile',
  action: getUserProfileAction,
});

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUserProfile.useAction({
    context: { userId },
    options: {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### 🛡️ Error Handling

Nexting provides a comprehensive error handling system:

#### ServerError Class
```typescript
import { ServerError } from 'nexting';

// Create structured errors
const error = new ServerError({
  message: 'Database connection failed',
  code: 'DB_CONNECTION_ERROR',
  status: 500,
  uiMessage: 'Something went wrong. Please try again later.',
});

// Errors are automatically serialized
console.log(error.toJSON());
// {
//   message: 'Database connection failed',
//   code: 'DB_CONNECTION_ERROR', 
//   status: 500,
//   uiMessage: 'Something went wrong. Please try again later.'
// }
```

#### Error Parsing and Handling
```typescript
import { parseServerError } from 'nexting/server';

try {
  await riskyOperation();
} catch (error) {
  // Automatically converts any error to ServerError format
  const serverError = parseServerError(error);
  console.log(serverError.toJSON());
}
```

### 📊 Professional Logging System

Nexting includes a production-ready logging system with multiple formatters and transports.

#### Basic Logger Setup
```typescript
import { createLogger, LogLevel } from 'nexting/server';

const logger = createLogger({
  level: LogLevel.INFO,
  context: 'API',
});

await logger.info('Server started', { port: 3000 });
await logger.error('Database error', { error: 'Connection timeout' });
```

#### Advanced Logger Configuration
```typescript
import { 
  createLogger, 
  LogLevel,
  PrettyFormatter,
  JsonFormatter,
  ConsoleTransport,
  FileTransport 
} from 'nexting/server';

const logger = createLogger({
  level: LogLevel.DEBUG,
  context: 'APP',
  formatter: process.env.NODE_ENV === 'production' 
    ? new JsonFormatter() 
    : new PrettyFormatter(),
  transports: [
    new ConsoleTransport(),
    new FileTransport({ 
      filename: './logs/app.log',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10 
    }),
  ],
});
```

#### Request Logging
```typescript
import { createRequestLogger } from 'nexting/server';

const requestLogger = createRequestLogger();

export async function middleware(request: Request) {
  const requestId = await requestLogger.logRequest(request);
  const startTime = Date.now();
  
  try {
    const response = await next(request);
    const duration = Date.now() - startTime;
    
    await requestLogger.logResponse(requestId, response.status, duration);
    return response;
  } catch (error) {
    await requestLogger.logError(requestId, error);
    throw error;
  }
}
```

#### Child Loggers
```typescript
const mainLogger = createLogger({ context: 'APP' });
const authLogger = mainLogger.child('AUTH');
const dbLogger = mainLogger.child('DATABASE');

await authLogger.info('User logged in'); // [APP:AUTH] User logged in
await dbLogger.error('Connection lost'); // [APP:DATABASE] Connection lost
```

## 🔧 Advanced Usage

### Custom Error Handling
```typescript
import { makeServerAction, parseServerError } from 'nexting/server';

const customAction = makeServerAction(async (data) => {
  // Your logic here
  return result;
}, {
  validationSchema: schema,
  error: {
    fallbackMessage: 'Custom error occurred',
    includeStack: process.env.NODE_ENV === 'development',
  },
  logger: customLogger,
});
```

### Type Inference Utilities
```typescript
import type { 
  InferActionInput, 
  InferActionOutput, 
  InferActionError 
} from 'nexting/server';

// Extract types from your actions
type CreateUserInput = InferActionInput<typeof createUserAction>;
type CreateUserOutput = InferActionOutput<typeof createUserAction>;
type CreateUserError = InferActionError<typeof createUserAction>;
```

### Environment Configuration
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

## 📚 API Reference

### Server Actions
```typescript
function makeServerAction<T, R>(
  handler: (input: T) => Promise<R>,
  options?: {
    validationSchema?: ZodSchema<T>;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (input: T) => Promise<AsyncState<R, ActionError>>;
```

### API Controllers
```typescript
function makeApiController<T, R>(
  controller: (input: T, context: { request: Request }) => Promise<R>,
  options?: {
    validationSchema?: ZodSchema<T>;
    error?: ParseServerErrorOptions;
    logger?: Logger;
  }
): (request: Request, input?: unknown) => Promise<Response>;
```

### React Hooks
```typescript
function makeServerActionMutationHook<TAction>(options: {
  key: string;
  action: TAction;
}): {
  useAction: (options?: SWRMutationConfiguration) => SWRMutationResponse;
  makeKey: (context?: Record<string, unknown>) => object;
};

function makeServerActionImmutableHook<TAction>(options: {
  key: string;
  action: TAction;
}): {
  useAction: (options: {
    context: InferActionInput<TAction>;
    skip?: boolean;
    options?: SWRConfiguration;
  }) => SWRResponse;
  makeKey: (context?: InferActionInput<TAction>) => object;
};
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run docs development server
npm run test:docs
```

## 🏗️ Development Setup

```bash
# Clone the repository
git clone https://github.com/rrios-dev/nexting.git
cd nexting

# Install dependencies
npm install

# Build the library
npm run build

# Start development mode
npm run dev

# Run documentation site
npm run test:docs
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript for complete type safety
- Inspired by modern full-stack development patterns
- Powered by Zod for runtime validation
- Integrated with SWR for optimal data fetching
- Designed for scalable production applications

---

**Made with ❤️ by [Roberto Ríos](https://github.com/rrios-dev)**