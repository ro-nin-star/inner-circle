// Fő alkalmazás inicializáló és koordinátor - INTEGRÁCIÓS VERZIÓ
// Csak a szükséges összekötő funkciókat tartalmazza

// BIZTONSÁGOS SCORE ADAT KÉSZÍTŐ FÜGGVÉNY - JAVÍTOTT VERZIÓ
if (!window.createSafeScoreData) {
    window.createSafeScoreData = (playerName, score, difficulty, transformation) => {
        console.log('🛡️ === SCORE ADAT KÉSZÍTÉS KEZDÉS ===');
        console.log('RAW INPUT:', { playerName, score, difficulty, transformation });
        
        // ✅ LÉPÉSENKÉNTI BIZTONSÁGOS KONVERTÁLÁS
        
        // 1. JÁTÉKOS NÉV
        let safePlayerName;
        try {
            safePlayerName = String(playerName || 'Névtelen').trim();
            if (safePlayerName.length === 0) {
                safePlayerName = 'Névtelen';
            }
            console.log('✅ Játékos név OK:', safePlayerName);
        } catch (error) {
            console.error('❌ Játékos név hiba:', error);
            safePlayerName = 'Névtelen';
        }
        
        // 2. PONTSZÁM - EXTRA GONDOS KEZELÉS
        let safeScore;
        try {
            console.log('🔢 Score feldolgozás - eredeti érték:', score, typeof score);
            
            const numScore = Number(score);
            console.log('🔢 Number() eredmény:', numScore, typeof numScore);
            
            if (isNaN(numScore)) {
                console.error('❌ Score NaN lett:', score, '->', numScore);
                throw new Error(`Score nem konvertálható számmá: ${score}`);
            }
            
            safeScore = Math.round(numScore);
            console.log('🔢 Kerekített score:', safeScore);
            
            if (safeScore < 0) {
                console.warn('⚠️ Negatív score, 0-ra állítva:', safeScore);
                safeScore = 0;
            } else if (safeScore > 100) {
                console.warn('⚠️ 100 feletti score, 100-ra állítva:', safeScore);
                safeScore = 100;
            }
            
            console.log('✅ Végső score:', safeScore, typeof safeScore);
            
        } catch (error) {
            console.error('❌ Score feldolgozási hiba:', error);
            throw new Error(`Score feldolgozási hiba: ${error.message} (eredeti: ${score})`);
        }
        
        // 3. NEHÉZSÉG
        let safeDifficulty;
        try {
            safeDifficulty = String(difficulty || 'easy').toLowerCase().trim();
            if (!['easy', 'hard'].includes(safeDifficulty)) {
                console.warn('⚠️ Ismeretlen nehézség:', safeDifficulty, '-> easy');
                safeDifficulty = 'easy';
            }
            console.log('✅ Nehézség OK:', safeDifficulty);
        } catch (error) {
            console.error('❌ Nehézség hiba:', error);
            safeDifficulty = 'easy';
        }
        
        // 4. TRANSZFORMÁCIÓ
        let safeTransformation;
        try {
            safeTransformation = String(transformation || '').trim();
            console.log('✅ Transzformáció OK:', safeTransformation);
        } catch (error) {
            console.error('❌ Transzformáció hiba:', error);
            safeTransformation = '';
        }
        
        // 5. IDŐBÉLYEGEK
        const currentTime = Date.now();
        const currentISO = new Date().toISOString();
        
        // 6. VÉGSŐ OBJEKTUM ÖSSZEÁLLÍTÁS
        const scoreData = {
            playerName: safePlayerName,
            score: safeScore,
            difficulty: safeDifficulty,
            transformation: safeTransformation,
            timestamp: currentTime,
            created: currentISO
        };
        
        console.log('📋 ÖSSZEÁLLÍTOTT OBJEKTUM:', scoreData);
        
        // 7. VÉGSŐ VALIDÁLÁS
        Object.keys(scoreData).forEach(key => {
            const value = scoreData[key];
            
            if (value === undefined) {
                throw new Error(`UNDEFINED érték a ${key} mezőben`);
            }
            
            if (value === null) {
                throw new Error(`NULL érték a ${key} mezőben`);
            }
            
            if (key === 'score' || key === 'timestamp') {
                if (typeof value !== 'number' || isNaN(value)) {
                    throw new Error(`${key} nem érvényes szám: ${value}`);
                }
            }
        });
        
        console.log('🎉 VÉGSŐ BIZTONSÁGOS ADAT:', JSON.stringify(scoreData, null, 2));
        return scoreData;
    };
    console.log('✅ createSafeScoreData létrehozva');
}

