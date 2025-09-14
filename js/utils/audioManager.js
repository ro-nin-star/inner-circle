// Hang kezelő
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
    }
    
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    playNote(frequency, duration, waveType = 'sine') {
        if (!this.enabled) return;
        
        try {
            this.initAudio();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Audio lejátszási hiba:', error);
        }
    }
    
    playTransformationSound() {
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.playNote(freq, 0.3, 'sine'), index * 200);
        });
    }
    
    playCheerSound(score) {
        if (score >= 95) this.playFanfare();
        else if (score >= 85) this.playVictoryTune();
        else if (score >= 70) this.playSuccessSound();
        else if (score >= 50) this.playNeutralSound();
        else this.playSadSound();
    }
    
    playFanfare() {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            setTimeout(() => this.playNote(freq, 0.3, 'square'), index * 150);
        });
    }
    
    playVictoryTune() {
        const notes = [392.00, 440.00, 493.88];
        notes.forEach((freq, index) => {
            setTimeout(() => this.playNote(freq, 0.2, 'sine'), index * 100);
        });
    }
    
    playSuccessSound() {
        this.playNote(523.25, 0.3, 'sine');
        setTimeout(() => this.playNote(659.25, 0.2, 'sine'), 100);
    }
    
    playNeutralSound() {
        this.playNote(440.00, 0.2, 'sine');
    }
    
    playSadSound() {
        this.playNote(220.00, 0.4, 'sawtooth');
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    isEnabled() {
        return this.enabled;
    }
}

// Globális példány
window.AudioManager = new AudioManager();
