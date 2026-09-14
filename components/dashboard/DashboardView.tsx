'use client'

import React, { useMemo } from 'react'
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  FileText,
  Users,
  Copy,
  FolderOpen,
} from 'lucide-react'
import { InvoiceRecord } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'

interface DashboardViewProps {
  invoices: InvoiceRecord[]
  onCreateInvoice: () => void
  onOpenInvoice: (invoice: InvoiceRecord) => void
  onDuplicateInvoice: (invoice: InvoiceRecord) => void
  onViewAllInvoices: () => void
  onAddClient: () => void
}

export function DashboardView({
  invoices,
  onCreateInvoice,
  onOpenInvoice,
  onDuplicateInvoice,
  onViewAllInvoices,
  onAddClient,
}: DashboardViewProps) {
  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning.'
    if (hour < 17) return 'Good afternoon.'
    return 'Good evening.'
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    let revenue = 0
    let outstanding = 0
    let paidCount = 0
    let overdueCount = 0

    const now = new Date().getTime()

    for (const inv of invoices) {
      if (inv.status === 'Paid') {
        revenue += inv.total
        paidCount++
      } else if (inv.status === 'Sent' || inv.status === 'Partially Paid') {
        outstanding += inv.total
        // Check if overdue by date
        if (inv.dueDate && new Date(inv.dueDate).getTime() < now) {
          overdueCount++
        }
      } else if (inv.status === 'Overdue') {
        outstanding += inv.total
        overdueCount++
      }
    }

    return { revenue, outstanding, paidCount, overdueCount }
  }, [invoices])

  // Dynamic Revenue Chart Points based on actual invoice history
  const chartData = useMemo(() => {
    // Generate buckets for the last 6 months or periods
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const today = new Date()
    const buckets: { label: string; amount: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthLabel = months[d.getMonth()]
      const year = d.getFullYear()
      const month = d.getMonth()

      const sum = invoices
        .filter((inv) => {
          if (!inv.issueDate) return false
          const invDate = new Date(inv.issueDate)
          return invDate.getFullYear() === year && invDate.getMonth() === month
        })
        .reduce((acc, inv) => acc + inv.total, 0)

      buckets.push({ label: monthLabel, amount: sum })
    }

    const maxVal = Math.max(...buckets.map((b) => b.amount), 1000)

    // Build SVG Path points for a 600x180 viewBox
    const width = 600
    const height = 180
    const step = width / (buckets.length - 1 || 1)

    const points = buckets.map((b, idx) => {
      const x = idx * step
      // normalize y so 0 is at bottom (height - 20) and max is at top (20)
      const y = height - 20 - (b.amount / maxVal) * (height - 40)
      return { x, y }
    })

    let linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cp1x = prev.x + (curr.x - prev.x) / 2
      const cp2x = cp1x
      linePath += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`
    }

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

    return { buckets, maxVal, linePath, areaPath, points }
  }, [invoices])

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.issueDate || b.createdAt).getTime() - new Date(a.issueDate || a.createdAt).getTime())
      .slice(0, 5)
  }, [invoices])

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">Financial Workspace</span>
          <h1 className="dashboard-title">{greeting}</h1>
          <p className="dashboard-subtitle">
            Here’s what’s happening with your invoices and workspace cashflow.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn-primary" onClick={onCreateInvoice}>
            <Plus className="size-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Revenue</span>
            <div className="metric-icon-wrap text-emerald-500 bg-emerald-500/10">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats.revenue, 'INR')}</div>
          <div className="metric-subtext">
            <span className="text-emerald-500 font-semibold">{stats.paidCount}</span> invoices paid
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Outstanding</span>
            <div className="metric-icon-wrap text-amber-500 bg-amber-500/10">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats.outstanding, 'INR')}</div>
          <div className="metric-subtext">Awaiting client settlement</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Paid Invoices</span>
            <div className="metric-icon-wrap text-indigo-500 bg-indigo-500/10">
              <CheckCircle className="size-4" />
            </div>
          </div>
          <div className="metric-value">{stats.paidCount}</div>
          <div className="metric-subtext">Cleared transactions</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Overdue</span>
            <div className="metric-icon-wrap text-rose-500 bg-rose-500/10">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="metric-value">{stats.overdueCount}</div>
          <div className="metric-subtext">
            {stats.overdueCount > 0 ? (
              <span className="text-rose-500 font-medium">Requires follow-up</span>
            ) : (
              'All invoices on track'
            )}
          </div>
        </div>
      </div>

      {/* Analytics & Recent Records Section */}
      <div className="dashboard-split-grid">
        {/* Revenue Trend Visualizer */}
        <div className="dashboard-panel chart-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Revenue Trajectory</h2>
              <p className="panel-description">Billed volume across the last 6 calendar periods</p>
            </div>
            <div className="chart-legend-badge">
              <span className="legend-dot" />
              <span>Billed Invoices</span>
            </div>
          </div>

          <div className="chart-wrapper">
            <svg
              viewBox="0 0 600 180"
              preserveAspectRatio="none"
              className="revenue-chart-svg"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent, #4F46E5)" stopOpacity="0.32" />
                  <stop offset="85%" stopColor="var(--accent, #4F46E5)" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="var(--accent, #4F46E5)" stopOpacity="0.0" />
                </linearGradient>
                <filter id="chartGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--accent, #4F46E5)" floodOpacity="0.4" />
                </filter>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="600" y2="160" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />

              {/* Area & Stroke Paths */}
              <path d={chartData.areaPath} fill="url(#chartGradient)" />
              <path
                d={chartData.linePath}
                fill="none"
                stroke="var(--accent, #4F46E5)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#chartGlow)"
              />

              {/* Data point halo dots */}
              {chartData.points.map((pt, i) => (
                <g key={i} className="chart-node-group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    fill="var(--accent, #4F46E5)"
                    fillOpacity="0.2"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="var(--bg-surface, #ffffff)"
                    stroke="var(--accent, #4F46E5)"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="chart-x-labels">
              {chartData.buckets.map((b, idx) => (
                <span key={idx}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Workspace Health */}
        <div className="dashboard-panel side-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Quick Actions</h2>
              <p className="panel-description">Fast track your daily workflows</p>
            </div>
          </div>

          <div className="quick-actions-list">
            <button className="quick-action-item" onClick={onCreateInvoice}>
              <div className="action-icon-box bg-indigo-500/10 text-indigo-500">
                <Plus className="size-4" />
              </div>
              <div className="action-copy">
                <strong>New Invoice</strong>
                <small>Create blank or from template</small>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground ml-auto" />
            </button>

            <button className="quick-action-item" onClick={onViewAllInvoices}>
              <div className="action-icon-box bg-sky-500/10 text-sky-500">
                <FolderOpen className="size-4" />
              </div>
              <div className="action-copy">
                <strong>Invoices Directory</strong>
                <small>Manage drafts, sent and paid</small>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground ml-auto" />
            </button>

            <button className="quick-action-item" onClick={onAddClient}>
              <div className="action-icon-box bg-emerald-500/10 text-emerald-500">
                <Users className="size-4" />
              </div>
              <div className="action-copy">
                <strong>Add Client</strong>
                <small>Speed up invoicing with CRM profiles</small>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground ml-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Feed */}
      <div className="dashboard-panel full-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Recent Invoices</h2>
            <p className="panel-description">Latest invoices prepared in your workspace</p>
          </div>
          <button className="btn-text-link" onClick={onViewAllInvoices}>
            <span>View all invoices</span>
            <ArrowUpRight className="size-4" />
          </button>
        </div>

        {recentInvoices.length > 0 ? (
          <div className="recent-table-wrap">
            <table className="recent-invoices-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="recent-table-row">
                    <td>
                      <button
                        className="inv-number-btn"
                        onClick={() => onOpenInvoice(inv)}
                      >
                        <FileText className="size-4 text-indigo-500" />
                        <span>{inv.number}</span>
                      </button>
                    </td>
                    <td>
                      <div className="table-client-meta">
                        <strong>{inv.client?.company || inv.client?.name || 'Unassigned'}</strong>
                        <small>{inv.client?.email || 'No email'}</small>
                      </div>
                    </td>
                    <td className="table-date">{inv.issueDate || 'Draft'}</td>
                    <td>
                      <span className={`status-pill status-${inv.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="table-amount text-right">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="text-right">
                      <div className="table-actions-cluster">
                        <button
                          className="table-action-btn"
                          title="Open Invoice"
                          onClick={() => onOpenInvoice(inv)}
                        >
                          <ArrowUpRight className="size-4" />
                        </button>
                        <button
                          className="table-action-btn"
                          title="Duplicate Invoice"
                          onClick={() => onDuplicateInvoice(inv)}
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <div className="empty-icon-box">
              <FileText className="size-8 text-indigo-400" />
            </div>
            <h3>Your invoices will live here.</h3>
            <p>Generate your first professional invoice in seconds with live preview.</p>
            <button className="btn-primary mt-3" onClick={onCreateInvoice}>
              <Plus className="size-4" />
              <span>Create your first invoice</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