// PerfectCircleApp osztály - INTEGRÁCIÓ FÓKUSZÚ VERZIÓ
class PerfectCircleApp {
    constructor() {
        this.initialized = false;
        this.playerName = '';
        this.currentLanguage = 'en';
        this.initAttempts = 0;
        this.maxInitAttempts = 10;
        this.leaderboardManager = null;
    }

    async init() {
        if (this.initialized) {
            console.warn('Alkalmazás már inicializálva');
            return;
        }

        console.log('🎮 Perfect Circle alkalmazás inicializálása...');

        try {
            await this.waitForI18nManager();

            if (window.i18nManager && typeof window.i18nManager.init === 'function') {
                await window.i18nManager.init();
                this.currentLanguage = window.i18nManager.getCurrentLanguage();
                console.log(`✅ I18n inicializálva - Nyelv: ${this.currentLanguage}`);
            } else {
                console.warn('⚠️ I18n Manager nem elérhető - folytatás alapértelmezett szövegekkel');
                this.currentLanguage = 'hu';
            }

            if (window.i18nManager) {
                window.addEventListener('languageChanged', (e) => {
                    this.onLanguageChanged(e.detail);
                });
            }

            this.loadPlayerName();
            this.updateStats();

            if (window.VisitorCounter && typeof window.VisitorCounter.init === 'function') {
                await window.VisitorCounter.init();
            } else {
                console.warn('⚠️ VisitorCounter nem elérhető');
            }

            // ✅ MEGLÉVŐ LEADERBOARD MANAGER KERESÉSE
            await this.initializeLeaderboardManager();
            this.setupEventListeners();
            this.initializeUI();
            this.loadTheme();

            this.initialized = true;
            console.log('✅ Perfect Circle alkalmazás sikeresen inicializálva');

        } catch (error) {
            console.error('❌ Alkalmazás inicializálási hiba:', error);
            this.initializeFallback();
        }
    }

    async waitForI18nManager() {
        return new Promise((resolve) => {
            const checkI18n = () => {
                this.initAttempts++;

                if (window.i18nManager && typeof window.i18nManager.init === 'function') {
                    console.log(`✅ I18n Manager megtalálva ${this.initAttempts}. kísérlettel`);
                    resolve();
                } else if (this.initAttempts >= this.maxInitAttempts) {
                    console.warn(`⚠️ I18n Manager nem található ${this.maxInitAttempts} kísérlet után`);
                    resolve();
                } else {
                    console.log(`🔄 I18n Manager várakozás... (${this.initAttempts}/${this.maxInitAttempts})`);
                    setTimeout(checkI18n, 100);
                }
            };

            checkI18n();
        });
    }

    // ✅ MEGLÉVŐ LEADERBOARD MANAGER INTEGRÁLÁSA
    async initializeLeaderboardManager() {
        console.log('🏆 LeaderboardManager keresése és inicializálása...');
        
        try {
            // 1. Keressük a meglévő LeaderboardManager-t
            if (window.LeaderboardManager) {
                console.log('✅ Meglévő LeaderboardManager osztály megtalálva');
                this.leaderboardManager = new window.LeaderboardManager();
            } 
            // 2. Vagy keressük a globális példányt
            else if (window.leaderboardManager) {
                console.log('✅ Meglévő leaderboardManager példány megtalálva');
                this.leaderboardManager = window.leaderboardManager;
            }
            // 3. Vagy keressük más néven
            else if (window.globalLeaderboardManager) {
                console.log('✅ Globális leaderboardManager megtalálva');
                this.leaderboardManager = window.globalLeaderboardManager;
            }
            
            if (this.leaderboardManager) {
                console.log('✅ LeaderboardManager sikeresen csatlakoztatva');
                
                // Próbáljuk betölteni a helyi ranglistát
                if (typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
                    this.leaderboardManager.loadLocalLeaderboard();
                    console.log('✅ Helyi ranglista betöltve');
                } else if (typeof this.leaderboardManager.refreshLocalLeaderboard === 'function') {
                    this.leaderboardManager.refreshLocalLeaderboard();
                    console.log('✅ Helyi ranglista frissítve');
                }
            } else {
                console.warn('⚠️ Nincs elérhető LeaderboardManager - fallback használata');
                this.displayFallbackLeaderboard();
            }
            
        } catch (error) {
            console.error('❌ LeaderboardManager inicializálási hiba:', error);
            this.leaderboardManager = null;
            this.displayFallbackLeaderboard();
        }
    }

