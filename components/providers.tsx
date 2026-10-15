'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
