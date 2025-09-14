// js/leaderboardManager.js

/**
 * Kezeli a helyi és globális ranglisták megjelenítését és interakcióit.
 * Integrálódik a Firebase-szel a globális pontszámokért.
 */
class LeaderboardManager {
    /**
     * @param {PerfectCircleApp} appInstance - A PerfectCircleApp példány.
     */
    constructor(appInstance) {
        this.app = appInstance; // Hivatkozás a PerfectCircleApp példányra
        this.currentView = 'local'; // 'local' vagy 'global'
        this.lastGlobalAttempt = 0;
        this.globalRetryDelay = 10000; // 10 másodperc

        // Ezeket a metódusokat bindingoljuk, hogy az event listenerek jól működjenek
        this.switchLeaderboard = this.switchLeaderboard.bind(this);
        this.loadGlobalLeaderboard = this.loadGlobalLeaderboard.bind(this);
        this.loadLocalLeaderboard = this.loadLocalLeaderboard.bind(this);
        this.saveGlobalScore = this.saveGlobalScore.bind(this); // Ez is bindolva van
        this.refreshCurrentView = this.refreshCurrentView.bind(this);
    }

    /**
     * Frissíti a ranglista státusz üzenetét.
     * @param {string} message - A megjelenítendő üzenet.
     * @param {boolean} [isLoading=false] - Azt jelzi, hogy betöltési animációt kell-e mutatni.
     */
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

