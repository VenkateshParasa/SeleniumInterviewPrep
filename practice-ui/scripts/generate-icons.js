#!/usr/bin/env node

/**
 * Simple Icon Generator for PWA
 * Generates placeholder icons in various sizes
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/assets/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [16, 32, 144, 152, 180, 192, 512];

// Generate SVG icon for each size
sizes.forEach(size => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
    
    <!-- Target/Bullseye Icon -->
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="none" stroke="white" stroke-width="${size * 0.05}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="none" stroke="white" stroke-width="${size * 0.05}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.15}" fill="white"/>
    
    <!-- Text for larger sizes -->
    ${size >= 144 ? `<text x="${size/2}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" fill="white" text-anchor="middle">PREP</text>` : ''}
</svg>`;

    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Generated ${filename}`);
});

// Generate favicon.ico placeholder (just copy the 32x32)
const faviconPath = path.join(__dirname, '../public/favicon.ico');
const icon32Path = path.join(iconsDir, 'icon-32x32.svg');

if (fs.existsSync(icon32Path)) {
    fs.copyFileSync(icon32Path, faviconPath.replace('.ico', '.svg'));
    console.log('✅ Generated favicon.svg');
}

console.log('\n🎉 Icon generation complete!');
console.log('\nNote: These are SVG placeholders. For production:');
console.log('1. Create a proper 512x512 PNG icon');
console.log('2. Use an online tool like realfavicongenerator.net');
console.log('3. Or use ImageMagick/sharp to convert to PNG format');