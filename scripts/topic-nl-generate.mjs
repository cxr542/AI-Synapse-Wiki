/**
 * 자연어 → Wiki 주제 초안 (dev API)
 * WIKI_TOPIC_LLM_API_KEY 있으면 Gemini, 없으면 규칙·템플릿
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wikiRoot } from "./admin-api-handlers.mjs";
import { preferEnglishTopicTitle } from "./prefer-english-title.mjs";

export { preferEnglishTopicTitle } from "./prefer-english-title.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} text */
export function parseTopicRequest(text) {
  let t = text.trim();
  t = t.replace(
    /^(주제\s*)?(등록|추가|생성|만들어)\s*[:：]?\s*/i,
    "",
  );
  t = t.replace(
    /(.+?)\s*(등록해줘|등록해 주세요|등록|추가해줘|추가|생성해줘|생성|만들어줘|만들어)\s*$/i,
    "$1",
  );
  return t.trim() || text.trim();
}

/** @param {string} title */
export function slugifyTopicTitle(title) {
  const label = preferEnglishTopicTitle(title);
  const hints = [
    {
      re: /nous\s*research.*hermes|hermes\s*agent|hermes\s*acp|노우스.*헤르메스|nous-hermes|헤르메스\s*에이전트/i,
      slug: "nous-hermes-agent",
    },
    { re: /헤르메스.*(알림|notify|지메일|gmail)|wiki.*헤르메스/i, slug: "hermes-wiki-notify" },
    { re: /^헤르메스$/i, slug: "hermes-wiki-notify" },
    { re: /클로드\s*코드|claude\s*code/i, slug: "claude-code" },
    { re: /챗\s*gpt|챗지피티|chat\s*gpt|chatgpt/i, slug: "chatgpt" },
    { re: /제미나이|gemini/i, slug: "gemini" },
    { re: /antigravity\s*cli|\bagy\b|안티그래비티\s*cli/i, slug: "antigravity-cli" },
    { re: /antigravity\s*2(?:\.0)?|안티그래비티\s*2(?:\.0)?/i, slug: "antigravity-2" },
    { re: /하네스|harness/i, slug: "harness-engineering" },
  ];
  for (const h of hints) {
    if (h.re.test(title) || h.re.test(label)) return h.slug;
  }
  const ascii = label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii.length >= 2) return ascii.slice(0, 60);
  return "new-topic";
}

/** @returns {Array<{ slug: string, title: string, kind: string }>} */
function listExistingTopics() {
  const dir = path.join(wikiRoot(), "docs", "topics");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const titleM = raw.match(/^title:\s*(.+)$/m);
      return {
        slug: f.replace(/\.md$/, ""),
        title: titleM ? titleM[1].trim() : f,
        kind: "topics",
      };
    });
}

/** @param {string} request */
function loadContextSnippets(request) {
  const snippets = [];
  const topics = listExistingTopics();
  snippets.push(
    `기존 주제: ${topics.map((t) => `${t.slug} (${t.title})`).join(", ") || "(없음)"}`,
  );
  if (/헤르메스|hermes/i.test(request)) {
    const p = path.join(wikiRoot(), "docs", "HERMES.md");
    if (fs.existsSync(p)) {
      snippets.push(`--- HERMES.md ---\n${fs.readFileSync(p, "utf8").slice(0, 3500)}`);
    }
  }
  const tpl = path.join(wikiRoot(), "docs", "_templates", "topic.md");
  if (fs.existsSync(tpl)) {
    snippets.push(`--- topic template ---\n${fs.readFileSync(tpl, "utf8")}`);
  }
  return snippets.join("\n\n");
}

