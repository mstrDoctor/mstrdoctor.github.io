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

// === Получение fileId из URL ===
function getFileIdFromURL() {
    const url = window.location.pathname;
    const fileId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.html'));
    return (fileId || '').toLowerCase();
}

// === Инициализация имени ===
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

// === Отображение комментариев
function renderComments(fileId) {
    const container = document.getElementById("comments-" + fileId);
    if (!container) return;

    fetch("data/comments.json")
        .then(res => res.json())
        .then(data => {
            const comments = data[fileId] || [];
            container.innerHTML = "";
            comments.forEach(c => {
                const el = document.createElement("div");
                el.style = "border:1px solid #ccc;padding:8px;margin:5px 0;background:#f9f9f9;color:#000;border-radius:6px;";
                el.innerHTML = `<strong>${c.name}</strong><br><span>${c.text}</span>`;
                container.appendChild(el);
            });
            updateCommentCount(fileId, comments.length);
        })
        .catch(err => console.error("Ошибка при загрузке комментариев:", err));
}

function updateCommentCount(fileId, count) {
    const el = document.getElementById("comment-count-" + fileId);
    if (el) el.innerText = `Комментарии: ${count}`;
}

// === Статистика: лайки и загрузки
function updateStats(fileId) {
    fetch("data/stats.json")
        .then(res => res.json())
        .then(data => {
            const stats = data[fileId] || { downloads: 0, likes: 0 };
            updateDownloadCount(fileId, stats.downloads);
            updateLikeCount(fileId, stats.likes);
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

// === Заглушка для лайков
function likeFile(fileId) {
    alert("На статичном сайте лайкнуть нельзя. Попробуй локально 😅");
}

// === Загрузка файла (без сервера)
function downloadFile(fileId, fileUrl) {
    window.open(fileUrl, '_blank');
    // Только локально можно обновить статистику
}
