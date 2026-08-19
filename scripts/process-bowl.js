const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processBowl() {
  const src = path.resolve('public/images/cireng-bowl-raw.png');
  const meta = await sharp(src).metadata();
  console.log('Image dimensions:', meta.width, meta.height);

  // Bowl center is around x=288, y=490, radius ~230
  const size = 470;
  const left = Math.round((meta.width - size) / 2);
  const top = 255;

  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="white" />
    </svg>
  `);

  await sharp(src)
    .extract({
      left: Math.max(0, left),
      top: top,
      width: size,
      height: size,
    })
    .composite([{
      input: maskSvg,
      blend: 'dest-in'
    }])
    .png({ quality: 95 })
    .toFile(path.resolve('public/images/cireng-bowl.png'));

  console.log('Successfully saved cutout to public/images/cireng-bowl.png');
}

processBowl().catch(console.error);
