# AI-Synapse Wiki

한글 AI 지식을 **위키**로 정리하고, 출처·주제·도구 간 **Synapse(연결)** 를 남기는 VibeCoding 지식 허브입니다.

- [prd.md](./prd.md) — 제품 요구사항
- [plan.md](./plan.md) — 실행 계획 (PoC → 이관 → export)
- [SETUP.md](./SETUP.md) — Docs 동기화·개발 환경
- 수집 파이프라인: [`../Ai-Synapse/`](../Ai-Synapse/)

## 웹앱 (React Router)

```powershell
cd "G:\내 드라이브\VibeCoding\AI-Synapse-Wiki"
npm run start
```

`npm run start` → 로컬 미러에 동기화 후 dev 서버 + 브라우저 자동 실행.  
( Drive에서는 `npm install`이 실패할 수 있어 **한 번만** `SETUP.md`의 캐시 설치 필요 )

| 경로 | 설명 |
|------|------|
| `/` | 홈 |
| `/hubs`, `/stories`, `/topics` | 카테고리 목록 |
| `/hubs/:slug` 등 | 엔트리 + Synapse 연관 링크 |
| `/inbox` | 클리핑 |
| `/search?q=` | 로컬 검색 |

```powershell
npm run lint
npm test
npm run build
```

## Hermes (작업 완료 Gmail)

```powershell
npm run hermes:register   # 최초 1회
npm run notify            # 작업 완료 알림
```

자세한 흐름: [docs/HERMES.md](./docs/HERMES.md)

## 새 용어 등록

채팅 예: *「안티그래비티 2.0을 등록해줘」* → [docs/WIKI-REGISTER.md](./docs/WIKI-REGISTER.md)  
v0.2 계획 (사용자/관리 분리): [docs/PLAN-USER-ADMIN.md](./docs/PLAN-USER-ADMIN.md)

## Contributing

- PoC/Phase 완료 단위로 커밋
- `docs/` 수정 후 `npm run build:entries` (dev/build 시 자동)
