'use client';

import { useState } from 'react';
import { makeServerActionMutationHook } from 'nexting';
import { createUserAction, validateNumberAction } from '../../actions/demo-server-actions';
import CodeBlock from '../ui/code-block';

// Create mutation hooks for the demo
const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

const useValidateNumber = makeServerActionMutationHook({
  key: 'validate-number',
  action: validateNumberAction,
});

export default function MutationHookDemo() {
  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [numberInput, setNumberInput] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // Create user mutation hook
  const { 
    trigger: createUser, 
    data: userData, 
    error: userError, 
    isMutating: isCreatingUser 
  } = useCreateUser.useAction({
    options: {
      onSuccess: (data) => {
        console.log('User created successfully:', data);
        setResults(prev => [...prev, { type: 'User Created', data, timestamp: new Date() }]);
        setUserForm({ name: '', email: '' }); // Reset form
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
        setResults(prev => [...prev, { type: 'User Creation Failed', error, timestamp: new Date() }]);
      },
    },
  });

  // Validate number mutation hook
  const { 
    trigger: validateNumber, 
    data: numberData, 
    error: numberError, 
    isMutating: isValidating 
  } = useValidateNumber.useAction({
    options: {
      onSuccess: (data) => {
        console.log('Number validated:', data);
        setResults(prev => [...prev, { type: 'Number Validated', data, timestamp: new Date() }]);
      },
      onError: (error) => {
        console.error('Number validation failed:', error);
        setResults(prev => [...prev, { type: 'Number Validation Failed', error, timestamp: new Date() }]);
      },
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    
    try {
      await createUser(userForm);
    } catch (error) {
      console.error('Trigger error:', error);
    }
  };

  const handleValidateNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const number = parseInt(numberInput);
    if (isNaN(number)) return;
    
    try {
      await validateNumber({ number });
    } catch (error) {
      console.error('Trigger error:', error);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-8">
      {/* Hook Creation Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Creating Mutation Hooks</h3>
        <CodeBlock title="Hook Creation">
{`import { makeServerActionMutationHook } from 'nexting';
import { createUserAction } from './actions';

const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

const useValidateNumber = makeServerActionMutationHook({
  key: 'validate-number',
  action: validateNumberAction,
});`}
        </CodeBlock>
      </div>

      {/* User Creation Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Creation Mutation</h3>
        <CodeBlock title="Using the Create User Hook">
{`const { trigger, data, error, isMutating } = useCreateUser.useAction({
  options: {
    onSuccess: (data) => {
      console.log('User created:', data);
      // Handle success (e.g., show toast, clear form)
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
      // Handle error (e.g., show error message)
    },
  },
});

// Trigger the mutation
const handleSubmit = async () => {
  await trigger({ name: 'John', email: 'john@example.com' });
};`}
        </CodeBlock>
        
        <form onSubmit={handleCreateUser} className="space-y-4 p-4 border border-gray-200 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name (min 3 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter valid email"
            />
          </div>
          <button
            type="submit"
            disabled={isCreatingUser || !userForm.name || !userForm.email}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isCreatingUser ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Number Validation Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Number Validation Mutation</h3>
        <CodeBlock title="Handling Validation with Mutations">
{`const { trigger, data, error, isMutating } = useValidateNumber.useAction({
  options: {
    onSuccess: (data) => {
      console.log('Number is valid:', data);
    },
    onError: (error) => {
      console.error('Validation failed:', error);
    },
  },
});

// Trigger with error handling
const handleValidation = async () => {
  try {
    await trigger({ number: 42 });
  } catch (error) {
    // Additional error handling if needed
  }
};`}
        </CodeBlock>
        
        <form onSubmit={handleValidateNumber} className="space-y-4 p-4 border border-gray-200 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number (0-100)
            </label>
            <input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a number between 0 and 100"
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Try negative numbers or numbers over 100 to see error handling
            </p>
          </div>
          <button
            type="submit"
            disabled={isValidating || !numberInput}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isValidating ? 'Validating...' : 'Validate Number'}
          </button>
        </form>
      </div>

      {/* Results Display */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mutation Results</h3>
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-500 text-center">
              No mutations performed yet. Try creating a user or validating a number above.
            </div>
          ) : (
            results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded border ${
                  result.error 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-medium ${
                    result.error ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {result.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* State Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Mutation States</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded">
            <h4 className="font-medium text-gray-900 mb-2">Create User Hook</h4>
            <div className="text-sm space-y-1">
              <div>Status: <span className={`font-medium ${isCreatingUser ? 'text-orange-600' : 'text-gray-600'}`}>
                {isCreatingUser ? 'Mutating' : 'Idle'}
              </span></div>
              <div>Has Data: <span className="font-medium">{userData ? 'Yes' : 'No'}</span></div>
              <div>Has Error: <span className="font-medium">{userError ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded">
            <h4 className="font-medium text-gray-900 mb-2">Validate Number Hook</h4>
            <div className="text-sm space-y-1">
              <div>Status: <span className={`font-medium ${isValidating ? 'text-orange-600' : 'text-gray-600'}`}>
                {isValidating ? 'Mutating' : 'Idle'}
              </span></div>
              <div>Has Data: <span className="font-medium">{numberData ? 'Yes' : 'No'}</span></div>
              <div>Has Error: <span className="font-medium">{numberError ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* SWR Mutation Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SWR Mutation Features</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Active Features:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Programmatic Triggering:</strong> Call mutations when needed, not automatically</li>
            <li>• <strong>Loading States:</strong> Track mutation progress with isMutating</li>
            <li>• <strong>Error Handling:</strong> Automatic error capture and callbacks</li>
            <li>• <strong>Success Callbacks:</strong> Execute logic after successful mutations</li>
            <li>• <strong>Optimistic Updates:</strong> Can be configured for immediate UI updates</li>
            <li>• <strong>Reset Functionality:</strong> Clear mutation state when needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 