    displayFallbackLeaderboard() {
        console.log('🔄 Fallback ranglista megjelenítés...');
        
        const listContainer = document.getElementById('leaderboardList');
        const statusContainer = document.getElementById('leaderboardStatus');
        
        if (statusContainer) {
            statusContainer.textContent = '📱 Helyi eredmények';
        }
        
        if (listContainer) {
            if (window.ScoreManager) {
                try {
                    const scores = window.ScoreManager.getScores();
                    console.log('📊 Betöltött eredmények:', scores);
                    
                    if (scores.length === 0) {
                        listContainer.innerHTML = `
                            <div class="score-entry">
                                <span>Még nincsenek eredmények</span>
                            </div>
                        `;
                    } else {
                        listContainer.innerHTML = scores.map((score, index) => {
                            const playerName = score.playerName || this.getPlayerName();
                            const dateStr = score.date || 
                                           (score.timestamp ? new Date(score.timestamp).toLocaleDateString('hu-HU') : 'Ismeretlen');
                            
                            return `
                                <div class="score-entry" data-score-id="${score.id}">
                                    <span class="rank">#${index + 1}</span>
                                    <span class="name">${playerName}</span>
                                    <span class="score">${score.score}</span>
                                    <span class="date">${dateStr}</span>
                                </div>
                            `;
                        }).join('');
                    }
                    
                } catch (error) {
                    console.error('❌ Fallback ranglista hiba:', error);
                    listContainer.innerHTML = `
                        <div class="score-entry error">
                            <span style="color: #ff6b6b;">❌ Hiba az eredmények betöltésekor</span>
                        </div>
                    `;
                }
            } else {
                listContainer.innerHTML = `
                    <div class="score-entry">
                        <span>Még nincsenek eredmények</span>
                    </div>
                `;
            }
        }
    }

