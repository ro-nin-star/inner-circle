// js/app.js
import LeaderboardManager from './managers/leaderboardManager.js';
import ScoreManager from './managers/scoreManager.js';
import VisitorCounter from './managers/visitorCounter.js';
import GameEngine from './game/gameEngine.js';
import AudioManager from './utils/audioManager.js';
import EffectsManager from './utils/effectsManager.js';
import { firebaseAPI } from './firebase/firebase-config.js'; // Importáld a firebaseAPI-t
import i18nManager from './i18n/i18nManager.js'; // Feltételezem, hogy exportálod


class PerfectCircleApp {
    constructor() {
        this.initialized = false;
        this.playerName = '';
        this.currentLanguage = 'en'; // Alapértelmezett nyelv
        this.initAttempts = 0;
        this.maxInitAttempts = 10;
        
        // Modul példányok
        this.leaderboardManager = null;
        this.visitorCounter = null;
        this.gameEngine = null;
        this.audioManager = AudioManager; // Közvetlenül használjuk az exportált példányt
        this.effectsManager = EffectsManager; // Közvetlenül használjuk az exportált példányt
        this.i18nManager = i18nManager; // Közvetlenül használjuk az exportált példányt
    }

    async init() {
        if (this.initialized) {
            console.warn('Alkalmazás már inicializálva');
            return;
        }

        console.log('🎮 Perfect Circle alkalmazás inicializálása...');

        try {
            // I18n Manager inicializálása (elsőnek, hogy a t() elérhető legyen)
            await this.waitForI18nManager();
            if (this.i18nManager && typeof this.i18nManager.init === 'function') {
                await this.i18nManager.init();
                this.currentLanguage = this.i18nManager.getCurrentLanguage();
                console.log(`✅ I18n inicializálva - Nyelv: ${this.currentLanguage}`);
            } else {
                console.warn('⚠️ I18n Manager nem elérhető - folytatás alapértelmezett szövegekkel');
                this.currentLanguage = 'hu'; // Fallback
            }

            // Nyelv változás esemény figyelése
            if (this.i18nManager) {
                window.addEventListener('languageChanged', (e) => {
                    this.onLanguageChanged(e.detail);
                });
            }

            // Alapvető inicializálás
            this.loadPlayerName();
            this.updateStats();

            // Modulok inicializálása
            this.visitorCounter = new VisitorCounter(this); // Átadjuk az app példányát
            await this.visitorCounter.init();
            
            this.leaderboardManager = new LeaderboardManager(this); // Átadjuk az app példányát
            this.leaderboardManager.loadLocalLeaderboard(); // Betöltjük a helyi ranglistát
            
            this.gameEngine = new GameEngine(this); // Átadjuk az app példányát
            this.gameEngine.init();

            this.audioManager.updateAudioButtonUI(); // Frissíti a hang gomb állapotát betöltéskor

            // UI elemek inicializálása (ezek a gombok)
            this.initializeUI();

            // Téma betöltése
            this.loadTheme();

            // Eseményfigyelők beállítása (ez a lényeg!)
            this.setupEventListeners();

            this.initialized = true;
            console.log('✅ Perfect Circle alkalmazás sikeresen inicializálva');

        } catch (error) {
            console.error('❌ Alkalmazás inicializálási hiba:', error);
            this.initializeFallback(); // Fallback inicializálás
        }
    }

