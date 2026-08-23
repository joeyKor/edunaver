/**
 * Individual Cafe Detail Logic (cafe-detail.js)
 * Manages loading specific cafe data, post rendering, board switching, 
 * rich editor post writing, comments submission & rendering, batch deleting, and post views.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Get Cafe ID & Post ID from URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const cafeId = urlParams.get("id") || urlParams.get("cafe") || "";
    const initialPostId = urlParams.get("postId");
    const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

    // 2. Elements & Sync User Info
    const cafeTitleMain = document.getElementById("cafe-title-main");
    const cafeUrlSub = document.getElementById("cafe-url-sub");
    const cafeManagerName = document.getElementById("cafe-manager-name");
    const cafeCreatedDate = document.getElementById("cafe-created-date");
    const cafeMemberCount = document.getElementById("cafe-member-count");
    const cafeProfileAvatar = document.getElementById("cafe-profile-avatar");
    const sidebarTotalPosts = document.getElementById("sidebar-total-posts");
    const btnSidebarJoinCafe = document.getElementById("btn-sidebar-join-cafe");
    const btnOpenWriteModal = document.getElementById("btn-open-write-modal");

    const isAuth = localStorage.getItem("naverIsLoggedIn") === "true";
    const loggedInUser = isAuth ? (localStorage.getItem("naverLoggedInUser") || "") : "";
    const headerUserName = document.getElementById("header-user-name");
    const headerUserCaret = document.getElementById("header-user-caret");
    if (headerUserName) {
        if (isAuth && loggedInUser) {
            headerUserName.textContent = loggedInUser.endsWith("님") ? loggedInUser : `${loggedInUser}님`;
            if (headerUserCaret) headerUserCaret.style.display = "inline-block";
        } else {
            headerUserName.innerHTML = `<a href="index.html" style="color: #555; text-decoration: none; font-weight: 700;">로그인</a>`;
            if (headerUserCaret) headerUserCaret.style.display = "none";
        }
    }

    const commentWriteUserName = document.getElementById("comment-write-user-name");
    if (commentWriteUserName) commentWriteUserName.textContent = loggedInUser || "익명";

    // 3. Load cafe dataset
    let cafes = JSON.parse(localStorage.getItem("naverCafesData") || "[]");

    const searchName = urlParams.get("name") || "";
    let currentCafe = null;

    if (cafeId) {
        currentCafe = cafes.find(c => String(c.id) === String(cafeId) || String(c.urlSlug) === String(cafeId));
    }
    if (!currentCafe && searchName) {
        currentCafe = cafes.find(c => c.name === searchName || c.name.includes(searchName));
    }

    if (!currentCafe) {
        currentCafe = {
            id: cafeId || "vncvhnzfduln0p8",
            name: searchName || "통장모임",
            urlSlug: cafeId || "",
            manager: loggedInUser || "연습용",
            createdDate: "2026.08.22.",
            members: "1",
            level: "씨앗1단계",
            icon: "default-avatar.svg",
            joinedMembers: [],
            posts: []
        };
    }

    // Immediate DOM update to prevent flash of default title
    if (cafeTitleMain) cafeTitleMain.textContent = currentCafe.name;
    if (cafeUrlSub) cafeUrlSub.textContent = `https://cafe.eduver.com/${currentCafe.urlSlug || currentCafe.id.replace("cafe_", "")}`;

    // 7. Render Posts in Board Table
    const cafePostTbody = document.getElementById("cafe-post-tbody");
    const boardMainTitle = document.getElementById("board-main-title");
    const checkAllPosts = document.getElementById("check-all-posts");
    const bottomCheckAll = document.getElementById("bottom-check-all");
    const hideNoticeCheck = document.getElementById("hide-notice-check");
    let currentActiveBoard = "all"; // 'all' | 'hot' | 'free'

    function renderPostTable() {
        if (!cafePostTbody) return;

        let postList = currentCafe.posts || [];
        
        // Hide notice filter
        if (hideNoticeCheck && hideNoticeCheck.checked) {
            postList = postList.filter(p => !p.isNotice);
        }

        if (currentActiveBoard === "free") {
            postList = postList.filter(p => !p.board || p.board === "자유게시판");
            if (welcomeHeroCard) welcomeHeroCard.style.display = "none";
            if (boardMainTitle) boardMainTitle.textContent = "자유게시판";
        } else if (currentActiveBoard === "hot") {
            postList = postList.filter(p => (p.views || 0) > 10 || (Array.isArray(p.comments) ? p.comments.length : 0) > 0);
            if (welcomeHeroCard) welcomeHeroCard.style.display = "none";
            if (boardMainTitle) boardMainTitle.textContent = "인기글";
        } else {
            if (welcomeHeroCard) welcomeHeroCard.style.display = "block";
            if (boardMainTitle) boardMainTitle.textContent = "전체글보기";
        }

        if (sidebarTotalPosts) sidebarTotalPosts.textContent = (currentCafe.posts || []).length;

        if (postList.length === 0) {
            cafePostTbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                        등록된 게시글이 없습니다.
                    </td>
                </tr>
            `;
            return;
        }

        cafePostTbody.innerHTML = "";
        postList.forEach((post, index) => {
            const tr = document.createElement("tr");
            if (post.isNotice) tr.className = "notice-tr";

            const numOrBadge = post.isNotice 
                ? `<span class="badge-table-notice">공지</span>` 
                : (postList.length - index);

            const postTime = (post.time && typeof post.time === 'string') 
                ? (post.time.includes(" ") ? post.time.split(" ")[0] : post.time)
                : "2026.08.23";

            const commList = Array.isArray(post.comments) ? post.comments : [];
            const commCount = commList.length || parseInt(post.commentsCount, 10) || 0;
            const commBadge = commCount > 0 ? `<span class="badge-post-comment-count">[${commCount}]</span>` : '';

            tr.innerHTML = `
                <td class="td-check">
                    <input type="checkbox" class="post-check-item" data-id="${post.id || ''}">
                </td>
                <td>${numOrBadge}</td>
                <td class="td-board-title">
                    <span class="post-link-text" style="${post.isNotice ? 'color:#eb5757; font-weight:700;' : ''}">${post.title || '(제목 없음)'}</span>
                    ${commBadge}
                    <span class="badge-n-dot">N</span>
                </td>
                <td>${post.author || '익명'}</td>
                <td>${postTime}</td>
                <td>${post.views || 0}</td>
                <td>${post.likes || 0}</td>
            `;

            tr.querySelector(".td-board-title").addEventListener("click", () => {
                showPostDetail(post.id);
            });
            cafePostTbody.appendChild(tr);
        });

        // Wire checkbox sync
        syncCheckboxes();
    }

    function syncCheckboxes() {
        const itemChecks = document.querySelectorAll(".post-check-item");
        
        const toggleAll = (checked) => {
            itemChecks.forEach(c => c.checked = checked);
            if (checkAllPosts) checkAllPosts.checked = checked;
            if (bottomCheckAll) bottomCheckAll.checked = checked;
        };

        if (checkAllPosts) {
            checkAllPosts.onchange = (e) => toggleAll(e.target.checked);
        }
        if (bottomCheckAll) {
            bottomCheckAll.onchange = (e) => toggleAll(e.target.checked);
        }

        itemChecks.forEach(c => {
            c.onchange = () => {
                const allChecked = Array.from(itemChecks).length > 0 && Array.from(itemChecks).every(i => i.checked);
                if (checkAllPosts) checkAllPosts.checked = allChecked;
                if (bottomCheckAll) bottomCheckAll.checked = allChecked;
            };
        });
    }

    // Try fetching live cafe record from PocketBase
    async function syncFromPocketBase() {
        try {
            let targetId = cafeId || currentCafe.id;
            let targetName = searchName || currentCafe.name;
            let item = null;

            // Direct fetch by ID if valid PB ID
            if (targetId && !targetId.startsWith("cafe_")) {
                let res = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records/${targetId}`);
                if (res.ok) item = await res.json();
            }

            // Fallback fetch all records and match by name or ID
            if (!item) {
                const searchRes = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records?perPage=50`);
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.items && searchData.items.length > 0) {
                        item = searchData.items.find(i => 
                            (targetName && i.name && (i.name === targetName || i.name.includes(targetName) || targetName.includes(i.name))) ||
                            (targetId && i.id === targetId)
                        );
                        if (!item && !targetName && !targetId) {
                            item = searchData.items[0];
                        }
                    }
                }
            }

            if (item) {
                currentCafe.id = item.id;
                currentCafe.name = item.name || currentCafe.name;
                currentCafe.desc = item.description || currentCafe.desc;
                currentCafe.manager = item.manager || currentCafe.manager;
                currentCafe.members = item.members || currentCafe.members || "1";
                if (item.joinedMembers) {
                    if (Array.isArray(item.joinedMembers)) {
                        currentCafe.joinedMembers = item.joinedMembers;
                    } else if (typeof item.joinedMembers === 'string') {
                        try { currentCafe.joinedMembers = JSON.parse(item.joinedMembers); } catch(e) { currentCafe.joinedMembers = [item.joinedMembers]; }
                    }
                }
                
                // Parse Posts
                let rawPosts = item.posts;
                if (typeof rawPosts === 'string') {
                    try { rawPosts = JSON.parse(rawPosts); } catch(e) { rawPosts = []; }
                }
                currentCafe.posts = Array.isArray(rawPosts) ? rawPosts : [];

                // Update local storage cafes
                const idx = cafes.findIndex(c => String(c.id) === String(currentCafe.id));
                if (idx !== -1) {
                    cafes[idx] = currentCafe;
                } else {
                    cafes.unshift(currentCafe);
                }
                localStorage.setItem("naverCafesData", JSON.stringify(cafes));
            }
        } catch (e) {
            console.log("PocketBase cafe sync error:", e);
        } finally {
            updateCafeHeaders();
            renderPostTable();
        }
    }

    // Check membership: If user is manager or in cafe.joinedMembers, they are joined
    function isUserMember() {
        const user = localStorage.getItem("naverLoggedInUser") || loggedInUser;
        const userId = localStorage.getItem("naverLoggedInUserId") || "";
        if (!user && !userId) return false;
        const curUser = (user || "").trim();
        const curId = (userId || "").trim();
        const mgr = (currentCafe.manager || "").trim();
        if (mgr && ((curUser && (curUser === mgr || curUser.includes(mgr) || mgr.includes(curUser))) || (curId && mgr.includes(curId)))) return true;
        
        const joinedMembers = (currentCafe.joinedMembers || []).map(m => String(m).trim());
        return joinedMembers.some(m => (curUser && (m === curUser || m.startsWith(curUser + " "))) || (curId && m.includes(curId)));
    }

    function updateMembershipUI() {
        const isJoined = isUserMember();
        if (isJoined) {
            if (btnSidebarJoinCafe) btnSidebarJoinCafe.style.display = "none";
            if (btnOpenWriteModal) btnOpenWriteModal.style.display = "block";
        } else {
            if (btnSidebarJoinCafe) btnSidebarJoinCafe.style.display = "block";
            if (btnOpenWriteModal) btnOpenWriteModal.style.display = "none";
        }
    }

    function updateCafeHeaders() {
        if (cafeTitleMain) cafeTitleMain.textContent = currentCafe.name;
        document.title = `${currentCafe.name} : EDUVER 카페 (에듀버)`;

        const slug = currentCafe.urlSlug || currentCafe.id.replace("cafe_", "");
        if (cafeUrlSub) cafeUrlSub.textContent = `https://cafe.eduver.com/${slug}`;

        const mgr = currentCafe.manager || (currentCafe.posts && currentCafe.posts[0] ? currentCafe.posts[0].author : "매니저");
        if (cafeManagerName) cafeManagerName.textContent = mgr.length > 6 ? mgr.substring(0, 5) + "..." : mgr;

        if (cafeCreatedDate && currentCafe.createdDate) cafeCreatedDate.textContent = currentCafe.createdDate;
        if (cafeMemberCount) cafeMemberCount.textContent = currentCafe.members || "1";
        if (cafeProfileAvatar && currentCafe.icon) cafeProfileAvatar.src = currentCafe.icon;

        updateMembershipUI();
    }

    updateCafeHeaders();
    syncFromPocketBase();

    // 5. Views Switching (Board List vs Post Detail vs Full Editor View vs Join View vs Member List View)
    const postDetailContainer = document.getElementById("post-detail-container");
    const boardListContainer = document.getElementById("board-list-container");
    const cafeWriteFullView = document.getElementById("cafe-write-full-view");
    const cafeJoinView = document.getElementById("cafe-join-view");
    const cafeMemberListView = document.getElementById("cafe-member-list-view");
    const cafeLayoutGrid = document.querySelector(".cafe-layout-grid");
    const welcomeHeroCard = document.getElementById("welcome-hero-card");
    const btnBackToList = document.getElementById("btn-back-to-list");
    let currentViewingPostId = null;

    function showMemberListView() {
        if (typeof openCafeMembersViewDirect === 'function') {
            openCafeMembersViewDirect();
        }
    }
    window.showMemberListView = showMemberListView;

    function showPostDetail(postId) {
        currentViewingPostId = postId;
        const post = (currentCafe.posts || []).find(p => p.id === postId) || (currentCafe.posts && currentCafe.posts[0]);
        if (!post) return;

        // Increment views
        post.views = (post.views || 0) + 1;
        saveCafeState();

        // Populate details
        const detailBoardName = document.getElementById("detail-board-name");
        const detailNoticeBadge = document.getElementById("detail-notice-badge");
        const detailPostTitle = document.getElementById("detail-post-title");
        const detailAuthorName = document.getElementById("detail-author-name");
        const detailPostDate = document.getElementById("detail-post-date");
        const detailPostViews = document.getElementById("detail-post-views");
        const detailPostContentBody = document.getElementById("detail-post-content-body");
        const detailBottomAuthorName = document.getElementById("detail-bottom-author-name");
        const detailLikeCount = document.getElementById("detail-like-count");
        const detailCommentCount = document.getElementById("detail-comment-count");
        const detailTopCommentCount = document.getElementById("detail-top-comment-count");

        if (detailBoardName) detailBoardName.textContent = (post.board || "자유게시판") + " >";
        if (detailNoticeBadge) detailNoticeBadge.style.display = post.isNotice ? "inline-block" : "none";
        if (detailPostTitle) detailPostTitle.textContent = post.title || "(제목 없음)";
        if (detailAuthorName) detailAuthorName.textContent = post.author || "매니저";
        if (detailBottomAuthorName) detailBottomAuthorName.textContent = post.author;
        if (detailPostDate) detailPostDate.textContent = post.time || "2026.08.23 12:00";
        if (detailPostViews) detailPostViews.textContent = post.views || "1";
        
        const commentsList = Array.isArray(post.comments) ? post.comments : [];
        const commCount = commentsList.length;
        if (detailTopCommentCount) detailTopCommentCount.textContent = commCount;
        if (detailCommentCount) detailCommentCount.textContent = commCount;
        if (detailLikeCount) detailLikeCount.textContent = post.likes || 0;

        if (detailPostContentBody) {
            const isRestricted = post.isNotice && !isUserMember();
            if (isRestricted) {
                detailPostContentBody.innerHTML = `
                    <div class="member-only-lock-card">
                        <div class="lock-icon-wrap">
                            <i class="fa-solid fa-lock"></i>
                        </div>
                        <h4 class="lock-card-title">이 글은 카페 멤버에게만 공개된 게시글입니다.</h4>
                        <p class="lock-card-desc">카페에 가입하시면 글 내용과 댓글을 확인하고 활동에 참여하실 수 있습니다.</p>
                        <button type="button" class="btn-lock-join-now" id="btn-lock-join-now">카페 가입하기</button>
                    </div>
                `;
                setTimeout(() => {
                    const btnLockJoin = document.getElementById("btn-lock-join-now");
                    if (btnLockJoin) btnLockJoin.addEventListener("click", showJoinView);
                }, 50);
            } else {
                let bodyText = post.content;
                if (!bodyText) {
                    bodyText = `${currentCafe.name} 카페를 시작합니다.\n\n나의 친구들, 같은 관심사를 공유하는 멤버들과 함께 재미있는 이야기 나누며 행복한 카페를 만들어가요!`;
                }
                detailPostContentBody.innerHTML = bodyText;
            }
        }

        // Set active comment author name
        const commentWriteUserEl = document.getElementById("comment-write-user-name");
        const activeCommentNick = localStorage.getItem("naverLoggedInUser") || loggedInUser || "조이";
        if (commentWriteUserEl) {
            commentWriteUserEl.textContent = activeCommentNick;
        }

        // Render Comments List (Only for members)
        const commentSectionWrap = document.getElementById("comment-section-wrap");
        if (commentSectionWrap) {
            commentSectionWrap.style.display = isUserMember() ? "block" : "none";
        }
        renderComments(post);

        if (cafeLayoutGrid) cafeLayoutGrid.style.display = "grid";
        if (cafeWriteFullView) cafeWriteFullView.style.display = "none";
        if (cafeJoinView) cafeJoinView.style.display = "none";
        if (cafeMemberListView) cafeMemberListView.style.display = "none";
        if (boardListContainer) boardListContainer.style.display = "none";
        if (postDetailContainer) postDetailContainer.style.display = "flex";
        window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    window.showPostDetail = showPostDetail;
    window.openPostDetailDirect = showPostDetail;

    function showBoardList() {
        currentViewingPostId = null;
        if (cafeLayoutGrid) cafeLayoutGrid.style.display = "grid";
        if (cafeWriteFullView) cafeWriteFullView.style.display = "none";
        if (cafeJoinView) cafeJoinView.style.display = "none";
        if (cafeMemberListView) cafeMemberListView.style.display = "none";
        if (postDetailContainer) postDetailContainer.style.display = "none";
        if (boardListContainer) boardListContainer.style.display = "block";
        renderPostTable();
    }

    // Save cafe state locally and to PocketBase
    async function saveCafeState() {
        // 1. LocalStorage
        const idx = cafes.findIndex(c => String(c.id) === String(currentCafe.id));
        if (idx !== -1) {
            cafes[idx] = currentCafe;
        } else {
            cafes.unshift(currentCafe);
        }
        localStorage.setItem("naverCafesData", JSON.stringify(cafes));

        // 2. PocketBase Async Sync
        if (currentCafe.id && !currentCafe.id.startsWith("cafe_")) {
            try {
                await fetch(`${POCKETBASE_URL}/api/collections/cafes/records/${currentCafe.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        posts: currentCafe.posts,
                        members: currentCafe.members,
                        joinedMembers: currentCafe.joinedMembers,
                        manager: currentCafe.manager
                    })
                });
            } catch (err) {
                console.log("PB Sync patch notice:", err);
            }
        }
    }

    function showWriteView() {
        const isAuthCheck = localStorage.getItem("naverIsLoggedIn") === "true";
        if (!isAuthCheck) {
            alert("로그인이 필요한 서비스입니다.");
            location.href = "index.html?redirect=" + encodeURIComponent(location.href);
            return;
        }

        if (!isUserMember()) {
            if (confirm("카페 멤버만 글을 작성할 수 있습니다.\n지금 카페에 가입하시겠습니까?")) {
                showJoinView();
            }
            return;
        }

        if (cafeLayoutGrid) cafeLayoutGrid.style.display = "none";
        if (postDetailContainer) postDetailContainer.style.display = "none";
        if (cafeJoinView) cafeJoinView.style.display = "none";
        if (cafeMemberListView) cafeMemberListView.style.display = "none";
        if (cafeWriteFullView) {
            cafeWriteFullView.style.display = "block";
            cafeWriteFullView.style.visibility = "visible";
        }
        
        // Reset full write form
        const titleEl = document.getElementById("full-write-title");
        const contentEl = document.getElementById("full-write-content");
        const tagsEl = document.getElementById("full-write-tags");
        if (titleEl) { titleEl.value = ""; titleEl.focus(); }
        if (contentEl) contentEl.innerHTML = "";
        if (tagsEl) tagsEl.value = "";
        
        window.scrollTo({ top: 80, behavior: 'smooth' });
    }

    window.openCafeWriteView = showWriteView;

    function showJoinView() {
        const isAuthCheck = localStorage.getItem("naverIsLoggedIn") === "true";
        if (!isAuthCheck) {
            alert("카페 가입을 위해 먼저 로그인이 필요합니다.");
            location.href = "index.html?redirect=" + encodeURIComponent(location.href);
            return;
        }

        const boardList = document.getElementById("board-list-container");
        const postDetail = document.getElementById("post-detail-container");
        const writeView = document.getElementById("cafe-write-full-view");
        const joinView = document.getElementById("cafe-join-view");
        const memberView = document.getElementById("cafe-member-list-view");

        if (boardList) boardList.style.display = "none";
        if (postDetail) postDetail.style.display = "none";
        if (writeView) writeView.style.display = "none";
        if (memberView) memberView.style.display = "none";
        if (joinView) {
            joinView.style.display = "block";
            joinView.style.visibility = "visible";
        }

        // Fill join information
        const joinCafeDesc = document.getElementById("join-cafe-desc");
        const joinNicknameInput = document.getElementById("join-nickname-input");
        const activeUser = localStorage.getItem("naverLoggedInUser") || loggedInUser;
        if (joinCafeDesc) {
            joinCafeDesc.textContent = currentCafe.desc || `🔥 ${currentCafe.name} 카페에서 지식을 나누고 성장할 분들을 환영합니다!`;
        }
        if (joinNicknameInput) {
            joinNicknameInput.value = activeUser || "";
        }

        refreshJoinCaptcha();
        window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    window.openCafeJoinView = showJoinView;

    // Attach to sidebar join button
    const joinBtn = document.getElementById("btn-sidebar-join-cafe");
    if (joinBtn) {
        joinBtn.onclick = function(e) {
            if (e) e.preventDefault();
            showJoinView();
        };
    }

    // 5-B. Join Form Captcha & Submission
    let currentJoinCaptcha = "FU5TP8";
    const joinCaptchaCode = document.getElementById("join-captcha-code");
    const btnRefreshJoinCaptcha = document.getElementById("btn-refresh-join-captcha");
    const cafeJoinForm = document.getElementById("cafe-join-form");
    const joinCaptchaInput = document.getElementById("join-captcha-input");

    function refreshJoinCaptcha() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let str = "";
        for (let i = 0; i < 6; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentJoinCaptcha = str;
        if (joinCaptchaCode) joinCaptchaCode.textContent = str;
        if (joinCaptchaInput) joinCaptchaInput.value = "";
    }

    if (btnRefreshJoinCaptcha) {
        btnRefreshJoinCaptcha.addEventListener("click", refreshJoinCaptcha);
    }

    // Wire Nickname clear and byte count
    const joinNickInput = document.getElementById("join-nickname-input");
    const btnClearNick = document.getElementById("btn-clear-nick");
    const nickBytesCount = document.getElementById("nick-bytes-count");

    if (joinNickInput) {
        joinNickInput.addEventListener("input", () => {
            const val = joinNickInput.value;
            let bytes = 0;
            for (let i = 0; i < val.length; i++) {
                bytes += val.charCodeAt(i) > 128 ? 2 : 1;
            }
            if (nickBytesCount) nickBytesCount.textContent = `${bytes}/20bytes`;
        });
    }

    if (btnClearNick && joinNickInput) {
        btnClearNick.addEventListener("click", () => {
            joinNickInput.value = "";
            if (nickBytesCount) nickBytesCount.textContent = "0/20bytes";
            joinNickInput.focus();
        });
    }

    // Join Form Submission Logic
    async function handleJoinSubmit(e) {
        if (e) e.preventDefault();
        
        const inputVal = (joinCaptchaInput ? joinCaptchaInput.value.trim() : "").toUpperCase();
        if (inputVal !== currentJoinCaptcha.toUpperCase()) {
            alert("보안문자가 일치하지 않습니다. 이미지를 확인 후 다시 입력해주세요.");
            refreshJoinCaptcha();
            if (joinCaptchaInput) joinCaptchaInput.focus();
            return;
        }

        const customNick = (document.getElementById("join-nickname-input") ? document.getElementById("join-nickname-input").value.trim() : "") || "새회원";
        const loggedInId = (localStorage.getItem("naverLoggedInUsername") || (localStorage.getItem("naverLoggedInEmail") ? localStorage.getItem("naverLoggedInEmail").split("@")[0] : "") || localStorage.getItem("naverLoggedInUserId") || "").trim();

        // Save nickname as active login session
        localStorage.setItem("naverIsLoggedIn", "true");
        localStorage.setItem("naverLoggedInUser", customNick);

        if (!currentCafe.joinedMembers) currentCafe.joinedMembers = [];
        
        // Add nickname and loginId (if present)
        const memberKey = loggedInId ? `${customNick} (${loggedInId})` : customNick;
        if (!currentCafe.joinedMembers.includes(memberKey) && !currentCafe.joinedMembers.includes(customNick)) {
            currentCafe.joinedMembers.push(memberKey);
        }

        // Increment member count
        let curCount = parseInt((currentCafe.members || "1").replace(/,/g, ""));
        curCount = isNaN(curCount) ? 2 : curCount + 1;
        currentCafe.members = curCount.toLocaleString();

        await saveCafeState();
        updateCafeHeaders();

        alert(`🎉 '${currentCafe.name}' 카페에 성공적으로 가입되었습니다!\n환영합니다, ${customNick}님!`);
        showBoardList();
    }

    if (cafeJoinForm) {
        cafeJoinForm.onsubmit = handleJoinSubmit;
    }

    if (btnBackToList) {
        btnBackToList.addEventListener("click", showBoardList);
    }

    // 6. Render Comments
    const commentListContainer = document.getElementById("comment-list-container");
    const commentInputText = document.getElementById("comment-input-text");
    const btnCommentSubmit = document.getElementById("btn-comment-submit");

    function renderComments(post) {
        if (!commentListContainer) return;
        const comments = Array.isArray(post.comments) ? post.comments : [];
        commentListContainer.innerHTML = "";

        if (comments.length === 0) {
            commentListContainer.innerHTML = "";
            return;
        }

        comments.forEach(c => {
            const item = document.createElement("div");
            item.className = "comment-item";
            const authorNick = c.author || "익명";
            const avatarUrl = localStorage.getItem(`naverBlogAvatar_${authorNick}`) || "default-avatar.svg";
            item.innerHTML = `
                <div class="comment-avatar"><img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></div>
                <div class="comment-body">
                    <div class="comment-header-line">
                        <span class="comment-author">${authorNick}</span>
                        <span class="comment-date">${c.time}</span>
                    </div>
                    <div class="comment-text">${c.text}</div>
                </div>
            `;
            commentListContainer.appendChild(item);
        });
    }

    // Comment Input change activates submit button
    if (commentInputText && btnCommentSubmit) {
        commentInputText.addEventListener("input", () => {
            if (commentInputText.value.trim().length > 0) {
                btnCommentSubmit.classList.add("active");
            } else {
                btnCommentSubmit.classList.remove("active");
            }
        });

        btnCommentSubmit.addEventListener("click", () => {
            const text = commentInputText.value.trim();
            if (!text || !currentViewingPostId) return;

            const post = (currentCafe.posts || []).find(p => p.id === currentViewingPostId);
            if (!post) return;

            if (!Array.isArray(post.comments)) post.comments = [];

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const mins = String(now.getMinutes()).padStart(2, "0");
            const timeStr = `${year}.${month}.${day}. ${hours}:${mins}`;

            post.comments.push({
                id: "c_" + Date.now(),
                author: loggedInUser,
                time: timeStr,
                text: text
            });
            post.commentsCount = post.comments.length;

            saveCafeState();

            commentInputText.value = "";
            btnCommentSubmit.classList.remove("active");

            // Update UI
            const detailCommentCount = document.getElementById("detail-comment-count");
            const detailTopCommentCount = document.getElementById("detail-top-comment-count");
            if (detailCommentCount) detailCommentCount.textContent = post.comments.length;
            if (detailTopCommentCount) detailTopCommentCount.textContent = post.comments.length;

            renderComments(post);
    if (hideNoticeCheck) {
        hideNoticeCheck.addEventListener("change", renderPostTable);
    }

    renderPostTable();

    // If URL has specific initialPostId, open immediately
    if (initialPostId) {
        showPostDetail(initialPostId);
    }

    // 8. Board Switching Events (Sidebar)
    document.querySelectorAll(".board-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".board-item").forEach(b => b.classList.remove("active"));
            item.classList.add("active");
            currentActiveBoard = item.getAttribute("data-board") || "all";
            showBoardList();
        });
    });

    // 9. Delete Posts Functionality (Table Checkbox Delete & Detail View Delete)
    async function saveCafeState() {
        const idx = cafes.findIndex(c => c.id === currentCafe.id);
        if (idx !== -1) cafes[idx] = currentCafe;
        localStorage.setItem("naverCafesData", JSON.stringify(cafes));

        // Sync to PocketBase
        try {
            let pbId = currentCafe.id;
            
            // If currentCafe.id is not a 15-character PocketBase record ID, find the real record
            if (!pbId || pbId.startsWith("cafe_")) {
                // Try finding by name
                let searchRes = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records?filter=(name='${encodeURIComponent(currentCafe.name)}')`);
                if (searchRes.ok) {
                    let searchData = await searchRes.json();
                    if (searchData.items && searchData.items.length > 0) {
                        pbId = searchData.items[0].id;
                        currentCafe.id = pbId;
                    }
                }
            }

            const payload = {
                posts: currentCafe.posts || [],
                newPostsToday: currentCafe.newPostsToday || (currentCafe.posts ? currentCafe.posts.length : 1),
                members: String(currentCafe.members || "1"),
                joinedMembers: currentCafe.joinedMembers || []
            };

            const patchRes = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records/${pbId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const resultData = await patchRes.json();
            console.log("PocketBase cafe sync status:", patchRes.status, resultData);
            return patchRes.ok;
        } catch (err) {
            console.log("PB sync error:", err);
            return false;
        }
    }

    // Batch Delete selected posts from table
    const btnBoardDelete = document.getElementById("btn-board-delete");
    if (btnBoardDelete) {
        btnBoardDelete.addEventListener("click", () => {
            const checkedItems = document.querySelectorAll(".post-check-item:checked");
            if (checkedItems.length === 0) {
                alert("삭제할 게시글을 선택해주세요.");
                return;
            }

            if (confirm(`선택한 ${checkedItems.length}개의 게시글을 삭제하시겠습니까?`)) {
                const idsToDelete = Array.from(checkedItems).map(i => i.getAttribute("data-id"));
                currentCafe.posts = (currentCafe.posts || []).filter(p => !idsToDelete.includes(p.id));
                saveCafeState();
                renderPostTable();
                alert("게시글이 삭제되었습니다.");
            }
        });
    }

    // Single Delete from Post Detail View
    const btnPostDelete = document.getElementById("btn-post-delete");
    const btnDetailBottomDelete = document.getElementById("btn-detail-bottom-delete");
    
    function deleteCurrentPost() {
        if (confirm("이 게시글을 삭제하시겠습니까?")) {
            if (currentViewingPostId) {
                currentCafe.posts = (currentCafe.posts || []).filter(p => p.id !== currentViewingPostId);
                saveCafeState();
            }
            alert("게시글이 삭제되었습니다.");
            showBoardList();
        }
    }

    if (btnPostDelete) btnPostDelete.addEventListener("click", deleteCurrentPost);
    if (btnDetailBottomDelete) btnDetailBottomDelete.addEventListener("click", deleteCurrentPost);

    // Detail Bottom Toolbar actions
    const btnDetailBottomWrite = document.getElementById("btn-detail-bottom-write");
    const btnDetailBottomList = document.getElementById("btn-detail-bottom-list");
    const btnDetailBottomTop = document.getElementById("btn-detail-bottom-top");

    if (btnDetailBottomWrite) btnDetailBottomWrite.addEventListener("click", showWriteView);
    if (btnDetailBottomList) btnDetailBottomList.addEventListener("click", showBoardList);
    if (btnDetailBottomTop) btnDetailBottomTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // 10. Like Button Toggle
    const btnLikePost = document.getElementById("btn-like-post");
    const detailLikeIcon = document.getElementById("detail-like-icon");
    const detailLikeCount = document.getElementById("detail-like-count");
    let isLiked = false;

    if (btnLikePost) {
        btnLikePost.addEventListener("click", () => {
            isLiked = !isLiked;
            let current = parseInt(detailLikeCount.textContent || "0");
            if (isLiked) {
                detailLikeIcon.className = "fa-solid fa-heart";
                detailLikeIcon.style.color = "#e03131";
                detailLikeCount.textContent = current + 1;
            } else {
                detailLikeIcon.className = "fa-regular fa-heart";
                detailLikeIcon.style.color = "";
                detailLikeCount.textContent = Math.max(0, current - 1);
            }
        });
    }

    // 11. URL Copy Button
    const btnCopyUrl = document.getElementById("btn-copy-url");
    if (btnCopyUrl) {
        btnCopyUrl.addEventListener("click", () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("게시글 주소가 복사되었습니다.");
            }).catch(() => {
                prompt("게시글 주소:", window.location.href);
            });
        });
    }

    // 12. Connect [카페 글쓰기] buttons to Full Editor View
    const btnOpenWriteModal = document.getElementById("btn-open-write-modal");
    const btnBoardWrite = document.getElementById("btn-board-write");

    if (btnOpenWriteModal) btnOpenWriteModal.addEventListener("click", showWriteView);
    if (btnBoardWrite) btnBoardWrite.addEventListener("click", showWriteView);

    // 13. Full Editor Formatting Controls (Bold, Italic, Underline, Photo, Link, etc.)
    const fmtBold = document.getElementById("fmt-bold");
    const fmtItalic = document.getElementById("fmt-italic");
    const fmtUnderline = document.getElementById("fmt-underline");
    const fmtStrike = document.getElementById("fmt-strike");
    const btnToolPhoto = document.getElementById("btn-tool-photo");
    const writePhotoUpload = document.getElementById("write-photo-upload");
    const btnToolLink = document.getElementById("btn-tool-link");
    const btnToolQuote = document.getElementById("btn-tool-quote");
    const btnToolDivider = document.getElementById("btn-tool-divider");
    const fullWriteContent = document.getElementById("full-write-content");

    if (fmtBold) fmtBold.addEventListener("click", () => document.execCommand("bold", false, null));
    if (fmtItalic) fmtItalic.addEventListener("click", () => document.execCommand("italic", false, null));
    if (fmtUnderline) fmtUnderline.addEventListener("click", () => document.execCommand("underline", false, null));
    if (fmtStrike) fmtStrike.addEventListener("click", () => document.execCommand("strikeThrough", false, null));

    if (btnToolPhoto && writePhotoUpload && fullWriteContent) {
        btnToolPhoto.addEventListener("click", () => writePhotoUpload.click());
        writePhotoUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    fullWriteContent.focus();
                    document.execCommand("insertImage", false, evt.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnToolLink && fullWriteContent) {
        btnToolLink.addEventListener("click", () => {
            const url = prompt("연결할 링크 URL을 입력하세요:", "https://");
            if (url) {
                fullWriteContent.focus();
                document.execCommand("createLink", false, url);
            }
        });
    }

    if (btnToolQuote && fullWriteContent) {
        btnToolQuote.addEventListener("click", () => {
            fullWriteContent.focus();
            document.execCommand("insertHTML", false, `<blockquote style="border-left: 3px solid #03c75a; padding-left: 12px; margin: 10px 0; color: #555;">인용구를 입력하세요</blockquote><br>`);
        });
    }

    if (btnToolDivider && fullWriteContent) {
        btnToolDivider.addEventListener("click", () => {
            fullWriteContent.focus();
            document.execCommand("insertHorizontalRule", false, null);
        });
    }

    // 14. Full Editor Submission Handler
    async function handleFullSubmit() {
        const boardEl = document.getElementById("full-write-board");
        const prefixEl = document.getElementById("full-write-prefix");
        const titleEl = document.getElementById("full-write-title");
        const contentEl = document.getElementById("full-write-content");
        const noticeEl = document.getElementById("check-write-notice");

        const board = boardEl ? boardEl.value : "자유게시판";
        const prefix = prefixEl ? prefixEl.value : "";
        const rawTitle = titleEl ? titleEl.value.trim() : "";
        const contentHtml = contentEl ? contentEl.innerHTML.trim() : "";
        const isNotice = noticeEl ? noticeEl.checked : false;

        if (!rawTitle) {
            alert("제목을 입력해 주세요.");
            if (titleEl) titleEl.focus();
            return;
        }

        const title = prefix ? `[${prefix}] ${rawTitle}` : rawTitle;
        const curAuthor = (localStorage.getItem("naverLoggedInUser") || currentCafe.manager || loggedInUser || "연습용").trim();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const timeStr = `${year}.${month}.${day}.`;

        const newPost = {
            id: "p_" + Date.now(),
            title: title,
            author: curAuthor,
            time: timeStr,
            views: 0,
            likes: 0,
            commentsCount: 0,
            comments: [],
            board: board,
            content: contentHtml || `${title} 본문 내용입니다.`,
            isNotice: isNotice
        };

        if (!currentCafe.posts) currentCafe.posts = [];
        currentCafe.posts.unshift(newPost);
        currentCafe.newPostsToday = (currentCafe.newPostsToday || 0) + 1;

        if (window.currentCafeRecord) {
            window.currentCafeRecord.posts = currentCafe.posts;
        }

        await saveCafeState();

        alert("게시글이 성공적으로 등록되었습니다!");
        renderPostTable();
        showPostDetail(newPost.id);
    }

    window.handleFullSubmitDirect = handleFullSubmit;

    const btnFullSubmit = document.getElementById("btn-full-submit");
    if (btnFullSubmit) {
        btnFullSubmit.onclick = handleFullSubmit;
    }

    // 15. Fold Welcome Card
    const btnFoldHero = document.getElementById("btn-fold-hero");
    if (btnFoldHero && welcomeHeroCard) {
        let isFolded = false;
        btnFoldHero.addEventListener("click", () => {
            isFolded = !isFolded;
            if (isFolded) {
                welcomeHeroCard.style.display = "none";
            }
        });
    }

    // 16. Intro Toggle Alert
    const btnCafeIntroToggle = document.getElementById("btn-cafe-intro-toggle");
    if (btnCafeIntroToggle) {
        btnCafeIntroToggle.addEventListener("click", (e) => {
            e.preventDefault();
            alert(`[${currentCafe.name} 소개]\n\n매니저: ${currentCafe.manager || loggedInUser}\n주제: ${currentCafe.category || '자유'}\n설명: ${currentCafe.desc || '함께 만들어가는 이야기 공간입니다.'}`);
        });
    }

    // 17. Sidebar & Board Bottom Search
    function searchPosts(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            renderPostTable();
            return;
        }
        const filtered = (currentCafe.posts || []).filter(p => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
        
        if (filtered.length === 0) {
            cafePostTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#888;">'${q}' 검색 결과가 없습니다.</td></tr>`;
        } else {
            cafePostTbody.innerHTML = "";
            filtered.forEach((post, index) => {
                const tr = document.createElement("tr");
                if (post.isNotice) tr.className = "notice-tr";
                const numOrBadge = post.isNotice ? `<span class="badge-table-notice">공지</span>` : (filtered.length - index);

                tr.innerHTML = `
                    <td class="td-check"><input type="checkbox" class="post-check-item" data-id="${post.id}"></td>
                    <td>${numOrBadge}</td>
                    <td class="td-board-title"><span class="post-link-text">${post.title}</span><span class="badge-n-dot">N</span></td>
                    <td>${post.author}</td>
                    <td>${post.time}</td>
                    <td>${post.views || 0}</td>
                    <td>${post.likes || 0}</td>
                `;
                tr.querySelector(".td-board-title").addEventListener("click", () => showPostDetail(post.id));
                cafePostTbody.appendChild(tr);
            });
            syncCheckboxes();
        }
    }

    const sidebarSearchInput = document.getElementById("sidebar-search-input");
    const btnSidebarSearch = document.getElementById("btn-sidebar-search");
    if (btnSidebarSearch && sidebarSearchInput) {
        btnSidebarSearch.addEventListener("click", () => searchPosts(sidebarSearchInput.value));
    }

    const boardSearchInput = document.getElementById("board-search-input");
    const btnBottomSearchSubmit = document.getElementById("btn-bottom-search-submit");
    if (btnBottomSearchSubmit && boardSearchInput) {
        btnBottomSearchSubmit.addEventListener("click", () => searchPosts(boardSearchInput.value));
    }
});
