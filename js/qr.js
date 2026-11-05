"use strict";

const params = new URLSearchParams(window.location.search);
const shouldResumeMusic = params.get("resumeMusic") === "1";
const audio = document.querySelector("#qr-audio");
const audioFallback = document.querySelector("#qr-resume-audio");

if (shouldResumeMusic) {
    const requestedTime = Number(params.get("musicTime"));
    audio.src = "music.mp3";
    audio.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(requestedTime) && Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(Math.max(0, requestedTime), Math.max(0, audio.duration - 0.1));
        }
        audio.play().catch(() => {
            audioFallback.hidden = false;
        });
    }, { once: true });
    audio.addEventListener("error", () => {
        audioFallback.hidden = false;
    }, { once: true });
    audio.load();
}