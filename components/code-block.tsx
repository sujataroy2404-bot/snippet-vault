'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language, showLineNumbers = true }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-[#282c34]">
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          background: 'transparent',
        }}
        lineNumberStyle={{
          color: '#5c6370',
          fontSize: '0.75rem',
          paddingRight: '1rem',
          userSelect: 'none',
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
