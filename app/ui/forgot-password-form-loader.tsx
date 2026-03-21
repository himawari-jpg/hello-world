'use client';

import dynamic from 'next/dynamic';

export default dynamic(() => import('./forgot-password-form'), { ssr: false });
