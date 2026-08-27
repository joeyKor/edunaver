/**
 * EDUVER Calendar Logic (calendar.js)
 * Modern Naver-style Educational & Personal Calendar
 * Supports Month, Week, Day, and Agenda List views, Mini Calendar datepicker,
 * D-Day counter, Category Filtering, Event CRUD with local persistence.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. Initial State & Sync User Info
    // ----------------------------------------------------
    const isAuth = localStorage.getItem("naverIsLoggedIn") === "true";
    const loggedInUser = isAuth ? (localStorage.getItem("naverLoggedInUser") || "사용자") : "체험 사용자";
    const userAvatar = localStorage.getItem("naverBlogAvatar") || "default-avatar.svg";

    const headerUsernameEl = document.getElementById("cal-header-username");
    const headerAvatarEl = document.getElementById("cal-header-avatar");
    if (headerUsernameEl) headerUsernameEl.textContent = loggedInUser;
    if (headerAvatarEl) headerAvatarEl.src = userAvatar;

    // Calendar Navigation State
    let currentDate = new Date(2026, 7, 26); // Default 2026-08-26 (Month is 0-indexed: 7 = August)
    // If today is a valid system date, let's keep it in 2026 context
    let selectedDate = new Date(2026, 7, 26);
    let currentView = "month"; // "month" | "week" | "day" | "list"
    let activeCategories = new Set(["school", "exam", "personal", "important", "holiday"]);
    let currentEditingEventId = null;
    let currentDetailEventId = null;
    let searchQuery = "";

    // ----------------------------------------------------
    // 2. Korean Holidays Database (2026)
    // ----------------------------------------------------
    const HOLIDAYS_2026 = {
        "2026-01-01": "신정",
        "2026-02-16": "설날 연휴",
        "2026-02-17": "설날",
        "2026-02-18": "설날 연휴",
        "2026-03-01": "3·1절",
        "2026-05-01": "근로자의 날",
        "2026-05-05": "어린이날",
        "2026-05-24": "부처님오신날",
        "2026-06-06": "현충일",
        "2026-07-17": "제헌절",
        "2026-08-15": "광복절",
        "2026-09-24": "추석 연휴",
        "2026-09-25": "추석",
        "2026-09-26": "추석 연휴",
        "2026-10-03": "개천절",
        "2026-10-09": "한글날",
        "2026-12-25": "성탄절"
    };

    // ----------------------------------------------------
    // 3. Calendar Events Database (공휴일 및 국가 기념일만 유지)
    // ----------------------------------------------------
    const DEFAULT_EVENTS = [
        {
            id: "hol_1",
            title: "🎉 신정 (새해)",
            category: "holiday",
            startDate: "2026-01-01",
            startTime: "00:00",
            endDate: "2026-01-01",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "2026년 병오년 새해 첫날",
            completed: false
        },
        {
            id: "hol_2",
            title: "🎉 설날 연휴",
            category: "holiday",
            startDate: "2026-02-16",
            startTime: "00:00",
            endDate: "2026-02-18",
            endTime: "23:59",
            allDay: true,
            location: "전국",
            reminder: "1day",
            memo: "민족 대명절 설날 연휴 (2.16 ~ 2.18)",
            completed: false
        },
        {
            id: "hol_3",
            title: "🎉 3·1절 (삼일절)",
            category: "holiday",
            startDate: "2026-03-01",
            startTime: "00:00",
            endDate: "2026-03-01",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "3·1 만세운동 기념 국경일",
            completed: false
        },
        {
            id: "hol_4",
            title: "🎉 근로자의 날",
            category: "holiday",
            startDate: "2026-05-01",
            startTime: "00:00",
            endDate: "2026-05-01",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "근로자의 날 법정기념일",
            completed: false
        },
        {
            id: "hol_5",
            title: "🎉 어린이날",
            category: "holiday",
            startDate: "2026-05-05",
            startTime: "00:00",
            endDate: "2026-05-05",
            endTime: "23:59",
            allDay: true,
            location: "전국",
            reminder: "none",
            memo: "어린이날 공휴일",
            completed: false
        },
        {
            id: "hol_6",
            title: "🎉 부처님오신날",
            category: "holiday",
            startDate: "2026-05-24",
            startTime: "00:00",
            endDate: "2026-05-24",
            endTime: "23:59",
            allDay: true,
            location: "전국",
            reminder: "none",
            memo: "불기 2570년 부처님오신날",
            completed: false
        },
        {
            id: "hol_7",
            title: "🎉 현충일",
            category: "holiday",
            startDate: "2026-06-06",
            startTime: "00:00",
            endDate: "2026-06-06",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "순국선열과 호국영령을 추모하는 날 (조기 게양)",
            completed: false
        },
        {
            id: "hol_8",
            title: "🎉 제헌절",
            category: "holiday",
            startDate: "2026-07-17",
            startTime: "00:00",
            endDate: "2026-07-17",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "대한민국 헌법 공포 기념 국경일",
            completed: false
        },
        {
            id: "hol_9",
            title: "🎉 광복절 (제81주년)",
            category: "holiday",
            startDate: "2026-08-15",
            startTime: "00:00",
            endDate: "2026-08-15",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "제81주년 광복절 국기 게양",
            completed: false
        },
        {
            id: "hol_10",
            title: "🎉 추석 연휴 (한가위)",
            category: "holiday",
            startDate: "2026-09-24",
            startTime: "00:00",
            endDate: "2026-09-26",
            endTime: "23:59",
            allDay: true,
            location: "전국",
            reminder: "1day",
            memo: "민족 대명절 한가위 추석 연휴 (9.24 ~ 9.26)",
            completed: false
        },
        {
            id: "hol_11",
            title: "🎉 개천절",
            category: "holiday",
            startDate: "2026-10-03",
            startTime: "00:00",
            endDate: "2026-10-03",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "단군왕검 고조선 건국 기념 국경일",
            completed: false
        },
        {
            id: "hol_12",
            title: "🎉 한글날",
            category: "holiday",
            startDate: "2026-10-09",
            startTime: "00:00",
            endDate: "2026-10-09",
            endTime: "23:59",
            allDay: true,
            location: "대한민국",
            reminder: "none",
            memo: "훈민정음 반포 및 한글 창제 기념 국경일",
            completed: false
        },
        {
            id: "hol_13",
            title: "🎉 성탄절 (크리스마스)",
            category: "holiday",
            startDate: "2026-12-25",
            startTime: "00:00",
            endDate: "2026-12-25",
            endTime: "23:59",
            allDay: true,
            location: "전국",
            reminder: "1day",
            memo: "성탄절 공휴일",
            completed: false
        }
    ];

    // Purge mock dummy events from previous storage
    let storedEvents = JSON.parse(localStorage.getItem("naverCalendarEvents") || "null");
    let events = [];
    if (!storedEvents || !Array.isArray(storedEvents)) {
        events = DEFAULT_EVENTS;
    } else {
        const mockIds = ["ev_1", "ev_2", "ev_3", "ev_4", "ev_5", "ev_6", "ev_7", "ev_8", "ev_9"];
        // Keep user newly added custom events and holidays only
        events = storedEvents.filter(e => !mockIds.includes(e.id) && (e.category === "holiday" || !e.id.startsWith("ev_")));
        if (events.length === 0) {
            events = DEFAULT_EVENTS;
        }
    }
    localStorage.setItem("naverCalendarEvents", JSON.stringify(events));

    // Helper: Save events to local storage
    const saveEvents = () => {
        localStorage.setItem("naverCalendarEvents", JSON.stringify(events));
        updateAllViews();
    };

    // Helper: Format Date string (YYYY-MM-DD)
    const formatDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Helper: Parse Date string into Date object
    const parseDateKey = (str) => {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // ----------------------------------------------------
    // 4. DOM Elements
    // ----------------------------------------------------
    const currentPeriodDisplay = document.getElementById("current-period-display");
    const todaySubIndicator = document.getElementById("today-sub-indicator");
    const btnCalToday = document.getElementById("btn-cal-today");
    const btnCalPrev = document.getElementById("btn-cal-prev");
    const btnCalNext = document.getElementById("btn-cal-next");
    const viewButtons = document.querySelectorAll(".btn-view-mode");

    // Views
    const viewMonth = document.getElementById("view-month");
    const viewWeek = document.getElementById("view-week");
    const viewDay = document.getElementById("view-day");
    const viewList = document.getElementById("view-list");

    const monthGridCells = document.getElementById("month-grid-cells");
    const miniCalDays = document.getElementById("mini-cal-days");
    const miniCalTitle = document.getElementById("mini-cal-title");
    const ddayListContainer = document.getElementById("dday-list-container");

    // Modals
    const modalEventEditor = document.getElementById("modal-event-editor");
    const modalEditorTitle = document.getElementById("modal-editor-title");
    const eventInputTitle = document.getElementById("event-input-title");
    const eventCheckAllday = document.getElementById("event-check-allday");
    const eventStartDate = document.getElementById("event-start-date");
    const eventStartTime = document.getElementById("event-start-time");
    const eventEndDate = document.getElementById("event-end-date");
    const eventEndTime = document.getElementById("event-end-time");
    const eventInputLocation = document.getElementById("event-input-location");
    const eventSelectReminder = document.getElementById("event-select-reminder");
    const eventInputMemo = document.getElementById("event-input-memo");
    const btnSaveEvent = document.getElementById("btn-save-event");
    const btnCancelEditor = document.getElementById("btn-cancel-editor");
    const btnCloseEditorModal = document.getElementById("btn-close-editor-modal");

    // Detail Modal
    const modalEventDetail = document.getElementById("modal-event-detail");
    const detailBadgeCat = document.getElementById("detail-badge-cat");
    const detailTitle = document.getElementById("detail-title");
    const detailDatetime = document.getElementById("detail-datetime");
    const detailLocationRow = document.getElementById("detail-location-row");
    const detailLocation = document.getElementById("detail-location");
    const detailReminderRow = document.getElementById("detail-reminder-row");
    const detailReminder = document.getElementById("detail-reminder");
    const detailMemoBox = document.getElementById("detail-memo-box");
    const detailMemo = document.getElementById("detail-memo");
    const btnToggleEventDone = document.getElementById("btn-toggle-event-done");
    const btnDetailEdit = document.getElementById("btn-detail-edit");
    const btnDetailDelete = document.getElementById("btn-detail-delete");
    const btnCloseDetailModal = document.getElementById("btn-close-detail-modal");
    const btnCloseDetailBottom = document.getElementById("btn-close-detail-bottom");

    // Popover
    const popoverMoreEvents = document.getElementById("popover-more-events");
    const morePopoverDateTitle = document.getElementById("more-popover-date-title");
    const morePopoverEventsList = document.getElementById("more-popover-events-list");
    const btnCloseMorePopover = document.getElementById("btn-close-more-popover");
    const btnMorePopoverAdd = document.getElementById("btn-more-popover-add");
    let activePopoverDate = null;

    // Search
    const calSearchInput = document.getElementById("cal-search-input");
    const calSearchClear = document.getElementById("cal-search-clear");

    // ----------------------------------------------------
    // 5. Category Map & Colors
    // ----------------------------------------------------
    const CATEGORY_META = {
        school: { name: "학사/학교", badge: "🎓 학사/학교", color: "#03c75a", bg: "#ebfbee" },
        exam: { name: "시험/과제", badge: "📝 시험/과제", color: "#ff7a00", bg: "#fff4e6" },
        personal: { name: "개인/스터디", badge: "💼 개인/스터디", color: "#1f6feb", bg: "#e8f2ff" },
        important: { name: "중요", badge: "⭐ 중요", color: "#e53935", bg: "#fde8e8" },
        holiday: { name: "공휴일/기념일", badge: "🎉 공휴일/기념일", color: "#8e24aa", bg: "#f3e5f5" }
    };

    // ----------------------------------------------------
    // 6. View Renderers
    // ----------------------------------------------------

    // Master update function
    const updateAllViews = () => {
        updatePeriodHeader();
        updateCategoryCounts();
        renderMiniCalendar();
        renderDDayWidget();

        if (currentView === "month") {
            renderMonthView();
        } else if (currentView === "week") {
            renderWeekView();
        } else if (currentView === "day") {
            renderDayView();
        } else if (currentView === "list") {
            renderListView();
        }
    };

    // Update Top Period Title
    const updatePeriodHeader = () => {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth() + 1;
        const d = currentDate.getDate();

        const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = weekNames[currentDate.getDay()];

        if (currentView === "month") {
            currentPeriodDisplay.textContent = `${y}년 ${m}월`;
            todaySubIndicator.textContent = `오늘: 2026.08.26.(수)`;
        } else if (currentView === "week") {
            // Get week start and end
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const sm = startOfWeek.getMonth() + 1;
            const em = endOfWeek.getMonth() + 1;
            currentPeriodDisplay.textContent = `${startOfWeek.getFullYear()}년 ${sm}월 ${startOfWeek.getDate()}일 ~ ${em}월 ${endOfWeek.getDate()}일`;
            todaySubIndicator.textContent = `주간 일정`;
        } else if (currentView === "day") {
            currentPeriodDisplay.textContent = `${y}년 ${m}월 ${d}일 (${dayOfWeek})`;
            todaySubIndicator.textContent = `일간 일정`;
        } else if (currentView === "list") {
            currentPeriodDisplay.textContent = `${y}년 ${m}월 전체 일정 목록`;
            todaySubIndicator.textContent = `아젠다 리스트`;
        }
    };

    // Filter events based on active categories and search query
    const getFilteredEvents = () => {
        return events.filter(ev => {
            const catMatch = activeCategories.has(ev.category);
            if (!catMatch) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const titleMatch = ev.title && ev.title.toLowerCase().includes(q);
                const locMatch = ev.location && ev.location.toLowerCase().includes(q);
                const memoMatch = ev.memo && ev.memo.toLowerCase().includes(q);
                return titleMatch || locMatch || memoMatch;
            }
            return true;
        });
    };

    // Check if event falls on a specific date (YYYY-MM-DD)
    const isEventOnDate = (ev, dateKey) => {
        const evStart = ev.startDate;
        const evEnd = ev.endDate || ev.startDate;
        return dateKey >= evStart && dateKey <= evEnd;
    };

    // ----------------------------------------------------
    // 7. Render Month View
    // ----------------------------------------------------
    const renderMonthView = () => {
        if (!monthGridCells) return;
        monthGridCells.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...
        const totalDays = lastDayOfMonth.getDate();

        // Previous month days for padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const cells = [];

        // 1. Prev month trailing days
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const pDay = prevMonthLastDay - i;
            const pDate = new Date(year, month - 1, pDay);
            cells.push({ date: pDate, isCurrentMonth: false });
        }

        // 2. Current month days
        for (let d = 1; d <= totalDays; d++) {
            const cDate = new Date(year, month, d);
            cells.push({ date: cDate, isCurrentMonth: true });
        }

        // 3. Next month leading days to complete 35 or 42 grid
        const remainingCells = 42 - cells.length >= 7 ? 42 - cells.length : 35 - cells.length;
        const nextFillCount = remainingCells > 0 ? remainingCells : (42 - cells.length);
        for (let n = 1; n <= nextFillCount; n++) {
            const nDate = new Date(year, month + 1, n);
            cells.push({ date: nDate, isCurrentMonth: false });
        }

        const filteredEvents = getFilteredEvents();
        const todayKey = "2026-08-26";

        cells.forEach(cell => {
            const dateKey = formatDateKey(cell.date);
            const dayOfWeek = cell.date.getDay();
            const isToday = dateKey === todayKey;
            const holidayName = HOLIDAYS_2026[dateKey];

            const cellDiv = document.createElement("div");
            cellDiv.className = `month-day-cell ${dayOfWeek === 0 ? 'sun' : ''} ${dayOfWeek === 6 ? 'sat' : ''} ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
            cellDiv.setAttribute("data-date", dateKey);

            // Cell Header
            let holidayHtml = holidayName ? `<span class="holiday-label" title="${holidayName}">${holidayName}</span>` : '';
            cellDiv.innerHTML = `
                <div class="cell-top-row">
                    <span class="day-number">${cell.date.getDate()}</span>
                    ${holidayHtml}
                </div>
                <div class="cell-events-wrapper"></div>
            `;

            const eventsWrapper = cellDiv.querySelector(".cell-events-wrapper");

            // Find events for this date
            const dayEvents = filteredEvents.filter(ev => isEventOnDate(ev, dateKey));

            // Show maximum 3 events in cell, overflow into "+ n개 더보기"
            const maxVisible = 3;
            const visibleEvents = dayEvents.slice(0, maxVisible);
            const overflowCount = dayEvents.length - maxVisible;

            visibleEvents.forEach(ev => {
                const pill = document.createElement("div");
                pill.className = `event-pill ${ev.category} ${ev.completed ? 'completed' : ''}`;
                const timeLabel = ev.allDay ? '' : `<span style="font-size:10px; opacity:0.8;">${ev.startTime}</span>`;
                pill.innerHTML = `${timeLabel} <span>${ev.title}</span>`;
                pill.setAttribute("data-id", ev.id);

                pill.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openDetailModal(ev.id);
                });

                eventsWrapper.appendChild(pill);
            });

            if (overflowCount > 0) {
                const moreBtn = document.createElement("button");
                moreBtn.className = "more-events-btn";
                moreBtn.textContent = `+ ${overflowCount}개 더보기`;
                moreBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openDayMorePopover(e, dateKey, dayEvents);
                });
                eventsWrapper.appendChild(moreBtn);
            }

            // Click cell to open quick create modal on this date
            cellDiv.addEventListener("click", () => {
                openCreateModal(dateKey);
            });

            monthGridCells.appendChild(cellDiv);
        });
    };

    // ----------------------------------------------------
    // 8. Render Mini Datepicker Calendar in Sidebar
    // ----------------------------------------------------
    const renderMiniCalendar = () => {
        if (!miniCalDays || !miniCalTitle) return;
        miniCalDays.innerHTML = "";

        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();
        miniCalTitle.textContent = `${y}. ${String(m + 1).padStart(2, '0')}`;

        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        const startIdx = firstDay.getDay();
        const total = lastDay.getDate();

        const prevLast = new Date(y, m, 0).getDate();
        const miniCells = [];

        for (let i = startIdx - 1; i >= 0; i--) {
            miniCells.push({ date: new Date(y, m - 1, prevLast - i), current: false });
        }
        for (let d = 1; d <= total; d++) {
            miniCells.push({ date: new Date(y, m, d), current: true });
        }
        const remaining = 35 - miniCells.length > 0 ? 35 - miniCells.length : (42 - miniCells.length);
        for (let n = 1; n <= remaining; n++) {
            miniCells.push({ date: new Date(y, m + 1, n), current: false });
        }

        const filteredEvents = getFilteredEvents();
        const todayKey = "2026-08-26";
        const selectedKey = formatDateKey(selectedDate);

        miniCells.forEach(item => {
            const dKey = formatDateKey(item.date);
            const hasEvents = filteredEvents.some(ev => isEventOnDate(ev, dKey));
            const isToday = dKey === todayKey;
            const isSelected = dKey === selectedKey;

            const div = document.createElement("div");
            div.className = `mini-day-cell ${!item.current ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`;
            div.textContent = item.date.getDate();

            div.addEventListener("click", () => {
                selectedDate = new Date(item.date);
                currentDate = new Date(item.date);
                updateAllViews();
            });

            miniCalDays.appendChild(div);
        });
    };

    // ----------------------------------------------------
    // 9. Render Week View
    // ----------------------------------------------------
    const renderWeekView = () => {
        const weekAlldayCells = document.getElementById("week-allday-cells");
        const weekTimeGutter = document.getElementById("week-time-gutter");
        const weekColumnsContainer = document.getElementById("week-columns-container");

        if (!weekAlldayCells || !weekTimeGutter || !weekColumnsContainer) return;
        weekAlldayCells.innerHTML = "";
        weekTimeGutter.innerHTML = "";
        weekColumnsContainer.innerHTML = "";

        // Time Gutter 08:00 ~ 22:00
        for (let h = 8; h <= 22; h++) {
            const timeLabel = document.createElement("div");
            timeLabel.className = "time-slot-label";
            timeLabel.textContent = `${String(h).padStart(2, '0')}:00`;
            weekTimeGutter.appendChild(timeLabel);
        }

        // Get 7 days of current week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        const filteredEvents = getFilteredEvents();

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dateKey = formatDateKey(dayDate);

            // Allday cell
            const alldayBox = document.createElement("div");
            alldayBox.style.cssText = "display:flex; flex-direction:column; gap:2px; min-height:36px;";
            const dayAlldays = filteredEvents.filter(ev => isEventOnDate(ev, dateKey) && ev.allDay);
            dayAlldays.forEach(ev => {
                const p = document.createElement("div");
                p.className = `event-pill ${ev.category} ${ev.completed ? 'completed' : ''}`;
                p.textContent = ev.title;
                p.onclick = (e) => { e.stopPropagation(); openDetailModal(ev.id); };
                alldayBox.appendChild(p);
            });
            weekAlldayCells.appendChild(alldayBox);

            // Time column
            const col = document.createElement("div");
            col.className = "week-column";
            col.setAttribute("data-date", dateKey);

            for (let h = 8; h <= 22; h++) {
                const hourSlot = document.createElement("div");
                hourSlot.className = "hour-slot-block";
                hourSlot.onclick = () => openCreateModal(dateKey, `${String(h).padStart(2, '0')}:00`);
                col.appendChild(hourSlot);
            }

            // Timed events
            const timedEvents = filteredEvents.filter(ev => isEventOnDate(ev, dateKey) && !ev.allDay);
            timedEvents.forEach(ev => {
                const [startH] = (ev.startTime || "09:00").split(':').map(Number);
                const [endH] = (ev.endTime || "10:00").split(':').map(Number);
                const duration = Math.max(1, endH - startH);

                if (startH >= 8 && startH <= 22) {
                    const topOffset = (startH - 8) * 50;
                    const height = duration * 50;

                    const block = document.createElement("div");
                    block.className = `event-pill ${ev.category} ${ev.completed ? 'completed' : ''}`;
                    block.style.cssText = `position:absolute; top:${topOffset}px; left:4px; right:4px; height:${height - 2}px; z-index:10; border-radius:4px; padding:4px 6px;`;
                    block.innerHTML = `<strong>${ev.startTime}</strong> ${ev.title}`;
                    block.onclick = (e) => { e.stopPropagation(); openDetailModal(ev.id); };
                    col.appendChild(block);
                }
            });

            weekColumnsContainer.appendChild(col);
        }
    };

    // ----------------------------------------------------
    // 10. Render Day View
    // ----------------------------------------------------
    const renderDayView = () => {
        const dayViewHeaderTitle = document.getElementById("day-view-header-title");
        const dayViewAlldayRack = document.getElementById("day-view-allday-rack");
        const dayTimeGutter = document.getElementById("day-time-gutter");
        const dayViewColumn = document.getElementById("day-view-column");

        if (!dayViewHeaderTitle || !dayTimeGutter || !dayViewColumn) return;
        dayTimeGutter.innerHTML = "";
        dayViewColumn.innerHTML = "";
        if (dayViewAlldayRack) dayViewAlldayRack.innerHTML = "";

        const y = currentDate.getFullYear();
        const m = currentDate.getMonth() + 1;
        const d = currentDate.getDate();
        const weekNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        dayViewHeaderTitle.textContent = `${y}년 ${m}월 ${d}일 (${weekNames[currentDate.getDay()]})`;

        const dateKey = formatDateKey(currentDate);
        const filteredEvents = getFilteredEvents().filter(ev => isEventOnDate(ev, dateKey));

        // Time Gutter
        for (let h = 8; h <= 22; h++) {
            const label = document.createElement("div");
            label.className = "time-slot-label";
            label.textContent = `${String(h).padStart(2, '0')}:00`;
            dayTimeGutter.appendChild(label);

            const slot = document.createElement("div");
            slot.className = "hour-slot-block";
            slot.onclick = () => openCreateModal(dateKey, `${String(h).padStart(2, '0')}:00`);
            dayViewColumn.appendChild(slot);
        }

        // Place Timed Events
        filteredEvents.filter(ev => !ev.allDay).forEach(ev => {
            const [startH] = (ev.startTime || "09:00").split(':').map(Number);
            const [endH] = (ev.endTime || "10:00").split(':').map(Number);
            const duration = Math.max(1, endH - startH);

            if (startH >= 8 && startH <= 22) {
                const topOffset = (startH - 8) * 50;
                const height = duration * 50;

                const block = document.createElement("div");
                block.className = `event-pill ${ev.category} ${ev.completed ? 'completed' : ''}`;
                block.style.cssText = `position:absolute; top:${topOffset}px; left:10px; right:10px; height:${height - 2}px; z-index:10; border-radius:6px; padding:8px 12px; font-size:13px;`;
                block.innerHTML = `<strong>${ev.startTime} ~ ${ev.endTime}</strong> <span style="margin-left:8px; font-weight:700;">${ev.title}</span> <span style="font-size:11px; opacity:0.8; margin-left:8px;">📍 ${ev.location || '장소 미지정'}</span>`;
                block.onclick = (e) => { e.stopPropagation(); openDetailModal(ev.id); };
                dayViewColumn.appendChild(block);
            }
        });
    };

    // ----------------------------------------------------
    // 11. Render Agenda / List View
    // ----------------------------------------------------
    const renderListView = () => {
        if (!viewList) return;
        const listContainer = document.getElementById("list-view-container");
        if (!listContainer) return;
        listContainer.innerHTML = "";

        const filteredEvents = getFilteredEvents();
        if (filteredEvents.length === 0) {
            listContainer.innerHTML = `
                <div style="background:#fff; border-radius:10px; border:1px solid #e2e8f0; padding:60px 20px; text-align:center; color:#888;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size:40px; color:#cbd5e1; margin-bottom:12px;"></i>
                    <p style="font-size:15px; font-weight:700; color:#334155;">등록된 일정이 없습니다.</p>
                </div>
            `;
            return;
        }

        // Group by Date
        const grouped = {};
        filteredEvents.forEach(ev => {
            if (!grouped[ev.startDate]) grouped[ev.startDate] = [];
            grouped[ev.startDate].push(ev);
        });

        const sortedDates = Object.keys(grouped).sort();

        sortedDates.forEach(dateKey => {
            const groupDate = parseDateKey(dateKey);
            const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
            const headerText = `${groupDate.getFullYear()}년 ${groupDate.getMonth() + 1}월 ${groupDate.getDate()}일 (${weekNames[groupDate.getDay()]})`;

            const card = document.createElement("div");
            card.className = "agenda-date-group";

            const holidayName = HOLIDAYS_2026[dateKey];
            card.innerHTML = `
                <div class="agenda-date-header">
                    <span>${headerText} ${holidayName ? `<span style="color:#e53935; font-size:12px; margin-left:6px;">🎉 ${holidayName}</span>` : ''}</span>
                    <span style="font-size:12px; color:#64748b; font-weight:600;">${grouped[dateKey].length}개 일정</span>
                </div>
                <div class="agenda-items-list"></div>
            `;

            const itemsList = card.querySelector(".agenda-items-list");
            grouped[dateKey].forEach(ev => {
                const meta = CATEGORY_META[ev.category] || CATEGORY_META.school;
                const row = document.createElement("div");
                row.className = "agenda-item-row";
                row.innerHTML = `
                    <div class="agenda-left-content">
                        <span class="agenda-cat-badge" style="background:${meta.bg}; color:${meta.color};">${meta.name}</span>
                        <div>
                            <div class="agenda-item-title" style="${ev.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${ev.title}</div>
                            <div class="agenda-time-text">
                                <i class="fa-regular fa-clock" style="font-size:11px; margin-right:3px;"></i>
                                ${ev.allDay ? '종일' : `${ev.startTime} ~ ${ev.endTime}`}
                                ${ev.location ? `<span style="margin-left:8px;"><i class="fa-solid fa-location-dot" style="font-size:11px;"></i> ${ev.location}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <button class="icon-action-btn" title="상세보기"><i class="fa-solid fa-chevron-right"></i></button>
                `;
                row.onclick = () => openDetailModal(ev.id);
                itemsList.appendChild(row);
            });

            listContainer.appendChild(card);
        });
    };

    // ----------------------------------------------------
    // 12. Render D-Day Widget (디데이 자동 계산)
    // ----------------------------------------------------
    const renderDDayWidget = () => {
        if (!ddayListContainer) return;
        ddayListContainer.innerHTML = "";

        const today = new Date(2026, 7, 26); // Baseline today
        today.setHours(0, 0, 0, 0);

        // Filter high priority items (upcoming holidays, anniversaries, and custom events)
        const ddayCandidates = events.filter(ev => ev.category === "holiday" || ev.category === "exam" || ev.category === "important" || ev.category === "school");

        // Calculate D-Day
        const ddayItems = ddayCandidates.map(ev => {
            const evDate = parseDateKey(ev.startDate);
            evDate.setHours(0, 0, 0, 0);
            const diffTime = evDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                ...ev,
                diffDays
            };
        });

        // Filter upcoming items first (diffDays >= 0), fallback to recent
        const upcomingItems = ddayItems.filter(item => item.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays);
        const pastItems = ddayItems.filter(item => item.diffDays < 0).sort((a, b) => b.diffDays - a.diffDays);
        const finalDDayList = [...upcomingItems, ...pastItems];

        finalDDayList.slice(0, 4).forEach(item => {
            let badgeText = "";
            let badgeClass = "";
            if (item.diffDays === 0) {
                badgeText = "D-Day";
                badgeClass = "today-dday";
            } else if (item.diffDays > 0) {
                badgeText = `D-${item.diffDays}`;
            } else {
                badgeText = `D+${Math.abs(item.diffDays)}`;
                badgeClass = "past";
            }

            const card = document.createElement("div");
            card.className = "dday-card";
            card.innerHTML = `
                <span class="dday-title" title="${item.title}">${item.title}</span>
                <span class="dday-badge ${badgeClass}">${badgeText}</span>
            `;
            card.onclick = () => openDetailModal(item.id);
            ddayListContainer.appendChild(card);
        });
    };

    // Update Category Counter Badges in Sidebar
    const updateCategoryCounts = () => {
        const counts = { school: 0, exam: 0, personal: 0, important: 0, holiday: 0 };
        events.forEach(ev => {
            if (counts[ev.category] !== undefined) counts[ev.category]++;
        });

        Object.keys(counts).forEach(cat => {
            const el = document.getElementById(`count-${cat}`);
            if (el) el.textContent = counts[cat];
        });
    };

    // ----------------------------------------------------
    // 13. Event Modals Management (Create / Edit / Detail)
    // ----------------------------------------------------

    // Open Create Modal
    const openCreateModal = (prefillDate = null, prefillTime = "09:00") => {
        currentEditingEventId = null;
        modalEditorTitle.innerHTML = `<i class="fa-regular fa-calendar-plus" style="color: #03c75a;"></i> 새 일정 등록`;
        
        eventInputTitle.value = "";
        eventInputLocation.value = "";
        eventInputMemo.value = "";
        eventSelectReminder.value = "1day";
        eventCheckAllday.checked = true;

        const dateStr = prefillDate || formatDateKey(currentDate);
        eventStartDate.value = dateStr;
        eventEndDate.value = dateStr;
        eventStartTime.value = prefillTime;
        eventEndTime.value = "18:00";

        toggleTimeInputs(false);

        // Reset category radio
        const defaultRadio = document.querySelector('input[name="event-cat"][value="school"]');
        if (defaultRadio) defaultRadio.checked = true;

        modalEventEditor.style.display = "flex";
        eventInputTitle.focus();
    };

    // Open Edit Modal
    const openEditModal = (id) => {
        const ev = events.find(e => e.id === id);
        if (!ev) return;

        currentEditingEventId = id;
        modalEditorTitle.innerHTML = `<i class="fa-regular fa-pen-to-square" style="color: #03c75a;"></i> 일정 수정`;

        eventInputTitle.value = ev.title;
        eventStartDate.value = ev.startDate;
        eventEndDate.value = ev.endDate || ev.startDate;
        eventStartTime.value = ev.startTime || "09:00";
        eventEndTime.value = ev.endTime || "18:00";
        eventCheckAllday.checked = ev.allDay;
        eventInputLocation.value = ev.location || "";
        eventSelectReminder.value = ev.reminder || "none";
        eventInputMemo.value = ev.memo || "";

        toggleTimeInputs(!ev.allDay);

        const catRadio = document.querySelector(`input[name="event-cat"][value="${ev.category}"]`);
        if (catRadio) catRadio.checked = true;

        modalEventDetail.style.display = "none";
        modalEventEditor.style.display = "flex";
    };

    // Open Detail Modal
    const openDetailModal = (id) => {
        const ev = events.find(e => e.id === id);
        if (!ev) return;

        currentDetailEventId = id;
        const meta = CATEGORY_META[ev.category] || CATEGORY_META.school;

        detailBadgeCat.textContent = meta.badge;
        detailBadgeCat.style.background = meta.bg;
        detailBadgeCat.style.color = meta.color;

        detailTitle.textContent = ev.title;
        detailTitle.style.textDecoration = ev.completed ? "line-through" : "none";

        const timeInfo = ev.allDay ? `${ev.startDate} 종일` : `${ev.startDate} ${ev.startTime} ~ ${ev.endTime}`;
        detailDatetime.textContent = timeInfo;

        if (ev.location) {
            detailLocationRow.style.display = "flex";
            detailLocation.textContent = ev.location;
        } else {
            detailLocationRow.style.display = "none";
        }

        const reminderMap = { "none": "알림 없음", "10min": "10분 전 알림", "30min": "30분 전 알림", "1hour": "1시간 전 알림", "1day": "1일 전 알림" };
        detailReminder.textContent = reminderMap[ev.reminder || "none"];

        if (ev.memo) {
            detailMemoBox.style.display = "block";
            detailMemo.textContent = ev.memo;
        } else {
            detailMemoBox.style.display = "none";
        }

        btnToggleEventDone.innerHTML = ev.completed ? `<i class="fa-solid fa-rotate-left"></i> 완료 취소` : `<i class="fa-regular fa-circle-check"></i> 완료 표시`;

        // Hide popover if open
        if (popoverMoreEvents) popoverMoreEvents.style.display = "none";
        modalEventDetail.style.display = "flex";
    };

    // Toggle Time inputs based on All-Day checkbox
    const toggleTimeInputs = (show) => {
        eventStartTime.style.display = show ? "block" : "none";
        eventEndTime.style.display = show ? "block" : "none";
    };

    eventCheckAllday.addEventListener("change", (e) => {
        toggleTimeInputs(!e.target.checked);
    });

    // Save Event Form Submit
    btnSaveEvent.addEventListener("click", () => {
        const title = eventInputTitle.value.trim();
        if (!title) {
            alert("일정 제목을 입력해 주세요.");
            eventInputTitle.focus();
            return;
        }

        const category = document.querySelector('input[name="event-cat"]:checked')?.value || "school";
        const allDay = eventCheckAllday.checked;
        const startDate = eventStartDate.value;
        const endDate = eventEndDate.value || startDate;
        const startTime = eventStartTime.value || "09:00";
        const endTime = eventEndTime.value || "18:00";
        const location = eventInputLocation.value.trim();
        const reminder = eventSelectReminder.value;
        const memo = eventInputMemo.value.trim();

        if (currentEditingEventId) {
            // Edit existing
            const idx = events.findIndex(e => e.id === currentEditingEventId);
            if (idx >= 0) {
                events[idx] = {
                    ...events[idx],
                    title,
                    category,
                    allDay,
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                    location,
                    reminder,
                    memo
                };
            }
        } else {
            // Create new
            const newEvent = {
                id: `ev_${Date.now()}`,
                title,
                category,
                allDay,
                startDate,
                endDate,
                startTime,
                endTime,
                location,
                reminder,
                memo,
                completed: false
            };
            events.push(newEvent);
        }

        saveEvents();
        modalEventEditor.style.display = "none";
    });

    // Detail Modal Actions
    btnDetailEdit.addEventListener("click", () => {
        if (currentDetailEventId) openEditModal(currentDetailEventId);
    });

    btnDetailDelete.addEventListener("click", () => {
        if (!currentDetailEventId) return;
        if (confirm("이 일정을 삭제하시겠습니까?")) {
            events = events.filter(e => e.id !== currentDetailEventId);
            saveEvents();
            modalEventDetail.style.display = "none";
        }
    });

    btnToggleEventDone.addEventListener("click", () => {
        if (!currentDetailEventId) return;
        const ev = events.find(e => e.id === currentDetailEventId);
        if (ev) {
            ev.completed = !ev.completed;
            saveEvents();
            openDetailModal(currentDetailEventId);
        }
    });

    // Close Modal buttons
    btnCancelEditor.onclick = () => modalEventEditor.style.display = "none";
    btnCloseEditorModal.onclick = () => modalEventEditor.style.display = "none";
    btnCloseDetailModal.onclick = () => modalEventDetail.style.display = "none";
    btnCloseDetailBottom.onclick = () => modalEventDetail.style.display = "none";

    // Open Create Modal buttons
    document.getElementById("btn-open-create-modal").onclick = () => openCreateModal();
    document.getElementById("btn-toolbar-quick-add").onclick = () => openCreateModal();
    document.getElementById("btn-quick-dday").onclick = () => openCreateModal();

    // ----------------------------------------------------
    // 14. Day More Popover (+n개 더보기)
    // ----------------------------------------------------
    const openDayMorePopover = (e, dateKey, dayEvents) => {
        activePopoverDate = dateKey;
        const rect = e.target.getBoundingClientRect();
        morePopoverDateTitle.textContent = `${dateKey} 전체 일정 (${dayEvents.length}개)`;
        morePopoverEventsList.innerHTML = "";

        dayEvents.forEach(ev => {
            const pill = document.createElement("div");
            pill.className = `event-pill ${ev.category} ${ev.completed ? 'completed' : ''}`;
            const timeLabel = ev.allDay ? '' : `<span style="font-size:10px; opacity:0.8;">${ev.startTime}</span>`;
            pill.innerHTML = `${timeLabel} <span>${ev.title}</span>`;
            pill.onclick = () => {
                popoverMoreEvents.style.display = "none";
                openDetailModal(ev.id);
            };
            morePopoverEventsList.appendChild(pill);
        });

        // Position Popover
        let popTop = rect.top + window.scrollY - 30;
        let popLeft = rect.left + window.scrollX - 20;

        if (popLeft + 250 > window.innerWidth) popLeft = window.innerWidth - 260;
        if (popTop + 250 > window.innerHeight) popTop = window.innerHeight - 260;

        popoverMoreEvents.style.top = `${popTop}px`;
        popoverMoreEvents.style.left = `${popLeft}px`;
        popoverMoreEvents.style.display = "block";
    };

    btnCloseMorePopover.onclick = () => popoverMoreEvents.style.display = "none";
    btnMorePopoverAdd.onclick = () => {
        popoverMoreEvents.style.display = "none";
        openCreateModal(activePopoverDate);
    };

    // ----------------------------------------------------
    // 15. Navigation & Controls
    // ----------------------------------------------------

    // Today Button
    btnCalToday.addEventListener("click", () => {
        currentDate = new Date(2026, 7, 26);
        selectedDate = new Date(2026, 7, 26);
        updateAllViews();
    });

    // Previous / Next Buttons
    btnCalPrev.addEventListener("click", () => {
        if (currentView === "month" || currentView === "list") {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === "week") {
            currentDate.setDate(currentDate.getDate() - 7);
        } else if (currentView === "day") {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        updateAllViews();
    });

    btnCalNext.addEventListener("click", () => {
        if (currentView === "month" || currentView === "list") {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === "week") {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (currentView === "day") {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        updateAllViews();
    });

    // Mini Calendar Navigation
    document.getElementById("btn-mini-prev").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateAllViews();
    };
    document.getElementById("btn-mini-next").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateAllViews();
    };
    document.getElementById("btn-mini-today").onclick = () => {
        currentDate = new Date(2026, 7, 26);
        selectedDate = new Date(2026, 7, 26);
        updateAllViews();
    };

    // View Switcher Buttons
    viewButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            viewButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentView = btn.getAttribute("data-view");

            // Hide all view panels
            viewMonth.style.display = "none";
            viewWeek.style.display = "none";
            viewDay.style.display = "none";
            viewList.style.display = "none";

            // Show selected view panel
            if (currentView === "month") viewMonth.style.display = "flex";
            else if (currentView === "week") viewWeek.style.display = "flex";
            else if (currentView === "day") viewDay.style.display = "flex";
            else if (currentView === "list") viewList.style.display = "flex";

            updateAllViews();
        });
    });

    // Category Checkbox Filters
    document.querySelectorAll(".cat-filter-check").forEach(chk => {
        chk.addEventListener("change", () => {
            const cat = chk.getAttribute("data-category");
            if (chk.checked) {
                activeCategories.add(cat);
            } else {
                activeCategories.delete(cat);
            }
            updateAllViews();
        });
    });

    // Toggle All Categories
    document.getElementById("btn-toggle-all-categories").onclick = () => {
        const allChecks = document.querySelectorAll(".cat-filter-check");
        const allChecked = Array.from(allChecks).every(c => c.checked);
        allChecks.forEach(c => {
            c.checked = !allChecked;
            const cat = c.getAttribute("data-category");
            if (!allChecked) activeCategories.add(cat);
            else activeCategories.delete(cat);
        });
        updateAllViews();
    };

    // Live Search in Calendar
    calSearchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        calSearchClear.style.display = searchQuery ? "block" : "none";
        updateAllViews();
    });

    calSearchClear.addEventListener("click", () => {
        calSearchInput.value = "";
        searchQuery = "";
        calSearchClear.style.display = "none";
        updateAllViews();
    });

    // Refresh button
    document.getElementById("btn-refresh-cal").onclick = () => {
        updateAllViews();
    };

    // Initial render
    updateAllViews();
});
