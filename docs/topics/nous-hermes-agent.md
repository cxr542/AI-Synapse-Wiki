---
title: NousResearch Hermes Agent
visibility: published
source_url: https://github.com/NousResearch/hermes-agent
collected_at: 2026-05-25
tags: [topic, agent]
related:
  - kind: topics
    slug: harness-engineering
  - kind: topics
    slug: claude-code
  - kind: topics
    slug: antigravity-2
---

# NousResearch Hermes Agent

**Hermes Agent**는 NousResearch의 **오픈소스 범용 AI 에이전트**입니다. 터미널 CLI, 메시징 게이트웨이(Telegram·Discord 등), **ACP**로 VS Code·Zed·JetBrains에 붙는 **에디터 네이티브 에이전트**까지 한 제품군으로 제공합니다.

> 이 Wiki 저장소의 **Hermes**(Gmail 작업 완료 알림, `docs/HERMES.md`)와는 **다른 개념**입니다.

## 한 줄 정의

다중 LLM·도구·스킬을 묶은 **자율 에이전트 런타임** — CLI `hermes`, `hermes acp`, `hermes gateway` 등으로 진입.

## 왜 Wiki에 넣었나

- [Claude Code](/topics/claude-code)·[Antigravity 2.0](/topics/antigravity-2)와 같은 **에이전트 코딩 축**에서 비교·Synapse 연결용 기준점.
- [하네스 엔지니어링](/topics/harness-engineering) 관점의 **도구 호출·세션·평가** 논의에 제3의 오픈 에이전트 스택으로 둡니다.
- 채팅에서 「헤르메스 에이전트」가 **NousResearch 제품**을 가리키는 경우와 **로컬 Gmail Hermes**를 구분하기 위해.

## 핵심

| 항목 | 설명 |
|------|------|
| **CLI** | `hermes` 대화, `hermes model` / `hermes tools` 설정, `hermes doctor` 진단 |
| **ACP** | `hermes acp` — Agent Client Protocol, IDE가 stdio JSON-RPC로 연결 |
| **게이트웨이** | `hermes gateway` — Telegram·Discord·Slack 등 메신저 봇 |
| **설정** | `~/.hermes/.env`, `~/.hermes/config.yaml`, skills·state DB |
| **도구** | 파일·터미널·브라우저·메모리·todo·delegate 등 (모드별 toolset) |

## 이 Wiki에서의 위치

- [하네스 엔지니어링](/topics/harness-engineering) — 에이전트·평가·자동화 파이프라인
- [Claude Code](/topics/claude-code) — Anthropic 에이전트 코딩
- [Antigravity 2.0](/topics/antigravity-2) — Google 에이전트 개발 환경
- 로컬 **Wiki Hermes**(Gmail 알림): `docs/HERMES.md` — 제품 문서가 아님

## 출처

- [NousResearch/hermes-agent (GitHub)](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent 문서](https://hermes-agent.nousresearch.com/docs/)
- [ACP Editor Integration](https://hermes-agent.nousresearch.com/docs/user-guide/features/acp)