    // Nyelvi funkciók
    t(key, params = {}) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            return window.i18nManager.t(key, params);
        }

        const fallbackTexts = {
            'player.anonymous': 'Névtelen',
            'leaderboard.noResults': 'Még nincsenek eredmények',
            // ... további fallback szövegek
        };

        let text = fallbackTexts[key] || key;
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    }

    onLanguageChanged(detail) {
        if (!detail) return;
        console.log(`🌍 Language changed to: ${detail.language}`);
        this.currentLanguage = detail.language;
        this.updateStats();
        
        // Frissítsük a ranglistát ha van
        if (this.leaderboardManager) {
            const currentView = this.leaderboardManager.getCurrentView ? 
                               this.leaderboardManager.getCurrentView() : 'local';
            if (currentView === 'local') {
                if (typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
                    this.leaderboardManager.loadLocalLeaderboard();
                }
            }
        }
    }

    // Alapvető funkciók
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        window.addEventListener('beforeunload', (e) => {
            if (window.gameEngine && window.gameEngine.gameActive) {
                e.preventDefault();
                const message = 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
                e.returnValue = message;
                return e.returnValue;
            }
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'r':
                    e.preventDefault();
                    if (window.gameEngine) {
                        window.gameEngine.clearCanvas();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    if (window.gameEngine && !window.gameEngine.gameActive) {
                        window.gameEngine.startDrawing();
                    }
                    break;
                case 'h':
                    e.preventDefault();
                    this.showInstructions();
                    break;
            }
        }

        if (e.key === 'Escape') {
            if (window.gameEngine && window.gameEngine.gameActive) {
                window.gameEngine.clearCanvas();
            }
        }
    }

    initializeUI() {
        this.addAudioToggleButton();
        this.addThemeToggleButton();
        this.addAdvancedFeaturesButton();
    }

    addAudioToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('audioToggleBtn')) {
            const audioBtn = document.createElement('button');
            audioBtn.id = 'audioToggleBtn';
            audioBtn.innerHTML = '🔊 Hang';
            audioBtn.onclick = this.toggleAudio.bind(this);
            controls.appendChild(audioBtn);
        }
    }

    addThemeToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('themeToggleBtn')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'themeToggleBtn';
            themeBtn.innerHTML = '🌙 Sötét';
            themeBtn.onclick = this.toggleTheme.bind(this);
            controls.appendChild(themeBtn);
        }
    }

    addAdvancedFeaturesButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('advancedBtn')) {
            const advancedBtn = document.createElement('button');
            advancedBtn.id = 'advancedBtn';
            advancedBtn.innerHTML = '⚙️ Fejlett';
            advancedBtn.onclick = this.showAdvancedFeatures.bind(this);
            controls.appendChild(advancedBtn);
        }
    }

    toggleAudio() {
        if (window.AudioManager) {
            const isEnabled = window.AudioManager.isEnabled();
            window.AudioManager.setEnabled(!isEnabled);
            const audioBtn = document.getElementById('audioToggleBtn');
            if (audioBtn) {
                audioBtn.innerHTML = isEnabled ? '🔇 Hang Ki' : '🔊 Hang Be';
            }
        }
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '☀️ Világos' : '🌙 Sötét';
        }
        localStorage.setItem('perfectcircle_theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('perfectcircle_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.innerHTML = '☀️ Világos';
            }
        }
    }

    showAdvancedFeatures() {
        const features = `⚙️ FEJLETT FUNKCIÓK

🎮 BILLENTYŰ PARANCSOK:
• Ctrl+S: Rajzolás kezdése
• Ctrl+R: Törlés
• Ctrl+H: Segítség
• Esc: Játék megszakítása

📊 ADATKEZELÉS:
• Helyi eredmények exportálása/importálása
• Téma váltás
• Hang be/ki kapcsolása

Szeretnéd használni ezeket a funkciókat?`;

        if (confirm(features)) {
            this.showAdvancedMenu();
        }
    }

    showAdvancedMenu() {
        const action = prompt(`Válassz egy műveletet:

1 - Eredmények exportálása
2 - Eredmények importálása  
3 - Helyi adatok törlése
4 - Konzol megnyitása

Add meg a szám:`);

        switch(action) {
            case '1':
                this.exportScores();
                break;
            case '2':
                this.importScores();
                break;
            case '3':
                this.clearAllData();
                break;
            case '4':
                alert('Nyomd meg F12-t a fejlesztői konzol megnyitásához!');
                break;
        }
    }

    exportScores() {
        try {
            if (!window.ScoreManager) {
                alert('ScoreManager nem elérhető!');
                return;
            }
            const data = window.ScoreManager.exportScores();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `perfect-circle-results-${new Date().toLocaleDateString('hu-HU')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('Eredmények sikeresen exportálva!');
        } catch (error) {
            alert('Hiba az exportálás során: ' + error.message);
        }
    }

    clearAllData() {
        if (confirm('Biztosan törölni szeretnéd az összes adatot?')) {
            try {
                if (window.ScoreManager) window.ScoreManager.clearScores();
                localStorage.removeItem('perfectcircle_playername');
                localStorage.removeItem('perfectcircle_theme');
                this.updateStats();
                alert('Minden adat törölve!');
            } catch (error) {
                alert('Hiba a törlés során: ' + error.message);
            }
        }
    }

    loadPlayerName() {
        const savedName = localStorage.getItem('perfectcircle_playername');
        if (savedName) {
            const nameInput = document.getElementById('playerName');
            if (nameInput) {
                nameInput.value = savedName;
            }
            this.playerName = savedName;
        }
    }

    savePlayerName() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? nameInput.value.trim() : '';

        if (name.length === 0) {
            alert('Kérlek add meg a neved!');
            return false;
        }

        if (name.length > 20) {
            alert('A név maximum 20 karakter lehet!');
            return false;
        }

        localStorage.setItem('perfectcircle_playername', name);
        this.playerName = name;
        alert(`Név mentve: ${name} ✅`);
        return true;
    }

    getPlayerName() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? nameInput.value.trim() : '';
        return name || this.playerName || this.t('player.anonymous') || 'Névtelen';
    }

    updateStats() {
        if (!window.ScoreManager) {
            console.warn('⚠️ ScoreManager nem elérhető');
            return;
        }

        const stats = window.ScoreManager.getStats();
        const elements = {
            bestScore: document.getElementById('bestScore'),
            averageScore: document.getElementById('averageScore'),
            gamesPlayed: document.getElementById('gamesPlayed'),
            currentScore: document.getElementById('currentScore')
        };

        if (elements.bestScore) elements.bestScore.textContent = stats.best;
        if (elements.averageScore) elements.averageScore.textContent = stats.average;
        if (elements.gamesPlayed) elements.gamesPlayed.textContent = stats.games;
        if (elements.currentScore && stats.games === 0) elements.currentScore.textContent = '0';
    }

    showInstructions() {
        const instructions = `🎯 PERFECT CIRCLE - ÚTMUTATÓ

📝 JÁTÉK CÉLJA:
Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!

🎮 IRÁNYÍTÁS:
• 🖱️ Egér: Kattints és húzd
• 📱 Mobil: Érintsd és húzd
• ⌨️ Billentyűk: Ctrl+S (start), Ctrl+R (törlés), Esc (stop)

🏆 PONTOZÁS:
• Köralak (40 pont): Mennyire hasonlít körre
• Záródás (20 pont): Mennyire zárt a forma
• Egyenletesség (25 pont): Mennyire egyenletes a vonal
• Méret (15 pont): Optimális méret a canvas-en

Sok sikert a tökéletes kör rajzolásához! 🍀✨`;
        alert(instructions);
    }

    initializeFallback() {
        console.log('🔄 Fallback inicializálás...');
        try {
            this.currentLanguage = 'hu';
            this.loadPlayerName();
            this.updateStats();
            this.setupEventListeners();
            this.initializeUI();
            this.loadTheme();
            this.initialized = true;
            console.log('✅ Fallback inicializálás sikeres');
        } catch (error) {
            console.error('❌ Fallback inicializálás is sikertelen:', error);
        }
    }

    // ✅ LEADERBOARD INTEGRÁCIÓS METÓDUSOK
    switchLeaderboard(type) {
        console.log(`🔄 switchLeaderboard: ${type}`);
        
        if (this.leaderboardManager && typeof this.leaderboardManager.switchLeaderboard === 'function') {
            this.leaderboardManager.switchLeaderboard(type);
        } else {
            console.warn('⚠️ LeaderboardManager switchLeaderboard nem elérhető');
            this.handleLeaderboardSwitch(type);
        }
    }

    handleLeaderboardSwitch(type) {
        console.log(`🔄 Fallback leaderboard váltás: ${type}`);
        
        // Tab gombok frissítése
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const targetTab = document.getElementById(type + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        if (type === 'local') {
            this.displayFallbackLeaderboard();
        } else if (type === 'global') {
            this.displayGlobalNotAvailable();
        }
    }

    displayGlobalNotAvailable() {
        const listContainer = document.getElementById('leaderboardList');
        const statusContainer = document.getElementById('leaderboardStatus');
        
        if (statusContainer) {
            statusContainer.textContent = '❌ Globális eredmények nem elérhetők';
        }
        
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="score-entry error">
                    <span style="color: #ff6b6b;">❌ Globális eredmények nem elérhetők</span>
                </div>
            `;
        }
    }

    loadLocalLeaderboard(highlightId = null) {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
            this.leaderboardManager.loadLocalLeaderboard(highlightId);
        } else {
            console.warn('⚠️ LeaderboardManager loadLocalLeaderboard nem elérhető');
            this.displayFallbackLeaderboard();
        }
    }

    async loadGlobalLeaderboard() {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadGlobalLeaderboard === 'function') {
            await this.leaderboardManager.loadGlobalLeaderboard();
        } else {
            console.warn('⚠️ LeaderboardManager loadGlobalLeaderboard nem elérhető');
            this.displayGlobalNotAvailable();
        }
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// ✅ GLOBÁLIS FÜGGVÉNYEK - MEGLÉVŐ LEADERBOARD MANAGER-REL KOMPATIBILIS
window.savePlayerName = () => {
    if (window.perfectCircleApp) {
        return window.perfectCircleApp.savePlayerName();
    }
    return false;
};

