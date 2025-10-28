export type Language = "nl" | "en";

export interface Translations {
  common: {
    dashboard: string;
    tools: string;
    settings: string;
    profile: string;
    logout: string;
    credits: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    search: string;
    filter: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    toggle: string;
    notifications: string;
    account: string;
    signOut: string;
    back: string;
    next: string;
    submit: string;
    viewAll: string;
  };
  auth: {
    login: string;
    signup: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    createAccount: string;
    name: string;
    confirmPassword: string;
    loggingIn: string;
    signingUp: string;
    invalidEmailPassword: string;
    userExists: string;
    passwordTooShort: string;
    passwordsDontMatch: string;
    loginError: string;
    signupError: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    welcomeBack: string;
    stats: string;
    recentActivity: string;
    quickAccess: string;
    noActivity: string;
    creditsRemaining: string;
    last30Days: string;
    totalJobs: string;
    successRate: string;
    credits: string;
    yourStats: string;
    overview: string;
    activity: string;
  };
  tools: {
    title: string;
    description: string;
    allTools: string;
    toolAvailable: string;
    enabledTools: string;
    viewAllTools: string;
    categories: {
      all: string;
      contentCreation: string;
      textProcessing: string;
      marketing: string;
      socialMedia: string;
      language: string;
      documentProcessing: string;
      creative: string;
      fashion: string;
      imageEditing: string;
      audioProcessing: string;
    };
    toolNames: {
      [key: string]: string;
    };
    toolDescriptions: {
      [key: string]: string;
    };
  };
  sidebar: {
    home: string;
    allTools: string;
    aiChat: string;
    sinterklaasTools: string;
    gedichtenGenerator: string;
    cadeautips: string;
    surpriseIdeeen: string;
    copywriterStudio: string;
    summarizer: string;
    rewriter: string;
    seoOptimizer: string;
    linkedInContent: string;
    translation: string;
    transcription: string;
    ocr: string;
    imageGeneration: string;
    backgroundRemover: string;
    digitalWardrobe: string;
    billing: string;
    usageStats: string;
    documentation: string;
    support: string;
    adminSettings: string;
  };
  header: {
    credits: string;
    profile: string;
    new: string;
    toggleMenu: string;
  };
  settings: {
    title: string;
    description: string;
    language: string;
    languageDescription: string;
    profile: string;
    account: string;
    notifications: string;
    preferences: string;
  };
  billing: {
    title: string;
    currentPlan: string;
    upgrade: string;
    manage: string;
  };
  usage: {
    title: string;
    usage: string;
  };
  aiTools: {
    gedichten: {
      title: string;
      description: string;
      inputFields: {
        name: string;
        namePlaceholder: string;
        age: string;
        agePlaceholder: string;
        likes: string;
        likesPlaceholder: string;
        gift: string;
        giftPlaceholder: string;
        notes: string;
        notesPlaceholder: string;
      };
      tone: string;
      tones: {
        traditioneel: string;
        modern: string;
        grappig: string;
        hartverwarmend: string;
      };
      actions: {
        generate: string;
        generating: string;
        download: string;
        copy: string;
        copied: string;
      };
      cost: string;
      enterName: string;
      notLoggedIn: string;
      yourGedicht: string;
      creditsUsed: string;
      noResults: string;
      historyTitle: string;
      historyDescription: string;
    };
    voicemail: {
      title: string;
      description: string;
      inputFields: {
        childName: string;
        childNamePlaceholder: string;
        age: string;
        agePlaceholder: string;
        achievements: string;
        achievementsPlaceholder: string;
        behaviorNotes: string;
        behaviorNotesPlaceholder: string;
      };
      tone: string;
      tones: {
        traditioneel: string;
        liefdevol: string;
        grappig: string;
        bemoedigend: string;
      };
      options: {
        rhyming: string;
        explicit: string;
      };
      actions: {
        generate: string;
        generating: string;
        downloading: string;
        listening: string;
      };
      cost: string;
      enterChildName: string;
      notLoggedIn: string;
      yourVoicemail: string;
      creditsUsed: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      dashboard: "Dashboard",
      tools: "Tools",
      settings: "Settings",
      profile: "Profile",
      logout: "Log out",
      credits: "Credits",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      search: "Search",
      filter: "Filter",
      all: "All",
      none: "None",
      yes: "Yes",
      no: "No",
      toggle: "Toggle",
      notifications: "Notifications",
      account: "Account",
      signOut: "Sign Out",
      back: "Back",
      next: "Next",
      submit: "Submit",
      viewAll: "View All",
    },
    auth: {
      login: "Login",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      createAccount: "Create an account",
      name: "Name",
      confirmPassword: "Confirm Password",
      loggingIn: "Logging in...",
      signingUp: "Signing up...",
      invalidEmailPassword: "Invalid email or password",
      userExists: "User with this email already exists",
      passwordTooShort: "Password must be at least 8 characters long",
      passwordsDontMatch: "Passwords don't match",
      loginError: "Error logging in",
      signupError: "Error signing up",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back",
      welcomeBack: "Welcome back",
      stats: "Your Stats",
      recentActivity: "Recent Activity",
      quickAccess: "Quick Access",
      noActivity: "No activity yet",
      creditsRemaining: "Credits Remaining",
      last30Days: "Last 30 Days",
      totalJobs: "Total Jobs",
      successRate: "Success Rate",
      credits: "Credits",
      yourStats: "Your Stats",
      overview: "Overview",
      activity: "Activity",
    },
    tools: {
      title: "AI Tools",
      description: "Professional-grade AI tools with advanced parameters",
      allTools: "All AI Tools",
      toolAvailable: "AI Tools Available",
      enabledTools: "Enabled Tools",
      viewAllTools: "View All Tools",
      categories: {
        all: "All",
        contentCreation: "Content Creation",
        textProcessing: "Text Processing",
        marketing: "Marketing",
        socialMedia: "Social Media",
        language: "Language",
        documentProcessing: "Document Processing",
        creative: "Creative",
        fashion: "Fashion",
        imageEditing: "Image Editing",
        audioProcessing: "Audio Processing",
      },
      toolNames: {
        copywriting: "AI Copywriter Studio",
        summarizer: "Text Summarizer",
        rewriter: "Content Rewriter",
        "seo-optimizer": "SEO Optimizer",
        "linkedin-content": "LinkedIn Content Engine",
        translation: "Translation",
        transcription: "Transcription Suite",
        ocr: "OCR Text Extraction",
        "image-generation": "Image Generation",
        "background-removal": "Background Remover",
        wardrobe: "Virtual Wardrobe",
        sinterklaas_gedicht: "Gedichten Generator",
        sinterklaas_brief: "Brief van Sinterklaas",
        lootjestrekken: "Lootjestrekken",
        familie_moment: "Familie Moment",
        schoentje_tekening: "Schoentje Tekening",
        sinterklaas_illustratie: "Sinterklaas Illustratie",
        cadeautips: "Cadeautips",
        surprise_ideeen: "Surprise Ideeën",
        bulk_gedichten: "Bulk Gedichten",
        sinterklaas_traditie: "Sinterklaas Traditie",
      },
      toolDescriptions: {
        copywriting: "Generate professional marketing copy with multiple variants and A/B testing",
        summarizer: "Advanced text summarization with key points extraction and study questions",
        rewriter: "Rewrite and paraphrase content with tone and complexity control",
        "seo-optimizer": "Comprehensive SEO content optimization with keyword analysis",
        "linkedin-content": "Create engaging LinkedIn posts, articles, and profile content",
        translation: "Translate text between 100+ languages with context awareness",
        transcription: "Transcribe audio/video with speaker diarization and content enhancement",
        ocr: "Extract text from images with high accuracy",
        "image-generation": "Create AI-generated images from text descriptions",
        "background-removal": "Remove backgrounds from images with advanced edge refinement",
        wardrobe: "Try on clothes virtually with AI - supports accessories, clothing, and footwear",
        sinterklaas_gedicht: "Generate personalized Sinterklaas poems in traditional Dutch style",
        sinterklaas_brief: "Create personalized letters from Sinterklaas to children",
        lootjestrekken: "Organize Secret Santa/Sinterklaas gift exchanges",
        familie_moment: "Generate family Sinterklaas celebration illustrations",
        schoentje_tekening: "Visualize filled Dutch wooden clogs with Sinterklaas treats",
        sinterklaas_illustratie: "Create Sinterklaas character illustrations",
        cadeautips: "Get personalized Sinterklaas gift recommendations",
        surprise_ideeen: "Generate creative packaging ideas for Sinterklaas gifts",
        bulk_gedichten: "Generate multiple Sinterklaas poems at once (for families/classes)",
        sinterklaas_traditie: "Educational content about Sinterklaas traditions",
      },
    },
    sidebar: {
      home: "Dashboard",
      allTools: "All Tools",
      aiChat: "AI Chat",
      sinterklaasTools: "🎅 Sinterklaas Tools",
      gedichtenGenerator: "Gedichten Generator",
      cadeautips: "Cadeautips",
      surpriseIdeeen: "Surprise Ideeën",
      copywriterStudio: "Copywriter Studio",
      summarizer: "Summarizer",
      rewriter: "Rewriter",
      seoOptimizer: "SEO Optimizer",
      linkedInContent: "LinkedIn Content",
      translation: "Translation",
      transcription: "Transcription",
      ocr: "OCR",
      imageGeneration: "Image Generation",
      backgroundRemover: "Background Remover",
      digitalWardrobe: "Digital Wardrobe",
      billing: "Billing",
      usageStats: "Usage Stats",
      documentation: "Documentation",
      support: "Support",
      adminSettings: "Admin Settings",
    },
    header: {
      credits: "credits",
      profile: "Profile",
      new: "New",
      toggleMenu: "Toggle menu",
    },
    settings: {
      title: "Settings",
      description: "Manage your account and preferences",
      language: "Language",
      languageDescription: "Choose your preferred language",
      profile: "Profile Settings",
      account: "Account Settings",
      notifications: "Notifications",
      preferences: "Preferences",
    },
    billing: {
      title: "Billing",
      currentPlan: "Current Plan",
      upgrade: "Upgrade",
      manage: "Manage",
    },
    usage: {
      title: "Usage",
      usage: "Usage",
    },
    aiTools: {
      gedichten: {
        title: "Sinterklaas Poem Generator",
        description: "Create personalized Sinterklaas poems with AI - perfect for December 5th!",
        inputFields: {
          name: "Name",
          namePlaceholder: "e.g. Emma or Dad",
          age: "Age",
          agePlaceholder: "e.g. 8",
          likes: "Hobbies & Interests",
          likesPlaceholder: "e.g. football, reading, drawing",
          gift: "Gift (optional)",
          giftPlaceholder: "e.g. new soccer shoes",
          notes: "Personal Notes (optional)",
          notesPlaceholder: "Special qualities, funny things, moments this year...",
        },
        tone: "Select Tone",
        tones: {
          traditioneel: "Traditional",
          modern: "Modern",
          grappig: "Funny",
          hartverwarmend: "Heartwarming",
        },
        actions: {
          generate: "Generate Poem",
          generating: "Generating...",
          download: "Download",
          copy: "Copy",
          copied: "Copied to clipboard!",
        },
        cost: "Cost: 10 credits per poem",
        enterName: "Enter a name",
        notLoggedIn: "You are not logged in",
        yourGedicht: "Your Poem",
        creditsUsed: "credits used",
        noResults: "Fill in the details and click Generate to create your personalized Sinterklaas poem",
        historyTitle: "Recent Poems",
        historyDescription: "Your recently generated Sinterklaas poems",
      },
      voicemail: {
        title: "Sinterklaas Voicemail",
        description: "Generate personalized voice messages from Sinterklaas to children",
        inputFields: {
          childName: "Child's Name",
          childNamePlaceholder: "e.g. Emma",
          age: "Age",
          agePlaceholder: "e.g. 8",
          achievements: "Achievements (optional)",
          achievementsPlaceholder: "What did they do well this year?",
          behaviorNotes: "Behavior Notes (optional)",
          behaviorNotesPlaceholder: "How has their behavior been?",
        },
        tone: "Tone",
        tones: {
          traditioneel: "Traditional",
          liefdevol: "Loving",
          grappig: "Funny",
          bemoedigend: "Encouraging",
        },
        options: {
          rhyming: "Make it rhyme",
          explicit: "Include humoristic swearing (adults only)",
        },
        actions: {
          generate: "Generate Voicemail",
          generating: "Generating your voicemail...",
          downloading: "Downloading",
          listening: "Listening to voicemail",
        },
        cost: "Cost: 25 credits per voicemail",
        enterChildName: "Enter a child's name",
        notLoggedIn: "You are not logged in",
        yourVoicemail: "Your Voicemail",
        creditsUsed: "credits used",
      },
    },
  },
  nl: {
    common: {
      dashboard: "Dashboard",
      tools: "Tools",
      settings: "Instellingen",
      profile: "Profiel",
      logout: "Uitloggen",
      credits: "Credits",
      save: "Opslaan",
      cancel: "Annuleren",
      delete: "Verwijderen",
      edit: "Bewerken",
      close: "Sluiten",
      loading: "Laden...",
      error: "Fout",
      success: "Succes",
      search: "Zoeken",
      filter: "Filter",
      all: "Alles",
      none: "Geen",
      yes: "Ja",
      no: "Nee",
      toggle: "Wisselen",
      notifications: "Meldingen",
      account: "Account",
      signOut: "Uitloggen",
      back: "Terug",
      next: "Volgende",
      submit: "Verzenden",
      viewAll: "Bekijk alles",
    },
    auth: {
      login: "Inloggen",
      signup: "Registreren",
      email: "E-mail",
      password: "Wachtwoord",
      rememberMe: "Onthoud mij",
      forgotPassword: "Wachtwoord vergeten?",
      dontHaveAccount: "Geen account?",
      alreadyHaveAccount: "Heeft u al een account?",
      createAccount: "Maak een account",
      name: "Naam",
      confirmPassword: "Bevestig wachtwoord",
      loggingIn: "Inloggen...",
      signingUp: "Registreren...",
      invalidEmailPassword: "Ongeldige e-mail of wachtwoord",
      userExists: "Gebruiker met deze e-mail bestaat al",
      passwordTooShort: "Wachtwoord moet minimaal 8 tekens lang zijn",
      passwordsDontMatch: "Wachtwoorden komen niet overeen",
      loginError: "Fout bij inloggen",
      signupError: "Fout bij registreren",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welkom terug",
      welcomeBack: "Welkom terug",
      stats: "Jouw statistieken",
      recentActivity: "Recente activiteit",
      quickAccess: "Snelle toegang",
      noActivity: "Nog geen activiteit",
      creditsRemaining: "Credits resterend",
      last30Days: "Laatste 30 dagen",
      totalJobs: "Totaal aantal taken",
      successRate: "Succespercentage",
      credits: "Credits",
      yourStats: "Jouw statistieken",
      overview: "Overzicht",
      activity: "Activiteit",
    },
    tools: {
      title: "AI Tools",
      description: "Professionele AI-tools met geavanceerde parameters",
      allTools: "Alle AI Tools",
      toolAvailable: "AI Tools beschikbaar",
      enabledTools: "Ingeschakelde tools",
      viewAllTools: "Bekijk alle tools",
      categories: {
        all: "Alles",
        contentCreation: "Content Creatie",
        textProcessing: "Tekst Verwerking",
        marketing: "Marketing",
        socialMedia: "Sociale Media",
        language: "Taal",
        documentProcessing: "Document Verwerking",
        creative: "Creatief",
        fashion: "Mode",
        imageEditing: "Afbeelding Bewerken",
        audioProcessing: "Audio Verwerking",
      },
      toolNames: {
        copywriting: "AI Copywriter Studio",
        summarizer: "Tekst Samenvatter",
        rewriter: "Content Herformuleerder",
        "seo-optimizer": "SEO Optimalisatie",
        "linkedin-content": "LinkedIn Content Engine",
        translation: "Vertaling",
        transcription: "Transcriptie Suite",
        ocr: "OCR Tekst Extractie",
        "image-generation": "Afbeelding Generatie",
        "background-removal": "Achtergrond Verwijderaar",
        wardrobe: "Virtuele Garderobe",
        sinterklaas_gedicht: "Gedichten Generator",
        sinterklaas_brief: "Brief van Sinterklaas",
        lootjestrekken: "Lootjestrekken",
        familie_moment: "Familie Moment",
        schoentje_tekening: "Schoentje Tekening",
        sinterklaas_illustratie: "Sinterklaas Illustratie",
        cadeautips: "Cadeautips",
        surprise_ideeen: "Surprise Ideeën",
        bulk_gedichten: "Bulk Gedichten",
        sinterklaas_traditie: "Sinterklaas Traditie",
      },
      toolDescriptions: {
        copywriting: "Genereer professionele marketingtekst met meerdere varianten en A/B-testen",
        summarizer: "Geavanceerde tekstsamenvatting met hoofdpunten en studie vragen",
        rewriter: "Herschrijf en parafraseer content met toon- en complexiteitscontrole",
        "seo-optimizer": "Uitgebreide SEO-content-optimalisatie met zoekwoordanalyse",
        "linkedin-content": "Creëer boeiende LinkedIn-berichten, artikelen en profielcontent",
        translation: "Vertaal tekst tussen 100+ talen met contextbewustzijn",
        transcription: "Transcribeer audio/video met sprekeronderzoek en contentversterking",
        ocr: "Extraheer tekst uit afbeeldingen met hoge nauwkeurigheid",
        "image-generation": "Creëer AI-gegenereerde afbeeldingen vanuit tekstbeschrijvingen",
        "background-removal": "Verwijder achtergronden uit afbeeldingen met geavanceerde randverfijning",
        wardrobe: "Probeer kleding virtueel aan met AI - ondersteunt accessoires, kleding en schoeisel",
        sinterklaas_gedicht: "Genereer gepersonaliseerde Sinterklaas gedichten in traditionele Nederlandse stijl",
        sinterklaas_brief: "Creëer gepersonaliseerde brieven van Sinterklaas aan kinderen",
        lootjestrekken: "Organiseer lootjes trekken voor Sinterklaas",
        familie_moment: "Genereer familie Sinterklaas viering illustraties",
        schoentje_tekening: "Visualiseer gevulde Nederlandse klompen met Sinterklaas lekkernijen",
        sinterklaas_illustratie: "Creëer Sinterklaas karakter illustraties",
        cadeautips: "Krijg gepersonaliseerde Sinterklaas cadeautips",
        surprise_ideeen: "Genereer creatieve verpakkingsideeën voor Sinterklaas cadeaus",
        bulk_gedichten: "Genereer meerdere Sinterklaas gedichten tegelijk (voor families/klassen)",
        sinterklaas_traditie: "Educatieve content over Sinterklaas tradities",
      },
    },
    sidebar: {
      home: "Dashboard",
      allTools: "Alle Tools",
      aiChat: "AI Chat",
      sinterklaasTools: "🎅 Sinterklaas Tools",
      gedichtenGenerator: "Gedichten Generator",
      cadeautips: "Cadeautips",
      surpriseIdeeen: "Surprise Ideeën",
      copywriterStudio: "Copywriter Studio",
      summarizer: "Samenvatter",
      rewriter: "Herformuleerder",
      seoOptimizer: "SEO Optimalisatie",
      linkedInContent: "LinkedIn Content",
      translation: "Vertaling",
      transcription: "Transcriptie",
      ocr: "OCR",
      imageGeneration: "Afbeelding Generatie",
      backgroundRemover: "Achtergrond Verwijderaar",
      digitalWardrobe: "Virtuele Garderobe",
      billing: "Facturering",
      usageStats: "Gebruiksstatistieken",
      documentation: "Documentatie",
      support: "Ondersteuning",
      adminSettings: "Admin Instellingen",
    },
    header: {
      credits: "credits",
      profile: "Profiel",
      new: "Nieuw",
      toggleMenu: "Menu wisselen",
    },
    settings: {
      title: "Instellingen",
      description: "Beheer uw account en voorkeuren",
      language: "Taal",
      languageDescription: "Kies uw voorkeurstaal",
      profile: "Profielinstellingen",
      account: "Account instellingen",
      notifications: "Meldingen",
      preferences: "Voorkeuren",
    },
    billing: {
      title: "Facturering",
      currentPlan: "Huidig plan",
      upgrade: "Upgraden",
      manage: "Beheren",
    },
    usage: {
      title: "Gebruik",
      usage: "Gebruik",
    },
    aiTools: {
      gedichten: {
        title: "Sinterklaas Gedichten Generator",
        description: "Creëer persoonlijke Sinterklaas gedichten met AI - perfect voor pakjesavond!",
        inputFields: {
          name: "Naam",
          namePlaceholder: "bijv. Emma of Papa",
          age: "Leeftijd",
          agePlaceholder: "bijv. 8",
          likes: "Hobby's & Interesses",
          likesPlaceholder: "bijv. voetbal, lezen, tekeningen maken",
          gift: "Cadeau (optioneel)",
          giftPlaceholder: "bijv. nieuwe voetbalschoenen",
          notes: "Persoonlijke Notities (optioneel)",
          notesPlaceholder: "Speciale eigenschappen, grappige dingen, momenten dit jaar...",
        },
        tone: "Selecteer Toon",
        tones: {
          traditioneel: "Traditioneel",
          modern: "Modern",
          grappig: "Grappig",
          hartverwarmend: "Hartverwarmend",
        },
        actions: {
          generate: "Genereer Gedicht",
          generating: "Genereren...",
          download: "Download",
          copy: "Kopieer",
          copied: "Gekopieerd naar klembord!",
        },
        cost: "Kosten: 10 credits per gedicht",
        enterName: "Vul een naam in",
        notLoggedIn: "Je bent niet ingelogd",
        yourGedicht: "Jouw Gedicht",
        creditsUsed: "credits gebruikt",
        noResults: "Vul de gegevens in en klik op Genereren om je persoonlijke Sinterklaas gedicht te maken",
        historyTitle: "Recent Gedichten",
        historyDescription: "Je recent gegenereerde Sinterklaas gedichten",
      },
      voicemail: {
        title: "Sinterklaas Voicemail",
        description: "Genereer gepersonaliseerde voicemail berichten van Sinterklaas aan kinderen",
        inputFields: {
          childName: "Naam Kind",
          childNamePlaceholder: "bijv. Emma",
          age: "Leeftijd",
          agePlaceholder: "bijv. 8",
          achievements: "Prestaties (optioneel)",
          achievementsPlaceholder: "Wat hebben ze goed gedaan dit jaar?",
          behaviorNotes: "Gedrag Notities (optioneel)",
          behaviorNotesPlaceholder: "Hoe is hun gedrag geweest?",
        },
        tone: "Toon",
        tones: {
          traditioneel: "Traditioneel",
          liefdevol: "Liefdevol",
          grappig: "Grappig",
          bemoedigend: "Bemoedigend",
        },
        options: {
          rhyming: "Laat het rijmen",
          explicit: "Voeg grappig grove taal toe (alleen voor volwassenen)",
        },
        actions: {
          generate: "Genereer Voicemail",
          generating: "Genereren van je voicemail...",
          downloading: "Downloaden",
          listening: "Luisteren naar voicemail",
        },
        cost: "Kosten: 25 credits per voicemail",
        enterChildName: "Vul een naam in",
        notLoggedIn: "Je bent niet ingelogd",
        yourVoicemail: "Jouw Voicemail",
        creditsUsed: "credits gebruikt",
      },
    },
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function t(key: string, lang: Language): string {
  const parts = key.split(".");
  let value: any = translations[lang];

  for (const part of parts) {
    value = value?.[part];
  }

  return value || key;
}
