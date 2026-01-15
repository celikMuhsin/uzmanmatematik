// Saniye Savaşları Game Logic

let config = {
    count: 10,
    duration: 1 // seconds
};

let gameState = {
    numbers: [],
    currentIndex: 0,
    timer: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Load High Score
    const highScore = localStorage.getItem('um_saniye_highscore') || 0;
    document.getElementById('high-score').innerText = highScore;

    // Enter key support for input
    document.getElementById('sum-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkResult();
        }
    });
});

function startGame() {
    // 1. Get Settings
    config.count = parseInt(document.getElementById('count-input').value) || 10;
    config.duration = parseFloat(document.getElementById('duration-input').value) || 1;

    // 2. Generate Numbers (-10 to 10)
    gameState.numbers = [];
    for (let i = 0; i < config.count; i++) {
        // Random int between -10 and 10 (excluding 0 for better flow maybe? let's keep 0)
        let num = Math.floor(Math.random() * 21) - 10;
        gameState.numbers.push(num);
    }

    gameState.currentIndex = 0;

    // 3. Switch View
    switchView('game-view');

    // 4. Start Sequence loop
    showNextNumber();
}

function showNextNumber() {
    if (gameState.currentIndex >= gameState.numbers.length) {
        endGame();
        return;
    }

    const num = gameState.numbers[gameState.currentIndex];
    const display = document.getElementById('number-display');
    const badge = document.getElementById('counter-badge');
    const bar = document.getElementById('progress-bar');

    // Update UI
    display.innerText = num;
    display.style.transform = 'scale(1.2)';
    setTimeout(() => display.style.transform = 'scale(1)', 100);

    badge.innerText = `${gameState.currentIndex + 1} / ${config.count}`;

    // Reset Bar
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(1)';

    // Start Animation
    // Force reflow
    void bar.offsetWidth;

    bar.style.transition = `transform ${config.duration}s linear`;
    bar.style.transform = 'scaleX(0)';

    // Schedule next
    gameState.timer = setTimeout(() => {
        gameState.currentIndex++;
        showNextNumber();
    }, config.duration * 1000);
}

function endGame() {
    switchView('input-view');
    document.getElementById('sum-input').value = '';
    document.getElementById('sum-input').focus();
}

function checkResult() {
    const userSum = parseInt(document.getElementById('sum-input').value);
    if (isNaN(userSum)) {
        alert("Lütfen bir sayı girin.");
        return;
    }

    const trueSum = gameState.numbers.reduce((a, b) => a + b, 0);
    const diff = Math.abs(trueSum - userSum);

    // Scoring Formula: 100 - (Diff * Duration)
    // If diff is 0, score 100.
    // Error penalty scales with duration (easier settings = higher penalty for error potentially?) 
    // Wait, the user said: "yanlışsa doğru cevap ile söylediği ceap arasındaki farkın başta ayarladığı saniye ayarı ile çarpımı olan sayı 100 den çıkarılacak"

    let penalty = diff * config.duration;
    // Let's cap penalty so score isn't super negative? User didn't specify. Assuming raw calc.
    // If duration is small (hard mode), penalty is small? That seems inverse.
    // "saniye ayarı ile çarpımı". 
    // If I set 10 seconds (Easy), Penalty = Diff * 10 (Huge penalty).
    // If I set 0.5 seconds (Hard), Penalty = Diff * 0.5 (Small penalty).
    // This logic rewards Hard mode by being lenient on errors? Or maybe "Duration" acts as a multiplier.
    // Let's stick strictly to user request.

    let score = Math.max(0, 100 - penalty);
    if (diff === 0) score = 100; // Bonus for exact match just in case logic floats

    // Save High Score
    const currentHigh = localStorage.getItem('um_saniye_highscore') || 0;
    if (score > currentHigh) {
        localStorage.setItem('um_saniye_highscore', Math.floor(score));
    }

    showResult(score, trueSum, diff);
}

function showResult(score, trueSum, diff) {
    switchView('result-view');

    document.getElementById('final-score').innerText = Math.floor(score);
    document.getElementById('true-sum').innerText = trueSum;

    const details = document.getElementById('score-details');
    if (diff === 0) {
        document.getElementById('result-title').innerText = "Mükemmel! 🎯";
        details.innerText = "Tam isabet! Hiç hata yapmadın.";
    } else {
        document.getElementById('result-title').innerText = "Oyun Bitti";
        details.innerText = `Gerçek toplamdan ${diff} sayı uzaktasın.`;
    }

    // Show History
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '';
    gameState.numbers.forEach(num => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerText = num;
        // Color positive/negative?
        if (num < 0) item.style.color = '#e74c3c';
        else item.style.color = '#27ae60';

        historyContainer.appendChild(item);
    });
}

function switchView(viewId) {
    // Hide all
    ['start-view', 'game-view', 'input-view', 'result-view'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    // Show one
    document.getElementById(viewId).style.display = 'flex'; // our container uses flex
}
