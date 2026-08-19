import sharp from "sharp";
import fs from "fs";
import path from "path";

const imagesDir = path.resolve("./public/images");
const files = fs.readdirSync(imagesDir);

for (const file of files) {
  if (file.endsWith(".jpg") || file.endsWith(".png")) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, `${basename}.webp`);

    console.log(`Optimizing ${file} -> ${basename}.webp...`);
    
    let pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();
    
    if (metadata.width && metadata.width > 800) {
      pipeline = pipeline.resize({ width: 800, withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    const oldSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`Done: ${Math.round(oldSize / 1024)}KB -> ${Math.round(newSize / 1024)}KB`);
  }
}
console.log("All images successfully converted to WebP!");
