# 🎅 Sinterklaas AI Tools - Implementation Guide

## Quick Reference: Top 10 New Tools to Implement

---

## 🎯 Tier 1 Tools (Implement First)

### 1. Gift Tags Generator
**Location**: `convex/tools/cadeauTags.ts`

```typescript
export const generateGiftTag = action({
  args: {
    token: v.string(),
    recipient_name: v.string(),
    gift_description: v.string(),
    style: v.optional(v.union(
      v.literal("traditioneel"),
      v.literal("modern"),
      v.literal("grappig"),
      v.literal("elegant")
    )),
    short_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implementation similar to existing tools
    // Returns structured gift tag text
    // Credits: 5
  },
});
```

**Frontend**: `src/app/(dashboard)/tools/cadeau-tags/page.tsx`

---

### 2. Sinterklaas Brief
**Location**: `convex/tools/sinterklaasBrief.ts`

```typescript
export const generateSinterklaasLetter = action({
  args: {
    token: v.string(),
    child_name: v.string(),
    age: v.number(),
    achievements: v.optional(v.string()),
    behavior_notes: v.optional(v.string()),
    tone: v.optional(v.union(
      v.literal("stimulerend"),
      v.literal("liefdevol"),
      v.literal("grappig"),
      v.literal("educatief")
    )),
  },
  handler: async (ctx, args) => {
    // Returns personalized letter from Sinterklaas
    // Credits: 10
  },
});
```

**Frontend**: `src/app/(dashboard)/tools/sinterklaas-brief/page.tsx`

---

### 3. Sinterklaas Illustratie Generator
**Location**: `convex/tools/sinterklaasIllustratie.ts`

```typescript
export const generateSinterklaasImage = action({
  args: {
    token: v.string(),
    style: v.optional(v.union(
      v.literal("realistisch"),
      v.literal("cartoon"),
      v.literal("traditioneel"),
      v.literal("modern")
    )),
    pose: v.optional(v.string()),
    background: v.optional(v.string()),
    additional_elements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Uses existing image generation infrastructure
    const prompt = `Generate an image of Sinterklaas (Saint Nicholas) in ${args.style} style, ${args.pose || 'standing with staff'}, with ${args.background || 'festive Dutch background'}, ${args.additional_elements || ''}`;
    
    // Call existing image generation
    // Credits: 15
  },
});
```

**Frontend**: `src/app/(dashboard)/tools/sinterklaas-illustratie/page.tsx`

---

### 4. Schoentje Tekening
**Location**: `convex/tools/schoentjeTekening.ts`

