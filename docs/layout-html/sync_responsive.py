import os
import re

BASE_DIR = r"D:\dylann\my-apps\dylask-web\docs\layout-html"

TOPBAR_STANDARD_LEFT = """        <div class="topbar-left">
          <button class="sidebar-toggle-btn-topbar" id="sidebarToggleBtn" title="Ẩn/Hiện thanh điều hướng (Ctrl+B)">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <line x1="9" x2="9" y1="3" y2="21"></line>
            </svg>
          </button>
          <div class="search-box">"""

TOPBAR_DEV_TOGGLE = """        <div class="topbar-left">
          <button class="sidebar-toggle-btn-topbar" id="sidebarToggleBtn" title="Ẩn/Hiện thanh điều hướng (Ctrl+B)">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <line x1="9" x2="9" y1="3" y2="21"></line>
            </svg>
          </button>"""

# ==============================================================================
# 1. STANDARD MODE SIDEBAR (CHỈ 1 NÚT DUY NHẤT TRÊN TOPBAR, KHÔNG TRÙNG NÚT)
# ==============================================================================
def get_standard_sidebar(active_item=""):
    def act(item):
        return " active" if item == active_item else ""

    return f"""    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand">
          <div class="brand-mark">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="brand-name">Dylask</span>
          <span class="brand-badge" style="font-size:11px;font-weight:600;color:var(--color-primary);background-color:var(--color-primary-subtle);padding:2px 6px;border-radius:4px;margin-left:auto;">Standard</span>
        </div>

        <div class="nav-section">
          <!-- 1. THỐNG KÊ (ĐẦU THANH THEO YÊU CẦU USER) -->
          <a class="nav-item{act('analytics')}" href="../standard-analytics/layout.html" title="Thống kê năng suất cá nhân">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Thống kê</span>
          </a>

          <!-- 2. KẾ HOẠCH (LẬP KẾ HOẠCH TUẦN & MỤC TIÊU) -->
          <a class="nav-item{act('planning')}" href="../standard-planning/layout.html" title="Lập kế hoạch tuần">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
              <path d="m9 16 2 2 4-4"></path>
            </svg>
            <span>Kế hoạch</span>
          </a>

          <!-- 3. HÔM NAY -->
          <a class="nav-item{act('my-day')}" href="../my-day/layout.html" title="Kế hoạch hôm nay">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
            </svg>
            <span>Hôm nay</span>
            <span class="nav-count">3</span>
          </a>

          <!-- 4. 7 NGÀY TỚI (VIEW CHUYÊN BIỆT) -->
          <a class="nav-item{act('upcoming')}" href="../standard-upcoming/layout.html" title="7 ngày tới">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 14h.01"></path>
            </svg>
            <span>7 ngày tới</span>
            <span class="nav-count">8</span>
          </a>

          <!-- 5. QUÁ HẠN (VIEW CHUYÊN BIỆT CẢNH BÁO ĐỎ) -->
          <a class="nav-item{act('overdue')}" href="../standard-overdue/layout.html" title="Quá hạn">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12"></line>
              <line x1="12" x2="12.01" y1="16" y2="16"></line>
            </svg>
            <span>Quá hạn</span>
            <span class="nav-count" style="color: var(--color-danger); background-color: #FEF2F2; border-color: #FECACA;">3</span>
          </a>

          <!-- 6. LỊCH -->
          <a class="nav-item{act('calendar')}" href="../calendar/layout.html" title="Xem lịch">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            <span>Lịch</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Danh mục</div>

          <a class="nav-item{act('list')}" href="../standard-list/layout.html">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>Học tập</span>
            <span class="nav-count">2</span>
          </a>

          <a class="nav-item" href="../standard-list/layout.html">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="7" rx="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Công việc</span>
            <span class="nav-count">1</span>
          </a>

          <a class="nav-item" href="../standard-list/layout.html">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Cá nhân</span>
          </a>

          <a class="nav-item" href="../standard-list/layout.html">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            <span>Mua sắm</span>
          </a>

          <a class="nav-item" href="../standard-list/layout.html">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Gia đình</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Hệ thống</div>
          <a class="nav-item{act('settings')}" href="../settings/layout.html" title="Cài đặt hệ thống">
            <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Cài đặt</span>
          </a>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="mode-switch-container">
          <a class="mode-switch-btn active" href="../standard-list/layout.html" title="Chế độ người dùng phổ thông"><span>Standard</span></a>
          <a class="mode-switch-btn" href="../developer-board/layout.html" title="Chuyển sang Chế độ Lập trình viên"><span>Developer</span></a>
        </div>
      </div>
    </aside>"""

