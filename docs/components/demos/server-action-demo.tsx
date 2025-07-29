'use client';

import { useState } from 'react';
import { createUserAction, validateNumberAction, getServerTimeAction } from '../../actions/demo-server-actions';
import CodeBlock from '../ui/code-block';

export default function ServerActionDemo() {
  const [timeResult, setTimeResult] = useState<any>(null);
  const [timeLoading, setTimeLoading] = useState(false);
  
  const [userFormData, setUserFormData] = useState({ name: '', email: '' });
  const [userResult, setUserResult] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  
  const [numberInput, setNumberInput] = useState('');
  const [numberResult, setNumberResult] = useState<any>(null);
  const [numberLoading, setNumberLoading] = useState(false);

  const handleGetTime = async () => {
    setTimeLoading(true);
    try {
      const result = await getServerTimeAction();
      setTimeResult(result);
    } catch (error) {
      setTimeResult({ status: 'error', error });
    }
    setTimeLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      const result = await createUserAction(userFormData);
      setUserResult(result);
    } catch (error) {
      setUserResult({ status: 'error', error });
    }
    setUserLoading(false);
  };

  const handleValidateNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setNumberLoading(true);
    try {
      const number = parseInt(numberInput);
      const result = await validateNumberAction({ number });
      setNumberResult(result);
    } catch (error) {
      setNumberResult({ status: 'error', error });
    }
    setNumberLoading(false);
  };

  const renderResult = (result: any, loading: boolean) => {
    if (loading) {
      return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">Loading...</div>;
    }
    
    if (!result) return null;
    
    const isError = result.status === 'error';
    return (
      <div className={`p-4 rounded border ${isError 
        ? 'bg-red-50 border-red-200 text-red-800' 
        : 'bg-green-50 border-green-200 text-green-800'
      }`}>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Simple Action Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simple Server Action (No Parameters)</h3>
        <CodeBlock title="getServerTimeAction">
{`export const getServerTimeAction = makeServerAction(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    timestamp: new Date().toISOString(),
    message: 'Operation completed successfully!',
  };
});`}
        </CodeBlock>
        
        <button
          onClick={handleGetTime}
          disabled={timeLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {timeLoading ? 'Getting Time...' : 'Get Server Time'}
        </button>
        
        {renderResult(timeResult, timeLoading)}
      </div>

      {/* Validated Action Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Server Action with Validation</h3>
        <CodeBlock title="createUserAction">
{`export const createUserAction = makeServerAction(async (props) => {
  const newUser = {
    id: Date.now().toString(),
    name: props.name,
    email: props.email,
    createdAt: new Date().toISOString(),
  };
  
  return newUser;
}, {
  validationSchema: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
  }),
});`}
        </CodeBlock>
        
        <form onSubmit={handleCreateUser} className="space-y-4 p-4 border border-gray-200 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name (min 3 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter valid email"
            />
          </div>
          <button
            type="submit"
            disabled={userLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {userLoading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
        
        {renderResult(userResult, userLoading)}
      </div>

      {/* Error Handling Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Server Action with Error Handling</h3>
        <CodeBlock title="validateNumberAction">
{`export const validateNumberAction = makeServerAction(async (props) => {
  if (props.number < 0) {
    throw new Error('Number must be positive');
  }
  
  if (props.number > 100) {
    throw new Error('Number must be less than or equal to 100');
  }
  
  return {
    number: props.number,
    squared: props.number * props.number,
    isEven: props.number % 2 === 0,
  };
}, {
  validationSchema: z.object({
    number: z.number().min(0).max(100),
  }),
});`}
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
            disabled={numberLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {numberLoading ? 'Validating...' : 'Validate Number'}
          </button>
        </form>
        
        {renderResult(numberResult, numberLoading)}
      </div>
    </div>
  );
} 