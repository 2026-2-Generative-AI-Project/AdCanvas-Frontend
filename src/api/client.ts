const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** .env의 VITE_API_MOCK=true면 백엔드를 호출하지 않고 src/api/mock.ts의 가짜 응답을 쓴다 */
export const isMockApi = import.meta.env.VITE_API_MOCK === 'true'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** 에러 응답 본문에서 사용자에게 보여줄 메시지를 꺼낸다. 서버는 { message } 형식으로 보낸다. */
function readErrorMessage(text: string): string {
  try {
    const data: unknown = JSON.parse(text)
    if (data && typeof data === 'object') {
      const { message, detail } = data as { message?: unknown; detail?: unknown }
      if (typeof message === 'string') return message
      if (typeof detail === 'string') return detail // FastAPI 기본 에러 형식
    }
  } catch {
    // JSON이 아니면 아래에서 처리
  }
  // ngrok 에러 페이지 같은 HTML은 화면에 보여주지 않는다
  return text.trimStart().startsWith('<') ? '' : text.slice(0, 200)
}

/** 모든 백엔드 호출은 이 함수를 거친다. 응답은 JSON으로 파싱한다. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  // ngrok 무료 플랜의 경고 페이지를 건너뛴다 (VITE_API_BASE_URL로 직접 호출하는 경우)
  headers.set('ngrok-skip-browser-warning', 'true')

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, readErrorMessage(text) || res.statusText)
  }
  return (await res.json()) as T
}
