// === Основная инициализация ===
window.addEventListener("load", () => {
    const fileId = getFileIdFromURL();
    console.log("File ID после загрузки страницы:", fileId);
    initializeNameField(fileId);
    setupNameFieldListeners(fileId);
    toggleSubmitButton(fileId);
    renderComments(fileId);
    updateDownloadCount(fileId);
    updateLikeState(fileId);
});

function getFileIdFromURL() {
    const url = window.location.pathname;
    const fileId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.html'));
    return (fileId || '').toLowerCase();  // <<< добавляем .toLowerCase()
}


// === Инициализация поля имени ===
function initializeNameField(fileId) {
    const nameField = document.getElementById("name-" + fileId);
    if (!nameField) return;
    const savedName = loadNameFromLocalStorage();
    nameField.value = savedName;
    toggleSubmitButton(fileId);
}

// === Навешивание обработчиков на поля ввода ===
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

// === Проверка состояния кнопки отправки ===
function toggleSubmitButton(fileId) {
    const name = document.getElementById("name-" + fileId)?.value.trim();
    const text = document.getElementById("text-" + fileId)?.value.trim();
    const submitButton = document.getElementById("submit-button-" + fileId);

    if (submitButton) {
        submitButton.disabled = !(name && text);
    }
}

// === Сохранение имени в localStorage ===
function saveNameToLocalStorage(name) {
    try {
        localStorage.setItem("username", name);
    } catch (e) {
        console.error("Ошибка при сохранении в localStorage:", e);
    }
}

// === Загрузка имени из localStorage ===
function loadNameFromLocalStorage() {
    try {
        return localStorage.getItem("username") || '';
    } catch (e) {
        console.error("Ошибка при загрузке из localStorage:", e);
        return '';
    }
}

// === Отправка комментария ===
function addComment(fileId, nameFieldId, textFieldId) {
    const name = document.getElementById(nameFieldId)?.value.trim();
    const text = document.getElementById(textFieldId)?.value.trim();
    if (!name || !text) return alert("Введите имя и комментарий");

    fetch(`/comments/${fileId}`, {
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

// === Отображение комментариев ===
function renderComments(fileId) {
    const container = document.getElementById("comments-" + fileId);
    if (!container) return;

    fetch(`/comments/${fileId}`, { method: 'GET' })
    .then(res => res.json())
    .then(data => {
        const list = data || [];
        container.innerHTML = "";
        list.forEach(c => {
            const el = document.createElement("div");
            el.style = "border:1px solid #ccc;padding:8px;margin:5px 0;background:#f9f9f9;color:#000;border-radius:6px;";

            let dateText = '';
            if (c.timestamp) {
                const date = new Date(c.timestamp);
                dateText = `<br><small style="color: #666;">🕒 ${date.toLocaleString()}</small>`;
            }

            el.innerHTML = `<strong>${c.name}</strong><br><span>${c.text}</span>${dateText}`;
            container.appendChild(el);
        });

        updateCommentCount(fileId, list.length);
    })
    .catch(err => alert("Ошибка при загрузке комментариев: " + err));
}

// === Обновление счётчика комментариев ===
function updateCommentCount(fileId, count) {
    const commentCountElement = document.getElementById("comment-count-" + fileId);
    if (commentCountElement) {
        commentCountElement.innerText = `Комментарии: ${count}`;
    }
}

// === Лайк (с запретом на повторный) ===
function likeFile(fileId) {
    if (localStorage.getItem("liked_" + fileId)) {
        alert("Вы уже поставили лайк ранее ✅");
        return;
    }

    fetch(`/like/${fileId}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
        alert("Спасибо за лайк! ❤️");
        updateLikeCount(fileId, data.likes);
        localStorage.setItem("liked_" + fileId, "true");
    })
    .catch(err => alert("Ошибка при лайке: " + err));
}

// === Обновление счётчика лайков ===
function updateLikeCount(fileId, likes) {
    const likeCountElement = document.getElementById("like-count-" + fileId);
    if (likeCountElement) {
        likeCountElement.innerText = `❤️ ${likes} лайков`;
    }
}

// === Проверка лайка + обновление счётчиков ===
function updateLikeState(fileId) {
    if (localStorage.getItem("liked_" + fileId)) {
        console.log(`Пользователь уже лайкнул: ${fileId}`);
    }

    // Всегда обновляем счётчики при загрузке страницы
    fetch(`/stats/${fileId}`)
    .then(res => res.json())
    .then(data => {
        updateLikeCount(fileId, data.likes);
        updateDownloadCount(fileId, data.downloads);
    })
    .catch(err => console.error("Ошибка при загрузке статистики: " + err));
}

// === Обновление количества загрузок ===
function updateDownloadCount(fileId, downloads = null) {
    const downloadCountElement = document.getElementById("download-count-" + fileId);
    if (downloadCountElement) {
        if (downloads !== null) {
            downloadCountElement.innerText = `(${downloads} загрузок)`;
        } else {
            // Если нет готового значения — загрузить через API
            fetch(`/stats/${fileId}`)
            .then(res => res.json())
            .then(data => {
                downloadCountElement.innerText = `(${data.downloads} загрузок)`;
            })
            .catch(err => console.error("Ошибка при загрузке количества загрузок: " + err));
        }
    }
}

function downloadFile(fileId, fileUrl) {
    // 1. Открыть MEGA в новой вкладке
    window.open(fileUrl, '_blank');

    // 2. Параллельно отправить запрос на сервер для увеличения счётчика загрузок
    fetch(`/files/${fileId}`, { method: 'GET' })
    .then(() => {
        // 3. После небольшой задержки обновляем число загрузок на странице
        setTimeout(() => {
            fetch(`/stats/${fileId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("download-count-" + fileId).innerText = `(${data.downloads} загрузок)`;
            });
        }, 500);
    })
    .catch(err => console.error("Ошибка при обновлении количества загрузок: " + err));
}


