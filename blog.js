// ====================================================
// EDUVER BLOG - Core Engine & Interactive Data Manager
// ====================================================

// // Initial seed blog posts for demonstration when local storage is empty
const initialPosts = [
    {
        id: "post_default_1",
        author: "정보쌤",
        authorAvatar: "default-avatar.svg",
        time: "방금 전",
        category: "일상·생각",
        title: "에듀버 블로그에 오신 것을 환영합니다!",
        summary: "소소한 일상과 유익한 지식을 공유하는 에듀버 블로그입니다. 다양한 카테고리의 글을 확인하고 자유롭게 작성해 보세요.",
        thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&auto=format&fit=crop&q=80",
        likes: 12,
        comments: 3,
        isNeighbor: false
    },
    {
        id: "post_default_2",
        author: "에듀버매니저",
        authorAvatar: "default-avatar.svg",
        time: "1일 전",
        category: "IT·컴퓨터",
        title: "스마트한 블로그 포스팅 팁 & 활용 가이드",
        summary: "스마트에디터를 이용해 내 컴퓨터에서 이미지 첨부부터 포스트 작성, 수정, 삭제까지 간편하게 관리하는 팁을 알려드립니다.",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80",
        likes: 25,
        comments: 5,
        isNeighbor: false
    }
];

const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

// Initialize Storage & Sync with PocketBase
async function initializeBlogStorage() {
    let localPosts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
    
    // Purge automated test post, legacy author names, and strip redundant authorAvatar
    localPosts = localPosts.filter(p => p.title !== "Test Post" && p.summary !== "This is a test post.");
    localPosts.forEach(p => {
        if (p.author === "조이네") { p.author = "조이"; }
        if (p.authorAvatar) { delete p.authorAvatar; }
    });
    localStorage.setItem("naverBlogPosts", JSON.stringify(localPosts));

    if (!localStorage.getItem("naverBlogPosts") || localPosts.length === 0) {
        localStorage.setItem("naverBlogPosts", JSON.stringify(initialPosts));
    }
    if (!localStorage.getItem("naverBlogActivities")) {
        localStorage.setItem("naverBlogActivities", JSON.stringify([]));
    }

    // Non-blocking sync from PocketBase
    await syncPostsFromPocketBase();
}

