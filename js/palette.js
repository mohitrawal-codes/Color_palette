/* ==========================================================
   palette.js — Professional UI/UX Designer Palette Engine
   "Option D" Neutral Logic (Pure Grey + Brand-Tinted Text)
========================================================== */

/* ----------------------------------------------------------
   MAIN PUBLIC FUNCTION
---------------------------------------------------------- */
export function generatePalette(brandHex, shadeMode, excludeHex, count) {
  const base = hexToHsl(brandHex);
  const excludeH = excludeHex ? hexToHsl(excludeHex).h : null;

  const isMono = shadeMode === "Monochrome";
  const size = Number(count);

  if (isMono) {
    return generateMonochrome(base, size);
  } else {
    return generateVaried(base, excludeH, size);
  }
}

/* ==========================================================
   1) TRUE MONOCHROME PALETTE
========================================================== */
function generateMonochrome(base, size) {
  const { h, s, l } = base;
  const sat = clamp(s, 25, 70); // avoid neon mono

  const palette = [];

  // Primary (True Brand Color)
  palette.push(
    makeColor("Primary", h, sat, l, "Brand color • Buttons • Logo")
  );

  // Shade light/dark curve
  const steps = {
    3: [-20, +15],
    4: [-25, -10, +12],
    5: [-28, -14, +12, +20],
    6: [-32, -18, -6, +12, +22],
    7: [-35, -20, -10, +10, +18, +26],
    8: [-40, -24, -14, -4, +10, +18, +26],
  };

  (steps[size] || steps[5]).forEach((dL, index) => {
    const usage =
      dL < -15
        ? "Dark surfaces • Navbars • Footers"
        : dL < 0
        ? "Borders • Secondary buttons"
        : dL < 15
        ? "Highlights • Active states"
        : "Backgrounds • Cards";

    palette.push(
      makeColor(`Shade ${index + 1}`, h, sat, l + dL, usage)
    );
  });

  // Neutral logic (Option D)
  if (size >= 5) {
    palette.push(
      makeColor("Neutral Background", 210, 5, 95, "Page background • Sections")
    );
  }
  if (size >= 6) {
    palette.push(
      makeColor("Neutral Surface", 210, 7, 92, "Cards • Containers • Modals")
    );
  }
  if (size >= 7) {
    palette.push(
      makeColor("Text Primary", h, 20, 14, "Headings • Body text")
    );
  }
  if (size >= 8) {
    palette.push(
      makeColor("Text Secondary", h, 18, 38, "Paragraphs • Muted labels")
    );
  }

  return palette.slice(0, size);
}

/* ==========================================================
   2) VARIED HARMONY PALETTE (Design-based)
========================================================== */
function generateVaried(base, excludeH, size) {
  const { h } = base;

  // Designer harmony formula:
  let angles = [0, +25, -25, +180]; // primary, analogous+, analogous-, complement

  if (size < 4) angles = angles.slice(0, 3);

  const hues = [];

  angles.forEach((a) => {
    let newHue = wrapHue(h + a);

    if (!excludeH || !isCloseHue(newHue, excludeH, 30)) {
      hues.push(newHue);
    }
  });

  // Always ensure at least 2 accents exist
  while (hues.length < Math.min(size, 3)) {
    hues.push(wrapHue(h + Math.random() * 50 - 25));
  }

  const palette = [];

  hues.forEach((H, index) => {
    let usage =
      index === 0
        ? "Brand color • Buttons • Highlights"
        : index === 1
        ? "Accent color • Icons • Active states"
        : index === 2
        ? "Secondary accent • Badges • Highlights"
        : "Contrast color • Special highlights";

    palette.push(
      makeColor(index === 0 ? "Primary" : `Accent ${index}`, H, 70, 55, usage)
    );
  });

  const neutralCount = size - palette.length;

  // Neutral injection (Option D)
  if (neutralCount >= 1)
    palette.push(
      makeColor("Neutral Background", 210, 5, 95, "Page background • Sections")
    );

  if (neutralCount >= 2)
    palette.push(
      makeColor("Neutral Surface", 210, 7, 92, "Cards • Containers")
    );

  if (neutralCount >= 3)
    palette.push(
      makeColor("Text Primary", h, 18, 14, "Headings • Body text")
    );

  if (neutralCount >= 4)
    palette.push(
      makeColor("Text Secondary", h, 16, 36, "Paragraphs • Muted labels")
    );

  return palette.slice(0, size);
}

/* ==========================================================
   COLOR UTILITIES
========================================================== */
function makeColor(name, h, s, l, usage) {
  const hex = hslToHex(h, s, l);
  return { name, hex, usage, h, s, l };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}

function wrapHue(h) {
  return (h + 360) % 360;
}

function isCloseHue(h1, h2, threshold) {
  const diff = Math.abs(h1 - h2);
  return diff < threshold || diff > 360 - threshold;
}

/* ==========================================================
   HEX ↔ HSL
========================================================== */
function hexToHsl(hex) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  const d = max - min;

  if (d === 0) h = 0;
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hueToRgb = (p, q, t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hueToRgb(p, q, h + 1 / 3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1 / 3);

  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}