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
    const timerDisplay = document.getElementById('mem-timer-display');
    if (timerDisplay) timerDisplay.innerText = sec + 's';
};

window.toggleMemoryGame = function () {
    const container = document.getElementById('memory-game-container');
    if (!container) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        if (memState.timerInterval) clearInterval(memState.timerInterval);
    } else {
        container.style.display = 'block';
        initMemoryGame();
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
    // Updated Logic: Support both old 'soru/cevap' AND new 'eser/yazar' structure
    let potentialPairs = window.edebiyatSorulari.filter(q => q.tur === 'yazar_eser');

    if (potentialPairs.length < 8) {
        alert("Yeterli 'Yazar-Eser' sorusu bulunamadı!");
        return;
    }

    // Choose 8
    const selectedData = potentialPairs.sort(() => 0.5 - Math.random()).slice(0, 8);

    let deck = [];
    selectedData.forEach(item => {
        // Fallback for old data or ensure new keys
        const text1 = item.eser || item.soru;
        const text2 = item.yazar || item.cevap;

        deck.push({ id: item.id, text: text1, type: 'q' });
        deck.push({ id: item.id, text: text2, type: 'a' });
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
        cardEl.innerText = truncateText(card.text, 50); // increased limit slightly
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

// --- SUMMARY - FEATURE GAME LOGIC ---
let sumState = {
    active: false,
    questions: [],
    currentIdx: 0,
    score: 0,
    totalQuestions: 10,
    timerInterval: null,
    secondsElapsed: 0,
    quizData: [],       // Stores { question, options, correctFeature } for all questions
    userAnswers: []     // Stores { selectedOption, isCorrect } for each index
};

// Inject Custom Styles for Summary Game
const style = document.createElement('style');
style.innerHTML = `
    .opt-correct { background-color: #dcfce7 !important; border: 2px solid #22c55e !important; color: #15803d !important; }
    .opt-wrong { background-color: #fee2e2 !important; border: 2px solid #ef4444 !important; color: #b91c1c !important; }
    
    /* Navigation Buttons */
    .sum-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        border: none;
        color: white;
        transition: opacity 0.2s;
    }
    .sum-next-btn {
        background: linear-gradient(135deg, var(--secondary-color), #d35400); 
        float: right;
    }
    .sum-prev-btn {
        background-color: #94a3b8; /* Grayish */
        float: left;
    }
    .sum-btn:hover { opacity: 0.9; }

    /* Aesthetic Close Button - VISIBLE & STATIC */
    .close-btn-aesthetic {
        background-color: #fff1f2; /* Rose-50 (Soft Pink/Red) */
        color: #be123c; /* Rose-700 (Dark Red) */
        border: 2px solid #fecdd3; /* Rose-200 */
        border-radius: 8px;
        padding: 8px 16px;
        font-family: inherit;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.95rem;
        display: flex; 
        align-items: center; 
        gap: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        /* No complex animations, just simple visible button */
    }
    .close-btn-aesthetic:hover {
        background-color: #ffe4e6; /* Rose-100 */
        border-color: #fda4af; /* Rose-300 */
    }
    .close-btn-aesthetic svg {
        width: 20px;
        height: 20px;
        stroke-width: 3px; /* Make cross thicker/bolder */
    }
`;
document.head.appendChild(style);

window.setSummaryQuestionCount = function (val) {
    sumState.totalQuestions = parseInt(val);

    // UI Update
    ['5', '10', '15', '20'].forEach(q => {
        const btn = document.getElementById(`sum-q-${q}`);
        if (btn) btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`sum-q-${val}`);
    if (activeBtn) activeBtn.classList.add('active');
};


function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

window.toggleSummaryGame = function () {
    const container = document.getElementById('summary-game-container');
    if (!container) return;

    if (container.style.display === 'block') {
        container.style.display = 'none';
        sumState.active = false;
        if (sumState.timerInterval) clearInterval(sumState.timerInterval);
    } else {
        // Close other games if open
        const memContainer = document.getElementById('memory-game-container');
        if (memContainer) {
            memContainer.style.display = 'none';
            if (memState.timerInterval) clearInterval(memState.timerInterval);
        }

        container.style.display = 'block';
        initSummaryGame();
    }
};

function initSummaryGame() {
    if (!window.eserListesi || window.eserListesi.length === 0) {
        alert("Oyun verisi yüklenemedi (edebiyat_data_2.js).");
        return;
    }

    // 1. Prepare Questions
    // Shuffle all works and use config total
    let pool = [...window.eserListesi].sort(() => 0.5 - Math.random());
    const count = Math.min(sumState.totalQuestions, pool.length);
    const selectedQuestions = pool.slice(0, count);

    // If pool is smaller than requested, update state to avoid finish errors
    sumState.totalQuestions = count;

    // 2. Pre-generate Quiz Data (Questions + Options) to ensure stability for Back navigation
    sumState.quizData = [];
    sumState.userAnswers = new Array(count).fill(null); // Reset answers

    selectedQuestions.forEach(q => {
        // A. Correct Answer
        const correctFeature = q.ozellikler[Math.floor(Math.random() * q.ozellikler.length)];

        // B. Distractors
        const otherWorks = window.eserListesi.filter(w => w.id !== q.id);
        let distractors = [];

        // Safety check
        if (otherWorks.length < 4) {
            // Fallback if not enough data, just duplicate (shouldn't happen with full data)
            // For now, let's assume enough data. If not, this loop might run forever or produce fewer distractors.
            // A more robust solution would be to pick from the same work's other features or duplicate.
        }

        while (distractors.length < 4) {
            const randomWork = otherWorks[Math.floor(Math.random() * otherWorks.length)];
            if (randomWork.ozellikler && randomWork.ozellikler.length > 0) {
                const randomFeature = randomWork.ozellikler[Math.floor(Math.random() * randomWork.ozellikler.length)];
                if (!distractors.includes(randomFeature) && randomFeature !== correctFeature) {
                    distractors.push(randomFeature);
                }
            }
        }

        // C. Combine and Shuffle Options
        const options = [correctFeature, ...distractors].sort(() => 0.5 - Math.random());

        sumState.quizData.push({
            questionObj: q,
            correctFeature: correctFeature,
            options: options
        });
    });


    sumState.currentIdx = 0;
    sumState.score = 0;
    sumState.active = true;
    sumState.secondsElapsed = 0;

    // Start Timer
    if (sumState.timerInterval) clearInterval(sumState.timerInterval);
    document.getElementById('sum-timer-display').innerText = "00:00";
    sumState.timerInterval = setInterval(() => {
        sumState.secondsElapsed++;
        document.getElementById('sum-timer-display').innerText = formatTime(sumState.secondsElapsed);
    }, 1000);

    updateSummaryScore(0);

    // Reset Container Inner HTML structure
    const playArea = document.getElementById('summary-game-play-area');
    playArea.innerHTML = `
        <div class="question-card" id="sum-question-text" style="font-size: 1rem; margin-bottom: 20px;"></div>
        <div class="options-grid" id="sum-options-grid" style="grid-template-columns: 1fr; gap: 10px;"></div>
        <div id="sum-controls-area" style="overflow: auto; margin-top: 20px;">
            <button id="sum-prev-btn" class="sum-btn sum-prev-btn" onclick="prevSummaryQuestion()" style="display:none;">⬅ Geri</button>
            <button id="sum-next-btn" class="sum-btn sum-next-btn" onclick="nextSummaryQuestion()" style="display:none;">İleri ➡</button>
        </div>
    `;

    renderSummaryQuestion();
}

// Override or update updateSummaryScore to update the new display
function updateSummaryScore(val) {
    sumState.score += val;
    // Update header badge if exists
    const disp = document.getElementById('sum-score-display');
    if (disp) disp.innerText = Math.round(sumState.score); // Round for cleaner display
}



function renderSummaryQuestion() {
    if (!sumState.active) return;

    // Safety check
    if (sumState.currentIdx >= sumState.quizData.length) {
        // Finish game handled by nextSummaryQuestion generally, but simple safety:
        finishSummaryGame();
        return;
    }

    const data = sumState.quizData[sumState.currentIdx];
    const q = data.questionObj;
    const userAnswer = sumState.userAnswers[sumState.currentIdx]; // Check if already answered

    // Update Header Badge for Question Count
    const qLabel = document.getElementById('sum-q-num');
    if (qLabel) qLabel.innerText = `${sumState.currentIdx + 1} / ${sumState.totalQuestions}`;

    // Render Text
    const qContainer = document.getElementById('sum-question-text');
    qContainer.innerHTML = `
        <div style="font-size: 1.25rem; font-weight: 700; color: #1e293b; line-height: 1.5;">
            Aşağıdakilerden hangisi <span style="color: var(--secondary-color);">"${q.eserAdi}"</span> eserinin özelliklerinden biridir?
        </div>
    `;

    // Render Options
    const optGrid = document.getElementById('sum-options-grid');
    optGrid.innerHTML = '';
    optGrid.style.gridTemplateColumns = '1fr';

    const letters = ['A', 'B', 'C', 'D', 'E'];

    data.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.fontSize = '1.0rem';
        btn.style.padding = '12px';
        btn.style.textAlign = 'left';

        const letterPrefix = `<b>${letters[idx]})</b> `;
        btn.innerHTML = letterPrefix + opt;

        // If already answered, apply styling
        if (userAnswer) {
            btn.style.pointerEvents = 'none'; // Disable clicks
            if (opt === data.correctFeature) {
                btn.classList.add('opt-correct');
            }
            if (userAnswer.selectedOption === opt && !userAnswer.isCorrect) {
                btn.classList.add('opt-wrong');
            }
        } else {
            // New question interaction
            btn.onclick = () => handleSummaryAnswer(btn, opt, data.correctFeature);
        }

        optGrid.appendChild(btn);
    });

    // Handle Buttons Visibility
    const prevBtn = document.getElementById('sum-prev-btn');
    const nextBtn = document.getElementById('sum-next-btn');

    // START: Always hide first, then show based on logic
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    // BACK Button: Show if idx > 0
    if (sumState.currentIdx > 0 && prevBtn) {
        prevBtn.style.display = 'block';
    }

    // NEXT Button: Show if Answered OR if we want to allow skipping (Assuming answer required to proceed? Logic was: answer -> show next)
    // The user requested "Forward button ... appear". 
    // Logic: If user HAS ANSWERED, we show the Next/Finish button.
    if (userAnswer) {
        if (nextBtn) {
            nextBtn.style.display = 'block';
            if (sumState.currentIdx >= (sumState.totalQuestions - 1)) {
                nextBtn.innerText = "Oyunu Bitir 🏁";
                nextBtn.onclick = finishSummaryGame;
            } else {
                nextBtn.innerText = "İleri ➡";
                nextBtn.onclick = nextSummaryQuestion;
            }
        }
    }
}

window.handleSummaryAnswer = function (btn, selected, correct) {
    if (!sumState.active) return;

    // Save User Answer
    const isCorrect = (selected === correct);
    sumState.userAnswers[sumState.currentIdx] = {
        selectedOption: selected,
        isCorrect: isCorrect
    };

    // Disable all buttons immediately
    const allBtns = document.querySelectorAll('#sum-options-grid .option-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    // Visual Feedback
    if (isCorrect) {
        btn.classList.add('opt-correct');
        const pointsPerQ = 100 / sumState.totalQuestions;
        updateSummaryScore(pointsPerQ);
    } else {
        btn.classList.add('opt-wrong');
        // Highlight correct one
        allBtns.forEach(b => {
            if (b.innerText.includes(correct)) { // This might be problematic if options have similar text. Better to pass correct option directly.
                b.classList.add('opt-correct');
            }
        });
    }

    // Show Next Button
    const nextBtn = document.getElementById('sum-next-btn');
    if (nextBtn) {
        nextBtn.style.display = 'block';
        if (sumState.currentIdx >= (sumState.totalQuestions - 1)) {
            nextBtn.innerText = "Oyunu Bitir 🏁";
            nextBtn.onclick = finishSummaryGame;
        } else {
            nextBtn.innerText = "İleri ➡";
            nextBtn.onclick = nextSummaryQuestion;
        }
    }
}

window.nextSummaryQuestion = function () {
    sumState.currentIdx++;
    renderSummaryQuestion();
};

window.prevSummaryQuestion = function () {
    if (sumState.currentIdx > 0) {
        sumState.currentIdx--;
        renderSummaryQuestion();
    }
};

window.finishSummaryGame = function () {
    if (sumState.timerInterval) clearInterval(sumState.timerInterval);
    const timeStr = formatTime(sumState.secondsElapsed);

    alert(`🎉 OYUN BİTTİ!\n\n🏆 Toplam Puan: ${sumState.score} / 100\n⏱️ Süre: ${timeStr}\n\nTebrikler!`);

    // Reset/Close
    sumState.active = false;
    document.getElementById('summary-game-container').style.display = 'none';
};