async function syncPostsFromPocketBase() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${POCKETBASE_URL}/api/collections/posts/records?sort=-created`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                const filteredItems = data.items.filter(item => item.title !== "Test Post" && item.summary !== "This is a test post.");
                const pbPosts = filteredItems.map(item => {
                    let parsedComments = [];
                    if (Array.isArray(item.comments)) {
                        parsedComments = item.comments;
                    } else if (typeof item.comments === "string") {
                        try {
                            const parsed = JSON.parse(item.comments);
                            if (Array.isArray(parsed)) parsedComments = parsed;
                        } catch (e) {}
                    }

                    let parsedLikedUsers = [];
                    if (Array.isArray(item.likedUsers)) {
                        parsedLikedUsers = item.likedUsers;
                    } else if (typeof item.likedUsers === "string" && item.likedUsers.trim()) {
                        try {
                            const parsed = JSON.parse(item.likedUsers);
                            if (Array.isArray(parsed)) parsedLikedUsers = parsed;
                        } catch (e) {
                            parsedLikedUsers = [item.likedUsers];
                        }
                    }

                    const cleanFullContent = item.fullContent || item.summary || "";

                    return {
                        id: item.id,
                        author: item.author || "블로거",
                        time: item.created ? new Date(item.created).toLocaleDateString() : "방금 전",
                        category: item.category || "일상·생각",
                        title: item.title || "",
                        summary: item.summary || "",
                        fullContent: cleanFullContent,
                        thumbnail: item.thumbnail || "",
                        likes: parsedLikedUsers.length,
                        likedUsers: parsedLikedUsers,
                        commentList: parsedComments,
                        comments: parsedComments.length,
                        isNeighbor: false
                    };
                });

                const localPosts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
                const merged = pbPosts.map(pbPost => {
                    const existing = localPosts.find(lp => lp.id === pbPost.id);
                    if (existing) {
                        const serverComments = pbPost.commentList || [];
                        const localComments = existing.commentList || [];
                        const combinedComments = [...serverComments];
                        localComments.forEach(lc => {
                            if (!combinedComments.find(sc => sc.id === lc.id || (sc.user === lc.user && sc.text === lc.text))) {
                                combinedComments.push(lc);
                            }
                        });

                        const serverLikedUsers = pbPost.likedUsers || [];
                        const localLikedUsers = existing.likedUsers || [];
                        const combinedLikedUsers = Array.from(new Set([...serverLikedUsers, ...localLikedUsers]));

                        return {
                            ...pbPost,
                            commentList: combinedComments,
                            comments: combinedComments.length,
                            likedUsers: combinedLikedUsers,
                            likes: combinedLikedUsers.length,
                            isNeighbor: existing.isNeighbor || false
                        };
                    }
                    return pbPost;
                });

                localPosts.forEach(lp => {
                    if (!merged.find(mp => mp.id === lp.id)) {
                        merged.push(lp);
                    }
                });

                localStorage.setItem("naverBlogPosts", JSON.stringify(merged));
                renderFeedPosts();
            }
        }
    } catch (err) {
        console.warn("PocketBase posts sync skipped or timed out:", err);
    }
}

// Get Data Helpers
function getBlogPosts() {
    const posts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
    if (posts.length === 0) {
        return initialPosts;
    }
    return posts;
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
    return [];
}

function saveActivities(activities) {
    const key = `naverBlogActivities_${getCurrentUserKey()}`;
    localStorage.setItem(key, JSON.stringify(activities));
}

function getUserAvatar(username) {
    const targetUser = username || getCurrentUserKey();
    if (userProfileCache[targetUser] && userProfileCache[targetUser].avatarUrl) {
        return userProfileCache[targetUser].avatarUrl;
    }
    // Check localStorage fallback if available
    const localAvatar = localStorage.getItem(`naverBlogAvatar_${targetUser}`);
    if (localAvatar && (localAvatar.startsWith("http") || localAvatar.startsWith("data:"))) {
        return localAvatar;
    }
    return "default-avatar.svg";
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
                if (rec.avatarUrl) {
                    localStorage.setItem(`naverBlogAvatar_${username}`, rec.avatarUrl);
                    // Dynamically update any rendered post avatars and comment avatars for this author on the page
                    document.querySelectorAll(`img.author-avatar[data-author="${username}"]`).forEach(img => {
                        img.src = rec.avatarUrl;
                    });
                    document.querySelectorAll(`img.comment-avatar-img[data-user="${username}"]`).forEach(img => {
                        img.src = rec.avatarUrl;
                    });
                }
                return rec;
            }
        }
    } catch (e) {}
    return null;
}

function cleanBlogDesc(rawDesc) {
    if (!rawDesc || typeof rawDesc !== "string") return "배움과 소소한 일상을 기록하는 공간입니다.";
    let cleaned = rawDesc.replace(/\[\s*VISITORS\s*:\s*\d+\s*\]/gi, "").trim();
    cleaned = cleaned.replace(/^VISITORS:\d+\s*/i, "").trim();
    return cleaned || "배움과 소소한 일상을 기록하는 공간입니다.";
}

// Auth State Helper
function getLoggedInUser() {
    const isLoggedIn = localStorage.getItem("naverIsLoggedIn") === "true";
    if (!isLoggedIn) return null;
    const name = localStorage.getItem("naverLoggedInUser") || "조이";
    return {
        name: name,
        email: (localStorage.getItem("naverLoggedInEmail") || `${name}@eduver.com`).replace(/@(edunaver|edunver|naver)\.com$/i, "@eduver.com"),
        blogTitle: localStorage.getItem(`naverMyBlogTitle_${name}`) || `${name}의 일상 & 지식 서재`,
        blogDesc: cleanBlogDesc(localStorage.getItem(`naverMyBlogDesc_${name}`) || "배움과 소소한 일상을 기록하는 공간입니다.")
    };
}

// Global Startup - Render UI immediately (non-blocking)
document.addEventListener("DOMContentLoaded", () => {
    // Sanitize any existing localStorage blog descriptions
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("naverMyBlogDesc") || k.startsWith("naverBlogDesc"))) {
            const val = localStorage.getItem(k);
            if (val && /VISITORS/i.test(val)) {
                localStorage.setItem(k, cleanBlogDesc(val));
            }
        }
    }

    setupUserWidget();
    setupHotTopics();
    setupFeedRenderer();
    setupSidebarActivities();
    setupSearch();

    // Background sync
    initializeBlogStorage();

    // Background sync current user profile
    const user = getLoggedInUser();
    if (user) {
        fetchUserProfile(user.name).then(rec => {
            if (rec && rec.avatarUrl) {
                const userAvatarBox = document.querySelector(".user-main-avatar");
                if (userAvatarBox) {
                    userAvatarBox.innerHTML = `<img src="${rec.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                }
            }
        });
    }

    // If post parameter is in URL, redirect directly to my-blog.html for unified reading
    const urlParams = new URLSearchParams(window.location.search);
    const initialPostId = urlParams.get('post') || urlParams.get('postId');
    if (initialPostId) {
        window.location.href = `my-blog.html?post=${encodeURIComponent(initialPostId)}`;
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
        
        // Use dynamically mapped avatar from users collection
        let avatarSrc = getUserAvatar(post.author);
        if (!avatarSrc || avatarSrc === "default-avatar.svg") {
            // Also check current logged-in user profile if matching
            if (currentUser && (post.author === currentUser.name || post.author === currentUser.username)) {
                avatarSrc = getUserAvatar(currentUser.name);
            }
        }
        if (!avatarSrc) {
            avatarSrc = "default-avatar.svg";
        }

        const loggedInUser = localStorage.getItem("naverLoggedInUser") || (currentUser ? (currentUser.name || currentUser.username) : "");
        const isMyPost = Boolean(loggedInUser && (post.author === loggedInUser || (loggedInUser === "조이" && (post.author === "조이" || post.author === "조이네")) || (currentUser && (post.author === currentUser.name || post.author === currentUser.username || post.author === currentUser.id))));

        card.innerHTML = `
            <div class="post-content-area">
                <div class="post-author-row">
                    <div class="author-left" style="cursor: pointer;" onclick="location.href='my-blog.html?author=${encodeURIComponent(post.author)}'">
                        <img src="${avatarSrc}" alt="${post.author}" class="author-avatar" data-author="${post.author}" onerror="this.onerror=null; this.src='default-avatar.svg';">
                        <div class="author-info-text">
                            <span class="author-name">${post.author === '조이네' ? '조이' : post.author}</span>
                            <span class="post-time">${post.time || '방금 전'}</span>
                        </div>
                    </div>
                    ${isMyPost ? '' : `
                        <button class="btn-add-neighbor ${post.isNeighbor ? 'following' : ''}" data-id="${post.id}">
                            ${post.isNeighbor ? '<i class="fa-solid fa-check"></i> 이웃' : '<i class="fa-solid fa-plus"></i> 이웃추가'}
                        </button>
                    `}
                </div>
                <h3 class="post-main-title" onclick="viewPostDetail('${post.id}')">${post.title}</h3>
                <p class="post-summary-text" onclick="viewPostDetail('${post.id}')">${post.summary}</p>
                <div class="post-meta-bottom">
                    <span class="meta-like-btn" data-id="${post.id}">
                        <i class="fa-regular fa-heart"></i> 공감 <strong class="like-count">${Array.isArray(post.likedUsers) ? post.likedUsers.length : (post.likes || 0)}</strong>
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

        // Fetch author profile asynchronously if avatar is default
        if (post.author && (!avatarSrc || avatarSrc === "default-avatar.svg")) {
            fetchUserProfile(post.author);
        }
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

function getLoggedInUserId() {
    let id = localStorage.getItem("naverLoggedInUsername");
    if (!id || id.trim() === "") {
        id = localStorage.getItem("naverLoggedInUserId");
    }
    if (!id || id.trim() === "") {
        const email = localStorage.getItem("naverLoggedInEmail");
        if (email) id = email.split("@")[0];
    }
    if (!id || id.trim() === "") {
        id = localStorage.getItem("naverLoggedInUser") || "joy";
    }
    return id.trim();
}

function getUniqueUserId() {
    return getLoggedInUserId();
}

function getLoggedInUserNickname() {
    return localStorage.getItem("naverLoggedInUser") || 
           localStorage.getItem("naverLoggedInUsername") || 
           "조이";
}

function getBloggerInfo(userKey) {
    const currentId = getLoggedInUserId();
    const currentNick = getLoggedInUserNickname();
    const currentUserId = localStorage.getItem("naverLoggedInUserId") || "";

    let displayName = userKey;
    let avatar = "default-avatar.svg";
    let desc = "";

    if (userKey === currentId || userKey === currentNick || userKey === currentUserId || (currentUserId && userKey === currentUserId)) {
        displayName = currentNick;
        avatar = (userProfileCache[currentNick] && userProfileCache[currentNick].avatarUrl) ||
                 (userProfileCache[currentId] && userProfileCache[currentId].avatarUrl) ||
                 "default-avatar.svg";
        desc = (userProfileCache[currentNick] && userProfileCache[currentNick].blogDesc) || `${currentNick}님의 블로그`;
    } else {
        displayName = userKey;
        avatar = (userProfileCache[userKey] && userProfileCache[userKey].avatarUrl) || "default-avatar.svg";
        desc = `${displayName}님의 블로그`;
    }

    return {
        key: userKey,
        displayName: displayName,
        uniqueId: userKey,
        avatar: avatar,
        desc: desc
    };
}

function toggleLike(postId, btnEl) {
    const loginId = getLoggedInUserId();
    const loginNick = getLoggedInUserNickname();
    const legacyUserId = localStorage.getItem("naverLoggedInUserId") || "";

    if (!loginId) {
        alert("로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.");
        return;
    }

    const posts = getBlogPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
        if (!Array.isArray(post.likedUsers)) {
            post.likedUsers = [];
        }

        const userIndex = post.likedUsers.findIndex(u => 
            u === loginId || 
            u === loginNick || 
            (legacyUserId && u === legacyUserId)
        );
        if (userIndex >= 0) {
            // Unlike
            post.likedUsers.splice(userIndex, 1);
            btnEl.classList.remove("liked");
            btnEl.querySelector("i").className = "fa-regular fa-heart";
        } else {
            // Like - Store account ID in likedUsers!
            post.likedUsers.push(loginId);
            btnEl.classList.add("liked");
            btnEl.querySelector("i").className = "fa-solid fa-heart";
        }
        post.likes = post.likedUsers.length;
        saveBlogPosts(posts);
        const countEl = btnEl.querySelector(".like-count");
        if (countEl) countEl.textContent = post.likes;

        // Sync with PocketBase if valid record ID
        if (post.id && !post.id.startsWith("post_")) {
            try {
                fetch(`${POCKETBASE_URL}/api/collections/posts/records/${post.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        likes: post.likedUsers.length,
                        likedUsers: JSON.stringify(post.likedUsers || [])
                    })
                }).catch(e => console.warn("PocketBase post like patch skipped:", e));
            } catch (err) {}
        }
    }
}

