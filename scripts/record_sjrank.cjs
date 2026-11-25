// SJ RANK 로컬 앱(데모 데이터)을 Edge로 자동 조작하며 화면을 녹화한다.
// 실행: node scripts/record_sjrank.cjs  (SJ RANK가 http://localhost:3100 에서 켜져 있어야 함)
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(
  "C:/Users/윤성조/Downloads/리버스엔지니어링/sj-rank/node_modules/playwright-core"
));

const OUT = path.join(__dirname, "..", ".scratch", "video");
const BASE = "http://localhost:3100";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  // 개발 모드 표시(Next.js 배지) 숨기기
  await ctx.addInitScript(() => {
    const s = document.createElement("style");
    s.textContent = "nextjs-portal{display:none!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
  });
  const page = await ctx.newPage();
  // 미리 한 번씩 열어 개발 서버 컴파일·웹폰트 로딩을 끝내 둔다 (녹화에 안 들어감)
  for (const u of ["/plan", "/overview", "/site-audit", "/keywords", "/rank-tracker", "/plan"]) {
    await page.goto(BASE + u, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
  }
  await sleep(1500);
  // CDP 화면 전송(screencast)으로 프레임을 받아 시각과 함께 저장 → 나중에 ffmpeg로 이어 붙임
  const RUN = "frames-" + Date.now();
  const FR = path.join(OUT, RUN); fs.mkdirSync(FR, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => {
    const name = String(frames.length).padStart(5, "0") + ".jpg";
    fs.writeFileSync(path.join(FR, name), Buffer.from(f.data, "base64"));
    frames.push({ name, t: f.metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: 1280, maxHeight: 800, everyNthFrame: 1 });
  const smoothScroll = async (px, steps = 12) => {
    for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, px / steps); await sleep(120); }
  };

  // 1. 실행 플랜
  await page.goto(BASE + "/plan", { waitUntil: "networkidle" });
  await sleep(2500);
  await smoothScroll(700);
  await sleep(2000);
  await smoothScroll(700);
  await sleep(1800);

  // 2. 통합 대시보드 → 액션 플랜 행 열기
  await page.goto(BASE + "/overview", { waitUntil: "networkidle" });
  await sleep(2500);
  await smoothScroll(800);
  await sleep(1200);
  const row = page.locator("table tbody tr").first();
  if (await row.count()) { await row.click().catch(() => {}); await sleep(2500); await page.keyboard.press("Escape"); }
  await sleep(800);

  // 3. 사이트 감사
  await page.goto(BASE + "/site-audit", { waitUntil: "networkidle" });
  await sleep(2500);
  await smoothScroll(600);
  await sleep(1500);

  // 4. 키워드 리서치
  await page.goto(BASE + "/keywords", { waitUntil: "networkidle" });
  await sleep(2500);
  await smoothScroll(500);
  await sleep(1500);

  // 5. 순위 추적
  await page.goto(BASE + "/rank-tracker", { waitUntil: "networkidle" });
  await sleep(2500);
  await smoothScroll(600);
  await sleep(2000);

  await cdp.send("Page.stopScreencast").catch(() => {});
  await sleep(300);
  // ffmpeg concat 목록: 각 프레임이 다음 프레임까지 보이는 시간
  let list = "";
  for (let i = 0; i < frames.length; i++) {
    const next = i + 1 < frames.length ? frames[i + 1].t : frames[i].t + 0.5;
    const d = Math.max(0.01, Math.min(3, next - frames[i].t));
    list += `file '${RUN}/${frames[i].name}'
duration ${d.toFixed(3)}
`;
  }
  list += `file '${RUN}/${frames[frames.length - 1].name}'
`;
  fs.writeFileSync(path.join(OUT, "list.txt"), list);
  await ctx.close();
  await browser.close();
  console.log("frames:", frames.length, "seconds:", (frames[frames.length - 1].t - frames[0].t).toFixed(1));
})().catch((e) => { console.error(e); process.exit(1); });
