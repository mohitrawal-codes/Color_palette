/* ==========================================================
   chatbot.js — FINAL IMPROVED UX VERSION
   Smooth Typing • Better Delays • Same Logic • No Breaking
========================================================== */

import { openOptionModal, openColorWheelModal } from "./modal.js";
import { generatePalette } from "./palette.js";
import { setPaletteHtml } from "./ui.js";
import { openPaletteModal } from "./modal.js";

/* ----------------------------------------------------------
   DOM
---------------------------------------------------------- */
const chatMessages = document.getElementById("chatMessages");
const typing = document.getElementById("typingIndicator");

/* ----------------------------------------------------------
   STATE
---------------------------------------------------------- */
let step = 0;
let answers = {};

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */
function addMessage(text, isBot = true) {
  const div = document.createElement("div");
  div.className = `message ${isBot ? "bot" : "user"}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/* ----------------------------------------------------------
   Better Typing — Natural Human-Like Speed
---------------------------------------------------------- */
async function showTyping(text = "") {
  typing.style.display = "flex";

  // natural dynamic time based on message length
  const base = 900;       // minimum delay
  const perChar = 35;     // speed factor
  const total = Math.min(base + text.length * perChar, 7000); // cap 3s

  await delay(total);
  typing.style.display = "none";
}

/* ==========================================================
   QUESTIONS
========================================================== */

async function askBrandColor() {
  await showTyping("Pick your brand color 🎨");
  addMessage("Pick your brand color 🎨");

  openColorWheelModal("Pick your brand color", (hex) => {
    answers.brand = hex;
    addMessage(hex, false);
    step++;
    nextQuestion();
  });
}

async function askShadeType() {
  await showTyping("Do you want a monochrome palette or varied color palette?");
  addMessage("Do you want a monochrome palette or varied color palette?");

  openOptionModal("Select Shade Style", ["Monochrome", "Varied"], (choice) => {
    answers.shade = choice;
    addMessage(choice, false);
    step++;
    nextQuestion();
  });
}

async function askExcludeColor() {
  await showTyping("Pick a color to exclude (optional).");
  addMessage("Pick a color to exclude (optional).");

  openColorWheelModal("Pick a color to exclude", (hex) => {
    answers.exclude = hex;
    addMessage(hex, false);
    step++;
    nextQuestion();
  });
}

async function askPaletteSize() {
  await showTyping("How many colors should be in your final palette?");
  addMessage("How many colors should be in your final palette?");

  openOptionModal("Palette Size", ["3", "4", "5", "6", "7", "8"], (choice) => {
    answers.count = Number(choice);
    addMessage(`${choice} colors`, false);
    step++;
    nextQuestion();
  });
}

/* ==========================================================
   FINAL PALETTE GENERATION
========================================================== */
async function generateFinalPalette() {
  await showTyping("Creating your perfect palette… 🎨");
  addMessage("Creating your perfect palette… 🎨");

  await delay(900);

  const paletteArr = generatePalette(
    answers.brand,
    answers.shade,
    answers.exclude || null,
    answers.count || 4
  );

  setPaletteHtml(paletteArr);
  openPaletteModal();
}

/* ==========================================================
   MAIN FLOW / SEQUENCER
========================================================== */
function nextQuestion() {
  if (step === 0) return askBrandColor();
  if (step === 1) return askShadeType();

  if (step === 2 && answers.shade === "Varied") return askExcludeColor();
  if (step === 2 && answers.shade === "Monochrome") return askPaletteSize();

  if (step === 3 && answers.shade === "Varied") return askPaletteSize();

  return generateFinalPalette();
}

/* ==========================================================
   PUBLIC INIT (with 3 sec UI intro delay)
========================================================== */
export function initChatbot() {
  step = 0;
  answers = {};

  chatMessages.innerHTML = "";
  typing.style.display = "none";

  addMessage("👋 Hi! I'm HueBot — your personal palette designer.");

  // Wait 3 seconds before starting first question
  delay(3000).then(() => nextQuestion());
}