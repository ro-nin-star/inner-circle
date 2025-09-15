// ✅ GLOBÁLIS LEADERBOARD TÍPUS KÖVETÉSE
// ✅ ERŐSEBB GLOBÁLIS VÉDELEM
window.currentLeaderboardType = 'local';

// ✅ MINDEN LEHETSÉGES AUTOMATIKUS FRISSÍTÉS MEGAKADÁLYOZÁSA
const protectGlobalLeaderboard = () => {
    // RefreshLeaderboard védelem
    if (window.refreshLeaderboard && !window.refreshLeaderboard._protected) {
        const originalRefresh = window.refreshLeaderboard;
        window.refreshLeaderboard = function() {
            if (window.currentLeaderboardType === 'global') {
                console.log('🛡️ VÉDELEM: refreshLeaderboard blokkolva globális módban');
                return;
            }
            return originalRefresh.apply(this, arguments);
        };
        window.refreshLeaderboard._protected = true;
        console.log('🛡️ refreshLeaderboard védelem aktiválva');
    }

    // LoadLocalLeaderboard védelem
    if (window.loadLocalLeaderboard && !window.loadLocalLeaderboard._protected) {
        const originalLoadLocal = window.loadLocalLeaderboard;
        window.loadLocalLeaderboard = function(highlightId = null) {
            if (window.currentLeaderboardType === 'global') {
                console.log('🛡️ VÉDELEM: loadLocalLeaderboard blokkolva globális módban');
                return;
            }
            return originalLoadLocal.apply(this, arguments);
        };
        window.loadLocalLeaderboard._protected = true;
        console.log('🛡️ loadLocalLeaderboard védelem aktiválva');
    }

    // UpdateStats védelem
    if (window.updateStats && !window.updateStats._protected) {
        const originalUpdateStats = window.updateStats;
        window.updateStats = function() {
            const result = originalUpdateStats.apply(this, arguments);
            if (window.currentLeaderboardType === 'global') {
                console.log('🛡️ VÉDELEM: updateStats után globális leaderboard helyreállítása');
                setTimeout(() => {
                    if (window.currentLeaderboardType === 'global') {
                        window.loadGlobalLeaderboard();
                    }
                }, 100);
            }
            return result;
        };
        window.updateStats._protected = true;
        console.log('🛡️ updateStats védelem aktiválva');
    }
};

