import { cn } from '@/lib/cn'

interface StepperProps {
  /** 단계 이름. 화면마다 '정보 입력 완료', '생성 중'처럼 상태에 맞게 넘긴다. */
  steps: string[]
  /** 현재 단계 (0부터) */
  current: number
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="text-neutral-300">
              —
            </span>
          )}
          <span
            aria-current={i === current ? 'step' : undefined}
            className={cn(
              i === current && 'font-semibold text-brand-600',
              i < current && 'text-neutral-600',
              i > current && 'text-neutral-400',
            )}
          >
            {String(i + 1).padStart(2, '0')} {label}
          </span>
        </li>
      ))}
    </ol>
  )
}
