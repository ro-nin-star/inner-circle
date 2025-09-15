// Kör transzformációs objektumok - Fejlesztett vizuális megjelenéssel
const circleTransformations = [
    {
        name: "Nap",
        emoji: "☀️",
        draw: (centerX, centerY, radius, userPoints = null) => {
            const ctx = window.gameEngine.getContext();
            ctx.save();
            
            if (userPoints && userPoints.length > 0) {
                // Nap sugarai gradiens effekttel
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 140, 0, 0.3)');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 8;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 15;
                
                // Dinamikus sugarak
                for (let i = 0; i < userPoints.length; i += 2) {
                    const point = userPoints[i];
                    const angle = Math.atan2(point.y - centerY, point.x - centerX);
                    const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
                    
                    const x1 = point.x;
                    const y1 = point.y;
                    const x2 = centerX + Math.cos(angle) * (distance * 1.4);
                    const y2 = centerY + Math.sin(angle) * (distance * 1.4);
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                
                // Nap teste gradienssel
                const bodyGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                bodyGradient.addColorStop(0, '#FFFF99');
                bodyGradient.addColorStop(0.7, '#FFD700');
                bodyGradient.addColorStop(1, '#FFA500');
                
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                ctx.fillStyle = bodyGradient;
                ctx.fill();
                
                // Körvonal
                ctx.strokeStyle = '#FF8C00';
                ctx.lineWidth = 4;
                ctx.shadowBlur = 5;
                ctx.stroke();
            }
            
            // Nap arca fejlesztett animációval
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FF6347';
            
            // Szemek
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.2, centerY - radius * 0.15, radius * 0.06, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.2, centerY - radius * 0.15, radius * 0.06, 0, 2 * Math.PI);
            ctx.fill();
            
            // Mosoly
            ctx.strokeStyle = '#FF6347';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(centerX, centerY + radius * 0.1, radius * 0.25, 0.2, Math.PI - 0.2);
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
                // Pizza tészta
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                
                const crustGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                crustGradient.addColorStop(0, '#F4A460');
                crustGradient.addColorStop(1, '#DEB887');
                ctx.fillStyle = crustGradient;
                ctx.fill();
                
                // Paradicsom szósz
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    const scaleFactor = 0.85;
                    const x = centerX + (userPoints[i].x - centerX) * scaleFactor;
                    const y = centerY + (userPoints[i].y - centerY) * scaleFactor;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                
                const sauceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.85);
                sauceGradient.addColorStop(0, '#FF6347');
                sauceGradient.addColorStop(1, '#DC143C');
                ctx.fillStyle = sauceGradient;
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
                
                const cheeseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.75);
                cheeseGradient.addColorStop(0, '#FFFACD');
                cheeseGradient.addColorStop(1, '#FFFF99');
                ctx.fillStyle = cheeseGradient;
                ctx.fill();
                
                // Pizza körvonal
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 5;
                ctx.shadowColor = '#654321';
                ctx.shadowBlur = 3;
                ctx.stroke();
            }
            
            // Pepperoni 3D effekttel
            const pepperoniPositions = [
                {x: -0.3, y: -0.2}, {x: 0.3, y: -0.3}, {x: -0.2, y: 0.3},
                {x: 0.2, y: 0.2}, {x: 0, y: -0.1}, {x: -0.1, y: 0.1}
            ];
            
            pepperoniPositions.forEach(pos => {
                const pepGradient = ctx.createRadialGradient(
                    centerX + pos.x * radius - radius * 0.02,
                    centerY + pos.y * radius - radius * 0.02,
                    0,
                    centerX + pos.x * radius,
                    centerY + pos.y * radius,
                    radius * 0.08
                );
                pepGradient.addColorStop(0, '#DC143C');
                pepGradient.addColorStop(1, '#8B0000');
                
                ctx.beginPath();
                ctx.arc(
                    centerX + pos.x * radius,
                    centerY + pos.y * radius,
                    radius * 0.08,
                    0, 2 * Math.PI
                );
                ctx.fillStyle = pepGradient;
                ctx.fill();
                
                // Pepperoni highlight
                ctx.beginPath();
                ctx.arc(
                    centerX + pos.x * radius - radius * 0.02,
                    centerY + pos.y * radius - radius * 0.02,
                    radius * 0.03,
                    0, 2 * Math.PI
                );
                ctx.fillStyle = '#FF6347';
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
                // Donut tészta
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                
                const doughGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                doughGradient.addColorStop(0, '#F4A460');
                doughGradient.addColorStop(1, '#DEB887');
                ctx.fillStyle = doughGradient;
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
                
                const glazeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.9);
                glazeGradient.addColorStop(0, '#E6F3FF');
                glazeGradient.addColorStop(1, '#87CEEB');
                ctx.fillStyle = glazeGradient;
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
            
            // Lyuk a közepén gradienssel
            const holeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3);
            holeGradient.addColorStop(0, '#FFFFFF');
            holeGradient.addColorStop(1, '#F0F0F0');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
            ctx.fillStyle = holeGradient;
            ctx.fill();
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Színes szórás a mázason
            const sprinkles = [
                {x: -0.2, y: -0.1, color: '#FF69B4', angle: 0.5},
                {x: 0.1, y: -0.2, color: '#00FF00', angle: 1.2},
                {x: 0.2, y: 0.1, color: '#FFD700', angle: 2.1},
                {x: -0.1, y: 0.2, color: '#FF4500', angle: 0.8}
            ];
            
            sprinkles.forEach(sprinkle => {
                ctx.save();
                ctx.translate(centerX + sprinkle.x * radius, centerY + sprinkle.y * radius);
                ctx.rotate(sprinkle.angle);
                ctx.fillStyle = sprinkle.color;
                ctx.fillRect(-radius * 0.03, -radius * 0.01, radius * 0.06, radius * 0.02);
                ctx.restore();
            });
            
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
                // Hold felület
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                
                const moonGradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, 0,
                    centerX, centerY, radius
                );
                moonGradient.addColorStop(0, '#FFFFFF');
                moonGradient.addColorStop(0.7, '#F0F8FF');
                moonGradient.addColorStop(1, '#E6E6FA');
                ctx.fillStyle = moonGradient;
                ctx.fill();
                
                // Hold körvonal
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#87CEEB';
                ctx.shadowBlur = 10;
                ctx.stroke();
            }
            
            // Hold kráterek 3D effekttel
            const craters = [
                {x: -0.2, y: -0.3, size: 0.12},
                {x: 0.1, y: -0.1, size: 0.08},
                {x: -0.3, y: 0.2, size: 0.15},
                {x: 0.25, y: 0.3, size: 0.06}
            ];
            
            craters.forEach(crater => {
                const craterGradient = ctx.createRadialGradient(
                    centerX + crater.x * radius - radius * crater.size * 0.3,
                    centerY + crater.y * radius - radius * crater.size * 0.3,
                    0,
                    centerX + crater.x * radius,
                    centerY + crater.y * radius,
                    radius * crater.size
                );
                craterGradient.addColorStop(0, '#E6E6FA');
                craterGradient.addColorStop(1, '#B0B0B0');
                
                ctx.beginPath();
                ctx.arc(
                    centerX + crater.x * radius,
                    centerY + crater.y * radius,
                    radius * crater.size,
                    0, 2 * Math.PI
                );
                ctx.fillStyle = craterGradient;
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
                // Óceánok
                ctx.beginPath();
                ctx.moveTo(userPoints[0].x, userPoints[0].y);
                for (let i = 1; i < userPoints.length; i++) {
                    ctx.lineTo(userPoints[i].x, userPoints[i].y);
                }
                ctx.closePath();
                
                const oceanGradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, 0,
                    centerX, centerY, radius
                );
                oceanGradient.addColorStop(0, '#87CEEB');
                oceanGradient.addColorStop(0.7, '#4682B4');
                oceanGradient.addColorStop(1, '#191970');
                ctx.fillStyle = oceanGradient;
                ctx.fill();
                
                // Körvonal
                ctx.strokeStyle = '#2F4F4F';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#4682B4';
                ctx.shadowBlur = 8;
                ctx.stroke();
            }
            
            // Kontinensek természetesebb formákkal
            const continents = [
                {x: -0.3, y: -0.2, size: 0.18, color: '#228B22'},
                {x: 0.2, y: -0.1, size: 0.15, color: '#32CD32'},
                {x: -0.1, y: 0.3, size: 0.22, color: '#228B22'},
                {x: 0.35, y: 0.2, size: 0.12, color: '#90EE90'}
            ];
            
            continents.forEach(cont => {
                const contGradient = ctx.createRadialGradient(
                    centerX + cont.x * radius,
                    centerY + cont.y * radius,
                    0,
                    centerX + cont.x * radius,
                    centerY + cont.y * radius,
                    radius * cont.size
                );
                contGradient.addColorStop(0, cont.color);
                contGradient.addColorStop(1, '#006400');
                
                ctx.beginPath();
                ctx.arc(
                    centerX + cont.x * radius,
                    centerY + cont.y * radius,
                    radius * cont.size,
                    0, 2 * Math.PI
                );
                ctx.fillStyle = contGradient;
                ctx.fill();
            });
            
            // Felhők
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            const clouds = [
                {x: 0.1, y: -0.4, size: 0.08},
                {x: -0.4, y: 0.1, size: 0.06},
                {x: 0.3, y: 0.4, size: 0.07}
            ];
            
            clouds.forEach(cloud => {
                ctx.beginPath();
                ctx.arc(
                    centerX + cloud.x * radius,
                    centerY + cloud.y * radius,
                    radius * cloud.size,
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
                
                const ballGradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, 0,
                    centerX, centerY, radius
                );
                ballGradient.addColorStop(0, '#FFFFFF');
                ballGradient.addColorStop(0.8, '#F8F8FF');
                ballGradient.addColorStop(1, '#E0E0E0');
                ctx.fillStyle = ballGradient;
                ctx.fill();
                
                // Körvonal
                ctx.strokeStyle = '#696969';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 5;
                ctx.stroke();
            }
            
            // Fekete foltok pentagon mintával
            ctx.fillStyle = '#000000';
            const spots = [
                {x: 0, y: -0.3, size: 0.15},
                {x: -0.25, y: 0.15, size: 0.12},
                {x: 0.25, y: 0.15, size: 0.12}
            ];
            
            spots.forEach(spot => {
                // Pentagon alakú folt
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = centerX + spot.x * radius + Math.cos(angle) * radius * spot.size;
                    const y = centerY + spot.y * radius + Math.sin(angle) * radius * spot.size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            });
            
            // Vonalak a foltok között
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            spots.forEach((spot, index) => {
                if (index < spots.length - 1) {
                    ctx.beginPath();
                    ctx.moveTo(
                        centerX + spot.x * radius,
                        centerY + spot.y * radius
                    );
                    ctx.lineTo(
                        centerX + spots[index + 1].x * radius,
                        centerY + spots[index + 1].y * radius
                    );
                    ctx.stroke();
                }
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
                
                const clockGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                clockGradient.addColorStop(0, '#FFFAF0');
                clockGradient.addColorStop(0.8, '#F5F5DC');
                clockGradient.addColorStop(1, '#DDD');
                ctx.fillStyle = clockGradient;
                ctx.fill();
                
                // Óra keret
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 6;
                ctx.shadowColor = '#654321';
                ctx.shadowBlur = 5;
                ctx.stroke();
            }
            
            // Óraszámok elegáns betűtípussal
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#2F4F4F';
            ctx.font = `bold ${radius * 0.18}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            for (let i = 1; i <= 12; i++) {
                const angle = (i * Math.PI) / 6 - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius * 0.75;
                const y = centerY + Math.sin(angle) * radius * 0.75;
                ctx.fillText(i.toString(), x, y);
            }
            
            // Óra jelölések
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = 2;
            for (let i = 0; i < 60; i++) {
                const angle = (i * Math.PI) / 30;
                const isHour = i % 5 === 0;
                const innerRadius = radius * (isHour ? 0.85 : 0.9);
                const outerRadius = radius * 0.95;
                
                ctx.beginPath();
                ctx.moveTo(
                    centerX + Math.cos(angle) * innerRadius,
                    centerY + Math.sin(angle) * innerRadius
                );
                ctx.lineTo(
                    centerX + Math.cos(angle) * outerRadius,
                    centerY + Math.sin(angle) * outerRadius
                );
                ctx.lineWidth = isHour ? 3 : 1;
                ctx.stroke();
            }
            
            // Óramutatók valós idővel
            const currentTime = new Date();
            const hours = currentTime.getHours() % 12;
            const minutes = currentTime.getMinutes();
            const seconds = currentTime.getSeconds();
            
            // Órámutató
            const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(hourAngle) * radius * 0.45,
                centerY + Math.sin(hourAngle) * radius * 0.45
            );
            ctx.stroke();
            
            // Percmutató
            const minuteAngle = (minutes * Math.PI) / 30 - Math.PI / 2;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(minuteAngle) * radius * 0.65,
                centerY + Math.sin(minuteAngle) * radius * 0.65
            );
            ctx.stroke();
            
            // Másodpercmutató
            const secondAngle = (seconds * Math.PI) / 30 - Math.PI / 2;
            ctx.strokeStyle = '#DC143C';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(secondAngle) * radius * 0.7,
                centerY + Math.sin(secondAngle) * radius * 0.7
            );
            ctx.stroke();
            
            // Középpont
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.08, 0, 2 * Math.PI);
            ctx.fillStyle = '#2F4F4F';
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
                
                const flowerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                flowerGradient.addColorStop(0, '#FFE4E1');
                flowerGradient.addColorStop(0.7, '#FFB6C1');
                flowerGradient.addColorStop(1, '#FF69B4');
                ctx.fillStyle = flowerGradient;
                ctx.fill();
                
                // Körvonal
                ctx.strokeStyle = '#FF1493';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#FF69B4';
                ctx.shadowBlur = 8;
                ctx.stroke();
            }
            
            // Virág szirmok gradienssel
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = centerX + Math.cos(angle) * radius * 0.5;
                const y = centerY + Math.sin(angle) * radius * 0.5;
                
                const petalGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.15);
                petalGradient.addColorStop(0, '#FFE4E1');
                petalGradient.addColorStop(1, '#FF69B4');
                
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.15, 0, 2 * Math.PI);
                ctx.fillStyle = petalGradient;
                ctx.fill();
                
                // Szirom körvonal
                ctx.strokeStyle = '#FF1493';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Virág közepe
            const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.2);
            centerGradient.addColorStop(0, '#FFFF99');
            centerGradient.addColorStop(1, '#FFD700');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
            ctx.fillStyle = centerGradient;
            ctx.fill();
            
            // Pollen pontok
            ctx.fillStyle = '#FFA500';
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = centerX + Math.cos(angle) * radius * 0.08;
                const y = centerY + Math.sin(angle) * radius * 0.08;
                
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.02, 0, 2 * Math.PI);
                ctx.fill();
            }
            
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
                
                const faceGradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, 0,
                    centerX, centerY, radius
                );
                faceGradient.addColorStop(0, '#FFFF99');
                faceGradient.addColorStop(0.8, '#FFD700');
                faceGradient.addColorStop(1, '#FFA500');
                ctx.fillStyle = faceGradient;
                ctx.fill();
                
                // Körvonal
                ctx.strokeStyle = '#FF8C00';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.stroke();
            }
            
            // Szemek 3D effekttel
            ctx.shadowBlur = 0;
            
            // Bal szem
            const leftEyeGradient = ctx.createRadialGradient(
                centerX - radius * 0.25, centerY - radius * 0.2, 0,
                centerX - radius * 0.25, centerY - radius * 0.2, radius * 0.08
            );
            leftEyeGradient.addColorStop(0, '#2F4F4F');
            leftEyeGradient.addColorStop(1, '#000000');
            
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.25, centerY - radius * 0.2, radius * 0.08, 0, 2 * Math.PI);
            ctx.fillStyle = leftEyeGradient;
            ctx.fill();
            
            // Jobb szem
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.25, centerY - radius * 0.2, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            
            // Szem fények
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.22, centerY - radius * 0.23, radius * 0.02, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.28, centerY - radius * 0.23, radius * 0.02, 0, 2 * Math.PI);
            ctx.fill();
            
            // Mosoly gradienssel
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.shadowColor = '#FF8C00';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY + radius * 0.1, radius * 0.35, 0.2, Math.PI - 0.2);
            ctx.stroke();
            
            // Arcpirosítás
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            ctx.beginPath();
            ctx.arc(centerX - radius * 0.4, centerY + radius * 0.05, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + radius * 0.4, centerY + radius * 0.05, radius * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            
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
                
                const cookieGradient = ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, 0,
                    centerX, centerY, radius
                );
                cookieGradient.addColorStop(0, '#F4A460');
                cookieGradient.addColorStop(0.7, '#DEB887');
                cookieGradient.addColorStop(1, '#CD853F');
                ctx.fillStyle = cookieGradient;
                ctx.fill();
                
                // Keksz körvonal
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#654321';
                ctx.shadowBlur = 5;
                ctx.stroke();
            }
            
            // Csokidarabok 3D effekttel
            const chips = [
                {x: -0.3, y: -0.2, size: 0.07},
                {x: 0.2, y: -0.3, size: 0.06},
                {x: -0.1, y: 0.1, size: 0.08},
                {x: 0.3, y: 0.2, size: 0.05},
                {x: -0.2, y: 0.3, size: 0.06},
                {x: 0.1, y: -0.1, size: 0.07}
            ];
            
            chips.forEach(chip => {
                const chipGradient = ctx.createRadialGradient(
                    centerX + chip.x * radius - radius * chip.size * 0.3,
                    centerY + chip.y * radius - radius * chip.size * 0.3,
                    0,
                    centerX + chip.x * radius,
                    centerY + chip.y * radius,
                    radius * chip.size
                );
                chipGradient.addColorStop(0, '#8B4513');
                chipGradient.addColorStop(1, '#654321');
                
                ctx.beginPath();
                ctx.arc(
                    centerX + chip.x * radius,
                    centerY + chip.y * radius,
                    radius * chip.size,
                    0, 2 * Math.PI
                );
                ctx.fillStyle = chipGradient;
                ctx.fill();
                
                // Csokoládé fény
                ctx.fillStyle = '#A0522D';
                ctx.beginPath();
                ctx.arc(
                    centerX + chip.x * radius - radius * chip.size * 0.2,
                    centerY + chip.y * radius - radius * chip.size * 0.2,
                    radius * chip.size * 0.3,
                    0, 2 * Math.PI
                );
                ctx.fill();
            });
            
            // Textúra a kekszre
            ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI) / 2.5;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * (0.2 + i * 0.15), angle, angle + Math.PI / 3);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
];

// Fejlesztett transzformáció manager
class TransformationManager {
    static getRandomTransformation() {
        const randomIndex = Math.floor(Math.random() * circleTransformations.length);
        return circleTransformations[randomIndex];
    }
    
    static getAllTransformations() {
        return [...circleTransformations]; // Másolat visszaadása
    }
    
    static getTransformationByName(name) {
        return circleTransformations.find(transformation => 
            transformation.name.toLowerCase() === name.toLowerCase()
        );
    }
    
    static getTransformationByEmoji(emoji) {
        return circleTransformations.find(transformation => 
            transformation.emoji === emoji
        );
    }
    
    static getTransformationNames() {
        return circleTransformations.map(transformation => transformation.name);
    }
    
    static getTransformationEmojis() {
        return circleTransformations.map(transformation => transformation.emoji);
    }
}

// Globális hozzáférés
window.TransformationManager = TransformationManager;