# ==============================================================================
# 2. DEVELOPER MODE SIDEBAR (CHỈ 1 NÚT DUY NHẤT TRÊN TOPBAR, KHÔNG TRÙNG NÚT)
# ==============================================================================
def get_developer_sidebar(active_item=""):
    def act(item):
        return " active" if item == active_item else ""

    return f"""    <aside class="sidebar">
      <div class="sidebar-top">
        <!-- Context Header (Workspace > Project > Sprint) -->
        <div class="workspace-header">
          <div class="workspace-row">
            <div class="brand-group">
              <div class="brand-mark">D</div>
              <span class="brand-title">Dylask</span>
            </div>
          </div>

          <div class="project-selector" title="Dự án hiện tại">
            <svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style="font-weight: 600;">dylask-api</span>
            <svg class="icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; color: var(--color-text-muted);">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div class="sprint-badge-row">
            <span class="sprint-active-dot"></span>
            <span>Sprint 3: Active</span>
          </div>
        </div>

        <!-- Navigation Menu (Dự Án & Sprint) -->
        <nav class="nav-group">
          <div class="nav-group-label">Dự Án & Sprint</div>

          <!-- 1. BÁO CÁO AGILE (ĐẦU THANH THEO YÊU CẦU USER) -->
          <a class="nav-link{act('metrics')}" href="../developer-metrics/layout.html" title="Báo cáo & Đo lường Agile Sprint">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Báo Cáo Agile</span>
          </a>

          <!-- 2. BOARD -->
          <a class="nav-link{act('board')}" href="../developer-board/layout.html" title="Bảng Kanban tiến độ">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M8 7v7"></path>
              <path d="M12 7v4"></path>
              <path d="M16 7v9"></path>
            </svg>
            <span>Board</span>
            <span class="nav-badge">5</span>
          </a>

          <!-- 3. BACKLOG -->
          <a class="nav-link{act('backlog')}" href="../developer-backlog/layout.html" title="Danh sách tồn đọng">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="20" x2="21" y2="20"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="4" x2="21" y2="4"></line>
              <line x1="3" y1="20" x2="3.01" y2="20"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="4" x2="3.01" y2="4"></line>
            </svg>
            <span>Backlog</span>
            <span class="nav-badge">6</span>
          </a>

          <!-- 4. FOCUS CODING -->
          <a class="nav-link{act('focus')}" href="../developer-focus/layout.html" title="Chế độ tập trung code">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Focus Coding</span>
          </a>

          <!-- 5. STANDUP -->
          <a class="nav-link{act('standup')}" href="../developer-standup/layout.html" title="Báo cáo tiến độ tự động 24h">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
            <span>Standup</span>
          </a>

          <!-- 6. AUDIT LOG -->
          <a class="nav-link{act('audit')}" href="../developer-audit-log/layout.html" title="Nhật ký thay đổi hệ thống">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Audit Log</span>
          </a>
        </nav>
      </div>

      <!-- Cuối Sidebar: Trạng thái Git & Dual-Mode Toggle -->
      <div class="sidebar-footer">
        <div class="git-status-bar">
          <span class="git-status-dot"></span>
          <span>git: main · syncd</span>
        </div>

        <div class="mode-switch-group">
          <a class="mode-btn" href="../standard-list/layout.html" title="Chuyển sang chế độ Standard">
            <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
            </svg>
            <span>Standard</span>
          </a>
          <a class="mode-btn active" href="../developer-board/layout.html" title="Chế độ Lập trình viên đang bật">
            <svg class="icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>Developer</span>
          </a>
        </div>
      </div>
    </aside>"""

# ==============================================================================
# 3. FILE PROCESSOR
# ==============================================================================
def process_file(file_path, sidebar_generator, active_key, is_standard=True):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Sửa ký tự $\rightarrow$ lỗi
    content = content.replace("$\\rightarrow$", "&rarr;")

    # 1. Thêm link stylesheet responsive-sidebar.css nếu chưa có
    if "responsive-sidebar.css" not in content:
        content = content.replace("</head>", '  <link rel="stylesheet" href="../responsive-sidebar.css">\n</head>')

    # 2. Thêm script responsive-sidebar.js nếu chưa có
    if "responsive-sidebar.js" not in content:
        content = content.replace("</body>", '  <script src="../responsive-sidebar.js"></script>\n</body>')

    # 3. Thay thế sidebar nếu có (loại bỏ nút thu gọn dư thừa trên sidebar brand row)
    if sidebar_generator:
        sidebar_pattern = re.compile(r'<aside class="sidebar">.*?</aside>', re.DOTALL)
        if sidebar_pattern.search(content):
            new_sidebar = sidebar_generator(active_key)
            content = sidebar_pattern.sub(new_sidebar.strip(), content, count=1)

    # 4. Gắn onclick mở modal tạo việc:
    if is_standard:
        # Nút thêm việc trong Standard Mode
        content = re.sub(r'class="btn-primary-action"(?:\s+onclick="[^"]*")?', 'class="btn-primary-action" onclick="openStandardTaskModal()"', content)
    else:
        # Nút tạo task trong Developer Mode
        content = re.sub(r'class="new-task-btn"(?:\s+type="button")?(?:\s+onclick="[^"]*")?', 'class="new-task-btn" type="button" onclick="openDevTaskModal()"', content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"[OK] Processed {os.path.basename(os.path.dirname(file_path))}")

# Standard pages
standard_targets = [
    ("standard-analytics", "analytics"),
    ("standard-planning", "planning"),
    ("my-day", "my-day"),
    ("standard-upcoming", "upcoming"),
    ("standard-overdue", "overdue"),
    ("calendar", "calendar"),
    ("standard-list", "list"),
    ("standard-task-modal", "list"),
    ("settings", "settings"),
]

for folder, active in standard_targets:
    p = os.path.join(BASE_DIR, folder, "layout.html")
    if os.path.exists(p):
        process_file(p, get_standard_sidebar, active, is_standard=True)

# Developer pages
dev_targets = [
    ("developer-metrics", "metrics"),
    ("developer-board", "board"),
    ("developer-backlog", "backlog"),
    ("developer-standup", "standup"),
    ("developer-audit-log", "audit"),
    ("developer-project-create", ""),
    ("developer-command-palette", ""),
    ("developer-ai-panel", ""),
    ("developer-focus", "focus"),
    ("developer-task-modal", ""),
]

for folder, active in dev_targets:
    p = os.path.join(BASE_DIR, folder, "layout.html")
    if os.path.exists(p):
        process_file(p, get_developer_sidebar if folder not in ["developer-focus", "developer-task-modal"] else None, active, is_standard=False)

print("Finished unifying toggle button and task creation modals across all layouts!")
