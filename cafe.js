/**
 * EDUVER Cafe Home Logic (cafe.js)
 * Manages Cafe Feeds, My Cafe List, Favorites, Search, and New Post/Cafe creation.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial State & Sync User Info (Strict check with naverIsLoggedIn)
    const isAuth = localStorage.getItem("naverIsLoggedIn") === "true";
    const loggedInUser = isAuth ? (localStorage.getItem("naverLoggedInUser") || "") : "";
    const userAvatar = localStorage.getItem("naverBlogAvatar") || "default-avatar.svg";

    const cafeUserProfileBadge = document.getElementById("cafe-user-profile-badge");
    const cafeUsernameEl = document.getElementById("cafe-username");
    const cardUserNameEl = document.getElementById("card-user-name");
    const cafeAvatarImg = document.getElementById("cafe-avatar-img");
    const cardAvatarImg = document.getElementById("card-avatar-img");
    const cafeLoggedInBox = document.getElementById("cafe-logged-in-box");
    const cafeLoggedOutBox = document.getElementById("cafe-logged-out-box");

    if (isAuth && loggedInUser) {
        if (cafeUsernameEl) cafeUsernameEl.textContent = `${loggedInUser}님`;
        if (cardUserNameEl) cardUserNameEl.textContent = `${loggedInUser}님`;
        if (cafeAvatarImg) cafeAvatarImg.src = userAvatar;
        if (cardAvatarImg) cardAvatarImg.src = userAvatar;
        if (cafeUserProfileBadge) cafeUserProfileBadge.style.display = "flex";
        if (cafeLoggedInBox) cafeLoggedInBox.style.display = "block";
        if (cafeLoggedOutBox) cafeLoggedOutBox.style.display = "none";
    } else {
        if (cafeUserProfileBadge) {
            cafeUserProfileBadge.innerHTML = `<a href="index.html" style="color: #333; font-size: 13px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;"><i class="fa-regular fa-user"></i> 로그인</a>`;
        }
        if (cafeLoggedInBox) cafeLoggedInBox.style.display = "none";
        if (cafeLoggedOutBox) cafeLoggedOutBox.style.display = "flex";
    }

    // Logout action
    const btnLogout = document.getElementById("btn-cafe-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            if (confirm("로그아웃 하시겠습니까?")) {
                localStorage.removeItem("naverIsLoggedIn");
                localStorage.removeItem("naverLoggedInUser");
                localStorage.removeItem("naverLoggedInUserId");
                localStorage.removeItem("naverLoggedInEmail");
                location.href = "index.html";
            }
        });
    }

    // 2. Cafe Data Initialization (Pure real data only - no fake mock cafes)
    const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

    let cafes = JSON.parse(localStorage.getItem("naverCafesData") || "[]");

    // Remove legacy fake mock cafes if they were previously cached
    const fakeIds = ["asamo", "jjandoli", "mistory"];
    cafes = cafes.filter(c => !fakeIds.includes(c.id));
    localStorage.setItem("naverCafesData", JSON.stringify(cafes));

    // Load real cafes from PocketBase if available
    async function loadCafesFromPocketBase() {
        try {
            const res = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records?sort=-created`);
            if (res.ok) {
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    const pbCafes = data.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        isOfficial: item.isOfficial || false,
                        ranking: item.ranking || "신규 개설",
                        members: item.members || "1",
                        joinedMembers: item.joinedMembers ? (typeof item.joinedMembers === 'string' ? JSON.parse(item.joinedMembers) : item.joinedMembers) : [],
                        newPostsToday: item.newPostsToday || (item.posts ? (typeof item.posts === 'string' ? JSON.parse(item.posts).length : item.posts.length) : 1),
                        icon: item.icon || "default-avatar.svg",
                        isFavorite: item.isFavorite || false,
                        category: item.category || "자유",
                        desc: item.description || "",
                        manager: item.manager || "매니저",
                        posts: item.posts ? (typeof item.posts === 'string' ? JSON.parse(item.posts) : item.posts) : []
                    }));
                    
                    cafes = pbCafes;
                    localStorage.setItem("naverCafesData", JSON.stringify(cafes));
                    renderCafeFeeds();
                }
            }
        } catch (e) {
            console.log("PocketBase cafes fetch notice (using local cache):", e);
        }
    }

    loadCafesFromPocketBase();

    // 3. Render Cafe Feeds & Directory
    const cafeFeedList = document.getElementById("cafe-feed-list");
    const allCafesList = document.getElementById("all-cafes-list");
    const allCafesTotalBadge = document.getElementById("all-cafes-total-badge");
    const sidebarAllCafesCount = document.getElementById("sidebar-all-cafes-count");
    let currentTab = "my-cafe"; // "my-cafe" | "fav-board"
    let currentSearchQuery = "";

    function renderAllCafesGrid() {
        if (sidebarAllCafesCount) sidebarAllCafesCount.textContent = cafes.length;
        if (allCafesTotalBadge) allCafesTotalBadge.textContent = `${cafes.length}개`;
        if (!allCafesList) return;

        if (cafes.length === 0) {
            allCafesList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #888; background: #f8f9fa; border-radius: 10px;">
                    <i class="fa-solid fa-mug-saucer" style="font-size: 36px; color: #ced4da; margin-bottom: 12px;"></i>
                    <p style="font-size: 14px; font-weight: 600;">개설된 카페가 없습니다.</p>
                </div>
            `;
            return;
        }

        allCafesList.innerHTML = "";
        cafes.forEach(c => {
            const item = document.createElement("div");
            item.className = "cafe-row-item";
            item.onclick = () => {
                location.href = `cafe-detail.html?id=${c.id}&name=${encodeURIComponent(c.name)}`;
            };

            const desc = c.desc || `${c.name} 카페에서 다양한 정보와 소식을 나누어 보세요.`;
            const members = c.members || "1";
            const level = c.level || "씨앗1단계";
            const category = c.category || "자유";
            const growthScore = Math.floor(Math.random() * 50000 + 10000).toLocaleString();

            item.innerHTML = `
                <div class="cafe-row-avatar">
                    <img src="${c.icon || 'default-avatar.svg'}" alt="${c.name}">
                </div>
                <div class="cafe-row-info">
                    <div class="cafe-row-title-line">
                        <span class="cafe-row-name">${c.name}</span>
                        ${c.isOfficial ? `<span class="cafe-tag-rep">대표</span>` : ''}
                    </div>
                    <div class="cafe-row-desc">${desc}</div>
                    <div class="cafe-row-meta-line">
                        <span>${category}</span>
                        <span class="sep">·</span>
                        <span><i class="fa-regular fa-user cafe-meta-icon"></i> ${members}</span>
                        <span class="sep">·</span>
                        <span>${level}</span>
                        <span class="sep">·</span>
                        <span class="cafe-growth-stat"><i class="fa-solid fa-arrow-up"></i> ${growthScore}</span>
                    </div>
                </div>
            `;
            allCafesList.appendChild(item);
        });
    }

    function renderCafeFeeds() {
        renderAllCafesGrid();
        if (!cafeFeedList) return;

        let displayCafes = [...cafes];

        if (currentTab === "fav-board") {
            displayCafes = displayCafes.filter(c => c.isFavorite);
        }

        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            displayCafes = displayCafes.filter(c => {
                const nameMatch = c.name.toLowerCase().includes(q);
                const postMatch = c.posts && c.posts.some(p => p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
                return nameMatch || postMatch;
            });
        }

        if (displayCafes.length === 0) {
            cafeFeedList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #888; background: #f8f9fa; border-radius: 10px;">
                    <i class="fa-solid fa-mug-saucer" style="font-size: 36px; color: #ced4da; margin-bottom: 12px;"></i>
                    <p style="font-size: 14px; font-weight: 600;">등록된 카페 또는 게시글이 없습니다.</p>
                </div>
            `;
            return;
        }

        cafeFeedList.innerHTML = "";

        displayCafes.forEach(cafe => {
            const card = document.createElement("div");
            card.className = "cafe-group-card";

            const postsHtml = (cafe.posts || []).map(p => `
                <li class="cafe-post-item">
                    <div class="post-item-left">
                        <span class="post-item-title" onclick="location.href='cafe-detail.html?id=${cafe.id}&name=${encodeURIComponent(cafe.name)}'">${p.title}</span>
                        ${p.comments > 0 ? `<span class="post-item-comment-count"><i class="fa-regular fa-comment-dots" style="font-size:10px;"></i> ${p.comments}</span>` : ''}
                    </div>
                    <div class="post-item-right">
                        <span class="post-item-author">${p.author}</span>
                        <span class="post-item-time">· ${p.time}</span>
                    </div>
                </li>
            `).join("");

            card.innerHTML = `
                <div class="cafe-group-header">
                    <div class="cafe-group-info">
                        <img src="${cafe.icon}" class="cafe-icon-thumb" alt="${cafe.name}" onclick="location.href='cafe-detail.html?id=${cafe.id}&name=${encodeURIComponent(cafe.name)}'" style="cursor:pointer;">
                        <div class="cafe-group-text">
                            <div class="cafe-name-row" onclick="location.href='cafe-detail.html?id=${cafe.id}&name=${encodeURIComponent(cafe.name)}'">
                                <span>${cafe.name}</span>
                                ${cafe.isOfficial ? `<span class="cafe-tag-green">대표</span>` : ''}
                                ${cafe.ranking ? `<span class="cafe-members-count"><i class="fa-solid fa-users" style="font-size:9px;"></i> ${cafe.ranking}</span>` : ''}
                            </div>
                            <span class="cafe-new-posts-count">새 글 ${cafe.newPostsToday}</span>
                        </div>
                    </div>
                    <button class="cafe-fav-star ${cafe.isFavorite ? 'active' : ''}" data-id="${cafe.id}" title="즐겨찾기">
                        <i class="fa-${cafe.isFavorite ? 'solid' : 'regular'} fa-star"></i>
                    </button>
                </div>
                <ul class="cafe-post-items">
                    ${postsHtml}
                </ul>
            `;

            cafeFeedList.appendChild(card);
        });

        // Favorite Toggle Events
        cafeFeedList.querySelectorAll(".cafe-fav-star").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const target = cafes.find(c => c.id === id);
                if (target) {
                    target.isFavorite = !target.isFavorite;
                    localStorage.setItem("naverCafesData", JSON.stringify(cafes));
                    renderCafeFeeds();
                }
            });
        });
    }

    renderCafeFeeds();

    // 4. Tab Switching
    const tabMyCafe = document.getElementById("tab-my-cafe");
    const tabFavBoard = document.getElementById("tab-fav-board");

    if (tabMyCafe && tabFavBoard) {
        tabMyCafe.addEventListener("click", () => {
            tabMyCafe.classList.add("active");
            tabFavBoard.classList.remove("active");
            currentTab = "my-cafe";
            renderCafeFeeds();
        });

        tabFavBoard.addEventListener("click", () => {
            tabFavBoard.classList.add("active");
            tabMyCafe.classList.remove("active");
            currentTab = "fav-board";
            renderCafeFeeds();
        });
    }

    // 5. Search Bar Form
    const cafeSearchForm = document.getElementById("cafe-search-form");
    const cafeSearchInput = document.getElementById("cafe-search-input");

    if (cafeSearchForm) {
        cafeSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            currentSearchQuery = cafeSearchInput ? cafeSearchInput.value.trim() : "";
            renderCafeFeeds();
        });
    }

    // 6. View Switching (Home vs All Cafes List vs Create Form)
    const cafeHomeView = document.getElementById("cafe-home-view");
    const cafeAllListView = document.getElementById("cafe-all-list-view");
    const cafeCreateView = document.getElementById("cafe-create-view");
    const btnCreateCafe = document.getElementById("btn-create-cafe");
    const btnRealCreateCancel = document.getElementById("btn-real-create-cancel");
    const realCreateCafeForm = document.getElementById("real-create-cafe-form");
    const navCafeHome = document.getElementById("nav-cafe-home");
    const navAllCafes = document.getElementById("nav-all-cafes");
    const catAllCafesLink = document.getElementById("cat-all-cafes-link");

    function showHomeView() {
        if (cafeCreateView) cafeCreateView.style.display = "none";
        if (cafeAllListView) cafeAllListView.style.display = "none";
        if (cafeHomeView) cafeHomeView.style.display = "block";
        document.querySelectorAll(".cafe-menu-item").forEach(m => m.classList.remove("active"));
        if (navCafeHome) navCafeHome.classList.add("active");
        renderCafeFeeds();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showAllCafesView() {
        if (cafeHomeView) cafeHomeView.style.display = "none";
        if (cafeCreateView) cafeCreateView.style.display = "none";
        if (cafeAllListView) cafeAllListView.style.display = "block";
        document.querySelectorAll(".cafe-menu-item").forEach(m => m.classList.remove("active"));
        if (navAllCafes) navAllCafes.classList.add("active");
        renderAllCafesGrid();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showCreateView() {
        if (cafeHomeView) cafeHomeView.style.display = "none";
        if (cafeAllListView) cafeAllListView.style.display = "none";
        if (cafeCreateView) cafeCreateView.style.display = "block";
        document.querySelectorAll(".cafe-menu-item").forEach(m => m.classList.remove("active"));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (navCafeHome) navCafeHome.addEventListener("click", (e) => { e.preventDefault(); showHomeView(); });
    if (navAllCafes) navAllCafes.addEventListener("click", (e) => { e.preventDefault(); showAllCafesView(); });
    if (catAllCafesLink) catAllCafesLink.addEventListener("click", (e) => { e.preventDefault(); showAllCafesView(); });
    if (btnCreateCafe) btnCreateCafe.addEventListener("click", showCreateView);

    if (btnRealCreateCancel) {
        btnRealCreateCancel.addEventListener("click", () => {
            if (confirm("카페 만들기를 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.")) {
                if (realCreateCafeForm) realCreateCafeForm.reset();
                showHomeView();
            }
        });
    }

    // Subcategory mapping
    const catMainSelect = document.getElementById("create-cafe-cat-main");
    const catSubSelect = document.getElementById("create-cafe-cat-sub");
    const subCatMap = {
        "IT/컴퓨터": ["스마트폰/태블릿", "프로그래밍/코딩", "하드웨어/PC", "인공지능/AI"],
        "경제/금융": ["재테크/부동산", "국내주식/해외주식", "창업/부업", "절약/가계부"],
        "교육/학습": ["초중고 학습", "대학/대학원", "어학/자격증", "공무원/고시"],
        "취미/여가": ["게임", "영화/음악", "운동/스포츠", "반려동물", "요리/베이킹"],
        "생활/쇼핑": ["패션/뷰티", "인테리어/DIY", "중고거래/나눔", "육아/출산"]
    };

    if (catMainSelect && catSubSelect) {
        catMainSelect.addEventListener("change", () => {
            const selectedMain = catMainSelect.value;
            const subs = subCatMap[selectedMain] || ["일반", "자유게시판"];
            catSubSelect.innerHTML = `<option value="" disabled selected>소분류 선택</option>` +
                subs.map(s => `<option value="${s}">${s}</option>`).join("");
        });
    }

    // Description character counter
    const createCafeDesc = document.getElementById("create-cafe-desc");
    const descCharCount = document.getElementById("desc-char-count");
    if (createCafeDesc && descCharCount) {
        createCafeDesc.addEventListener("input", () => {
            descCharCount.textContent = `${createCafeDesc.value.length}/100`;
        });
    }

    // Keyword tags
    const keywordInput = document.getElementById("create-cafe-keywords");
    const btnKeywordReg = document.getElementById("btn-keyword-reg");
    const tagsPreviewRow = document.getElementById("tags-preview-row");
    let keywordList = [];

    function renderKeywordTags() {
        if (!tagsPreviewRow) return;
        tagsPreviewRow.innerHTML = keywordList.map((kw, idx) => `
            <span class="keyword-tag-pill">
                #${kw}
                <button type="button" class="remove-kw-btn" onclick="removeCafeKeyword(${idx})">&times;</button>
            </span>
        `).join("");
    }

    window.removeCafeKeyword = function(index) {
        keywordList.splice(index, 1);
        renderKeywordTags();
    };

    function addKeyword() {
        if (!keywordInput) return;
        const val = keywordInput.value.replace(/\s+/g, "").trim();
        if (val && keywordList.length < 10 && !keywordList.includes(val)) {
            keywordList.push(val);
            keywordInput.value = "";
            renderKeywordTags();
        }
    }

    if (btnKeywordReg) {
        btnKeywordReg.addEventListener("click", addKeyword);
    }
    if (keywordInput) {
        keywordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
            }
        });
    }

    // Region setting simulation
    const btnAddRegion = document.getElementById("btn-add-region");
    const selectedRegionText = document.getElementById("selected-region-text");
    if (btnAddRegion && selectedRegionText) {
        btnAddRegion.addEventListener("click", () => {
            const region = prompt("활동 기반 지역을 입력해주세요 (예: 서울 강남구, 경기 성남시):", "전국");
            if (region) {
                selectedRegionText.textContent = `설정된 지역: ${region}`;
            }
        });
    }

    // Icon file upload simulation
    const cafeIconPreviewBox = document.getElementById("cafe-icon-preview-box");
    const createCafeIconFile = document.getElementById("create-cafe-icon-file");
    let uploadedCafeIcon = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=80&auto=format&fit=crop&q=80";

    if (cafeIconPreviewBox && createCafeIconFile) {
        cafeIconPreviewBox.addEventListener("click", () => {
            createCafeIconFile.click();
        });

        createCafeIconFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    uploadedCafeIcon = evt.target.result;
                    cafeIconPreviewBox.innerHTML = `
                        <img src="${uploadedCafeIcon}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 24px;">
                        <div class="icon-camera-badge"><i class="fa-solid fa-camera"></i></div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Captcha refresh simulation
    const captchaImgBox = document.getElementById("captcha-img-box");
    const captchaInput = document.getElementById("captcha-input");
    const btnCaptchaRefresh = document.getElementById("btn-captcha-refresh");
    const btnCaptchaAudio = document.getElementById("btn-captcha-audio");
    const captchaSamples = ["JL58", "9K2P", "7M4X", "3R8T", "A6W2", "4B9Q", "E8N3"];
    let currentCaptcha = "JL58";

    function refreshCaptcha() {
        const random = captchaSamples[Math.floor(Math.random() * captchaSamples.length)];
        currentCaptcha = random;
        if (captchaImgBox) captchaImgBox.innerHTML = `<span class="captcha-fake-noise">${random}</span>`;
        if (captchaInput) captchaInput.value = "";
    }

    if (btnCaptchaRefresh) {
        btnCaptchaRefresh.addEventListener("click", refreshCaptcha);
    }

    if (btnCaptchaAudio) {
        btnCaptchaAudio.addEventListener("click", () => {
            alert(`보안 음성 안내: [ ${currentCaptcha.split("").join(" - ")} ]`);
        });
    }

    // Handle Real Cafe Creation Submission
    if (realCreateCafeForm) {
        realCreateCafeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("create-cafe-name").value.trim();
            const desc = document.getElementById("create-cafe-desc").value.trim();
            const catMain = document.getElementById("create-cafe-cat-main").value;
            const inputCaptcha = (captchaInput ? captchaInput.value.trim() : "").toUpperCase();
            const agree = document.getElementById("agree-policy").checked;

            if (!name) {
                alert("카페 이름을 입력해주세요.");
                return;
            }
            if (!catMain) {
                alert("주제를 선택해주세요.");
                return;
            }
            if (inputCaptcha !== currentCaptcha.toUpperCase()) {
                alert("보안문자가 일치하지 않습니다. 이미지를 확인 후 다시 입력해주세요.");
                refreshCaptcha();
                if (captchaInput) captchaInput.focus();
                return;
            }
            if (!agree) {
                alert("카페 개인정보보호정책에 동의해주세요.");
                return;
            }

            const initialPost = {
                id: "p_" + Date.now(),
                title: `[공지] ${name}에 오신 것을 환영합니다!`,
                author: loggedInUser || "조이",
                time: "방금 전",
                board: "자유게시판",
                isNotice: true,
                comments: 0,
                content: `${name} 카페를 시작합니다.\n\n함께 이야기 나누며 즐겁고 행복한 카페를 만들어가요!`
            };

            let createdCafeId = "cafe_" + Date.now();

            // Save to PocketBase if available
            try {
                const pbPayload = {
                    name: name,
                    description: desc,
                    category: catMain,
                    manager: loggedInUser || "조이",
                    members: "1",
                    ranking: "신규 카페",
                    isOfficial: false,
                    isFavorite: true,
                    newPostsToday: 1,
                    posts: JSON.stringify([initialPost])
                };

                const pbRes = await fetch(`${POCKETBASE_URL}/api/collections/cafes/records`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pbPayload)
                });

                if (pbRes.ok) {
                    const pbData = await pbRes.json();
                    createdCafeId = pbData.id;
                }
            } catch (err) {
                console.log("PocketBase create notice (fallback to local):", err);
            }

            const newCafe = {
                id: createdCafeId,
                name: name,
                isOfficial: false,
                ranking: "신규 카페",
                members: "1",
                newPostsToday: 1,
                icon: uploadedCafeIcon,
                isFavorite: true,
                category: catMain,
                keywords: keywordList,
                desc: desc,
                manager: loggedInUser || "조이",
                posts: [initialPost]
            };

            cafes.unshift(newCafe);
            localStorage.setItem("naverCafesData", JSON.stringify(cafes));

            realCreateCafeForm.reset();
            keywordList = [];
            renderKeywordTags();
            refreshCaptcha();
            
            alert(`'${name}' 카페가 성공적으로 개설되었습니다! 개별 카페 메인으로 이동합니다.`);
            location.href = `cafe-detail.html?id=${newCafe.id}&name=${encodeURIComponent(name)}`;
        });
    }

    // 7. Write Quick Post Modal
    const writePostModal = document.getElementById("write-post-modal");
    const writeModalCloseBtn = document.getElementById("write-modal-close-btn");
    const btnWriteCancel = document.getElementById("btn-write-cancel");
    const writePostForm = document.getElementById("write-post-form");
    const writePostCafeTitle = document.getElementById("write-post-cafe-title");
    const writePostCafeId = document.getElementById("write-post-cafe-id");

    window.openWritePostModal = function(cafeId, cafeName) {
        if (!writePostModal) return;
        writePostCafeId.value = cafeId;
        writePostCafeTitle.textContent = `[${cafeName}] 새 글 쓰기`;
        writePostModal.style.display = "flex";
    };

    if (writePostModal) {
        const closeWriteModal = () => { writePostModal.style.display = "none"; };
        if (writeModalCloseBtn) writeModalCloseBtn.addEventListener("click", closeWriteModal);
        if (btnWriteCancel) btnWriteCancel.addEventListener("click", closeWriteModal);

        writePostForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cafeId = writePostCafeId.value;
            const title = document.getElementById("new-post-title").value.trim();
            const content = document.getElementById("new-post-content").value.trim();

            if (title && cafeId) {
                const target = cafes.find(c => c.id === cafeId);
                if (target) {
                    if (!target.posts) target.posts = [];
                    target.posts.unshift({
                        id: "p_" + Date.now(),
                        title: title,
                        author: loggedInUser || "조이",
                        time: "방금 전",
                        comments: 0
                    });
                    target.newPostsToday = (target.newPostsToday || 0) + 1;
                    localStorage.setItem("naverCafesData", JSON.stringify(cafes));
                    writePostForm.reset();
                    closeWriteModal();
                    renderCafeFeeds();
                    alert("게시글이 성공적으로 등록되었습니다!");
                }
            }
        });
    }
});
