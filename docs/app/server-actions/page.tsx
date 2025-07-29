import CodeBlock from '../../components/ui/code-block';
import ServerActionDemo from '../../components/demos/server-action-demo';

export default function ServerActionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Server Actions</h1>
        <p className="text-lg text-gray-600">
          Create type-safe server actions with automatic validation using Zod schemas.
          The <code className="bg-gray-100 px-2 py-1 rounded">makeServerAction</code> function 
          provides a consistent way to handle server-side logic with built-in error handling.
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <p className="text-gray-600">
          The simplest form of a server action requires no parameters and returns data directly.
        </p>
        <CodeBlock title="Simple Server Action">
{`'use server';
import { makeServerAction } from 'nexting';

export const getServerInfo = makeServerAction(async () => {
  return {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
  };
});`}
        </CodeBlock>
      </section>

      {/* With Validation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Server Actions with Validation</h2>
        <p className="text-gray-600">
          Add Zod validation schemas to automatically validate input parameters and ensure type safety.
        </p>
        <CodeBlock title="Validated Server Action">
{`'use server';
import { makeServerAction } from 'nexting';
import { z } from 'zod';

export const createUserAction = makeServerAction(async (props) => {
  // props is automatically typed based on the validation schema
  const user = await db.user.create({
    data: {
      name: props.name,
      email: props.email,
    },
  });
  
  return user;
}, {
  validationSchema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(18, 'Must be at least 18 years old').optional(),
  }),
});`}
        </CodeBlock>
      </section>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error Handling</h2>
        <p className="text-gray-600">
          Server actions automatically catch and format errors using the built-in error parsing system.
        </p>
        <CodeBlock title="Error Handling Example">
{`export const deleteUserAction = makeServerAction(async (props) => {
  const user = await db.user.findUnique({ where: { id: props.id } });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.isAdmin) {
    throw new Error('Cannot delete admin users');
  }
  
  await db.user.delete({ where: { id: props.id } });
  
  return { success: true, deletedUserId: props.id };
}, {
  validationSchema: z.object({
    id: z.string(),
  }),
  error: {
    defaultMessage: 'Failed to delete user',
    defaultUiMessage: 'Unable to delete user. Please try again.',
  },
});`}
        </CodeBlock>
      </section>

      {/* Return Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Return Types</h2>
        <p className="text-gray-600">
          Server actions return an <code className="bg-gray-100 px-2 py-1 rounded">AsyncState</code> object 
          that indicates success or error states.
        </p>
        <CodeBlock title="AsyncState Return Type">
{`// Success response
{
  status: 'success',
  data: T // Your return data
}

// Error response  
{
  status: 'error',
  error: {
    message: string,
    code: string,
    status: number,
    uiMessage: string,
  }
}`}
        </CodeBlock>
      </section>

      {/* Type Inference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Type Inference</h2>
        <p className="text-gray-600">
          TypeScript automatically infers parameter and return types from your Zod schemas and action functions.
        </p>
        <CodeBlock title="Type Inference Example">
{`const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

const createUser = makeServerAction(async (props) => {
  // props is automatically typed as:
  // { name: string; email: string; age?: number }
  
  return {
    id: '123',
    name: props.name,
    email: props.email,
    createdAt: new Date(),
  };
}, {
  validationSchema: userSchema,
});

// Usage in client code:
const result = await createUser({
  name: 'John',
  email: 'john@example.com',
  // age: 25 // optional
});

// result is typed as AsyncState<{ id: string; name: string; email: string; createdAt: Date }, ServerErrorJSON>`}
        </CodeBlock>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Interactive Examples</h2>
        <p className="text-gray-600">
          Try out these live examples to see how server actions work in practice:
        </p>
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <ServerActionDemo />
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Always use validation schemas</strong> for actions that accept parameters</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Provide meaningful error messages</strong> that help users understand what went wrong</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Keep actions focused</strong> - each action should do one thing well</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use TypeScript</strong> to get full type safety and autocompletion</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Handle edge cases</strong> and provide appropriate error responses</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
} 