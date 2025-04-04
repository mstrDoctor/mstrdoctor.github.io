const API_URL = "https://modix-server.fly.dev";

window.addEventListener("DOMContentLoaded", function() {
    const fileId = getFileIdFromURL();

    // Если есть блок комментариев — это страница ПЕРЕВОДА
    if (document.getElementById("comments-" + fileId)) {
        console.log("Страница ПЕРЕВОДА:", fileId);
        handleTranslationPage(fileId);
    }
    // Иначе, если есть карточки переводов — это страница ИГРЫ
    else if (document.querySelectorAll(".translation-card").length > 0) {
        console.log("Страница ИГРЫ");
        handleGamePage();
    }
});

// === Страница перевода ===
function handleTranslationPage(fileId) {
    registerVisit(fileId);
    initializeNameField(fileId);
    setupNameFieldListeners(fileId);
    toggleSubmitButton(fileId);
    renderComments(fileId);
    updateStats(fileId);
}

// === Страница игры (список переводов) ===
function handleGamePage() {
    const cards = document.querySelectorAll(".translation-card");

    cards.forEach(card => {
        const fileId = card.dataset.fileid;
        if (!fileId) return;

        fetch(`${API_URL}/stats/${fileId}`)
            .then(res => res.json())
            .then(data => {
                card.querySelector(".download-count").innerText = `${data.downloads || 0} загрузок`;
                card.querySelector(".like-count").innerText = `❤️ ${data.likes || 0} лайков`;
            })
            .catch(err => console.error("Ошибка загрузки статистики:", err));

        fetch(`${API_URL}/comments/${fileId}`)
            .then(res => res.json())
            .then(comments => {
                card.querySelector(".comment-count").innerText = `${comments.length} комментариев`;
            })
            .catch(err => console.error("Ошибка загрузки комментариев:", err));
    });
}

// === Вспомогательные функции для страницы перевода ===

// Отправка визита
function registerVisit(fileId) {
    fetch(`${API_URL}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId })
    }).catch(error => console.error("Ошибка при регистрации посещения:", error));
}

// Получение fileId из URL
function getFileIdFromURL() {
    const url = window.location.pathname;
    const fileId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.html'));
    return (fileId || '').toLowerCase();
}

// Работа с именем пользователя
function initializeNameField(fileId) {
    const nameField = document.getElementById("name-" + fileId);
    if (!nameField) return;
    const savedName = localStorage.getItem("username") || '';
    nameField.value = savedName;
    toggleSubmitButton(fileId);
}

function saveNameToLocalStorage(name) {
    localStorage.setItem("username", name);
}

// Обработчики событий для ввода имени и текста комментария
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

// Переключение активности кнопки отправки комментария
function toggleSubmitButton(fileId) {
    const name = document.getElementById("name-" + fileId)?.value.trim();
    const text = document.getElementById("text-" + fileId)?.value.trim();
    const submitButton = document.getElementById("submit-button-" + fileId);
    if (submitButton) {
        submitButton.disabled = !(name && text);
    }
}

// Отправка нового комментария
function addComment(fileId, nameFieldId, textFieldId) {
    const name = document.getElementById(nameFieldId)?.value.trim();
    const text = document.getElementById(textFieldId)?.value.trim();
    if (!name || !text) return alert("Введите имя и комментарий");

    fetch(`${API_URL}/comments/${fileId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text })
    })
    .then(() => {
        alert("Комментарий отправлен! ✅");
        renderComments(fileId);
        document.getElementById(textFieldId).value = "";
        toggleSubmitButton(fileId);
    })
    .catch(err => alert("Ошибка при отправке комментария: " + err));
}

// Загрузка всех комментариев
function renderComments(fileId) {
    const container = document.getElementById("comments-" + fileId);
    if (!container) return;

    fetch(`${API_URL}/comments/${fileId}`)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = "";
            (data || []).forEach(c => {
                const el = document.createElement("div");
                el.style = "border:1px solid #ccc;padding:8px;margin:5px 0;background:#f9f9f9;color:#000;border-radius:6px;";
                el.innerHTML = `<strong>${c.name}</strong><br><span>${c.text}</span>`;
                container.appendChild(el);
            });
            updateCommentCount(fileId, data.length);
        })
        .catch(err => console.error("Ошибка при загрузке комментариев:", err));
}

// Обновление счётчика комментариев
function updateCommentCount(fileId, count) {
    const el = document.getElementById("comment-count-" + fileId);
    if (el) el.innerText = `Комментарии: ${count}`;
}

// Загрузка лайков и загрузок
function updateStats(fileId) {
    fetch(`${API_URL}/stats/${fileId}`)
        .then(res => res.json())
        .then(data => {
            updateDownloadCount(fileId, data.downloads || 0);
            updateLikeCount(fileId, data.likes || 0);
        })
        .catch(err => console.error("Ошибка при загрузке статистики:", err));
}

// Обновление количества загрузок
function updateDownloadCount(fileId, count) {
    const el = document.getElementById("download-count-" + fileId);
    if (el) el.innerText = `(${count} загрузок)`;
}

// Обновление количества лайков
function updateLikeCount(fileId, count) {
    const el = document.getElementById("like-count-" + fileId);
    if (el) el.innerText = `❤️ ${count} лайков`;
}

// Лайк
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

// Скачивание файла
function downloadFile(fileId, fileUrl) {
    window.open(fileUrl, '_blank');

    fetch(`${API_URL}/files/${fileId}`, { method: 'GET' })
        .then(() => {
            setTimeout(() => {
                updateStats(fileId);
            }, 500);
        })
        .catch(err => console.error("Ошибка при обновлении количества загрузок:", err));
}
