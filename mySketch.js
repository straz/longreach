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

let molds = []; let num = 4000;
let d; 
let LONG_TEXT = 'long-reach problems: slow thinking about problems with deep consequences';
let left_margin = 48;
let top_margin = 48;
let startTime;
let rampDuration = 5000; // 5 seconds in milliseconds


function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');
  angleMode(DEGREES);
  d = pixelDensity();
  
  // Set black background first
  background(0);
  
  // Initialize start time for brightness ramp
  startTime = millis();
 
  for (let i=0; i<num; i++) {
    molds[i] = new Mold();
  }
 describe(LONG_TEXT, LABEL); 
}

function draw() {
  background(0, 5);
  loadPixels();
  
  for (let i=0; i<num; i++) {
    molds[i].update();
    molds[i].display();
  }
  
  // Calculate brightness based on elapsed time
  let elapsedTime = millis() - startTime;
  let progress = min(elapsedTime / rampDuration, 1.0); // Clamp between 0 and 1
  let brightness = lerp(128, 204, progress); // Interpolate from 50% (128) to 80% (204) gray
  
  // Redraw the title text to keep it visible
  textFont('Helvetica');
  textSize(48);
  fill(brightness);
  textAlign(LEFT, TOP);
  text('Long reach', left_margin, top_margin);
  
  // Redraw the subtitle text to keep it visible
  let sub1_top = top_margin + 90;
  let sub2_top = sub1_top + 60;
  textSize(24);
  fill(brightness);
  textAlign(LEFT, TOP);
  text('short-reach problems: snap judgement based on quick feedback', left_margin, sub1_top);
  text(LONG_TEXT, left_margin, sub2_top);
}