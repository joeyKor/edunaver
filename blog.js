// ====================================================
// EDUVER BLOG - Core Engine & Interactive Data Manager
// ====================================================

// Initial seed blog posts for demonstration
const initialPosts = [
    {
        id: "post_1",
        author: "로동자",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        time: "10시간 전",
        category: "비즈니스·경제",
        title: "미코세라믹스 강릉공장 생산직 및 장비담당 채용공고 | 9월 18일 마감",
        summary: "미코세라믹스 강릉공장 생산직 연봉 복지 합격전략 미코세라믹스는 2020년 (주)미코에서 반도체 장비용 부품 사업부문이 물적분할되어 설립된 세라믹 소재 부품 전문기업입니다. 경기 안성 본사와 강원 강릉 과학산업단지 내 여러 공장을 운영하며 반도체 증착 공정에 쓰이는 세라믹 히터...",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80",
        likes: 7,
        comments: 0,
        isNeighbor: false
    },
    {
        id: "post_2",
        author: "베이킹스튜디오",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        time: "12시간 전",
        category: "요리·레시피",
        title: "실패 없는 바나나 브레드 만들기, 겉바속촉 꿀팁 방출!",
        summary: "집에 남아도는 검은 반점 생긴 완숙 바나나로 만드는 최고의 홈카페 디저트! 버터의 풍미와 바나나의 달콤함이 어우러져 한 입 베어 물면 멈출 수 없는 촉촉한 레시피를 상세 과정샷과 함께 전해드립니다.",
        thumbnail: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=300&auto=format&fit=crop&q=80",
        likes: 34,
        comments: 8,
        isNeighbor: true
    },
    {
        id: "post_3",
        author: "테크인사이드",
        authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        time: "1일 전",
        category: "어학·외국어",
        title: "2026 최신 개발자를 위한 필수 영단어 100선 및 회화 표현",
        summary: "글로벌 테크 기업 면접과 깃허브 오픈소스 기여를 위한 실전 영어 표현 모음. 코드 리뷰 시 자주 사용하는 정중한 피드백 문장부터 최신 AI 기술 도메인 용어까지 알기 쉽게 정리해 드립니다.",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80",
        likes: 52,
        comments: 14,
        isNeighbor: false
    },
    {
        id: "post_4",
        author: "플랜트러버",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        time: "1일 전",
        category: "원예·재배",
        title: "가을철 실내 공기정화 식물 베스트 5 분갈이 및 물주기 가이드",
        summary: "선선해진 날씨에 식물들이 겪는 환경 변화와 과습을 예방하는 흙 배합법. 몬스테라, 스킨답서스, 테이블야자를 건강하게 키우는 홈가드닝 노하우를 소개합니다.",
        thumbnail: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&auto=format&fit=crop&q=80",
        likes: 19,
        comments: 3,
        isNeighbor: false
    }
];

const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

// Initialize Storage if empty & Sync with PocketBase
async function initializeBlogStorage() {
    if (!localStorage.getItem("naverBlogPosts")) {
        localStorage.setItem("naverBlogPosts", JSON.stringify(initialPosts));
    }
    if (!localStorage.getItem("naverBlogActivities")) {
        const initialActivities = [
            { id: 1, text: "AnnieThing님이 2025년 제21회 전국... 글을 공감했습니다.", time: "2026. 8. 7. 10:58" },
            { id: 2, text: "테크인사이드님이 새로운 글을 등록했습니다.", time: "2026. 8. 19. 14:20" }
        ];
        localStorage.setItem("naverBlogActivities", JSON.stringify(initialActivities));
    }

    // Attempt to sync posts from PocketBase
    await syncPostsFromPocketBase();
}

