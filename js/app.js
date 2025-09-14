// Fő alkalmazás inicializáló és koordinátor - Nemzetköziesített verzió
class PerfectCircleApp {
    constructor() {
        this.initialized = false;
        this.playerName = '';
        this.currentLanguage = 'en';
    }
    
    async init() {
        if (this.initialized) {
            console.warn('Alkalmazás már inicializálva');
            return;
        }
        
        console.log('🎮 Perfect Circle alkalmazás inicializálása...');
        
        try {
            // I18n inicializálása ELŐSZÖR
            await window.i18nManager.init();
            this.currentLanguage = window.i18nManager.getCurrentLanguage();
            
            // Nyelv változás esemény figyelése
            window.addEventListener('languageChanged', (e) => {
                this.onLanguageChanged(e.detail);
            });
            
            // Alapvető inicializálás
            this.loadPlayerName();
            this.updateStats();
            
            // Látogatásszámláló indítása
            await VisitorCounter.init();
            
            // Leaderboard inicializálása
            LeaderboardManager.loadLocalLeaderboard();
            
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
        }
    }
    
    onLanguageChanged(detail) {
        console.log(`🌍 Language changed to: ${detail.language}`);
        this.currentLanguage = detail.language;
        
        // Statisztikák frissítése új nyelvvel
        this.updateStats();
        
        // Leaderboard frissítése
        if (LeaderboardManager.getCurrentView() === 'local') {
            LeaderboardManager.loadLocalLeaderboard();
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
            nameInput.placeholder = window.i18nManager.t('player.placeholder');
        }
    }
    
    updateDifficultyButtons() {
        const easyBtn = document.querySelector('[data-difficulty="easy"]');
        const hardBtn = document.querySelector('[data-difficulty="hard"]');
        
        if (easyBtn) easyBtn.textContent = window.i18nManager.t('difficulty.easy');
        if (hardBtn) hardBtn.textContent = window.i18nManager.t('difficulty.hard');
    }
    
    updateDynamicElements() {
        // Firebase státusz frissítése
        const firebaseStatus = document.getElementById('firebaseStatus');
        if (firebaseStatus) {
            const currentClass = firebaseStatus.className;
            if (currentClass.includes('online')) {
                firebaseStatus.textContent = window.i18nManager.t('firebase.online');
            } else if (currentClass.includes('offline')) {
                firebaseStatus.textContent = window.i18nManager.t('firebase.offline');
            } else if (currentClass.includes('connecting')) {
                firebaseStatus.textContent = window.i18nManager.t('firebase.connecting');
            } else if (currentClass.includes('error')) {
                firebaseStatus.textContent = window.i18nManager.t('firebase.error');
            }
        }
        
        // Offline notice frissítése
        const offlineNotice = document.getElementById('offlineNotice');
        if (offlineNotice) {
            offlineNotice.innerHTML = window.i18nManager.t('firebase.offlineNotice');
        }
    }
    
    refreshLeaderboardDates() {
        const scoreEntries = document.querySelectorAll('.score-entry');
        scoreEntries.forEach(entry => {
            const dateSpan = entry.querySelector('span:last-child');
            if (dateSpan && dateSpan.textContent.includes('/') || dateSpan.textContent.includes('.')) {
                // Itt frissíthetnénk a dátum formátumokat, ha szükséges
                // Jelenleg a dátumok már a helyes formátumban vannak mentve
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
                const message = window.i18nManager.t('warnings.gameInProgress') || 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
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
                    LeaderboardManager.exportLeaderboard();
                    break;
                case 'l': // Language selector toggle
                    e.preventDefault();
                    if (window.i18nManager) {
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
        // Audio toggle gomb hozzáadása
        this.addAudioToggleButton();
        
        // Téma váltó gomb hozzáadása
        this.addThemeToggleButton();
        
        // Fejlett funkciók gomb hozzáadása
        this.addAdvancedFeaturesButton();
        
        // Nyelv információs gomb hozzáadása
        this.addLanguageInfoButton();
    }
    
    addAudioToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('audioToggleBtn')) {
            const audioBtn = document.createElement('button');
            audioBtn.id = 'audioToggleBtn';
            audioBtn.innerHTML = window.i18nManager.t('audio.enabled');
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
            themeBtn.innerHTML = window.i18nManager.t('theme.dark');
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
            advancedBtn.innerHTML = '⚙️ ' + (window.i18nManager.t('advanced.title').replace('⚙️ ', '') || 'Fejlett');
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
            langBtn.innerHTML = '🌍 ' + window.i18nManager.getCurrentLanguage().toUpperCase();
            langBtn.onclick = this.showLanguageInfo.bind(this);
            langBtn.title = 'Language information';
            controls.appendChild(langBtn);
        }
    }
    
    toggleAudio() {
        const isEnabled = AudioManager.isEnabled();
        AudioManager.setEnabled(!isEnabled);
        
        const audioBtn = document.getElementById('audioToggleBtn');
        if (audioBtn) {
            audioBtn.innerHTML = isEnabled ? 
                window.i18nManager.t('audio.disabled') : 
                window.i18nManager.t('audio.enabled');
        }
        
        // Teszt hang lejátszása ha bekapcsoljuk
        if (!isEnabled) {
            AudioManager.playSuccessSound();
        }
        
        const message = isEnabled ? 
            window.i18nManager.t('audio.disabledMessage') : 
            window.i18nManager.t('audio.enabledMessage');
        alert(message);
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? 
                window.i18nManager.t('theme.light') : 
                window.i18nManager.t('theme.dark');
        }
        
        // Téma mentése
        localStorage.setItem('perfectcircle_theme', isDark ? 'dark' : 'light');
        
        const message = isDark ? 
            window.i18nManager.t('theme.darkEnabled') : 
            window.i18nManager.t('theme.lightEnabled');
        alert(message);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('perfectcircle_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.innerHTML = window.i18nManager.t('theme.light');
            }
        }
    }
    
