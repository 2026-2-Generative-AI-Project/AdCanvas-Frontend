import { request } from '@/api/client'
import { mockGenerateAd } from '@/api/mock'

// 임시 형식: AdCanvas/ImageGeneration/adgen.py의 Config(image, prompt, ratio, backend)를 기준으로
// 화면에서 받는 값(상품명, 가게명, 대상 고객, 분위기)을 더했다.
// 백엔드 HTTP API 스펙이 정해지면 경로와 필드를 수정한다.

export type AspectRatio = '1:1' | '4:5' | '9:16'
export type GenerationBackend = 'mock' | 'sdxl' | 'openai'
export type Mood = 'auto' | 'clean' | 'emotional' | 'luxury' | 'lively'

export interface GenerateRequest {
  image: File
  productName: string
  storeName?: string
  /** 광고 요구사항. adgen.py의 prompt에 해당 */
  prompt: string
  target?: string
  mood: Mood
  ratio: AspectRatio
  backend?: GenerationBackend
}

export interface AdCopy {
  headline: string
  body: string
  hashtags: string[]
}

export interface GenerateResponse {
  /** 생성된 이미지 URL 또는 data URL */
  imageUrl: string
  copy: AdCopy
}

/** .env의 VITE_API_MOCK=true면 백엔드를 호출하지 않는다 */
export const isMockApi = import.meta.env.VITE_API_MOCK === 'true'

export function generateAd(req: GenerateRequest): Promise<GenerateResponse> {
  if (isMockApi) return mockGenerateAd(req)

  const body = new FormData()
  body.append('image', req.image)
  body.append('product_name', req.productName)
  if (req.storeName) body.append('store_name', req.storeName)
  body.append('prompt', req.prompt)
  if (req.target) body.append('target', req.target)
  body.append('mood', req.mood)
  body.append('ratio', req.ratio)
  body.append('backend', req.backend ?? 'mock')

  return request<GenerateResponse>('/generate', { method: 'POST', body })
}
