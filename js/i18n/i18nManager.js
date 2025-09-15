// js/i18n/i18nManager.js

class I18nManager {
    constructor() {
        this.currentLanguage = 'hu'; // Alapértelmezett magyar
        this.translations = {};
        this.supportedLanguages = [
            { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
            { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
            { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
            { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
        ];
        this.initialized = false;
        this.app = null; // App referencia dependency injection-höz
    }

    // Dependency injection az app példányhoz
    setApp(app) {
        this.app = app;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Mentett nyelv betöltése
            const savedLanguage = localStorage.getItem('perfectcircle_language');
            if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            } else {
                // Böngésző nyelvének automatikus felismerése
                this.currentLanguage = this.detectBrowserLanguage();
            }

            // Fordítások betöltése
            await this.loadTranslations(this.currentLanguage);
            
            // UI inicializálása
            this.initializeLanguageUI();
            this.setupEventListeners();
            
            this.initialized = true;
            console.log(`✅ I18n inicializálva - Nyelv: ${this.currentLanguage}`);
            
            // Nyelv változás esemény kiváltása
            this.dispatchLanguageChangeEvent();
            
        } catch (error) {
            console.error('❌ I18n inicializálási hiba:', error);
            // Fallback magyar nyelvre
            this.currentLanguage = 'hu';
            this.initialized = true;
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        if (this.isLanguageSupported(langCode)) {
            console.log(`🌍 Böngésző nyelv felismert: ${langCode}`);
            return langCode;
        }
        
        console.log('🌍 Böngésző nyelv nem támogatott, magyar használata');
        return 'hu';
    }

    isLanguageSupported(langCode) {
        return this.supportedLanguages.some(lang => lang.code === langCode);
    }

    async loadTranslations(langCode) {
        // Itt töltenéd be a fordításokat fájlból vagy API-ból
        // Jelenleg beépített fordítások
        this.translations = this.getBuiltInTranslations(langCode);
    }

    getBuiltInTranslations(langCode) {
        const translations = {
            'hu': {
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
                'player.you': 'Te',
                'player.anonymous': 'Névtelen',
                'errors.invalidName': 'Kérlek add meg a neved!',
                'errors.nameTooLong': 'A név maximum 20 karakter lehet!',
                'errors.tooFewPoints': 'Túl kevés pont! Rajzolj egy teljes kört.',
                'scoreTitle.perfect': '🏆 Tökéletes! Zseniális!',
                'scoreTitle.excellent': '🌟 Kiváló! Nagyon jó!',
                'scoreTitle.good': '👍 Jó munka!',
                'scoreTitle.notBad': '👌 Nem rossz!',
                'scoreTitle.tryAgain': '💪 Próbáld újra!',
                'common.points': 'pont',
                'common.players': 'játékos',
                'common.games': 'játék',
                'audio.enabled': 'Hang',
                'audio.disabled': 'Néma',
                'audio.enabledMessage': 'Hang bekapcsolva!',
                'audio.disabledMessage': 'Hang kikapcsolva!',
                'theme.dark': 'Sötét',
                'theme.light': 'Világos',
                'theme.darkEnabled': 'Sötét téma bekapcsolva!',
                'theme.lightEnabled': 'Világos téma bekapcsolva!',
                'advanced.title': 'Fejlett',
                'language.info': 'NYELVI INFORMÁCIÓK',
                'language.current': 'Jelenlegi nyelv',
                'language.detected': 'Automatikusan felismert',
                'language.supported': 'Támogatott nyelvek',
                'language.shortcuts': 'Billentyű parancsok',
                'language.toggleMenu': 'Nyelv menü',
                'language.clickFlag': 'Kattints a zászlóra a váltáshoz',
                'language.autoSave': 'A nyelvválasztás automatikusan mentődik'
            },
            'en': {
                'title': 'Perfect Circle',
                'subtitle': 'Draw the most perfect circle in one motion!',
                'buttons.startDrawing': '🎯 Start Drawing',
                'buttons.clear': '🗑️ Clear',
                'buttons.help': '❓ Help',
                'buttons.save': '💾 Save',
                'stats.currentScore': 'Current Score',
                'stats.bestScore': 'Best Score',
                'stats.gamesPlayed': 'Games Played',
                'stats.averageScore': 'Average Score',
                'player.label': '👤 Player name:',
                'player.placeholder': 'Enter your name',
                'player.nameSaved': 'Name saved: {name} ✅',
                'player.you': 'You',
                'player.anonymous': 'Anonymous',
                'errors.invalidName': 'Please enter your name!',
                'errors.nameTooLong': 'Name can be maximum 20 characters!',
                'errors.tooFewPoints': 'Too few points! Draw a complete circle.',
                'scoreTitle.perfect': '🏆 Perfect! Genius!',
                'scoreTitle.excellent': '🌟 Excellent! Very good!',
                'scoreTitle.good': '👍 Good work!',
                'scoreTitle.notBad': '👌 Not bad!',
                'scoreTitle.tryAgain': '💪 Try again!',
                'common.points': 'points',
                'common.players': 'players',
                'common.games': 'games',
                'audio.enabled': 'Sound',
                'audio.disabled': 'Mute',
                'audio.enabledMessage': 'Sound enabled!',
                'audio.disabledMessage': 'Sound disabled!',
                'theme.dark': 'Dark',
                'theme.light': 'Light',
                'theme.darkEnabled': 'Dark theme enabled!',
                'theme.lightEnabled': 'Light theme enabled!',
                'advanced.title': 'Advanced',
                'language.info': 'LANGUAGE INFORMATION',
                'language.current': 'Current language',
                'language.detected': 'Auto-detected',
                'language.supported': 'Supported languages',
                'language.shortcuts': 'Keyboard shortcuts',
                'language.toggleMenu': 'Language menu',
                'language.clickFlag': 'Click flag to switch',
                'language.autoSave': 'Language choice is automatically saved'
            }
            // További nyelvek hozzáadhatók...
        };

        return translations[langCode] || translations['hu'];
    }

    t(key, params = {}) {
        let text = this.translations[key] || key;
        
        // Paraméterek behelyettesítése
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    getLanguageFlag(langCode) {
        const lang = this.supportedLanguages.find(l => l.code === langCode);
        return lang ? lang.flag : '🌍';
    }

    async changeLanguage(langCode) {
        if (!this.isLanguageSupported(langCode) || langCode === this.currentLanguage) {
            return;
        }

        console.log(`🌍 Nyelv váltás: ${this.currentLanguage} → ${langCode}`);
        
        this.currentLanguage = langCode;
        localStorage.setItem('perfectcircle_language', langCode);
        
        await this.loadTranslations(langCode);
        this.updateLanguageButton();
        this.dispatchLanguageChangeEvent();
    }

    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: this.currentLanguage,
                translations: this.translations
            }
        });
        window.dispatchEvent(event);
    }

