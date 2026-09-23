import type { Metadata } from 'next';
import Configurator from '@/components/configurator/Configurator';
import { SR01 } from '@/data/products';

export const metadata: Metadata = {
  title: { absolute: SR01.title },
  description: 'SR-01 The Birthday Set — a custom crochet mini dress with signature ruffle hem, arm warmers and leg warmers. Four colorways, 81 yarn colors, made to order in 10-14 days.',
  alternates: { canonical: '/collection/sr01' },
};

export default function Page() {
  return <Configurator product={SR01} />;
}
