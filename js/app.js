"use strict";

const ALBUM_PHOTOS = [
    "albums/21E64A11-B50E-498D-97AE-5461C3F92CBB_1_100_o.jpeg",
    "albums/5298BBD5-A05E-4446-B46D-77AC67271BB0_1_105_c.jpeg",
    "albums/6C6DC970-F5BA-4353-BC11-84B545D1DE4B_1_105_c.jpeg",
    "albums/9ABF176E-EE2B-4C91-9B06-1E4799E99240_1_105_c.jpeg",
    "albums/B2F90E0E-A2E4-4026-9EE8-0A4A879342B2_1_105_c.jpeg",
    "albums/B4F4D93C-C96B-4278-9408-5D8FA80C2E1F_1_105_c.jpeg",
    "albums/B8645B31-AAA6-4578-A000-12911B83BA50_1_105_c.jpeg",
    "albums/DFA18AE7-7574-4308-A9B0-D03B83592337_1_105_c.jpeg"
];
const THEMES = new Set(["rose", "citrus", "mint", "berry"]);
const SLIDE_MESSAGES = [
    "Một ngày bình yên cạnh Em cũng đủ thành chuyến đi thật đẹp.",
    "Anh thích ngắm Em thật tự nhiên như thế này.",
    "Có Em bên cạnh, mọi khoảnh khắc đều đáng nhớ.",
    "Anh muốn đi cùng Em qua thật nhiều ngày nữa.",
    "Mỗi nụ cười của Em là điều Anh muốn giữ lại.",
    "Anh cảm ơn Em vì những điều dịu dàng như bó hoa này.",
    "Một góc nhỏ, một ngày đẹp, và người Anh thương.",
    "Chúc Em tuổi mới luôn rạng rỡ, vui theo cách của Em."
];
const FINAL_GIFT_VIDEO = "Video/YTSave.to_YouTube_Media_yogjiBNWcH8_Happy-birthday-phong-cách-anh-da-đen_001_360p.mp4";
const FINAL_GIFT_AUDIO = "Audio/Happy birthday phong cách anh da đen - (320 Kbps).mp3";

const elements = {
    recipient: document.querySelector("#recipient"),
    sender: document.querySelector("#sender"),
    message: document.querySelector("#message"),
    photoFrame: document.querySelector("#photo-frame"),
    portrait: document.querySelector("#portrait"),
    portraitTrigger: document.querySelector("#portrait-trigger"),
    photoCaption: document.querySelector("#photo-caption"),
    albumControls: document.querySelector("#album-controls"),
    slideCount: document.querySelector("#slide-count"),
    slidePrevious: document.querySelector("#slide-previous"),
    slideNext: document.querySelector("#slide-next"),
    audio: document.querySelector("#birthday-audio"),
    imageViewer: document.querySelector("#image-viewer"),
    imageViewerPhoto: document.querySelector("#image-viewer-photo"),
    heartLayer: document.querySelector("#heart-layer"),
    finalGift: document.querySelector("#final-gift"),
    openVideoGift: document.querySelector("#open-video-gift"),
    videoDialog: document.querySelector("#video-dialog"),
    giftVideo: document.querySelector("#gift-video"),
    giftAudio: document.querySelector("#gift-audio")
};

let state = readInitialState();
let currentSlideIndex = 0;
const visitedSlideIndexes = new Set([0]);
let resumeBackgroundMusic = false;
let backgroundMusicTime = 0;

function cleanText(value, fallback, limit) {
    if (typeof value !== "string") return fallback;
    const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit);
    return cleaned || fallback;
}

function readInitialState() {
    const params = new URLSearchParams(window.location.search);
    const slides = ALBUM_PHOTOS.map((photo, index) => ({ photo, message: SLIDE_MESSAGES[index] }));

    return {
        recipient: cleanText(params.get("to") ?? params.get("name"), "Em", 40),
        sender: cleanText(params.get("from"), "Anh", 40),
        theme: THEMES.has(params.get("theme")) ? params.get("theme") : "rose",
        slides
    };
}

function renderCard(direction = 0) {
    const slide = state.slides[currentSlideIndex] || null;
    elements.recipient.textContent = state.recipient;
    elements.sender.textContent = state.sender;
    elements.message.textContent = slide ? slide.message : state.message;
    document.body.dataset.theme = state.theme;
    elements.portraitTrigger.hidden = !slide;
    elements.albumControls.hidden = state.slides.length < 2;
    elements.finalGift.hidden = currentSlideIndex !== state.slides.length - 1 || visitedSlideIndexes.size < state.slides.length;
    elements.slideCount.textContent = state.slides.length
        ? `${String(currentSlideIndex + 1).padStart(2, "0")} / ${String(state.slides.length).padStart(2, "0")}`
        : "01 / 01";
    elements.photoCaption.textContent = slide
        ? `KỶ NIỆM ${String(currentSlideIndex + 1).padStart(2, "0")} · ${state.recipient}`
        : "NGÀY ĐẸP NHẤT LÀ NGÀY CÓ EM";
    if (slide) {
        elements.portrait.src = slide.photo;
        elements.portrait.alt = `Kỷ niệm ${currentSlideIndex + 1} của ${state.recipient}`;
    }
    else elements.portrait.removeAttribute("src");

    if (direction && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const transitionClass = direction > 0 ? "slide-enter-next" : "slide-enter-previous";
        elements.photoFrame.classList.remove("slide-enter-next", "slide-enter-previous");
        elements.message.classList.remove("slide-enter-next", "slide-enter-previous");
        void elements.photoFrame.offsetWidth;
        elements.photoFrame.classList.add(transitionClass);
        elements.message.classList.add(transitionClass);
        window.setTimeout(() => {
            elements.photoFrame.classList.remove(transitionClass);
            elements.message.classList.remove(transitionClass);
        }, 500);
    }
}

