import { useRef, useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { usePreviewUrl } from '@/lib/usePreviewUrl'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)}KB`
    : `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

interface ImageUploaderProps {
  file: File | null
  onChange: (file: File | null) => void
  /** 폼 검증 에러 (예: 이미지를 안 올림) */
  error?: string | null
}

export default function ImageUploader({ file, onChange, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const previewUrl = usePreviewUrl(file)

  function select(next: File | undefined) {
    if (!next) return
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setFileError('JPG, PNG, WEBP 이미지만 올릴 수 있어요.')
      return
    }
    if (next.size > MAX_SIZE) {
      setFileError('10MB 이하의 이미지만 올릴 수 있어요.')
      return
    }
    setFileError(null)
    onChange(next)
  }

  const dragHandlers = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      select(e.dataTransfer.files[0])
    },
  }

  const openPicker = () => inputRef.current?.click()
  const message = fileError ?? error

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-label="상품 이미지 선택"
        onChange={(e) => {
          select(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {file && previewUrl ? (
        <div
          {...dragHandlers}
          className={cn(
            'overflow-hidden rounded-xl border border-neutral-200',
            dragging && 'ring-2 ring-brand-400',
          )}
        >
          <img
            src={previewUrl}
            alt="업로드한 상품 이미지"
            className="aspect-square w-full bg-neutral-100 object-contain"
          />
          <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-3">
            <p className="min-w-0 text-xs text-neutral-500">
              <span className="block truncate font-medium text-neutral-800">{file.name}</span>
              {formatSize(file.size)}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" className="h-9 px-3 text-xs" onClick={openPicker}>
                교체하기
              </Button>
              <Button
                variant="secondary"
                className="h-9 px-3 text-xs text-red-600"
                onClick={() => onChange(null)}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...dragHandlers}
          className={cn(
            'flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            dragging ? 'border-brand-500 bg-brand-100' : 'border-brand-200 bg-brand-50/60',
            message && !dragging && 'border-red-300',
          )}
        >
          <span aria-hidden className="text-3xl text-brand-600">
            ↑
          </span>
          <p className="mt-4 text-sm font-semibold">이미지를 여기에 끌어다 놓으세요</p>
          <p className="mt-1.5 text-xs text-neutral-500">또는 아래 버튼으로 직접 선택해 주세요.</p>
          <Button className="mt-5" onClick={openPicker}>
            이미지 선택하기
          </Button>
          <p className="mt-4 text-xs text-neutral-400">JPG, PNG, WEBP · 파일당 최대 10MB</p>
        </div>
      )}

      {message && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  )
}
