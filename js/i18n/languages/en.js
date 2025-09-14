const translations = {
    title: 'Perfect Circle',
    subtitle: 'Draw the most perfect circle with a single movement!',
    
    buttons: {
        startDrawing: '🎯 Start Drawing',
        clear: '🗑️ Clear',
        help: '❓ Help',
        save: '💾 Save',
        clearScores: '🗑️ Clear Local Scores'
    },
    
    stats: {
        currentScore: 'Current Score',
        bestScore: 'Best Score',
        gamesPlayed: 'Games Played',
        averageScore: 'Average Score'
    },
    
    player: {
        label: '👤 Player name:',
        placeholder: 'Enter your name',
        nameSaved: 'Name saved: {name} ✅',
        anonymous: 'Anonymous'
    },
    
    difficulty: {
        label: 'Difficulty:',
        easy: 'Easy 😊',
        hard: 'Hard 🌀'
    },
    
    instructions: {
        title: 'How to play:',
        text: 'Click and drag your mouse (or touch and drag your finger) to draw a circle. The more perfect your circle, the more points you get! The circle will magically transform! ✨'
    },
    
    leaderboard: {
        title: '🏆 Leaderboard',
        local: '📱 Local',
        global: '🌍 Global',
        localResults: '📱 Local results',
        globalResults: '🌍 Global results',
        noResults: 'No results yet',
        loading: 'Loading...',
        export: '📤 Export',
        import: '📥 Import'
    },
    
    scoreTitle: {
        result: 'Result',
        perfect: '🏆 Perfect! Genius!',
        excellent: '🌟 Excellent! Very good!',
        good: '👍 Good work!',
        notBad: '👌 Not bad!',
        tryAgain: '💪 Try again!'
    },
    
    scoreBreakdown: {
        shape: '🔵 Circle Shape',
        closure: '🔗 Closure',
        smoothness: '🌊 Smoothness',
        size: '📏 Size',
        transformation: '🎨 Transformation: {name}'
    },
    
    common: {
        points: 'points'
    },
    
    transformation: {
        magic: '✨ Magic is happening... ✨'
    },
    
    firebase: {
        connecting: '🟡 Connecting...',
        online: '🟢 Online',
        offline: '🔴 Offline',
        error: '❌ Error',
        offlineNotice: '⚠️ <strong>Offline mode:</strong> Global leaderboard unavailable. Results saved locally.'
    },
    
    visitors: {
        label: 'Visits:'
    },
    
    audio: {
        enabled: '🔊 Sound On',
        disabled: '🔇 Sound Off',
        enabledMessage: 'Sound enabled!',
        disabledMessage: 'Sound disabled!'
    },
    
    theme: {
        light: '☀️ Light',
        dark: '🌙 Dark',
        lightEnabled: 'Light theme enabled!',
        darkEnabled: 'Dark theme enabled!'
    },
    
    advanced: {
        title: '⚙️ Advanced Features',
        features: 'Advanced features and settings',
        menu: 'Advanced menu'
    },
    
    language: {
        info: '🌍 Language Info',
        current: 'Current language',
        supported: 'Supported languages'
    },
    
    transformations: {
        rainbow: 'Rainbow',
        galaxy: 'Galaxy',
        flower: 'Flower',
        mandala: 'Mandala',
        spiral: 'Spiral',
        star: 'Star',
        heart: 'Heart',
        diamond: 'Diamond',
        wave: 'Wave',
        fire: 'Fire',
        transformText: '🎨 Transformation applied: {name}',
        transforming: '✨ Magic is happening... ✨'
    },
    
    errors: {
        invalidName: 'Please enter your name!',
        nameTooLong: 'Name can be maximum 20 characters!',
        tooFewPoints: 'Too few points! Draw a complete circle.',
        analysisError: 'Analysis error occurred.',
        criticalError: 'Critical error occurred. Please refresh the page.'
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_en = translations;
}
