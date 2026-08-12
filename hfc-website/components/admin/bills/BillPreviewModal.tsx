'use client'

import React from 'react'
import { X, FileText, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { Bill } from '@/types'
import { format } from 'date-fns'
import QRCode from 'react-qr-code'
import { useSettingsStore } from '@/store/settingsStore'
import AdminBadge from '@/components/admin/shared/AdminBadge'

interface BillPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill
}

export default function BillPreviewModal({
  isOpen,
  onClose,
  bill,
}: BillPreviewModalProps) {
  const settings = useSettingsStore(state => state.settings)

  if (!isOpen) return null

  const handlePrint = () => {
    const printContent = document.getElementById('bill-print-area')?.innerHTML || ''
    const printWindow = window.open('', '_blank', 'width=700,height=900')
    if (!printWindow) return

    const printStyles = `
      <style>
        @media print {
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Inter', sans-serif; 
            color: #1A1A1A; 
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
        }
        body { 
          font-family: 'Inter', sans-serif; 
          padding: 30px; 
          color: #1A1A1A; 
          max-width: 600px; 
          margin: 0 auto; 
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: 1fr 1fr; }
        .gap-y-2 { row-gap: 8px; }
        .border-b { border-bottom: 1px solid #F0F0F0; }
        .border-y { border-top: 1px solid #1A1A1A; border-bottom: 1px solid #1A1A1A; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .my-4 { margin-top: 16px; margin-bottom: 16px; }
        .my-6 { margin-top: 24px; margin-bottom: 24px; }
        .mt-4 { margin-top: 16px; }
        .font-bold { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #F0F0F0; }
        th { font-weight: bold; text-transform: uppercase; background: #FAFAFA; }
        .avatar { display: none; }
        .badge { font-weight: bold; font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid; }
        .qr-sec { display: flex; flex-direction: column; align-items: center; justify-content: center; }
      </style>
    `

    printWindow.document.write(`
      <html>
        <head>
          <title>${bill.billNo}</title>
        </head>
        <body>
          ${printStyles}
          <div id="print-wrap">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleWhatsAppShare = () => {
    const formattedDate = format(new Date(bill.timestamp), 'dd MMM yyyy')
    const itemsSummary = bill.items
      .map(i => `• ${i.quantity} × ${i.name} — ₹${(i.price * i.quantity).toFixed(2)}`)
      .join('\n')

    let text = `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `🧾 *BILL — HFC CONSULTANCY SERVICES*\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `📋 *Bill No:* ${bill.billNo}\n`
    text += `🆔 *Order:* ${bill.orderId}\n`
    text += `📅 *Date:* ${formattedDate}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `*ITEMS:*\n`
    text += `${itemsSummary}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Subtotal: ₹${bill.subtotal.toFixed(2)}\n`
    if (bill.discountAmount > 0) {
      text += `Discount (${bill.couponCode}): -₹${bill.discountAmount.toFixed(2)}\n`
    }
    text += `GST (5%): ₹${bill.gst.toFixed(2)}\n`
    text += `*TOTAL: ₹${bill.total.toFixed(2)}*\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Payment: ${bill.paymentMethod} — ${bill.paymentStatus.toUpperCase()}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `_Thank you for ordering from HFC!_`

    const cleanPhone = bill.customerPhone.replace(/\D/g, '')
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Formatting strings
  const billDateFormatted = format(new Date(bill.timestamp), 'dd MMM yyyy, h:mm aa')

  // Generate UPI payment deep link
  const upiLink = `upi://pay?pa=${settings.upiId}&pn=HFC&am=${bill.total}&cu=INR`

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-[620px] max-w-[95vw] max-h-[90vh] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.20)] overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <div>
            <h2 className="font-display font-bold text-[20px] text-brand-black">Tax Invoice</h2>
            <p className="font-body text-[12px] text-brand-muted mt-0.5">
              Bill No: {bill.billNo} · {bill.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-brand-red text-brand-muted transition-colors rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6" id="bill-print-area">
          
          {/* Section A — Brand Header */}
          <div className="text-center space-y-1">
            <div className="font-brand font-black text-[22px] tracking-wide text-brand-red leading-none">
              {settings.siteName.toUpperCase()}
            </div>
            <div className="font-tagline italic text-[13px] text-brand-body">
              Tax Invoice
            </div>
            <div className="w-full h-[1px] bg-brand-border my-4" />
          </div>

          {/* Section B — Bill Meta Grid */}
          <div className="grid grid-cols-2 gap-y-2 text-[12px] font-body">
            <div className="flex gap-2">
              <span className="text-brand-muted font-medium w-24">Bill No:</span>
              <strong className="text-brand-black font-semibold">{bill.billNo}</strong>
            </div>
            <div className="flex gap-2">
              <span className="text-brand-muted font-medium w-24">Bill Date:</span>
              <strong className="text-brand-black font-semibold">{billDateFormatted}</strong>
            </div>
            <div className="flex gap-2">
              <span className="text-brand-muted font-medium w-24">Order ID:</span>
              <strong className="text-brand-black font-semibold">{bill.orderId}</strong>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-brand-muted font-medium w-24">Order Type:</span>
              <AdminBadge variant="type" value={bill.orderType} />
            </div>
          </div>

          <div className="w-full h-[1px] bg-brand-border my-4" />

          {/* Section C — Customer & Delivery Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px] font-body">
            {/* Customer Details */}
            <div className="space-y-1">
              <span className="block font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[2px]">
                BILLED TO
              </span>
              <strong className="block text-[14px] text-brand-black font-bold">
                {bill.customerName}
              </strong>
              <div className="text-brand-muted">
                Phone: <a href={`tel:${bill.customerPhone}`} className="hover:underline">{bill.customerPhone}</a>
              </div>
              {bill.deliveryAddress && (
                <div className="text-brand-muted leading-tight whitespace-pre-wrap mt-1">
                  Address: {bill.deliveryAddress}
                </div>
              )}
            </div>

            {/* Agent Details */}
            {bill.assignedAgent && (
              <div className="space-y-1 sm:border-l sm:border-brand-border sm:pl-4">
                <span className="block font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[2px]">
                  DELIVERY AGENT
                </span>
                <strong className="block text-[13px] text-brand-black font-bold">
                  {bill.assignedAgent}
                </strong>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-brand-border my-4" />

          {/* Section D — Items Table */}
          <div className="border border-brand-border rounded-[6px] overflow-hidden mb-4">
            <table className="w-full border-collapse m-0">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-brand-border">
                  <th className="py-2.5 px-3 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] w-8">#</th>
                  <th className="py-2.5 px-3 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px]">Item</th>
                  <th className="py-2.5 px-3 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] text-center w-12">Qty</th>
                  <th className="py-2.5 px-3 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] text-right w-20">Unit Price</th>
                  <th className="py-2.5 px-3 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] text-right w-20">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border font-body text-[12px]">
                {bill.items.map((item, idx) => (
                  <tr key={item.id} className="even:bg-[#FAFAFA]">
                    <td className="py-3 px-3 text-brand-muted font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <strong className="font-brand font-semibold text-brand-black block">{item.name}</strong>
                    </td>
                    <td className="py-3 px-3 text-center font-brand font-bold text-brand-black">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-brand-body">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-brand font-bold text-brand-black">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section E — Totals Block */}
          <div className="w-full max-w-[260px] ml-auto space-y-1.5 font-body text-[12px] text-brand-body text-right mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <strong className="text-brand-black font-semibold">₹{bill.subtotal.toFixed(2)}</strong>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Discount ({bill.couponCode}):</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <strong className="text-brand-black font-semibold">₹{bill.gst.toFixed(2)}</strong>
            </div>
            {bill.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <strong className="text-brand-black font-semibold">₹{bill.deliveryCharge.toFixed(2)}</strong>
              </div>
            )}
            <div className="w-full h-[1.5px] bg-brand-black my-2" />
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-brand font-black text-brand-black uppercase tracking-[0.5px]">TOTAL DUE</span>
              <strong className="font-brand font-black text-brand-red text-[18px]">₹{bill.total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="w-full h-[1px] bg-brand-border my-4" />

          {/* Section F — Payment Status & QR Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Payment Details */}
            <div className="space-y-1.5 font-body text-[13px]">
              <div className="flex items-center gap-1">
                <span className="text-brand-muted">Payment Method:</span>
                <strong className="text-brand-black font-semibold">{bill.paymentMethod}</strong>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-brand-muted">Payment Status:</span>
                {bill.paymentStatus === 'paid' ? (
                  <span className="text-green-700 font-semibold inline-flex items-center gap-1">
                    <CheckCircle size={14} /> Paid
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold inline-flex items-center gap-1">
                    <AlertCircle size={14} /> Unpaid
                  </span>
                )}
              </div>
            </div>

            {/* UPI QR Code */}
            <div className="flex flex-col items-center qr-sec bg-brand-surface border border-brand-border rounded-[8px] p-3">
              <QRCode value={upiLink} size={80} />
              <span className="text-[9px] text-brand-muted mt-2">
                Scan to pay ₹{bill.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-brand-border my-4" />

          {/* Section G — Footer info */}
          <div className="text-center space-y-1 font-body text-[10px] text-brand-muted leading-tight">
            <div className="font-tagline italic text-[14px] text-brand-black font-bold">
              Thank you for your order!
            </div>
            <div className="font-tagline italic text-[11px] mt-1 text-brand-muted">
              {settings.siteName} — Premium Food & F&B Consultancy
            </div>
            <div className="text-[10px] text-brand-muted leading-relaxed mt-2 font-semibold">
              📞 +91 99127 99855 &nbsp;·&nbsp; 📧 info@hfcconsultancy.com
            </div>
            <div className="text-[9px] text-brand-muted/70 italic mt-2.5">
              This is a computer-generated invoice.
            </div>
          </div>

        </div>

        {/* Modal Footer (Fixed bottom action buttons) */}
        <div className="px-6 py-4 border-t border-brand-border bg-white flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handlePrint}
            className="h-11 px-6 bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[12px] uppercase tracking-[1px] rounded-btn flex-1 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            🖨 Print / Save PDF
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="h-11 px-6 bg-[#25D366] hover:bg-[#1da851] text-white font-brand font-bold text-[12px] uppercase tracking-[1px] rounded-btn flex-1 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <MessageCircle size={14} /> Send WhatsApp
          </button>
          <button
            onClick={onClose}
            className="h-11 px-5 border border-brand-border text-brand-body hover:bg-[#F5F5F5] font-brand font-semibold text-[12px] uppercase rounded-btn transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
