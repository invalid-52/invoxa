'use client'

import React, { useState } from 'react'
import {
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Check,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react'
import {
  UserPreferences,
  InvoiceDefaults,
  CurrencyCode,
  TaxType,
  WorkspaceData,
} from '@/lib/types'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

interface SettingsViewProps {
  preferences: UserPreferences
  defaults: InvoiceDefaults
  onUpdatePreferences: (pref: UserPreferences) => void
  onUpdateDefaults: (def: InvoiceDefaults) => void
  onExportBackup: () => void
  onImportBackup: (data: WorkspaceData) => void
  onResetWorkspace: () => void
}

export function SettingsView({
  preferences,
  defaults,
  onUpdatePreferences,
  onUpdateDefaults,
  onExportBackup,
  onImportBackup,
  onResetWorkspace,
}: SettingsViewProps) {
  const [prefState, setPrefState] = useState<UserPreferences>(preferences)
  const [defaultState, setDefaultState] = useState<InvoiceDefaults>(defaults)
  const [toastMessage, setToastMessage] = useState('')

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdatePreferences(prefState)
    onUpdateDefaults(defaultState)
    setToastMessage('Settings successfully saved')
    setTimeout(() => setToastMessage(''), 2500)
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string
        const parsed = JSON.parse(raw)
        if (!parsed.invoices || !Array.isArray(parsed.invoices)) {
          alert('Invalid workspace file: Missing invoices array.')
          return
        }
        if (
          window.confirm(
            `Importing this backup will replace current workspace data with ${parsed.invoices.length} invoices. Continue?`
          )
        ) {
          onImportBackup(parsed)
          setToastMessage('Workspace backup restored successfully!')
          setTimeout(() => setToastMessage(''), 3000)
        }
      } catch (err) {
        alert('Failed to parse JSON file. Please ensure it is a valid INVOXA workspace export.')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (
      window.confirm(
        'WARNING: This will reset all your invoices, clients, and preferences back to fresh defaults. Are you sure you wish to proceed?'
      )
    ) {
      onResetWorkspace()
      setToastMessage('Workspace reset to defaults')
      setTimeout(() => setToastMessage(''), 3000)
    }
  }

  return (
    <div className="settings-view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="dashboard-eyebrow">Configuration & Backup</span>
          <h1 className="view-title">Settings</h1>
          <p className="view-subtitle">
            Configure invoice defaults, customize studio appearance, and backup your workspace.
          </p>
        </div>
        <button className="btn-primary" onClick={handleSaveAll}>
          <Check className="size-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {toastMessage && (
        <div className="settings-toast-banner">
          <Check className="size-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="settings-cards-list">
        {/* Appearance & Studio Theme */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Sliders className="size-4 text-indigo-500" />
            <div>
              <h2 className="card-heading">Appearance & Canvas</h2>
              <p className="card-subtext">Choose your visual mode and editing density.</p>
            </div>
          </div>

          <div className="settings-card-content">
            <div className="setting-control-row">
              <div>
                <strong>Theme Mode</strong>
                <small>Select the environment contrast that suits your workspace.</small>
              </div>
              <div className="theme-toggle-cluster">
                <button
                  type="button"
                  className={`theme-opt-btn ${prefState.theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...prefState, theme: 'light' as const }
                    setPrefState(next)
                    onUpdatePreferences(next)
                  }}
                >
                  <Sun className="size-4" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`theme-opt-btn ${prefState.theme === 'dim' ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...prefState, theme: 'dim' as const }
                    setPrefState(next)
                    onUpdatePreferences(next)
                  }}
                >
                  <Monitor className="size-4" />
                  <span>Dim</span>
                </button>
                <button
                  type="button"
                  className={`theme-opt-btn ${prefState.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...prefState, theme: 'dark' as const }
                    setPrefState(next)
                    onUpdatePreferences(next)
                  }}
                >
                  <Moon className="size-4" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="setting-control-row mt-4">
              <div>
                <strong>Accent Palette</strong>
                <small>Select the primary highlight for buttons, badges, and charts.</small>
              </div>
              <div className="accent-swatches-grid">
                {[
                  { name: 'Electric Indigo', hex: '#4F46E5' },
                  { name: 'Cyber Emerald', hex: '#059669' },
                  { name: 'Royal Violet', hex: '#7C3AED' },
                  { name: 'Sunset Rose', hex: '#E11D48' },
                  { name: 'Ocean Azure', hex: '#0284C7' },
                  { name: 'Solar Amber', hex: '#D97706' },
                ].map((color) => {
                  const isSelected = prefState.accent.toLowerCase() === color.hex.toLowerCase()
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      className={`accent-color-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        const next = { ...prefState, accent: color.hex }
                        setPrefState(next)
                        onUpdatePreferences(next)
                      }}
                      title={color.name}
                    >
                      <span className="accent-dot" style={{ backgroundColor: color.hex }} />
                      <span>{color.name}</span>
                      {isSelected && <Check className="size-3.5 ml-auto text-emerald-500" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="setting-control-row mt-4">
              <div>
                <strong>Studio Density</strong>
                <small>Control row heights and spacing across tables and forms.</small>
              </div>
              <div className="theme-toggle-cluster">
                <button
                  type="button"
                  className={`theme-opt-btn ${prefState.density === 'comfortable' ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...prefState, density: 'comfortable' as const }
                    setPrefState(next)
                    onUpdatePreferences(next)
                  }}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`theme-opt-btn ${prefState.density === 'compact' ? 'active' : ''}`}
                  onClick={() => {
                    const next = { ...prefState, density: 'compact' as const }
                    setPrefState(next)
                    onUpdatePreferences(next)
                  }}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Defaults */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FileSpreadsheet className="size-4 text-emerald-500" />
            <div>
              <h2 className="card-heading">Invoice Generation Defaults</h2>
              <p className="card-subtext">New invoices will automatically inherit these settings.</p>
            </div>
          </div>

          <div className="settings-card-content">
            <div className="form-grid-3">
              <div className="form-group">
                <label>Default Currency</label>
                <select
                  value={defaultState.currency}
                  onChange={(e) =>
                    setDefaultState({ ...defaultState, currency: e.target.value as CurrencyCode })
                  }
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
                <label>Default Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30"
                  value={defaultState.paymentTerms}
                  onChange={(e) =>
                    setDefaultState({ ...defaultState, paymentTerms: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Default Tax System</label>
                <select
                  value={defaultState.taxType}
                  onChange={(e) =>
                    setDefaultState({ ...defaultState, taxType: e.target.value as TaxType })
                  }
                  className="input-select"
                >
                  <option value="GST">Indian GST (18%)</option>
                  <option value="Standard">Standard Sales Tax</option>
                  <option value="None">No Tax</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2 mt-3">
              <div className="form-group">
                <label>Invoice Number Prefix</label>
                <input
                  type="text"
                  placeholder="INV-"
                  value={defaultState.numberPrefix}
                  onChange={(e) =>
                    setDefaultState({ ...defaultState, numberPrefix: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Next Sequence Counter</label>
                <input
                  type="number"
                  min="1"
                  value={defaultState.nextNumber}
                  onChange={(e) =>
                    setDefaultState({ ...defaultState, nextNumber: Number(e.target.value) || 1001 })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Default Notes to Client</label>
              <textarea
                rows={2}
                value={defaultState.notes}
                onChange={(e) =>
                  setDefaultState({ ...defaultState, notes: e.target.value })
                }
                className="input-textarea"
              />
            </div>

            <div className="form-group mt-3">
              <label>Default Terms & Conditions</label>
              <textarea
                rows={2}
                value={defaultState.terms}
                onChange={(e) =>
                  setDefaultState({ ...defaultState, terms: e.target.value })
                }
                className="input-textarea"
              />
            </div>
          </div>
        </div>

        {/* Data & Backup Management */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Download className="size-4 text-sky-500" />
            <div>
              <h2 className="card-heading">Workspace Backup & Portability</h2>
              <p className="card-subtext">
                Your data is stored locally in this browser. Export backups or restore anytime.
              </p>
            </div>
          </div>

          <div className="settings-card-content">
            <div className="data-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={onExportBackup}
              >
                <Download className="size-4" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="btn-secondary cursor-pointer">
                <Upload className="size-4" />
                <span>Import Workspace Backup</span>
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={handleFileImport}
                />
              </label>

              <button
                type="button"
                className="btn-danger-outline ml-auto"
                onClick={handleReset}
              >
                <RotateCcw className="size-4" />
                <span>Reset to Fresh Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
