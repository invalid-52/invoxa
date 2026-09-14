'use client'

import React, { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ArrowUpRight,
  Edit2,
  Trash2,
} from 'lucide-react'
import { ClientRecord, InvoiceRecord } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { ClientModal } from './ClientModal'

interface ClientsViewProps {
  clients: ClientRecord[]
  invoices: InvoiceRecord[]
  onSaveClient: (client: ClientRecord) => void
  onDeleteClient: (clientId: string) => void
  onCreateInvoiceForClient: (client: ClientRecord) => void
}

export function ClientsView({
  clients,
  invoices,
  onSaveClient,
  onDeleteClient,
  onCreateInvoiceForClient,
}: ClientsViewProps) {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null)

  // Compute metrics per client
  const clientsWithMetrics = useMemo(() => {
    return clients.map((client) => {
      const clientInvoices = invoices.filter(
        (inv) =>
          inv.client?.id === client.id ||
          (inv.client?.name && inv.client.name.toLowerCase() === client.name.toLowerCase()) ||
          (inv.client?.company && inv.client.company.toLowerCase() === client.company.toLowerCase())
      )

      let totalBilled = 0
      let outstanding = 0

      for (const inv of clientInvoices) {
        totalBilled += inv.total
        if (inv.status === 'Sent' || inv.status === 'Overdue' || inv.status === 'Partially Paid') {
          outstanding += inv.total
        }
      }

      return {
        ...client,
        invoiceCount: clientInvoices.length,
        totalBilled,
        outstanding,
      }
    })
  }, [clients, invoices])

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clientsWithMetrics
    const q = search.toLowerCase()
    return clientsWithMetrics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    )
  }, [clientsWithMetrics, search])

  const handleOpenAdd = () => {
    setEditingClient(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (client: ClientRecord) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  return (
    <div className="clients-view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="dashboard-eyebrow">Client Directory</span>
          <h1 className="view-title">Clients CRM</h1>
          <p className="view-subtitle">
            Manage your client relationships, billing addresses, and invoice histories.
          </p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus className="size-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="clients-toolbar">
        <div className="search-input-box">
          <Search className="size-4 search-icon" />
          <input
            type="text"
            placeholder="Search clients by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="clients-count-pill">
          <span>{filteredClients.length}</span> clients listed
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length > 0 ? (
        <div className="clients-cards-grid">
          {filteredClients.map((client) => {
            const initials = (client.company || client.name || 'C')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

            return (
              <div key={client.id} className="client-summary-card">
                <div className="client-card-top-bar">
                  <div className="client-avatar-badge">{initials}</div>
                  <div className="client-card-menu">
                    <button
                      className="table-action-btn"
                      title="Edit Client"
                      onClick={() => handleOpenEdit(client)}
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      className="table-action-btn btn-danger-hover"
                      title="Delete Client"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete client ${client.company || client.name}? Invoices created for this client will be preserved.`
                          )
                        ) {
                          onDeleteClient(client.id)
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="client-card-info">
                  <h3 className="client-company-title">{client.company || client.name}</h3>
                  {client.company && client.name && client.name !== client.company && (
                    <p className="client-person-name">Attn: {client.name}</p>
                  )}

                  <div className="client-contact-lines">
                    {client.email && (
                      <div className="contact-line">
                        <Mail className="size-3 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="contact-line">
                        <Phone className="size-3 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {(client.city || client.country) && (
                      <div className="contact-line">
                        <MapPin className="size-3 text-muted-foreground" />
                        <span>
                          {[client.city, client.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Health Snapshot */}
                <div className="client-card-stats-row">
                  <div className="client-stat-box">
                    <span className="stat-label">Total Invoices</span>
                    <strong className="stat-val">{client.invoiceCount}</strong>
                  </div>
                  <div className="client-stat-box">
                    <span className="stat-label">Total Billed</span>
                    <strong className="stat-val">{formatCurrency(client.totalBilled, 'INR')}</strong>
                  </div>
                  <div className="client-stat-box">
                    <span className="stat-label">Outstanding</span>
                    <strong
                      className={`stat-val ${client.outstanding > 0 ? 'text-amber-600' : 'text-slate-600'}`}
                    >
                      {formatCurrency(client.outstanding, 'INR')}
                    </strong>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="client-card-action-footer">
                  <button
                    className="btn-create-for-client"
                    onClick={() => onCreateInvoiceForClient(client)}
                  >
                    <FileText className="size-3.5" />
                    <span>Create Invoice</span>
                    <ArrowUpRight className="size-3.5 ml-auto" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <div className="empty-icon-box">
            <Users className="size-8 text-indigo-400" />
          </div>
          {clients.length === 0 ? (
            <>
              <h3>Add your first client to speed up invoicing.</h3>
              <p>Save customer billing details once and reuse them anytime.</p>
              <button className="btn-primary mt-3" onClick={handleOpenAdd}>
                <Plus className="size-4" />
                <span>Add Client</span>
              </button>
            </>
          ) : (
            <>
              <h3>No matching clients found</h3>
              <p>Try searching with another keyword or company name.</p>
              <button className="btn-secondary mt-3" onClick={() => setSearch('')}>
                Clear Search
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveClient}
        initialData={editingClient}
      />
    </div>
  )
}
