# Hermes — 작업 완료 Gmail 알림 (plan/에이전트 종료 시 호출)
param(
  [string]$Subject = "",
  [string]$Body = "",
  [string]$ConfigPath = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
if ($ConfigPath) { $HermesConfigFile = $ConfigPath } else { $HermesConfigFile = Join-Path $Root "hermes.config.json" }

if (-not (Test-Path $HermesConfigFile)) {
  Write-Error "Hermes 미등록: hermes.config.json 없음. 먼저 실행: npm run hermes:register"
  exit 2
}

$hermes = Get-Content $HermesConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $hermes.enabled) {
  Write-Output "Hermes 알림 비활성(enabled=false). 건너뜀."
  exit 0
}

$gmailPath = Join-Path $Root ($hermes.gmailConfigPath -replace '/', '\')
if (-not (Test-Path $gmailPath)) {
  Write-Error "Gmail 설정 없음: $gmailPath"
  exit 3
}

$gmail = Get-Content $gmailPath -Raw -Encoding UTF8 | ConvertFrom-Json
$project = $hermes.projectLabel
$sub = if ($Subject) { $Subject } else { $hermes.defaultSubject -replace '\{project\}', $project }
$receiver = if ($hermes.receiverOverride) { $hermes.receiverOverride } else { $gmail.receiver }

if (-not $Body) {
  $Body = @"
[$project] 에이전트 작업이 완료되었습니다.

시간: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
프로젝트 경로: $Root

— Hermes ($($hermes.agentName))
"@
}

$msg = New-Object System.Net.Mail.MailMessage($gmail.sender, $receiver, $sub, $Body)
$msg.BodyEncoding = [System.Text.Encoding]::UTF8
$msg.SubjectEncoding = [System.Text.Encoding]::UTF8
$smtp = New-Object System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
$smtp.EnableSsl = $true
$smtp.Credentials = New-Object System.Net.NetworkCredential($gmail.sender, $gmail.app_pw)
$smtp.Send($msg)

Write-Output "Hermes: 메일 발송 완료 → $receiver"
Write-Output "제목: $sub"
