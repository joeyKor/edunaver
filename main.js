// EDUNAVER - Main Script file containing interactions

// ----------------------------------------------------
// 1. Data Definitions for Publishers ( 뉴스스탠드 모사 )
// ----------------------------------------------------
const publisherData = {
    all: [
        { name: "EBS 교육방송", class: "ebs" },
        { name: "NASA 우주국", class: "nasa" },
        { name: "National Geographic", class: "natgeo" },
        { name: "Nature 저널", class: "nature" },
        { name: "위키백과", class: "wikipedia" },
        { name: "서울대학교", class: "snu" },
        { name: "KAIST", class: "kaist" },
        { name: "TED Ed", class: "ted" },
        { name: "교보문고", class: "" },
        { name: "옥스포드 대학", class: "" },
        { name: "BBC Learning", class: "" },
        { name: "칸아카데미", class: "" },
        { name: "코세라", class: "" },
        { name: "듀오링고", class: "" },
        { name: "KERIS 교육학술", class: "" },
        { name: "동아사이언스", class: "" },
        { name: "학술진흥재단", class: "" },
        { name: "한국사편찬회", class: "" },
        { name: "사이언스올", class: "" },
        { name: "배움나라", class: "" },
        { name: "하버드 에듀", class: "" },
        { name: "MIT 테크리뷰", class: "" },
        { name: "한국교육과정평가원", class: "" },
        { name: "소년한국일보", class: "" }
    ],
    science: [
        { name: "NASA 우주국", class: "nasa" },
        { name: "Nature 저널", class: "nature" },
        { name: "National Geographic", class: "natgeo" },
        { name: "동아사이언스", class: "" },
        { name: "KAIST", class: "kaist" },
        { name: "MIT 테크리뷰", class: "" },
        { name: "IEEE Spectrum", class: "" },
        { name: "사이언스올", class: "" },
        { name: "천문연구원", class: "" },
        { name: "물리학동향", class: "" },
        { name: "생명공학연구소", class: "" },
        { name: "화학융합연구원", class: "" },
        { name: "지질자원연구원", class: "" },
        { name: "기상청 배움터", class: "" },
        { name: "로봇공학회", class: "" },
        { name: "해양과학기술원", class: "" },
        { name: "극지연구소", class: "" },
        { name: "스페이스X 뉴스", class: "" },
        { name: "뇌과학연구소", class: "" },
        { name: "나노융합원", class: "" },
        { name: "AI연구재단", class: "" },
        { name: "미래과학아카데미", class: "" },
        { name: "한국우주항공국", class: "" },
        { name: "사이언티픽 코리아", class: "" }
    ],
    humanities: [
        { name: "위키백과", class: "wikipedia" },
        { name: "브리태니커", class: "" },
        { name: "국립중앙도서관", class: "" },
        { name: "서울대학교", class: "snu" },
        { name: "하버드 에듀", class: "" },
        { name: "옥스포드 대학", class: "" },
        { name: "역사 채널", class: "" },
        { name: "TED Ed", class: "ted" },
        { name: "철학 나우", class: "" },
        { name: "한국사편찬회", class: "" },
        { name: "한국학연구원", class: "" },
        { name: "유네스코 코리아", class: "" },
        { name: "미술사 연구학회", class: "" },
        { name: "국립현대미술관", class: "" },
        { name: "사회과학포럼", class: "" },
        { name: "동양학연구소", class: "" },
        { name: "세계지리학회", class: "" },
        { name: "아시아인문원", class: "" },
        { name: "국회도서관", class: "" },
        { name: "고고학학술지", class: "" },
        { name: "문학동네", class: "" },
        { name: "창비 교육", class: "" },
        { name: "언어학 포털", class: "" },
        { name: "전통문화재단", class: "" }
    ],
    primary: [
        { name: "EBS 교육방송", class: "ebs" },
        { name: "코딩 놀이터", class: "" },
        { name: "수학 나라", class: "" },
        { name: "키즈 내셔널지오", class: "" },
        { name: "어린이 동아", class: "" },
        { name: "소년한국일보", class: "" },
        { name: "KBS 키즈", class: "" },
        { name: "대교 눈높이", class: "" },
        { name: "웅진 북클럽", class: "" },
        { name: "교원 빨간펜", class: "" },
        { name: "상상 초등교실", class: "" },
        { name: "아이스크림홈런", class: "" },
        { name: "밀크T 초등", class: "" },
        { name: "와이즈만 영재", class: "" },
        { name: "주니어 네이버", class: "" },
        { name: "깨비키즈", class: "" },
        { name: "학습꾸러미", class: "" },
        { name: "재미있는 한글", class: "" },
        { name: "어린이 역사교실", class: "" },
        { name: "초등 영단어", class: "" },
        { name: "창의력 놀이터", class: "" },
        { name: "과학소년", class: "" },
        { name: "독서왕클럽", class: "" },
        { name: "주니어 수학동아", class: "" }
    ],
    secondary: [
        { name: "EBSi 고교배움", class: "ebs" },
        { name: "메가스터디", class: "" },
        { name: "이투스", class: "" },
        { name: "대성마이맥", class: "" },
        { name: "비상 교육", class: "" },
        { name: "천재교육", class: "" },
        { name: "금성 교과서", class: "" },
        { name: "교보문고", class: "" },
        { name: "대입 정보 포털", class: "" },
        { name: "수학공식 마스터", class: "" },
        { name: "코딩 올림피아드", class: "" },
        { name: "과학 탐구실험", class: "" },
        { name: "EBS 영어듣기", class: "" },
        { name: "한국사 1급 완성", class: "" },
        { name: "고교 학점제 지원", class: "" },
        { name: "진학사", class: "" },
        { name: "유웨이", class: "" },
        { name: "하이베스트", class: "" },
        { name: "일등 수학", class: "" },
        { name: "자이스토리", class: "" },
        { name: "마더텅", class: "" },
        { name: "EBS 수능특강", class: "" },
        { name: "모의고사 분석원", class: "" },
        { name: "학습 컨설팅", class: "" }
    ],
    global: [
        { name: "옥스포드 사전", class: "" },
        { name: "듀오링고", class: "" },
        { name: "캠브리지 프레스", class: "" },
        { name: "BBC Learning", class: "" },
        { name: "TED Talks", class: "ted" },
        { name: "코세라", class: "" },
        { name: "칸아카데미", class: "" },
        { name: "월스트리트 영어", class: "" },
        { name: "토익 마스터", class: "" },
        { name: "재이 어학원", class: "" },
        { name: "해커스 교육", class: "" },
        { name: "YBM Edu", class: "" },
        { name: "파고다 어학", class: "" },
        { name: "시원스쿨", class: "" },
        { name: "로제타 스톤", class: "" },
        { name: "민병철 유폰", class: "" },
        { name: "영독학습클럽", class: "" },
        { name: "프랑스어 교실", class: "" },
        { name: "중국어 마스터", class: "" },
        { name: "일본어 배움관", class: "" },
        { name: "글로벌 캠퍼스", class: "" },
        { name: "교환학생 길잡이", class: "" },
        { name: "IELTS 트레이닝", class: "" },
        { name: "영문법 기초학습", class: "" }
    ]
};

