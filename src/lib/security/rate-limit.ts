interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan cache lama setiap 10 menit
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Hapus timestamp yang lebih lama dari 1 jam
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 600000);
}

export interface RateLimitOptions {
  limit: number; // Jumlah request maksimum
  windowMs: number; // Periode waktu dalam milidetik
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { isAllowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) ?? { timestamps: [] };

  // Filter timestamp yang masih berada dalam windowMs
  const validTimestamps = record.timestamps.filter(
    (ts) => now - ts < options.windowMs
  );

  if (validTimestamps.length >= options.limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetTime = oldestTimestamp + options.windowMs;
    return { isAllowed: false, remaining: 0, resetTime };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });

  return {
    isAllowed: true,
    remaining: options.limit - validTimestamps.length,
    resetTime: now + options.windowMs,
  };
}
