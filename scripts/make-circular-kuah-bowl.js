const sharp = require('sharp');
const path = require('path');

async function makeCircularBowl() {
  const src = path.resolve('public/images/cireng-kuah-raw.jpg');
  const meta = await sharp(src).metadata();
  console.log('Image dimensions:', meta.width, meta.height);

  // The circular bowl is centered at x=512, y=535 with diameter around 900px
  const size = 910;
  const left = Math.round((meta.width - size) / 2); // 57
  const top = 75;

  // Create smooth anti-aliased circular mask SVG
  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="white" />
    </svg>
  `);

  await sharp(src)
    .extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: size,
      height: size,
    })
    .composite([{
      input: maskSvg,
      blend: 'dest-in'
    }])
    .png({ quality: 95 })
    .toFile(path.resolve('public/images/cireng-kuah-creamy.png'));

  console.log('Successfully saved circular bowl cutout to public/images/cireng-kuah-creamy.png');
}

makeCircularBowl().catch(console.error);
