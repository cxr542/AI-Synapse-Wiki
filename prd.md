# Product Requirements Document (PRD)

**프로젝트명:** AI-Synapse Wiki (Ai-Synapse Wiki)  
**버전:** v0.1 (초안)  
**최종 수정:** 2026-05-24  
**저장 위치:** Google Drive `VibeCoding/AI-Synapse-Wiki`

> **원본:** `Ai-Synapse Wiki 제품 요구사항 정의서 (prd.md).gdoc`  
> Google Drive에서 `.gdoc` 본문을 직접 읽을 수 없어, 동일 폴더의 `Ai-Synapse` 파이프라인 산출물과 VibeCoding PRD 관례를 바탕으로 로컬 마크다운으로 정리했습니다.  
> Docs 원문과 차이가 있으면 Google Docs 내용을 우선하고, 이 파일을 갱신하세요.

---

## 1. 제품 목적 (Product Vision)

**AI-Synapse Wiki**는 국내외 한글 AI 커뮤니티·미디어·실전 글에서 수집한 지식을 **위키 형태로 구조화**하고, 항목 간 **연결(Synapse)** 을 드러내며, **NotebookLM·에이전트**가 재활용하기 쉬운 형태로 유지하는 **개인/팀 지식 허브**입니다.

- **Synapse:** 출처·주제·도구·프롬프트·후속 글을 링크로 이어 “지식이 퍼지는” 그래프를 만든다.
- **Wiki:** 사람이 읽고 검색할 수 있는 정적/반정적 문서 저장소(마크다운 우선).
- **파이프라인:** `VibeCoding/Ai-Synapse`에서 자동·반자동으로 모은 리포트·허브 목록을 위키 엔트리로 승격한다.

---

## 2. 타겟 사용자 & 페인 포인트

### 타겟

| 구분 | 설명 |
|------|------|
| 1차 | VibeCoding 실험을 하는 본인(개발자·강사) — AI 트렌드·실전 글을 아카이빙 |
| 2차 | 동일 워크스페이스를 쓰는 에이전트(agy, Cursor) — RAG·요약·추천의 컨텍스트 소스 |

### 페인 포인트

1. 지피터스·디스콰이엇 등 **좋은 글이 흩어져** 나중에 다시 찾기 어렵다.
2. NotebookLM에 넣을 **출처 목록·요약본 형식**이 매번 제각각이다.
3. “이 글과 연관된 글/도구”가 머릿속에만 있고 **문서화되지 않는다**.
4. Google Docs PRD만 있고 **로컬 Git·에이전트**와 맞지 않는다.

---

## 3. 제품 목표 & 비목표

### 목표 (v0.1)

- [ ] `prd.md`를 로컬 마크다운 단일 소스로 유지 (본 문서)
- [ ] `docs/` 아래 위키 엔트리(마크다운) 디렉터리 구조 확정
- [ ] `Ai-Synapse` 산출물(`GPTeas_Synapse_*.md`, `Discovered_AI_Hubs_*.txt` 등)을 위키 페이지로 **1차 이관**
- [ ] 엔트리 메타데이터: 제목, 출처 URL, 수집일, 태그, 관련 링크(Synapse)
- [ ] NotebookLM용 **보내기 묶음**(폴더 또는 단일 인덱스 MD) 생성 규칙 정의

### 비목표 (v0.1에서 하지 않음)

- 공개 웹 호스팅·다중 사용자 편집
- 실시간 크롤링 전 사이트(저작권·로봇 정책 미검토)
- 전문 검색 엔진(Elasticsearch 등) — 로컬 grep/에이전트 검색으로 충분
- Google Docs와 양방향 실시간 동기화

---

## 4. 핵심 사용자 시나리오

| ID | 시나리오 | 기대 결과 |
|----|----------|-----------|
| US-1 | 새 AI 허브/글 URL을 발견한다 | `sources/` 또는 Inbox에 메모·URL 등록 |
| US-2 | 주기적으로 Synapse 파이프라인이 리포트를 만든다 | `Ai-Synapse` 출력물이 위키 초안으로 복사·정리됨 |
| US-3 | 위키에서 주제(예: RAG, 프롬프트)로 탐색한다 | 태그·목차·관련 링크로 이동 |
| US-4 | NotebookLM에 소스를 추가한다 | `export/notebooklm/` 등 정해진 형식으로 일괄 제공 |
| US-5 | Cursor/agy로 “최근 RAG 글 요약”을 요청한다 | `docs/` 마크다운을 컨텍스트로 활용 |

---

## 5. 정보 구조 (IA)

```
AI-Synapse-Wiki/
├── prd.md                 # 본 PRD
├── SETUP.md               # Docs 동기화·개발 환경
├── README.md              # 프로젝트 한 줄 소개
├── docs/
│   ├── index.md           # 위키 홈 (목차)
│   ├── hubs/              # AI 소스 기지 (커뮤니티·블로그)
│   ├── stories/           # GPTeas / 지피터스 등 스토리형 엔트리
│   └── topics/            # 주제별 허브 (RAG, 에이전트, 프롬프트 …)
├── inbox/                 # 미정리 클리핑 (URL, 메모)
└── export/
    └── notebooklm/        # NotebookLM 업로드용 묶음
```

