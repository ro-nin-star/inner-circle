// Circle Analyzer - Teljes verzió minden függvénnyel
class CircleAnalyzer {
    static analyzeCircle(points, difficulty = 'easy') {
        console.log('🔍 CircleAnalyzer.analyzeCircle hívva:', {
            pointsLength: points.length,
            difficulty: difficulty
        });
        
        if (!points || points.length < 10) {
            console.warn('⚠️ Túl kevés pont az elemzéshez:', points?.length);
            return {
                error: 'tooFewPoints',
                totalScore: 0,
                shapeScore: 0,
                closureScore: 0,
                smoothnessScore: 0,
                sizeScore: 0
            };
        }

        try {
            // Középpont és sugár számítása
            const center = this.calculateCenter(points);
            const radius = this.calculateRadius(points, center);
            
            console.log('📊 Számított középpont és sugár:', {center, radius});
            
            if (radius < 20) {
                console.warn('⚠️ Túl kicsi sugár:', radius);
                return {
                    error: 'tooSmall',
                    totalScore: 0,
                    shapeScore: 0,
                    closureScore: 0,
                    smoothnessScore: 0,
                    sizeScore: 0
                };
            }

            // Távolságok számítása a középponttól
            const distances = points.map(point => 
                Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
            );

            // Pontszámok számítása
            const shapeAccuracy = this.calculateShapeAccuracy(distances, radius);
            const closureAccuracy = this.calculateClosureAccuracy(points);
            const smoothnessAccuracy = this.calculateSmoothnessAccuracy(distances);
            const sizeAccuracy = this.calculateSizeAccuracy(radius);

            console.log('📊 Pontosság értékek:', {
                shapeAccuracy,
                closureAccuracy, 
                smoothnessAccuracy,
                sizeAccuracy
            });

            // Nehézségi szorzók
            const difficultyMultipliers = {
                easy: 1.0,
                medium: 0.9,
                hard: 0.8
            };
            const multiplier = difficultyMultipliers[difficulty] || 1.0;

            // Pontszámok számítása (0-100 skálán)
            const shapeScore = Math.round(Math.max(0, Math.min(40, shapeAccuracy * 40 * multiplier)));
            const closureScore = Math.round(Math.max(0, Math.min(20, closureAccuracy * 20 * multiplier)));
            const smoothnessScore = Math.round(Math.max(0, Math.min(25, smoothnessAccuracy * 25 * multiplier)));
            const sizeScore = Math.round(Math.max(0, Math.min(15, sizeAccuracy * 15 * multiplier)));

            const totalScore = shapeScore + closureScore + smoothnessScore + sizeScore;

            console.log('✅ Végső pontszámok:', {
                shapeScore,
                closureScore,
                smoothnessScore,
                sizeScore,
                totalScore
            });

            return {
                totalScore,
                shapeScore,
                closureScore,
                smoothnessScore,
                sizeScore,
                center,
                radius,
                distances,
                shapeAccuracy,
                closureAccuracy,
                smoothnessAccuracy,
                sizeAccuracy,
                difficulty,
                pointCount: points.length
            };

        } catch (error) {
            console.error('❌ CircleAnalyzer hiba:', error);
            return {
                error: 'analysisError',
                totalScore: 0,
                shapeScore: 0,
                closureScore: 0,
                smoothnessScore: 0,
                sizeScore: 0
            };
        }
    }

    static calculateCenter(points) {
        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        return {
            x: sumX / points.length,
            y: sumY / points.length
        };
    }

    static calculateRadius(points, center) {
        const distances = points.map(point => 
            Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
        );
        return distances.reduce((sum, d) => sum + d, 0) / distances.length;
    }

    static calculateShapeAccuracy(distances, radius) {
        if (distances.length === 0 || radius === 0) return 0;
        
        // Átlagos eltérés az ideális sugártól
        const deviations = distances.map(d => Math.abs(d - radius));
        const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
        
        // Pontosság: minél kisebb az eltérés, annál jobb
        const maxAllowedDeviation = radius * 0.3; // 30% eltérés még elfogadható
        const accuracy = Math.max(0, 1 - (avgDeviation / maxAllowedDeviation));
        
        console.log('🔵 Shape accuracy:', {
            avgDeviation,
            maxAllowedDeviation,
            accuracy,
            radius
        });
        
        return accuracy;
    }

    static calculateClosureAccuracy(points) {
        if (points.length < 2) return 0;
        
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        
        const distance = Math.sqrt(
            Math.pow(lastPoint.x - firstPoint.x, 2) + 
            Math.pow(lastPoint.y - firstPoint.y, 2)
        );
        
        // A kör "átmérőjének" becslése a pontok alapján
        const maxX = Math.max(...points.map(p => p.x));
        const minX = Math.min(...points.map(p => p.x));
        const maxY = Math.max(...points.map(p => p.y));
        const minY = Math.min(...points.map(p => p.y));
        const estimatedDiameter = Math.max(maxX - minX, maxY - minY);
        
        // Jó záródás: a kezdő és végpont közti távolság kicsi az átmérőhöz képest
        const maxAllowedDistance = estimatedDiameter * 0.1; // 10% az átmérőből
        const accuracy = Math.max(0, 1 - (distance / maxAllowedDistance));
        
        console.log('🔗 Closure accuracy:', {
            distance,
            estimatedDiameter,
            maxAllowedDistance,
            accuracy
        });
        
        return accuracy;
    }

