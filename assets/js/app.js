// Main App Module

// 5. News Gallery Logic
let newsData = [];
window.currentNewsIndex = 0; // Expose to window for onclick in HTML
let newsInterval;

async function loadNews() {
    newsData = await fetchData('assets/data/news.json');
    if (newsData.length === 0) return;

    // Create Thumbnails/Numbers
    const thumbsContainer = document.getElementById('gallery-thumbs');
    thumbsContainer.innerHTML = '';

    newsData.forEach((_, index) => {
        const btn = document.createElement('div');
        btn.className = `gallery-thumb-btn ${index === 0 ? 'active' : ''}`;
        btn.innerText = index + 1;
        btn.onclick = () => showNewsSlide(index);
        thumbsContainer.appendChild(btn);
    });

    // Show first slide
    if (newsData.length > 0) {
        showNewsSlide(0);
        startNewsInterval();
    }
}

function showNewsSlide(index) {
    window.currentNewsIndex = index;
    const item = newsData[index];

    document.getElementById('gallery-img').src = item.image;
    document.getElementById('gallery-title').innerText = item.title;
    document.getElementById('gallery-desc').innerText = item.description;

    // Link update removed as we use onclick

    // Update active thumb
    const thumbs = document.querySelectorAll('.gallery-thumb-btn');
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumbs[index]) thumbs[index].classList.add('active');

    // Reset Interval
    startNewsInterval();
}

function startNewsInterval() {
    if (newsInterval) clearInterval(newsInterval);
    newsInterval = setInterval(() => {
        let next = (window.currentNewsIndex + 1) % newsData.length;
        showNewsSlide(next);
    }, 6000); // 6 seconds
}

// --- Columnists Logic ---
let columnistData = [];

async function loadColumnists() {
    try {
        columnistData = await fetchData('assets/data/columnists.json');

        const listContainer = document.getElementById('columnist-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        columnistData.forEach(author => {
            const item = document.createElement('div');
            item.className = 'columnist-item';
            item.onclick = () => openColumnistDetail(author.id);

            item.innerHTML = `
                <img src="${author.image}" class="col-thumb" alt="${author.name}">
                <div class="col-info">
                    <span class="col-name">${author.name}</span>
                    <span class="col-title">${author.title}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Köşe yazarları yüklenirken hata:', error);
    }
}

window.openColumnistDetail = (id) => {
    const author = columnistData.find(c => c.id === id);
    if (!author) return;

    // Switch views
    document.getElementById('news-page').style.display = 'none';
    const detailView = document.getElementById('columnist-detail');
    detailView.style.display = 'block';

    // Populate Data
    document.getElementById('col-detail-img').src = author.image;
    document.getElementById('col-detail-name').innerText = author.name;
    document.getElementById('col-detail-title').innerText = author.title;
    document.getElementById('col-detail-body').innerText = author.content;

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 6. Page Navigation (SPA-like)
// 6. Page Navigation (SPA-like)
// 6. Page Navigation (SPA-like)
window.showPage = (pageIds) => {
    // Hide all
    const pages = ['home-page', 'news-page', 'news-detail', 'games-page', 'lessons-page', 'resources-page', 'columnist-detail'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    if (pageIds === 'home') {
        document.getElementById('home-page').style.display = 'block';
        // Optional: window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (pageIds === 'news') {
        document.getElementById('news-page').style.display = 'block';
        loadNews();
        loadColumnists();
    }
    else if (pageIds === 'lessons') {
        document.getElementById('lessons-page').style.display = 'block';
        loadVideos();
    }
    else if (pageIds === 'resources') {
        document.getElementById('resources-page').style.display = 'block';
        loadResources();
    }
    else if (pageIds === 'games') {
        document.getElementById('home-page').style.display = 'block';
        setTimeout(() => {
            const grid = document.getElementById('game-grid');
            if (grid) {
                // Scroll to the parent section of the grid usually, or just the grid
                grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
};

window.openNewsDetail = (index) => {
    const item = newsData[index];
    if (!item) return;

    // Populate
    document.getElementById('detail-title').innerText = item.title;
    document.getElementById('detail-img').src = item.image;

    // Add default content if missing (for testing)
    const content = item.content || item.description || "İçerik yükleniyor...";
    document.getElementById('detail-body').innerText = content;

    // Switch View
    document.getElementById('news-page').style.display = 'none';
    document.getElementById('news-detail').style.display = 'block';

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    await loadVideos();
    await loadResources();
    await loadGames();
    await initSlider();
}

// Helper to fetch data safely
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("Could not fetch data:", e);
        return [];
    }
}

// 1. Slider Logic
async function initSlider() {
    const slides = await fetchData('assets/data/slider.json');
    if (slides.length === 0) return;

    const wrapper = document.getElementById('slider-wrapper');
    const textContainer = document.getElementById('slider-text');

    // Create DOM elements for slides
    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
        slideDiv.innerHTML = `<img src="${slide.image}" alt="${slide.title}">`;
        wrapper.appendChild(slideDiv);
    });

    // Initial text
    const updateText = (index) => {
        const slide = slides[index];
        textContainer.innerHTML = `
            <h2 class="slider-title">${slide.title}</h2>
            <p>${slide.text}</p>
        `;
    };
    updateText(0);

    // Auto rotate
    let currentIndex = 0;
    setInterval(() => {
        // Remove active from current
        wrapper.children[currentIndex].classList.remove('active');

        // Next index
        currentIndex = (currentIndex + 1) % slides.length;

        // Add active to next
        wrapper.children[currentIndex].classList.add('active');
        updateText(currentIndex);
    }, 5000); // 5 seconds
}

// 2. Load Videos
async function loadVideos() {
    const videos = await fetchData('assets/data/videos.json');
    const container = document.getElementById('video-grid');
    if (!container) return;

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}" class="card-img-top">
            <div class="card-body">
                <span class="card-badge">${video.category}</span>
                <h3 class="card-title">${video.title}</h3>
                <p class="card-text">${video.description}</p>
                <a href="${video.url}" target="_blank" class="btn">İzle</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Load Resources (Downloads)
async function loadResources() {
    const resources = await fetchData('assets/data/resources.json');
    const container = document.getElementById('resource-grid');
    if (!container) return;

    resources.forEach(res => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-body">
                <div style="font-size: 2rem; color: var(--primary-color); margin-bottom: 10px;">
                    <i class="icon-file">📄</i>
                </div>
                <h3 class="card-title">${res.title}</h3>
                <p class="card-text">Tür: ${res.type} &bull; Boyut: ${res.size}</p>
                <a href="${res.url}" class="btn btn-outline">İndir</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// 4. Load Games
async function loadGames() {
    const games = await fetchData('assets/data/games.json');
    const container = document.getElementById('game-grid');
    if (!container) return;

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title}" class="card-img-top">
            <div class="card-body">
                <h3 class="card-title">${game.title}</h3>
                <p class="card-text">${game.description}</p>
                <a href="${game.url}" class="btn">Oyna</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Mobile Menu Toggle
// Close menu logic helper
const closeMenu = () => {
    const nav = document.querySelector('.main-nav');
    if (nav.classList.contains('active')) {
        nav.classList.remove('active');

        // Reset all open dropdowns when menu closes
        document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    }
};

// Toggle Menu
window.toggleMenu = () => {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');

    // If closing via toggle, also reset dropdowns
    if (!nav.classList.contains('active')) {
        document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
    }
};

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        const dropdown = link.nextElementSibling;

        // Accordion Logic for Mobile
        if (dropdown && dropdown.classList.contains('dropdown') && window.innerWidth <= 900) {
            e.preventDefault();
            // Toggle current
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            return;
        }

        // Reset dropdowns if clicking a regular link
        closeMenu();
    });
});

// Close menu when clicking OUTSIDE
document.addEventListener('click', (e) => {
    const nav = document.querySelector('.main-nav');
    const hamburger = document.querySelector('.hamburger-menu');

    // If menu is open AND click is NOT on nav AND click is NOT on hamburger
    if (nav.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
    }
});

// Handle Rotation / Resize (Reset dropdowns)
window.addEventListener('resize', () => {
    // If screen becomes wide (desktop), ensure mobile styles are cleared
    if (window.innerWidth > 900) {
        document.querySelectorAll('.dropdown').forEach(d => d.style.display = ''); // Clear inline style
        document.querySelector('.main-nav').classList.remove('active');
    }
});