async function syncPostsFromPocketBase() {
    try {
        const response = await fetch(`${POCKETBASE_URL}/api/collections/posts/records?sort=-created`);
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const pbPosts = data.items.map(item => {
                    let parsedComments = [];
                    if (Array.isArray(item.comments)) {
                        parsedComments = item.comments;
                    } else if (typeof item.comments === "string") {
                        try {
                            const parsed = JSON.parse(item.comments);
                            if (Array.isArray(parsed)) parsedComments = parsed;
                        } catch (e) {}
                    }

                    return {
                        id: item.id,
                        author: item.author || "블로거",
                        authorAvatar: item.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
                        time: item.created ? new Date(item.created).toLocaleDateString() : "방금 전",
                        category: item.category || "일상·생각",
                        title: item.title || "",
                        summary: item.summary || "",
                        fullContent: item.fullContent || "",
                        thumbnail: item.thumbnail || "",
                        likes: item.likes || 0,
                        commentList: parsedComments,
                        comments: parsedComments.length,
                        isNeighbor: false
                    };
                });

                // Merge PB posts with local posts (avoiding duplicate IDs and preserving local comments/likes)
                const localPosts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
                const merged = pbPosts.map(pbPost => {
                    const existing = localPosts.find(lp => lp.id === pbPost.id);
                    if (existing) {
                        // Merge local comments that might not have reached server yet
                        const serverComments = pbPost.commentList || [];
                        const localComments = existing.commentList || [];
                        const combinedComments = [...serverComments];
                        localComments.forEach(lc => {
                            if (!combinedComments.find(sc => sc.id === lc.id || (sc.user === lc.user && sc.text === lc.text))) {
                                combinedComments.push(lc);
                            }
                        });

                        return {
                            ...pbPost,
                            commentList: combinedComments,
                            comments: combinedComments.length,
                            likes: Math.max(pbPost.likes || 0, existing.likes || 0),
                            isNeighbor: existing.isNeighbor || false
                        };
                    }
                    return pbPost;
                });

                // Only retain purely local unsynced draft posts; do not restore posts deleted on PocketBase
                localPosts.forEach(lp => {
                    if (lp.isLocalOnly || (typeof lp.id === "string" && lp.id.startsWith("post_local_"))) {
                        if (!merged.find(mp => mp.id === lp.id)) {
                            merged.push(lp);
                        }
                    }
                });

                localStorage.setItem("naverBlogPosts", JSON.stringify(merged));
                renderFeedPosts();
            }
        }
    } catch (err) {
        console.warn("PocketBase posts sync skipped, using local cache:", err);
    }
}

// Get Data Helpers
function getBlogPosts() {
    return JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
}

function saveBlogPosts(posts) {
    localStorage.setItem("naverBlogPosts", JSON.stringify(posts));
}

function getCurrentUserKey() {
    const user = getLoggedInUser();
    return user ? user.name : "guest";
}

function getActivities() {
    const key = `naverBlogActivities_${getCurrentUserKey()}`;
    const userActivities = localStorage.getItem(key);
    if (userActivities) {
        return JSON.parse(userActivities);
    }
    // Fallback: If no user activities, return empty or default welcome
    return [];
}

function saveActivities(activities) {
    const key = `naverBlogActivities_${getCurrentUserKey()}`;
    localStorage.setItem(key, JSON.stringify(activities));
}

function getDefaultAvatar(username) {
    return "default-avatar.svg";
}

function getUserAvatar(username) {
    const targetUser = username || getCurrentUserKey();
    return localStorage.getItem(`naverBlogAvatar_${targetUser}`) || 
           getDefaultAvatar(targetUser);
}

// Global user profile cache from PocketBase
const userProfileCache = {};

async function fetchUserProfile(username) {
    if (!username) return null;
    if (userProfileCache[username]) return userProfileCache[username];
    try {
        const response = await fetch(`${POCKETBASE_URL}/api/collections/users/records?filter=(name='${encodeURIComponent(username)}'||username='${encodeURIComponent(username)}')`);
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const rec = data.items[0];
                userProfileCache[username] = rec;
                if (rec.avatarUrl) localStorage.setItem(`naverBlogAvatar_${username}`, rec.avatarUrl);
                if (rec.blogTitle) localStorage.setItem(`naverMyBlogTitle_${username}`, rec.blogTitle);
                if (rec.blogDesc) localStorage.setItem(`naverMyBlogDesc_${username}`, rec.blogDesc);
                return rec;
            }
        }
    } catch (e) {}
    return null;
}

// Auth State Helper
function getLoggedInUser() {
    const isLoggedIn = localStorage.getItem("naverIsLoggedIn") === "true";
    if (!isLoggedIn) return null;
    const name = localStorage.getItem("naverLoggedInUser") || "조이네";
    return {
        name: name,
        email: (localStorage.getItem("naverLoggedInEmail") || `${name}@eduver.com`).replace(/@(edunaver|edunver|naver)\.com$/i, "@eduver.com"),
        blogTitle: localStorage.getItem(`naverMyBlogTitle_${name}`) || `${name}의 일상 & 지식 서재`,
        blogDesc: localStorage.getItem(`naverMyBlogDesc_${name}`) || "배움과 소소한 일상을 기록하는 공간입니다."
    };
}

