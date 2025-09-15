import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase konfiguráció
const firebaseConfig = {
    apiKey: "AIzaSyCsN0iILNbrGpofT5hGsaXtWrQ0WJpBDKM",
    authDomain: "perfectcircle-8f981.firebaseapp.com",
    projectId: "perfectcircle-8f981",
    storageBucket: "perfectcircle-8f981.firebasestorage.app",
    messagingSenderId: "314252830723",
    appId: "1:314252830723:web:bc4f681f74247d6de20636",
    measurementId: "G-6XR5FNJLHF"
};

// Firebase állapot kezelés
let app, db;
let firebaseReady = false;

// Státusz frissítő függvény
function updateFirebaseStatus(status, message) {
    const statusEl = document.getElementById('firebaseStatus');
    const offlineNotice = document.getElementById('offlineNotice');
    
    statusEl.className = `firebase-status ${status}`;
    
    switch(status) {
        case 'online':
            statusEl.innerHTML = '🟢 Online';
            offlineNotice.classList.remove('show');
            break;
        case 'offline':
            statusEl.innerHTML = '🔴 Offline';
            offlineNotice.classList.add('show');
            break;
        case 'connecting':
            statusEl.innerHTML = '🟡 Connecting...';
            offlineNotice.classList.remove('show');
            break;
        case 'error':
            statusEl.innerHTML = '❌ Error';
            offlineNotice.classList.add('show');
            break;
    }
    
    console.log(`🔥 Firebase: ${status} - ${message || ''}`);
}

// Firebase inicializálás
async function initializeFirebase() {
    updateFirebaseStatus('connecting', 'Inicializálás...');
    
    try {
        console.log('🔥 Firebase inicializálása...');
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        
        // Egyszerű kapcsolat teszt
        console.log('🔗 Firestore teszt...');
        const testQuery = query(collection(db, 'scores'), limit(1));
        const querySnapshot = await getDocs(testQuery);
        
        firebaseReady = true;
        updateFirebaseStatus('online', `Működik! ${querySnapshot.size} dokumentum`);
        console.log('✅ Firebase sikeresen működik!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Firebase hiba:', error);
        firebaseReady = false;
        
        if (error.code === 'permission-denied') {
            updateFirebaseStatus('error', 'Firestore Rules hiba');
            console.error('🚫 FIRESTORE RULES HIBA! Szükséges: allow read, write: if true;');
        } else {
            updateFirebaseStatus('offline', error.code || error.message);
        }
        
        return false;
    }
}

