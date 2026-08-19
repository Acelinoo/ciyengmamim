const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function cleanCutout() {
  const src = path.resolve('public/images/cireng-kuah-raw.jpg');
  const image = sharp(src);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rgbaBuffer = Buffer.alloc(width * height * 4);

  // Background flood / threshold
  // Background is studio background around top-left (0,0), top-right (width-1,0), bottom-left, bottom-right.
  // Sample corner color:
  const cornerR = data[0];
  const cornerG = data[1];
  const cornerB = data[2];
  console.log('Corner sample:', cornerR, cornerG, cornerB);

  // Let's do a flood fill mask from all 4 borders
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);

  const queue = [];

  function isBackgroundPixel(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Background is near neutral-cool light grey (r ~ 170-220, g ~ 180-230, b ~ 190-240)
    // The food (cireng, broth, bowl shadow) is either warm yellow/brown, red/orange broth, or white bowl.
    // The bowl rim is bright white (r > 240, g > 240, b > 240) or dark shadow at bottom.
    // Background has high brightness and b >= r (cool tint).
    const diffToCorner = Math.sqrt(
      Math.pow(r - cornerR, 2) + Math.pow(g - cornerG, 2) + Math.pow(b - cornerB, 2)
    );

    const isCoolGrey = Math.abs(r - g) < 20 && b >= r - 10 && (r > 155 || (r > 130 && y < 150));
    return diffToCorner < 65 || (isCoolGrey && y < 350 && (x < 180 || x > 840 || (x > 460 && x < 540 && y < 180)));
  }

  // Push all border pixels to queue
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pIdx = y * width + x;

    if (visited[pIdx]) continue;
    visited[pIdx] = 1;

    if (isBackgroundPixel(x, y)) {
      isBg[pIdx] = 1;

      // 4-way neighbors
      if (x > 0 && !visited[y * width + (x - 1)]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[y * width + (x + 1)]) queue.push(x + 1, y);
      if (y > 0 && !visited[(y - 1) * width + x]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[(y + 1) * width + x]) queue.push(x, y + 1);
    }
  }

  // Fill RGBA buffer
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const idx = pIdx * channels;
      const outIdx = pIdx * 4;

      rgbaBuffer[outIdx] = data[idx];
      rgbaBuffer[outIdx + 1] = data[idx + 1];
      rgbaBuffer[outIdx + 2] = data[idx + 2];
      rgbaBuffer[outIdx + 3] = isBg[pIdx] ? 0 : 255;
    }
  }

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ quality: 95 })
    .toFile(path.resolve('public/images/cireng-kuah-creamy.png'));

  console.log('Saved clean transparent cutout to public/images/cireng-kuah-creamy.png');
}

cleanCutout().catch(console.error);
