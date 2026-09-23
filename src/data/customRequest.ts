/**
 * Options for the custom request wizard.
 *
 * The form's whole design goal is to replace a blank textarea with structured
 * choices: a customer picks rather than writes, and the studio gets consistent,
 * unambiguous parameters instead of prose to interpret.
 *
 * Everything conditional lives here rather than in the component — which
 * tweaks apply to which garment is a fact about the garments, not about the UI.
 */

export type Option = { value: string; label: string };

/**
 * How a customer starts. Two genuinely different mental models: some arrive
 * with a screenshot they want recreated, others with a shape in mind and no
 * picture. Asking for a base silhouette first is a wall for the former group.
 *
 * `shape` stays the default so the existing flow is untouched for anyone who
 * does not need the other path.
 */
export type EntryPath = 'reference' | 'shape';

/**
 * The two ways into the wizard.
 *
 * Deliberately close to wordless: a customer deciding between two buttons is
 * scanning, not reading, so each card carries one question-shaped title, one
 * line of micro-copy and the cost in time — nothing else. Step counts are the
 * real lengths of PATH_STEPS below; keep them in step if that array changes.
 */
export const ENTRY_PATHS: {
  value: EntryPath;
  title: string;
  micro: string;
  meta: string;
}[] = [
  {
    value: 'reference',
    title: 'Have a photo or video?',
    micro: 'Drop a screenshot, a Pinterest pin or a TikTok link — we recreate it.',
    meta: '2 min · 4 steps',
  },
  {
    value: 'shape',
    title: 'Build it from scratch',
    micro: 'Pick a base shape, then the neckline, fit and yarn colour.',
    meta: '4 min · 5 steps',
  },
];

/**
 * A reference photo usually shows a whole outfit when the customer only wants
 * one piece of it — the single most expensive ambiguity to resolve later.
 */
export const REFERENCE_TARGETS: Option[] = [
  { value: 'full', label: 'Full outfit / dress' },
  { value: 'top', label: 'Top only' },
  { value: 'bottom', label: 'Bottom / skirt only' },
  { value: 'set', label: 'Matching set' },
];

/** What must not change. Cheaper to tick than to describe in a paragraph. */
export const LOVED_ELEMENTS: Option[] = [
  { value: 'silhouette', label: 'The overall shape' },
  { value: 'colour', label: 'The colour' },
  { value: 'texture', label: 'The knit / texture' },
  { value: 'cutouts', label: 'The open back / cut-outs' },
  { value: 'everything', label: 'Everything — exactly as shown' },
];


/** Step 1. `unique` is the escape hatch for anything not on this list. */
export const BASE_STYLES: { value: string; label: string; hint: string }[] = [
  { value: 'dress', label: 'Dress', hint: 'Mini to maxi' },
  { value: 'set', label: 'Two-piece set', hint: 'Top + bottom' },
  { value: 'top', label: 'Crop top', hint: 'Cropped or fitted' },
  { value: 'skirt', label: 'Skirt', hint: 'Any length' },
  { value: 'pants', label: 'Pants / shorts', hint: 'Wide or fitted' },
  { value: 'unique', label: 'Something unique', hint: 'Tell us your idea' },
];

/**
 * The confirmed price of the cheapest custom piece (a top), used as the
 * "starts from" anchor. Shown twice — once at the chooser, before either
 * path is opened, and once at the end of the form, above the submit button —
 * and intentionally the same figure and the same "Custom top starts from"
 * copy in both places. It does not vary by the shape actually chosen: a
 * customer building a dress sees this exact number too, since it is an entry
 * anchor ("things start this cheap"), not a per-shape quote.
 *
 * If real per-category prices are ever wanted again, this is the one place
 * that would need to become a lookup rather than a constant — but that
 * reintroduces the "does the entry price match the shape I picked" problem
 * this replaced, so change it deliberately.
 */
export const CUSTOM_STARTING_PRICE = 890;

/**
 * Standard sizes, shared by both paths.
 *
 * Height is asked separately rather than folded in here: bust/waist/hip in cm
 * is the single biggest drop-off point for made-to-order in SEA — most people
 * are not near a tape measure when filling in a form — but height they know,
 * and it is what actually decides maxi and trouser lengths.
 */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const LENGTHS: Option[] = [
  { value: 'mini', label: 'Mini' },
  { value: 'knee', label: 'Knee-length' },
  { value: 'midi', label: 'Midi' },
  { value: 'maxi', label: 'Maxi' },
];

/**
 * Closes every single-select group in Step 3 (Neckline, Sleeves, Silhouette).
 * A customer who has not decided is not the same as one who skipped the
 * question — picking this says "I want to talk it through," which is worth
 * more to the studio than a blank field.
 */
export const NOT_SURE: Option = { value: 'not_sure', label: 'Not Sure / Open to Suggestions' };

export const NECKLINES: Option[] = [
  { value: 'v', label: 'V-neck' },
  { value: 'sweetheart', label: 'Sweetheart' },
  { value: 'square', label: 'Square' },
  { value: 'halter', label: 'Halter' },
  { value: 'round', label: 'Round' },
  { value: 'off-shoulder', label: 'Off-shoulder' },
  NOT_SURE,
];

