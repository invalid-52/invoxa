import {
  InvoiceRecord,
  ClientRecord,
  BusinessProfile,
  UserPreferences,
  InvoiceDefaults,
  WorkspaceData,
} from './types'
import { calculateInvoiceTotals } from './calculations'
import { createDefaultDesign } from './templates'

export const STORAGE_KEYS = {
  INVOICES: 'invoxa_invoices_v4',
  CLIENTS: 'invoxa_clients_v4',
  BUSINESS: 'invoxa_business_v4',
  PREFERENCES: 'invoxa_preferences_v4',
  DEFAULTS: 'invoxa_defaults_v4',
  CUSTOM_DESIGNS: 'invoxa_custom_designs_v4',
} as const

export const DEFAULT_BUSINESS: BusinessProfile = {
  name: 'RHLIVERSE',
  legalName: 'RHLIVERSE Technologies Pvt Ltd',
  logo: '',
  logoSize: 'md',
  logoPlacement: 'left',
  email: 'billing@rhliverse.com',
  phone: '+91 98765 43210',
  website: 'rhliverse.com',
  address: 'Level 4, Innovate Tower, Brigade Gateway',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  postalCode: '560055',
  gstin: '29ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  additionalInfo: 'MSME Registered Udyam-KR-03-0012345',
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  accent: '#4F46E5', // Refined Indigo
  density: 'comfortable',
  motion: true,
}

export const DEFAULT_INVOICE_DEFAULTS: InvoiceDefaults = {
  currency: 'INR',
  paymentTerms: 'Net 30',
  taxType: 'GST',
  taxRate: 18,
  gstType: 'CGST_SGST',
  numberPrefix: 'INV-',
  nextNumber: 1004,
  notes: 'Thank you for your business. Please contact us with any questions regarding this invoice.',
  terms: 'Payment is due within the stipulated payment terms. Late payments may incur a monthly 1.5% interest charge.',
}

export const SEED_CLIENTS: ClientRecord[] = [
  {
    id: 'client-1',
    name: 'Sarah Jenkins',
    company: 'Nexus Innovations Inc.',
    email: 'accounts@nexusinnovations.com',
    phone: '+1 (415) 890-2341',
    address: '500 Howard Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94105',
    taxId: 'US-94-382910',
    notes: 'Key enterprise SaaS client. Invoices payable via wire or card.',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'client-2',
    name: 'Rohan Sharma',
    company: 'FinPulse Technologies',
    email: 'finance@finpulse.in',
    phone: '+91 91234 56789',
    address: 'Plot 18, Cyber City, Phase 2',
    city: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    postalCode: '122002',
    taxId: '06AAACF1234H1ZP',
    notes: 'Fintech client. Requires GSTIN breakdown & HSN/SAC codes on every billing.',
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'client-3',
    name: 'Elena Rostova',
    company: 'Kinetix Media Ltd',
    email: 'elena@kinetixmedia.co.uk',
    phone: '+44 20 7946 0912',
    address: '142 Clerkenwell Road',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    postalCode: 'EC1R 5BY',
    taxId: 'GB98234123',
    notes: 'Creative studio projects and quarterly retainer.',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  },
]

