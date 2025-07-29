import CodeBlock from '../../components/ui/code-block';
import ImmutableHookDemo from '../../components/demos/immutable-hook-demo';

export default function ImmutableHooksPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Immutable Hooks</h1>
        <p className="text-lg text-gray-600">
          SWR-based React hooks for fetching immutable data with automatic caching, 
          background revalidation, and type-safe server action integration.
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Usage</h2>
        <p className="text-gray-600">
          Create immutable hooks from server actions to get automatic caching and revalidation features.
        </p>
        <CodeBlock title="Creating an Immutable Hook">
{`import { makeServerActionImmutableHook } from 'nexting';
import { getUserAction } from './actions';

// Create the hook
const useUser = makeServerActionImmutableHook({
  key: 'user',
  action: getUserAction,
});

// Use in your component
export default function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useUser.useAction({
    context: { id: userId },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Hello, {data?.name}!</h1>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}`}
        </CodeBlock>
      </section>

      {/* SWR Integration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">SWR Integration</h2>
        <p className="text-gray-600">
          Immutable hooks are built on top of SWR's <code className="bg-gray-100 px-2 py-1 rounded">useSWRImmutable</code>, 
          providing all SWR features with type-safe server actions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">SWR Features Included:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatic caching by key</li>
              <li>• Request deduplication</li>
              <li>• Background revalidation</li>
              <li>• Focus revalidation</li>
              <li>• Network recovery</li>
              <li>• Error retry logic</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Additional Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Type-safe data fetching</li>
              <li>• Server action integration</li>
              <li>• Consistent error handling</li>
              <li>• Automatic loading states</li>
              <li>• Manual revalidation</li>
              <li>• Conditional fetching</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Hook Options */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Hook Options</h2>
        <p className="text-gray-600">
          Configure hook behavior with context, skip conditions, and SWR options.
        </p>
        <CodeBlock title="Hook Configuration Options">
{`const { data, error, isLoading, mutate } = useUser.useAction({
  // Required: Context passed to the server action
  context: { id: userId },
  
  // Optional: Skip the request when true
  skip: !userId || userId === '',
  
  // Optional: SWR configuration options
  options: {
    // Refresh data every 30 seconds
    refreshInterval: 30000,
    
    // Revalidate when window gets focus
    revalidateOnFocus: true,
    
    // Revalidate when network comes back online
    revalidateOnReconnect: true,
    
    // Number of retry attempts on error
    errorRetryCount: 3,
    
    // Custom error retry interval
    errorRetryInterval: 5000,
    
    // Disable automatic revalidation
    revalidateIfStale: false,
    
    // Custom cache key fallback behavior
    fallbackData: undefined,
    
    // Custom onSuccess callback
    onSuccess: (data) => {
      console.log('Data loaded successfully:', data);
    },
    
    // Custom onError callback
    onError: (error) => {
      console.error('Failed to load data:', error);
    },
  },
});`}
        </CodeBlock>
      </section>

      {/* Conditional Fetching */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Conditional Fetching</h2>
        <p className="text-gray-600">
          Use the <code className="bg-gray-100 px-2 py-1 rounded">skip</code> option to conditionally fetch data based on your application state.
        </p>
        <CodeBlock title="Conditional Fetching Examples">
{`// Skip when user ID is not available
const { data: user } = useUser.useAction({
  context: { id: userId },
  skip: !userId,
});

// Skip when user is not authenticated
const { data: profile } = useUserProfile.useAction({
  context: { id: currentUser?.id },
  skip: !currentUser?.isAuthenticated,
});

// Skip based on multiple conditions
const { data: posts } = useUserPosts.useAction({
  context: { userId, page: currentPage },
  skip: !userId || currentPage < 1 || !hasPermission,
});

// Skip when in offline mode
const { data: stats } = useStats.useAction({
  context: {},
  skip: !navigator.onLine,
});`}
        </CodeBlock>
      </section>

      {/* Cache Key Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Cache Key Management</h2>
        <p className="text-gray-600">
          Each hook generates cache keys based on the hook key and context, enabling precise cache control.
        </p>
        <CodeBlock title="Cache Key Usage">
{`const useUser = makeServerActionImmutableHook({
  key: 'user', // Base cache key
  action: getUserAction,
});

// Generate cache key for specific context
const userKey = useUser.makeKey({ id: '123' });
// Result: { key: 'user', context: { id: '123' } }

// Use with SWR's mutate for manual cache updates
import { mutate } from 'swr';

// Update specific user in cache
mutate(userKey, newUserData);

// Clear specific user from cache
mutate(userKey, undefined);

// Revalidate specific user
mutate(userKey);

// Update all users (using key prefix)
mutate(
  (key) => typeof key === 'object' && key.key === 'user',
  undefined,
  { revalidate: true }
);`}
        </CodeBlock>
      </section>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Error Handling</h2>
        <p className="text-gray-600">
          Immutable hooks automatically handle server action errors and convert them to SWR error format.
        </p>
        <CodeBlock title="Error Handling in Components">
{`export default function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useUser.useAction({
    context: { id: userId },
    options: {
      onError: (error) => {
        // Log error for debugging
        console.error('Failed to load user:', error);
        
        // Show toast notification
        toast.error(error.uiMessage || 'Failed to load user');
      },
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    },
  });

  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="error-state">
        <h2>Unable to load user</h2>
        <p>{error.uiMessage}</p>
        <button onClick={() => mutate()}>
          Try Again
        </button>
      </div>
    );
  }

  return <UserDetails user={data} />;
}`}
        </CodeBlock>
      </section>

      {/* Performance Optimization */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Performance Optimization</h2>
        <p className="text-gray-600">
          Optimize performance with proper cache configuration and request deduplication.
        </p>
        <CodeBlock title="Performance Best Practices">
{`// 1. Use stable cache keys
const useUser = makeServerActionImmutableHook({
  key: 'user', // Keep keys consistent across app
  action: getUserAction,
});

// 2. Configure appropriate refresh intervals
const { data } = useUser.useAction({
  context: { id: userId },
  options: {
    // For frequently changing data
    refreshInterval: 5000,
    
    // For rarely changing data
    refreshInterval: 300000, // 5 minutes
    
    // For static data
    refreshInterval: 0, // No automatic refresh
  },
});

// 3. Use conditional fetching to avoid unnecessary requests
const { data } = useUser.useAction({
  context: { id: userId },
  skip: !shouldFetchUser,
});

// 4. Preload data for better UX
const { mutate: preloadUser } = useUser.useAction({
  context: { id: nextUserId },
  skip: true, // Don't fetch immediately
});

// Preload when hovering over a link
const handleMouseEnter = () => {
  preloadUser(); // Starts the request
};`}
        </CodeBlock>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Interactive Examples</h2>
        <p className="text-gray-600">
          Experience immutable hooks in action with real-time data fetching and SWR features:
        </p>
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <ImmutableHookDemo />
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Best Practices</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use descriptive cache keys</strong> that clearly identify the data being fetched</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Implement conditional fetching</strong> to avoid unnecessary requests</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Configure appropriate refresh intervals</strong> based on data volatility</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Handle loading and error states</strong> gracefully in your UI</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Use manual revalidation</strong> for user-triggered data refreshes</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span><strong>Leverage SWR's global configuration</strong> for consistent behavior across your app</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
} 