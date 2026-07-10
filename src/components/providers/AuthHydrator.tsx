'use client';

import { ReactNode } from 'react';
import { usePersistAuth } from '@/features/auth/hooks/usePersistAuth';

export default function AuthHydrator({ children }: { children: ReactNode }) {
  // 💡 Let our TanStack Query hook handle background validation of the profile data smoothly.
  // We keep the return statement clean and simple to prevent any initial HTML layout mismatches.
  usePersistAuth();

  return <>{children}</>;
}
