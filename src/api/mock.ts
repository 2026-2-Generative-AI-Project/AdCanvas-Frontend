import type { GenerateRequest, GenerateResponse } from '@/api/generate'

const MOCK_DELAY_MS = 7000

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function toHashtag(text: string) {
  return `#${text.replace(/\s+/g, '')}`
}

/** 백엔드 없이 화면 흐름을 확인하기 위한 가짜 응답. 업로드한 사진을 그대로 결과로 돌려준다. */
export async function mockGenerateAd(req: GenerateRequest): Promise<GenerateResponse> {
  const [imageUrl] = await Promise.all([readAsDataUrl(req.image), wait(MOCK_DELAY_MS)])
  const store = req.storeName || '우리 가게'

  return {
    imageUrl,
    copy: {
      headline: `오늘의 작은 여유, ${req.productName}.`,
      body: `${store}에서 정성껏 준비한 ${req.productName}을(를) 만나보세요.\n잠시 쉬어가고 싶은 순간,\n나만의 작은 여유를 선물해 드릴게요.`,
      hashtags: [
        ...(req.storeName ? [toHashtag(req.storeName)] : []),
        toHashtag(req.productName),
        '#오늘의여유',
      ],
    },
  }
}
