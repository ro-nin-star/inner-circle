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

// Kör transzformációs objektumok - JAVÍTOTT nap
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
// ✅ JAVÍTOTT NAP ARCA - FELHASZNÁLÓI KÖR KÖZÉPPONTJÁHOZ IGAZÍTVA
ctx.shadowBlur = 0;
ctx.fillStyle = '#FF6347';

// ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA A FELHASZNÁLÓI PONTOKBÓL
let actualCenterX = safeCenterX;
let actualCenterY = safeCenterY;
let actualRadius = safeRadius;

if (userPoints && userPoints.length > 0) {
    const userCenter = calculateUserCircleCenter(userPoints);
    if (userCenter) {
        actualCenterX = validateCoordinate(userCenter.x, canvas.width);
        actualCenterY = validateCoordinate(userCenter.y, canvas.height);
        
        // Tényleges sugár számítása
        let maxDistance = 0;
        userPoints.forEach(point => {
            if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                const distance = Math.sqrt(
                    Math.pow(point.x - actualCenterX, 2) + 
                    Math.pow(point.y - actualCenterY, 2)
                );
                maxDistance = Math.max(maxDistance, distance);
            }
        });
        actualRadius = validateRadius(maxDistance * 0.8, 10, 300);
        
        console.log('😊 Nap arc pozíció:', { 
            originalCenter: { x: safeCenterX, y: safeCenterY },
            actualCenter: { x: actualCenterX, y: actualCenterY },
            radius: actualRadius 
        });
    }
}

// Szemek (tényleges középponthoz igazítva)
ctx.beginPath();
ctx.arc(actualCenterX - actualRadius * 0.2, actualCenterY - actualRadius * 0.15, actualRadius * 0.06, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(actualCenterX + actualRadius * 0.2, actualCenterY - actualRadius * 0.15, actualRadius * 0.06, 0, 2 * Math.PI);
ctx.fill();

// Mosoly (tényleges középponthoz igazítva)
ctx.strokeStyle = '#FF6347';
ctx.lineWidth = Math.max(2, actualRadius * 0.02);
ctx.lineCap = 'round';
ctx.beginPath();
ctx.arc(actualCenterX, actualCenterY + actualRadius * 0.1, actualRadius * 0.25, 0.2, Math.PI - 0.2);
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
        },
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
    },
    
    // A többi transzformáció...