export function buildSeedInvoices(): InvoiceRecord[] {
  const now = new Date()
  const dateStr = (offsetDays: number) => {
    const d = new Date(now.getTime() + offsetDays * 86400000)
    return d.toISOString().slice(0, 10)
  }

  // Invoice 1: India GST Invoice (Paid)
  const inv1Items = [
    {
      id: 'item-1',
      description: 'Full-Stack Web Application Architecture & Cloud Setup',
      hsnSac: '998313',
      quantity: 1,
      unit: 'Service',
      rate: 85000,
      discount: 0,
      taxRate: 18,
      amount: 85000,
    },
    {
      id: 'item-2',
      description: 'Design System & Interactive Component Library Implementation',
      hsnSac: '998314',
      quantity: 35,
      unit: 'Hours',
      rate: 1200,
      discount: 5,
      taxRate: 18,
      amount: 39900,
    },
  ]
  const calc1 = calculateInvoiceTotals({
    items: inv1Items,
    taxType: 'GST',
    gstType: 'CGST_SGST',
    taxRate: 18,
    enableRoundOff: true,
  })

  const inv1: InvoiceRecord = {
    id: 'inv-1001',
    number: 'INV-1001',
    status: 'Paid',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[1], // FinPulse Technologies
    issueDate: dateStr(-14),
    dueDate: dateStr(16),
    paymentTerms: 'Net 30',
    poNumber: 'PO-2026-0881',
    items: inv1Items,
    taxType: 'GST',
    gstType: 'CGST_SGST',
    subtotal: calc1.subtotal,
    itemDiscounts: calc1.itemDiscounts,
    invoiceDiscountPercent: 0,
    invoiceDiscountAmount: 0,
    taxableAmount: calc1.taxableAmount,
    taxRate: 18,
    taxTotal: calc1.taxTotal,
    cgstAmount: calc1.cgstAmount,
    sgstAmount: calc1.sgstAmount,
    igstAmount: calc1.igstAmount,
    shipping: 0,
    handling: 0,
    adjustment: 0,
    roundOff: calc1.roundOff,
    total: calc1.total,
    currency: 'INR',
    payment: {
      method: 'UPI',
      bankName: 'HDFC Bank',
      accountHolder: 'RHLIVERSE Technologies Pvt Ltd',
      accountNumber: '50200012345678',
      ifsc: 'HDFC0001234',
      swift: 'HDFCINBB',
      iban: '',
      upiId: 'rhliverse@hdfcbank',
      paymentUrl: 'https://pay.rhliverse.com/inv-1001',
      qrType: 'upi',
    },
    notes: 'Payment received with thanks via UPI Transfer. Reference: UTR98234182931.',
    terms: 'Computer generated invoice. No signature required under Indian IT Act 2000.',
    createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    design: createDefaultDesign('template-gst', '#059669'),
  }

  // Invoice 2: International SaaS Client (Sent / Outstanding)
  const inv2Items = [
    {
      id: 'item-3',
      description: 'SaaS Platform Redesign - Sprint 1 & 2 Deliverables',
      quantity: 1,
      unit: 'Milestone',
      rate: 3400,
      discount: 0,
      taxRate: 0,
      amount: 3400,
    },
    {
      id: 'item-4',
      description: 'Production Performance Audit & Next.js Core Web Vitals Optimization',
      quantity: 12,
      unit: 'Hours',
      rate: 125,
      discount: 0,
      taxRate: 0,
      amount: 1500,
    },
  ]
  const calc2 = calculateInvoiceTotals({
    items: inv2Items,
    taxType: 'None',
    invoiceDiscountPercent: 5,
    enableRoundOff: true,
  })

  const inv2: InvoiceRecord = {
    id: 'inv-1002',
    number: 'INV-1002',
    status: 'Sent',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[0], // Nexus Innovations
    issueDate: dateStr(-4),
    dueDate: dateStr(11),
    paymentTerms: 'Net 15',
    poNumber: 'NX-992-Q3',
    items: inv2Items,
    taxType: 'None',
    gstType: 'IGST',
    subtotal: calc2.subtotal,
    itemDiscounts: calc2.itemDiscounts,
    invoiceDiscountPercent: 5,
    invoiceDiscountAmount: calc2.invoiceDiscountAmount,
    taxableAmount: calc2.taxableAmount,
    taxRate: 0,
    taxTotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    shipping: 0,
    handling: 0,
    adjustment: 0,
    roundOff: calc2.roundOff,
    total: calc2.total,
    currency: 'USD',
    payment: {
      method: 'Bank Transfer',
      bankName: 'Silicon Valley Bank / First Citizens',
      accountHolder: 'RHLIVERSE Global Inc',
      accountNumber: '987654321098',
      ifsc: '',
      swift: 'SVBKUS6S',
      iban: 'US34SVBK987654321098',
      upiId: '',
      paymentUrl: 'https://pay.rhliverse.com/inv-1002',
      qrType: 'url',
    },
    notes: 'Please quote invoice number INV-1002 on your wire remittance advice.',
    terms: 'Wire transfer fees must be paid by the remitter.',
    createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    design: createDefaultDesign('template-modern', '#4F46E5'),
  }

  // Invoice 3: Draft Invoice
  const inv3Items = [
    {
      id: 'item-5',
      description: 'Brand Identity Strategy & Design System Guideline Book',
      quantity: 1,
      unit: 'Package',
      rate: 2200,
      discount: 0,
      taxRate: 20,
      amount: 2200,
    },
  ]
  const calc3 = calculateInvoiceTotals({
    items: inv3Items,
    taxType: 'Standard',
    taxRate: 20,
    enableRoundOff: true,
  })

  const inv3: InvoiceRecord = {
    id: 'inv-1003',
    number: 'INV-1003',
    status: 'Draft',
    business: DEFAULT_BUSINESS,
    client: SEED_CLIENTS[2], // Kinetix Media
    issueDate: dateStr(0),
    dueDate: dateStr(30),
    paymentTerms: 'Net 30',
    items: inv3Items,
    taxType: 'Standard',
    gstType: 'CGST_SGST',
    subtotal: calc3.subtotal,
    itemDiscounts: 0,
    invoiceDiscountPercent: 0,
    invoiceDiscountAmount: 0,
    taxableAmount: calc3.taxableAmount,
    taxRate: 20,
    taxTotal: calc3.taxTotal,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    shipping: 0,
    handling: 0,
    adjustment: 0,
    roundOff: calc3.roundOff,
    total: calc3.total,
    currency: 'GBP',
    payment: {
      method: 'Bank Transfer',
      bankName: 'Barclays UK',
      accountHolder: 'RHLIVERSE UK Ltd',
      accountNumber: '12345678',
      ifsc: '',
      swift: 'BARCGB22',
      iban: 'GB29BARC20000012345678',
      upiId: '',
      paymentUrl: '',
      qrType: 'none',
    },
    notes: 'Draft proposal and initial billing for Phase 1 exploration.',
    terms: 'Standard terms and conditions apply.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    design: createDefaultDesign('template-minimal', '#111827'),
  }

  return [inv1, inv2, inv3]
}

