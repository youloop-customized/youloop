import type { Metadata } from 'next';
import Configurator from '@/components/configurator/Configurator';
import { SRAC01 } from '@/data/products';

export const metadata: Metadata = {
  title: { absolute: SRAC01.title },
  description: 'SR-AC01 The Soft Riot Hood — unisex open mesh crochet pixie hood with braided tassel ties. Eight colorways, 81 yarn colors, made to order in 7-10 days.',
  alternates: { canonical: '/collection/srac01' },
};

export default function Page() {
  return <Configurator product={SRAC01} />;
}
