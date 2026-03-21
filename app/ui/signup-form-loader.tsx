'use client';

import dynamic from 'next/dynamic';

export default dynamic(() => import('./signup-form'), { ssr: false });
