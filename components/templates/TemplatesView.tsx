'use client'

import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  ArrowUpRight,
  Check,
  Search,
  Tag,
  Palette,
} from 'lucide-react'
import { INVOICE_TEMPLATES, TEMPLATE_FAMILIES } from '@/lib/templates'
import { TemplateFamily, InvoiceTemplate } from '@/lib/types'

interface TemplatesViewProps {
  onSelectTemplate: (templateId: string) => void
}

export function TemplatesView({ onSelectTemplate }: TemplatesViewProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filteredTemplates = useMemo(() => {
    return INVOICE_TEMPLATES.filter((t) => {
      if (selectedFamily !== 'All' && t.family !== selectedFamily) {
        return false
      }
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.family.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [selectedFamily, search])

  return (
    <div className="templates-view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <span className="dashboard-eyebrow">Design Ecosystem</span>
          <h1 className="view-title">Invoice Templates</h1>
          <p className="view-subtitle">
            Curated typographic and layout directions engineered for clarity, compliance, and craft.
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="templates-toolbar">
        <div className="template-categories-scroll">
          <button
            className={`cat-filter-btn ${selectedFamily === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedFamily('All')}
          >
            All Layouts
          </button>
          {TEMPLATE_FAMILIES.map((family) => (
            <button
              key={family}
              className={`cat-filter-btn ${selectedFamily === family ? 'active' : ''}`}
              onClick={() => setSelectedFamily(family)}
            >
              {family}
            </button>
          ))}
        </div>

        <div className="template-search-box">
          <Search className="size-4 search-icon" />
          <input
            type="text"
            placeholder="Search templates by style, tag, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-showcase-grid">
        {filteredTemplates.map((template) => {
          return (
            <div key={template.id} className="template-showcase-card">
              {/* Visual Simulated Document Thumbnail */}
              <div
                className={`template-thumbnail-viewport family-${template.family.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ '--thumb-accent': template.accent } as React.CSSProperties}
              >
                <div className="thumb-paper-mock">
                  {/* Executive Header Bar */}
                  {template.family === 'Executive' && (
                    <div className="thumb-exec-bar" style={{ background: template.accent }} />
                  )}

                  <div className="thumb-mock-head">
                    <div className="thumb-mock-logo" style={{ background: template.accent }} />
                    <div className="thumb-mock-inv-title" />
                  </div>

                  <div className="thumb-mock-meta-row">
                    <div className="thumb-mock-meta-line" />
                    <div className="thumb-mock-meta-line" />
                  </div>

                  <div className="thumb-mock-table">
                    <div className="thumb-table-header" style={{ borderBottomColor: template.accent }} />
                    <div className="thumb-table-row" />
                    <div className="thumb-table-row" />
                    <div className="thumb-table-row" />
                  </div>

                  <div className="thumb-mock-totals">
                    <div className="thumb-total-line" style={{ background: template.accent }} />
                  </div>

                  {/* GST QR badge */}
                  {template.family === 'India GST' && (
                    <div className="thumb-qr-badge" style={{ borderColor: template.accent }}>
                      QR
                    </div>
                  )}
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="template-card-details">
                <div className="template-card-title-row">
                  <div>
                    <h3 className="template-name">{template.name}</h3>
                    <span className="template-family-tag">{template.family}</span>
                  </div>
                  <span
                    className="template-accent-dot"
                    style={{ background: template.accent }}
                    title={`Brand accent: ${template.accent}`}
                  />
                </div>

                <p className="template-description">{template.description}</p>

                <div className="template-tags-list">
                  {template.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="template-card-footer-action">
                  <button
                    className="btn-use-template"
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    <span>Use Template</span>
                    <ArrowUpRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
