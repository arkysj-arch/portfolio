# 0003. 제작자는 Antigravity CLI(agy) + Gemini 3.8 Flash, accept-edits 모드로만 실행

상태: 결정 (2026-11-24, 같은 날 개정)

## 맥락
처음에는 Gemini CLI 0.64(Google 계정 로그인)를 쓰려 했다. 실행해 보니 `IneligibleTierError: This client is no longer supported for Gemini Code Assist for individuals ... migrate to the Antigravity suite` 오류로 인증이 막혔다. 이 PC에는 Antigravity CLI `agy` 1.5.10이 설치돼 있고, 같은 계정으로 Gemini 3.8 Flash가 동작한다(시험 실행 확인).

## 결정
- 실행: 이 폴더에서
  `agy -p "<지시>" --model gemini-3.8-flash-high --mode accept-edits --print-timeout 540s`
- `accept-edits`는 파일 편집만 자동 승인한다. `--dangerously-skip-permissions`·`auto`는 쓰지 않는다.
- 작업 범위는 지시서의 "만들 파일" 목록으로 제한, 규칙은 `GEMINI.md` (프롬프트에서 매번 읽으라고 지시)
- 원천 폴더는 지시서가 허락한 경로만 `--add-dir`로 연다.

## 결과
- 좋음: 원천 프로젝트·비밀값 보호, 모든 지시와 결과가 파일로 남는다
- 대가: 제작자가 스스로 서버·브라우저로 확인할 수 없으므로, 화면 확인은 Claude가 검수 때 한다
- 되돌리려면: AI Studio API 키를 오너가 발급해 `GEMINI_API_KEY`로 설정하면 Gemini CLI로 돌아갈 수 있다
