import { X, Smartphone } from 'lucide-react'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'

export default function MobileAppModal({ isOpen, onClose }) {
  if (!isOpen) return null

  // Auto-detect the local IP address via window.location.hostname
  // If accessing via localhost on PC, we display the user's specific local IP.
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  // In development, we hardcode the detected Wi-Fi IP to make the QR code work from localhost
  const mobileUrl = isLocalhost 
    ? `http://192.168.1.2:${window.location.port}` 
    : window.location.href

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-2">
              <Smartphone size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-[var(--text)]">Get the Mobile App</h2>
            <p className="text-[var(--text-subtle)] text-sm mb-4">
              Scan this QR code with your phone's camera to instantly launch the Sarvam Swarm mobile experience.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
              <QRCode 
                value={mobileUrl} 
                size={180}
                level="H"
              />
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Make sure your phone is connected to the same Wi-Fi network as this computer.
            </p>

            {/* Play Store Mock Badge */}
            <button 
              className="mt-4 flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg border border-gray-800 hover:bg-gray-900 transition-colors"
              onClick={() => alert("The Play Store release is coming in Phase 3 of the SaaS roadmap!")}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className="h-8"
              />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
