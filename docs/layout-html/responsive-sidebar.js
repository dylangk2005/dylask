/**
 * Dylask Design System - Sidebar Toggle & Task Creation Modal Manager
 * - Ẩn/Hiện Sidebar chỉ với DUY NHẤT 1 nút #sidebarToggleBtn trên Topbar
 * - Tự động kích hoạt Modal Tạo Việc (Dev Task Modal & Standard Task Modal)
 */

(function () {
  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    let backdrop = document.getElementById('sidebarBackdrop');

    if (!sidebar) return;

    // Tự động tạo backdrop nếu trang chưa có
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebarBackdrop';
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    // Đọc trạng thái lưu từ localStorage (chỉ áp dụng desktop)
    const isMobile = () => window.innerWidth <= 768;
    const savedState = localStorage.getItem('dylask_sidebar_collapsed');

    if (!isMobile() && savedState === 'true') {
      sidebar.classList.add('collapsed');
      if (toggleBtn) toggleBtn.classList.add('active');
    }

    // Hàm toggle
    function toggleSidebar() {
      if (isMobile()) {
        const isOpen = sidebar.classList.contains('mobile-open');
        if (isOpen) {
          closeMobileDrawer();
        } else {
          openMobileDrawer();
        }
      } else {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        if (toggleBtn) toggleBtn.classList.toggle('active', isCollapsed);
        localStorage.setItem('dylask_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      }
    }

    function openMobileDrawer() {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Gắn sự kiện duy nhất cho nút Topbar
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      });
    }

    backdrop.addEventListener('click', closeMobileDrawer);

    // Đóng drawer khi click nav-item trên mobile (chỉ với anchor link nội bộ trong trang)
    sidebar.querySelectorAll('a.nav-item, a.nav-link, a.mode-switch-btn, a.mode-btn').forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (isMobile() && (!href || href.startsWith('#') || href.startsWith('javascript:'))) {
          closeMobileDrawer();
        }
      });
    });

    // Phím tắt Ctrl + B hoặc '[' để toggle
    document.addEventListener('keydown', function (e) {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);

      if (e.key === 'Escape') {
        if (isMobile() && sidebar.classList.contains('mobile-open')) {
          closeMobileDrawer();
          return;
        }
        // Đóng mobile detail panel nếu đang mở
        const activeDetailPanel = document.querySelector('.detail-panel.mobile-active');
        if (activeDetailPanel) {
          activeDetailPanel.classList.remove('mobile-active');
          document.body.style.overflow = '';
          return;
        }
        // Đóng mobile task drawer nếu đang mở
        const activeTaskDrawer = document.querySelector('.task-drawer.mobile-active, .task-drawer[style*="display: flex"]');
        if (activeTaskDrawer && isMobile()) {
          activeTaskDrawer.classList.remove('mobile-active');
          activeTaskDrawer.style.display = 'none';
          document.body.style.overflow = '';
          return;
        }
        closeAnyModal();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      } else if (!isInput && e.key === '[') {
        e.preventDefault();
        toggleSidebar();
      } else if (!isInput && (e.key === 'c' || e.key === 'C')) {
        // Phím tắt C: Mở modal tạo task
        const isDev = document.documentElement.getAttribute('data-mode') === 'developer' || document.body.getAttribute('data-mode') === 'developer';
        if (isDev) {
          e.preventDefault();
          window.openDevTaskModal();
        } else {
          e.preventDefault();
          window.openStandardTaskModal();
        }
      }
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        const detailPanel = document.querySelector('.detail-panel');
        if (detailPanel) detailPanel.classList.remove('mobile-active');
        const taskDrawer = document.querySelector('.task-drawer');
        if (taskDrawer) taskDrawer.classList.remove('mobile-active');
      }
    });

    initTaskModalTriggers();
    initMobileDrawers();
  }

  // Quản lý Detail Panel (Standard List) & Task Drawer (Developer Board/Backlog) trên Mobile
  function initMobileDrawers() {
    const isMobile = () => window.innerWidth <= 768;

    // 1. Standard List Detail Panel
    const detailPanel = document.querySelector('.detail-panel');
    const panelCloseBtn = document.querySelector('.panel-close-btn');

    if (detailPanel) {
      document.querySelectorAll('.task-list .task-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.task-checkbox')) return;
          if (isMobile()) {
            detailPanel.classList.add('mobile-active');
            document.body.style.overflow = 'hidden';
          }
        });
      });

      if (panelCloseBtn) {
        panelCloseBtn.addEventListener('click', () => {
          detailPanel.classList.remove('mobile-active');
          document.body.style.overflow = '';
        });
      }
    }

    // 2. Developer Task Drawer
    const taskDrawers = document.querySelectorAll('.task-drawer');
    taskDrawers.forEach(drawer => {
      drawer.querySelectorAll('.drawer-btn-icon[title*="Đóng"], #closeDrawerBtn').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
          drawer.classList.remove('mobile-active');
          if (isMobile()) {
            drawer.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      });
    });

    document.querySelectorAll('.kanban-viewport .task-card, .task-row').forEach(card => {
      card.addEventListener('click', () => {
        const drawer = document.getElementById('taskDrawer') || document.getElementById('taskDetailDrawer');
        if (drawer && isMobile()) {
          drawer.classList.add('mobile-active');
          drawer.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  // ============================================================================
  // INTERACTIVE TASK CREATION MODAL LOGIC
  // ============================================================================

  function closeAnyModal() {
    const devModal = document.getElementById('globalDevModalOverlay');
    const stdModal = document.getElementById('globalStdModalOverlay');
    if (devModal) devModal.classList.remove('active');
    if (stdModal) stdModal.classList.remove('active');
  }

  window.closeAnyModal = closeAnyModal;

  // 1. DEVELOPER TASK CREATION MODAL
  window.openDevTaskModal = function () {
    let overlay = document.getElementById('globalDevModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'globalDevModalOverlay';
      overlay.className = 'dylask-modal-overlay';
      overlay.innerHTML = `
        <div class="dylask-modal-box" role="dialog" aria-modal="true">
          <div class="dylask-modal-header">
            <div class="dylask-modal-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="m9 12 2 2 4-4"></path></svg>
              <span>Tạo công việc kỹ thuật (Issue) · DYL-186</span>
            </div>
            <button class="dylask-modal-close" onclick="closeAnyModal()" title="Đóng">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="dylask-modal-body">
            <div>
              <input class="dylask-title-input" id="devTaskTitleInput" type="text" placeholder="Tiêu đề task (ví dụ: Triển khai JWT Filter...)" value="Viết unit test cho AuthService" autofocus>
            </div>
            <div class="dylask-field-row">
              <div class="dylask-field-item">
                <span class="dylask-field-label">Loại Issue</span>
                <div class="dylask-field-input">
                  <select id="devIssueType">
                    <option value="story" selected>Story (Tính năng)</option>
                    <option value="bug">Bug (Lỗi cần sửa)</option>
                    <option value="task">Technical Task</option>
                    <option value="refactor">Refactor mã nguồn</option>
                  </select>
                </div>
              </div>
              <div class="dylask-field-item">
                <span class="dylask-field-label">Chu kỳ Sprint</span>
                <div class="dylask-field-input">
                  <select id="devSprintSelect">
                    <option selected>Sprint 3: Active (01/10 - 14/10)</option>
                    <option>Sprint 4: Planning</option>
                    <option>Product Backlog</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="dylask-field-row">
              <div class="dylask-field-item">
                <span class="dylask-field-label">Độ ưu tiên</span>
                <div class="dylask-field-input">
                  <select id="devPrioritySelect">
                    <option value="p1">P1 - Critical (Blocker)</option>
                    <option value="p2">P2 - High (Trọng tâm)</option>
                    <option value="p3" selected>P3 - Medium (Bình thường)</option>
                    <option value="p4">P4 - Low (Cải tiến)</option>
                  </select>
                </div>
              </div>
              <div class="dylask-field-item">
                <span class="dylask-field-label">Story Points & Assignee</span>
                <div class="dylask-field-input" style="display:flex; gap:6px;">
                  <select id="devPointsSelect" style="width: 45%;">
                    <option>1 SP</option>
                    <option>2 SP</option>
                    <option selected>3 SP</option>
                    <option>5 SP</option>
                    <option>8 SP</option>
                  </select>
                  <select id="devAssigneeSelect" style="width: 55%;">
                    <option selected>@dylan (Backend)</option>
                    <option>@hoang (Frontend)</option>
                    <option>@lan (QA)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="dylask-field-item">
              <span class="dylask-field-label">Mô tả kỹ thuật (Markdown)</span>
              <textarea class="dylask-textarea" id="devDescInput" placeholder="Nhập yêu cầu kiến trúc, API spec...">Cần mock UserRepository và JwtService.
Kiểm tra kịch bản đăng nhập thành công và ném InvalidCredentialsException khi sai mật khẩu.</textarea>
            </div>
          </div>
          <div class="dylask-modal-footer">
            <span style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">Phím tắt: Enter để tạo, Esc để hủy</span>
            <div style="display: flex; gap: 8px;">
              <button class="dylask-modal-btn-cancel" onclick="closeAnyModal()">Hủy</button>
              <button class="dylask-modal-btn-submit" onclick="submitDevTaskModal()">+ Tạo Task</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeAnyModal();
      });
    }

    overlay.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('devTaskTitleInput');
      if (input) input.focus();
    }, 50);
  };

  window.submitDevTaskModal = function () {
    const title = document.getElementById('devTaskTitleInput').value.trim();
    if (!title) {
      alert('Vui lòng nhập tiêu đề task!');
      return;
    }
    alert(`✅ Đã tạo thành công task kỹ thuật: "${title}" (3 SP · Sprint 3)!`);
    closeAnyModal();
  };

  // 2. STANDARD TASK CREATION MODAL
  window.openStandardTaskModal = function () {
    let overlay = document.getElementById('globalStdModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'globalStdModalOverlay';
      overlay.className = 'dylask-modal-overlay';
      overlay.innerHTML = `
        <div class="dylask-modal-box" role="dialog" aria-modal="true">
          <div class="dylask-modal-header">
            <div class="dylask-modal-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              <span>Thêm công việc mới</span>
            </div>
            <button class="dylask-modal-close" onclick="closeAnyModal()" title="Đóng">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="dylask-modal-body">
            <div>
              <input class="dylask-title-input" id="stdTaskTitleInput" type="text" placeholder="Bạn cần làm gì? (ví dụ: Ôn từ vựng IELTS...)" value="Chuẩn bị tài liệu ôn thi môn Mạng Máy Tính" autofocus>
            </div>
            <div class="dylask-field-row">
              <div class="dylask-field-item">
                <span class="dylask-field-label">Danh mục</span>
                <div class="dylask-field-input">
                  <select id="stdCategorySelect">
                    <option value="hoc-tap" selected>Học tập</option>
                    <option value="cong-viec">Công việc</option>
                    <option value="ca-nhan">Cá nhân</option>
                    <option value="mua-sam">Mua sắm</option>
                    <option value="gia-dinh">Gia đình</option>
                  </select>
                </div>
              </div>
              <div class="dylask-field-item">
                <span class="dylask-field-label">Mức độ ưu tiên</span>
                <div class="dylask-field-input">
                  <select id="stdPrioritySelect">
                    <option value="high">Cao (Gấp / Quan trọng)</option>
                    <option value="medium" selected>Trung bình (Bình thường)</option>
                    <option value="low">Thấp (Làm khi rảnh)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="dylask-field-row">
              <div class="dylask-field-item">
                <span class="dylask-field-label">Hạn chót & Giờ</span>
                <div class="dylask-field-input" style="display:flex; gap:6px;">
                  <input type="text" value="15/10/2026" style="width: 60%;">
                  <input type="text" value="18:00" style="width: 40%;">
                </div>
              </div>
              <div class="dylask-field-item">
                <span class="dylask-field-label">Lặp lại</span>
                <div class="dylask-field-input">
                  <select id="stdRepeatSelect">
                    <option selected>Không lặp lại</option>
                    <option>Mỗi ngày</option>
                    <option>Mỗi tuần</option>
                    <option>Mỗi tháng</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="dylask-field-item">
              <span class="dylask-field-label">Ghi chú chi tiết</span>
              <textarea class="dylask-textarea" id="stdNotesInput" placeholder="Thêm ghi chú chi tiết...">Đọc chương 3 mô hình OSI và làm các bài tập định tuyến IP.</textarea>
            </div>
          </div>
          <div class="dylask-modal-footer">
            <span style="font-size: 11px; color: var(--color-text-muted);">Nhấn Enter hoặc Lưu công việc</span>
            <div style="display: flex; gap: 8px;">
              <button class="dylask-modal-btn-cancel" onclick="closeAnyModal()">Hủy</button>
              <button class="dylask-modal-btn-submit" onclick="submitStandardTaskModal()">+ Lưu công việc</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeAnyModal();
      });
    }

    overlay.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('stdTaskTitleInput');
      if (input) input.focus();
    }, 50);
  };

  window.submitStandardTaskModal = function () {
    const title = document.getElementById('stdTaskTitleInput').value.trim();
    if (!title) {
      alert('Vui lòng nhập tiêu đề công việc!');
      return;
    }
    alert(`✅ Đã lưu thành công công việc: "${title}"!`);
    closeAnyModal();
  };

  // Tự động gán sự kiện cho các nút trên giao diện
  function initTaskModalTriggers() {
    // 1. Dev buttons: .new-task-btn, .column-footer-btn, hoặc element chứa text 'Tạo Task' / 'Thêm thẻ'
    document.querySelectorAll('.new-task-btn, .column-footer-btn, [data-action="create-task"]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.openDevTaskModal();
      });
    });

    // 2. Standard buttons: .btn-primary-action, .quick-add-btn, .quick-add-icon, .btn-quick-add-day, .btn-add-day-task
    document.querySelectorAll('.btn-primary-action, .quick-add-btn, .quick-add-icon').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.openStandardTaskModal();
      });
    });

    // 3. Quét toàn bộ button dựa vào textContent nếu chưa được gắn
    document.querySelectorAll('button').forEach(btn => {
      const txt = (btn.textContent || '').trim().toLowerCase();
      if (txt.includes('tạo task') || txt.includes('thêm thẻ')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.openDevTaskModal();
        });
      } else if (txt.includes('thêm việc mới')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.openStandardTaskModal();
        });
      }
    });
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
