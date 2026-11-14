import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { Mood } from '@/api/generate'
import ImageUploader from '@/components/create/ImageUploader'
import PageHeader from '@/components/PageHeader'
import Stepper from '@/components/Stepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCreateAd } from '@/contexts/CreateAdContext'
import { MOODS, PLACEMENTS, type Placement } from '@/lib/adOptions'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const DESCRIPTION_MAX = 1000

const DESCRIPTION_PLACEHOLDER = `상품의 특징, 홍보 목적, 꼭 담고 싶은 내용을 자유롭게 적어주세요.

예: 제주산 유기농 말차로 만든 신메뉴를 홍보하고 싶어요.
진한 말차 맛과 부드러운 우유의 조화를 강조해 주세요.
신메뉴 출시 기념 20% 할인 문구도 넣고 싶어요.`

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

function SectionTitle({ number, children }: { number: string; children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold">
      <span className="mr-1.5 text-brand-600">{number}</span>
      {children}
    </h2>
  )
}

function FieldError({ children }: { children: ReactNode }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-red-600">{children}</p>
}

export default function CreatePage() {
  useDocumentTitle('AdCanvas · 나만의 광고 만들기')
  const navigate = useNavigate()
  const { form: saved, start } = useCreateAd()

  // '정보 수정하기'로 돌아왔을 때 이전에 입력한 값을 채워 둔다
  const [image, setImage] = useState<File | null>(saved?.image ?? null)
  const [productName, setProductName] = useState(saved?.productName ?? '')
  const [storeName, setStoreName] = useState(saved?.storeName ?? '')
  const [description, setDescription] = useState(saved?.description ?? '')
  const [target, setTarget] = useState(saved?.target ?? '')
  const [mood, setMood] = useState<Mood>(saved?.mood ?? 'auto')
  const [placement, setPlacement] = useState<Placement>(saved?.placement ?? 'feed')
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    image: image ? null : '상품 이미지를 올려주세요.',
    productName: productName.trim() ? null : '상품명을 입력해 주세요.',
    description: description.trim() ? null : '만들고 싶은 광고를 적어주세요.',
  }
  const hasError = Object.values(errors).some(Boolean)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!image || hasError) return

    start({ image, productName, storeName, description, target, mood, placement })
    navigate('/create/generating')
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: '홈', to: '/' }, { label: '나만의 광고 만들기' }]}
        title="나만의 광고 만들기"
        description="상품 사진과 아이디어를 알려주세요. 우리 브랜드에 맞는 광고를 함께 만들어요."
        aside={<Stepper steps={['정보 입력', '전략 추천', '광고 완성']} current={0} />}
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)]"
      >
        <Card>
          <SectionTitle number="01">상품 이미지</SectionTitle>
          <p className="mt-2 mb-5 text-sm text-neutral-500">
            광고의 주인공이 될 상품 사진을 올려주세요.
          </p>

          <ImageUploader file={image} onChange={setImage} error={submitted ? errors.image : null} />

          <div className="mt-5 text-xs text-neutral-500">
            <p className="font-semibold text-neutral-800">이미지는 한 장만 업로드할 수 있어요.</p>
            <p className="mt-1.5 leading-relaxed">
              업로드한 이미지로 광고를 만들어요.
              <br />
              이미지는 업로드 후 교체하거나 삭제할 수 있어요.
            </p>
          </div>

          <div className="mt-5 rounded-xl bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-700">좋은 사진이 좋은 광고를 만들어요</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-neutral-700">
              <li>상품이 선명하게 보이는 사진</li>
              <li>배경이 단순하고 밝은 사진</li>
              <li>상품의 다양한 각도가 담긴 사진</li>
            </ul>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            직접 촬영했거나 사용 권한이 있는 이미지만 업로드해 주세요.
          </p>
        </Card>

        <Card>
          <SectionTitle number="02">광고 요구사항</SectionTitle>
          <p className="mt-2 text-sm text-neutral-500">
            알리고 싶은 내용을 구체적으로 적을수록 더 잘 맞는 광고를 제안해요.
          </p>
          <p className="mt-3 text-xs text-brand-600">* 필수 입력</p>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="productName" className="text-sm font-semibold">
                  상품명 <span className="text-brand-600">*</span>
                </label>
                <input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 제주 유기농 말차 라떼"
                  aria-invalid={submitted && !!errors.productName}
                  className={cn(
                    inputClass,
                    'mt-2 h-12',
                    submitted && errors.productName && 'border-red-300',
                  )}
                />
                <FieldError>{submitted && errors.productName}</FieldError>
              </div>
              <div>
                <label htmlFor="storeName" className="text-sm font-semibold">
                  가게명
                </label>
                <input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="예: 그린모먼트"
                  className={cn(inputClass, 'mt-2 h-12')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-semibold">
                어떤 광고를 만들고 싶으세요? <span className="text-brand-600">*</span>
              </label>
              <div
                className={cn(
                  'mt-2 rounded-xl border border-neutral-200 bg-white transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100',
                  submitted && errors.description && 'border-red-300',
                )}
              >
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={DESCRIPTION_PLACEHOLDER}
                  maxLength={DESCRIPTION_MAX}
                  rows={6}
                  aria-invalid={submitted && !!errors.description}
                  className="block w-full resize-none rounded-xl bg-transparent px-4 pt-3 text-sm leading-relaxed outline-none placeholder:text-neutral-400"
                />
                <p className="px-4 pb-3 text-right text-xs text-neutral-400">
                  {description.length.toLocaleString()} / {DESCRIPTION_MAX.toLocaleString()}
                </p>
              </div>
              <FieldError>{submitted && errors.description}</FieldError>
            </div>

            <div>
              <label htmlFor="target" className="text-sm font-semibold">
                대상 고객
              </label>
              <input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="예: 건강한 음료를 즐기는 20~30대 직장인"
                className={cn(inputClass, 'mt-2 h-12')}
              />
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">원하는 분위기</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOODS.map((option) => (
                  <label
                    key={option.value}
                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:font-semibold has-checked:text-brand-700 has-focus-visible:ring-2 has-focus-visible:ring-brand-300"
                  >
                    <input
                      type="radio"
                      name="mood"
                      value={option.value}
                      checked={mood === option.value}
                      onChange={() => setMood(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">광고를 사용할 곳</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {PLACEMENTS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-700 has-focus-visible:ring-2 has-focus-visible:ring-brand-300"
                  >
                    <input
                      type="radio"
                      name="placement"
                      value={option.value}
                      checked={placement === option.value}
                      onChange={() => setPlacement(option.value)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="size-3.5 shrink-0 rounded-full border border-neutral-300 bg-white peer-checked:border-4 peer-checked:border-brand-600"
                    />
                    {option.label} · {option.ratio}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm font-semibold">다음 단계에서는 AI가 광고 전략을 추천해요.</p>
              <p className="mt-1 text-xs text-neutral-500">
                추천받은 방향을 확인하고, 이미지와 문구를 만들 수 있어요.
              </p>
            </div>

            <div>
              <Button type="submit" className="h-12 w-full sm:w-auto sm:px-8">
                광고 전략 추천받기 →
              </Button>
              {submitted && hasError && (
                <p role="alert" className="mt-2 text-xs text-red-600">
                  필수 항목을 모두 입력해 주세요.
                </p>
              )}
            </div>
          </div>
        </Card>
      </form>

      <p className="mt-6 text-xs text-neutral-400">
        입력한 상품 정보와 이미지는 광고 제작을 위해 사용됩니다. 민감한 개인정보는 입력하지 마세요.
      </p>
    </>
  )
}
