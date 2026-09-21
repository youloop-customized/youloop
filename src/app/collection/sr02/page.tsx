import type { Metadata } from 'next';
import Configurator from '@/components/configurator/Configurator';
import { SR02 } from '@/data/products';

export const metadata: Metadata = {
  title: { absolute: SR02.title },
  description: 'SR-02 The Soft Riot Crop Set — long sleeve open-weave mesh top and high-waist mini skirt. Four moods, 81 yarn colours, made to order in 10-14 days.',
  alternates: { canonical: '/collection/sr02' },
};

export default function Page() {
  return <Configurator product={SR02} />;
}
