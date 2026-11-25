# site/ 안 모든 HTML·JSON의 상대 경로(href/src/poster)가 실제 파일을 가리키는지 검사한다.
import json, pathlib, re, sys
sys.stdout.reconfigure(encoding="utf-8")
SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
bad, checked = [], 0

def resolve(base: pathlib.Path, ref: str):
    ref = ref.split("#")[0].split("?")[0]
    if not ref or re.match(r"^(https?:|mailto:|tel:|data:|javascript:)", ref) or "${" in ref:
        return None
    p = (base / ref).resolve() if not ref.startswith("/") else (SITE / ref.lstrip("/")).resolve()
    if ref.endswith("/") or p.is_dir():
        p = p / "index.html"
    return p

for html in SITE.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    for ref in re.findall(r'(?:href|src|poster)="([^"]+)"', text):
        p = resolve(html.parent, ref)
        if p is None: continue
        checked += 1
        if not p.exists(): bad.append(f"{html.relative_to(SITE)} → {ref}")

# JSON 안의 이미지·링크(사이트 루트 기준)
for js in (SITE / "data").glob("*.json"):
    for ref in re.findall(r'"(?:src|img|href|link)"\s*:\s*"([^"]+)"', js.read_text(encoding="utf-8")):
        p = resolve(SITE, ref)
        if p is None: continue
        checked += 1
        if not p.exists(): bad.append(f"data/{js.name} → {ref}")

print(f"checked {checked} refs, broken {len(bad)}")
for b in bad: print("  ✗", b)