// Firebase API
window.firebaseAPI = {
    // ✅ JAVÍTOTT SAVESCORE FÜGGVÉNY THUMBNAIL TÁMOGATÁSSAL
    saveScore: async (data) => {
        console.log('🔥 Firebase saveScore - kapott adat:', data);
        console.log('🔥 Thumbnail ellenőrzés:', {
            hasThumbnail: !!data.thumbnail,
            thumbnailType: typeof data.thumbnail,
            thumbnailLength: data.thumbnail ? data.thumbnail.length : 0,
            thumbnailSize: data.thumbnail ? Math.round(data.thumbnail.length / 1024) + 'KB' : 'N/A'
        });
        
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        // ✅ BIZTOS változók
        const safePlayerName = String(data.playerName || 'Névtelen').trim();
        const safeScore = Number(data.score);
        const safeDifficulty = String(data.difficulty || 'easy');
        const safeTransformation = String(data.transformation || '');
        const safeThumbnail = data.thumbnail || null; // ✅ THUMBNAIL KEZELÉS
        
        console.log('🔥 Feldolgozott értékek:', { 
            safePlayerName, 
            safeScore, 
            scoreType: typeof safeScore,
            safeDifficulty, 
            safeTransformation,
            hasThumbnail: !!safeThumbnail,
            thumbnailSize: safeThumbnail ? Math.round(safeThumbnail.length / 1024) + 'KB' : 'nincs'
        });
        
        if (isNaN(safeScore)) {
            throw new Error(`Score NaN hiba: ${data.score} -> ${safeScore}`);
        }
        
        // ✅ THUMBNAIL VALIDÁLÁS
        if (safeThumbnail) {
            if (typeof safeThumbnail !== 'string') {
                console.warn('⚠️ Thumbnail nem string típusú, átalakítás...');
            }
            
            if (!safeThumbnail.startsWith('data:image/')) {
                console.warn('⚠️ Thumbnail nem valid base64 image!');
            } else {
                console.log('✅ Thumbnail valid base64 image');
            }
        }
        
        const firebaseData = {
            playerName: safePlayerName,
            score: safeScore,
            difficulty: safeDifficulty,
            transformation: safeTransformation,
            thumbnail: safeThumbnail, // ✅ THUMBNAIL MEZŐ HOZZÁADVA
            timestamp: serverTimestamp(),
            date: new Date().toLocaleDateString('hu-HU'),
            created: new Date().toISOString()
        };
        
        console.log('🔥 Firebase-nek küldött adat:', {
            ...firebaseData,
            thumbnail: firebaseData.thumbnail ? `[${Math.round(firebaseData.thumbnail.length / 1024)}KB image]` : null
        });
        
        try {
            const docRef = await addDoc(collection(db, 'scores'), firebaseData);
            console.log('✅ Pontszám mentve thumbnaillal:', docRef.id);
            
            // ✅ VISSZATÉRÉSI ÉRTÉK THUMBNAIL-LAL
            const result = { 
                id: docRef.id, 
                ...firebaseData,
                thumbnailSaved: !!safeThumbnail
            };
            
            console.log('✅ Mentés eredménye:', {
                id: result.id,
                score: result.score,
                playerName: result.playerName,
                thumbnailSaved: result.thumbnailSaved
            });
            
            return result;
            
        } catch (error) {
            console.error('❌ Mentési hiba:', error);
            console.error('❌ Küldött adat mérete:', JSON.stringify(firebaseData).length, 'karakter');
            
            // ✅ HA TÚLSÁGOSAN NAGY A THUMBNAIL, PRÓBÁLJUK NÉLKÜLE
            if (error.code === 'invalid-argument' && safeThumbnail) {
                console.log('🔄 Túl nagy thumbnail, újrapróbálás nélküle...');
                
                const dataWithoutThumbnail = {
                    ...firebaseData,
                    thumbnail: null
                };
                
                try {
                    const docRef = await addDoc(collection(db, 'scores'), dataWithoutThumbnail);
                    console.log('✅ Pontszám mentve thumbnail nélkül:', docRef.id);
                    return { id: docRef.id, ...dataWithoutThumbnail, thumbnailSaved: false };
                } catch (retryError) {
                    console.error('❌ Újrapróbálás is sikertelen:', retryError);
                    throw retryError;
                }
            }
            
            throw error;
        }
    },

    getTopScores: async (limitCount = 10) => {
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        try {
            const q = query(
                collection(db, 'scores'), 
                orderBy('score', 'desc'), 
                limit(limitCount)
            );
            
            const querySnapshot = await getDocs(q);
            const scores = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // ✅ THUMBNAIL ELLENŐRZÉS A BETÖLTÉSNÉL
                const scoreData = { 
                    id: doc.id, 
                    ...data 
                };
                
                if (data.thumbnail) {
                    console.log(`📸 Score ${doc.id} tartalmaz thumbnail-t (${Math.round(data.thumbnail.length / 1024)}KB)`);
                } else {
                    console.log(`📷 Score ${doc.id} nem tartalmaz thumbnail-t`);
                }
                
                scores.push(scoreData);
            });
            
            console.log(`📊 ${scores.length} eredmény betöltve, ebből ${scores.filter(s => s.thumbnail).length} tartalmaz thumbnail-t`);
            return scores;
            
        } catch (error) {
            console.error('❌ Lekérdezési hiba:', error);
            throw error;
        }
    },

    saveVisit: async (visitData) => {
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        try {
            const docRef = await addDoc(collection(db, 'visits'), {
                ...visitData,
                serverTimestamp: serverTimestamp()
            });
            
            console.log('✅ Látogatás mentve:', docRef.id);
            return docRef.id;
            
        } catch (error) {
            console.error('❌ Látogatás mentési hiba:', error);
            throw error;
        }
    },

    getVisitCount: async () => {
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        try {
            const q = query(collection(db, 'visits'));
            const querySnapshot = await getDocs(q);
            
            const count = querySnapshot.size;
            console.log(`📊 Összes látogatás: ${count}`);
            return count;
            
        } catch (error) {
            console.error('❌ Látogatásszám lekérdezési hiba:', error);
            throw error;
        }
    },

    getTodayVisitCount: async () => {
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        try {
            const today = new Date().toLocaleDateString('hu-HU');
            const q = query(
                collection(db, 'visits'),
                where('date', '==', today)
            );
            
            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;
            
            console.log(`📊 Mai látogatások: ${count}`);
            return count;
            
        } catch (error) {
            console.error('❌ Mai látogatásszám lekérdezési hiba:', error);
            throw error;
        }
    },

    getVisitStats: async () => {
        if (!firebaseReady) {
            throw new Error('Firebase nem elérhető');
        }
        
        try {
            const q = query(collection(db, 'visits'), orderBy('timestamp', 'desc'), limit(100));
            const querySnapshot = await getDocs(q);
            
            const visits = [];
            querySnapshot.forEach((doc) => {
                visits.push({ id: doc.id, ...doc.data() });
            });
            
            const today = new Date().toLocaleDateString('hu-HU');
            const todayVisits = visits.filter(v => v.date === today).length;
            const uniqueSessions = new Set(visits.map(v => v.sessionId)).size;
            
            const stats = {
                total: querySnapshot.size,
                today: todayVisits,
                uniqueSessions: uniqueSessions,
                recentVisits: visits.slice(0, 10)
            };
            
            console.log('📊 Látogatási statisztikák:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Látogatási statisztikák lekérdezési hiba:', error);
            throw error;
        }
    },

    isReady: () => firebaseReady,
    
    reconnect: async () => {
        return await initializeFirebase();
    },

    // ✅ THUMBNAIL TESZT FÜGGVÉNY
    testThumbnail: async () => {
        console.log('🧪 Thumbnail teszt indítása...');
        
        if (!firebaseReady) {
            console.error('❌ Firebase nem elérhető');
            return false;
        }
        
        // Kis teszt thumbnail készítése
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Egyszerű kör rajzolása
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(50, 50, 40, 0, Math.PI * 2);
        ctx.fill();
        
        const testThumbnail = canvas.toDataURL('image/jpeg', 0.8);
        console.log('🧪 Teszt thumbnail készítve:', Math.round(testThumbnail.length / 1024) + 'KB');
        
        try {
            const testData = {
                playerName: 'Teszt',
                score: 99,
                difficulty: 'easy',
                transformation: 'teszt',
                thumbnail: testThumbnail
            };
            
            const result = await window.firebaseAPI.saveScore(testData);
            console.log('✅ Thumbnail teszt sikeres:', result.id);
            return true;
            
        } catch (error) {
            console.error('❌ Thumbnail teszt sikertelen:', error);
            return false;
        }
    }
};

