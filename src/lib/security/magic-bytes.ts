export interface FileValidationResult {
  isValid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
}

export function validateImageMagicBytes(buffer: Buffer): FileValidationResult {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, error: "Buffer file tidak valid atau terlalu kecil" };
  }

  // 1. JPEG check (Starts with FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, mimeType: "image/jpeg", extension: "jpg" };
  }

  // 2. PNG check (Starts with 89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, mimeType: "image/png", extension: "png" };
  }

  // 3. WEBP check (Starts with "RIFF" and contains "WEBP" at bytes 8-11)
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return { isValid: true, mimeType: "image/webp", extension: "webp" };
  }

  // 4. HEIC / HEIF check (Contains "ftypheic", "ftypmif1", "ftypheix", "ftypmsf1" at bytes 4-12)
  const ftyp = buffer.subarray(4, 12).toString("ascii");
  if (
    ftyp.startsWith("ftypheic") ||
    ftyp.startsWith("ftypmif1") ||
    ftyp.startsWith("ftypheix") ||
    ftyp.startsWith("ftypmsf1") ||
    ftyp.startsWith("ftyphevc")
  ) {
    return { isValid: true, mimeType: "image/heic", extension: "heic" };
  }

  return {
    isValid: false,
    error: "Tipe file tidak didukung. Harap unggah foto berekstensi JPEG, PNG, WEBP, atau HEIC.",
  };
}
