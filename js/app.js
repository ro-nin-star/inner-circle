// Fő alkalmazás inicializáló és koordinátor - Biztonságos verzió
class PerfectCircleApp {
    constructor() {
        this.initialized = false;
        this.playerName = '';
        this.currentLanguage = 'en';
        this.initAttempts = 0;
        this.maxInitAttempts = 10;
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
            
            // Leaderboard inicializálása
            if (window.LeaderboardManager && typeof window.LeaderboardManager.loadLocalLeaderboard === 'function') {
                window.LeaderboardManager.loadLocalLeaderboard();
            } else {
                console.warn('⚠️ LeaderboardManager nem elérhető');
            }
            
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
            'scoreTitle.tryAgain': '💪 Próbáld újra!'
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
        if (window.LeaderboardManager && window.LeaderboardManager.getCurrentView) {
            if (window.LeaderboardManager.getCurrentView() === 'local') {
                window.LeaderboardManager.loadLocalLeaderboard();
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
        // Leaderboard dátumok frissítése ha szükséges
        const scoreEntries = document.querySelectorAll('.score-entry');
        scoreEntries.forEach(entry => {
            const dateSpan = entry.querySelector('span:last-child');
            if (dateSpan && (dateSpan.textContent.includes('/') || dateSpan.textContent.includes('.'))) {
                // Dátum formátum frissítése
            }
        });
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
                    if (window.LeaderboardManager) {
                        window.LeaderboardManager.exportLeaderboard();
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
            audioBtn.innerHTML = this.t('audio.enabled');
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
            themeBtn.innerHTML = this.t('theme.dark');
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
                this.exportScores();
                break;
            case '2':
                this.importScores();
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
                        if (window.LeaderboardManager) {
                            window.LeaderboardManager.refreshCurrentView();
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
                if (window.LeaderboardManager) {
                    window.LeaderboardManager.refreshCurrentView();
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

// Score megjelenítő függvény - biztonságos
window.showScore = async (score, analysis, transformationName = '') => {
    // UI frissítés
    const elements = {
        currentScore: document.getElementById('currentScore'),
        finalScore: document.getElementById('finalScore'),
        scoreTitle: document.getElementById('scoreTitle'),
        scoreBreakdown: document.getElementById('scoreBreakdown')
    };
    
    if (elements.currentScore) elements.currentScore.textContent = Math.round(score);
    if (elements.finalScore) elements.finalScore.textContent = Math.round(score);
    
    // Lokalizált cím beállítása
    let title = '👍 Jó munka!'; // Fallback
    if (window.perfectCircleApp) {
        title = window.perfectCircleApp.getScoreTitle(score);
    }
    if (elements.scoreTitle) elements.scoreTitle.textContent = title;

    // Részletes pontszám megjelenítése - biztonságos
    if (!analysis.error && elements.scoreBreakdown) {
        const app = window.perfectCircleApp;
        const localizedTransformation = transformationName && app ? 
            app.t('scoreBreakdown.transformation', {
                name: app.t(`transformations.${transformationName.toLowerCase()}`) || transformationName
            }) : '';
            
        elements.scoreBreakdown.innerHTML = `
            <div class="breakdown-item">
                <strong>${app ? app.t('scoreBreakdown.shape') : 'Köralak'}</strong><br>
                ${analysis.shapeScore}/40 ${app ? app.t('common.points') : 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${app ? app.t('scoreBreakdown.closure') : 'Záródás'}</strong><br>
                ${analysis.closureScore}/20 ${app ? app.t('common.points') : 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${app ? app.t('scoreBreakdown.smoothness') : 'Egyenletesség'}</strong><br>
                ${analysis.smoothnessScore}/25 ${app ? app.t('common.points') : 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${app ? app.t('scoreBreakdown.size') : 'Méret'}</strong><br>
                ${analysis.sizeScore}/15 ${app ? app.t('common.points') : 'pont'}
            </div>
            ${localizedTransformation ? `<div class="breakdown-item" style="grid-column: 1/-1; background: rgba(255,215,0,0.3);"><strong>${localizedTransformation}</strong></div>` : ''}
        `;
    } else if (analysis.error && elements.scoreBreakdown) {
        const app = window.perfectCircleApp;
        const errorMsg = app ? app.t(`errors.${analysis.error}`) || analysis.error : analysis.error;
        elements.scoreBreakdown.innerHTML = `
            <div style="color: #ff6b6b; font-weight: bold;">${errorMsg}</div>
        `;
    }

    // Score display megjelenítése
    if (window.EffectsManager) {
        window.EffectsManager.showScoreAnimation();
    }

    if (!analysis.error && score > 0) {
        setTimeout(() => {
            if (window.EffectsManager) {
                window.EffectsManager.celebrateScore(score);
            }
            if (window.AudioManager && window.AudioManager.playCheerSound) {
                window.AudioManager.playCheerSound(score);
            }
        }, 500);
        
        // Helyi mentés
        let savedScore = null;
        if (window.ScoreManager) {
            savedScore = window.ScoreManager.saveScore(score, analysis, 
                window.gameEngine ? window.gameEngine.getDifficulty() : 'easy', 
                transformationName
            );
        }
        
        if (window.perfectCircleApp) {
            window.perfectCircleApp.updateStats();
        }
        
        // Globális mentés megkísérlése
        const playerName = window.perfectCircleApp ? window.perfectCircleApp.getPlayerName() : 'Névtelen';
        const anonymousName = window.perfectCircleApp ? 
            (window.perfectCircleApp.t('player.anonymous') || 'Névtelen') : 
            'Névtelen';
        
        if (playerName !== anonymousName && window.firebaseAPI && window.firebaseAPI.isReady()) {
            try {
                if (window.LeaderboardManager) {
                    await window.LeaderboardManager.saveGlobalScore(
                        playerName, 
                        Math.round(score), 
                        window.gameEngine ? window.gameEngine.getDifficulty() : 'easy', 
                        transformationName
                    );
                    console.log('✅ Pontszám mentve globálisan!');
                    
                    if (window.LeaderboardManager.getCurrentView() === 'global') {
                        setTimeout(() => window.LeaderboardManager.loadGlobalLeaderboard(), 1000);
                    }
                }
            } catch (error) {
                console.warn('❌ Globális mentés sikertelen:', error);
            }
        } else if (playerName !== anonymousName) {
            console.log('📴 Firebase offline - globális mentés kihagyva');
        }
        
        // Leaderboard frissítése
        if (window.LeaderboardManager && window.LeaderboardManager.getCurrentView() === 'local') {
            window.LeaderboardManager.loadLocalLeaderboard(savedScore?.id);
        }
    }
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

console.log('✅ App.js betöltve - Biztonságos inicializálás');
