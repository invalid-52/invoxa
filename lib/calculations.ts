import { InvoiceItem, TaxType, GSTType } from './types'

export interface CalculationInput {
  items: InvoiceItem[]
  taxType: TaxType
  gstType?: GSTType
  taxRate?: number // Global tax rate percentage (e.g. 18 for 18%)
  invoiceDiscountPercent?: number // 0-100
  shipping?: number
  handling?: number
  adjustment?: number
  enableRoundOff?: boolean
}

export interface CalculationResult {
  subtotal: number
  itemDiscounts: number
  subtotalAfterItemDiscounts: number
  invoiceDiscountPercent: number
  invoiceDiscountAmount: number
  taxableAmount: number
  taxRate: number
  taxTotal: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  shipping: number
  handling: number
  adjustment: number
  roundOff: number
  total: number
}

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

/**
 * Calculates item row amount taking into account quantity, rate, and item discount.
 */
export function calculateItemAmount(quantity: number, rate: number, discountPercent = 0): number {
  const safeQty = Math.max(0, safeNum(quantity))
  const safeRate = Math.max(0, safeNum(rate))
  const safeDisc = clamp(safeNum(discountPercent), 0, 100)
  const gross = safeQty * safeRate
  const discAmount = (gross * safeDisc) / 100
  return Math.max(0, gross - discAmount)
}

/**
 * Pure, centralized financial engine for invoices.
 */
export function calculateInvoiceTotals(input: CalculationInput): CalculationResult {
  const items = Array.isArray(input.items) ? input.items : []
  const taxType = input.taxType ?? 'Standard'
  const gstType = input.gstType ?? 'CGST_SGST'
  const globalTaxRate = Math.max(0, safeNum(input.taxRate, 0))
  const invoiceDiscountPercent = clamp(safeNum(input.invoiceDiscountPercent, 0), 0, 100)
  const shipping = Math.max(0, safeNum(input.shipping, 0))
  const handling = Math.max(0, safeNum(input.handling, 0))
  const adjustment = safeNum(input.adjustment, 0)
  const enableRoundOff = Boolean(input.enableRoundOff)

  let grossSubtotal = 0
  let totalItemDiscounts = 0
  let totalLineTaxes = 0
  let hasItemSpecificTaxes = false

  // Process line items
  for (const item of items) {
    const qty = Math.max(0, safeNum(item.quantity))
    const rate = Math.max(0, safeNum(item.rate))
    const discPercent = clamp(safeNum(item.discount), 0, 100)
    const itemTaxRate = Math.max(0, safeNum(item.taxRate))

    const lineGross = qty * rate
    const lineDiscount = (lineGross * discPercent) / 100
    const lineTaxable = Math.max(0, lineGross - lineDiscount)

    grossSubtotal += lineGross
    totalItemDiscounts += lineDiscount

    if (itemTaxRate > 0) {
      hasItemSpecificTaxes = true
      totalLineTaxes += (lineTaxable * itemTaxRate) / 100
    }
  }

  const subtotalAfterItemDiscounts = Math.max(0, grossSubtotal - totalItemDiscounts)

  // Invoice-level discount applied on the remaining subtotal
  const invoiceDiscountAmount = (subtotalAfterItemDiscounts * invoiceDiscountPercent) / 100
  const taxableAmount = Math.max(0, subtotalAfterItemDiscounts - invoiceDiscountAmount)

  // Tax calculation
  let taxTotal = 0
  let effectiveTaxRate = globalTaxRate

  if (taxType === 'None') {
    taxTotal = 0
    effectiveTaxRate = 0
  } else if (hasItemSpecificTaxes) {
    // If individual line items specified tax rates, scale proportionately if invoice discount was applied
    const discountRatio = subtotalAfterItemDiscounts > 0 ? taxableAmount / subtotalAfterItemDiscounts : 1
    taxTotal = totalLineTaxes * discountRatio
    effectiveTaxRate = taxableAmount > 0 ? (taxTotal / taxableAmount) * 100 : globalTaxRate
  } else {
    // Uniform tax rate applied to entire taxable amount
    taxTotal = (taxableAmount * globalTaxRate) / 100
  }

  // Split Indian GST into CGST & SGST or IGST
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (taxType === 'GST') {
    if (gstType === 'IGST') {
      igstAmount = taxTotal
      cgstAmount = 0
      sgstAmount = 0
    } else {
      // Intra-state: 50% CGST + 50% SGST
      cgstAmount = taxTotal / 2
      sgstAmount = taxTotal / 2
      igstAmount = 0
    }
  }

  // Pre-round total
  const unroundedTotal = taxableAmount + taxTotal + shipping + handling + adjustment

  // Optional Round-off to nearest whole integer
  let roundOff = 0
  let total = Math.max(0, unroundedTotal)

  if (enableRoundOff) {
    const rounded = Math.round(unroundedTotal)
    roundOff = Number((rounded - unroundedTotal).toFixed(2))
    total = Math.max(0, rounded)
  }

  return {
    subtotal: Number(grossSubtotal.toFixed(2)),
    itemDiscounts: Number(totalItemDiscounts.toFixed(2)),
    subtotalAfterItemDiscounts: Number(subtotalAfterItemDiscounts.toFixed(2)),
    invoiceDiscountPercent,
    invoiceDiscountAmount: Number(invoiceDiscountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxRate: Number(effectiveTaxRate.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    igstAmount: Number(igstAmount.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    handling: Number(handling.toFixed(2)),
    adjustment: Number(adjustment.toFixed(2)),
    roundOff,
    total: Number(total.toFixed(2)),
  }
}
