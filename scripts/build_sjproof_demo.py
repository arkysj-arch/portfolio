# SJ 프루프 메디큐브 실행 결과(읽기 전용)에서 체험형 데모 데이터와 페이지 조각 이미지를 만든다.
import json, pathlib, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
RUN = pathlib.Path(r"C:\Users\윤성조\Downloads\상세제작기\runs\medicube-booster-pro-x2\v1")
SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
OUT_IMG = SITE / "assets" / "img" / "sj-proof"
OUT_IMG.mkdir(parents=True, exist_ok=True)

facts = json.loads((RUN / "facts.json").read_text(encoding="utf-8"))
check = json.loads((RUN / "check.json").read_text(encoding="utf-8"))
inp = json.loads((RUN / "input.json").read_text(encoding="utf-8"))

# 1) 완성 페이지를 860px 폭 그대로 약 1600px 높이 조각으로 나눠 WebP로 저장
im = Image.open(RUN / "page-860.png").convert("RGB")
W, H = im.size
STEP = 1600
slices = []
for i, top in enumerate(range(0, H, STEP)):
    part = im.crop((0, top, W, min(top + STEP, H)))
    name = f"page-{i+1:02d}.webp"
    part.save(OUT_IMG / name, "WEBP", quality=78, method=6)
    slices.append({"src": f"assets/img/sj-proof/{name}", "w": W, "h": part.size[1]})
total_kb = sum((OUT_IMG / s["src"].split("/")[-1]).stat().st_size for s in slices) // 1024

# 2) 사실 목록 예시: 종류별로 1~2개씩
by_kind = {}
for f in facts["facts"]:
    by_kind.setdefault(f.get("source") or f.get("kind"), []).append(f)
sample = []
for kind, items in by_kind.items():
    for f in items[:2]:
        sample.append({"id": f["id"], "kind": kind, "text": f["text"], "url": f.get("url", "")})

demo = {
    "_source": "상세제작기/runs/medicube-booster-pro-x2/v1 (2026-11-25) facts.json·check.json·page-860.png, docs/portfolio-summary-medicube.md",
    "notice": "메디큐브와 무관한 비공식 포트폴리오 샘플입니다. 공식몰 공개 정보(2026-11-25 확인)만으로 실제 실행한 결과를 재생합니다.",
    "product": "메디큐브 에이지알 부스터 프로 X2",
    "input": {
        "photos": "모델 없는 공식몰 제품 사진 4장 (유명인·시연자 사진은 초상권 때문에 제외)",
        "research": "공식몰 상품 페이지와 상세 이미지 55장에서 문장·각주를 옮겨 적음",
    },
    "facts_total": check["provenance"]["facts"],
    "facts_with_url": check["provenance"]["with_url"],
    "facts_synthetic": check["provenance"]["synthetic"],
    "facts_sample": sample,
    "not_available": facts["not_available"],
    "excluded": facts["excluded_evidence"],
    "funnel": [
        {"key": k, "label": lbl, "status": check["funnel"][k]}
        for k, lbl in [("S1_hook", "시선 끌기"), ("S2_problem", "고민"), ("S3_cause", "원인"), ("S4_mechanism", "작동 원리"),
                       ("S5_proof", "증거"), ("S6_objection", "망설임 해소"), ("S7_offer", "제안"), ("S8_assurance", "안심")]
    ],
    "check": {
        "errors": len(check["errors"]),
        "claim_blocks": check["counts"]["claim_blocks"],
        "hesitation": {"answered": 12, "scored": 13, "mention_only": 1, "excluded": 2, "rate": "92%"},
        "trap_test": "10/10",
    },
    "seller_questions": check["seller_questions"],
    "compare": [
        {"label": "근거 번호가 달린 사실 문장", "before": "60개", "after": "76개"},
        {"label": "구매 망설임 질문에 근거로 답한 비율", "before": "82% (스킨케어 11문항)", "after": "92% (디바이스 13문항)"},
        {"label": "합성(가짜) 자료", "before": "14개", "after": "0개"},
        {"label": "출처 주소가 붙은 사실", "before": "0/67", "after": "78/78"},
        {"label": "근거가 약해 일부러 뺀 주장", "before": "1건", "after": "8건"},
        {"label": "검사기 함정 시험", "before": "7/7", "after": "10/10"},
    ],
    "compare_note": "이전 최고 결과(타사 스킨케어 제품 시험작 v5)와 비교. 두 제품은 카테고리가 달라 망설임 질문 목록이 다르다.",
    "page": {"width": W, "height": H, "slices": slices},
}
(SITE / "data" / "demo-sjproof.json").write_text(json.dumps(demo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
print(f"page {W}x{H} -> {len(slices)} slices, {total_kb}KB; facts sample {len(sample)}; excluded {len(demo['excluded'])}")
