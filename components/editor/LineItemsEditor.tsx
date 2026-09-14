'use client'

import React from 'react'
import { Plus, Trash2, Copy, GripVertical, Percent } from 'lucide-react'
import { InvoiceItem } from '@/lib/types'
import { calculateItemAmount } from '@/lib/calculations'
import { formatCurrency } from '@/lib/currency'

interface LineItemsEditorProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
  currency: any
  showHsn?: boolean
  onToggleHsn?: () => void
}

export function LineItemsEditor({
  items,
  onChange,
  currency,
  showHsn = false,
  onToggleHsn,
}: LineItemsEditorProps) {
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }

    // Recompute row amount
    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const q = field === 'quantity' ? Number(value) : item.quantity
      const r = field === 'rate' ? Number(value) : item.rate
      const d = field === 'discount' ? Number(value) : item.discount
      item.amount = calculateItemAmount(q, r, d)
    }

    updated[index] = item
    onChange(updated)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: '',
      hsnSac: showHsn ? '998313' : '',
      quantity: 1,
      unit: 'Units',
      rate: 0,
      discount: 0,
      taxRate: 0,
      amount: 0,
    }
    onChange([...items, newItem])
  }

  const duplicateItem = (index: number) => {
    const toClone = items[index]
    const clone: InvoiceItem = {
      ...toClone,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      description: `${toClone.description} (Copy)`,
    }
    const updated = [...items]
    updated.splice(index + 1, 0, clone)
    onChange(updated)
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      // Keep at least one empty item row
      onChange([
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unit: 'Units',
          rate: 0,
          discount: 0,
          taxRate: 0,
          amount: 0,
        },
      ])
      return
    }
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="line-items-editor">
      <div className="line-items-header-bar">
        <span className="editor-subheading">Line Items</span>
        {onToggleHsn && (
          <button
            type="button"
            className={`btn-pill-toggle ${showHsn ? 'active' : ''}`}
            onClick={onToggleHsn}
            title="Toggle HSN / SAC code columns for Indian GST compliance"
          >
            <span>HSN / SAC Code</span>
          </button>
        )}
      </div>

      <div className="line-items-rows">
        {items.map((item, index) => (
          <div key={item.id || index} className="line-item-row-card">
            <div className="item-row-main">
              <div className="item-row-desc-field">
                <input
                  type="text"
                  placeholder="Item description or service title..."
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="input-item-desc"
                />
              </div>

              {showHsn && (
                <div className="item-field-hsn">
                  <label>HSN/SAC</label>
                  <input
                    type="text"
                    placeholder="998313"
                    value={item.hsnSac || ''}
                    onChange={(e) => updateItem(index, 'hsnSac', e.target.value)}
                    className="input-item-number"
                  />
                </div>
              )}

              <div className="item-field-qty">
                <label>Qty</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(index, 'quantity', Math.max(0, Number(e.target.value)))}
                  className="input-item-number"
                />
              </div>

              <div className="item-field-unit">
                <label>Unit</label>
                <input
                  type="text"
                  placeholder="hrs/pcs"
                  value={item.unit || ''}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  className="input-item-unit"
                />
              </div>

              <div className="item-field-rate">
                <label>Rate</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.rate || ''}
                  onChange={(e) => updateItem(index, 'rate', Math.max(0, Number(e.target.value)))}
                  className="input-item-number"
                />
              </div>

              <div className="item-field-disc">
                <label>Disc %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={item.discount || ''}
                  onChange={(e) => updateItem(index, 'discount', Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="input-item-number"
                />
              </div>

              <div className="item-field-amount">
                <label>Amount</label>
                <div className="item-calculated-amount">
                  {formatCurrency(item.amount || item.quantity * item.rate, currency)}
                </div>
              </div>

              <div className="item-row-actions">
                <button
                  type="button"
                  className="item-btn-action"
                  title="Duplicate line"
                  onClick={() => duplicateItem(index)}
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="item-btn-action btn-danger-hover"
                  title="Remove line"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-add-line-item" onClick={addItem}>
        <Plus className="size-4" />
        <span>Add Line Item</span>
      </button>
    </div>
  )
}
