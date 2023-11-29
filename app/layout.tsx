import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Sidebar from '@/ui/Sidebar/Sidebar'
import Navbar from '@/ui/Navbar/Navbar'

import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${inter.className}`}>
        <Providers>
        <Toaster />
          <div className='flex min-h-screen'>
            <Sidebar />
            <div className='flex-grow overflow-auto'>
              <Navbar />
              <main className="p-5">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
