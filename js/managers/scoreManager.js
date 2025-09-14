// Helyi pontszám kezelő
class ScoreManager {
    static STORAGE_KEY = 'perfectcircle_scores';
    static MAX_SCORES = 10;
    
    static getScores() {
        try {
            const scores = localStorage.getItem(this.STORAGE_KEY);
            return scores ? JSON.parse(scores) : [];
        } catch (error) {
            console.error('Pontszámok betöltési hiba:', error);
            return [];
        }
    }

    static saveScore(score, analysis, difficulty, transformation) {
        try {
            const scores = this.getScores();
            const newScore = {
                id: Date.now(),
                score: Math.round(score),
                analysis: analysis,
                difficulty: difficulty,
                transformation: transformation,
                date: new Date().toLocaleDateString('hu-HU'),
                timestamp: Date.now()
            };

            scores.push(newScore);
            scores.sort((a, b) => b.score - a.score);
            
            // Csak a legjobb 10 eredményt tartjuk meg
            const topScores = scores.slice(0, this.MAX_SCORES);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
            
            console.log('✅ Helyi pontszám mentve:', newScore);
            return newScore;
        } catch (error) {
            console.error('Pontszám mentési hiba:', error);
            return null;
        }
    }

    static clearScores() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('✅ Helyi pontszámok törölve');
            return true;
        } catch (error) {
            console.error('Pontszámok törlési hiba:', error);
            return false;
        }
    }

    static getStats() {
        const scores = this.getScores();
        if (scores.length === 0) {
            return { best: 0, average: 0, games: 0 };
        }

        const best = Math.max(...scores.map(s => s.score));
        const total = scores.reduce((sum, s) => sum + s.score, 0);
        const average = Math.round(total / scores.length);
        
        return { 
            best, 
            average, 
            games: scores.length,
            total: total
        };
    }
    
    static getScoreById(id) {
        const scores = this.getScores();
        return scores.find(score => score.id === id);
    }
    
    static deleteScore(id) {
        try {
            const scores = this.getScores();
            const filteredScores = scores.filter(score => score.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredScores));
            console.log('✅ Pontszám törölve:', id);
            return true;
        } catch (error) {
            console.error('Pontszám törlési hiba:', error);
            return false;
        }
    }
    
    static exportScores() {
        const scores = this.getScores();
        const stats = this.getStats();
        
        const exportData = {
            scores: scores,
            stats: stats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    static importScores(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.scores || !Array.isArray(importData.scores)) {
                throw new Error('Érvénytelen formátum');
            }
            
            // Validáció
            const validScores = importData.scores.filter(score => 
                score.id && 
                typeof score.score === 'number' && 
                score.score >= 0 && 
                score.score <= 100 &&
                score.date &&
                score.difficulty
            );
            
            if (validScores.length === 0) {
                throw new Error('Nincsenek érvényes pontszámok');
            }
            
            // Meglévő pontszámokkal egyesítés
            const existingScores = this.getScores();
            const allScores = [...existingScores, ...validScores];
            
            // Duplikátumok eltávolítása ID alapján
            const uniqueScores = allScores.filter((score, index, self) => 
                index === self.findIndex(s => s.id === score.id)
            );
            
            // Rendezés és limitálás
            uniqueScores.sort((a, b) => b.score - a.score);
            const finalScores = uniqueScores.slice(0, this.MAX_SCORES);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalScores));
            
            console.log(`✅ ${validScores.length} pontszám importálva`);
            return {
                success: true,
                imported: validScores.length,
                total: finalScores.length
            };
            
        } catch (error) {
            console.error('Import hiba:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Globális hozzáférés
window.ScoreManager = ScoreManager;