let currentViewingFullPostId = null;

function viewPostDetail(postId) {
    if (!postId) return;
    window.location.href = `my-blog.html?post=${encodeURIComponent(postId)}`;
}

function editFullViewPost() {
    if (!currentViewingFullPostId) return;
    location.href = `blog-write.html?editPostId=${encodeURIComponent(currentViewingFullPostId)}`;
}

function copyFullViewPostUrl() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert("포스트 URL이 클립보드에 복사되었습니다.");
        }).catch(() => {
            prompt("아래 주소를 복사하세요:", url);
        });
    } else {
        prompt("아래 주소를 복사하세요:", url);
    }
}

function renderFullViewLikeState(post) {
    if (!post) return;
    const loginId = getLoggedInUserId();
    const loginNick = getLoggedInUserNickname();
    const legacyUserId = localStorage.getItem("naverLoggedInUserId") || "";

    const likedUsers = Array.isArray(post.likedUsers) ? post.likedUsers : [];
    const isLikedByMe = likedUsers.some(u => 
        u === loginId || 
        u === loginNick || 
        (legacyUserId && u === legacyUserId)
    );

    // Dynamically calculate like count from likedUsers length
    const likeCount = likedUsers.length;
    post.likes = likeCount;

    const likeBtn = document.getElementById("fullview-like-btn");
    const likeIcon = document.getElementById("fullview-like-icon");
    const likeCountEl = document.getElementById("fullview-like-count");

    if (likeCountEl) {
        likeCountEl.textContent = likeCount;
    }

    if (likeBtn && likeIcon) {
        if (isLikedByMe) {
            likeBtn.classList.add("is-liked");
            likeIcon.className = "fa-solid fa-heart";
            likeIcon.style.color = "#ff3b5c";
        } else {
            likeBtn.classList.remove("is-liked");
            likeIcon.className = "fa-regular fa-heart";
            likeIcon.style.color = "#ff5e78";
        }
    }

    renderFullViewLikedBloggersList(post);
}

