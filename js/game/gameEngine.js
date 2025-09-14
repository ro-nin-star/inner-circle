// Fő játék motor
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.points = [];
        this.gameActive = false;
        this.difficulty = 'easy';
        this.currentGameId = null;
        this.currentTransformation = null;
        
        this.initEventListeners();
        this.initCanvas();
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.redrawTransformation();
        });
    }
    
    resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        const maxWidth = Math.min(400, container.offsetWidth - 20);
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxWidth + 'px';
    }
    
    initEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startPath(e));
        this.canvas.addEventListener('mousemove', (e) => this.drawPath(e));
        this.canvas.addEventListener('mouseup', (e) => this.endPath(e));
        this.canvas.addEventListener('mouseleave', (e) => this.endPath(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.startPath(e));
        this.canvas.addEventListener('touchmove', (e) => this.drawPath(e));
        this.canvas.addEventListener('touchend', (e) => this.endPath(e));
    }
    
    getEventPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }
    
    startPath(e) {
        if (!this.gameActive) return;
        
        this.isDrawing = true;
        const pos = this.getEventPos(e);
        this.points = [pos];
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }
    
    drawPath(e) {
        if (!this.gameActive || !this.isDrawing) return;
        
        e.preventDefault();
        const pos = this.getEventPos(e);
        this.points.push(pos);
        
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#1e3c72';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }
    
    endPath(e) {
        if (!this.gameActive || !this.isDrawing) return;
        
        this.isDrawing = false;
        this.gameActive = false;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('clearBtn').disabled = true;
        
        if (this.points.length > 10) {
            this.analyzeAndShowResults();
        } else {
            window.showScore(0, { error: 'Túl kevés pont! Rajzolj egy teljes kört.' });
        }
    }
    
    startDrawing() {
        this.gameActive = true;
        this.points = [];
        this.currentTransformation = null;
        this.clearCanvas();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('clearBtn').disabled = false;
        document.getElementById('scoreDisplay').classList.remove('show');
        
        this.currentGameId = Date.now();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
        this.currentTransformation = null;
    }
    
    analyzeAndShowResults() {
        const analysis = CircleAnalyzer.analyzeCircle(this.points, this.difficulty);
        
        if (analysis.error) {
            window.showScore(0, analysis);
            return;
        }
        
        // Ideális kör megrajzolása
        CircleAnalyzer.drawIdealCircle(analysis.centerX, analysis.centerY, analysis.avgRadius);
        
        // Transzformáció alkalmazása
        if (analysis.totalScore > 0) {
            setTimeout(() => {
                const transformationName = this.transformCircle(analysis.centerX, analysis.centerY, analysis.avgRadius);
                window.showScore(analysis.totalScore, analysis, transformationName);
            }, 1000);
        } else {
            window.showScore(analysis.totalScore, analysis);
        }
    }
    
    transformCircle(centerX, centerY, radius) {
        const overlay = document.getElementById('transformationOverlay');
        const transformationText = document.getElementById('transformationText');
        
        const randomTransformation = TransformationManager.getRandomTransformation();
        this.currentTransformation = randomTransformation;
        
        transformationText.textContent = `A köröd ${randomTransformation.name}-átlakult! ${randomTransformation.emoji}`;
        overlay.classList.add('show');
        
        EffectsManager.createMagicSparkles(centerX, centerY, radius);
        AudioManager.playTransformationSound();
        
        setTimeout(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            randomTransformation.draw(centerX, centerY, radius, this.points);
        }, 1500);
        
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 3000);
        
        return randomTransformation.name;
    }
    
    redrawTransformation() {
        if (this.currentTransformation && this.points.length > 0) {
            const centerX = this.points.reduce((sum, p) => sum + p.x, 0) / this.points.length;
            const centerY = this.points.reduce((sum, p) => sum + p.y, 0) / this.points.length;
            const distances = this.points.map(p => 
                Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
            );
            const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentTransformation.draw(centerX, centerY, avgRadius, this.points);
        }
    }
    
    setDifficulty(level) {
        this.difficulty = level;
        const container = document.getElementById('gameContainer');
        
        if (level === 'hard') {
            container.classList.add('hard-mode');
        } else {
            container.classList.remove('hard-mode');
        }
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${level}"]`).classList.add('active');
    }
    
    getContext() {
        return this.ctx;
    }
    
    getCurrentGameId() {
        return this.currentGameId;
    }
    
    getPoints() {
        return this.points;
    }
    
    getDifficulty() {
        return this.difficulty;
    }
}

// Globális hozzáférés
window.gameEngine = new GameEngine();

// Globális függvények a HTML-ből való híváshoz
window.startDrawing = () => window.gameEngine.startDrawing();
window.clearCanvas = () => window.gameEngine.clearCanvas();
window.setDifficulty = (level) => window.gameEngine.setDifficulty(level);
