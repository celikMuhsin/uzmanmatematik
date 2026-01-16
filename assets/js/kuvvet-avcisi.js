// Kuvvet Avcısı (Exponent Hunter) Game Logic

const STATE = {
    gameState: 'config', // config, playing, result
    difficulty: 'medium', // easy, medium, hard
    questionCount: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    timeLeft: 3,
    currentQuestion: null,
    timerInterval: null,
    isProcessing: false
};

// --- CONFIG ---
function selectDifficulty(diff) {
    STATE.difficulty = diff;

    // Update UI classes
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        btn.className = 'diff-btn unselected';
    });

    const activeBtn = document.getElementById(`btn-${diff}`);
    activeBtn.className = `diff-btn ${diff}-selected`;
}

// --- GAME LOGIC ---
function generateQuestion() {
    const types = ['standard', 'inverse', 'operation', 'true-false'];
    let type = types[Math.floor(Math.random() * types.length)];
    if (STATE.difficulty === 'easy') type = 'standard';

    // Ranges
    const ranges = [
        { base: 2, exp: 10 }, { base: 3, exp: 6 }, { base: 4, exp: 5 },
        { base: 5, exp: 5 }, { base: 6, exp: 4 }, { base: 7, exp: 3 },
        { base: 8, exp: 3 }, { base: 9, exp: 3 }
    ];

    const pick = ranges[Math.floor(Math.random() * ranges.length)];
    const base = pick.base;
    const exp = Math.floor(Math.random() * (pick.exp + 1));
    const value = Math.pow(base, exp);

    let text = "";
    let options = [];
    let correctIdx = 0;

    if (type === 'standard') {
        text = `$${base}^{${exp}}$`;
        const o1 = value;
        const uniqueOpts = new Set([o1]);
        while (uniqueOpts.size < 3) {
            let diff = Math.floor(Math.random() * 20) + 1;
            let n = Math.random() > 0.5 ? o1 + diff : Math.max(0, o1 - diff);
            if (n !== o1) uniqueOpts.add(n);
        }
        options = Array.from(uniqueOpts).map(n => `$${n}$`);
    } else if (type === 'inverse') {
        text = `$${value} = ?$`;
        const o1 = `$${base}^{${exp}}$`;
        const uniqueOpts = new Set([o1]);
        while (uniqueOpts.size < 3) {
            let b = Math.floor(Math.random() * 8) + 2;
            let e = Math.floor(Math.random() * 5) + 1;
            let str = `$${b}^{${e}}$`;
            if (str !== o1) uniqueOpts.add(str);
        }
        options = Array.from(uniqueOpts);
    } else if (type === 'operation') {
        const b2 = 2;
        const e2 = Math.floor(Math.random() * 5);
        const res = value + Math.pow(b2, e2);
        text = `$${base}^{${exp}} + ${b2}^{${e2}} = ?$`;
        const uniqueOpts = new Set([res]);
        while (uniqueOpts.size < 3) {
            let n = res + (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
            if (n !== res && n >= 0) uniqueOpts.add(n);
        }
        options = Array.from(uniqueOpts).map(n => `$${n}$`);
    } else {
        const isTrue = Math.random() > 0.5;
        text = isTrue ? `$${base}^{${exp}} = ${value}$?` : `$${base}^{${exp}} = ${value + 1}$?`;
        options = ["Doğru", "Yanlış", "Belirsiz"];
        correctIdx = isTrue ? 0 : 1;
    }

    if (type !== 'true-false') {
        const correctVal = options[0];
        options.sort(() => Math.random() - 0.5);
        correctIdx = options.indexOf(correctVal);
    }

    return { text, options, correctIdx };
}

function startGame() {
    STATE.gameState = 'playing';
    STATE.questionCount = 0;
    STATE.score = 0;
    STATE.streak = 0;
    STATE.maxStreak = 0;

    // UI Switch
    document.getElementById('config-view').style.display = 'none';
    document.getElementById('playing-view').style.display = 'flex'; // our container is flex

    nextQuestion(true);
}

function nextQuestion(isFirst = false) {
    if (!isFirst && STATE.questionCount >= 10) {
        endGame();
        return;
    }

    STATE.questionCount++;
    STATE.currentQuestion = generateQuestion();
    STATE.isProcessing = false;

    // Timer Limit
    const limit = STATE.difficulty === 'easy' ? 5 : STATE.difficulty === 'medium' ? 3 : 2;
    STATE.timeLeft = limit;

    renderGameView();
    startTimer(limit);
}

function startTimer(limit) {
    if (STATE.timerInterval) clearInterval(STATE.timerInterval);

    const bar = document.getElementById('time-bar');

    STATE.timerInterval = setInterval(() => {
        STATE.timeLeft -= 0.1;

        // Update Bar
        const pct = (STATE.timeLeft / limit) * 100;
        bar.style.width = `${pct}%`;

        if (STATE.timeLeft <= 0) {
            clearInterval(STATE.timerInterval);
            handleAnswer(-1); // Timeout
        }
    }, 100);
}

function handleAnswer(idx) {
    if (STATE.isProcessing) return;
    STATE.isProcessing = true;
    clearInterval(STATE.timerInterval);

    const container = document.getElementById('playing-view');
    const isCorrect = idx === STATE.currentQuestion.correctIdx;

    // remove existing animations
    container.classList.remove('animate-shake', 'animate-bounce');
    void container.offsetWidth; // trigger reflow

    if (idx === -1) {
        // Timeout
        // playSound('wrong'); 
        STATE.score = Math.max(0, STATE.score - 1);
        STATE.streak = 0;
        container.classList.add('animate-shake');
        container.style.borderColor = '#e11d48'; // Red border
    } else if (isCorrect) {
        // Correct
        // playSound('correct');
        STATE.streak++;
        if (STATE.streak > STATE.maxStreak) STATE.maxStreak = STATE.streak;

        // Scoring
        let bonus = 0;
        if (STATE.streak >= 5) bonus = 3;
        else if (STATE.streak >= 3) bonus = 1;

        STATE.score += (2 + bonus);
        container.classList.add('animate-bounce');
        container.style.borderColor = '#10b981'; // Green border

        // Highlight correct button
        document.querySelectorAll('.opt-btn')[idx].style.backgroundColor = '#10b981';
        document.querySelectorAll('.opt-btn')[idx].style.color = 'white';
    } else {
        // Wrong
        // playSound('wrong');
        STATE.score = Math.max(0, STATE.score - 1);
        STATE.streak = 0;
        container.classList.add('animate-shake');
        container.style.borderColor = '#e11d48'; // Red border

        // Highlight wrong button
        document.querySelectorAll('.opt-btn')[idx].style.backgroundColor = '#e11d48';
        document.querySelectorAll('.opt-btn')[idx].style.color = 'white';
    }

    renderScore(); // Update score immediately

    setTimeout(() => {
        container.style.borderColor = '#e2e8f0'; // Reset border
        nextQuestion();
    }, 800);
}

function renderGameView() {
    const q = STATE.currentQuestion;

    document.getElementById('question-count').textContent = `${STATE.questionCount}/10`;
    document.getElementById('question-text').textContent = q.text; // Latex will handle current
    document.getElementById('score-display').textContent = STATE.score;

    // Streak
    const streakBadge = document.getElementById('streak-badge');
    if (STATE.streak >= 3) {
        streakBadge.style.display = 'block';
        document.getElementById('streak-val').textContent = STATE.streak;
        document.getElementById('streak-track').style.background = '#ffedd5'; // orange-100
        document.getElementById('time-bar').style.background = '#f97316'; // orange-500
    } else {
        streakBadge.style.display = 'none';
        document.getElementById('streak-track').style.background = '#f1f5f9';
        document.getElementById('time-bar').style.background = '#4f46e5';
    }

    // Options
    const optContainer = document.getElementById('options-container');
    optContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(idx);
        optContainer.appendChild(btn);
    });

    // Reset Bar
    document.getElementById('time-bar').style.width = '100%';

    // MathJax Render
    if (window.MathJax) {
        MathJax.typesetPromise([document.getElementById('playing-view')]);
    }
}
function renderScore() {
    document.getElementById('score-display').textContent = STATE.score;
}

function endGame() {
    STATE.gameState = 'result';
    document.getElementById('playing-view').style.display = 'none';
    document.getElementById('result-view').style.display = 'block';

    document.getElementById('final-score').textContent = STATE.score;
    document.getElementById('final-streak').textContent = STATE.maxStreak;
    document.getElementById('final-diff').textContent = STATE.difficulty;
}
