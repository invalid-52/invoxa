'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Save,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building,
  User,
  ListOrdered,
  Calculator,
  CreditCard,
  FileText,
  Palette,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  QrCode,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  BookmarkPlus,
  Layers,
  Sliders,
  Type,
  Plus,
} from 'lucide-react'
import {
  InvoiceRecord,
  ClientRecord,
  BusinessProfile,
  TaxType,
  GSTType,
  PaymentMethod,
  CurrencyCode,
  SectionId,
} from '@/lib/types'
import { LineItemsEditor } from './LineItemsEditor'
import { InvoicePaper } from './InvoicePaper'
import { calculateInvoiceTotals } from '@/lib/calculations'
import {
  INVOICE_TEMPLATES,
  SECTION_METADATA,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
} from '@/lib/templates'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

interface InvoiceEditorViewProps {
  invoice: InvoiceRecord
  invoices?: InvoiceRecord[]
  clients: ClientRecord[]
  businessProfile: BusinessProfile
  onSave: (updated: InvoiceRecord) => void
  onBack: () => void
  onOpenTemplates: () => void
  onSelectInvoice?: (invoice: InvoiceRecord) => void
  onCreateNew?: () => void
}

type EditorTab = 'content' | 'design' | 'sections'

const PRESET_ACCENTS = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky Blue
  '#059669', // Emerald
  '#D946EF', // Fuchsia
  '#854D0E', // Bronze / Amber
  '#0F172A', // Slate
  '#E11D48', // Rose
  '#7C3AED', // Violet
]

