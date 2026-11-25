/**
 * SJ RANK 화면 둘러보기 데모 (T04)
 * Pure JavaScript (No external libraries)
 */

(function () {
  "use strict";

  // 상태 관리 객체
  const state = {
    currentIndex: 0,
    data: null,
    loaded: false
  };

  // DOM 요소 캐시
  const elements = {
    noticeBar: document.getElementById("demo-notice-bar"),
    noticeText: document.getElementById("demo-notice-text"),
    statusContainer: document.getElementById("demo-status-container"),
    contentArea: document.getElementById("demo-content-area"),
    tabList: document.getElementById("tab-list"),
    panelContainer: document.getElementById("tab-panel-container")
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
   * 탭 전환 함수
   */
  function selectTab(targetIndex) {
    if (!state.data || !state.data.screens || !state.data.screens[targetIndex]) return;

    state.currentIndex = targetIndex;

    const tabs = elements.tabList.querySelectorAll('button[role="tab"]');
    const panels = elements.panelContainer.querySelectorAll('div[role="tabpanel"]');

    tabs.forEach((tab, idx) => {
      const isSelected = idx === targetIndex;
      tab.setAttribute("aria-selected", isSelected ? "true" : "false");
      tab.tabIndex = isSelected ? 0 : -1;
      if (isSelected) {
        tab.classList.add("is-active");
        // 모바일 가로 스크롤 영역에서 현재 탭이 보이도록 부드럽게 스크롤
        tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      } else {
        tab.classList.remove("is-active");
      }
    });

    panels.forEach((panel, idx) => {
      if (idx === targetIndex) {
        panel.hidden = false;
        panel.classList.add("is-active");
      } else {
        panel.hidden = true;
        panel.classList.remove("is-active");
      }
    });
  }

  /**
   * 키보드 탐색 이벤트 처리 (WAI-ARIA Tablist 표준)
   */
  function handleTabKeydown(e) {
    const tabs = Array.from(elements.tabList.querySelectorAll('button[role="tab"]'));
    const count = tabs.length;
    let nextIndex = state.currentIndex;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (state.currentIndex + 1) % count;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (state.currentIndex - 1 + count) % count;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = count - 1;
    } else {
      return;
    }

    selectTab(nextIndex);
    tabs[nextIndex].focus();
  }

  /**
   * UI 렌더링 함수
   */
  function renderDemo(data) {
    // 1. 상단 안내 띠 렌더링
    if (data.notice) {
      elements.noticeText.textContent = data.notice;
      elements.noticeBar.style.display = "block";
    }

    // 2. 탭 버튼 목록 및 패널 렌더링
    elements.tabList.innerHTML = "";
    elements.panelContainer.innerHTML = "";

    const screens = data.screens || [];

    screens.forEach((screen, index) => {
      // 탭 버튼 생성
      const tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.role = "tab";
      tabBtn.id = "tab-" + escapeHtml(screen.id);
      tabBtn.className = "demo-tab-btn" + (index === 0 ? " is-active" : "");
      tabBtn.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tabBtn.setAttribute("aria-controls", "panel-" + escapeHtml(screen.id));
      tabBtn.tabIndex = index === 0 ? 0 : -1;
      tabBtn.textContent = screen.tab;

      tabBtn.addEventListener("click", () => {
        selectTab(index);
      });

      elements.tabList.appendChild(tabBtn);

      // 탭 패널 생성
      const panel = document.createElement("div");
      panel.role = "tabpanel";
      panel.id = "panel-" + escapeHtml(screen.id);
      panel.className = "demo-tab-panel" + (index === 0 ? " is-active" : "");
      panel.setAttribute("aria-labelledby", "tab-" + escapeHtml(screen.id));
      panel.hidden = index !== 0;

      // 이미지 경로: JSON의 img는 site/ 기준이므로 데모 페이지에서는 ../../ + img
      const imgSrc = "../../" + screen.img;
      const imgAlt = screen.alt || screen.tab;

      // 포인트 리스트 아이템 HTML 구성
      const pointsHtml = (screen.points || [])
        .map(
          (point) => `
            <li class="point-item">
              <span class="point-bullet" aria-hidden="true">&#9679;</span>
              <span>${escapeHtml(point)}</span>
            </li>
          `
        )
        .join("");

      panel.innerHTML = `
        <div class="screen-card">
          <div class="screen-image-wrapper">
            <a href="${escapeHtml(imgSrc)}" target="_blank" rel="noopener noreferrer" class="screen-image-link" title="새 창으로 원본 크기 보기">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(imgAlt)}" class="screen-image" ${index === 0 ? "" : 'loading="lazy"'}>
              <div class="image-zoom-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
                <span>클릭하면 새 창으로 원본 크기 보기</span>
              </div>
            </a>
          </div>

          <div class="points-section">
            <div class="points-header">
              <h2 class="points-title">여기를 보세요</h2>
              <span class="points-badge">${escapeHtml(screen.tab)}</span>
            </div>
            <ul class="points-list">
              ${pointsHtml}
            </ul>
          </div>
        </div>
      `;

      elements.panelContainer.appendChild(panel);
    });

    // 탭리스트 키보드 탐색 등록
    elements.tabList.addEventListener("keydown", handleTabKeydown);

    // 첫 탭 선택 상태 확정
    selectTab(0);
  }

  /**
   * JSON 데이터 비동기 로드
   */
  async function initDemo() {
    try {
      const response = await fetch("../../data/demo-sjrank.json");
      if (!response.ok) {
        throw new Error("데이터 응답 오류: " + response.status);
      }
      const data = await response.json();
      state.data = data;
      state.loaded = true;

      // 렌더링 실행
      renderDemo(data);

      // UI 표시 전환
      elements.statusContainer.style.display = "none";
      elements.contentArea.style.display = "block";
    } catch (err) {
      elements.statusContainer.innerHTML = `
        <div class="demo-status-banner is-error">
          데모 데이터를 불러오지 못했습니다. 네트워크 연결 또는 데이터 파일을 확인해 주세요.
        </div>
      `;
    }
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemo);
  } else {
    initDemo();
  }
})();
