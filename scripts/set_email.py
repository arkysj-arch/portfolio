# 사이트 전체의 이메일 자리표시자를 실제 공개 이메일로 바꾼다. (UTF-8로 읽고 씀)
import json, pathlib

EMAIL = "ganziskin@gmail.com"
root = pathlib.Path(__file__).resolve().parent.parent / "site"

old = "연락처: <strong>[이메일 확인 필요]</strong>"
new = f'연락처: <strong><a href="mailto:{EMAIL}">{EMAIL}</a></strong>'
for p in root.rglob("*.html"):
    t = p.read_text(encoding="utf-8")
    if old in t:
        p.write_text(t.replace(old, new), encoding="utf-8")
        print("updated", p.relative_to(root))

cj = root / "data" / "career.json"
data = json.loads(cj.read_text(encoding="utf-8"))
data["contact"]["email"] = EMAIL
cj.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("updated data/career.json")