window.getPlayerName = () => {
    if (window.perfectCircleApp) {
        return window.perfectCircleApp.getPlayerName();
    }
    return 'Névtelen';
};

window.showInstructions = () => {
    if (window.perfectCircleApp) {
        window.perfectCircleApp.showInstructions();
    }
};

window.updateStats = () => {
    if (window.perfectCircleApp) {
        window.perfectCircleApp.updateStats();
    }
};

// ✅ LEADERBOARD KAPCSOLÓ FÜGGVÉNYEK
window.switchLeaderboard = (type) => {
    console.log(`🔄 Globális switchLeaderboard hívás: ${type}`);
    
    if (window.perfectCircleApp) {
        window.perfectCircleApp.switchLeaderboard(type);
    } else {
        console.error('❌ PerfectCircleApp nem elérhető');
    }
};

window.loadGlobalLeaderboard = async () => {
    console.log('🌍 Globális loadGlobalLeaderboard hívás');
    
    if (window.perfectCircleApp) {
        await window.perfectCircleApp.loadGlobalLeaderboard();
    } else {
        console.error('❌ PerfectCircleApp nem elérhető');
    }
};

window.loadLocalLeaderboard = (highlightId = null) => {
    console.log('📱 Globális loadLocalLeaderboard hívás');
    
    if (window.perfectCircleApp) {
        window.perfectCircleApp.loadLocalLeaderboard(highlightId);
    } else {
        console.error('❌ PerfectCircleApp nem elérhető');
    }
};

