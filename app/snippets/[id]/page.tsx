'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Navbar } from '@/components/navbar';
import { CodeBlock } from '@/components/code-block';
import { SnippetForm } from '@/components/snippets/snippet-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase-client';
import type { Snippet } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Star,
  Copy,
  Check,
  Sparkles,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';

export default function SnippetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;

    async function fetchSnippet() {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast.error('Failed to load snippet');
        setLoading(false);
        return;
      }

      if (!data) {
        toast.error('Snippet not found');
        router.push('/');
        return;
      }

      setSnippet(data as Snippet);
      setLoading(false);
    }

    fetchSnippet();
  }, [user, id, router]);

  const handleDelete = async () => {
    if (!snippet) return;

    const { error } = await supabase.from('snippets').delete().eq('id', snippet.id);

    if (error) {
      toast.error('Failed to delete snippet');
    } else {
      toast.success('Snippet deleted');
      router.push('/');
    }
  };

  const handleCopy = async () => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = async () => {
    if (!snippet) return;
    setTogglingFav(true);

    const newValue = !snippet.is_favorite;
    const { error } = await supabase
      .from('snippets')
      .update({ is_favorite: newValue })
      .eq('id', snippet.id);

    if (error) {
      toast.error('Failed to update favorite');
    } else {
      setSnippet({ ...snippet, is_favorite: newValue });
    }
    setTogglingFav(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!snippet) return null;

  if (isEditing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to snippet
          </Button>
          <SnippetForm snippet={snippet} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight truncate">{snippet.title}</h1>
              {snippet.is_favorite && (
                <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="capitalize rounded-md bg-secondary px-2 py-0.5 font-medium">
                {snippet.language}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(snippet.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              disabled={togglingFav}
            >
              <Star className={`mr-1.5 h-4 w-4 ${snippet.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              {snippet.is_favorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this snippet?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The snippet &ldquo;{snippet.title}&rdquo; will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* AI Summary */}
        {snippet.description && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground/90">{snippet.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {snippet.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Code */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="absolute right-3 top-3 z-10 h-8 opacity-80 hover:opacity-100"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>
      </main>
    </div>
  );
}
