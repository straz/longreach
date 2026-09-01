// Card carousel controller. Card content is server-rendered from content/*.yml
// via _includes/carousel.html; this only wires up navigation. No auto-advance:
// the prev/next buttons, the dots, the left/right arrow keys, and clicking a
// card are the only things that move it. Works for any number of .carousel
// elements on a page.

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".carousel").forEach(setupCarousel);
});

function setupCarousel(root) {
    var track = root.querySelector(".carousel-track");
    var cards = track ? Array.prototype.slice.call(track.children) : [];
    var count = cards.length;
    if (!count) return;

    var prev = root.querySelector(".carousel-prev");
    var next = root.querySelector(".carousel-next");
    var dotBox = root.querySelector(".carousel-dots");
    var statusEl = root.querySelector(".carousel-status");
    var index = 0;
    var dots = [];

    if (dotBox) {
        for (var n = 0; n < count; n++) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", "Go to card " + (n + 1));
            dot.addEventListener("click", (function (i) {
                return function () { index = i; render(); };
            })(n));
            dotBox.appendChild(dot);
            dots.push(dot);
        }
    }

    function render() {
        track.style.transform = "translateX(-" + (index * 100) + "%)";
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle("active", i === index);
        }
        if (statusEl) statusEl.textContent = "Card " + (index + 1) + " of " + count;
    }

    function go(delta) {
        index = (index + delta + count) % count;
        render();
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    cards.forEach(function (card) {
        card.addEventListener("click", function () { go(1); });
    });

    document.addEventListener("keydown", function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
        if (e.key === "ArrowLeft") go(-1);
        else if (e.key === "ArrowRight") go(1);
    });

    render();
}
