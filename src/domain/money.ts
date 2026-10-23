// Money as whole minor units only. No DOM, no Supabase, no floating-point
// arithmetic on amounts: a typed amount becomes an integer number of cents (or
// laari) or it becomes nothing at all, so a half-typed figure can never be
// stored as a rounded one.

/**
 * A typed decimal as whole minor units: '250' and '250.00' are 25000 cents,
 * '1,000.5' is 100050. Returns null for anything that is not a positive amount
 * with at most `decimals` decimal places, which is what keeps Save disabled.
 */
export const parseDecimalToMinor = (text: string, decimals: number): number | null => {
  // Spaces and thousands separators are how people type; they carry no value.
  const cleaned = text.replace(/[\s,]/g, '')
  const match = /^(\d*)(?:\.(\d+))?$/.exec(cleaned)
  if (!match) return null

  const whole = match[1] ?? ''
  const fraction = match[2] ?? ''
  // '', '.' and '.5' with no digits before it are all still being typed.
  if (whole === '' && fraction === '') return null
  if (fraction.length > decimals) return null

  const scale = 10 ** decimals
  const minor = Number(whole === '' ? '0' : whole) * scale + Number(fraction.padEnd(decimals, '0') || '0')
  // Zero is not an amount: an entry must move money.
  return minor > 0 ? minor : null
}

/** A typed USD amount as whole cents, or null while it is not one. */
export const parseUsdCents = (text: string): number | null => parseDecimalToMinor(text, 2)

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Cents as the owner reads them: $1,234.56, never signed. */
export const formatUsdCents = (cents: number): string => usd.format(Math.abs(cents) / 100)

// ----- Rufiyaa at a typed rate (value 4) -----
//
// A typed MVR amount is laari (parseDecimalToMinor with two decimals, as cents
// are), and the rate is rufiyaa per one US dollar, held as the integer
// r4 = rate x 10000 so four typed decimals stay exact.

/** How many times the rate is scaled to keep it a whole number. */
const RATE_SCALE = 10000

/** A typed MVR amount as whole laari, or null while it is not one. */
export const parseMvrLaari = (text: string): number | null => parseDecimalToMinor(text, 2)

/**
 * A typed rate as the integer rate x 10000: '20' is 200000, '15.4' is 154000,
 * '15.4250' is 154250. Null for empty, zero, negative, or more than four
 * decimals, which is what keeps Save disabled and the dollar value at $0.00.
 */
export const parseRateScaled = (text: string): number | null => parseDecimalToMinor(text, 4)

/** The rate as the owner typed it, for storing in numeric(12,4). */
export const rateFromScaled = (rateScaled: number): number => rateScaled / RATE_SCALE

/**
 * Laari at a rate as US cents, rounded half up in exact integer arithmetic:
 *   usd_cents = floor((2 x laari x 10000 + r4) / (2 x r4))
 * BigInt throughout, so no floating-point drift can change a cent. MVR 1 at 8
 * is 12.5 cents and must come back as 13, not 12.
 */
export const laariToUsdCents = (laari: number, rateScaled: number): number => {
  if (laari <= 0 || rateScaled <= 0) return 0
  const numerator = 2n * BigInt(laari) * BigInt(RATE_SCALE) + BigInt(rateScaled)
  const denominator = 2n * BigInt(rateScaled)
  return Number(numerator / denominator)
}

const groups = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const groupsWithLaari = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Laari as the owner typed the rufiyaa: grouped with commas, without decimals
 * when whole (MVR 10,000) and with two otherwise (MVR 10,000.50).
 */
export const formatMvrLaari = (laari: number): string => {
  const whole = Math.abs(laari)
  return whole % 100 === 0 ? groups.format(whole / 100) : groupsWithLaari.format(whole / 100)
}

/** A rate with at least two and at most four decimals: 20.00, 15.40, 15.4250. */
export const formatRate = (rate: number): string => {
  const text = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    useGrouping: false,
  }).format(rate)
  return text
}

const plainRate = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
  useGrouping: false,
})

/**
 * A rate inside a sentence: no trailing zeros and at most the four decimals it
 * is stored to, so 20 reads '20', 15.4 reads '15.4' and 15.425 reads '15.425'.
 *
 * It stands BESIDE formatRate rather than replacing it: an entry's sheet names
 * the rate as a figure of its own ('20.00 MVR per $1'), where the padding is
 * what makes a column of figures read as money, while a statement's sub-line
 * names it mid-sentence, where a padded zero reads as a precision nobody typed.
 */
export const formatRatePlain = (rate: number): string => plainRate.format(rate)

// ----- The marks a row of the statement reads its figures by -----
//
// A total, a card figure and a subtotal are read as money in a column and keep
// their two decimals; a row figure is read as the owner says the amount. The
// two functions below are therefore DERIVED from the two formatters above
// rather than formatting anything themselves, so one grouping and one rounding
// serve the whole app: a row, a footer and the card can never state the same
// stored minor units differently.

/**
 * Stored cents as a row reads them: the one dollar formatter's own grouping with
 * a trailing '.00' taken off, so $1,500.00 reads '$1,500' while real cents stay
 * ('$1,500.50'). Nothing is rounded - two zeros are dropped, never a value.
 */
export const formatUsdWhole = (cents: number): string => formatUsdCents(cents).replace(/\.00$/, '')

/**
 * Stored laari as the statement reads them, behind the mark rufiyaa are written
 * by: 'MVR10,000', 'MVR10,000.50'. The mark is a PREFIX with no space after it,
 * so the figure and its mark read as one word and an inline rate can stand
 * directly behind them.
 */
export const formatMvrAmount = (laari: number): string => `MVR${formatMvrLaari(laari)}`
