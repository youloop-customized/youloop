/** Formatting and id helpers shared by the order flows. */

const BAHT = '\u0e3f';

/** 2690 -> "฿2,690" */
export function baht(amount: number): string {
  return BAHT + amount.toLocaleString('en-US');
}

/** 240 -> "-฿240" */
export function bahtDiscount(amount: number): string {
  return '-' + baht(amount);
}

/** Configurator order reference, e.g. "YL-482913". */
export function generateOrderNumber(): string {
  return 'YL-' + Math.floor(100000 + Math.random() * 900000);
}

/** Custom request reference, e.g. "YL-CR-K2J9XQ4M". */
export function generateRequestId(): string {
  return (
    'YL-CR-' +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

/** Today as yyyy-mm-dd, for <input type="date" min>. */
export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}
