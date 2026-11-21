import type { AspectRatio, Mood } from '@/api/generate'

export const MOODS: { value: Mood; label: string }[] = [
  { value: 'auto', label: 'AI 추천' },
  { value: 'clean', label: '깔끔한' },
  { value: 'emotional', label: '감성적인' },
  { value: 'luxury', label: '고급스러운' },
  { value: 'lively', label: '활기찬' },
]

export type Placement = 'feed' | 'blog' | 'story'

export interface PlacementOption {
  value: Placement
  label: string
  ratio: AspectRatio
  /** 결과 화면에 보여줄 비율 이름 */
  shape: string
}

export const PLACEMENTS: PlacementOption[] = [
  { value: 'feed', label: '인스타그램 피드', ratio: '1:1', shape: '정사각형' },
  { value: 'blog', label: '블로그', ratio: '4:5', shape: '세로형' },
  { value: 'story', label: '스토리', ratio: '9:16', shape: '세로형' },
]

export function getPlacement(value: Placement): PlacementOption {
  return PLACEMENTS.find((p) => p.value === value) ?? PLACEMENTS[0]
}
