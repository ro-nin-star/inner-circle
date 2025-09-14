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
// ✅ JAVÍTOTT SAVESCORE FÜGGVÉNY - cseréld ki a firebase-config.js-ben
saveScore: async (data) => {
    console.log('🔥 Firebase saveScore - kapott adat:', data);
    
    if (!firebaseReady) {
        throw new Error('Firebase nem elérhető');
    }
    
    // ✅ BIZTOS változók
    const safePlayerName = String(data.playerName || 'Névtelen').trim();
    const safeScore = Number(data.score);
    const safeDifficulty = String(data.difficulty || 'easy');
    const safeTransformation = String(data.transformation || '');
    
    console.log('🔥 Feldolgozott értékek:', { 
        safePlayerName, 
        safeScore, 
        scoreType: typeof safeScore,
        safeDifficulty, 
        safeTransformation 
    });
    
    if (isNaN(safeScore)) {
        throw new Error(`Score NaN hiba: ${data.score} -> ${safeScore}`);
    }
    
    const firebaseData = {
        playerName: safePlayerName,
        score: safeScore,
        difficulty: safeDifficulty,
        transformation: safeTransformation,
        timestamp: serverTimestamp(), // ← Ez most már működni fog
        date: new Date().toLocaleDateString('hu-HU'),
        created: new Date().toISOString()
    };
    
    console.log('🔥 Firebase-nek küldött adat:', firebaseData);
    
    try {
        const docRef = await addDoc(collection(db, 'scores'), firebaseData);
        console.log('✅ Pontszám mentve:', docRef.id);
        return { id: docRef.id, ...firebaseData };
        
    } catch (error) {
        console.error('❌ Mentési hiba:', error);
        console.error('❌ Küldött adat:', firebaseData);
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
                scores.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`📊 ${scores.length} eredmény betöltve`);
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
    }
};

// Firebase info megjelenítő
window.showFirebaseInfo = () => {
    const status = firebaseReady ? 'Online' : 'Offline';
    const info = `
🔥 Firebase Státusz: ${status}
🏗️ Projekt: perfectcircle-8f981
📊 Firestore: ${firebaseReady ? 'Működik' : 'Hiba'}

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
    `;
    alert(info);
};

// Globális hozzáférés
window.updateFirebaseStatus = updateFirebaseStatus;

// Inicializálás indítása
initializeFirebase();
