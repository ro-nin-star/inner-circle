// Hang kezelő - Javított verzió
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initialized = false;
    }
    
    initAudio() {
        if (this.initialized) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // AudioContext engedélyezése user interaction után
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.initialized = true;
            console.log('🔊 AudioManager inicializálva');
        } catch (error) {
            console.warn('🔇 AudioContext nem támogatott:', error);
            this.enabled = false;
        }
    }
    
    playNote(frequency, duration, waveType = 'sine', volume = 0.1) {
        if (!this.enabled) return;
        
        try {
            this.initAudio();
            
            if (!this.audioContext) {
                console.warn('🔇 AudioContext nem elérhető');
                return;
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('🔇 Audio lejátszási hiba:', error);
        }
    }
    
    // TRANSZFORMÁCIÓS HANG - Ez hiányzott!
    playTransformationSound() {
        if (!this.enabled) return;
        
        console.log('🎵 Transzformációs hang lejátszása...');
        
        try {
            // Varázslatos transzformációs dallam
            const notes = [
                { freq: 523.25, delay: 0, duration: 0.3 },    // C5
                { freq: 659.25, delay: 150, duration: 0.3 },  // E5
                { freq: 783.99, delay: 300, duration: 0.3 },  // G5
                { freq: 1046.50, delay: 450, duration: 0.4 }, // C6
                { freq: 1318.51, delay: 600, duration: 0.5 }  // E6
            ];
            
            notes.forEach((note, index) => {
                setTimeout(() => {
                    this.playNote(note.freq, note.duration, 'sine', 0.08);
                }, note.delay);
            });
            
            // Visszhang effekt
            setTimeout(() => {
                notes.forEach((note, index) => {
                    setTimeout(() => {
                        this.playNote(note.freq * 0.5, note.duration * 0.7, 'triangle', 0.04);
                    }, note.delay * 0.5);
                });
            }, 200);
            
        } catch (error) {
            console.warn('🔇 Transzformációs hang hiba:', error);
        }
    }
    
    playCheerSound(score) {
        if (!this.enabled) return;
        
        console.log(`🎵 Ünneplő hang lejátszása: ${score} pont`);
        
        if (score >= 95) this.playFanfare();
        else if (score >= 85) this.playVictoryTune();
        else if (score >= 70) this.playSuccessSound();
        else if (score >= 50) this.playNeutralSound();
        else this.playSadSound();
    }
    
    playFanfare() {
        console.log('🎺 Fanfár lejátszása...');
        const notes = [
            { freq: 261.63, delay: 0 },    // C4
            { freq: 329.63, delay: 150 },  // E4
            { freq: 392.00, delay: 300 },  // G4
            { freq: 523.25, delay: 450 },  // C5
            { freq: 659.25, delay: 600 },  // E5
            { freq: 783.99, delay: 750 }   // G5
        ];
        
        notes.forEach(note => {
            setTimeout(() => this.playNote(note.freq, 0.4, 'square', 0.12), note.delay);
        });
    }
    
    playVictoryTune() {
        console.log('🏆 Győzelmi dallam lejátszása...');
        const notes = [
            { freq: 392.00, delay: 0 },    // G4
            { freq: 440.00, delay: 120 },  // A4
            { freq: 493.88, delay: 240 },  // B4
            { freq: 523.25, delay: 360 }   // C5
        ];
        
        notes.forEach(note => {
            setTimeout(() => this.playNote(note.freq, 0.25, 'sine', 0.1), note.delay);
        });
    }
    
    playSuccessSound() {
        console.log('✅ Siker hang lejátszása...');
        this.playNote(523.25, 0.3, 'sine', 0.08);
        setTimeout(() => this.playNote(659.25, 0.2, 'sine', 0.06), 150);
    }
    
    playNeutralSound() {
        console.log('👌 Semleges hang lejátszása...');
        this.playNote(440.00, 0.25, 'sine', 0.06);
    }
    
    playSadSound() {
        console.log('😞 Szomorú hang lejátszása...');
        this.playNote(220.00, 0.5, 'sawtooth', 0.05);
        setTimeout(() => this.playNote(196.00, 0.3, 'sawtooth', 0.03), 200);
    }
    
    // Egyszerű hangok
    playClickSound() {
        this.playNote(800, 0.1, 'square', 0.03);
    }
    
    playHoverSound() {
        this.playNote(600, 0.05, 'sine', 0.02);
    }
    
    playErrorSound() {
        this.playNote(150, 0.3, 'sawtooth', 0.08);
    }
    
    // Beállítások
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`🔊 Audio ${enabled ? 'bekapcsolva' : 'kikapcsolva'}`);
        
        if (enabled) {
            this.initAudio();
        }
    }
    
    isEnabled() {
        return this.enabled;
    }
    
    getVolume() {
        return this.enabled ? 1 : 0;
    }
    
    // Teszt függvény
    testAudio() {
        console.log('🎵 Audio teszt...');
        this.playSuccessSound();
        setTimeout(() => this.playTransformationSound(), 1000);
    }
    
    // Cleanup
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.initialized = false;
        console.log('🔇 AudioManager megsemmisítve');
    }
}

// Globális példány létrehozása
const audioManager = new AudioManager();

// Globális hozzáférés
window.AudioManager = audioManager;

// User interaction után audio inicializálás
document.addEventListener('click', () => {
    if (!audioManager.initialized) {
        audioManager.initAudio();
    }
}, { once: true });

document.addEventListener('touchstart', () => {
    if (!audioManager.initialized) {
        audioManager.initAudio();
    }
}, { once: true });

// Debug információk
console.log('🔊 AudioManager betöltve');

// Export a modulok számára
if (typeof module !== 'undefined' && module.exports) {
    module.exports = audioManager;
}
