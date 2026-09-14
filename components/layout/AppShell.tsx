'use client'

import React, { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Palette,
  Settings,
  Plus,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { InvoiceRecord } from '@/lib/types'

export type NavView =
  | 'Dashboard'
  | 'Invoices'
  | 'Editor'
  | 'Templates'
  | 'Clients'
  | 'BrandKit'
  | 'Settings'

interface AppShellProps {
  activeView: NavView
  setActiveView: (view: NavView) => void
  invoices: InvoiceRecord[]
  onCreateInvoice: () => void
  currentTheme?: 'light' | 'dim' | 'dark'
  onToggleTheme?: (theme: 'light' | 'dim' | 'dark') => void
  children: React.ReactNode
}

export function AppShell({
  activeView,
  setActiveView,
  invoices,
  onCreateInvoice,
  currentTheme = 'light',
  onToggleTheme,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'Dashboard' as NavView, label: 'Overview', icon: LayoutDashboard },
    { id: 'Invoices' as NavView, label: 'Invoices', icon: FileText, badge: invoices.length },
    { id: 'Editor' as NavView, label: 'Editor', icon: PenTool },
    { id: 'Templates' as NavView, label: 'Templates', icon: BookOpen },
    { id: 'Clients' as NavView, label: 'Clients', icon: Users },
    { id: 'BrandKit' as NavView, label: 'Brand Kit', icon: Palette },
    { id: 'Settings' as NavView, label: 'Settings', icon: Settings },
  ]

  const handleNavClick = (view: NavView) => {
    setActiveView(view)
    setMobileOpen(false)
  }

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-lockup" onClick={() => handleNavClick('Dashboard')}>
            <div className="brand-badge">
              <Sparkles className="size-4" />
            </div>
            <div className="brand-text">
              <span className="brand-name">INVOXA</span>
              <span className="brand-tagline">Studio Workspace</span>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Primary Action */}
        <div className="sidebar-action-wrap">
          <button
            className="btn-create-invoice"
            onClick={() => {
              onCreateInvoice()
              setMobileOpen(false)
            }}
          >
            <Plus className="size-4" />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Workspace</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <li key={item.id}>
                  <button
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="system-status-chip">
            <span className="status-ping" />
            <span>Local Vault Synced</span>
            <ShieldCheck className="size-3.5 text-emerald-500 ml-auto" />
          </div>

          <div className="creator-attribution">
            <span>Crafted by </span>
            <strong className="creator-brand">RHLIVERSE</strong>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="btn-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="topbar-breadcrumbs">
              <span className="crumb-root">INVOXA</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">
                {activeView === 'BrandKit' ? 'Brand Kit' : activeView}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-sync-indicator">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>All changes saved</span>
            </div>

            {/* Quick Theme Switcher */}
            {onToggleTheme && (
              <div className="topbar-theme-switcher" role="group" aria-label="Theme mode switcher">
                <button
                  type="button"
                  className={`topbar-theme-btn ${currentTheme === 'light' ? 'active' : ''}`}
                  onClick={() => onToggleTheme('light')}
                  title="Switch to Light Theme"
                  aria-label="Light Theme"
                >
                  <Sun className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={`topbar-theme-btn ${currentTheme === 'dim' ? 'active' : ''}`}
                  onClick={() => onToggleTheme('dim')}
                  title="Switch to Dim Theme"
                  aria-label="Dim Theme"
                >
                  <Monitor className="size-3.5" />
                </button>
                <button
                  type="button"
                  className={`topbar-theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                  onClick={() => onToggleTheme('dark')}
                  title="Switch to Dark Theme"
                  aria-label="Dark Theme"
                >
                  <Moon className="size-3.5" />
                </button>
              </div>
            )}

            {activeView !== 'Editor' && (
              <button
                className="topbar-btn-create"
                onClick={onCreateInvoice}
              >
                <Plus className="size-3.5" />
                <span>New Invoice</span>
              </button>
            )}
          </div>
        </header>

        <main className="app-content-area">{children}</main>
      </div>
    </div>
  )
}
