// Renders the home-page pitch cards from CARDS (see pitch_cards.js) as a
// carousel. No self-advancing: prev/next buttons and the left/right arrow
// keys are the only things that move it.
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    if (!track || typeof CARDS === 'undefined') return;

    for (const [eyebrow, problem, solution] of CARDS) {
        const card = document.createElement('article');
        card.className = 'card';

        const e = document.createElement('p');
        e.className = 'eyebrow';
        e.textContent = eyebrow;

        const p = document.createElement('p');
        p.className = 'problem';
        p.textContent = problem;

        const s = document.createElement('p');
        s.className = 'solution';
        s.textContent = solution;

        card.append(e, p, s);
        card.addEventListener('click', () => go(1));
        track.appendChild(card);
    }

    const prev   = document.getElementById('carousel-prev');
    const next   = document.getElementById('carousel-next');
    const status = document.getElementById('carousel-status');
    const dotBox = document.getElementById('carousel-dots');
    const count  = CARDS.length;
    let index = 0;

    const dots = [];
    if (dotBox) {
        for (let n = 0; n < count; n++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Go to card ${n + 1}`);
            dot.addEventListener('click', () => { index = n; render(); });
            dotBox.appendChild(dot);
            dots.push(dot);
        }
    }

    function render() {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, n) => dot.classList.toggle('active', n === index));
        if (status) status.textContent = `Card ${index + 1} of ${count}`;
    }

    function go(delta) {
        index = (index + delta + count) % count;
        render();
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    document.addEventListener('keydown', (ev) => {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
        const tag = (ev.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || ev.target.isContentEditable) return;
        if (ev.key === 'ArrowLeft') go(-1);
        else if (ev.key === 'ArrowRight') go(1);
    });

    render();
});
