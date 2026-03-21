'use client';

import dynamic from 'next/dynamic';

export default dynamic(() => import('./mfa-setup'), { ssr: false });