    showLanguageInfo() {
        const currentLang = window.i18nManager.getCurrentLanguage();
        const supportedLangs = window.i18nManager.getSupportedLanguages();
        
        const info = `🌍 ${window.i18nManager.t('language.info') || 'NYELVI INFORMÁCIÓK'}

📍 ${window.i18nManager.t('language.current') || 'Jelenlegi nyelv'}: ${currentLang.toUpperCase()}
🎯 ${window.i18nManager.t('language.detected') || 'Automatikusan felismert'}

🗣️ ${window.i18nManager.t('language.supported') || 'Támogatott nyelvek'}:
${supportedLangs.map(lang => 
    `${LanguageDetector.getLanguageFlag(lang.code)} ${lang.nativeName} (${lang.code})`
).join('\n')}

⌨️ ${window.i18nManager.t('language.shortcuts') || 'Billentyű parancsok'}:
• Ctrl+L: ${window.i18nManager.t('language.toggleMenu') || 'Nyelv menü'}
• ${window.i18nManager.t('language.clickFlag') || 'Kattints a zászlóra a váltáshoz'}

🔄 ${window.i18nManager.t('language.autoSave') || 'A nyelvválasztás automatikusan mentődik'}`;
        
        alert(info);
    }
    
    showAdvancedFeatures() {
        const features = window.i18nManager.t('advanced.features') || `
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
        const menuText = window.i18nManager.t('advanced.menu') || `
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
                window.showVisitStats();
                break;
            case '4':
                window.showFirebaseInfo();
                break;
            case '5':
                this.clearAllData();
                break;
            case '6':
                alert(window.i18nManager.t('advanced.openConsole') || 'Nyomd meg F12-t a fejlesztői konzol megnyitásához!');
                break;
            case '7':
                this.runPerformanceTest();
                break;
            case '8':
                this.showLanguageInfo();
                break;
            case '9':
                window.i18nManager.toggleLanguageMenu();
                break;
            default:
                if (action !== null) {
                    alert(window.i18nManager.t('advanced.invalidChoice') || 'Érvénytelen választás!');
                }
        }
    }
    
    exportScores() {
        try {
            const data = ScoreManager.exportScores();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = window.i18nManager.formatDate(new Date(), { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
            a.download = `perfect-circle-results-${date}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            alert(window.i18nManager.t('advanced.exportSuccess'));
        } catch (error) {
            alert(window.i18nManager.t('advanced.exportError') + ': ' + error.message);
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
                    const result = ScoreManager.importScores(e.target.result);
                    if (result.success) {
                        const message = window.i18nManager.t('advanced.importSuccess', {
                            imported: result.imported,
                            total: result.total
                        });
                        alert(message);
                        this.updateStats();
                        LeaderboardManager.refreshCurrentView();
                    } else {
                        const errorMsg = window.i18nManager.t('advanced.importError') + ': ' + result.error;
                        alert(errorMsg);
                    }
                } catch (error) {
                    const fileErrorMsg = window.i18nManager.t('advanced.fileError') + ': ' + error.message;
                    alert(fileErrorMsg);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    clearAllData() {
        const confirmMsg = window.i18nManager.t('advanced.clearAllConfirm');
        if (confirm(confirmMsg)) {
            try {
                ScoreManager.clearScores();
                localStorage.removeItem('perfectcircle_playername');
                localStorage.removeItem('perfectcircle_theme');
                VisitorCounter.resetLocalCounter();
                
                this.updateStats();
                LeaderboardManager.refreshCurrentView();
                
                alert(window.i18nManager.t('advanced.allDataCleared'));
            } catch (error) {
                const errorMsg = window.i18nManager.t('advanced.clearError') + ': ' + error.message;
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
        const analysis = CircleAnalyzer.analyzeCircle(testPoints, 'easy');
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const result = window.i18nManager.t('advanced.performanceResult', {
            duration: duration.toFixed(2),
            score: analysis.totalScore,
            points: testPoints.length,
            memory: (performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2) || 'N/A',
            performance: duration < 50 ? 
                (window.i18nManager.t('advanced.excellentPerf') || '✅ Kiváló teljesítmény!') : 
                duration < 100 ? 
                (window.i18nManager.t('advanced.goodPerf') || '👍 Jó teljesítmény') : 
                (window.i18nManager.t('advanced.slowPerf') || '⚠️ Lassú teljesítmény')
        }) || `
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
            alert(window.i18nManager.t('errors.invalidName'));
            return false;
        }
        
        if (name.length > 20) {
            alert(window.i18nManager.t('errors.nameTooLong'));
            return false;
        }
        
        localStorage.setItem('perfectcircle_playername', name);
        this.playerName = name;
        
        const message = window.i18nManager.t('player.nameSaved', { name: name });
        alert(message);
        return true;
    }
    
    getPlayerName() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? nameInput.value.trim() : '';
        return name || this.playerName || window.i18nManager.t('player.anonymous') || 'Névtelen';
    }
    
    // Statisztikák frissítése - lokalizált
    updateStats() {
        const stats = ScoreManager.getStats();
        
        const elements = {
            bestScore: document.getElementById('bestScore'),
            averageScore: document.getElementById('averageScore'),
            gamesPlayed: document.getElementById('gamesPlayed'),
            currentScore: document.getElementById('currentScore')
        };
        
        if (elements.bestScore) elements.bestScore.textContent = window.i18nManager.formatNumber(stats.best);
        if (elements.averageScore) elements.averageScore.textContent = window.i18nManager.formatNumber(stats.average);
        if (elements.gamesPlayed) elements.gamesPlayed.textContent = window.i18nManager.formatNumber(stats.games);
        if (elements.currentScore && stats.games === 0) elements.currentScore.textContent = '0';
    }
    
    // Instrukciók megjelenítése - lokalizált
    showInstructions() {
        const instructions = window.i18nManager.t('fullInstructions');
        alert(instructions);
    }
    
    // Pontszám címek lokalizálása
    getScoreTitle(score) {
        if (score >= 95) return window.i18nManager.t('scoreTitle.perfect');
        else if (score >= 85) return window.i18nManager.t('scoreTitle.excellent');
        else if (score >= 70) return window.i18nManager.t('scoreTitle.good');
        else if (score >= 50) return window.i18nManager.t('scoreTitle.notBad');
        else return window.i18nManager.t('scoreTitle.tryAgain');
    }
    
    // Transzformáció szöveg lokalizálása
    getTransformationText(transformationName, emoji) {
        return window.i18nManager.t('transformations.transformText', {
            name: window.i18nManager.t(`transformations.${transformationName.toLowerCase()}`) || transformationName,
            emoji: emoji
        });
    }
    
    // Nyelv specifikus dátum formázás
    formatScoreDate(date) {
        if (typeof date === 'string') {
            // Ha már string formátumban van, próbáljuk parse-olni
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return window.i18nManager.formatDate(parsedDate, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
            return date; // Ha nem sikerül parse-olni, visszaadjuk az eredetit
        }
        
        return window.i18nManager.formatDate(date, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // Hibaüzenetek lokalizálása
    showError(errorKey, params = {}) {
        const message = window.i18nManager.t(`errors.${errorKey}`, params);
        alert(message);
    }
    
    // Siker üzenetek lokalizálása
    showSuccess(successKey, params = {}) {
        const message = window.i18nManager.t(`success.${successKey}`, params);
        alert(message);
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// Globális függvények a HTML-ből való híváshoz - lokalizált
window.savePlayerName = () => window.perfectCircleApp.savePlayerName();
window.getPlayerName = () => window.perfectCircleApp.getPlayerName();
window.showInstructions = () => window.perfectCircleApp.showInstructions();
window.clearAllScores = () => window.perfectCircleApp.clearAllData();
window.updateStats = () => window.perfectCircleApp.updateStats();

// Score megjelenítő függvény - lokalizált
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
    const title = window.perfectCircleApp.getScoreTitle(score);
    if (elements.scoreTitle) elements.scoreTitle.textContent = title;

    // Részletes pontszám megjelenítése - lokalizált
    if (!analysis.error && elements.scoreBreakdown) {
        const localizedTransformation = transformationName ? 
            window.i18nManager.t('scoreBreakdown.transformation', {
                name: window.i18nManager.t(`transformations.${transformationName.toLowerCase()}`) || transformationName
            }) : '';
            
        elements.scoreBreakdown.innerHTML = `
            <div class="breakdown-item">
                <strong>${window.i18nManager.t('scoreBreakdown.shape')}</strong><br>
                ${analysis.shapeScore}/40 ${window.i18nManager.t('common.points') || 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${window.i18nManager.t('scoreBreakdown.closure')}</strong><br>
                ${analysis.closureScore}/20 ${window.i18nManager.t('common.points') || 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${window.i18nManager.t('scoreBreakdown.smoothness')}</strong><br>
                ${analysis.smoothnessScore}/25 ${window.i18nManager.t('common.points') || 'pont'}
            </div>
            <div class="breakdown-item">
                <strong>${window.i18nManager.t('scoreBreakdown.size')}</strong><br>
                ${analysis.sizeScore}/15 ${window.i18nManager.t('common.points') || 'pont'}
            </div>
            ${localizedTransformation ? `<div class="breakdown-item" style="grid-column: 1/-1; background: rgba(255,215,0,0.3);"><strong>${localizedTransformation}</strong></div>` : ''}
        `;
    } else if (analysis.error && elements.scoreBreakdown) {
        elements.scoreBreakdown.innerHTML = `
            <div style="color: #ff6b6b; font-weight: bold;">${window.i18nManager.t(`errors.${analysis.error}`) || analysis.error}</div>
        `;
    }

    // Score display megjelenítése
    EffectsManager.showScoreAnimation();

    if (!analysis.error && score > 0) {
        setTimeout(() => {
            EffectsManager.celebrateScore(score);
            AudioManager.playCheerSound(score);
        }, 500);
        
        // Helyi mentés
        const savedScore = ScoreManager.saveScore(score, analysis, window.gameEngine.getDifficulty(), transformationName);
        window.perfectCircleApp.updateStats();
        
        // Globális mentés megkísérlése
        const playerName = window.perfectCircleApp.getPlayerName();
        const anonymousName = window.i18nManager.t('player.anonymous') || 'Névtelen';
        
        if (playerName !== anonymousName && window.firebaseAPI && window.firebaseAPI.isReady()) {
            try {
                await LeaderboardManager.saveGlobalScore(playerName, Math.round(score), window.gameEngine.getDifficulty(), transformationName);
                console.log('✅ Pontszám mentve globálisan!');
                
                if (LeaderboardManager.getCurrentView() === 'global') {
                    setTimeout(() => LeaderboardManager.loadGlobalLeaderboard(), 1000);
                }
            } catch (error) {
                console.warn('❌ Globális mentés sikertelen:', error);
            }
        } else if (playerName !== anonymousName) {
            console.log('📴 Firebase offline - globális mentés kihagyva');
        }
        
        // Leaderboard frissítése
        if (LeaderboardManager.getCurrentView() === 'local') {
            LeaderboardManager.loadLocalLeaderboard(savedScore?.id);
        }
    }
};

// Alkalmazás indítása amikor a DOM betöltődött
document.addEventListener('DOMContentLoaded', () => {
    window.perfectCircleApp.init();
});

// Téma betöltése - ez már az init()-ben van kezelve, de meghagyom kompatibilitás miatt
document.addEventListener('DOMContentLoaded', () => {
    // Ez már az app init()-ben történik meg
});

// Firebase státusz frissítő függvény override - lokalizált
window.updateFirebaseStatus = (status, message) => {
    const statusEl = document.getElementById('firebaseStatus');
    const offlineNotice = document.getElementById('offlineNotice');
    
    if (!statusEl) return;
    
    statusEl.className = `firebase-status ${status}`;
    
    // Lokalizált státusz szövegek
    switch(status) {
        case 'online':
            statusEl.innerHTML = window.i18nManager.t('firebase.online');
            if (offlineNotice) offlineNotice.classList.remove('show');
            break;
        case 'offline':
            statusEl.innerHTML = window.i18nManager.t('firebase.offline');
            if (offlineNotice) offlineNotice.classList.add('show');
            break;
        case 'connecting':
            statusEl.innerHTML = window.i18nManager.t('firebase.connecting');
            if (offlineNotice) offlineNotice.classList.remove('show');
            break;
        case 'error':
            statusEl.innerHTML = window.i18nManager.t('firebase.error');
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
    
    // Kritikus hibák esetén user-friendly üzenet
    if (e.error && e.error.message) {
        const userMessage = window.i18nManager ? 
            window.i18nManager.t('errors.criticalError') : 
            'Kritikus hiba történt. Kérlek frissítsd az oldalt.';
        
        // Csak akkor mutatunk alert-et, ha ez valóban kritikus hiba
        if (e.error.message.includes('i18n') || e.error.message.includes('firebase')) {
            setTimeout(() => {
                alert(userMessage + '\n\n' + e.error.message);
            }, 1000);
        }
    }
});
