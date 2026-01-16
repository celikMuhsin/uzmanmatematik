// Denklik Arenası (Fraction Fusion) Game Logic

const STATE = {
    difficulty: 'medium',
    timeMode: 90,
    cards: [], // { id, num, den, value, status } status: normal, selected, matched, error
    selectedIds: [],
    score: 0,
    streak: 0,
    timeLeft: 90,
    timerInterval: null,
    isPaused: false
};

// --- CONFIG ---
function setDifficulty(diff) {
    STATE.difficulty = diff;
    ['easy', 'medium', 'hard'].forEach(d => {
        document.getElementById(`diff-${d}`).classList.remove('active');
    });
    document.getElementById(`diff-${diff}`).classList.add('active');
}

function setTime(sec) {
    STATE.timeMode = parseInt(sec);
    ['30', '60', '90', '120'].forEach(t => {
        document.getElementById(`time-${t}`).classList.remove('active');
    });
    document.getElementById(`time-${sec}`).classList.add('active');
}

// --- LOGIC ---
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function generateFractions(diff) {
    const pairs = [];
    const maxVal = diff === 'easy' ? 10 : diff === 'medium' ? 30 : 90;

    while (pairs.length < 8) {
        let n = Math.floor(Math.random() * (maxVal / 2)) + 1;
        let d = Math.floor(Math.random() * (maxVal / 2)) + 2;

        const common = gcd(n, d);
        n /= common;
        d /= common;

        if (n >= d) continue; // Keep proper fractions

        // Generate Multipliers
        const mult1 = Math.floor(Math.random() * 3) + 1;
        let mult2;
        do { mult2 = Math.floor(Math.random() * 4) + 1; } while (mult1 === mult2);

        const f1 = { n: n * mult1, d: d * mult1 };
        const f2 = { n: n * mult2, d: d * mult2 };

        const val = f1.n / f1.d;
        // Unique Check
        if (!pairs.some(p => (p.n1 / p.d1) === val)) {
            pairs.push({ n1: f1.n, d1: f1.d, n2: f2.n, d2: f2.d });
        }
    }

    const newCards = [];
    pairs.forEach((p, idx) => {
        newCards.push({ id: idx * 2, num: p.n1, den: p.d1, value: p.n1 / p.d1, status: 'normal' });
        newCards.push({ id: idx * 2 + 1, num: p.n2, den: p.d2, value: p.n2 / p.d2, status: 'normal' });
    });

    return newCards.sort(() => Math.random() - 0.5);
}

function startGame() {
    STATE.cards = generateFractions(STATE.difficulty);
    STATE.score = 0;
    STATE.streak = 0;
    STATE.timeLeft = STATE.timeMode;
    STATE.selectedIds = [];

    // Switch Views
    document.getElementById('config-view').style.display = 'none';
    document.getElementById('result-view').style.display = 'none';
    document.getElementById('playing-view').style.display = 'flex'; // flex container

    renderGrid();
    updateStats();

    // Start Timer
    if (STATE.timerInterval) clearInterval(STATE.timerInterval);
    STATE.timerInterval = setInterval(() => {
        if (!STATE.isPaused) {
            STATE.timeLeft--;
            document.getElementById('timer-display').textContent = STATE.timeLeft + 's';

            if (STATE.timeLeft <= 0) {
                endGame();
            } else if (STATE.timeLeft <= 10) {
                document.getElementById('timer-box').style.backgroundColor = '#f43f5e'; // rose-500
                document.getElementById('timer-display').style.color = 'white';
            }
        }
    }, 1000);
}

function handleCardClick(id) {
    if (STATE.isPaused || STATE.selectedIds.length >= 2) return;

    const card = STATE.cards.find(c => c.id === id);
    if (!card || card.status === 'matched' || card.status === 'selected') return;

    STATE.selectedIds.push(id);
    card.status = 'selected';
    renderGrid(); // Re-render to show selection

    if (STATE.selectedIds.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [id1, id2] = STATE.selectedIds;
    const c1 = STATE.cards.find(c => c.id === id1);
    const c2 = STATE.cards.find(c => c.id === id2);

    if (c1.value === c2.value) {
        // MATCH
        setTimeout(() => {
            STATE.streak++;
            const bonus = STATE.streak > 1 ? 1 : 0;
            const points = 3 + bonus;
            STATE.score += points;

            c1.status = 'matched';
            c2.status = 'matched';
            STATE.selectedIds = [];

            showFeedback(bonus > 0 ? `✓ Doğru! +${points} (Seri x${STATE.streak})` : `✓ Eşleşti! +3 Puan`, bonus > 0 ? 'bonus' : 'success');
            renderGrid(); // Hide cards
            updateStats();

            // Check Win
            if (STATE.cards.every(c => c.status === 'matched')) {
                setTimeout(endGame, 500);
            }
        }, 400);
    } else {
        // ERROR
        c1.status = 'error';
        c2.status = 'error';
        renderGrid(); // Show red

        setTimeout(() => {
            STATE.score = Math.max(0, STATE.score - 1);
            STATE.streak = 0;

            c1.status = 'normal';
            c2.status = 'normal';
            STATE.selectedIds = [];

            showFeedback(`✗ Yanlış! -1 Puan. Seri Sıfırlandı.`, 'error');
            renderGrid(); // Reset
            updateStats();
        }, 600);
    }
}

function renderGrid() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';

    STATE.cards.forEach(card => {
        const btn = document.createElement('div');
        btn.className = `card-btn ${card.status}`;
        btn.onclick = () => handleCardClick(card.id);

        let content = `$\\frac{${card.num}}{${card.den}}$`;
        btn.innerHTML = `<div>${content}</div>`;

        container.appendChild(btn);
    });

    if (window.MathJax) {
        MathJax.typesetPromise([container]);
    }
}

function updateStats() {
    document.getElementById('score-display').textContent = STATE.score;
    document.getElementById('streak-display').textContent = 'x' + STATE.streak;

    const streakBox = document.getElementById('streak-box');
    if (STATE.streak >= 2) {
        streakBox.style.backgroundColor = '#f97316'; // orange-500
        streakBox.querySelector('.stat-val').style.color = 'white';
    } else {
        streakBox.style.backgroundColor = '#f1f5f9';
        streakBox.querySelector('.stat-val').style.color = '#1e293b';
    }
}

function showFeedback(msg, type) {
    const toast = document.getElementById('feedback-toast');
    toast.textContent = msg;
    toast.className = `feedback-toast show feedback-${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function endGame() {
    clearInterval(STATE.timerInterval);
    document.getElementById('playing-view').style.display = 'none';
    document.getElementById('result-view').style.display = 'flex';
    document.getElementById('final-score').textContent = STATE.score;
}
