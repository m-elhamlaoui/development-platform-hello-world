'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a101c] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-[#3b82f6] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-6">Lost in Space</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for seems to have drifted into the void. 
            Let's get you back on track.
          </p>
          <Link 
            href="/satellites"
            className="inline-flex items-center px-6 py-3 bg-[#3b82f6] text-white rounded-lg 
                     hover:bg-[#2563eb] transition-colors duration-200"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 