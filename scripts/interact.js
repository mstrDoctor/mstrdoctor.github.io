const API_URL = "https://modix-server.fly.dev";

// === Основная инициализация ===
window.addEventListener("load", () => {
    const fileId = getFileIdFromURL();
    console.log("File ID после загрузки страницы:", fileId);
    initializeNameField(fileId);
    setupNameFieldListeners(fileId);
    toggleSubmitButton(fileId);
    renderComments(fileId);
    updateStats(fileId);
});

// === Получение fileId из URL
function getFileIdFromURL() {
    const url = window.location.pathname;
    const fileId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.html'));
    return (fileId || '').toLowerCase();
}

// === Инициализация имени
function initializeNameField(fileId) {
    const nameField = document.getElementById("name-" + fileId);
    if (!nameField) return;
    const savedName = loadNameFromLocalStorage();
    nameField.value = savedName;
    toggleSubmitButton(fileId);
}

function loadNameFromLocalStorage() {
    try {
        return localStorage.getItem("username") || '';
    } catch {
        return '';
    }
}

function saveNameToLocalStorage(name) {
    try {
        localStorage.setItem("username", name);
    } catch (e) {
        console.error("Ошибка при сохранении в localStorage:", e);
    }
}

// === Обработчики
function setupNameFieldListeners(fileId) {
    const nameField = document.getElementById("name-" + fileId);
    const textField = document.getElementById("text-" + fileId);

    if (nameField) {
        nameField.addEventListener("input", () => {
            saveNameToLocalStorage(nameField.value);
            toggleSubmitButton(fileId);
        });
    }
    if (textField) {
        textField.addEventListener("input", () => {
            toggleSubmitButton(fileId);
        });
    }
}

// === Кнопка отправки
function toggleSubmitButton(fileId) {
    const name = document.getElementById("name-" + fileId)?.value.trim();
    const text = document.getElementById("text-" + fileId)?.value.trim();
    const submitButton = document.getElementById("submit-button-" + fileId);
    if (submitButton) {
        submitButton.disabled = !(name && text);
    }
}

// === Отправка комментария
function addComment(fileId, nameFieldId, textFieldId) {
    const name = document.getElementById(nameFieldId)?.value.trim();
    const text = document.getElementById(textFieldId)?.value.trim();
    if (!name || !text) return alert("Введите имя и комментарий");

    fetch(`${API_URL}/comments/${fileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text })
    })
    .then(response => response.json())
    .then(() => {
        alert("Комментарий отправлен! ✅");
        renderComments(fileId);
        document.getElementById(textFieldId).value = "";
        toggleSubmitButton(fileId);
    })
    .catch(err => alert("Ошибка при отправке комментария: " + err));
}

// === Отображение комментариев
function renderComments(fileId) {
    const container = document.getElementById("comments-" + fileId);
    if (!container) return;

    fetch(`${API_URL}/comments/${fileId}`)
        .then(res => res.json())
        .then(data => {
            const list = data || [];
            container.innerHTML = "";
            list.forEach(c => {
                const el = document.createElement("div");
                el.style = "border:1px solid #ccc;padding:8px;margin:5px 0;background:#f9f9f9;color:#000;border-radius:6px;";
                el.innerHTML = `<strong>${c.name}</strong><br><span>${c.text}</span>`;
                container.appendChild(el);
            });
            updateCommentCount(fileId, list.length);
        })
        .catch(err => console.error("Ошибка при загрузке комментариев:", err));
}

function updateCommentCount(fileId, count) {
    const el = document.getElementById("comment-count-" + fileId);
    if (el) el.innerText = `Комментарии: ${count}`;
}

// === Статистика: лайки и загрузки
function updateStats(fileId) {
    fetch(`${API_URL}/stats/${fileId}`)
        .then(res => res.json())
        .then(data => {
            updateDownloadCount(fileId, data.downloads || 0);
            updateLikeCount(fileId, data.likes || 0);
        })
        .catch(err => console.error("Ошибка при загрузке статистики:", err));
}

function updateDownloadCount(fileId, count) {
    const el = document.getElementById("download-count-" + fileId);
    if (el) el.innerText = `(${count} загрузок)`;
}

function updateLikeCount(fileId, count) {
    const el = document.getElementById("like-count-" + fileId);
    if (el) el.innerText = `❤️ ${count} лайков`;
}

// === Лайк (реальный)
function likeFile(fileId) {
    if (localStorage.getItem("liked_" + fileId)) {
        alert("Вы уже поставили лайк ранее ✅");
        return;
    }

    fetch(`${API_URL}/like/${fileId}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            alert("Спасибо за лайк! ❤️");
            updateLikeCount(fileId, data.likes);
            localStorage.setItem("liked_" + fileId, "true");
        })
        .catch(err => alert("Ошибка при лайке: " + err));
}

// === Загрузка файла
function downloadFile(fileId, fileUrl) {
    window.open(fileUrl, '_blank');

    fetch(`${API_URL}/files/${fileId}`, { method: 'GET' })
        .then(() => {
            setTimeout(() => {
                updateStats(fileId);
            }, 500);
        })
        .catch(err => console.error("Ошибка при обновлении количества загрузок: " + err));
}
