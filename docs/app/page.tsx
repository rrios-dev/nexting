import FeatureCard from '../components/ui/feature-card';
import CodeBlock from '../components/ui/code-block';
import { DOCS_ROUTES } from '../constants/routes';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Nexting Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Type-safe server actions and client hooks for Next.js applications. 
          Build robust, validated, and error-handled server interactions with ease.
        </p>
      </div>

      {/* Quick Start */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Start</h2>
        <CodeBlock title="Installation">
{`npm install nexting
# or
yarn add nexting
# or
pnpm add nexting`}
        </CodeBlock>
        
        <CodeBlock title="Basic Usage">
{`import { makeServerAction } from 'nexting';
import { z } from 'zod';

const createUser = makeServerAction(async (props) => {
  // Your server logic here
  return { id: '1', name: props.name };
}, {
  validationSchema: z.object({
    name: z.string().min(1),
  }),
});`}
        </CodeBlock>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            title="Server Actions"
            description="Create type-safe server actions with automatic validation using Zod schemas"
            href={DOCS_ROUTES.SERVER_ACTIONS}
            icon="⚡"
          />
          <FeatureCard
            title="Error Handling"
            description="Consistent error parsing and handling with built-in ServerError class"
            href={DOCS_ROUTES.ERROR_HANDLING}
            icon="🛡️"
          />
          <FeatureCard
            title="Immutable Hooks"
            description="SWR-based hooks for fetching immutable data with automatic type inference"
            href={DOCS_ROUTES.IMMUTABLE_HOOKS}
            icon="🔒"
          />
          <FeatureCard
            title="Mutation Hooks"
            description="SWR-based hooks for data mutations with optimistic updates and error handling"
            href={DOCS_ROUTES.MUTATION_HOOKS}
            icon="🔄"
          />
        </div>
      </section>

      {/* Key Benefits */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Key Benefits</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Type Safety:</strong> Full TypeScript support with automatic type inference from Zod schemas</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Validation:</strong> Built-in request validation using Zod with meaningful error messages</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Error Handling:</strong> Consistent error structure across your application</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>SWR Integration:</strong> Seamless integration with SWR for caching and data fetching</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Developer Experience:</strong> Intuitive API with excellent TypeScript intellisense</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Example Preview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Complete Example</h2>
        <CodeBlock title="Server Action with Client Hook">
{`// server/actions/user.ts
'use server';
import { makeServerAction } from 'nexting';
import { z } from 'zod';

export const getUserAction = makeServerAction(async (props) => {
  const user = await db.user.findUnique({ where: { id: props.id } });
  return user;
}, {
  validationSchema: z.object({
    id: z.string(),
  }),
});

// components/UserProfile.tsx
'use client';
import { makeServerActionImmutableHook } from 'nexting';
import { getUserAction } from '../server/actions/user';

const useUser = makeServerActionImmutableHook({
  key: 'user',
  action: getUserAction,
});

export default function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUser.useAction({
    context: { id: userId },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Hello, {data?.name}!</div>;
}`}
        </CodeBlock>
      </section>
    </div>
  );
}
