# Wiki 사용자 / 관리자 기능 분리 계획 (v0.2 방향)

**작성:** 2026-05-24  
**상태:** 계획 (미구현)  
**기준:** v0.1 피드백 — “AI 소스 기지·Inbox는 관리”, “주제 등록은 관리에”, “Wiki는 읽기·탐색 중심”

---

## 1. 문제 인식 (v0.1)

| 현상 | 원인 |
|------|------|
| Wiki 같지 않다 | topics는 얇고, stories/hubs는 **수집 파이프라인 카드** |
| 내비가 산만하다 | **허브·Inbox·주제**가 동급 탭으로 노출 |
| 등록이 에이전트 채팅에만 의존 | **관리 UI·워크플로** 없음 |

**결론:** 같은 앱 안에서 **읽는 Wiki(사용자)** 와 **쌓는 도구(관리자)** 를 나눠야 한다.

---

## 2. 역할 정의

### 2.1 사용자 (Reader)

**목표:** “AI 지식을 **주제** 중심으로 읽고, Synapse로 연결을 따라간다.”

| 할 일 | 안 할 일 |
|--------|-----------|
| 주제(topic) 목록·본문 읽기 | 허브 목록 관리 |
| 검색·태그·연관 링크 탐색 | Inbox 클리핑 |
| (선택) 스토리 **발행된** 글 읽기 | Ai-Synapse 이관 |
| NotebookLM export **다운로드/안내**만 | MD 파일 직접 편집 |

### 2.2 관리자 (Curator) — 본인 1인

**목표:** “수집·등록·승격·빌드”를 한곳에서 한다.

| 할 일 |
|--------|
| **주제 등록** (Antigravity 2.0, 하네스 엔지니어링 등) |
| Inbox URL → topic/story/hub **승격** |
| AI 소스 기지(hub) 추가·수정·비공개 |
| 스토리 카드 정리·숨김·실URL 반영 |
| `build-entries` / export / (선택) Hermes 알림 |

> v0.2도 **로컬 1인** 전제. 로그인은 나중(환경 변수·간단 PIN 정도).

---

## 3. 정보 구조 (IA) — Before / After

### Before (v0.1)

```
[홈] [AI소스기지] [스토리] [주제] [Inbox] [검색]   ← 전부 동급
```

### After (v0.2 목표)

```
사용자 영역 (/ )
├── 홈           — 주제 허브, 최근 topic, 검색
├── topics       — 주제 목록·상세 (Wiki 본체)
├── stories      — (선택) 검수 완료 스토리만 노출
└── search

관리 영역 (/admin )
├── 대시보드     — 미처리 inbox 수, 마지막 빌드 시각
├── topics/new   — 주제 등록 (폼 → MD 생성)
├── topics       — 주제 편집·숨김
├── hubs         — AI 소스 기지 관리
├── inbox        — 클리핑·승격
├── stories      — 스토리 검수·publish 플래그
├── import       — Ai-Synapse 이관
└── tools        — build-entries, export, Hermes
```

**데이터 폴더는 유지** (`docs/hubs`, `docs/topics`, `inbox/`).  
바뀌는 것은 **노출·라우트·권한(표시 여부)** 이다.

---

## 4. 콘텐츠 가시성 규칙

front matter에 **`visibility`** 추가 (v0.2):

```yaml
visibility: published   # 사용자에게 표시 (기본: topic만 published)
visibility: admin       # 관리 화면에서만
visibility: draft       # 등록 중, 사용자 비표시
```

| kind | 기본 visibility | 사용자 탭 |
|------|-----------------|-----------|
| **topics** | `published` | ✅ 주제 |
| **stories** | `draft` → 검수 후 `published` | ⚠️ 발행분만 (또는 숨김) |
| **hubs** | `admin` | ❌ (topic 본문 “참고 링크”로만) |
| **inbox** | `admin` | ❌ |

이렇게 하면 **RAG 한 줄 스텁**은 사용자에게 안 보이고, 관리자가 채운 뒤 publish한다.

---

## 5. 라우터 계획

### 사용자 `UserLayout`

| 경로 | 화면 |
|------|------|
| `/` | 홈 — topic 카드, 검색창, Synapse 인기 주제 |
| `/topics` | 발행된 주제만 |
| `/topics/:slug` | 주제 상세 + **관련 주제·스토리**(published만) |
| `/stories` | (선택) published 스토리만 |
| `/search` | published 엔트리만 검색 |

