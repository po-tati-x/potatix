'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

interface ModalProps {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  onClose?: () => void
  hideCloseButton?: boolean
  blurStrength?: 'none' | 'sm' | 'md' | 'lg'
}

const Modal = ({ 
  title, 
  size = 'md', 
  children, 
  onClose,
  hideCloseButton = false,
  blurStrength = 'md'
}: ModalProps) => {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    
    // Add a small delay to trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)
    
    return () => {
      document.body.style.overflow = 'auto'
      clearTimeout(timer)
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      handleClose()
    }
  }

  const handleClose = () => {
    if (onClose) {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 200) // Match the transition duration
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-5'
  }

  const blurClasses = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  }

  const content = (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ease-in-out",
        isVisible ? "bg-black/40" : "bg-black/0",
        blurClasses[blurStrength],
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full overflow-hidden transition-all duration-200 ease-in-out",
          sizeClasses[size],
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-3">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{title}</h3>
            {!hideCloseButton && onClose && (
              <Button
                type="text"
                size="tiny"
                onClick={handleClose}
                iconLeft={<X className="h-4 w-4" />}
                aria-label="Close modal"
                className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              />
            )}
          </div>
        )}
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  )

  return mounted ? createPortal(content, document.body) : null
}

export default Modal
