'use client';

import { supabase } from '@/lib/supabase-client';

export interface AIResult {
  tags: string[];
  summary: string;
}

export async function generateAITags(code: string, language: string): Promise<AIResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error('You must be signed in to use AI features');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const response = await fetch(`${supabaseUrl}/functions/v1/gemini-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed (${response.status})`);
  }

  const data = await response.json();

  if (!data.tags || !data.summary) {
    throw new Error('Invalid AI response format');
  }

  return { tags: data.tags, summary: data.summary };
}
