/* Edebiyat Game - Internal Module */

let intState = {
    active: false,
    categories: 'all',
    score: 0,
    questions: [],
    currentIdx: 0
};

// --- LOBBY LOGIC ---
window.selectInternalCategory = function (cat, btn) {
    intState.categories = cat;

    // UI
    document.querySelectorAll('#edebiyat-categories .filter-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Show selected text
    document.getElementById('game-start-area').style.display = 'block';

    let map = {
        'all': 'Karışık (Hepsi)',
        'yazar_eser': 'Yazar & Eser',
        'ilkler': 'İlkler',
        'terim': 'Terimler',
        'donem': 'Dönemler',
        'unvan': 'Unvanlar'
    };
    document.getElementById('selected-cat-name').innerText = map[cat] || cat;
};

window.startInternalGame = function () {
    // 1. Prepare Data
    if (!window.edebiyatSorulari) {
        console.error("Data not loaded");
        return;
    }

    let data = window.edebiyatSorulari;
    if (intState.categories !== 'all') {
        data = data.filter(q => q.tur === intState.categories);
    }

    if (data.length < 1) {
        alert("Bu kategoride soru bulunamadı.");
        return;
    }

    intState.questions = [...data].sort(() => 0.5 - Math.random());
    intState.active = true;
    intState.score = 0;
    intState.currentIdx = 0;

    updateIntScore(0);

    // 2. Switch UI
    document.querySelector('.lobby-internal').style.display = 'none';
    document.getElementById('internal-game-play-area').style.display = 'block';

    renderIntQuestion();
};

window.exitInternalGame = function () {
    intState.active = false;
    document.getElementById('internal-game-play-area').style.display = 'none';
    document.querySelector('.lobby-internal').style.display = 'block';
    // Reset Start Area
    document.getElementById('game-start-area').style.display = 'none';
    document.querySelectorAll('#edebiyat-categories .filter-btn').forEach(b => b.classList.remove('selected'));
};

function updateIntScore(val) {
    intState.score += val;
    document.getElementById('int-score').innerText = intState.score;
}

function renderIntQuestion() {
    if (!intState.active) return;

    if (intState.currentIdx >= intState.questions.length) {
        alert("Oyun Bitti! Skorunuz: " + intState.score);
        exitInternalGame();
        return;
    }

    const q = intState.questions[intState.currentIdx];

    // Wrong options
    const allAnswers = window.edebiyatSorulari.map(x => x.cevap);
    const distractors = allAnswers.filter(a => a !== q.cevap)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    const options = [q.cevap, ...distractors].sort(() => 0.5 - Math.random());

    const container = document.getElementById('int-quiz-area');
    container.innerHTML = `
        <div class="question-card">${q.soru}</div>
        <div class="options-grid">
            ${options.map(opt => `<button class="option-btn" onclick="handleIntAnswer(this, '${opt.replace(/'/g, "\\'")}')">${opt}</button>`).join('')}
        </div>
    `;
}

window.handleIntAnswer = function (btn, ans) {
    if (!intState.active) return;
    const q = intState.questions[intState.currentIdx];

    if (ans === q.cevap) {
        btn.classList.add('correct');
        updateIntScore(10);
        setTimeout(() => {
            intState.currentIdx++;
            renderIntQuestion();
        }, 600);
    } else {
        btn.classList.add('wrong');
        updateIntScore(-5);
        // Dont advance immediately? Or Maybe do. Let's wait.
    }
};

// --- OPEN CARD MATCHING GAME LOGIC ---
let memState = {
    selected: [],
    matches: 0,
    locked: false,
    timeLimit: 90,
    timeLeft: 90,
    timerInterval: null,
    score: 0
};

window.setMemoryTime = function (sec) {
    memState.timeLimit = parseInt(sec);
    // UI Update
    ['30', '60', '90', '120'].forEach(t => {
        const btn = document.getElementById(`mem-time-${t}`);
        if (btn) btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`mem-time-${sec}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update Display immediately if game not running? 
    // Actually, just updating the limit is enough, it applies on next start.
    document.getElementById('mem-timer-display').innerText = sec + 's';
};