// Firebase info megjelenítő - KIBŐVÍTETT VERZIÓ
window.showFirebaseInfo = () => {
    const status = firebaseReady ? 'Online' : 'Offline';
    const info = `
🔥 Firebase Státusz: ${status}
🏗️ Projekt: perfectcircle-8f981
📊 Firestore: ${firebaseReady ? 'Működik' : 'Hiba'}
📸 Thumbnail támogatás: ${firebaseReady ? 'Aktív' : 'Inaktív'}

${!firebaseReady ? `
❌ PROBLÉMA MEGOLDÁSA:
1. Firebase Console > Firestore > Rules
2. Másold be ezt:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document} {
      allow read, write: if true;
    }
    match /visits/{document} {
      allow read, write: if true;
    }
  }
}

3. Publish gomb
4. Frissítsd az oldalt (F5)
` : '✅ Minden rendben!'}

🧪 THUMBNAIL TESZT:
Konzolban írd be: window.firebaseAPI.testThumbnail()
    `;
    alert(info);
};

// ✅ THUMBNAIL HIBAKERESÉSI FÜGGVÉNY
window.debugFirebaseThumbnails = async () => {
    console.log('🔍 === FIREBASE THUMBNAIL HIBAKERESÉS ===');
    console.log('- Firebase ready:', firebaseReady);
    console.log('- firebaseAPI:', !!window.firebaseAPI);
    console.log('- saveScore:', typeof window.firebaseAPI?.saveScore);
    console.log('- ThumbnailGenerator:', !!window.ThumbnailGenerator);
    
    if (window.ThumbnailGenerator) {
        const testCanvas = document.getElementById('gameCanvas');
        if (testCanvas) {
            const thumbnail = window.ThumbnailGenerator.captureCanvasThumbnail('gameCanvas');
            console.log('- Teszt thumbnail készült:', !!thumbnail);
            console.log('- Thumbnail mérete:', thumbnail ? Math.round(thumbnail.length / 1024) + 'KB' : 'N/A');
            
            if (thumbnail && firebaseReady) {
                console.log('🧪 Firebase thumbnail teszt indítása...');
                const testResult = await window.firebaseAPI.testThumbnail();
                console.log('- Firebase teszt eredménye:', testResult);
            }
        } else {
            console.log('- gameCanvas elem nem található');
        }
    }
    
    console.log('=== HIBAKERESÉS VÉGE ===');
};

// Globális hozzáférés
window.updateFirebaseStatus = updateFirebaseStatus;

// Inicializálás indítása
initializeFirebase();

// Firebase imports globális elérhetővé tétele a visitor counter számára
window.firebaseImports = {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    where,
    doc: (db, path, id) => {
        return { path: `${path}/${id}`, id: id };
    },
    setDoc: async (docRef, data) => {
        const collectionPath = docRef.path.split('/')[0];
        const docId = docRef.id;
        return await addDoc(collection(db, collectionPath), { ...data, customId: docId });
    },
    getDoc: async (docRef) => {
        const collectionPath = docRef.path.split('/')[0];
        const docId = docRef.id;
        
        const q = query(
            collection(db, collectionPath),
            where('customId', '==', docId),
            limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return { exists: () => false };
        }
        
        const doc = querySnapshot.docs[0];
        return {
            exists: () => true,
            data: () => doc.data(),
            id: doc.id
        };
    },
    updateDoc: async (docRef, data) => {
        console.log('⚠️ updateDoc nem implementált, új dokumentum létrehozása...');
        const collectionPath = docRef.path.split('/')[0];
        return await addDoc(collection(db, collectionPath), data);
    },
    increment: (value) => {
        return value;
    }
};

// Firebase database globális elérhetővé tétele
window.db = db;

console.log('✅ Firebase imports és db globálisan elérhetők a visitor counter számára');
console.log('📸 Firebase thumbnail támogatás aktiválva');
