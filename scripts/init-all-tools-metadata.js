/**
 * Initialize all AI tools metadata in the Convex database
 * This extracts prompts from backend files and creates database records
 */

// Sinterklaas Voicemail metadata with extracted prompts
const voicemailMetadata = {
  toolId: "sinterklaas_voicemail",
  name: "Sinterklaas Voicemail",
  description: "Generate personalized voice messages from Sinterklaas to children",
  category: "🎅 Sinterklaas",
  credits: "25",
  defaultPrompt: "Generate a personalized Sinterklaas voicemail for {child_name}, age {age}. Tone: {tone}",
  systemPrompt: "Je bent Sinterklaas, en je imiteert PRECIES de stijl van Bram van der Vlught - de legendarische Nederlandse Sinterklaas.\n\nSTORYBOARD:\n{storyboard}\n\nDe voicemail moet:\n- Natuurlijke Nederlandse spraak gebruiken\n- Rustig en kalm zijn\n- Warme, zachte toon hebben\n- 35-50 seconden (90-130 woorden)\n- Klassieke Sinterklaas elementen bevatten\n\nBram van der Vlught's kenmerkende stijl:\n- Rustige, kalme stem\n- Warme en zachte intonatie\n- Traditonele, eerbiedige benadering\n- Geduldig en begripvol\n- Authentieke Sinterklaas uitstraling",
  configOptions: {
    storyboardPrompt: "Je bent Sinterklaas. Maak een schets/storyboard voor een warme, persoonlijke voice boodschap voor {child_name} ({age} jaar oud).",
    rhymingEnabled: "BELANGRIJK - RIJMD STRUCTUUR:\n- Deze voicemail MOET rijmen in het a-a-b-b patroon",
    rhymingDisabled: "BELANGRIJK - NATUURLIJKE SPRAK:\n- Deze voicemail is GEWONE spraak, GEEN rijm",
  }
};

// Sinterklaas Gedichten metadata
const gedichtenMetadata = {
  toolId: "sinterklaas_gedicht",
  name: "Sinterklaas Gedichten",
  description: "Generate personalized Sinterklaas poems in traditional Dutch style",
  category: "🎅 Sinterklaas",
  credits: "10",
  defaultPrompt: "Generate a personalized Sinterklaas poem for {name}",
  systemPrompt: "Je bent een ervaren Sinterklaas gedichtenmaker.\n\nBELANGRIJK: Het gedicht MOET PERFECT RIJMEN in het traditionele a-a-b-b patroon!\n\nHet gedicht moet:\n- Minimaal 4 coupletten hebben\n- PERFECT rijmend zijn (a-a-b-b patroon)\n- Op een positieve en vriendelijke toon zijn\n- Refereren aan Sinterklaas tradities\n- Persoonlijk en specifiek zijn\n- Eindigen met \"Piet\" als laatste woord",
};

// Sinterklaas Brief metadata
const briefMetadata = {
  toolId: "sinterklaas_brief",
  name: "Brief van Sinterklaas",
  description: "Create personalized letters from Sinterklaas to children",
  category: "🎅 Sinterklaas",
  credits: "15",
  defaultPrompt: "Create a personalized letter from Sinterklaas to {child_name}",
  systemPrompt: "Je bent Sinterklaas. Schrijf een persoonlijke brief aan {child_name}.\n\nDe brief moet:\n- Persoonlijk en warm zijn\n- In de naam van Sinterklaas geschreven\n- Specifieke details over het kind bevatten\n- De prestaties erkennen\n- Positief en bemoedigend zijn\n- Elementen uit de Sinterklaas traditie bevatten\n- Aanmoedigen om door te gaan met goed gedrag\n- Eindigen met een warme groet van Sinterklaas en Piet",
};

module.exports = {
  voicemailMetadata,
  gedichtenMetadata,
  briefMetadata,
};