// Védelem aktiválása azonnal és időzítve is
protectGlobalLeaderboard();
setTimeout(protectGlobalLeaderboard, 1000);
setTimeout(protectGlobalLeaderboard, 3000);

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
            if (this.i18nManager && typeof this.i18nManager.init === 'function') {
                this.i18nManager.setApp(this); // Dependency injection
                await this.i18nManager.init();
                this.currentLanguage = this.i18nManager.getCurrentLanguage();
                console.log(`✅ I18n inicializálva - Nyelv: ${this.currentLanguage}`);
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

// ✅ LEADERBOARD KAPCSOLÓ FÜGGVÉNYEK - EXTRA ERŐS VÉDELEM
window.switchLeaderboard = (type) => {
    console.log(`🔄 Globális switchLeaderboard hívás: ${type}`);
    
    // Tab gombok frissítése
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(type + 'Tab');
    if (targetTab) targetTab.classList.add('active');
    
    // Status frissítése
    const statusContainer = document.getElementById('leaderboardStatus');
    if (statusContainer) {
        statusContainer.textContent = type === 'local' ? '📱 Helyi eredmények' : '🌍 Globális eredmények';
    }
    
    // ✅ GLOBÁLIS TÍPUS BEÁLLÍTÁSA MINDEN SZINTEN
    window.currentLeaderboardType = type;
    
    // LeaderboardManager-ben is beállítjuk
    if (window.LeaderboardManager) {
        window.LeaderboardManager.currentView = type;
    }
    if (window.perfectCircleApp?.leaderboardManager) {
        window.perfectCircleApp.leaderboardManager.currentView = type;
    }
    
    console.log(`🔧 Leaderboard típus beállítva mindenütt: ${type}`);
    
    // Megfelelő leaderboard betöltése
    if (type === 'local') {
        // Helyi leaderboard
        stopGlobalProtection();
        if (window.refreshLeaderboard) {
            window.refreshLeaderboard();
        } else if (window.perfectCircleApp) {
            window.perfectCircleApp.displayFallbackLeaderboard();
        }
    } else if (type === 'global') {
        // Globális leaderboard - közvetlen hívás
        console.log('🌍 Globális leaderboard betöltése kezdése...');
        startGlobalProtection();
        window.loadGlobalLeaderboard();
        
        // ✅ EXTRA VÉDELEM: Ellenőrizzük 2 másodperc múlva is
        setTimeout(() => {
            if (window.currentLeaderboardType === 'global') {
                const globalTab = document.getElementById('globalTab');
                if (!globalTab || !globalTab.classList.contains('active')) {
                    console.log('🚨 DETEKTÁLVA: Globális tab elveszett, helyreállítás...');
                    window.switchLeaderboard('global');
                }
                
                const statusContainer = document.getElementById('leaderboardStatus');
                if (statusContainer && !statusContainer.textContent.includes('Globális')) {
                    console.log('🚨 DETEKTÁLVA: Globális status elveszett, helyreállítás...');
                    window.loadGlobalLeaderboard();
                }
            }
        }, 2000);
        
        // ✅ EXTRA VÉDELEM: Ellenőrizzük 5 másodperc múlva is
        setTimeout(() => {
            if (window.currentLeaderboardType === 'global') {
                const statusContainer = document.getElementById('leaderboardStatus');
                if (statusContainer && !statusContainer.textContent.includes('Globális')) {
                    console.log('🚨 DETEKTÁLVA: Globális eredmények eltűntek, újratöltés...');
                    window.loadGlobalLeaderboard();
                }
            }
        }, 5000);
    }
};

window.loadGlobalLeaderboard = async function() {
    console.log('🌍 Globális loadGlobalLeaderboard hívás');
    
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardStatus = document.getElementById('leaderboardStatus');
    
    if (!leaderboardList) {
        console.error('❌ leaderboardList elem nem található');
        return;
    }
    
    // Loading állapot
    leaderboardList.innerHTML = '<div class="score-entry">🔄 Globális eredmények betöltése...</div>';
    if (leaderboardStatus) {
        leaderboardStatus.textContent = '🌍 Globális eredmények betöltése...';
    }
    
    try {
        // Várunk a Firebase API-ra
        let attempts = 0;
        while ((!window.firebaseAPI || !window.firebaseAPI.isReady || !window.firebaseAPI.isReady()) && attempts < 50) {
            console.log(`⏳ Várakozás Firebase API-ra... (${attempts}/50)`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.firebaseAPI || !window.firebaseAPI.isReady || !window.firebaseAPI.isReady()) {
            throw new Error('Firebase API nem elérhető 5 másodperc után');
        }
        
        console.log('✅ Firebase API elérhető, adatok lekérése...');
        const globalScores = await window.firebaseAPI.getTopScores(20);
        
        console.log('✅ Globális eredmények betöltve:', globalScores.length);
        
        // Status frissítés
        if (leaderboardStatus) {
            leaderboardStatus.textContent = `🌍 ${globalScores.length} globális eredmény`;
        }
        
        // Lista megjelenítése
        if (globalScores.length === 0) {
            leaderboardList.innerHTML = `
                <div class="score-entry">
                    <span>Még nincsenek globális eredmények</span>
                </div>
            `;
        } else {
            leaderboardList.innerHTML = globalScores.map((score, index) => {
                // Dátum formázása
                let dateText = 'Ma';
                if (score.timestamp && score.timestamp.seconds) {
                    const date = new Date(score.timestamp.seconds * 1000);
                    dateText = date.toLocaleDateString('hu-HU');
                } else if (score.date) {
                    dateText = score.date;
                }
                
                // Thumbnail kezelése
                const thumbnailHTML = score.thumbnail ? 
                    `<div class="thumbnail-container">
                        <img src="${score.thumbnail}" 
                             class="leaderboard-thumbnail" 
                             style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer;" 
                             onclick="window.ThumbnailGenerator?.showThumbnailModal('${score.thumbnail}')"
                             title="Kattints a nagyításhoz">
                    </div>` : 
                    `<div class="thumbnail-container">
                        <div class="no-thumbnail" style="width: 40px; height: 40px; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">🌍</div>
                    </div>`;
                
                return `
                    <div class="leaderboard-entry" data-score-id="${score.id}">
                        ${thumbnailHTML}
                        <div class="entry-content">
                            <div class="entry-main">
                                <span class="rank" style="font-weight: bold; color: #666; min-width: 30px;">#${index + 1}</span>
                                <span class="name" style="font-weight: 500; color: #333; margin-right: 8px;">${score.playerName || 'Névtelen'}</span>
                                <span class="score" style="font-weight: bold; color: #4CAF50; margin-left: auto;">${score.score} pont</span>
                            </div>
                            <div class="entry-details">
                                <span style="color: #888;">🌍 ${dateText}</span>
                                ${score.transformation ? ` • <span style="color: #666;">🎨 ${score.transformation}</span>` : ''}
                                ${score.difficulty && score.difficulty !== 'easy' ? ` • <span style="color: #ff9800;">🌀 ${score.difficulty}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error('❌ Globális leaderboard betöltési hiba:', error);
        
        // Hiba megjelenítése
        leaderboardList.innerHTML = `
            <div class="score-entry" style="color: #f44336;">
                <span>❌ Hiba a globális eredmények betöltésekor</span>
                <div style="font-size: 12px; margin-top: 5px; color: #666;">
                    ${error.message}
                </div>
                <div style="font-size: 11px; margin-top: 3px; color: #999;">
                    Firebase státusz: ${window.firebaseAPI ? (window.firebaseAPI.isReady ? window.firebaseAPI.isReady() ? 'Elérhető' : 'Nem kész' : 'Nincs isReady') : 'Nincs API'}
                </div>
            </div>
        `;
        
        if (leaderboardStatus) {
            leaderboardStatus.textContent = '❌ Globális eredmények nem elérhetők';
        }
    }
};

window.loadLocalLeaderboard = (highlightId = null) => {
    console.log('📱 Globális loadLocalLeaderboard hívás');
    
    // ✅ ELLENŐRIZZÜK HOGY MOST GLOBÁLIS MÓDBAN VAGYUNK-E
    if (window.currentLeaderboardType === 'global') {
        console.log('⚠️ Globális módban vagyunk, helyi leaderboard betöltés kihagyva');
        return;
    }
    
    if (window.refreshLeaderboard) {
        window.refreshLeaderboard();
    } else if (window.perfectCircleApp) {
        window.perfectCircleApp.displayFallbackLeaderboard();
    } else {
        console.error('❌ Nincs elérhető helyi leaderboard függvény');
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

            // ✅ 2. GLOBÁLIS MENTÉS - JAVÍTOTT VERZIÓ
            const app = window.perfectCircleApp;
            const playerName = app ? app.getPlayerName() : 'Névtelen';
            const anonymousName = app ? app.t('player.anonymous') : 'Névtelen';

            const hasValidPlayerName = playerName && 
                                      playerName.trim() !== '' && 
                                      playerName !== anonymousName && 
                                      playerName !== 'Névtelen';

            if (hasValidPlayerName) {
                console.log('👤 ✅ Érvényes játékos név megvan:', playerName);
                
                try {
                    const difficulty = window.gameEngine ? window.gameEngine.getDifficulty() : 'easy';
                    
                    // MEGLÉVŐ LEADERBOARD MANAGER HASZNÁLATA
                    if (app && app.leaderboardManager) {
                        // Ha van saveGlobalScore metódus
                        if (typeof app.leaderboardManager.saveGlobalScore === 'function') {
                            console.log('📤 LeaderboardManager globális mentés...');
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
                            console.log('📤 LeaderboardManager submitScore...');
                            await app.leaderboardManager.submitScore(
                                playerName,
                                roundedScore,
                                difficulty,
                                transformationName
                            );
                            console.log('✅ Score submit sikeres!');
                        }
                        else {
                            console.log('⚠️ Nincs globális mentési metódus, fallback használata...');
                            
                            // Fallback mentés
                            if (window.saveScoreToFirebase) {
                                const scoreData = {
                                    playerName: playerName,
                                    score: roundedScore,
                                    difficulty: difficulty,
                                    transformation: transformationName
                                };
                                await window.saveScoreToFirebase(scoreData);
                                console.log('✅ Fallback Firebase mentés sikeres!');
                            }
                        }
                    } else {
                        console.log('⚠️ Nincs elérhető LeaderboardManager, fallback mentés...');
                        
                        // Fallback mentés
                        if (window.saveScoreToFirebase) {
                            const scoreData = {
                                playerName: playerName,
                                score: roundedScore,
                                difficulty: difficulty,
                                transformation: transformationName
                            };
                            await window.saveScoreToFirebase(scoreData);
                            console.log('✅ Fallback Firebase mentés sikeres!');
                        }
                    }
                    
                } catch (error) {
                    console.error('❌ Globális mentés hiba:', error);
                }
            } else {
                console.log('👤 ⚠️ Nincs érvényes játékos név, globális mentés kihagyva');
            }

            // ✅ 3. LEADERBOARD FRISSÍTÉSE - EXTRA VÉDETT VERZIÓ
            console.log('🔄 Leaderboard frissítés ellenőrzése...');
            setTimeout(() => {
                const currentType = window.currentLeaderboardType || 'local';
                console.log('🔍 Jelenlegi leaderboard típus:', currentType);
                
                if (currentType === 'local') {
                    console.log('📱 Helyi leaderboard frissítése...');
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
                } else {
                    console.log('🌍 Globális módban vagyunk, helyi leaderboard frissítés kihagyva');
                    // ✅ EXTRA: Győződjünk meg róla hogy a globális még mindig látható
                    setTimeout(() => {
                        if (window.currentLeaderboardType === 'global') {
                            const statusContainer = document.getElementById('leaderboardStatus');
                            if (statusContainer && !statusContainer.textContent.includes('Globális')) {
                                console.log('🚨 Globális leaderboard elveszett score mentés után, helyreállítás...');
                                window.loadGlobalLeaderboard();
                            }
                        }
                    }, 500);
                }
            }, 100);

            console.log('✅ Mentési folyamat befejezve');
        }, 500);
    }

    console.log('✅ showScore befejezve');
};

// ✅ LEADERBOARD MANAGER FÜGGVÉNYEK BIZTOSÍTÁSA - JAVÍTOTT VERZIÓ
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔧 LeaderboardManager függvények ellenőrzése...');
        
        // Egyszerűbb megoldás - csak akkor hozzuk létre ha tényleg nincs
        if (!window.LeaderboardManager) {
            console.log('🆕 LeaderboardManager alapverzió létrehozása...');
            
            window.LeaderboardManager = {
                currentView: 'local',
                
                switchLeaderboard: function(type) {
                    console.log('🔄 LeaderboardManager switchLeaderboard:', type);
                    // Használjuk a globális függvényt
                    window.switchLeaderboard(type);
                },
                
                loadLocalLeaderboard: function(highlightId = null) {
                    console.log('📱 LeaderboardManager loadLocalLeaderboard');
                    window.loadLocalLeaderboard(highlightId);
                },
                
                loadGlobalLeaderboard: async function() {
                    console.log('🌍 LeaderboardManager loadGlobalLeaderboard');
                    await window.loadGlobalLeaderboard();
                },
                
                getCurrentView: function() {
                    // ✅ ELŐSZÖR A GLOBÁLIS VÁLTOZÓT ELLENŐRIZZÜK
                    if (window.currentLeaderboardType) {
                        return window.currentLeaderboardType;
                    }
                    
                    // Majd ellenőrizzük melyik tab aktív
                    const localTab = document.getElementById('localTab');
                    const globalTab = document.getElementById('globalTab');
                    
                    if (localTab && localTab.classList.contains('active')) {
                        return 'local';
                    } else if (globalTab && globalTab.classList.contains('active')) {
                        return 'global';
                    }
                    
                    return this.currentView;
                },
                
                saveGlobalScore: async function(playerName, score, difficulty, transformation) {
                    console.log('💾 LeaderboardManager saveGlobalScore:', { playerName, score, difficulty, transformation });
                    
                    try {
                        if (window.saveScoreToFirebase) {
                            const scoreData = {
                                playerName: playerName,
                                score: score,
                                difficulty: difficulty,
                                transformation: transformation
                            };
                            return await window.saveScoreToFirebase(scoreData);
                        } else if (window.firebaseAPI && window.firebaseAPI.saveScore) {
                            const scoreData = {
                                playerName: playerName,
                                score: score,
                                difficulty: difficulty,
                                transformation: transformation
                            };
                            return await window.firebaseAPI.saveScore(scoreData);
                        } else {
                            console.warn('⚠️ Nincs elérhető Firebase mentési metódus');
                            return null;
                        }
                    } catch (error) {
                        console.error('❌ Globális score mentési hiba:', error);
                        return null;
                    }
                }
            };
            
            console.log('✅ LeaderboardManager alapverzió létrehozva');
        } else {
            console.log('✅ Meglévő LeaderboardManager megtalálva');
        }
        
        console.log('🔧 LeaderboardManager függvények ellenőrzése befejezve');
        
    }, 500); // Rövidebb várakozás
});