function toggleFullViewLikedPanel() {
    const panel = document.getElementById("fullview-liked-bloggers-panel");
    const toggleBtn = document.getElementById("btn-fullview-toggle-liked");
    if (panel && toggleBtn) {
        panel.classList.toggle("active");
        toggleBtn.classList.toggle("active");
    }
}

function renderFullViewLikedBloggersList(post) {
    const listEl = document.getElementById("fullview-liked-bloggers-list");
    if (!listEl) return;

    const likedUsers = Array.isArray(post.likedUsers) ? post.likedUsers : [];
    if (likedUsers.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; color: #999; font-size: 13px; padding: 24px 0; grid-column: 1 / -1;">아직 공감한 블로거가 없습니다. 첫 공감을 남겨보세요!</div>`;
        return;
    }

    // Build blogger items by resolving IDs to blogger info
    const bloggers = likedUsers.map(userKey => getBloggerInfo(userKey));

    listEl.innerHTML = "";
    bloggers.forEach(b => {
        const item = document.createElement("div");
        item.className = "liked-blogger-item";
        item.setAttribute("data-username", b.key);
        item.onclick = () => {
            location.href = `my-blog.html?author=${encodeURIComponent(b.displayName || b.key)}`;
        };
        item.innerHTML = `
            <img src="${b.avatar}" class="blogger-avatar-img" alt="${b.displayName}" onerror="this.src='default-avatar.svg'">
            <div class="blogger-text-col">
                <span class="blogger-name">${b.displayName}</span>
                <span class="blogger-desc">${b.desc}</span>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function toggleFullViewLike() {
    const loginId = getLoggedInUserId();
    const loginNick = getLoggedInUserNickname();
    const legacyUserId = localStorage.getItem("naverLoggedInUserId") || "";

    if (!loginId) {
        alert("로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.");
        return;
    }

    if (!currentViewingFullPostId) return;
    const posts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
    const post = posts.find(p => p.id === currentViewingFullPostId);
    if (!post) return;

    if (!Array.isArray(post.likedUsers)) {
        post.likedUsers = [];
    }

    const userIndex = post.likedUsers.findIndex(u => 
        u === loginId || 
        u === loginNick || 
        (legacyUserId && u === legacyUserId)
    );

    if (userIndex >= 0) {
        // Unlike (공감 취소)
        post.likedUsers.splice(userIndex, 1);
    } else {
        // Like (공감) - Register user's ID into likedUsers
        post.likedUsers.push(loginId);
    }
    // Count dynamically from likedUsers length
    post.likes = post.likedUsers.length;
    localStorage.setItem("naverBlogPosts", JSON.stringify(posts));

    renderFullViewLikeState(post);

    // Also update feed card if present
    const cardLikeBtn = document.querySelector(`.meta-like-btn[data-id="${post.id}"]`);
    if (cardLikeBtn) {
        const isLiked = post.likedUsers.includes(loginId) || post.likedUsers.includes(loginNick) || (legacyUserId && post.likedUsers.includes(legacyUserId));
        cardLikeBtn.classList.toggle("liked", isLiked);
        const heartIcon = cardLikeBtn.querySelector("i");
        if (heartIcon) heartIcon.className = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
        const countSpan = cardLikeBtn.querySelector(".like-count");
        if (countSpan) countSpan.textContent = post.likes;
    }

    // Sync with PocketBase
    if (post.id && !post.id.startsWith("post_")) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            fetch(`${POCKETBASE_URL}/api/collections/posts/records/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    likes: post.likedUsers.length,
                    likedUsers: JSON.stringify(post.likedUsers)
                }),
                signal: controller.signal
            }).then(() => clearTimeout(timeoutId)).catch(() => {});
        } catch (e) {}
    }
}

