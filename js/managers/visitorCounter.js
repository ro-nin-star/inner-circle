// Látogatásszámláló kezelő
class VisitorCounter {
    static STORAGE_KEY = 'perfectcircle_visits';
    static SESSION_KEY = 'perfectcircle_session';
    static currentCount = 0;
    static globalCount = 0;
    
    static async init() {
        console.log('👁️ Látogatásszámláló inicializálása...');
        
        try {
            // Helyi látogatásszám frissítése
            this.currentCount = await this.updateLocalVisitCount();
            
            // Firebase látogatás mentése
            await this.saveVisitToFirebase();
            
            // Globális látogatásszám betöltése
            await this.loadGlobalVisitCount();
            
            // Animáció indítása
            this.startAnimation();
            
            console.log('✅ VisitorCounter inicializálva');
            return true;
            
        } catch (error) {
            console.error('❌ Látogatásszámláló inicializálási hiba:', error);
            throw error;
        }
    }
    
    static updateLocalVisitCount() {
        let localVisits = localStorage.getItem(this.STORAGE_KEY);
        
        if (!localVisits) {
            localVisits = 0;
        }
        
        localVisits = parseInt(localVisits) + 1;
        localStorage.setItem(this.STORAGE_KEY, localVisits.toString());
        
        // Első és utolsó látogatás időpontjának mentése
        if (!localStorage.getItem('perfectcircle_first_visit')) {
            localStorage.setItem('perfectcircle_first_visit', new Date().toISOString());
        }
        localStorage.setItem('perfectcircle_last_visit', new Date().toISOString());
        
        // Helyi szám megjelenítése
        const visitElement = document.getElementById('visitCount');
        if (visitElement) {
            visitElement.textContent = localVisits.toLocaleString('hu-HU');
        }
        
        console.log(`📊 Helyi látogatások: ${localVisits}`);
        this.currentCount = localVisits;
        return localVisits;
    }
    
    static async saveVisitToFirebase() {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            console.log('📴 Firebase offline - látogatás nem mentve globálisan');
            return;
        }
        
        try {
            // Látogatási adatok készítése
            const visitData = {
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('hu-HU'),
                time: new Date().toLocaleTimeString('hu-HU'),
                userAgent: navigator.userAgent.substring(0, 200),
                language: navigator.language,
                screen: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                referrer: (document.referrer || 'közvetlen').substring(0, 200),
                url: window.location.href,
                sessionId: this.getSessionId(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                platform: navigator.platform
            };
            
            // Mentés Firebase-be
            const visitId = await window.firebaseAPI.saveVisit(visitData);
            console.log('✅ Látogatás mentve Firebase-be:', visitId);
            
        } catch (error) {
            console.error('❌ Látogatás mentése sikertelen:', error);
        }
    }
    
    static async loadGlobalVisitCount() {
        if (!window.firebaseAPI || !window.firebaseAPI.isReady()) {
            console.log('📴 Firebase offline - globális látogatásszám nem elérhető');
            return;
        }
        
        try {
            const globalCount = await window.firebaseAPI.getVisitCount();
            this.globalCount = globalCount;
            
            console.log(`🌍 Globális látogatók száma: ${globalCount}`);
            
            // Ha van globális számláló elem, frissítsük
            const globalElement = document.getElementById('globalVisitorCount');
            if (globalElement) {
                globalElement.textContent = globalCount.toLocaleString('hu-HU');
            }
            
        } catch (error) {
            console.error('❌ Globális látogatásszám betöltése sikertelen:', error);
        }
    }

    static getSessionId() {
        let sessionId = sessionStorage.getItem(this.SESSION_KEY);
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem(this.SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    static startAnimation() {
        const visitElement = document.getElementById('visitCount');
        if (visitElement) {
            // Egyszerű fade-in animáció
            visitElement.style.opacity = '0';
            visitElement.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                visitElement.style.opacity = '1';
            }, 100);
        }
        
        console.log('✨ Látogatásszámláló animáció elindítva');
    }
    
    // ✅ HIÁNYZÓ METÓDUSOK HOZZÁADÁSA
    static getCurrentCount() {
        return this.currentCount;
    }
    
    static getGlobalCount() {
        return this.globalCount;
    }
    
    static showStats() {
        const localVisits = localStorage.getItem(this.STORAGE_KEY) || 0;
        const firstVisit = localStorage.getItem('perfectcircle_first_visit');
        const lastVisit = localStorage.getItem('perfectcircle_last_visit');
        
        let message = `👥 Látogatási statisztikák:\n\n`;
        message += `🔢 Helyi látogatások: ${localVisits}\n`;
        
        if (this.globalCount > 0) {
            message += `🌍 Globális látogatások: ${this.globalCount.toLocaleString('hu-HU')}\n`;
        }
        
        if (firstVisit) {
            const firstDate = new Date(firstVisit);
            message += `🆕 Első látogatás: ${firstDate.toLocaleDateString('hu-HU')}\n`;
        }
        
        if (lastVisit) {
            const lastDate = new Date(lastVisit);
            message += `🕐 Utolsó látogatás: ${lastDate.toLocaleDateString('hu-HU')} ${lastDate.toLocaleTimeString('hu-HU')}\n`;
        }
        
        const sessionId = this.getSessionId();
        message += `🆔 Session ID: ${sessionId.substring(0, 8)}...`;
        
        alert(message);
    }
}

// ✅ GLOBÁLIS EXPORT
window.VisitorCounter = VisitorCounter;

console.log('✅ VisitorCounter osztály betöltve');