window.toggleMemoryGame = function () {
    const container = document.getElementById('memory-game-container');
    if (!container) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        if (memState.timerInterval) clearInterval(memState.timerInterval);
    } else {
        container.style.display = 'block';
        initMemoryGame(); // Auto restart or resume? Let's restart.
    }
};

function initMemoryGame() {
    if (!window.edebiyatSorulari) return;

    // Timer Init
    if (memState.timerInterval) clearInterval(memState.timerInterval);
    memState.timeLeft = memState.timeLimit;
    memState.score = 0;
    document.getElementById('mem-timer-display').innerText = memState.timeLeft + 's';
    document.getElementById('mem-score-display').innerText = memState.score;
    startMemoryTimer();

    // 1. Get 8 random Author-Work pairs (Strict Filter)
    let potentialPairs = window.edebiyatSorulari.filter(q => q.tur === 'yazar_eser');

    if (potentialPairs.length < 8) {
        alert("Yeterli 'Yazar-Eser' sorusu bulunamadı!");
        return;
    }

    // Choose 8
    const selectedData = potentialPairs.sort(() => 0.5 - Math.random()).slice(0, 8);

    let deck = [];
    selectedData.forEach(item => {
        deck.push({ id: item.id, text: item.soru, type: 'q' });
        deck.push({ id: item.id, text: item.cevap, type: 'a' });
    });

    // Shuffle
    deck.sort(() => 0.5 - Math.random());

    // Render
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    memState.matches = 0;
    memState.selected = [];
    memState.locked = false;

    deck.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'mem-card';
        cardEl.dataset.id = card.id;
        cardEl.innerText = card.text;
        cardEl.onclick = () => handleCardClick(cardEl);
        grid.appendChild(cardEl);
    });
}

function handleCardClick(card) {
    if (memState.locked) return;
    if (card.classList.contains('selected')) {
        // Deselect if clicked same card?
        card.classList.remove('selected');
        memState.selected = memState.selected.filter(c => c !== card);
        return;
    }
    if (card.classList.contains('matched')) return;

    // Select
    card.classList.add('selected');
    memState.selected.push(card);

    if (memState.selected.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    memState.locked = true;
    const [c1, c2] = memState.selected;

    if (c1.dataset.id === c2.dataset.id) {
        // Correct
        c1.style.borderColor = '#22c55e';
        c2.style.borderColor = '#22c55e';
        c1.style.background = '#dcfce7';
        c2.style.background = '#dcfce7';

        setTimeout(() => {
            c1.classList.add('matched');
            c2.classList.add('matched');
            memState.matches++;

            // Score Update
            memState.score += 12.5;
            document.getElementById('mem-score-display').innerText = memState.score;

            resetTurn();

            if (memState.matches === 8) {
                if (memState.timerInterval) clearInterval(memState.timerInterval);
                setTimeout(() => alert("Tebrikler! Tüm eşleşmeleri buldunuz. Skor: " + memState.score), 600);
            }
        }, 600);
    } else {
        // Wrong
        c1.style.borderColor = '#ef4444';
        c2.style.borderColor = '#ef4444';

        setTimeout(() => {
            c1.classList.remove('selected');
            c2.classList.remove('selected');
            c1.style.borderColor = '';
            c2.style.borderColor = '';
            resetTurn();
        }, 800);
    }
}

function resetTurn() {
    memState.selected = [];
    memState.locked = false;
}

function truncateText(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
}

function startMemoryTimer() {
    memState.timerInterval = setInterval(() => {
        memState.timeLeft--;
        document.getElementById('mem-timer-display').innerText = memState.timeLeft + 's';

        if (memState.timeLeft <= 10) {
            document.getElementById('mem-timer-display').style.background = '#f43f5e';
            document.getElementById('mem-timer-display').style.color = 'white';
        } else {
            document.getElementById('mem-timer-display').style.background = '#eee';
            document.getElementById('mem-timer-display').style.color = '#333';
        }

        if (memState.timeLeft <= 0) {
            endMemoryGame();
        }
    }, 1000);
}

function endMemoryGame() {
    if (memState.timerInterval) clearInterval(memState.timerInterval);
    alert("Süre Doldu! Oyun Bitti.");

    // Disable all cards
    const cards = document.querySelectorAll('.mem-card');
    cards.forEach(c => {
        c.style.pointerEvents = 'none';
        c.style.opacity = '0.6';
    });
}
