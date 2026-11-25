/**
 * SJ 프루프 체험형 데모 스크립트 (T07)
 * Pure JavaScript (No external libraries)
 */

(function () {
  "use strict";

  // 상태 관리 객체
  const state = {
    currentStep: 1,
    data: null,
    loaded: false
  };

  // 종류 레이블 한국어 매핑 사전
  const KIND_MAP = {
    notice: "상품정보고시",
    brand_page: "공식 상세 문구",
    evidence: "시험·인증",
    official_photo: "공식 사진",
    price: "가격",
    policy: "배송·교환"
  };

  // DOM 요소 캐시
  const elements = {
    statusContainer: document.getElementById("demo-status-container"),
    contentArea: document.getElementById("demo-content-area"),
    stepViews: [
      document.getElementById("step-view-1"),
      document.getElementById("step-view-2"),
      document.getElementById("step-view-3"),
      document.getElementById("step-view-4")
    ],
    stepTabs: [
      document.getElementById("step-tab-1"),
      document.getElementById("step-tab-2"),
      document.getElementById("step-tab-3"),
      document.getElementById("step-tab-4")
    ],
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnRestart: document.getElementById("btn-restart"),
    btnCaseReturn: document.getElementById("btn-case-return"),
    navHint: document.getElementById("demo-nav-hint"),

    // 1단계
    step1Inputs: document.getElementById("step-1-inputs"),
    step1NotAvailable: document.getElementById("step-1-not-available"),

    // 2단계
    step2Stats: document.getElementById("step-2-stats"),
    step2Facts: document.getElementById("step-2-facts"),

    // 3단계
    step3Excluded: document.getElementById("step-3-excluded"),
    step3Funnel: document.getElementById("step-3-funnel"),
    step3Metrics: document.getElementById("step-3-metrics"),
    step3SellerQuestions: document.getElementById("step-3-seller-questions"),

    // 4단계
    step4Dimensions: document.getElementById("step-4-dimensions"),
    step4Slices: document.getElementById("step-4-slices")
  };

  /**
   * HTML 특수문자 이스케이프 함수
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * 출처 주소 링크 또는 텍스트 포맷팅 함수
   * http로 시작하면 a 태그 생성, 아니면 일반 텍스트
   */
  function formatSourceUrl(urlStr) {
    if (!urlStr) return "";
    const trimmed = String(urlStr).trim();

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      // 주소 뒤에 붙은 설명 괄호 분리 (예: https://... (상품 정보 고시))
      const firstSpaceIdx = trimmed.indexOf(" ");
      let href = trimmed;
      let extra = "";

      if (firstSpaceIdx > -1) {
        href = trimmed.substring(0, firstSpaceIdx);
        extra = trimmed.substring(firstSpaceIdx);
      }

      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="source-link">${escapeHtml(href)}</a>${escapeHtml(extra)}`;
    }

    return `<span class="source-text">${escapeHtml(trimmed)}</span>`;
  }

  /**
   * 데모 데이터 비동기 초기화
   */
  async function initDemo() {
    try {
      const response = await fetch("../../data/demo-sjproof.json");
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const data = await response.json();
      state.data = data;
      state.loaded = true;

      // 단계별 렌더링
      renderStep1(data);
      renderStep2(data);
      renderStep3(data);
      renderStep4(data);

      // UI 표시 전환
      if (elements.statusContainer) elements.statusContainer.style.display = "none";
      if (elements.contentArea) elements.contentArea.style.display = "block";

      // 이벤트 리스너 등록
      bindEvents();

      // 1단계 시작
      goToStep(1);
    } catch (err) {
      if (elements.statusContainer) {
        elements.statusContainer.innerHTML = `
          <div class="demo-status-banner is-error">
            데모 데이터를 불러오지 못했습니다.
          </div>
        `;
      }
    }
  }

  /**
   * 1단계: 입력·리서치 렌더링
   */
  function renderStep1(data) {
    const input = data.input || {};

    elements.step1Inputs.innerHTML = `
      <div class="input-info-card">
        <span class="input-card-label">대상 제품</span>
        <div class="input-card-value">${escapeHtml(data.product || "")}</div>
        <div class="input-card-desc">공식몰 공개 제품명 및 모델명 기준</div>
      </div>
      <div class="input-info-card">
        <span class="input-card-label">수집 사진</span>
        <div class="input-card-value">${escapeHtml(input.photos || "")}</div>
        <div class="input-card-desc">초상권 및 권리 관계 보호 원칙 적용</div>
      </div>
      <div class="input-info-card">
        <span class="input-card-label">리서치 방식</span>
        <div class="input-card-value">${escapeHtml(input.research || "")}</div>
        <div class="input-card-desc">상세 이미지 각주와 수치 조건을 그대로 옮겨 적음</div>
      </div>
    `;

    const notAvailableList = data.not_available || [];
    const notAvailableItemsHtml = notAvailableList
      .map(item => `<li class="not-available-item">${escapeHtml(item)}</li>`)
      .join("");

    elements.step1NotAvailable.innerHTML = `
      <div class="not-available-header">
        <div class="not-available-title">못 구한 자료 목록</div>
        <span class="not-available-badge">없는 건 지어내지 않고 비워 둠</span>
      </div>
      <ul class="not-available-list">
        ${notAvailableItemsHtml}
      </ul>
    `;
  }

  /**
   * 2단계: 사실 목록 렌더링
   */
  function renderStep2(data) {
    // 숫자 타일 3개
    elements.step2Stats.innerHTML = `
      <div class="stat-tile">
        <span class="stat-tile-num">${data.facts_total || 0}개</span>
        <span class="stat-tile-label">추출된 총 사실 문장</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-num highlight">${data.facts_with_url || 0}/${data.facts_total || 0}</span>
        <span class="stat-tile-label">공식몰 출처 주소 보유 (100%)</span>
      </div>
      <div class="stat-tile">
        <span class="stat-tile-num">${data.facts_synthetic !== undefined ? data.facts_synthetic : 0}개</span>
        <span class="stat-tile-label">합성(가짜) 자료</span>
      </div>
    `;

    // 사실 샘플 카드 12개
    const factsSample = data.facts_sample || [];
    const factsHtml = factsSample.map(fact => {
      const kindKo = KIND_MAP[fact.kind] || fact.kind || "기타";
      const sourceFormatted = formatSourceUrl(fact.url);

      return `
        <article class="fact-card" aria-label="사실 카드 ${escapeHtml(fact.id)}">
          <div>
            <div class="fact-card-header">
              <span class="fact-id-badge">${escapeHtml(fact.id)}</span>
              <span class="fact-kind-badge">${escapeHtml(kindKo)}</span>
            </div>
            <div class="fact-card-body" style="margin-top: 0.85rem;">
              ${escapeHtml(fact.text)}
            </div>
          </div>
          <div class="fact-card-footer">
            <span class="fact-url-label">출처</span>
            ${sourceFormatted}
          </div>
        </article>
      `;
    }).join("");

    elements.step2Facts.innerHTML = factsHtml;
  }

  /**
   * 3단계: 검사 렌더링
   */
  function renderStep3(data) {
    // 일부러 뺀 주장 8건 (excluded)
    const excludedList = data.excluded || [];
    const excludedHtml = excludedList.map((item, idx) => `
      <article class="excluded-card" aria-label="제외된 주장 ${idx + 1}">
        <div class="excluded-claim">${escapeHtml(item.text)}</div>
        <div class="excluded-reason">
          <span class="excluded-reason-label">제외 이유:</span>
          <span>${escapeHtml(item.reason)}</span>
        </div>
      </article>
    `).join("");
    elements.step3Excluded.innerHTML = excludedHtml;

    // 퍼널 8칸 (funnel)
    const funnelList = data.funnel || [];
    const funnelHtml = funnelList.map(step => `
      <div class="funnel-cell is-filled">
        <span class="funnel-cell-name">${escapeHtml(step.label)}</span>
        <span class="funnel-cell-status">${escapeHtml(step.status || "있음")}</span>
      </div>
    `).join("");
    elements.step3Funnel.innerHTML = funnelHtml;

    // 검사 지표 3개 (망설임 질문, 함정 시험, 오류)
    const check = data.check || {};
    const hesitation = check.hesitation || {};
    elements.step3Metrics.innerHTML = `
      <div class="check-metric-box">
        <div class="check-metric-val highlight">${hesitation.answered || 0}/${hesitation.scored || 0} (${escapeHtml(hesitation.rate || "")})</div>
        <div class="check-metric-title">망설임 질문 근거 답변율</div>
        <div class="check-metric-sub">디바이스 전용 13문항 중 12문항 충족</div>
      </div>
      <div class="check-metric-box">
        <div class="check-metric-val">${escapeHtml(check.trap_test || "10/10")}</div>
        <div class="check-metric-title">검사기 함정 시험</div>
        <div class="check-metric-sub">모든 결함 유도 시험 통과</div>
      </div>
      <div class="check-metric-box">
        <div class="check-metric-val">${check.errors !== undefined ? check.errors : 0}건</div>
        <div class="check-metric-title">검사 오류 발견</div>
        <div class="check-metric-sub">의료기기 오인·표절 0건</div>
      </div>
    `;

    // 판매자에게 물을 것 (seller_questions 5개)
    const sellerQuestions = data.seller_questions || [];
    const sellerQuestionsHtml = sellerQuestions.map((q, idx) => `
      <li class="seller-question-item">
        <span class="seller-question-num">질문 ${idx + 1}</span>
        <span>${escapeHtml(q)}</span>
      </li>
    `).join("");
    elements.step3SellerQuestions.innerHTML = sellerQuestionsHtml;
  }

  /**
   * 4단계: 완성 페이지 렌더링
   */
  function renderStep4(data) {
    const page = data.page || {};

    // 규격 문구: 860px × 29,448px 실제 출력물
    const width = page.width || 860;
    const height = page.height ? page.height.toLocaleString() : "29,448";
    elements.step4Dimensions.textContent = `${width}px × ${height}px 실제 출력물`;

    // 조각 이미지 19장 순서대로 쌓기
    const slices = page.slices || [];
    const slicesHtml = slices.map((slice, idx) => `
      <img
        src="../../${escapeHtml(slice.src)}"
        width="${slice.w || 860}"
        height="${slice.h || 1600}"
        alt="상세페이지 조각 ${idx + 1}"
        loading="lazy"
        class="slice-img"
      >
    `).join("");
    elements.step4Slices.innerHTML = slicesHtml;
  }

  /**
   * 단계 전환 함수
   */
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 4) return;

    state.currentStep = stepNum;

    // 뷰 전환
    elements.stepViews.forEach((view, idx) => {
      if (idx + 1 === stepNum) {
        view.classList.add("is-active");
      } else {
        view.classList.remove("is-active");
      }
    });

    // 탭 상태 업데이트
    elements.stepTabs.forEach((tab, idx) => {
      if (idx + 1 === stepNum) {
        tab.setAttribute("aria-current", "step");
      } else {
        tab.removeAttribute("aria-current");
      }
    });

    // 하단 네비게이션 제어
    updateNavControls();

    // 상단 스크롤 이동
    elements.contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * 하단 네비게이션 버튼 및 안내 문구 갱신
   */
  function updateNavControls() {
    const step = state.currentStep;

    // 이전 버튼 제어
    elements.btnPrev.disabled = step === 1;

    // 4단계 도달 여부에 따른 버튼 표시 전환
    if (step === 4) {
      elements.btnNext.style.display = "none";
      elements.btnRestart.style.display = "inline-flex";
      elements.btnCaseReturn.style.display = "inline-flex";
      elements.navHint.textContent = "전체 4단계 프로세스 확인이 완료되었습니다.";
      return;
    }

    elements.btnNext.style.display = "inline-flex";
    elements.btnRestart.style.display = "none";
    elements.btnCaseReturn.style.display = "none";
    elements.navHint.textContent = `${step} / 4 단계`;
  }

  /**
   * 처음부터 다시 보기 리셋
   */
  function restartDemo() {
    // 휴대폰 목업 스크롤 상단 리셋
    const phoneFrame = document.getElementById("phone-mockup-frame");
    if (phoneFrame) {
      phoneFrame.scrollTop = 0;
    }
    goToStep(1);
  }

  /**
   * 이벤트 리스너 바인딩
   */
  function bindEvents() {
    // 탭 버튼 클릭
    elements.stepTabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => {
        goToStep(idx + 1);
      });
    });

    // 이전 단계 버튼
    elements.btnPrev.addEventListener("click", () => {
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });

    // 다음 단계 버튼
    elements.btnNext.addEventListener("click", () => {
      if (state.currentStep < 4) {
        goToStep(state.currentStep + 1);
      }
    });

    // 처음부터 다시 보기 버튼
    elements.btnRestart.addEventListener("click", () => {
      restartDemo();
    });
  }

  // DOM 로드 완료 시 초기화 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemo);
  } else {
    initDemo();
  }
})();
