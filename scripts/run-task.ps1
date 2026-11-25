# 사용법: .\scripts\run-task.ps1 T04
# 지시서 tasks/<ID>.md 를 Gemini(Antigravity CLI)에게 맡기고 로그를 reports/<ID>.log 에 남긴다.
param([Parameter(Mandatory)][string]$Id)
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$agy = "$env:LOCALAPPDATA\agy\bin\agy.exe"
$prompt = "GEMINI.md 규칙을 먼저 읽어라. 그다음 tasks/$Id.md 지시서를 읽고 그대로 수행하라. 필요한 폴더는 이미 있다. 셸 명령은 절대 쓰지 말고 파일 읽기·쓰기 도구만 써라. 지시서의 '만들 파일'(또는 '고칠 파일') 밖의 파일은 건드리지 마라. 끝나면 reports/$Id.md 보고서를 써라."
$start = Get-Date
& $agy -p $prompt --model gemini-3.8-flash-high --mode accept-edits --print-timeout 540s *> "reports/$Id.log"
"$Id exit: $LASTEXITCODE  elapsed: " + [int]((Get-Date) - $start).TotalSeconds + "s"
