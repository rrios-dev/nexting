# Library Boilerplate - AI Development Guide

## Project Analysis

### Core Architecture
This is a TypeScript library boilerplate designed for creating lightweight, type-safe libraries. The project follows a modular architecture with clear separation of concerns.

### Directory Structure Analysis
```
library-boilerplate/
├── src/                    # Source code directory
│   ├── index.ts           # Main entry point - exports public API
│   ├── main.ts            # Core functionality implementation
│   ├── types.ts           # TypeScript type definitions
│   └── main.test.ts       # Test implementation
├── dist/                   # Compiled output (generated)
├── package.json           # Project configuration and dependencies
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint configuration
└── jest.config.js         # Jest test configuration
```

### File Purpose Analysis

#### src/index.ts
- Primary entry point for the library
- Responsible for exporting public API
- Should maintain clean exports without implementation details

#### src/main.ts
- Contains core library functionality
- Should be modular and well-documented
- Implements business logic

#### src/types.ts
- Contains all TypeScript type definitions
- Should be comprehensive and well-documented
- Exports all necessary types

#### src/main.test.ts
- Contains test implementations
- Uses Jest testing framework
- Should cover all edge cases

## Technical Stack Analysis

### Core Technologies
- **Language**: TypeScript
- **Build Tool**: tsup
- **Testing**: Jest
- **Linting**: ESLint
- **Package Manager**: Bun/npm

### Configuration Files

#### package.json
```json
{
  "main": "dist/index.js",        // CommonJS entry
  "module": "dist/index.mjs",     // ESM entry
  "types": "dist/index.d.ts",     // TypeScript definitions
  "files": ["dist"]              // Published files
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "declaration": true
  }
}
```

#### eslint.config.mjs
- Enforces code style and quality
- TypeScript-specific rules
- Best practices enforcement

## AI Development Guidelines

### 1. Type Safety Implementation
```typescript
// ✅ Good Practice
interface UserConfig {
  name: string;
  age: number;
  preferences?: Record<string, unknown>;
}

// ❌ Bad Practice
interface UserConfig {
  name: any;
  age: any;
  preferences?: any;
}
```

### 2. Error Handling Patterns
```typescript
// ✅ Good Practice
class LibraryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'LibraryError';
  }
}

// Usage
try {
  // Implementation
} catch (error) {
  throw new LibraryError(
    'Failed to process request',
    'PROCESSING_ERROR',
    { originalError: error }
  );
}
```

### 3. Testing Patterns
```typescript
// ✅ Good Practice
describe('Library Functionality', () => {
  it('should handle valid input', () => {
    // Test implementation
  });

  it('should handle edge cases', () => {
    // Edge case testing
  });

  it('should throw on invalid input', () => {
    // Error case testing
  });
});
```

### 4. Documentation Patterns
```typescript
/**
 * Processes the input data according to the specified configuration.
 * 
 * @param input - The input data to process
 * @param config - Configuration options for processing
 * @returns Processed data
 * @throws {LibraryError} If processing fails
 * 
 * @example
 * ```typescript
 * const result = processData(input, { maxRetries: 3 });
 * ```
 */
export function processData(input: unknown, config: ProcessConfig): ProcessedData {
  // Implementation
}
```

## AI Implementation Checklist

### 1. Project Setup
- [ ] Initialize project structure
- [ ] Configure TypeScript
- [ ] Set up ESLint
- [ ] Configure Jest
- [ ] Set up build process

### 2. Core Implementation
- [ ] Define types in `types.ts`
- [ ] Implement core functionality in `main.ts`
- [ ] Set up exports in `index.ts`
- [ ] Implement error handling
- [ ] Add input validation

### 3. Testing
- [ ] Write unit tests
- [ ] Add integration tests
- [ ] Implement edge case tests
- [ ] Add error case tests
- [ ] Ensure test coverage

### 4. Documentation
- [ ] Document public API
- [ ] Add JSDoc comments
- [ ] Create usage examples
- [ ] Document error cases
- [ ] Add type documentation

### 5. Quality Assurance
- [ ] Run ESLint
- [ ] Run tests
- [ ] Check type coverage
- [ ] Verify build process
- [ ] Test in different environments

## Best Practices for AI Development

### 1. Code Organization
- Keep files focused and single-responsibility
- Use clear naming conventions
- Maintain consistent file structure
- Follow modular design principles

### 2. Type Safety
- Use strict TypeScript configurations
- Avoid `any` type
- Define comprehensive interfaces
- Use type guards when necessary

### 3. Error Handling
- Implement custom error classes
- Provide meaningful error messages
- Include error codes
- Document error cases

### 4. Testing
- Write comprehensive tests
- Cover edge cases
- Test error scenarios
- Maintain high test coverage

### 5. Documentation
- Document all public APIs
- Include usage examples
- Document error cases
- Keep documentation up to date

### 6. Performance
- Optimize critical paths
- Use appropriate data structures
- Implement caching when needed
- Monitor memory usage

## Common Patterns and Anti-patterns

### Patterns to Follow
```typescript
// 1. Factory Pattern
export function createInstance(config: Config): Instance {
  return new Instance(config);
}

// 2. Builder Pattern
export class Builder {
  private config: Partial<Config> = {};
  
  withOption(option: keyof Config, value: Config[keyof Config]): this {
    this.config[option] = value;
    return this;
  }
  
  build(): Config {
    return this.config as Config;
  }
}

// 3. Strategy Pattern
export interface Strategy {
  execute(data: unknown): Result;
}

export class Context {
  constructor(private strategy: Strategy) {}
  
  executeStrategy(data: unknown): Result {
    return this.strategy.execute(data);
  }
}
```

### Anti-patterns to Avoid
```typescript
// ❌ Global State
let globalConfig: any;

// ❌ Any Type
function process(data: any): any {
  return data;
}

// ❌ Unhandled Promises
async function process() {
  fetch('/api'); // Missing await
}

// ❌ Unsafe Type Assertions
const data = input as any;
```

## Version Control Guidelines

### Commit Messages
```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: restructure code
chore: update dependencies
```

### Branch Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `release/*`: Release preparation

## Release Process

### 1. Version Update
- Update version in `package.json`
- Update CHANGELOG.md
- Tag release in git

### 2. Build Process
- Run tests
- Build library
- Generate documentation
- Create distribution files

### 3. Publishing
- Publish to npm
- Create GitHub release
- Update documentation

## Maintenance Guidelines

### 1. Dependency Updates
- Regular security updates
- Major version updates
- Peer dependency updates
- Development dependency updates

### 2. Code Quality
- Regular linting
- Type checking
- Test coverage
- Performance monitoring

### 3. Documentation
- API documentation
- Usage examples
- Migration guides
- Troubleshooting guides

## AI-Specific Considerations

### 1. Code Generation
- Follow established patterns
- Maintain consistency
- Use appropriate abstractions
- Consider maintainability

### 2. Error Handling
- Implement comprehensive error handling
- Provide meaningful error messages
- Include error codes
- Document error cases

### 3. Testing
- Write comprehensive tests
- Cover edge cases
- Test error scenarios
- Maintain high test coverage

### 4. Documentation
- Document all public APIs
- Include usage examples
- Document error cases
- Keep documentation up to date

### 5. Performance
- Optimize critical paths
- Use appropriate data structures
- Implement caching when needed
- Monitor memory usage

## CI/CD and GitHub Actions

### GitHub Actions Workflow
The project includes a GitHub Actions workflow for automated publishing to NPM. The workflow is triggered when a new release is created.

#### Workflow Steps
1. **Checkout**: Clones the repository
2. **Setup Node.js**: Configures Node.js environment
3. **Install Dependencies**: Installs project dependencies
4. **Build**: Builds the project
5. **Test**: Runs the test suite
6. **Publish**: Publishes to NPM

#### Configuration
```yaml
name: Publish Package to NPM

on:
  release:
    types: [created]

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Required Secrets
- `NPM_TOKEN`: NPM authentication token for publishing

### Publishing Process
1. Create a new release in GitHub
2. GitHub Actions workflow is triggered
3. Package is built and tested
4. If successful, package is published to NPM

### Best Practices for CI/CD
1. Always run tests before publishing
2. Use semantic versioning
3. Keep dependencies up to date
4. Monitor build and test results
5. Maintain security of secrets
