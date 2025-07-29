import CodeBlock from '../../components/ui/code-block';
import ErrorHandlingDemo from '../../components/demos/error-handling-demo';

export default function ErrorHandlingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Error Handling</h1>
        <p className="text-lg text-gray-600">
          Comprehensive error handling with consistent error structures, automatic parsing, 
          and built-in support for validation errors, generic errors, and custom ServerError instances.
        </p>
      </div>

      {/* ServerError Class */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">ServerError Class</h2>
        <p className="text-gray-600">
          The <code className="bg-gray-100 px-2 py-1 rounded">ServerError</code> class provides 
          a structured way to handle errors with consistent formatting across your application.
        </p>
        <CodeBlock title="ServerError Usage">
{`import { ServerError } from 'nexting';

// Create a custom server error
const error = new ServerError({
  message: 'User not found in database',
  code: 'USER_NOT_FOUND',
  status: 404,
  uiMessage: 'The requested user could not be found.',
});

// Throw in a server action
export const getUserAction = makeServerAction(async (props) => {
  const user = await db.user.findUnique({ where: { id: props.id } });
  
  if (!user) {
    throw new ServerError({
      message: \`User with ID \${props.id} not found\`,
      code: 'USER_NOT_FOUND',
      status: 404,
      uiMessage: 'User not found. Please check the ID and try again.',
    });
  }
  
  return user;
}, {
  validationSchema: z.object({
    id: z.string(),
  }),
});`}
        </CodeBlock>
      </section>

      {/* Parse Server Error */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">parseServerError Function</h2>
        <p className="text-gray-600">
          The <code className="bg-gray-100 px-2 py-1 rounded">parseServerError</code> function 
          automatically converts different error types into a consistent ServerError format.
        </p>
        <CodeBlock title="parseServerError Usage">
{`import { parseServerError, ParseServerErrorCode } from 'nexting';

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  const serverError = parseServerError(error, {
    defaultMessage: 'Operation failed',
    defaultCode: ParseServerErrorCode.GenericError,
    defaultStatus: 500,
    defaultUiMessage: 'Something went wrong. Please try again.',
    parser: (err) => {
      // Custom error parsing logic
      if (err instanceof MyCustomError) {
        return new ServerError({
          message: err.message,
          code: 'CUSTOM_ERROR',
          status: 422,
          uiMessage: 'Custom error occurred.',
        });
      }
      return null; // Let default parsing handle it
    },
  });
  
  // serverError is now a consistent ServerError instance
  console.log(serverError.toJSON());
}`}
        </CodeBlock>
      </section>

      {/* Error Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Automatic Error Type Handling</h2>
        <p className="text-gray-600">
          The error parsing system automatically handles different types of errors and converts them to a consistent format.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Validation Errors</h3>
            <p className="text-sm text-gray-600 mb-3">
              ZodError instances are automatically converted with appropriate status codes.
            </p>
            <CodeBlock language="json">
{`{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "status": 400,
  "uiMessage": "Please check your input"
}`}
            </CodeBlock>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Generic Errors</h3>
            <p className="text-sm text-gray-600 mb-3">
              Standard Error instances get a generic error code and 500 status.
            </p>
            <CodeBlock language="json">
{`{
  "message": "Original error message",
  "code": "GENERIC_ERROR",
  "status": 500,
  "uiMessage": "An error occurred"
}`}
            </CodeBlock>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">ServerError</h3>
            <p className="text-sm text-gray-600 mb-3">
              ServerError instances pass through unchanged with custom fields.
            </p>
            <CodeBlock language="json">
{`{
  "message": "Custom message",
  "code": "CUSTOM_CODE",
  "status": 422,
  "uiMessage": "Custom UI message"
}`}
            </CodeBlock>
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error Codes</h2>
        <p className="text-gray-600">
          Built-in error codes provide consistent error identification across your application.
        </p>
        <CodeBlock title="ParseServerErrorCode Enum">
{`export enum ParseServerErrorCode {
  ValidationError = 'VALIDATION_ERROR',
  GenericError = 'GENERIC_ERROR',
}

// Usage in custom errors
const customError = new ServerError({
  message: 'User permission denied',
  code: 'PERMISSION_DENIED', // Custom code
  status: 403,
  uiMessage: 'You do not have permission to perform this action.',
});`}
        </CodeBlock>
      </section>

      {/* Error Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error Configuration in Server Actions</h2>
        <p className="text-gray-600">
          Configure default error handling behavior for server actions using the error options.
        </p>
        <CodeBlock title="Server Action Error Configuration">
{`export const deleteUserAction = makeServerAction(async (props) => {
  // Action implementation
  const user = await findUser(props.id);
  if (!user) {
    throw new Error('User not found');
  }
  
  await deleteUser(props.id);
  return { success: true };
}, {
  validationSchema: z.object({
    id: z.string(),
  }),
  error: {
    defaultMessage: 'Failed to delete user',
    defaultCode: 'DELETE_USER_FAILED',
    defaultStatus: 500,
    defaultUiMessage: 'Unable to delete user. Please try again later.',
    parser: (error) => {
      // Custom error parsing for this action
      if (error.message === 'User not found') {
        return new ServerError({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          status: 404,
          uiMessage: 'The user you are trying to delete does not exist.',
        });
      }
      return null; // Use default parsing
    },
  },
});`}
        </CodeBlock>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Interactive Examples</h2>
        <p className="text-gray-600">
          Try these examples to see how different error types are handled and parsed:
        </p>
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <ErrorHandlingDemo />
        </div>
      </section>

      {/* Client-Side Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Client-Side Error Handling</h2>
        <p className="text-gray-600">
          Handle errors gracefully in your React components with consistent error structures.
        </p>
        <CodeBlock title="Client Error Handling">
{`'use client';
import { useState } from 'react';
import { createUserAction } from './actions';

export default function CreateUserForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createUserAction({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      });
      
      if (result.status === 'error') {
        // Show user-friendly error message
        setError(result.error.uiMessage);
        
        // Log detailed error for debugging
        console.error('Create user failed:', result.error);
        
        // Handle specific error codes
        if (result.error.code === 'VALIDATION_ERROR') {
          // Handle validation errors differently
        }
      } else {
        // Handle success
        console.log('User created:', result.data);
      }
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}`}
        </CodeBlock>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use specific error codes</strong> to enable programmatic error handling</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Provide user-friendly uiMessage</strong> for displaying to end users</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Include detailed message</strong> for debugging and logging</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Set appropriate HTTP status codes</strong> for API consistency</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Log errors on the server</strong> for monitoring and debugging</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Never expose sensitive information</strong> in error messages</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
} 