'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const AmplifyProvider = dynamic(() => import('./AmplifyProvider'), { ssr: false });

export default function AmplifyProviderLoader({ children }: { children: ReactNode }) {
  return <AmplifyProvider>{children}</AmplifyProvider>;
}
