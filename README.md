# 🧾 INVOXA — World-Class Invoice Generator

> **Create. Customize. Send. Get Paid.**

INVOXA is a modern, high-performance invoice workspace designed for freelancers, agencies, developers, consultants, and international businesses. Built with Next.js, React 19, and Tailwind CSS.

---

## ✨ Features

- **Split Studio Workspace**: Left-hand grouped controls with an instant live A4 document preview that updates in real time.
- **Indian GST & International Taxes**:
  - Full Indian GST compliance with GSTIN, PAN, and HSN/SAC item code support.
  - Automatic split for Intra-state (`CGST` + `SGST`) vs Inter-state (`IGST`).
  - Standard VAT, Sales Tax, and Zero-tax options for global trade.
- **Instant UPI QR Payments**:
  - Automatically generates dynamic UPI QR codes (`upi://pay?pa=...`) for instant settlement via Google Pay, PhonePe, Paytm, and BHIM.
  - Offline vector SVG QR rendering with zero external dependencies.
- **Curated Template Ecosystem**:
  - 8 distinct typographic layout families: Minimal, Modern, Executive, Creative, Elegant Serif, Corporate, Bharat GST Pro, and Global Trade.
- **Client CRM**:
  - Save customer profiles, billing addresses, and tax identifiers.
  - Track total billed revenue and outstanding balances per client.
  - One-click "Create Invoice for Client".
- **Brand Kit**:
  - Centralized business profile, company logo upload with size controls, and custom color palette tokens.
- **Financial Command Center**:
  - Revenue analytics, outstanding cashflow indicators, and dynamic trajectory visualization.
- **A4 Multi-Page & PDF Export**:
  - Print-safe CSS `@media print` engine formatted for exact A4 proportions with zero UI bleed.
- **Local-First & Data Portability**:
  - Instant client-side persistence via LocalStorage.
  - Full workspace JSON backup export and validated restore.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript 5.7+

---

## 🛠️ Getting Started

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📄 License

Crafted by **RHLIVERSE**
