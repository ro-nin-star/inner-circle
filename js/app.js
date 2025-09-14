// Fő alkalmazás inicializáló és koordinátor - Tiszta verzió

// BIZTONSÁGOS SCORE ADAT KÉSZÍTŐ FÜGGVÉNY
window.createSafeScoreData = (playerName, score, difficulty, transformation) => {
    console.log('🛡️ Biztonságos score adat készítése:', {
        playerName, score, difficulty, transformation
    });
    
    const safePlayerName = String(playerName || 'Névtelen').trim();
    const safeScore = Number(score);
    const safeDifficulty = String(difficulty || 'easy');
    const safeTransformation = String(transformation || '');
    
    if (isNaN(safeScore) || safeScore < 0 || safeScore > 100) {
        throw new Error(`Érvénytelen pontszám: ${score} -> ${safeScore}`);
    }
    
    if (safePlayerName.length === 0) {
        throw new Error(`Érvénytelen játékos név: "${playerName}"`);
    }
    
    const scoreData = {
        playerName: safePlayerName,
        score: safeScore,
        difficulty: safeDifficulty,
        transformation: safeTransformation,
        date: new Date().toLocaleDateString('hu-HU'),
        timestamp: Date.now(),
        created: new Date().toISOString()
    };
    
    console.log('✅ Biztonságos score adat:', scoreData);
    
    Object.keys(scoreData).forEach(key => {
        const value = scoreData[key];
        if (value === undefined || value === null) {
            console.error(`❌ Undefined/null érték: ${key} = ${value}`);
            throw new Error(`Undefined/null érték a ${key} mezőben`);
        }
    });
    
    return scoreData;
};

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

    async initializeLeaderboardManager() {
        console.log('🏆 LeaderboardManager inicializálása...');
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!window.LeaderboardManager && attempts < maxAttempts) {
            console.log(`🔄 LeaderboardManager várakozás... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.LeaderboardManager) {
            console.warn('⚠️ LeaderboardManager osztály nem elérhető - folytatás nélküle');
            this.leaderboardManager = null;
            return;
        }
        
        try {
            this.leaderboardManager = new window.LeaderboardManager(this);
            console.log('✅ LeaderboardManager példány létrehozva');
            
            if (typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
                this.leaderboardManager.loadLocalLeaderboard();
                console.log('✅ Helyi ranglista betöltve');
            } else {
                console.error('❌ loadLocalLeaderboard metódus nem található');
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
                                <span>${this.t('leaderboard.noResults')}</span>
                            </div>
                        `;
                    } else {
                        listContainer.innerHTML = scores.map((score, index) => {
                            let playerName = 'Névtelen';
                            if (score.playerName) {
                                playerName = score.playerName;
                            } else {
                                const currentPlayer = this.getPlayerName();
                                if (currentPlayer && currentPlayer !== this.t('player.anonymous')) {
                                    playerName = currentPlayer;
                                }
                            }
                            
                            let dateStr = '';
                            if (score.date) {
                                dateStr = score.date;
                            } else if (score.timestamp) {
                                dateStr = new Date(score.timestamp).toLocaleDateString('hu-HU');
                            } else {
                                dateStr = 'Ismeretlen';
                            }
                            
                            let extraInfo = '';
                            if (score.difficulty && score.difficulty !== 'easy') {
                                extraInfo += ` (${score.difficulty})`;
                            }
                            if (score.transformation && score.transformation.trim() !== '') {
                                extraInfo += ` ✨${score.transformation}`;
                            }
                            
                            return `
                                <div class="score-entry" data-score-id="${score.id}">
                                    <span class="rank">#${index + 1}</span>
                                    <span class="name">${playerName}</span>
                                    <span class="score">${score.score}${extraInfo}</span>
                                    <span class="date">${dateStr}</span>
                                </div>
                            `;
                        }).join('');
                    }
                    
                    if (statusContainer) {
                        const gamesText = this.t('common.games') || 'játék';
                        statusContainer.textContent = `📱 Helyi eredmények (${scores.length} ${gamesText})`;
                    }
                    
                } catch (error) {
                    console.error('❌ Fallback ranglista hiba:', error);
                    listContainer.innerHTML = `
                        <div class="score-entry error">
                            <span style="color: #ff6b6b;">❌ Hiba az eredmények betöltésekor: ${error.message}</span>
                        </div>
                    `;
                }
            } else {
                console.warn('⚠️ ScoreManager nem elérhető');
                listContainer.innerHTML = `
                    <div class="score-entry">
                        <span>${this.t('leaderboard.noResults')}</span>
                    </div>
                `;
            }
        }
    }

    initializeFallback() {
        console.log('🔄 Fallback inicializálás I18n nélkül...');

        try {
            this.currentLanguage = 'hu';
            this.loadPlayerName();
            this.updateStats();
            this.setupEventListeners();
            this.initializeUIFallback();
            this.loadTheme();

            this.initialized = true;
            console.log('✅ Fallback inicializálás sikeres');
        } catch (error) {
            console.error('❌ Fallback inicializálás is sikertelen:', error);
        }
    }

    t(key, params = {}) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            return window.i18nManager.t(key, params);
        }

        const fallbackTexts = {
            'leaderboard.noResults': 'Még nincsenek eredmények',
            'common.games': 'játék',
            'common.players': 'játékos',
            'player.anonymous': 'Névtelen',
            'player.placeholder': 'Add meg a neved',
            'errors.invalidName': 'Kérlek add meg a neved!',
            'errors.nameTooLong': 'A név maximum 20 karakter lehet!',
            'player.nameSaved': 'Név mentve: {name} ✅',
            'scoreTitle.perfect': '🏆 Tökéletes! Zseniális!',
            'scoreTitle.excellent': '🌟 Kiváló! Nagyon jó!',
            'scoreTitle.good': '👍 Jó munka!',
            'scoreTitle.notBad': '👌 Nem rossz!',
            'scoreTitle.tryAgain': '💪 Próbáld újra!',
            'scoreBreakdown.shape': '🔵 Köralak',
            'scoreBreakdown.closure': '🔗 Záródás',
            'scoreBreakdown.smoothness': '🌊 Egyenletesség',
            'scoreBreakdown.size': '📏 Méret',
            'scoreBreakdown.transformation': '🎨 Transzformáció: {name}',
            'common.points': 'pont',
            'transformations.rainbow': 'Szivárvány',
            'transformations.galaxy': 'Galaxis',
            'transformations.flower': 'Virág',
            'transformations.mandala': 'Mandala',
            'transformations.spiral': 'Spirál',
            'transformations.star': 'Csillag',
            'transformations.heart': 'Szív',
            'transformations.diamond': 'Gyémánt',
            'transformations.wave': 'Hullám',
            'transformations.fire': 'Tűz',
            'transformations.transformText': '🎨 Transzformáció alkalmazva: {name}',
            'firebase.online': '🟢 Online',
            'firebase.offline': '🔴 Offline',
            'firebase.connecting': '🟡 Kapcsolódás...',
            'firebase.error': '❌ Hiba',
            'audio.enabled': 'Hang Be',
            'audio.disabled': 'Hang Ki',
            'audio.enabledMessage': 'Hang bekapcsolva!',
            'audio.disabledMessage': 'Hang kikapcsolva!',
            'theme.light': '☀️ Világos',
            'theme.dark': '🌙 Sötét',
            'theme.lightEnabled': 'Világos téma bekapcsolva!',
            'theme.darkEnabled': 'Sötét téma bekapcsolva!'
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

        if (this.leaderboardManager && typeof this.leaderboardManager.getCurrentView === 'function') {
            if (this.leaderboardManager.getCurrentView() === 'local') {
                this.leaderboardManager.loadLocalLeaderboard();
            }
        }

        this.updatePlayerNamePlaceholder();
        this.updateDynamicElements();

        setTimeout(() => {
            this.refreshLeaderboardDates();
        }, 100);
    }

    updatePlayerNamePlaceholder() {
        const nameInput = document.getElementById('playerName');
        if (nameInput) {
            nameInput.placeholder = this.t('player.placeholder');
        }
    }

    updateDynamicElements() {
        const firebaseStatus = document.getElementById('firebaseStatus');
        if (firebaseStatus) {
            const currentClass = firebaseStatus.className;
            if (currentClass.includes('online')) {
                firebaseStatus.textContent = this.t('firebase.online');
            } else if (currentClass.includes('offline')) {
                firebaseStatus.textContent = this.t('firebase.offline');
            } else if (currentClass.includes('connecting')) {
                firebaseStatus.textContent = this.t('firebase.connecting');
            } else if (currentClass.includes('error')) {
                firebaseStatus.textContent = this.t('firebase.error');
            }
        }
    }

    refreshLeaderboardDates() {
        // Placeholder
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            if (window.gameEngine) {
                window.gameEngine.redrawTransformation();
            }
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        window.addEventListener('beforeunload', (e) => {
            if (window.gameEngine && window.gameEngine.gameActive) {
                e.preventDefault();
                const message = this.t('warnings.gameInProgress') || 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
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

        switch(e.key) {
            case 'Escape':
                if (window.gameEngine && window.gameEngine.gameActive) {
                    window.gameEngine.clearCanvas();
                }
                break;
            case 'F1':
                e.preventDefault();
                this.showInstructions();
                break;
        }
    }

    initializeUI() {
        if (window.i18nManager) {
            this.initializeUIWithI18n();
        } else {
            this.initializeUIFallback();
        }
    }

    initializeUIWithI18n() {
        this.addAudioToggleButton();
        this.addThemeToggleButton();
    }

    initializeUIFallback() {
        const controls = document.querySelector('.controls');
        if (controls) {
            if (!document.getElementById('audioToggleBtn')) {
                const audioBtn = document.createElement('button');
                audioBtn.id = 'audioToggleBtn';
                audioBtn.innerHTML = '🔊 Hang';
                audioBtn.onclick = this.toggleAudio.bind(this);
                controls.appendChild(audioBtn);
            }

            if (!document.getElementById('themeToggleBtn')) {
                const themeBtn = document.createElement('button');
                themeBtn.id = 'themeToggleBtn';
                themeBtn.innerHTML = '🌙 Sötét';
                themeBtn.onclick = this.toggleTheme.bind(this);
                controls.appendChild(themeBtn);
            }
        }
    }

    addAudioToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('audioToggleBtn')) {
            const audioBtn = document.createElement('button');
            audioBtn.id = 'audioToggleBtn';
            audioBtn.setAttribute('data-i18n', 'audio.enabled');
            audioBtn.innerHTML = '🔊 ' + this.t('audio.enabled');
            audioBtn.onclick = this.toggleAudio.bind(this);
            audioBtn.title = 'Audio toggle';
            controls.appendChild(audioBtn);
        }
    }

    addThemeToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('themeToggleBtn')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'themeToggleBtn';
            themeBtn.setAttribute('data-i18n', 'theme.dark');
            themeBtn.innerHTML = '🌙 ' + this.t('theme.dark');
            themeBtn.onclick = this.toggleTheme.bind(this);
            themeBtn.title = 'Theme toggle';
            controls.appendChild(themeBtn);
        }
    }

    toggleAudio() {
        if (window.AudioManager) {
            const isEnabled = window.AudioManager.isEnabled();
            window.AudioManager.setEnabled(!isEnabled);

            const audioBtn = document.getElementById('audioToggleBtn');
            if (audioBtn) {
                audioBtn.innerHTML = isEnabled ?
                    this.t('audio.disabled') :
                    this.t('audio.enabled');
            }

            if (!isEnabled && window.AudioManager.playSuccessSound) {
                window.AudioManager.playSuccessSound();
            }

            const message = isEnabled ?
                this.t('audio.disabledMessage') :
                this.t('audio.enabledMessage');
            alert(message);
        }
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');

        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ?
                this.t('theme.light') :
                this.t('theme.dark');
        }

        localStorage.setItem('perfectcircle_theme', isDark ? 'dark' : 'light');

        const message = isDark ?
            this.t('theme.darkEnabled') :
            this.t('theme.lightEnabled');
        alert(message);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('perfectcircle_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.innerHTML = this.t('theme.light');
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
            alert(this.t('errors.invalidName'));
            return false;
        }

        if (name.length > 20) {
            alert(this.t('errors.nameTooLong'));
            return false;
        }

        localStorage.setItem('perfectcircle_playername', name);
        this.playerName = name;

        const message = this.t('player.nameSaved', { name: name });
        alert(message);
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
        const instructions = `
🎯 PERFECT CIRCLE - TELJES ÚTMUTATÓ

📝 JÁTÉK CÉLJA:
Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!

🎮 IRÁNYÍTÁS:
• 🖱️ Egér: Kattints és húzd
• 📱 Mobil: Érintsd és húzd
• ⌨️ Billentyűk: Ctrl+S (start), Ctrl+R (törlés), Esc (stop)

Sok sikert a tökéletes kör rajzolásához! 🍀✨
        `;
        alert(instructions);
    }

    getScoreTitle(score) {
        if (score >= 95) return this.t('scoreTitle.perfect');
        else if (score >= 85) return this.t('scoreTitle.excellent');
        else if (score >= 70) return this.t('scoreTitle.good');
        else if (score >= 50) return this.t('scoreTitle.notBad');
        else return this.t('scoreTitle.tryAgain');
    }

    getTransformationText(transformationName, emoji) {
        return this.t('transformations.transformText', {
            name: this.t(`transformations.${transformationName.toLowerCase()}`) || transformationName,
            emoji: emoji
        });
    }

    switchLeaderboard(type) {
        if (this.leaderboardManager && typeof this.leaderboardManager.switchLeaderboard === 'function') {
            this.leaderboardManager.switchLeaderboard(type);
        } else {
            console.warn('⚠️ LeaderboardManager switchLeaderboard metódus nem elérhető');
            this.handleLeaderboardSwitch(type);
        }
    }

    handleLeaderboardSwitch(type) {
        console.log(`🔄 Fallback leaderboard váltás: ${type}`);
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const targetTab = document.getElementById(type + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        if (type === 'local') {
            try {
                this.displayFallbackLeaderboard();
            } catch (error) {
                console.error('❌ Helyi leaderboard fallback hiba:', error);
            }
        } else if (type === 'global') {
            this.displayGlobalNotAvailable();
        }
    }

    displayGlobalNotAvailable() {
        const listContainer = document.getElementById('leaderboardList');
        const statusContainer = document.getElementById('leaderboardStatus');
        
        if (statusContainer) {
            statusContainer.textContent = '❌ Globális eredmények nem elérhetők - Próbáld később';
        }
        
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="score-entry error">
                    <span style="color: #ff6b6b;">❌ Globális eredmények nem elérhetők - Próbáld később</span>
                </div>
            `;
        }
    }

    async loadGlobalLeaderboard() {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadGlobalLeaderboard === 'function') {
            await this.leaderboardManager.loadGlobalLeaderboard();
        } else {
            console.warn('⚠️ LeaderboardManager loadGlobalLeaderboard metódus nem elérhető');
            this.displayGlobalNotAvailable();
        }
    }

    loadLocalLeaderboard(highlightId = null) {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
            this.leaderboardManager.loadLocalLeaderboard(highlightId);
        } else {
            console.warn('⚠️ LeaderboardManager loadLocalLeaderboard metódus nem elérhető');
            this.displayFallbackLeaderboard();
        }
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// Globális függvények
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

// ✅ TISZTA SWITCHLEADERBOARD FÜGGVÉNY - CSAK VÁLTÁS
window.switchLeaderboard = (type) => {
    console.log(`🔄 Globális switchLeaderboard hívás: ${type}`);
    
    const app = window.perfectCircleApp;
    if (app && typeof app.switchLeaderboard === 'function') {
        app.switchLeaderboard(type);
    } else {
        console.error('❌ PerfectCircleApp switchLeaderboard metódus nem elérhető');
    }
};

window.loadGlobalLeaderboard = async () => {
    console.log('🌍 Globális loadGlobalLeaderboard hívás');
    
    const app = window.perfectCircleApp;
    if (app && typeof app.loadGlobalLeaderboard === 'function') {
        await app.loadGlobalLeaderboard();
    } else {
        console.error('❌ PerfectCircleApp loadGlobalLeaderboard metódus nem elérhető');
    }
};

window.loadLocalLeaderboard = (highlightId = null) => {
    console.log('📱 Globális loadLocalLeaderboard hívás');
    
    const app = window.perfectCircleApp;
    if (app && typeof app.loadLocalLeaderboard === 'function') {
        app.loadLocalLeaderboard(highlightId);
    } else {
        console.error('❌ PerfectCircleApp loadLocalLeaderboard metódus nem elérhető');
    }
};

// ✅ JAVÍTOTT SHOWSCORE FÜGGVÉNY
window.showScore = async (score, analysis, transformationName = '') => {
    console.log('📊 showScore hívva:', { score, analysis, transformationName });

    // UI frissítés
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

    // Pontszám cím beállítása
    if (elements.scoreTitle) {
        let titleEmoji = '';
        let titleText = '';

        if (roundedScore >= 90) {
            titleEmoji = '🏆';
            titleText = 'Tökéletes! Zseniális!';
        } else if (roundedScore >= 75) {
            titleEmoji = '🌟';
            titleText = 'Kiváló! Nagyon jó!';
        } else if (roundedScore >= 60) {
            titleEmoji = '👍';
            titleText = 'Jó munka!';
        } else if (roundedScore >= 40) {
            titleEmoji = '👌';
            titleText = 'Nem rossz!';
        } else {
            titleEmoji = '💪';
            titleText = 'Próbáld újra!';
        }

        const app = window.perfectCircleApp;
        if (app) {
            const scoreKey = roundedScore >= 90 ? 'perfect' :
                           roundedScore >= 75 ? 'excellent' :
                           roundedScore >= 60 ? 'good' :
                           roundedScore >= 40 ? 'notBad' : 'tryAgain';

            const localizedText = app.t(`scoreTitle.${scoreKey}`);
            if (localizedText && !localizedText.startsWith('scoreTitle.')) {
                titleText = localizedText;
            }
        }

        elements.scoreTitle.innerHTML = `<span style="font-size: 1.2em;">${titleEmoji}</span> ${titleText}`;
    }

    // Score breakdown
    if (!analysis.error && elements.scoreBreakdown) {
        const app = window.perfectCircleApp;
        const shapeScore = Math.round(analysis.shapeScore || 0);
        const closureScore = Math.round(analysis.closureScore || 0);
        const smoothnessScore = Math.round(analysis.smoothnessScore || 0);
        const sizeScore = Math.round(analysis.sizeScore || 0);

        let transformationHtml = '';
        if (transformationName && transformationName.trim() !== '') {
            const transformationNames = {
                'rainbow': 'Szivárvány', 'galaxy': 'Galaxis', 'flower': 'Virág',
                'mandala': 'Mandala', 'spiral': 'Spirál', 'star': 'Csillag',
                'heart': 'Szív', 'diamond': 'Gyémánt', 'wave': 'Hullám', 'fire': 'Tűz'
            };

            let displayName = transformationNames[transformationName.toLowerCase()] || transformationName;
            let transformationText = `🎨 Transzformáció: ${displayName}`;

            if (app) {
                const localizedName = app.t(`transformations.${transformationName.toLowerCase()}`);
                if (localizedName && !localizedName.startsWith('transformations.')) {
                    displayName = localizedName;
                }

                const localizedText = app.t('scoreBreakdown.transformation', { name: displayName });
                if (localizedText && !localizedText.startsWith('scoreBreakdown.')) {
                    transformationText = localizedText;
                }
            }

            transformationHtml = `
                <div class="breakdown-item transformation-item" style="grid-column: 1/-1; background: rgba(255,215,0,0.3); border: 2px solid #ffd700; border-radius: 8px; padding: 12px; margin-top: 10px;">
                    <strong>${transformationText}</strong>
                </div>
            `;
        }

        const getText = (key, fallback) => {
            if (!app) return fallback;
            const text = app.t(key);
            return (text && !text.startsWith(key.split('.')[0] + '.')) ? text : fallback;
        };

        const shapeText = getText('scoreBreakdown.shape', '🔵 Köralak');
        const closureText = getText('scoreBreakdown.closure', '🔗 Záródás');
        const smoothnessText = getText('scoreBreakdown.smoothness', '🌊 Egyenletesség');
        const sizeText = getText('scoreBreakdown.size', '📏 Méret');
        const pointsText = getText('common.points', 'pont');

        elements.scoreBreakdown.innerHTML = `
            <div class="breakdown-item">
                <strong>${shapeText}:</strong><br>
                <span class="score-value">${shapeScore}/40 ${pointsText}</span>
            </div>
            <div class="breakdown-item">
                <strong>${closureText}:</strong><br>
                <span class="score-value">${closureScore}/20 ${pointsText}</span>
            </div>
            <div class="breakdown-item">
                <strong>${smoothnessText}:</strong><br>
                <span class="score-value">${smoothnessScore}/25 ${pointsText}</span>
            </div>
            <div class="breakdown-item">
                <strong>${sizeText}:</strong><br>
                <span class="score-value">${sizeScore}/15 ${pointsText}</span>
            </div>
            ${transformationHtml}
        `;
    }

    // Ideális kör megjelenítése
    if (analysis && !analysis.error && analysis.center && analysis.radius && elements.idealCircleContainer) {
        elements.idealCircleContainer.style.display = 'block';
        const canvas = document.getElementById('idealCircleCanvas');
        if (canvas && window.CircleAnalyzer && typeof window.CircleAnalyzer.drawIdealCircle === 'function') {
            const ctx = canvas.getContext('2d');
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas && window.gameEngine && window.gameEngine.points) {
                canvas.width = gameCanvas.width;
                canvas.height = gameCanvas.height;
                window.CircleAnalyzer.drawIdealCircle(
                    ctx, analysis.center.x, analysis.center.y, analysis.radius, window.gameEngine.points
                );
            }
        }
    }

    // Effektek
    if (window.EffectsManager) {
        window.EffectsManager.showScoreAnimation();
    }

    // MENTÉSI FOLYAMAT
    if (!analysis.error && roundedScore > 0) {
        setTimeout(async () => {
            console.log('💾 Mentési folyamat kezdése...');
            
            // Effektek és hangok
            if (window.EffectsManager) {
                window.EffectsManager.celebrateScore(roundedScore);
            }
            if (window.AudioManager && window.AudioManager.playCheerSound) {
                window.AudioManager.playCheerSound(roundedScore);
            }

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

            // ✅ 2. BIZTONSÁGOS GLOBÁLIS MENTÉS
            const app = window.perfectCircleApp;
            const playerName = app ? app.getPlayerName() : 'Névtelen';
            const anonymousName = app ? app.t('player.anonymous') : 'Névtelen';

            console.log('🌍 Globális mentés feltétel ellenőrzés:', {
                playerName: `"${playerName}"`,
                anonymousName: `"${anonymousName}"`,
                hasValidName: playerName && playerName.trim() !== '' && playerName !== anonymousName,
                firebaseAPI: !!window.firebaseAPI,
                firebaseReady: window.firebaseAPI ? window.firebaseAPI.isReady() : false
            });

            const hasValidPlayerName = playerName && 
                                      playerName.trim() !== '' && 
                                      playerName !== anonymousName && 
                                      playerName !== 'Névtelen' &&
                                      playerName !== 'Anonymous' &&
                                      playerName.length > 0;

            const isFirebaseReady = window.firebaseAPI && 
                                   typeof window.firebaseAPI.isReady === 'function' && 
                                   window.firebaseAPI.isReady();

            if (hasValidPlayerName) {
                console.log('👤 ✅ Érvényes játékos név megvan');
                
                if (isFirebaseReady) {
                    console.log('🔥 ✅ Firebase elérhető - globális mentés indítása...');
                    
                    try {
                        let globalSaveSuccess = false;
                        
                        // ✅ BIZTONSÁGOS ADATOK KÉSZÍTÉSE
                        const difficulty = window.gameEngine ? window.gameEngine.getDifficulty() : 'easy';
                        const safeScoreData = window.createSafeScoreData(
                            playerName,
                            roundedScore,
                            difficulty,
                            transformationName
                        );
                        
                        // ✅ LEADERBOARD MANAGER MENTÉS
                        if (app && app.leaderboardManager && typeof app.leaderboardManager.saveGlobalScore === 'function') {
                            console.log('📤 LeaderboardManager globális mentés...');
                            
                            await app.leaderboardManager.saveGlobalScore(
                                safeScoreData.playerName,
                                safeScoreData.score,
                                safeScoreData.difficulty,
                                safeScoreData.transformation
                            );
                            
                            globalSaveSuccess = true;
                            console.log('✅ LeaderboardManager globális mentés sikeres!');
                            
                        } 
                        // ✅ KÖZVETLEN FIREBASE MENTÉS BIZTONSÁGOS ADATOKKAL
                        else if (typeof window.firebaseAPI.saveScore === 'function') {
                            console.log('📤 Közvetlen Firebase mentés biztonságos adatokkal...');
                            console.log('📋 Küldendő adat:', safeScoreData);
                            
                            const result = await window.firebaseAPI.saveScore(safeScoreData);
                            globalSaveSuccess = true;
                            console.log('✅ Közvetlen Firebase mentés sikeres!', result);
                            
                        } else {
                            throw new Error('Nincs elérhető globális mentési metódus');
                        }
                        
                        // ✅ SIKERES MENTÉS UTÁN
                        if (globalSaveSuccess) {
                            console.log('🎉 Globális mentés teljesen sikeres!');
                            
                            // Felhasználó értesítése
                            setTimeout(() => {
                                alert(`🌍 Globális eredmény mentve!\n\n🎮 ${safeScoreData.playerName}\n📊 ${safeScoreData.score} pont\n🎨 ${safeScoreData.transformation || 'Nincs transzformáció'}\n\n✅ Megjelenik a globális toplista-ban!`);
                            }, 1000);
                        }

                    } catch (error) {
                        console.error('❌ Globális mentés sikertelen:', error);
                        
                        let errorMessage = 'Ismeretlen hiba';
                        if (error.message.includes('invalid data')) {
                            errorMessage = 'Érvénytelen adatok - ellenőrizd a pontszámot';
                        } else if (error.message.includes('undefined')) {
                            errorMessage = 'Hiányzó adatok - próbáld újra';
                        } else if (error.code === 'permission-denied') {
                            errorMessage = 'Nincs jogosultság a mentéshez';
                        } else if (error.code === 'unavailable') {
                            errorMessage = 'Firebase szerver nem elérhető';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }
                        
                        setTimeout(() => {
                            alert(`❌ Globális mentés sikertelen!\n\nHiba: ${errorMessage}\n\n💾 A helyi eredmény mentve maradt.\n🔄 Próbáld újra később.`);
                        }, 500);
                    }
                    
                } else {
                    console.warn('📴 Firebase nem elérhető - offline mentés...');
                    setTimeout(() => {
                        alert(`📴 Firebase offline!\n\n💾 Eredmény helyben mentve:\n🎮 ${playerName}\n📊 ${roundedScore} pont\n\n🔄 Amikor a kapcsolat helyreáll, próbáld újra.`);
                    }, 500);
                }
                
            } else {
                console.log('👤 ❌ Nincs érvényes játékos név - globális mentés kihagyva');
                console.log('💡 Tipp: Add meg a neved a "Játékos név" mezőben a globális mentéshez!');
            }

            // ✅ 3. HELYI LEADERBOARD FRISSÍTÉSE
            console.log('🔄 Helyi leaderboard frissítése...');
            const currentView = app?.leaderboardManager?.getCurrentView() || 'local';
            if (currentView === 'local') {
                setTimeout(() => {
                    if (app?.leaderboardManager?.loadLocalLeaderboard) {
                        app.leaderboardManager.loadLocalLeaderboard(savedScore?.id);
                    }
                }, 100);
            }

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
            console.error('❌ App inicializálás sikertelen - perfectCircleApp nem elérhető');
            return;
        }
    }

    try {
        window.perfectCircleApp.init();
    } catch (error) {
        console.error('❌ App inicializálási hiba:', error);

        if (initAttempts < maxInitAttempts) {
            console.log(`🔄 Újrapróbálkozás ${initAttempts + 1}/${maxInitAttempts}...`);
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

// Firebase státusz frissítő függvény
window.updateFirebaseStatus = (status, message) => {
    const statusEl = document.getElementById('firebaseStatus');
    const offlineNotice = document.getElementById('offlineNotice');

    if (!statusEl) return;

    statusEl.className = `firebase-status ${status}`;

    const app = window.perfectCircleApp;
    switch(status) {
        case 'online':
            statusEl.innerHTML = app ? app.t('firebase.online') : '🟢 Online';
            if (offlineNotice) offlineNotice.classList.remove('show');
            break;
        case 'offline':
            statusEl.innerHTML = app ? app.t('firebase.offline') : '🔴 Offline';
            if (offlineNotice) offlineNotice.classList.add('show');
            break;
        case 'connecting':
            statusEl.innerHTML = app ? app.t('firebase.connecting') : '🟡 Kapcsolódás...';
            if (offlineNotice) offlineNotice.classList.remove('show');
            break;
        case 'error':
            statusEl.innerHTML = app ? app.t('firebase.error') : '❌ Hiba';
            if (offlineNotice) offlineNotice.classList.add('show');
            break;
    }

    console.log(`🔥 Firebase: ${status} - ${message || ''}`);
};

// Transzformáció szöveg frissítő függvény
window.updateTransformationText = (transformationName, emoji) => {
    const transformationText = document.getElementById('transformationText');
    if (transformationText && window.perfectCircleApp) {
        transformationText.textContent = window.perfectCircleApp.getTransformationText(transformationName, emoji);
    }
};

// Globális hibakezelő
window.addEventListener('error', (e) => {
    console.error('💥 Globális hiba:', e.error);

    if (e.error && e.error.message) {
        const app = window.perfectCircleApp;
        const userMessage = app ?
            app.t('errors.criticalError') :
            'Kritikus hiba történt. Kérlek frissítsd az oldalt.';

        if (e.error.message.includes('i18n') || e.error.message.includes('firebase')) {
            setTimeout(() => {
                alert(userMessage + '\n\n' + e.error.message);
            }, 1000);
        }
    }
});
