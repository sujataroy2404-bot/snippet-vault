'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, X, Sparkles, Loader2, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { generateAITags } from '@/lib/ai';
import { PROGRAMMING_LANGUAGES } from '@/lib/types';
import type { Snippet } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface SnippetFormProps {
  snippet?: Snippet;
}

export function SnippetForm({ snippet }: SnippetFormProps) {
  const router = useRouter();
  const isEditing = !!snippet;

  const [title, setTitle] = useState(snippet?.title || '');
  const [code, setCode] = useState(snippet?.code || '');
  const [language, setLanguage] = useState(snippet?.language || 'javascript');
  const [description, setDescription] = useState(snippet?.description || '');
  const [tags, setTags] = useState<string[]>(snippet?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setCode(snippet.code);
      setLanguage(snippet.language);
      setDescription(snippet.description || '');
      setTags(snippet.tags);
    }
  }, [snippet]);

  const addCustomTag = () => {
    const cleaned = customTag.trim().toLowerCase().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setCustomTag('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAIGenerate = async () => {
    if (!code.trim()) {
      toast.error('Add some code first to generate AI tags');
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateAITags(code, language);
      const merged = [...tags, ...result.tags.map((t) => t.toLowerCase())];
      const newTags = merged.filter((t, i) => merged.indexOf(t) === i);
      setTags(newTags);
      if (!description) {
        setDescription(result.summary);
      }
      setAiUsed(true);
      toast.success('AI generated tags and summary!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate AI tags');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !code.trim()) {
      toast.error('Title and code are required');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      code,
      language,
      description: description.trim() || null,
      tags,
    };

    if (isEditing) {
      const { error } = await supabase
        .from('snippets')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', snippet!.id);

      if (error) {
        toast.error('Failed to update snippet');
        setSaving(false);
      } else {
        toast.success('Snippet updated successfully');
        router.push(`/snippets/${snippet!.id}`);
      }
    } else {
      const { data, error } = await supabase
        .from('snippets')
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error('Failed to create snippet');
        setSaving(false);
      } else {
        toast.success('Snippet saved successfully');
        router.push(`/snippets/${data.id}`);
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Snippet' : 'New Snippet'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update your code snippet. Re-run AI to refresh tags and summary.'
              : 'Save your code and let AI automatically generate tags and a summary.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Debounce hook for React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="capitalize">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              placeholder="Paste or type your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[240px] font-mono text-sm scrollbar-thin"
              required
            />
          </div>

          {/* AI button */}
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">AI Auto-Tag & Summarize</p>
              <p className="text-xs text-muted-foreground">
                Generate relevant tags and a plain-English summary from your code.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIGenerate}
              disabled={aiLoading || !code.trim()}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Description / Summary */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Summary {aiUsed && <span className="text-xs text-primary">(AI-generated)</span>}
            </Label>
            <Textarea
              id="description"
              placeholder="A brief description of what this code does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              Tags {aiUsed && tags.length > 0 && <span className="text-xs text-primary">(AI-generated)</span>}
            </Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addCustomTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={isEditing ? `/snippets/${snippet!.id}` : '/'}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-4 w-4" />
              {isEditing ? 'Update Snippet' : 'Save Snippet'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
