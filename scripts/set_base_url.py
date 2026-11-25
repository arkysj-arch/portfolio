# 배포 주소를 사이트에 반영한다: 공유(OG) 태그, 404 메인 링크, PDF 원판의 [사이트 주소].
# 다시 실행해도 같은 결과가 나오도록(중복 삽입 없이) 만든다.
import html as H, pathlib, re, sys
sys.stdout.reconfigure(encoding="utf-8")
BASE = "https://seongjoyoun-portfolio.vercel.app"
# 예전 대표 주소(교체 대상). GitHub Pages는 일부 망에서 막혀 예비 주소로만 둔다
OLD_BASES = ["https://seongjoyoun.github.io/portfolio"]
SITE = pathlib.Path(__file__).resolve().parent.parent / "site"

pages = [SITE / "index.html"] + sorted((SITE / "cases").glob("*/index.html")) + sorted((SITE / "demos").glob("*/index.html"))
for p in pages:
    t = p.read_text(encoding="utf-8")
    t = re.sub(r"\n?\s*<!-- og:start -->.*?<!-- og:end -->", "", t, flags=re.S)
    title = H.unescape(re.search(r"<title>(.*?)</title>", t, re.S).group(1).strip())
    desc = H.unescape(re.search(r'<meta name="description" content="([^"]*)"', t).group(1))
    rel = p.relative_to(SITE).as_posix().replace("index.html", "")
    tags = [
        ('property="og:type"', "website"),
        ('property="og:site_name"', "윤성조 포트폴리오"),
        ('property="og:title"', title),
        ('property="og:description"', desc),
        ('property="og:url"', f"{BASE}/{rel}"),
        ('property="og:image"', f"{BASE}/assets/og.png"),
        ('property="og:image:width"', "1200"),
        ('property="og:image:height"', "630"),
        ('name="twitter:card"', "summary_large_image"),
    ]
    block = "\n  <!-- og:start -->\n" + "\n".join(f'  <meta {k} content="{H.escape(v, quote=True)}">' for k, v in tags) + "\n  <!-- og:end -->"
    t = t.replace("</head>", block + "\n</head>", 1)
    p.write_text(t, encoding="utf-8")
    print("og →", p.relative_to(SITE))

p404 = SITE / "404.html"
t = p404.read_text(encoding="utf-8")
t2 = re.sub(r'href="(\./|https://[^"]+/)"(?=[^>]*>\s*메인)', f'href="{BASE}/"', t)
for ob in OLD_BASES: t2 = t2.replace(f'href="{ob}/"', f'href="{BASE}/"')
p404.write_text(t2, encoding="utf-8")
print("404 links updated:", t2.count(f'href="{BASE}/"'))

pp = SITE / "print" / "portfolio.html"
t = pp.read_text(encoding="utf-8").replace("[사이트 주소]", BASE.replace("https://", ""))
for ob in OLD_BASES: t = t.replace(ob.replace("https://", ""), BASE.replace("https://", ""))
pp.write_text(t, encoding="utf-8")
print("print page address filled:", t.count(BASE.replace("https://", "")))