{
    name: "Hold",
    emoji: "🌙",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                }
                
                // Hold alapja
                if (drawSimplePath(ctx, userPoints)) {
                    const moonGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (moonGradient) {
                        moonGradient.addColorStop(0, '#FFFACD');
                        moonGradient.addColorStop(0.7, '#F0E68C');
                        moonGradient.addColorStop(1, '#BDB76B');
                        ctx.fillStyle = moonGradient;
                    } else {
                        ctx.fillStyle = '#F0E68C';
                    }
                    ctx.fill();
                    
                    // Hold körvonala
                    ctx.strokeStyle = '#DAA520';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
            
            // Hold kráterek
            const craters = [
                {x: -0.2, y: -0.15, size: 0.12},
                {x: 0.25, y: -0.25, size: 0.08},
                {x: -0.1, y: 0.2, size: 0.1},
                {x: 0.15, y: 0.15, size: 0.06},
                {x: 0.05, y: -0.05, size: 0.05}
            ];
            
            craters.forEach(crater => {
                const craterX = actualCenterX + crater.x * actualRadius;
                const craterY = actualCenterY + crater.y * actualRadius;
                const craterSize = actualRadius * crater.size;
                
                const craterGradient = createSafeRadialGradient(
                    ctx,
                    craterX, craterY, 0,
                    craterX, craterY, craterSize
                );
                
                if (craterGradient) {
                    craterGradient.addColorStop(0, '#8B7355');
                    craterGradient.addColorStop(1, '#A0522D');
                    ctx.fillStyle = craterGradient;
                } else {
                    ctx.fillStyle = '#8B7355';
                }
                
                ctx.beginPath();
                ctx.arc(craterX, craterY, craterSize, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Hold fény hatás
            ctx.shadowColor = '#FFFACD';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = '#FFFACD';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius * 1.1, 0, 2 * Math.PI);
            ctx.stroke();
            
        } catch (error) {
            console.error('❌ Hold transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
},

{
    name: "Kerék",
    emoji: "🛞",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                }
                
                // Külső gumi
                if (drawSimplePath(ctx, userPoints)) {
                    const tireGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX, actualCenterY, actualRadius * 0.5, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (tireGradient) {
                        tireGradient.addColorStop(0, '#2F2F2F');
                        tireGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = tireGradient;
                    } else {
                        ctx.fillStyle = '#2F2F2F';
                    }
                    ctx.fill();
                    
                    // Gumi minta
                    ctx.strokeStyle = '#1A1A1A';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
            // Felni
            const rimGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX - actualRadius * 0.2, actualCenterY - actualRadius * 0.2, 0, 
                actualCenterX, actualCenterY, actualRadius * 0.7
            );
            
            if (rimGradient) {
                rimGradient.addColorStop(0, '#E6E6FA');
                rimGradient.addColorStop(0.7, '#C0C0C0');
                rimGradient.addColorStop(1, '#808080');
                ctx.fillStyle = rimGradient;
            } else {
                ctx.fillStyle = '#C0C0C0';
            }
            
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#696969';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Küllők
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5;
                const x1 = actualCenterX + Math.cos(angle) * actualRadius * 0.15;
                const y1 = actualCenterY + Math.sin(angle) * actualRadius * 0.15;
                const x2 = actualCenterX + Math.cos(angle) * actualRadius * 0.6;
                const y2 = actualCenterY + Math.sin(angle) * actualRadius * 0.6;
                
                ctx.strokeStyle = '#A9A9A9';
                ctx.lineWidth = actualRadius * 0.05;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Központi anya
            const centerGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX, actualCenterY, 0, 
                actualCenterX, actualCenterY, actualRadius * 0.15
            );
            
            if (centerGradient) {
                centerGradient.addColorStop(0, '#F5F5F5');
                centerGradient.addColorStop(1, '#A9A9A9');
                ctx.fillStyle = centerGradient;
            } else {
                ctx.fillStyle = '#D3D3D3';
            }
            
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.15, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#696969';
            ctx.lineWidth = 2;
            ctx.stroke();
            
        } catch (error) {
            console.error('❌ Kerék transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
},

{
    name: "Labda",
    emoji: "⚽",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                }
                
                // Labda alapja
                if (drawSimplePath(ctx, userPoints)) {
                    const ballGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (ballGradient) {
                        ballGradient.addColorStop(0, '#FFFFFF');
                        ballGradient.addColorStop(0.8, '#F5F5F5');
                        ballGradient.addColorStop(1, '#E0E0E0');
                        ctx.fillStyle = ballGradient;
                    } else {
                        ctx.fillStyle = '#FFFFFF';
                    }
                    ctx.fill();
                    
                    ctx.strokeStyle = '#C0C0C0';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            
            // Fekete ötszögek (futball minta)
            const pentagons = [
                {x: 0, y: -0.3, size: 0.2},
                {x: -0.35, y: 0.1, size: 0.15},
                {x: 0.35, y: 0.1, size: 0.15}
            ];
            
            pentagons.forEach(pentagon => {
                const pentX = actualCenterX + pentagon.x * actualRadius;
                const pentY = actualCenterY + pentagon.y * actualRadius;
                const pentSize = actualRadius * pentagon.size;
                
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = pentX + Math.cos(angle) * pentSize;
                    const y = pentY + Math.sin(angle) * pentSize;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            });
            
            // Vonalak a mintához
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Központi vonalak
            const lines = [
                {x1: 0, y1: -0.5, x2: -0.35, y2: -0.1},
                {x1: 0, y1: -0.5, x2: 0.35, y2: -0.1},
                {x1: -0.35, y1: -0.1, x2: -0.35, y2: 0.3},
                {x1: 0.35, y1: -0.1, x2: 0.35, y2: 0.3}
            ];
            
            lines.forEach(line => {
                const x1 = actualCenterX + line.x1 * actualRadius;
                const y1 = actualCenterY + line.y1 * actualRadius;
                const x2 = actualCenterX + line.x2 * actualRadius;
                const y2 = actualCenterY + line.y2 * actualRadius;
                
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            });
            
            ctx.stroke();
            
        } catch (error) {
            console.error('❌ Labda transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
},

{
    name: "Óra",
    emoji: "🕐",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                }
                
                // Óra háttere
                if (drawSimplePath(ctx, userPoints)) {
                    const clockGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (clockGradient) {
                        clockGradient.addColorStop(0, '#FFFAF0');
                        clockGradient.addColorStop(0.9, '#F5F5DC');
                        clockGradient.addColorStop(1, '#D2B48C');
                        ctx.fillStyle = clockGradient;
                    } else {
                        ctx.fillStyle = '#F5F5DC';
                    }
                    ctx.fill();
                    
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }
            }
            
            // Óraszámok
            ctx.fillStyle = '#2F4F4F';
            ctx.font = `${actualRadius * 0.15}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            for (let i = 1; i <= 12; i++) {
                const angle = (i * Math.PI) / 6 - Math.PI / 2;
                const x = actualCenterX + Math.cos(angle) * actualRadius * 0.75;
                const y = actualCenterY + Math.sin(angle) * actualRadius * 0.75;
                ctx.fillText(i.toString(), x, y);
            }
            
            // Óraperc jelölők
            ctx.strokeStyle = '#696969';
            for (let i = 0; i < 60; i++) {
                const angle = (i * Math.PI) / 30;
                const isHour = i % 5 === 0;
                const innerRadius = actualRadius * (isHour ? 0.85 : 0.9);
                const outerRadius = actualRadius * 0.95;
                
                const x1 = actualCenterX + Math.cos(angle) * innerRadius;
                const y1 = actualCenterY + Math.sin(angle) * innerRadius;
                const x2 = actualCenterX + Math.cos(angle) * outerRadius;
                const y2 = actualCenterY + Math.sin(angle) * outerRadius;
                
                ctx.lineWidth = isHour ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Aktuális idő mutatói
            const now = new Date();
            const hours = now.getHours() % 12;
            const minutes = now.getMinutes();
            
            // Óramutató
            const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
            const hourX = actualCenterX + Math.cos(hourAngle) * actualRadius * 0.5;
            const hourY = actualCenterY + Math.sin(hourAngle) * actualRadius * 0.5;
            
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = actualRadius * 0.02;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(actualCenterX, actualCenterY);
            ctx.lineTo(hourX, hourY);
            ctx.stroke();
            
            // Percmutató
            const minuteAngle = (minutes * Math.PI) / 30 - Math.PI / 2;
            const minuteX = actualCenterX + Math.cos(minuteAngle) * actualRadius * 0.7;
            const minuteY = actualCenterY + Math.sin(minuteAngle) * actualRadius * 0.7;
            
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = actualRadius * 0.015;
            ctx.beginPath();
            ctx.moveTo(actualCenterX, actualCenterY);
            ctx.lineTo(minuteX, minuteY);
            ctx.stroke();
            
            // Központi pont
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.05, 0, 2 * Math.PI);
            ctx.fill();
            
        } catch (error) {
            console.error('❌ Óra transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
},

{
    name: "Földgömb",
    emoji: "🌍",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                }
                
                // Óceánok (kék háttér)
                if (drawSimplePath(ctx, userPoints)) {
                    const oceanGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (oceanGradient) {
                        oceanGradient.addColorStop(0, '#87CEEB');
                        oceanGradient.addColorStop(0.7, '#4682B4');
                        oceanGradient.addColorStop(1, '#191970');
                        ctx.fillStyle = oceanGradient;
                    } else {
                        ctx.fillStyle = '#4682B4';
                    }
                    ctx.fill();
                }
            }
            
            // Kontinensek (zöld területek)
            const continents = [
                // Afrika
                {x: -0.1, y: 0.1, width: 0.3, height: 0.6},
                // Európa
                {x: -0.05, y: -0.2, width: 0.2, height: 0.3},
                // Ázsia
                {x: 0.2, y: -0.1, width: 0.4, height: 0.5},
                // Amerika
                {x: -0.6, y: 0, width: 0.3, height: 0.7}
            ];
            
            ctx.fillStyle = '#228B22';
            continents.forEach(continent => {
                const contX = actualCenterX + continent.x * actualRadius;
                const contY = actualCenterY + continent.y * actualRadius;
                const contW = continent.width * actualRadius;
                const contH = continent.height * actualRadius;
                
                // Egyszerűsített kontinens alakzatok
                ctx.beginPath();
                ctx.ellipse(contX, contY, contW/2, contH/2, 0, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // Országhatárok és részletek
            ctx.strokeStyle = '#006400';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Glóbusz körvonal
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Glóbusz fény hatás
            const lightGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                actualCenterX, actualCenterY, actualRadius * 0.8
            );
            
            if (lightGradient) {
                lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = lightGradient;
                ctx.beginPath();
                ctx.arc(actualCenterX, actualCenterY, actualRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
            
        } catch (error) {
            console.error('❌ Földgömb transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
},

{
    name: "CD",
    emoji: "💿",
    draw: (centerX, centerY, radius, userPoints = null) => {
        const ctx = window.gameEngine.getContext();
        if (!ctx) return;
        
        ctx.save();
        
        try {
            const canvas = ctx.canvas;
            const safeCenterX = validateCoordinate(centerX, canvas.width);
            const safeCenterY = validateCoordinate(centerY, canvas.height);
            const safeRadius = validateRadius(radius, 10, 300);
            
            // ✅ TÉNYLEGES KÖZÉPPONT SZÁMÍTÁSA
            let actualCenterX = safeCenterX;
            let actualCenterY = safeCenterY;
            let actualRadius = safeRadius;

            if (userPoints && userPoints.length > 0) {
                const userCenter = calculateUserCircleCenter(userPoints);
                if (userCenter) {
                    actualCenterX = validateCoordinate(userCenter.x, canvas.width);
                    actualCenterY = validateCoordinate(userCenter.y, canvas.height);
                    
                    let totalDistance = 0;
                    let validDistances = 0;
                    userPoints.forEach(point => {
                        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                            const distance = Math.sqrt(
                                Math.pow(point.x - actualCenterX, 2) + 
                                Math.pow(point.y - actualCenterY, 2)
                            );
                            totalDistance += distance;
                            validDistances++;
                        }
                    });
                    
                    if (validDistances > 0) {
                        actualRadius = validateRadius(totalDistance / validDistances * 0.8, 10, 300);
                    }
                    
                    console.log('💿 CD pozíció:', { 
                        originalCenter: { x: safeCenterX, y: safeCenterY },
                        actualCenter: { x: actualCenterX, y: actualCenterY },
                        radius: actualRadius 
                    });
                }
                
                // ✅ CD ALAPJA - Holografikus fényes felület
                if (drawSimplePath(ctx, userPoints)) {
                    // Főbb CD gradiens (ezüstös, holografikus)
                    const cdGradient = createSafeRadialGradient(
                        ctx, 
                        actualCenterX - actualRadius * 0.3, actualCenterY - actualRadius * 0.3, 0, 
                        actualCenterX, actualCenterY, actualRadius
                    );
                    
                    if (cdGradient) {
                        cdGradient.addColorStop(0, '#F8F8FF');
                        cdGradient.addColorStop(0.3, '#E6E6FA');
                        cdGradient.addColorStop(0.6, '#C0C0C0');
                        cdGradient.addColorStop(0.8, '#B0C4DE');
                        cdGradient.addColorStop(1, '#708090');
                        ctx.fillStyle = cdGradient;
                    } else {
                        ctx.fillStyle = '#C0C0C0';
                    }
                    ctx.fill();
                    
                    // CD külső perem
                    ctx.strokeStyle = '#696969';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
            
            // ✅ HOLOGRAFIKUS SZIVÁRVÁNY KÖRÖK (koncentrikus)
            const rainbowColors = [
                'rgba(255, 0, 255, 0.3)',    // Magenta
                'rgba(0, 255, 255, 0.3)',    // Cyan  
                'rgba(255, 255, 0, 0.3)',    // Sárga
                'rgba(255, 0, 0, 0.3)',      // Piros
                'rgba(0, 255, 0, 0.3)',      // Zöld
                'rgba(0, 0, 255, 0.3)'       // Kék
            ];
            
            for (let i = 0; i < 6; i++) {
                const ringRadius = actualRadius * (0.9 - i * 0.12);
                if (ringRadius > actualRadius * 0.2) {
                    ctx.strokeStyle = rainbowColors[i];
                    ctx.lineWidth = actualRadius * 0.02;
                    ctx.beginPath();
                    ctx.arc(actualCenterX, actualCenterY, ringRadius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
            
            // ✅ SPIRÁL ADATSÁV MINTÁZAT
            ctx.strokeStyle = 'rgba(105, 105, 105, 0.4)';
            ctx.lineWidth = 1;
            
            const spiralTurns = 20;
            const spiralPoints = 200;
            
            ctx.beginPath();
            for (let i = 0; i <= spiralPoints; i++) {
                const angle = (i / spiralPoints) * spiralTurns * 2 * Math.PI;
                const spiralRadius = actualRadius * 0.2 + (actualRadius * 0.65) * (i / spiralPoints);
                
                const x = actualCenterX + Math.cos(angle) * spiralRadius;
                const y = actualCenterY + Math.sin(angle) * spiralRadius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // ✅ FÉNYTÖRÉS EFFEKTEK (holografikus csíkok)
            const lightStreaks = 8;
            for (let i = 0; i < lightStreaks; i++) {
                const angle = (i * 2 * Math.PI) / lightStreaks;
                const streakGradient = ctx.createLinearGradient(
                    actualCenterX + Math.cos(angle) * actualRadius * 0.3,
                    actualCenterY + Math.sin(angle) * actualRadius * 0.3,
                    actualCenterX + Math.cos(angle) * actualRadius * 0.8,
                    actualCenterY + Math.sin(angle) * actualRadius * 0.8
                );
                
                if (streakGradient) {
                    streakGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                    streakGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
                    streakGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.strokeStyle = streakGradient;
                    ctx.lineWidth = actualRadius * 0.01;
                    ctx.beginPath();
                    ctx.moveTo(
                        actualCenterX + Math.cos(angle) * actualRadius * 0.3,
                        actualCenterY + Math.sin(angle) * actualRadius * 0.3
                    );
                    ctx.lineTo(
                        actualCenterX + Math.cos(angle) * actualRadius * 0.8,
                        actualCenterY + Math.sin(angle) * actualRadius * 0.8
                    );
                    ctx.stroke();
                }
            }
            
            // ✅ KÖZPONTI LYUK
            const holeGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX, actualCenterY, 0, 
                actualCenterX, actualCenterY, actualRadius * 0.15
            );
            
            if (holeGradient) {
                holeGradient.addColorStop(0, '#2F2F2F');
                holeGradient.addColorStop(0.7, '#1C1C1C');
                holeGradient.addColorStop(1, '#000000');
                ctx.fillStyle = holeGradient;
            } else {
                ctx.fillStyle = '#000000';
            }
            
            ctx.beginPath();
            ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.15, 0, 2 * Math.PI);
            ctx.fill();
            
            // Lyuk belső perem
            ctx.strokeStyle = '#404040';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // ✅ CD CÍMKE/FELIRAT TERÜLET
            const labelGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX, actualCenterY, actualRadius * 0.15, 
                actualCenterX, actualCenterY, actualRadius * 0.4
            );
            
            if (labelGradient) {
                labelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                labelGradient.addColorStop(0.5, 'rgba(240, 240, 240, 0.6)');
                labelGradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
                ctx.fillStyle = labelGradient;
                
                ctx.beginPath();
                ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.4, 0, 2 * Math.PI);
                ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.15, 0, 2 * Math.PI, true);
                ctx.fill();
            }
            
            // ✅ CD SZÖVEG/CÍMKE
            ctx.fillStyle = '#2F2F2F';
            ctx.font = `bold ${Math.max(8, actualRadius * 0.08)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Főcím
            ctx.fillText('PERFECT', actualCenterX, actualCenterY - actualRadius * 0.08);
            ctx.fillText('CIRCLE', actualCenterX, actualCenterY + actualRadius * 0.08);
            
            // Kisebb szöveg
            ctx.font = `${Math.max(6, actualRadius * 0.05)}px Arial`;
            ctx.fillStyle = '#666666';
            ctx.fillText('Digital Audio', actualCenterX, actualCenterY + actualRadius * 0.18);
            
            // ✅ FORGÁS IRÁNY NYÍL (apró részlet)
            const arrowSize = actualRadius * 0.03;
            const arrowX = actualCenterX + actualRadius * 0.35;
            const arrowY = actualCenterY;
            
            ctx.fillStyle = '#999999';
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - arrowSize);
            ctx.lineTo(arrowX + arrowSize, arrowY);
            ctx.lineTo(arrowX, arrowY + arrowSize);
            ctx.closePath();
            ctx.fill();
            
            // ✅ FÉNYES HIGHLIGHT EFFEKT (CD jellegzetesség)
            const highlightGradient = createSafeRadialGradient(
                ctx, 
                actualCenterX - actualRadius * 0.4, actualCenterY - actualRadius * 0.4, 0, 
                actualCenterX - actualRadius * 0.2, actualCenterY - actualRadius * 0.2, actualRadius * 0.6
            );
            
            if (highlightGradient) {
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
                highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.arc(actualCenterX, actualCenterY, actualRadius, 0, 2 * Math.PI);
                ctx.arc(actualCenterX, actualCenterY, actualRadius * 0.15, 0, 2 * Math.PI, true);
                ctx.fill();
            }
            
        } catch (error) {
            console.error('❌ CD transzformáció hiba:', error);
        }
        
        ctx.restore();
    }
}


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
