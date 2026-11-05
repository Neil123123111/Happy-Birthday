"use strict";

const STORAGE_KEY = "little-birthday-card-v1";
const THEMES = new Set(["rose", "citrus", "mint", "berry"]);
const DEFAULTS = {
    recipient: "Người thương",
    sender: "Người luôn thương cậu",
    message: "Chúc cậu một tuổi mới thật dịu dàng, nhiều tiếng cười và những điều cậu yêu.",
    theme: "rose",
    photo: ""
};

const elements = {
    dialog: document.querySelector("#editor-dialog"),
    form: document.querySelector("#editor-form"),
    recipient: document.querySelector("#recipient"),
    sender: document.querySelector("#sender"),
    message: document.querySelector("#message"),
    portrait: document.querySelector("#portrait"),
    photoPlaceholder: document.querySelector("#photo-trigger"),
    photoInput: document.querySelector("#photo-input"),
    photoPreview: document.querySelector("#editor-photo-preview"),
    photoNote: document.querySelector("#photo-note"),
    removePhoto: document.querySelector("#remove-photo"),
    toast: document.querySelector("#toast")
};

let state = readInitialState();
let draftPhoto;
let toastTimer;

function cleanText(value, fallback, limit) {
    if (typeof value !== "string") return fallback;
    const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit);
    return cleaned || fallback;
}

function readStoredState() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
    } catch {
        return {};
    }
}

function readInitialState() {
    const stored = readStoredState();
    const params = new URLSearchParams(window.location.search);
    const fromUrl = (key, alias) => params.get(key) ?? (alias ? params.get(alias) : null);
    const theme = fromUrl("theme") ?? stored.theme;
    const photo = typeof stored.photo === "string" && stored.photo.length <= 900000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(stored.photo)
        ? stored.photo
        : "";

    return {
        recipient: cleanText(fromUrl("to", "name") ?? stored.recipient, DEFAULTS.recipient, 40),
        sender: cleanText(fromUrl("from") ?? stored.sender, DEFAULTS.sender, 40),
        message: cleanText(fromUrl("message") ?? stored.message, DEFAULTS.message, 240),
        theme: THEMES.has(theme) ? theme : DEFAULTS.theme,
        photo
    };
}

function renderCard() {
    elements.recipient.textContent = state.recipient;
    elements.sender.textContent = state.sender;
    elements.message.textContent = state.message;
    document.body.dataset.theme = state.theme;
    elements.portrait.hidden = !state.photo;
    elements.photoPlaceholder.hidden = Boolean(state.photo);
    if (state.photo) elements.portrait.src = state.photo;
    else elements.portrait.removeAttribute("src");
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3000);
}

function openEditor() {
    elements.form.elements.recipient.value = state.recipient;
    elements.form.elements.sender.value = state.sender;
    elements.form.elements.message.value = state.message;
    elements.form.querySelector(`input[name="theme"][value="${state.theme}"]`).checked = true;
    draftPhoto = undefined;
    elements.photoNote.textContent = "Ảnh được thu nhỏ và lưu trên thiết bị này.";
    updatePhotoTools(state.photo);
    elements.photoInput.value = "";
    elements.dialog.showModal();
    elements.form.elements.recipient.focus();
}

function updatePhotoTools(photo) {
    elements.photoPreview.hidden = !photo;
    elements.photoPreview.src = photo || "";
    elements.removePhoto.hidden = !photo;
}

function dataUrlFromBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Không đọc được ảnh này."));
        reader.readAsDataURL(blob);
    });
}

async function compressPhoto(file) {
    const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!supportedTypes.has(file.type)) throw new Error("Hãy chọn ảnh JPG, PNG hoặc WebP.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Ảnh cần nhỏ hơn 8 MB.");
    if (typeof createImageBitmap !== "function") throw new Error("Trình duyệt này chưa hỗ trợ xử lý ảnh.");

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
        bitmap.close();
        throw new Error("Không thể xử lý ảnh trên thiết bị này.");
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob) throw new Error("Không thể chuyển đổi ảnh này.");
    const dataUrl = await dataUrlFromBlob(blob);
    if (typeof dataUrl !== "string" || dataUrl.length > 850000) {
        throw new Error("Ảnh sau khi nén vẫn quá lớn, hãy thử ảnh khác.");
    }
    return dataUrl;
}

function shareUrl() {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("to", state.recipient);
    url.searchParams.set("from", state.sender);
    url.searchParams.set("message", state.message);
    url.searchParams.set("theme", state.theme);
    return url.toString();
}

async function shareCard() {
    const url = shareUrl();
    const text = `${state.recipient}, ${state.message} — ${state.sender}`;
    try {
        if (navigator.share) {
            await navigator.share({ title: "Một tấm thiệp nhỏ", text, url });
            return;
        }
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
        } else {
            const temporaryInput = document.createElement("textarea");
            temporaryInput.value = url;
            temporaryInput.setAttribute("readonly", "");
            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";
            document.body.append(temporaryInput);
            temporaryInput.select();
            const copied = document.execCommand("copy");
            temporaryInput.remove();
            if (!copied) throw new Error("Clipboard unavailable");
        }
        showToast("Đã chép liên kết thiệp. Ảnh chỉ lưu trên thiết bị của bạn.");
    } catch (error) {
        if (error.name !== "AbortError") showToast("Không thể chia sẻ lúc này. Hãy thử lại nhé.");
    }
}

document.querySelectorAll('[data-action="edit"]').forEach(button => button.addEventListener("click", openEditor));
document.querySelectorAll('[data-action="share"]').forEach(button => button.addEventListener("click", shareCard));
elements.photoPlaceholder.addEventListener("click", openEditor);
document.querySelector("#close-editor").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancel-editor").addEventListener("click", () => elements.dialog.close());

elements.removePhoto.addEventListener("click", () => {
    draftPhoto = "";
    elements.photoInput.value = "";
    updatePhotoTools("");
    elements.photoNote.textContent = "Ảnh sẽ được gỡ khi bạn lưu thiệp.";
});

elements.photoInput.addEventListener("change", async event => {
    const [file] = event.target.files;
    if (!file) return;
    elements.photoNote.textContent = "Đang thu nhỏ ảnh trên thiết bị…";
    try {
        draftPhoto = await compressPhoto(file);
        updatePhotoTools(draftPhoto);
        elements.photoNote.textContent = "Ảnh đã sẵn sàng và chỉ lưu trên thiết bị này.";
    } catch (error) {
        elements.photoNote.textContent = error.message;
        elements.photoInput.value = "";
    }
});

elements.form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const selectedTheme = formData.get("theme");
    const nextState = {
        recipient: cleanText(formData.get("recipient"), DEFAULTS.recipient, 40),
        sender: cleanText(formData.get("sender"), DEFAULTS.sender, 40),
        message: cleanText(formData.get("message"), DEFAULTS.message, 240),
        theme: THEMES.has(selectedTheme) ? selectedTheme : DEFAULTS.theme,
        photo: draftPhoto === undefined ? state.photo : draftPhoto
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
        showToast("Không lưu được. Hãy thử gỡ ảnh hoặc chọn ảnh nhỏ hơn.");
        return;
    }
    state = nextState;
    renderCard();
    elements.dialog.close();
    showToast("Đã lưu tấm thiệp trên thiết bị này.");
});

renderCard();