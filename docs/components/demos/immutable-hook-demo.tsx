'use client';

import { useState } from 'react';
import { makeServerActionImmutableHook } from 'nexting';
import { searchUsersAction, getServerTimeAction } from '../../actions/demo-server-actions';
import CodeBlock from '../ui/code-block';

// Create immutable hooks for the demo
const useSearchUsers = makeServerActionImmutableHook({
  key: 'search-users',
  action: searchUsersAction,
});

const useServerTime = makeServerActionImmutableHook({
  key: 'server-time',
  action: getServerTimeAction,
});

export default function ImmutableHookDemo() {
  const [searchQuery, setSearchQuery] = useState('john');
  const [enableSearch, setEnableSearch] = useState(true);
  const [enableTime, setEnableTime] = useState(false);

  // Use the immutable hook for user search
  const { 
    data: searchData, 
    error: searchError, 
    isLoading: searchLoading,
    mutate: refetchSearch
  } = useSearchUsers.useAction({
    context: { query: searchQuery },
    skip: !enableSearch || !searchQuery,
    options: {
      refreshInterval: enableSearch ? 10000 : 0, // Refresh every 10 seconds when enabled
      revalidateOnFocus: true,
    },
  });

  // Use the immutable hook for server time
  const { 
    data: timeData, 
    error: timeError, 
    isLoading: timeLoading,
    mutate: refetchTime
  } = useServerTime.useAction({
    context: {},
    skip: !enableTime,
    options: {
      refreshInterval: enableTime ? 2000 : 0, // Refresh every 2 seconds when enabled
    },
  });

  const renderResult = (data: any, error: any, loading: boolean, title: string) => {
    if (loading) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-yellow-800 font-medium">{title} - Loading...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-red-800 font-medium mb-2">{title} - Error</div>
          <pre className="text-xs text-red-700 overflow-x-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }
    
    if (data) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <div className="text-green-800 font-medium mb-2">{title} - Success</div>
          <pre className="text-xs text-green-700 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <div className="text-gray-600">{title} - No data (skipped or disabled)</div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hook Creation Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Creating Immutable Hooks</h3>
        <CodeBlock title="Hook Creation">
{`import { makeServerActionImmutableHook } from 'nexting';
import { searchUsersAction } from './actions';

const useSearchUsers = makeServerActionImmutableHook({
  key: 'search-users',
  action: searchUsersAction,
});

const useServerTime = makeServerActionImmutableHook({
  key: 'server-time', 
  action: getServerTimeAction,
});`}
        </CodeBlock>
      </div>

      {/* User Search Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">User Search with SWR Caching</h3>
        <CodeBlock title="Using the Search Hook">
{`const { data, error, isLoading, mutate } = useSearchUsers.useAction({
  context: { query: searchQuery },
  skip: !enableSearch || !searchQuery,
  options: {
    refreshInterval: enableSearch ? 10000 : 0, // Auto-refresh
    revalidateOnFocus: true, // Revalidate when window gets focus
  },
});`}
        </CodeBlock>
        
        <div className="p-4 border border-gray-200 rounded space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="mr-2"
              />
              Enable Search
            </label>
            <button
              onClick={() => refetchSearch()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              disabled={!enableSearch}
            >
              Manual Refetch
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for users (try: john, jane, bob)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Data auto-refreshes every 10 seconds when enabled. Try changing the query to see instant updates.
            </p>
          </div>
        </div>
        
        {renderResult(searchData, searchError, searchLoading, 'User Search')}
      </div>

      {/* Server Time Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Auto-Refreshing Server Time</h3>
        <CodeBlock title="Real-time Data with SWR">
{`const { data, error, isLoading } = useServerTime.useAction({
  context: {},
  skip: !enableTime,
  options: {
    refreshInterval: enableTime ? 2000 : 0, // Refresh every 2 seconds
  },
});`}
        </CodeBlock>
        
        <div className="p-4 border border-gray-200 rounded space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enableTime}
                onChange={(e) => setEnableTime(e.target.checked)}
                className="mr-2"
              />
              Enable Real-time Clock
            </label>
            <button
              onClick={() => refetchTime()}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              disabled={!enableTime}
            >
              Manual Refetch
            </button>
          </div>
          <p className="text-xs text-gray-500">
            When enabled, the server time refreshes automatically every 2 seconds using SWR's refreshInterval.
          </p>
        </div>
        
        {renderResult(timeData, timeError, timeLoading, 'Server Time')}
      </div>

      {/* SWR Features Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SWR Features Demonstration</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Active SWR Features:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Caching:</strong> Data is cached by key and reused across components</li>
            <li>• <strong>Deduplication:</strong> Multiple requests with same key are deduplicated</li>
            <li>• <strong>Auto-revalidation:</strong> Data refreshes on window focus (try switching tabs)</li>
            <li>• <strong>Background refresh:</strong> Data updates in background with refreshInterval</li>
            <li>• <strong>Error handling:</strong> Consistent error states across the app</li>
            <li>• <strong>Loading states:</strong> Automatic loading indicators</li>
          </ul>
        </div>
      </div>

      {/* Cache Key Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cache Key Structure</h3>
        <CodeBlock title="Generated Cache Keys">
{`// For search users hook:
const searchKey = useSearchUsers.makeKey({ query: searchQuery });
// Result: { key: 'search-users', context: { query: 'john' } }

// For server time hook:
const timeKey = useServerTime.makeKey({});
// Result: { key: 'server-time' }`}
        </CodeBlock>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-medium text-gray-800 mb-2">Current Cache Keys:</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Search Users:</strong> 
              <code className="ml-2 bg-white px-2 py-1 rounded border">
                {JSON.stringify(useSearchUsers.makeKey({ query: searchQuery }))}
              </code>
            </div>
            <div>
              <strong>Server Time:</strong> 
              <code className="ml-2 bg-white px-2 py-1 rounded border">
                {JSON.stringify(useServerTime.makeKey({}))}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 