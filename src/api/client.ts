const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 모든 백엔드 호출은 이 함수를 거친다. 응답은 JSON으로 파싱한다. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  // ngrok 무료 플랜의 경고 페이지를 건너뛴다 (VITE_API_BASE_URL로 직접 호출하는 경우)
  headers.set('ngrok-skip-browser-warning', 'true')

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || res.statusText)
  }
  return (await res.json()) as T
}
