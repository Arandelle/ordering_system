import { Facebook, Instagram, Mail, Phone, Twitter } from 'lucide-react'
import React from 'react'

const MainFooterSection = () => {
  return (
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold text-[#e13e00] mb-4">
                HARRISON MANG INASAL BBQ
              </h3>
              <p className="text-gray-400 text-sm">
                Serving authentic Filipino charcoal-grilled BBQ since day one.
                Quality, tradition, and flavor in every bite.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <a
                  href="tel:+639123456789"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>+63 912 345 6789</span>
                </a>
                <a
                  href="mailto:info@harrisonmanginasal.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@harrisonmanginasal.com</span>
                </a>
                <a
                  href="mailto:franchise@harrisonmanginasal.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>franchise@harrisonmanginasal.com</span>
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/harrisonmanginasal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-[#e13e00] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Harrison Mang Inasal BBQ. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
  )
}

export default MainFooterSection