// Global Startup
document.addEventListener("DOMContentLoaded", async () => {
    initializeBlogStorage();
    setupUserWidget();
    setupHotTopics();
    setupFeedRenderer();
    setupSidebarActivities();
    setupSearch();

    // Background sync current user profile
    const user = getLoggedInUser();
    if (user) {
        const rec = await fetchUserProfile(user.name);
        if (rec && rec.avatarUrl) {
            const userAvatarBox = document.querySelector(".user-main-avatar");
            if (userAvatarBox) {
                userAvatarBox.innerHTML = `<img src="${rec.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
    }
});

// ----------------------------------------------------
// 1. User & Sidebar Widget Setup
// ----------------------------------------------------
function setupUserWidget() {
    const user = getLoggedInUser();
    const loggedInWidget = document.getElementById("sidebar-logged-in");
    const loggedOutWidget = document.getElementById("sidebar-logged-out");
    const headerUserName = document.getElementById("header-user-name");
    const sidebarUserName = document.getElementById("sidebar-user-name");
    const logoutBtn = document.getElementById("blog-logout-btn");
    const btnMyBlog = document.getElementById("btn-go-my-blog");
    const btnWrite = document.getElementById("btn-go-write");

    const userAvatar = getUserAvatar();
    const userAvatarBox = document.querySelector(".user-main-avatar");

    const headerAvatarImg = document.getElementById("header-avatar-img");

    if (user) {
        if (loggedInWidget) loggedInWidget.style.display = "block";
        if (loggedOutWidget) loggedOutWidget.style.display = "none";
        if (headerUserName) headerUserName.textContent = user.name;
        if (sidebarUserName) sidebarUserName.textContent = user.name;
        if (userAvatarBox) {
            userAvatarBox.innerHTML = `<img src="${userAvatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
        if (headerAvatarImg) {
            headerAvatarImg.src = userAvatar;
        }
    } else {
        if (loggedInWidget) loggedInWidget.style.display = "none";
        if (loggedOutWidget) loggedOutWidget.style.display = "block";
        if (headerUserName) headerUserName.textContent = "로그인";
        if (headerAvatarImg) {
            headerAvatarImg.src = "default-avatar.svg";
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.setItem("naverIsLoggedIn", "false");
            window.location.reload();
        });
    }

    if (btnMyBlog) {
        btnMyBlog.addEventListener("click", () => {
            if (!user) {
                alert("로그인 후 내 블로그를 이용하실 수 있습니다.");
                window.location.href = "index.html";
                return;
            }
            window.location.href = "my-blog.html";
        });
    }

    if (btnWrite) {
        btnWrite.addEventListener("click", () => {
            if (!user) {
                alert("로그인 후 글 작성이 가능합니다.");
                window.location.href = "index.html";
                return;
            }
            window.location.href = "blog-write.html";
        });
    }
}

// ----------------------------------------------------
// 2. Hot Topic Carousel & Banner
// ----------------------------------------------------
function setupHotTopics() {
    const tooltipClose = document.getElementById("banner-tooltip-close");
    const tooltip = document.getElementById("banner-seller-tooltip");

    if (tooltipClose && tooltip) {
        tooltipClose.addEventListener("click", () => {
            tooltip.style.display = "none";
        });
    }

    const pageBtns = document.querySelectorAll(".page-num-btn");
    pageBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            pageBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// ----------------------------------------------------
// 3. Central Post Feed & Category Filters
// ----------------------------------------------------
let currentCategory = "전체";

function setupFeedRenderer() {
    const postContainer = document.getElementById("post-list-container");
    const categoryBtns = document.querySelectorAll(".category-filter-item");

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category") || "전체";
            renderFeedPosts();
        });
    });

    renderFeedPosts();
}