    // I18n Manager várakozás
    async waitForI18nManager() {
        return new Promise((resolve) => {
            const checkI18n = () => {
                this.initAttempts++;
                if (this.i18nManager && typeof this.i18nManager.init === 'function') {
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
            // Fallback eseményfigyelők - csak a legfontosabbak
            this.setupFallbackEventListeners();
            this.initializeUIFallback();
            this.loadTheme();
            this.initialized = true;
            console.log('✅ Fallback inicializálás sikeres');
        } catch (error) {
            console.error('❌ Fallback inicializálás is sikertelen:', error);
        }
    }

    setupFallbackEventListeners() {
        // Minimum eseményfigyelők fallback módban
        const startBtn = document.getElementById('startBtn');
        if (startBtn && this.gameEngine) startBtn.addEventListener('click', () => this.gameEngine.startDrawing());
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn && this.gameEngine) clearBtn.addEventListener('click', () => this.gameEngine.clearCanvas());
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) helpBtn.addEventListener('click', () => alert('Help text not available.'));
    }

    // Biztonságos szöveg lekérés (az i18nManager.t metódusát hívja, vagy fallback)
    t(key, params = {}) {
        if (this.i18nManager && typeof this.i18nManager.t === 'function') {
            return this.i18nManager.t(key, params);
        }

        // Fallback szövegek (az index.html-ből átemeltem ide)
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
            'errors.tooFewPoints': 'Túl kevés pont! Rajzolj egy teljes kört.',
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
            'transformations.sun': 'Nap',
            'transformations.pizza': 'Pizza',
            'transformations.donut': 'Donut',
            'transformations.moon': 'Hold',
            'transformations.earth': 'Földgömb',
            'transformations.ball': 'Labda',
            'transformations.clock': 'Óra',
            'transformations.flower': 'Virág',
            'transformations.emoji': 'Emoji',
            'transformations.cookie': 'Keksz',
            'transformation.magicText': 'A köröd {name}-átlakult! {emoji}',
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
            'firebase.offlineNotice': '⚠️ Offline mód: A globális ranglista nem elérhető. Az eredmények helyben mentődnek.',
            'visitors.label': 'Látogatások:',
            'visitors.statsTitle': 'LÁTOGATÁSI STATISZTIKÁK',
            'visitors.localCount': 'Helyi látogatások',
            'visitors.globalCount': 'Globális látogatások',
            'visitors.todayCount': 'Mai látogatások',
            'visitors.uniqueSessions': 'Egyedi munkamenetek',
            'visitors.recentVisits': 'LEGUTÓBBI LÁTOGATÁSOK',
            'errors.statsLoadError': 'Statisztikák betöltési hiba',
            'player.you': 'Te',
            'player.anonymous': 'Névtelen',
            'audio.enabled': 'Hang',
            'audio.disabled': 'Néma',
            'audio.enabledMessage': 'Hang bekapcsolva!',
            'audio.disabledMessage': 'Hang kikapcsolva!',
            'theme.dark': 'Sötét',
            'theme.light': 'Világos',
            'theme.darkEnabled': 'Sötét téma bekapcsolva!',
            'theme.lightEnabled': 'Világos téma bekapcsolva!',
            'advanced.title': 'Fejlett',
            'advanced.features': '⚙️ FEJLETT FUNKCIÓK\n\n...', // Részletesebb szöveg kell ide
            'advanced.menu': 'Válassz egy művelet:\n\n...', // Részletesebb szöveg kell ide
            'advanced.openConsole': 'Nyomd meg F12-t a fejlesztői konzol megnyitásához!',
            'advanced.invalidChoice': 'Érvénytelen választás!',
            'advanced.exportSuccess': 'Eredmények sikeresen exportálva!',
            'advanced.exportError': 'Hiba az eredmények exportálásakor.',
            'advanced.importSuccess': 'Eredmények sikeresen importálva: {imported} új, {total} összesen.',
            'advanced.fileError': 'Fájl olvasási hiba',
            'advanced.clearAllConfirm': 'Biztosan törölni szeretnéd az összes helyi adatot (eredmények, név, téma)?',
            'advanced.allDataCleared': 'Minden helyi adat törölve! ✅',
            'advanced.clearError': 'Hiba az adatok törlésekor.',
            'errors.notImplemented': 'Ez a funkció még nincs implementálva.',
            'errors.criticalError': 'Kritikus hiba történt. Kérlek frissítsd az oldalt.',
            'leaderboardExportSuccess': 'Eredmények sikeresen exportálva!',
            'leaderboardExportError': 'Hiba az eredmények exportálásakor.',
            'leaderboardImportSuccess': 'Eredmények sikeresen importálva: {imported} új, {total} összesen.',
            'leaderboardImportError': 'Hiba az eredmények importálásakor.',
            'leaderboardImportInvalidFormat': 'Érvénytelen import fájl formátum.',
            'leaderboardClearConfirm': 'Biztosan törölni szeretnéd az összes helyi eredményt?',
            'leaderboardCleared': 'Helyi eredmények törölve! ✅',
            'language.info': "NYELVI INFORMÁCIÓK",
            'language.current': "Jelenlegi nyelv",
            'language.detected': "Automatikusan felismert",
            'language.supported': "Támogatott nyelvek",
            'language.shortcuts': "Billentyű parancsok",
            'language.toggleMenu': "Nyelv menü",
            'language.clickFlag': "Kattints a zászlóra a váltáshoz",
            'language.autoSave': "A nyelvválasztás automatikusan mentődik"
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
        this.leaderboardManager?.refreshCurrentView();
        this.updatePlayerNamePlaceholder();
        this.updateDifficultyButtons();
        this.updateDynamicElements();
        // A dátum formátumok frissítését a leaderboardManager már kezeli
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
            const currentStatusClass = firebaseStatus.className.split(' ').find(cls => cls.startsWith('firebase-status')).replace('firebase-status ', '');
            firebaseStatus.textContent = this.t(`firebase.${currentStatusClass}`);
        }
        // Offline notice frissítése
        const offlineNotice = document.getElementById('offlineNotice');
        if (offlineNotice) {
            offlineNotice.innerHTML = this.t('firebase.offlineNotice');
        }
        // Audio és téma gombok frissítése (ha már léteznek)
        this.audioManager.updateAudioButtonUI();
        this.updateThemeButtonUI();
    }

