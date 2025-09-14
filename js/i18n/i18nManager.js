class I18nManager {
    constructor() {
        this.currentLanguage = 'hu';
        this.supportedLanguages = [
            { code: 'hu', name: 'Magyar', nativeName: 'Magyar', flag: '🇭🇺' },
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
            { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
            { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
            { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
        ];
        
        this.translations = {};
        this.loadedLanguages = new Set();
        this.isLoading = false;
    }

    // ✅ HIÁNYZÓ FÜGGVÉNYEK HOZZÁADÁSA
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    getLoadedLanguages() {
        return Array.from(this.loadedLanguages);
    }

    isLanguageSupported(langCode) {
        return this.supportedLanguages.some(lang => lang.code === langCode);
    }

    async loadLanguage(langCode) {
        if (this.loadedLanguages.has(langCode)) {
            console.log(`✅ Nyelv már betöltve: ${langCode}`);
            return true;
        }

        if (this.isLoading) {
            console.log('⏳ Már folyik egy betöltés...');
            return false;
        }

        this.isLoading = true;
        console.log(`📥 Nyelvi fájl betöltése: ${langCode}`);

        // HELYES ÚTVONALAK - a i18nManager.js-hez képest
        const possiblePaths = [
            `./languages/${langCode}.js`,                    // Relatív útvonal (LEGJOBB)
            `languages/${langCode}.js`,                      // Relatív útvonal
            `js/i18n/languages/${langCode}.js`,             // Gyökértől
            `./js/i18n/languages/${langCode}.js`,           // Gyökértől relatív
            `/js/i18n/languages/${langCode}.js`             // Abszolút útvonal
        ];

        for (const path of possiblePaths) {
            try {
                console.log(`🔄 Próbálkozás: ${path}`);
                
                const response = await fetch(path);
                
                if (response.ok) {
                    console.log(`✅ Sikeres útvonal: ${path}`);
                    
                    const jsContent = await response.text();
                    console.log(`📄 Fájl tartalom betöltve: ${jsContent.length} karakter`);
                    
                    // JavaScript végrehajtása
                    eval(jsContent);

                    // Ellenőrizzük a globális változót
                    const globalVarName = `translations_${langCode}`;
                    if (window[globalVarName]) {
                        this.translations[langCode] = window[globalVarName];
                        this.loadedLanguages.add(langCode);
                        
                        console.log(`✅ Nyelv sikeresen betöltve: ${langCode}`);
                        console.log(`📊 Betöltött kulcsok:`, Object.keys(this.translations[langCode]));
                        
                        this.isLoading = false;
                        return true;
                    } else {
                        console.error(`❌ Globális változó nem található: ${globalVarName}`);
                    }
                } else {
                    console.log(`❌ ${path}: ${response.status} ${response.statusText}`);
                }
                
            } catch (error) {
                console.log(`❌ ${path}: ${error.message}`);
            }
        }

        console.error(`❌ Egyik útvonal sem működött: ${langCode}`);
        
        // Fallback beégetett fordításokra
        if (langCode === 'hu') {
            console.log('🆘 Fallback beégetett magyar fordításokra...');
            this.translations['hu'] = this.getFallbackTranslations();
            this.loadedLanguages.add('hu');
            this.isLoading = false;
            return true;
        }

        this.isLoading = false;
        return false;
    }

    getFallbackTranslations() {
        return {
            title: 'Perfect Circle',
            subtitle: 'Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!',
            buttons: {
                startDrawing: '🎯 Rajzolás Kezdése',
                clear: '🗑️ Törlés',
                help: '❓ Segítség',
                save: '💾 Mentés',
                clearScores: '🗑️ Helyi Eredmények Törlése'
            },
            stats: {
                currentScore: 'Jelenlegi Pontszám',
                bestScore: 'Legjobb Eredmény',
                gamesPlayed: 'Játékok Száma',
                averageScore: 'Átlag Pontszám'
            },
            player: {
                label: '👤 Játékos név:',
                placeholder: 'Add meg a neved',
                nameSaved: 'Név mentve: {name} ✅',
                anonymous: 'Névtelen'
            },
            difficulty: {
                label: 'Nehézség:',
                easy: 'Könnyű 😊',
                hard: 'Nehéz 🌀'
            },
            instructions: {
                title: 'Hogyan játssz:',
                text: 'Kattints és húzd az egeret (vagy érintsd és húzd az ujjad) hogy egy kört rajzolj. Minél tökéletesebb a köröd, annál több pontot kapsz! A kör varázslatos módon át fog változni! ✨'
            },
            leaderboard: {
                title: '🏆 Ranglista',
                local: '📱 Helyi',
                global: '🌍 Globális',
                localResults: '📱 Helyi eredmények',
                globalResults: '🌍 Globális eredmények',
                noResults: 'Még nincsenek eredmények',
                loading: 'Betöltés...',
                export: '📤 Export',
                import: '📥 Import'
            },
            scoreTitle: {
                result: 'Eredmény',
                perfect: '🏆 Tökéletes! Zseniális!',
                excellent: '🌟 Kiváló! Nagyon jó!',
                good: '👍 Jó munka!',
                notBad: '👌 Nem rossz!',
                tryAgain: '💪 Próbáld újra!'
            },
            scoreBreakdown: {
                shape: '🔵 Köralak',
                closure: '🔗 Záródás',
                smoothness: '🌊 Egyenletesség',
                size: '📏 Méret',
                transformation: '🎨 Transzformáció: {name}'
            },
            common: {
                points: 'pont'
            },
            transformation: {
                magic: '✨ Varázslat történik... ✨'
            },
            firebase: {
                connecting: '🟡 Kapcsolódás...',
                online: '🟢 Online',
                offline: '🔴 Offline',
                error: '❌ Hiba',
                offlineNotice: '⚠️ <strong>Offline mód:</strong> A globális ranglista nem elérhető. Az eredmények helyben mentődnek.'
            },
            visitors: {
                label: 'Látogatások:'
            },
            audio: {
                enabled: '🔊 Hang Be',
                disabled: '🔇 Hang Ki',
                enabledMessage: 'Hang bekapcsolva!',
                disabledMessage: 'Hang kikapcsolva!'
            },
            theme: {
                light: '☀️ Világos',
                dark: '🌙 Sötét',
                lightEnabled: 'Világos téma bekapcsolva!',
                darkEnabled: 'Sötét téma bekapcsolva!'
            },
            advanced: {
                title: '⚙️ Fejlett Funkciók',
                features: 'Fejlett funkciók és beállítások',
                menu: 'Fejlett menü'
            },
            language: {
                info: '🌍 Nyelv Info',
                current: 'Jelenlegi nyelv',
                supported: 'Támogatott nyelvek',
                changed: 'Nyelv váltva: {language} ✅'
            },
            transformations: {
                rainbow: 'Szivárvány',
                galaxy: 'Galaxis',
                flower: 'Virág',
                mandala: 'Mandala',
                spiral: 'Spirál',
                star: 'Csillag',
                heart: 'Szív',
                diamond: 'Gyémánt',
                wave: 'Hullám',
                fire: 'Tűz',
                transformText: '🎨 Transzformáció alkalmazva: {name}',
                transforming: '✨ Varázslat történik... ✨'
            },
            errors: {
                invalidName: 'Kérlek add meg a neved!',
                nameTooLong: 'A név maximum 20 karakter lehet!',
                tooFewPoints: 'Túl kevés pont! Rajzolj egy teljes kört.',
                analysisError: 'Elemzési hiba történt.',
                criticalError: 'Kritikus hiba történt. Kérlek frissítsd az oldalt.'
            }
        };
    }

    async init() {
        console.log('🌍 I18n Manager inicializálása...');
        console.log('📂 Jelenlegi hely:', window.location.href);
        
        try {
            const detectedLang = this.detectLanguage();
            console.log(`🔍 Felismert nyelv: ${detectedLang}`);
            
            const loaded = await this.loadLanguage(detectedLang);
            if (loaded) {
                this.currentLanguage = detectedLang;
                console.log(`✅ I18n inicializálva - Aktív nyelv: ${this.currentLanguage}`);
            } else {
                throw new Error(`Nem sikerült betölteni: ${detectedLang}`);
            }
            
            this.updateUI();
            this.updateLanguageSelector();
            
        } catch (error) {
            console.error('❌ I18n inicializálási hiba:', error);
            
            // Végső fallback
            this.currentLanguage = 'hu';
            this.translations['hu'] = this.getFallbackTranslations();
            this.loadedLanguages.add('hu');
            this.updateUI();
        }
    }

    async changeLanguage(langCode) {
        if (!this.isLanguageSupported(langCode)) {
            console.error('❌ Nem támogatott nyelv:', langCode);
            return false;
        }

        if (this.currentLanguage === langCode) {
            console.log('ℹ️ Már ez a nyelv van beállítva:', langCode);
            return true;
        }

        try {
            console.log(`🔄 Nyelvváltás: ${this.currentLanguage} → ${langCode}`);
            
            const loaded = await this.loadLanguage(langCode);
            if (!loaded) {
                throw new Error(`Nem sikerült betölteni: ${langCode}`);
            }
            
            const oldLanguage = this.currentLanguage;
            this.currentLanguage = langCode;
            
            localStorage.setItem('perfectcircle_language', langCode);
            
            this.updateUI();
            this.updateLanguageSelector();
            
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: langCode, oldLanguage: oldLanguage }
            }));
            
            const message = this.t('language.changed', { language: langCode.toUpperCase() });
            console.log(`✅ ${message}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Nyelvváltási hiba:', error);
            return false;
        }
    }

    detectLanguage() {
        const savedLang = localStorage.getItem('perfectcircle_language');
        if (savedLang && this.isLanguageSupported(savedLang)) {
            return savedLang;
        }
        const browserLang = navigator.language?.split('-')[0]?.toLowerCase() || 'hu';
        return this.isLanguageSupported(browserLang) ? browserLang : 'hu';
    }

    t(key, params = {}) {
        try {
            let translation = this.getNestedValue(this.translations[this.currentLanguage], key);
            
            if (!translation && this.currentLanguage !== 'hu' && this.translations['hu']) {
                translation = this.getNestedValue(this.translations['hu'], key);
            }
            
            if (!translation) {
                console.warn(`⚠️ Hiányzó fordítás: ${key} (${this.currentLanguage})`);
                return key;
            }
            
            return this.interpolate(translation, params);
            
        } catch (error) {
            console.error('❌ Fordítási hiba:', error);
            return key;
        }
    }

    getNestedValue(obj, key) {
        if (!obj) return null;
        return key.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    interpolate(text, params) {
        if (!text || typeof text !== 'string') return text;
        return Object.keys(params).reduce((result, key) => {
            return result.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
        }, text);
    }

    updateUI() {
        console.log(`🔄 UI frissítése - ${this.currentLanguage} nyelvre...`);
        
        let updatedCount = 0;
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    if (element.innerHTML.includes('<')) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = translation;
                        element.innerHTML = tempDiv.innerHTML;
                    } else {
                        element.textContent = translation;
                    }
                }
                updatedCount++;
            }
        });
        
        const pageTitle = this.t('title');
        if (pageTitle && pageTitle !== 'title') {
            document.title = pageTitle;
        }
        
        console.log(`✅ UI frissítve - ${updatedCount} elem frissítve`);
    }

    toggleLanguageMenu() {
        const languageMenu = document.getElementById('languageMenu');
        if (languageMenu) {
            languageMenu.classList.toggle('show');
        } else {
            this.createLanguageSelector();
        }
    }

    createLanguageSelector() {
        if (document.getElementById('languageSelector')) return;

        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.id = 'languageSelector';
        
        const currentLang = this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
        
        selector.innerHTML = `
            <div class="current-language" onclick="window.i18nManager?.toggleLanguageMenu()">
                <span id="currentLanguageFlag">${currentLang?.flag || '🇭🇺'}</span>
                <span id="currentLanguageCode">${this.currentLanguage.toUpperCase()}</span>
            </div>
            <div class="language-menu" id="languageMenu">
                ${this.supportedLanguages.map(lang => `
                    <div class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                         onclick="window.i18nManager?.changeLanguage('${lang.code}')">
                        <span class="flag">${lang.flag}</span>
                        <span class="name">${lang.nativeName}</span>
                        ${this.loadedLanguages.has(lang.code) ? '<span class="loaded">✓</span>' : '<span class="not-loaded">⏳</span>'}
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(selector);
    }

    updateLanguageSelector() {
        const currentFlag = document.getElementById('currentLanguageFlag');
        const currentCode = document.getElementById('currentLanguageCode');
        const languageMenu = document.getElementById('languageMenu');
        
        const currentLang = this.supportedLanguages.find(lang => lang.code === this.currentLanguage);
        
        if (currentFlag && currentLang) {
            currentFlag.textContent = currentLang.flag;
        }
        
        if (currentCode) {
            currentCode.textContent = this.currentLanguage.toUpperCase();
        }
        
        if (languageMenu) {
            languageMenu.innerHTML = this.supportedLanguages.map(lang => `
                <div class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                     onclick="window.i18nManager?.changeLanguage('${lang.code}')">
                    <span class="flag">${lang.flag}</span>
                    <span class="name">${lang.nativeName}</span>
                    ${this.loadedLanguages.has(lang.code) ? '<span class="loaded">✓</span>' : '<span class="not-loaded">⏳</span>'}
                </div>
            `).join('');
        }
    }

    // ✅ TOVÁBBI HASZNOS FÜGGVÉNYEK
    preloadLanguages(langCodes = ['en', 'de']) {
        console.log('🚀 Nyelvek előzetes betöltése:', langCodes);
        
        const promises = langCodes
            .filter(lang => !this.loadedLanguages.has(lang))
            .map(lang => this.loadLanguage(lang));
        
        return Promise.all(promises).then(() => {
            console.log('✅ Előzetes betöltés kész');
        }).catch(error => {
            console.warn('⚠️ Előzetes betöltési hiba:', error);
        });
    }

    getDebugInfo() {
        return {
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.supportedLanguages.map(l => l.code),
            loadedLanguages: Array.from(this.loadedLanguages),
            translationsLoaded: Object.keys(this.translations),
            isLoading: this.isLoading,
            currentUrl: window.location.href,
            basePath: window.location.pathname
        };
    }

    // ✅ KOMPATIBILITÁSI FÜGGVÉNYEK az app.js-hez
    async setLanguage(langCode) {
        return await this.changeLanguage(langCode);
    }

    getTranslation(key, params = {}) {
        return this.t(key, params);
    }

    isReady() {
        return this.loadedLanguages.size > 0 && !this.isLoading;
    }

    getLanguageInfo() {
        return {
            current: this.currentLanguage,
            supported: this.supportedLanguages,
            loaded: Array.from(this.loadedLanguages)
        };
    }
}

// Globális példány
window.i18nManager = new I18nManager();

// Event kezelők
document.addEventListener('click', function(e) {
    if (!e.target.closest('.language-selector')) {
        const languageMenu = document.getElementById('languageMenu');
        if (languageMenu?.classList.contains('show')) {
            languageMenu.classList.remove('show');
        }
    }
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        window.i18nManager?.toggleLanguageMenu();
    }
});

console.log('✅ Teljes I18nManager betöltve - Minden függvénnyel');
