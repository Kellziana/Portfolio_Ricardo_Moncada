// rotating text effect
let loopNum = 0;
let isDeleting = false;
const toRotate = ["Drawings", "Animations", "Motion Graphics"];
let text = "";
const period = 2000;
const delta = 300;
const rotatingText = document.getElementById('rotating-text');

function tick() {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];

    text = isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1);

    if (rotatingText) rotatingText.textContent = text;

    if (!isDeleting && text === fullText) {
        setTimeout(() => {
            isDeleting = true;
        }, period);
    } else if (isDeleting && text === "") {
        isDeleting = false;
        loopNum++;
    }

    setTimeout(tick, isDeleting ? delta / 2 : delta);
}

tick();


// fade-up effect
const faders = document.querySelectorAll('.fade-up');

const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});


// Google Sheets API URL
const SHEET_URL = 'https://api.sheetbest.com/sheets/a0ecc95e-1279-4023-9d69-3ef5f8bd83cf';


// gallery
function makeGalleryItem(row) {
    const item = document.createElement('div');
    const categoryClass = row.category.toLowerCase().replace(/\s+/g, '-');
    item.className = `gallery-item ${categoryClass}`;

    let mediaElement;

    if (row.image.match(/\.(mp4|webm)$/)) {
        mediaElement = document.createElement('video');
        mediaElement.src = row.image;
        mediaElement.controls = true;
        mediaElement.muted = true;
        mediaElement.loop = true;
        mediaElement.style.width = '100%';
        mediaElement.style.height = 'auto';
    } else {
        mediaElement = document.createElement('img');
        mediaElement.src = row.image;
        mediaElement.alt = row.title || 'Artwork';
        mediaElement.style.width = '100%';
        mediaElement.style.height = 'auto';
    }

    const title = document.createElement('p');
    title.textContent = row.title || '';

    item.appendChild(mediaElement);
    item.appendChild(title);

    return item;
}


// Load gallery from Google Sheet
async function loadGalleryFromSheet() {
    try {
        const res = await fetch(SHEET_URL);
        const data = await res.json();

        data.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));

        const galleryContainer = document.getElementById('gallery');
        galleryContainer.innerHTML = '';

        data.forEach(row => {
            const item = makeGalleryItem(row);
            galleryContainer.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load gallery:', err);
    }
}

loadGalleryFromSheet();

// categories

let firstLoad = true;

function filterGallery(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');

    buttons.forEach(btn => btn.classList.remove('active'));
    const activeButton = Array.from(buttons).find(btn =>
        btn.textContent.trim().toLowerCase() === category.toLowerCase()
    );
    if (activeButton) activeButton.classList.add('active');

    const allItems = document.querySelectorAll('.gallery-item');
    const filteredItems = [];

    allItems.forEach(item => {
        const show = category === 'All Work' || item.classList.contains(normalizedCategory);
        if (firstLoad) {
            item.style.display = show ? 'block' : 'none';
            item.classList.remove('hidden');
        } else {
            if (show) {
                item.style.display = 'block';
                item.classList.add('hidden'); 
                filteredItems.push(item);
            } else {
                item.style.display = 'none';
            }
        }
    });

    if (!firstLoad) {
        filteredItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.remove('hidden');
            }, index * 100);
        });
    }

    firstLoad = false;
}

document.addEventListener('DOMContentLoaded', () => filterGallery('All Work'));


// modals

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.getElementsByClassName("close")[0];
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    let currentIndex = 0;
    let items = []; 

    const modalVideo = document.createElement('video');
    modalVideo.id = "modalVideo";
    modalVideo.className = "modal-content";
    modalVideo.controls = true;
    modalVideo.style.display = "none";
    modal.appendChild(modalVideo);

    function updateItemsList() {
        items = Array.from(document.querySelectorAll("#gallery img, #gallery video"));
    }

    function showItem(index, direction = "right") {
    if (items.length === 0) return;

// magnify
    isZoomed = false;
    zoomBtn.style.color = "white";
    modalImg.style.transform = "scale(1)";
    modalVideo.style.transform = "scale(1) translate(0, 0)";

    const item = items[index];
    modalImg.style.display = "none";
    modalVideo.style.display = "none";
    modalVideo.pause();

    let elementToShow;
    if (item.tagName === "IMG") {
        modalImg.src = item.src;
        elementToShow = modalImg;
    } else if (item.tagName === "VIDEO") {
        modalVideo.src = item.src;
        elementToShow = modalVideo;
        modalVideo.play();
    }

    elementToShow.style.display = "block";
    elementToShow.classList.remove("active", "slide-left", "slide-right");
    void elementToShow.offsetWidth; // force reflow to restart animation
    elementToShow.classList.add(direction === "left" ? "slide-left" : "slide-right");

    setTimeout(() => {
        elementToShow.classList.add("active");
    }, 10);
}

    document.getElementById("gallery").addEventListener("click", function (e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            updateItemsList();
            currentIndex = items.indexOf(e.target);
            showItem(currentIndex);
            modal.style.display = "block";
        }
    });

// close modal
    function closeModal() {
        modal.style.display = "none";
        modalVideo.pause();

        isZoomed = false;
        zoomBtn.style.color = "white";
        modalImg.style.transform = "scale(1)";
        modalVideo.style.transform = "scale(1) translate(0, 0)";
    }
    closeBtn.onclick = closeModal;

    function showPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showItem(currentIndex, "left");
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % items.length;
        showItem(currentIndex, "right");
    }

    prevBtn.onclick = (e) => { e.stopPropagation(); showPrev(); };
    nextBtn.onclick = (e) => { e.stopPropagation(); showNext(); };

    modal.onclick = function (e) {
        if (e.target === modal) closeModal();
    };

// keyboard controls
    document.addEventListener("keydown", function (e) {
        if (modal.style.display === "block") {
            if (e.key === "ArrowLeft") {
                showPrev();
            } else if (e.key === "ArrowRight") {
                showNext();
            } else if (e.key === "Escape") {
                closeModal();
            }
        }
    });

    const zoomBtn = document.getElementById("zoomBtn");
    let isZoomed = false;

    zoomBtn.addEventListener("click", () => {
        const activeElement = modalImg.style.display === "block" ? modalImg : modalVideo;

        if (!isZoomed) {
            activeElement.style.transform = "scale(2)"; 
            isZoomed = true;
            zoomBtn.style.color = "#FFCA6B"; 
        } else {
            activeElement.style.transform = "scale(1)";
            isZoomed = false;
            zoomBtn.style.color = "white";
        }
    });




// swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    modal.addEventListener("touchend", function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                showPrev();
            } else {
                showNext();
            }
        }
    }

    });
