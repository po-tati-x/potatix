'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
import { cn } from "@/lib/shared/utils/cn";

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

const buttonVariants = cva(
  `relative 
  flex items-center justify-center
  cursor-pointer 
  inline-flex 
  items-center 
  space-x-2 
  text-center 
  font-regular 
  ease-out 
  duration-200 
  rounded-md
  outline-none 
  transition-all 
  outline-0 
  focus-visible:outline-4 
  focus-visible:outline-offset-1
  border
  `,
  {
    variants: {
      type: {
        primary: `
          bg-emerald-600 
          hover:bg-emerald-700
          text-white
          border-emerald-700
          hover:border-emerald-800
          focus-visible:outline-emerald-700
          data-[state=open]:bg-emerald-700
          data-[state=open]:outline-emerald-700
          `,
        default: `
          text-foreground
          bg-slate-100  hover:bg-slate-200 
          border-slate-300  hover:border-slate-400 
          focus-visible:outline-emerald-600
          data-[state=open]:bg-slate-200
          data-[state=open]:outline-emerald-600
          `,
        secondary: `
          bg-slate-700 
          text-white hover:text-white
          border-slate-700 hover:border-slate-800
          focus-visible:outline-slate-700
          data-[state=open]:border-slate-800
          data-[state=open]:outline-slate-700
        `,
        /** @deprecated use 'primary' instead */
        alternative: `
          text-white
          bg-emerald-600 hover:bg-emerald-700
          border-emerald-700
          focus-visible:border-emerald-700
          focus-visible:outline-emerald-700
          data-[state=open]:bg-emerald-700
          data-[state=open]:border-emerald-700
          data-[state=open]:outline-emerald-700
        `,
        outline: `
          text-foreground
          bg-transparent
          border-slate-300  hover:border-slate-400 
          focus-visible:outline-emerald-600
          data-[state=open]:border-slate-400 
          data-[state=open]:outline-emerald-600
        `,
        dashed: `
          text-foreground
          border
          border-dashed
          border-slate-300  hover:border-slate-400 
          bg-transparent
          focus-visible:outline-emerald-600
          data-[state=open]:border-slate-400 
          data-[state=open]:outline-emerald-600
        `,
        link: `
          text-emerald-600
          border
          border-transparent
          hover:bg-emerald-50
          border-opacity-0
          bg-opacity-0
          shadow-none
          focus-visible:outline-emerald-600
          data-[state=open]:bg-emerald-50
          data-[state=open]:outline-emerald-600
        `,
        text: `
          text-foreground
          hover:bg-slate-100 
          shadow-none
          focus-visible:outline-emerald-600
          data-[state=open]:bg-slate-100 
          data-[state=open]:outline-emerald-600
          border-transparent
        `,
        danger: `
          text-white bg-red-500 hover:bg-red-600
          border-red-600 hover:border-red-700
          focus-visible:outline-red-700
        `,
        warning: `
          text-foreground bg-amber-300 hover:bg-amber-400
          border-amber-500 hover:border-amber-600
          focus-visible:outline-amber-700
        `,
      },
      block: {
        true: 'w-full flex items-center justify-center',
      },
      size: {
        tiny: 'text-xs px-2 py-1',
        small: 'text-sm px-2.5 py-1.5',
        medium: 'text-sm px-3 py-2',
        large: 'text-base px-4 py-2',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
      },
      rounded: {
        true: 'rounded-full',
      },
    },
    defaultVariants: {
      type: 'primary',
      size: 'medium',
    },
  }
)

const IconContainerVariants = cva('', {
  variants: {
    size: {
      tiny: '[&_svg]:h-[14px] [&_svg]:w-[14px]',
      small: '[&_svg]:h-[18px] [&_svg]:w-[18px]',
      medium: '[&_svg]:h-[20px] [&_svg]:w-[20px]',
      large: '[&_svg]:h-[24px] [&_svg]:w-[24px]',
    },
  },
})

export type LoadingVariantProps = VariantProps<typeof loadingVariants>
const loadingVariants = cva('', {
  variants: {
    loading: {
      true: 'animate-spin',
      default: '',
    },
  },
})

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    Omit<ButtonVariantProps, 'disabled'>,
    Partial<LoadingVariantProps> {
  asChild?: boolean
  type?: ButtonVariantProps['type']
  htmlType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  icon?: React.ReactNode
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  rounded?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      size = 'medium',
      type = 'primary',
      children,
      loading,
      block,
      icon,
      iconRight,
      iconLeft,
      htmlType = 'button',
      rounded,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const _iconLeft = icon ?? iconLeft
    const disabled = !!loading || props.disabled

    return (
      <Comp
        ref={ref}
        type={htmlType}
        disabled={disabled}
        {...props}
        className={cn(buttonVariants({ type, size, block, rounded, disabled }), props.className)}
      >
        {(_iconLeft || loading) && (
          <span className={IconContainerVariants({ size })}>
            {loading ? <Loader2 className={loadingVariants({ loading })} /> : _iconLeft}
          </span>
        )}
        {children && <span className="truncate">{children}</span>}
        {iconRight && !loading && (
          <span className={IconContainerVariants({ size })}>{iconRight}</span>
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }