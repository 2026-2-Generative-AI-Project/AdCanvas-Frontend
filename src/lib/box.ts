import type { CSSProperties } from 'react'

/** 원본 사진 픽셀 좌표 [x0, y0, x1, y1] (정수, x0 < x1, y0 < y1) */
export type Box = [number, number, number, number]

export interface Size {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

/** 원본 기준 한 변이 이보다 짧은 박스는 무시한다 */
export const MIN_BOX_SIDE = 20

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * 화면에 표시된 사진 위의 포인터 위치를 원본 사진 픽셀 좌표로 바꾼다.
 * natural은 img.naturalWidth / naturalHeight (브라우저가 EXIF 회전을 적용한 크기).
 */
export function toNaturalPoint(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  natural: Size,
): Point {
  return {
    x: clamp((clientX - rect.left) / rect.width, 0, 1) * natural.width,
    y: clamp((clientY - rect.top) / rect.height, 0, 1) * natural.height,
  }
}

/** 두 점을 감싸는 원본 기준 정수 박스를 만든다. */
export function toBox(a: Point, b: Point, natural: Size): Box {
  return [
    Math.max(0, Math.floor(Math.min(a.x, b.x))),
    Math.max(0, Math.floor(Math.min(a.y, b.y))),
    Math.min(natural.width, Math.ceil(Math.max(a.x, b.x))),
    Math.min(natural.height, Math.ceil(Math.max(a.y, b.y))),
  ]
}

export function isBoxTooSmall([x0, y0, x1, y1]: Box): boolean {
  return x1 - x0 < MIN_BOX_SIDE || y1 - y0 < MIN_BOX_SIDE
}

/** 사진 위에 박스를 겹쳐 그리기 위한 위치 (사진 크기에 대한 %) */
export function boxStyle([x0, y0, x1, y1]: Box, natural: Size): CSSProperties {
  return {
    left: `${(x0 / natural.width) * 100}%`,
    top: `${(y0 / natural.height) * 100}%`,
    width: `${((x1 - x0) / natural.width) * 100}%`,
    height: `${((y1 - y0) / natural.height) * 100}%`,
  }
}
