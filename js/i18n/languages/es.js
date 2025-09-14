const translations = {
    title: 'Perfect Circle',
    subtitle: '¡Dibuja el círculo más perfecto con un solo movimiento!',
    
    buttons: {
        startDrawing: '🎯 Empezar a Dibujar',
        clear: '🗑️ Limpiar',
        help: '❓ Ayuda',
        save: '💾 Guardar',
        clearScores: '🗑️ Limpiar Puntuaciones Locales'
    },
    
    stats: {
        currentScore: 'Puntuación Actual',
        bestScore: 'Mejor Puntuación',
        gamesPlayed: 'Juegos Jugados',
        averageScore: 'Puntuación Promedio'
    },
    
    player: {
        label: '👤 Nombre del jugador:',
        placeholder: 'Ingresa tu nombre',
        nameSaved: 'Nombre guardado: {name} ✅',
        anonymous: 'Anónimo'
    },
    
    difficulty: {
        label: 'Dificultad:',
        easy: 'Fácil 😊',
        hard: 'Difícil 🌀'
    },
    
    instructions: {
        title: 'Cómo jugar:',
        text: 'Haz clic y arrastra tu ratón (o toca y arrastra tu dedo) para dibujar un círculo. ¡Cuanto más perfecto sea tu círculo, más puntos obtienes! ¡El círculo se transformará mágicamente! ✨'
    },
    
    leaderboard: {
        title: '🏆 Tabla de Clasificación',
        local: '📱 Local',
        global: '🌍 Global',
        localResults: '📱 Resultados locales',
        globalResults: '🌍 Resultados globales',
        noResults: 'Aún no hay resultados',
        loading: 'Cargando...',
        export: '📤 Exportar',
        import: '📥 Importar'
    },
    
    scoreTitle: {
        result: 'Resultado',
        perfect: '🏆 ¡Perfecto! ¡Genial!',
        excellent: '🌟 ¡Excelente! ¡Muy bien!',
        good: '👍 ¡Buen trabajo!',
        notBad: '👌 ¡No está mal!',
        tryAgain: '💪 ¡Inténtalo de nuevo!'
    },
    
    scoreBreakdown: {
        shape: '🔵 Forma del Círculo',
        closure: '🔗 Cierre',
        smoothness: '🌊 Suavidad',
        size: '📏 Tamaño',
        transformation: '🎨 Transformación: {name}'
    },
    
    common: {
        points: 'puntos'
    },
    
    transformation: {
        magic: '✨ La magia está sucediendo... ✨'
    },
    
    firebase: {
        connecting: '🟡 Conectando...',
        online: '🟢 En línea',
        offline: '🔴 Sin conexión',
        error: '❌ Error',
        offlineNotice: '⚠️ <strong>Modo sin conexión:</strong> Tabla de clasificación global no disponible. Resultados guardados localmente.'
    },
    
    visitors: {
        label: 'Visitas:'
    },
    
    audio: {
        enabled: '🔊 Sonido Activado',
        disabled: '🔇 Sonido Desactivado',
        enabledMessage: '¡Sonido activado!',
        disabledMessage: '¡Sonido desactivado!'
    },
    
    theme: {
        light: '☀️ Claro',
        dark: '🌙 Oscuro',
        lightEnabled: '¡Tema claro activado!',
        darkEnabled: '¡Tema oscuro activado!'
    },
    
    advanced: {
        title: '⚙️ Funciones Avanzadas',
        features: 'Funciones avanzadas y configuraciones',
        menu: 'Menú avanzado'
    },
    
    language: {
        info: '🌍 Info de Idioma',
        current: 'Idioma actual',
        supported: 'Idiomas compatibles'
    },
    
    transformations: {
        rainbow: 'Arcoíris',
        galaxy: 'Galaxia',
        flower: 'Flor',
        mandala: 'Mandala',
        spiral: 'Espiral',
        star: 'Estrella',
        heart: 'Corazón',
        diamond: 'Diamante',
        wave: 'Onda',
        fire: 'Fuego',
        transformText: '🎨 Transformación aplicada: {name}',
        transforming: '✨ La magia está sucediendo... ✨'
    },
    
    errors: {
        invalidName: '¡Por favor ingresa tu nombre!',
        nameTooLong: '¡El nombre puede tener máximo 20 caracteres!',
        tooFewPoints: '¡Muy pocos puntos! Dibuja un círculo completo.',
        analysisError: 'Ocurrió un error de análisis.',
        criticalError: 'Ocurrió un error crítico. Por favor recarga la página.'
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_es = translations;
}
