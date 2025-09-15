// JAVÍTOTT CIRCLE TRANSFORMATIONS - PONTOS SKÁLÁZÁS

// Biztonságos értékvalidáló függvények
function safeFiniteValue(value, defaultValue = 0) {
    if (typeof value !== 'number' || !isFinite(value) || isNaN(value)) {
        console.warn('⚠️ Nem véges érték javítva:', value, '->', defaultValue);
        return defaultValue;
    }
    return value;
}

function validateRadius(radius, minRadius = 1, maxRadius = 500) {
    const safe = safeFiniteValue(radius, 50);
    return Math.max(minRadius, Math.min(safe, maxRadius));
}

function validateCoordinate(coord, canvasSize = 400) {
    const safe = safeFiniteValue(coord, canvasSize / 2);
    return Math.max(0, Math.min(safe, canvasSize));
}

// Biztonságos gradient létrehozó függvény
function createSafeRadialGradient(ctx, x0, y0, r0, x1, y1, r1) {
    try {
        const canvas = ctx.canvas;
        const safeX0 = validateCoordinate(x0, canvas.width);
        const safeY0 = validateCoordinate(y0, canvas.height);
        const safeR0 = validateRadius(r0, 0, 1000);
        const safeX1 = validateCoordinate(x1, canvas.width);
        const safeY1 = validateCoordinate(y1, canvas.height);
        const safeR1 = validateRadius(r1, 1, 1000);
        
        return ctx.createRadialGradient(safeX0, safeY0, safeR0, safeX1, safeY1, safeR1);
    } catch (error) {
        console.error('❌ Gradient létrehozási hiba:', error);
        return null;
    }
}

// ✅ JAVÍTOTT: Pontos középpont számítás a felhasználói pontokból
function calculateUserCircleCenter(points) {
    if (!points || points.length === 0) return null;
    
    let sumX = 0, sumY = 0, validPoints = 0;
    
    points.forEach(point => {
        if (point && typeof point.x === 'number' && typeof point.y === 'number' && 
            isFinite(point.x) && isFinite(point.y)) {
            sumX += point.x;
            sumY += point.y;
            validPoints++;
        }
    });
    
    if (validPoints === 0) return null;
    
    return {
        x: sumX / validPoints,
        y: sumY / validPoints
    };
}

// ✅ JAVÍTOTT: Pontos skálázású path rajzoló függvény
function drawScaledPath(ctx, points, actualCenterX, actualCenterY, scaleFactor = 1) {
    if (!ctx || !points || points.length === 0) return false;
    
    try {
        const canvas = ctx.canvas;
        
        // A felhasználó által rajzolt kör tényleges középpontja
        const userCenter = calculateUserCircleCenter(points);
        if (!userCenter) return false;
        
        const userCenterX = validateCoordinate(userCenter.x, canvas.width);
        const userCenterY = validateCoordinate(userCenter.y, canvas.height);
        const targetCenterX = validateCoordinate(actualCenterX, canvas.width);
        const targetCenterY = validateCoordinate(actualCenterY, canvas.height);
        
        ctx.beginPath();
        let hasValidPoint = false;
        
        points.forEach((point, index) => {
            if (point && typeof point.x === 'number' && typeof point.y === 'number' && 
                isFinite(point.x) && isFinite(point.y)) {
                
                // Relatív pozíció a felhasználói középponthoz képest
                const relativeX = point.x - userCenterX;
                const relativeY = point.y - userCenterY;
                
                // Skálázás és új középponthoz igazítás
                const scaledX = targetCenterX + (relativeX * scaleFactor);
                const scaledY = targetCenterY + (relativeY * scaleFactor);
                
                const safeX = validateCoordinate(scaledX, canvas.width);
                const safeY = validateCoordinate(scaledY, canvas.height);
                
                if (!hasValidPoint) {
                    ctx.moveTo(safeX, safeY);
                    hasValidPoint = true;
                } else {
                    ctx.lineTo(safeX, safeY);
                }
            }
        });
        
        if (hasValidPoint) {
            ctx.closePath();
        }
        
        return hasValidPoint;
    } catch (error) {
        console.error('❌ Skálázott path rajzolási hiba:', error);
        return false;
    }
}

