import { CurrencyCode } from './types'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  locale: string
  fractionDigits: number
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', fractionDigits: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', fractionDigits: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', fractionDigits: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', fractionDigits: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', fractionDigits: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', fractionDigits: 2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', fractionDigits: 2 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE', fractionDigits: 2 },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'en-SA', fractionDigits: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', fractionDigits: 0 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', fractionDigits: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH', fractionDigits: 2 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', fractionDigits: 2 },
}

export const SUPPORTED_CURRENCIES = Object.values(CURRENCY_CONFIGS)

export function getCurrencySymbol(code: CurrencyCode = 'INR'): string {
  return CURRENCY_CONFIGS[code]?.symbol ?? '₹'
}

/**
 * Formats a monetary number with proper currency symbol, grouping, and decimal places.
 * Safely guards against NaN and infinite numbers.
 */
export function formatCurrency(amount: number | string | null | undefined, currency: CurrencyCode = 'INR'): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount)
  const safeAmount = Number.isFinite(numeric) ? numeric : 0
  const config = CURRENCY_CONFIGS[currency] ?? CURRENCY_CONFIGS.INR

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.fractionDigits,
      maximumFractionDigits: config.fractionDigits,
    }).format(safeAmount)
  } catch {
    // Fallback if locale or currency code is unsupported in environment
    return `${config.symbol}${safeAmount.toFixed(config.fractionDigits)}`
  }
}

/**
 * Formats a raw number without currency symbol.
 */
export function formatAmountNumber(amount: number | string | null | undefined, currency: CurrencyCode = 'INR'): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount)
  const safeAmount = Number.isFinite(numeric) ? numeric : 0
  const config = CURRENCY_CONFIGS[currency] ?? CURRENCY_CONFIGS.INR

  try {
    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.fractionDigits,
      maximumFractionDigits: config.fractionDigits,
    }).format(safeAmount)
  } catch {
    return safeAmount.toFixed(config.fractionDigits)
  }
}
