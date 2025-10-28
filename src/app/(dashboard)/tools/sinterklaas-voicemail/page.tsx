"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, Play, Pause, Volume2, Copy, Download, Loader2, Sparkles, Square, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

const TONES = [
  { value: "traditioneel", label: "Traditioneel", emoji: "🎅", description: "Klassieke Sinterklaas stijl" },
  { value: "liefdevol", label: "Liefdevol", emoji: "❤️", description: "Warme, hartelijke toon" },
  { value: "grappig", label: "Grappig", emoji: "😄", description: "Leuke, speelse toon" },
  { value: "bemoedigend", label: "Bemoedigend", emoji: "💪", description: "Positief en aanmoedigend" },
];

export default function SinterklaasVoicemailPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [achievements, setAchievements] = useState("");
  const [behaviorNotes, setBehaviorNotes] = useState("");
  const [tone, setTone] = useState<string>("liefdevol");
  const [rhyming, setRhyming] = useState(false);
  const [explicit, setExplicit] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Collapsible states
  const [showAchievements, setShowAchievements] = useState(false);
  const [showBehavior, setShowBehavior] = useState(false);

  const generateVoicemail = useAction((api as any).tools.sinterklaasVoicemail.generateSinterklaasVoicemail);

  const handleGenerate = async () => {
    if (!childName.trim() || !age) {
      alert("Vul naam en leeftijd in");
      return;
    }

    // Clean up any existing audio before generating new one
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudio(null);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateVoicemail({
        token,
        child_name: childName,
        age,
        achievements: achievements || undefined,
        behavior_notes: behaviorNotes || undefined,
        tone: tone as any,
        rhyming: rhyming,
        explicit: explicit,
      });

      console.log("🎤 Voicemail result:", result);
      console.log("🎤 Audio URL:", result.audioUrl);
      console.log("🎤 Audio URL type:", typeof result.audioUrl);
      console.log("🎤 Audio URL length:", result.audioUrl?.length);
      
      setResults(result);
      
      // Reset audio state for the new voicemail
      setAudio(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!results?.audioUrl) return;

    if (!audio) {
      const newAudio = new Audio(results.audioUrl);
      newAudio.preload = 'metadata';
      
      newAudio.addEventListener('loadedmetadata', () => {
        console.log('Audio loaded, duration:', newAudio.duration);
        setDuration(newAudio.duration);
      });
      
      newAudio.addEventListener('timeupdate', () => {
        setCurrentTime(newAudio.currentTime);
      });
      
      newAudio.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
        setCurrentTime(0);
        setAudio(null);
      });
      
      newAudio.addEventListener('play', () => {
        console.log('Audio playing');
        setIsPlaying(true);
      });
      
      newAudio.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });
      
      newAudio.volume = volume;
      setAudio(newAudio);
      newAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleStop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!results?.audioUrl) return;
    
    try {
      // Fetch the file as a blob
      const response = await fetch(results.audioUrl);
      const blob = await response.blob();
      
      // Create a blob URL and download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `sinterklaas-voicemail-${childName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download mislukt. Probeer het opnieuw.');
    }
  };

  const handleCopyScript = () => {
    if (!results?.script) return;
    navigator.clipboard.writeText(results.script);
    alert("Script gekopieerd!");
  };

  // Determine if we should show compact form
  const showCompactForm = results !== null;

  return (
    <ToolAccessGuard toolId="sinterklaas_voicemail">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Phone className="h-7 w-7 lg:h-8 lg:w-8 text-red-600" />
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Sinterklaas Voicemail{results && ` - ${childName}`}
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {results ? "✨ Voicemail klaar!" : "🎅 Een speciale audio boodschap"}
              </p>
            </div>
          </div>
          {results && (
            <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              ✅ {results.creditsUsed} credits
            </div>
          )}
        </div>
      </div>

      {/* Adaptive two-column layout */}
      <div className={`grid gap-4 lg:gap-6 ${showCompactForm ? 'lg:grid-cols-[30%_70%]' : 'lg:grid-cols-[45%_55%]'}`}>
        {/* Left Column: Form or Compact Summary */}
        <div className="space-y-4 lg:space-y-6">
          {showCompactForm ? (
            /* Compact Form Summary */
            <Card className="border-2 border-green-100 bg-green-50/30 lg:sticky lg:top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-green-600">✅</span> Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Kind:</span> {childName}, {age} jaar
                  </div>
                  <div>
                    <span className="font-semibold">Toon:</span> {TONES.find(t => t.value === tone)?.emoji} {TONES.find(t => t.value === tone)?.label}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rhyming && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">🎵 Rijmd</span>}
                    {explicit && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🎭 18+</span>}
                  </div>
                </div>
                <div className="pt-2 space-y-2 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => {
                      // Scroll to top, show form again
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setResults(null);
                    }}
                  >
                    ✏️ Bewerk
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-red-600 to-red-700"
                    onClick={() => {
                      setResults(null);
                      setChildName("");
                      setAge(undefined);
                      setAchievements("");
                      setBehaviorNotes("");
                      setTone("liefdevol");
                      setRhyming(false);
                      setExplicit(false);
                    }}
                  >
                    🆕 Nieuwe Voicemail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Full Form */
            <div className="space-y-4 lg:space-y-6">
          <Card className="border-2 border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-4 w-4 text-red-600" />
                Kind Gegevens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="childName">Naam van je kind *</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="bijv. Emma of Tom"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age">Leeftijd *</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={15}
                  value={age || ""}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="bijv. 8"
                  className="mt-1"
                />
              </div>

              <Collapsible open={showAchievements} onOpenChange={setShowAchievements}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">✨ Prestaties (optioneel)</Label>
                  {showAchievements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <textarea
                    id="achievements"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="Bijv. goed geholpen thuis, goed leren lezen"
                    className="w-full p-2 border rounded-md text-sm min-h-[50px]"
                  />
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={showBehavior} onOpenChange={setShowBehavior}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">💙 Gedrag (optioneel)</Label>
                  {showBehavior ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <textarea
                    id="behavior"
                    value={behaviorNotes}
                    onChange={(e) => setBehaviorNotes(e.target.value)}
                    placeholder="Positief gedrag om te noemen"
                    className="w-full p-2 border rounded-md text-sm min-h-[50px]"
                  />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stijl & Toon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Rhyming Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg border border-red-200">
                <Label htmlFor="rhyming" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-base">🎵</span>
                  <span className="font-medium text-sm">Rijmd Voicemail</span>
                </Label>
                <Switch
                  id="rhyming"
                  checked={rhyming}
                  onCheckedChange={setRhyming}
                />
              </div>

              {/* Explicit Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-red-300">
                <Label htmlFor="explicit" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-base">🎭</span>
                  <span className="font-bold text-red-700 text-sm">Explicit (18+)</span>
                </Label>
                <Switch
                  id="explicit"
                  checked={explicit}
                  onCheckedChange={setExplicit}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <Button
                    key={t.value}
                    size="sm"
                    variant={tone === t.value ? "default" : "outline"}
                    onClick={() => setTone(t.value)}
                    className="h-8 px-3 text-xs"
                  >
                    <span className="mr-1">{t.emoji}</span>
                    {t.label}
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !childName || !age} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Genereer Voicemail...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-5 w-5" />
                    🎤 Genereer Voicemail
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                💡 <strong>Kosten:</strong> 25 credits per voicemail
                <br />
                <span className="text-xs">Inclusief AI script en professionele text-to-speech</span>
              </div>

              {rhyming && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs font-semibold text-orange-800 mb-1 flex items-center gap-1">
                    🎵 Rijmd modus actief
                  </p>
                  <p className="text-xs text-orange-700">
                    Je voicemail wordt gemaakt als een rijmd gedicht - super speciaal en leuk voor kinderen!
                  </p>
                </div>
              )}

              {explicit && (
                <div className="bg-gradient-to-br from-red-100 to-orange-100 p-3 rounded-lg border-2 border-red-400">
                  <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                    🎭 EXPLICIT MODE ACTIEF - 18+
                  </p>
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ Deze voicemail bevat grof taalgebruik en scheldwoorden. Perfect voor humoristische situaties, maar NIET geschikt voor jonge kinderen!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          )}
        </div>

        {/* Right Column: Support Content or Results */}
        <div className="space-y-4">
          {showCompactForm ? (
            /* Results Content */
            <div className="space-y-4">
          {results && (
            <>
              <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-red-600" />
                      Voicemail van Sinterklaas
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Audio Player */}
                  <div className="bg-gradient-to-r from-red-100 to-red-50 p-6 rounded-lg border-2 border-red-200">
                    <div className="flex flex-col items-center gap-4">
                      {/* Play/Pause Controls */}
                      <div className="flex items-center justify-center gap-3">
                        {audio && (
                          <Button
                            onClick={handleStop}
                            variant="outline"
                            size="sm"
                            className="rounded-full border-2"
                            title="Stop"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={handlePlayPause}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 shadow-lg transition-all flex items-center justify-center p-0"
                          title={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? (
                            <Pause className="h-8 w-8 fill-white" />
                          ) : (
                            <Play className="h-8 w-8 ml-1 fill-white" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Progress Bar */}
                      {audio && (
                        <div className="w-full space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                            style={{
                              background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(currentTime / (duration || 100)) * 100}%, #fecaca ${(currentTime / (duration || 100)) * 100}%, #fecaca 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Volume Control */}
                      <div className="flex items-center gap-2 w-full">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="flex-1 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <span className="text-xs text-muted-foreground min-w-[3rem]">{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-4">
                      Beluister de persoonlijke boodschap van Sinterklaas voor {childName}
                    </div>
                  </div>

                  {/* Script Display */}
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold">📝 Script</Label>
                        {rhyming && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            🎵 Rijmd
                          </span>
                        )}
                        {explicit && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                            🎭 18+ Explicit
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyScript}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Kopieer
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {results.script}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDownload}
                      variant="outline" 
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download MP3
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Tips */}
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Speel de voicemail af op Sinterklaas avond voor extra magie!</p>
                  <p>• Bewaar de audio op je telefoon en speel af op 5 december</p>
                  <p>• Download de MP3 zodat je 'm altijd bij je hebt</p>
                  <p>• Deel het script met je partner voor gecoördineerde verrassing</p>
                </CardContent>
              </Card>
            </>
          )}
            </div>
          ) : (
            /* Support Content (Pro Tips & Recent) */
            <>
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    💡 Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Persoonlijk & authentiek voor je kind</p>
                  <p>• Download voor 5 december</p>
                  <p>• Rijmd = extra speciaal</p>
                  <p>• 45-60 seconden audio</p>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">✨ Creatieve Ideeën</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="font-semibold text-purple-800 mb-1">🎄 Op Sinterklaas avond:</p>
                    <p className="text-xs text-purple-700">
                      "Sinterklaas belde! Hij heeft een boodschap voor je achtergelaten!"
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-semibold text-green-800 mb-1">📱 Tip:</p>
                    <p className="text-xs text-green-700">
                      Download de MP3 en zet 'm als wake-up op 5 december!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <VoicemailHistory />
      </div>
    </div>
    </ToolAccessGuard>
  );
}

function VoicemailHistory() {
  const token = useAuthToken();
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "sinterklaas_voicemail", limit: 10, offset: 0 } : "skip"
  );

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioRefs, setAudioRefs] = useState<Map<string, HTMLAudioElement>>(new Map());

  const handlePlayPause = (jobId: string, audioUrl: string | null) => {
    if (!audioUrl) return;

    if (playingId === jobId) {
      // Pause current audio
      const audio = audioRefs.get(jobId);
      if (audio) {
        audio.pause();
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId) {
        const currentAudio = audioRefs.get(playingId);
        if (currentAudio) {
          currentAudio.pause();
        }
      }
      
      // Play new audio
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('ended', () => {
        setPlayingId(null);
      });
      
      audio.addEventListener('error', () => {
        console.error("Audio playback error");
        setPlayingId(null);
      });
      
      audioRefs.set(jobId, audio);
      setAudioRefs(new Map(audioRefs));
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setPlayingId(null);
      });
      
      setPlayingId(jobId);
    }
  };


  const handleDownload = async (audioUrl: string | null, childName: string) => {
    if (!audioUrl) return;
    
    try {
      // Fetch the file as a blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Create a blob URL and download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `sinterklaas-voicemail-${childName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download mislukt. Probeer het opnieuw.');
    }
  };

  if (!token || !history || history.items.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recente Voicemails</CardTitle>
            <CardDescription className="mt-1">Je recent gegenereerde voicemails van Sinterklaas</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Alles weergeven →
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.items.map((job: any) => {
            let childName = "Onbekend";
            let audioUrl: string | null = null;
            
            try {
              const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
              childName = input.child_name || input.name || "Onbekend";
              
              // Get audio URL from outputFileId or outputData
              const output = typeof job.outputData === 'string' ? JSON.parse(job.outputData) : job.outputData;
              if (output?.audioUrl) {
                audioUrl = output.audioUrl;
              }
            } catch {
              childName = "Voicemail";
            }

            const hasAudio = !!audioUrl;
            const isPlaying = playingId === job._id;

            return (
              <div 
                key={job._id} 
                className="border rounded-lg p-4 bg-white hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                    <Phone className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">🎵 {childName}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(job.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasAudio) {
                            handlePlayPause(job._id, audioUrl);
                          }
                        }}
                      >
                        {isPlaying && playingId === job._id ? '⏸️' : '▶️'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(audioUrl, childName);
                        }}
                      >
                        ⬇️
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

