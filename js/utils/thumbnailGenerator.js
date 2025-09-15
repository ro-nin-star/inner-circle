// js/utils/thumbnailGenerator.js

window.ThumbnailGenerator = {
    
    // Canvas tartalom mentése thumbnail-ként
    captureCanvasThumbnail: function(canvasId, maxWidth = 100, maxHeight = 100, quality = 0.8) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error('❌ Canvas nem található:', canvasId);
                return null;
            }
            
            // Thumbnail canvas létrehozása
            const thumbCanvas = document.createElement('canvas');
            const thumbCtx = thumbCanvas.getContext('2d');
            
            // Arányos átméretezés számítása
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            const aspectRatio = originalWidth / originalHeight;
            
            let thumbWidth = maxWidth;
            let thumbHeight = maxHeight;
            
            if (aspectRatio > 1) {
                thumbHeight = maxWidth / aspectRatio;
            } else {
                thumbWidth = maxHeight * aspectRatio;
            }
            
            thumbCanvas.width = Math.round(thumbWidth);
            thumbCanvas.height = Math.round(thumbHeight);
            
            // Háttér beállítása (átlátszó helyett fehér)
            thumbCtx.fillStyle = '#ffffff';
            thumbCtx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
            
            // Eredeti canvas tartalom átmásolása
            thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
            
            // Base64 string visszaadása
            const thumbnailData = thumbCanvas.toDataURL('image/jpeg', quality);
            
            console.log('✅ Thumbnail készítve:', {
                originalSize: `${originalWidth}x${originalHeight}`,
                thumbnailSize: `${thumbCanvas.width}x${thumbCanvas.height}`,
                dataSize: Math.round(thumbnailData.length / 1024) + 'KB'
            });
            
            return thumbnailData;
            
        } catch (error) {
            console.error('❌ Thumbnail készítési hiba:', error);
            return null;
        }
    },

    // Transzformáció után thumbnail készítés
    captureTransformationThumbnail: function(delay = 500) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Próbáljuk meg a gameCanvas-ról
                let thumbnail = this.captureCanvasThumbnail('gameCanvas');
                
                // Ha nincs, próbáljuk az idealCircleCanvas-ról
                if (!thumbnail) {
                    thumbnail = this.captureCanvasThumbnail('idealCircleCanvas');
                }
                
                resolve(thumbnail);
            }, delay);
        });
    },

    // Thumbnail megjelenítése DOM elemben
    displayThumbnail: function(thumbnailData, containerId, className = 'score-thumbnail') {
        try {
            if (!thumbnailData) return false;
            
            const container = document.getElementById(containerId);
            if (!container) return false;
            
            // Meglévő thumbnail eltávolítása
            const existingThumbnail = container.querySelector('.' + className);
            if (existingThumbnail) {
                existingThumbnail.remove();
            }
            
            // Új thumbnail elem létrehozása
            const img = document.createElement('img');
            img.src = thumbnailData;
            img.className = className;
            img.style.cssText = `
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid #ddd;
                margin-left: 10px;
                cursor: pointer;
                transition: transform 0.2s;
            `;
            
            // Hover effekt
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.1)';
            });
            
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
            
            // Kattintásra nagyítás
            img.addEventListener('click', () => {
                this.showThumbnailModal(thumbnailData);
            });
            
            container.appendChild(img);
            return true;
            
        } catch (error) {
            console.error('❌ Thumbnail megjelenítési hiba:', error);
            return false;
        }
    },

    // Thumbnail modal megjelenítése
    showThumbnailModal: function(thumbnailData) {
        // Modal létrehozása
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = thumbnailData;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        modal.appendChild(img);
        document.body.appendChild(modal);
        
        // Kattintásra bezárás
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // ESC billentyűre bezárás
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
};

console.log('✅ ThumbnailGenerator betöltve');
