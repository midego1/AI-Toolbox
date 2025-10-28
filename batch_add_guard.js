const fs = require('fs');
const path = require('path');

const TOOL_MAP = {
  'background-removal': 'background-removal',
  'cadeautips': 'cadeautips',
  'chat': 'chat',
  'copywriting': 'copywriting',
  'familie-moment': 'familie_moment',
  'headshot': 'headshot',
  'linkedin-content': 'linkedin-content',
  'linkedin': 'linkedin-content',
  'lootjestrekken': 'lootjestrekken',
  'ocr': 'ocr',
  'rewriter': 'rewriter',
  'schoentje-tekening': 'schoentje_tekening',
  'seo-optimizer': 'seo-optimizer',
  'sinterklaas-brief': 'sinterklaas_brief',
  'sinterklaas-voicemail': 'sinterklaas_voicemail',
  'surprises': 'surprise_ideeen',
  'transcription': 'transcription',
  'wardrobe': 'wardrobe',
};

Object.entries(TOOL_MAP).forEach(([slug, toolId]) => {
  const file = `src/app/(dashboard)/tools/${slug}/page.tsx`;
  
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if already has it
  if (content.includes('ToolAccessGuard')) {
    console.log(`✓ ${file} already has ToolAccessGuard`);
    return;
  }
  
  // Add import
  if (!content.includes('import { ToolAccessGuard }')) {
    content = content.replace(
      /import\s+\{[^}]+\}\s+from\s+["']@\/components\/shared\/[^"']+["'];?/,
      `$&\nimport { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";`
    );
  }
  
  // Wrap the return statement
  content = content.replace(
    /(\s+return \([\s\n]*)<div className="container mx-auto p-6 max-w-6xl">/,
    `$1<ToolAccessGuard toolId="${toolId}">\n$1  <div className="container mx-auto p-6 max-w-6xl">`
  );
  
  // Add closing tag
  content = content.replace(
    /(\s+)(<\/div>\s+<\/div>);$/m,
    `$1  </ToolAccessGuard>\n$1);`
  );
  
  fs.writeFileSync(file, content);
  console.log(`✓ Added to ${file}`);
});

console.log('Done!');

