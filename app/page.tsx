'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import { SnippetCard } from '@/components/snippets/snippet-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase-client';
import type { Snippet } from '@/lib/types';
import { Plus, Search, Code2, Sparkles, Tag, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchSnippets() {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching snippets:', error);
      } else {
        setSnippets(data as Snippet[]);
      }
      setLoading(false);
    }

    fetchSnippets();
  }, [user]);

  const allTags = useMemo(() => {
    const tagSet = new Map<string, number>();
    snippets.forEach((s) => {
      s.tags.forEach((t) => {
        tagSet.set(t, (tagSet.get(t) || 0) + 1);
      });
    });
    return Array.from(tagSet.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesTag = !filterTag || s.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [snippets, search, filterTag]);

  const stats = useMemo(() => ({
    total: snippets.length,
    tags: allTags.length,
    languages: new Set(snippets.map((s) => s.language)).size,
  }), [snippets, allTags.length]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Snippets</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.languages}</p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tags}</p>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search snippets, code, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild>
            <Link href="/snippets/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Snippet
            </Link>
          </Button>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !filterTag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {allTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                #{tag} <span className="opacity-60">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Snippets grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Code2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">
              {snippets.length === 0 ? 'No snippets yet' : 'No results found'}
            </h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              {snippets.length === 0
                ? 'Create your first code snippet and let AI automatically tag and summarize it.'
                : 'Try adjusting your search or filter to find what you\'re looking for.'}
            </p>
            {snippets.length === 0 && (
              <Button asChild>
                <Link href="/snippets/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create your first snippet
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
