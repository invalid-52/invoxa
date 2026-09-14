import { InvoiceTemplate, TemplateFamily, InvoiceDesign, SectionId } from './types'

export const TEMPLATE_FAMILIES: TemplateFamily[] = [
  'Minimal',
  'Modern',
  'Executive',
  'Creative',
  'Elegant',
  'Corporate',
  'India GST',
  'International',
]

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'header',
  'meta',
  'client',
  'items',
  'totals',
  'payment',
  'notes',
  'terms',
  'signature',
  'footer',
]

export const DEFAULT_SECTION_VISIBILITY: Record<SectionId, boolean> = {
  header: true,
  meta: true,
  client: true,
  items: true,
  totals: true,
  payment: true,
  notes: true,
  terms: true,
  signature: false,
  footer: true,
}

export const SECTION_METADATA: Record<SectionId, { label: string; description: string }> = {
  header: { label: 'Business Brand & Logo', description: 'Displays your business legal name, logo, and address' },
  meta: { label: 'Invoice Metadata', description: 'Displays invoice number, issue date, due date, and PO reference' },
  client: { label: 'Client / Billed To', description: 'Customer name, company, email, address, and GSTIN/Tax ID' },
  items: { label: 'Line Items Table', description: 'Products, services, quantities, rates, discounts, and HSN/SAC' },
  totals: { label: 'Totals & Tax Breakdown', description: 'Subtotal, discount, CGST/SGST/IGST breakdown, and grand total' },
  payment: { label: 'Payment Details & UPI QR', description: 'UPI instant QR code, bank transfer, account number, and IFSC' },
  notes: { label: 'Client Notes', description: 'Custom message, appreciation note, or special instructions' },
  terms: { label: 'Terms & Conditions', description: 'Payment timeline terms, late fee disclosures, and return policies' },
  signature: { label: 'Authorized Signatory', description: 'Digital signature line and authorized officer designation' },
  footer: { label: 'Document Footer', description: 'Page reference, website, and subtle brand attribution' },
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'template-minimal',
    name: 'Atelier Minimal',
    family: 'Minimal',
    description: 'Generous whitespace, quiet typographic hierarchy, and clean ruled lines for studios and creators.',
    accent: '#4F46E5', // Indigo
    tags: ['clean', 'spacious', 'modern', 'freelancer'],
    featured: true,
    serif: false,
  },
  {
    id: 'template-modern',
    name: 'Metropolitan Grid',
    family: 'Modern',
    description: 'Crisp two-column metadata, geometric badges, and balanced structured tabular layout.',
    accent: '#0284C7', // Sky Blue
    tags: ['grid', 'balanced', 'tech', 'consultant'],
    featured: true,
    serif: false,
  },
  {
    id: 'template-executive',
    name: 'Executive Suite',
    family: 'Executive',
    description: 'Authoritative top banner, enclosed summary card, and prominent totals hierarchy.',
    accent: '#0F172A', // Slate Dark
    tags: ['authoritative', 'formal', 'enterprise'],
    featured: true,
    serif: false,
  },
  {
    id: 'template-creative',
    name: 'Studio Nova',
    family: 'Creative',
    description: 'Vibrant accent stripe, distinctive typography, and contemporary layout designed for agencies.',
    accent: '#D946EF', // Fuchsia / Berry
    tags: ['bold', 'agency', 'design', 'vibrant'],
    featured: true,
    serif: false,
  },
  {
    id: 'template-elegant',
    name: 'Monograph Serif',
    family: 'Elegant',
    description: 'Editorial serif typography with delicate rules, classical proportions, and understated luxury.',
    accent: '#854D0E', // Warm Bronze / Amber
    tags: ['editorial', 'luxury', 'serif', 'consulting'],
    featured: false,
    serif: true,
  },
  {
    id: 'template-corporate',
    name: 'Enterprise Apex',
    family: 'Corporate',
    description: 'High-density information layout with PO/Project references, audit trails, and strict compliance headers.',
    accent: '#1E40AF', // Deep Royal Blue
    tags: ['corporate', 'compliance', 'b2b', 'procurement'],
    featured: false,
    serif: false,
  },
  {
    id: 'template-gst',
    name: 'Bharat GST Pro',
    family: 'India GST',
    description: 'Full GST compliant format with GSTIN, PAN, State codes, HSN/SAC table, and dedicated UPI QR panel.',
    accent: '#059669', // Emerald
    tags: ['india', 'gst', 'hsn', 'upi', 'b2b'],
    featured: true,
    serif: false,
  },
  {
    id: 'template-international',
    name: 'Global Trade',
    family: 'International',
    description: 'Optimized for international clients with SWIFT/IBAN wire instructions, VAT IDs, and multi-currency terms.',
    accent: '#2563EB', // Blue
    tags: ['international', 'cross-border', 'wire-transfer', 'vat'],
    featured: false,
    serif: false,
  },
]

export function getTemplateById(id: string): InvoiceTemplate {
  return INVOICE_TEMPLATES.find((t) => t.id === id) ?? INVOICE_TEMPLATES[0]
}

export function createDefaultDesign(templateId = 'template-modern', primaryAccent = '#4F46E5'): InvoiceDesign {
  const tmpl = getTemplateById(templateId)
  const isSerif = tmpl.family === 'Elegant'
  const isCorporate = tmpl.family === 'Corporate' || tmpl.family === 'India GST'

  return {
    templateId,
    colors: {
      primary: tmpl.accent || primaryAccent,
      secondary: '#0F172A',
      accent: tmpl.accent || primaryAccent,
      surface: '#FFFFFF',
      text: '#0F172A',
    },
    typography: {
      fontFamily: isSerif ? 'serif' : 'sans',
      scale: 1,
      headingWeight: 700,
    },
    layout: {
      pageSize: 'A4',
      density: 'comfortable',
      margin: 'normal',
      tableStyle: isCorporate ? 'boxed' : tmpl.family === 'Executive' ? 'zebra' : 'ruled',
      totalsStyle: tmpl.family === 'Executive' ? 'boxed' : tmpl.family === 'Creative' ? 'banner' : 'stacked',
      footerStyle: 'split',
      logoPlacement: tmpl.family === 'Minimal' ? 'center' : 'left',
      logoSize: 'md',
      showLogo: true,
      showWatermark: false,
      showSignature: isCorporate,
      signatoryName: 'Authorized Signatory',
      signatoryTitle: 'Managing Partner',
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    visibility: { ...DEFAULT_SECTION_VISIBILITY, signature: isCorporate },
  }
}
