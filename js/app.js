// Fő alkalmazás inicializáló és koordinátor
class PerfectCircleApp {
    constructor() {
        this.initialized = false;
        this.playerName = '';
    }
    
    async init() {
        if (this.initialized) {
            console.warn('Alkalmazás már inicializálva');
            return;
        }
        
        console.log('🎮 Perfect Circle alkalmazás inicializálása...');
        
        try {
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
            
            this.initialized = true;
            console.log('✅ Perfect Circle alkalmazás sikeresen inicializálva');
            
        } catch (error) {
            console.error('❌ Alkalmazás inicializálási hiba:', error);
        }
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
                e.returnValue = 'Biztosan el szeretnéd hagyni az oldalt? A folyamatban lévő játék elvész.';
                return e.returnValue;
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
            }
        }
        
        // Egyedi billentyűk
        switch(e.key) {
            case 'Escape':
                // Játék megszakítása
                if (window.gameEngine && window.gameEngine.gameActive) {
                    window.gameEngine.clearCanvas();
                }
                break;
            case 'F1':
                e.preventDefault();
                this.showInstructions();
                break;
        }
    }
    
    initializeUI() {
        // Audio toggle gomb hozzáadása (opcionális)
        this.addAudioToggleButton();
        
        // Téma váltó gomb hozzáadása (opcionális)
        this.addThemeToggleButton();
        
        // Fejlett funkciók gomb hozzáadása
        this.addAdvancedFeaturesButton();
    }
    
    addAudioToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const audioBtn = document.createElement('button');
            audioBtn.innerHTML = '🔊 Hang';
            audioBtn.onclick = this.toggleAudio.bind(this);
            audioBtn.title = 'Hang be/ki kapcsolása';
            controls.appendChild(audioBtn);
        }
    }
    
    addThemeToggleButton() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const themeBtn = document.createElement('button');
            themeBtn.innerHTML = '🌙 Téma';
            themeBtn.onclick = this.toggleTheme.bind(this);
            themeBtn.title = 'Sötét/világos téma váltása';
            controls.appendChild(themeBtn);
        }
    }
    
    addAdvancedFeaturesButton() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const advancedBtn = document.createElement('button');
            advancedBtn.innerHTML = '⚙️ Fejlett';
            advancedBtn.onclick = this.showAdvancedFeatures.bind(this);
            advancedBtn.title = 'Fejlett funkciók';
            controls.appendChild(advancedBtn);
        }
    }
    
    toggleAudio() {
        const isEnabled = AudioManager.isEnabled();
        AudioManager.setEnabled(!isEnabled);
        
        const audioBtn = document.querySelector('button[title="Hang be/ki kapcsolása"]');
        if (audioBtn) {
            audioBtn.innerHTML = isEnabled ? '🔇 Hang Ki' : '🔊 Hang Be';
        }
        
        // Teszt hang lejátszása ha bekapcsoljuk
        if (!isEnabled) {
            AudioManager.playSuccessSound();
        }
        
        alert(isEnabled ? 'Hang kikapcsolva 🔇' : 'Hang bekapcsolva 🔊');
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        
        const themeBtn = document.querySelector('button[title="Sötét/világos téma váltása"]');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '☀️ Világos' : '🌙 Sötét';
        }
        
        // Téma mentése
        localStorage.setItem('perfectcircle_theme', isDark ? 'dark' : 'light');
        
        alert(isDark ? 'Sötét téma bekapcsolva 🌙' : 'Világos téma bekapcsolva ☀️');
    }
    
    showAdvancedFeatures() {
        const features = `
⚙️ FEJLETT FUNKCIÓK

🎮 BILLENTYŰ PARANCSOK:
• Ctrl+S: Rajzolás kezdése
• Ctrl+R: Törlés
• Ctrl+H: Segítség
• Ctrl+E: Eredmények exportálása
• Esc: Játék megszakítása
• F1: Segítség

📊 ADATKEZELÉS:
• Helyi eredmények exportálása/importálása
• Látogatási statisztikák
• Téma váltás
• Hang be/ki kapcsolása

🔧 HIBAKERESÉS:
• Firebase kapcsolat ellenőrzése
• Helyi adatok törlése
• Konzol naplók megtekintése

Szeretnéd használni ezeket a funkciókat?
        `;
        
        if (confirm(features)) {
            this.showAdvancedMenu();
        }
    }
    
    showAdvancedMenu() {
        const action = prompt(`
Válassz egy műveletet:

1 - Eredmények exportálása
2 - Eredmények importálása  
3 - Látogatási statisztikák
4 - Firebase státusz
5 - Helyi adatok törlése
6 - Konzol megnyitása
7 - Teljesítmény teszt

Add meg a szám:
        `);
        
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
                alert('Nyomd meg F12-t a fejlesztői konzol megnyitásához!');
                break;
            case '7':
                this.runPerformanceTest();
                break;
            default:
                if (action !== null) {
                    alert('Érvénytelen választás!');
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
            a.download = `perfect-circle-eredmenyek-${new Date().toLocaleDateString('hu-HU')}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            alert('Eredmények exportálva! ✅');
        } catch (error) {
            alert('Export hiba: ' + error.message);
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
                        alert(`✅ Sikeres import!\n${result.imported} eredmény importálva\nÖsszesen: ${result.total} eredmény`);
                        this.updateStats();
                        LeaderboardManager.refreshCurrentView();
                    } else {
                        alert(`❌ Import hiba: ${result.error}`);
                    }
                } catch (error) {
                    alert('Fájl olvasási hiba: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    clearAllData() {
        if (confirm('⚠️ FIGYELEM!\n\nEz törli az ÖSSZES helyi adatot:\n• Eredmények\n• Játékos név\n• Beállítások\n• Látogatási számláló\n\nBiztosan folytatod?')) {
            try {
                ScoreManager.clearScores();
                localStorage.removeItem('perfectcircle_playername');
                localStorage.removeItem('perfectcircle_theme');
                VisitorCounter.resetLocalCounter();
                
                this.updateStats();
                LeaderboardManager.refreshCurrentView();
                
                alert('✅ Minden helyi adat törölve!');
            } catch (error) {
                alert('Törlési hiba: ' + error.message);
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
    
    // Player name kezelés
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
            alert('Kérlek add meg a neved!');
            return false;
        }
        
        if (name.length > 20) {
            alert('A név maximum 20 karakter lehet!');
            return false;
        }
        
        localStorage.setItem('perfectcircle_playername', name);
        this.playerName = name;
        alert(`Név mentve: ${name} ✅`);
        return true;
    }
    
    getPlayerName() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput ? nameInput.value.trim() : '';
        return name || this.playerName || 'Névtelen';
    }
    
    // Statisztikák frissítése
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
    
    // Instrukciók megjelenítése
    showInstructions() {
        const instructions = `
🎯 PERFECT CIRCLE - TELJES ÚTMUTATÓ

📝 JÁTÉK CÉLJA:
Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!

🎮 IRÁNYÍTÁS:
• 🖱️ Egér: Kattints és húzd
• 📱 Mobil: Érintsd és húzd
• ⌨️ Billentyűk: Ctrl+S (start), Ctrl+R (törlés), Esc (stop)

📊 PONTOZÁSI RENDSZER (max 100 pont):
• 🔵 Köralak (40p): Mennyire kerek a formád
• 🔗 Záródás (20p): Mennyire zárul be jól a kör
• 📏 Egyenletesség (25p): Mennyire egyenletes a vonalvastagság  
• 📐 Méret (15p): Megfelelő méretű-e a kör

🎯 NEHÉZSÉGI SZINTEK:
• 🟢 Könnyű: 50-150px sugár, stabil UI
• 🔴 Nehéz: 20-190px sugár + forgó UI!

✨ VARÁZSLATOS TRANSZFORMÁCIÓK:
A köröd pontosan követi az alakodat és átalakul:
• ☀️ Nap • 🍕 Pizza • 🍩 Donut • 🌙 Hold
• 🌍 Földgömb • ⚽ Labda • 🕐 Óra • 🌸 Virág
• 😊 Emoji • 🍪 Keksz

🌍 GLOBÁLIS RANGLISTA:
• 👤 Add meg a neved a globális versenyhez!
• 🏆 Versenyezz játékosokkal világszerte!
• 📊 Firebase státusz: jobb felső sarokban
• 📴 Offline módban is játszhatsz!

👁️ LÁTOGATÁSSZÁMLÁLÓ:
• 📱 Helyi és 🌍 globális látogatások követése
• 🖱️ Kattints a számlálóra részletes statisztikákért!

🎉 ÜNNEPLÉSI EFFEKTEK:
• 95+ pont: 🎊 Konfetti + 🎆 Tűzijáték + 🎵 Fanfár
• 85+ pont: 🎊 Konfetti + 🎆 Tűzijáték + 🎵 Győzelmi dallam  
• 70+ pont: 🎊 Konfetti + 🔊 Siker hang

⚙️ FEJLETT FUNKCIÓK:
• 📤 Eredmények exportálása/importálása
• 🔊 Hang be/ki kapcsolása
• 🌙 Sötét/világos téma váltás
• ⌨️ Billentyű parancsok
• 📊 Teljesítmény teszt

💡 PROFI TIPPEK:
• 🐌 Lassan és egyenletesen rajzolj
• 🔄 Próbáld meg egy mozdulattal befejezni
• 📏 Tartsd egyenletesen a távolságot a középponttól
• 🎯 Zárd be pontosan ugyanott ahol kezdted
• 💪 Gyakorolj mindkét nehézségi szinten!

🏆 PONTOZÁSI TIPPEK:
• Köralak: Kerüld a szögletes részeket
• Záródás: Fejezd be pontosan a kezdőpontnál
• Egyenletesség: Tartsd állandó sebességgel
• Méret: Figyelj a nehézségi szint korlátaira

🔧 HIBAELHÁRÍTÁS:
• Firebase offline: Ellenőrizd a Firestore Rules-t
• Lassú teljesítmény: Próbáld ki a teljesítmény tesztet
• Hang problémák: Kapcsold be/ki a hangot

Sok sikert a tökéletes kör rajzolásához! 🍀✨
        `;
        
        alert(instructions);
    }
}

// Globális alkalmazás példány
window.perfectCircleApp = new PerfectCircleApp();

// Globális függvények a HTML-ből való híváshoz
window.savePlayerName = () => window.perfectCircleApp.savePlayerName();
window.getPlayerName = () => window.perfectCircleApp.getPlayerName();
window.showInstructions = () => window.perfectCircleApp.showInstructions();
window.clearAllScores = () => window.perfectCircleApp.clearAllData();
window.updateStats = () => window.perfectCircleApp.updateStats();

// Score megjelenítő függvény
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
    
    // Cím beállítása
    let title = '';
    if (score >= 95) title = '🏆 Tökéletes! Zseniális!';
    else if (score >= 85) title = '🌟 Kiváló! Nagyon jó!';
    else if (score >= 70) title = '👍 Jó munka!';
    else if (score >= 50) title = '👌 Nem rossz!';
    else title = '💪 Próbáld újra!';
    
    if (elements.scoreTitle) elements.scoreTitle.textContent = title;

    // Részletes pontszám megjelenítése
    if (!analysis.error && elements.scoreBreakdown) {
        elements.scoreBreakdown.innerHTML = `
            <div class="breakdown-item">
                <strong>Köralak</strong><br>
                ${analysis.shapeScore}/40 pont
            </div>
            <div class="breakdown-item">
                <strong>Záródás</strong><br>
                ${analysis.closureScore}/20 pont
            </div>
            <div class="breakdown-item">
                <strong>Egyenletesség</strong><br>
                ${analysis.smoothnessScore}/25 pont
            </div>
            <div class="breakdown-item">
                <strong>Méret</strong><br>
                ${analysis.sizeScore}/15 pont
            </div>
            ${transformationName ? `<div class="breakdown-item" style="grid-column: 1/-1; background: rgba(255,215,0,0.3);"><strong>✨ Transzformáció: ${transformationName}!</strong></div>` : ''}
        `;
    } else if (analysis.error && elements.scoreBreakdown) {
        elements.scoreBreakdown.innerHTML = `
            <div style="color: #ff6b6b; font-weight: bold;">${analysis.error}</div>
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
        if (playerName !== 'Névtelen' && window.firebaseAPI && window.firebaseAPI.isReady()) {
            try {
                await LeaderboardManager.saveGlobalScore(playerName, Math.round(score), window.gameEngine.getDifficulty(), transformationName);
                console.log('✅ Pontszám mentve globálisan!');
                
                if (LeaderboardManager.getCurrentView() === 'global') {
                    setTimeout(() => LeaderboardManager.loadGlobalLeaderboard(), 1000);
                }
            } catch (error) {
                console.warn('❌ Globális mentés sikertelen:', error);
            }
        } else if (playerName !== 'Névtelen') {
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

// Téma betöltése
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('perfectcircle_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});
