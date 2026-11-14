/** 조건부 className을 합친다. 예: cn('px-4', isActive && 'bg-brand-500') */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