function renderFullViewComments(post) {
    const listEl = document.getElementById("fullview-comments-list");
    const countEl = document.getElementById("fullview-comment-count");
    const totalEl = document.getElementById("fullview-comments-total");
    if (!listEl) return;

    const comments = post.commentList || [];
    if (countEl) countEl.textContent = comments.length;
    if (totalEl) totalEl.textContent = comments.length;

    if (comments.length === 0) {
        listEl.innerHTML = `<div style="font-size: 13px; color: #999; text-align: center; padding: 16px 0;">첫 번째 댓글을 남겨보세요.</div>`;
        return;
    }

    const currentUserId = getUniqueUserId();
    const currentUserName = localStorage.getItem("naverLoggedInUser") || currentUserId;

    listEl.innerHTML = comments.map(c => {
        let avatar = getUserAvatar(c.user) || "default-avatar.svg";
        if (avatar === "default-avatar.svg" && c.avatar && c.avatar.startsWith("data:")) {
            avatar = c.avatar;
        }
        if (typeof fetchUserProfile === "function") {
            fetchUserProfile(c.user);
        }
        const isMyComment = currentUserId && (c.user === currentUserName || c.user === currentUserId || c.userId === currentUserId);
        return `
            <div style="font-size: 13px; padding: 10px 0; border-bottom: 1px solid #edf0f2; display: flex; gap: 10px; align-items: flex-start;">
                <img src="${avatar}" class="comment-avatar-img" data-user="${c.user}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-top: 2px;" alt="${c.user}" onerror="this.onerror=null; this.src='default-avatar.svg';">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <strong style="color: #222; font-size: 13px;">${c.user}</strong>
                            <span style="font-size: 11px; color: #999;">${c.time || '방금 전'}</span>
                        </div>
                        ${isMyComment ? `<button type="button" onclick="deleteFullViewComment(${c.id})" style="background:none; border:none; color:#999; font-size:11px; cursor:pointer; padding:2px 6px; border-radius:4px;" title="댓글 삭제"><i class="fa-solid fa-trash-can"></i> 삭제</button>` : ''}
                    </div>
                    <div style="margin-top: 4px; color: #333; line-height: 1.5; word-break: break-all;">${c.text}</div>
                </div>
            </div>
        `;
    }).join("");
}

