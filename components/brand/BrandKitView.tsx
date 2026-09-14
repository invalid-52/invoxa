'use client'

import React, { useState } from 'react'
import {
  Upload,
  Trash2,
  Check,
  Building,
  CreditCard,
  Palette,
  Sparkles,
  QrCode,
} from 'lucide-react'
import { BusinessProfile, UserPreferences } from '@/lib/types'

interface BrandKitViewProps {
  business: BusinessProfile
  preferences: UserPreferences
  onSaveBusiness: (updated: BusinessProfile) => void
  onSavePreferences: (updated: UserPreferences) => void
}

const PRESET_ACCENTS = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky Blue
  '#059669', // Emerald
  '#D946EF', // Fuchsia
  '#854D0E', // Amber / Bronze
  '#0F172A', // Slate
  '#E11D48', // Rose
]

export function BrandKitView({
  business,
  preferences,
  onSaveBusiness,
  onSavePreferences,
}: BrandKitViewProps) {
  const [profile, setProfile] = useState<BusinessProfile>(business)
  const [accent, setAccent] = useState<string>(preferences.accent || '#4F46E5')
  const [savedToast, setSavedToast] = useState(false)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setProfile((prev) => ({ ...prev, logo: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logo: '' }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveBusiness(profile)
    onSavePreferences({ ...preferences, accent })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  return (
    <div className="brand-kit-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="dashboard-eyebrow">Identity & Aesthetics</span>
          <h1 className="view-title">Brand Kit</h1>
          <p className="view-subtitle">
            Configure your business identity, company logo, color palette, and payment details once.
          </p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Check className="size-4" />
          <span>{savedToast ? 'Saved ✓' : 'Save Brand Kit'}</span>
        </button>
      </div>

      <div className="brand-kit-split-grid">
        {/* Left: Form Settings */}
        <form onSubmit={handleSave} className="brand-kit-form-column">
          {/* Logo Section */}
          <div className="brand-section-card">
            <h2 className="section-title">Business Logo</h2>
            <p className="section-desc">
              Upload a high-resolution logo for your invoices and document headers.
            </p>

            <div className="logo-upload-cluster">
              {profile.logo ? (
                <div className="logo-preview-box">
                  <img src={profile.logo} alt="Brand Logo" className="logo-img-render" />
                  <button
                    type="button"
                    className="btn-remove-logo"
                    onClick={handleRemoveLogo}
                    title="Remove logo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ) : (
                <label className="logo-dropzone">
                  <Upload className="size-6 text-indigo-500 mb-2" />
                  <span className="font-semibold text-sm">Click to upload logo</span>
                  <small className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, SVG or WebP (max 2MB)
                  </small>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleLogoUpload}
                  />
                </label>
              )}

              <div className="logo-options-group">
                <div className="form-group">
                  <label>Logo Size</label>
                  <select
                    value={profile.logoSize || 'md'}
                    onChange={(e) =>
                      setProfile({ ...profile, logoSize: e.target.value as any })
                    }
                    className="input-select"
                  >
                    <option value="sm">Small (Compact)</option>
                    <option value="md">Medium (Standard)</option>
                    <option value="lg">Large (Prominent)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="brand-section-card">
            <h2 className="section-title">Brand Accent Color</h2>
            <p className="section-desc">
              Controls document headings, totals, invoice highlights, and primary buttons.
            </p>

            <div className="accent-picker-row">
              {PRESET_ACCENTS.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`accent-color-circle ${accent === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setAccent(color)}
                  aria-label={`Select accent ${color}`}
                />
              ))}
              <div className="custom-hex-input-box">
                <span>#</span>
                <input
                  type="text"
                  value={accent.replace('#', '')}
                  onChange={(e) => setAccent(`#${e.target.value}`)}
                  maxLength={6}
                  className="hex-input"
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="brand-section-card">
            <h2 className="section-title">Business Information</h2>
            <p className="section-desc">
              Your registered entity information automatically pre-fills every new invoice.
            </p>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Trading Name (Brand)</label>
                <input
                  type="text"
                  placeholder="e.g. RHLIVERSE"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Legal / Registered Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g. RHLIVERSE Technologies Private Limited"
                  value={profile.legalName || ''}
                  onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-grid-3 mt-3">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="billing@rhliverse.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  placeholder="rhliverse.com"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Business Address</label>
              <input
                type="text"
                placeholder="Suite, building, road..."
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-grid-3 mt-3">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-grid-3 mt-3">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>GSTIN (India)</label>
                <input
                  type="text"
                  placeholder="29ABCDE1234F1Z5"
                  value={profile.gstin || ''}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>PAN (India) / Tax ID</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={profile.pan || ''}
                  onChange={(e) => setProfile({ ...profile, pan: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Right: Real-time Brand Preview Card */}
        <div className="brand-kit-preview-column">
          <span className="dashboard-eyebrow mb-2 block">Live Brand Preview</span>
          <div
            className="brand-preview-card"
            style={{ '--preview-accent': accent } as React.CSSProperties}
          >
            <div className="brand-card-mock-header">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" className="brand-card-logo" />
              ) : (
                <div className="brand-card-badge" style={{ background: accent }}>
                  <Sparkles className="size-4 text-white" />
                </div>
              )}
              <div className="brand-card-meta">
                <strong className="brand-card-name">{profile.name || 'Your Company'}</strong>
                <small>{profile.website || 'website.com'}</small>
              </div>
            </div>

            <div className="brand-card-rule" />

            <div className="brand-card-doc-snippet">
              <span className="snippet-inv-label">TAX INVOICE</span>
              <div className="snippet-total-pill" style={{ background: accent }}>
                ₹1,41,600
              </div>
            </div>

            <div className="brand-card-lines">
              <div className="mock-line w-full" />
              <div className="mock-line w-4/5" />
              <div className="mock-line w-2/3" />
            </div>

            <div className="brand-card-footer">
              <span className="text-xs text-muted-foreground">
                {profile.gstin ? `GSTIN: ${profile.gstin}` : 'Tax Registered'}
              </span>
              <span className="text-xs font-semibold" style={{ color: accent }}>
                Branded Document
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