export function InvoiceEditorView({
  invoice,
  invoices = [],
  clients,
  businessProfile,
  onSave,
  onBack,
  onOpenTemplates,
  onSelectInvoice,
  onCreateNew,
}: InvoiceEditorViewProps) {
  const [current, setCurrent] = useState<InvoiceRecord>(invoice)

  useEffect(() => {
    setCurrent(invoice)
  }, [invoice])

  const [activeTab, setActiveTab] = useState<EditorTab>('content')
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [zoomScale, setZoomScale] = useState<number>(0.85)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showHsn, setShowHsn] = useState(invoice.taxType === 'GST')
  const [saveDesignModalOpen, setSaveDesignModalOpen] = useState(false)
  const [customTemplateName, setCustomTemplateName] = useState('')

  // Collapsible panel states for Content tab
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    details: true,
    client: true,
    items: true,
    adjustments: true,
    payment: true,
    notes: false,
  })

  const togglePanel = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Auto-recalculate financial math
  const recalculateAndUpdate = (patch: Partial<InvoiceRecord>) => {
    const next = { ...current, ...patch }
    const calc = calculateInvoiceTotals({
      items: next.items,
      taxType: next.taxType,
      gstType: next.gstType,
      taxRate: next.taxRate,
      invoiceDiscountPercent: next.invoiceDiscountPercent,
      shipping: next.shipping,
      handling: next.handling,
      adjustment: next.adjustment,
      enableRoundOff: true,
    })

    const updated: InvoiceRecord = {
      ...next,
      subtotal: calc.subtotal,
      itemDiscounts: calc.itemDiscounts,
      invoiceDiscountAmount: calc.invoiceDiscountAmount,
      taxableAmount: calc.taxableAmount,
      taxTotal: calc.taxTotal,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      shipping: calc.shipping,
      handling: calc.handling,
      adjustment: calc.adjustment,
      roundOff: calc.roundOff,
      total: calc.total,
      updatedAt: new Date().toISOString(),
    }

    setCurrent(updated)
    setSaveStatus('idle')
  }

  const updateDesign = (patch: Partial<InvoiceRecord['design']>) => {
    recalculateAndUpdate({
      design: {
        ...current.design,
        ...patch,
      },
    })
  }

  const handleSave = () => {
    setSaveStatus('saving')
    onSave(current)
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }, 300)
  }

  // Section Ordering Handlers
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const order = [...(current.design.sectionOrder || DEFAULT_SECTION_ORDER)]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= order.length) return

    const temp = order[index]
    order[index] = order[targetIndex]
    order[targetIndex] = temp

    updateDesign({ sectionOrder: order })
  }

  const toggleSectionVisibility = (sectionId: SectionId) => {
    const currentVis = current.design.visibility || DEFAULT_SECTION_VISIBILITY
    updateDesign({
      visibility: {
        ...currentVis,
        [sectionId]: currentVis[sectionId] === false ? true : false,
      },
    })
  }

  const resetSectionOrder = () => {
    updateDesign({
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      visibility: { ...DEFAULT_SECTION_VISIBILITY },
    })
  }

  // Save current design preset
  const handleSaveCustomDesign = () => {
    if (!customTemplateName.trim()) {
      alert('Please enter a name for your custom template.')
      return
    }
    try {
      const existingRaw = localStorage.getItem('invoxa_custom_designs_v3')
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      const newDesignPreset = {
        id: `custom-tmpl-${Date.now()}`,
        name: customTemplateName.trim(),
        design: current.design,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(
        'invoxa_custom_designs_v3',
        JSON.stringify([...existing, newDesignPreset])
      )
      setSaveDesignModalOpen(false)
      setCustomTemplateName('')
      alert(`Design preset "${newDesignPreset.name}" saved successfully!`)
    } catch {
      alert('Failed to save design to browser storage.')
    }
  }

  const currentOrder = current.design.sectionOrder?.length
    ? current.design.sectionOrder
    : DEFAULT_SECTION_ORDER
  const currentVisibility = current.design.visibility || DEFAULT_SECTION_VISIBILITY

  return (
    <div className="invoice-editor-layout">
      {/* Studio Top Navigation Bar */}
      <div className="editor-top-nav">
        <div className="editor-nav-left">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft className="size-4" />
            <span>Invoices</span>
          </button>
          <div className="editor-doc-meta">
            {invoices.length > 1 && onSelectInvoice ? (
              <div className="editor-invoice-switcher">
                <select
                  value={current.id}
                  onChange={(e) => {
                    const found = invoices.find((inv) => inv.id === e.target.value)
                    if (found) onSelectInvoice(found)
                  }}
                  className="editor-invoice-select"
                  aria-label="Switch invoice"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} — {inv.client.company || inv.client.name || 'Draft'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h1 className="editor-doc-title">{current.number}</h1>
            )}
            <span className={`status-pill status-${current.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {current.status}
            </span>
            {saveStatus === 'saved' && (
              <span className="save-indicator text-emerald-600">
                <Check className="size-3.5" />
                <span>Saved ✓</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Save Design & Template Selector */}
        <div className="editor-template-quick-select">
          <Palette className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Layout:</span>
          <select
            value={current.design.templateId}
            onChange={(e) => {
              const tmpl = INVOICE_TEMPLATES.find((t) => t.id === e.target.value)
              if (tmpl) {
                updateDesign({
                  templateId: tmpl.id,
                  colors: {
                    ...current.design.colors,
                    primary: tmpl.accent,
                  },
                })
              }
            }}
            className="template-select-inline"
          >
            {INVOICE_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name} ({tmpl.family})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-save-design-pill"
            onClick={() => setSaveDesignModalOpen(true)}
            title="Save current layout & styling as a reusable design"
          >
            <BookmarkPlus className="size-3.5" />
            <span>Save Design</span>
          </button>
        </div>

        <div className="editor-nav-actions">
          {/* Mobile Tab Switcher */}
          <div className="mobile-view-segmented-control">
            <button
              className={`seg-btn ${mobileTab === 'edit' ? 'active' : ''}`}
              onClick={() => setMobileTab('edit')}
            >
              Edit Form
            </button>
            <button
              className={`seg-btn ${mobileTab === 'preview' ? 'active' : ''}`}
              onClick={() => setMobileTab('preview')}
            >
              Live Preview
            </button>
          </div>

          <button
            className="btn-secondary"
            onClick={() => window.print()}
            title="Download PDF or Print"
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button className="btn-primary" onClick={handleSave}>
            <Save className="size-4" />
            <span>{saveStatus === 'saving' ? 'Saving…' : 'Save Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Controls, Right Preview */}
      <div className="editor-studio-split">
        {/* LEFT COLUMN: Inspector with Tabs: [Content] | [Design] | [Sections] */}
        <div className={`editor-controls-column ${mobileTab === 'preview' ? 'hidden-mobile' : ''}`}>
          {/* Three Primary Studio Tabs */}
          <div className="inspector-top-tabs-bar">
            <button
              className={`inspector-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <FileText className="size-4" />
              <span>Content</span>
            </button>
            <button
              className={`inspector-tab-btn ${activeTab === 'design' ? 'active' : ''}`}
              onClick={() => setActiveTab('design')}
            >
              <Palette className="size-4" />
              <span>Design</span>
            </button>
            <button
              className={`inspector-tab-btn ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              <Layers className="size-4" />
              <span>Sections</span>
            </button>
          </div>

          {/* TAB 1: CONTENT */}
          {activeTab === 'content' && (
            <div className="tab-pane-content">
              {/* 1. Invoice Details */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('details')}>
                  <div className="section-title-group">
                    <FileText className="size-4 text-indigo-500" />
                    <h3>Invoice Details</h3>
                  </div>
                  {expanded.details ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.details && (
                  <div className="section-card-body">
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Invoice Number</label>
                        <input
                          type="text"
                          value={current.number}
                          onChange={(e) => recalculateAndUpdate({ number: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Currency</label>
                        <select
                          value={current.currency}
                          onChange={(e) => recalculateAndUpdate({ currency: e.target.value as CurrencyCode })}
                          className="input-select"
                        >
                          {SUPPORTED_CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} ({c.symbol} - {c.name})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={current.status}
                          onChange={(e) => recalculateAndUpdate({ status: e.target.value as any })}
                          className="input-select"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-3 mt-3">
                      <div className="form-group">
                        <label>Invoice Date</label>
                        <input
                          type="date"
                          value={current.issueDate}
                          onChange={(e) => recalculateAndUpdate({ issueDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Due Date</label>
                        <input
                          type="date"
                          value={current.dueDate}
                          onChange={(e) => recalculateAndUpdate({ dueDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Terms</label>
                        <input
                          type="text"
                          placeholder="e.g. Net 30"
                          value={current.paymentTerms}
                          onChange={(e) => recalculateAndUpdate({ paymentTerms: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>PO / Reference Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. PO-2026-9901"
                        value={current.poNumber || ''}
                        onChange={(e) => recalculateAndUpdate({ poNumber: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Client / Billed To */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('client')}>
                  <div className="section-title-group">
                    <User className="size-4 text-emerald-500" />
                    <h3>Client / Billed To</h3>
                  </div>
                  {expanded.client ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.client && (
                  <div className="section-card-body">
                    {clients.length > 0 && (
                      <div className="form-group mb-3">
                        <label className="text-xs text-muted-foreground">Pick from saved clients:</label>
                        <select
                          className="input-select"
                          value={current.client?.id || ''}
                          onChange={(e) => {
                            const matched = clients.find((c) => c.id === e.target.value)
                            if (matched) recalculateAndUpdate({ client: matched })
                          }}
                        >
                          <option value="">-- Or enter custom client details below --</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.company || c.name} ({c.email || 'No email'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Company / Organization</label>
                        <input
                          type="text"
                          placeholder="e.g. Nexus Innovations"
                          value={current.client?.company || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, company: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Person</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={current.client?.name || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, name: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2 mt-3">
                      <div className="form-group">
                        <label>Client Email</label>
                        <input
                          type="email"
                          placeholder="billing@client.com"
                          value={current.client?.email || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, email: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Client Phone</label>
                        <input
                          type="text"
                          placeholder="+1 (555) 000-0000"
                          value={current.client?.phone || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, phone: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Billing Address</label>
                      <input
                        type="text"
                        placeholder="Street address..."
                        value={current.client?.address || ''}
                        onChange={(e) =>
                          recalculateAndUpdate({
                            client: { ...current.client, address: e.target.value },
                          })
                        }
                        className="input-field"
                      />
                    </div>

                    <div className="form-grid-3 mt-3">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          value={current.client?.city || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, city: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          value={current.client?.state || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, state: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Postal Code</label>
                        <input
                          type="text"
                          value={current.client?.postalCode || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              client: { ...current.client, postalCode: e.target.value },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Client GSTIN / Tax ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 29ABCDE1234F1Z5 or US-EIN"
                        value={current.client?.taxId || ''}
                        onChange={(e) =>
                          recalculateAndUpdate({
                            client: { ...current.client, taxId: e.target.value },
                          })
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Line Items */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('items')}>
                  <div className="section-title-group">
                    <ListOrdered className="size-4 text-sky-500" />
                    <h3>Line Items ({current.items.length})</h3>
                  </div>
                  {expanded.items ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.items && (
                  <div className="section-card-body">
                    <LineItemsEditor
                      items={current.items}
                      onChange={(newItems) => recalculateAndUpdate({ items: newItems })}
                      currency={current.currency}
                      showHsn={showHsn}
                      onToggleHsn={() => setShowHsn(!showHsn)}
                    />
                  </div>
                )}
              </div>

              {/* 4. Taxes & Adjustments */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('adjustments')}>
                  <div className="section-title-group">
                    <Calculator className="size-4 text-amber-500" />
                    <h3>Adjustments & Taxes</h3>
                    <span className="live-pill-badge">Live</span>
                  </div>
                  {expanded.adjustments ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.adjustments && (
                  <div className="section-card-body">
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Tax System</label>
                        <select
                          value={current.taxType}
                          onChange={(e) => {
                            const nextTax = e.target.value as TaxType
                            setShowHsn(nextTax === 'GST')
                            recalculateAndUpdate({ taxType: nextTax })
                          }}
                          className="input-select"
                        >
                          <option value="GST">Indian GST (CGST/SGST/IGST)</option>
                          <option value="Standard">Standard Sales Tax / VAT</option>
                          <option value="None">No Tax (0%)</option>
                        </select>
                      </div>

                      {current.taxType === 'GST' && (
                        <div className="form-group">
                          <label>Supply Mode</label>
                          <select
                            value={current.gstType}
                            onChange={(e) =>
                              recalculateAndUpdate({ gstType: e.target.value as GSTType })
                            }
                            className="input-select"
                          >
                            <option value="CGST_SGST">Intra-state (CGST+SGST)</option>
                            <option value="IGST">Inter-state (IGST)</option>
                          </select>
                        </div>
                      )}

                      {current.taxType !== 'None' && (
                        <div className="form-group">
                          <label>Tax Rate %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={current.taxRate}
                            onChange={(e) =>
                              recalculateAndUpdate({ taxRate: Math.max(0, Number(e.target.value)) })
                            }
                            className="input-field"
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-grid-3 mt-3">
                      <div className="form-group">
                        <label>Invoice Discount %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0"
                          value={current.invoiceDiscountPercent || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              invoiceDiscountPercent: Math.min(100, Math.max(0, Number(e.target.value))),
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Shipping Charges</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={current.shipping || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({ shipping: Math.max(0, Number(e.target.value)) })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Adjustment (+/-)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={current.adjustment || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({ adjustment: Number(e.target.value) || 0 })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Payment Details & UPI */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('payment')}>
                  <div className="section-title-group">
                    <CreditCard className="size-4 text-purple-500" />
                    <h3>Payment Details & UPI QR</h3>
                  </div>
                  {expanded.payment ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.payment && (
                  <div className="section-card-body">
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        value={current.payment.method}
                        onChange={(e) =>
                          recalculateAndUpdate({
                            payment: { ...current.payment, method: e.target.value as PaymentMethod },
                          })
                        }
                        className="input-select"
                      >
                        <option value="UPI">UPI (Instant India QR Code)</option>
                        <option value="Bank Transfer">Bank Wire Transfer (NEFT/RTGS/SWIFT)</option>
                        <option value="PayPal">PayPal / Online URL</option>
                        <option value="Cash">Cash / Cheque</option>
                      </select>
                    </div>

                    {current.payment.method === 'UPI' && (
                      <div className="form-group mt-3">
                        <label>UPI ID (VPA)</label>
                        <input
                          type="text"
                          placeholder="e.g. rhliverse@hdfcbank"
                          value={current.payment.upiId || ''}
                          onChange={(e) =>
                            recalculateAndUpdate({
                              payment: { ...current.payment, upiId: e.target.value, qrType: 'upi' },
                            })
                          }
                          className="input-field"
                        />
                        <small className="text-xs text-muted-foreground mt-1 block">
                          Generates an inline SVG UPI QR code with total amount encoded automatically.
                        </small>
                      </div>
                    )}

                    {current.payment.method === 'Bank Transfer' && (
                      <div className="bank-inputs-grid mt-3">
                        <div className="form-grid-2">
                          <div className="form-group">
                            <label>Bank Name</label>
                            <input
                              type="text"
                              value={current.payment.bankName || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, bankName: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="form-group">
                            <label>Account Holder</label>
                            <input
                              type="text"
                              value={current.payment.accountHolder || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, accountHolder: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>

                        <div className="form-grid-2 mt-3">
                          <div className="form-group">
                            <label>Account Number</label>
                            <input
                              type="text"
                              value={current.payment.accountNumber || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, accountNumber: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="form-group">
                            <label>IFSC Code (India)</label>
                            <input
                              type="text"
                              value={current.payment.ifsc || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, ifsc: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>

                        <div className="form-grid-2 mt-3">
                          <div className="form-group">
                            <label>SWIFT / BIC</label>
                            <input
                              type="text"
                              value={current.payment.swift || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, swift: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                          <div className="form-group">
                            <label>IBAN</label>
                            <input
                              type="text"
                              value={current.payment.iban || ''}
                              onChange={(e) =>
                                recalculateAndUpdate({
                                  payment: { ...current.payment, iban: e.target.value },
                                })
                              }
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Notes & Terms */}
              <div className="editor-section-card">
                <div className="section-card-header" onClick={() => togglePanel('notes')}>
                  <div className="section-title-group">
                    <FileText className="size-4 text-slate-500" />
                    <h3>Notes & Terms</h3>
                  </div>
                  {expanded.notes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </div>

                {expanded.notes && (
                  <div className="section-card-body">
                    <div className="form-group">
                      <label>Notes to Client</label>
                      <textarea
                        rows={2}
                        value={current.notes}
                        onChange={(e) => recalculateAndUpdate({ notes: e.target.value })}
                        className="input-textarea"
                      />
                    </div>
                    <div className="form-group mt-3">
                      <label>Terms & Conditions</label>
                      <textarea
                        rows={2}
                        value={current.terms}
                        onChange={(e) => recalculateAndUpdate({ terms: e.target.value })}
                        className="input-textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DESIGN CUSTOMIZATIONS */}
          {activeTab === 'design' && (
            <div className="tab-pane-design">
              {/* Preset & Save design */}
              <div className="editor-section-card">
                <div className="section-card-header">
                  <div className="section-title-group">
                    <Sparkles className="size-4 text-indigo-500" />
                    <h3>Design Preset & Save</h3>
                  </div>
                </div>
                <div className="section-card-body">
                  <p className="text-xs text-muted-foreground mb-3">
                    Select a layout family or snapshot this exact design as a reusable custom template.
                  </p>
                  <div className="design-preset-picker-grid">
                    {INVOICE_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        className={`preset-select-btn ${current.design.templateId === tmpl.id ? 'active' : ''}`}
                        onClick={() =>
                          updateDesign({
                            templateId: tmpl.id,
                            colors: { ...current.design.colors, primary: tmpl.accent },
                          })
                        }
                      >
                        <span className="preset-swatch" style={{ background: tmpl.accent }} />
                        <span className="preset-name">{tmpl.name}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-primary w-full mt-4"
                    onClick={() => setSaveDesignModalOpen(true)}
                  >
                    <BookmarkPlus className="size-4" />
                    <span>Save as Reusable Custom Template</span>
                  </button>
                </div>
              </div>

              {/* Colors Customization */}
              <div className="editor-section-card">
                <div className="section-card-header">
                  <div className="section-title-group">
                    <Palette className="size-4 text-purple-500" />
                    <h3>Brand Colors</h3>
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="form-group">
                    <label>Primary Brand Accent</label>
                    <div className="accent-picker-row mt-2">
                      {PRESET_ACCENTS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`accent-color-circle ${current.design.colors.primary === color ? 'selected' : ''}`}
                          style={{ background: color }}
                          onClick={() =>
                            updateDesign({
                              colors: { ...current.design.colors, primary: color, accent: color },
                            })
                          }
                          aria-label={`Select accent ${color}`}
                        />
                      ))}
                      <div className="custom-hex-input-box">
                        <span>#</span>
                        <input
                          type="text"
                          value={current.design.colors.primary.replace('#', '')}
                          onChange={(e) =>
                            updateDesign({
                              colors: {
                                ...current.design.colors,
                                primary: `#${e.target.value}`,
                                accent: `#${e.target.value}`,
                              },
                            })
                          }
                          maxLength={6}
                          className="hex-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography System */}
              <div className="editor-section-card">
                <div className="section-card-header">
                  <div className="section-title-group">
                    <Type className="size-4 text-sky-500" />
                    <h3>Typography</h3>
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Font Family</label>
                      <select
                        value={current.design.typography.fontFamily || 'sans'}
                        onChange={(e) =>
                          updateDesign({
                            typography: {
                              ...current.design.typography,
                              fontFamily: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="sans">Modern Sans (Inter / System)</option>
                        <option value="serif">Classical Serif (Editorial)</option>
                        <option value="mono">Technical Mono (Code / Tabular)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Text Scale</label>
                      <select
                        value={String(current.design.typography.scale || 1)}
                        onChange={(e) =>
                          updateDesign({
                            typography: {
                              ...current.design.typography,
                              scale: Number(e.target.value),
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="0.9">Compact (90%)</option>
                        <option value="1">Standard (100%)</option>
                        <option value="1.1">Prominent (110%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout & Document Styles */}
              <div className="editor-section-card">
                <div className="section-card-header">
                  <div className="section-title-group">
                    <Sliders className="size-4 text-emerald-500" />
                    <h3>Document Layout & Styling</h3>
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label>Table Style</label>
                      <select
                        value={current.design.layout.tableStyle || 'ruled'}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              tableStyle: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="ruled">Ruled Horizontal</option>
                        <option value="minimal">Minimal White</option>
                        <option value="zebra">Zebra Striped</option>
                        <option value="boxed">Boxed Border</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Totals Card</label>
                      <select
                        value={current.design.layout.totalsStyle || 'stacked'}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              totalsStyle: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="stacked">Stacked Clean</option>
                        <option value="banner">Highlight Banner</option>
                        <option value="boxed">Enclosed Box</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Page Margins</label>
                      <select
                        value={current.design.layout.margin || 'normal'}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              margin: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="compact">Compact (10mm)</option>
                        <option value="normal">Standard (15mm)</option>
                        <option value="generous">Generous (20mm)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2 mt-3">
                    <div className="form-group">
                      <label>Logo Placement</label>
                      <select
                        value={current.design.layout.logoPlacement || 'left'}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              logoPlacement: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="left">Top Left</option>
                        <option value="center">Top Center</option>
                        <option value="right">Top Right</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Logo Size</label>
                      <select
                        value={current.design.layout.logoSize || 'md'}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              logoSize: e.target.value as any,
                            },
                          })
                        }
                        className="input-select"
                      >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <label>Authorized Signatory Block</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="toggle-signature"
                        checked={Boolean(current.design.layout.showSignature)}
                        onChange={(e) =>
                          updateDesign({
                            layout: {
                              ...current.design.layout,
                              showSignature: e.target.checked,
                            },
                            visibility: {
                              ...current.design.visibility,
                              signature: e.target.checked,
                            },
                          })
                        }
                        className="size-4"
                      />
                      <label htmlFor="toggle-signature" className="text-xs font-normal normal-case cursor-pointer">
                        Display official signature line on invoice
                      </label>
                    </div>
                  </div>

                  {current.design.layout.showSignature && (
                    <div className="form-grid-2 mt-2">
                      <div className="form-group">
                        <label>Signatory Name</label>
                        <input
                          type="text"
                          value={current.design.layout.signatoryName || ''}
                          onChange={(e) =>
                            updateDesign({
                              layout: {
                                ...current.design.layout,
                                signatoryName: e.target.value,
                              },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="form-group">
                        <label>Signatory Designation</label>
                        <input
                          type="text"
                          value={current.design.layout.signatoryTitle || ''}
                          onChange={(e) =>
                            updateDesign({
                              layout: {
                                ...current.design.layout,
                                signatoryTitle: e.target.value,
                              },
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTIONS (PLACEABLE, ORDERABLE, VISIBILITY) */}
          {activeTab === 'sections' && (
            <div className="tab-pane-sections">
              <div className="editor-section-card">
                <div className="section-card-header">
                  <div className="section-title-group">
                    <Layers className="size-4 text-indigo-500" />
                    <h3>Section Management & Order</h3>
                  </div>
                  <button
                    type="button"
                    className="btn-text-link"
                    onClick={resetSectionOrder}
                    title="Reset to default ordering"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset Order</span>
                  </button>
                </div>
                <div className="section-card-body">
                  <p className="text-xs text-muted-foreground mb-4">
                    Toggle visibility (Eye icon) or reorder sections (Up/Down arrows) to arrange your invoice document.
                  </p>

                  <div className="sections-order-list">
                    {currentOrder.map((secId, index) => {
                      const meta = SECTION_METADATA[secId] || { label: secId, description: '' }
                      const isVisible = currentVisibility[secId] !== false

                      return (
                        <div
                          key={secId}
                          className={`section-order-row-card ${!isVisible ? 'section-hidden' : ''}`}
                        >
                          <div className="section-row-info">
                            <button
                              type="button"
                              className={`btn-toggle-eye ${isVisible ? 'text-indigo-600' : 'text-slate-400'}`}
                              onClick={() => toggleSectionVisibility(secId)}
                              title={isVisible ? 'Hide section' : 'Show section'}
                            >
                              {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>
                            <div className="section-row-texts">
                              <strong className="section-label-text">{meta.label}</strong>
                              <small className="section-desc-text">{meta.description}</small>
                            </div>
                          </div>

                          <div className="section-reorder-buttons">
                            <button
                              type="button"
                              className="btn-move-section"
                              disabled={index === 0}
                              onClick={() => moveSection(index, 'up')}
                              title="Move section up"
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              className="btn-move-section"
                              disabled={index === currentOrder.length - 1}
                              onClick={() => moveSection(index, 'down')}
                              title="Move section down"
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Document Canvas & Zoom Controls */}
        <div className={`editor-preview-column ${mobileTab === 'edit' ? 'hidden-mobile' : ''}`}>
          {/* Zoom Toolbar */}
          <div className="preview-canvas-toolbar">
            <span className="toolbar-doc-spec">
              A4 Document · {current.design.templateId.replace('template-', '').toUpperCase()}
            </span>

            <div className="zoom-controls-cluster">
              <button
                className="zoom-btn"
                onClick={() => setZoomScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
                title="Zoom out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="zoom-label">{Math.round(zoomScale * 100)}%</span>
              <button
                className="zoom-btn"
                onClick={() => setZoomScale((s) => Math.min(1.4, Number((s + 0.1).toFixed(2))))}
                title="Zoom in"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                className="zoom-btn"
                onClick={() => setZoomScale(0.85)}
                title="Reset to 85%"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="preview-canvas-stage">
            <InvoicePaper invoice={current} scale={zoomScale} />
          </div>
        </div>
      </div>

      {/* Save Custom Design Preset Modal */}
      {saveDesignModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Save as Custom Template</h2>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Studio Executive 2026"
                  value={customTemplateName}
                  onChange={(e) => setCustomTemplateName(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This will snapshot your current colors, typography scale, section order, and table styles into your saved designs library.
              </p>
              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSaveDesignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveCustomDesign}
                >
                  <Check className="size-4" />
                  <span>Save Design</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
