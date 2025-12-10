# Image Generation Guide for Zira Technologies

## Overview
This guide explains how to generate favicon and Open Graph images from the Zira Technologies logo.

## Generated Images

The following images will be created:

1. **favicon-32x32.png** - Primary favicon for modern browsers
2. **favicon-16x16.png** - Fallback favicon for older browsers
3. **apple-touch-icon-180x180.png** - iOS home screen icon
4. **logo-512x512.png** - General purpose logo for JSON-LD structured data
5. **og-image-1200x630.png** - Social media preview image (1200x630px)

## Method 1: Using Node.js Script (Recommended)

### Prerequisites
```bash
npm install sharp
```

### Generate Images
```bash
node scripts/generate-images.js
```

This script will:
- Read the source logo from `public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png`
- Generate all favicon and og:image variants
- Save them to the `public/` directory

## Method 2: Manual Generation Using Online Tools

If you prefer manual generation, use these online services:

1. **Favicon Generator**: https://realfavicongenerator.net/
   - Upload: `public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png`
   - Generate favicon package
   - Place generated files in `public/`

2. **Social Media Image Resizer**: https://www.canva.com/ or https://figma.com/
   - Resize logo to 1200x630px
   - Add white background
   - Export as `og-image-1200x630.png`
   - Place in `public/`

## Method 3: Using ImageMagick (Linux/Mac)

If you have ImageMagick installed:

```bash
# Favicon sizes
convert public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png -resize 32x32 public/favicon-32x32.png
convert public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png -resize 16x16 public/favicon-16x16.png

# Apple touch icon
convert public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png -resize 180x180 public/apple-touch-icon-180x180.png

# Logo
convert public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png -resize 512x512 public/logo-512x512.png

# OG Image (white background)
convert -size 1200x630 xc:white public/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png -gravity center -composite -resize 1200x630 public/og-image-1200x630.png
```

## Verify Installation

After generating images, check that all files exist:

```bash
ls -la public/{favicon-*,apple-touch-icon-*,logo-*,og-image-*}
```

## SEO Benefits

The updated configuration provides:

✅ Proper favicon display across all devices
✅ Beautiful social media previews
✅ Structured data (JSON-LD) for search engines
✅ Better search engine indexing
✅ Mobile-friendly metadata
✅ Twitter Card support
✅ Canonical URL specification
✅ Robots meta tags for crawler guidance

## Next Steps

1. Generate the images using your preferred method
2. Verify all files are in `public/` directory
3. Update the canonical URL in `index.html` if deploying to a different domain (currently set to `https://www.zira-tech.com/`)
4. Rebuild and deploy your application
5. Test using:
   - Google Search Console
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - https://www.heymeta.com/

## Important Notes

- **Canonical URL**: The `og:url` and `canonical` tags currently point to `https://www.zira-tech.com/`. Update these if using a different domain.
- **Image Formats**: All images should be PNG format for better quality and transparency support
- **Social Media Verification**: After deployment, test using social media debuggers to ensure proper display
- **Browser Caching**: Clear browser cache after updating favicons

## References

- [MDN: Favicon Guide](https://developer.mozilla.org/en-US/docs/Glossary/Favicon)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [JSON-LD Introduction](https://json-ld.org/)
