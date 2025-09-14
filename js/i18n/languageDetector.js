// Nyelv automatikus felismerő
class LanguageDetector {
    static STORAGE_KEY = 'perfectcircle_language';
    static SUPPORTED_LANGUAGES = ['hu', 'en', 'de', 'fr', 'es', 'it'];
    static DEFAULT_LANGUAGE = 'en';
    
    static detectLanguage() {
        // 1. Elmentett nyelv ellenőrzése
        const savedLanguage = localStorage.getItem(this.STORAGE_KEY);
        if (savedLanguage && this.isSupported(savedLanguage)) {
            console.log(`🌍 Saved language detected: ${savedLanguage}`);
            return savedLanguage;
        }
        
        // 2. URL paraméter ellenőrzése (?lang=hu)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isSupported(urlLang)) {
            console.log(`🌍 URL language detected: ${urlLang}`);
            this.saveLanguage(urlLang);
            return urlLang;
        }
        
        // 3. Böngésző nyelv ellenőrzése
        const browserLanguages = this.getBrowserLanguages();
        for (const lang of browserLanguages) {
            const langCode = this.extractLanguageCode(lang);
            if (this.isSupported(langCode)) {
                console.log(`🌍 Browser language detected: ${langCode}`);
                this.saveLanguage(langCode);
                return langCode;
            }
        }
        
        // 4. Alapértelmezett nyelv
        console.log(`🌍 Using default language: ${this.DEFAULT_LANGUAGE}`);
        this.saveLanguage(this.DEFAULT_LANGUAGE);
        return this.DEFAULT_LANGUAGE;
    }
    
    static getBrowserLanguages() {
        const languages = [];
        
        // navigator.languages tömb
        if (navigator.languages && navigator.languages.length > 0) {
            languages.push(...navigator.languages);
        }
        
        // navigator.language
        if (navigator.language) {
            languages.push(navigator.language);
        }
        
        // navigator.userLanguage (IE)
        if (navigator.userLanguage) {
            languages.push(navigator.userLanguage);
        }
        
        // navigator.browserLanguage (IE)
        if (navigator.browserLanguage) {
            languages.push(navigator.browserLanguage);
        }
        
        return languages;
    }
    
    static extractLanguageCode(languageTag) {
        // "hu-HU" -> "hu", "en-US" -> "en"
        return languageTag.split('-')[0].toLowerCase();
    }
    
    static isSupported(langCode) {
        return this.SUPPORTED_LANGUAGES.includes(langCode.toLowerCase());
    }
    
    static saveLanguage(langCode) {
        try {
            localStorage.setItem(this.STORAGE_KEY, langCode.toLowerCase());
        } catch (error) {
            console.warn('Cannot save language preference:', error);
        }
    }
    
    static getSupportedLanguages() {
        return this.SUPPORTED_LANGUAGES.map(code => ({
            code: code,
            name: this.getLanguageName(code),
            nativeName: this.getNativeLanguageName(code)
        }));
    }
    
    static getLanguageName(code) {
        const names = {
            'hu': 'Hungarian',
            'en': 'English',
            'de': 'German',
            'fr': 'French',
            'es': 'Spanish',
            'it': 'Italian'
        };
        return names[code] || code;
    }
    
    static getNativeLanguageName(code) {
        const nativeNames = {
            'hu': 'Magyar',
            'en': 'English',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano'
        };
        return nativeNames[code] || code;
    }
    
    static getLanguageFlag(code) {
        const flags = {
            'hu': '🇭🇺',
            'en': '🇺🇸',
            'de': '🇩🇪',
            'fr': '🇫🇷',
            'es': '🇪🇸',
            'it': '🇮🇹'
        };
        return flags[code] || '🌍';
    }
}

// Globális hozzáférés
window.LanguageDetector = LanguageDetector;
