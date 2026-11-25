import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError } from '@/api/client'
import { generateAd, type GenerateResponse, type Mood } from '@/api/generate'
import { getPlacement, type Placement } from '@/lib/adOptions'
import type { Box } from '@/lib/box'

/** 정보 입력 화면에서 받는 값 + '그릇 다시 지정'에서 그린 박스 */
export interface AdForm {
  image: File
  productName: string
  storeName: string
  description: string
  target: string
  mood: Mood
  placement: Placement
  /** 사용자가 그린 박스들 (원본 픽셀 좌표). 없으면 서버가 자동으로 찾는다. */
  boxes?: Box[]
}

/**
 * idle: 아직 생성 전 / pending: 생성 중 / success: 완료 / error: 실패
 * needsBoxes: 서버가 음식(그릇)을 못 찾음(422). /create/boxes에서 error 메시지를 보여준다.
 */
type Status = 'idle' | 'pending' | 'success' | 'error' | 'needsBoxes'

interface CreateAdState {
  form: AdForm | null
  status: Status
  /** 마지막으로 성공한 결과. 다시 만들기 중이거나 실패해도 '취소'로 돌아갈 수 있게 남겨 둔다. */
  result: GenerateResponse | null
  error: string | null
}

interface CreateAdContextValue extends CreateAdState {
  /** 정보 입력에서 새로 생성한다. 처음 생성은 항상 자동 선택이라 박스와 이전 결과는 지운다. */
  start: (form: Omit<AdForm, 'boxes'>) => void
  /** 지금 입력값에 박스를 넣어 다시 생성한다. 이전 결과는 남겨 둔다. */
  regenerate: (boxes: Box[]) => void
  retry: () => void
  /** 다시 지정을 취소하고 이전 결과로 돌아간다. 결과가 없으면 아무것도 하지 않는다. */
  backToResult: () => void
  reset: () => void
}

const INITIAL_STATE: CreateAdState = { form: null, status: 'idle', result: null, error: null }

const GENERATE_ERROR = '광고를 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
const NOT_FOUND_ERROR = '음식(그릇)을 찾지 못했어요. 음식 위치를 박스로 지정해 주세요.'

const CreateAdContext = createContext<CreateAdContextValue | null>(null)

/** 입력 → 생성 중 → 완성 (→ 그릇 다시 지정) 화면이 같은 상태를 공유하도록 한다. */
export function CreateAdProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreateAdState>(INITIAL_STATE)
  // 이전 요청의 응답이 늦게 도착해도 무시하기 위한 번호
  const requestId = useRef(0)

  const run = useCallback((form: AdForm, keepResult: boolean) => {
    const id = ++requestId.current
    setState((s) => ({
      form,
      status: 'pending',
      result: keepResult ? s.result : null,
      error: null,
    }))

    generateAd({
      image: form.image,
      productName: form.productName.trim(),
      storeName: form.storeName.trim() || undefined,
      prompt: form.description.trim(),
      target: form.target.trim() || undefined,
      mood: form.mood,
      ratio: getPlacement(form.placement).ratio,
      boxes: form.boxes,
    })
      .then((result) => {
        if (id !== requestId.current) return
        setState((s) => ({ ...s, status: 'success', result }))
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return
        const notFound = err instanceof ApiError && err.status === 422
        if (!notFound) console.error(err)
        setState((s) => ({
          ...s,
          status: notFound ? 'needsBoxes' : 'error',
          error: notFound ? err.message || NOT_FOUND_ERROR : GENERATE_ERROR,
        }))
      })
  }, [])

  const start = useCallback((form: Omit<AdForm, 'boxes'>) => run(form, false), [run])

  const regenerate = useCallback(
    (boxes: Box[]) => {
      if (state.form) run({ ...state.form, boxes }, true)
    },
    [state.form, run],
  )

  const retry = useCallback(() => {
    if (state.form) run(state.form, true)
  }, [state.form, run])

  const backToResult = useCallback(() => {
    requestId.current++
    setState((s) => (s.result ? { ...s, status: 'success', error: null } : s))
  }, [])

  const reset = useCallback(() => {
    requestId.current++
    setState(INITIAL_STATE)
  }, [])

  const value = useMemo(
    () => ({ ...state, start, regenerate, retry, backToResult, reset }),
    [state, start, regenerate, retry, backToResult, reset],
  )

  return <CreateAdContext value={value}>{children}</CreateAdContext>
}

export function useCreateAd(): CreateAdContextValue {
  const ctx = use(CreateAdContext)
  if (!ctx) throw new Error('useCreateAd는 CreateAdProvider 안에서만 쓸 수 있어요.')
  return ctx
}