    /**
     * Megjeleníti a pontszámokat a ranglistán.
     * @param {Array<Object>} scores - A megjelenítendő pontszámok listája.
     * @param {boolean} [isGlobal=false] - Azt jelzi, hogy globális ranglistát jelenít-e meg.
     * @param {string|number|null} [highlightId=null] - Egy pontszám ID-je, amit ki kell emelni.
     */
    displayScores(scores, isGlobal = false, highlightId = null) {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        if (scores.length === 0) {
            leaderboardList.innerHTML = `<div class="score-entry"><span>${this.app.t('leaderboard.noResults')}</span></div>`;
            return;
        }

        leaderboardList.innerHTML = scores.map((score, index) => {
            const isHighlighted = score.id === highlightId;
            const difficultyEmoji = { easy: '🟢😊', hard: '🔴🌀' };
            const transformationDisplay = score.transformation ? ` ✨${score.transformation}` : '';

            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            else if (index < 3) rankClass = 'top-3';

            const playerName = isGlobal ? score.playerName : this.app.t('player.you'); // Vagy 'Te', ha van ilyen
            const scoreValue = score.score || 0; // Biztonságos érték

            // Dátum formázás lokalizálva
            // A Firebase timestamp eltérhet a Date objektumtól (Firestore Timestamp vs ISO string)
            const date = score.date || score.timestamp?.toDate().toLocaleDateString(this.app.currentLanguage) || '';
            const displayDate = typeof date === 'string' ? date : date.toLocaleDateString(this.app.currentLanguage);


            return `
                <div class="score-entry ${isHighlighted ? 'current' : ''} ${rankClass}">
                    <span>${index + 1}. ${playerName}</span>
                    <span>${scoreValue} ${this.app.t('common.points')}${transformationDisplay}</span>
                    <span>${difficultyEmoji[score.difficulty]} ${displayDate}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Elment egy pontszámot a globális Firebase adatbázisba.
     * @param {string} playerName - A játékos neve.
     * @param {number} score - A pontszám.
     * @param {string} difficulty - A nehézségi szint ('easy' vagy 'hard').
     * @param {string} transformation - A kör transzformációjának neve.
     * @returns {Promise<boolean>} - True, ha sikeres a mentés.
     * @throws {Error} - Ha a Firebase nem elérhető vagy hiba történik.
     */
    async saveGlobalScore(playerName, score, difficulty, transformation) {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            throw new Error(this.app.t('firebase.notAvailable'));
        }

        const sanitizedName = playerName.trim().substring(0, 20) || this.app.t('player.anonymous');

        try {
            await window.firebaseAPI.saveScore(sanitizedName, score, difficulty, transformation);
            return true;
        } catch (error) {
            console.error('❌ Globális pontszám mentése sikertelen:', error);
            throw error;
        }
    }

    /**
     * Betölti a globális pontszámokat a Firebase-ből.
     * @returns {Promise<Array<Object>>} - A globális pontszámok listája.
     * @throws {Error} - Ha a Firebase nem elérhető vagy túl gyakori a próbálkozás.
     */
    async loadGlobalScores() {
        const now = Date.now();
        if (now - this.lastGlobalAttempt < this.globalRetryDelay) {
            throw new Error(this.app.t('leaderboard.tooFrequentAttempt'));
        }

        this.lastGlobalAttempt = now;

        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            console.log('🔄 Firebase újracsatlakozási kísérlet...');
            try {
                await window.firebaseAPI.reconnect();
                if (!window.firebaseAPI.isReady()) {
                    throw new Error(this.app.t('firebase.reconnectFailed'));
                }
            } catch (error) {
                throw new Error(this.app.t('firebase.notAvailable'));
            }
        }

        try {
            const scores = await window.firebaseAPI.getTopScores(10);
            return scores;
        } catch (error) {
            console.error('❌ Globális pontszámok betöltése sikertelen:', error);
            throw error;
        }
    }

    /**
     * Vált a helyi és globális ranglista nézet között.
     * @param {'local'|'global'} type - A megjelenítendő ranglista típusa.
     */
    switchLeaderboard(type) {
        this.currentView = type;

        document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        const tabButton = document.getElementById(type + 'Tab');
        if (tabButton) {
            tabButton.classList.add('active');
        }

        if (type === 'local') {
            this.updateStatus(this.app.t('leaderboard.localResults'));
            this.loadLocalLeaderboard();
        } else {
            this.loadGlobalLeaderboard();
        }
    }

    /**
     * Betölti és megjeleníti a globális ranglistát.
     */
    async loadGlobalLeaderboard() {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            this.updateStatus(this.app.t('firebase.connecting'), true);

            try {
                // Megpróbáljuk újra csatlakoztatni a Firebase-t
                await window.firebaseAPI.reconnect();
            } catch (error) {
                // Ha a reconnect sem segít
                this.updateStatus(this.app.t('firebase.notAvailableCheckRules'));
                this.displayScores([]);
                return;
            }
            // Ha a reconnect sikeres volt, de még mindig nem "ready", akkor is hiba
            if (!window.firebaseAPI.isReady()) {
                this.updateStatus(this.app.t('firebase.notAvailableCheckRules'));
                this.displayScores([]);
                return;
            }
        }

        this.updateStatus(this.app.t('leaderboard.loading'), true);

        try {
            const scores = await this.loadGlobalScores();
            this.displayScores(scores, true);
            this.updateStatus(`${this.app.t('leaderboard.globalResults')} (${scores.length} ${this.app.t('common.players')})`);
        } catch (error) {
            if (error.message.includes(this.app.t('leaderboard.tooFrequentAttempt'))) {
                this.updateStatus(this.app.t('leaderboard.waitRetry'));
            } else if (error.message.includes('permission-denied')) {
                this.updateStatus(this.app.t('firebase.rulesErrorSolution'));
            } else {
                this.updateStatus(this.app.t('leaderboard.globalNotAvailable'));
            }
            this.displayScores([]);
            console.error('❌ Globális leaderboard betöltési hiba:', error);
        }
    }

    /**
     * Betölti és megjeleníti a helyi ranglistát.
     * @param {string|number|null} [highlightId=null] - Egy pontszám ID-je, amit ki kell emelni.
     */
    loadLocalLeaderboard(highlightId = null) {
        // Feltételezzük, hogy a ScoreManager is globalizált a window objektumon
        const scores = window.ScoreManager ? window.ScoreManager.getScores() : [];
        this.displayScores(scores, false, highlightId);
        this.updateStatus(`${this.app.t('leaderboard.localResults')} (${scores.length} ${this.app.t('common.games')})`);
    }

    /**
     * Visszaadja az aktuálisan kiválasztott ranglista nézetet.
     * @returns {'local'|'global'}
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Frissíti az aktuális ranglista nézetet.
     */
    refreshCurrentView() {
        if (this.currentView === 'local') {
            this.loadLocalLeaderboard();
        } else {
            this.loadGlobalLeaderboard();
        }
    }
    
    /**
     * Exportálja a helyi ranglistát (dummy funkció, implementálandó).
     */
    exportLeaderboard() {
        this.app.showError('errors.notImplemented'); // Például
    }

    /**
     * Importálja a helyi ranglistát (dummy funkció, implementálandó).
     */
    importLeaderboard() {
        this.app.showError('errors.notImplemented'); // Például
    }
}

export default LeaderboardManager;
