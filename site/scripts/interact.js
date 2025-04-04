ChatGPT сказал:
Да, ты абсолютно правильно понял! 💡
Давай я объясню тебе точно, чётко и пошагово, что происходит:

📋 Сейчас твой скрипт (modix.js) делает:
Что обрабатывает	Где
Посещения	✅ Здесь (registerVisit(fileId))
Комментарии	✅ Здесь (renderComments(fileId))
Лайки и скачивания	✅ Здесь (updateStats(fileId))
Лайк на кнопку	✅ Здесь (likeFile(fileId))
Скачивание файла	✅ Здесь (downloadFile(fileId))
➡️ Но только для СТРАНИЦЫ ПЕРЕВОДА (например, hearts_of_azeroth_hoi4_ru_v1_0.html) — всё на одной странице.

❗ Проблема:
На странице ИГРЫ (например,
https://mstrdoctor.github.io/Modix/hearts_of_iron_iv___hoi_4.html)
у тебя выводится список переводов
(но они просто показывают старые данные из stats.json и comments.json).

👉 Для страницы ИГРЫ нужно другой скрипт, который:

Загружает свежие счётчики для каждого перевода через fetch

И обновляет их прямо на карточках.

🛠️ Куда и что нужно исправить:
Где	Что сделать
Страница перевода (hearts_of_azeroth_hoi4_ru_v1_0.html)	Оставить этот твой скрипт (он уже рабочий ✅)
Страница игры (hearts_of_iron_iv___hoi_4.html)	Новый скрипт, чтобы динамически подгружать лайки / скачивания / комментарии для всех переводов
🚀 Я подготовил для тебя ГОТОВЫЙ универсальный скрипт для страницы ИГРЫ:
html
Копировать
Редактировать
<script>
const API_URL = "https://modix-server.fly.dev";

document.addEventListener("DOMContentLoaded", function() {
    // Ищем все карточки переводов по классу .translation-card
    const cards = document.querySelectorAll(".translation-card");

    cards.forEach(card => {
        const fileId = card.dataset.fileid;  // Читаем file_id из атрибута data-fileid

        if (!fileId) return;

        // Загружаем лайки и загрузки
        fetch(`${API_URL}/stats/${fileId}`)
            .then(res => res.json())
            .then(data => {
                card.querySelector(".download-count").innerText = `${data.downloads || 0} загрузок`;
                card.querySelector(".like-count").innerText = `❤️ ${data.likes || 0} лайков`;
            })
            .catch(err => console.error("Ошибка загрузки статистики:", err));

        // Загружаем комментарии
        fetch(`${API_URL}/comments/${fileId}`)
            .then(res => res.json())
            .then(comments => {
                card.querySelector(".comment-count").innerText = `${comments.length} комментариев`;
            })
            .catch(err => console.error("Ошибка загрузки комментариев:", err));
    });
});
</script>


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
