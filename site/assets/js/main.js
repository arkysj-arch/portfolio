// 프로젝트 데이터 기본값 (file:// 프로토콜 또는 fetch 실패 시 폴백 데이터로 사용)
const defaultProjects = [
  {
    id: "influencer",
    title: "인플루언서 제안 자동화",
    summary: "팔로워 수 대신 '구매 문의 댓글 비율'로 후보 선별부터 제안·출고까지 자동화",
    badge: "프로토타입",
    link: "cases/influencer/",
    ready: true
  },
  {
    id: "sj-proof",
    title: "SJ 프루프",
    summary: "받지 않은 사실은 쓰지 않고 설득 장치 16종으로 조립하는 AI 상세페이지 제작기",
    badge: "프로토타입",
    link: "cases/sj-proof/",
    ready: true
  },
  {
    id: "sj-rank",
    title: "SJ RANK",
    summary: "진단에서 끝내지 않고 90일 실행 플랜까지 제시하는 B2B SEO 진단·실행 대시보드",
    badge: "프로토타입",
    link: "cases/sj-rank/",
    ready: true
  },
  {
    id: "shortform",
    title: "숏폼 영상 생성기",
    summary: "원작을 베끼지 않고 컷·자막·사운드 구조만 학습해 A/B 테스트 소재를 제작하는 생성기",
    badge: "프로토타입",
    link: "cases/shortform/",
    ready: true
  },
  {
    id: "orchestration",
    title: "오케스트레이션",
    summary: "Claude 지휘와 Gemini 제작으로 이 포트폴리오 웹사이트를 구축한 AI 협업 방식",
    badge: "프로토타입",
    link: "cases/orchestration/",
    ready: true
  }
];

