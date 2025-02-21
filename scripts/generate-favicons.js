const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512
};

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .toFile(path.join(__dirname, '../public', filename));
    
    console.log(`Generated ${filename}`);
  }
}

generateFavicons().catch(console.error); 