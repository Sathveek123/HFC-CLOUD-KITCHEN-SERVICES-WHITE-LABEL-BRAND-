import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | HFC Consultancy Services',
  description: 'Terms of Service and Cloud Kitchen Ordering Conditions for HFC Consultancy Services.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-brand-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-brand-border rounded-[16px] shadow-sm p-8 sm:p-12">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-brand font-medium text-[14px] text-brand-black hover:text-brand-red transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to HFC Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-brand-red">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-[32px] text-brand-black">Terms of Service</h1>
            <p className="font-body text-[14px] text-brand-muted">HFC Consultancy Services & Cloud Kitchen Operations</p>
          </div>
        </div>

        <div className="text-[12px] font-body text-brand-muted mb-8 border-b border-brand-border pb-4">
          Effective Date: August 13, 2026 | Operator: HFC Consultancy Services
        </div>

        {/* Content Body */}
        <div className="space-y-8 font-body text-[15px] text-brand-body leading-relaxed">
          
          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the website (`http://localhost:3000`), browsing the cloud kitchen menu, or placing orders with HFC Consultancy Services (&quot;HFC&quot;), you agree to be bound by these Terms of Service. If you do not agree to all conditions, please discontinue use.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              2. Order Fulfillment & Delivery Terms
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[14px]">
              <li><strong>Order Confirmation:</strong> Orders submitted via checkout generate a 2-step confirmation window. Orders are written to the kitchen queue upon customer confirmation.</li>
              <li><strong>Delivery Charges & Thresholds:</strong> Delivery fees apply based on distance and order subtotal. Orders exceeding ₹500 (pre-discount subtotal) qualify for Free Home Delivery.</li>
              <li><strong>Cash on Delivery (COD):</strong> Cash on Delivery payments are collected by assigned delivery agents at the time of delivery. Delivery agents verify cash amount before marking orders as paid.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              3. Cancellation & Refund Policy
            </h2>
            <p className="mb-3">
              HFC strives for 100% customer satisfaction. Cancellation and refund rules are structured as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[14px]">
              <li><strong>Pre-Acceptance Cancellation:</strong> Orders may be cancelled prior to kitchen acceptance with zero penalty.</li>
              <li><strong>Kitchen Rejected Orders:</strong> If an order is rejected by HFC due to item unavailability, any pre-paid UPI/Online amount will be refunded within 24 business hours.</li>
              <li><strong>Post-Delivery Support:</strong> For missing items or quality concerns, contact HFC Support within 2 hours of delivery with order ID.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              4. Pricing, GST & Taxes
            </h2>
            <p>
              All prices listed on the menu are in Indian Rupees (₹). Applicable Goods and Services Tax (GST) is calculated at 5% on post-discount taxable amounts in accordance with Indian tax laws. Tax breakdowns are itemized on your bill receipt.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              5. Governing Law & Contact
            </h2>
            <p className="mb-3">
              These terms are governed by the laws of Telangana, India. For inquiries regarding orders, consultancy contracts, or terms:
            </p>
            <div className="p-4 bg-brand-surface border border-brand-border rounded-[8px] font-mono text-[13px] text-brand-black space-y-1">
              <div><strong>HFC Consultancy Services</strong></div>
              <div>Phone / WhatsApp: +91 99127 99855</div>
              <div>Email: support@hfc-consultancy.com</div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-brand-border text-center">
          <Link href="/" className="font-brand font-bold text-[13px] text-brand-red uppercase tracking-[1px] hover:underline">
            Return to HFC Cloud Kitchen &rarr;
          </Link>
        </div>

      </div>
    </div>
  )
}
