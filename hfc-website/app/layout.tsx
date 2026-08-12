import type { Metadata } from 'next'
import { Playfair_Display, Montserrat, Inter, Lora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const fontDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const fontBrand = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-brand',
  display: 'swap',
})

const fontBody = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const fontTagline = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['italic'],
  variable: '--font-tagline',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HFC Consultancy Services | Premium Food & F&B Consultancy',
  description: 'Your Growth, Our Responsibility. All Within Your Budget. Menu engineering, brand positioning, and full F&B setup.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBrand.variable} ${fontBody.variable} ${fontTagline.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white text-brand-black min-h-screen flex flex-col antialiased">
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#1A1A1A',
              border: '1px solid #F0F0F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: '8px',
            },
          }}
        />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