// Egyszerű path rajzoló (skálázás nélkül)
function drawSimplePath(ctx, points) {
    if (!ctx || !points || points.length === 0) return false;
    
    try {
        const canvas = ctx.canvas;
        ctx.beginPath();
        let hasValidPoint = false;
        
        points.forEach((point, index) => {
            if (point && typeof point.x === 'number' && typeof point.y === 'number' && 
                isFinite(point.x) && isFinite(point.y)) {
                
                const safeX = validateCoordinate(point.x, canvas.width);
                const safeY = validateCoordinate(point.y, canvas.height);
                
                if (!hasValidPoint) {
                    ctx.moveTo(safeX, safeY);
                    hasValidPoint = true;
                } else {
                    ctx.lineTo(safeX, safeY);
                }
            }
        });
        
        if (hasValidPoint) {
            ctx.closePath();
        }
        
        return hasValidPoint;
    } catch (error) {
        console.error('❌ Egyszerű path rajzolási hiba:', error);
        return false;
    }
}

// Kör transzformációs objektumok - JAVÍTOTT PIZZA
const circleTransformations = [
    {
        name: "Nap",
        emoji: "☀️",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            if (!ctx) return;
            
            ctx.save();
            
            try {
                const canvas = ctx.canvas;
                const safeCenterX = validateCoordinate(centerX, canvas.width);
                const safeCenterY = validateCoordinate(centerY, canvas.height);
                const safeRadius = validateRadius(radius, 10, 300);
                
                if (userPoints && userPoints.length > 0) {
                    // Nap sugarai gradiens effekttel
                    const gradient = createSafeRadialGradient(
                        ctx, 
                        safeCenterX, safeCenterY, 0, 
                        safeCenterX, safeCenterY, safeRadius * 1.5
                    );
                    
                    if (gradient) {
                        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                        gradient.addColorStop(1, 'rgba(255, 140, 0, 0.3)');
                        ctx.strokeStyle = gradient;
                    } else {
                        ctx.strokeStyle = '#FFD700';
                    }
                    
                    ctx.lineWidth = 8;
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 15;
                    
                    // Dinamikus sugarak
                    for (let i = 0; i < userPoints.length; i += 2) {
                        const point = userPoints[i];
                        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') continue;
                        
                        const safePointX = validateCoordinate(point.x, canvas.width);
                        const safePointY = validateCoordinate(point.y, canvas.height);
                        
                        const angle = Math.atan2(safePointY - safeCenterY, safePointX - safeCenterX);
                        const distance = Math.sqrt((safePointX - safeCenterX) ** 2 + (safePointY - safeCenterY) ** 2);
                        
                        const x1 = safePointX;
                        const y1 = safePointY;
                        const x2 = safeCenterX + Math.cos(angle) * (distance * 1.4);
                        const y2 = safeCenterY + Math.sin(angle) * (distance * 1.4);
                        
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                    
                    // Nap teste
                    const bodyGradient = createSafeRadialGradient(
                        ctx, 
                        safeCenterX, safeCenterY, 0, 
                        safeCenterX, safeCenterY, safeRadius
                    );
                    
                    if (bodyGradient) {
                        bodyGradient.addColorStop(0, '#FFFF99');
                        bodyGradient.addColorStop(0.7, '#FFD700');
                        bodyGradient.addColorStop(1, '#FFA500');
                        ctx.fillStyle = bodyGradient;
                    } else {
                        ctx.fillStyle = '#FFD700';
                    }
                    
                    if (drawSimplePath(ctx, userPoints)) {
                        ctx.fill();
                        ctx.strokeStyle = '#FF8C00';
                        ctx.lineWidth = 4;
                        ctx.shadowBlur = 5;
                        ctx.stroke();
                    }
                }
                
                // Nap arca
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FF6347';
                
                // Szemek
                ctx.beginPath();
                ctx.arc(safeCenterX - safeRadius * 0.2, safeCenterY - safeRadius * 0.15, safeRadius * 0.06, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(safeCenterX + safeRadius * 0.2, safeCenterY - safeRadius * 0.15, safeRadius * 0.06, 0, 2 * Math.PI);
                ctx.fill();
                
                // Mosoly
                ctx.strokeStyle = '#FF6347';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(safeCenterX, safeCenterY + safeRadius * 0.1, safeRadius * 0.25, 0.2, Math.PI - 0.2);
                ctx.stroke();
                
            } catch (error) {
                console.error('❌ Nap transzformáció hiba:', error);
            }
            
            ctx.restore();
        }
    },
    
    {
        name: "Pizza",
        emoji: "🍕",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            if (!ctx) return;
            
            ctx.save();
            
            try {
                const canvas = ctx.canvas;
                const safeCenterX = validateCoordinate(centerX, canvas.width);
                const safeCenterY = validateCoordinate(centerY, canvas.height);
                const safeRadius = validateRadius(radius, 10, 300);
                
                console.log('🍕 Pizza transzformáció:', { safeCenterX, safeCenterY, safeRadius });
                
                if (userPoints && userPoints.length > 0) {
                    // ✅ 1. PIZZA TÉSZTA (eredeti méret)
                    if (drawSimplePath(ctx, userPoints)) {
                        const crustGradient = createSafeRadialGradient(
                            ctx, 
                            safeCenterX, safeCenterY, 0, 
                            safeCenterX, safeCenterY, safeRadius
                        );
                        
                        if (crustGradient) {
                            crustGradient.addColorStop(0, '#F4A460');
                            crustGradient.addColorStop(1, '#DEB887');
                            ctx.fillStyle = crustGradient;
                        } else {
                            ctx.fillStyle = '#F4A460';
                        }
                        ctx.fill();
                        
                        // ✅ 2. PARADICSOM SZÓSZ (85% méret, pontos középpontból)
                        if (drawScaledPath(ctx, userPoints, safeCenterX, safeCenterY, 0.85)) {
                            const sauceGradient = createSafeRadialGradient(
                                ctx, 
                                safeCenterX, safeCenterY, 0, 
                                safeCenterX, safeCenterY, safeRadius * 0.85
                            );
                            
                            if (sauceGradient) {
                                sauceGradient.addColorStop(0, '#FF6347');
                                sauceGradient.addColorStop(1, '#DC143C');
                                ctx.fillStyle = sauceGradient;
                            } else {
                                ctx.fillStyle = '#FF6347';
                            }
                            ctx.fill();
                        }
                        
                        // ✅ 3. SAJT RÉTEG (75% méret, pontos középpontból)
                        if (drawScaledPath(ctx, userPoints, safeCenterX, safeCenterY, 0.75)) {
                            const cheeseGradient = createSafeRadialGradient(
                                ctx, 
                                safeCenterX, safeCenterY, 0, 
                                safeCenterX, safeCenterY, safeRadius * 0.75
                            );
                            
                            if (cheeseGradient) {
                                cheeseGradient.addColorStop(0, '#FFFACD');
                                cheeseGradient.addColorStop(1, '#FFFF99');
                                ctx.fillStyle = cheeseGradient;
                            } else {
                                ctx.fillStyle = '#FFFACD';
                            }
                            ctx.fill();
                        }
                        
                        // ✅ 4. PIZZA KÖRVONAL (eredeti méret)
                        if (drawSimplePath(ctx, userPoints)) {
                            ctx.strokeStyle = '#8B7355';
                            ctx.lineWidth = 5;
                            ctx.shadowColor = '#654321';
                            ctx.shadowBlur = 3;
                            ctx.stroke();
                        }
                    }
                }
                
                // ✅ 5. PEPPERONI (mindig jó helyen, a számított középponthoz képest)
                ctx.shadowBlur = 0;
                const pepperoniPositions = [
                    {x: -0.3, y: -0.2}, {x: 0.3, y: -0.3}, {x: -0.2, y: 0.3},
                    {x: 0.2, y: 0.2}, {x: 0, y: -0.1}, {x: -0.1, y: 0.1}
                ];
                
                pepperoniPositions.forEach(pos => {
                    const pepX = safeCenterX + pos.x * safeRadius;
                    const pepY = safeCenterY + pos.y * safeRadius;
                    const pepSize = safeRadius * 0.08;
                    
                    const pepGradient = createSafeRadialGradient(
                        ctx,
                        pepX - pepSize * 0.25, pepY - pepSize * 0.25, 0,
                        pepX, pepY, pepSize
                    );
                    
                    if (pepGradient) {
                        pepGradient.addColorStop(0, '#DC143C');
                        pepGradient.addColorStop(1, '#8B0000');
                        ctx.fillStyle = pepGradient;
                    } else {
                        ctx.fillStyle = '#DC143C';
                    }
                    
                    ctx.beginPath();
                    ctx.arc(pepX, pepY, pepSize, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Pepperoni highlight
                    ctx.beginPath();
                    ctx.arc(pepX - pepSize * 0.25, pepY - pepSize * 0.25, pepSize * 0.375, 0, 2 * Math.PI);
                    ctx.fillStyle = '#FF6347';
                    ctx.fill();
                });
                
            } catch (error) {
                console.error('❌ Pizza transzformáció hiba:', error);
                // Fallback
                const canvas = ctx.canvas;
                const fallbackCenterX = validateCoordinate(centerX, canvas.width);
                const fallbackCenterY = validateCoordinate(centerY, canvas.height);
                const fallbackRadius = validateRadius(radius, 10, 300);
                
                ctx.strokeStyle = '#F4A460';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(fallbackCenterX, fallbackCenterY, fallbackRadius, 0, 2 * Math.PI);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    },
    
    {
        name: "Donut",
        emoji: "🍩",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            if (!ctx) return;
            
            ctx.save();
            
            try {
                const canvas = ctx.canvas;
                const safeCenterX = validateCoordinate(centerX, canvas.width);
                const safeCenterY = validateCoordinate(centerY, canvas.height);
                const safeRadius = validateRadius(radius, 10, 300);
                
                if (userPoints && userPoints.length > 0) {
                    // Donut tészta (eredeti méret)
                    if (drawSimplePath(ctx, userPoints)) {
                        const doughGradient = createSafeRadialGradient(
                            ctx, 
                            safeCenterX, safeCenterY, 0, 
                            safeCenterX, safeCenterY, safeRadius
                        );
                        
                        if (doughGradient) {
                            doughGradient.addColorStop(0, '#F4A460');
                            doughGradient.addColorStop(1, '#DEB887');
                            ctx.fillStyle = doughGradient;
                        } else {
                            ctx.fillStyle = '#F4A460';
                        }
                        ctx.fill();
                        
                        // Mázas réteg (90% méret, pontos középpontból)
                        if (drawScaledPath(ctx, userPoints, safeCenterX, safeCenterY, 0.9)) {
                            const glazeGradient = createSafeRadialGradient(
                                ctx, 
                                safeCenterX, safeCenterY, 0, 
                                safeCenterX, safeCenterY, safeRadius * 0.9
                            );
                            
                            if (glazeGradient) {
                                glazeGradient.addColorStop(0, '#E6F3FF');
                                glazeGradient.addColorStop(1, '#87CEEB');
                                ctx.fillStyle = glazeGradient;
                            } else {
                                ctx.fillStyle = '#E6F3FF';
                            }
                            ctx.fill();
                        }
                        
                        // Körvonal
                        if (drawSimplePath(ctx, userPoints)) {
                            ctx.strokeStyle = '#8B7355';
                            ctx.lineWidth = 4;
                            ctx.stroke();
                        }
                    }
                }
                
                // Lyuk a közepén (mindig jó helyen)
                const holeGradient = createSafeRadialGradient(
                    ctx, 
                    safeCenterX, safeCenterY, 0, 
                    safeCenterX, safeCenterY, safeRadius * 0.3
                );
                
                if (holeGradient) {
                    holeGradient.addColorStop(0, '#FFFFFF');
                    holeGradient.addColorStop(1, '#F0F0F0');
                    ctx.fillStyle = holeGradient;
                } else {
                    ctx.fillStyle = '#FFFFFF';
                }
                
                ctx.beginPath();
                ctx.arc(safeCenterX, safeCenterY, safeRadius * 0.3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Színes szórás (mindig jó helyen)
                const sprinkles = [
                    {x: -0.2, y: -0.1, color: '#FF69B4', angle: 0.5},
                    {x: 0.1, y: -0.2, color: '#00FF00', angle: 1.2},
                    {x: 0.2, y: 0.1, color: '#FFD700', angle: 2.1},
                    {x: -0.1, y: 0.2, color: '#FF4500', angle: 0.8}
                ];
                
                sprinkles.forEach(sprinkle => {
                    ctx.save();
                    ctx.translate(safeCenterX + sprinkle.x * safeRadius, safeCenterY + sprinkle.y * safeRadius);
                    ctx.rotate(sprinkle.angle);
                    ctx.fillStyle = sprinkle.color;
                    ctx.fillRect(-safeRadius * 0.03, -safeRadius * 0.01, safeRadius * 0.06, safeRadius * 0.02);
                    ctx.restore();
                });
                
            } catch (error) {
                console.error('❌ Donut transzformáció hiba:', error);
            }
            
            ctx.restore();
        }
    }
    
    // A többi transzformáció...
];

// Biztonságos transzformáció manager
class TransformationManager {
    static getRandomTransformation() {
        try {
            if (!circleTransformations || circleTransformations.length === 0) {
                console.warn('⚠️ Nincs elérhető transzformáció');
                return null;
            }
            const randomIndex = Math.floor(Math.random() * circleTransformations.length);
            return circleTransformations[randomIndex];
        } catch (error) {
            console.error('❌ Random transzformáció hiba:', error);
            return circleTransformations[0];
        }
    }
    
    static getAllTransformations() {
        try {
            return [...circleTransformations];
        } catch (error) {
            console.error('❌ Transzformációk lekérési hiba:', error);
            return [];
        }
    }
    
    static getTransformationByName(name) {
        try {
            return circleTransformations.find(transformation => 
                transformation.name.toLowerCase() === name.toLowerCase()
            );
        } catch (error) {
            console.error('❌ Transzformáció keresési hiba:', error);
            return null;
        }
    }
    
    static getTransformationByEmoji(emoji) {
        try {
            return circleTransformations.find(transformation => 
                transformation.emoji === emoji
            );
        } catch (error) {
            console.error('❌ Emoji transzformáció keresési hiba:', error);
            return null;
        }
    }
    
    static getTransformationNames() {
        try {
            return circleTransformations.map(transformation => transformation.name);
        } catch (error) {
            console.error('❌ Transzformáció nevek lekérési hiba:', error);
            return [];
        }
    }
    
    static getTransformationEmojis() {
        try {
            return circleTransformations.map(transformation => transformation.emoji);
        } catch (error) {
            console.error('❌ Transzformáció emojik lekérési hiba:', error);
            return [];
        }
    }
}

// Globális hozzáférés
window.TransformationManager = TransformationManager;
window.circleTransformations = circleTransformations;

console.log('✅ Circle Transformations pontos skálázással betöltve');
