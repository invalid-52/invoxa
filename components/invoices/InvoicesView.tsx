'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Copy,
  Trash2,
  FileText,
  ArrowUpDown,
  CheckSquare,
  Square,
  ChevronDown,
  Edit,
} from 'lucide-react'
import { InvoiceRecord, InvoiceStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface InvoicesViewProps {
  invoices: InvoiceRecord[]
  onCreateInvoice: () => void
  onOpenInvoice: (invoice: InvoiceRecord) => void
  onDuplicateInvoice: (invoice: InvoiceRecord) => void
  onDeleteInvoice: (invoice: InvoiceRecord) => void
  onUpdateStatus: (invoiceId: string, status: InvoiceStatus) => void
  onBulkDelete?: (ids: string[]) => void
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'dueDate'

export function InvoicesView({
  invoices,
  onCreateInvoice,
  onOpenInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onUpdateStatus,
  onBulkDelete,
}: InvoicesViewProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const statusTabs = [
    'All',
    'Draft',
    'Sent',
    'Partially Paid',
    'Paid',
    'Overdue',
    'Cancelled',
  ]

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Status tab filter
        if (statusFilter !== 'All' && inv.status !== statusFilter) {
          return false
        }

        // Search query
        if (!search.trim()) return true
        const q = search.toLowerCase()
        const num = inv.number.toLowerCase()
        const clientName = (inv.client?.name || '').toLowerCase()
        const company = (inv.client?.company || '').toLowerCase()
        const email = (inv.client?.email || '').toLowerCase()

        return num.includes(q) || clientName.includes(q) || company.includes(q) || email.includes(q)
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.issueDate || a.createdAt).getTime() - new Date(b.issueDate || b.createdAt).getTime()
        }
        if (sortBy === 'highest') {
          return b.total - a.total
        }
        if (sortBy === 'lowest') {
          return a.total - b.total
        }
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
        }
        return 0
      })
  }, [invoices, statusFilter, search, sortBy])

  // Bulk Selection Handlers
  const allFilteredSelected =
    filteredInvoices.length > 0 &&
    filteredInvoices.every((inv) => selectedIds.includes(inv.id))

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredInvoices.map((inv) => inv.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`Delete ${selectedIds.length} selected invoices? This action cannot be undone.`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds)
      } else {
        selectedIds.forEach((id) => {
          const inv = invoices.find((i) => i.id === id)
          if (inv) onDeleteInvoice(inv)
        })
      }
      setSelectedIds([])
    }
  }

  return (
    <div className="invoices-view-container">
      {/* View Header */}
      <div className="view-header">
        <div>
          <span className="dashboard-eyebrow">Records & Billing</span>
          <h1 className="view-title">Invoices</h1>
          <p className="view-subtitle">
            Create, track, filter, and organize invoices for all your clients.
          </p>
        </div>
        <button className="btn-primary" onClick={onCreateInvoice}>
          <Plus className="size-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="invoices-toolbar">
        {/* Status Pills */}
        <div className="status-tabs-scroll">
          {statusTabs.map((tab) => {
            const count =
              tab === 'All'
                ? invoices.length
                : invoices.filter((i) => i.status === tab).length
            return (
              <button
                key={tab}
                className={`status-filter-btn ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                <span>{tab}</span>
                <span className="status-tab-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="toolbar-controls-row">
          <div className="search-input-box">
            <Search className="size-4 search-icon" />
            <input
              type="text"
              placeholder="Search by invoice #, client, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>
                ×
              </button>
            )}
          </div>

          <div className="sort-dropdown-box">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Amount</option>
              <option value="lowest">Sort: Lowest Amount</option>
              <option value="dueDate">Sort: Due Date</option>
            </select>
            <ChevronDown className="size-3.5 text-muted-foreground ml-1 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-banner">
          <span>
            <strong>{selectedIds.length}</strong> invoice{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="bulk-actions-group">
            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
              <Trash2 className="size-3.5" />
              <span>Delete Selected</span>
            </button>
            <button className="bulk-cancel-btn" onClick={() => setSelectedIds([])}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="invoices-table-card">
        {filteredInvoices.length > 0 ? (
          <div className="table-responsive-wrapper">
            <table className="invoices-full-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <button
                      className="checkbox-btn"
                      onClick={toggleSelectAll}
                      title="Select all"
                    >
                      {allFilteredSelected ? (
                        <CheckSquare className="size-4 text-indigo-600" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </th>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id)
                  return (
                    <tr
                      key={inv.id}
                      className={`invoice-row ${isSelected ? 'row-selected' : ''}`}
                    >
                      <td className="td-checkbox">
                        <button
                          className="checkbox-btn"
                          onClick={() => toggleSelectOne(inv.id)}
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-indigo-600" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                      <td>
                        <button
                          className="table-inv-link"
                          onClick={() => onOpenInvoice(inv)}
                        >
                          <FileText className="size-4 text-indigo-500" />
                          <span className="inv-num-text">{inv.number}</span>
                        </button>
                      </td>
                      <td>
                        <div className="client-cell-layout">
                          <strong>{inv.client?.company || inv.client?.name || 'Unassigned'}</strong>
                          <small>{inv.client?.email || 'No email specified'}</small>
                        </div>
                      </td>
                      <td className="table-date">{inv.issueDate || '—'}</td>
                      <td className="table-date">{inv.dueDate || '—'}</td>
                      <td>
                        <select
                          className={`status-select status-${inv.status.toLowerCase().replace(/\s+/g, '-')}`}
                          value={inv.status}
                          onChange={(e) =>
                            onUpdateStatus(inv.id, e.target.value as InvoiceStatus)
                          }
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="table-amount text-right">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="text-right">
                        <div className="table-actions-cluster">
                          <button
                            className="table-action-btn"
                            title="Edit Invoice"
                            onClick={() => onOpenInvoice(inv)}
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            className="table-action-btn"
                            title="Duplicate"
                            onClick={() => onDuplicateInvoice(inv)}
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            className="table-action-btn btn-danger-hover"
                            title="Delete"
                            onClick={() => {
                              if (window.confirm(`Delete invoice ${inv.number}?`)) {
                                onDeleteInvoice(inv)
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="empty-icon-box">
              <FileText className="size-8 text-indigo-400" />
            </div>
            {invoices.length === 0 ? (
              <>
                <h3>Your invoices will live here.</h3>
                <p>Create your first invoice to bill clients and monitor revenue.</p>
                <button className="btn-primary mt-3" onClick={onCreateInvoice}>
                  <Plus className="size-4" />
                  <span>Create your first invoice</span>
                </button>
              </>
            ) : (
              <>
                <h3>No matching invoices found</h3>
                <p>Try refining your search keyword or clearing the status filter.</p>
                <button
                  className="btn-secondary mt-3"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                  }}
                >
                  Clear search and filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
