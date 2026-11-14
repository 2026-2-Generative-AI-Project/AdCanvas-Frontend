import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50',
}

/** 버튼 모양의 className. Link 같은 다른 요소를 버튼처럼 보이게 할 때도 쓴다. */
export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(
    'inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed',
    VARIANTS[variant],
    className,
  )
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />
}
