# Library Boilerplate

A modern, type-safe boilerplate for creating TypeScript/JavaScript libraries. This template provides a solid foundation for building high-quality, maintainable libraries with best practices and modern tooling.

## Features

- 🚀 TypeScript support out of the box
- 📦 Modern build system with esbuild
- ✅ Jest testing setup
- 📝 Documentation ready
- 🔍 ESLint and Prettier configuration
- 🎯 Type definitions generation
- 📦 NPM package publishing setup
- 🧪 Test coverage reporting
- 🔄 CI/CD ready

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- bun, npm, yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/library-boilerplate.git
cd library-boilerplate
```

2. Install dependencies:
```bash
bun install
# or
npm install
# or
yarn install
```

## Project Structure

```
library-boilerplate/
├── src/                    # Source code
│   ├── main.ts            # Main library code
│   ├── types.ts           # Type definitions
│   └── main.test.ts       # Tests
├── dist/                   # Build output
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project metadata and dependencies
```

## Development

### Building

```bash
npm run build
# or
yarn build
```

### Testing

```bash
npm test
# or
yarn test
```

### Linting

```bash
npm run lint
# or
yarn lint
```

## Creating Your Library

1. Modify `src/main.ts` with your library's core functionality
2. Update `src/types.ts` with your type definitions
3. Add tests in `src/main.test.ts`
4. Update `package.json` with your library's information:
   - name
   - version
   - description
   - author
   - repository
   - license

## Publishing

1. Update the version in `package.json`
2. Build your library:
```bash
npm run build
```

3. Publish to npm:
```bash
npm publish
```

## Best Practices

- Write comprehensive tests for all functionality
- Keep your dependencies up to date
- Document your API thoroughly
- Follow semantic versioning
- Maintain good test coverage
- Use TypeScript for better type safety

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you find this boilerplate helpful, please give it a star! For issues and feature requests, please use the GitHub issue tracker.
