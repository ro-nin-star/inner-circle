// ===== LEADERBOARD JAVÍTÁS =====
// Ez a fájl javítja a globális eredmények megjelenítését

console.log('🔧 Leaderboard javítás betöltése...');

// 1. LOADLEADERBOARD FÜGGVÉNY
window.loadLeaderboard = async function() {
    console.log('🏆 Leaderboard betöltése...');
    
    try {
        const topScores = await window.firebaseAPI.getTopScores(10);
        console.log('✅ Top scores betöltve:', topScores);
        
        const leaderboardEl = document.getElementById('leaderboard');
        if (!leaderboardEl) {
            console.error('❌ Leaderboard elem nem található');
            return;
        }
        
        if (topScores.length === 0) {
            leaderboardEl.innerHTML = '<div class="no-scores">🎯 Még nincsenek eredmények</div>';
            return;
        }
        
        let html = '<h3>🏆 Globális Eredmények</h3><div class="scores-list">';
        
        topScores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            html += `
                <div class="score-entry" style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
                    <span class="rank" style="font-weight: bold; width: 30px;">${medal}</span>
                    <span class="name" style="flex: 1; padding: 0 10px;">${score.playerName}</span>
                    <span class="score" style="font-weight: bold; color: #007bff;">${score.score}%</span>
                    <span class="difficulty" style="font-size: 0.8em; color: #666; margin-left: 10px;">${score.difficulty}</span>
                </div>
            `;
        });
        
        html += '</div>';
        leaderboardEl.innerHTML = html;
        
        console.log('✅ Leaderboard frissítve');
        
    } catch (error) {
        console.error('❌ Leaderboard betöltési hiba:', error);
        
        const leaderboardEl = document.getElementById('leaderboard');
        if (leaderboardEl) {
            leaderboardEl.innerHTML = '<div class="error" style="color: red; text-align: center; padding: 20px;">❌ Globális eredmények nem elérhetők - Próbáld később</div>';
        }
    }
};

// 2. UPDATELEADERBOARD FÜGGVÉNY
window.updateLeaderboard = async function() {
    console.log('🔄 Leaderboard frissítése...');
    await window.loadLeaderboard();
};

// 3. AUTOMATIKUS LEADERBOARD ELEM JAVÍTÁS
function setupLeaderboardFix() {
    // Keressük meg és javítsuk a leaderboard elemet
    function fixLeaderboardElement() {
        const leaderboardEl = document.getElementById('leaderboard');
        if (leaderboardEl) {
            console.log('✅ Leaderboard elem már megvan');
            return true;
        }
        
        // Keressük meg a hibaüzenetet tartalmazó elemet
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
            if (el.textContent && el.textContent.includes('Globális eredmények nem elérhetők')) {
                console.log('🎯 Hibaüzenet elem megtalálva, javítás...');
                el.id = 'leaderboard';
                return true;
            }
        }
        
        return false;
    }
    
    // Observer a dinamikus elemekhez
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.textContent && 
                    node.textContent.includes('Globális eredmények nem elérhetők')) {
                    console.log('🎯 Új hibaüzenet észlelve, javítás...');
                    node.id = 'leaderboard';
                    setTimeout(() => {
                        if (window.loadLeaderboard) {
                            window.loadLeaderboard();
                        }
                    }, 500);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Próbáljuk meg most is javítani
    if (fixLeaderboardElement()) {
        setTimeout(() => {
            if (window.firebaseAPI && window.firebaseAPI.isReady() && window.loadLeaderboard) {
                window.loadLeaderboard();
            }
        }, 1000);
    }
}

// 4. AUTOMATIKUS FRISSÍTÉS ÚJ SCORE UTÁN
function setupAutoRefresh() {
    const originalSaveScore = window.saveScore;
    if (originalSaveScore) {
        window.saveScore = async function(...args) {
            const result = await originalSaveScore.apply(this, args);
            console.log('🔄 Új score mentve, leaderboard frissítése...');
            setTimeout(() => {
                if (window.updateLeaderboard) {
                    window.updateLeaderboard();
                }
            }, 1000);
            return result;
        };
        console.log('✅ Automatikus leaderboard frissítés beállítva');
    }
}

// 5. INICIALIZÁLÁS
function initLeaderboardFix() {
    console.log('🚀 Leaderboard javítás inicializálása...');
    
    setupLeaderboardFix();
    setupAutoRefresh();
    
    console.log('✅ Leaderboard javítás aktív');
}

// Indítás amikor az oldal betöltött
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeaderboardFix);
} else {
    initLeaderboardFix();
}
