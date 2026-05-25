# Execution Plan (plan.md)

**프로젝트명:** AI-Synapse Wiki v0.1  
**기준 문서:** [prd.md](./prd.md)  
**최종 수정:** 2026-05-24

본 문서는 `prd.md`의 마일스톤(M1~M5)을 **실행 순서·PoC·산출물**로 쪼갠 체크리스트입니다.  
Cursor·agy 에이전트가 단계별로 진행하고, **PoC 통과 후** 본격 이관·확장으로 넘어갑니다.

> Google Docs `plan` 원본이 생기면 [SETUP.md](./SETUP.md) 절차로 `plan.md`에 반영하세요.

---

## 진행 원칙

1. **PoC 먼저** — 가설을 작은 범위(1~3파일)에서 검증한 뒤 전량 이관한다.
2. **로컬 MD 우선** — 구현·에이전트 컨텍스트는 `docs/` 마크다운만 본다.
3. **원본 유지** — `../Ai-Synapse/` 파일은 삭제·이동하지 않고 Wiki에 **복사·정리**한다.
4. **단계 컨펌** — PoC·Phase 완료 시 짧은 회고(통과/보류/폐기)를 § 변경 이력에 남긴다.

---

## Phase 0: PoC — 워크플로 검증 (가설 실험)

> **목표:** “위키 MD + Synapse 링크 + 에이전트/NotebookLM” 조합이 실제로 쓸 만한지 **최소 비용**으로 확인한다.  
> **PRD 대응:** US-3~5, F-1.x, F-3.x 사전 검증

### [ ] PoC-0.1: 최소 위키 슬라이스 (1 hub + 1 story)

- **가설:** 파일 2개만으로도 탐색·메타·출처 추적이 가능하다.
- **작업:**
  - `docs/hubs/teddynote.md` 1개 작성 (front matter 포함)
  - `docs/stories/llm-marketing-pipeline.md` 1개 작성 (원문 URL·GPTeas 소스 유지)
  - `docs/index.md`에 위 2개 링크만 추가
- **성공 기준:**
  - [ ] front matter에 `title`, `source_url`, `collected_at`, `tags` 존재
  - [ ] index에서 클릭(또는 경로)으로 두 파일에 도달 가능
- **산출물:** hub 1, story 1, 갱신된 `docs/index.md`
- **예상 소요:** 30분

### [ ] PoC-0.2: Synapse 링크 (hub ↔ story)

- **가설:** `related` 상대 경로만으로 “연관 지식” 탐색이 된다.
- **작업:**
  - `teddynote.md`의 `related`에 story 경로 추가
  - story 쪽 `related`에 hub 경로 **역링크**
  - (선택) `tags`에 공통 주제 `rag` 부여
- **성공 기준:**
  - [ ] 양방향 `related`가 깨지지 않음 (경로 오타 없음)
  - [ ] agy/Cursor에 “테디노트와 연관된 스토리” 질의 시 두 파일이 컨텍스트로 잡힘
- **산출물:** PoC-0.2 회고 3줄 (`docs/` 또는 `inbox/poc-notes.md`)

### [ ] PoC-0.3: 에이전트 RAG 스모크 테스트 (Cursor / agy)

- **가설:** `docs/`만 열어도 에이전트가 한글 요약·출처를 말할 수 있다.
- **작업:**
  - 워크스페이스 루트를 `AI-Synapse-Wiki`로 연다
  - 프롬프트 예: *「docs에 있는 RAG 관련 허브를 요약하고 source_url을 알려줘」*
  - 동일 질의를 `agy`에서 1회 반복 (선택)
- **성공 기준:**
  - [ ] 허브 이름·한 줄 요약·URL이 **환각 없이** 인용됨
  - [ ] 없는 본문을 “읽었다”고 하지 않음 (카드 수준 콘텐츠 한계 명시)
- **산출물:** 질의·응답 요약을 `inbox/poc-agent-rag-smoke.md`에 기록

### [ ] PoC-0.4: NotebookLM 업로드 스모크

- **가설:** `export/notebooklm/` 묶음 3파일이면 NotebookLM 소스 추가가 실용적이다.
- **작업:**
  - `export/notebooklm/README.md` — 업로드 순서·파일 설명
  - `export/notebooklm/00-index-ko.md` — 허브·스토리 목차 + URL 목록
  - PoC hub·story MD를 복사하거나 symlink 대신 **복사본** 2개
  - NotebookLM 웹에 3파일 업로드 후 질의 1회: *「한글 AI 허브 목록을 요약해줘」*
- **성공 기준:**
  - [ ] 업로드 오류 없음
  - [ ] 답변에 PoC에 넣은 URL·허브명이 포함됨
- **산출물:** `export/notebooklm/` 초기 3파일, PoC 질의/결과 메모

