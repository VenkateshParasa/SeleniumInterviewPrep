# PWA Icons Directory

This directory should contain PWA icons in various sizes.

## Required Icons

To properly support PWA installation, you need the following icon sizes:

- `icon-16x16.png` - Browser favicon
- `icon-32x32.png` - Browser favicon
- `icon-144x144.png` - Microsoft tile
- `icon-152x152.png` - Apple touch icon
- `icon-180x180.png` - Apple touch icon
- `icon-192x192.png` - Android home screen
- `icon-512x512.png` - Android splash screen

## Generating Icons

You can generate these icons from a single source image using:

1. **Online Tools:**
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

2. **Command Line (ImageMagick):**
   ```bash
   # From a 512x512 source image
   convert icon-512x512.png -resize 16x16 icon-16x16.png
   convert icon-512x512.png -resize 32x32 icon-32x32.png
   convert icon-512x512.png -resize 144x144 icon-144x144.png
   convert icon-512x512.png -resize 152x152 icon-152x152.png
   convert icon-512x512.png -resize 180x180 icon-180x180.png
   convert icon-512x512.png -resize 192x192 icon-192x192.png
   ```

3. **Node.js (sharp):**
   ```javascript
   const sharp = require('sharp');
   const sizes = [16, 32, 144, 152, 180, 192, 512];
   
   sizes.forEach(size => {
     sharp('source.png')
       .resize(size, size)
       .toFile(`icon-${size}x${size}.png`);
   });
   ```

## Temporary Solution

Until proper icons are created, the application will:
- Use a fallback emoji icon (🎯)
- Display without errors
- Still function as a PWA

## Icon Design Guidelines

- Use a simple, recognizable design
- Ensure good contrast for visibility
- Test on both light and dark backgrounds
- Make sure the icon is clear at small sizes (16x16)
- Use PNG format with transparency
- Recommended: 512x512px source image