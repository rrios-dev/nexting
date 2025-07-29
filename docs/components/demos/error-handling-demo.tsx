'use client';

import { useState } from 'react';
import { makeServerAction, ServerError, parseServerError, ParseServerErrorCode } from 'nexting';
import { z } from 'zod';
import CodeBlock from '../ui/code-block';

// Demo server actions with different error scenarios
const validateEmailAction = makeServerAction(async (props) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (props.email.includes('blocked')) {
    throw new ServerError({
      message: 'This email domain is blocked',
      code: 'BLOCKED_EMAIL',
      status: 403,
      uiMessage: 'Sorry, this email domain is not allowed.',
    });
  }
  
  return { email: props.email, valid: true };
}, {
  validationSchema: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

const customErrorAction = makeServerAction(async (props) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (props.action === 'validation-error') {
    // This will be caught and parsed as a validation error
    throw new z.ZodError([
      {
        code: 'custom',
        message: 'Custom validation failed',
        path: ['custom'],
      },
    ]);
  }
  
  if (props.action === 'generic-error') {
    throw new Error('This is a generic error message');
  }
  
  if (props.action === 'server-error') {
    throw new ServerError({
      message: 'Custom server error',
      code: 'CUSTOM_ERROR',
      status: 422,
      uiMessage: 'A custom error occurred.',
    });
  }
  
  return { message: 'Success!' };
}, {
  validationSchema: z.object({
    action: z.enum(['validation-error', 'generic-error', 'server-error', 'success']),
  }),
  error: {
    defaultMessage: 'Custom default error message',
    defaultUiMessage: 'Something went wrong with this action.',
  },
});

export default function ErrorHandlingDemo() {
  const [emailInput, setEmailInput] = useState('');
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  
  const [errorAction, setErrorAction] = useState('success');
  const [errorResult, setErrorResult] = useState<any>(null);
  const [errorLoading, setErrorLoading] = useState(false);

  const handleEmailValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      const result = await validateEmailAction({ email: emailInput });
      setEmailResult(result);
    } catch (error) {
      setEmailResult({ status: 'error', error });
    }
    setEmailLoading(false);
  };

  const handleErrorDemo = async () => {
    setErrorLoading(true);
    try {
      const result = await customErrorAction({ action: errorAction as any });
      setErrorResult(result);
    } catch (error) {
      setErrorResult({ status: 'error', error });
    }
    setErrorLoading(false);
  };

  const renderResult = (result: any, loading: boolean) => {
    if (loading) {
      return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">Loading...</div>;
    }
    
    if (!result) return null;
    
    const isError = result.status === 'error';
    return (
      <div className={`p-4 rounded border ${isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
      }`}>
        <h4 className={`font-medium mb-2 ${isError ? 'text-red-800' : 'text-green-800'}`}>
          {isError ? 'Error Response' : 'Success Response'}
        </h4>
        <pre className="text-xs overflow-x-auto text-gray-800">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Custom ServerError Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom ServerError Example</h3>
        <CodeBlock title="Custom ServerError in Action">
{`const validateEmailAction = makeServerAction(async (props) => {
  if (props.email.includes('blocked')) {
    throw new ServerError({
      message: 'This email domain is blocked',
      code: 'BLOCKED_EMAIL',
      status: 403,
      uiMessage: 'Sorry, this email domain is not allowed.',
    });
  }
  
  return { email: props.email, valid: true };
}, {
  validationSchema: z.object({
    email: z.string().email('Invalid email format'),
  }),
});`}
        </CodeBlock>
        
        <form onSubmit={handleEmailValidation} className="space-y-4 p-4 border border-gray-200 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Try: user@blocked.com to see custom error"
            />
            <p className="text-xs text-gray-500 mt-1">
              Try emails with "blocked" in them to see custom ServerError handling
            </p>
          </div>
          <button
            type="submit"
            disabled={emailLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {emailLoading ? 'Validating...' : 'Validate Email'}
          </button>
        </form>
        
        {renderResult(emailResult, emailLoading)}
      </div>

      {/* Different Error Types Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Error Types</h3>
        <CodeBlock title="Error Parsing Examples">
{`// Validation Error (ZodError)
throw new z.ZodError([{
  code: 'custom',
  message: 'Custom validation failed',
  path: ['custom'],
}]);

// Generic Error
throw new Error('This is a generic error message');

// Custom ServerError
throw new ServerError({
  message: 'Custom server error',
  code: 'CUSTOM_ERROR',
  status: 422,
  uiMessage: 'A custom error occurred.',
});`}
        </CodeBlock>
        
        <div className="space-y-4 p-4 border border-gray-200 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Error Type to Simulate
            </label>
            <select
              value={errorAction}
              onChange={(e) => setErrorAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="success">Success (No Error)</option>
              <option value="validation-error">Validation Error (ZodError)</option>
              <option value="generic-error">Generic Error</option>
              <option value="server-error">Custom ServerError</option>
            </select>
          </div>
          <button
            onClick={handleErrorDemo}
            disabled={errorLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {errorLoading ? 'Testing...' : 'Test Error Handling'}
          </button>
        </div>
        
        {renderResult(errorResult, errorLoading)}
      </div>

      {/* Error Structure Explanation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Error Response Structure</h3>
        <CodeBlock title="StandardError Response Format">
{`{
  "status": "error",
  "error": {
    "message": "Detailed error message for developers",
    "code": "ERROR_CODE", // Enum or string identifier
    "status": 400, // HTTP status code
    "uiMessage": "User-friendly message for display"
  }
}`}
        </CodeBlock>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Error Handling Best Practices</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Use <code>message</code> for detailed developer information</li>
            <li>• Use <code>uiMessage</code> for user-facing error display</li>
            <li>• Provide specific <code>code</code> values for programmatic handling</li>
            <li>• Set appropriate HTTP <code>status</code> codes</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 