'use client';

import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { submitFormFields } from '@/lib/netlify';
import s from '@/app/zucity/zucity.module.css';

const UNIT_PRICE = 25;
const WALLET = '0xec2757F903DFFb8a868fD19C60d5449c63a87363';

type Stage = 'order' | 'payment' | 'thanks';

type Order = {
  reference: string;
  quantity: number;
  amount: string;
  telegram: string;
};

/** ZC-yyyymmddhhmm-nnn, matching the original reference format. */
function generateOrderRef(): string {
  const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ZC-${stamp}-${rand}`;
}

export default function PreorderFlow() {
  const [stage, setStage] = useState<Stage>('order');
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('Pop City');
  const [order, setOrder] = useState<Order | null>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);

  const collectingAtPopCity = deliveryMethod === 'Pop City';
  const total = (quantity * UNIT_PRICE).toFixed(2);

  // Scroll after the new stage has actually rendered, not in the submit handler
  // — the target element does not exist until then.
  useEffect(() => {
    if (stage === 'payment') paymentRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (stage === 'thanks') thanksRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stage]);

  async function handleOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};
    data.forEach((value, key) => {
      fields[key] = String(value);
    });

    try {
      await submitFormFields(fields);
    } catch {
      alert(
        'Something went wrong submitting your order — please try again or message us directly.',
      );
      return;
    }

    setOrder({
      reference: generateOrderRef(),
      quantity,
      amount: `$${total} USDC`,
      telegram: String(data.get('telegram') ?? ''),
    });
    setStage('payment');
  }

  async function handlePaymentConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: Record<string, string> = {};
    data.forEach((value, key) => {
      fields[key] = String(value);
    });

    try {
      await submitFormFields(fields);
    } catch {
      alert(
        'Something went wrong confirming your payment — please try again or message us directly on Telegram.',
      );
      return;
    }

    setStage('thanks');
  }

  if (stage === 'thanks') {
    return (
      <div ref={thanksRef} className={s.paymentCard} style={{ textAlign: 'center' }}>
        <h2>Got it</h2>
        <p className={s.subLight}>
          We&apos;ll verify your transaction and confirm production over Telegram shortly.
        </p>
        <a href="https://youloop.co" className={s.thanksLink}>
          Continue to YOU LOOP →
        </a>
      </div>
    );
  }

  if (stage === 'payment' && order) {
    return (
      <div ref={paymentRef} className={s.paymentCard}>
        <h2>Almost there</h2>
        <p className={s.subLight}>
          Your pre-order is reserved. Send payment below to confirm production.
        </p>

        <div className={s.payRow}>
          <span className={s.payLabel}>Order reference</span>
          <span className={s.payValue}>{order.reference}</span>
        </div>
        <div className={s.payRow}>
          <span className={s.payLabel}>Amount due</span>
          <span className={s.payValue}>{order.amount}</span>
        </div>
        <div className={s.payRow}>
          <span className={s.payLabel}>Network</span>
          <span className={s.payValue}>USDC — Base or Ethereum</span>
        </div>

        <div className={s.walletBox}>
          <div className={s.walletAddress}>{WALLET}</div>
        </div>

        <ul className={s.steps}>
          <li data-n="1">
            Send the exact USDC amount above to the wallet address, on Base or Ethereum only.
          </li>
          <li data-n="2">Come back here and confirm below once you&apos;ve sent it.</li>
          <li data-n="3">
            You&apos;ll get production confirmation and a ship-date estimate once payment is
            verified.
          </li>
        </ul>

        <form
          name="zucity-payment-confirmation"
          className={s.confirmForm}
          onSubmit={handlePaymentConfirm}
        >
          <input type="hidden" readOnly name="form-name" value="zucity-payment-confirmation" />
          <p style={{ display: 'none' }}>
            <label>
              Don&apos;t fill this out: <input name="bot-field-2" />
            </label>
          </p>
          <input type="hidden" readOnly name="order_reference" value={order.reference} />
          <input type="hidden" readOnly name="telegram" value={order.telegram} />
          <input type="hidden" readOnly name="quantity" value={order.quantity} />
          <input type="hidden" readOnly name="amount_due" value={order.amount} />

          <div className={`${s.field} ${s.confirmLabelLight}`}>
            <label htmlFor="tx-hash">Transaction hash (optional, speeds up confirmation)</label>
            <input
              type="text"
              id="tx-hash"
              name="transaction_hash"
              className={s.confirmInput}
              placeholder="Paste your tx hash here if you have it"
            />
          </div>

          <div className={`${s.field} ${s.checkField}`}>
            <input type="checkbox" id="paid-checkbox" name="confirmed_paid" value="yes" required />
            <label htmlFor="paid-checkbox">I&apos;ve sent the payment above</label>
          </div>

          <button type="submit" className={`${s.submit} ${s.confirmSubmit}`}>
            Confirm my payment
          </button>
        </form>
      </div>
    );
  }

  return (
    <form name="zucity-preorder" className={s.form} onSubmit={handleOrder}>
      <input type="hidden" readOnly name="form-name" value="zucity-preorder" />
      <p style={{ display: 'none' }}>
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>

      <div className={s.field}>
        <label htmlFor="qty">Quantity (pairs)</label>
        <select
          id="qty"
          name="quantity"
          required
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'pair' : 'pairs'}
            </option>
          ))}
        </select>
      </div>

      <div className={s.row2}>
        <div className={s.field}>
          <label htmlFor="name">Full name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className={s.field}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
      </div>

      <div className={s.field}>
        <label htmlFor="delivery-method">Delivery method</label>
        <select
          id="delivery-method"
          name="delivery_method"
          required
          value={deliveryMethod}
          onChange={(e) => setDeliveryMethod(e.target.value)}
        >
          <option value="Pop City">Collect at Pop City venue (Sep 4 – Oct 5)</option>
          <option value="Ship">Ship to my address</option>
        </select>
      </div>

      {collectingAtPopCity && (
        <div className={s.field}>
          <div className={`${s.note} ${s.noteInline}`}>
            We&apos;ll ship your order to the Pop City venue ahead of the event. Bring your order
            reference to collect any time between Sep 4 and Oct 5.
          </div>
        </div>
      )}

      <div className={s.field}>
        <label htmlFor="address">
          {collectingAtPopCity
            ? "Backup shipping address (in case you can't collect at Pop City)"
            : 'Shipping address'}
        </label>
        <textarea id="address" name="address" rows={3} required={!collectingAtPopCity} />
      </div>

      <div className={s.field}>
        <label htmlFor="telegram">Telegram username or number</label>
        <input
          type="text"
          id="telegram"
          name="telegram"
          placeholder="@yourusername or +66..."
          required
        />
      </div>

      <div className={s.totalLine}>
        <span>Total due</span>
        <span className={s.totalAmount}>${total} USDC</span>
      </div>

      <button type="submit" className={s.submit}>
        Reserve my pre-order
      </button>
    </form>
  );
}
