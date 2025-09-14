// Nemzetköziesítés kezelő
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.loadedLanguages = new Set();
    }
    
    async init() {
        console.log('🌍 I18n Manager inicializálása...');
        
        // Nyelv felismerése
        this.currentLanguage = LanguageDetector.detectLanguage();
        
        // Alapértelmezett és aktuális nyelv betöltése
        await this.loadLanguage(this.fallbackLanguage);
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadLanguage(this.currentLanguage);
        }
        
        // UI frissítése
        this.updateUI();
        this.createLanguageSelector();
        
        console.log(`✅ I18n inicializálva - Aktív nyelv: ${this.currentLanguage}`);
    }
    
    async loadLanguage(langCode) {
        if (this.loadedLanguages.has(langCode)) {
            return;
        }
        
        try {
            // Dinamikus betöltés
            await this.loadLanguageFile(langCode);
            
            if (window.i18nLanguages && window.i18nLanguages[langCode]) {
                this.translations[langCode] = window.i18nLanguages[langCode];
                this.loadedLanguages.add(langCode);
                console.log(`✅ Nyelv betöltve: ${langCode}`);
            } else {
                throw new Error(`Language data not found: ${langCode}`);
            }
        } catch (error) {
            console.error(`❌ Nyelv betöltési hiba (${langCode}):`, error);
            
            // Ha nem az alapértelmezett nyelv, próbáljuk azt
            if (langCode !== this.fallbackLanguage) {
                console.log(`🔄 Fallback nyelvre váltás: ${this.fallbackLanguage}`);
                this.currentLanguage = this.fallbackLanguage;
            }
        }
    }
    
    async loadLanguageFile(langCode) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/i18n/languages/${langCode}.js`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }
    
    getTranslation(key) {
        const keys = key.split('.');
        
        // Aktuális nyelv próbálása
        let translation = this.getNestedValue(this.translations[this.currentLanguage], keys);
        
        // Fallback nyelv próbálása
        if (translation === undefined && this.currentLanguage !== this.fallbackLanguage) {
            translation = this.getNestedValue(this.translations[this.fallbackLanguage], keys);
        }
        
        // Ha még mindig nincs, visszaadjuk a kulcsot
        if (translation === undefined) {
            console.warn(`🌍 Missing translation: ${key} (${this.currentLanguage})`);
            return key;
        }
        
        return translation;
    }
    
    getNestedValue(obj, keys) {
        if (!obj) return undefined;
        
        return keys.reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    interpolate(text, params) {
        if (typeof text !== 'string') return text;
        
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    async setLanguage(langCode) {
        if (!LanguageDetector.isSupported(langCode)) {
            console.error(`❌ Nem támogatott nyelv: ${langCode}`);
            return false;
        }
        
        if (langCode === this.currentLanguage) {
            return true;
        }
        
        console.log(`🌍 Nyelv váltás: ${this.currentLanguage} -> ${langCode}`);
        
        // Nyelv betöltése ha szükséges
        await this.loadLanguage(langCode);
        
        this.currentLanguage = langCode;
        LanguageDetector.saveLanguage(langCode);
        
        // UI frissítése
        this.updateUI();
        this.updateLanguageSelector();
        
        // Event kiváltása
        this.dispatchLanguageChangeEvent();
        
        return true;
    }
    
    updateUI() {
        // Data-i18n attribútummal rendelkező elemek frissítése
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Data-i18n-html attribútummal rendelkező elemek frissítése
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });
        
        // Title frissítése
        document.title = this.t('title');
        
        // HTML lang attribútum frissítése
        document.documentElement.lang = this.currentLanguage;
    }
    
    createLanguageSelector() {
        const existingSelector = document.getElementById('languageSelector');
        if (existingSelector) {
            existingSelector.remove();
        }
        
        const selector = document.createElement('div');
        selector.id = 'languageSelector';
        selector.className = 'language-selector';
        
        const supportedLanguages = LanguageDetector.getSupportedLanguages();
        
        selector.innerHTML = `
            <button class="language-toggle" onclick="window.i18nManager.toggleLanguageMenu()">
                ${LanguageDetector.getLanguageFlag(this.currentLanguage)} ${this.currentLanguage.toUpperCase()}
            </button>
            <div class="language-menu" id="languageMenu">
                ${supportedLanguages.map(lang => `
                    <button class="language-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                            onclick="window.i18nManager.setLanguage('${lang.code}')"
                            data-lang="${lang.code}">
                        ${LanguageDetector.getLanguageFlag(lang.code)} ${lang.nativeName}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Hozzáadás a Firebase státusz mellé
        const firebaseStatus = document.getElementById('firebaseStatus');
        if (firebaseStatus) {
            firebaseStatus.parentNode.insertBefore(selector, firebaseStatus);
        } else {
            document.body.appendChild(selector);
        }
    }
    
    updateLanguageSelector() {
        const toggle = document.querySelector('.language-toggle');
        if (toggle) {
            toggle.innerHTML = `${LanguageDetector.getLanguageFlag(this.currentLanguage)} ${this.currentLanguage.toUpperCase()}`;
        }
        
        document.querySelectorAll('.language-option').forEach(option => {
            const langCode = option.getAttribute('data-lang');
            option.classList.toggle('active', langCode === this.currentLanguage);
        });
    }
    
    toggleLanguageMenu() {
        const menu = document.getElementById('languageMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }
    
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: this.currentLanguage,
                translations: this.translations[this.currentLanguage]
            }
        });
        window.dispatchEvent(event);
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return LanguageDetector.getSupportedLanguages();
    }
    
    // Dátum és idő formázás
    formatDate(date, options = {}) {
        const locale = this.t('dateTime.locale');
        return new Intl.DateTimeFormat(locale, options).format(date);
    }
    
    formatTime(date) {
        const locale = this.t('dateTime.locale');
        return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
    
    formatNumber(number, options = {}) {
        const locale = this.t('dateTime.locale');
        return new Intl.NumberFormat(locale, options).format(number);
    }
}

// CSS stílusok hozzáadása
const i18nStyles = `
.language-selector {
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 9999;
}

.language-toggle {
    background: rgba(30, 60, 114, 0.9);
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 0.75em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(79, 195, 247, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.language-toggle:hover {
    background: rgba(30, 60, 114, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.language-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 5px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(30, 60, 114, 0.1);
    display: none;
    min-width: 120px;
}

.language-menu.show {
    display: block;
    animation: languageMenuSlide 0.3s ease-out;
}

@keyframes languageMenuSlide {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.language-option {
    display: block;
    width: 100%;
    background: none;
    border: none;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    border-radius: 10px;
    font-size: 0.8em;
    color: #1e3c72;
    transition: all 0.2s ease;
    margin: 2px 0;
}

.language-option:hover {
    background: rgba(79, 195, 247, 0.1);
    transform: translateX(3px);
}

.language-option.active {
    background: rgba(30, 60, 114, 0.1);
    font-weight: bold;
    color: #1e3c72;
}

@media (max-width: 600px) {
    .language-selector {
        top: 10px;
        left: 10px;
    }
    
    .language-toggle {
        font-size: 0.65em;
        padding: 6px 10px;
    }
    
    .language-menu {
        min-width: 100px;
    }
    
    .language-option {
        font-size: 0.75em;
        padding: 6px 10px;
    }
}
`;

// CSS beszúrása
const styleSheet = document.createElement('style');
styleSheet.textContent = i18nStyles;
document.head.appendChild(styleSheet);

// Globális példány
window.i18nManager = new I18nManager();

// Kattintás esemény kezelése a menü bezárásához
document.addEventListener('click', (e) => {
    const languageSelector = document.getElementById('languageSelector');
    const languageMenu = document.getElementById('languageMenu');
    
    if (languageSelector && !languageSelector.contains(e.target)) {
        if (languageMenu) {
            languageMenu.classList.remove('show');
        }
    }
});