// ✅ JAVÍTOTT SHOWSCORE FÜGGVÉNY - MEGLÉVŐ LEADERBOARD MANAGER INTEGRÁCIÓVAL
window.showScore = async (score, analysis, transformationName = '') => {
    console.log('📊 showScore hívva:', { score, analysis, transformationName });

    // UI frissítés (változatlan)
    const elements = {
        scoreDisplay: document.getElementById('scoreDisplay'),
        currentScore: document.getElementById('currentScore'),
        finalScore: document.getElementById('finalScore'),
        scoreTitle: document.getElementById('scoreTitle'),
        scoreBreakdown: document.getElementById('scoreBreakdown'),
        idealCircleContainer: document.getElementById('idealCircleContainer')
    };

    if (elements.scoreDisplay) {
        elements.scoreDisplay.style.display = 'block';
    }

    const roundedScore = Math.round(score);

    if (elements.currentScore) elements.currentScore.textContent = roundedScore;
    if (elements.finalScore) elements.finalScore.textContent = roundedScore;

    // Score cím és breakdown (változatlan)
    if (elements.scoreTitle) {
        let titleEmoji = roundedScore >= 90 ? '🏆' : 
                        roundedScore >= 75 ? '🌟' : 
                        roundedScore >= 60 ? '👍' : 
                        roundedScore >= 40 ? '👌' : '💪';
        
        let titleText = roundedScore >= 90 ? 'Tökéletes! Zseniális!' :
                       roundedScore >= 75 ? 'Kiváló! Nagyon jó!' :
                       roundedScore >= 60 ? 'Jó munka!' :
                       roundedScore >= 40 ? 'Nem rossz!' : 'Próbáld újra!';

        elements.scoreTitle.innerHTML = `<span style="font-size: 1.2em;">${titleEmoji}</span> ${titleText}`;
    }

    // MENTÉSI FOLYAMAT - MEGLÉVŐ LEADERBOARD MANAGER-REL
    if (!analysis.error && roundedScore > 0) {
        setTimeout(async () => {
            console.log('💾 Mentési folyamat kezdése...');
            
            // ✅ 1. HELYI MENTÉS
            let savedScore = null;
            if (window.ScoreManager) {
                console.log('💾 Helyi mentés...');
                savedScore = window.ScoreManager.saveScore(
                    roundedScore, 
                    analysis,
                    window.gameEngine ? window.gameEngine.getDifficulty() : 'easy',
                    transformationName
                );
                console.log('✅ Helyi mentés eredménye:', savedScore);
            }

            // Statisztikák frissítése
            if (window.perfectCircleApp) {
                window.perfectCircleApp.updateStats();
            }

            // ✅ 2. GLOBÁLIS MENTÉS - MEGLÉVŐ LEADERBOARD MANAGER HASZNÁLATA
            const app = window.perfectCircleApp;
            const playerName = app ? app.getPlayerName() : 'Névtelen';
            const anonymousName = app ? app.t('player.anonymous') : 'Névtelen';

            const hasValidPlayerName = playerName && 
                                      playerName.trim() !== '' && 
                                      playerName !== anonymousName && 
                                      playerName !== 'Névtelen';

            if (hasValidPlayerName) {
                console.log('👤 ✅ Érvényes játékos név megvan');
                
                // MEGLÉVŐ LEADERBOARD MANAGER HASZNÁLATA
                if (app && app.leaderboardManager) {
                    try {
                        const difficulty = window.gameEngine ? window.gameEngine.getDifficulty() : 'easy';
                        
                        // Ha van saveGlobalScore metódus
                        if (typeof app.leaderboardManager.saveGlobalScore === 'function') {
                            console.log('📤 Meglévő LeaderboardManager globális mentés...');
                            await app.leaderboardManager.saveGlobalScore(
                                playerName,
                                roundedScore,
                                difficulty,
                                transformationName
                            );
                            console.log('✅ Globális mentés sikeres!');
                        } 
                        // Vagy ha van submitScore metódus
                        else if (typeof app.leaderboardManager.submitScore === 'function') {
                            console.log('📤 Meglévő LeaderboardManager submitScore...');
                            await app.leaderboardManager.submitScore(
                                playerName,
                                roundedScore,
                                difficulty,
                                transformationName
                            );
                            console.log('✅ Score submit sikeres!');
                        }
                        else {
                            console.log('⚠️ Nincs globális mentési metódus a meglévő LeaderboardManager-ben');
                        }
                        
                    } catch (error) {
                        console.error('❌ Meglévő LeaderboardManager globális mentés hiba:', error);
                    }
                } else {
                    console.log('⚠️ Nincs elérhető LeaderboardManager');
                }
            }

            // ✅ 3. HELYI LEADERBOARD FRISSÍTÉSE
            console.log('🔄 Helyi leaderboard frissítése...');
            setTimeout(() => {
                if (app && app.leaderboardManager) {
                    const currentView = app.leaderboardManager.getCurrentView ? 
                                       app.leaderboardManager.getCurrentView() : 'local';
                    if (currentView === 'local') {
                        if (typeof app.leaderboardManager.loadLocalLeaderboard === 'function') {
                            app.leaderboardManager.loadLocalLeaderboard(savedScore?.id);
                        } else if (typeof app.leaderboardManager.refreshLocalLeaderboard === 'function') {
                            app.leaderboardManager.refreshLocalLeaderboard();
                        }
                    }
                } else {
                    app?.displayFallbackLeaderboard();
                }
            }, 100);

            console.log('✅ Mentési folyamat befejezve');
        }, 500);
    }

    console.log('✅ showScore befejezve');
};

