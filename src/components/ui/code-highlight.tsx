"use client";

import { useEffect, useState } from 'react';

interface CodeHighlightProps {
  code: string;
  language: string;
  className?: string;
}

export function CodeHighlight({ code, language, className }: CodeHighlightProps) {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function highlight() {
      try {
        // Lazy load shiki to avoid heavy bundle
        const { codeToHtml } = await import('shiki');
        
        const highlighted = await codeToHtml(code, {
          lang: language,
          theme: 'github-dark',
        });
        
        if (isMounted) {
          setHtml(highlighted);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Highlighting error:', error);
        if (isMounted) {
          setHtml(`<pre><code>${code}</code></pre>`);
          setIsLoading(false);
        }
      }
    }
    
    highlight();
    
    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (isLoading) {
    return (
      <pre className={`bg-slate-900 text-gray-300 p-4 rounded-lg overflow-x-auto ${className}`}>
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className={`shiki-wrapper overflow-x-auto rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        // Add dark theme styling
        backgroundColor: '#0d1117',
      }}
    />
  );
}