    initializeLanguageUI() {
        this.createLanguageSelector();
        this.updateLanguageButton();
    }

    createLanguageSelector() {
        // Nyelv selector menü létrehozása
        if (document.getElementById('languageSelector')) return;

        const selector = document.createElement('div');
        selector.id = 'languageSelector';
        selector.className = 'language-selector';
        selector.innerHTML = `
            <button id="languageButton" class="language-button">
                ${this.getLanguageFlag(this.currentLanguage)} ${this.currentLanguage.toUpperCase()}
            </button>
            <div id="languageMenu" class="language-menu">
                ${this.supportedLanguages.map(lang => `
                    <button class="language-option" data-lang="${lang.code}">
                        ${lang.flag} ${lang.nativeName}
                    </button>
                `).join('')}
            </div>
        `;

        // Hozzáadás a controls div-hez
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.appendChild(selector);
        }
    }

    updateLanguageButton() {
        const languageButton = document.getElementById('languageButton');
        if (languageButton) {
            languageButton.innerHTML = `${this.getLanguageFlag(this.currentLanguage)} ${this.currentLanguage.toUpperCase()}`;
        }

        // Language info gomb frissítése az app-ban
        const languageInfoBtn = document.getElementById('languageInfoBtn');
        if (languageInfoBtn) {
            languageInfoBtn.innerHTML = `🌍 ${this.currentLanguage.toUpperCase()}`;
        }
    }

    setupEventListeners() {
        // Nyelv gomb kattintás
        document.addEventListener('click', (e) => {
            if (e.target.id === 'languageButton') {
                this.toggleLanguageMenu();
            } else if (e.target.classList.contains('language-option')) {
                const langCode = e.target.dataset.lang;
                this.changeLanguage(langCode);
                this.hideLanguageMenu();
            } else if (!e.target.closest('#languageSelector')) {
                this.hideLanguageMenu();
            }
        });

        // Billentyűzet események
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLanguageMenu();
            }
        });
    }

    toggleLanguageMenu() {
        const menu = document.getElementById('languageMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }

    hideLanguageMenu() {
        const menu = document.getElementById('languageMenu');
        if (menu) {
            menu.classList.remove('show');
        }
    }

    // Leaderboard frissítés biztonságos módon
    refreshLeaderboard() {
        // Globális app példány használata
        if (this.app && this.app.leaderboardManager) {
            this.app.leaderboardManager.refreshCurrentView();
        } else if (window.perfectCircleApp && window.perfectCircleApp.leaderboardManager) {
            window.perfectCircleApp.leaderboardManager.refreshCurrentView();
        }
    }
}

// Globális változóként elérhető példány létrehozása
window.i18nManager = new I18nManager();
