const translations = {
    title: 'Perfect Circle',
    subtitle: 'Zeichne den perfektesten Kreis mit einer einzigen Bewegung!',
    
    buttons: {
        startDrawing: '🎯 Zeichnen Beginnen',
        clear: '🗑️ Löschen',
        help: '❓ Hilfe',
        save: '💾 Speichern',
        clearScores: '🗑️ Lokale Ergebnisse Löschen'
    },
    
    stats: {
        currentScore: 'Aktuelle Punktzahl',
        bestScore: 'Beste Punktzahl',
        gamesPlayed: 'Gespielte Spiele',
        averageScore: 'Durchschnittliche Punktzahl'
    },
    
    player: {
        label: '👤 Spielername:',
        placeholder: 'Gib deinen Namen ein',
        nameSaved: 'Name gespeichert: {name} ✅',
        anonymous: 'Anonym'
    },
    
    difficulty: {
        label: 'Schwierigkeit:',
        easy: 'Einfach 😊',
        hard: 'Schwer 🌀'
    },
    
    instructions: {
        title: 'Wie man spielt:',
        text: 'Klicke und ziehe deine Maus (oder berühre und ziehe deinen Finger), um einen Kreis zu zeichnen. Je perfekter dein Kreis, desto mehr Punkte bekommst du! Der Kreis wird sich magisch verwandeln! ✨'
    },
    
    leaderboard: {
        title: '🏆 Bestenliste',
        local: '📱 Lokal',
        global: '🌍 Global',
        localResults: '📱 Lokale Ergebnisse',
        globalResults: '🌍 Globale Ergebnisse',
        noResults: 'Noch keine Ergebnisse',
        loading: 'Laden...',
        export: '📤 Exportieren',
        import: '📥 Importieren'
    },
    
    scoreTitle: {
        result: 'Ergebnis',
        perfect: '🏆 Perfekt! Genial!',
        excellent: '🌟 Ausgezeichnet! Sehr gut!',
        good: '👍 Gute Arbeit!',
        notBad: '👌 Nicht schlecht!',
        tryAgain: '💪 Versuche es nochmal!'
    },
    
    scoreBreakdown: {
        shape: '🔵 Kreisform',
        closure: '🔗 Verschluss',
        smoothness: '🌊 Glätte',
        size: '📏 Größe',
        transformation: '🎨 Transformation: {name}'
    },
    
    common: {
        points: 'Punkte'
    },
    
    transformation: {
        magic: '✨ Magie geschieht... ✨'
    },
    
    firebase: {
        connecting: '🟡 Verbinden...',
        online: '🟢 Online',
        offline: '🔴 Offline',
        error: '❌ Fehler',
        offlineNotice: '⚠️ <strong>Offline-Modus:</strong> Globale Bestenliste nicht verfügbar. Ergebnisse werden lokal gespeichert.'
    },
    
    visitors: {
        label: 'Besuche:'
    },
    
    audio: {
        enabled: '🔊 Ton Ein',
        disabled: '🔇 Ton Aus',
        enabledMessage: 'Ton aktiviert!',
        disabledMessage: 'Ton deaktiviert!'
    },
    
    theme: {
        light: '☀️ Hell',
        dark: '🌙 Dunkel',
        lightEnabled: 'Helles Theme aktiviert!',
        darkEnabled: 'Dunkles Theme aktiviert!'
    },
    
    advanced: {
        title: '⚙️ Erweiterte Funktionen',
        features: 'Erweiterte Funktionen und Einstellungen',
        menu: 'Erweiterte Menü'
    },
    
    language: {
        info: '🌍 Sprach Info',
        current: 'Aktuelle Sprache',
        supported: 'Unterstützte Sprachen'
    },
    
    transformations: {
        rainbow: 'Regenbogen',
        galaxy: 'Galaxie',
        flower: 'Blume',
        mandala: 'Mandala',
        spiral: 'Spirale',
        star: 'Stern',
        heart: 'Herz',
        diamond: 'Diamant',
        wave: 'Welle',
        fire: 'Feuer',
        transformText: '🎨 Transformation angewendet: {name}',
        transforming: '✨ Magie geschieht... ✨'
    },
    
    errors: {
        invalidName: 'Bitte gib deinen Namen ein!',
        nameTooLong: 'Name kann maximal 20 Zeichen haben!',
        tooFewPoints: 'Zu wenige Punkte! Zeichne einen vollständigen Kreis.',
        analysisError: 'Analysefehler aufgetreten.',
        criticalError: 'Kritischer Fehler aufgetreten. Bitte lade die Seite neu.'
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_de = translations;
}
