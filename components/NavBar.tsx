"use client";
import Link from 'next/link';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '@/contexts/harrisonCartContext';
import { useState } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#F8F7F4] border-b border-[#5C3A21]/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#111111] flex items-center justify-center rounded-sm">
              <span className="text-[#C8A951] font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111111]">HARRISON</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-[#1A1A1A] hover:text-[#5C3A21] transition-colors">Home</Link>
            <Link href="/#about" className="text-sm font-medium text-[#1A1A1A] hover:text-[#5C3A21] transition-colors">About</Link>
            <Link href="/order" className="text-sm font-medium text-[#1A1A1A] hover:text-[#5C3A21] transition-colors">Menu</Link>
            
            <Link href="/order" className="relative p-2 hover:bg-[#5C3A21]/10 rounded-md transition-colors">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A951] text-[#111111] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-[#111111]" />
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-[#5C3A21]/20 bg-[#F8F7F4] px-4 py-4 space-y-4">
          <Link href="/" className="block font-medium text-[#111111]" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/order" className="block font-medium text-[#111111]" onClick={() => setIsOpen(false)}>Order Now</Link>
        </div>
      )}
    </nav>
  );
}