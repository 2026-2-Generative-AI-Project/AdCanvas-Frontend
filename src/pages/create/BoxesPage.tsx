import { useRef, useState, type PointerEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import PageHeader from '@/components/PageHeader'
import Stepper from '@/components/Stepper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCreateAd } from '@/contexts/CreateAdContext'
import {
  boxStyle,
  isBoxTooSmall,
  MIN_BOX_SIDE,
  toBox,
  toNaturalPoint,
  type Box,
  type Point,
  type Size,
} from '@/lib/box'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { usePreviewUrl } from '@/lib/usePreviewUrl'

interface Drag {
  pointerId: number
  start: Point
}

export default function BoxesPage() {
  useDocumentTitle('AdCanvas · 그릇 다시 지정')
  const navigate = useNavigate()
  const { form, status, error, result, regenerate, backToResult } = useCreateAd()
  const imageUrl = usePreviewUrl(form?.image ?? null)

  // 이전에 그린 박스가 있으면 이어서 고칠 수 있게 채워 둔다
  const [boxes, setBoxes] = useState<Box[]>(form?.boxes ?? [])
  const [natural, setNatural] = useState<Size | null>(null)
  const [draft, setDraft] = useState<Box | null>(null)
  const [tooSmall, setTooSmall] = useState(false)
  const drag = useRef<Drag | null>(null)

  if (!form) return <Navigate to="/create" replace />

  // 생성에서 422로 들어온 경우 서버 메시지
  const notFoundMessage = status === 'needsBoxes' ? error : null

  function pointFrom(e: PointerEvent<HTMLDivElement>): Point | null {
    if (!natural) return null
    return toNaturalPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect(), natural)
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (drag.current) return // 두 번째 손가락은 무시
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return // 박스의 × 버튼
    const p = pointFrom(e)
    if (!p || !natural) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { pointerId: e.pointerId, start: p }
    setDraft(toBox(p, p, natural))
    setTooSmall(false)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== e.pointerId) return
    const p = pointFrom(e)
    if (!p || !natural) return
    setDraft(toBox(drag.current.start, p, natural))
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (current?.pointerId !== e.pointerId) return
    drag.current = null
    setDraft(null)
    const p = pointFrom(e)
    if (!p || !natural) return

    const next = toBox(current.start, p, natural)
    if (isBoxTooSmall(next)) {
      // 그냥 탭/클릭한 경우(거의 안 움직임)는 안내 없이 무시
      setTooSmall(next[2] - next[0] > 2 || next[3] - next[1] > 2)
      return
    }
    setBoxes((prev) => [...prev, next])
  }

  function handlePointerCancel(e: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== e.pointerId) return
    drag.current = null
    setDraft(null)
  }

  function removeBox(index: number) {
    setBoxes((prev) => prev.filter((_, i) => i !== index))
  }

  function handleRegenerate() {
    if (boxes.length === 0) return
    regenerate(boxes)
    navigate('/create/generating')
  }

  function handleCancel() {
    if (result) {
      backToResult()
      navigate('/create/result')
    } else {
      navigate('/create')
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: '홈', to: '/' },
          { label: '나만의 광고 만들기', to: '/create' },
          { label: '그릇 다시 지정' },
        ]}
        title="광고에 넣고 싶은 음식(그릇)을 박스로 감싸 주세요"
        aside={<Stepper steps={['정보 입력 완료', '그릇 지정', '광고 완성']} current={1} />}
      />

      {notFoundMessage && (
        <div role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">{notFoundMessage}</p>
          <p className="mt-1 text-xs">사진 위를 드래그해 음식 위치를 박스로 감싸 주세요.</p>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-4">
          <div className="flex justify-center rounded-xl bg-neutral-100 p-2">
            <div
              className={cn(
                'relative min-w-0 touch-none select-none',
                natural ? 'cursor-crosshair' : 'cursor-wait',
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${form.productName} 사진`}
                  draggable={false}
                  onLoad={(e) =>
                    setNatural({
                      width: e.currentTarget.naturalWidth,
                      height: e.currentTarget.naturalHeight,
                    })
                  }
                  className="block max-h-[70vh] max-w-full rounded-lg"
                />
              ) : (
                <div className="aspect-square w-72 max-w-full animate-pulse rounded-lg bg-neutral-200" />
              )}

              {natural &&
                boxes.map((box, i) => (
                  <div
                    key={`${i}:${box.join(',')}`}
                    className="absolute rounded-sm border-2 border-brand-600 bg-brand-500/15 shadow-[0_0_0_1px_white]"
                    style={boxStyle(box, natural)}
                  >
                    <span
                      aria-hidden
                      className="absolute top-0 left-0 rounded-br-sm bg-brand-600 px-1.5 text-[11px] leading-5 font-semibold text-white"
                    >
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      aria-label={`박스 ${i + 1} 삭제`}
                      onClick={() => removeBox(i)}
                      className="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full bg-white text-base leading-none text-neutral-700 shadow-md ring-1 ring-neutral-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-brand-500"
                    >
                      ×
                    </button>
                  </div>
                ))}

              {natural && draft && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute rounded-sm border-2 border-dashed border-brand-600 bg-brand-500/10"
                  style={boxStyle(draft, natural)}
                />
              )}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            사진 위를 드래그하면 박스가 그려져요. 박스는 여러 개 그릴 수 있어요.
          </p>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <h2 className="font-bold">
              {boxes.length > 0 ? `박스 ${boxes.length}개를 그렸어요` : '아직 그린 박스가 없어요'}
            </h2>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-neutral-500">
              <li>
                남기고 싶은 음식은 모두 박스 안에 있어야 해요. 박스를 그리면 자동 선택은 쓰지
                않아요.
              </li>
              <li>
                여러 그릇은 한 박스로 크게 감싸도 되고, 그릇마다 따로 그려도 돼요. 그릇보다 살짝
                넉넉하게 그려 주세요.
              </li>
            </ul>
            {tooSmall && (
              <p role="alert" className="text-xs text-red-600">
                박스가 너무 작아요. 한 변이 원본 사진 기준 {MIN_BOX_SIDE}px 이상이 되게 그려 주세요.
              </p>
            )}
          </div>

          {boxes.length > 0 && (
            <Button
              variant="secondary"
              className="h-10 w-full text-xs"
              onClick={() => setBoxes([])}
            >
              전체 지우기
            </Button>
          )}

          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <Button
              className="h-12 w-full"
              disabled={boxes.length === 0}
              onClick={handleRegenerate}
            >
              이 영역으로 다시 만들기
            </Button>
            <p className="text-center text-xs text-neutral-500">
              다시 만들면 1~2분이 걸리고 생성 비용이 한 번 더 들어요.
            </p>
            <Button variant="secondary" className="w-full" onClick={handleCancel}>
              취소
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