```typescript
export const generateSchoenImage = action({
  args: {
    token: v.string(),
    treats: v.string(), // "chocolademunten, pepernoten, kleine speeltjes"
    decorative_style: v.optional(v.string()),
    background: v.optional(v.string()),
    additional_elements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate a detailed image of a traditional Dutch wooden clog (schoentje) filled with Sinterklaas treats: ${args.treats}. Style: ${args.decorative_style || 'warm and festive'}, background: ${args.background || 'cozy Dutch setting'}, ${args.additional_elements || ''}`;
    
    // Call image generation
    // Credits: 15
  },
});
```

---

### 5. Pakjes Avond Scene
**Location**: `convex/tools/pakjesAvondScene.ts`

```typescript
export const generatePakjesAvondImage = action({
  args: {
    token: v.string(),
    number_of_people: v.number(),
    setting: v.optional(v.union(
      v.literal("woonkamer"),
      v.literal("keuken"),
      v.literal("kinderkamer"),
      v.literal("traditioneel")
    )),
    activities: v.optional(v.string()),
    time_of_day: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate a festive Sinterklaas evening (Pakjesavond) scene with ${args.number_of_people} people in a ${args.setting || 'cozy Dutch living room'} setting. Activities: ${args.activities || 'opening gifts, enjoying treats'}, time: ${args.time_of_day || 'evening'}, warm lighting, traditional Dutch elements`;
    
    // Call image generation
    // Credits: 20
  },
});
```

---

### 6. Prijsvraag Generator (Treasure Hunt)
**Location**: `convex/tools/prijsvraagGenerator.ts`

```typescript
export const generateTreasureHunt = action({
  args: {
    token: v.string(),
    number_of_clues: v.number(),
    difficulty: v.union(v.literal("makkelijk"), v.literal("gemiddeld"), v.literal("uitdagend")),
    locations: v.array(v.string()),
    final_gift_location: v.string(),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate rhyming clues in Dutch for treasure hunt
    // Credits: 18
  },
});
```

---

## 🎨 Example Implementation: Complete Surprise Generator

**Location**: `convex/tools/completeSurprise.ts`

```typescript
export const generateCompleteSurprise = action({
  args: {
    token: v.string(),
    recipient_name: v.string(),
    age: v.number(),
    interests: v.string(),
    budget: v.optional(v.string()),
    preferred_style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This is the ultimate tool - combines everything:
    // 1. Generate gift suggestions
    // 2. Design surprise packaging
    // 3. Create visual mockup
    // 4. Write personalized poem
    // 5. Generate gift tags
    
    // Returns complete package with all elements
    // Credits: 40-50
    
    // Calls multiple existing tools internally
    const giftSuggestions = await generateCadeautips(/* ... */);
    const surpriseIdeas = await generateSurpriseIdeeen(/* ... */);
    const poem = await generateGedicht(/* ... */);
    const image = await generateImage(/* ... */);
    
    return {
      gift_suggestions: giftSuggestions,
      surprise_ideas: surpriseIdeas,
      poem: poem,
      gift_tag: generateGiftTag(/* ... */),
      visualization: image,
    };
  },
});
```

---

## 📊 Frontend Component Template

**Example**: `src/app/(dashboard)/tools/sinterklaas-brief/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthToken } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SinterklaasBriefPage() {
  const token = useAuthToken();
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [achievements, setAchievements] = useState("");
  
  const generateLetter = useMutation(api.tools.sinterklaasBrief.generateSinterklaasLetter);
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateLetter({
        token,
        child_name: childName,
        age: parseInt(age),
        achievements,
      });
      setResult(data.letter);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎅 Sinterklaas Brief Generator</h1>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <Input
            label="Kind Naam"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
          <Input
            label="Leeftijd"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <Input
            label="Prestaties (optioneel)"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
          />
          
          <Button
            onClick={handleGenerate}
            disabled={loading || !childName || !age}
            className="bg-gradient-to-r from-red-600 to-red-700"
          >
            {loading ? "Genereren..." : "Generate Brief"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Brief van Sinterklaas</h2>
          <div className="whitespace-pre-wrap">{result}</div>
        </Card>
      )}
    </div>
  );
}
```

---

## 🎨 Image Generation Integration Example

**For all image tools, use this pattern:**

```typescript
import { api } from "../_generated/api";

export const generateSinterklaasImage = action({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Create prompt
    const prompt = `Sinterklaas (Dutch Santa Claus) in ${args.style} style, ${args.pose}, ${args.background}`;
    
    // Call existing image generation tool
    const result = await ctx.runAction(api.tools.imageGeneration.generateImageTool, {
      token: args.token,
      prompt: prompt,
      size: "1024x1024",
    });
    
    return {
      imageUrl: result.imageUrl,
      creditsUsed: 15, // Image credits are lower than text credits
      jobId: result.jobId,
    };
  },
});
```

---

## 📁 File Structure

```
convex/tools/
├── sinterklaasGedichten.ts ✅ (existing)
├── cadeautips.ts ✅ (existing)
├── surpriseIdeeen.ts ✅ (existing)
├── sinterklaasTraditie.ts ✅ (existing)
├── cadeauTags.ts 🆕
├── sinterklaasBrief.ts 🆕
├── sinterklaasIllustratie.ts 🆕
├── schoentjeTekening.ts 🆕
├── pakjesAvondScene.ts 🆕
├── prijsvraagGenerator.ts 🆕
├── liedjesTeksten.ts 🆕
├── knutselIdeeen.ts 🆕
└── completeSurprise.ts 🆕

src/app/(dashboard)/tools/
├── gedichten/ (existing)
├── cadeautips/ (existing)
├── surprises/ (existing)
├── cadeau-tags/ 🆕
├── sinterklaas-brief/ 🆕
├── sinterklaas-illustratie/ 🆕
├── schoentje-tekening/ 🆕
├── pakjes-avond-scene/ 🆕
├── prijsvraag/ 🆕
└── ... (more tool pages)
```

---

## 🚀 Development Steps

### Step 1: Implement Tier 1 Text Tools (Week 1-2)
- [ ] Gift Tags Generator
- [ ] Sinterklaas Brief
- [ ] Prizevraag Generator

### Step 2: Implement Tier 1 Image Tools (Week 3-4)
- [ ] Sinterklaas Illustratie
- [ ] Schoentje Tekening
- [ ] Pakjes Avond Scene

### Step 3: Polish & Test (Week 5)
- [ ] Test all tools
- [ ] Fix bugs
- [ ] Update documentation

### Step 4: Deploy (Week 6)
- [ ] Production deployment
- [ ] Marketing materials
- [ ] User feedback collection

---

## 💡 Pro Tips

1. **Reuse Existing Infrastructure**: All image tools can use the existing `imageGeneration.ts` tool
2. **Shared Components**: Create reusable frontend components for common patterns
3. **Bulk Operations**: Consider implementing batch processing for multiple items
4. **History Integration**: All tools should integrate with history tracking
5. **Error Handling**: Use try-catch with proper error messages
6. **Loading States**: Always show loading indicators
7. **Dutch Language**: Ensure all UI text is in Dutch
8. **Festive Styling**: Use red gradient theme throughout

---

## ✅ Quick Start Checklist

For each new tool:

- [ ] Create backend action file in `convex/tools/`
- [ ] Add authentication check
- [ ] Add credit check and deduction
- [ ] Add job creation and tracking
- [ ] Add error handling
- [ ] Create frontend page in `src/app/(dashboard)/tools/`
- [ ] Add to sidebar navigation
- [ ] Test with real credits
- [ ] Test history tracking
- [ ] Test error scenarios
- [ ] Polish UI/UX

---

## 🎯 Success Metrics

Track these metrics for each tool:
- Number of generations
- Credits used per tool
- Average user satisfaction
- Most popular features
- Error rates

---

## 📚 Additional Resources

- See existing tools for implementation patterns
- Use `callOpenRouter` for AI calls
- Reference `imageGeneration.ts` for image tools
- Check `sinterklaasGedichten.ts` for text tools
- Review UI components in existing tool pages

---

**Ready to build the ultimate Sinterklaas AI platform! 🎅✨**

