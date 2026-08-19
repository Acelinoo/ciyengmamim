const sharp = require('sharp');
const path = require('path');

async function createPerfectCutout() {
  const src = path.resolve('public/images/cireng-kuah-raw.jpg');
  const image = sharp(src);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Image info: ${width}x${height}, channels: ${channels}`);

  const rgbaBuffer = Buffer.alloc(width * height * 4);

  // Center ~ (512, 545), radius ~ 445
  const bowlCenter = { x: 512, y: 545, r: 445 };

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

      // Color check:
      // The food (crispy puffs) has warm golden/brown tone (r > b + 15, r > 110, g > 85)
      const isWarmFood = (r > b + 15 && r > 90 && g > 70);
      
      // Inside circular bowl body
      const distSq = Math.pow(x - bowlCenter.x, 2) + Math.pow(y - bowlCenter.y, 2);
      const isInsideBowlCircle = (distSq <= Math.pow(bowlCenter.r, 2)) && (y >= 265);

      // Left puff: x: 195 to 500, y: 0 to 380
      const isLeftPuffArea = (x >= 190 && x <= 500 && y <= 380 && y >= 10);
      
      // Right puff: x: 495 to 885, y: 40 to 420
      const isRightPuffArea = (x >= 495 && x <= 885 && y <= 420 && y >= 40);

      // Bowl rim top section (between puffs)
      const isTopBowlRim = (y >= 240 && y < 270 && distSq <= Math.pow(bowlCenter.r, 2) && (r > 200 || isWarmFood));

      let keep = false;

      if (isInsideBowlCircle) {
        keep = true;
      } else if (isLeftPuffArea && isWarmFood) {
        keep = true;
      } else if (isRightPuffArea && isWarmFood) {
        keep = true;
      } else if (isTopBowlRim) {
        keep = true;
      }

      rgbaBuffer[outIdx + 3] = keep ? 255 : 0;
    }
  }

  await sharp(rgbaBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ quality: 95 })
  .toFile(path.resolve('public/images/cireng-kuah-creamy.png'));

  console.log('Successfully written clean transparent cutout to public/images/cireng-kuah-creamy.png');
}

createPerfectCutout().catch(console.error);