    setupEventListeners() {
        // Ablak resize esemény (GameEngine kezeli)
        // Billentyűzet események
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        // Oldal elhagyása előtti figyelmeztetés
        window.addEventListener('beforeunload', (e) => {
            if (this.gameEngine && this.gameEngine.gameActive) {
                e.preventDefault();
                const message = this.t('warnings.gameInProgress') || 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
                e.returnValue = message;
                return e.returnValue;
            }
        });
        // Nyelv selector menü bezárása kattintásra (i18nManager kezeli)

        // ===== HTML-ből eltávolított onclick események JS-ben történő kezelése =====

        // Player Name mentése
        const saveNameBtn = document.getElementById('savePlayerNameBtn');
        if (saveNameBtn) saveNameBtn.addEventListener('click', () => this.savePlayerName());

        // Nehézségi gombok
        document.querySelectorAll('.difficulty-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const difficulty = event.target.dataset.difficulty;
                this.gameEngine?.setDifficulty(difficulty); // GameEngine-nek szólunk
                // UI frissítés az app.js-ben
                this.updateDifficultyButtonsUI(difficulty); 
            });
        });

        // Játékvezérlő gombok
        const startBtn = document.getElementById('startBtn');
        if (startBtn) startBtn.addEventListener('click', () => this.gameEngine?.startDrawing());
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.gameEngine?.clearCanvas());
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) helpBtn.addEventListener('click', () => this.showInstructions());
        const clearLocalScoresBtn = document.getElementById('clearLocalScoresBtn');
        if (clearLocalScoresBtn) clearLocalScoresBtn.addEventListener('click', () => this.clearAllData());

        // Leaderboard tab gombok
        document.querySelectorAll('.tab-btn[data-leaderboard-type]').forEach(button => {
            button.addEventListener('click', (event) => {
                const type = event.target.dataset.leaderboardType;
                this.leaderboardManager?.switchLeaderboard(type);
            });
        });

        // Visitor Counter kattintás
        const visitorCounterEl = document.getElementById('visitorCounter');
        if (visitorCounterEl) visitorCounterEl.addEventListener('click', () => this.visitorCounter?.showVisitStats());

        // Firebase Status kattintás
        const firebaseStatusEl = document.getElementById('firebaseStatus');
        if (firebaseStatusEl) firebaseStatusEl.addEventListener('click', () => firebaseAPI.showFirebaseInfo());

        // Debug gomb
        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) debugBtn.addEventListener('click', () => this.showAdvancedFeatures());

        // Egyéb dinamikus UI elemek (audio, téma, fejlett, nyelv info gombok)
        // Ezek a gombok dinamikusan hozzáadódnak az initializeUI metódusban,
        // majd az eseménykezelőket is ott adjuk hozzájuk.
    }

    updateDifficultyButtonsUI(activeDifficulty) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            if (btn.dataset.difficulty === activeDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'r': // Restart/Clear
                    e.preventDefault();
                    this.gameEngine?.clearCanvas();
                    break;
                case 's': // Start
                    e.preventDefault();
                    if (this.gameEngine && !this.gameEngine.gameActive) {
                        this.gameEngine.startDrawing();
                    }
                    break;
                case 'h': // Help
                    e.preventDefault();
                    this.showInstructions();
                    break;
                case 'e': // Export scores
                    e.preventDefault();
                    this.leaderboardManager?.exportLeaderboard();
                    break;
                case 'l': // Language selector toggle
                    e.preventDefault();
                    this.i18nManager?.toggleLanguageMenu();
                    break;
            }
        }
        switch(e.key) {
            case 'Escape':
                if (this.gameEngine && this.gameEngine.gameActive) {
                    this.gameEngine.clearCanvas();
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
        // Dinamikusan hozzáadott gombok
        this.addAudioToggleButton();
        this.addThemeToggleButton();
        this.addAdvancedFeaturesButton();
        this.addLanguageInfoButton();
    }

    initializeUIFallback() {
        // Fallback UI elemek (ha az i18nManager nem érhető el)
        const controls = document.querySelector('.controls');
        if (controls) {
            if (!document.getElementById('audioToggleBtn')) {
                const audioBtn = document.createElement('button');
                audioBtn.id = 'audioToggleBtn';
                audioBtn.innerHTML = '🔊 Hang';
                audioBtn.addEventListener('click', () => this.toggleAudio());
                controls.appendChild(audioBtn);
            }
            if (!document.getElementById('themeToggleBtn')) {
                const themeBtn = document.createElement('button');
                themeBtn.id = 'themeToggleBtn';
                themeBtn.innerHTML = '🌙 Sötét';
                themeBtn.addEventListener('click', () => this.toggleTheme());
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
            audioBtn.innerHTML = `🔊 ${this.t(this.audioManager.isEnabled() ? 'audio.enabled' : 'audio.disabled')}`;
            audioBtn.addEventListener('click', () => this.toggleAudio());
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
            themeBtn.innerHTML = `🌙 ${this.t(document.body.classList.contains('dark-theme') ? 'theme.light' : 'theme.dark')}`;
            themeBtn.addEventListener('click', () => this.toggleTheme());
            themeBtn.title = 'Theme toggle';
            controls.appendChild(themeBtn);
        }
    }

    updateThemeButtonUI() {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = `🌙 ${this.t(document.body.classList.contains('dark-theme') ? 'theme.light' : 'theme.dark')}`;
        }
    }

    addAdvancedFeaturesButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('advancedBtn')) {
            const advancedBtn = document.createElement('button');
            advancedBtn.id = 'advancedBtn';
            advancedBtn.setAttribute('data-i18n', 'advanced.title');
            advancedBtn.innerHTML = `⚙️ ${this.t('advanced.title').replace('⚙️ ', '')}`;
            advancedBtn.addEventListener('click', () => this.showAdvancedFeatures());
            advancedBtn.title = 'Advanced features';
            controls.appendChild(advancedBtn);
        }
    }

    addLanguageInfoButton() {
        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('languageInfoBtn')) {
            const langBtn = document.createElement('button');
            langBtn.id = 'languageInfoBtn';
            langBtn.innerHTML = `🌍 ${this.currentLanguage.toUpperCase()}`;
            langBtn.addEventListener('click', () => this.showLanguageInfo());
            langBtn.title = 'Language information';
            controls.appendChild(langBtn);
        }
    }

    toggleAudio() {
        const isEnabled = this.audioManager.isEnabled();
        this.audioManager.setEnabled(!isEnabled);
        const message = isEnabled ? this.t('audio.disabledMessage') : this.t('audio.enabledMessage');
        alert(message);
        if (!isEnabled) this.audioManager.playSuccessSound(); // Teszt hang
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        localStorage.setItem('perfectcircle_theme', isDark ? 'dark' : 'light');
        this.updateThemeButtonUI();
        const message = isDark ? this.t('theme.darkEnabled') : this.t('theme.lightEnabled');
        alert(message);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('perfectcircle_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        this.updateThemeButtonUI();
    }

    showLanguageInfo() {
        if (!this.i18nManager) {
            alert(this.t('errors.languageInfoNotAvailable')); // Lokalizált hibaüzenet
            return;
        }
        const currentLang = this.i18nManager.getCurrentLanguage();
        const supportedLangs = this.i18nManager.getSupportedLanguages();

        const info = `🌍 ${this.t('language.info')}\n\n` +
                     `📍 ${this.t('language.current')}: ${currentLang.toUpperCase()}\n` +
                     `🎯 ${this.t('language.detected')}\n\n` +
                     `🗣️ ${this.t('language.supported')}:\n` +
                     `${supportedLangs.map(lang => 
                         `${this.i18nManager.getLanguageFlag(lang.code) || '🌍'} ${lang.nativeName} (${lang.code})`
                     ).join('\n')}\n\n` +
                     `⌨️ ${this.t('language.shortcuts')}:\n` +
                     `• Ctrl+L: ${this.t('language.toggleMenu')}\n` +
                     `• ${this.t('language.clickFlag')}\n\n` +
                     `🔄 ${this.t('language.autoSave')}`;
        alert(info);
    }

    showAdvancedFeatures() {
        const features = this.t('advanced.features');
        if (confirm(features)) {
            this.showAdvancedMenu();
        }
    }

    showAdvancedMenu() {
        const menuText = this.t('advanced.menu');
        const action = prompt(menuText);

        switch(action) {
            case '1': this.leaderboardManager?.exportLeaderboard(); break;
            case '2': this.leaderboardManager?.importLeaderboard(); break;
            case '3': this.visitorCounter?.showVisitStats(); break;
            case '4': firebaseAPI.showFirebaseInfo(); break;
            case '5': this.clearAllData(); break;
            case '6': alert(this.t('advanced.openConsole')); break;
            case '7': this.runPerformanceTest(); break;
            case '8': this.showLanguageInfo(); break;
            case '9': this.i18nManager?.toggleLanguageMenu(); break;
            default: if (action !== null) alert(this.t('advanced.invalidChoice'));
        }
    }

    clearAllData() {
        if (confirm(this.t('advanced.clearAllConfirm'))) {
            try {
                ScoreManager.clearScores();
                localStorage.removeItem('perfectcircle_playername');
                localStorage.removeItem('perfectcircle_theme');
                this.visitorCounter?.resetLocalCounter();

                this.updateStats();
                this.leaderboardManager?.refreshCurrentView();

                alert(this.t('advanced.allDataCleared'));
            } catch (error) {
                alert(`${this.t('advanced.clearError')}: ${error.message}`);
            }
        }
    }

    runPerformanceTest() {
        console.log('🚀 Teljesítmény teszt indítása...');
        const startTime = performance.now();
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
        const analysis = CircleAnalyzer.analyzeCircle(testPoints, 'easy', this.gameEngine.difficultySettings);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const result = `
🚀 ${this.t('performance.title') || 'TELJESÍTMÉNY TESZT EREDMÉNY'}
⏱️ ${this.t('performance.runtime') || 'Futási idő'}: ${duration.toFixed(2)}ms
📊 ${this.t('performance.score') || 'Pontszám'}: ${analysis.totalScore}/100
🎯 ${this.t('performance.analyzedPoints') || 'Elemzett pontok'}: ${testPoints.length}
💾 ${this.t('performance.memoryUsage') || 'Memória használat'}: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2) || 'N/A'} MB
${duration < 50 ? `✅ ${this.t('performance.excellent')}` :
  duration < 100 ? `👍 ${this.t('performance.good')}` :
  `⚠️ ${this.t('performance.slow')}`}
        `;
        console.log(result);
        alert(result);
    }

    loadPlayerName() {
        const savedName = localStorage.getItem('perfectcircle_playername');
        if (savedName) {
            const nameInput = document.getElementById('playerName');
            if (nameInput) nameInput.value = savedName;
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
        alert(this.t('player.nameSaved', { name: name }));
        return true;
    }

    getPlayerName() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? nameInput.value.trim() : '';
        return name || this.playerName || this.t('player.anonymous');
    }

    updateStats() {
        const stats = ScoreManager.getStats();
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

    getScoreTitle(score) {
        if (score >= 95) return this.t('scoreTitle.perfect');
        else if (score >= 85) return this.t('scoreTitle.excellent');
        else if (score >= 70) return this.t('scoreTitle.good');
        else if (score >= 50) return this.t('scoreTitle.notBad');
        else return this.t('scoreTitle.tryAgain');
    }

    getTransformationText(transformationName, emoji) {
        return this.t('transformation.magicText', {
            name: this.t(`transformations.${transformationName.toLowerCase()}`) || transformationName,
            emoji: emoji
        });
    }

    // A showScore mostantól az app.js metódusa
    async showScore(score, analysis, transformationName = '', currentGameId) {
        console.log('📊 showScore hívva:', { score, analysis, transformationName, currentGameId });

        const elements = {
            scoreDisplay: document.getElementById('scoreDisplay'),
            currentScore: document.getElementById('currentScore'),
            finalScore: document.getElementById('finalScore'),
            scoreTitle: document.getElementById('scoreTitle'),
            scoreBreakdown: document.getElementById('scoreBreakdown'),
            idealCircleContainer: document.getElementById('idealCircleContainer')
        };

        if (elements.scoreDisplay) this.effectsManager.showScoreAnimation();

        const roundedScore = Math.round(score);

        if (elements.currentScore) elements.currentScore.textContent = roundedScore;
        if (elements.finalScore) elements.finalScore.textContent = roundedScore;

        if (elements.scoreTitle) {
            const titleText = this.getScoreTitle(roundedScore);
            let titleEmoji = '';
            if (roundedScore >= 95) titleEmoji = '🏆';
            else if (roundedScore >= 85) titleEmoji = '🌟';
            else if (roundedScore >= 70) titleEmoji = '👍';
            else if (roundedScore >= 50) titleEmoji = '👌';
            else titleEmoji = '💪';
            elements.scoreTitle.innerHTML = `<span style="font-size: 1.2em;">${titleEmoji}</span> ${titleText}`;
        }

        if (!analysis.error && elements.scoreBreakdown) {
            const shapeScore = Math.round(analysis.shapeScore || 0);
            const closureScore = Math.round(analysis.closureScore || 0);
            const smoothnessScore = Math.round(analysis.smoothnessScore || 0);
            const sizeScore = Math.round(analysis.sizeScore || 0);

            let transformationHtml = '';
            if (transformationName && transformationName.trim() !== '') {
                const displayName = this.t(`transformations.${transformationName.toLowerCase()}`) || transformationName;
                transformationHtml = `
                    <div class="breakdown-item transformation-item" style="grid-column: 1/-1; background: rgba(255,215,0,0.3); border: 2px solid #ffd700; border-radius: 8px; padding: 12px; margin-top: 10px;">
                        <strong>${this.t('scoreBreakdown.transformation', { name: displayName })}</strong>
                    </div>
                `;
            }

            elements.scoreBreakdown.innerHTML = `
                <div class="breakdown-item">
                    <strong>${this.t('scoreBreakdown.shape')}:</strong><br>
                    <span class="score-value">${shapeScore}/40 ${this.t('common.points')}</span>
                </div>
                <div class="breakdown-item">
                    <strong>${this.t('scoreBreakdown.closure')}:</strong><br>
                    <span class="score-value">${closureScore}/20 ${this.t('common.points')}</span>
                </div>
                <div class="breakdown-item">
                    <strong>${this.t('scoreBreakdown.smoothness')}:</strong><br>
                    <span class="score-value">${smoothnessScore}/25 ${this.t('common.points')}</span>
                </div>
                <div class="breakdown-item">
                    <strong>${this.t('scoreBreakdown.size')}:</strong><br>
                    <span class="score-value">${sizeScore}/15 ${this.t('common.points')}</span>
                </div>
                ${transformationHtml}
            `;
        } else if (analysis.error && elements.scoreBreakdown) {
            const errorMsg = this.t(`errors.${analysis.error}`) || analysis.error;
            elements.scoreBreakdown.innerHTML = `
                <div style="color: #ff6b6b; font-weight: bold; text-align: center; padding: 20px;">
                    ❌ ${errorMsg}
                </div>
            `;
        }
        
        // Ideális kör összehasonlító canvas
        const idealComparisonCanvas = document.getElementById('idealComparisonCanvas');
        if (idealComparisonCanvas && elements.idealCircleContainer && !analysis.error) {
            elements.idealCircleContainer.style.display = 'block';
            // Feltételezzük, hogy a GameEngine már kirajzolta az ideális kört az idealCircleCanvas-re
            // Itt esetleg a gameEngine.idealCtx tartalmát másolhatjuk át, ha szükséges az összehasonlításhoz
            // Jelenleg a GameEngine rajzol az idealCircleCanvas-re, ami elég
        }

        if (!analysis.error && roundedScore > 0) {
            setTimeout(async () => {
                this.effectsManager.celebrateScore(roundedScore);
                this.audioManager.playCheerSound(roundedScore);

                let savedScore = null;
                if (ScoreManager) {
                    savedScore = ScoreManager.saveScore(roundedScore, analysis,
                        this.gameEngine ? this.gameEngine.getDifficulty() : 'easy',
                        transformationName,
                        currentGameId // Átadjuk a currentGameId-t
                    );
                }

                this.updateStats();

                const playerName = this.getPlayerName();
                if (this.leaderboardManager && playerName !== this.t('player.anonymous') && firebaseAPI.isReady()) {
                    try {
                        await this.leaderboardManager.saveGlobalScore(
                            playerName,
                            roundedScore,
                            this.gameEngine ? this.gameEngine.getDifficulty() : 'easy',
                            transformationName
                        );
                        console.log('✅ Pontszám mentve globálisan!');
                        if (this.leaderboardManager.getCurrentView() === 'global') {
                            setTimeout(() => this.leaderboardManager.loadGlobalLeaderboard(), 1000);
                        }
                    } catch (error) {
                        console.warn('❌ Globális mentés sikertelen:', error);
                    }
                } else if (playerName !== this.t('player.anonymous')) {
                    console.log('📴 Firebase offline - globális mentés kihagyva');
                }

                if (this.leaderboardManager && this.leaderboardManager.getCurrentView() === 'local') {
                    this.leaderboardManager.loadLocalLeaderboard(savedScore?.id);
                }
            }, 500);
        }
        console.log('✅ showScore befejezve');
    }

    // Segédmetódusok a siker és hibaüzenetekhez (t() használatával)
    showError(errorKey, params = {}) {
        const message = this.t(`errors.${errorKey}`, params);
        alert(message);
    }

    showSuccess(successKey, params = {}) {
        const message = this.t(`success.${successKey}`, params); // Feltételezve, hogy vannak success kulcsok
        alert(message);
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// Globális hibakezelő - biztonságos
window.addEventListener('error', (e) => {
    console.error('💥 Globális hiba:', e.error);
    if (e.error && e.error.message && window.perfectCircleApp) {
        const userMessage = window.perfectCircleApp.t('errors.criticalError');
        if (e.error.message.includes('i18n') || e.error.message.includes('firebase')) {
            setTimeout(() => { alert(`${userMessage}\n\n${e.error.message}`); }, 1000);
        }
    }
});

console.log('✅ App.js betöltve - Biztonságos inicializálás');
