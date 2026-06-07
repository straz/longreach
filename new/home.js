// ── Text animation ──────────────────────────────────────────────────────────

const TEXT_DURATION  = 10000;  // ms: full rise-hold-fade lifecycle
const NEXT_OFFSET    =  8000;  // ms: start next at end of brown hold; new text rises (2000ms) as old fades out

function startTextAnimation() {
    if (!TEXTS || !TEXTS.length) return;
    let i = 0;
    let nextTimer = null;
    let currentEl = null;

    function dismissCurrent() {
        if (!currentEl) return;
        const el = currentEl;
        el.style.pointerEvents = 'none';
        const computed = getComputedStyle(el);
        const currentColor = computed.color;
        const currentBottom = computed.bottom;
        el.style.animation = 'none';
        el.style.bottom = currentBottom;
        el.style.color = currentColor;
        el.style.transition = 'color 300ms ease-out';
        requestAnimationFrame(() => { el.style.color = 'rgba(92,51,23,0)'; });
        setTimeout(() => el.remove(), 320);
        currentEl = null;
    }

    function skip() {
        dismissCurrent();
        clearTimeout(nextTimer);
        i = (i + 1) % TEXTS.length;
        next();
    }

    function next() {
        const el = document.createElement('p');
        el.className = 'float-text';
        el.innerHTML = marked.parseInline(TEXTS[i]);
        document.getElementById('text-overlay').appendChild(el);
        el.addEventListener('animationend', () => el.remove(), { once: true });
        el.addEventListener('click', skip, { once: true });
        currentEl = el;

        i = (i + 1) % TEXTS.length;
        nextTimer = setTimeout(next, NEXT_OFFSET);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
            e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            skip();
        }
    });

    setTimeout(next, 600);
}

// ── Cellular automata ───────────────────────────────────────────────────────

const HEX_R     = 3;
const HEX_W     = Math.sqrt(3) * HEX_R;
const HEX_ROW_H = 1.5 * HEX_R;
const DRAW_R    = HEX_R - 0.5;
const STATES    = 5;
const COLORS       = ['#2e2e2e', '#5c3317', '#90c060', '#2d6e2d', '#c8a060'];
const birthRules   = [false, false, true, true, false, false, false];
const surviveRules = [false, false, true, true, true,  false, false];

const HEX_CORNERS = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (Math.PI / 3) * i;
    return [DRAW_R * Math.cos(a), DRAW_R * Math.sin(a)];
});

const HEX_NEIGHBORS = [
    [[-1,0],[1,0],[-1,-1],[0,-1],[-1,1],[0,1]],
    [[-1,0],[1,0],[0,-1],[1,-1],[0,1],[1,1]],
];

let W, H, COLS, ROWS, grid, nextGrid, age, topVisible = false;

const canvases = [document.getElementById('caCanvas0'), document.getElementById('caCanvas1')];
const ctxs     = canvases.map(c => c.getContext('2d'));
const canvas1  = canvases[1];

function caH() { return Math.floor(window.innerHeight * 0.15); }

function countAliveNeighbors(col, row) {
    const offsets = HEX_NEIGHBORS[row & 1];
    let count = 0;
    for (const [dc, dr] of offsets)
        if (grid[((col + dc) + COLS) % COLS][((row + dr) + ROWS) % ROWS] === 1) count++;
    return count;
}

function update() {
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
            const state = grid[col][row], currentAge = age[col][row];
            let next;
            if (state === 0)      next = birthRules[countAliveNeighbors(col, row)] ? 1 : 0;
            else if (state === 1) next = surviveRules[countAliveNeighbors(col, row)] ? 1 : 2;
            else                  { const n = state + 1; next = n >= STATES ? 1 : n; }
            if (state === 2 && currentAge < 10 && next !== 2) next = 2;
            if (state === 3 && currentAge < 15 && next !== 3) next = 3;
            if (Math.random() < 0.02) { next = 0; age[col][row] = 0; }
            else age[col][row] = next === state ? currentAge + 1 : 0;
            nextGrid[col][row] = next;
        }
    }
    [grid, nextGrid] = [nextGrid, grid];
}

function drawTo(ctx) {
    ctx.fillStyle = COLORS[0];
    ctx.fillRect(0, 0, W, H);
    for (let s = 1; s < STATES; s++) {
        ctx.beginPath();
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (grid[col][row] !== s) continue;
                const cx = (col + 0.5) * HEX_W + (row & 1 ? HEX_W / 2 : 0);
                const cy = HEX_R + row * HEX_ROW_H;
                ctx.moveTo(cx + HEX_CORNERS[0][0], cy + HEX_CORNERS[0][1]);
                for (let i = 1; i < 6; i++) ctx.lineTo(cx + HEX_CORNERS[i][0], cy + HEX_CORNERS[i][1]);
                ctx.closePath();
            }
        }
        ctx.fillStyle = COLORS[s];
        ctx.fill();
    }
}

function swapCanvases() {
    if (topVisible) {
        drawTo(ctxs[0]);
        canvas1.classList.remove('active');
        topVisible = false;
    } else {
        drawTo(ctxs[1]);
        canvas1.classList.add('active');
        topVisible = true;
    }
}

function loop() {
    update();
    swapCanvases();
    setTimeout(() => requestAnimationFrame(loop), 800);
}

function handleResize() {
    const h = caH();
    canvases.forEach(c => { c.width = window.innerWidth; c.height = h; });
    W    = canvases[0].width;
    H    = h;
    COLS = Math.floor((W - HEX_W / 2) / HEX_W);
    ROWS = Math.floor((H - HEX_R) / HEX_ROW_H);
    grid     = Array.from({ length: COLS }, () => new Array(ROWS).fill(0));
    nextGrid = Array.from({ length: COLS }, () => new Array(ROWS).fill(0));
    age      = Array.from({ length: COLS }, () => new Array(ROWS).fill(0));
    for (let col = 0; col < COLS; col++)
        for (let row = 0; row < ROWS; row++)
            grid[col][row] = Math.random() < 0.18 ? 1 : 0;
    canvas1.classList.remove('active');
    topVisible = false;
    drawTo(ctxs[0]);
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
});

document.addEventListener('DOMContentLoaded', () => {
    handleResize();
    loop();
    startTextAnimation();
});
