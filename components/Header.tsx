'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Menu, X, User, LogIn } from 'lucide-react';
import { categories } from '@/data/menuData';

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category: string) => {
    scrollToMenu();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#1a1a1a] shadow-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-[#e13e00] rounded-full flex items-center justify-center">
             <img src="images/harrison_logo.png" alt="harrison_logo" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[#e13e00] font-bold text-lg leading-tight">Harrison</h1>
              <p className="text-white/80 text-xs">House of Inasal & BBQ</p>
            </div>
          </div>
          
          
          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Login/Signup - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                // onClick={onLoginClick}
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                <LogIn size={18} />
                <span className="text-sm font-medium">Login</span>
              </button>
              <button 
                // onClick={onSignupClick}
                className="flex items-center gap-2 bg-[#e13e00] hover:bg-[#c13500] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <User size={18} />
                <span>Sign Up</span>
              </button>
            </div>
            
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group"
            >
              <ShoppingBag size={20} className="text-white group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e13e00] text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1a1a] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
           
            {/* Auth Buttons */}
            <div className="flex gap-2 pt-2">
              <button 
                // onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 text-white bg-white/10 px-4 py-3 rounded-lg"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
              <button 
                // onClick={() => { onSignupClick(); setIsMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e13e00] text-white px-4 py-3 rounded-lg"
              >

                <User size={18} />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
