'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import { SnippetForm } from '@/components/snippets/snippet-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewSnippetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create New Snippet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your code with AI-powered tagging and summarization.
          </p>
        </div>
        <SnippetForm />
      </main>
    </div>
  );
}
