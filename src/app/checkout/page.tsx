import { Suspense } from 'react';
import type { Metadata } from 'next';
import Checkout from '@/components/configurator/Checkout';

export const metadata: Metadata = {
  title: 'Checkout | YOU LOOP',
  description: 'Review your YOU LOOP order, add your details and confirm.',
  robots: { index: false, follow: false },
};

export default function Page() {
  // useSearchParams() opts the tree into client-side rendering, which Next
  // requires a Suspense boundary for on a statically prerendered route.
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  );
}
