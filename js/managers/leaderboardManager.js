// Globális és helyi ranglista kezelő
class LeaderboardManager {
    static currentView = 'local';
    static lastAttempt = 0;
    static retryDelay = 10000; // 10 másodperc
    
    static async saveGlobalScore(playerName, score, difficulty, transformation) {
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
    
    static async loadGlobalScores() {
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
    
    static updateStatus(message, isLoading = false) {
        const statusEl = document.getElementById('leaderboardStatus');
        if (statusEl) {
            if (isLoading) {
                statusEl.innerHTML = `<div class="loading-spinner"></div> ${message}`;
            } else {
                statusEl.textContent = message;
            }
        }
    }
    
    static displayScores(scores, isGlobal = false, highlightId = null) {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (!leaderboardList) {
            console.error('Leaderboard lista elem nem található');
            return;
        }
        
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<div class="score-entry"><span>Még nincsenek eredmények</span></div>';
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
            
            const playerName = isGlobal ? score.playerName : 'Te';
            const difficulty = score.difficulty || 'easy';
            
            return `
                <div class="score-entry ${isHighlighted ? 'current' : ''} ${rankClass}" data-id="${score.id}">
                    <span>${index + 1}. ${playerName}</span>
                    <span>${score.score} pont${transformationDisplay}</span>
                    <span>${difficultyEmoji[difficulty]} ${score.date}</span>
                </div>
            `;
        }).join('');
        
        // Highlight effekt hozzáadása
        if (highlightId) {
            setTimeout(() => {
                EffectsManager.highlightLeaderboardEntry(highlightId);
            }, 100);
        }
    }
    
    static switchView(type) {
        this.currentView = type;
        
        // Tab gombok frissítése
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.getElementById(type + 'Tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        if (type === 'local') {
            this.updateStatus('📱 Helyi eredmények');
            this.loadLocalLeaderboard();
        } else {
            this.loadGlobalLeaderboard();
        }
    }
    
    static async loadGlobalLeaderboard() {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            this.updateStatus('🔄 Kapcsolódás...', true);
            
            try {
                await window.firebaseAPI.reconnect();
            } catch (error) {
                this.updateStatus('❌ Firebase nem elérhető - Ellenőrizd a Firestore Rules-t');
                this.displayScores([]);
                return;
            }
        }

        this.updateStatus('Globális eredmények betöltése...', true);
        
        try {
            const scores = await this.loadGlobalScores();
            this.displayScores(scores, true);
            this.updateStatus(`🌍 Globális toplista (${scores.length} játékos)`);
        } catch (error) {
            if (error.message.includes('Túl gyakori')) {
                this.updateStatus('⏳ Várj 10 másodpercet az újrapróbálkozás előtt');
            } else if (error.message.includes('permission-denied')) {
                this.updateStatus('❌ Firestore Rules hiba - Kattints a státuszra a megoldásért');
            } else {
                this.updateStatus('❌ Globális eredmények nem elérhetők - Próbáld később');
            }
            this.displayScores([]);
            console.error('❌ Globális leaderboard betöltési hiba:', error);
        }
    }
    
    static loadLocalLeaderboard(highlightId = null) {
        const scores = ScoreManager.getScores();
        this.displayScores(scores, false, highlightId);
        this.updateStatus(`📱 Helyi eredmények (${scores.length} játék)`);
    }
    
    static getCurrentView() {
        return this.currentView;
    }
    
    static refreshCurrentView(highlightId = null) {
        if (this.currentView === 'local') {
            this.loadLocalLeaderboard(highlightId);
        } else {
            this.loadGlobalLeaderboard();
        }
    }
