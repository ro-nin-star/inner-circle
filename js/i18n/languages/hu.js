// Magyar nyelvi fájl
window.i18nLanguages = window.i18nLanguages || {};
window.i18nLanguages.hu = {
    // Alapvető UI elemek
    title: "Perfect Circle",
    subtitle: "Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!",
    
    // Instrukciók
    instructions: {
        title: "Hogyan játssz:",
        text: "Kattints és húzd az egeret (vagy érintsd és húzd az ujjad) hogy egy kört rajzolj. Minél tökéletesebb a köröd, annál több pontot kapsz! A kör varázslatos módon át fog változni! ✨"
    },
    
    // Gombok
    buttons: {
        startDrawing: "🎯 Rajzolás Kezdése",
        clear: "🗑️ Törlés",
        help: "❓ Segítség",
        clearScores: "🗑️ Helyi Eredmények Törlése",
        save: "💾 Mentés",
        export: "📤 Exportálás",
        import: "📥 Importálás"
    },
    
    // Statisztikák
    stats: {
        currentScore: "Jelenlegi Pontszám",
        bestScore: "Legjobb Eredmény", 
        gamesPlayed: "Játékok Száma",
        averageScore: "Átlag Pontszám"
    },
    
    // Nehézségi szintek
    difficulty: {
        label: "Nehézség:",
        easy: "Könnyű 😊",
        hard: "Nehéz 🌀"
    },
    
    // Játékos
    player: {
        label: "👤 Játékos név:",
        placeholder: "Add meg a neved",
        nameSaved: "Név mentve: {name} ✅"
    },
    
    // Ranglista
    leaderboard: {
        title: "🏆 Ranglista",
        local: "📱 Helyi",
        global: "🌍 Globális",
        localResults: "📱 Helyi eredmények",
        globalResults: "🌍 Globális eredmények",
        noResults: "Még nincsenek eredmények",
        loadingGlobal: "Globális eredmények betöltése...",
        globalTop: "🌍 Globális toplista ({count} játékos)",
        localCount: "📱 Helyi eredmények ({count} játék)"
    },
    
    // Pontszám címek
    scoreTitle: {
        perfect: "🏆 Tökéletes! Zseniális!",
        excellent: "🌟 Kiváló! Nagyon jó!",
        good: "👍 Jó munka!",
        notBad: "👌 Nem rossz!",
        tryAgain: "💪 Próbáld újra!"
    },
    
    // Pontszám részletezés
    scoreBreakdown: {
        shape: "Köralak",
        closure: "Záródás", 
        smoothness: "Egyenletesség",
        size: "Méret",
        transformation: "✨ Transzformáció: {name}!"
    },
    
    // Transzformációk
    transformations: {
        sun: "Nap",
        pizza: "Pizza",
        donut: "Donut", 
        moon: "Hold",
        earth: "Földgömb",
        ball: "Labda",
        clock: "Óra",
        flower: "Virág",
        emoji: "Emoji",
        cookie: "Keksz",
        transforming: "✨ Varázslat történik... ✨",
        transformText: "A köröd {name}-átlakult! {emoji}"
    },
    
    // Hibák
    errors: {
        tooFewPoints: "Túl kevés pont! Rajzolj egy teljes kört.",
        firebaseOffline: "Firebase nem elérhető",
        saveFailed: "Mentés sikertelen",
        loadFailed: "Betöltés sikertelen",
        invalidName: "Kérlek add meg a neved!",
        nameTooLong: "A név maximum 20 karakter lehet!"
    },
    
    // Firebase státusz
    firebase: {
        online: "🟢 Online",
        offline: "🔴 Offline", 
        connecting: "🟡 Kapcsolódás...",
        error: "❌ Hiba",
        offlineNotice: "⚠️ Offline mód: A globális ranglista nem elérhető. Az eredmények helyben mentődnek."
    },
    
    // Látogatásszámláló
    visitors: {
        label: "Látogatások:",
        stats: "📊 LÁTOGATÁSI STATISZTIKÁK",
        local: "👤 Helyi látogatások: {count}",
        global: "🌍 Globális látogatások: {count}",
        today: "📅 Mai látogatások: {count}",
        unique: "🔄 Egyedi munkamenetek: {count}",
        recent: "📈 LEGUTÓBBI LÁTOGATÁSOK:",
        session: "🆔 Munkamenet ID: {id}",
        lastVisit: "🕒 Utolsó látogatás: {time}"
    },
    
    // Fejlett funkciók
    advanced: {
        title: "⚙️ FEJLETT FUNKCIÓK",
        keyboard: "🎮 BILLENTYŰ PARANCSOK:",
        dataManagement: "📊 ADATKEZELÉS:",
        debugging: "🔧 HIBAKERESÉS:",
        performance: "🚀 TELJESÍTMÉNY TESZT EREDMÉNY",
        exportSuccess: "Eredmények exportálva! ✅",
        importSuccess: "✅ Sikeres import!\n{imported} eredmény importálva\nÖsszesen: {total} eredmény",
        clearAllConfirm: "⚠️ FIGYELEM!\n\nEz törli az ÖSSZES helyi adatot:\n• Eredmények\n• Játékos név\n• Beállítások\n• Látogatási számláló\n\nBiztosan folytatod?",
        allDataCleared: "✅ Minden helyi adat törölve!"
    },
    
    // Audio
    audio: {
        enabled: "🔊 Hang Be",
        disabled: "🔇 Hang Ki",
        enabledMessage: "Hang bekapcsolva 🔊",
        disabledMessage: "Hang kikapcsolva 🔇"
    },
    
    // Téma
    theme: {
        light: "☀️ Világos",
        dark: "🌙 Sötét",
        lightEnabled: "Világos téma bekapcsolva ☀️",
        darkEnabled: "Sötét téma bekapcsolva 🌙"
    },
    
    // Instrukciók teljes szövege
    fullInstructions: `🎯 PERFECT CIRCLE - TELJES ÚTMUTATÓ

📝 JÁTÉK CÉLJA:
Rajzolj a lehető legtökéletesebb kört egyetlen mozdulattal!

🎮 IRÁNYÍTÁS:
• 🖱️ Egér: Kattints és húzd
• 📱 Mobil: Érintsd és húzd
• ⌨️ Billentyűk: Ctrl+S (start), Ctrl+R (törlés), Esc (stop)

📊 PONTOZÁSI RENDSZER (max 100 pont):
• 🔵 Köralak (40p): Mennyire kerek a formád
• 🔗 Záródás (20p): Mennyire zárul be jól a kör
• 📏 Egyenletesség (25p): Mennyire egyenletes a vonalvastagság  
• 📐 Méret (15p): Megfelelő méretű-e a kör

🎯 NEHÉZSÉGI SZINTEK:
• 🟢 Könnyű: 50-150px sugár, stabil UI
• 🔴 Nehéz: 20-190px sugár + forgó UI!

✨ VARÁZSLATOS TRANSZFORMÁCIÓK:
A köröd pontosan követi az alakodat és átalakul:
• ☀️ Nap • 🍕 Pizza • 🍩 Donut • 🌙 Hold
• 🌍 Földgömb • ⚽ Labda • 🕐 Óra • 🌸 Virág
• 😊 Emoji • 🍪 Keksz

🌍 GLOBÁLIS RANGLISTA:
• 👤 Add meg a neved a globális versenyhez!
• 🏆 Versenyezz játékosokkal világszerte!
• 📊 Firebase státusz: jobb felső sarokban
• 📴 Offline módban is játszhatsz!

Sok sikert a tökéletes kör rajzolásához! 🍀✨`,
    
    // Dátum és idő formátumok
    dateTime: {
        locale: "hu-HU",
        dateFormat: "YYYY.MM.DD",
        timeFormat: "HH:mm:ss"
    }
};
