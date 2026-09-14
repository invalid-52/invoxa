'use client'

import React, { useState, useEffect, useCallback, useTransition } from 'react'
import { AppShell, NavView } from '@/components/layout/AppShell'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { InvoicesView } from '@/components/invoices/InvoicesView'
import { InvoiceEditorView } from '@/components/editor/InvoiceEditorView'
import { TemplatesView } from '@/components/templates/TemplatesView'
import { ClientsView } from '@/components/clients/ClientsView'
import { BrandKitView } from '@/components/brand/BrandKitView'
import { SettingsView } from '@/components/settings/SettingsView'

import {
  InvoiceRecord,
  ClientRecord,
  BusinessProfile,
  UserPreferences,
  InvoiceDefaults,
  InvoiceStatus,
  WorkspaceData,
} from '@/lib/types'
import {
  STORAGE_KEYS,
  DEFAULT_BUSINESS,
  DEFAULT_PREFERENCES,
  DEFAULT_INVOICE_DEFAULTS,
  SEED_CLIENTS,
  buildSeedInvoices,
  loadStored,
  saveStored,
  exportWorkspaceData,
  validateWorkspaceJson,
} from '@/lib/storage'
import { getTemplateById } from '@/lib/templates'
import { calculateInvoiceTotals } from '@/lib/calculations'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<NavView>('Dashboard')
  const [toastMessage, setToastMessage] = useState<string>('')

  // Workspace Data States
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [business, setBusiness] = useState<BusinessProfile>(DEFAULT_BUSINESS)
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [defaults, setDefaults] = useState<InvoiceDefaults>(DEFAULT_INVOICE_DEFAULTS)

  // Active Invoice for Editor
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2800)
  }, [])

  // Initial Load from LocalStorage (with Seeds on first time)
  useEffect(() => {
    const savedInvoices = loadStored<InvoiceRecord[]>(STORAGE_KEYS.INVOICES, [])
    const savedClients = loadStored<ClientRecord[]>(STORAGE_KEYS.CLIENTS, [])
    const savedBusiness = loadStored<BusinessProfile>(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS)
    const savedPrefs = loadStored<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
    const savedDefaults = loadStored<InvoiceDefaults>(STORAGE_KEYS.DEFAULTS, DEFAULT_INVOICE_DEFAULTS)

    if (savedInvoices.length === 0 && savedClients.length === 0) {
      // First time launch: populate rich seed data
      const seeds = buildSeedInvoices()
      setInvoices(seeds)
      setClients(SEED_CLIENTS)
      setBusiness(DEFAULT_BUSINESS)
      setPreferences(DEFAULT_PREFERENCES)
      setDefaults(DEFAULT_INVOICE_DEFAULTS)

      saveStored(STORAGE_KEYS.INVOICES, seeds)
      saveStored(STORAGE_KEYS.CLIENTS, SEED_CLIENTS)
      saveStored(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS)
      saveStored(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES)
      saveStored(STORAGE_KEYS.DEFAULTS, DEFAULT_INVOICE_DEFAULTS)
    } else {
      const activeBusiness =
        !savedBusiness || savedBusiness.name === 'Acme Digital Studio' || savedBusiness.name.includes('RHLISVERSE')
          ? DEFAULT_BUSINESS
          : savedBusiness
      setInvoices(savedInvoices)
      setClients(savedClients)
      setBusiness(activeBusiness)
      setPreferences(savedPrefs)
      setDefaults(savedDefaults)
    }

    setMounted(true)
  }, [])

  // Persist Invoices
  useEffect(() => {
    if (!mounted) return
    saveStored(STORAGE_KEYS.INVOICES, invoices)
  }, [invoices, mounted])

  // Persist Clients
  useEffect(() => {
    if (!mounted) return
    saveStored(STORAGE_KEYS.CLIENTS, clients)
  }, [clients, mounted])

  // Persist Business Profile
  useEffect(() => {
    if (!mounted) return
    saveStored(STORAGE_KEYS.BUSINESS, business)
  }, [business, mounted])

  // Persist Preferences & apply theme variables to document
  useEffect(() => {
    if (!mounted) return
    saveStored(STORAGE_KEYS.PREFERENCES, preferences)

    document.documentElement.dataset.theme = preferences.theme
    document.documentElement.style.setProperty('--accent', preferences.accent)
    document.documentElement.dataset.density = preferences.density
    document.documentElement.dataset.motion = preferences.motion ? 'full' : 'reduced'
  }, [preferences, mounted])

  // Persist Defaults
  useEffect(() => {
    if (!mounted) return
    saveStored(STORAGE_KEYS.DEFAULTS, defaults)
  }, [defaults, mounted])

  // Helper to generate next unique invoice number
  const getNextInvoiceNumber = useCallback(() => {
    const prefix = defaults.numberPrefix || 'INV-'
    const maxNum = invoices.reduce((max, inv) => {
      const match = inv.number.match(/\d+/)
      const num = match ? parseInt(match[0], 10) : 0
      return Math.max(max, num)
    }, defaults.nextNumber - 1)

    return `${prefix}${maxNum + 1}`
  }, [invoices, defaults])

  // Create new Invoice
  const handleCreateInvoice = (templateId = 'template-modern', forClient?: ClientRecord) => {
    const tmpl = getTemplateById(templateId)
    const nextNum = getNextInvoiceNumber()
    const today = new Date().toISOString().slice(0, 10)
    const due = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

    const targetClient: ClientRecord =
      forClient ||
      (clients.length > 0
        ? clients[0]
        : {
            id: `client-${Date.now()}`,
            name: '',
            company: 'New Client',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            postalCode: '',
            taxId: '',
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

    const initialItem = {
      id: `item-${Date.now()}`,
      description: 'Consulting / Professional Services',
      hsnSac: defaults.taxType === 'GST' ? '998313' : '',
      quantity: 1,
      unit: 'Units',
      rate: 1000,
      discount: 0,
      taxRate: defaults.taxType !== 'None' ? defaults.taxRate : 0,
      amount: 1000,
    }

    const calc = calculateInvoiceTotals({
      items: [initialItem],
      taxType: defaults.taxType,
      gstType: defaults.gstType,
      taxRate: defaults.taxRate,
      enableRoundOff: true,
    })

    const newInvoice: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      number: nextNum,
      status: 'Draft',
      business,
      client: targetClient,
      issueDate: today,
      dueDate: due,
      paymentTerms: defaults.paymentTerms || 'Net 30',
      items: [initialItem],
      taxType: defaults.taxType,
      gstType: defaults.gstType,
      subtotal: calc.subtotal,
      itemDiscounts: 0,
      invoiceDiscountPercent: 0,
      invoiceDiscountAmount: 0,
      taxableAmount: calc.taxableAmount,
      taxRate: defaults.taxRate,
      taxTotal: calc.taxTotal,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      shipping: 0,
      handling: 0,
      adjustment: 0,
      roundOff: calc.roundOff,
      total: calc.total,
      currency: defaults.currency || 'INR',
      payment: {
        method: 'UPI',
        bankName: '',
        accountHolder: business.legalName || business.name,
        accountNumber: '',
        ifsc: '',
        swift: '',
        iban: '',
        upiId: 'payment@upi',
        paymentUrl: '',
        qrType: 'upi',
      },
      notes: defaults.notes,
      terms: defaults.terms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      design: {
        templateId: tmpl.id,
        colors: {
          primary: tmpl.accent,
          secondary: '#0F172A',
          accent: tmpl.accent,
          surface: '#FFFFFF',
          text: '#111827',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          scale: 1,
          headingWeight: 700,
        },
        layout: {
          pageSize: 'A4',
          density: 'comfortable',
          showLogo: true,
          showWatermark: false,
        },
      },
    }

    setInvoices((prev) => [newInvoice, ...prev])
    setSelectedInvoice(newInvoice)
    setActiveView('Editor')
    showToast(`Invoice ${newInvoice.number} created`)
  }

  // Open existing invoice in Editor
  const handleOpenInvoice = (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice)
    setActiveView('Editor')
  }

  // Duplicate Invoice
  const handleDuplicateInvoice = (invoice: InvoiceRecord) => {
    const nextNum = getNextInvoiceNumber()
    const clone: InvoiceRecord = {
      ...JSON.parse(JSON.stringify(invoice)),
      id: `inv-${Date.now()}`,
      number: nextNum,
      status: 'Draft',
      issueDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setInvoices((prev) => [clone, ...prev])
    showToast(`Duplicated as ${clone.number}`)
  }

  // Delete Invoice
  const handleDeleteInvoice = (invoice: InvoiceRecord) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoice.id))
    if (selectedInvoice?.id === invoice.id) {
      setSelectedInvoice(null)
      setActiveView('Invoices')
    }
    showToast(`Invoice ${invoice.number} deleted`)
  }

  // Bulk Delete
  const handleBulkDeleteInvoices = (ids: string[]) => {
    setInvoices((prev) => prev.filter((i) => !ids.includes(i.id)))
    showToast(`${ids.length} invoices deleted`)
  }

  // Update Invoice Status
  const handleUpdateStatus = (invoiceId: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status, updatedAt: new Date().toISOString() } : inv))
    )
    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice((prev) => (prev ? { ...prev, status } : null))
    }
    showToast(`Status updated to ${status}`)
  }

  // Save invoice edits from Editor
  const handleSaveInvoice = (updated: InvoiceRecord) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
    setSelectedInvoice(updated)
    showToast(`All changes saved to ${updated.number}`)
  }

  // Client Management Handlers
  const handleSaveClient = (client: ClientRecord) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id)
      if (exists) {
        return prev.map((c) => (c.id === client.id ? client : c))
      }
      return [client, ...prev]
    })
    showToast(`Client ${client.company || client.name} saved`)
  }

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId))
    showToast('Client deleted')
  }

  // Template Selection from Gallery
  const handleSelectTemplateFromGallery = (templateId: string) => {
    handleCreateInvoice(templateId)
  }

  // Backup Export
  const handleExportBackup = () => {
    exportWorkspaceData({
      invoices,
      clients,
      business,
      preferences,
      defaults,
    })
    showToast('Workspace backup exported')
  }

  // Backup Import
  const handleImportBackup = (parsedJson: unknown) => {
    const validated = validateWorkspaceJson(parsedJson)
    if (!validated) {
      alert('Invalid workspace backup format.')
      return
    }
    setInvoices(validated.invoices)
    setClients(validated.clients)
    setBusiness(validated.businessProfile)
    setPreferences(validated.preferences)
    setDefaults(validated.defaults)
    showToast('Workspace restored successfully')
  }

  // Reset Workspace
  const handleResetWorkspace = () => {
    const seeds = buildSeedInvoices()
    setInvoices(seeds)
    setClients(SEED_CLIENTS)
    setBusiness(DEFAULT_BUSINESS)
    setPreferences(DEFAULT_PREFERENCES)
    setDefaults(DEFAULT_INVOICE_DEFAULTS)
    setSelectedInvoice(null)
    setActiveView('Dashboard')
    showToast('Workspace reset to clean defaults')
  }

  // Handle view navigation safely
  const handleNavigateView = (view: NavView) => {
    if (view === 'Editor') {
      if (!selectedInvoice) {
        if (invoices.length > 0) {
          setSelectedInvoice(invoices[0])
        } else {
          handleCreateInvoice()
          return
        }
      }
    }
    setActiveView(view)
  }

  // Quick theme switcher handler
  const handleToggleTheme = (newTheme: 'light' | 'dim' | 'dark') => {
    setPreferences((prev) => ({ ...prev, theme: newTheme }))
    showToast(`Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode`)
  }

  if (!mounted) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner" />
        <span>Loading INVOXA Workspace...</span>
      </div>
    )
  }

  return (
    <AppShell
      activeView={activeView}
      setActiveView={handleNavigateView}
      invoices={invoices}
      onCreateInvoice={() => handleCreateInvoice()}
      currentTheme={preferences.theme}
      onToggleTheme={handleToggleTheme}
    >
      {/* View Switcher */}
      {activeView === 'Dashboard' && (
        <DashboardView
          invoices={invoices}
          onCreateInvoice={() => handleCreateInvoice()}
          onOpenInvoice={handleOpenInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onViewAllInvoices={() => setActiveView('Invoices')}
          onAddClient={() => setActiveView('Clients')}
        />
      )}

      {activeView === 'Invoices' && (
        <InvoicesView
          invoices={invoices}
          onCreateInvoice={() => handleCreateInvoice()}
          onOpenInvoice={handleOpenInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onUpdateStatus={handleUpdateStatus}
          onBulkDelete={handleBulkDeleteInvoices}
        />
      )}

      {activeView === 'Editor' && (selectedInvoice || invoices[0]) && (
        <InvoiceEditorView
          invoice={selectedInvoice || invoices[0]}
          invoices={invoices}
          clients={clients}
          businessProfile={business}
          onSave={handleSaveInvoice}
          onBack={() => setActiveView('Invoices')}
          onOpenTemplates={() => setActiveView('Templates')}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
          onCreateNew={() => handleCreateInvoice()}
        />
      )}

      {activeView === 'Templates' && (
        <TemplatesView onSelectTemplate={handleSelectTemplateFromGallery} />
      )}

      {activeView === 'Clients' && (
        <ClientsView
          clients={clients}
          invoices={invoices}
          onSaveClient={handleSaveClient}
          onDeleteClient={handleDeleteClient}
          onCreateInvoiceForClient={(client) => handleCreateInvoice('template-modern', client)}
        />
      )}

      {activeView === 'BrandKit' && (
        <BrandKitView
          business={business}
          preferences={preferences}
          onSaveBusiness={setBusiness}
          onSavePreferences={setPreferences}
        />
      )}

      {activeView === 'Settings' && (
        <SettingsView
          preferences={preferences}
          defaults={defaults}
          onUpdatePreferences={setPreferences}
          onUpdateDefaults={setDefaults}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onResetWorkspace={handleResetWorkspace}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="global-toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}
    </AppShell>
  )
}