/** @param {string} subject @param {string} request */
function heuristicHermesDraft(subject) {
  const title = "Hermes (Wiki 작업 완료 알림)";
  const slug = "hermes-wiki-notify";
  const body = `# ${title}

**Hermes**(헤르메스)는 이 Wiki 프로젝트에서 **작업이 끝나면 Gmail로 알려 주는 로컬 자동화** 이름입니다. Cursor 에이전트가 lint·test 등을 마친 뒤 \`npm run notify\` 로 메일을 보냅니다.

## 한 줄 정의

Wiki·코딩 작업 완료를 **Gmail SMTP**로 알리는 로컬 Hermes 설정(\`hermes.config.json\` + PowerShell).

## 왜 Wiki에 넣었나

- 채팅에서 「헤르메스 등록해줘」「작업 끝나면 메일」 요청이 반복됩니다.
- NousResearch [Hermes Agent](https://github.com/NousResearch/hermes-agent)와 **다른 개념**임을 주제로 고정합니다.
- [하네스 엔지니어링](/topics/harness-engineering)·[Antigravity 2.0](/topics/antigravity-2)과 함께 **로컬 AI 작업 흐름**을 설명합니다.

## 핵심

| 항목 | 설명 |
|------|------|
| **등록** | \`npm run hermes:register\` — 설정·Cursor 규칙 |
| **알림** | \`npm run notify\` — \`scripts/notify-complete.ps1\` |
| **설정** | \`hermes.config.json\` (git 제외), Gmail은 \`gemini_tuner/gmail_config.json\` 참조 |

## 관련

- [하네스 엔지니어링](/topics/harness-engineering)
- [Antigravity 2.0](/topics/antigravity-2)
- 상세: 저장소 \`docs/HERMES.md\`

## 출처

- 프로젝트 문서: \`docs/HERMES.md\`
`;
  return {
    title,
    slug,
    body,
    source_url: null,
    tags: ["topic", "agent"],
    related: [
      { kind: "topics", slug: "harness-engineering" },
      { kind: "topics", slug: "antigravity-2" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ 프로젝트 Hermes 맥락으로 초안 생성`,
  };
}

const WIKI_TOPIC_BODY_SECTIONS = `
본문 필수 섹션(front matter 제외):
# (제목)
(도입 단락 2~3문장)
## 한 줄 정의
## 왜 Wiki에 넣었나
## 핵심 (표 권장)
## 이 Wiki에서의 위치 (/topics/ 링크)
## 출처 (URL)`;

/** @param {string} subject */
function heuristicGeminiDraft(subject) {
  const title = "Google Gemini";
  const slug = "gemini";
  const body = `# Google Gemini

**Gemini**는 Google의 **멀티모달 LLM 제품군**입니다. 웹·앱·API·CLI를 통해 텍스트·이미지·코드 작업을 하며, [Antigravity 2.0](/topics/antigravity-2)·Gemini CLI와 같은 개발 흐름과 연결됩니다.

## 한 줄 정의

Google이 제공하는 **생성형 AI 모델·서비스** (Gemini 2.x 등).

## 왜 Wiki에 넣었나

- Antigravity·CLI 문맥에서 「어떤 모델/플랫폼인지」를 주제로 고정합니다.
- [하네스 엔지니어링](/topics/harness-engineering)으로 모델·프롬프트 변경 실험의 대상을 명확히 합니다.

## 핵심

| 항목 | 설명 |
|------|------|
| **접점** | Gemini 앱, AI Studio, API, (구) Gemini CLI → Antigravity CLI |
| **용도** | 채팅, 코딩 보조, 멀티모달 입력 |
| **Wiki와의 관계** | 주제 엔트리는 **개념 정리**; API 키·과금은 공식 문서 기준 |

## 이 Wiki에서의 위치

- [Antigravity 2.0](/topics/antigravity-2) — Gemini 기반 에이전트 개발 환경
- [Claude Code](/topics/claude-code) — 다른 벤더 에이전트 코딩 도구
- [하네스 엔지니어링](/topics/harness-engineering)

## 출처

- [Gemini (Google)](https://gemini.google.com/)
`;
  return {
    title,
    slug,
    body,
    source_url: "https://gemini.google.com/",
    tags: ["topic", "agent"],
    related: [
      { kind: "topics", slug: "antigravity-2" },
      { kind: "topics", slug: "harness-engineering" },
      { kind: "topics", slug: "claude-code" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ Gemini 규칙 초안. .env에 WIKI_TOPIC_LLM_API_KEY 없음 — Gemini API 미사용`,
  };
}

/** @param {string} subject */
function heuristicChatgptDraft(subject) {
  const title = "ChatGPT";
  const slug = "chatgpt";
  const body = `# ChatGPT

**ChatGPT**는 OpenAI의 **대화형 생성 AI 서비스**입니다. 웹·모바일에서 GPT 모델과 채팅하고, 파일·이미지·맞춤 GPT·(플랜별) 에이전트 기능을 씁니다.

## 한 줄 정의

OpenAI가 제공하는 **채팅 중심 AI 어시스턴트** (GPT 계열 모델).

## 왜 Wiki에 넣었나

- [Google Gemini](/topics/gemini)·[Claude Code](/topics/claude-code)와 같은 **벤더별 AI 제품** 축에서 비교 기준.
- [하네스 엔지니어링](/topics/harness-engineering)에서 프롬프트·도구 실험의 대표 UI로 참조.

## 핵심

| 항목 | 설명 |
|------|------|
| **접점** | chatgpt.com, 앱, Plus·Team·Enterprise |
| **기능** | 대화, 파일·이미지, Custom GPT, (플랜) 에이전트 |
| **개발** | OpenAI API·Codex는 별도 제품 축 |

## 이 Wiki에서의 위치

- [Claude Code](/topics/claude-code)
- [Google Gemini](/topics/gemini)
- [하네스 엔지니어링](/topics/harness-engineering)

## 출처

- [ChatGPT](https://chatgpt.com/)
`;
  return {
    title,
    slug,
    body,
    source_url: "https://chatgpt.com/",
    tags: ["topic", "agent"],
    related: [
      { kind: "topics", slug: "claude-code" },
      { kind: "topics", slug: "gemini" },
      { kind: "topics", slug: "harness-engineering" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ ChatGPT 규칙 초안`,
  };
}

/** @param {string} subject */
function heuristicClaudeCodeDraft(subject) {
  const title = "Claude Code";
  const slug = "claude-code";
  const body = `# Claude Code

**Claude Code**는 Anthropic의 **터미널·IDE 연동 에이전트형 코딩 도구**입니다. 저장소를 읽고, 명령을 실행하고, PR·리팩터링 같은 개발 작업을 대화로 이어 갑니다.

## 한 줄 정의

로컬 코드베이스 맥락을 쓰는 **CLI/에이전트 코딩** 환경 (Cursor·Antigravity와 같은 축, 제품은 별도).

## 왜 Wiki에 넣었나

- 「에이전트 개발 환경」 주제를 [Antigravity 2.0](/topics/antigravity-2)과 나란히 둡니다.
- [하네스 엔지니어링](/topics/harness-engineering) 관점에서 **도구 호출·실행·평가** 흐름과 비교할 때 기준점이 됩니다.
- 이 저장소 Wiki는 **읽기·주제 정리**용이며, Claude Code 자체 설정은 각자 로컬·IDE에 둡니다.

## 핵심

| 항목 | 설명 |
|------|------|
| **맥락** | 프로젝트 파일·git·터미널을 도구로 사용 |
| **워크플로** | 질의 → 계획 → 편집·명령 실행 → 결과 확인 |
| **비교** | Antigravity(\`agy\`), Cursor Agent 등과 용도·에코시스템이 다름 |

## 이 Wiki에서의 위치

- [하네스 엔지니어링](/topics/harness-engineering) — 실행·평가 프레임
- [Antigravity 2.0](/topics/antigravity-2) — Google 측 에이전트 IDE/CLI

## 출처

- [Claude Code 문서](https://docs.anthropic.com/en/docs/claude-code)
`;
  return {
    title,
    slug,
    body,
    source_url: "https://docs.anthropic.com/en/docs/claude-code",
    tags: ["topic", "agent"],
    related: [
      { kind: "topics", slug: "harness-engineering" },
      { kind: "topics", slug: "antigravity-2" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ Claude Code 규칙 초안 (API 키 없음)`,
  };
}

/** @param {string} request @param {string} subject */
function isNousHermesRequest(request, subject) {
  const t = `${request} ${subject}`;
  return /nous\s*research|hermes\s*agent|hermes\s*acp|노우스.*헤르메스|nous-hermes|헤르메스\s*에이전트/i.test(
    t,
  );
}

/** @param {string} request @param {string} subject */
function isLocalHermesRequest(request, subject) {
  if (isNousHermesRequest(request, subject)) return false;
  return /헤르메스|hermes/i.test(`${request} ${subject}`);
}

/** @param {string} subject */
function heuristicNousHermesAgentDraft(subject) {
  const title = "NousResearch Hermes Agent";
  const slug = "nous-hermes-agent";
  const body = `# NousResearch Hermes Agent

**Hermes Agent**는 NousResearch의 **오픈소스 범용 AI 에이전트**입니다. CLI(\`hermes\`), 메시징 게이트웨이, **ACP**(\`hermes acp\`)로 IDE 연동을 지원합니다.

## 한 줄 정의

다중 LLM·도구·스킬을 묶은 **자율 에이전트 런타임**.

## 왜 Wiki에 넣었나

- [Claude Code](/topics/claude-code)·[Antigravity 2.0](/topics/antigravity-2)와 같은 에이전트 코딩 축의 비교 기준.
- 이 저장소 **Gmail Hermes**(\`docs/HERMES.md\`)와 **제품명만 겹치는 별개 개념**임을 분리.

## 핵심

| 항목 | 설명 |
|------|------|
| **CLI** | \`hermes\`, \`hermes model\`, \`hermes doctor\` |
| **ACP** | \`hermes acp\` — VS Code·Zed·JetBrains (Agent Client Protocol) |
| **게이트웨이** | Telegram·Discord·Slack 등 \`hermes gateway\` |
| **설정** | \`~/.hermes/.env\`, \`~/.hermes/config.yaml\` |

## 이 Wiki에서의 위치

- [하네스 엔지니어링](/topics/harness-engineering)
- [Claude Code](/topics/claude-code)
- [Antigravity 2.0](/topics/antigravity-2)

## 출처

- [GitHub — NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- [공식 문서](https://hermes-agent.nousresearch.com/docs/)
`;
  return {
    title,
    slug,
    body,
    source_url: "https://github.com/NousResearch/hermes-agent",
    tags: ["topic", "agent"],
    related: [
      { kind: "topics", slug: "harness-engineering" },
      { kind: "topics", slug: "claude-code" },
      { kind: "topics", slug: "antigravity-2" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ NousResearch Hermes Agent (로컬 Gmail Hermes와 별도)`,
  };
}

/** @param {string} subject */
function heuristicAntigravityCliDraft(subject) {
  const title = "Antigravity CLI";
  const slug = "antigravity-cli";
  const body = `# Antigravity CLI

**Antigravity CLI**(\`agy\`)는 Google **Antigravity** 생태계의 **터미널·SSH용 에이전트 CLI**입니다. [Antigravity 2.0](/topics/antigravity-2) 데스크톱과 설정·세션을 공유하며, (구) Gemini CLI 개인 사용자의 이전 대상이기도 합니다.

## 한 줄 정의

Antigravity 엔진을 쓰는 **명령줄 에이전트 인터페이스** (\`agy\`).

## 왜 Wiki에 넣었나

- 「Antigravity 2.0」주제와 **제품·CLI**를 분리해 Synapse로 연결합니다.
- [Gemini](/topics/gemini)·[하네스 엔지니어링](/topics/harness-engineering)과 함께 도구 축을 정리합니다.

## 핵심

| 항목 | 설명 |
|------|------|
| **명령** | \`agy\` — 터미널·원격(SSH)에서 에이전트 실행 |
| **관계** | Antigravity 2.0 데스크톱 ↔ CLI 설정·세션 연동 |
| **이전** | Gemini CLI 개인·무료 → Antigravity CLI 이전 흐름(공식 문서 기준) |

## 이 Wiki에서의 위치

- [Antigravity 2.0](/topics/antigravity-2) — 에이전트 우선 개발 환경(데스크톱)
- [Gemini](/topics/gemini) — 기반 모델·API 제품군

## 출처

- [antigravity.google](https://antigravity.google/)
`;
  return {
    title,
    slug,
    body,
    source_url: "https://antigravity.google/",
    tags: ["topic", "agent", "cli"],
    related: [
      { kind: "topics", slug: "antigravity-2" },
      { kind: "topics", slug: "gemini" },
      { kind: "topics", slug: "harness-engineering" },
    ],
    mode: "heuristic",
    note: `「${subject}」→ Antigravity CLI 전용 slug (antigravity-2와 별도)`,
  };
}

/** @param {string} slug */
function assertSlugAvailable(slug) {
  const existing = listExistingTopics();
  const found = existing.find((t) => t.slug === slug);
  if (found) {
    throw new Error(
      `이미 있는 주제입니다: /topics/${slug} (「${found.title}」). CLI·2.0 등 다른 개념이면 제목을 더 구체적으로 입력하세요.`,
    );
  }
}

/** @param {string} subject */
function heuristicGenericDraft(subject) {
  const title = preferEnglishTopicTitle(subject);
  const slug = slugifyTopicTitle(subject);
  const body = `# ${title}

## 한 줄 정의

${title}에 대한 한 줄 설명을 채워 주세요.

## 왜 Wiki에 넣었나

- 사용자 요청: 자연어 등록
- 기존 주제(Antigravity, 하네스)와 Synapse로 연결할 수 있습니다.

## 핵심

| 항목 | 설명 |
|------|------|
| (항목) | (설명) |

## 관련

- [하네스 엔지니어링](/topics/harness-engineering)
- [Antigravity 2.0](/topics/antigravity-2)

## 출처

- (공식 URL이 있으면 추가)
`;
  return {
    title,
    slug,
    body,
    source_url: null,
    tags: ["topic"],
    related: [
      { kind: "topics", slug: "harness-engineering" },
      { kind: "topics", slug: "antigravity-2" },
    ],
    mode: "heuristic",
    note: "LLM API 키 없음 — 템플릿 초안입니다. 본문을 검토한 뒤 등록하세요.",
  };
}

/**
 * @param {string} request
 * @param {Record<string, string>} env
 */
async function generateWithGemini(request, env) {
  const key = env.WIKI_TOPIC_LLM_API_KEY?.trim();
  if (!key) return null;
  const model = env.WIKI_TOPIC_LLM_MODEL?.trim() || "gemini-2.5-flash";
  const subject = parseTopicRequest(request);
  const context = loadContextSnippets(request);
  const prompt = `당신은 AI-Synapse Wiki 주제 편집자입니다.
사용자 요청을 바탕으로 **한국어 Wiki 주제** 초안을 만듭니다.

규칙:
- JSON만 출력 (마크다운 코드블록 없이)
${WIKI_TOPIC_BODY_SECTIONS}
- 플레이스홀더(「채워 주세요」) 금지. 실제 문장으로 작성.
- NousResearch Hermes Agent가 아니라, 이 저장소의 Hermes는 Gmail 작업 완료 알림( docs/HERMES.md )일 수 있음
- slug: 영문 소문자·하이픈
- 제목에 영문·한글이 함께 있으면 title·slug·본문 H1은 **영문 표기를 우선** (예: 「클로드 코드 Claude Code」→ Claude Code)
- related: 기존 topics slug만 (harness-engineering, antigravity-2 등)

사용자 요청: ${request}
추출 제목 후보: ${subject}
영문 우선 제목: ${preferEnglishTopicTitle(subject)}

참고:
${context}

JSON 스키마:
{
  "title": "표시 제목",
  "slug": "english-slug",
  "source_url": null 또는 "https://...",
  "tags": ["topic", ...],
  "related": [{"kind":"topics","slug":"..."}],
  "body": "# 제목\\n\\n...(마크다운 본문, front matter 제외)"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM 오류 (${res.status}): ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("LLM 응답이 비었습니다");
  const parsed = JSON.parse(text.trim());
  const title = preferEnglishTopicTitle(String(parsed.title ?? subject));
  return {
    title,
    slug: String(parsed.slug ?? slugifyTopicTitle(title)),
    body: String(parsed.body ?? ""),
    source_url: parsed.source_url ?? null,
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["topic"],
    related: Array.isArray(parsed.related) ? parsed.related : [],
    mode: "llm",
    note: `Gemini (${model}) 초안`,
  };
}

/**
 * @param {string} request
 * @param {Record<string, string>} [env]
 */
export async function generateTopicNlDraft(request, env = process.env) {
  if (!request?.trim()) {
    throw new Error("등록 요청 문장을 입력하세요");
  }
  const rawSubject = parseTopicRequest(request);
  const subject = preferEnglishTopicTitle(rawSubject);

  try {
    const llm = await generateWithGemini(request, env);
    if (llm?.body?.trim()) {
      assertSlugAvailable(llm.slug);
      return llm;
    }
  } catch (e) {
    if (env.WIKI_TOPIC_LLM_API_KEY?.trim()) throw e;
  }

  let draft;
  const matchText = `${request} ${rawSubject}`;
  if (isNousHermesRequest(request, rawSubject)) {
    draft = heuristicNousHermesAgentDraft(subject);
  } else if (isLocalHermesRequest(request, rawSubject)) {
    draft = heuristicHermesDraft(subject);
  } else if (/클로드\s*코드|claude\s*code/i.test(matchText)) {
    draft = heuristicClaudeCodeDraft(subject);
  } else if (/제미나이|gemini/i.test(matchText)) {
    draft = heuristicGeminiDraft(subject);
  } else if (/챗\s*gpt|챗지피티|chat\s*gpt|chatgpt/i.test(matchText)) {
    draft = heuristicChatgptDraft(subject);
  } else if (/antigravity\s*cli|\bagy\b|안티그래비티\s*cli/i.test(matchText)) {
    draft = heuristicAntigravityCliDraft(subject);
  } else {
    draft = heuristicGenericDraft(rawSubject);
    if (draft.slug === "new-topic") {
      draft.note +=
        " 한글만 제목이면 slug가 new-topic이 됩니다. slug를 영문(예: claude-code)으로 바꾸거나 WIKI_TOPIC_LLM_API_KEY를 설정하세요.";
    }
  }

  assertSlugAvailable(draft.slug);
  return draft;
}
