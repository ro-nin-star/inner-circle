// Kör elemzési algoritmusok
class CircleAnalyzer {
    static difficulties = {
        easy: { minRadius: 50, maxRadius: 150, tolerance: 0.85 },
        hard: { minRadius: 20, maxRadius: 190, tolerance: 0.95 }
    };
    
    static analyzeCircle(points, difficulty = 'easy') {
        if (points.length < 10) {
            return {
                error: 'Túl kevés pont! Rajzolj egy teljes kört.',
                score: 0
            };
        }

        // Középpont számítása
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

        // Távolságok számítása
        const distances = points.map(p => 
            Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
        );

        const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const minRadius = Math.min(...distances);
        const maxRadius = Math.max(...distances);

        const analysis = {
            centerX: centerX,
            centerY: centerY,
            avgRadius: avgRadius,
            minRadius: minRadius,
            maxRadius: maxRadius,
            pointCount: points.length
        };

        // Pontszám számítás
        const scores = this.calculateScores(points, analysis, difficulty);
        
        return {
            ...analysis,
            ...scores,
            totalScore: scores.totalScore
        };
    }
    
    static calculateScores(points, analysis, difficulty) {
        const { centerX, centerY, avgRadius, minRadius, maxRadius } = analysis;
        
        // 1. Köralak pontszám (40 pont)
        const radiusVariation = (maxRadius - minRadius) / avgRadius;
        const shapeScore = Math.max(0, 40 * (1 - radiusVariation * 2));

        // 2. Záródás pontszám (20 pont)
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        const closureDistance = Math.sqrt(
            (firstPoint.x - lastPoint.x) ** 2 + (firstPoint.y - lastPoint.y) ** 2
        );
        const closureScore = Math.max(0, 20 * (1 - closureDistance / avgRadius));

        // 3. Egyenletesség pontszám (25 pont)
        const distances = points.map(p => 
            Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
        );
        const radiusDeviations = distances.map(d => Math.abs(d - avgRadius));
        const avgDeviation = radiusDeviations.reduce((sum, d) => sum + d, 0) / radiusDeviations.length;
        const smoothnessScore = Math.max(0, 25 * (1 - avgDeviation / avgRadius * 3));

        // 4. Méret pontszám (15 pont)
        const difficultySettings = this.difficulties[difficulty];
        const sizeScore = (avgRadius >= difficultySettings.minRadius && avgRadius <= difficultySettings.maxRadius) ? 15 : 0;

        const totalScore = Math.min(100, shapeScore + closureScore + smoothnessScore + sizeScore);

        return {
            shapeScore: Math.round(shapeScore),
            closureScore: Math.round(closureScore),
            smoothnessScore: Math.round(smoothnessScore),
            sizeScore: Math.round(sizeScore),
            totalScore: Math.round(totalScore),
            radiusVariation: radiusVariation,
            closureDistance: closureDistance,
            avgDeviation: avgDeviation
        };
    }
    
    static drawIdealCircle(centerX, centerY, radius) {
        const ctx = window.gameEngine.getContext();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// Globális hozzáférés
window.CircleAnalyzer = CircleAnalyzer;
