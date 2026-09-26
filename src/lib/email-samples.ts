/**
 * Sample data for every email the site can send, so each one can be looked at
 * in a browser without sending anything.
 *
 * One place for the fixtures rather than sample objects scattered through dev
 * routes: when a template gains a field, it fails to compile here, which is
 * the reminder to fill it in.
 */

import { customerRequestEmail, internalRequestFallbackEmail } from '@/lib/custom-request-email';
import { customerPaidEmail, customerQuoteEmail, internalOrderEmail } from '@/lib/order-emails';
import type { OrderEmailData } from '@/lib/order-emails';
import { paymentInstructionsEmail } from '@/lib/payment-email';
import { proposalEmail } from '@/lib/proposal-email';
import type { CustomRequestEmailData } from '@/lib/custom-request-email';

const ORDER: OrderEmailData = {
  orderNumber: 'YL-482913',
  sku: 'SR-02',
  productName: 'The Soft Riot Crop Set',
  color: 'Soft Riot',
  yarn: null,
  size: 'M',
  measurements: '88 / 70 / 94 / 165 cm',
  // Shown with a promo applied, since that is the case worth eyeballing —
  // the no-promo version simply drops the first two rows.
  subtotal: '฿1,990',
  discount: '-฿299 (SOFTRIOT15 · 15% off)',
  total: '฿1,691',
  leadTime: '10-14 days',
  customerName: 'Ploy Sirikul',
  customerEmail: 'ploy@example.com',
  address: '35 Sukhumvit Soi 11, Khlong Toei, Bangkok 10110, Thailand',
  contactMethod: 'LINE',
  contactHandle: 'ploy99',
};

const REQUEST: CustomRequestEmailData = {
  requestId: 'CR-4821',
  customerName: 'Ploy Sirikul',
  making: 'Two-piece set',
  enteredVia: 'Guided build',
  referenceUrl: '',
  keepAsShown: '',
  size: 'M',
  height: '165 cm',
  silhouette: 'Bodycon',
  details: 'Tie front, Cut-outs',
  yarns: '#02 Mandys Pink, #68 Pure White',
  notes: 'For a friend’s wedding — something that photographs well outdoors.',
  startingPrice: '฿890',
  contactMethod: 'LINE',
  contactHandle: 'ploy99',
  address: '35 Sukhumvit Soi 11, Khlong Toei, Bangkok 10110, Thailand',
};

export type SampleEmail = {
  key: string;
  label: string;
  /** Who receives this one in real life. */
  audience: 'Customer' | 'Studio';
  when: string;
  build: () => { subject: string; html: string; text: string };
};

export const EMAIL_SAMPLES: SampleEmail[] = [
  {
    key: 'proposal',
    label: 'Custom order proposal',
    audience: 'Customer',
    when: 'Sent by hand after a Create Your Look request, with the mockup and price.',
    build: () =>
      proposalEmail({
        customerName: 'Ploy Sirikul',
        requestId: 'CR-4821',
        pieceName: 'Custom Crochet Midi Dress',
        mockupPath: '/images/proposals/custom-dress-yellow.jpg',
        mockupAlt:
          'Mockup of a pale yellow crochet midi dress: square neckline, short scalloped sleeves, fitted bodycon shape with a flared scalloped hem and a laced-up back opening.',
        specs: [
          { label: 'Length', value: 'Knee-length' },
          { label: 'Neckline', value: 'Square' },
          { label: 'Sleeves', value: 'Short, scalloped edge' },
          { label: 'Silhouette', value: 'Bodycon, flared scalloped hem' },
          { label: 'Back', value: 'Lace-up opening with cut-out detail' },
          { label: 'Size', value: 'S' },
          { label: 'Fitted to height', value: '182 cm' },
          { label: 'Colour', value: 'Soft butter yellow' },
          { label: 'Stitch', value: 'Simplified openwork pattern, as shown' },
        ],
        price: 3900,
        shipping: 1500,
        leadTime: '10-14 days',
        caveats: ['Back view and shoes are not specified as part of this order.'],
      }),
  },
  {
    key: 'proposal-plum',
    label: 'Custom order proposal — Plum & Lilac Cascade',
    audience: 'Customer',
    when: 'Same template as above, a second design. Shows how any proposal is built.',
    build: () =>
      proposalEmail({
        customerName: 'Swarnika Gupta',
        requestId: 'CR-4907',
        pieceName: 'Plum & Lilac Cascade',
        mockupPath: '/images/proposals/custom-dress-plum-lilac.jpg',
        mockupAlt:
          'Mockup of an ankle-length crochet gown: a firm plum single-crochet bodice with a sweetheart neckline and scalloped trim, over an asymmetrical waterfall skirt of draped plum mohair and cascading lilac openwork panels, with an opaque lilac slip beneath.',
        specs: [
          { label: 'Length', value: 'Ankle-length' },
          { label: 'Silhouette', value: 'Asymmetrical waterfall' },
          { label: 'Bodice', value: 'Firm single crochet, sweetheart neckline, scalloped trim' },
          { label: 'Straps', value: 'Fine crochet shoulder straps' },
          { label: 'Skirt', value: 'V-stitch mohair overlays, cascading panels' },
          { label: 'Underlayer', value: 'Separate opaque lilac slip beneath the openwork' },
          { label: 'Size', value: 'XS' },
          { label: 'Fitted to height', value: '125 cm' },
          { label: 'Colour', value: 'Plum with lilac panels' },
        ],
        price: 2900,
        shipping: 1500,
        leadTime: '10-14 days',
        caveats: [
          'Final stitch scale and drape depend on the maker sample.',
          'Back view and shoes are not specified as part of this order.',
        ],
      }),
  },
  {
    key: 'payment',
    label: 'Payment details',
    audience: 'Customer',
    when: 'Sent by hand once the proposal is accepted.',
    build: () =>
      paymentInstructionsEmail({
        customerName: 'Ploy Sirikul',
        orderNumber: 'YL-482913',
        itemSummary: 'SR-02 The Soft Riot Crop Set · Size M',
        amount: '฿1,990',
        contactMethod: 'LINE',
      }),
  },
  {
    key: 'request-received',
    label: 'Create Your Look — received',
    audience: 'Customer',
    when: 'Automatic, the moment the wizard is submitted.',
    build: () => customerRequestEmail(REQUEST),
  },
  {
    key: 'quote',
    label: 'Order received (quote)',
    audience: 'Customer',
    when: 'Automatic from /api/custom-order when a configurator order is placed.',
    build: () => customerQuoteEmail(ORDER),
  },
  {
    key: 'paid',
    label: 'Order confirmed (paid)',
    audience: 'Customer',
    when: 'Automatic from the Stripe webhook — dormant until Stripe is switched on.',
    build: () => customerPaidEmail(ORDER),
  },
  {
    key: 'internal-order',
    label: 'Studio order card',
    audience: 'Studio',
    when: 'Automatic alongside the customer copy, to hello.youloop@gmail.com.',
    build: () => internalOrderEmail(ORDER, 'quote'),
  },
  {
    key: 'internal-fallback',
    label: 'Studio fallback notice',
    audience: 'Studio',
    when: 'Only when the Netlify Forms record fails, so the request still reaches someone.',
    build: () => internalRequestFallbackEmail(REQUEST),
  },
];
