'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_ITEMS } from '../../constants/routes';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-8">
          Nexting Docs
        </h1>
        
        <ul className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {item.title}
                </Link>
                {isActive && (
                  <p className="mt-1 px-3 text-xs text-gray-500">
                    {item.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
} 