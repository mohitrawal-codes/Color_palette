/* ==========================================================
   modal.js — Controls All Modals
   (Option Modal, Color Wheel Modal, Palette Modal)
   FINAL PRODUCTION VERSION
========================================================== */

/* ----------------------------------------------------------
   ELEMENTS
---------------------------------------------------------- */

// Option modal
const optionOverlay = document.getElementById("optionModalOverlay");
const optionModal = document.getElementById("optionModal");
const optionTitle = document.getElementById("optionModalTitle");
const optionBody = document.getElementById("optionModalBody");

// Color wheel modal
const colorOverlay = document.getElementById("colorWheelOverlay");
const colorModal = document.getElementById("colorWheelModal");
const colorWheelCanvas = document.getElementById("colorWheelCanvas");
const selectedColorPreview = document.getElementById("selectedColorPreview");
const confirmColorBtn = document.getElementById("confirmColorBtn");
const colorWheelLabel = document.getElementById("colorWheelLabel");

// Palette modal
const paletteOverlay = document.getElementById("paletteModalOverlay");
const paletteModal = document.getElementById("paletteModal");
const paletteGrid = document.getElementById("paletteModalGrid");

/* ----------------------------------------------------------
   GENERIC MODAL HELPERS
---------------------------------------------------------- */

function openModal(overlay, modal) {
  overlay.hidden = false;
  modal.hidden = false;

  requestAnimationFrame(() => {
    overlay.classList.add("show");
    modal.classList.add("show");
  });
}

function closeModal(overlay, modal) {
  overlay.classList.remove("show");
  modal.classList.remove("show");

  setTimeout(() => {
    overlay.hidden = true;
    modal.hidden = true;
  }, 250);
}

/* Disable clicking outside modals */
optionOverlay.onclick = (e) => e.stopPropagation();
colorOverlay.onclick = (e) => e.stopPropagation();
paletteOverlay.onclick = (e) => e.stopPropagation();

/* ----------------------------------------------------------
   OPTION MODAL — Select from list
---------------------------------------------------------- */
export function openOptionModal(title, options, callback) {
  optionTitle.textContent = title;
  optionBody.innerHTML = "";

  options.forEach((opt) => {
    const btn = document.createElement("div");
    btn.className = "option-btn";
    btn.textContent = opt;

    btn.onclick = () => {
      closeModal(optionOverlay, optionModal);
      callback(opt);
    };

    optionBody.appendChild(btn);
  });

  openModal(optionOverlay, optionModal);
}

/* ----------------------------------------------------------
   COLOR WHEEL MODAL
---------------------------------------------------------- */

let colorCtx = colorWheelCanvas.getContext("2d");
let colorCallback = null;
let selectedColor = "#ff69b4";

function drawColorWheel() {
  const w = colorWheelCanvas.width;
  const h = colorWheelCanvas.height;
  const radius = w / 2;

  const image = colorCtx.createImageData(w, h);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let dx = x - radius;
      let dy = y - radius;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) continue;

      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360) % 360;

      let hue = angle;
      let sat = (dist / radius) * 100;
      let light = 50;

      const { r, g, b } = hslToRgb(hue, sat, light);

      let index = (y * w + x) * 4;
      image.data[index] = r;
      image.data[index + 1] = g;
      image.data[index + 2] = b;
      image.data[index + 3] = 255;
    }
  }

  colorCtx.putImageData(image, 0, 0);
}

export function openColorWheelModal(label, callback) {
  colorCallback = callback;

  colorWheelLabel.textContent = label;

  drawColorWheel();

  selectedColorPreview.style.background = selectedColor;

  openModal(colorOverlay, colorModal);
}

/* PICK COLOR */
colorWheelCanvas.addEventListener("click", (e) => {
  const rect = colorWheelCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const pixel = colorCtx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

  selectedColor = hex;
  selectedColorPreview.style.background = hex;
});

/* CONFIRM BUTTON */
confirmColorBtn.onclick = () => {
  if (colorCallback) colorCallback(selectedColor);
  closeModal(colorOverlay, colorModal);
};

/* ----------------------------------------------------------
   PALETTE RESULT MODAL
---------------------------------------------------------- */

export function openPaletteModal() {
  openModal(paletteOverlay, paletteModal);
}

export function closePaletteModal() {
  closeModal(paletteOverlay, paletteModal);
}

export function setPaletteHtml(html) {
  paletteGrid.innerHTML = html;
}

/* ----------------------------------------------------------
   COLOR HELPERS (HSL → RGB → HEX)
---------------------------------------------------------- */
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);

  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}