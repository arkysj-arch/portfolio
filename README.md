# 윤성조 포트폴리오

**사이트:** https://seongjoyoun.github.io/portfolio/

AI 팀을 지휘해 이커머스·마케팅 성과를 만드는 총괄의 포트폴리오입니다. 이 사이트는 다음처럼 역할을 나눠서 만들었습니다.

- **오너**: 무엇을 만들고 무엇을 공개할지 정합니다.
- **Claude**: 기획을 정리하고, 지시서를 쓰고, 결과를 검수합니다.
- **Gemini**: 지시서대로 파일을 만듭니다.

## 폴더

| 폴더 | 내용 |
|---|---|
| `site/` | 배포되는 정적 사이트 (HTML/CSS/JS, 빌드 없음) |
| `SPEC.md`, `GLOSSARY.md`, `docs/adr/` | 스펙, 용어집, 결정 기록 |
| `tasks/` | Claude가 Gemini에게 준 지시서와 수정 지시 (`T##-r1.md`) |
| `reports/` | Gemini가 쓴 작업 보고서 |
| `scripts/` | 데이터 가공, 캡처·녹화, 링크 검사, 배포 주소 반영 |

## 고치는 법

- 프로젝트 카드, 경력, 연락처는 `site/data/*.json`에서 고칩니다.
- 배포 주소가 바뀌면 `python scripts/set_base_url.py`를 실행합니다.
- 배포 전에는 `python scripts/check_links.py`로 깨진 링크를 검사합니다.

SJ 프루프와 숏폼 케이스의 메디큐브 제품은 메디큐브와 무관한 비공식 포트폴리오 샘플입니다. 공식몰에 공개된 정보만 사용했습니다.
