// Fő alkalmazás inicializáló és koordinátor - Biztonságos verzió

// BIZTONSÁGOS SCORE ADAT KÉSZÍTŐ FÜGGVÉNY
window.createSafeScoreData = (playerName, score, difficulty, transformation) => {
    console.log('🛡️ Biztonságos score adat készítése:', {
        playerName, score, difficulty, transformation
    });
    
    // Biztonságos értékek
    const safePlayerName = String(playerName || 'Névtelen').trim();
    const safeScore = Number(score);
    const safeDifficulty = String(difficulty || 'easy');
    const safeTransformation = String(transformation || '');
    
    // Validálás
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
    
    // Minden mező ellenőrzése
    Object.keys(scoreData).forEach(key => {
        const value = scoreData[key];
        if (value === undefined || value === null) {
            console.error(`❌ Undefined/null érték: ${key} = ${value}`);
            throw new Error(`Undefined/null érték a ${key} mezőben`);
        }
        console.log(`✅ ${key}: ${value} (${typeof value})`);
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
        this.leaderboardManager = null; // Ide kerül a példány
    }

async init() {
    if (this.initialized) {
        console.warn('Alkalmazás már inicializálva');
        return;
    }

    console.log('🎮 Perfect Circle alkalmazás inicializálása...');

    try {
        // I18n Manager ellenőrzése és várakozás
        await this.waitForI18nManager();

        // I18n inicializálása
        if (window.i18nManager && typeof window.i18nManager.init === 'function') {
            await window.i18nManager.init();
            this.currentLanguage = window.i18nManager.getCurrentLanguage();
            console.log(`✅ I18n inicializálva - Nyelv: ${this.currentLanguage}`);
        } else {
            console.warn('⚠️ I18n Manager nem elérhető - folytatás alapértelmezett szövegekkel');
            this.currentLanguage = 'hu';
        }

        // Nyelv változás esemény figyelése
        if (window.i18nManager) {
            window.addEventListener('languageChanged', (e) => {
                this.onLanguageChanged(e.detail);
            });
        }

        // Alapvető inicializálás
        this.loadPlayerName();
        this.updateStats();

        // Látogatásszámláló indítása
        if (window.VisitorCounter && typeof window.VisitorCounter.init === 'function') {
            await window.VisitorCounter.init();
        } else {
            console.warn('⚠️ VisitorCounter nem elérhető');
        }

        // ✅ JAVÍTOTT LeaderboardManager inicializálása
        await this.initializeLeaderboardManager();
        
        // Event listener-ek beállítása
        this.setupEventListeners();

        // UI elemek inicializálása
        this.initializeUI();

        // Téma betöltése
        this.loadTheme();

        this.initialized = true;
        console.log('✅ Perfect Circle alkalmazás sikeresen inicializálva');

    } catch (error) {
        console.error('❌ Alkalmazás inicializálási hiba:', error);

        // Fallback inicializálás
        this.initializeFallback();
    }
}

    // I18n Manager várakozás
    async waitForI18nManager() {
        return new Promise((resolve) => {
            const checkI18n = () => {
                this.initAttempts++;

                if (window.i18nManager && typeof window.i18nManager.init === 'function') {
                    console.log(`✅ I18n Manager megtalálva ${this.initAttempts}. kísérlettel`);
                    resolve();
                } else if (this.initAttempts >= this.maxInitAttempts) {
                    console.warn(`⚠️ I18n Manager nem található ${this.maxInitAttempts} kísérlet után`);
                    resolve(); // Folytatjuk anélkül
                } else {
                    console.log(`🔄 I18n Manager várakozás... (${this.initAttempts}/${this.maxInitAttempts})`);
                    setTimeout(checkI18n, 100);
                }
            };

            checkI18n();
        });
    }

// LeaderboardManager biztonságos inicializálása
async initializeLeaderboardManager() {
    console.log('🏆 LeaderboardManager inicializálása...');
    
    // Várakozás a LeaderboardManager osztályra
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
        // LeaderboardManager példány létrehozása
        this.leaderboardManager = new window.LeaderboardManager(this);
        console.log('✅ LeaderboardManager példány létrehozva');
        
        // Metódusok ellenőrzése
        if (typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
            // Helyi ranglista betöltése
            this.leaderboardManager.loadLocalLeaderboard();
            console.log('✅ Helyi ranglista betöltve');
        } else {
            console.error('❌ loadLocalLeaderboard metódus nem található');
        }
        
    } catch (error) {
        console.error('❌ LeaderboardManager inicializálási hiba:', error);
        this.leaderboardManager = null;
        
        // Fallback - alapértelmezett ranglista megjelenítés
        this.displayFallbackLeaderboard();
    }
}

// Fallback ranglista megjelenítés LeaderboardManager nélkül
// Fallback ranglista megjelenítés LeaderboardManager nélkül
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
                // ✅ JAVÍTÁS: getScores() használata (nem getTopScores)
                const scores = window.ScoreManager.getScores();
                
                console.log('📊 Betöltött eredmények:', scores);
                
                if (scores.length === 0) {
                    listContainer.innerHTML = `
                        <div class="score-entry">
                            <span>${this.t('leaderboard.noResults')}</span>
                        </div>
                    `;
                } else {
                    // A ScoreManager már rendezett listát ad vissza (score szerint csökkenő)
                    listContainer.innerHTML = scores.map((score, index) => {
                        // Játékos név meghatározása
                        let playerName = 'Névtelen';
                        if (score.playerName) {
                            playerName = score.playerName;
                        } else {
                            // Ha nincs playerName, próbáljuk lekérni az aktuális játékos nevét
                            const currentPlayer = this.getPlayerName();
                            if (currentPlayer && currentPlayer !== this.t('player.anonymous')) {
                                playerName = currentPlayer;
                            }
                        }
                        
                        // Dátum formázása
                        let dateStr = '';
                        if (score.date) {
                            dateStr = score.date;
                        } else if (score.timestamp) {
                            dateStr = new Date(score.timestamp).toLocaleDateString('hu-HU');
                        } else {
                            dateStr = 'Ismeretlen';
                        }
                        
                        // Nehézség és transzformáció megjelenítése
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
                
                // Státusz frissítése a tényleges eredmények számával
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


    // Fallback inicializálás I18n nélkül
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

    // Biztonságos szöveg lekérés
    t(key, params = {}) {
        if (window.i18nManager && typeof window.i18nManager.t === 'function') {
            return window.i18nManager.t(key, params);
        }

        // Fallback szövegek
        const fallbackTexts = {
            'title': 'Perfect Circle',
            'subtitle': 'Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!',
            'buttons.startDrawing': '🎯 Rajzolás Kezdése',
            'buttons.clear': '🗑️ Törlés',
            'buttons.help': '❓ Segítség',
            'buttons.save': '💾 Mentés',
            'stats.currentScore': 'Jelenlegi Pontszám',
            'stats.bestScore': 'Legjobb Eredmény',
            'stats.gamesPlayed': 'Játékok Száma',
            'stats.averageScore': 'Átlag Pontszám',
            'player.label': '👤 Játékos név:',
            'player.placeholder': 'Add meg a neved',
            'player.nameSaved': 'Név mentve: {name} ✅',
            'errors.invalidName': 'Kérlek add meg a neved!',
            'errors.nameTooLong': 'A név maximum 20 karakter lehet!',
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
            'common.players': 'játékos',
            'common.games': 'játék',
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
            'leaderboard.noResults': 'Még nincsenek eredmények',
            'leaderboard.localResults': '📱 Helyi eredmények',
            'leaderboard.globalResults': '🌍 Globális toplista',
            'leaderboard.loading': 'Eredmények betöltése...',
            'leaderboard.tooFrequentAttempt': 'Túl gyakori próbálkozás - várj 10 másodpercet',
            'leaderboard.waitRetry': '⏳ Várj 10 másodpercet az újrapróbálkozás előtt',
            'leaderboard.globalNotAvailable': '❌ Globális eredmények nem elérhetők - Próbáld később',
            'firebase.online': '🟢 Online',
            'firebase.offline': '🔴 Offline',
            'firebase.connecting': '🟡 Kapcsolódás...',
            'firebase.error': '❌ Hiba',
            'firebase.notAvailable': 'Firebase nem elérhető',
            'firebase.reconnectFailed': 'Firebase újracsatlakozás sikertelen',
            'firebase.notAvailableCheckRules': '❌ Firebase nem elérhető - Ellenőrizd a Firestore Rules-t',
            'firebase.rulesErrorSolution': '❌ Firestore Rules hiba - Kattints a státuszra a megoldásért',
            'errors.notImplemented': 'Ez a funkció még nincs implementálva.',
            'player.you': 'Te',
            'player.anonymous': 'Névtelen',
            'advanced.clearAllConfirm': 'Biztosan törölni szeretnéd az összes adatot?',
            'advanced.allDataCleared': 'Minden adat törölve!',
            'advanced.clearError': 'Hiba a törlés során',
            'advanced.exportSuccess': 'Eredmények sikeresen exportálva!',
            'advanced.exportError': 'Hiba az exportálás során',
            'advanced.importSuccess': '{imported}/{total} eredmény importálva!',
            'advanced.importError': 'Hiba az importálás során',
            'advanced.fileError': 'Fájl olvasási hiba',
            'advanced.invalidChoice': 'Érvénytelen választás!',
            'advanced.openConsole': 'Nyomd meg F12-t a fejlesztői konzol megnyitásához!',
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

        // Paraméter behelyettesítés
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });

        return text;
    }

    onLanguageChanged(detail) {
        if (!detail) return;

        console.log(`🌍 Language changed to: ${detail.language}`);
        this.currentLanguage = detail.language;

        // Statisztikák frissítése új nyelvvel
        this.updateStats();

        // Leaderboard frissítése
        if (this.leaderboardManager && typeof this.leaderboardManager.getCurrentView === 'function') {
            if (this.leaderboardManager.getCurrentView() === 'local') {
                this.leaderboardManager.loadLocalLeaderboard();
            }
        }

        // Játékos név placeholder frissítése
        this.updatePlayerNamePlaceholder();

        // Nehézségi gombok frissítése
        this.updateDifficultyButtons();

        // Egyéb UI elemek frissítése
        this.updateDynamicElements();

        // Dátum formátumok frissítése a leaderboard-ban
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

    updateDifficultyButtons() {
        const easyBtn = document.querySelector('[data-difficulty="easy"]');
        const hardBtn = document.querySelector('[data-difficulty="hard"]');

        if (easyBtn) easyBtn.textContent = this.t('difficulty.easy');
        if (hardBtn) hardBtn.textContent = this.t('difficulty.hard');
    }

    updateDynamicElements() {
        // Firebase státusz frissítése
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

        // Offline notice frissítése
        const offlineNotice = document.getElementById('offlineNotice');
        if (offlineNotice) {
            offlineNotice.innerHTML = this.t('firebase.offlineNotice');
        }
    }

    refreshLeaderboardDates() {
        // Leaderboard dátumok frissítése ha szükséges (már a displayScores kezeli)
    }

    setupEventListeners() {
        // Ablak resize esemény
        window.addEventListener('resize', () => {
            if (window.gameEngine) {
                window.gameEngine.redrawTransformation();
            }
        });

        // Billentyűzet események
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Oldal elhagyása előtti figyelmeztetés ha van aktív játék
        window.addEventListener('beforeunload', (e) => {
            if (window.gameEngine && window.gameEngine.gameActive) {
                e.preventDefault();
                const message = this.t('warnings.gameInProgress') || 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
                e.returnValue = message;
                return e.returnValue;
            }
        });

        // Nyelv selector menü bezárása kattintásra
        document.addEventListener('click', (e) => {
            const languageSelector = document.getElementById('languageSelector');
            const languageMenu = document.getElementById('languageMenu');

            if (languageSelector && !languageSelector.contains(e.target)) {
                if (languageMenu && languageMenu.classList.contains('show')) {
                    languageMenu.classList.remove('show');
                }
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // CTRL/CMD + billentyű kombinációk
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'r': // Restart/Clear
                    e.preventDefault();
                    if (window.gameEngine) {
                        window.gameEngine.clearCanvas();
                    }
                    break;
                case 's': // Start
                    e.preventDefault();
                    if (window.gameEngine && !window.gameEngine.gameActive) {
                        window.gameEngine.startDrawing();
                    }
                    break;
                case 'h': // Help
                    e.preventDefault();
                    this.showInstructions();
                    break;
                case 'e': // Export scores
                    e.preventDefault();
                    if (this.leaderboardManager && typeof this.leaderboardManager.exportLeaderboard === 'function') {
                        this.leaderboardManager.exportLeaderboard();
                    }
                    break;
                case 'l': // Language selector toggle
                    e.preventDefault();
                    if (window.i18nManager && typeof window.i18nManager.toggleLanguageMenu === 'function') {
                        window.i18nManager.toggleLanguageMenu();
                    }
                    break;
            }
        }

        // Egyedi billentyűk
        switch(e.key) {
            case 'Escape':
                // Játék megszakítása vagy nyelv menü bezárása
                if (window.gameEngine && window.gameEngine.gameActive) {
                    window.gameEngine.clearCanvas();
                } else {
                    const languageMenu = document.getElementById('languageMenu');
                    if (languageMenu && languageMenu.classList.contains('show')) {
                        languageMenu.classList.remove('show');
                    }
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
        // Audio toggle gomb hozzáadása
        this.addAudioToggleButton();

        // Téma váltó gomb hozzáadása
        this.addThemeToggleButton();

        // Fejlett funkciók gomb hozzáadása
        this.addAdvancedFeaturesButton();

        // Nyelv információs gomb hozzáadása
        this.addLanguageInfoButton();
    }

    initializeUIFallback() {
        // Alapvető UI elemek hozzáadása I18n nélkül
        const controls = document.querySelector('.controls');
        if (controls) {
            // Audio gomb
            if (!document.getElementById('audioToggleBtn')) {
                const audioBtn = document.createElement('button');
                audioBtn.id = 'audioToggleBtn';
                audioBtn.innerHTML = '🔊 Hang';
                audioBtn.onclick = this.toggleAudio.bind(this);
                controls.appendChild(audioBtn);
            }

            // Téma gomb
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

            // ✅ Data-i18n hozzáadása
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

            // ✅ Data-i18n hozzáadása
            themeBtn.setAttribute('data-i18n', 'theme.dark');

            themeBtn.innerHTML = '🌙 ' + this.t('theme.dark');
            themeBtn.onclick = this.toggleTheme.bind(this);
            themeBtn.title = 'Theme toggle';
            controls.appendChild(themeBtn);
        }
    }

    addAdvancedFeaturesButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('advancedBtn')) {
            const advancedBtn = document.createElement('button');
            advancedBtn.id = 'advancedBtn';

            // ✅ Data-i18n hozzáadása
            advancedBtn.setAttribute('data-i18n', 'advanced.title');

            const advancedText = this.t('advanced.title').replace('⚙️ ', '') || 'Fejlett';
            advancedBtn.innerHTML = '⚙️ ' + advancedText;
            advancedBtn.onclick = this.showAdvancedFeatures.bind(this);
            advancedBtn.title = 'Advanced features';
            controls.appendChild(advancedBtn);
        }
    }

    addLanguageInfoButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('languageInfoBtn')) {
            const langBtn = document.createElement('button');
            langBtn.id = 'languageInfoBtn';
            langBtn.innerHTML = '🌍 ' + this.currentLanguage.toUpperCase();
            langBtn.onclick = this.showLanguageInfo.bind(this);
            langBtn.title = 'Language information';
            controls.appendChild(langBtn);
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

            // Teszt hang lejátszása ha bekapcsoljuk
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

        // Téma mentése
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

    showLanguageInfo() {
        if (!window.i18nManager) {
            alert('Nyelvi információk nem elérhetők.');
            return;
        }

        const currentLang = window.i18nManager.getCurrentLanguage();
        const supportedLangs = window.i18nManager.getSupportedLanguages();

        const info = `🌍 ${this.t('language.info') || 'NYELVI INFORMÁCIÓK'}

📍 ${this.t('language.current') || 'Jelenlegi nyelv'}: ${currentLang.toUpperCase()}
🎯 ${this.t('language.detected') || 'Automatikusan felismert'}

🗣️ ${this.t('language.supported') || 'Támogatott nyelvek'}:
${supportedLangs.map(lang =>
    `${window.LanguageDetector ? window.LanguageDetector.getLanguageFlag(lang.code) : '🌍'} ${lang.nativeName} (${lang.code})`
).join('\n')}

⌨️ ${this.t('language.shortcuts') || 'Billentyű parancsok'}:
• Ctrl+L: ${this.t('language.toggleMenu') || 'Nyelv menü'}
• ${this.t('language.clickFlag') || 'Kattints a zászlóra a váltáshoz'}

🔄 ${this.t('language.autoSave') || 'A nyelvválasztás automatikusan mentődik'}`;

        alert(info);
    }

    showAdvancedFeatures() {
        const features = this.t('advanced.features') || `
⚙️ FEJLETT FUNKCIÓK

🎮 BILLENTYŰ PARANCSOK:
• Ctrl+S: Rajzolás kezdése
• Ctrl+R: Törlés
• Ctrl+H: Segítség
• Ctrl+E: Eredmények exportálása
• Ctrl+L: Nyelv menü
• Esc: Játék megszakítása / Menü bezárása
• F1: Segítség

📊 ADATKEZELÉS:
• Helyi eredmények exportálása/importálása
• Látogatási statisztikák
• Téma váltás
• Hang be/ki kapcsolása
• Nyelv váltás

🔧 HIBAKERESÉS:
• Firebase kapcsolat ellenőrzése
• Helyi adatok törlése
• Konzol naplók megtekintése
• Teljesítmény teszt

🌍 NEMZETKÖZIESÍTÉS:
• 6 nyelv támogatása
• Automatikus nyelv felismerés
• Dátum/idő lokalizáció

Szeretnéd használni ezeket a funkciókat?
        `;

        if (confirm(features)) {
            this.showAdvancedMenu();
        }
    }

    showAdvancedMenu() {
        const menuText = this.t('advanced.menu') || `
Válassz egy műveletet:

1 - Eredmények exportálása
2 - Eredmények importálása  
3 - Látogatási statisztikák
4 - Firebase státusz
5 - Helyi adatok törlése
6 - Konzol megnyitása
7 - Teljesítmény teszt
8 - Nyelvi információk
9 - Nyelv váltás

Add meg a szám:
        `;

        const action = prompt(menuText);

        switch(action) {
            case '1':
                if (this.leaderboardManager) this.leaderboardManager.exportLeaderboard();
                break;
            case '2':
                if (this.leaderboardManager) this.leaderboardManager.importLeaderboard();
                break;
            case '3':
                if (window.showVisitStats) window.showVisitStats();
                break;
            case '4':
                if (window.showFirebaseInfo) window.showFirebaseInfo();
                break;
            case '5':
                this.clearAllData();
                break;
            case '6':
                alert(this.t('advanced.openConsole') || 'Nyomd meg F12-t a fejlesztői konzol megnyitásához!');
                break;
            case '7':
                this.runPerformanceTest();
                break;
            case '8':
                this.showLanguageInfo();
                break;
            case '9':
                if (window.i18nManager && window.i18nManager.toggleLanguageMenu) {
                    window.i18nManager.toggleLanguageMenu();
                }
                break;
            default:
                if (action !== null) {
                    alert(this.t('advanced.invalidChoice') || 'Érvénytelen választás!');
                }
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
            const date = new Date().toLocaleDateString('hu-HU');
            a.download = `perfect-circle-results-${date}.json`;
            a.click();

            URL.revokeObjectURL(url);
            alert(this.t('advanced.exportSuccess'));
        } catch (error) {
            alert(this.t('advanced.exportError') + ': ' + error.message);
        }
    }

    importScores() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (!window.ScoreManager) {
                        alert('ScoreManager nem elérhető!');
                        return;
                    }

                    const result = window.ScoreManager.importScores(e.target.result);
                    if (result.success) {
                        const message = this.t('advanced.importSuccess', {
                            imported: result.imported,
                            total: result.total
                        });
                        alert(message);
                        this.updateStats();
                        if (this.leaderboardManager) {
                            this.leaderboardManager.refreshCurrentView();
                        }
                    } else {
                        const errorMsg = this.t('advanced.importError') + ': ' + result.error;
                        alert(errorMsg);
                    }
                } catch (error) {
                    const fileErrorMsg = this.t('advanced.fileError') + ': ' + error.message;
                    alert(fileErrorMsg);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    clearAllData() {
        const confirmMsg = this.t('advanced.clearAllConfirm');
        if (confirm(confirmMsg)) {
            try {
                if (window.ScoreManager) window.ScoreManager.clearScores();
                localStorage.removeItem('perfectcircle_playername');
                localStorage.removeItem('perfectcircle_theme');
                if (window.VisitorCounter) window.VisitorCounter.resetLocalCounter();

                this.updateStats();
                if (this.leaderboardManager) {
                    this.leaderboardManager.refreshCurrentView();
                }

                alert(this.t('advanced.allDataCleared'));
            } catch (error) {
                const errorMsg = this.t('advanced.clearError') + ': ' + error.message;
                alert(errorMsg);
            }
        }
    }

    runPerformanceTest() {
        console.log('🚀 Teljesítmény teszt indítása...');

        const startTime = performance.now();

        // Dummy kör generálás és elemzés
        const testPoints = [];
        const centerX = 200;
        const centerY = 200;
        const radius = 100;

        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            testPoints.push({
                x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
                y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 10
            });
        }

        // Elemzés futtatása
        let analysis = { totalScore: 75 }; // Fallback
        if (window.CircleAnalyzer) {
            analysis = window.CircleAnalyzer.analyzeCircle(testPoints, 'easy');
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        const result = `
🚀 TELJESÍTMÉNY TESZT EREDMÉNY

⏱️ Futási idő: ${duration.toFixed(2)}ms
📊 Pontszám: ${analysis.totalScore}/100
🎯 Elemzett pontok: ${testPoints.length}
💾 Memória használat: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2) || 'N/A'} MB

${duration < 50 ? '✅ Kiváló teljesítmény!' :
  duration < 100 ? '👍 Jó teljesítmény' :
  '⚠️ Lassú teljesítmény'}
        `;

        console.log(result);
        alert(result);
    }

    // Player name kezelés - lokalizált
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

    // Statisztikák frissítése - biztonságos
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

    // Instrukciók megjelenítése - lokalizált
    showInstructions() {
        const instructions = this.t('fullInstructions') || `
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

    // Pontszám címek lokalizálása
    getScoreTitle(score) {
        if (score >= 95) return this.t('scoreTitle.perfect');
        else if (score >= 85) return this.t('scoreTitle.excellent');
        else if (score >= 70) return this.t('scoreTitle.good');
        else if (score >= 50) return this.t('scoreTitle.notBad');
        else return this.t('scoreTitle.tryAgain');
    }

    // Transzformáció szöveg lokalizálása
    getTransformationText(transformationName, emoji) {
        return this.t('transformations.transformText', {
            name: this.t(`transformations.${transformationName.toLowerCase()}`) || transformationName,
            emoji: emoji
        });
    }

    // Hibaüzenetek lokalizálása
    showError(errorKey, params = {}) {
        const message = this.t(`errors.${errorKey}`, params);
        alert(message);
    }

    // Siker üzenetek lokalizálása
    showSuccess(successKey, params = {}) {
        const message = this.t(`success.${successKey}`, params);
        alert(message);
    }

    // LeaderboardManager metódusok proxy-zása
    getLeaderboardManager() {
        return this.leaderboardManager;
    }

    // Leaderboard váltás
    switchLeaderboard(type) {
        if (this.leaderboardManager && typeof this.leaderboardManager.switchLeaderboard === 'function') {
            this.leaderboardManager.switchLeaderboard(type);
        } else {
            console.warn('⚠️ LeaderboardManager switchLeaderboard metódus nem elérhető');
            // Fallback kezelés
            this.handleLeaderboardSwitch(type);
        }
    }

    // Fallback leaderboard váltás
// Fallback leaderboard váltás
// Fallback leaderboard váltás
handleLeaderboardSwitch(type) {
    console.log(`🔄 Fallback leaderboard váltás: ${type}`);
    
    // Tab gombok frissítése
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(type + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (type === 'local') {
        // Helyi eredmények megjelenítése
        try {
            this.displayFallbackLeaderboard();
        } catch (error) {
            console.error('❌ Helyi leaderboard fallback hiba:', error);
            this.displayEmergencyFallback();
        }
    } else if (type === 'global') {
        // Globális eredmények megjelenítése
        this.displayGlobalNotAvailable();
        
        // Próbáljuk betölteni a globális eredményeket ha elérhető
        if (window.firebaseAPI && window.firebaseAPI.isReady && window.firebaseAPI.isReady()) {
            setTimeout(() => {
                this.attemptGlobalLoad();
            }, 1000);
        }
    }
}
// Globális eredmények betöltési kísérlet
async attemptGlobalLoad() {
    console.log('🌍 Globális eredmények betöltési kísérlet...');
    
    const listContainer = document.getElementById('leaderboardList');
    const statusContainer = document.getElementById('leaderboardStatus');
    
    if (!listContainer) return;
    
    try {
        // Loading állapot megjelenítése
        listContainer.innerHTML = `
            <div class="score-entry loading">
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 1.1em;">🔄 Globális eredmények betöltése...</div>
                    <div style="color: #666; margin-top: 5px;">Kérlek várj...</div>
                </div>
            </div>
        `;
        
        if (statusContainer) {
            statusContainer.textContent = '🌍 Globális eredmények - 🔄 Betöltés...';
        }
        
        // Próbáljuk elérni a globális leaderboard API-t
        if (window.GlobalLeaderboard && typeof window.GlobalLeaderboard.loadGlobalScores === 'function') {
            const globalScores = await window.GlobalLeaderboard.loadGlobalScores();
            this.displayGlobalScores(globalScores);
        } else if (window.firebaseAPI && typeof window.firebaseAPI.getTopScores === 'function') {
            const globalScores = await window.firebaseAPI.getTopScores(10);
            this.displayGlobalScores(globalScores);
        } else {
            throw new Error('Globális API nem elérhető');
        }
        
    } catch (error) {
        console.warn('❌ Globális eredmények betöltése sikertelen:', error);
        
        listContainer.innerHTML = `
            <div class="score-entry error">
                <div style="text-align: center; padding: 20px;">
                    <div style="color: #ff6b6b; font-size: 1.1em;">❌ Globális eredmények nem elérhetők</div>
                    <div style="color: #666; margin-top: 5px; font-size: 0.9em;">
                        ${error.message || 'Ismeretlen hiba'}
                    </div>
                    <button onclick="window.switchLeaderboard('local')" style="margin-top: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📱 Helyi eredmények megtekintése
                    </button>
                </div>
            </div>
        `;
        
        if (statusContainer) {
            statusContainer.textContent = '🌍 Globális eredmények - ❌ Hiba';
        }
    }
}
// Globális eredmények megjelenítése
displayGlobalScores(scores) {
    console.log('🌍 Globális eredmények megjelenítése:', scores);
    
    const listContainer = document.getElementById('leaderboardList');
    const statusContainer = document.getElementById('leaderboardStatus');
    
    if (!listContainer) return;
    
    if (!scores || scores.length === 0) {
        listContainer.innerHTML = `
            <div class="score-entry">
                <div style="text-align: center; padding: 20px;">
                    <div>🌍 Még nincsenek globális eredmények</div>
                    <div style="color: #666; margin-top: 5px; font-size: 0.9em;">
                        Légy te az első aki feltölti az eredményét!
                    </div>
                </div>
            </div>
        `;
        
        if (statusContainer) {
            statusContainer.textContent = '🌍 Globális eredmények (0 játékos)';
        }
        return;
    }
    
    // Eredmények megjelenítése
    listContainer.innerHTML = scores.map((score, index) => {
        const playerName = score.playerName || score.name || 'Névtelen';
        const scoreValue = score.score || 0;
        const timestamp = score.timestamp || score.date || Date.now();
        const dateStr = new Date(timestamp).toLocaleDateString('hu-HU');
        
        // Nehézség és transzformáció
        let extraInfo = '';
        if (score.difficulty && score.difficulty !== 'easy') {
            extraInfo += ` (${score.difficulty})`;
        }
        if (score.transformation && score.transformation.trim() !== '') {
            extraInfo += ` ✨${score.transformation}`;
        }
        
        // Rangsor emoji
        let rankEmoji = '';
        if (index === 0) rankEmoji = '🥇';
        else if (index === 1) rankEmoji = '🥈';
        else if (index === 2) rankEmoji = '🥉';
        
        return `
            <div class="score-entry global-score">
                <span class="rank">${rankEmoji}#${index + 1}</span>
                <span class="name">${playerName}</span>
                <span class="score">${scoreValue}${extraInfo}</span>
                <span class="date">${dateStr}</span>
            </div>
        `;
    }).join('');
    
    if (statusContainer) {
        const playersText = this.t('common.players') || 'játékos';
        statusContainer.textContent = `🌍 Globális eredmények (${scores.length} ${playersText})`;
    }
}


    // Globális leaderboard nem elérhető üzenet
    displayGlobalNotAvailable() {
        const listContainer = document.getElementById('leaderboardList');
        const statusContainer = document.getElementById('leaderboardStatus');
        
        if (statusContainer) {
            statusContainer.textContent = this.t('leaderboard.globalNotAvailable');
        }
        
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="score-entry error">
                    <span style="color: #ff6b6b;">❌ ${this.t('leaderboard.globalNotAvailable')}</span>
                </div>
            `;
        }
    }

    // Globális leaderboard betöltése
    async loadGlobalLeaderboard() {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadGlobalLeaderboard === 'function') {
            await this.leaderboardManager.loadGlobalLeaderboard();
        } else {
            console.warn('⚠️ LeaderboardManager loadGlobalLeaderboard metódus nem elérhető');
            this.displayGlobalNotAvailable();
        }
    }

    // Helyi leaderboard betöltése
    loadLocalLeaderboard(highlightId = null) {
        if (this.leaderboardManager && typeof this.leaderboardManager.loadLocalLeaderboard === 'function') {
            this.leaderboardManager.loadLocalLeaderboard(highlightId);
        } else {
            console.warn('⚠️ LeaderboardManager loadLocalLeaderboard metódus nem elérhető');
            // Fallback megjelenítés
            this.displayFallbackLeaderboard();
        }
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// Globális függvények a HTML-ből való híváshoz - biztonságos
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

window.clearAllScores = () => {
    if (window.perfectCircleApp) {
        window.perfectCircleApp.clearAllData();
    }
};

window.updateStats = () => {
    if (window.perfectCircleApp) {
        window.perfectCircleApp.updateStats();
    }
};

// JAVÍTOTT Globális függvények - Leaderboard kezelés
window.switchLeaderboard = (type) => {
    console.log(`🔄 Globális switchLeaderboard hívás: ${type}`);
    


// Biztonsági ellenőrzés
if (isNaN(roundedScore) || roundedScore < 0 || roundedScore > 100) {
    console.error('❌ Érvénytelen pontszám - mentés megszakítva:', roundedScore);
    alert(`❌ Érvénytelen pontszám: ${roundedScore}\n\nA mentés nem lehetséges.`);
    return;
}

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
            // ✅ BIZTONSÁGOS MENTÉSI ADATOK KÉSZÍTÉSE
            const difficulty = window.gameEngine ? window.gameEngine.getDifficulty() : 'easy';
            
            console.log('📦 Mentési adatok előkészítése:', {
                playerName: playerName,
                score: roundedScore,
                difficulty: difficulty,
                transformation: transformationName
            });
            
            const safeScoreData = window.createSafeScoreData(
                playerName,
                roundedScore,
                difficulty,
                transformationName
            );
            
            let globalSaveSuccess = false;
            
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
            // ✅ KÖZVETLEN FIREBASE MENTÉS
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
                
                // Globális leaderboard frissítése ha aktív
                const currentView = app?.leaderboardManager?.getCurrentView() || 'local';
                if (currentView === 'global') {
                    console.log('🔄 Globális leaderboard frissítése...');
                    setTimeout(() => {
                        if (typeof loadGlobalLeaderboardDirect === 'function') {
                            loadGlobalLeaderboardDirect();
                        } else if (app?.leaderboardManager?.loadGlobalLeaderboard) {
                            app.leaderboardManager.loadGlobalLeaderboard();
                        }
                    }, 2000);
                }
            }

        } catch (error) {
            console.error('❌ Globális mentés sikertelen:', error);
            
            // Részletes hibaüzenet
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
            
            // Felhasználó értesítése
            setTimeout(() => {
                alert(`❌ Globális mentés sikertelen!\n\nHiba: ${errorMessage}\n\n💾 A helyi eredmény mentve maradt.\n🔄 Próbáld újra később.`);
            }, 500);
        }
        
    } else {
        console.warn('📴 Firebase nem elérhető');
    }
    
} else {
    console.log('👤 ❌ Nincs érvényes játékos név');
}

// Globális leaderboard betöltése - TISZTÍTOTT VERZIÓ
window.loadGlobalLeaderboard = async () => {
    console.log('🌍 Globális loadGlobalLeaderboard hívás');
    
    const app = window.perfectCircleApp;
    if (app && typeof app.loadGlobalLeaderboard === 'function') {
        await app.loadGlobalLeaderboard();
    } else {
        console.error('❌ PerfectCircleApp loadGlobalLeaderboard metódus nem elérhető');
    }
};

// Helyi leaderboard betöltése - TISZTÍTOTT VERZIÓ
window.loadLocalLeaderboard = (highlightId = null) => {
    console.log('📱 Globális loadLocalLeaderboard hívás');
    
    const app = window.perfectCircleApp;
    if (app && typeof app.loadLocalLeaderboard === 'function') {
        app.loadLocalLeaderboard(highlightId);
    } else {
        console.error('❌ PerfectCircleApp loadLocalLeaderboard metódus nem elérhető');
    }
};

// Score megjelenítő függvény - JAVÍTOTT VERZIÓ
// TELJES JAVÍTOTT showScore FÜGGVÉNY
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

            // ✅ 2. JAVÍTOTT GLOBÁLIS MENTÉS
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

            // JAVÍTOTT FELTÉTEL
            const hasValidPlayerName = playerName && 
                                      playerName.trim() !== '' && 
                                      playerName !== anonymousName && 
                                      playerName !== 'Névtelen' &&
                                      playerName !== 'Anonymous' &&
                                      playerName.length > 0;

            const isFirebaseReady = window.firebaseAPI && 
                                   typeof window.firebaseAPI.isReady === 'function' && 
                                   window.firebaseAPI.isReady();

            console.log('📊 Feltétel részletei:', {
                hasValidPlayerName: hasValidPlayerName,
                isFirebaseReady: isFirebaseReady,
                shouldSaveGlobally: hasValidPlayerName && isFirebaseReady
            });

            if (hasValidPlayerName) {
                console.log('👤 ✅ Érvényes játékos név megvan');
                
                if (isFirebaseReady) {
                    console.log('🔥 ✅ Firebase elérhető - globális mentés indítása...');
                    
                    try {
                        let globalSaveSuccess = false;
                        
                        // ✅ LEADERBOARD MANAGER MENTÉS
                        if (app && app.leaderboardManager && typeof app.leaderboardManager.saveGlobalScore === 'function') {
                            console.log('📤 LeaderboardManager globális mentés...');
                            
                            await app.leaderboardManager.saveGlobalScore(
                                playerName,
                                roundedScore,
                                window.gameEngine ? window.gameEngine.getDifficulty() : 'easy',
                                transformationName
                            );
                            
                            globalSaveSuccess = true;
                            console.log('✅ LeaderboardManager globális mentés sikeres!');
                            
                        } 
                        // ✅ KÖZVETLEN FIREBASE MENTÉS
                        // ✅ KÖZVETLEN FIREBASE MENTÉS BIZTONSÁGOS ADATOKKAL
                        else if (typeof window.firebaseAPI.saveScore === 'function') {
                            console.log('📤 Közvetlen Firebase mentés biztonságos adatokkal...');
                            
                            const difficulty = window.gameEngine ? window.gameEngine.getDifficulty() : 'easy';
                            const safeScoreData = window.createSafeScoreData(
                                playerName,
                                roundedScore,
                                difficulty,
                                transformationName
                            );
                            
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
                            
                            // Globális leaderboard frissítése ha aktív
                            const currentView = app?.leaderboardManager?.getCurrentView() || 'local';
                            console.log('📋 Jelenlegi leaderboard nézet:', currentView);
                            
                            if (currentView === 'global') {
                                console.log('🔄 Globális leaderboard frissítése...');
                                setTimeout(() => {
                                    if (typeof loadGlobalLeaderboardDirect === 'function') {
                                        loadGlobalLeaderboardDirect();
                                    } else if (app?.leaderboardManager?.loadGlobalLeaderboard) {
                                        app.leaderboardManager.loadGlobalLeaderboard();
                                    }
                                }, 2000);
                            }
                        }

                    } catch (error) {
                        console.error('❌ Globális mentés sikertelen:', error);
                        
                        // Részletes hibaüzenet
                        let errorMessage = 'Ismeretlen hiba';
                        if (error.code === 'permission-denied') {
                            errorMessage = 'Nincs jogosultság a mentéshez (Firestore Rules hiba)';
                        } else if (error.code === 'unavailable') {
                            errorMessage = 'Firebase szerver nem elérhető';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }
                        
                        // Felhasználó értesítése
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
                    if (typeof loadLocalLeaderboardDirect === 'function') {
                        loadLocalLeaderboardDirect(savedScore?.id);
                    } else if (app?.leaderboardManager?.loadLocalLeaderboard) {
                        app.leaderboardManager.loadLocalLeaderboard(savedScore?.id);
                    }
                }, 100);
            }

            console.log('✅ Mentési folyamat befejezve');
        }, 500);
    }

    console.log('✅ showScore befejezve');
};