// ✅ FOLYAMATOS VÉDELEM - GLOBÁLIS LEADERBOARD MONITOROZÁSA
let globalProtectionInterval = null;

const startGlobalProtection = () => {
    if (globalProtectionInterval) {
        clearInterval(globalProtectionInterval);
    }
    
    globalProtectionInterval = setInterval(() => {
        if (window.currentLeaderboardType === 'global') {
            const globalTab = document.getElementById('globalTab');
            const statusContainer = document.getElementById('leaderboardStatus');
            const leaderboardList = document.getElementById('leaderboardList');
            
            // Ellenőrizzük a tab állapotot
            if (!globalTab || !globalTab.classList.contains('active')) {
                console.log('🚨 VÉDELEM: Globális tab nem aktív, javítás...');
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                if (globalTab) globalTab.classList.add('active');
            }
            
            // Ellenőrizzük a status szöveget
            if (statusContainer && !statusContainer.textContent.includes('Globális')) {
                console.log('🚨 VÉDELEM: Status nem globális, javítás...');
                statusContainer.textContent = '🌍 Globális eredmények';
            }
            
            // Ellenőrizzük hogy van-e tartalom
            if (leaderboardList && 
                !leaderboardList.innerHTML.includes('globális') && 
                !leaderboardList.innerHTML.includes('🌍') &&
                !leaderboardList.innerHTML.includes('betöltése')) {
                console.log('🚨 VÉDELEM: Globális tartalom elveszett, újratöltés...');
                window.loadGlobalLeaderboard();
            }
        }
    }, 1000); // Minden másodpercben ellenőriz
    
    console.log('🛡️ Globális védelem elindítva');
};

