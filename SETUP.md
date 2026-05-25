# AI-Synapse-Wiki — 개발 환경

## 문서

- [prd.md](./prd.md) — 제품 요구사항 (로컬 마크다운, 단일 소스)
- [plan.md](./plan.md) — 실행 계획·PoC 체크리스트
- 원본 Google Docs: `Ai-Synapse Wiki 제품 요구사항 정의서 (prd.md).gdoc`

### Google Docs → 로컬 동기화

Drive의 `.gdoc`는 클라우드 전용 포인터라 에이전트가 본문을 읽지 못할 수 있습니다.

1. Google Docs에서 문서를 연다.
2. **파일 → 다운로드 → 일반 텍스트(.txt)** 또는 **Markdown(.md)** (가능한 경우).
3. 내용을 `prd.md`에 반영하거나, diff 후 `prd.md`의 **§10 변경 이력**을 갱신한다.

또는 브라우저에서 (문서 ID가 `DOCUMENT_ID`일 때):

```text
https://docs.google.com/document/d/DOCUMENT_ID/export?format=txt
```

## 관련 폴더

| 경로 | 역할 |
|------|------|
| `../Ai-Synapse/` | 수집·리포트 생성 (GPTeas Synapse, 허브 발견 등) |
| `./docs/` | 위키 엔트리 (정리·연결) |
| `./export/notebooklm/` | NotebookLM 업로드용 묶음 |

## npm / node_modules (Google Drive)

`G:\내 드라이브\...` 에서 `npm install`은 Drive 동기화 때문에 실패할 수 있습니다.

**권장:** 로컬 NTFS 경로에서 설치·빌드

```powershell
# 예: 캐시에 설치 후 로컬 미러에서 dev/build
$cache = "$env:USERPROFILE\.cache\ai-synapse-wiki"
cd $cache; npm install
```

`docs/` 수정 후 **`node scripts/build-entries.mjs`** 는 Drive에서도 동작합니다 (npm 의존성 없음).

웹 UI 개발·`npm test`·`npm run build` 는 `C:\Users\USER\.cursor\projects\ai-synapse-wiki-local` 등 **로컬 복제본**에서 실행하거나, 프로젝트를 Drive 밖으로 옮기세요.

## 관리 잠금 (Phase 7-E)

로컬에서 `/admin` 과 쓰기 API를 쓰려면 프로젝트 루트에 `.env` 를 만듭니다 (`.env.example` 참고).

```env
VITE_ADMIN_ENABLED=true
VITE_ADMIN_PIN=1234   # 선택 — 없으면 PIN 없이 관리 가능
```

- `VITE_ADMIN_ENABLED` 가 없거나 `false` 이면 사용자 Wiki만 보이고 **관리** 링크도 숨깁니다.
- PIN을 설정하면 `/admin` 진입 시 한 번 입력하며, 세션(`sessionStorage`) 동안 유지됩니다.
- dev 서버의 `POST /api/admin/*` 도 같은 env·`X-Wiki-Admin-Pin` 헤더로 보호됩니다.

`.env` 는 git에 올리지 마세요.

### 자연어 주제 등록

관리 → **자연어 등록** (`/admin/topics/nl`): 「헤르메스 에이전트 등록해줘」처럼 입력하면 Wiki 포맷 초안을 만든 뒤 확인·발행합니다.

- API 키 없음: Hermes 등 일부는 규칙·`docs/HERMES.md` 기반 초안
- 선택: `WIKI_TOPIC_LLM_API_KEY` (Gemini) — 다른 주제도 LLM 초안

## 로컬 검색 (plan PoC-0.6)

```powershell
# 웹 UI
npm run dev
# → http://localhost:5173/search?q=rag

# 터미널
rg -i "rag" docs/
```

## Synapse → Wiki 이관 (plan 5.3)

1. `../Ai-Synapse/`에 새 `*_YYYY-MM-DD.md` 확인
2. `docs/hubs/` 또는 `docs/stories/`에 front matter 포함 MD 추가
3. `npm run build:entries` → `npm run dev`로 라우트 확인
4. (선택) `npm run build:export` — NotebookLM 묶음

## Hermes (Gmail 완료 알림)

```powershell
npm run hermes:register
npm run notify
```

동작 설명: [docs/HERMES.md](./docs/HERMES.md)

## Git (선택)

```powershell
cd "G:\내 드라이브\VibeCoding\AI-Synapse-Wiki"
git init
```

`.gitignore`: `node_modules/`, `dist/`, `*.gdoc`, `src/data/entries.json`