### [ ] PoC-0.5: Inbox → 엔트리 승격

- **가설:** URL만 적어도 나중에 위키 페이지로 올릴 수 있다.
- **작업:**
  - `inbox/2026-05-24-sample-url.md` 생성 (URL + 한 줄 메모)
  - 동일 내용을 `docs/hubs/` 또는 `docs/stories/`로 **승격** (front matter 추가)
  - inbox 파일 상단에 `status: promoted` 표기
- **성공 기준:**
  - [ ] 승격 후 index에 새 링크 반영
  - [ ] inbox에 “처리됨” 추적 가능
- **산출물:** inbox 1건, 승격된 엔트리 1건

### [ ] PoC-0.6: 로컬 검색·태그 탐색

- **가설:** 전문 검색 엔진 없이도 `grep`/에이전트 검색으로 주제 탐색이 된다.
- **작업:**
  - `docs/`에서 `tags` 또는 본문 `RAG` / `에이전트` 키워드 검색
  - (선택) `docs/topics/rag.md` 스텁 — 관련 엔트리 링크만 모은 허브 페이지
- **성공 기준:**
  - [ ] 10초 이내에 관련 파일 목록 도출
  - [ ] topics 스텁이 2개 이상 엔트리를 가리킴
- **산출물:** `docs/topics/rag.md` (선택), 검색 명령 예시를 SETUP.md에 1절 추가

### PoC Phase 완료 게이트

| 항목 | 통과 조건 |
|------|-----------|
| **Go** | PoC-0.1 ~ 0.4 필수 통과, 0.5·0.6 중 1개 이상 통과 |
| **Hold** | NotebookLM만 실패 → export 형식만 수정 후 재시도 |
| **No-Go** | 에이전트가 URL·제목을 반복적으로 환각 → front matter·index 구조 재설계 |

---

## Phase 1: 기반 정비 (M1)

> **PRD:** M1 — `prd.md`, `SETUP.md`, `README.md`, `docs/index.md`  
> **상태:** 문서 골격은 있음 → **폴더·inbox·export 뼈대** 보완

### [x] Step 1.1: 핵심 문서 파일

- **산출물:** `prd.md`, `SETUP.md`, `README.md` ✅

### [ ] Step 1.2: 디렉터리 뼈대 생성

- **작업:**
  - `docs/hubs/`, `docs/stories/`, `docs/topics/`
  - `inbox/`, `export/notebooklm/`
  - 각 폴더에 `.gitkeep` 또는 `_index.md` placeholder
- **산출물:** IA와 일치하는 빈 트리

### [ ] Step 1.3: `docs/index.md` 목차 규칙

- **작업:**
  - 카테고리별 표 + “최근 추가” 섹션
  - PoC에서 검증한 링크 형식을 **표준**으로 고정
- **산출물:** 갱신된 `docs/index.md`

### [ ] Step 1.4: 메타데이터 규칙 문서화

- **작업:** `docs/META.md` — front matter 필드·태그 네이밍·`related` 규칙
- **PRD:** F-1.2, M3 선행 문서
- **산출물:** `docs/META.md`

---

## Phase 2: 콘텐츠 1차 이관 (M2)

> **PRD:** F-2.1, F-2.2, §7 초기 콘텐츠  
> **전제:** Phase 0 **Go**

### [ ] Step 2.1: Hubs 전량 이관 (4건)

| 파일 | 원본 |
|------|------|
| `docs/hubs/disquiet-ai.md` | Discovered_AI_Hubs [1] |
| `docs/hubs/modulabs.md` | [2] |
| `docs/hubs/teddynote.md` | [3] |
| `docs/hubs/geeknews-ai.md` | [4] |

- **산출물:** hub MD 4개, `docs/hubs/_index.md`

### [ ] Step 2.2: Stories 전량 이관 (3건)

| 파일 | 원본 |
|------|------|
| `docs/stories/prompt-engineering-automation.md` | GPTeas §1 |
| `docs/stories/llm-marketing-pipeline.md` | §2 |
| `docs/stories/gpters-custom-gpts-top5.md` | §3 |

- **산출물:** story MD 3개, `docs/stories/_index.md`

### [ ] Step 2.3: index·교차 링크

- **작업:** index 갱신, RAG/에이전트 주제별 `related` 1차 연결
- **산출물:** §7 표와 실제 파일 1:1 대응 확인 체크리스트

---

## Phase 3: Synapse·주제 허브 (M3)

> **PRD:** F-1.4, topics/

### [ ] Step 3.1: 태그 정리

- **작업:** `hub`, `story`, `community`, `rag`, `agent`, `prompt` 화이트리스트
- **산출물:** `docs/META.md` § tags 갱신

