export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface SnippetInput {
  title: string;
  code: string;
  language: string;
  description?: string | null;
  tags?: string[];
}

export const PROGRAMMING_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'scala',
  'sql',
  'bash',
  'shell',
  'html',
  'css',
  'json',
  'yaml',
  'markdown',
  'dockerfile',
  'graphql',
  'jsx',
  'tsx',
] as const;

export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];