// 프로젝트 카드 렌더링 함수
function renderProjects(projects) {
  const container = document.getElementById("project-list");
  if (!container) return;

  const html = projects.map((item, index) => {
    const num = String(index + 1).padStart(2, "0");
    const badgeClass = item.badge === "진행 중" ? "badge-wip" : "badge-prototype";
    const isReady = item.ready === true;
    const linkText = isReady ? "케이스 보기 &rarr;" : "케이스 준비 중";
    const linkClass = isReady ? "card-link-text" : "card-link-text disabled";

    if (isReady) {
      return `
        <a href="${item.link}" class="project-card">
          <div class="card-top">
            <span class="card-num">${num}</span>
            <span class="badge ${badgeClass}">${item.badge}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-summary">${item.summary}</p>
          <div class="card-footer">
            <span class="${linkClass}">${linkText}</span>
          </div>
        </a>
      `;
    }

    return `
      <div class="project-card inactive" aria-disabled="true">
        <div class="card-top">
          <span class="card-num">${num}</span>
          <span class="badge ${badgeClass}">${item.badge}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-summary">${item.summary}</p>
        <div class="card-footer">
          <span class="${linkClass}">${linkText}</span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

// HTML 이스케이프 헬퍼
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 경력 섹션 렌더링 함수
function renderCareer(career) {
  const container = document.getElementById("career-container");
  if (!container) return;

  if (!career) {
    container.innerHTML = '<p class="career-error-notice">경력 정보를 불러오지 못했습니다</p>';
    return;
  }

  // 1. 하이라이트 5개 타일
  const highlights = Array.isArray(career.highlights) ? career.highlights : [];
  const highlightsHtml = highlights.map((item) => `
    <div class="career-stat-card">
      <div class="career-stat-value">${escapeHtml(item.value)}</div>
      <div class="career-stat-label">${escapeHtml(item.label)}</div>
    </div>
  `).join("");

  // 2. 세로 타임라인 3개
  const jobs = Array.isArray(career.jobs) ? career.jobs : [];
  const jobsHtml = jobs.map((job) => {
    const points = Array.isArray(job.points) ? job.points : [];
    const pointsHtml = points.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-header">
          <div class="timeline-title-wrap">
            <h3 class="timeline-company">${escapeHtml(job.company)}</h3>
            <span class="timeline-role">${escapeHtml(job.role)}</span>
          </div>
          <span class="timeline-period">${escapeHtml(job.period)}</span>
        </div>
        <ul class="timeline-points">
          ${pointsHtml}
        </ul>
      </div>
    `;
  }).join("");

  // 3. 이전 경력 (earlier)
  const earlierHtml = career.earlier ? `
    <div class="career-earlier-box">
      <span class="career-earlier-label">이전 경력</span>
      <p class="career-earlier-desc">${escapeHtml(career.earlier)}</p>
    </div>
  ` : "";

  // 4. 다운로드 (downloads)
  const downloads = Array.isArray(career.downloads) ? career.downloads : [];
  const downloadsHtml = downloads.map((item) => {
    const btn = item.href
      ? `<a href="${escapeHtml(item.href)}" class="btn btn-secondary" download>${escapeHtml(item.label)}</a>`
      : `<button type="button" class="btn btn-secondary is-disabled" disabled aria-disabled="true">${escapeHtml(item.label)}</button>`;
    const note = item.note
      ? `<span class="download-note">${escapeHtml(item.note)}</span>`
      : "";
    return `
      <div class="download-item">
        ${btn}
        ${note}
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="section-header">
      <div class="section-label">경력</div>
      <h2 class="section-title">17년, 직접 매출을 만든 경력</h2>
      <p class="section-subtitle">${escapeHtml(career.summary || "")}</p>
    </div>

    <div class="career-highlights-grid">
      ${highlightsHtml}
    </div>

    <div class="career-timeline">
      ${jobsHtml}
    </div>

    ${earlierHtml}

    ${downloadsHtml ? `<div class="career-downloads">${downloadsHtml}</div>` : ""}
  `;
}

// 그 밖의 작업 섹션 렌더링 함수
function renderOthers(career) {
  const container = document.getElementById("others-container");
  if (!container) return;

  const others = career && Array.isArray(career.others) ? career.others : [];
  if (others.length === 0) {
    container.innerHTML = "";
    return;
  }

  const cardsHtml = others.map((item) => `
    <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener" class="other-card">
      <div class="other-card-header">
        <h3 class="other-card-title">${escapeHtml(item.title)}</h3>
        <span class="other-card-arrow" aria-hidden="true">&nearr;</span>
      </div>
      <p class="other-card-desc">${escapeHtml(item.desc)}</p>
    </a>
  `).join("");

  container.innerHTML = `
    <div class="section-header">
      <div class="section-label">그 밖의 작업</div>
      <h2 class="section-title">AI로 만든 다른 작업</h2>
    </div>
    <div class="others-grid">
      ${cardsHtml}
    </div>
  `;
}

// 연락 섹션 렌더링 함수
function renderContact(career) {
  const container = document.getElementById("contact-container");
  if (!container) return;

  const email = career && career.contact && career.contact.email ? career.contact.email : null;
  const emailDisplay = email
    ? `<a href="mailto:${escapeHtml(email)}" class="contact-email-link">${escapeHtml(email)}</a>`
    : `<span class="contact-email-placeholder">[이메일 확인 필요]</span>`;

  container.innerHTML = `
    <div class="section-header">
      <div class="section-label">연락</div>
      <h2 class="section-title">함께 일할 곳을 찾고 있습니다</h2>
    </div>
    <div class="contact-card">
      <div class="contact-info-row">
        <span class="contact-info-label">이메일</span>
        <div class="contact-info-val">${emailDisplay}</div>
      </div>
    </div>
  `;
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  // 프로젝트 데이터 fetch
  fetch("data/projects.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("네트워크 응답 오류");
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        renderProjects(data);
      } else {
        renderProjects(defaultProjects);
      }
    })
    .catch(() => {
      // file:// 환경 또는 CORS 제한 시 기본값 사용
      renderProjects(defaultProjects);
    });

  // 경력 데이터 fetch
  fetch("data/career.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("네트워크 응답 오류");
      }
      return response.json();
    })
    .then((careerData) => {
      renderCareer(careerData);
      renderOthers(careerData);
      renderContact(careerData);
    })
    .catch(() => {
      const careerContainer = document.getElementById("career-container");
      if (careerContainer) {
        careerContainer.innerHTML = '<p class="career-error-notice">경력 정보를 불러오지 못했습니다</p>';
      }
    });
});
