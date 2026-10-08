import React from 'react'
import { X, Smartphone, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'

export default function MobileAppModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const mobileUrl = isLocalhost 
    ? 'http://192.168.1.2:' + window.location.port
    : window.location.href

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="relative w-full max-w-[340px] bg-[#161618] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0" />

          <button 
            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            
            <h2 className="text-xl font-bold text-white mb-2">Get the Mobile App</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed px-2">
              Scan this QR code with your phone's camera to instantly launch the Sarvam Swarm mobile experience.
            </p>

            <div className="bg-white p-3 rounded-2xl shadow-lg mb-6 ring-1 ring-black/5">
              <QRCode 
                value={mobileUrl} 
                size={140}
                level="M"
              />
            </div>

            <button 
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-xl transition-colors text-sm font-semibold"
              onClick={() => alert("The native App Store release is coming in Phase 3 of the SaaS roadmap!")}
            >
              <Smartphone size={16} className="text-white/50" />
              Download for iOS & Android
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}