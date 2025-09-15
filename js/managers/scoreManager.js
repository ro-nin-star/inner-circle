// js/managers/scoreManager.js - TELJES VERZIÓ

window.ScoreManager = {
    STORAGE_KEY: 'perfectcircle_scores',
    
    // Összes score lekérése
    getScores: function() {
        try {
            const scores = localStorage.getItem(this.STORAGE_KEY);
            if (!scores) return [];
            
            const parsed = JSON.parse(scores);
            if (!Array.isArray(parsed)) return [];
            
            // Rendezés pontszám szerint csökkenő sorrendben
            return parsed.sort((a, b) => (b.score || 0) - (a.score || 0));
        } catch (error) {
            console.error('❌ getScores hiba:', error);
            return [];
        }
    },

    // Statisztikák számítása
    getStats: function() {
        try {
            const scores = this.getScores();
            
            if (scores.length === 0) {
                return {
                    currentScore: 0,
                    best: 0,
                    bestScore: 0,
                    games: 0,
                    gamesPlayed: 0,
                    average: 0,
                    averageScore: 0,
                    total: 0
                };
            }
            
            const scoreValues = scores.map(s => s.score || 0);
            const best = Math.max(...scoreValues);
            const total = scoreValues.reduce((sum, score) => sum + score, 0);
            const average = total / scores.length;
            const current = scores[0]?.score || 0; // Legutóbbi score
            
            return {
                currentScore: current,
                best: best,
                bestScore: best, // Alias
                games: scores.length,
                gamesPlayed: scores.length, // Alias
                average: average,
                averageScore: average, // Alias
                total: total
            };
        } catch (error) {
            console.error('❌ getStats hiba:', error);
            return {
                currentScore: 0,
                best: 0,
                bestScore: 0,
                games: 0,
                gamesPlayed: 0,
                average: 0,
                averageScore: 0,
                total: 0
            };
        }
    },

    // Score mentése
    saveScore: function(score, analysis, difficulty = 'easy', transformationName = '', thumbnailData = null) {
        try {
            console.log('💾 ScoreManager.saveScore hívva:', { score, analysis, difficulty, transformationName, hasThumbnail: !!thumbnailData });
            
            // Validálás
            if (typeof score !== 'number' || score < 0 || score > 100) {
                throw new Error('Érvénytelen pontszám: ' + score);
            }
            
            // Játékos név lekérése
            const playerNameInput = document.getElementById('playerName');
            const playerName = playerNameInput ? playerNameInput.value.trim() : '';
            
            // Score objektum létrehozása
            const scoreData = {
                id: Date.now() + Math.random(),
                score: Math.round(score),
                playerName: playerName || 'Névtelen',
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('hu-HU'),
                time: new Date().toLocaleTimeString('hu-HU'),
                analysis: analysis || {},
                difficulty: difficulty,
                transformation: transformationName || '',
                thumbnail: thumbnailData || null
            };
            
            // Mentés localStorage-ba
            const scores = this.getScores();
            scores.unshift(scoreData); // Legújabb elöl
            
            // Maximum 50 eredmény tárolása (thumbnail miatt)
            if (scores.length > 50) {
                scores.splice(50);
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
            
            console.log('✅ Score mentve:', scoreData);
            return scoreData;
            
        } catch (error) {
            console.error('❌ ScoreManager.saveScore hiba:', error);
            throw error;
        }
    },

    // Összes score törlése
    clearScores: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('✅ Összes score törölve');
            return true;
        } catch (error) {
            console.error('❌ clearScores hiba:', error);
            return false;
        }
    },

    // Thumbnail lekérése score-hoz
    getThumbnail: function(scoreId) {
        try {
            const scores = this.getScores();
            const score = scores.find(s => s.id === scoreId);
            return score ? score.thumbnail : null;
        } catch (error) {
            console.error('❌ getThumbnail hiba:', error);
            return null;
        }
    },

    // Thumbnail frissítése meglévő score-hoz
    updateThumbnail: function(scoreId, thumbnailData) {
        try {
            const scores = this.getScores();
            const scoreIndex = scores.findIndex(s => s.id === scoreId);
            
            if (scoreIndex !== -1) {
                scores[scoreIndex].thumbnail = thumbnailData;
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
                console.log('✅ Thumbnail frissítve score-hoz:', scoreId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ updateThumbnail hiba:', error);
            return false;
        }
    },

    // Legjobb score lekérése nehézség szerint
    getBestScore: function(difficulty = null) {
        try {
            const scores = this.getScores();
            let filteredScores = scores;
            
            if (difficulty) {
                filteredScores = scores.filter(s => s.difficulty === difficulty);
            }
            
            if (filteredScores.length === 0) return 0;
            
            return Math.max(...filteredScores.map(s => s.score || 0));
        } catch (error) {
            console.error('❌ getBestScore hiba:', error);
            return 0;
        }
    },

    // Statisztikák nehézség szerint
    getStatsByDifficulty: function(difficulty) {
        try {
            const allScores = this.getScores();
            const scores = allScores.filter(s => s.difficulty === difficulty);
            
            if (scores.length === 0) {
                return {
                    best: 0,
                    games: 0,
                    average: 0,
                    total: 0
                };
            }
            
            const scoreValues = scores.map(s => s.score || 0);
            const best = Math.max(...scoreValues);
            const total = scoreValues.reduce((sum, score) => sum + score, 0);
            const average = total / scores.length;
            
            return {
                best: best,
                games: scores.length,
                average: average,
                total: total
            };
        } catch (error) {
            console.error('❌ getStatsByDifficulty hiba:', error);
            return {
                best: 0,
                games: 0,
                average: 0,
                total: 0
            };
        }
    },

    // Adatok exportálása
    exportData: function() {
        try {
            const scores = this.getScores();
            const stats = this.getStats();
            
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                scores: scores,
                stats: stats
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('❌ exportData hiba:', error);
            return null;
        }
    },

    // Adatok importálása
    importData: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.scores || !Array.isArray(data.scores)) {
                throw new Error('Érvénytelen adatformátum');
            }
            
            // Meglévő adatok mentése
            const existingScores = this.getScores();
            
            // Új adatok mentése
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.scores));
            
            console.log('✅ Adatok importálva:', data.scores.length, 'eredmény');
            return true;
        } catch (error) {
            console.error('❌ importData hiba:', error);
            return false;
        }
    }
};

console.log('✅ ScoreManager betöltve teljes funkcionalitással');
