const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to update - all using getAuthToken() need useAuthToken()
const filesToUpdate = glob.sync('src/**/*.{tsx,ts}', { absolute: true });

filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace import
  if (content.includes('import { getAuthToken } from "@/lib/auth-client";')) {
    content = content.replace(
      'import { getAuthToken } from "@/lib/auth-client";',
      'import { useAuthToken } from "@/hooks/useAuthToken";'
    );
    modified = true;
  }

  // Replace usage in components
  // Note: This is a simplified replacement - manual verification needed
  if (content.includes('getAuthToken()')) {
    modified = true;
  }

  if (modified) {
    console.log(`📝 Would update: ${filePath}`);
    // Uncomment to actually write:
    // fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('\n✅ Migration script ready');
console.log('Uncomment the writeFileSync line to apply changes');

