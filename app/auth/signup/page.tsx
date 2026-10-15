'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Welcome to Snippet Vault.');
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Code2 className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Snippet Vault</h1>
            <p className="text-sm text-muted-foreground">AI-powered code snippet manager</p>
          </div>
        </div>

        <Card className="border-border/60 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
          <CardHeader>
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Start storing and organizing your code snippets</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
