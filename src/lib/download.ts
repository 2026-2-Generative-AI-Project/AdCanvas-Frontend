/** data URL 또는 이미지 URL에서 형식(PNG, JPEG 등)을 추측한다. */
export function getImageFormat(url: string): string {
  const match = /^data:image\/([a-z+]+)/i.exec(url) ?? /\.([a-z0-9]+)(?:[?#]|$)/i.exec(url)
  const ext = match?.[1].toLowerCase()
  if (!ext) return 'PNG'
  return ext === 'jpg' ? 'JPEG' : ext.toUpperCase()
}

/** 다른 출처의 URL도 저장되도록 blob으로 받아서 내려받는다. */
export async function downloadImage(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`이미지를 받지 못했어요 (${res.status})`)
  const objectUrl = URL.createObjectURL(await res.blob())

  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