function renderFeedPosts() {
    const postContainer = document.getElementById("post-list-container");
    if (!postContainer) return;

    let posts = getBlogPosts();
    
    // 1. Filter by category
    if (currentCategory !== "전체") {
        posts = posts.filter(p => p.category === currentCategory);
    }

    // 2. Filter by search query if present
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        posts = posts.filter(p => 
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.summary && p.summary.toLowerCase().includes(q)) ||
            (p.fullContent && p.fullContent.toLowerCase().includes(q)) ||
            (p.author && p.author.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
    }

    if (posts.length === 0) {
        postContainer.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: #888;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; margin-bottom: 14px; color: #ced4da;"></i>
                <p style="font-size: 15px; font-weight: 600; color: #495057;">${searchQuery ? `'${searchQuery}'에 대한 검색 결과가 없습니다.` : '해당 카테고리에 등록된 포스트가 없습니다.'}</p>
                ${searchQuery ? `<button onclick="searchQuery=''; document.getElementById('blog-search-input').value=''; renderFeedPosts();" style="margin-top: 12px; font-size: 13px; color: #03c75a; font-weight: 600; background: none; border: 1px solid #03c75a; padding: 6px 14px; border-radius: 4px; cursor: pointer;">전체 글 목록 보기</button>` : ''}
            </div>
        `;
        return;
    }

    postContainer.innerHTML = "";

    // Show search info badge if searching
    if (searchQuery) {
        const searchHeader = document.createElement("div");
        searchHeader.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #e8f9ed; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: #028038;";
        searchHeader.innerHTML = `
            <span><i class="fa-solid fa-magnifying-glass"></i> <strong>'${searchQuery}'</strong> 검색 결과 (총 <strong>${posts.length}</strong>건)</span>
            <button onclick="searchQuery=''; document.getElementById('blog-search-input').value=''; renderFeedPosts();" style="font-size: 12px; color: #555; background: #fff; border: 1px solid #ced4da; padding: 4px 8px; border-radius: 4px; cursor: pointer;">검색 초기화</button>
        `;
        postContainer.appendChild(searchHeader);
    }
    const currentUser = getLoggedInUser();

    posts.forEach(post => {
        const card = document.createElement("article");
        card.className = "blog-post-card";
        
        // Use updated avatar for current user's posts
        let avatarSrc = post.authorAvatar;
        if (currentUser && post.author === currentUser.name) {
            avatarSrc = getUserAvatar(currentUser.name) || post.authorAvatar;
        } else if (post.author) {
            avatarSrc = getUserAvatar(post.author) || post.authorAvatar;
        }
        if (!avatarSrc) {
            avatarSrc = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
        }

        card.innerHTML = `
            <div class="post-content-area">
                <div class="post-author-row">
                    <div class="author-left" style="cursor: pointer;" onclick="location.href='my-blog.html?author=${encodeURIComponent(post.author)}'">
                        <img src="${avatarSrc}" alt="${post.author}" class="author-avatar">
                        <div class="author-info-text">
                            <span class="author-name">${post.author}</span>
                            <span class="post-time">${post.time || '방금 전'}</span>
                        </div>
                    </div>
                    <button class="btn-add-neighbor ${post.isNeighbor ? 'following' : ''}" data-id="${post.id}">
                        ${post.isNeighbor ? '<i class="fa-solid fa-check"></i> 이웃' : '<i class="fa-solid fa-plus"></i> 이웃추가'}
                    </button>
                </div>
                <h3 class="post-main-title" onclick="viewPostDetail('${post.id}')">${post.title}</h3>
                <p class="post-summary-text" onclick="viewPostDetail('${post.id}')">${post.summary}</p>
                <div class="post-meta-bottom">
                    <span class="meta-like-btn" data-id="${post.id}">
                        <i class="fa-regular fa-heart"></i> 공감 <strong class="like-count">${post.likes || 0}</strong>
                    </span>
                    <span>댓글 ${post.comments || 0}</span>
                </div>
            </div>
            ${post.thumbnail ? `
                <div class="post-thumbnail-wrapper" onclick="viewPostDetail('${post.id}')">
                    <img src="${post.thumbnail}" alt="Thumbnail" class="post-thumbnail-img">
                </div>
            ` : ''}
        `;

        postContainer.appendChild(card);
    });

    // Attach Neighbor Add Events
    postContainer.querySelectorAll(".btn-add-neighbor").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute("data-id");
            toggleNeighbor(postId, btn);
        });
    });

    // Attach Like Events
    postContainer.querySelectorAll(".meta-like-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute("data-id");
            toggleLike(postId, btn);
        });
    });
}

function toggleNeighbor(postId, btnEl) {
    const posts = getBlogPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isNeighbor = !post.isNeighbor;
        saveBlogPosts(posts);
        btnEl.classList.toggle("following", post.isNeighbor);
        btnEl.innerHTML = post.isNeighbor ? '<i class="fa-solid fa-check"></i> 이웃' : '<i class="fa-solid fa-plus"></i> 이웃추가';
    }
}

function toggleLike(postId, btnEl) {
    const currentUser = localStorage.getItem("naverLoggedInUser");
    if (!currentUser) {
        alert("로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.");
        return;
    }

    const posts = getBlogPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (!Array.isArray(post.likedUsers)) {
            post.likedUsers = [];
        }

        const userIndex = post.likedUsers.indexOf(currentUser);
        if (userIndex >= 0) {
            // Unlike
            post.likedUsers.splice(userIndex, 1);
            post.likes = Math.max(0, (post.likes || 1) - 1);
            btnEl.classList.remove("liked");
            btnEl.querySelector("i").className = "fa-regular fa-heart";
        } else {
            // Like
            post.likedUsers.push(currentUser);
            post.likes = (post.likes || 0) + 1;
            btnEl.classList.add("liked");
            btnEl.querySelector("i").className = "fa-solid fa-heart";
        }
        saveBlogPosts(posts);
        const countEl = btnEl.querySelector(".like-count");
        if (countEl) countEl.textContent = post.likes;
    }
}

function viewPostDetail(postId) {
    // Navigate directly to my-blog.html with post parameter
    window.location.href = `my-blog.html?post=${encodeURIComponent(postId)}`;
}

// ----------------------------------------------------
// 4. Sidebar Activities Tab Manager
// ----------------------------------------------------
function setupSidebarActivities() {
    const tabBtns = document.querySelectorAll(".sidebar-tab-btn");
    const activityList = document.getElementById("sidebar-activity-list");
    const clearAllBtn = document.getElementById("sidebar-clear-all");

    tabBtns.forEach(tab => {
        tab.addEventListener("click", () => {
            tabBtns.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderActivities(tab.getAttribute("data-tab"));
        });
    });

    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", () => {
            const activeTab = document.querySelector(".sidebar-tab-btn.active")?.getAttribute("data-tab") || "news";
            if (activeTab === "news") {
                saveActivities([]);
                renderActivities("news");
            }
        });
    }

    renderActivities("news");
}

function renderActivities(type) {
    const activityList = document.getElementById("sidebar-activity-list");
    if (!activityList) return;

    const currentUser = getLoggedInUser();

    if (type === "activity") {
        // Show posts written by the logged-in user
        const allPosts = getBlogPosts();
        const myPosts = currentUser ? allPosts.filter(p => p.author === currentUser.name) : [];
        if (myPosts.length === 0) {
            activityList.innerHTML = `<li style="font-size: 12px; color: #888; text-align: center; padding: 20px 0;">작성한 활동 내역이 없습니다.</li>`;
            return;
        }
        activityList.innerHTML = myPosts.map(p => `
            <li class="activity-item" style="cursor: pointer;" onclick="viewPostDetail('${p.id}')">
                <div class="activity-content">
                    <i class="fa-solid fa-pen-nib activity-arrow" style="color: #03c75a;"></i>
                    <div>
                        <div class="activity-text"><strong>'${p.title}'</strong> 글을 발행했습니다.</div>
                        <div class="activity-time">${p.time || '방금 전'}</div>
                    </div>
                </div>
            </li>
        `).join("");
        return;
    }

    if (type === "neighbors") {
        const posts = getBlogPosts().filter(p => p.isNeighbor);
        if (posts.length === 0) {
            activityList.innerHTML = `<li style="font-size: 12px; color: #888; text-align: center; padding: 20px 0;">등록된 이웃이 없습니다.</li>`;
            return;
        }
        activityList.innerHTML = posts.map(p => `
            <li class="activity-item">
                <div class="activity-content">
                    <img src="${p.authorAvatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <strong style="font-size: 12px; color: #222;">${p.author}</strong>
                        <div class="activity-time">${p.category}</div>
                    </div>
                </div>
            </li>
        `).join("");
        return;
    }

    // "news" tab
    const activities = getActivities();
    if (activities.length === 0) {
        activityList.innerHTML = `<li style="font-size: 12px; color: #888; text-align: center; padding: 20px 0;">새로운 소식이 없습니다.</li>`;
        return;
    }

    activityList.innerHTML = activities.map((item, idx) => `
        <li class="activity-item">
            <div class="activity-content">
                <i class="fa-solid fa-arrow-turn-down activity-arrow" style="transform: rotate(-90deg);"></i>
                <div>
                    <div class="activity-text">${item.text}</div>
                    <div class="activity-time">${item.time}</div>
                </div>
            </div>
            <button class="activity-delete-btn" onclick="deleteActivity(${idx})"><i class="fa-solid fa-xmark"></i></button>
        </li>
    `).join("");
}

function deleteActivity(index) {
    const activities = getActivities();
    activities.splice(index, 1);
    saveActivities(activities);
    renderActivities("news");
}

// ----------------------------------------------------
// 5. Search Features
// ----------------------------------------------------
let searchQuery = "";

function setupSearch() {
    const searchForm = document.getElementById("blog-search-form");
    const searchInput = document.getElementById("blog-search-input");

    // Check if there is a search query in the URL parameter (e.g. from index.html)
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search') || urlParams.get('query');
    if (initialQuery) {
        searchQuery = initialQuery.trim();
        if (searchInput) searchInput.value = searchQuery;
        renderFeedPosts();
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            searchQuery = searchInput.value.trim();
            renderFeedPosts();
        });
    }
}

