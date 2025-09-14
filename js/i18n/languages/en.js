// English language file
window.i18nLanguages = window.i18nLanguages || {};
window.i18nLanguages.en = {
    title: "Perfect Circle",
    subtitle: "Draw the most perfect circle in one single motion!",
    
    instructions: {
        title: "How to play:",
        text: "Click and drag your mouse (or touch and drag your finger) to draw a circle. The more perfect your circle, the more points you get! Your circle will magically transform! ✨"
    },
    
    buttons: {
        startDrawing: "🎯 Start Drawing",
        clear: "🗑️ Clear",
        help: "❓ Help",
        clearScores: "🗑️ Clear Local Scores",
        save: "💾 Save",
        export: "📤 Export",
        import: "📥 Import"
    },
    
    stats: {
        currentScore: "Current Score",
        bestScore: "Best Score",
        gamesPlayed: "Games Played",
        averageScore: "Average Score"
    },
    
    difficulty: {
        label: "Difficulty:",
        easy: "Easy 😊",
        hard: "Hard 🌀"
    },
    
    player: {
        label: "👤 Player name:",
        placeholder: "Enter your name",
        nameSaved: "Name saved: {name} ✅"
    },
    
    leaderboard: {
        title: "🏆 Leaderboard",
        local: "📱 Local",
        global: "🌍 Global",
        localResults: "📱 Local results",
        globalResults: "🌍 Global results",
        noResults: "No results yet",
        loadingGlobal: "Loading global results...",
        globalTop: "🌍 Global leaderboard ({count} players)",
        localCount: "📱 Local results ({count} games)"
    },
    
    scoreTitle: {
        perfect: "🏆 Perfect! Genius!",
        excellent: "🌟 Excellent! Very good!",
        good: "👍 Good work!",
        notBad: "👌 Not bad!",
        tryAgain: "💪 Try again!"
    },
    
    scoreBreakdown: {
        shape: "Shape",
        closure: "Closure",
        smoothness: "Smoothness", 
        size: "Size",
        transformation: "✨ Transformation: {name}!"
    },
    
    transformations: {
        sun: "Sun",
        pizza: "Pizza",
        donut: "Donut",
        moon: "Moon",
        earth: "Earth",
        ball: "Ball",
        clock: "Clock",
        flower: "Flower",
        emoji: "Emoji",
        cookie: "Cookie",
        transforming: "✨ Magic is happening... ✨",
        transformText: "Your circle transformed into a {name}! {emoji}"
    },
    
    errors: {
        tooFewPoints: "Too few points! Draw a complete circle.",
        firebaseOffline: "Firebase not available",
        saveFailed: "Save failed",
        loadFailed: "Load failed",
        invalidName: "Please enter your name!",
        nameTooLong: "Name can be maximum 20 characters!"
    },
    
    firebase: {
        online: "🟢 Online",
        offline: "🔴 Offline",
        connecting: "🟡 Connecting...",
        error: "❌ Error",
        offlineNotice: "⚠️ Offline mode: Global leaderboard not available. Results saved locally."
    },
    
    visitors: {
        label: "Visits:",
        stats: "📊 VISITOR STATISTICS",
        local: "👤 Local visits: {count}",
        global: "🌍 Global visits: {count}",
        today: "📅 Today's visits: {count}",
        unique: "🔄 Unique sessions: {count}",
        recent: "📈 RECENT VISITS:",
        session: "🆔 Session ID: {id}",
        lastVisit: "🕒 Last visit: {time}"
    },
    
    advanced: {
        title: "⚙️ ADVANCED FEATURES",
        keyboard: "🎮 KEYBOARD SHORTCUTS:",
        dataManagement: "📊 DATA MANAGEMENT:",
        debugging: "🔧 DEBUGGING:",
        performance: "🚀 PERFORMANCE TEST RESULT",
        exportSuccess: "Results exported! ✅",
        importSuccess: "✅ Successful import!\n{imported} results imported\nTotal: {total} results",
        clearAllConfirm: "⚠️ WARNING!\n\nThis will delete ALL local data:\n• Results\n• Player name\n• Settings\n• Visit counter\n\nAre you sure?",
        allDataCleared: "✅ All local data cleared!"
    },
    
    audio: {
        enabled: "🔊 Sound On",
        disabled: "🔇 Sound Off",
        enabledMessage: "Sound enabled 🔊",
        disabledMessage: "Sound disabled 🔇"
    },
    
    theme: {
        light: "☀️ Light",
        dark: "🌙 Dark",
        lightEnabled: "Light theme enabled ☀️",
        darkEnabled: "Dark theme enabled 🌙"
    },
    
    fullInstructions: `🎯 PERFECT CIRCLE - COMPLETE GUIDE

📝 GAME OBJECTIVE:
Draw the most perfect circle in one single motion!

🎮 CONTROLS:
• 🖱️ Mouse: Click and drag
• 📱 Mobile: Touch and drag
• ⌨️ Keyboard: Ctrl+S (start), Ctrl+R (clear), Esc (stop)

📊 SCORING SYSTEM (max 100 points):
• 🔵 Shape (40p): How round your shape is
• 🔗 Closure (20p): How well the circle closes
• 📏 Smoothness (25p): How even the line thickness is
• 📐 Size (15p): Whether the size is appropriate

🎯 DIFFICULTY LEVELS:
• 🟢 Easy: 50-150px radius, stable UI
• 🔴 Hard: 20-190px radius + rotating UI!

✨ MAGICAL TRANSFORMATIONS:
Your circle follows your exact shape and transforms into:
• ☀️ Sun • 🍕 Pizza • 🍩 Donut • 🌙 Moon
• 🌍 Earth • ⚽ Ball • 🕐 Clock • 🌸 Flower
• 😊 Emoji • 🍪 Cookie

🌍 GLOBAL LEADERBOARD:
• 👤 Enter your name for global competition!
• 🏆 Compete with players worldwide!
• 📊 Firebase status: top right corner
• 📴 Play offline too!

Good luck drawing the perfect circle! 🍀✨`,
    
    dateTime: {
        locale: "en-US",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "h:mm:ss A"
    }
};