function changeSlide(direction) {
    if (state.slides.length < 2) return;
    currentSlideIndex = (currentSlideIndex + direction + state.slides.length) % state.slides.length;
    visitedSlideIndexes.add(currentSlideIndex);
    renderCard(direction);
    if (currentSlideIndex === state.slides.length - 1 && visitedSlideIndexes.size === state.slides.length) {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        elements.finalGift.scrollIntoView({ behavior, block: "center" });
    }
}

function startMusic() {
    if (!elements.audio.paused) return;
    elements.audio.play().catch(() => {});
}

function sendHearts() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hearts = document.createDocumentFragment();
    const symbols = ["♥", "♡", "❤"];
    for (let index = 0; index < 18; index += 1) {
        const heart = document.createElement("span");
        heart.className = "heart-particle";
        heart.textContent = symbols[index % symbols.length];
        heart.style.setProperty("--heart-left", `${Math.random() * 100}%`);
        heart.style.setProperty("--heart-size", `${18 + Math.random() * 24}px`);
        heart.style.setProperty("--heart-rise", `${-130 - Math.random() * 150}px`);
        heart.style.setProperty("--heart-drift", `${Math.round((Math.random() - 0.5) * 120)}px`);
        heart.style.setProperty("--heart-delay", `${Math.random() * 0.45}s`);
        heart.style.setProperty("--heart-duration", `${1.2 + Math.random() * 0.8}s`);
        heart.style.setProperty("--heart-turn", `${Math.round(Math.random() * 70 - 35)}deg`);
        hearts.append(heart);
    }
    elements.heartLayer.replaceChildren(hearts);
    window.setTimeout(() => elements.heartLayer.replaceChildren(), 2400);
}

function openImageViewer(image) {
    const source = image.currentSrc || image.src;
    if (!source) return;
    elements.imageViewerPhoto.src = source;
    elements.imageViewerPhoto.alt = image.alt;
    elements.imageViewer.showModal();
    startMusic();
    sendHearts();
}

function openVideoGift() {
    if (visitedSlideIndexes.size < state.slides.length || currentSlideIndex !== state.slides.length - 1) return;
    resumeBackgroundMusic = !elements.audio.paused;
    backgroundMusicTime = elements.audio.currentTime;
    elements.audio.pause();
    elements.giftVideo.muted = true;
    elements.videoDialog.showModal();
    elements.giftVideo.src = FINAL_GIFT_VIDEO;
    elements.giftAudio.src = FINAL_GIFT_AUDIO;
    elements.giftVideo.load();
    elements.giftAudio.load();
    elements.giftAudio.play().catch(() => {
        elements.giftVideo.muted = false;
    });
    elements.giftVideo.play().catch(continueToFinalQr);
}

function stopVideoGift() {
    elements.giftVideo.pause();
    elements.giftVideo.removeAttribute("src");
    elements.giftVideo.load();
    elements.giftAudio.pause();
    elements.giftAudio.removeAttribute("src");
    elements.giftAudio.load();
}

function continueToFinalQr() {
    const destination = new URL("qr.html", window.location.href);
    if (resumeBackgroundMusic) {
        destination.searchParams.set("resumeMusic", "1");
        destination.searchParams.set("musicTime", String(backgroundMusicTime));
    }
    stopVideoGift();
    window.location.assign(destination.href);
}

elements.slidePrevious.addEventListener("click", () => changeSlide(-1));
elements.slideNext.addEventListener("click", () => changeSlide(1));
elements.portraitTrigger.addEventListener("click", () => openImageViewer(elements.portrait));
document.querySelector("#close-image-viewer").addEventListener("click", () => elements.imageViewer.close());
elements.imageViewer.addEventListener("click", event => {
    if (event.target === elements.imageViewer) elements.imageViewer.close();
});
elements.imageViewer.addEventListener("close", () => elements.heartLayer.replaceChildren());
elements.openVideoGift.addEventListener("click", openVideoGift);
elements.videoDialog.addEventListener("cancel", event => event.preventDefault());
elements.giftVideo.addEventListener("ended", continueToFinalQr);
elements.giftVideo.addEventListener("error", () => {
    if (elements.videoDialog.open) continueToFinalQr();
});
document.addEventListener("keydown", event => {
    if (elements.imageViewer.open || elements.videoDialog.open || event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    if (event.key === "ArrowRight") changeSlide(1);
    if (event.key === "ArrowLeft") changeSlide(-1);
});

renderCard();
startMusic();

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.add("page-opening");
}