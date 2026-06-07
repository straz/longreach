/*
----- Coding Tutorial by Patt Vira -----
Name: Slime Molds (Physarum)
Video Tutorial: https://youtu.be/VyXxSNcgDtg

References:
1. Algorithm by Jeff Jones: https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/
let molds = [];
let num = 4000;
let d;

// Warm dark background — softer than pure black
const BG_R = 18, BG_G = 16, BG_B = 14;

const SHORT_TEXT = 'short-reach solutions: snap judgements with low attention to truth or consequences';
const LONG_TEXT  = 'long-reach solutions: slow thinking about problems with deep consequences';

const RAMP_MS    = 5000;  // brightness ramp duration
const FADE_START = 5000;  // when to start drawing bg behind LONG_TEXT

function isMobile()     { return windowWidth < 600; }
function subtitleSize() { return isMobile() ? 13 : 20; }
function leftMargin()   { return isMobile() ? 20 : 48; }
function topMargin()    { return isMobile() ? 60 : 120; }

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');
  angleMode(DEGREES);
  d = pixelDensity();
  background(BG_R, BG_G, BG_B);

  for (let i = 0; i < num; i++) {
    molds[i] = new Mold();
  }
}

function drawText() {
  const t = millis();
  const ramp = constrain(t / RAMP_MS, 0, 1);
  const brightness = lerp(128, 204, ramp);

  const lm = leftMargin();
  const tm = topMargin();
  const ss = subtitleSize();

  noStroke();
  textFont('Roboto Slab');
  textSize(ss);
  textAlign(LEFT, TOP);

  function splitAtWith(s) {
    const i = s.indexOf(' with ');
    return i >= 0 ? [s.slice(0, i), s.slice(i + 1)] : [s];
  }

  const mobile = isMobile();
  const shortLines = mobile ? splitAtWith(SHORT_TEXT) : [SHORT_TEXT];
  const longLines  = mobile ? splitAtWith(LONG_TEXT)  : [LONG_TEXT];
  const lineH = ss * 1.35;
  const longY = tm + shortLines.length * lineH * 1.2;

  // LONG_TEXT background fade (keeps it readable as mold grows)
  if (t >= FADE_START) {
    const fadeAlpha = constrain((t - FADE_START) / 2000, 0, 1) * 160;
    fill(BG_R, BG_G, BG_B, fadeAlpha);
    const tw = Math.max(...longLines.map(l => textWidth(l)));
    rect(lm - 6, longY - 4, tw + 12, longLines.length * lineH + 4);
  }

  // SHORT_TEXT (mold will gradually cover this)
  fill(brightness * 0.75);
  shortLines.forEach((line, i) => text(line, lm, tm + i * lineH));

  // LONG_TEXT (redrawn each frame to stay on top of mold)
  fill(brightness);
  longLines.forEach((line, i) => text(line, lm, longY + i * lineH));
}

function draw() {
  background(BG_R, BG_G, BG_B, 6);
  loadPixels();

  for (let i = 0; i < num; i++) {
    molds[i].update();
    molds[i].display();
  }

  drawText();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(BG_R, BG_G, BG_B);
}
