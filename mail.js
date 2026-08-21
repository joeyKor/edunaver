// Pocketbase configuration: Leave blank if hosted in pb_public (same host/port).
// If hosted on Synology Web Station or locally, enter your Pocketbase API URL (e.g. "http://192.168.0.10:8090").
const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

// EDUNAVER Mail Client - Interactive Logic Script

document.addEventListener("DOMContentLoaded", () => {
    // Read logged-in username and email from localStorage or default
    const userName = localStorage.getItem("naverLoggedInUser") || "홍길동";
    const userEmail = localStorage.getItem("naverLoggedInEmail") || "gildong@edunaver.com";
    const headerUserName = document.getElementById("header-user-name");
    if (headerUserName) {
        headerUserName.textContent = userName;
    }
    const mailHeaderAvatar = document.getElementById("mail-header-avatar");
    if (mailHeaderAvatar) {
        const savedAvatar = localStorage.getItem(`naverBlogAvatar_${userName}`) || "default-avatar.svg";
        mailHeaderAvatar.src = savedAvatar;
    }

    const currentUserEmail = userEmail;

    // View Panels selection
    const inboxPanel = document.getElementById("inbox-panel");
    const sentPanel = document.getElementById("sent-panel");
    const receiptPanel = document.getElementById("receipt-panel");
    const composePanel = document.getElementById("compose-panel");
    const detailPanel = document.getElementById("detail-panel");

    // Sidebar Folder/Menu items
    const sidebarWriteBtn = document.getElementById("sidebar-write-btn");
    const folderAllBtn = document.getElementById("folder-all-btn");
    const folderInboxBtn = document.getElementById("folder-inbox-btn");
    const folderSentBtn = document.getElementById("folder-sent-btn");
    const folderReceiptBtn = document.getElementById("folder-receipt-btn");

    // Compose inputs & elements
    const inputTo = document.getElementById("input-to");
    const inputSubject = document.getElementById("input-subject");
    const inputBody = document.getElementById("input-body");

    const composerSendBtn = document.getElementById("composer-send-btn");
    const composerCancelBtn = document.getElementById("composer-cancel-btn");

    // Celebration screen
    const celebrationScreen = document.getElementById("celebration-screen");
    const celebrationConfirmBtn = document.getElementById("celebration-confirm-btn");

    // Lists and Badges
    const sentList = document.getElementById("sent-list");
    const sentMailboxCount = document.getElementById("sent-mailbox-count");
    const sentMailCountSidebar = document.getElementById("sent-mail-count");
    const receiptList = document.getElementById("receipt-list");
    const receiptMailboxCount = document.getElementById("receipt-mailbox-count");

    // Active Folders items collection for class resets
    const folderItems = document.querySelectorAll(".folder-item");

    // (Pocketbase integration replaces sentEmails local array)

    // Sub-tab elements
    const tabInboxUnread = document.getElementById("tab-inbox-unread");
    const tabInboxAll = document.getElementById("tab-inbox-all");
    const allMailCount = document.getElementById("all-mail-count");

    // ----------------------------------------------------
    // 1. View Switcher Helper
    // ----------------------------------------------------
    let currentPanel = "inbox";
    let inboxFilterMode = "unread"; // 'unread' (받은메일함: 읽지 않은 메일만) or 'all' (전체메일: 읽은 메일 포함 모두)

    const updateSubTabStyles = () => {
        if (tabInboxUnread && tabInboxAll) {
            if (inboxFilterMode === "unread") {
                tabInboxUnread.classList.add("active");
                tabInboxAll.classList.remove("active");
            } else {
                tabInboxAll.classList.add("active");
                tabInboxUnread.classList.remove("active");
            }
        }
    };

    const showPanel = (panelName, filterMode = null) => {
        // Hide all
        inboxPanel.style.display = "none";
        sentPanel.style.display = "none";
        if (receiptPanel) receiptPanel.style.display = "none";
        composePanel.style.display = "none";
        if (detailPanel) detailPanel.style.display = "none";

        // Reset active sidebar items
        folderItems.forEach(item => item.classList.remove("active"));
        if (sidebarWriteBtn) {
            sidebarWriteBtn.style.backgroundColor = "";
        }

        if (panelName === "inbox") {
            currentPanel = "inbox";
            inboxFilterMode = filterMode || "unread";
            inboxPanel.style.display = "flex";
            if (folderInboxBtn) folderInboxBtn.classList.add("active");
            updateSubTabStyles();
            renderInboxEmailsList();
        } else if (panelName === "all") {
            currentPanel = "all";
            inboxFilterMode = "all";
            inboxPanel.style.display = "flex";
            if (folderAllBtn) folderAllBtn.classList.add("active");
            updateSubTabStyles();
            renderInboxEmailsList();
        } else if (panelName === "sent") {
            currentPanel = "sent";
            sentPanel.style.display = "flex";
            if (folderSentBtn) folderSentBtn.classList.add("active");
            renderSentEmailsList();
        } else if (panelName === "receipt") {
            currentPanel = "receipt";
            if (receiptPanel) receiptPanel.style.display = "flex";
            if (folderReceiptBtn) folderReceiptBtn.classList.add("active");
            renderReceiptEmailsList();
        } else if (panelName === "compose") {
            currentPanel = "compose";
            composePanel.style.display = "flex";
            if (sidebarWriteBtn) {
                sidebarWriteBtn.style.backgroundColor = "var(--primary-hover)";
            }
        } else if (panelName === "detail") {
            if (detailPanel) detailPanel.style.display = "flex";
        }
    };

    // Sidebar button clicks
    if (sidebarWriteBtn) {
        sidebarWriteBtn.addEventListener("click", () => showPanel("compose"));
    }
    if (folderInboxBtn) {
        folderInboxBtn.addEventListener("click", () => showPanel("inbox", "unread"));
    }
    if (folderAllBtn) {
        folderAllBtn.addEventListener("click", () => showPanel("all", "all"));
    }
    if (folderSentBtn) {
        folderSentBtn.addEventListener("click", () => showPanel("sent"));
    }
    if (folderReceiptBtn) {
        folderReceiptBtn.addEventListener("click", () => showPanel("receipt"));
    }

    // Inbox Sub-Tab Clicks
    if (tabInboxUnread) {
        tabInboxUnread.addEventListener("click", () => {
            folderItems.forEach(item => item.classList.remove("active"));
            if (folderInboxBtn) folderInboxBtn.classList.add("active");
            showPanel("inbox", "unread");
        });
    }
    if (tabInboxAll) {
        tabInboxAll.addEventListener("click", () => {
            folderItems.forEach(item => item.classList.remove("active"));
            if (folderAllBtn) folderAllBtn.classList.add("active");
            showPanel("all", "all");
        });
    }

    // (Educational Checklist logic removed)

    // ----------------------------------------------------
    // 3. Send & Cancel Mail Logic
    // ----------------------------------------------------
    // ----------------------------------------------------
    // 3. Send & Cancel Mail Logic (Pocketbase Integrated)
    // ----------------------------------------------------
    if (composerSendBtn) {
        composerSendBtn.addEventListener("click", async () => {
            const toVal = inputTo.value.trim();
            const subjectVal = inputSubject.value.trim();
            const bodyVal = inputBody.innerHTML.trim();
            const textVal = (inputBody.innerText || "").trim();

            if (!toVal) {
                alert("받는 사람의 이메일 주소를 정확하게 적어주세요.");
                inputTo.focus();
                return;
            }
            if (!subjectVal) {
                alert("이메일의 제목을 입력해 주세요.");
                inputSubject.focus();
                return;
            }
            if (!textVal && !bodyVal) {
                alert("본문 내용을 작성해 주세요.");
                inputBody.focus();
                return;
            }

            try {
                const mailData = {
                    sender: currentUserEmail,
                    recipient: toVal,
                    subject: subjectVal,
                    body: bodyVal,
                    is_read: false
                };

                const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mailData)
                });

                if (!response.ok) throw new Error("Failed to send mail");

                if (celebrationScreen) {
                    celebrationScreen.style.display = "flex";
                }
            } catch (err) {
                console.error("Error sending mail:", err);
                alert("메일 발송에 실패했습니다. 포켓베이스 서버 상태를 확인해 주세요.");
            }
        });
    }

    if (celebrationConfirmBtn) {
        celebrationConfirmBtn.addEventListener("click", () => {
            celebrationScreen.style.display = "none";
            resetComposerForm();
            showPanel("sent");
        });
    }

    if (composerCancelBtn) {
        composerCancelBtn.addEventListener("click", () => {
            if (confirm("작성 중인 메일 내용이 저장되지 않고 소실됩니다. 작성 취소할까요?")) {
                resetComposerForm();
                showPanel("inbox");
            }
        });
    }

    const resetComposerForm = () => {
        inputTo.value = "";
        inputSubject.value = "";
        inputBody.value = "";
        inputBody.style.fontWeight = "normal";
        inputBody.style.fontStyle = "normal";
        inputBody.style.textDecoration = "none";
        inputBody.style.color = "";
        inputBody.style.backgroundColor = "";
        inputBody.style.textAlign = "left";
        inputBody.style.fontSize = "14px";
        inputBody.style.fontFamily = "";
        const edBtnBold = document.getElementById("ed-btn-bold");
        const edBtnItalic = document.getElementById("ed-btn-italic");
        const edBtnUnderline = document.getElementById("ed-btn-underline");
        const edBtnStrike = document.getElementById("ed-btn-strike");
        [edBtnBold, edBtnItalic, edBtnUnderline, edBtnStrike].forEach(btn => btn && btn.classList.remove("active"));
        document.querySelectorAll(".align-btn").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-align") === "left");
        });
        const edFontSize = document.getElementById("ed-font-size");
        const edFontFamily = document.getElementById("ed-font-family");
        if (edFontSize) edFontSize.value = "14px";
        if (edFontFamily) edFontFamily.value = "'Noto Sans KR', sans-serif";
    };

    // ----------------------------------------------------
    // 4. Render Inbox & Sent Mail Box from Pocketbase
    // ----------------------------------------------------
    const renderInboxRows = (allEmails) => {
        const inboxList = document.getElementById("inbox-list");
        if (!inboxList) return;

        const unreadCount = allEmails.filter(m => !m.is_read).length;
        
        const unreadCountBadge = document.querySelector("#folder-inbox-btn .badge-count");
        if (unreadCountBadge) unreadCountBadge.textContent = unreadCount;
        
        const unreadSidebarCount = document.getElementById("unread-sidebar-count");
        if (unreadSidebarCount) unreadSidebarCount.textContent = unreadCount;

        const inboxUnreadCount = document.getElementById("inbox-unread-count");
        if (inboxUnreadCount) inboxUnreadCount.textContent = unreadCount;

        if (allMailCount) {
            allMailCount.textContent = allEmails.length;
        }

        // Apply filter: inboxFilterMode === "unread" shows only unread mails; "all" shows all mails
        const displayEmails = (inboxFilterMode === "unread")
            ? allEmails.filter(m => !m.is_read)
            : allEmails;

        if (displayEmails.length === 0) {
            const emptyText = (inboxFilterMode === "unread")
                ? "읽지 않은 메일이 없습니다."
                : "받은 메일이 없습니다.";
            inboxList.innerHTML = `
                <li class="empty-mailbox-li">
                    <div class="empty-mailbox-msg">
                        <i class="fa-regular fa-folder-open"></i>
                        <p>${emptyText}</p>
                    </div>
                </li>
            `;
            return;
        }

        inboxList.innerHTML = "";
        displayEmails.forEach((email) => {
            const isRead = email.is_read;
            const li = document.createElement("li");
            li.className = `mail-row${isRead ? "" : " unread"}`;
            li.setAttribute("data-id", email.id);

            let timeStr = email.created;
            try {
                const dateObj = new Date(email.created.replace(" ", "T"));
                if (!isNaN(dateObj.getTime())) {
                    timeStr = dateObj.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) + " " + dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
            } catch (e) {}

            const readIcon = isRead 
                ? '<i class="fa-regular fa-envelope-open icon-mail-open"></i>' 
                : '<i class="fa-solid fa-envelope icon-unread-mail"></i>';

            li.innerHTML = `
                <div class="col-check"><i class="fa-regular fa-square"></i></div>
                <div class="col-star"><i class="fa-regular fa-star"></i></div>
                <div class="col-read-icon">${readIcon}</div>
                <div class="col-sender" title="${email.sender}">${email.sender}</div>
                <div class="col-subject">
                    <span class="subj-text">${email.subject}</span>
                    <i class="fa-solid fa-magnifying-glass icon-hover" title="본문 검색"></i>
                    <i class="fa-solid fa-arrow-up-right-from-square icon-hover" title="새 창으로 열기"></i>
                </div>
                <div class="col-time">${timeStr}</div>
            `;
            inboxList.appendChild(li);
        });
    };

    const renderInboxEmailsList = async () => {
        const inboxList = document.getElementById("inbox-list");
        if (!inboxList) return;

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records?sort=-created&filter=recipient='${currentUserEmail}'`);
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            renderInboxRows(data.items || []);
        } catch (err) {
            console.error("Error fetching inbox emails:", err);
            inboxList.innerHTML = `
                <li class="empty-mailbox-li">
                    <div class="empty-mailbox-msg">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>메일을 불러오는 데 실패했습니다. 포켓베이스 서버 상태를 확인해 주세요.</p>
                    </div>
                </li>
            `;
        }
    };

    const renderSentEmailsList = async () => {
        if (!sentList) return;

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records?sort=-created&filter=sender='${currentUserEmail}'`);
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            const emails = data.items;

            if (sentMailboxCount) sentMailboxCount.textContent = emails.length;
            if (sentMailCountSidebar) sentMailCountSidebar.textContent = emails.length;

            if (emails.length === 0) {
                sentList.innerHTML = `
                    <li class="empty-mailbox-li">
                        <div class="empty-mailbox-msg">
                            <i class="fa-regular fa-folder-open"></i>
                            <p>보낸 메일이 없습니다. '메일 쓰기' 버튼을 눌러 첫 메일을 작성해 보세요!</p>
                        </div>
                    </li>
                `;
                return;
            }

            sentList.innerHTML = "";
            emails.forEach((email) => {
                const li = document.createElement("li");
                li.className = "mail-row";
                li.setAttribute("data-id", email.id);
                
                let timeStr = email.created;
                try {
                    const dateObj = new Date(email.created.replace(" ", "T"));
                    if (!isNaN(dateObj.getTime())) {
                        timeStr = dateObj.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) + " " + dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    }
                } catch (e) {}

                const isRead = email.is_read;
                const receiptHtml = isRead 
                    ? `<div class="col-receipt read-receipt" title="상대방이 읽음"><i class="fa-regular fa-envelope-open receipt-icon"></i> ${timeStr}</div>`
                    : `<div class="col-receipt unread-receipt" title="상대방이 아직 읽지 않음">읽지않음</div>`;

                li.innerHTML = `
                    <div class="col-check"><i class="fa-regular fa-square"></i></div>
                    <div class="col-star"><i class="fa-regular fa-star"></i></div>
                    <div class="col-read-icon"><i class="fa-regular fa-envelope-open icon-mail-open"></i></div>
                    <div class="col-sender" title="${email.recipient}">${email.recipient}</div>
                    <div class="col-subject">
                        <span class="subj-text">${email.subject}</span>
                        <i class="fa-solid fa-magnifying-glass icon-hover" title="본문 검색"></i>
                        <i class="fa-solid fa-arrow-up-right-from-square icon-hover" title="새 창으로 열기"></i>
                    </div>
                    <div class="col-time">${timeStr}</div>
                    ${receiptHtml}
                `;
                sentList.appendChild(li);
            });
        } catch (err) {
            console.error("Error fetching sent emails:", err);
            sentList.innerHTML = `
                <li class="empty-mailbox-li">
                    <div class="empty-mailbox-msg">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>메일을 불러오는 데 실패했습니다.</p>
                    </div>
                </li>
            `;
        }
    };

    const renderReceiptEmailsList = async () => {
        if (!receiptList) return;

        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records?sort=-created&filter=sender='${currentUserEmail}'`);
            if (!response.ok) throw new Error("API error");
            const data = await response.json();
            const emails = data.items;

            if (receiptMailboxCount) receiptMailboxCount.textContent = emails.length;

            if (emails.length === 0) {
                receiptList.innerHTML = `
                    <li class="empty-mailbox-li">
                        <div class="empty-mailbox-msg">
                            <i class="fa-regular fa-folder-open"></i>
                            <p>수신확인할 메일이 없습니다.</p>
                        </div>
                    </li>
                `;
                return;
            }

            receiptList.innerHTML = "";
            emails.forEach((email) => {
                const li = document.createElement("li");
                li.className = "mail-row";
                li.setAttribute("data-id", email.id);
                
                let timeStr = email.created;
                try {
                    const dateObj = new Date(email.created.replace(" ", "T"));
                    if (!isNaN(dateObj.getTime())) {
                        timeStr = dateObj.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) + " " + dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    }
                } catch (e) {}

                const isRead = email.is_read;
                const receiptHtml = isRead 
                    ? `<div class="col-receipt read-receipt" title="상대방이 읽음"><i class="fa-regular fa-envelope-open receipt-icon"></i> ${timeStr}</div>`
                    : `<div class="col-receipt unread-receipt" title="상대방이 아직 읽지 않음">읽지않음</div>`;

                li.innerHTML = `
                    <div class="col-check"><i class="fa-regular fa-square"></i></div>
                    <div class="col-star"><i class="fa-regular fa-star"></i></div>
                    <div class="col-read-icon"><i class="fa-solid fa-user-check" style="color: #9aa0a6; font-size: 13px;"></i></div>
                    <div class="col-sender" title="${email.recipient}">${email.recipient}</div>
                    <div class="col-subject">
                        <span class="subj-text">${email.subject}</span>
                        <i class="fa-solid fa-magnifying-glass icon-hover" title="본문 검색"></i>
                        <i class="fa-solid fa-arrow-up-right-from-square icon-hover" title="새 창으로 열기"></i>
                    </div>
                    <div class="col-time">${timeStr}</div>
                    ${receiptHtml}
                `;
                receiptList.appendChild(li);
            });
        } catch (err) {
            console.error("Error fetching receipt emails:", err);
            receiptList.innerHTML = `
                <li class="empty-mailbox-li">
                    <div class="empty-mailbox-msg">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>수신확인 목록을 불러오는 데 실패했습니다.</p>
                    </div>
                </li>
            `;
        }
    };

    // ----------------------------------------------------
    // 5. Interactive Details for new Compose Page widgets
    // ----------------------------------------------------
    const contactsBtn = document.querySelector(".contacts-btn");
    if (contactsBtn) {
        contactsBtn.addEventListener("click", () => {
            if (inputTo) {
                inputTo.value = "teacher@school.net";
            }
        });
    }

    const fileDropZone = document.querySelector(".file-drop-zone");
    if (fileDropZone) {
        // Create hidden input element
        const hiddenFileInput = document.createElement("input");
        hiddenFileInput.type = "file";
        hiddenFileInput.multiple = true;
        hiddenFileInput.style.display = "none";
        document.body.appendChild(hiddenFileInput);

        fileDropZone.addEventListener("click", () => {
            hiddenFileInput.click();
        });

        hiddenFileInput.addEventListener("change", () => {
            if (hiddenFileInput.files.length > 0) {
                const fileNames = Array.from(hiddenFileInput.files).map(f => f.name).join(", ");
                const label = fileDropZone.querySelector("span");
                if (label) {
                    label.textContent = `첨부된 파일: ${fileNames}`;
                }
            }
        });
    }

    // Interactive Rich Text Formatting Controls for Block Selection
    let savedRange = null;
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (inputBody && inputBody.contains(range.commonAncestorContainer)) {
                savedRange = range.cloneRange();
            }
        }
    };

    const restoreSelection = () => {
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
    };

    if (inputBody) {
        inputBody.addEventListener("keyup", saveSelection);
        inputBody.addEventListener("mouseup", saveSelection);
        inputBody.addEventListener("touchend", saveSelection);
        inputBody.addEventListener("input", saveSelection);
    }

    const execFormat = (command, value = null) => {
        if (!inputBody) return;
        inputBody.focus();
        restoreSelection();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        saveSelection();
    };

    const edBtnBold = document.getElementById("ed-btn-bold");
    const edBtnItalic = document.getElementById("ed-btn-italic");
    const edBtnUnderline = document.getElementById("ed-btn-underline");
    const edBtnStrike = document.getElementById("ed-btn-strike");

    [edBtnBold, edBtnItalic, edBtnUnderline, edBtnStrike].forEach(btn => {
        if (btn) {
            btn.addEventListener("mousedown", (e) => e.preventDefault());
        }
    });

    if (edBtnBold) {
        edBtnBold.addEventListener("click", () => execFormat("bold"));
    }
    if (edBtnItalic) {
        edBtnItalic.addEventListener("click", () => execFormat("italic"));
    }
    if (edBtnUnderline) {
        edBtnUnderline.addEventListener("click", () => execFormat("underline"));
    }
    if (edBtnStrike) {
        edBtnStrike.addEventListener("click", () => execFormat("strikeThrough"));
    }

    const edFontFamily = document.getElementById("ed-font-family");
    if (edFontFamily) {
        edFontFamily.addEventListener("change", () => {
            const family = edFontFamily.value;
            execFormat("fontName", family);
        });
    }

    const edFontSize = document.getElementById("ed-font-size");
    if (edFontSize) {
        edFontSize.addEventListener("change", () => {
            const size = edFontSize.value;
            if (!inputBody) return;
            inputBody.focus();
            restoreSelection();

            const sel = window.getSelection();
            if (sel.rangeCount > 0 && !sel.isCollapsed) {
                document.execCommand("styleWithCSS", false, true);
                document.execCommand("fontSize", false, "7");
                const fonts = inputBody.querySelectorAll("font[size='7']");
                fonts.forEach(f => {
                    const span = document.createElement("span");
                    span.style.fontSize = size;
                    span.innerHTML = f.innerHTML;
                    f.parentNode.replaceChild(span, f);
                });
            } else {
                inputBody.style.fontSize = size;
            }
            saveSelection();
        });
    }

    const edColorText = document.getElementById("ed-color-text");
    const textColorChar = document.querySelector(".text-color-char");
    if (edColorText) {
        edColorText.addEventListener("input", () => {
            const color = edColorText.value;
            execFormat("foreColor", color);
            if (textColorChar) {
                textColorChar.style.borderBottomColor = color;
                textColorChar.style.color = color;
            }
        });
    }

    const edColorBg = document.getElementById("ed-color-bg");
    const markerIcon = document.querySelector(".bg-color-label i");
    if (edColorBg) {
        edColorBg.addEventListener("input", () => {
            const color = edColorBg.value;
            execFormat("hiliteColor", color);
            if (markerIcon) {
                markerIcon.style.color = color === "#ffffff" ? "#555" : color;
            }
        });
    }

    const alignBtns = document.querySelectorAll(".align-btn");
    if (alignBtns) {
        alignBtns.forEach(btn => {
            btn.addEventListener("mousedown", (e) => e.preventDefault());
            btn.addEventListener("click", () => {
                alignBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const align = btn.getAttribute("data-align") || "left";
                if (align === "left") execFormat("justifyLeft");
                else if (align === "center") execFormat("justifyCenter");
                else if (align === "right") execFormat("justifyRight");
            });
        });
    }

    // Helper to open mail detail view
    let currentDetailEmail = null;

    const openMailDetail = async (mailId) => {
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records/${mailId}`);
            if (!response.ok) throw new Error("Failed to load mail details");
            const email = await response.json();
            currentDetailEmail = email;

            // Set folder title dynamically (< 받은메일함, < 전체메일, < 보낸메일함 등)
            const detailFolderTitle = document.getElementById("detail-folder-title");
            if (detailFolderTitle) {
                if (currentPanel === "sent") {
                    detailFolderTitle.textContent = "보낸메일함";
                } else if (currentPanel === "receipt") {
                    detailFolderTitle.textContent = "수신확인";
                } else if (currentPanel === "all") {
                    detailFolderTitle.textContent = "전체메일";
                } else {
                    detailFolderTitle.textContent = "받은메일함";
                }
            }

            // Populate detail view fields
            document.getElementById("detail-subject").textContent = email.subject;
            document.getElementById("detail-sender").textContent = email.sender;
            document.getElementById("detail-recipient").textContent = email.recipient;
            
            let timeStr = email.created;
            try {
                const dateObj = new Date(email.created.replace(" ", "T"));
                if (!isNaN(dateObj.getTime())) {
                    timeStr = dateObj.toLocaleString('ko-KR');
                }
            } catch (e) {}
            document.getElementById("detail-time").textContent = timeStr;
            document.getElementById("detail-body").innerHTML = email.body || "";

            // Save active detail mail ID on delete button
            const deleteBtn = document.getElementById("detail-delete-btn");
            if (deleteBtn) {
                deleteBtn.setAttribute("data-id", email.id);
            }

            showPanel("detail");
        } catch (err) {
            console.error("Error opening mail detail:", err);
            alert("메일 내용을 불러오지 못했습니다.");
        }
    };

    // Mail list row unread/read toggle and detail view on click
    const inboxList = document.getElementById("inbox-list");
    if (inboxList) {
        inboxList.addEventListener("click", async (e) => {
            const row = e.target.closest(".mail-row");
            if (!row) return;

            // If user clicked check or star columns, do not open detail
            if (e.target.closest(".col-check") || e.target.closest(".col-star")) {
                return;
            }

            const mailId = row.getAttribute("data-id");

            if (row.classList.contains("unread")) {
                try {
                    const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records/${mailId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ is_read: true })
                    });
                    if (!response.ok) throw new Error("PATCH failed");

                    row.classList.remove("unread");
                    const icon = row.querySelector(".col-read-icon i");
                    if (icon) {
                        icon.className = "fa-regular fa-envelope-open icon-mail-open";
                    }
                    
                    const countBadge = document.querySelector("#folder-inbox-btn .badge-count");
                    const countSidebar = document.getElementById("unread-sidebar-count");
                    const countToolbar = document.getElementById("inbox-unread-count");
                    [countBadge, countSidebar, countToolbar].forEach(el => {
                        if (el) {
                            const val = parseInt(el.textContent);
                            if (val > 0) el.textContent = val - 1;
                        }
                    });
                } catch (err) {
                    console.error("Error patching read state:", err);
                }
            }

            // Open Detail View
            if (mailId) {
                await openMailDetail(mailId);
            }
        });
    }

    // Sent mail list row click for detail view
    if (sentList) {
        sentList.addEventListener("click", async (e) => {
            const row = e.target.closest(".mail-row");
            if (!row) return;

            // If user clicked check or star columns, do not open detail
            if (e.target.closest(".col-check") || e.target.closest(".col-star")) {
                return;
            }

            const mailId = row.getAttribute("data-id");
            if (mailId) {
                await openMailDetail(mailId);
            }
        });
    }

    // Receipt confirmation list row click for detail view
    if (receiptList) {
        receiptList.addEventListener("click", async (e) => {
            const row = e.target.closest(".mail-row");
            if (!row) return;

            // If user clicked check or star columns, do not open detail
            if (e.target.closest(".col-check") || e.target.closest(".col-star")) {
                return;
            }

            const mailId = row.getAttribute("data-id");
            if (mailId) {
                await openMailDetail(mailId);
            }
        });
    }

    // Detail panel action buttons
    const detailBackBtn = document.getElementById("detail-back-btn");
    const detailBackTopBtn = document.getElementById("detail-back-top-btn");
    const handleDetailBack = () => {
        showPanel(currentPanel);
    };
    if (detailBackBtn) detailBackBtn.addEventListener("click", handleDetailBack);
    if (detailBackTopBtn) detailBackTopBtn.addEventListener("click", handleDetailBack);

    // Reply function
    const handleReply = (isReplyAll = false) => {
        if (!currentDetailEmail) return;

        resetComposerForm();
        
        // If reply: To = original sender; If replyAll: To = sender + recipient
        if (inputTo) {
            inputTo.value = currentDetailEmail.sender;
        }

        // Subject: Re: [Original Subject]
        if (inputSubject) {
            const origSubj = currentDetailEmail.subject || "";
            inputSubject.value = origSubj.startsWith("Re:") ? origSubj : `Re: ${origSubj}`;
        }

        // Quoted Body
        if (inputBody) {
            let formattedTime = currentDetailEmail.created;
            try {
                const d = new Date(currentDetailEmail.created.replace(" ", "T"));
                if (!isNaN(d.getTime())) formattedTime = d.toLocaleString('ko-KR');
            } catch (e) {}

            inputBody.innerHTML = `<br><br><div style="border-left: 2px solid #ccc; padding-left: 10px; margin-top: 20px; color: #666; font-size: 13px;">
                <p style="margin: 0 0 6px 0;"><strong>----- 원본 메일 -----</strong></p>
                <p style="margin: 0 0 4px 0;"><strong>보낸사람:</strong> ${currentDetailEmail.sender}</p>
                <p style="margin: 0 0 4px 0;"><strong>받는사람:</strong> ${currentDetailEmail.recipient}</p>
                <p style="margin: 0 0 4px 0;"><strong>날짜:</strong> ${formattedTime}</p>
                <p style="margin: 0 0 10px 0;"><strong>제목:</strong> ${currentDetailEmail.subject}</p>
                <div>${currentDetailEmail.body || ""}</div>
            </div>`;
        }

        showPanel("compose");
        setTimeout(() => {
            if (inputBody) {
                inputBody.focus();
            }
        }, 100);
    };

    const detailReplyBtn = document.getElementById("detail-reply-btn");
    if (detailReplyBtn) {
        detailReplyBtn.addEventListener("click", () => handleReply(false));
    }

    const detailReplyAllBtn = document.getElementById("detail-reply-all-btn");
    if (detailReplyAllBtn) {
        detailReplyAllBtn.addEventListener("click", () => handleReply(true));
    }

    const detailForwardBtn = document.getElementById("detail-forward-btn");
    if (detailForwardBtn) {
        detailForwardBtn.addEventListener("click", () => {
            if (!currentDetailEmail) return;
            resetComposerForm();
            if (inputSubject) {
                const origSubj = currentDetailEmail.subject || "";
                inputSubject.value = origSubj.startsWith("Fwd:") ? origSubj : `Fwd: ${origSubj}`;
            }
            if (inputBody) {
                let formattedTime = currentDetailEmail.created;
                try {
                    const d = new Date(currentDetailEmail.created.replace(" ", "T"));
                    if (!isNaN(d.getTime())) formattedTime = d.toLocaleString('ko-KR');
                } catch (e) {}

                inputBody.innerHTML = `<br><br><div style="border-left: 2px solid #ccc; padding-left: 10px; margin-top: 20px; color: #666; font-size: 13px;">
                    <p style="margin: 0 0 6px 0;"><strong>----- 전달된 메일 -----</strong></p>
                    <p style="margin: 0 0 4px 0;"><strong>보낸사람:</strong> ${currentDetailEmail.sender}</p>
                    <p style="margin: 0 0 4px 0;"><strong>받는사람:</strong> ${currentDetailEmail.recipient}</p>
                    <p style="margin: 0 0 4px 0;"><strong>날짜:</strong> ${formattedTime}</p>
                    <p style="margin: 0 0 10px 0;"><strong>제목:</strong> ${currentDetailEmail.subject}</p>
                    <div>${currentDetailEmail.body || ""}</div>
                </div>`;
            }
            showPanel("compose");
            if (inputTo) inputTo.focus();
        });
    }

    const detailMarkUnreadBtn = document.getElementById("detail-mark-unread-btn");
    if (detailMarkUnreadBtn) {
        detailMarkUnreadBtn.addEventListener("click", async () => {
            if (!currentDetailEmail) return;
            try {
                const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records/${currentDetailEmail.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_read: false })
                });
                if (!response.ok) throw new Error("PATCH failed");
                alert("안 읽은 메일로 변경되었습니다.");
                showPanel(currentPanel);
            } catch (err) {
                console.error("Error setting unread:", err);
                alert("상태 변경에 실패했습니다.");
            }
        });
    }

    const detailDeleteBtn = document.getElementById("detail-delete-btn");
    if (detailDeleteBtn) {
        detailDeleteBtn.addEventListener("click", async () => {
            const mailId = detailDeleteBtn.getAttribute("data-id");
            if (mailId && confirm("이 메일을 삭제하시겠습니까?")) {
                try {
                    const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records/${mailId}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error("Delete failed");
                    
                    alert("메일이 삭제되었습니다.");
                    showPanel(currentPanel);
                } catch (err) {
                    console.error("Error deleting mail:", err);
                    alert("메일 삭제에 실패했습니다.");
                }
            }
        });
    }

    // Initial fetch of received emails & sent email counts on DOM load
    renderInboxEmailsList();
    renderSentEmailsList();
});
