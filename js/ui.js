/* ==========================================================
   ui.js — Rendering Palette + Copy CSS + PNG + Restart
   FINAL PRODUCTION VERSION
========================================================== */

import { openPaletteModal, closePaletteModal } from "./modal.js";
import { initChatbot } from "./chatbot.js";

/* DOM */
const paletteGrid = document.getElementById("paletteModalGrid");
const copyCssBtn = document.getElementById("modalCopyCss");
const downloadPngBtn = document.getElementById("modalDownloadPng");
const regenerateBtn = document.getElementById("modalRegenerate");

/* ==========================================================
   RENDER PALETTE (Called by chatbot.js)
========================================================== */
export function setPaletteHtml(paletteArr) {
  paletteGrid.innerHTML = "";

  let html = "";

  paletteArr.forEach((c) => {
    html += `
      <div class="palette-swatch">
        <div class="palette-swatch-color" style="background:${c.hex};">
          <div class="palette-swatch-copy">Copy</div>
        </div>

        <div class="palette-swatch-label">${c.name}</div>
        <div class="palette-swatch-code">${c.hex}</div>
        <div class="palette-swatch-usage">${c.usage}</div>
      </div>
    `;
  });

  paletteGrid.innerHTML = html;

  enableCopyOnSwatches();
}

/* ==========================================================
   COPY HEX ON EACH SWATCH
========================================================== */
function enableCopyOnSwatches() {
  const copyButtons = document.querySelectorAll(".palette-swatch-copy");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const hex = btn.closest(".palette-swatch")
                    .querySelector(".palette-swatch-code").textContent.trim();

      navigator.clipboard.writeText(hex);

      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy"), 800);
    });
  });
}

/* ==========================================================
   COPY CSS VARIABLES (entire palette)
========================================================== */
copyCssBtn.onclick = () => {
  const swatches = document.querySelectorAll(".palette-swatch");

  let css = ":root {\n";

  swatches.forEach((swatch) => {
    const name = swatch.querySelector(".palette-swatch-label").textContent;
    const hex = swatch.querySelector(".palette-swatch-code").textContent;

    const variableName = "--" + name.replace(/\s+/g, "-").toLowerCase();

    css += `  ${variableName}: ${hex};\n`;
  });

  css += "}";

  navigator.clipboard.writeText(css).then(() => {
    copyCssBtn.textContent = "Copied!";
    setTimeout(() => (copyCssBtn.textContent = "Copy CSS"), 1200);
  });
};

/* ==========================================================
   DOWNLOAD PNG OF PALETTE
========================================================== */
downloadPngBtn.onclick = () => {
  const swatches = document.querySelectorAll(".palette-swatch");

  const cols = 4;
  const colWidth = 180;
  const rowHeight = 160;
  const rows = Math.ceil(swatches.length / cols);

  const canvas = document.createElement("canvas");
  canvas.width = colWidth * cols;
  canvas.height = rowHeight * rows;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "16px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  swatches.forEach((swatch, i) => {
    const bg = swatch.querySelector(".palette-swatch-color").style.background;
    const name = swatch.querySelector(".palette-swatch-label").textContent;

    const x = (i % cols) * colWidth;
    const y = Math.floor(i / cols) * rowHeight;

    ctx.fillStyle = bg;
    ctx.fillRect(x, y, colWidth, rowHeight - 40);

    ctx.fillStyle = "#000";
    ctx.fillText(name, x + colWidth / 2, y + rowHeight - 20);
  });

  const link = document.createElement("a");
  link.download = "huebot-palette.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

/* ==========================================================
   NEW PALETTE — Restart Chat Flow
========================================================== */
regenerateBtn.onclick = () => {
  closePaletteModal();

  setTimeout(() => {
    initChatbot();
  }, 300);
};

/* ==========================================================
   INIT UI
========================================================== */
export function initUi() {
  console.log("UI initialized");
}