const stopGlobalProtection = () => {
    if (globalProtectionInterval) {
        clearInterval(globalProtectionInterval);
        globalProtectionInterval = null;
        console.log('🛡️ Globális védelem leállítva');
    }
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

// Alkalmazás indítása - JAVÍTOTT VERZIÓ
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // ✅ ALAPÉRTELMEZETT LEADERBOARD TÍPUS BEÁLLÍTÁSA
        window.currentLeaderboardType = 'local';
        safeInit();
    });
} else {
    // ✅ ALAPÉRTELMEZETT LEADERBOARD TÍPUS BEÁLLÍTÁSA
    window.currentLeaderboardType = 'local';
    safeInit();
}

// ✅ BŐVÍTETT HIBAKERESÉSI FÜGGVÉNY
window.debugLeaderboard = () => {
    console.log('🔍 === LEADERBOARD HIBAKERESÉS ===');
    console.log('- currentLeaderboardType:', window.currentLeaderboardType);
    console.log('- globalProtectionInterval aktív:', !!globalProtectionInterval);
    console.log('- refreshLeaderboard védett:', !!window.refreshLeaderboard?._protected);
    console.log('- loadLocalLeaderboard védett:', !!window.loadLocalLeaderboard?._protected);
    console.log('- updateStats védett:', !!window.updateStats?._protected);
    console.log('- perfectCircleApp:', !!window.perfectCircleApp);
    console.log('- leaderboardManager:', !!window.perfectCircleApp?.leaderboardManager);
    console.log('- firebaseAPI:', !!window.firebaseAPI);
    console.log('- firebaseAPI.isReady:', window.firebaseAPI?.isReady?.());
    
    // Tab állapot ellenőrzése
    const localTab = document.getElementById('localTab');
    const globalTab = document.getElementById('globalTab');
    console.log('- Local tab active:', localTab?.classList.contains('active'));
    console.log('- Global tab active:', globalTab?.classList.contains('active'));
    
    // Leaderboard lista állapot
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardStatus = document.getElementById('leaderboardStatus');
    console.log('- Leaderboard lista elem:', !!leaderboardList);
    console.log('- Leaderboard status elem:', !!leaderboardStatus);
    console.log('- Jelenlegi status:', leaderboardStatus?.textContent);
    console.log('- Lista tartalom hossza:', leaderboardList?.innerHTML?.length);
    
    console.log('=== HIBAKERESÉS VÉGE ===');
};

// Kényszerített globális váltás teszt funkcióhoz
window.forceGlobal = () => {
    console.log('🔧 Kényszerített globális váltás...');
    window.currentLeaderboardType = 'global';
    startGlobalProtection();
    window.loadGlobalLeaderboard();
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const globalTab = document.getElementById('globalTab');
    if (globalTab) globalTab.classList.add('active');
};

// Gyors teszt függvény
window.testLeaderboard = () => {
    console.log('🧪 Leaderboard teszt indítása...');
    
    // Helyi tab teszt
    console.log('📱 Helyi tab teszt...');
    window.switchLeaderboard('local');
    
    setTimeout(() => {
        // Globális tab teszt
        console.log('🌍 Globális tab teszt...');
        window.switchLeaderboard('global');
    }, 2000);
    
    setTimeout(() => {
        // Vissza helyi tab-ra
        console.log('🔄 Vissza helyi tab-ra...');
        window.switchLeaderboard('local');
    }, 4000);
};

console.log('✅ App.js integrációs verzió betöltve');
