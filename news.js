// ====================================================
// EDUNAVER NEWS (에듀버 뉴스) - Core Engine & Data Manager
// ====================================================

const POCKETBASE_URL = "https://pb.joyfamkr.synology.me";

// Initial seed articles if local storage is empty
const defaultNews = [
    {
        id: "news_1",
        title: "특수교육 대상 학생 맞춤형 'AI 디지털 교과서' 현장 실증 연구 착수",
        subtitle: "개별화 학습 속도에 맞춘 시각·청각 지원 인터페이스로 수업 몰입도 대폭 향상",
        category: "특수교육",
        author: "조이 기자",
        press: "에듀버 교육보도국",
        date: "2026. 9. 10.",
        time: "15:30",
        summary: "교육부와 전국 특수교육 연구진이 협력하여 특수학급 학생들을 위한 차세대 AI 디지털 교과서 시범 사업에 본격 돌입했습니다. 학생 개개인의 인지 수준과 의사소통 특성에 맞춘 동적 피드백이 제공됩니다.",
        content: `
            <p>교육부와 전국 특수교육 연구협력단이 발달장애 및 지체장애 학생들을 위한 '맞춤형 AI 디지털 교과서 실증 연구'에 본격 착수했다고 밝혔습니다.</p>
            <p>이번 프로젝트는 기존 교과서의 일률적인 진도 구성을 탈피하고, 인공지능이 학생의 읽기 속도와 반응을 실시간으로 분석하여 그림 상징(AAC), 자막 음성(TTS), 쉬운 말 대체 문장을 자동으로 재구성하는 것이 핵심입니다.</p>
            <p>연구에 참여한 한 특수교사는 "단순히 전자기기를 교실에 도입하는 것을 넘어, 학생이 혼자서도 문제를 이해하고 성취감을 느낄 수 있는 배리어프리 환경이 실현되고 있다"며 큰 기대감을 드러냈습니다.</p>
        `,
        thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
        views: 1420,
        likes: 88,
        isHeadline: true
    },
    {
        id: "news_2",
        title: "보완대체의사소통(AAC) 그림 상징 표준화 협의회 발족... \"교실과 일상의 단절 줄인다\"",
        subtitle: "학교-가정-지역사회 어디서나 통하는 통합 상징 체계 마련 목표",
        category: "에듀테크",
        author: "정보쌤 기자",
        press: "에듀버 특수교육센터",
        date: "2026. 9. 9.",
        time: "11:20",
        summary: "학교마다 제각각이던 그림 상징과 의사소통 도구의 혼선을 줄이기 위한 전국 표준 상징 체계 구축 협의회가 공식 출범했습니다.",
        content: `
            <p>특수교육 현장에서 언어 발달 지연 아동의 눈과 입이 되어주는 AAC(보완대체의사소통) 도구의 표준화 작업이 급물살을 타고 있습니다.</p>
            <p>그동안 학교와 치료실, 가정에서 사용하는 픽토그램과 상징이 달라 아이들이 혼란을 겪는 사례가 많았으나, 이번 협의회를 통해 일상 기초 어휘 500종에 대한 국가 표준 가이드라인이 제정될 전망입니다.</p>
        `,
        thumbnail: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
        views: 890,
        likes: 64,
        isHeadline: false
    },
    {
        id: "news_3",
        title: "특수교사 힐링 연수 및 교과 나눔의 날 성황리 종료",
        subtitle: "지친 마음 보듬고 서로의 우수 수업 지도안 공유하는 연대의 장",
        category: "사람과 이야기",
        author: "현장취재팀",
        press: "에듀버 뉴스",
        date: "2026. 9. 8.",
        time: "18:00",
        summary: "전국 각지에서 모인 특수교사들이 함께 모여 현장의 고충을 나누고, 직접 개발한 개별화 교구와 수업 활동지를 공유하는 따뜻한 연수의 밤이 열렸습니다.",
        content: `
            <p>복잡해지는 교육 현장에서 묵묵히 헌신하는 특수교사들을 위한 공감 연수가 지난 주말 성황리에 마무리되었습니다.</p>
            <p>이번 행사에서는 교사들의 심리적 소진을 예방하기 위한 힐링 프로그램뿐만 아니라, 현장에서 검증된 미술·체육 융합 지도안 나눔 부스가 열려 참가자들의 큰 호응을 얻었습니다.</p>
        `,
        thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
        views: 650,
        likes: 52,
        isHeadline: false
    },
    {
        id: "news_4",
        title: "2026 하반기 통합교육 지원단 확대 운영... 일반학급 협력 강사 추가 배치",
        subtitle: "일반교사와 특수교사의 원활한 협력 수업 지원 체계 대폭 강화",
        category: "교육정책",
        author: "교육정책팀",
        press: "에듀버 교육보도국",
        date: "2026. 9. 7.",
        time: "09:40",
        summary: "일반 학교 내 특수교육대상자가 배치된 통합학급을 지원하기 위해 전문 협력 강사와 행동중재 지원단이 2학기부터 150개 학교에 추가 배치됩니다.",
        content: `
            <p>모든 학생이 차별 없이 함께 배우는 교실을 만들기 위한 교육청의 통합교육 지원 방안이 한층 강화됩니다.</p>
            <p>수업 중 도전적 행동을 보이는 아동의 긍정적 행동 지원(PBS)을 위해 특수교육 임상전문가가 학급을 직접 방문하여 맞춤형 컨설팅을 제공할 예정입니다.</p>
        `,
        thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80",
        views: 1120,
        likes: 73,
        isHeadline: false
    }
];

// Initialize and Fetch News
async function getNewsArticles() {
    let articles = JSON.parse(localStorage.getItem("naverNewsArticles") || "[]");
    if (!articles || articles.length === 0) {
        articles = defaultNews;
        localStorage.setItem("naverNewsArticles", JSON.stringify(articles));
    }

    // Try background sync with PocketBase if collection exists
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${POCKETBASE_URL}/api/collections/news/records?sort=-created`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            if (data && data.items && data.items.length > 0) {
                const pbArticles = data.items.map(item => {
                    const likedArr = Array.isArray(item.likedUsers) ? item.likedUsers : [];
                    return {
                        id: item.id,
                        title: item.title,
                        subtitle: item.subtitle || "",
                        category: item.category || "특수교육",
                        author: item.author || "기자",
                        authorId: item.authorId || "",
                        press: item.press || "에듀버 뉴스",
                        date: item.created ? new Date(item.created).toLocaleDateString() : "최근",
                        time: item.created ? new Date(item.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                        summary: item.summary || "",
                        content: item.content || item.summary || "",
                        thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
                        views: item.views || 0,
                        likedUsers: likedArr,
                        likes: likedArr.length || item.likes || 0,
                        isHeadline: Boolean(item.isHeadline)
                    };
                });
                // Merge without duplicating
                const merged = [...pbArticles];
                articles.forEach(localArt => {
                    if (!merged.find(m => m.id === localArt.id)) {
                        merged.push(localArt);
                    }
                });
                localStorage.setItem("naverNewsArticles", JSON.stringify(merged));
                return merged;
            }
        }
    } catch (e) {
        // Fallback to local
    }
    return articles;
}

// Global active category
let currentNewsCategory = "전체";

// Render News Portal Home
async function renderNewsHome() {
    const articles = await getNewsArticles();
    if (!articles || articles.length === 0) return;

    // Filter by category
    const filtered = currentNewsCategory === "전체" 
        ? articles 
        : articles.filter(a => a.category === currentNewsCategory);

    // Headline is either marked or first item
    const headline = filtered.find(a => a.isHeadline) || filtered[0] || articles[0];
    const subArticles = filtered.filter(a => a.id !== headline.id);

    // Render Headline Hero
    const heroContainer = document.getElementById("headline-hero-box");
    if (heroContainer && headline) {
        heroContainer.innerHTML = `
            <div class="headline-hero-card" onclick="openNewsDetail('${headline.id}')">
                <div class="headline-hero-img-wrap">
                    <span class="headline-badge">헤드라인</span>
                    <img src="${headline.thumbnail}" alt="Thumbnail" class="headline-hero-img">
                </div>
                <div class="headline-hero-content">
                    <div>
                        <div class="headline-hero-category">[${headline.category}]</div>
                        <h2 class="headline-hero-title">${headline.title}</h2>
                        <p class="headline-hero-desc">${headline.subtitle || headline.summary}</p>
                    </div>
                    <div class="headline-hero-meta">
                        <span><strong>${headline.press}</strong></span>
                        <span>· ${headline.date}</span>
                        <span>· 조회수 ${headline.views.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Sub Cards List
    const listContainer = document.getElementById("news-cards-list");
    if (listContainer) {
        if (subArticles.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: #888; background:#fff; border-radius:8px; border:1px solid #e3e7ed;">해당 분야의 등록된 기사가 없습니다.</div>`;
        } else {
            listContainer.innerHTML = subArticles.map(art => `
                <article class="news-card-item" onclick="openNewsDetail('${art.id}')">
                    <div class="news-card-text">
                        <div>
                            <div class="news-card-cat-badge">[${art.category}]</div>
                            <h3 class="news-card-title">${art.title}</h3>
                            <p class="news-card-snippet">${art.summary}</p>
                        </div>
                        <div class="news-card-meta">
                            <span><strong>${art.press}</strong> (${art.author})</span>
                            <span>· ${art.date}</span>
                            <span><i class="fa-regular fa-heart"></i> ${art.likes}</span>
                        </div>
                    </div>
                    ${art.thumbnail ? `<img src="${art.thumbnail}" alt="Thumb" class="news-card-thumb">` : ''}
                </article>
            `).join("");
        }
    }

    // Render Popular Ranking News
    const rankingContainer = document.getElementById("ranking-news-list");
    if (rankingContainer) {
        const sortedByViews = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        rankingContainer.innerHTML = sortedByViews.map((art, idx) => `
            <li class="ranking-item" onclick="openNewsDetail('${art.id}')">
                <span class="ranking-num">${idx + 1}</span>
                <span class="ranking-text">${art.title}</span>
            </li>
        `).join("");
    }
}

// Open News Detail Page
function openNewsDetail(newsId) {
    window.location.href = `news-detail.html?id=${encodeURIComponent(newsId)}`;
}

// Adjust font size in article detail
let currentDetailFontSize = 16.5;
function changeDetailFontSize(delta) {
    currentDetailFontSize = Math.max(14, Math.min(24, currentDetailFontSize + delta));
    const bodyEl = document.getElementById("detail-body");
    if (bodyEl) {
        bodyEl.style.fontSize = `${currentDetailFontSize}px`;
    }
}
