import { useEffect, useState } from 'react'

/** 이미지 File을 미리보기용 data URL로 읽는다. 읽는 동안이나 file이 없으면 null. */
export function usePreviewUrl(file: File | null): string | null {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview({ file, url: reader.result as string })
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  return preview && preview.file === file ? preview.url : null
}
