// Уведомление о переезде сайта
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, не на Firebase ли мы уже
    if (window.location.hostname === 'raid-lynx.web.app') {
        return; // Уже на новом сайте
    }
    
    // Проверяем, не закрывал ли пользователь уведомление
    if (localStorage.getItem('migration-notice-dismissed') === 'true') {
        return;
    }
    
    // Создаем уведомление
    const notice = document.createElement('div');
    notice.id = 'migration-notice';
    notice.innerHTML = `
        <div class="migration-content">
            <div class="migration-icon">🚀</div>
            <div class="migration-text">
                <h3>Сайт переехал!</h3>
                <p>Мы переместились на более быстрое и улучшенное место с новыми возможностями!</p>
            </div>
            <div class="migration-buttons">
                <a href="https://raid-lynx.web.app" class="migration-btn primary">
                    Перейти на новый сайт
                </a>
                <button class="migration-btn secondary" onclick="dismissNotice()">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        #migration-notice {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .migration-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .migration-icon {
            font-size: 2em;
            text-align: center;
        }
        
        .migration-text h3 {
            margin: 0 0 8px 0;
            font-size: 1.2em;
            font-weight: 600;
        }
        
        .migration-text p {
            margin: 0;
            font-size: 0.9em;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .migration-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .migration-btn {
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 0.9em;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            transition: all 0.2s;
            flex: 1;
        }
        
        .migration-btn.primary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .migration-btn.primary:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }
        
        .migration-btn.secondary {
            background: rgba(0,0,0,0.2);
            color: rgba(255,255,255,0.8);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .migration-btn.secondary:hover {
            background: rgba(0,0,0,0.3);
        }
        
        @media (max-width: 480px) {
            #migration-notice {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notice);
});

// Функция для закрытия уведомления
function dismissNotice() {
    const notice = document.getElementById('migration-notice');
    if (notice) {
        notice.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            notice.remove();
        }, 300);
        localStorage.setItem('migration-notice-dismissed', 'true');
    }
}

// Добавляем анимацию закрытия
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(slideOutStyle); 