export const SLEEVES: Option[] = [
  { value: 'sleeveless', label: 'Sleeveless' },
  { value: 'straps', label: 'Straps' },
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'flared', label: 'Flared' },
  NOT_SURE,
];

/**
 * Silhouette is single-select: a piece is A-line or bodycon or relaxed, never
 * two of them. Details are multi-select because they genuinely combine — an
 * A-line dress can be backless and have a side slit.
 *
 * These were one multi-select list, which let a customer ask for a bodycon
 * A-line and left the studio to guess which they meant.
 */
export const SILHOUETTES: Option[] = [
  { value: 'a-line', label: 'A-line' },
  { value: 'bodycon', label: 'Bodycon' },
  { value: 'relaxed', label: 'Relaxed' },
  NOT_SURE,
];

export const DETAILS: Option[] = [
  { value: 'backless', label: 'Backless' },
  { value: 'side-slit', label: 'Side slit' },
  { value: 'tie-front', label: 'Tie front' },
  { value: 'cut-out', label: 'Cut-outs' },
  { value: 'ruffles', label: 'Ruffles' },
  { value: 'fringe', label: 'Fringe' },
];

/** How many yarn colours one custom piece can be built from. */
export const MAX_YARNS = 3;

/**
 * Contact methods. Each platform is asked for in its own words — nobody has an
 * Instagram "number" or a WhatsApp "handle", and being asked for the wrong
 * thing is exactly the sort of snag that loses a form on its last step.
 */
export type ContactMethod = {
  value: string;
  label: string;
  /** Null for email, which is already collected above. */
  fieldLabel: string | null;
  placeholder: string;
  help: string;
};

/**
 * Email is deliberately not an option here. It is already collected
 * separately (for order confirmations) — this field exists specifically to
 * get a live channel for the design back-and-forth, and offering email would
 * just let people default back to the slow path this is meant to replace.
 */
export const CONTACT_METHODS: ContactMethod[] = [
  {
    value: 'line',
    label: 'LINE',
    fieldLabel: 'Your LINE ID',
    placeholder: 'LINE ID or phone number',
    help: 'Whichever you use — an ID like @youloop, or the number your LINE is registered to.',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    fieldLabel: 'Your WhatsApp number',
    placeholder: '+66 81 234 5678',
    help: 'Include your country code so we can reach you from Thailand.',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    fieldLabel: 'Your Instagram handle',
    placeholder: '@username',
    help: "Just the username — we'll DM you from @hello.youloop.",
  },
];

/**
 * Which Step 3 tweaks to show for a given base style. Asking a skirt customer
 * about necklines is the kind of friction that loses a form halfway through.
 */
export function tweaksFor(baseStyle: string | null): {
  neckline: boolean;
  sleeves: boolean;
  length: boolean;
} {
  switch (baseStyle) {
    case 'dress':
    case 'set':
      return { neckline: true, sleeves: true, length: true };
    case 'top':
      return { neckline: true, sleeves: true, length: false };
    case 'skirt':
      return { neckline: false, sleeves: false, length: true };
    case 'pants':
      return { neckline: false, sleeves: false, length: false };
    default:
      // "Something unique" — no assumptions, show everything.
      return { neckline: true, sleeves: true, length: true };
  }
}

/**
 * The step sequence for each path. Reference-led requests skip the shape,
 * tweak and separate inspo steps — the photo has already answered them.
 */
export type StepKey =
  | 'reference'
  | 'refine'
  | 'shape'
  | 'fit'
  | 'simpleFit'
  | 'tweaks'
  | 'inspo'
  | 'contact';

/**
 * The guided path designs the piece before it sizes it: shape, then all the
 * choices that make it yours, and only then the fit. Asking for measurements
 * in the middle of a design conversation breaks the momentum — sizing is
 * admin, and admin belongs after the fun part.
 */
export const PATH_STEPS: Record<EntryPath, StepKey[]> = {
  reference: ['reference', 'refine', 'simpleFit', 'contact'],
  shape: ['shape', 'tweaks', 'fit', 'inspo', 'contact'],
};

export const STEP_COPY: Record<StepKey, { title: string; intro: string }> = {
  reference: {
    title: 'Show us the look',
    intro: 'Upload a photo or paste the link. That is all we need to start.',
  },
  refine: {
    title: 'Three quick questions',
    intro: 'So we make the right piece, the right way.',
  },
  shape: {
    title: 'What are we making?',
    intro: 'Pick the shape you have in mind. You can change every detail of it next.',
  },
  fit: {
    title: 'How should it fit?',
    intro: 'A standard size is enough to start — we confirm measurements before we cast on.',
  },
  simpleFit: {
    title: 'Your size',
    intro: 'Rough is fine. We confirm everything with you before we start.',
  },
  tweaks: {
    title: 'Make it yours',
    intro: 'Pick what you like. Anything you skip, we will choose to suit the piece.',
  },
  inspo: {
    title: 'Show us your inspo',
    intro: 'Optional. A screenshot says more than a paragraph — but skip it if you have none.',
  },
  contact: {
    title: 'Where should we send it?',
    intro: 'Last step. Check your order, then tell us how to reach you.',
  },
};