### 관리 `AdminLayout` (`/admin`)

| 경로 | 화면 |
|------|------|
| `/admin` | 대시보드 |
| `/admin/topics/new` | **주제 등록** — 제목, 정의, URL, tags, related |
| `/admin/topics/:slug/edit` | 수정·preview |
| `/admin/hubs` | 허브 목록·추가 |
| `/admin/inbox` | Inbox + 승격 마법사 |
| `/admin/stories` | 스토리 검수·publish |
| `/admin/import` | Ai-Synapse → docs 이관 트리거 |
| `/admin/tools` | build-entries, export, notify |

헤더: 사용자 영역에는 **「관리」** 링크 1개만 (`/admin`).  
관리 영역에는 **「Wiki로 돌아가기」**.

---

## 6. 「안티그래비티 2.0을 등록해줘」— 경로별 동작

| 방식 | v0.1 (지금) | v0.2 (목표) |
|------|-------------|-------------|
| 채팅 | 에이전트가 MD 작성 | 그대로 가능 (관리자 보조) |
| 관리 UI | 없음 | `/admin/topics/new` 폼 제출 → `docs/topics/antigravity-2.md` 생성 → `build-entries` |
| 사용자 Wiki | 등록 직후 `/topics/...` 에 표시 | `visibility: published` 일 때만 |

**관리 UI 폼 필드 (최소):**

- 표시 제목, slug(자동), 한 줄 정의, 본문(마크다운), source_url, tags, related(topic slug 다중 선택)
- 저장 시: MD 쓰기 + `npm run build:entries` (또는 API 스크립트 호출)

---

## 7. 구현 단계 (plan.md 에 추가할 Phase)

### Phase 7-A: 내비·라우트 분리 (MVP)

- [x] `UserLayout` / `AdminLayout` 분리
- [x] 사용자 nav: **홈 · 주제 · 검색** 만
- [x] `/admin` placeholder + hubs/inbox 라우트 이동
- [x] `build-entries` 시 `visibility` 필드 (런타임 `isUserVisible` 필터)

**산출:** 사용자가 hubs/inbox 탭을 보지 않음

### Phase 7-B: visibility + publish

- [x] `docs/META.md` 에 `visibility` 규칙
- [x] 기존 hubs → `admin`, stories → `draft`, topics → `published`
- [x] CategoryPage / EntryPage published 필터

**산출:** 사용자 Wiki가 **topic 중심**으로 보임

### Phase 7-C: 관리 — 주제 등록 UI

- [x] `/admin/topics/new` 폼 + `scripts/write-topic.mjs` (MD 생성)
- [x] 저장 후 `/admin/topics/{slug}` + 사용자 Wiki 링크
- [ ] `docs/WIKI-REGISTER.md` 를 관리 UI 설명으로 링크

**산출:** “등록해줘”를 UI로도 가능

### Phase 7-D: Inbox 승격 · 허브 관리

- [x] `/admin/inbox` 승격 (주제로 승격 버튼 + API)
- [x] `/admin/hubs` 목록·상세 (관리 라우트)

### Phase 7-E: (선택) 로컬 관리자 잠금

- [x] `VITE_ADMIN_ENABLED=true` — 미설정 시 `/admin` 비활성·네비 숨김
- [x] `VITE_ADMIN_PIN` — 선택 PIN + dev API `X-Wiki-Admin-Pin` 검증

---

## 8. PRD 수정 포인트 (다음 갱신 시)

| 섹션 | 변경 |
|------|------|
| §4 시나리오 | US-1 Inbox → **관리자 AM-1** 로 이동 |
| §5 IA | `admin/` 라우트 트리 추가 |
| §6 기능 | F-User-* / F-Admin-* 분리 |
| 비목표 | v0.2까지 **다중 사용자·역할 RBAC** 는 비목표 유지 |

---

## 9. 성공 기준 (v0.2)

1. 처음 들어온 사용자가 **「주제」만** 보고 Wiki라고 느낀다.  
2. 허브·Inbox는 **`/admin`** 에서만 보인다.  
3. **Antigravity 2.0** 같은 용어를 관리 화면에서 등록하면, 저장 후 사용자 `/topics/antigravity-2` 에 본문이 있다.  
4. 채팅 “등록해줘”와 관리 UI가 **같은 MD 규칙**을 쓴다.

---

## 10. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-24 | v0.2 사용자/관리자 분리 계획 초안 |
