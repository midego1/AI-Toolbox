import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { callOpenRouter, MODELS } from "../lib/openrouter";
import { verifySession } from "../auth";

/**
 * Generate a personalized voicemail from Sinterklaas
 * Uses AI to create the script and text-to-speech to convert to audio
 * 
 * This feature is designed to be really special:
 * - Personalized greetings with the child's name
 * - Mentions specific achievements or good behavior
 * - Authentic Sinterklaas voice with Dutch pronunciation
 * - Warm, encouraging tone
 * - Classic Sinterklaas phrases and traditions
 */
export const generateSinterklaasVoicemail = action({
  args: {
    token: v.string(),
    child_name: v.string(),
    age: v.number(),
    achievements: v.optional(v.string()),
    behavior_notes: v.optional(v.string()),
    tone: v.optional(v.union(
      v.literal("traditioneel"),
      v.literal("liefdevol"),
      v.literal("grappig"),
      v.literal("bemoedigend")
    )),
    rhyming: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log(`\n${"#".repeat(80)}`);
    console.log(`🎤 SINTERKLAAS VOICEMAIL GENERATION STARTING`);
    console.log(`${"#".repeat(80)}`);
    
    // Verify session and get user ID (works with both Clerk and legacy auth)
    const userId = await ctx.runMutation(api.auth.getUserIdFromToken, { token: args.token });
    
    // Get user details for logging
    const user = await ctx.runQuery(api.clerk.getUserProfileById, { userId });
    if (!user) {
      throw new Error("User not found");
    }
    
    console.log(`✅ User authenticated:`, user.email);

    const creditsNeeded = 25; // Higher cost due to TTS processing

    // Check credits
    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
      token: args.token,
    });

    if (creditBalance < creditsNeeded) {
      throw new Error("Insufficient credits");
    }

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "sinterklaas_voicemail",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      console.log(`📝 Step 1: Generating personalized script with storyboard...`);
      
      // Step 1: Generate a storyboard first, then the actual script
      const storyboardPrompt = `Je bent Sinterklaas, en je imiteert precies de stijl van Bram van der Vlught - de beroemde Nederlandse Sinterklaas.

Maak een schets/storyboard voor een warme, persoonlijke voice boodschap voor ${args.child_name} (${args.age} jaar oud).

Bram van der Vlught's stijl kenmerken:
- Rustige, kalme toon
- Warme en zachte stem
- Liefdevol en geduldig
- Traditonele, eerbiedige benadering
- Authentieke Sinterklaas intonatie

Maak een kort overzicht (3-4 punten) met:
1. Opening/groet (in Bram van der Vlught's kalme stijl)
2. Persoonlijk aspect/mentie (warm en toegewijd)
3. Sinterklaas element (traditioneel en respectvol)
4. Afsluiting (zachte, liefdevolle manier)

Toon: ${args.tone || "liefdevol"} (in Bram van der Vlught's stijl)
Rijmd: ${args.rhyming ? "JA" : "NEE"}
${args.achievements ? `Prestaties: ${args.achievements}` : ""}
${args.behavior_notes ? `Gedrag: ${args.behavior_notes}` : ""}`;

      const storyboard = await callOpenRouter(
        [{ role: "user", content: storyboardPrompt }],
        {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.8,
          maxTokens: 200,
        }
      );

      console.log(`📋 Storyboard generated`);
      
      // Step 2: Generate the actual script based on the storyboard
      // Tone-specific instructions
      let toneInstruction = "";
      switch (args.tone) {
        case "traditioneel":
          toneInstruction = "- Tonen: KLASSIEKE Sinterklaas traditie - formele maar warme groet, gebruik 'de Pieten', 'de stoomboot', respectvolle toon";
          break;
        case "liefdevol":
          toneInstruction = "- Tonen: EXTREEM LIEFDEVOL - veel warmte, genegenheid, 'mijn lieve schat', 'wat een kanjer', 'zo trots op je'";
          break;
        case "grappig":
          toneInstruction = "- Tonen: LEUK EN SPEELS - vrolijke ondertoon, subtiele humor, speelse elementen zoals 'de Pieten die lol maken', niet serieus";
          break;
        case "bemoedigend":
          toneInstruction = "- Tonen: POSITIEF EN AANMOEDIGEND - focus op groei, prestaties, trots, toekomst, 'je doet het zo goed', 'blijf zo gaan'";
          break;
        default:
          toneInstruction = "- Tonen: LIEFDEVOL - warme, persoonlijke benadering met veel genegenheid";
      }

      // Add rhyming instructions if requested
      const rhymingInstructions = args.rhyming ? `BELANGRIJK - RIJMD STRUCTUUR:
- Deze voicemail MOET rijmen in het a-a-b-b patroon (zoals een Sinterklaas gedicht)
- Voorbeeld: "Lieve [naam], wat heb je het goed gedaan / Ik ben zo trots op je sinds ik 't wist / Bij Piet wordt je vandaag gehuldigd, in stilte / Want van jou wordt er gezegd: die is goud, geen mist"
- Maak het RIJMD maar ook NATUURLIJK te spreken
- Niet te veel stijf - laat het vloeiend zijn
- Gebruik rijmd woorden die goed te spreken zijn in spraak
` : "BELANGRIJK - NATUURLIJKE SPRAK:\n- Deze voicemail is GEWONE spraak, GEEN rijm\n- Spreek natuurlijk en vloeiend\n- Alsof je echt aan de telefoon praat\n";

      const scriptPrompt = `Je bent Sinterklaas, en je imiteert PRECIES de stijl van Bram van der Vlught - de legendarische Nederlandse Sinterklaas.

Gebruik dit storyboard om een warme, persoonlijke voice boodschap te schrijven:

STORYBOARD:
${storyboard}

${rhymingInstructions}

Bram van der Vlught's kenmerkende stijl:
- Rustige, kalme stem - geen haast of druk
- Warme en zachte intonatie - als een lieve opa
- Traditonele, eerbiedige benadering - geen moderne slang
- Geduldig en begripvol - neem de tijd voor elk woord
- Authentieke Sinterklaas uitstraling - wijs en liefdevol

De voicemail moet:
- Natuurlijke Nederlandse spraak gebruiken (zoals Bram van der Vlught spreekt)
- Rustig en kalm zijn - geen gejaagdheid
- Warme, zachte toon hebben - liefdevol en toegewijd
- Passende lengte hebben: 35-50 seconden (90-130 woorden)
- Klassieke Sinterklaas elementen bevatten (schoorsteen, pakjes, de Pieten)
- Geen moderne taal - gebruik traditionele Nederlandse woorden
${toneInstruction}

BELANGRIJK: 
- Neem de tijd om dieper in te gaan op de persoonlijke details
- Imiteer Bram van der Vlught's rustige, warme toon
- Gebruik kalme zinnen zonder haast
- Wees authentiek Sinterklaas, niet modern
- Pas de toon aan volgens: ${args.tone || "liefdevol"}
${args.achievements ? `\n- NOEM SPECIFIEK deze prestaties: ${args.achievements}` : ""}
${args.behavior_notes ? `\n- VERRWIJS NAAR dit gedrag: ${args.behavior_notes}` : ""}

Schrijf de exacte tekst die gesproken wordt. Geen markdown, alleen gewone tekst.`;

      const script = await callOpenRouter(
        [{ role: "user", content: scriptPrompt }],
        {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.85, // Higher creativity for natural speech
          maxTokens: 800, // Increased for longer, more detailed poems
        }
      );

      const cleanScript = script
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/```/g, "")
        .trim();

      console.log(`✅ Script generated (${cleanScript.length} chars)`);
      console.log(`📋 Storyboard:`, storyboard);
      console.log(`📝 Script preview:`, cleanScript.substring(0, 100) + "...");

      console.log(`\n🎙️ Step 2: Converting to speech with ElevenLabs TTS...`);
      
      // Step 2: Generate and store audio using ElevenLabs
      const { audioFileId, audioUrl } = await generateAndStoreAudio(ctx, args.token, cleanScript);

      console.log(`✅ Audio generated and stored: ${audioFileId}`);

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Sinterklaas voicemail voor ${args.child_name}`,
      });

      // Update job as completed
      // Store full script since audio is in separate file storage
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          script: cleanScript, // Store complete script
          audioFileId: audioFileId,
          audioUrl: audioUrl, // Store the URL for history playback
          hasAudio: !!audioFileId,
          child_name: args.child_name,
        },
        outputFileId: audioFileId,
        creditsUsed: creditsNeeded,
      });

      console.log(`\n✅ Voicemail generation complete!`);

      return {
        script: cleanScript,
        audioUrl: audioUrl,
        audioFileId,
        creditsUsed: creditsNeeded,
        jobId,
      };
    } catch (error: any) {
      console.error(`❌ Voicemail generation failed:`, error);
      
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "failed",
        errorMessage: error.message,
      });

      throw error;
    }
  },
});

