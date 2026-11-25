# 포트폴리오사이트 — Claude Code 작업 지침

> 상위 폴더(`Downloads/CLAUDE.md`)의 지침은 **다른 프로젝트(감정 앱)** 것이다. 이 폴더에는 적용하지 않는다.

## 오너
- 시니어 이커머스·마케팅 총괄, 개발 초보. 설명은 한국어, 쉬운 말, 명령 실행 전 한 문장 설명.

## 역할
- **Claude Code = 지휘·검수.** 기획(오너와 함께), 지시서 작성, 검수, 통합, 한두 줄 수정만 직접 한다.
- **Gemini(Antigravity CLI `agy`, Gemini 3.8 Flash) = 생산.** 코드·문구 초안·이미지 프롬프트 초안. 규칙은 `GEMINI.md`.
- 이미지·영상 생성은 Claude가 Ego Lite 브라우저로 한다 (`docs/adr/0004-media-generation.md`).

## 흐름
1. 오너와 Claude가 기획 → `SPEC.md` 승인
2. Claude가 `tasks/T##.md` 작성 → Gemini 실행:
   `agy -p "GEMINI.md 규칙을 읽고, tasks/T##.md를 그대로 수행하라. 끝나면 reports/T##.md를 써라." --model gemini-3.8-flash-high --mode accept-edits --print-timeout 540s`
   (Gemini CLI는 개인 무료 계정 지원 종료로 사용 불가 — ADR-0003)
3. Claude가 `SPEC.md` 6항 검수 기준으로 검수 → 통과 / 수정 지시(`tasks/T##-r1.md`)
4. 같은 작업 수정 3회 초과 → 즉시 오너에게 보고
5. 마일스톤 완료 시 오너에게 보고 (스크린샷, 검수 결과, 왕복 횟수)

## 규칙
- 원천 자료 폴더는 읽기 전용. `.env`·실데이터·DB는 읽지도 넘기지도 않는다.
- 사실 근거는 `docs/source-notes.md`. 근거 없는 숫자·문장은 쓰지 않는다.
- 공개 연락처는 이메일만. 배포·공개는 오너 승인 후.
- 배포 대상은 `site/` 폴더뿐.
