# Debugging Image Generation with Comprehensive Logging

## Overview

I've added **comprehensive logging** throughout the entire image generation flow. Every step is now logged with detailed information to help us figure out exactly what's happening.

## How to Debug

### Step 1: Open Convex Dashboard

Visit: https://dashboard.convex.dev

Or run:
```bash
npx convex dashboard
```

### Step 2: Go to Logs Tab

1. Click on your project
2. Click on "Logs" in the left sidebar
3. Keep this window open

### Step 3: Test Image Generation

1. Open http://localhost:3000/tools/image-generation
2. Enter a prompt: "A beautiful sunset"
3. Click "Generate Image (10 credits)"
4. Watch the Convex logs in real-time

## What the Logs Will Show

### Full Flow Logging

```
================================================================================
🎨 OPENROUTER IMAGE GENERATION STARTING
================================================================================
📝 Prompt: "A beautiful sunset"
🔧 Model: google/gemini-2.5-flash-image-preview
🌐 API URL: https://openrouter.ai/api/v1/chat/completions
🔑 API Key present: Yes (sk-or-v1-...)
📤 Request body: { ... }
📥 Response status: 200 OK
📥 Response headers: { ... }

✅ Got successful response from OpenRouter
📊 Full response: { ... }

🔍 ANALYZING RESPONSE STRUCTURE:
- Response keys: [...]
- Choices array length: 1
- First choice keys: [...]
- Message keys: [...]
  - content type: ...
  - images type: ...

🔍 METHOD 1: Checking message.images array...
  ✓ message.images exists
  - Type: object
  - Is array: true
  - Array length: 1
  ✓ First image exists
  - Image type: object
  - Image keys: [...]
  - Full image object: { ... }
  
🎉 SUCCESS! Found image URL
  - Source: image_url.url
  - Type: data URL
  - Length: 123456
  - Preview: data:image/png;base64,iVBORw0KG...
```

## Key Things to Look For

### 1. API Key Check
```
🔑 API Key present: Yes (sk-or-v1-...)
```
- Should show "Yes" with first 10 characters

### 2. Request Sent
```
📤 Request body: {
  "model": "google/gemini-2.5-flash-image-preview",
  "messages": [...],
  "modalities": ["image", "text"],
  "temperature": 0.8
}
```

### 3. Response Status
```
📥 Response status: 200 OK
```
- Should be 200
- If not, look for error details below

### 4. Response Structure
```
📊 Full response: { ... }
```
- This shows EXACTLY what OpenRouter returned
- Most important for debugging

### 5. Image Location
The logs will try two methods:
- **METHOD 1:** Check `message.images[]` array
- **METHOD 2:** Check `message.content` field

Look for:
```
🎉 SUCCESS! Found image URL
```

Or:
```
❌ NO IMAGE FOUND IN RESPONSE
```

## Common Issues & Solutions

### Issue 1: API Key Not Configured
```
❌ OPENROUTER_API_KEY not configured
```

**Solution:** Check `.env.local`:
```bash
cat .env.local | grep OPENROUTER
```

### Issue 2: API Returns Error
```
❌ OPENROUTER API ERROR
Status: 400 Bad Request
Response body: { "error": { "message": "..." } }
```

**Possible causes:**
- Invalid model name
- Invalid request format
- Account has no credits
- Model doesn't support image generation

**Solution:** Check the error message in the logs

### Issue 3: No Image in Response
```
❌ NO IMAGE FOUND IN RESPONSE
Searched in:
  1. message.images[] (not found or empty)
  2. message.content (not found or not an image)
```

**This means:**
- OpenRouter returned successfully (200 OK)
- But the response doesn't contain an image
- The model might not actually support image generation

**Solution:** Check the full response structure:
```
Full response for debugging: { ... }
```

### Issue 4: Invalid Data URL
```
❌ Invalid data URL format - no base64 data found
```

**Solution:** The image URL returned is not a proper data URL

## Tool-Level Logging

The tool itself also logs every step:

```
################################################################################
🚀 IMAGE GENERATION TOOL STARTED
################################################################################

🔐 Step 1: Verifying user authentication...
✅ User authenticated: user@example.com
💰 User credits: 100

📝 Step 2: Creating job in database...
✅ Job created with ID: xyz123

⚙️ Step 3: Updating job status to processing...
✅ Job status updated

💳 Step 4: Checking credits...
  - Required: 10
  - Available: 100
✅ User has sufficient credits

🔧 Step 5: Checking OpenRouter configuration...
  - OpenRouter configured: true

🎨 Step 6: Calling OpenRouter image generation...
  - Prompt: "A beautiful sunset"
  - About to call generateImage()...

[OpenRouter API logs here...]

✅ Image generation returned successfully
  - Image URL type: Data URL
  - Image URL length: 123456
  - Image URL preview: data:image/png;base64,...

📦 Step 7: Converting and uploading to Convex storage...
  - Extracted base64 data, length: 123456
  - Decoded binary string, length: 92000
  - Created Uint8Array, length: 92000
  - Created blob, size: 92000 bytes

📤 Step 8: Uploading to Convex storage...
  - Got upload URL
  - Upload response status: 200
  - Storage ID: abc123

🔄 Step 9: Updating job with storage ID...
  - Job updated with storage ID

🔗 Step 10: Getting permanent URL...
  - Permanent URL: Retrieved

✅ Image saved to Convex storage successfully

💳 Step 11: Deducting credits...
✅ Credits deducted: 10

✅ Step 12: Marking job as completed...
✅ Job marked as completed

################################################################################
🎉 IMAGE GENERATION COMPLETED SUCCESSFULLY
################################################################################
```

## Where to Find Issues

Look for these markers in the logs:

### Success Markers ✅
- `🎉 SUCCESS!` - Found the image
- `✅` - Step completed successfully

### Error Markers ❌
- `❌` - Something failed
- `!!!!` - Major error boundary
- `❌ NO IMAGE FOUND` - Image not in response
- `❌ API ERROR` - OpenRouter returned error

### Warning Markers ⚠️
- `⚠️ Falling back to placeholder` - Using placeholder instead
- `ℹ️` - Information message

## Next Steps

1. **Run a test** and generate the logs
2. **Copy the full log output** from Convex dashboard
3. **Share the logs** - we'll analyze:
   - The request being sent
   - The response from OpenRouter
   - Where exactly it fails
   - What the model actually returns

## Tips

- Logs are color-coded with emojis for easy scanning
- Each major step is numbered
- Full objects are logged with JSON.stringify for detail
- Response structure is analyzed before parsing

**The logs will tell us EXACTLY what's happening!**


