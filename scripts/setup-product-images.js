const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const userUploadDir = 'C:/Users/INFINIX/.gemini/antigravity-ide/brain/ef6372f2-594b-4865-ba83-44a04cd583f6/.user_uploaded';
const outDir = path.resolve('public/images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function copyAndOptimize() {
  // 1. Gambar 1: Cireng Kuah Creamy & Taichan
  const g1 = path.join(userUploadDir, 'media_1787134625205.jpg');
  await sharp(g1).jpeg({ quality: 90 }).toFile(path.join(outDir, 'cireng-kuah.jpg'));
  console.log('Saved cireng-kuah.jpg');

  // 2. Gambar 2: Paket A, B, C (Cireng di atas talenan kayu)
  // Let's crop to square / food focal center to remove vertical grey bars
  const g2 = path.join(userUploadDir, 'media_1787134685856.png');
  const g2Meta = await sharp(g2).metadata();
  // Crop middle area containing the food
  await sharp(g2)
    .extract({
      left: 0,
      top: Math.round(g2Meta.height * 0.22),
      width: g2Meta.width,
      height: Math.round(g2Meta.height * 0.56)
    })
    .jpeg({ quality: 90 })
    .toFile(path.join(outDir, 'paket-cireng.jpg'));
  console.log('Saved paket-cireng.jpg');

  // 3. Gambar 3: Isi Ayam (Ayam Rica)
  const g3 = path.join(userUploadDir, 'media_1787134697051.png');
  const g3Meta = await sharp(g3).metadata();
  await sharp(g3)
    .extract({
      left: 0,
      top: Math.round(g3Meta.height * 0.22),
      width: g3Meta.width,
      height: Math.round(g3Meta.height * 0.56)
    })
    .jpeg({ quality: 90 })
    .toFile(path.join(outDir, 'cireng-ayam-rica.jpg'));
  console.log('Saved cireng-ayam-rica.jpg');

  // 4. Gambar 4: Isi Pizza
  const g4 = path.join(userUploadDir, 'media_1787134710830.jpg');
  await sharp(g4).jpeg({ quality: 90 }).toFile(path.join(outDir, 'cireng-pizza.jpg'));
  console.log('Saved cireng-pizza.jpg');

  // 5. Gambar 5: Isi Keju
  const g5 = path.join(userUploadDir, 'media_1787134724351.jpg');
  await sharp(g5).jpeg({ quality: 90 }).toFile(path.join(outDir, 'cireng-keju.jpg'));
  console.log('Saved cireng-keju.jpg');

  // 6. Sapi Teriyaki & Paru Rica
  const gBowl = path.join(userUploadDir, 'media_1787133677687.png');
  const gBowlMeta = await sharp(gBowl).metadata();
  await sharp(gBowl)
    .extract({
      left: 0,
      top: Math.round(gBowlMeta.height * 0.24),
      width: gBowlMeta.width,
      height: Math.round(gBowlMeta.height * 0.52)
    })
    .jpeg({ quality: 90 })
    .toFile(path.join(outDir, 'cireng-paru-rica.jpg'));
  console.log('Saved cireng-paru-rica.jpg');

  await sharp(path.join(outDir, 'paket-cireng.jpg'))
    .toFile(path.join(outDir, 'cireng-sapi-teriyaki.jpg'));
  console.log('Saved cireng-sapi-teriyaki.jpg');
}

copyAndOptimize().catch(console.error);
