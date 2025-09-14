// ===== LEADERBOARD JAVÍTÁS =====
// Ez a fájl javítja a globális eredmények megjelenítését

console.log('🔧 Leaderboard javítás betöltése...');

// 1. HELYI EREDMÉNYEK BETÖLTÉSE
window.loadLocalLeaderboard = function() {
    console.log('📱 Helyi eredmények betöltése...');
    
    try {
        const scores = JSON.parse(localStorage.getItem('perfectcircle_scores') || '[]');
        console.log('📊 Helyi eredmények:', scores.length);
        
        const listContainer = document.getElementById('leaderboardList');
        const statusContainer = document.getElementById('leaderboardStatus');
        
        if (!listContainer) {
            console.error('❌ leaderboardList elem nem található');
            return;
        }
        
        // Status frissítése
        if (statusContainer) {
            statusContainer.textContent = `📱 Helyi eredmények (${scores.length})`;
        }
        
        if (scores.length === 0) {
            listContainer.innerHTML = '<div class="score-entry"><span>Még nincsenek helyi eredmények</span></div>';
            return;
        }
        
        // Rendezés pontszám szerint
        const sortedScores = scores
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10);
        
        let html = '';
        sortedScores.forEach((score, index) => {
            const position = index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
            const difficultyIcon = score.difficulty === 'hard' ? '🌀' : '😊';
            const playerName = score.playerName || 'Névtelen';
            const scoreValue = Math.round(score.score || 0);
            const date = score.date ? new Date(score.date).toLocaleDateString('hu-HU') : '';
            
            html += `
                <div class="score-entry ${position <= 3 ? 'top-score' : ''}">
                    <span class="position">${medal}</span>
                    <span class="player-name">${playerName}</span>
                    <span class="score-value">${scoreValue} pont</span>
                    <span class="difficulty">${difficultyIcon}</span>
                    <span class="date">${date}</span>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        console.log('✅ Helyi eredmények megjelenítve');
        
    } catch (error) {
        console.error('❌ Helyi eredmények betöltési hiba:', error);
        const listContainer = document.getElementById('leaderboardList');
        if (listContainer) {
            listContainer.innerHTML = '<div class="score-entry error">❌ Hiba a helyi eredmények betöltésekor</div>';
        }
    }
};

// 2. GLOBÁLIS EREDMÉNYEK BETÖLTÉSE
window.loadGlobalLeaderboard = async function() {
    console.log('🌍 Globális eredmények betöltése...');
    
    const listContainer = document.getElementById('leaderboardList');
    const statusContainer = document.getElementById('leaderboardStatus');
    
    if (!listContainer) {
        console.error('❌ leaderboardList elem nem található');
        return;
    }
    
    // Loading üzenet
    listContainer.innerHTML = '<div class="score-entry"><span>🔄 Globális eredmények betöltése...</span></div>';
    
    try {
        // Firebase ellenőrzése
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            throw new Error('Firebase nem elérhető');
        }
        
        const topScores = await window.firebaseAPI.getTopScores(10);
        console.log('✅ Globális eredmények betöltve:', topScores.length);
        
        // Status frissítése
        if (statusContainer) {
            statusContainer.textContent = `🌍 Globális eredmények (${topScores.length})`;
        }
        
        if (topScores.length === 0) {
            listContainer.innerHTML = '<div class="score-entry"><span>🎯 Még nincsenek globális eredmények</span></div>';
            return;
        }
        
        let html = '';
        topScores.forEach((score, index) => {
            const position = index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
            const difficultyIcon = score.difficulty === 'hard' ? '🌀' : '😊';
            const playerName = score.playerName || 'Névtelen';
            const scoreValue = Math.round(score.score || 0);
            const date = score.date ? new Date(score.date).toLocaleDateString('hu-HU') : '';
            
            html += `
                <div class="score-entry ${position <= 3 ? 'top-score' : ''}">
                    <span class="position">${medal}</span>
                    <span class="player-name">${playerName}</span>
                    <span class="score-value">${scoreValue} pont</span>
                    <span class="difficulty">${difficultyIcon}</span>
                    <span class="date">${date}</span>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        console.log('✅ Globális eredmények megjelenítve');
        
    } catch (error) {
        console.error('❌ Globális eredmények betöltési hiba:', error);
        
        // Status frissítése
        if (statusContainer) {
            statusContainer.textContent = '🌍 Globális eredmények (offline)';
        }
        
        // Placeholder eredmények
        const placeholderScores = [
            { playerName: 'PerfectCircleMaster', score: 98, difficulty: 'hard' },
            { playerName: 'CircleWizard', score: 95, difficulty: 'hard' },
            { playerName: 'RoundHero', score: 92, difficulty: 'easy' },
            { playerName: 'GeometryKing', score: 89, difficulty: 'hard' },
            { playerName: 'ShapeExpert', score: 87, difficulty: 'easy' }
        ];
        
        let html = '<div class="score-entry offline-notice"><span>⚠️ Offline mód - Példa eredmények:</span></div>';
        
        placeholderScores.forEach((score, index) => {
            const position = index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
            const difficultyIcon = score.difficulty === 'hard' ? '🌀' : '😊';
            
            html += `
                <div class="score-entry placeholder ${position <= 3 ? 'top-score' : ''}">
                    <span class="position">${medal}</span>
                    <span class="player-name">${score.playerName}</span>
                    <span class="score-value">${score.score} pont</span>
                    <span class="difficulty">${difficultyIcon}</span>
                    <span class="date">Példa</span>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
    }
};

// 3. TAB VÁLTÁS JAVÍTÁS
window.switchLeaderboard = function(type) {
    console.log('🔄 Leaderboard váltás:', type);
    
    // Tab gombok frissítése
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(type + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Eredmények betöltése
    if (type === 'local') {
        window.loadLocalLeaderboard();
    } else if (type === 'global') {
        window.loadGlobalLeaderboard();
    }
};

// 4. SCORE MENTÉS JAVÍTÁS
window.saveScoreToLeaderboard = function(playerName, score, difficulty = 'easy') {
    console.log('💾 Score mentése:', { playerName, score, difficulty });
    
    try {
        const scores = JSON.parse(localStorage.getItem('perfectcircle_scores') || '[]');
        
        const newScore = {
            playerName: playerName || 'Névtelen',
            score: Math.round(score),
            difficulty: difficulty,
            date: new Date().toISOString(),
            id: Date.now()
        };
        
        scores.push(newScore);
        
        // Rendezés és limitálás
        const sortedScores = scores
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 50);
        
        localStorage.setItem('perfectcircle_scores', JSON.stringify(sortedScores));
        
        console.log('✅ Score mentve helyben');
        
        // Ha helyi tab aktív, frissítés
        const localTab = document.getElementById('localTab');
        if (localTab && localTab.classList.contains('active')) {
            window.loadLocalLeaderboard();
        }
        
        // Globális mentés próbálkozás
        if (window.firebaseAPI && window.firebaseAPI.isReady()) {
            window.firebaseAPI.saveScore(newScore)
                .then(() => {
                    console.log('✅ Score mentve globálisan is');
                    // Ha globális tab aktív, frissítés
                    const globalTab = document.getElementById('globalTab');
                    if (globalTab && globalTab.classList.contains('active')) {
                        setTimeout(() => window.loadGlobalLeaderboard(), 1000);
                    }
                })
                .catch(error => {
                    console.log('⚠️ Globális mentés sikertelen:', error.message);
                });
        }
        
        return true;
    } catch (error) {
        console.error('❌ Score mentési hiba:', error);
        return false;
    }
};

// 5. TESZTELÉSI FÜGGVÉNYEK
window.addTestScores = function() {
    console.log('🧪 Teszt eredmények hozzáadása...');
    
    const testScores = [
        { name: 'TestPlayer1', score: 85, difficulty: 'easy' },
        { name: 'TestPlayer2', score: 92, difficulty: 'hard' },
        { name: 'TestPlayer3', score: 78, difficulty: 'easy' },
        { name: 'TestPlayer4', score: 88, difficulty: 'hard' },
        { name: 'TestPlayer5', score: 95, difficulty: 'hard' }
    ];
    
    testScores.forEach(test => {
        window.saveScoreToLeaderboard(test.name, test.score, test.difficulty);
    });
    
    console.log('✅ Teszt eredmények hozzáadva');
};

// 6. INICIALIZÁLÁS
function initLeaderboardFix() {
    console.log('🚀 Leaderboard javítás inicializálása...');
    
    // Tab gombok eseménykezelői
    const localTab = document.getElementById('localTab');
    const globalTab = document.getElementById('globalTab');
    
    if (localTab) {
        localTab.addEventListener('click', () => window.switchLeaderboard('local'));
    }
    
    if (globalTab) {
        globalTab.addEventListener('click', () => window.switchLeaderboard('global'));
    }
    
    // Alapértelmezett helyi eredmények betöltése
    setTimeout(() => {
        window.loadLocalLeaderboard();
        console.log('✅ Leaderboard javítás kész');
    }, 500);
}

// Indítás
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeaderboardFix);
} else {
    initLeaderboardFix();
}

console.log('✅ Leaderboard javítás betöltve');
