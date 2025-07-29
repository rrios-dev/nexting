# Nexting Documentation

This is the comprehensive documentation site for the Nexting library, built with Next.js 15 and featuring interactive examples and live demos.

## Features

- **Complete API Documentation**: Detailed documentation for all Nexting utilities
- **Interactive Examples**: Live demos that you can interact with to understand how features work
- **Type-safe Examples**: All code examples are written in TypeScript with full type safety
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Examples update in real-time to show SWR caching and revalidation

## Documentation Sections

### 🏠 Home
Overview of the Nexting library with quick start guide and key benefits.

### ⚡ Server Actions
Complete documentation for `makeServerAction`:
- Basic usage without validation
- Schema validation with Zod
- Error handling and custom error messages
- Type inference and TypeScript integration
- Interactive examples with live server actions

### 🛡️ Error Handling
Comprehensive error handling documentation:
- ServerError class usage
- parseServerError function
- Automatic error type conversion
- Error codes and custom parsing
- Client-side error handling patterns
- Interactive error scenarios

### 🔒 Immutable Hooks
SWR-based immutable data fetching:
- makeServerActionImmutableHook usage
- SWR integration and features
- Cache key management
- Conditional fetching
- Performance optimization
- Live examples with auto-refresh

### 🔄 Mutation Hooks
SWR-based data mutations:
- makeServerActionMutationHook usage
- Optimistic updates
- Cache invalidation strategies
- Error handling in mutations
- Performance considerations
- Interactive mutation examples

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **SWR**: Data fetching and caching
- **Nexting**: The library being documented

## Interactive Examples

The documentation includes several interactive examples:

1. **Server Action Demos**: Test different server actions with real validation
2. **Error Handling**: Trigger different error types to see how they're handled
3. **Immutable Hook Demos**: See SWR caching and auto-refresh in action
4. **Mutation Examples**: Perform mutations and see state management

## Code Examples

All code examples in the documentation are:
- ✅ Fully functional and tested
- ✅ Type-safe with TypeScript
- ✅ Following best practices
- ✅ Copy-paste ready for your projects

## Project Structure

```
docs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── server-actions/    # Server Actions documentation
│   ├── error-handling/    # Error Handling documentation
│   ├── immutable-hooks/   # Immutable Hooks documentation
│   └── mutation-hooks/    # Mutation Hooks documentation
├── components/            # React components
│   ├── demos/            # Interactive demo components
│   ├── navigation/       # Navigation components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── constants/           # Constants and configuration
├── actions/            # Demo server actions
└── public/            # Static assets
```

## Contributing

To contribute to the documentation:

1. Make changes to the relevant files
2. Test interactive examples work correctly
3. Ensure TypeScript types are correct
4. Check responsiveness on different screen sizes
5. Verify all links and navigation work

The documentation is designed to be a living example of the Nexting library in action!
