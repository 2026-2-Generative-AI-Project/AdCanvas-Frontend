# AdCanvas-Frontend

AdCanvas의 프론트엔드 레포지토리입니다. 음식 사진과 배경 프롬프트를 받아, 음식은 그대로 두고 배경만 생성한 광고 이미지(1:1, 4:5, 9:16)를 만들어 줍니다.

## 시작하기

Node 22가 필요합니다 (`nvm use`로 맞출 수 있어요).

```bash
git clone https://github.com/2026-2-Generative-AI-Project/AdCanvas-Frontend.git
cd AdCanvas-Frontend
npm install
cp .env.example .env   # 백엔드 주소 설정 (아래 참고)
npm run dev            # http://localhost:5173
```

### 백엔드 연결

개발 서버는 `/api`로 시작하는 요청을 `.env`의 `VITE_API_PROXY_TARGET`으로 넘깁니다.
Colab에서 백엔드를 띄웠다면 ngrok 주소를 넣으면 됩니다.

```env
VITE_API_PROXY_TARGET=https://xxxx.ngrok-free.app
```

> 백엔드(`AdCanvas/ImageGeneration/adgen.py`)에는 아직 HTTP API가 없습니다. `src/api/generate.ts`의 요청 형식은 임시입니다.

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
├── api/              # 백엔드 호출 (client.ts의 request()를 거침)
├── components/
│   └── layout/       # 공통 레이아웃 (헤더 등)
├── lib/              # 유틸 함수
├── pages/            # 라우트 단위 페이지
├── router.tsx        # 라우트 정의
├── index.css         # Tailwind + 테마 (brand 색상, Pretendard 폰트)
└── main.tsx
```

- import는 `@/` 별칭을 씁니다. (예: `import { cn } from '@/lib/cn'`)
- 스타일은 Tailwind 유틸리티로 작성하고, 브랜드 색은 `brand-*`(예: `bg-brand-500`)를 씁니다.
- VS Code를 쓴다면 추천 확장(Prettier, Oxc, Tailwind CSS)을 설치해 주세요. 저장 시 자동 포맷됩니다.
