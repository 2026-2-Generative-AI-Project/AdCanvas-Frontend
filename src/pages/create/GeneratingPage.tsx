import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import PageHeader from '@/components/PageHeader'
import Stepper from '@/components/Stepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCreateAd } from '@/contexts/CreateAdContext'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

// 백엔드가 진행 단계를 알려주지 않으므로, 요청이 끝날 때까지 3단계까지만 시간에 맞춰 넘긴다.
// 백엔드가 진행 상황을 주게 되면 그 값으로 바꾼다.
const STEPS = [
  {
    title: '상품 이미지 분석',
    description: '상품의 특징과 분위기를 확인했어요.',
    progress: '상품 이미지를 분석하고 있어요',
  },
  {
    title: '맞춤 광고 전략 구성',
    description: '요구사항에 맞는 메시지와 방향을 정했어요.',
    progress: '맞춤 광고 전략을 구성하고 있어요',
  },
  {
    title: '이미지 · 문구 생성',
    description: '우리 가게의 매력을 담은 광고를 만들고 있어요.',
    progress: '이미지와 광고 문구를 생성하고 있어요',
  },
  {
    title: '마지막 확인',
    description: '이미지와 문구를 정리해 보여드릴게요.',
    progress: '마지막으로 확인하고 있어요',
  },
]
const STEP_INTERVAL_MS = 2000
const LAST_WAITING_STEP = 2

type RowStatus = 'done' | 'active' | 'waiting'

const ROW_STATUS_LABEL: Record<RowStatus, string> = {
  done: '완료',
  active: '진행 중',
  waiting: '대기',
}

export default function GeneratingPage() {
  useDocumentTitle('AdCanvas · 생성 중')
  const navigate = useNavigate()
  const { form, status, error, retry } = useCreateAd()
  const [timedStep, setTimedStep] = useState(0)
  // 응답이 오면 마지막 단계를 보여준 뒤 결과 화면으로 넘어간다
  const step = status === 'success' ? STEPS.length - 1 : timedStep

  useEffect(() => {
    if (status !== 'pending' || timedStep >= LAST_WAITING_STEP) return
    const timer = setTimeout(() => setTimedStep((s) => s + 1), STEP_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [status, timedStep])

  useEffect(() => {
    if (status !== 'success') return
    const timer = setTimeout(() => navigate('/create/result', { replace: true }), 1000)
    return () => clearTimeout(timer)
  }, [status, navigate])

  if (!form || status === 'idle') return <Navigate to="/create" replace />
  // 서버가 음식(그릇)을 못 찾으면(422) 박스 지정 화면에서 메시지를 보여준다
  if (status === 'needsBoxes') return <Navigate to="/create/boxes" replace />

  const failed = status === 'error'
  const progress = ((step + 0.5) / STEPS.length) * 100

  function rowStatus(i: number): RowStatus {
    if (i < step) return 'done'
    if (i === step) return 'active'
    return 'waiting'
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: '홈', to: '/' },
          { label: '나만의 광고 만들기', to: '/create' },
          { label: '생성 중' },
        ]}
        title="나만의 광고 만들기"
        aside={<Stepper steps={['정보 입력 완료', '생성 중', '광고 완성']} current={1} />}
      />

      <Card className="mx-auto max-w-xl text-center sm:p-8">
        {failed ? (
          <>
            <span className="inline-block rounded-full bg-red-50 px-5 py-1.5 text-xs font-semibold text-red-600">
              생성 실패
            </span>
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">광고를 만들지 못했어요</h2>
            <p className="mt-3 text-sm text-neutral-500">{error}</p>
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="secondary" onClick={() => navigate('/create')}>
                정보 수정하기
              </Button>
              <Button
                onClick={() => {
                  setTimedStep(0)
                  retry()
                }}
              >
                다시 시도
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="inline-block rounded-full bg-brand-100 px-5 py-1.5 text-xs font-semibold text-brand-700">
              생성 중
            </span>
            <h2 className="mt-5 text-2xl leading-snug font-bold sm:text-3xl">
              우리 가게만의 광고를
              <br />
              만들고 있어요
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              올려주신 사진 한 장과 요구사항을 바탕으로
              <br />
              상품의 매력이 드러나는 이미지와 문구를 준비하고 있어요.
            </p>

            <div className="mt-7 text-left">
              <progress className="sr-only" max={STEPS.length} value={step + 1}>
                {STEPS[step].progress}
              </progress>
              <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span aria-live="polite" className="font-semibold text-brand-600">
                  {STEPS[step].progress}
                </span>
                <span className="text-neutral-500">
                  {step + 1} / {STEPS.length} 단계
                </span>
              </div>

              <ol className="mt-5 space-y-2">
                {STEPS.map((s, i) => {
                  const rs = rowStatus(i)
                  return (
                    <li
                      key={s.title}
                      className={cn(
                        'flex items-center gap-4 rounded-xl px-4 py-3.5',
                        rs === 'active' ? 'bg-brand-50' : 'bg-neutral-50',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold',
                          rs === 'active'
                            ? 'bg-brand-600 text-white'
                            : 'bg-white text-neutral-500 shadow-xs',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            rs === 'waiting' && 'text-neutral-500',
                          )}
                        >
                          {s.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">{s.description}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-xs',
                          rs === 'active' ? 'font-semibold text-brand-600' : 'text-neutral-500',
                        )}
                      >
                        {ROW_STATUS_LABEL[rs]}
                      </span>
                    </li>
                  )
                })}
              </ol>

              <p className="mt-6 text-center text-xs text-neutral-500">
                <span className="text-brand-600">이미지 1장 업로드 완료</span>
                <span aria-hidden className="mx-2">
                  ·
                </span>
                요구사항 반영 중
              </p>
            </div>
          </>
        )}
      </Card>

      {!failed && (
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold">
            잠시만 기다려 주세요. 완료되면 결과를 보여드릴게요.
          </p>
          <p className="mt-1.5 text-xs text-neutral-500">
            생성이 끝날 때까지 이 화면을 유지해 주세요.
          </p>
        </div>
      )}
    </>
  )
}
