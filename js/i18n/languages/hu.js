const translations = {
    title: 'Perfect Circle',
    subtitle: 'Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!',
    
    buttons: {
        startDrawing: '🎯 Rajzolás Kezdése',
        clear: '🗑️ Törlés',
        help: '❓ Segítség',
        save: '💾 Mentés',
        clearScores: '🗑️ Helyi Eredmények Törlése'
    },
    
    stats: {
        currentScore: 'Jelenlegi Pontszám',
        bestScore: 'Legjobb Eredmény',
        gamesPlayed: 'Játékok Száma',
        averageScore: 'Átlag Pontszám'
    },
    
    player: {
        label: '👤 Játékos név:',
        placeholder: 'Add meg a neved',
        nameSaved: 'Név mentve: {name} ✅',
        anonymous: 'Névtelen'
    },
    
    difficulty: {
        label: 'Nehézség:',
        easy: 'Könnyű 😊',
        hard: 'Nehéz 🌀'
    },
    
    instructions: {
        title: 'Hogyan játssz:',
        text: 'Kattints és húzd az egeret (vagy érintsd és húzd az ujjad) hogy egy kört rajzolj. Minél tökéletesebb a köröd, annál több pontot kapsz! A kör varázslatos módon át fog változni! ✨'
    },
    
    leaderboard: {
        title: '🏆 Ranglista',
        local: '📱 Helyi',
        global: '🌍 Globális',
        localResults: '📱 Helyi eredmények',
        globalResults: '🌍 Globális eredmények',
        noResults: 'Még nincsenek eredmények',
        loading: 'Betöltés...',
        export: '📤 Export',
        import: '📥 Import'
    },
    
    scoreTitle: {
        result: 'Eredmény',
        perfect: '🏆 Tökéletes! Zseniális!',
        excellent: '🌟 Kiváló! Nagyon jó!',
        good: '👍 Jó munka!',
        notBad: '👌 Nem rossz!',
        tryAgain: '💪 Próbáld újra!'
    },
    
    scoreBreakdown: {
        shape: '🔵 Köralak',
        closure: '🔗 Záródás',
        smoothness: '🌊 Egyenletesség',
        size: '📏 Méret',
        transformation: '🎨 Transzformáció: {name}'
    },
    
    common: {
        points: 'pont'
    },
    
    transformation: {
        magic: '✨ Varázslat történik... ✨'
    },
    
    firebase: {
        connecting: '🟡 Kapcsolódás...',
        online: '🟢 Online',
        offline: '🔴 Offline',
        error: '❌ Hiba',
        offlineNotice: '⚠️ <strong>Offline mód:</strong> A globális ranglista nem elérhető. Az eredmények helyben mentődnek.'
    },
    
    visitors: {
        label: 'Látogatások:'
    },
    
    // EZEK HIÁNYOZTAK!
    audio: {
        enabled: '🔊 Hang Be',
        disabled: '🔇 Hang Ki',
        enabledMessage: 'Hang bekapcsolva!',
        disabledMessage: 'Hang kikapcsolva!'
    },
    
    theme: {
        light: '☀️ Világos',
        dark: '🌙 Sötét',
        lightEnabled: 'Világos téma bekapcsolva!',
        darkEnabled: 'Sötét téma bekapcsolva!'
    },
    
    advanced: {
        title: '⚙️ Fejlett Funkciók',
        features: 'Fejlett funkciók és beállítások',
        menu: 'Fejlett menü'
    },
    
    language: {
        info: '🌍 Nyelv Info',
        current: 'Jelenlegi nyelv',
        supported: 'Támogatott nyelvek'
    },
    
    transformations: {
        rainbow: 'Szivárvány',
        galaxy: 'Galaxis',
        flower: 'Virág',
        mandala: 'Mandala',
        spiral: 'Spirál',
        star: 'Csillag',
        heart: 'Szív',
        diamond: 'Gyémánt',
        wave: 'Hullám',
        fire: 'Tűz',
        transformText: '🎨 Transzformáció alkalmazva: {name}',
        transforming: '✨ Varázslat történik... ✨'
    },
    
  errors: {
        invalidName: 'Kérlek add meg a neved!',
        nameTooLong: 'A név maximum 20 karakter lehet!',
        tooFewPoints: 'Túl kevés pont! Rajzolj egy teljes kört.',
        analysisError: 'Elemzési hiba történt.',
        criticalError: 'Kritikus hiba történt. Kérlek frissítsd az oldalt.' // EZ HIÁNYZOTT!
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_hu = translations;
}
