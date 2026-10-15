'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Star, ArrowRight } from 'lucide-react';
import type { Snippet } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface SnippetCardProps {
  snippet: Snippet;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  return (
    <Link href={`/snippets/${snippet.id}`} className="group block">
      <Card className="h-full border-border/60 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {snippet.title}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">{snippet.language}</p>
              </div>
            </div>
            {snippet.is_favorite && (
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>

          {snippet.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {snippet.description}
            </p>
          )}

          <div className="mb-1 overflow-hidden rounded-md bg-[#282c34] px-3 py-2">
            <pre className="line-clamp-3 text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
              {snippet.code}
            </pre>
          </div>

          {snippet.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {snippet.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  #{tag}
                </Badge>
              ))}
              {snippet.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">+{snippet.tags.length - 4}</span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between px-5 py-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View
            <ArrowRight className="h-3 w-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
