const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const CACHE_DIR = path.join(__dirname, '..', '..', 'build-tmp');
fs.mkdirSync(CACHE_DIR, { recursive: true });

// Rate limiting: max 10 requests per minute for free tier
let lastRequest = 0;
const MIN_INTERVAL = 6500; // ~9 req/min to be safe

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequest;
  if (elapsed < MIN_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_INTERVAL - elapsed));
  }
  lastRequest = Date.now();
}

function getCachePath(key) {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  return path.join(CACHE_DIR, `${safe}.json`);
}

function getFromCache(key) {
  const p = getCachePath(key);
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch { return null; }
  }
  return null;
}

function saveToCache(key, data) {
  fs.writeFileSync(getCachePath(key), JSON.stringify(data, null, 2), 'utf8');
}

async function callGemini(prompt, pdfPath, cacheKey) {
  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`  [cache hit] ${cacheKey}`);
    return cached;
  }

  await waitForRateLimit();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  let parts;
  if (pdfPath) {
    const pdfData = fs.readFileSync(pdfPath);
    const base64 = pdfData.toString('base64');
    parts = [
      { inlineData: { mimeType: 'application/pdf', data: base64 } },
      { text: prompt }
    ];
  } else {
    parts = [{ text: prompt }];
  }

  let attempts = 0;
  while (attempts < 3) {
    try {
      const result = await model.generateContent(parts);
      const text = result.response.text();

      // Try to parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        saveToCache(cacheKey, parsed);
        return parsed;
      }

      // Try object
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) {
        const parsed = JSON.parse(objMatch[0]);
        saveToCache(cacheKey, parsed);
        return parsed;
      }

      console.error(`  [warn] No JSON found in response for ${cacheKey}`);
      saveToCache(cacheKey, []);
      return [];
    } catch (err) {
      attempts++;
      console.error(`  [error] Attempt ${attempts}/3 for ${cacheKey}: ${err.message}`);
      if (attempts < 3) {
        await new Promise(r => setTimeout(r, 10000 * attempts));
      }
    }
  }

  console.error(`  [fail] ${cacheKey} - returning empty`);
  return [];
}

module.exports = { callGemini };
