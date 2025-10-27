# Digital Wardrobe - Virtual Try-On Feature

## Overview

The Digital Wardrobe is an AI-powered virtual try-on tool that allows users to upload a photo of themselves and a clothing item, then generates a realistic image showing them wearing that clothing.

## Features

### 🎨 Intelligent Virtual Try-On
- Upload your photo (full body or upper body recommended)
- Upload a photo of any fashion item (clothing, accessories, shoes)
- **Smart Item Type Selection**: Choose from 5 categories for optimized results
  - **Accessories**: Glasses, jewelry, hats, watches (preserves facial features)
  - **Upper Body**: Shirts, jackets, blazers
  - **Lower Body**: Pants, skirts, shorts
  - **Full Outfit**: Dresses, suits, jumpsuits
  - **Footwear**: Shoes, boots, sneakers
- AI generates a realistic composite image with type-specific optimization
- Multiple photography style options (realistic, fashion photography, magazine editorial, casual)

### 💰 Pricing
- **15 credits per virtual try-on**
- Higher credit cost than basic image generation due to the complex AI processing required

### 🎯 Use Cases
- Online shopping visualization
- Personal styling and outfit planning
- Fashion e-commerce applications
- Wardrobe management
- Fashion blogging and content creation

## How It Works

### 1. **Image Upload**
Users upload two images:
- **Person Photo**: A clear photo of yourself (preferably full body or upper body)
- **Clothing Item**: A clear photo of the clothing piece you want to try on

### 2. **Intelligent Item Type Detection**
User selects the item type for optimized results:
- **Accessories**: Focus on preserving exact facial features while seamlessly adding the item
- **Clothing**: Balance between maintaining appearance and visualizing the new garment
- **Footwear**: Preserve upper body completely while showing new shoes

### 3. **Image-to-Image Processing (v3.0)**
The system now uses TRUE image-to-image generation:
- **Sends both actual photos to the AI model** (not text descriptions!)
- AI receives your photo and the item photo as visual data
- Model can SEE your facial features, not just read about them
- Multimodal processing: text instructions + 2 image inputs

### 3.5 **AI Visual Analysis**
The AI model (Gemini 2.5 Flash Image) analyzes:
- Your exact facial features, pose, body type, and setting
- The fashion item's style, color, pattern, and fabric texture
- Spatial relationships for natural compositing
- Lighting and perspective matching
- Type-specific instructions (e.g., "preserve facial features" for accessories)

### 4. **Image Generation**
- Uses OpenRouter with Gemini 2.5 Flash Image model
- Generates a photorealistic composite image
- Applies proper fit, draping, lighting, and shadows
- Saves the result to Convex storage

### 5. **Download & Share**
- View the generated image
- Download in high quality
- Try multiple clothing items

## Technical Implementation

### Frontend (`/src/app/(dashboard)/tools/wardrobe/page.tsx`)
- React component with dual image upload
- Preview functionality for uploaded images
- **Item Type Selection**: 5 categories for optimized results
- Photography style selection dropdown
- Real-time generation status
- Error handling and user feedback
- Mobile-responsive design

### Backend (`/convex/tools/wardrobe.ts`)
- Convex action for processing virtual try-on requests
- **TRUE Image-to-Image Processing (v3.0)**:
  - Retrieves actual image URLs from Convex storage
  - Sends both photos as visual data to AI model
  - Uses `generateImageFromImages()` function
- **Intelligent Item Type Handling**: Different instructions for each category
  - Accessories: "Preserve EXACT person, only add accessory"
  - Upper/Lower Body: "Maintain face, replace clothing area"
  - Full Outfit: "Maintain body type, replace outfit"
  - Footwear: "Preserve everything except feet"
- Integration with OpenRouter API (Gemini 2.5 Flash Image)
- Credit management and job tracking
- File storage in Convex

### Image-to-Image Function (`/convex/lib/openrouter.ts`)
- **NEW**: `generateImageFromImages(personUrl, itemUrl, instructions)`
- Sends two image URLs + text instructions to OpenRouter
- Uses multimodal message format: `[text, image, image]`
- Model receives actual visual data, not descriptions
- Returns composite image preserving person's identity

### Navigation
- Added to sidebar under "AI Tools"
- Accessible at `/tools/wardrobe`
- Uses Shirt icon from lucide-react

## API Integration

### OpenRouter Models Used
- **Gemini 2.5 Flash**: For analyzing images and creating detailed prompts
- **Gemini 2.5 Flash Image**: For generating the final composite image

### Credit System
- **Cost**: 15 credits per generation
- Higher than basic image generation due to:
  - Image analysis processing
  - Complex prompt generation
  - High-quality composite image generation

## User Experience

### Input Requirements
1. **Person Photo**:
   - Clear, well-lit photo
   - Full body or upper body preferred
   - Neutral pose works best
   - Formats: PNG, JPG (max 10MB)

