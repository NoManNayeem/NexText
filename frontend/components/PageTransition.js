// frontend/app/components/PageTransition.js
'use client'
import { AnimatePresence } from 'framer-motion'

export default function PageTransition({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  )
}
