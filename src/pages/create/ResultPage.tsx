import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { isMockApi } from '@/api/generate'
import PageHeader from '@/components/PageHeader'
import Stepper from '@/components/Stepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCreateAd } from '@/contexts/CreateAdContext'
import { getPlacement } from '@/lib/adOptions'
import { cn } from '@/lib/cn'
import { downloadImage, getImageFormat } from '@/lib/download'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const ASPECT_CLASS = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5] max-w-md',
  '9:16': 'aspect-[9/16] max-w-xs',
} as const

export default function ResultPage() {
  useDocumentTitle('AdCanvas · 광고 완성')
  const navigate = useNavigate()
  const { form, status, result, reset } = useCreateAd()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (status !== 'success' || !form || !result) return <Navigate to="/create" replace />

  const placement = getPlacement(form.placement)
  const format = getImageFormat(result.imageUrl)
  const { imageUrl, copy } = result
  const { headline, body, hashtags } = copy
  const fileName = `adcanvas-${form.productName.trim().replace(/\s+/g, '-') || 'ad'}.${format.toLowerCase()}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${headline}\n\n${body}\n\n${hashtags.join(' ')}`)
      setActionError(null)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setActionError('문구를 복사하지 못했어요. 직접 선택해서 복사해 주세요.')
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadImage(imageUrl, fileName)
      setActionError(null)
    } catch (err) {
      console.error(err)
      setActionError('이미지를 내려받지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setDownloading(false)
    }
  }

  function handleRestart() {
    reset()
    navigate('/create')
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: '홈', to: '/' },
          { label: '나만의 광고 만들기', to: '/create' },
          { label: '광고 완성' },
        ]}
        title="우리 가게만의 광고가 완성됐어요!"
        description="완성된 이미지와 문구를 확인하고, 원하는 채널에 활용해 보세요."
        aside={<Stepper steps={['정보 입력 완료', '생성 완료', '광고 완성']} current={2} />}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-4">
          <div className="flex items-center justify-between px-1 pt-1 pb-4">
            <h2 className="font-bold">완성된 광고 이미지</h2>
            {isMockApi && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-700">
                예시 결과
              </span>
            )}
          </div>
          <div
            className={cn(
              'mx-auto w-full overflow-hidden rounded-xl bg-neutral-100',
              ASPECT_CLASS[placement.ratio],
            )}
          >
            <img
              src={result.imageUrl}
              alt={`${form.productName} 광고 이미지`}
              className="size-full object-cover"
            />
          </div>
          <div className="flex justify-between px-1 pt-4 pb-1 text-xs text-neutral-500">
            <span>
              {placement.label} · {placement.shape} {placement.ratio}
            </span>
            <span>{format}</span>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-brand-600">생성 완료</p>
          <h2 className="mt-4 text-xl leading-snug font-bold">
            이미지와 함께 사용할
            <br />
            광고 문구도 준비했어요.
          </h2>

          <dl className="mt-5 space-y-2 rounded-xl bg-neutral-50 p-4 text-xs">
            {form.storeName.trim() && (
              <div className="flex gap-4">
                <dt className="w-10 shrink-0 text-neutral-500">가게명</dt>
                <dd className="font-semibold">{form.storeName}</dd>
              </div>
            )}
            <div className="flex gap-4">
              <dt className="w-10 shrink-0 text-neutral-500">상품명</dt>
              <dd className="font-semibold">{form.productName}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-5">
            <h3 className="text-sm font-semibold">추천 광고 문구</h3>
            <Button variant="secondary" className="h-10 px-4 text-xs" onClick={handleCopy}>
              {copied ? '복사했어요' : '문구 복사'}
            </Button>
          </div>
          <p className="mt-4 text-lg font-bold">{headline}</p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-neutral-700">
            {body}
          </p>
          <p className="mt-3 text-xs text-brand-600">{hashtags.join(' ')}</p>

          <Button className="mt-6 h-12 w-full" onClick={handleDownload} disabled={downloading}>
            {downloading ? '내려받는 중…' : '광고 이미지 다운로드'}
          </Button>
          <p className="mt-2.5 text-center text-xs text-neutral-500">
            이미지를 저장하고, 문구를 복사해 함께 사용하세요.
          </p>
          {actionError && (
            <p role="alert" className="mt-2 text-center text-xs text-red-600">
              {actionError}
            </p>
          )}

          <div className="mt-6 rounded-xl bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-700">게시 전 한 번만 확인해 주세요</p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">
              가게명과 상품 정보가 정확한지 확인해 주세요.
              <br />
              완성된 광고는 다운로드 후 직접 게시할 수 있어요.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="secondary" className="h-12 px-10" onClick={handleRestart}>
          처음으로
        </Button>
        <p className="mt-3 text-xs text-neutral-500">
          새로운 상품으로 광고를 만들고 싶다면 처음부터 시작해 보세요.
        </p>
      </div>
    </>
  )
}
