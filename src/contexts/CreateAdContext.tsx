import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { generateAd, type GenerateResponse, type Mood } from '@/api/generate'
import { getPlacement, type Placement } from '@/lib/adOptions'

/** 정보 입력 화면에서 받는 값 */
export interface AdForm {
  image: File
  productName: string
  storeName: string
  description: string
  target: string
  mood: Mood
  placement: Placement
}

type Status = 'idle' | 'pending' | 'success' | 'error'

interface CreateAdState {
  form: AdForm | null
  status: Status
  result: GenerateResponse | null
  error: string | null
}

interface CreateAdContextValue extends CreateAdState {
  /** 생성을 시작한다. 진행 상태는 status로 확인한다. */
  start: (form: AdForm) => void
  retry: () => void
  reset: () => void
}

const INITIAL_STATE: CreateAdState = { form: null, status: 'idle', result: null, error: null }

const CreateAdContext = createContext<CreateAdContextValue | null>(null)

/** 입력 → 생성 중 → 완성 화면이 같은 상태를 공유하도록 한다. */
export function CreateAdProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreateAdState>(INITIAL_STATE)
  // 이전 요청의 응답이 늦게 도착해도 무시하기 위한 번호
  const requestId = useRef(0)

  const start = useCallback((form: AdForm) => {
    const id = ++requestId.current
    setState({ form, status: 'pending', result: null, error: null })

    generateAd({
      image: form.image,
      productName: form.productName.trim(),
      storeName: form.storeName.trim() || undefined,
      prompt: form.description.trim(),
      target: form.target.trim() || undefined,
      mood: form.mood,
      ratio: getPlacement(form.placement).ratio,
    })
      .then((result) => {
        if (id !== requestId.current) return
        setState((s) => ({ ...s, status: 'success', result }))
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return
        console.error(err)
        setState((s) => ({
          ...s,
          status: 'error',
          error: '광고를 만들지 못했어요. 잠시 후 다시 시도해 주세요.',
        }))
      })
  }, [])

  const retry = useCallback(() => {
    if (state.form) start(state.form)
  }, [state.form, start])

  const reset = useCallback(() => {
    requestId.current++
    setState(INITIAL_STATE)
  }, [])

  const value = useMemo(() => ({ ...state, start, retry, reset }), [state, start, retry, reset])

  return <CreateAdContext value={value}>{children}</CreateAdContext>
}

export function useCreateAd(): CreateAdContextValue {
  const ctx = use(CreateAdContext)
  if (!ctx) throw new Error('useCreateAd는 CreateAdProvider 안에서만 쓸 수 있어요.')
  return ctx
}
