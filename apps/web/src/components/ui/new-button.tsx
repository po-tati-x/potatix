'use client'

import { Slot } from '@radix-ui/react-slot'
import { VariantProps, cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cloneElement, forwardRef, isValidElement } from 'react'
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
          text-white
          bg-red-500  hover:bg-red-600 
          border-red-600 hover:border-red-700
          focus-visible:outline-red-700
          data-[state=open]:border-red-700
          data-[state=open]:bg-red-600 
          data-[state=open]:outline-red-700
        `,
        warning: `
          text-foreground
          bg-amber-300  hover:bg-amber-400 
          border-amber-500 hover:border-amber-600
          hover:text-hi-contrast
          focus-visible:outline-amber-700
          data-[state=open]:border-amber-600
          data-[state=open]:bg-amber-400 
          data-[state=open]:outline-amber-600
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
        xlarge: 'text-lg px-5 py-2.5',
        xxlarge: 'text-xl px-6 py-3',
        xxxlarge: 'text-2xl px-8 py-4',
      },
      overlay: {
        base: `absolute inset-0 bg-background opacity-50`,
        container: `fixed inset-0 transition-opacity`,
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
      large: '[&_svg]:h-[20px] [&_svg]:w-[20px]',
      xlarge: '[&_svg]:h-[24px] [&_svg]:w-[24px]',
      xxlarge: '[&_svg]:h-[30px] [&_svg]:w-[30px]',
      xxxlarge: '[&_svg]:h-[42px] [&_svg]:w-[42px]',
    },
    type: {
      primary: 'text-white',
      default: 'text-slate-500',
      secondary: 'text-white',
      alternative: 'text-white',
      outline: 'text-slate-700',
      dashed: 'text-slate-700',
      link: 'text-emerald-600',
      text: 'text-slate-700',
      danger: 'text-white',
      warning: 'text-amber-800',
    },
  },
})

export type LoadingVariantProps = VariantProps<typeof loadingVariants>
const loadingVariants = cva('', {
  variants: {
    type: {
      primary: 'text-white',
      default: 'text-slate-500',
      secondary: 'text-white',
      alternative: 'text-white',
      outline: 'text-slate-700',
      dashed: 'text-slate-700',
      link: 'text-emerald-600',
      text: 'text-slate-700',
      danger: 'text-white',
      warning: 'text-amber-800',
    },
    loading: {
      default: '',
      true: `animate-spin`,
    },
  },
})

export interface ButtonProps
  // omit `type` as we use it to change type of button
  // replaced with `htmlType`
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    // omit 'disabled' as it is included in HTMLButtonElement
    Omit<ButtonVariantProps, 'disabled'>,
    Omit<LoadingVariantProps, 'type'> {
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
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const { className } = props
    const showIcon = loading || icon || iconLeft
    // decrecating 'showIcon' for rightIcon
    const _iconLeft: React.ReactNode = icon ?? iconLeft
    // if loading, button is disabled
    const disabled = loading === true || props.disabled

    return (
      <Comp
        ref={ref}
        data-size={size}
        type={htmlType}
        {...props}
        disabled={disabled}
        className={cn(buttonVariants({ type, size, disabled, block, rounded }), className)}
      >
        {asChild ? (
          isValidElement(children) ? (
            cloneElement(
              children,
              undefined,
              showIcon &&
                (loading ? (
                  <div className={cn(IconContainerVariants({ size, type }))}>
                    <Loader2 className={cn(loadingVariants({ loading, type }))} />
                  </div>
                ) : _iconLeft ? (
                  <div className={cn(IconContainerVariants({ size, type }))}>{_iconLeft}</div>
                ) : null),
              isValidElement(children) && 'props' in children && 'children' in (children.props as React.PropsWithChildren<object>) ? (
                <span className={'truncate'}>{(children.props as React.PropsWithChildren<object>).children}</span>
              ) : null,
              iconRight && !loading && (
                <div className={cn(IconContainerVariants({ size, type }))}>{iconRight}</div>
              )
            )
          ) : null
        ) : (
          <>
            {showIcon &&
              (loading ? (
                <div className={cn(IconContainerVariants({ size, type }))}>
                  <Loader2 className={cn(loadingVariants({ loading, type }))} />
                </div>
              ) : _iconLeft ? (
                <div className={cn(IconContainerVariants({ size, type }))}>{_iconLeft}</div>
              ) : null)}{' '}
            {children && <span className={'truncate'}>{children}</span>}{' '}
            {iconRight && !loading && (
              <div className={cn(IconContainerVariants({ size, type }))}>{iconRight}</div>
            )}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }