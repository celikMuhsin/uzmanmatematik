// Main App Module

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    await loadVideos();
    await loadResources();
    await loadGames();
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

// 1. Load Videos
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

// 2. Load Resources (Downloads)
async function loadResources() {
    const resources = await fetchData('assets/data/resources.json');
    const container = document.getElementById('resource-grid');
    if (!container) return;

    resources.forEach(res => {
        const card = document.createElement('div');
        card.className = 'card';
        // different style for resource cards, maybe smaller or just text
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

// 3. Load Games
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