    static calculateSmoothnessAccuracy(distances) {
        if (distances.length < 3) return 0;
        
        // Távolságok közötti változások
        const changes = [];
        for (let i = 1; i < distances.length; i++) {
            changes.push(Math.abs(distances[i] - distances[i-1]));
        }
        
        const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        
        // Simább kör = kisebb változások
        const maxAllowedChange = avgDistance * 0.2; // 20% változás még OK
        const accuracy = Math.max(0, 1 - (avgChange / maxAllowedChange));
        
        console.log('🌊 Smoothness accuracy:', {
            avgChange,
            avgDistance,
            maxAllowedChange,
            accuracy
        });
        
        return accuracy;
    }

    static calculateSizeAccuracy(radius) {
        // Ideális sugár: 50-150 pixel között
        const idealMinRadius = 50;
        const idealMaxRadius = 150;
        
        let accuracy = 1.0;
        
        if (radius < idealMinRadius) {
            accuracy = radius / idealMinRadius;
        } else if (radius > idealMaxRadius) {
            accuracy = Math.max(0.5, idealMaxRadius / radius);
        }
        
        console.log('📏 Size accuracy:', {
            radius,
            idealRange: `${idealMinRadius}-${idealMaxRadius}`,
            accuracy
        });
        
        return accuracy;
    }

    // HIÁNYZÓ FÜGGVÉNY - drawIdealCircle
    static drawIdealCircle(ctx, centerX, centerY, radius, userPoints = []) {
        if (!ctx) {
            console.warn('⚠️ drawIdealCircle: nincs canvas context');
            return;
        }

        console.log('🎨 drawIdealCircle hívva:', {centerX, centerY, radius});

        try {
            // Canvas törlése
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Felhasználó vonala (halvány)
            if (userPoints && userPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                
                ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Ideális kör
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]); // Szaggatott vonal
            ctx.stroke();
            ctx.setLineDash([]); // Visszaállítás

            // Középpont
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF5722';
            ctx.fill();

            // Sugár vonal
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + radius, centerY);
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 2;
            ctx.stroke();

            console.log('✅ Ideális kör kirajzolva');

        } catch (error) {
            console.error('❌ drawIdealCircle hiba:', error);
        }
    }

    // Összehasonlító elemzés
    static compareWithIdeal(userPoints, idealCenter, idealRadius) {
        if (!userPoints || userPoints.length === 0) {
            return {
                error: 'noPoints',
                accuracy: 0
            };
        }

        try {
            // Felhasználó pontjainak távolsága az ideális középponttól
            const userDistances = userPoints.map(point => 
                Math.sqrt(
                    Math.pow(point.x - idealCenter.x, 2) + 
                    Math.pow(point.y - idealCenter.y, 2)
                )
            );

            // Eltérések az ideális sugártól
            const deviations = userDistances.map(dist => Math.abs(dist - idealRadius));
            const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
            const maxDeviation = Math.max(...deviations);

            // Pontosság számítása
            const maxAllowedDeviation = idealRadius * 0.2; // 20% eltérés
            const accuracy = Math.max(0, 1 - (avgDeviation / maxAllowedDeviation));

            return {
                accuracy,
                avgDeviation,
                maxDeviation,
                idealRadius,
                userDistances,
                deviations
            };

        } catch (error) {
            console.error('❌ compareWithIdeal hiba:', error);
            return {
                error: 'comparisonError',
                accuracy: 0
            };
        }
    }

    // Debug információk
    static getDebugInfo(points, analysis) {
        if (!points || !analysis) {
            return 'Nincs adat';
        }

        return {
            pointCount: points.length,
            center: analysis.center,
            radius: analysis.radius,
            scores: {
                shape: analysis.shapeScore,
                closure: analysis.closureScore,
                smoothness: analysis.smoothnessScore,
                size: analysis.sizeScore,
                total: analysis.totalScore
            },
            accuracies: {
                shape: analysis.shapeAccuracy,
                closure: analysis.closureAccuracy,
                smoothness: analysis.smoothnessAccuracy,
                size: analysis.sizeAccuracy
            }
        };
    }

    // Statisztikák
    static getStatistics(points, center, radius) {
        if (!points || points.length === 0) {
            return null;
        }

        const distances = points.map(point => 
            Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
        );

        const minDistance = Math.min(...distances);
        const maxDistance = Math.max(...distances);
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
        const standardDeviation = Math.sqrt(variance);

        return {
            minDistance,
            maxDistance,
            avgDistance,
            variance,
            standardDeviation,
            radiusDeviation: Math.abs(avgDistance - radius),
            consistency: 1 - (standardDeviation / radius) // 0-1 skála
        };
    }
}

// Globális hozzáférés
window.CircleAnalyzer = CircleAnalyzer;

// Fallback biztosítása
window.ensureCircleAnalyzer = function() {
    if (!window.CircleAnalyzer) {
        console.warn('🔧 CircleAnalyzer fallback betöltése...');
        window.CircleAnalyzer = CircleAnalyzer;
    }
    
    // Ellenőrizzük hogy minden függvény létezik
    const requiredMethods = ['analyzeCircle', 'drawIdealCircle', 'compareWithIdeal'];
    requiredMethods.forEach(method => {
        if (typeof window.CircleAnalyzer[method] !== 'function') {
            console.error(`❌ CircleAnalyzer.${method} hiányzik!`);
        }
    });
};

console.log('✅ CircleAnalyzer betöltve minden függvénnyel');
console.log('🔍 Elérhető metódusok:', Object.getOwnPropertyNames(CircleAnalyzer));
