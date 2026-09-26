/**
 * Bank and payment details sent to a customer once an order is agreed.
 *
 * Every value here is a PLACEHOLDER. Fill these in once and the payment email
 * picks them up everywhere — nothing else needs editing. Anything left as a
 * `[bracketed]` string is rendered in the email highlighted as "to be filled
 * in", so a half-completed config is obvious in a test send rather than going
 * out to a customer looking finished.
 *
 * Keep this file out of screenshots and public repos once it holds real
 * account numbers.
 */

export type PaymentField = { label: string; value: string };

export type PaymentMethod = {
  key: string;
  /** Shown as the card heading. */
  name: string;
  /**
   * Site-relative path to a 96px square PNG, shown at 48px beside the name.
   * PNG rather than SVG because Gmail and Outlook do not render SVG in email.
   */
  logo: string;
  /** One line on who this suits — helps the customer pick without asking. */
  bestFor: string;
  fields: PaymentField[];
  /** Fee/practical note shown under the fields. */
  note?: string;
};

// Array order is the order shown in the email. Wire transfer stays last: it is
// the slowest and costliest route, kept for customers who require it.
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    key: 'wise',
    name: 'Wise',
    logo: '/images/payment/wise.png',
    bestFor:
      'Typically the fastest and most cost-effective option for payments from outside Thailand.',
    // These are the recipient details a sender enters into their own Wise
    // account to pay a Thai bank account — NOT a Wise-to-Wise transfer, which
    // is what an earlier draft of this card described. Wise asks for recipient
    // type, address and purpose as well as the bank line, so all of them are
    // here: a missing one stops the sender mid-transfer and costs a message.
    fields: [
      { label: 'Recipient name', value: 'MISS YU THU ZIN HTET' },
      { label: 'Recipient type', value: 'Individual' },
      { label: 'Bank', value: 'Krungthai Bank' },
      { label: 'Account number', value: '663-9-05960-6' },
      { label: 'Currency', value: 'THB' },
      {
        label: 'Recipient address',
        value:
          '35 AC Group Room 6515, Soi Ramkhamhaeng 50, Hua Mak, Bang Kapi, Bangkok 10240, Thailand',
      },
      { label: 'Recipient email', value: 'yuthuzh@gmail.com' },
      { label: 'Payment purpose', value: 'Personal expenses' },
    ],
    note: 'Please send in THB so that the full invoice amount is received. Wise shows its fee before you confirm the transfer.',
  },
  {
    key: 'paypal',
    name: 'PayPal',
    logo: '/images/payment/paypal.png',
    bestFor: 'Convenient for customers with an existing PayPal account.',
    fields: [{ label: 'PayPal account', value: 'yuthuzh@gmail.com' }],
    note: 'Please send the payment as "Goods and Services" so that it is covered by PayPal Buyer Protection. PayPal\'s fee is shown at checkout.',
  },
  {
    key: 'wire',
    name: 'Wire Transfer',
    logo: '/images/payment/wire.png',
    // The subtitle carries the trade-off rather than the audience: a wire is
    // the slow option, and saying so here stops a customer picking it and then
    // wondering why nothing has arrived.
    bestFor:
      'A formal bank-to-bank transfer. Usually takes 2-5 working days to arrive, so it is the slowest of the three.',
    fields: [
      { label: 'Beneficiary name', value: 'MISS YU THU ZIN HTET' },
      { label: 'Beneficiary bank', value: 'Krungthai Bank' },
      { label: 'Bank address', value: '3522 Lat Phrao Road, 3rd Floor, The Mall Lifestore Bangkapi, Khwaeng Khlong Chan, Khet Bang Kapi, Bangkok 10240, Thailand.'},
      { label: 'Account number', value: '663-9-05960-6' },
      { label: 'SWIFT / BIC', value: 'KRTHTHBKXXX' },
      { label: 'Receiving currency', value: 'THB' },
    ],
    note: 'Please select "OUR" charges (all fees paid by the sender) so that intermediary bank fees are not deducted from the amount we receive.',
  },
];

/** A value still in its placeholder state — the email flags these. */
export function isPlaceholder(value: string): boolean {
  return value.trim().startsWith('[') && value.trim().endsWith(']');
}
