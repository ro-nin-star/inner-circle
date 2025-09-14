// Látogatásszámláló kezelő
class VisitorCounter {
    static STORAGE_KEY = 'perfectcircle_visits';
    static SESSION_KEY = 'perfectcircle_session';
    
    static async init() {
        console.log('👁️ Látogatásszámláló inicializálása...');
        
        try {
            // Helyi látogatásszám frissítése
            await this.updateLocalVisitCount();
            
            // Firebase látogatás mentése
            await this.saveVisitToFirebase();
            
            // Globális látogatásszám betöltése
            await this.loadGlobalVisitCount();
            
            // Animáció indítása
            this.startAnimation();
            
        } catch (error) {
            console.error('Látogatásszámláló inicializálási hiba:', error);
        }
    }
    
    static updateLocalVisitCount() {
        let localVisits = localStorage.getItem(this.STORAGE_KEY);
        
        if (!localVisits) {
            localVisits = 0;
        }
        
        localVisits = parseInt(localVisits) + 1;
        localStorage.setItem(this.STORAGE_KEY, localVisits.toString());
        
        // Helyi szám megjelenítése
        const visitElement = document.getElementById('visitCount');
        if (visitElement) {
            visitElement.textContent = localVisits.toLocaleString('hu-HU');
        }
        
        console.log(`📊 Helyi látogatások: ${localVisits}`);
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
                userAgent: navigator.userAgent.substring(0, 200), // Limitáljuk a hosszt
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
            
            // Frissített megjelenítés globális számmal
            const visitElement = document.getElementById('visitCount');
            const localCount = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0');
            
            if (visitElement) {
                visitElement.innerHTML
