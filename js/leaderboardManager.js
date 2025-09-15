// js/managers/leaderboardManager.js

class LeaderboardManager {
    constructor(app) {
        this.app = app;
        this.currentView = 'local';
        this.lastAttempt = 0;
        this.retryDelay = 10000; // 10 másodperc
    }
    
    async saveGlobalScore(playerName, score, difficulty, transformation) {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            throw new Error('Firebase nem elérhető');
        }
        
        const sanitizedName = playerName.trim().substring(0, 20) || 'Névtelen';
        
        try {
            const scoreId = await window.firebaseAPI.saveScore(sanitizedName, score, difficulty, transformation);
            console.log('✅ Globális pontszám mentve:', scoreId);
            return scoreId;
        } catch (error) {
            console.error('❌ Globális pontszám mentése sikertelen:', error);
            throw error;
        }
    }
    
    async loadGlobalScores() {
        const now = Date.now();
        if (now - this.lastAttempt < this.retryDelay) {
            throw new Error('Túl gyakori próbálkozás - várj 10 másodpercet');
        }
        
        this.lastAttempt = now;
        
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            console.log('🔄 Firebase újracsatlakozási kísérlet...');
            try {
                await window.firebaseAPI.reconnect();
                if (!window.firebaseAPI.isReady()) {
                    throw new Error('Újracsatlakozás sikertelen');
                }
            } catch (error) {
                throw new Error('Firebase nem elérhető');
            }
        }
        
        try {
            const scores = await window.firebaseAPI.getTopScores(10);
            console.log(`📊 ${scores.length} globális eredmény betöltve`);
            return scores;
        } catch (error) {
            console.error('❌ Globális pontszámok betöltése sikertelen:', error);
            throw error;
        }
    }
    
    updateStatus(message, isLoading = false) {
        const statusEl = document.getElementById('leaderboardStatus');
        if (statusEl) {
            if (isLoading) {
                statusEl.innerHTML = `<div class="loading-spinner"></div> ${message}`;
            } else {
                statusEl.textContent = message;
            }
        }
    }
    
    displayScores(scores, isGlobal = false, highlightId = null) {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (!leaderboardList) {
            console.error('Leaderboard lista elem nem található');
            return;
        }
        
        if (scores.length === 0) {
            const noResultsText = this.app ? this.app.t('leaderboard.noResults') : 'Még nincsenek eredmények';
            leaderboardList.innerHTML = `<div class="score-entry"><span>${noResultsText}</span></div>`;
            return;
        }
        
        leaderboardList.innerHTML = scores.map((score, index) => {
            const isHighlighted = score.id === highlightId;
            const difficultyEmoji = { 
                easy: '🟢😊', 
                hard: '🔴🌀' 
            };
            const transformationDisplay = score.transformation ? ` ✨${score.transformation}` : '';
            
            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            else if (index < 3) rankClass = 'top-3';
            
            const playerName = isGlobal ? score.playerName : (this.app ? this.app.t('player.you') : 'Te');
            const difficulty = score.difficulty || 'easy';
            const pointsText = this.app ? this.app.t('common.points') : 'pont';
            
            return `
                <div class="score-entry ${isHighlighted ? 'current' : ''} ${rankClass}" data-id="${score.id}">
                    <span>${index + 1}. ${playerName}</span>
                    <span>${score.score} ${pointsText}${transformationDisplay}</span>
                    <span>${difficultyEmoji[difficulty]} ${score.date}</span>
                </div>
            `;
        }).join('');
        
        // Highlight effekt hozzáadása
        if (highlightId && window.EffectsManager) {
            setTimeout(() => {
                window.EffectsManager.highlightLeaderboardEntry(highlightId);
            }, 100);
        }
    }
    
    switchLeaderboard(type) {
        this.currentView = type;
        
        // Tab gombok frissítése
        document.querySelectorAll('.tab-btn[data-leaderboard-type]').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector(`[data-leaderboard-type="${type}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        if (type === 'local') {
            const localText = this.app ? this.app.t('leaderboard.localResults') : '📱 Helyi eredmények';
            this.updateStatus(localText);
            this.loadLocalLeaderboard();
        } else {
            this.loadGlobalLeaderboard();
        }
    }
    
    async loadGlobalLeaderboard() {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            const connectingText = this.app ? this.app.t('firebase.connecting') : '🔄 Kapcsolódás...';
            this.updateStatus(connectingText, true);
            
            try {
                await window.firebaseAPI.reconnect();
            } catch (error) {
                const errorText = this.app ? this.app.t('firebase.notAvailableCheckRules') : '❌ Firebase nem elérhető - Ellenőrizd a Firestore Rules-t';
                this.updateStatus(errorText);
                this.displayScores([]);
                return;
            }
        }

        const loadingText = this.app ? this.app.t('leaderboard.loading') : 'Eredmények betöltése...';
        this.updateStatus(loadingText, true);
        
        try {
            const scores = await this.loadGlobalScores();
            this.displayScores(scores, true);
            const playersText = this.app ? this.app.t('common.players') : 'játékos';
            const globalText = this.app ? this.app.t('leaderboard.globalResults') : '🌍 Globális toplista';
            this.updateStatus(`${globalText} (${scores.length} ${playersText})`);
        } catch (error) {
            if (error.message.includes('Túl gyakori')) {
                const waitText = this.app ? this.app.t('leaderboard.waitRetry') : '⏳ Várj 10 másodpercet az újrapróbálkozás előtt';
                this.updateStatus(waitText);
            } else if (error.message.includes('permission-denied')) {
                const rulesErrorText = this.app ? this.app.t('firebase.rulesErrorSolution') : '❌ Firestore Rules hiba - Kattints a státuszra a megoldásért';
                this.updateStatus(rulesErrorText);
            } else {
                const notAvailableText = this.app ? this.app.t('leaderboard.globalNotAvailable') : '❌ Globális eredmények nem elérhetők - Próbáld később';
                this.updateStatus(notAvailableText);
            }
            this.displayScores([]);
            console.error('❌ Globális leaderboard betöltési hiba:', error);
        }
    }
    
    loadLocalLeaderboard(highlightId = null) {
        if (!window.ScoreManager) {
            console.error('❌ ScoreManager nem elérhető');
            return;
        }
        
        const scores = window.ScoreManager.getScores();
        this.displayScores(scores, false, highlightId);
        const gamesText = this.app ? this.app.t('common.games') : 'játék';
        const localText = this.app ? this.app.t('leaderboard.localResults') : '📱 Helyi eredmények';
        this.updateStatus(`${localText} (${scores.length} ${gamesText})`);
    }
    
    getCurrentView() {
        return this.currentView;
    }
    
    refreshCurrentView(highlightId = null) {
        if (this.currentView === 'local') {
            this.loadLocalLeaderboard(highlightId);
        } else {
            this.loadGlobalLeaderboard();
        }
    }

    // Export/Import funkciók
    exportLeaderboard() {
        try {
            if (!window.ScoreManager) {
                throw new Error('ScoreManager nem elérhető');
            }
            
            const scores = window.ScoreManager.getScores();
            const dataStr = JSON.stringify(scores, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `perfect-circle-scores-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            const successText = this.app ? this.app.t('advanced.exportSuccess') : 'Eredmények sikeresen exportálva!';
            alert(successText);
        } catch (error) {
            const errorText = this.app ? this.app.t('advanced.exportError') : 'Hiba az eredmények exportálásakor.';
            alert(`${errorText}: ${error.message}`);
        }
    }
    
    importLeaderboard() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedScores = JSON.parse(e.target.result);
                    if (!Array.isArray(importedScores)) {
                        throw new Error('Invalid format');
                    }
                    
                    const result = window.ScoreManager.importScores(importedScores);
                    const successText = this.app ? 
                        this.app.t('advanced.importSuccess', { imported: result.imported, total: result.total }) :
                        `Eredmények sikeresen importálva: ${result.imported} új, ${result.total} összesen.`;
                    alert(successText);
                    this.refreshCurrentView();
                } catch (error) {
                    const errorText = this.app ? this.app.t('advanced.fileError') : 'Fájl olvasási hiba';
                    alert(`${errorText}: ${error.message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}

// Globális hozzáférés biztosítása
window.LeaderboardManager = LeaderboardManager;
