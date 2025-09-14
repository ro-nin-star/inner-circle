// Kör transzformációs objektumok
const circleTransformations = [
    {
        name: "Nap",
        emoji: "☀️",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Nap sugarai a felhasználó vonala mentén
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 6;
                for (let i = 0; i < userPoints.length; i += 3) {
                    const point = userPoints[i];
                    const angle = Math.atan2(point.y - centerY, point.x - centerX);
                    const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
                    
                    const x1 = point.x;
                    const y1 = point.y;
                    const x2 = centerX + Math.cos(angle) * (distance * 1.3);
                    const y2 = centerY + Math.sin(angle) * (distance * 1.3);
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                
                // Felhasználó vonala
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 8;
                ctx.stroke();
                
                // Nap belső része
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#FFD700';
                ctx.fill();
            }
            
            // Nap arca
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.2, centerY - radius * 0.15, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.2, centerY - radius * 0.15, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY + radius * 0.1, radius * 0.3, 0, Math.PI);
            ctx.stroke();
            
            ctx.restore();
        }
    },
    {
        name: "Pizza",
        emoji: "🍕",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Pizza alap - felhasználó vonala
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#DEB887';
                ctx.fill();
                
                // Pizza szósz réteg
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    const scaleFactor = 0.85;
                    const x = centerX + (userPoints[i].x - centerX) * scaleFactor;
                    const y = centerY + (userPoints[i].y - centerY) * scaleFactor;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#DC143C';
                ctx.fill();
                
                // Sajt réteg
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    const scaleFactor = 0.75;
                    const x = centerX + (userPoints[i].x - centerX) * scaleFactor;
                    const y = centerY + (userPoints[i].y - centerY) * scaleFactor;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#FFFF99';
                ctx.fill();
                
                // Pizza körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 6;
                ctx.stroke();
            }
            
            // Pepperoni
            ctx.fillStyle = '#2A5298';
            const pepperoniPositions = [
                {x: -0.3, y: -0.2}, {x: 0.3, y: -0.3}, {x: -0.2, y: 0.3},
                {x: 0.2, y: 0.2}, {x: 0, y: -0.1}, {x: -0.1, y: 0.1}
            ];
            
            pepperoniPositions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(
                    centerX + pos.x * radius,
                    centerY + pos.y * radius,
                    radius * 0.08,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            ctx.restore();
        }
    },
    {
        name: "Donut",
        emoji: "🍩",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Donut külső - felhasználó vonala
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#DEB887';
                ctx.fill();
                
                // Mázas réteg
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    const scaleFactor = 0.9;
                    const x = centerX + (userPoints[i].x - centerX) * scaleFactor;
                    const y = centerY + (userPoints[i].y - centerY) * scaleFactor;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#4FC3F7';
                ctx.fill();
                
                // Donut körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 6;
                ctx.stroke();
            }
            
            // Lyuk a közepén
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.restore();
        }
    },
    {
        name: "Hold",
        emoji: "🌙",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Hold alap - felhasználó vonala
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#F0F8FF';
                ctx.fill();
                
                // Hold körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            
            // Hold kráterek
            ctx.fillStyle = '#D3D3D3';
            const craters = [
                {x: -0.2, y: -0.3, size: 0.1},
                {x: 0.1, y: -0.1, size: 0.08},
                {x: -0.3, y: 0.2, size: 0.12},
                {x: 0.2, y: 0.3, size: 0.06}
            ];
            
            craters.forEach(crater => {
                ctx.beginPath();
                ctx.arc(
                    centerX + crater.x * radius,
                    centerY + crater.y * radius,
                    radius * crater.size,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            ctx.restore();
        }
    },
    {
        name: "Földgömb",
        emoji: "🌍",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Óceánok - felhasználó vonala
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#4682B4';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#2F4F4F';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            
            // Kontinensek
            ctx.fillStyle = '#228B22';
            const continents = [
                {x: -0.3, y: -0.2, size: 0.15},
                {x: 0.2, y: -0.1, size: 0.12},
                {x: -0.1, y: 0.3, size: 0.18},
                {x: 0.3, y: 0.2, size: 0.1}
            ];
            
            continents.forEach(cont => {
                ctx.beginPath();
                ctx.arc(
                    centerX + cont.x * radius,
                    centerY + cont.y * radius,
                    radius * cont.size,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            ctx.restore();
        }
    },
    {
        name: "Labda",
        emoji: "⚽",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Labda alap
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#696969';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Fekete foltok
            ctx.fillStyle = '#000000';
            const spots = [
                {x: 0, y: -0.3, size: 0.12},
                {x: -0.3, y: 0.1, size: 0.1},
                {x: 0.3, y: 0.1, size: 0.1},
                {x: 0, y: 0.3, size: 0.08}
            ];
            
            spots.forEach(spot => {
                ctx.beginPath();
                ctx.arc(
                    centerX + spot.x * radius,
                    centerY + spot.y * radius,
                    radius * spot.size,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            ctx.restore();
        }
    },
    {
        name: "Óra",
        emoji: "🕐",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Óra háttér
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#F5F5DC';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            
            // Óraszámok
            ctx.fillStyle = '#000000';
            ctx.font = `${radius * 0.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const numbers = [
                {num: '12', x: 0, y: -0.7},
                {num: '3', x: 0.7, y: 0},
                {num: '6', x: 0, y: 0.7},
                {num: '9', x: -0.7, y: 0}
            ];
            
            numbers.forEach(n => {
                ctx.fillText(
                    n.num,
                    centerX + n.x * radius,
                    centerY + n.y * radius
                );
            });
            
            // Óramutatók
            const currentTime = new Date();
            const hours = currentTime.getHours() % 12;
            const minutes = currentTime.getMinutes();
            
            // Órámutató
            const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(hourAngle) * radius * 0.4,
                centerY + Math.sin(hourAngle) * radius * 0.4
            );
            ctx.stroke();
            
            // Percmutató
            const minuteAngle = (minutes * Math.PI) / 30 - Math.PI / 2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(minuteAngle) * radius * 0.6,
                centerY + Math.sin(minuteAngle) * radius * 0.6
            );
            ctx.stroke();
            
            // Középpont
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.05, 0, 2 * Math.PI);
            ctx.fillStyle = '#000000';
            ctx.fill();
            
            ctx.restore();
        }
    },
    {
        name: "Virág",
        emoji: "🌸",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Virág háttér
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#FFB6C1';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#FF69B4';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Virág szirmok
            ctx.fillStyle = '#FF69B4';
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = centerX + Math.cos(angle) * radius * 0.5;
                const y = centerY + Math.sin(angle) * radius * 0.5;
                
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.15, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            // Virág közepe
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            
            ctx.restore();
        }
    },
    {
        name: "Emoji",
        emoji: "😊",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Emoji arc háttér
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#FFD700';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            
            // Szemek
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.25, centerY - radius * 0.2, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.25, centerY - radius * 0.2, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            
            // Mosoly
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(centerX, centerY + radius * 0.1, radius * 0.4, 0, Math.PI);
            ctx.stroke();
            
            ctx.restore();
        }
    },
    {
        name: "Keksz",
        emoji: "🍪",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Keksz alap
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = '#DEB887';
                ctx.fill();
                
                // Körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            
            // Csokidarabok
            ctx.fillStyle = '#8B4513';
            const chips = [
                {x: -0.3, y: -0.2}, {x: 0.2, y: -0.3}, {x: -0.1, y: 0.1},
                {x: 0.3, y: 0.2}, {x: -0.2, y: 0.3}, {x: 0.1, y: -0.1}
            ];
            
            chips.forEach(chip => {
                ctx.beginPath();
                ctx.arc(
                    centerX + chip.x * radius,
                    centerY + chip.y * radius,
                    radius * 0.06,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            ctx.restore();
        }
    }
];

// Transzformáció manager
class TransformationManager {
    static getRandomTransformation() {
        return circleTransformations[Math.floor(Math.random() * circleTransformations.length)];
    }
    
    static getAllTransformations() {
        return circleTransformations;
    }
    
    static getTransformationByName(name) {
        return circleTransformations.find(t => t.name === name);
    }
}

// Globális hozzáférés
window.TransformationManager = TransformationManager;
