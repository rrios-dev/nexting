import CodeBlock from '../../components/ui/code-block';
import MutationHookDemo from '../../components/demos/mutation-hook-demo';

export default function MutationHooksPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Mutation Hooks</h1>
        <p className="text-lg text-gray-600">
          SWR-based React hooks for data mutations with optimistic updates, 
          automatic loading states, and type-safe server action integration.
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <p className="text-gray-600">
          Create mutation hooks from server actions to handle data updates, creations, and deletions with built-in state management.
        </p>
        <CodeBlock title="Creating a Mutation Hook">
{`import { makeServerActionMutationHook } from 'nexting';
import { createUserAction } from './actions';

// Create the mutation hook
const useCreateUser = makeServerActionMutationHook({
  key: 'create-user',
  action: createUserAction,
});

// Use in your component
export default function CreateUserForm() {
  const { trigger, data, error, isMutating } = useCreateUser.useAction({
    options: {
      onSuccess: (user) => {
        console.log('User created:', user);
        // Handle success (show toast, redirect, etc.)
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
        // Handle error (show error message)
      },
    },
  });

  const handleSubmit = async (formData: FormData) => {
    await trigger({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error.uiMessage}</div>}
    </form>
  );
}`}
        </CodeBlock>
      </section>

      {/* SWR Mutation Integration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">SWR Mutation Integration</h2>
        <p className="text-gray-600">
          Mutation hooks are built on top of SWR's <code className="bg-gray-100 px-2 py-1 rounded">useSWRMutation</code>, 
          providing programmatic data mutations with automatic state management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Mutation Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Programmatic triggering</li>
              <li>• Automatic loading states</li>
              <li>• Built-in error handling</li>
              <li>• Success/error callbacks</li>
              <li>• Optimistic updates support</li>
              <li>• Reset functionality</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Additional Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Type-safe mutations</li>
              <li>• Server action integration</li>
              <li>• Consistent error format</li>
              <li>• Cache invalidation</li>
              <li>• Request deduplication</li>
              <li>• Automatic retry logic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Hook Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Hook Configuration</h2>
        <p className="text-gray-600">
          Configure mutation behavior with context, callbacks, and SWR options.
        </p>
        <CodeBlock title="Complete Configuration Options">
{`const { trigger, data, error, isMutating, reset } = useCreateUser.useAction({
  // Optional: Context for the mutation key
  context: { userId: currentUser.id },
  
  // Optional: SWR mutation configuration
  options: {
    // Success callback
    onSuccess: (data, key, config) => {
      console.log('Mutation successful:', data);
      
      // Invalidate related cache entries
      mutate('/api/users'); // Refresh user list
      
      // Show success notification
      toast.success('User created successfully!');
      
      // Navigate to user profile
      router.push(\`/users/\${data.id}\`);
    },
    
    // Error callback
    onError: (error, key, config) => {
      console.error('Mutation failed:', error);
      
      // Show error notification
      toast.error(error.uiMessage || 'Failed to create user');
      
      // Track error for analytics
      analytics.track('user_creation_failed', { error: error.code });
    },
    
    // Optimistic data for immediate UI updates
    optimisticData: (currentData, { arg }) => {
      // Return optimistic data while mutation is in progress
      return {
        id: 'temp-' + Date.now(),
        ...arg,
        createdAt: new Date().toISOString(),
      };
    },
    
    // Control when optimistic updates are applied
    populateCache: true,
    
    // Revalidate cache after mutation
    revalidate: true,
    
    // Custom cache key for the mutation
    key: 'create-user-' + currentUser.id,
  },
});`}
        </CodeBlock>
      </section>

      {/* Optimistic Updates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Optimistic Updates</h2>
        <p className="text-gray-600">
          Improve user experience with optimistic updates that instantly reflect changes in the UI before server confirmation.
        </p>
        <CodeBlock title="Optimistic Update Example">
{`// Hook with optimistic updates
const useUpdateUser = makeServerActionMutationHook({
  key: 'update-user',
  action: updateUserAction,
});

export default function UserProfile({ user }: { user: User }) {
  const { trigger } = useUpdateUser.useAction({
    options: {
      optimisticData: (currentData, { arg }) => {
        // Immediately update UI with new data
        return {
          ...user,
          ...arg, // Merge the updates
          updatedAt: new Date().toISOString(),
        };
      },
      
      // Update the cache optimistically
      populateCache: (result, { arg }) => {
        // Merge the result with existing user data
        return { ...user, ...result };
      },
      
      // Revalidate to ensure data consistency
      revalidate: true,
      
      onError: (error) => {
        // If mutation fails, the cache will revert automatically
        toast.error('Failed to update user. Changes reverted.');
      },
    },
  });

  const handleUpdateName = async (newName: string) => {
    // This will update the UI immediately
    await trigger({ id: user.id, name: newName });
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => handleUpdateName('New Name')}>
        Update Name
      </button>
    </div>
  );
}`}
        </CodeBlock>
      </section>

      {/* Cache Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Cache Management</h2>
        <p className="text-gray-600">
          Manage cache updates and invalidation after mutations to keep your UI in sync.
        </p>
        <CodeBlock title="Cache Invalidation Strategies">
{`import { mutate } from 'swr';

const useDeleteUser = makeServerActionMutationHook({
  key: 'delete-user',
  action: deleteUserAction,
});

// Strategy 1: Invalidate specific cache entries
const { trigger: deleteUser } = useDeleteUser.useAction({
  options: {
    onSuccess: (result, key, config) => {
      // Invalidate user list
      mutate('/api/users');
      
      // Invalidate specific user
      mutate(['user', result.deletedUserId]);
      
      // Invalidate user posts
      mutate(['user-posts', result.deletedUserId]);
    },
  },
});

// Strategy 2: Update cache directly
const useUpdateUserStatus = makeServerActionMutationHook({
  key: 'update-user-status',
  action: updateUserStatusAction,
});

const { trigger: updateStatus } = useUpdateUserStatus.useAction({
  options: {
    onSuccess: (updatedUser) => {
      // Update user in cache
      mutate(['user', updatedUser.id], updatedUser, false);
      
      // Update user in list cache
      mutate('/api/users', (users: User[]) => {
        return users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
      }, false);
    },
  },
});

// Strategy 3: Pattern-based invalidation
const { trigger: createPost } = useCreatePost.useAction({
  options: {
    onSuccess: (newPost) => {
      // Invalidate all user posts
      mutate(
        key => typeof key === 'string' && key.startsWith('/api/posts'),
        undefined,
        { revalidate: true }
      );
    },
  },
});`}
        </CodeBlock>
      </section>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error Handling</h2>
        <p className="text-gray-600">
          Handle mutation errors gracefully with built-in error states and custom error handling.
        </p>
        <CodeBlock title="Comprehensive Error Handling">
{`export default function CreateUserForm() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { trigger, error, isMutating, reset } = useCreateUser.useAction({
    options: {
      onError: (error) => {
        // Handle different error types
        switch (error.code) {
          case 'VALIDATION_ERROR':
            // Handle validation errors
            setFormErrors({
              general: 'Please check your input and try again.',
            });
            break;
            
          case 'USER_EXISTS':
            // Handle business logic errors
            setFormErrors({
              email: 'A user with this email already exists.',
            });
            break;
            
          case 'NETWORK_ERROR':
            // Handle network errors
            toast.error('Network error. Please check your connection.');
            break;
            
          default:
            // Handle unknown errors
            toast.error(error.uiMessage || 'An unexpected error occurred.');
        }
        
        // Log error for debugging
        console.error('User creation failed:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      },
      
      onSuccess: () => {
        // Clear form errors on success
        setFormErrors({});
        reset(); // Reset mutation state
      },
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setFormErrors({}); // Clear previous errors
      await trigger({
        name: data.get('name') as string,
        email: data.get('email') as string,
      });
    } catch (err) {
      // Additional error handling if needed
      console.error('Trigger failed:', err);
    }
  };

  return (
    <form action={handleSubmit}>
      {/* General error display */}
      {(error || formErrors.general) && (
        <div className="error-banner">
          {formErrors.general || error?.uiMessage}
        </div>
      )}
      
      {/* Field-specific errors */}
      <input name="email" />
      {formErrors.email && (
        <div className="field-error">{formErrors.email}</div>
      )}
      
      <button type="submit" disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create User'}
      </button>
      
      {error && (
        <button type="button" onClick={reset}>
          Clear Error
        </button>
      )}
    </form>
  );
}`}
        </CodeBlock>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Interactive Examples</h2>
        <p className="text-gray-600">
          Try these mutation examples to see how they handle different scenarios:
        </p>
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <MutationHookDemo />
        </div>
      </section>

      {/* Performance Considerations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Performance Considerations</h2>
        <p className="text-gray-600">
          Optimize mutation performance with proper configuration and cache strategies.
        </p>
        <CodeBlock title="Performance Best Practices">
{`// 1. Use stable mutation keys
const useCreateUser = makeServerActionMutationHook({
  key: 'create-user', // Keep consistent across app
  action: createUserAction,
});

// 2. Implement optimistic updates for immediate feedback
const { trigger } = useUpdateUser.useAction({
  options: {
    optimisticData: (current, { arg }) => ({
      ...current,
      ...arg,
    }),
  },
});

// 3. Batch cache updates for multiple related changes
const { trigger: deleteUser } = useDeleteUser.useAction({
  options: {
    onSuccess: async (result) => {
      // Batch multiple cache updates
      await Promise.all([
        mutate('/api/users'),
        mutate(['user', result.id]),
        mutate(['user-posts', result.id]),
      ]);
    },
  },
});

// 4. Use context for user-specific mutations
const { trigger } = useCreatePost.useAction({
  context: { userId: currentUser.id }, // Separate cache per user
});

// 5. Debounce rapid mutations
const debouncedUpdate = useMemo(
  () => debounce(async (data) => {
    await trigger(data);
  }, 500),
  [trigger]
);`}
        </CodeBlock>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use descriptive mutation keys</strong> that clearly identify the operation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Implement proper error handling</strong> with user-friendly messages</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use optimistic updates</strong> for better perceived performance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Invalidate related cache entries</strong> after successful mutations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Provide loading states</strong> to indicate operation progress</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Reset mutation state</strong> when appropriate to clear errors</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
} 