/**
 * Generate and store audio using ElevenLabs TTS
 * Better voice quality and emotional expression
 */
async function generateAndStoreAudio(
  ctx: any,
  token: string,
  text: string
): Promise<{ audioFileId: Id<"_storage"> | undefined; audioUrl: string }> {
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!elevenlabsApiKey) {
    throw new Error("ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.");
  }

  try {
    console.log(`🎙️ Generating speech with ElevenLabs TTS...`);
    console.log(`Text length: ${text.length} characters`);

    // Using custom voice for better quality
    const voiceId = "D0xrn5aezTI6FYp4w5Fz";
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenlabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // Best model for non-English languages including Dutch
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS error: ${error}`);
    }

    const audioArrayBuffer = await response.arrayBuffer();
    console.log(`✅ Audio generated (${audioArrayBuffer.byteLength} bytes)`);
    
    // Get upload URL from Convex
    const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {
      token,
    });
    
    // Upload directly to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "audio/mpeg" },
      body: audioArrayBuffer,
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
    }
    
    const { storageId } = await uploadResponse.json();
    const audioFileId = storageId as Id<"_storage">;
    console.log(`✅ Audio stored with ID: ${audioFileId}`);
    
    // Get permanent URL
    const audioUrl = await ctx.storage.getUrl(audioFileId);
    
    if (!audioUrl) {
      throw new Error("Failed to get audio URL after upload");
    }
    
    console.log(`✅ Got permanent URL: ${audioUrl.substring(0, 100)}...`);
    
    return { audioFileId, audioUrl };
  } catch (error: any) {
    console.error(`❌ Audio generation/store failed:`, error.message);
    throw error;
  }
}


