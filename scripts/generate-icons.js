const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createIcon(size, isMaskable = false, isApple = false) {
  const png = new PNG({ width: size, height: size });
  const scale = size / 512;

  // Maskable icons need inner content scaled down to ~65% to fit safe zone
  const contentScale = isMaskable ? scale * 0.65 : scale;
  const contentOffset = isMaskable ? size * 0.175 : 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 4x supersampling for buttery smooth anti-aliasing
      let rTotal = 0, gTotal = 0, bTotal = 0, aTotal = 0;

      for (let sy = 0; sy < 2; sy++) {
        for (let sx = 0; sx < 2; sx++) {
          const px = x + (sx + 0.5) / 2;
          const py = y + (sy + 0.5) / 2;

          let [r, g, b, a] = samplePixel(px, py, size, scale, contentScale, contentOffset, isMaskable, isApple);
          rTotal += r;
          gTotal += g;
          bTotal += b;
          aTotal += a;
        }
      }

      const idx = (size * y + x) << 2;
      png.data[idx] = Math.round(rTotal / 4);
      png.data[idx + 1] = Math.round(gTotal / 4);
      png.data[idx + 2] = Math.round(bTotal / 4);
      png.data[idx + 3] = Math.round(aTotal / 4);
    }
  }

  return png;
}

function samplePixel(px, py, size, scale, cScale, cOffset, isMaskable, isApple) {
  // Background
  const blue = [37, 99, 235, 255]; // #2563eb
  const darkBlue = [29, 78, 216, 255]; // #1d4ed8
  const white = [255, 255, 255, 255];
  const lightBlue = [219, 234, 254, 255]; // #dbeafe
  const cyan = [56, 189, 248, 255]; // #38bdf8
  const transparent = [0, 0, 0, 0];

  // Base background shape
  let inBackground = false;
  if (isMaskable || isApple) {
    inBackground = true; // Full bleed
  } else {
    // Rounded rectangle with radius ~ 100 on 512
    const radius = 100 * scale;
    inBackground = pointInRoundedRect(px, py, 0, 0, size, size, radius);
  }

  if (!inBackground) return transparent;

  // Background subtle gradient from #2563eb to #1d4ed8
  const gradT = py / size;
  let bgR = Math.round(blue[0] * (1 - gradT * 0.2) + darkBlue[0] * (gradT * 0.2));
  let bgG = Math.round(blue[1] * (1 - gradT * 0.2) + darkBlue[1] * (gradT * 0.2));
  let bgB = Math.round(blue[2] * (1 - gradT * 0.2) + darkBlue[2] * (gradT * 0.2));
  let cur = [bgR, bgG, bgB, 255];

  // Content coordinates normalized to 512 base
  const nx = (px - cOffset) / cScale;
  const ny = (py - cOffset) / cScale;

  // Document paper body:
  // Main rect: x: 140..400, y: 120..420
  // Top right corner fold: fold cut at (320, 120) to (400, 200)
  const docR = 20;
  if (pointInDocPaper(nx, ny)) {
    cur = [255, 255, 255, 245];

    // Corner fold flap: triangle (320, 120), (320, 200), (400, 200)
    if (pointInFoldFlap(nx, ny)) {
      cur = lightBlue;
    }

    // Line 1: (180, 250) to (330, 250), thickness 20, round caps
    if (pointInLine(nx, ny, 180, 250, 330, 250, 10)) {
      cur = blue;
    }
    // Line 2: (180, 310) to (280, 310), thickness 20, round caps
    if (pointInLine(nx, ny, 180, 310, 280, 310, 10)) {
      cur = blue;
    }
    // Line 3: (180, 370) to (240, 370), thickness 20, round caps
    if (pointInLine(nx, ny, 180, 370, 240, 370, 10)) {
      cur = lightBlue;
    }
  }

  // Cyan badge at cx=350, cy=350, r=42
  const badgeDist = Math.hypot(nx - 350, ny - 350);
  if (badgeDist <= 44) {
    cur = cyan;

    // White checkmark inside badge:
    // (335, 350) -> (347, 362) -> (368, 340)
    if (pointInLine(nx, ny, 336, 350, 347, 361, 5) || pointInLine(nx, ny, 347, 361, 366, 340, 5)) {
      cur = white;
    }
  }

  return cur;
}

function pointInRoundedRect(x, y, rx, ry, w, h, r) {
  if (x < rx || x > rx + w || y < ry || y > ry + h) return false;
  const left = rx + r;
  const right = rx + w - r;
  const top = ry + r;
  const bottom = ry + h - r;

  if (x < left && y < top) return Math.hypot(x - left, y - top) <= r;
  if (x > right && y < top) return Math.hypot(x - right, y - top) <= r;
  if (x < left && y > bottom) return Math.hypot(x - left, y - bottom) <= r;
  if (x > right && y > bottom) return Math.hypot(x - right, y - bottom) <= r;
  return true;
}

function pointInDocPaper(x, y) {
  if (x < 130 || x > 390 || y < 120 || y > 420) return false;
  // Exclude top-right triangle above fold line
  // fold line: from (310, 120) to (390, 200)
  // equation: y - 120 = (x - 310) => y - x = -190 => if (x - y > 190) outside
  if (x > 310 && y < 200 && (x - y > 190)) return false;
  // Corner radiuses
  if (x < 150 && y < 140 && Math.hypot(x - 150, y - 140) > 20) return false;
  if (x < 150 && y > 400 && Math.hypot(x - 150, y - 400) > 20) return false;
  if (x > 370 && y > 400 && Math.hypot(x - 370, y - 400) > 20) return false;
  return true;
}

function pointInFoldFlap(x, y) {
  // flap inside (310..390, 120..200)
  if (x < 310 || x > 390 || y < 120 || y > 200) return false;
  // inside triangle below the fold cut
  if (x - y <= 190 && x >= 310 && y <= 200) {
    // corner of flap
    return true;
  }
  return false;
}

function pointInLine(px, py, x1, y1, x2, y2, radius) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1) <= radius;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY) <= radius;
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const targets = [
  { name: 'icon-192x192.png', size: 192, maskable: false, apple: false },
  { name: 'icon-512x512.png', size: 512, maskable: false, apple: false },
  { name: 'maskable-icon-512x512.png', size: 512, maskable: true, apple: false },
  { name: 'apple-touch-icon.png', size: 180, maskable: false, apple: true },
  { name: 'favicon-32x32.png', size: 32, maskable: false, apple: false },
  { name: 'favicon-16x16.png', size: 16, maskable: false, apple: false }
];

targets.forEach(({ name, size, maskable, apple }) => {
  const png = createIcon(size, maskable, apple);
  const outPath = path.join(iconsDir, name);
  png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => {
    console.log(`Generated: ${name} (${size}x${size})`);
  });
});