async function addFullViewComment() {
    const input = document.getElementById("fullview-comment-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text || !currentViewingFullPostId) return;

    const currentUserId = getUniqueUserId();
    const currentUserName = localStorage.getItem("naverLoggedInUser") || currentUserId || "조이";

    const posts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
    const post = posts.find(p => p.id === currentViewingFullPostId);
    if (!post) return;

    if (!post.commentList) post.commentList = [];

    const newComment = {
        id: Date.now(),
        user: currentUserName,
        userId: currentUserId,
        text: text,
        time: "방금 전"
    };

    post.commentList.push(newComment);
    post.comments = post.commentList.length;
    localStorage.setItem("naverBlogPosts", JSON.stringify(posts));
    input.value = "";

    renderFullViewComments(post);

    // Sync with PocketBase
    if (post.id && !post.id.startsWith("post_")) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            fetch(`${POCKETBASE_URL}/api/collections/posts/records/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comments: post.commentList }),
                signal: controller.signal
            }).then(() => clearTimeout(timeoutId)).catch(() => {});
        } catch (e) {}
    }
}

async function deleteFullViewComment(commentId) {
    if (!currentViewingFullPostId) return;
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    const posts = JSON.parse(localStorage.getItem("naverBlogPosts") || "[]");
    const post = posts.find(p => p.id === currentViewingFullPostId);
    if (post && post.commentList) {
        post.commentList = post.commentList.filter(c => c.id !== commentId);
        post.comments = post.commentList.length;
        localStorage.setItem("naverBlogPosts", JSON.stringify(posts));

        renderFullViewComments(post);

        if (post.id && !post.id.startsWith("post_")) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);
                fetch(`${POCKETBASE_URL}/api/collections/posts/records/${post.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments: post.commentList }),
                    signal: controller.signal
                }).then(() => clearTimeout(timeoutId)).catch(() => {});
            } catch (e) {}
        }
    }
}

function closeFullArticleView() {
    const fullViewEl = document.getElementById("blog-article-fullview");
    const hottopicEl = document.getElementById("hottopic-section");
    const feedEl = document.getElementById("feed-section");
    const sidebarEl = document.querySelector(".blog-sidebar");
    const containerEl = document.querySelector(".blog-container");

    if (fullViewEl) fullViewEl.style.display = "none";
    if (hottopicEl) hottopicEl.style.display = "block";
    if (feedEl) feedEl.style.display = "block";
    if (sidebarEl) sidebarEl.style.display = "block";
    if (containerEl) containerEl.classList.remove("article-reading-mode");

    // Close liked panel if open
    const likedPanel = document.getElementById("fullview-liked-bloggers-panel");
    const toggleBtn = document.getElementById("btn-fullview-toggle-liked");
    if (likedPanel) likedPanel.classList.remove("active");
    if (toggleBtn) toggleBtn.classList.remove("active");

    // Reset URL
    const cleanUrl = window.location.pathname;
    window.history.pushState({}, "EDUVER 블로그", cleanUrl);
}

// Support browser back/forward buttons
window.addEventListener("popstate", (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post') || urlParams.get('postId');
    if (postId) {
        viewPostDetail(postId);
    } else {
        closeFullArticleView();
    }
});

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
                    <img src="${getUserAvatar(p.author)}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src='default-avatar.svg';">
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

