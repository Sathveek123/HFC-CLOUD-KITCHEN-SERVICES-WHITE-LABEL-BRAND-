import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, FileText } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | HFC Consultancy Services',
  description: 'DPDP Act 2023 compliant Privacy Policy for HFC Consultancy Services and Cloud Kitchen operations.',
}

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-[32px] text-brand-black">Privacy Policy</h1>
            <p className="font-body text-[14px] text-brand-muted">Digital Personal Data Protection (DPDP) Act 2023 Compliant</p>
          </div>
        </div>

        <div className="text-[12px] font-body text-brand-muted mb-8 border-b border-brand-border pb-4">
          Effective Date: August 13, 2026 | Last Updated: August 13, 2026 | Operator: HFC Consultancy Services
        </div>

        {/* Content Body */}
        <div className="space-y-8 font-body text-[15px] text-brand-body leading-relaxed">
          
          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3 flex items-center gap-2">
              <Lock size={18} className="text-brand-red" /> 1. Data Controller & Collection Scope
            </h2>
            <p className="mb-3">
              HFC Consultancy Services (&quot;HFC&quot;, &quot;we&quot;, &quot;us&quot;) operates food consultancy and cloud kitchen ordering services. In compliance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, we collect only minimal personal data necessary for fulfilling your orders and requests:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[14px]">
              <li><strong>Contact Information:</strong> Customer Full Name, Mobile Phone Number.</li>
              <li><strong>Delivery Information:</strong> Delivery Address, House Number / Landmark, Delivery Zone.</li>
              <li><strong>Order & Transaction Records:</strong> Purchased dishes, subtotal, GST breakdowns, payment status, coupon redemptions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              2. Purpose of Data Processing
            </h2>
            <p className="mb-3">Your personal data is processed strictly for the following operational purposes:</p>
            <ol className="list-decimal pl-6 space-y-2 text-[14px]">
              <li>Processing food orders and routing delivery details to assigned delivery agents.</li>
              <li>Sending live WhatsApp and SMS order status updates to your mobile number.</li>
              <li>Generating tax invoices and billing receipts compliant with GST regulations.</li>
              <li>Preventing unauthorized transactions, fraud, or automated bot attacks.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              3. Data Security & Storage Architecture
            </h2>
            <p className="mb-3">
              HFC employs enterprise-grade security controls to protect your data against unauthorized access, loss, or leakage:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[14px]">
              <li><strong>Database Protection:</strong> Row Level Security (RLS) policies locked to authenticated staff JWT tokens. Public bulk database dumps are blocked with HTTP 403 Forbidden.</li>
              <li><strong>Single-Order Access:</strong> Order tracking pages retrieve single order records via SECURITY DEFINER PostgreSQL RPC functions requiring exact order ID matches.</li>
              <li><strong>No Plaintext Passwords:</strong> Delivery agent credentials are managed via encrypted Supabase Auth identity providers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              4. Data Subject Rights (DPDP Act Rights)
            </h2>
            <p className="mb-3">Under the DPDP Act 2023, Indian citizens have explicit rights regarding their personal data:</p>
            <ul className="list-disc pl-6 space-y-2 text-[14px]">
              <li><strong>Right to Access:</strong> Request a summary of personal data held by HFC.</li>
              <li><strong>Right to Correction & Erasure:</strong> Request correction of inaccurate address details or complete erasure of order history.</li>
              <li><strong>Right to Grievance Redressal:</strong> Contact our designated Data Protection Officer.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[20px] text-brand-black mb-3">
              5. Contact & Data Erasure Requests
            </h2>
            <p className="mb-2">To request data erasure or submit a privacy inquiry, contact our Data Protection Office:</p>
            <div className="p-4 bg-brand-surface border border-brand-border rounded-[8px] font-mono text-[13px] text-brand-black space-y-1">
              <div><strong>HFC Consultancy Services — Privacy Office</strong></div>
              <div>Email: privacy@hfc-consultancy.com</div>
              <div>Phone / WhatsApp: +91 99127 99855</div>
              <div>Address: HFC Central Kitchen, Jubilee Hills, Hyderabad, Telangana, India</div>
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
