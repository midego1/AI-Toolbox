#!/bin/bash

# Script to add ToolAccessGuard to all tool pages

# Map of route slugs to tool IDs
declare -A TOOL_MAP=(
  ["background-removal"]="background-removal"
  ["cadeautips"]="cadeautips"
  ["chat"]="chat"
  ["copywriting"]="copywriting"
  ["familie-moment"]="familie_moment"
  ["gedichten"]="sinterklaas_gedicht"
  ["headshot"]="headshot"
  ["image-generation"]="image-generation"
  ["linkedin-content"]="linkedin-content"
  ["linkedin"]="linkedin-content"
  ["lootjestrekken"]="lootjestrekken"
  ["ocr"]="ocr"
  ["rewriter"]="rewriter"
  ["schoentje-tekening"]="schoentje_tekening"
  ["seo-optimizer"]="seo-optimizer"
  ["sinterklaas-brief"]="sinterklaas_brief"
  ["sinterklaas-voicemail"]="sinterklaas_voicemail"
  ["summarizer"]="summarizer"
  ["surprises"]="surprise_ideeen"
  ["transcription"]="transcription"
  ["translation"]="translation"
  ["wardrobe"]="wardrobe"
)

add_guard() {
  local file="$1"
  local tool_id="$2"
  
  echo "Processing: $file"
  
  # Check if already has ToolAccessGuard
  if grep -q "ToolAccessGuard" "$file"; then
    echo "  ✓ Already has ToolAccessGuard"
    return 0
  fi
  
  # Add import
  if ! grep -q "import { ToolAccessGuard }" "$file"; then
    # Find the last import line
    awk -v guard="import { ToolAccessGuard } from \"@/components/shared/ToolAccessGuard\";" '
      /^import/ {print; last_import=NR}
      /^export default/ {
        print guard;
        print "";
        print
        next
      }
      /^return \($/ && guard_added==0 {
        print "    <ToolAccessGuard toolId=\"" tool_id "\">";
        guard_added=1
      }
      /^    <div className="container/ {
        print $0;
        next
      }
      {print}
    ' "$file" tool_id="$tool_id" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
  
  # Find and add wrapper
  sed -i.bak "s|^  return ($|  return (\n    <ToolAccessGuard toolId=\"${tool_id}\">|" "$file"
  
  # Add closing tag before final </div>
  sed -i.bak "s|^    </div>$|    </ToolAccessGuard>\n    </div>|" "$file"
  
  rm -f "$file.bak"
  
  echo "  ✓ Added ToolAccessGuard"
}

# Process all tool pages
for dir in src/app/\(dashboard\)/tools/*/; do
  tool_slug=$(basename "$dir")
  if [[ -n "${TOOL_MAP[$tool_slug]}" ]]; then
    tool_id="${TOOL_MAP[$tool_slug]}"
    page_file="$dir/page.tsx"
    if [[ -f "$page_file" ]]; then
      add_guard "$page_file" "$tool_id"
    fi
  fi
done

echo "Done!"

