# AdCanvas-Frontend

AdCanvas의 프론트엔드 레포지토리입니다. 음식 사진과 배경 프롬프트를 받아, 음식은 그대로 두고 배경만 생성한 광고 이미지(인스타그램 피드 1:1, 스토리 9:16, 블로그 4:5)와 광고 문구를 만들어 줍니다.

## 시작하기

Node 22가 필요합니다 (`nvm use`로 맞출 수 있어요).

```bash
git clone https://github.com/2026-2-Generative-AI-Project/AdCanvas-Frontend.git
cd AdCanvas-Frontend
npm install
cp .env.example .env   # 백엔드 주소 설정 (아래 참고)
npm run dev            # http://localhost:5173
```

### 백엔드 없이 화면 확인하기

`.env`에 `VITE_API_MOCK=true`(기본값)로 두면 백엔드를 호출하지 않고 가짜 응답을 씁니다.
약 7초 뒤 업로드한 사진이 그대로 결과 화면에 나오고, 결과 이미지에 "예시 결과" 배지가 붙습니다.

- 상품명에 "실패"를 넣으면 그릇을 못 찾은 경우(422)를 흉내 내서 박스 지정 화면(`/create/boxes`)으로 갑니다. 박스를 그려 다시 만들면 정상 결과가 나옵니다.

### 백엔드 연결

`VITE_API_MOCK=false`로 바꾸면 실제 백엔드를 호출합니다. 개발 서버는 `/api`로 시작하는 요청을 `.env`의 `VITE_API_PROXY_TARGET`으로 넘깁니다.
Colab에서 백엔드를 띄웠다면 ngrok 주소를 넣으면 됩니다.

```env
VITE_API_PROXY_TARGET=https://xxxx.ngrok-free.app
```

배포 사이트처럼 프록시 없이 서버를 바로 부를 때는 `VITE_API_BASE_URL`에 ngrok 주소를 넣습니다. Vercel에서는 환경변수를 바꾼 뒤 다시 배포해야 반영됩니다.

#### `POST /generate` (multipart/form-data)

| 필드                                                          | 설명                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `image`, `product_name`, `prompt`, `mood`, `ratio`, `backend` | 항상 보냄                                                                   |
| `store_name`, `target`                                        | 입력했을 때만 보냄                                                          |
| `boxes`                                                       | **그릇 다시 지정**에서 박스를 그렸을 때만 보냄. 없으면 서버가 자동으로 찾음 |

- 응답: `{ imageUrl, copy: { headline, body, hashtags } }`
- `boxes`: JSON 문자열 `"[[x0,y0,x1,y1], [x0,y0,x1,y1], ...]"`. 박스 하나는 **원본 사진 픽셀 좌표**(정수, x0 < x1, y0 < y1)입니다.
  - 브라우저와 서버 모두 EXIF 회전을 적용한 크기(`img.naturalWidth` / `naturalHeight`) 기준입니다.
  - 박스가 있으면 자동 선택은 쓰지 않고, 박스 안의 음식만 남깁니다.
- 음식(그릇)을 못 찾으면 `422` + `{ message }`로 응답해 주세요. 프론트는 박스 지정 화면(`/create/boxes`)으로 가서 이 메시지를 보여 줍니다.

광고 만들기 흐름: `/create`(정보 입력) → `/create/generating` → `/create/result`. 결과 화면의 **그릇 다시 지정** 또는 422 응답이면 → `/create/boxes` → 다시 생성.

> `src/api/generate.ts`의 요청 형식은 백엔드(AdCanvas 메인 노트북 5번 셀)와 맞춘 임시 형식입니다.

## 명령어

| 명령                   | 설명                      |
| ---------------------- | ------------------------- |
| `npm run dev`          | 개발 서버 실행            |
| `npm run build`        | 타입 검사 + 프로덕션 빌드 |
| `npm run preview`      | 빌드 결과 미리보기        |
| `npm run lint`         | oxlint 검사               |
| `npm run format`       | Prettier로 코드 정리      |
| `npm run format:check` | 포맷 검사만               |

PR을 올리기 전에 `lint`, `format:check`, `build`가 통과하는지 확인해 주세요. GitHub Actions에서도 같은 검사를 합니다.

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · oxlint · Prettier

## 폴더 구조

```
src/
├── api/              # 백엔드 호출 (client.ts의 request()를 거침), mock.ts
├── components/
│   ├── layout/       # 공통 레이아웃 (헤더 등)
│   ├── ui/           # Button, Card 등 공통 UI
│   └── create/       # 광고 만들기 화면 전용 컴포넌트
├── contexts/         # 화면 간 공유 상태 (CreateAdContext)
├── lib/              # 유틸 함수, 훅, 선택지 상수
├── pages/            # 라우트 단위 페이지
│   └── create/       # /create → generating → result (→ boxes)
├── router.tsx        # 라우트 정의
├── index.css         # Tailwind + 테마 (brand 색상, Pretendard 폰트)
└── main.tsx
```

- import는 `@/` 별칭을 씁니다. (예: `import { cn } from '@/lib/cn'`)
- 스타일은 Tailwind 유틸리티로 작성하고, 브랜드 색은 `brand-*`(예: `bg-brand-500`)를 씁니다.
- VS Code를 쓴다면 추천 확장(Prettier, Oxc, Tailwind CSS)을 설치해 주세요. 저장 시 자동 포맷됩니다.
