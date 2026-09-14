'use client'

import React, { useMemo } from 'react'
import { InvoiceRecord, SectionId } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { generateQrSvg, buildUpiUri } from '@/lib/qr'
import { Sparkles, Building2, CreditCard, QrCode, PenTool } from 'lucide-react'
import { DEFAULT_SECTION_ORDER, DEFAULT_SECTION_VISIBILITY } from '@/lib/templates'

interface InvoicePaperProps {
  invoice: InvoiceRecord
  scale?: number
}

export function InvoicePaper({ invoice, scale = 1 }: InvoicePaperProps) {
  const {
    number,
    business,
    client,
    issueDate,
    dueDate,
    paymentTerms,
    poNumber,
    items,
    taxType,
    gstType,
    subtotal,
    itemDiscounts,
    invoiceDiscountPercent,
    invoiceDiscountAmount,
    taxableAmount,
    taxRate,
    taxTotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    shipping,
    handling,
    adjustment,
    roundOff,
    total,
    currency,
    payment,
    notes,
    terms,
    design,
  } = invoice

  const templateId = design?.templateId || 'template-modern'
  const primaryAccent = design?.colors?.primary || '#4F46E5'
  const secondaryColor = design?.colors?.secondary || '#0F172A'
  const textColor = design?.colors?.text || '#0F172A'

  const layout = design?.layout || {
    pageSize: 'A4',
    density: 'comfortable',
    margin: 'normal',
    tableStyle: 'ruled',
    totalsStyle: 'stacked',
    footerStyle: 'split',
    logoPlacement: 'left',
    logoSize: 'md',
    showLogo: true,
    showWatermark: false,
    showSignature: false,
  }

  const typography = design?.typography || {
    fontFamily: 'sans',
    scale: 1,
    headingWeight: 700,
  }

  const sectionOrder = design?.sectionOrder?.length ? design.sectionOrder : DEFAULT_SECTION_ORDER
  const visibility = design?.visibility || DEFAULT_SECTION_VISIBILITY

  // Generate UPI QR Code SVG if UPI ID is present
  const upiQrSvg = useMemo(() => {
    if (!payment?.upiId) return ''
    const uri = buildUpiUri({
      upiId: payment.upiId,
      payeeName: business?.name,
      amount: total,
      invoiceNumber: number,
    })
    return generateQrSvg(uri, { size: 96, color: '#111827' })
  }, [payment?.upiId, business?.name, total, number])

  const urlQrSvg = useMemo(() => {
    if (payment?.upiId || !payment?.paymentUrl) return ''
    return generateQrSvg(payment.paymentUrl, { size: 96, color: '#111827' })
  }, [payment?.upiId, payment?.paymentUrl])

  const qrSvg = upiQrSvg || urlQrSvg
  const isExecutive = templateId === 'template-executive'
  const isGstTemplate = templateId === 'template-gst' || taxType === 'GST'
  const hasHsn = items.some((item) => Boolean(item.hsnSac))

  // Font family class
  const fontClass =
    typography.fontFamily === 'serif'
      ? 'font-serif'
      : typography.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans'

  // Margin class
  const marginClass =
    layout.margin === 'compact'
      ? 'paper-margin-compact'
      : layout.margin === 'generous'
      ? 'paper-margin-generous'
      : 'paper-margin-normal'

  // Density class
  const densityClass = `density-${layout.density || 'comfortable'}`
  const tableStyleClass = `table-style-${layout.tableStyle || 'ruled'}`
  const totalsStyleClass = `totals-style-${layout.totalsStyle || 'stacked'}`
  const logoPlacementClass = `logo-place-${layout.logoPlacement || 'left'}`

  // Render Section Components
  const renderSection = (sectionId: SectionId) => {
    if (visibility[sectionId] === false) return null

    switch (sectionId) {
      case 'header':
        return (
          <div key="header" className={`doc-header-section ${logoPlacementClass}`}>
            {isExecutive ? (
              <div className="executive-banner-header" style={{ background: primaryAccent }}>
                <div className="executive-banner-brand">
                  {layout.showLogo && business?.logo ? (
                    <img src={business.logo} alt="Logo" className="executive-logo" />
                  ) : (
                    <span className="executive-brand-title">{business?.name || 'INVOXA'}</span>
                  )}
                </div>
                <div className="executive-banner-meta">
                  <span className="executive-inv-label">TAX INVOICE</span>
                  <strong className="executive-inv-num">#{number}</strong>
                </div>
              </div>
            ) : (
              <header className="document-header">
                <div className="doc-brand-block">
                  {layout.showLogo && business?.logo ? (
                    <div className={`doc-logo-wrap size-${layout.logoSize || business.logoSize || 'md'}`}>
                      <img src={business.logo} alt={business.name} className="doc-logo-img" />
                    </div>
                  ) : (
                    <div className="doc-text-brand">
                      <div className="doc-brand-badge" style={{ background: primaryAccent }}>
                        <Sparkles className="size-4 text-white" />
                      </div>
                      <div className="doc-brand-title-group">
                        <h2 className="doc-brand-title">{business?.name || 'Your Company'}</h2>
                        {business?.legalName && business.legalName !== business.name && (
                          <p className="doc-legal-name">{business.legalName}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="doc-sender-info">
                    {business?.address && <div>{business.address}</div>}
                    {(business?.city || business?.state || business?.postalCode) && (
                      <div>
                        {[business.city, business.state, business.postalCode].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {business?.country && <div>{business.country}</div>}
                    {business?.email && <div>{business.email}</div>}
                    {business?.phone && <div>{business.phone}</div>}
                    {business?.gstin && (
                      <div className="font-semibold text-slate-800">GSTIN: {business.gstin}</div>
                    )}
                    {business?.pan && <div>PAN: {business.pan}</div>}
                  </div>
                </div>
              </header>
            )}
          </div>
        )

      case 'meta':
        return (
          <div key="meta" className="doc-meta-section">
            <div className="doc-meta-strip" style={{ borderColor: primaryAccent }}>
              <div className="meta-strip-item">
                <span className="meta-label">INVOICE NO</span>
                <strong className="meta-val font-mono">#{number}</strong>
              </div>
              <div className="meta-strip-item">
                <span className="meta-label">ISSUE DATE</span>
                <strong className="meta-val">{issueDate || '—'}</strong>
              </div>
              <div className="meta-strip-item">
                <span className="meta-label">DUE DATE</span>
                <strong className="meta-val">{dueDate || '—'}</strong>
              </div>
              {paymentTerms && (
                <div className="meta-strip-item">
                  <span className="meta-label">PAYMENT TERMS</span>
                  <strong className="meta-val">{paymentTerms}</strong>
                </div>
              )}
              {poNumber && (
                <div className="meta-strip-item">
                  <span className="meta-label">PO NUMBER</span>
                  <strong className="meta-val">{poNumber}</strong>
                </div>
              )}
              <div className="meta-strip-item text-right ml-auto">
                <span className="meta-label">DOCUMENT TYPE</span>
                <strong className="meta-val" style={{ color: primaryAccent }}>
                  {isGstTemplate ? 'TAX INVOICE' : 'ORIGINAL INVOICE'}
                </strong>
              </div>
            </div>
          </div>
        )

      case 'client':
        return (
          <section key="client" className="document-client-section">
            <div className="client-billed-to-box">
              <span className="doc-sublabel">BILLED TO</span>
              <h3 className="client-primary-name">
                {client?.company || client?.name || 'Client Name'}
              </h3>
              {client?.company && client.name && client.name !== client.company && (
                <div className="client-contact-person">Attn: {client.name}</div>
              )}
              {client?.address && <div>{client.address}</div>}
              {(client?.city || client?.state || client?.postalCode) && (
                <div>
                  {[client.city, client.state, client.postalCode].filter(Boolean).join(', ')}
                </div>
              )}
              {client?.country && <div>{client.country}</div>}
              {client?.email && <div>{client.email}</div>}
              {client?.phone && <div>{client.phone}</div>}
              {client?.taxId && (
                <div className="client-tax-id">
                  {isGstTemplate ? 'GSTIN/Tax ID: ' : 'Tax ID: '}
                  <strong>{client.taxId}</strong>
                </div>
              )}
            </div>

            <div className="document-highlight-card" style={{ borderColor: primaryAccent }}>
              <span className="highlight-label">TOTAL AMOUNT DUE</span>
              <div className="highlight-amount" style={{ color: primaryAccent }}>
                {formatCurrency(total, currency)}
              </div>
              <div className="highlight-currency-sub">
                {currency} · Due {dueDate || 'on receipt'}
              </div>
            </div>
          </section>
        )

      case 'items':
        return (
          <section key="items" className={`document-table-section ${tableStyleClass}`}>
            <table className="doc-items-table">
              <thead>
                <tr style={{ borderBottomColor: primaryAccent }}>
                  <th className="th-desc">ITEM & DESCRIPTION</th>
                  {hasHsn && <th className="th-hsn text-center">HSN/SAC</th>}
                  <th className="th-qty text-right">QTY</th>
                  <th className="th-rate text-right">RATE</th>
                  {items.some((i) => i.discount > 0) && (
                    <th className="th-disc text-right">DISC %</th>
                  )}
                  <th className="th-amount text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="doc-item-row">
                    <td className="td-desc">
                      <div className="item-title">{item.description || 'Line Item'}</div>
                    </td>
                    {hasHsn && (
                      <td className="td-hsn text-center text-slate-500 font-mono text-xs">
                        {item.hsnSac || '—'}
                      </td>
                    )}
                    <td className="td-qty text-right font-mono">
                      {item.quantity} {item.unit !== 'Units' ? item.unit : ''}
                    </td>
                    <td className="td-rate text-right font-mono">
                      {formatCurrency(item.rate, currency)}
                    </td>
                    {items.some((i) => i.discount > 0) && (
                      <td className="td-disc text-right text-slate-500 font-mono">
                        {item.discount > 0 ? `${item.discount}%` : '—'}
                      </td>
                    )}
                    <td className="td-amount text-right font-mono font-semibold">
                      {formatCurrency(item.amount || item.quantity * item.rate, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )

      case 'totals':
        return (
          <div key="totals" className={`doc-totals-section ${totalsStyleClass}`}>
            <div className="totals-summary-card">
              <div className="totals-line">
                <span>Subtotal</span>
                <strong className="font-mono">{formatCurrency(subtotal, currency)}</strong>
              </div>

              {itemDiscounts > 0 && (
                <div className="totals-line text-emerald-600">
                  <span>Item Discounts</span>
                  <strong className="font-mono">−{formatCurrency(itemDiscounts, currency)}</strong>
                </div>
              )}

              {invoiceDiscountAmount > 0 && (
                <div className="totals-line text-emerald-600">
                  <span>Invoice Discount ({invoiceDiscountPercent}%)</span>
                  <strong className="font-mono">−{formatCurrency(invoiceDiscountAmount, currency)}</strong>
                </div>
              )}

              {taxType !== 'None' && (
                <>
                  {taxType === 'GST' ? (
                    gstType === 'IGST' ? (
                      <div className="totals-line">
                        <span>IGST ({taxRate}%)</span>
                        <strong className="font-mono">{formatCurrency(igstAmount, currency)}</strong>
                      </div>
                    ) : (
                      <>
                        <div className="totals-line">
                          <span>CGST ({taxRate / 2}%)</span>
                          <strong className="font-mono">{formatCurrency(cgstAmount, currency)}</strong>
                        </div>
                        <div className="totals-line">
                          <span>SGST ({taxRate / 2}%)</span>
                          <strong className="font-mono">{formatCurrency(sgstAmount, currency)}</strong>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="totals-line">
                      <span>Tax ({taxRate}%)</span>
                      <strong className="font-mono">{formatCurrency(taxTotal, currency)}</strong>
                    </div>
                  )}
                </>
              )}

              {shipping > 0 && (
                <div className="totals-line">
                  <span>Shipping Charges</span>
                  <strong className="font-mono">{formatCurrency(shipping, currency)}</strong>
                </div>
              )}

              {handling > 0 && (
                <div className="totals-line">
                  <span>Handling / Packing</span>
                  <strong className="font-mono">{formatCurrency(handling, currency)}</strong>
                </div>
              )}

              {adjustment !== 0 && (
                <div className="totals-line">
                  <span>Adjustment</span>
                  <strong className="font-mono">
                    {adjustment > 0 ? '+' : ''}
                    {formatCurrency(adjustment, currency)}
                  </strong>
                </div>
              )}

              {roundOff !== 0 && (
                <div className="totals-line text-slate-500">
                  <span>Round Off</span>
                  <strong className="font-mono">
                    {roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                  </strong>
                </div>
              )}

              <div className="totals-grand-line" style={{ borderTopColor: primaryAccent }}>
                <div>
                  <span className="grand-label">Grand Total</span>
                  <small className="grand-currency">({currency})</small>
                </div>
                <strong className="grand-amount font-mono" style={{ color: primaryAccent }}>
                  {formatCurrency(total, currency)}
                </strong>
              </div>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div key="payment" className="doc-payment-section">
            <div className="payment-box">
              <span className="doc-sublabel">PAYMENT INFORMATION</span>

              {payment?.method === 'UPI' && (
                <div className="upi-payment-block">
                  <div className="upi-details">
                    <span className="upi-title">UPI Instant Payment</span>
                    <strong className="upi-id font-mono">{payment.upiId}</strong>
                    <p className="upi-instructions">
                      Scan QR code with GPay, PhonePe, Paytm or BHIM to pay instantly.
                    </p>
                  </div>
                  {qrSvg && (
                    <div
                      className="upi-qr-preview-frame"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                      title={`Scan to pay ${formatCurrency(total, currency)}`}
                    />
                  )}
                </div>
              )}

              {payment?.method === 'Bank Transfer' && (
                <div className="bank-payment-block">
                  {payment.bankName && (
                    <div className="bank-detail-row">
                      <span>Bank:</span> <strong>{payment.bankName}</strong>
                    </div>
                  )}
                  {payment.accountHolder && (
                    <div className="bank-detail-row">
                      <span>Account Holder:</span> <strong>{payment.accountHolder}</strong>
                    </div>
                  )}
                  {payment.accountNumber && (
                    <div className="bank-detail-row">
                      <span>Account No:</span> <strong className="font-mono">{payment.accountNumber}</strong>
                    </div>
                  )}
                  {payment.ifsc && (
                    <div className="bank-detail-row">
                      <span>IFSC Code:</span> <strong className="font-mono">{payment.ifsc}</strong>
                    </div>
                  )}
                  {payment.swift && (
                    <div className="bank-detail-row">
                      <span>SWIFT/BIC:</span> <strong className="font-mono">{payment.swift}</strong>
                    </div>
                  )}
                  {payment.iban && (
                    <div className="bank-detail-row">
                      <span>IBAN:</span> <strong className="font-mono">{payment.iban}</strong>
                    </div>
                  )}
                  {qrSvg && (
                    <div
                      className="upi-qr-preview-frame mt-2"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  )}
                </div>
              )}

              {payment?.method !== 'UPI' && payment?.method !== 'Bank Transfer' && (
                <div className="other-payment-block">
                  <p>{payment?.paymentUrl || payment?.method || 'Payment details available on request.'}</p>
                  {qrSvg && (
                    <div
                      className="upi-qr-preview-frame mt-2"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'notes':
        return notes ? (
          <div key="notes" className="doc-notes-box">
            <span className="doc-sublabel">NOTES</span>
            <p className="notes-content">{notes}</p>
          </div>
        ) : null

      case 'terms':
        return terms ? (
          <div key="terms" className="doc-terms-box">
            <span className="doc-sublabel">TERMS & CONDITIONS</span>
            <p className="terms-content">{terms}</p>
          </div>
        ) : null

      case 'signature':
        return (
          <div key="signature" className="doc-signature-section">
            <div className="signature-box ml-auto text-right">
              <div className="signature-line-mark" style={{ borderColor: primaryAccent }} />
              <strong className="signatory-name">
                {layout.signatoryName || 'Authorized Signatory'}
              </strong>
              <small className="signatory-title block text-slate-500 text-xs">
                {layout.signatoryTitle || business?.name || 'For and on behalf of the company'}
              </small>
            </div>
          </div>
        )

      case 'footer':
        return (
          <footer key="footer" className={`document-footer footer-${layout.footerStyle || 'split'}`}>
            <div className="footer-left">
              <span>{business?.website || business?.email || 'INVOXA Workspace'}</span>
            </div>
            <div className="footer-center">
              <span>{business?.legalName || business?.name || 'INVOXA'}</span>
            </div>
            <div className="footer-right">
              <span>Crafted by <strong>RHLIVERSE</strong></span>
            </div>
          </footer>
        )

      default:
        return null
    }
  }

  return (
    <div
      className="invoice-paper-wrapper"
      style={{
        transform: `scale(${scale * (typography.scale || 1)})`,
        transformOrigin: 'top center',
      }}
    >
      <article
        className={`invoice-document ${fontClass} ${marginClass} ${densityClass} template-${templateId}`}
        style={
          {
            '--doc-accent': primaryAccent,
            '--doc-secondary': secondaryColor,
            color: textColor,
          } as React.CSSProperties
        }
      >
        {/* Render Sections in configured order */}
        {sectionOrder.map((sectionId) => renderSection(sectionId))}
      </article>
    </div>
  )
}
