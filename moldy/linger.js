let hideTimeout;
let timeoutDuration = 3000; // 3 seconds

const infoButton = document.querySelector('.info-button');
const attribution = document.querySelector('.attribution');

infoButton.addEventListener('mouseenter', function() {
    clearTimeout(hideTimeout);
    attribution.classList.add('show');
});

infoButton.addEventListener('mouseleave', function() {
    hideTimeout = setTimeout(function() {
        attribution.classList.remove('show');
    }, timeoutDuration);
});

