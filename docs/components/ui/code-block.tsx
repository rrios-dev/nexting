'use client';

import { ReactNode } from 'react';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  title?: string;
}

export default function CodeBlock({ children, language = 'typescript', title }: CodeBlockProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
          {title}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language} text-gray-100 text-sm`}>
          {children}
        </code>
      </pre>
    </div>
  );
} 