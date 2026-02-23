import Footer from '@/components/Footer';
import Navbar from '@/components/NavBar';
import { CartProvider } from '@/contexts/harrisonCartContext';
import React from 'react'

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
     <CartProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
  )
}

export default layout