**관련 프로젝트:** `../Ai-Synapse/` — 수집·리포트 **생성**  
**본 프로젝트:** `AI-Synapse-Wiki/` — 수집물 **정리·연결·위키화**

---

## 6. 기능 요구사항

### 6.1 문서 & 위키

| ID | 요구사항 | 우선순위 | v0.1 |
|----|----------|----------|------|
| F-1.1 | 모든 공개 위키 페이지는 UTF-8 마크다운 | P0 | ✅ |
| F-1.2 | 엔트리 front matter: `title`, `source_url`, `collected_at`, `tags`, `related` | P0 | ⬜ |
| F-1.3 | `docs/index.md`에서 카테고리별 목차 자동/수동 유지 | P0 | ⬜ |
| F-1.4 | Synapse 링크: `related`에 상대 경로 또는 위키 slug | P1 | ⬜ |

### 6.2 수집 파이프라인 연동

| ID | 요구사항 | 우선순위 | v0.1 |
|----|----------|----------|------|
| F-2.1 | `Ai-Synapse/GPTeas_Synapse_*.md` → `docs/stories/` 이관 규칙 | P0 | ⬜ |
| F-2.2 | `Ai-Synapse/Discovered_AI_Hubs_*.txt` → `docs/hubs/` 이관 규칙 | P0 | ⬜ |
| F-2.3 | 원문 URL·동기화 소스(GPTeas track 등) 메타 보존 | P0 | ✅ (원본에 존재) |
| F-2.4 | `inbox/`에 URL만 넣어도 나중에 엔트리로 승격 가능 | P2 | ⬜ |

### 6.3 NotebookLM보내기

| ID | 요구사항 | 우선순위 | v0.1 |
|----|----------|----------|------|
| F-3.1 | `export/notebooklm/`에 한글 요약·출처 목록이 포함된 MD 세트 | P1 | ⬜ |
| F-3.2 | 파일명·헤딩 규칙으로 NotebookLM 소스 추가 시 혼동 최소화 | P1 | ⬜ |

### 6.4 개발·버전 관리

| ID | 요구사항 | 우선순위 | v0.1 |
|----|----------|----------|------|
| F-4.1 | Git 저장소 초기화 (`.gitignore`에 Drive 임시 파일) | P1 | ⬜ |
| F-4.2 | PRD 변경 시 `prd.md` 상단 `최종 수정` 날짜 갱신 | P2 | ✅ |

---

## 7. 초기 콘텐츠 (Ai-Synapse에서 이관 예정)

### 7.1 스토리 트랙 (`docs/stories/`)

| 제목 | 출처(예시) | 비고 |
|------|------------|------|
| 프롬프트 엔지니어링 최고 권위자의 실전 업무 자동화 가이드 | https://www.gpters.org/p/example1 | GPTeas AI-Stories |
| LLM 에이전트를 활용한 마케팅 콘텐츠 무한 생성 파이프라인 | https://www.gpters.org/p/example2 | 동일 |
| 지피터스 5월 커스텀 GPTs 탑 5 | https://www.gpters.org/p/example3 | 동일 |

> 원문: `../Ai-Synapse/GPTeas_Synapse_2026-05-24.md`

### 7.2 AI 소스 기지 (`docs/hubs/`)

| 이름 | URL | 한 줄 요약 |
|------|-----|------------|
| 디스콰이엇 AI | https://disquiet.io/keyword/ai | 국내 메이커 AI 서비스·회고 |
| 모두의연구소 | https://modulabs.co.kr | 커뮤니티 기반 AI 연구·LLM 가이드 |
| 테디노트 | https://teddylee777.github.io | LangChain·RAG 실전 코드 |
| 긱뉴스 #ai | https://news.hada.io/tags/ai | 국내외 AI 뉴스 큐레이션 |

> 원문: `../Ai-Synapse/Discovered_AI_Hubs_2026-05-24.txt`

---

## 8. 기술 스택 & 제약

| 항목 | 내용 |
|------|------|
| 문서 형식 | Markdown (UTF-8) |
| 저장소 | Google Drive `VibeCoding/AI-Synapse-Wiki` (+ 선택 Git) |
| 편집 | Cursor, agy, 수동 |
| 동기화 | Google Docs PRD는 **참고용**; 구현·에이전트는 **로컬 `prd.md` 우선** |
| 제약 | `.gdoc`는 오프라인 미러 불가 시 본문 미포함 — Docs에서 txt/md보내기 필요 |

---

## 9. 마일스톤

- [ ] **M1:** `prd.md`, `SETUP.md`, `README.md`, `docs/index.md` 정비
- [ ] **M2:** Ai-Synapse 1차 이관 (`hubs/`, `stories/` 각 1페이지 이상)
- [ ] **M3:** front matter·태그 규칙 확정
- [ ] **M4:** `export/notebooklm/` 샘플 묶음 생성
- [ ] **M5:** Git 초기화 및 커밋 정책

---

## 10. 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-05-24 | 0.1 | Google Docs 원본 미동기화 상태에서 로컬 PRD 초안 작성 (Ai-Synapse 산출물 반영) |
