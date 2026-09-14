'use client'

import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import { ClientRecord } from '@/lib/types'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (client: ClientRecord) => void
  initialData?: ClientRecord | null
}

export function ClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ClientModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [company, setCompany] = useState(initialData?.company || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [state, setState] = useState(initialData?.state || '')
  const [country, setCountry] = useState(initialData?.country || 'India')
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '')
  const [taxId, setTaxId] = useState(initialData?.taxId || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() && !company.trim()) {
      alert('Please provide at least a Contact Name or Company Name.')
      return
    }

    const now = new Date().toISOString()
    const clientRecord: ClientRecord = {
      id: initialData?.id || `client-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      company: company.trim() || name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode.trim(),
      taxId: taxId.trim(),
      notes: notes.trim(),
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    }

    onSave(clientRecord)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Client Record' : 'Add New Client'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Nexus Innovations Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Primary Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="accounts@client.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Billing Street Address</label>
            <input
              type="text"
              placeholder="Suite, building, street..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-grid-3 mt-3">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-grid-2 mt-3">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Tax ID / GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 29ABCDE1234F1Z5 or EIN"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Internal Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Payment terms, special billing instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-textarea"
            />
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check className="size-4" />
              <span>{initialData ? 'Save Changes' : 'Create Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
