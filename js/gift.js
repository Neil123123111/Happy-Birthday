"use strict";

const openGift = document.querySelector("#open-gift");
const destination = new URL(openGift.getAttribute("href"), window.location.href);
destination.search = window.location.search;
openGift.href = destination.href;

let opening = false;
openGift.addEventListener("click", event => {
    if (opening || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    opening = true;
    document.body.classList.add("is-opening");
    window.setTimeout(() => window.location.assign(openGift.href), 720);
});