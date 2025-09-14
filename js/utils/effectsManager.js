// Vizuális effektek kezelő
class EffectsManager {
    static createMagicSparkles(centerX, centerY, radius) {
        const container = document.querySelector('.canvas-container');
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'magic-sparkle';
                
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                sparkle.style.left = x + 'px';
                sparkle.style.top = y + 'px';
                sparkle.style.animationDelay = Math.random() * 1 + 's';
                
                container.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 2000);
            }, i * 100);
        }
    }
    
    static createConfetti(intensity = 50) {
        const container = document.getElementById('gameContainer');
        const colors = ['#4fc3f7', '#29b6f6', '#0277bd', '#1e3c72', '#2a5298', '#FFD700'];
        
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 50);
        }
    }
    
    static createFireworks(x, y, intensity = 20) {
        const container = document.getElementById('gameContainer');
        const colors = ['#4fc3f7', '#29b6f6', '#0277bd', '#FFD700', '#FFFFFF'];
        
        for (let i = 0; i < intensity; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            
            const angle = (Math.PI * 2 * i) / intensity;
            const distance = Math.random() * 100 + 50;
            
            firework.style.left = x + Math.cos(angle) * distance + 'px';
            firework.style.top = y + Math.sin(angle) * distance + 'px';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            container.appendChild(firework);
            
            setTimeout(() => {
                if (firework.parentNode) {
                    firework.parentNode.removeChild(firework);
                }
            }, 1000);
        }
    }
    
    static celebrateScore(score) {
        const container = document.getElementById('gameContainer');
        
        if (score >= 95) {
            container.classList.add('excellent-pulse');
            this.createConfetti(100);
            this.createFireworks(300, 200, 30);
            setTimeout(() => container.classList.remove('excellent-pulse'), 2000);
            
            this.animateStatElement('currentScoreStat');
            
        } else if (score >= 85) {
            this.createConfetti(60);
            this.createFireworks(300, 200, 20);
            this.animateStatElement('currentScoreStat');
            
        } else if (score >= 70) {
            this.createConfetti(30);
        } else if (score < 50) {
            container.classList.add('shake');
            setTimeout(() => container.classList.remove('shake'), 500);
        }
    }
    
    static animateStatElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('celebrating');
            setTimeout(() => {
                element.classList.remove('celebrating');
            }, 800);
        }
    }
    
    static showScoreAnimation() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.classList.add('show');
        }
    }
    
    static highlightLeaderboardEntry(entryId) {
        const entries = document.querySelectorAll('.score-entry');
        entries.forEach(entry => {
            if (entry.dataset.id === entryId) {
                entry.classList.add('current');
            }
        });
    }
}

// Globális hozzáférés
window.EffectsManager = EffectsManager;