// Biztonságos inicializálás - többszörös próbálkozással
let initAttempts = 0;
const maxInitAttempts = 5;

function safeInit() {
    initAttempts++;

    if (document.readyState === 'loading') {
        // DOM még nem töltődött be
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

// Firebase státusz frissítő függvény override - biztonságos
window.updateFirebaseStatus = (status, message) => {
    const statusEl = document.getElementById('firebaseStatus');
    const offlineNotice = document.getElementById('offlineNotice');

    if (!statusEl) return;

    statusEl.className = `firebase-status ${status}`;

    // Biztonságos lokalizált státusz szövegek
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

// Transzformáció szöveg frissítő függvény - biztonságos
window.updateTransformationText = (transformationName, emoji) => {
    const transformationText = document.getElementById('transformationText');
    if (transformationText && window.perfectCircleApp) {
        transformationText.textContent = window.perfectCircleApp.getTransformationText(transformationName, emoji);
    }
};

// Globális hibakezelő - biztonságos
window.addEventListener('error', (e) => {
    console.error('💥 Globális hiba:', e.error);

    // Kritikus hibák esetén user-friendly üzenet
    if (e.error && e.error.message) {
        const app = window.perfectCircleApp;
        const userMessage = app ?
            app.t('errors.criticalError') :
            'Kritikus hiba történt. Kérlek frissítsd az oldalt.';

        // Csak akkor mutatunk alert-et, ha ez valóban kritikus hiba
        if (e.error.message.includes('i18n') || e.error.message.includes('firebase')) {
            setTimeout(() => {
                alert(userMessage + '\n\n' + e.error.message);
            }, 1000);
        }
    }
});

// Hibakeresési függvény
window.debugLeaderboard = () => {
    console.log('🔍 Leaderboard hibakeresés:');
    console.log('- perfectCircleApp:', !!window.perfectCircleApp);
    console.log('- leaderboardManager:', !!window.perfectCircleApp?.leaderboardManager);
    console.log('- switchLeaderboard függvény:', typeof window.switchLeaderboard);
    console.log('- loadGlobalLeaderboard függvény:', typeof window.loadGlobalLeaderboard);
    console.log('- loadLocalLeaderboard függvény:', typeof window.loadLocalLeaderboard);
    
    // Tab gombok ellenőrzése
    const localTab = document.getElementById('localTab');
    const globalTab = document.getElementById('globalTab');
    console.log('- localTab elem:', !!localTab);
    console.log('- globalTab elem:', !!globalTab);
    
    if (localTab) console.log('- localTab onclick:', localTab.onclick);
    if (globalTab) console.log('- globalTab onclick:', globalTab.onclick);
};

// HIÁNYZÓ KÖZVETLEN LEADERBOARD BETÖLTŐ FÜGGVÉNYEK

// KÖZVETLEN HELYI LEADERBOARD BETÖLTŐ
function loadLocalLeaderboardDirect(highlightId = null) {
    console.log('📱 Közvetlen helyi leaderboard betöltés...');
    
    const statusEl = document.getElementById('leaderboardStatus');
    const leaderboardList = document.getElementById('leaderboardList');
    
    try {
        const scores = window.ScoreManager ? window.ScoreManager.getScores() : [];
        
        // Státusz frissítése
        if (statusEl) {
            const app = window.perfectCircleApp;
            const gamesText = app ? app.t('common.games') : 'játék';
            statusEl.textContent = `📱 Helyi eredmények (${scores.length} ${gamesText})`;
        }
        
        // Eredmények megjelenítése
        if (leaderboardList) {
            if (scores.length === 0) {
                const app = window.perfectCircleApp;
                const noResultsText = app ? app.t('leaderboard.noResults') : 'Még nincsenek eredmények';
                leaderboardList.innerHTML = `<div class="score-entry"><span>${noResultsText}</span></div>`;
            } else {
                leaderboardList.innerHTML = scores.map((score, index) => {
                    const isHighlighted = score.id === highlightId;
                    const difficultyEmoji = { easy: '🟢😊', hard: '🔴🌀' };
                    const transformationDisplay = score.transformation ? ` ✨${score.transformation}` : '';
                    
                    let rankClass = '';
                    if (index === 0) rankClass = 'rank-1';
                    else if (index < 3) rankClass = 'top-3';
                    
                    return `
                        <div class="score-entry ${isHighlighted ? 'current' : ''} ${rankClass}">
                            <span>${index + 1}. Te</span>
                            <span>${score.score} pont${transformationDisplay}</span>
                            <span>${difficultyEmoji[score.difficulty] || '🟢😊'} ${score.date}</span>
                        </div>
                    `;
                }).join('');
            }
        }
        
        console.log('✅ Helyi leaderboard betöltve');
        
    } catch (error) {
        console.error('❌ Helyi leaderboard hiba:', error);
        if (statusEl) {
            statusEl.textContent = '❌ Hiba a helyi eredmények betöltésekor';
        }
        if (leaderboardList) {
            leaderboardList.innerHTML = '<div class="score-entry error"><span style="color: #ff6b6b;">❌ Hiba az eredmények betöltésekor</span></div>';
        }
    }
}

// KÖZVETLEN GLOBÁLIS LEADERBOARD BETÖLTŐ
async function loadGlobalLeaderboardDirect() {
    console.log('🌍 Közvetlen globális leaderboard betöltés...');
    
    const statusEl = document.getElementById('leaderboardStatus');
    const leaderboardList = document.getElementById('leaderboardList');
    
    // Loading állapot
    if (statusEl) {
        statusEl.innerHTML = '<div class="loading-spinner"></div> 🌍 Globális eredmények betöltése...';
    }
    
    if (leaderboardList) {
        leaderboardList.innerHTML = `
            <div class="score-entry">
                <div style="text-align: center; padding: 20px;">
                    <div class="loading-spinner" style="margin: 0 auto 10px;"></div>
                    <div>Globális eredmények betöltése...</div>
                </div>
            </div>
        `;
    }
    
    // ✅ JAVÍTÁS: Hosszabb várakozási idő Firebase-re
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
        // Firebase ellenőrzése
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            console.log(`🔄 Firebase nem elérhető, újracsatlakozási kísérlet ${retryCount + 1}/${maxRetries}...`);
            
            if (statusEl) {
                statusEl.innerHTML = `<div class="loading-spinner"></div> 🔄 Firebase kapcsolódás... (${retryCount + 1}/${maxRetries})`;
            }
            
            try {
                if (window.firebaseAPI && window.firebaseAPI.reconnect) {
                    await window.firebaseAPI.reconnect();
                }
                
                // ✅ JAVÍTÁS: Várunk egy kicsit hogy Firebase felépüljön
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (window.firebaseAPI && window.firebaseAPI.isReady()) {
                    console.log('✅ Firebase kapcsolódás sikeres!');
                    break; // Kilépés a ciklusból
                }
                
            } catch (error) {
                console.error(`❌ Firebase kapcsolódási hiba (${retryCount + 1}. kísérlet):`, error);
            }
            
            retryCount++;
            
            if (retryCount < maxRetries) {
                // Várunk mielőtt újrapróbáljuk
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } else {
            // Firebase már elérhető
            break;
        }
    }
    
    // Ha még mindig nem elérhető Firebase
    if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
        console.error('❌ Firebase véglegesen nem elérhető');
        
        if (statusEl) {
            statusEl.textContent = '❌ Firebase nem elérhető - Ellenőrizd a Firestore Rules-t';
        }
        
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="score-entry error">
                    <div style="text-align: center; padding: 20px;">
                        <div style="color: #ff6b6b; font-size: 1.1em;">❌ Firebase nem elérhető</div>
                        <div style="color: #666; margin-top: 5px; font-size: 0.9em;">
                            Ellenőrizd a Firestore Rules beállításokat vagy próbáld később
                        </div>
                        <button onclick="switchLeaderboard('local')" style="margin-top: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            📱 Helyi eredmények megtekintése
                        </button>
                    </div>
                </div>
            `;
        }
        return;
    }
    
    // Globális eredmények betöltése
    try {
        console.log('📊 Globális pontszámok lekérdezése...');
        
        if (statusEl) {
            statusEl.innerHTML = '<div class="loading-spinner"></div> 📊 Eredmények lekérdezése...';
        }
        
        const scores = await window.firebaseAPI.getTopScores(10);
        
        console.log('📊 Kapott eredmények:', scores);
        
        // Státusz frissítése
        if (statusEl) {
            const app = window.perfectCircleApp;
            const playersText = app ? app.t('common.players') : 'játékos';
            statusEl.textContent = `🌍 Globális toplista (${scores.length} ${playersText})`;
        }
        
        // Eredmények megjelenítése
        if (leaderboardList) {
            if (scores.length === 0) {
                leaderboardList.innerHTML = `
                    <div class="score-entry">
                        <div style="text-align: center; padding: 20px;">
                            <div>🌍 Még nincsenek globális eredmények</div>
                            <div style="color: #666; margin-top: 5px; font-size: 0.9em;">
                                Légy te az első aki feltölti az eredményét!
                            </div>
                        </div>
                    </div>
                `;
            } else {
                leaderboardList.innerHTML = scores.map((score, index) => {
                    // ✅ JAVÍTÁS: Név biztonságos kezelése
                    let playerName = 'Névtelen';
                    if (score.playerName && score.playerName.trim()) {
                        playerName = score.playerName.trim();
                    } else if (score.name && score.name.trim()) {
                        playerName = score.name.trim();
                    }
                    
                    // ✅ JAVÍTÁS: Pontszám biztonságos kezelése
                    const scoreValue = score.score || 0;
                    
                    // ✅ JAVÍTÁS: Dátum biztonságos kezelése
                    let dateStr = 'Ismeretlen dátum';
                    
                    try {
                        if (score.date && score.date !== '') {
                            // Ha már formázott dátum string
                            dateStr = score.date;
                        } else if (score.timestamp) {
                            // Ha timestamp
                            const date = new Date(score.timestamp);
                            if (!isNaN(date.getTime())) {
                                dateStr = date.toLocaleDateString('hu-HU');
                            }
                        } else if (score.created) {
                            // Ha created field
                            const date = new Date(score.created);
                            if (!isNaN(date.getTime())) {
                                dateStr = date.toLocaleDateString('hu-HU');
                            }
                        } else {
                            // Fallback - mai dátum
                            dateStr = new Date().toLocaleDateString('hu-HU');
                        }
                    } catch (error) {
                        console.warn('❌ Dátum feldolgozási hiba:', error, score);
                        dateStr = 'Hibás dátum';
                    }
                    
                    // ✅ JAVÍTÁS: Nehézség biztonságos kezelése
                    const difficulty = score.difficulty || 'easy';
                    const difficultyEmoji = { 
                        easy: '🟢😊', 
                        hard: '🔴🌀' 
                    };
                    const difficultyDisplay = difficultyEmoji[difficulty] || '🟢😊';
                    
                    // ✅ JAVÍTÁS: Transzformáció biztonságos kezelése
                    let transformationDisplay = '';
                    if (score.transformation && score.transformation.trim() !== '') {
                        transformationDisplay = ` ✨${score.transformation.trim()}`;
                    }
                    
                    // Rangsor
                    let rankClass = '';
                    let rankEmoji = '';
                    if (index === 0) {
                        rankClass = 'rank-1';
                        rankEmoji = '🥇 ';
                    } else if (index === 1) {
                        rankClass = 'top-3';
                        rankEmoji = '🥈 ';
                    } else if (index === 2) {
                        rankClass = 'top-3';
                        rankEmoji = '🥉 ';
                    }
                    
                    return `
                        <div class="score-entry ${rankClass}">
                            <span>${rankEmoji}${index + 1}. ${playerName}</span>
                            <span>${scoreValue} pont${transformationDisplay}</span>
                            <span>${difficultyDisplay} ${dateStr}</span>
                        </div>
                    `;
                }).join('');
            }
        }
        
        console.log('✅ Globális leaderboard betöltve');
        
    } catch (error) {
        console.error('❌ Globális leaderboard betöltési hiba:', error);
        
        if (statusEl) {
            if (error.message && error.message.includes('permission-denied')) {
                statusEl.textContent = '❌ Firestore Rules hiba - Kattints a Firebase státuszra a megoldásért';
            } else if (error.code === 'unavailable') {
                statusEl.textContent = '❌ Firebase szerver nem elérhető - Próbáld később';
            } else {
                statusEl.textContent = '❌ Globális eredmények betöltési hiba';
            }
        }
        
        if (leaderboardList) {
            let errorMessage = 'Ismeretlen hiba';
            
            if (error.message) {
                if (error.message.includes('permission-denied')) {
                    errorMessage = 'Firestore Rules beállítási hiba';
                } else if (error.message.includes('unavailable')) {
                    errorMessage = 'Firebase szerver nem elérhető';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Hálózati kapcsolat hiba';
                } else {
                    errorMessage = error.message;
                }
            }
            
            leaderboardList.innerHTML = `
                <div class="score-entry error">
                    <div style="text-align: center; padding: 20px;">
                        <div style="color: #ff6b6b; font-size: 1.1em;">❌ Globális eredmények nem elérhetők</div>
                        <div style="color: #666; margin-top: 5px; font-size: 0.9em;">
                            ${errorMessage}
                        </div>
                        <div style="margin-top: 10px;">
                            <button onclick="loadGlobalLeaderboardDirect()" style="margin: 5px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                🔄 Újrapróbálás
                            </button>
                            <button onclick="switchLeaderboard('local')" style="margin: 5px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                📱 Helyi eredmények
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// JAVÍTOTT switchLeaderboard függvény - egyszerűsített verzió
window.switchLeaderboard = (type) => {
    console.log(`🔄 switchLeaderboard hívás: ${type}`);
    
    // Tab gombok azonnali frissítése
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(type + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Státusz frissítése azonnal
    const statusEl = document.getElementById('leaderboardStatus');
    if (statusEl) {
        if (type === 'local') {
            statusEl.textContent = '📱 Helyi eredmények betöltése...';
        } else {
            statusEl.innerHTML = '<div class="loading-spinner"></div> 🌍 Globális eredmények betöltése...';
        }
    }
    
    // Leaderboard betöltése
    if (type === 'local') {
        loadLocalLeaderboardDirect();
    } else {
        loadGlobalLeaderboardDirect();
    }
};

// JAVÍTOTT EREDETI FÜGGVÉNYEK - átirányítás az új függvényekre
function loadLocalLeaderboard(highlightId = null) {
    console.log('📱 loadLocalLeaderboard hívás - átirányítás közvetlen betöltőre');
    loadLocalLeaderboardDirect(highlightId);
}

async function loadGlobalLeaderboard() {
    console.log('🌍 loadGlobalLeaderboard hívás - átirányítás közvetlen betöltőre');
    await loadGlobalLeaderboardDirect();
}

// CSS javítás a loading spinner-hez - ha még nincs benne
const style = document.createElement('style');
style.textContent = `
.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #4fc3f7;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
    vertical-align: middle;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.score-entry.error {
    background: rgba(255, 107, 107, 0.1);
    border-left-color: #ff6b6b;
}

.score-entry.loading {
    background: rgba(79, 195, 247, 0.1);
    border-left-color: #4fc3f7;
}
`;
document.head.appendChild(style);
