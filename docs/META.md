# Wiki 메타데이터 규칙

## Front matter (엔트리)

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | ✅ | 표시 제목 |
| `visibility` | ✅ | `published` (사용자 Wiki) · `draft` · `admin` (관리만) |
| `source_url` | ⬜ | 원문·허브 URL |
| `collected_at` | ✅ | `YYYY-MM-DD` |
| `tags` | ✅ | 아래 화이트리스트 |
| `related` | ⬜ | Synapse 연결 (`kind` + `slug`) |

## 태그 화이트리스트 (v0.1)

`hub`, `story`, `community`, `rag`, `agent`, `prompt`, `topic`, `inbox`

## `related` 형식

```yaml
related:
  - kind: stories
    slug: llm-marketing-pipeline
```

라우트: 사용자 Wiki는 `/topics/{slug}` 만 공개. 허브·스토리·Inbox는 `/admin/...`

## visibility 기본값 (front matter 생략 시)

| kind | 기본 |
|------|------|
| `topics` | `published` |
| `stories` | `draft` |
| `hubs` | `admin` |
| `inbox` | `admin` |