### [x] Step 3.2: Topics (Wiki 포맷만 유지)

- **유지:** `harness-engineering.md`, `antigravity-2.md`
- **삭제:** `agents.md`, `prompt-engineering.md`, `rag.md` (스텁·모음형 — Wiki 포맷 불일치)

### [ ] Step 3.3: Synapse 그래프 1차

- **작업:** 스토리↔허브 최소 3쌍 `related` 연결
- **성공 기준:** index → topic → entry 경로가 3홉 이내

---

## Phase 4: NotebookLM·보내기 (M4)

> **PRD:** F-3.1, F-3.2  
> **전제:** PoC-0.4 결과 반영

### [ ] Step 4.1: Export 규칙 고정

- **작업:**
  - 파일명: `NN-slug-ko.md` (00=index, 01~=entities)
  - 헤딩 1줄 요약 + URL 블록 필수
- **산출물:** `export/notebooklm/README.md`

### [ ] Step 4.2: 전체 묶음 생성

- **작업:** hubs 4 + stories 3 + index → `export/notebooklm/` 복사 또는 빌드 스크립트
- **산출물:** MD 8~9개 세트

### [ ] Step 4.3: (PoC+) 자동 빌드 스크립트 — 선택

- **가설:** 수동 복사 없이 `docs/` → `export/` 동기화 가능
- **작업:** PowerShell `scripts/build-notebooklm-export.ps1` — index 생성 + 파일 복사
- **성공 기준:** 스크립트 1회 실행 시 export 폴더 갱신
- **산출물:** `scripts/build-notebooklm-export.ps1`

---

## Phase 5: Git·운영 (M5)

> **PRD:** F-4.1

### [ ] Step 5.1: Git 초기화

- **작업:** `git init`, `.gitignore` (`*.gdoc`, `*.gsheet`, `Thumbs.db`)
- **산출물:** 로컬 저장소

### [ ] Step 5.2: 커밋 정책 (문서만)

- **작업:** `README.md`에 커밋 단위 예시 (PoC 완료 / Phase 완료 / 이관 배치)
- **산출물:** README § Contributing

### [ ] Step 5.3: Ai-Synapse 연동 루틴

- **작업:** 새 `*_YYYY-MM-DD.md` 생성 시 Wiki 이관 체크리스트 (수동 15분)
- **산출물:** `SETUP.md` § “Synapse → Wiki 이관”

---

## Phase 7: 사용자 / 관리자 분리 (v0.2) — 계획

> 상세: [docs/PLAN-USER-ADMIN.md](./docs/PLAN-USER-ADMIN.md)

### 요약

| 영역 | 노출 | 핵심 |
|------|------|------|
| **사용자** `/` | 홈 · **주제** · 검색 | 읽기·Synapse 탐색 |
| **관리** `/admin` | 허브 · Inbox · **주제 등록** · import · build | 수집·승격·발행 |

### [x] Phase 7-A: 내비·라우트 분리 (hubs/inbox → admin)

### [x] Phase 7-B: `visibility` (published / draft / admin)

### [x] Phase 7-C: `/admin/topics/new` 주제 등록 UI

### [x] Phase 7-D: Inbox 승격 · 허브 관리 화면

### [x] Phase 7-E: 로컬 관리자 잠금 (`VITE_ADMIN_ENABLED` · `VITE_ADMIN_PIN`)

---

## Phase 6: v0.1 마감 & 다음 버전 후보

### [ ] Step 6.1: PRD·plan 체크리스트 동기화

- **작업:** `prd.md` §6 표의 v0.1 열을 실제 상태(✅/⬜)로 갱신
- **산출물:** PRD 패치 1회

### [ ] Step 6.2: v0.2 백로그 (문서만)

| 후보 | 설명 |
|------|------|
| B-1 | gpters **실제 URL**로 example1~3 교체 |
| B-2 | 스토리 본문 요약(수동 또는 agy 초안) 추가 |
| B-3 | `Ai-Synapse` → Wiki **반자동** 이관 스크립트 |
| B-4 | 정적 사이트(MkDocs/Docusaurus) PoC |
| B-5 | 주기적 NotebookLM export GitHub Action (Drive 제외 로컬용) |
| B-6 | Phase 7 사용자/관리자 분리 (PLAN-USER-ADMIN.md) |

---

## PRD 마일스톤 매핑

| PRD | plan Phase | 비고 |
|-----|------------|------|
| M1 | Phase 1 | PoC 일부 선행 가능 |
| M2 | Phase 2 | PoC-0.1 성공 후 |
| M3 | Phase 3 | |
| M4 | Phase 4 | PoC-0.4 선행 |
| M5 | Phase 5 | |

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-24 | 0.1 | `prd.md` 기반 초안 작성. Phase 0 PoC 6건 포함 |
