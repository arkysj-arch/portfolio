/**
 * 인플루언서 제안 자동화 체험형 데모 (T02)
 * Pure JavaScript (No external libraries)
 */

(function () {
  "use strict";

  // 상태 관리 객체
  const state = {
    currentStep: 1,
    data: null,
    isApproved: false,
    loaded: false
  };

  // DOM 요소 캐시
  const elements = {
    statusContainer: document.getElementById("demo-status-container"),
    contentArea: document.getElementById("demo-content-area"),
    stepViews: [
      document.getElementById("step-view-1"),
      document.getElementById("step-view-2"),
      document.getElementById("step-view-3"),
      document.getElementById("step-view-4"),
      document.getElementById("step-view-5")
    ],
    stepTabs: [
      document.getElementById("step-tab-1"),
      document.getElementById("step-tab-2"),
      document.getElementById("step-tab-3"),
      document.getElementById("step-tab-4"),
      document.getElementById("step-tab-5")
    ],
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnRestart: document.getElementById("btn-restart"),
    btnCaseReturn: document.getElementById("btn-case-return"),
    navHint: document.getElementById("demo-nav-hint"),
    // 1단계
    criteriaContainer: document.getElementById("step-1-criteria"),
    step1Candidates: document.getElementById("step-1-candidates"),
    // 2단계
    step2Candidates: document.getElementById("step-2-candidates"),
    // 3단계
    mailPreview: document.getElementById("step-3-mail-preview"),
    dmPreview: document.getElementById("step-3-dm-preview"),
    approvalBtnContainer: document.getElementById("approval-btn-container"),
    // 4단계
    step4Replies: document.getElementById("step-4-replies"),
    // 5단계
    step5Funnel: document.getElementById("step-5-funnel"),
    step5Rates: document.getElementById("step-5-rates"),
    step5Rules: document.getElementById("step-5-rules")
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
   * JSON 데이터 비동기 로드
   */
  async function initDemo() {
    try {
      const response = await fetch("../../data/demo-influencer.json");
      if (!response.ok) {
        throw new Error("데이터 응답 오류: " + response.status);
      }
      const data = await response.json();
      state.data = data;
      state.loaded = true;

      // 렌더링 실행
      renderStep1(data);
      renderStep2(data);
      renderStep3(data);
      renderStep4(data);
      renderStep5(data);

      // UI 활성화
      elements.statusContainer.style.display = "none";
      elements.contentArea.style.display = "block";

      // 이벤트 바인딩
      bindEvents();

      // 첫 단계 설정
      goToStep(1);
    } catch (err) {
      elements.statusContainer.innerHTML = `
        <div class="demo-status-banner is-error">
          데모 데이터를 불러오지 못했습니다
        </div>
      `;
    }
  }

  /**
   * 1단계 렌더링 (후보 발굴)
   */
  function renderStep1(data) {
    // 기준 바 (브랜드, 제품, 해시태그)
    const hashtagsHtml = (data.hashtags || [])
      .map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
      .join("");

    elements.criteriaContainer.innerHTML = `
      <div class="criteria-item">
        <span class="criteria-label">브랜드:</span>
        <span>${escapeHtml(data.brand)}</span>
      </div>
      <div class="criteria-item">
        <span class="criteria-label">타깃 제품:</span>
        <span>${escapeHtml(data.product)}</span>
      </div>
      <div class="criteria-item">
        <span class="criteria-label">발굴 키워드:</span>
        <div class="tag-list">${hashtagsHtml}</div>
      </div>
    `;

    // 후보 3명 카드
    const candidatesHtml = (data.candidates || []).map(candidate => {
      const sampleComments = (candidate.sample_comments || []).slice(0, 2);
      const commentsHtml = sampleComments.length > 0
        ? `<ul class="comments-list">
            ${sampleComments.map(c => `<li class="comment-bubble">“${escapeHtml(c)}”</li>`).join("")}
           </ul>`
        : `<div class="no-comment">구매 관련 댓글 예시 없음</div>`;

      return `
        <article class="candidate-card" aria-label="${escapeHtml(candidate.name)} 후보 정보">
          <div class="candidate-meta">
            <span class="candidate-handle">${escapeHtml(candidate.handle)}</span>
            <h3 class="candidate-name">${escapeHtml(candidate.name)}</h3>
            <span class="candidate-followers">팔로워 ${candidate.followers.toLocaleString()}명</span>
          </div>

          <div class="candidate-stat-row">
            <span class="stat-label">구매 문의 댓글</span>
            <span class="stat-val-highlight">${candidate.purchase_comments.buy} / ${candidate.purchase_comments.total}개</span>
          </div>

          <div class="comments-section">
            <span class="comments-title">수집된 댓글 예시 (최대 2개)</span>
            ${commentsHtml}
          </div>
        </article>
      `;
    }).join("");

    elements.step1Candidates.innerHTML = candidatesHtml;
  }

  /**
   * 2단계 렌더링 (적격 점수)
   */
  function renderStep2(data) {
    const weights = data.weights || [];
    const weightMap = {};
    weights.forEach(w => {
      weightMap[w.key] = w;
    });

    const candidatesHtml = (data.candidates || []).map(candidate => {
      const isEligible = candidate.verdict === "적격";
      const cardClass = isEligible ? "candidate-card" : "candidate-card is-rejected";
      const badgeClass = isEligible ? "verdict-badge is-eligible" : "verdict-badge is-rejected";
      const totalScoreClass = isEligible ? "total-score-badge is-eligible" : "total-score-badge";

      // 가중치별 3개 막대
      const scoreBarsHtml = weights.map(w => {
        const scoreVal = (candidate.score && candidate.score[w.key]) !== undefined ? candidate.score[w.key] : 0;
        const percentage = Math.min(100, Math.round((scoreVal / w.max) * 100));

        return `
          <div class="score-bar-group">
            <div class="score-bar-labels">
              <span>${escapeHtml(w.label)}</span>
              <strong>${scoreVal} / ${w.max}</strong>
            </div>
            <div class="score-bar-track" aria-hidden="true">
              <div class="score-bar-fill" data-percent="${percentage}" style="width: 0%;"></div>
            </div>
          </div>
        `;
      }).join("");

      return `
        <article class="${cardClass}" aria-label="${escapeHtml(candidate.name)} 평가 점수">
          <div>
            <div class="verdict-header">
              <span class="${badgeClass}">${escapeHtml(candidate.verdict)}</span>
              <span class="${totalScoreClass}">${candidate.score ? candidate.score.total : 0}점 / 100</span>
            </div>
            <div class="candidate-meta" style="margin-top: 0.5rem; margin-bottom: 1.25rem;">
              <span class="candidate-handle">${escapeHtml(candidate.handle)}</span>
              <h3 class="candidate-name">${escapeHtml(candidate.name)}</h3>
            </div>
          </div>

          <div class="score-bars-container">
            ${scoreBarsHtml}
          </div>

          <div class="verdict-reason-box">
            <div class="verdict-reason-title">판정 사유</div>
            <div>${escapeHtml(candidate.reason)}</div>
          </div>
        </article>
      `;
    }).join("");

    elements.step2Candidates.innerHTML = candidatesHtml;
  }

  /**
   * 2단계 진입 시 점수 막대 애니메이션 실행
   */
  function triggerScoreBarAnimation() {
    const bars = elements.step2Candidates.querySelectorAll(".score-bar-fill");
    bars.forEach(bar => {
      const targetPercent = bar.getAttribute("data-percent") || "0";
      // 리셋 후 프레임 대기 후 채우기
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = targetPercent + "%";
        });
      });
    });
  }

  /**
   * 3단계 렌더링 (제안 초안)
   */
  function renderStep3(data) {
    const proposal = data.proposal || {};
    const bodyParagraphs = (proposal.body || []).map(p => `<p>${escapeHtml(p)}</p>`).join("");

    // 메일 미리보기 (이메일 주소 대신 받는 사람 핸들 표시)
    elements.mailPreview.innerHTML = `
      <div class="mail-card-header">
        <div class="mail-meta-row">
          <span class="mail-meta-label">받는 사람</span>
          <span class="mail-meta-value">${escapeHtml(proposal.to)}</span>
        </div>
        <div class="mail-meta-row">
          <span class="mail-meta-label">제목</span>
          <span class="mail-meta-value">${escapeHtml(proposal.subject)}</span>
        </div>
      </div>
      <div class="mail-body-content">
        ${bodyParagraphs}
      </div>
    `;

    // DM 미리보기
    elements.dmPreview.innerHTML = `
      <div class="dm-card-title">
        <span class="step-header-tag" style="margin: 0;">인스타그램 DM 문구</span>
      </div>
      <div class="dm-text-bubble">
        ${escapeHtml(proposal.dm)}
      </div>
    `;

    // 승인 버튼 초기화
    resetApprovalUI();
  }

  /**
   * 3단계 승인 UI 리셋
   */
  function resetApprovalUI() {
    elements.approvalBtnContainer.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-approve">발송 승인</button>
    `;
    const btnApprove = document.getElementById("btn-approve");
    if (btnApprove) {
      btnApprove.addEventListener("click", handleApproval);
    }
  }

  /**
   * 3단계 승인 처리
   */
  function handleApproval() {
    state.isApproved = true;

    // 승인 완료 표시로 변경
    elements.approvalBtnContainer.innerHTML = `
      <div class="approval-status-badge">
        <span>✓</span> 승인됨 · 발송 완료(데모)
      </div>
    `;

    // 4, 5단계 탭 버튼 활성화
    elements.stepTabs[3].disabled = false;
    elements.stepTabs[4].disabled = false;

    // 하단 네비게이션 상태 업데이트
    updateNavControls();
  }

  /**
   * 4단계 렌더링 (회신 분류)
   */
  function renderStep4(data) {
    const cardsHtml = (data.candidates || []).map(candidate => {
      const isRejected = !candidate.reply;
      const cardClass = isRejected ? "reply-card is-rejected" : "reply-card";

      if (isRejected) {
        return `
          <article class="${cardClass}" aria-label="${escapeHtml(candidate.name)} 회신 결과">
            <div>
              <div class="reply-badge-row">
                <span class="reply-type-badge type-none">미발송</span>
                <span class="badge badge-prototype">${escapeHtml(candidate.verdict)}</span>
              </div>
              <div class="candidate-meta" style="margin-top: 0.5rem; margin-bottom: 1rem;">
                <span class="candidate-handle">${escapeHtml(candidate.handle)}</span>
                <h3 class="candidate-name">${escapeHtml(candidate.name)}</h3>
              </div>
            </div>

            <div class="reply-text-box" style="display: flex; align-items: center; justify-content: center; color: var(--color-muted); font-style: italic;">
              연락하지 않음 (적격 심사 탈락)
            </div>

            <div class="next-action-box" style="border-left-color: var(--color-muted);">
              <span class="next-action-label">다음 행동</span>
              <span class="next-action-value" style="color: var(--color-muted);">제안 미발송 · 재연락 제외</span>
            </div>
          </article>
        `;
      }

      const replyType = candidate.reply.type || "";
      const isAccept = replyType === "수락";
      const typeBadgeClass = isAccept ? "reply-type-badge type-accept" : "reply-type-badge type-inquiry";
      const nextActionText = isAccept
        ? "수락 → 제품 출고대기 등록"
        : "문의 → 담당자 확인 및 맞춤 답변 필요";

      return `
        <article class="${cardClass}" aria-label="${escapeHtml(candidate.name)} 회신 결과">
          <div>
            <div class="reply-badge-row">
              <span class="${typeBadgeClass}">${escapeHtml(replyType)}</span>
              <span class="badge badge-prototype">${escapeHtml(candidate.final_status)}</span>
            </div>
            <div class="candidate-meta" style="margin-top: 0.5rem; margin-bottom: 1rem;">
              <span class="candidate-handle">${escapeHtml(candidate.handle)}</span>
              <h3 class="candidate-name">${escapeHtml(candidate.name)}</h3>
            </div>
          </div>

          <div class="reply-text-box">
            ${escapeHtml(candidate.reply.text)}
          </div>

          <div class="next-action-box">
            <span class="next-action-label">다음 행동</span>
            <span class="next-action-value">${escapeHtml(nextActionText)}</span>
          </div>
        </article>
      `;
    }).join("");

    elements.step4Replies.innerHTML = cardsHtml;
  }

  /**
   * 5단계 렌더링 (성과 보고)
   */
  function renderStep5(data) {
    // 퍼널 가로 막대 (막대 안 중복 숫자 제거, 오른쪽 수치만 유지)
    const funnelList = data.funnel || [];
    const maxFunnelCount = funnelList.length > 0 ? funnelList[0].count : 3;

    const funnelHtml = funnelList.map(item => {
      const percentage = Math.max(8, Math.round((item.count / maxFunnelCount) * 100));
      return `
        <div class="funnel-row">
          <span class="funnel-label">${escapeHtml(item.label)}</span>
          <div class="funnel-bar-track" aria-hidden="true">
            <div class="funnel-bar-fill" style="width: ${percentage}%;"></div>
          </div>
          <span class="funnel-count">${item.count}명</span>
        </div>
      `;
    }).join("");
    elements.step5Funnel.innerHTML = funnelHtml;

    // 전환율 3개 카드
    const rates = data.rates || {};
    elements.step5Rates.innerHTML = `
      <div class="rate-card">
        <span class="rate-val">${escapeHtml(rates.eligible || "67%")}</span>
        <span class="rate-title">적격 판정률</span>
        <span class="rate-desc">수집된 후보 3명 중 2명 적격 판정</span>
      </div>
      <div class="rate-card">
        <span class="rate-val">${escapeHtml(rates.reply || "100%")}</span>
        <span class="rate-title">제안 회신율</span>
        <span class="rate-desc">승인 제안 2건 중 2건 전원 회신 수신</span>
      </div>
      <div class="rate-card">
        <span class="rate-val">${escapeHtml(rates.ship || "50%")}</span>
        <span class="rate-title">출고 전환율</span>
        <span class="rate-desc">회신자 중 즉시 협업 수락 1건 출고 연계</span>
      </div>
    `;

    // 안전 규칙 4개
    const rulesList = (data.rules || []).map((rule, idx) => `
      <li class="rule-item">
        <span class="rule-num">규칙 ${idx + 1}</span>
        <span>${escapeHtml(rule)}</span>
      </li>
    `).join("");
    elements.step5Rules.innerHTML = rulesList;
  }

  /**
   * 특정 단계로 전환
   */
  function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 5) return;

    // 3단계 승인 전 4, 5단계 접근 방지
    if (!state.isApproved && stepNum > 3) {
      alert("3단계에서 사람이 제안서 발송을 승인해야 다음 단계로 이동할 수 있습니다.");
      return;
    }

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

    // 2단계 진입 시 점수 막대 애니메이션 재실행
    if (stepNum === 2) {
      triggerScoreBarAnimation();
    }

    // 하단 네비게이션 제어
    updateNavControls();

    // 부드럽게 상단 이동 (데모 영역 기준)
    elements.contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * 하단 네비게이션 버튼 및 안내 문구 갱신
   */
  function updateNavControls() {
    const step = state.currentStep;

    // 이전 버튼
    elements.btnPrev.disabled = step === 1;

    // 5단계 여부에 따른 버튼 표시 전환
    if (step === 5) {
      elements.btnNext.style.display = "none";
      elements.btnRestart.style.display = "inline-flex";
      elements.btnCaseReturn.style.display = "inline-flex";
      elements.navHint.textContent = "전체 5단계 프로세스가 완료되었습니다.";
      return;
    }

    // 1~4단계일 때
    elements.btnNext.style.display = "inline-flex";
    elements.btnRestart.style.display = "none";
    elements.btnCaseReturn.style.display = "none";

    // 3단계 승인 전 [다음] 비활성화 및 안내 문구
    if (step === 3 && !state.isApproved) {
      elements.btnNext.disabled = true;
      elements.navHint.textContent = "사람이 승인해야 발송됩니다";
    } else {
      elements.btnNext.disabled = false;
      elements.navHint.textContent = "";
    }
  }

  /**
   * 처음부터 다시 보기 리셋
   */
  function restartDemo() {
    state.isApproved = false;

    // 4, 5단계 탭 비활성화
    elements.stepTabs[3].disabled = true;
    elements.stepTabs[4].disabled = true;

    // 3단계 승인 UI 복구
    resetApprovalUI();

    // 1단계로 이동
    goToStep(1);
  }

  /**
   * 사용자 이벤트 리스너 바인딩
   */
  function bindEvents() {
    // 탭 버튼 클릭
    elements.stepTabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => {
        goToStep(idx + 1);
      });
    });

    // 이전 버튼 클릭
    elements.btnPrev.addEventListener("click", () => {
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });

    // 다음 버튼 클릭
    elements.btnNext.addEventListener("click", () => {
      if (state.currentStep < 5) {
        goToStep(state.currentStep + 1);
      }
    });

    // 처음부터 다시 보기 버튼 클릭
    elements.btnRestart.addEventListener("click", () => {
      restartDemo();
    });
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemo);
  } else {
    initDemo();
  }
})();
