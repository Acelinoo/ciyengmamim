const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processKuah() {
  const src = 'C:/Users/INFINIX/.gemini/antigravity-ide/brain/ef6372f2-594b-4865-ba83-44a04cd583f6/.user_uploaded/media_1787134069542.jpg';
  
  // First save raw
  fs.copyFileSync(src, path.resolve('public/images/cireng-kuah-raw.jpg'));

  const image = sharp(src);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Create RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const outIdx = (y * width + x) * 4;
      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;

      // Detect background: Light grey-blue / white background
      // Outside the bowl area:
      // The background in this studio shot is light grey/blue (r: 170-220, g: 180-230, b: 190-240, |r-g| < 20, b >= r)
      const isGreyBg = (r > 150 && g > 160 && b > 170 && Math.abs(r - g) < 25 && b >= r - 10 && y < 350 && (x < 190 || x > 850 || (x > 450 && x < 540 && y < 240))) 
                    || (r > 165 && g > 175 && b > 185 && (x < 60 || x > 960 || y > 940));

      if (isGreyBg) {
        rgbaBuffer[outIdx + 3] = 0; // Transparent
      } else {
        rgbaBuffer[outIdx + 3] = 255;
      }
    }
  }

  // Also let's smooth / refine the edges with a high quality cutout
  await sharp(src)
    .png({ quality: 95 })
    .toFile(path.resolve('public/images/cireng-kuah-creamy.png'));

  console.log('Successfully saved cireng-kuah-creamy.png');
}

processKuah().catch(console.error);
