export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled'

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'AED'
  | 'SAR'
  | 'JPY'
  | 'CNY'
  | 'CHF'
  | 'NZD'

export type TaxType = 'None' | 'Standard' | 'GST'

export type GSTType = 'CGST_SGST' | 'IGST'

export type PaymentMethod =
  | 'Bank Transfer'
  | 'UPI'
  | 'PayPal'
  | 'Stripe'
  | 'Cash'
  | 'Other'

export type TemplateFamily =
  | 'Minimal'
  | 'Modern'
  | 'Executive'
  | 'Creative'
  | 'Elegant'
  | 'Corporate'
  | 'India GST'
  | 'International'

export type SectionId =
  | 'header'
  | 'meta'
  | 'client'
  | 'items'
  | 'totals'
  | 'payment'
  | 'notes'
  | 'terms'
  | 'signature'
  | 'footer'

export interface InvoiceItem {
  id: string
  description: string
  hsnSac?: string
  quantity: number
  unit: string
  rate: number
  discount: number // percentage (0-100)
  taxRate: number // percentage (e.g. 18 for 18% GST)
  amount: number
}

export interface BusinessProfile {
  name: string
  legalName?: string
  logo?: string
  logoSize?: 'sm' | 'md' | 'lg'
  logoPlacement?: 'left' | 'center' | 'right'
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  gstin?: string
  pan?: string
  taxId?: string
  additionalInfo?: string
}

export interface ClientRecord {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  taxId: string // GSTIN or Tax ID
  notes: string
  createdAt: string
  updatedAt: string
}

export interface PaymentDetails {
  method: PaymentMethod
  bankName: string
  accountHolder: string
  accountNumber: string
  ifsc: string
  swift: string
  iban: string
  upiId: string
  paymentUrl: string
  qrType: 'none' | 'upi' | 'url'
}

export interface InvoiceDesign {
  templateId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    surface: string
    text: string
  }
  typography: {
    fontFamily: 'sans' | 'serif' | 'mono'
    scale: number // 0.9, 1.0, 1.1
    headingWeight: number
  }
  layout: {
    pageSize: 'A4' | 'Letter'
    density: 'compact' | 'comfortable' | 'spacious'
    margin: 'compact' | 'normal' | 'generous'
    tableStyle: 'ruled' | 'minimal' | 'zebra' | 'boxed'
    totalsStyle: 'stacked' | 'banner' | 'boxed'
    footerStyle: 'split' | 'centered' | 'minimal'
    logoPlacement: 'left' | 'center' | 'right'
    logoSize: 'sm' | 'md' | 'lg'
    showLogo: boolean
    showWatermark: boolean
    showSignature: boolean
    signatoryName?: string
    signatoryTitle?: string
  }
  sectionOrder: SectionId[]
  visibility: Record<SectionId, boolean>
}

export interface InvoiceRecord {
  id: string
  number: string
  status: InvoiceStatus
  business: BusinessProfile
  client: ClientRecord
  issueDate: string
  dueDate: string
  paymentTerms: string // e.g. "Net 15", "Net 30", "Due on Receipt"
  poNumber?: string
  items: InvoiceItem[]
  taxType: TaxType
  gstType: GSTType // For India: Intra-state (CGST+SGST) vs Inter-state (IGST)
  subtotal: number
  itemDiscounts: number
  invoiceDiscountPercent: number
  invoiceDiscountAmount: number
  taxableAmount: number
  taxRate: number // Default global tax rate if items don't have individual tax rates
  taxTotal: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  shipping: number
  handling: number
  adjustment: number
  roundOff: number
  total: number
  currency: CurrencyCode
  payment: PaymentDetails
  notes: string
  terms: string
  createdAt: string
  updatedAt: string
  design: InvoiceDesign
}

export interface InvoiceTemplate {
  id: string
  name: string
  family: TemplateFamily
  description: string
  accent: string
  tags: string[]
  featured?: boolean
  serif?: boolean
  designDefaults?: Partial<InvoiceDesign>
}

export interface UserPreferences {
  theme: 'light' | 'dim' | 'dark'
  accent: string
  density: 'comfortable' | 'compact'
  motion: boolean
}

export interface InvoiceDefaults {
  currency: CurrencyCode
  paymentTerms: string
  taxType: TaxType
  taxRate: number
  gstType: GSTType
  numberPrefix: string
  nextNumber: number
  notes: string
  terms: string
}

export interface WorkspaceData {
  schemaVersion: string
  exportedAt: string
  invoices: InvoiceRecord[]
  clients: ClientRecord[]
  businessProfile: BusinessProfile
  preferences: UserPreferences
  defaults: InvoiceDefaults
  customDesigns?: InvoiceDesign[]
}
