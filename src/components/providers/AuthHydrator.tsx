'use client';

import { ReactNode } from 'react';
import { usePersistAuth } from '@/features/auth/hooks/usePersistAuth';

export default function AuthHydrator({ children }: { children: ReactNode }) {
  usePersistAuth();

  return <>{children}</>;
}
