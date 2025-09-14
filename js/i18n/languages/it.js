const translations = {
    title: 'Perfect Circle',
    subtitle: 'Disegna il cerchio più perfetto con un solo movimento!',
    
    buttons: {
        startDrawing: '🎯 Inizia a Disegnare',
        clear: '🗑️ Cancella',
        help: '❓ Aiuto',
        save: '💾 Salva',
        clearScores: '🗑️ Cancella Punteggi Locali'
    },
    
    stats: {
        currentScore: 'Punteggio Attuale',
        bestScore: 'Miglior Punteggio',
        gamesPlayed: 'Partite Giocate',
        averageScore: 'Punteggio Medio'
    },
    
    player: {
        label: '👤 Nome giocatore:',
        placeholder: 'Inserisci il tuo nome',
        nameSaved: 'Nome salvato: {name} ✅',
        anonymous: 'Anonimo'
    },
    
    difficulty: {
        label: 'Difficoltà:',
        easy: 'Facile 😊',
        hard: 'Difficile 🌀'
    },
    
    instructions: {
        title: 'Come giocare:',
        text: 'Clicca e trascina il mouse (o tocca e trascina il dito) per disegnare un cerchio. Più perfetto è il tuo cerchio, più punti ottieni! Il cerchio si trasformerà magicamente! ✨'
    },
    
    leaderboard: {
        title: '🏆 Classifica',
        local: '📱 Locale',
        global: '🌍 Globale',
        localResults: '📱 Risultati locali',
        globalResults: '🌍 Risultati globali',
        noResults: 'Nessun risultato ancora',
        loading: 'Caricamento...',
        export: '📤 Esporta',
        import: '📥 Importa'
    },
    
    scoreTitle: {
        result: 'Risultato',
        perfect: '🏆 Perfetto! Geniale!',
        excellent: '🌟 Eccellente! Molto bene!',
        good: '👍 Buon lavoro!',
        notBad: '👌 Non male!',
        tryAgain: '💪 Prova ancora!'
    },
    
    scoreBreakdown: {
        shape: '🔵 Forma del Cerchio',
        closure: '🔗 Chiusura',
        smoothness: '🌊 Fluidità',
        size: '📏 Dimensione',
        transformation: '🎨 Trasformazione: {name}'
    },
    
    common: {
        points: 'punti'
    },
    
    transformation: {
        magic: '✨ La magia sta accadendo... ✨'
    },
    
    firebase: {
        connecting: '🟡 Connessione...',
        online: '🟢 Online',
        offline: '🔴 Offline',
        error: '❌ Errore',
        offlineNotice: '⚠️ <strong>Modalità offline:</strong> Classifica globale non disponibile. Risultati salvati localmente.'
    },
    
    visitors: {
        label: 'Visite:'
    },
    
    audio: {
        enabled: '🔊 Audio Attivo',
        disabled: '🔇 Audio Disattivo',
        enabledMessage: 'Audio attivato!',
        disabledMessage: 'Audio disattivato!'
    },
    
    theme: {
        light: '☀️ Chiaro',
        dark: '🌙 Scuro',
        lightEnabled: 'Tema chiaro attivato!',
        darkEnabled: 'Tema scuro attivato!'
    },
    
    advanced: {
        title: '⚙️ Funzioni Avanzate',
        features: 'Funzioni avanzate e impostazioni',
        menu: 'Menu avanzato'
    },
    
    language: {
        info: '🌍 Info Lingua',
        current: 'Lingua attuale',
        supported: 'Lingue supportate'
    },
    
    transformations: {
        rainbow: 'Arcobaleno',
        galaxy: 'Galassia',
        flower: 'Fiore',
        mandala: 'Mandala',
        spiral: 'Spirale',
        star: 'Stella',
        heart: 'Cuore',
        diamond: 'Diamante',
        wave: 'Onda',
        fire: 'Fuoco',
        transformText: '🎨 Trasformazione applicata: {name}',
        transforming: '✨ La magia sta accadendo... ✨'
    },
    
    errors: {
        invalidName: 'Per favore inserisci il tuo nome!',
        nameTooLong: 'Il nome può avere massimo 20 caratteri!',
        tooFewPoints: 'Troppo pochi punti! Disegna un cerchio completo.',
        analysisError: 'Si è verificato un errore di analisi.',
        criticalError: 'Si è verificato un errore critico. Per favore ricarica la pagina.'
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_it = translations;
}