// Subscribed Publishers list tracker
const subscribedPublishers = new Set();

// Current Active Academic Stand Page
let currentGridPage = 1;
let currentGridCategory = 'all';

// ----------------------------------------------------
// 2. DOM Elements Selection
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Search Box Autocomplete
    const searchInput = document.getElementById("search-input");
    const searchDropdown = document.getElementById("search-dropdown");
    const searchForm = document.getElementById("search-form");
    const searchHistoryList = document.getElementById("search-history-list");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const aiSearchBtn = document.getElementById("ai-search-btn");

    // News Ticker
    const tickerList = document.getElementById("ticker-list");
    let tickerIndex = 0;
    const tickerItemsCount = tickerList ? tickerList.children.length : 0;

    // Academic / Journal Stand Tabs & Grid
    const journalTabs = document.querySelectorAll(".journal-tab");
    const publisherGrid = document.getElementById("publisher-grid");
    const gridPrevBtn = document.getElementById("grid-prev-btn");
    const gridNextBtn = document.getElementById("grid-next-btn");
    const gridPageIndicator = document.getElementById("grid-page-indicator");

    // Login Form State Controls
    const loginLoggedOut = document.getElementById("login-logged-out");
    const loginFormContainer = document.getElementById("login-form-container");
    const loginLoggedIn = document.getElementById("login-logged-in");
    const showLoginFormBtn = document.getElementById("show-login-form-btn");
    const closeLoginBtn = document.getElementById("close-login-btn");
    const authForm = document.getElementById("auth-form");
    const logoutBtn = document.getElementById("logout-btn");
    const userDisplayName = document.getElementById("user-display-name");

    // Course Slider
    const sliderTrack = document.getElementById("slider-track");
    const sliderPrevBtn = document.getElementById("slider-prev-btn");
    const sliderNextBtn = document.getElementById("slider-next-btn");
    const sliderIndicator = document.getElementById("slider-indicator");
    let currentSlide = 0;
    const totalSlides = 3;

    // Load recent search queries from localStorage if available
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");

    // ----------------------------------------------------
    // 3. News Ticker Auto Scrolling (뉴스 롤링)
    // ----------------------------------------------------
    if (tickerList && tickerItemsCount > 0) {
        setInterval(() => {
            tickerIndex = (tickerIndex + 1) % tickerItemsCount;
            // Move container up by 24px per item
            tickerList.style.top = `-${tickerIndex * 24}px`;
        }, 3500);
    }

    // ----------------------------------------------------
    // 4. Search Box Autocomplete Controls
    // ----------------------------------------------------
    const renderRecentSearches = () => {
        if (!searchHistoryList) return;
        
        if (recentSearches.length === 0) {
            searchHistoryList.innerHTML = '<li class="empty-message">최근 검색 내역이 없습니다.</li>';
            return;
        }

        searchHistoryList.innerHTML = "";
        recentSearches.forEach((keyword, idx) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="search-keyword">${keyword}</span>
                <button class="delete-item-btn" data-index="${idx}"><i class="fa-solid fa-xmark"></i></button>
            `;
            searchHistoryList.appendChild(li);
        });

        // Add events to dynamically rendered keyword links & delete buttons
        searchHistoryList.querySelectorAll(".search-keyword").forEach(el => {
            el.addEventListener("click", (e) => {
                searchInput.value = e.target.textContent;
                searchForm.submit();
            });
        });

        searchHistoryList.querySelectorAll(".delete-item-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute("data-index"));
                recentSearches.splice(idx, 1);
                localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
                renderRecentSearches();
            });
        });
    };

    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            renderRecentSearches();
            searchDropdown.style.display = "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const container = document.querySelector(".search-box-container");
            if (container && !container.contains(e.target)) {
                searchDropdown.style.display = "none";
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            recentSearches = [];
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
            renderRecentSearches();
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                // Add to recent search array (limit to 5)
                recentSearches = recentSearches.filter(item => item !== query);
                recentSearches.unshift(query);
                if (recentSearches.length > 5) recentSearches.pop();
                
                localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
                searchInput.value = query;
                searchDropdown.style.display = "none";
                alert(`"${query}" 검색결과 페이지로 연결됩니다. (데모 페이지에서는 검색어 등록 완료)`);
            }
        });
    }

    if (aiSearchBtn) {
        aiSearchBtn.addEventListener("click", () => {
            const query = searchInput.value.trim();
            if (query) {
                alert(`CUE:가 "${query}"에 대한 검색 결과를 생성하고 있습니다...`);
            } else {
                alert("검색어를 입력한 뒤 AI 버튼을 눌러주세요!");
            }
        });
    }

    // Recommend tag click events
    document.querySelectorAll(".recommend-tags .tag").forEach(tag => {
        tag.addEventListener("click", () => {
            searchInput.value = tag.textContent.replace("#", "");
            searchForm.submit();
        });
    });

    // ----------------------------------------------------
    // 5. Publisher Grid Render & Tabs Switch (뉴스스탠드 학술사 그리드)
    // ----------------------------------------------------
    const renderPublisherGrid = (category, page = 1) => {
        if (!publisherGrid) return;
        
        publisherGrid.innerHTML = "";
        
        let allPublishers = publisherData[category] || publisherData.all;
        
        // Simulating different ordering/filtering on pagination
        // Since we have 24 publishers per page, let's rotate them based on page to show pagination works!
        let publishers = [...allPublishers];
        if (page > 1) {
            const shiftCount = (page - 1) * 6;
            // Shift array items to simulate different page configurations
            const slicedPart = publishers.splice(0, shiftCount);
            publishers = [...publishers, ...slicedPart];
        }

        publishers.forEach((pub) => {
            const isSubscribed = subscribedPublishers.has(pub.name);
            const slot = document.createElement("div");
            slot.className = "publisher-slot";
            
            // Format class names for specific text logos
            const textClass = pub.class ? `pub-logo-text ${pub.class}` : "pub-logo-text";
            
            slot.innerHTML = `
                <div class="${textClass}">${pub.name}</div>
                <div class="publisher-hover-card">
                    <button class="hover-btn subscribe ${isSubscribed ? 'subscribed' : ''}" data-name="${pub.name}">
                        ${isSubscribed ? '<i class="fa-solid fa-check"></i> 구독중' : '<i class="fa-solid fa-plus"></i> 구독'}
                    </button>
                    <button class="hover-btn view">이동</button>
                </div>
            `;
            
            publisherGrid.appendChild(slot);
        });

        // Attach events to subscribe buttons
        publisherGrid.querySelectorAll(".hover-btn.subscribe").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const name = btn.getAttribute("data-name");
                if (subscribedPublishers.has(name)) {
                    subscribedPublishers.delete(name);
                    btn.classList.remove("subscribed");
                    btn.innerHTML = '<i class="fa-solid fa-plus"></i> 구독';
                } else {
                    subscribedPublishers.add(name);
                    btn.classList.add("subscribed");
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> 구독중';
                }
            });
        });

        // Update Page Indicator text
        if (gridPageIndicator) {
            gridPageIndicator.textContent = `학술사 더보기 ${page} / 4`;
        }
    };

    // Initialize Publisher Grid
    renderPublisherGrid('all', 1);

    // Tab clicks event
    journalTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            journalTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            currentGridCategory = tab.getAttribute("data-category");
            currentGridPage = 1;
            renderPublisherGrid(currentGridCategory, currentGridPage);
        });
    });

    // Pagination Click Events
    if (gridPrevBtn) {
        gridPrevBtn.addEventListener("click", () => {
            currentGridPage = currentGridPage === 1 ? 4 : currentGridPage - 1;
            renderPublisherGrid(currentGridCategory, currentGridPage);
        });
    }

    if (gridNextBtn) {
        gridNextBtn.addEventListener("click", () => {
            currentGridPage = currentGridPage === 4 ? 1 : currentGridPage + 1;
            renderPublisherGrid(currentGridCategory, currentGridPage);
        });
    }

    // ----------------------------------------------------
    // 6. Login Form Actions & State Toggle (로그인 박스 전환)
    // ----------------------------------------------------
    if (showLoginFormBtn) {
        showLoginFormBtn.addEventListener("click", () => {
            loginLoggedOut.style.display = "none";
            loginFormContainer.style.display = "block";
        });
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener("click", () => {
            loginFormContainer.style.display = "none";
            loginLoggedOut.style.display = "block";
        });
    }

    // Persist login state on load
    if (localStorage.getItem("naverIsLoggedIn") === "true") {
        const savedName = localStorage.getItem("naverLoggedInUser") || "홍길동";
        const savedEmail = localStorage.getItem("naverLoggedInEmail") || "gildong@edunaver.com";
        if (loginLoggedOut && loginLoggedIn) {
            loginLoggedOut.style.display = "none";
            loginLoggedIn.style.display = "block";
            userDisplayName.textContent = savedName;
            const profileEmailEl = document.querySelector(".profile-email");
            if (profileEmailEl) {
                profileEmailEl.textContent = savedEmail;
            }
            updateUnreadCounts();
        }
    }

    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const idInput = document.getElementById("user-id").value.trim();
            const pwInput = document.getElementById("user-pw").value.trim();

            let finalName = "";
            let emailAddr = "";
            let loggedIn = false;

            // 1. Check local mock credentials first
            if (idInput === "abc@naver.com" && pwInput === "abcd1234") {
                finalName = "abc";
                emailAddr = "abc@naver.com";
                loggedIn = true;
            } else if (idInput === "apple@naver.com" && pwInput === "abcd1234") {
                finalName = "apple";
                emailAddr = "apple@naver.com";
                loggedIn = true;
            } else if (idInput === "student" && pwInput === "1234") {
                finalName = "홍길동";
                emailAddr = "gildong@edunaver.com";
                loggedIn = true;
            }

            // 2. Try PocketBase fallback authentication if local match fails
            if (!loggedIn) {
                try {
                    const pbAuthUrl = "https://pb.joyfamkr.synology.me/api/collections/users/auth-with-password";
                    const response = await fetch(pbAuthUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            identity: idInput,
                            password: pwInput
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        finalName = data.record.name || data.record.username;
                        emailAddr = data.record.email || `${data.record.username}@edunaver.com`;
                        loggedIn = true;
                    }
                } catch (err) {
                    console.error("PocketBase auth connection failed:", err);
                }
            }

            if (!loggedIn) {
                alert("아이디 또는 비밀번호가 올바르지 않습니다.");
                return;
            }

            loginFormContainer.style.display = "none";
            loginLoggedIn.style.display = "block";
            userDisplayName.textContent = finalName;
            
            const profileEmailEl = document.querySelector(".profile-email");
            if (profileEmailEl) {
                profileEmailEl.textContent = emailAddr;
            }
            
            // Set persistence
            localStorage.setItem("naverIsLoggedIn", "true");
            localStorage.setItem("naverLoggedInUser", finalName);
            localStorage.setItem("naverLoggedInEmail", emailAddr);
            updateUnreadCounts();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            loginLoggedIn.style.display = "none";
            loginLoggedOut.style.display = "block";
            // Clean credentials in form
            authForm.reset();
            localStorage.removeItem("naverIsLoggedIn");
            localStorage.removeItem("naverLoggedInUser");
            localStorage.removeItem("naverLoggedInEmail");
        });
    }

    // ----------------------------------------------------
    // 8. Dedicated Mail Application Navigation Redirect
    // ----------------------------------------------------
    const cardMailBtn = document.getElementById("card-mail-btn");
    const subnavMailBtn = document.getElementById("nav-mail-btn");

    const isUserLoggedIn = () => {
        return localStorage.getItem("naverIsLoggedIn") === "true";
    };

    const handleMailNavigation = (e) => {
        if (e) e.preventDefault();
        
        if (!isUserLoggedIn()) {
            alert("로그인이 필요한 서비스입니다.");
            const idInput = document.getElementById("user-id");
            if (idInput && loginLoggedOut.style.display !== "none") {
                loginLoggedOut.style.display = "none";
                loginFormContainer.style.display = "block";
                idInput.focus();
            }
            return;
        }

        // Navigate to the full dedicated mail page!
        window.location.href = "mail.html";
    };

    if (cardMailBtn) {
        cardMailBtn.addEventListener("click", handleMailNavigation);
    }

    if (subnavMailBtn) {
        subnavMailBtn.addEventListener("click", handleMailNavigation);
    }

    // Update mail, cafe, and note counts dynamically from PocketBase
    async function updateUnreadCounts() {
        if (localStorage.getItem("naverIsLoggedIn") !== "true") {
            return;
        }
        const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";
        const currentUserEmail = localStorage.getItem("naverLoggedInEmail") || "gildong@edunaver.com";
        
        let unreadCount = 0;
        try {
            const response = await fetch(`${POCKETBASE_URL}/api/collections/mails/records?filter=recipient='${currentUserEmail}'`);
            if (response.ok) {
                const data = await response.json();
                unreadCount = (data.items || []).filter(m => !m.is_read).length;
            }
        } catch (err) {
            console.error("Failed to fetch unread mail count:", err);
        }

        // Update counts in DOM
        const mailCountEl = document.getElementById("profile-mail-count");
        if (mailCountEl) {
            mailCountEl.textContent = unreadCount > 99 ? "99+" : unreadCount;
        }
        
        const noteCountEl = document.getElementById("profile-note-count");
        if (noteCountEl) {
            noteCountEl.textContent = "0";
        }
        
        const cafeCountEl = document.getElementById("profile-cafe-count");
        if (cafeCountEl) {
            cafeCountEl.textContent = "0";
        }
    }
});
