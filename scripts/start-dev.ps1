# Wiki 웹 UI 실행 + 브라우저 열기 (Google Drive 프로젝트용)
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Local = "$env:USERPROFILE\.cursor\projects\ai-synapse-wiki-local"
$CacheModules = "$env:USERPROFILE\.cache\ai-synapse-wiki\node_modules"

Write-Output "AI-Synapse Wiki — dev 서버 시작"
Write-Output ""

# 로컬 미러 준비 (Drive에서 npm install 실패 대비)
if (-not (Test-Path $Local)) {
  New-Item -ItemType Directory -Path $Local -Force | Out-Null
}

$copyItems = @(
  "package.json", "index.html", "vite.config.ts",
  "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
  "vitest.config.ts", "eslint.config.js", ".env.example"
)
foreach ($f in $copyItems) {
  $src = Join-Path $Root $f
  if (Test-Path $src) {
    Copy-Item -LiteralPath $src -Destination (Join-Path $Local $f) -Force
  }
}
$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
  Copy-Item -LiteralPath $envFile -Destination (Join-Path $Local ".env") -Force
}
$nestedSrc = Join-Path $Local "src\src"
if (Test-Path $nestedSrc) {
  Remove-Item -LiteralPath $nestedSrc -Recurse -Force
}
foreach ($dir in @("src", "docs", "inbox", "scripts", "tests", "public")) {
  $srcDir = Join-Path $Root $dir
  if (Test-Path $srcDir) {
    Copy-Item -LiteralPath $srcDir -Destination (Join-Path $Local $dir) -Recurse -Force
  }
}

if ((Test-Path $CacheModules) -and -not (Test-Path "$Local\node_modules")) {
  cmd /c mklink /J "$Local\node_modules" "$CacheModules" 2>$null
}
if (-not (Test-Path "$Local\node_modules")) {
  Write-Output "node_modules 없음. 먼저 실행:"
  Write-Output "  cd $env:USERPROFILE\.cache\ai-synapse-wiki"
  Write-Output "  npm install"
  exit 1
}

Set-Location $Local
node scripts/build-entries.mjs
$count = (Get-Content "src\data\entries.json" -Raw | Select-String -Pattern '"slug": "antigravity-2"' -AllMatches).Matches.Count
if ($count -lt 1) {
  Write-Warning "antigravity-2 엔트리 없음 — Drive docs 동기화를 확인하세요."
}

$port = 5173
Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1

Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Local'; npm run dev"
)
Write-Output "Vite dev 서버를 시작했습니다 (포트 $port)."
Start-Sleep -Seconds 4

Start-Process "http://localhost:$port/topics/antigravity-2"
Write-Output ""
Write-Output "브라우저: http://localhost:$port/"
Write-Output "Antigravity: http://localhost:$port/topics/antigravity-2"
Write-Output "하네스:    http://localhost:$port/topics/harness-engineering"
