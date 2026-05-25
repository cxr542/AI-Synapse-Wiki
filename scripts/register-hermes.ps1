# Hermes 에이전트 등록 — 설정 파일 + Cursor 규칙 생성
param(
  [string]$ProjectLabel = "AI-Synapse Wiki",
  [string]$GmailConfigPath = "../gemini_tuner/gmail_config.json"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Example = Join-Path $Root "hermes.config.example.json"
$Config = Join-Path $Root "hermes.config.json"
$RulesDir = Join-Path $Root ".cursor\rules"
$RuleFile = Join-Path $RulesDir "hermes-notify.mdc"

if (-not (Test-Path $Example)) {
  Write-Error "hermes.config.example.json 없음"
  exit 1
}

$template = Get-Content $Example -Raw -Encoding UTF8 | ConvertFrom-Json
$template.projectLabel = $ProjectLabel
$template.gmailConfigPath = $GmailConfigPath
$template.enabled = $true
$template | ConvertTo-Json -Depth 5 | Set-Content $Config -Encoding UTF8

New-Item -ItemType Directory -Force -Path $RulesDir | Out-Null

$rule = @"
---
description: Hermes — 작업 완료 시 Gmail 알림 발송
alwaysApply: true
---

# Hermes (메신저 에이전트)

이 프로젝트에 **Hermes**가 등록되어 있습니다. Hermes = 작업 종료 시 Gmail로 알리는 로컬 메신저 역할입니다.

## 사용자가 「헤르메스 에이전트 등록」을 요청한 경우

1. ``npm run hermes:register`` 실행 (또는 ``scripts/register-hermes.ps1``)
2. ``hermes.config.json`` 이 생성되었는지 확인
3. 등록 완료를 채팅으로 알림

## 실질적인 작업·구현을 마쳤을 때

사용자가 **「작업 끝나면 지메일로 알려줘」** 등을 요청했거나, plan/goal 단위 작업을 성공적으로 끝냈을 때:

1. ``npm run lint`` / ``npm test`` 등 검증이 있다면 먼저 실행
2. 성공(Green)이면 터미널에서 알림 발송:

``````powershell
npm run notify
``````

또는 제목·본문 지정:

``````powershell
npm run notify -- -Subject "[AI-Synapse Wiki] M2 이관 완료" -Body "hubs 4, stories 3 반영"
``````

3. 발송 실패 시 사용자에게 ``hermes.config.json`` / Gmail 앱 비밀번호 확인 안내

## 비고

- **NousResearch Hermes Agent**(`hermes acp`)와는 별개입니다. 여기서 Hermes는 **이 repo의 Gmail 알림 별칭**입니다.
- 비밀번호는 ``hermes.config.json``에 넣지 말고 ``gmailConfigPath``만 참조합니다.
"@

Set-Content $RuleFile $rule -Encoding UTF8

$gmailFull = Join-Path $Root ($GmailConfigPath -replace '/', '\')
if (-not (Test-Path $gmailFull)) {
  Write-Warning "Gmail 설정 파일이 아직 없습니다: $gmailFull"
  Write-Warning "gemini_tuner/gmail_config.json 을 준비한 뒤 npm run notify 로 테스트하세요."
} else {
  Write-Output "Gmail 설정 확인: OK"
}

Write-Output ""
Write-Output "Hermes 등록 완료"
Write-Output "  - $Config"
Write-Output "  - $RuleFile"
Write-Output ""
Write-Output "테스트: npm run notify"
