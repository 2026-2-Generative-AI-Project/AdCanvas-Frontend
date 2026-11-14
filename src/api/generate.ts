import { request } from '@/api/client'

// ⚠️ 임시 형식: AdCanvas/ImageGeneration/adgen.py의 Config(image, prompt, ratio, backend)에 맞췄다.
// 백엔드 HTTP API 스펙이 정해지면 경로와 필드를 수정한다.

export type AspectRatio = '1:1' | '4:5' | '9:16'
export type GenerationBackend = 'mock' | 'sdxl' | 'openai'

export interface GenerateRequest {
  image: File
  prompt: string
  ratio: AspectRatio
  backend?: GenerationBackend
}

export interface GenerateResponse {
  /** 생성된 이미지 URL 또는 data URL */
  imageUrl: string
}

export function generateAd({
  image,
  prompt,
  ratio,
  backend = 'mock',
}: GenerateRequest): Promise<GenerateResponse> {
  const body = new FormData()
  body.append('image', image)
  body.append('prompt', prompt)
  body.append('ratio', ratio)
  body.append('backend', backend)

  return request<GenerateResponse>('/generate', { method: 'POST', body })
}
