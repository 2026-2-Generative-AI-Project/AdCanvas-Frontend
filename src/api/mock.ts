import { ApiError } from '@/api/client'
import type { GenerateRequest, GenerateResponse } from '@/api/generate'

const MOCK_DELAY_MS = 7000
/** 실제 서버는 누끼 단계에서 실패하므로 정상 생성보다 빨리 422가 온다 */
const MOCK_FAIL_DELAY_MS = 2000
const MOCK_FAIL_KEYWORD = '실패'
const MOCK_NOT_FOUND_MESSAGE = '음식(그릇)을 찾지 못했어요. 음식 위치를 박스로 지정해 주세요.'

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

/**
 * 백엔드 없이 화면 흐름을 확인하기 위한 가짜 응답. 업로드한 사진을 그대로 결과로 돌려준다.
 * 상품명에 '실패'가 들어 있고 박스가 없으면 422(그릇을 못 찾음)를 흉내 낸다.
 */
export async function mockGenerateAd(req: GenerateRequest): Promise<GenerateResponse> {
  if (req.productName.includes(MOCK_FAIL_KEYWORD) && !req.boxes?.length) {
    await wait(MOCK_FAIL_DELAY_MS)
    throw new ApiError(422, MOCK_NOT_FOUND_MESSAGE)
  }

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