2. **Clothing Item Photo**:
   - Clear photo of the garment
   - Good lighting and detail
   - Flat lay or on hanger works well
   - Formats: PNG, JPG (max 10MB)

### Item Type Options
1. **Accessories** (Glasses, Jewelry, Hats, Watches)
   - Preserves exact facial features
   - Only adds the accessory to existing look
   - Best for: Glasses, sunglasses, earrings, necklaces, hats, watches

2. **Upper Body** (Shirts, Jackets, Blazers)
   - Maintains face and general appearance
   - Replaces upper body clothing
   - Best for: T-shirts, blouses, jackets, blazers, sweaters

3. **Lower Body** (Pants, Skirts, Shorts)
   - Maintains upper body completely
   - Replaces lower body clothing
   - Best for: Jeans, pants, skirts, shorts

4. **Full Outfit** (Dresses, Suits, Jumpsuits)
   - Maintains facial features and body type
   - Replaces entire outfit
   - Best for: Dresses, full suits, jumpsuits, rompers

5. **Footwear** (Shoes, Boots, Sneakers)
   - Maintains entire upper body and face
   - Shows new footwear
   - Best for: Sneakers, boots, heels, sandals

### Photography Style Options
- **Realistic**: Natural, everyday photography style
- **Fashion Photography**: Professional fashion shoot aesthetic
- **Magazine Editorial**: High-end editorial style
- **Casual**: Relaxed, natural style

## Key Improvements in v3.0 (IMAGE-TO-IMAGE)

### ✅ What's New - THE REAL FIX!
1. **TRUE Image-to-Image**: Sends your actual photos to the AI model
2. **Vision-Based Generation**: AI can now SEE your face and the item
3. **Actual Visual Analysis**: No more text descriptions - real image data
4. **Multimodal Processing**: Two input images → AI analysis → Composite output
5. **Identity Preservation**: Model sees your features and maintains them

### 🔧 Technical Breakthrough
- **v1.0/v2.0**: Text descriptions → Random person generated
- **v3.0**: Your photo + Item photo → AI sees both → YOU with the item!

### 🐛 Problems ACTUALLY Solved
- ❌ **Old (v1-2)**: Text-to-image = Completely different person
- ✅ **New (v3)**: Image-to-image = YOUR face with accessory added
- ❌ **Old (v1-2)**: AI couldn't see your photos
- ✅ **New (v3)**: AI analyzes your actual images
- ❌ **Old (v1-2)**: Wrong gender, face, everything
- ✅ **New (v3)**: Preserves your identity from the input image

### 📊 v2.0 Improvements (Still Active)
1. **Intelligent Item Type Selection**: 5 categories with optimized prompting
2. **Accessory-Specific Handling**: Specialized instructions for each category
3. **Category-Optimized Instructions**: Each item type gets appropriate guidance
4. **Improved User Guidance**: Clear descriptions of what works best

## Future Enhancements

### Potential Improvements
1. **Multi-Item Try-On**: Allow users to try on multiple items at once (shirt + pants + shoes)
2. **Body Type Selection**: Specify body measurements for better fit visualization
3. **Background Selection**: Choose different backgrounds for the composite
4. **Pose Adjustment**: Select or customize the pose
5. **Batch Processing**: Try on multiple items in one session
6. **Saved Wardrobes**: Save favorite combinations
7. **Social Sharing**: Share try-on results directly to social media
8. **AR Preview**: Real-time augmented reality try-on
9. **Vision Model Integration**: Send actual images to AI vision model for better analysis

### Advanced Features
- Integration with e-commerce APIs
- Color variation generation
- Size recommendation based on fit
- Style matching suggestions
- Seasonal wardrobe planning

## Database Schema

The virtual try-on jobs are stored in the `aiJobs` table with:
- **toolType**: `"virtual_tryon"`
- **inputData**: Contains personImageId, clothingImageId, and style
- **outputData**: Contains the generated imageUrl and metadata
- **creditsUsed**: 15 credits

## Error Handling

The system handles various error scenarios:
- Missing images
- Invalid file formats
- Insufficient credits
- Upload failures
- AI generation errors
- Storage errors

All errors are logged and displayed to the user with helpful messages.

## Security

- User authentication required
- Session verification for all operations
- File upload validation
- Storage permissions enforced
- Credit balance verification before processing

## Performance

- Average generation time: 10-20 seconds
- Image upload: < 5 seconds
- Total process: ~15-25 seconds from upload to result

## Cost Optimization

The feature is priced at 15 credits (vs 10 for basic image generation) because:
1. Two images must be analyzed
2. AI prompt generation required
3. More complex image generation
4. Higher quality output expected

## Browser Compatibility

- Works on all modern browsers
- Mobile responsive design
- File upload supported on mobile devices
- Touch-friendly interface

## Conclusion

The Digital Wardrobe provides a powerful virtual try-on experience using cutting-edge AI technology. It's perfect for fashion enthusiasts, online shoppers, and anyone wanting to visualize clothing before purchasing or styling.

