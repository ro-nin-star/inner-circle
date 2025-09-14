const translations = {
    title: 'Perfect Circle',
    subtitle: 'Dessinez le cercle le plus parfait d\'un seul mouvement !',
    
    buttons: {
        startDrawing: '🎯 Commencer à Dessiner',
        clear: '🗑️ Effacer',
        help: '❓ Aide',
        save: '💾 Sauvegarder',
        clearScores: '🗑️ Effacer les Scores Locaux'
    },
    
    stats: {
        currentScore: 'Score Actuel',
        bestScore: 'Meilleur Score',
        gamesPlayed: 'Jeux Joués',
        averageScore: 'Score Moyen'
    },
    
    player: {
        label: '👤 Nom du joueur :',
        placeholder: 'Entrez votre nom',
        nameSaved: 'Nom sauvegardé : {name} ✅',
        anonymous: 'Anonyme'
    },
    
    difficulty: {
        label: 'Difficulté :',
        easy: 'Facile 😊',
        hard: 'Difficile 🌀'
    },
    
    instructions: {
        title: 'Comment jouer :',
        text: 'Cliquez et faites glisser votre souris (ou touchez et faites glisser votre doigt) pour dessiner un cercle. Plus votre cercle est parfait, plus vous obtenez de points ! Le cercle se transformera magiquement ! ✨'
    },
    
    leaderboard: {
        title: '🏆 Classement',
        local: '📱 Local',
        global: '🌍 Global',
        localResults: '📱 Résultats locaux',
        globalResults: '🌍 Résultats globaux',
        noResults: 'Aucun résultat pour le moment',
        loading: 'Chargement...',
        export: '📤 Exporter',
        import: '📥 Importer'
    },
    
    scoreTitle: {
        result: 'Résultat',
        perfect: '🏆 Parfait ! Génial !',
        excellent: '🌟 Excellent ! Très bien !',
        good: '👍 Bon travail !',
        notBad: '👌 Pas mal !',
        tryAgain: '💪 Essayez encore !'
    },
    
    scoreBreakdown: {
        shape: '🔵 Forme du Cercle',
        closure: '🔗 Fermeture',
        smoothness: '🌊 Fluidité',
        size: '📏 Taille',
        transformation: '🎨 Transformation : {name}'
    },
    
    common: {
        points: 'points'
    },
    
    transformation: {
        magic: '✨ La magie opère... ✨'
    },
    
    firebase: {
        connecting: '🟡 Connexion...',
        online: '🟢 En ligne',
        offline: '🔴 Hors ligne',
        error: '❌ Erreur',
        offlineNotice: '⚠️ <strong>Mode hors ligne :</strong> Classement global indisponible. Résultats sauvegardés localement.'
    },
    
    visitors: {
        label: 'Visites :'
    },
    
    audio: {
        enabled: '🔊 Son Activé',
        disabled: '🔇 Son Désactivé',
        enabledMessage: 'Son activé !',
        disabledMessage: 'Son désactivé !'
    },
    
    theme: {
        light: '☀️ Clair',
        dark: '🌙 Sombre',
        lightEnabled: 'Thème clair activé !',
        darkEnabled: 'Thème sombre activé !'
    },
    
    advanced: {
        title: '⚙️ Fonctions Avancées',
        features: 'Fonctions avancées et paramètres',
        menu: 'Menu avancé'
    },
    
    language: {
        info: '🌍 Info Langue',
        current: 'Langue actuelle',
        supported: 'Langues supportées'
    },
    
    transformations: {
        rainbow: 'Arc-en-ciel',
        galaxy: 'Galaxie',
        flower: 'Fleur',
        mandala: 'Mandala',
        spiral: 'Spirale',
        star: 'Étoile',
        heart: 'Cœur',
        diamond: 'Diamant',
        wave: 'Vague',
        fire: 'Feu',
        transformText: '🎨 Transformation appliquée : {name}',
        transforming: '✨ La magie opère... ✨'
    },
    
    errors: {
        invalidName: 'Veuillez entrer votre nom !',
        nameTooLong: 'Le nom peut avoir au maximum 20 caractères !',
        tooFewPoints: 'Trop peu de points ! Dessinez un cercle complet.',
        analysisError: 'Une erreur d\'analyse s\'est produite.',
        criticalError: 'Une erreur critique s\'est produite. Veuillez actualiser la page.'
    }
};

// Globális hozzáférés
if (typeof window !== 'undefined') {
    window.translations_fr = translations;
}