export function loadStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed !== undefined && parsed !== null ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to save to localStorage key: ${key}`, err)
  }
}

export function exportWorkspaceData(data: {
  invoices: InvoiceRecord[]
  clients: ClientRecord[]
  business: BusinessProfile
  preferences: UserPreferences
  defaults: InvoiceDefaults
}): void {
  const payload: WorkspaceData = {
    schemaVersion: 'invoxa-v3.0',
    exportedAt: new Date().toISOString(),
    invoices: data.invoices,
    clients: data.clients,
    businessProfile: data.business,
    preferences: data.preferences,
    defaults: data.defaults,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoxa-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validateWorkspaceJson(parsed: unknown): WorkspaceData | null {
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.invoices) || !Array.isArray(obj.clients)) {
    return null
  }
  return {
    schemaVersion: String(obj.schemaVersion || 'invoxa-v3.0'),
    exportedAt: String(obj.exportedAt || new Date().toISOString()),
    invoices: obj.invoices as InvoiceRecord[],
    clients: obj.clients as ClientRecord[],
    businessProfile: (obj.businessProfile as BusinessProfile) ?? DEFAULT_BUSINESS,
    preferences: (obj.preferences as UserPreferences) ?? DEFAULT_PREFERENCES,
    defaults: (obj.defaults as InvoiceDefaults) ?? DEFAULT_INVOICE_DEFAULTS,
  }
}
