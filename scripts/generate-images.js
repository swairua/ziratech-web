#!/usr/bin/env node

/**
 * Image Generation Script
 * Generates favicon and og:image variants from the Zira logo
 * 
 * Requirements: npm install sharp
 * Usage: node scripts/generate-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceLogoPath = path.join(__dirname, '../public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png');
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Image configurations
const images = [
  {
    name: 'favicon-32x32.png',
    width: 32,
    height: 32,
    description: 'Favicon 32x32'
  },
  {
    name: 'favicon-16x16.png',
    width: 16,
    height: 16,
    description: 'Favicon 16x16'
  },
  {
    name: 'apple-touch-icon-180x180.png',
    width: 180,
    height: 180,
    description: 'Apple Touch Icon 180x180'
  },
  {
    name: 'logo-512x512.png',
    width: 512,
    height: 512,
    description: 'Logo 512x512'
  },
  {
    name: 'og-image-1200x630.png',
    width: 1200,
    height: 630,
    description: 'Open Graph Image 1200x630',
    background: true // Add background for social media
  }
];

async function generateImages() {
  console.log('🖼️  Starting image generation...\n');

  try {
    // Check if source logo exists
    if (!fs.existsSync(sourceLogoPath)) {
      throw new Error(`Source logo not found at: ${sourceLogoPath}`);
    }

    for (const image of images) {
      try {
        const outputPath = path.join(publicDir, image.name);
        
        console.log(`📝 Generating ${image.description}...`);

        if (image.background) {
          // For og:image, create a white background with the logo centered
          const logoBuffer = await sharp(sourceLogoPath)
            .resize(image.width * 0.6, image.height * 0.6, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .toBuffer();

          await sharp({
            create: {
              width: image.width,
              height: image.height,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          })
            .composite([
              {
                input: logoBuffer,
                gravity: 'center'
              }
            ])
            .png()
            .toFile(outputPath);
        } else {
          // For favicons, just resize the logo
          await sharp(sourceLogoPath)
            .resize(image.width, image.height, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(outputPath);
        }

        console.log(`✅ Created: ${image.name}\n`);
      } catch (error) {
        console.error(`❌ Error generating ${image.name}:`, error.message, '\n');
      }
    }

    console.log('🎉 Image generation complete!');
    console.log('\n📋 Generated files:');
    images.forEach(img => {
      console.log(`   - public/${img.name}`);
    });
    console.log('\n💡 Tip: Update the canonical URL in index.html if deploying to a different domain.');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

generateImages();