// Biztonságos inicializálás
let initAttempts = 0;
const maxInitAttempts = 5;

function safeInit() {
    initAttempts++;

    if (document.readyState === 'loading') {
        setTimeout(safeInit, 100);
        return;
    }

    if (!window.perfectCircleApp) {
        if (initAttempts < maxInitAttempts) {
            console.log(`🔄 App inicializálási kísérlet ${initAttempts}/${maxInitAttempts}...`);
            setTimeout(safeInit, 200);
            return;
        } else {
            console.error('❌ App inicializálás sikertelen');
            return;
        }
    }

    try {
        window.perfectCircleApp.init();
    } catch (error) {
        console.error('❌ App inicializálási hiba:', error);
        if (initAttempts < maxInitAttempts) {
            setTimeout(safeInit, 500);
        }
    }
}

// Alkalmazás indítása
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

// Hibakeresési függvény
window.debugLeaderboard = () => {
    console.log('🔍 Leaderboard hibakeresés:');
    console.log('- perfectCircleApp:', !!window.perfectCircleApp);
    console.log('- leaderboardManager:', !!window.perfectCircleApp?.leaderboardManager);
    console.log('- Meglévő LeaderboardManager osztály:', !!window.LeaderboardManager);
    console.log('- Meglévő leaderboardManager példány:', !!window.leaderboardManager);
    console.log('- switchLeaderboard függvény:', typeof window.switchLeaderboard);
    
    if (window.perfectCircleApp?.leaderboardManager) {
        const lm = window.perfectCircleApp.leaderboardManager;
        console.log('- LeaderboardManager metódusok:');
        console.log('  - switchLeaderboard:', typeof lm.switchLeaderboard);
        console.log('  - loadLocalLeaderboard:', typeof lm.loadLocalLeaderboard);
        console.log('  - loadGlobalLeaderboard:', typeof lm.loadGlobalLeaderboard);
        console.log('  - saveGlobalScore:', typeof lm.saveGlobalScore);
        console.log('  - submitScore:', typeof lm.submitScore);
        console.log('  - getCurrentView:', typeof lm.getCurrentView);
    }
};

console.log('✅ App.js integrációs verzió betöltve');
