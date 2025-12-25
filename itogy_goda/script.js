let allProfiles = {};
let currentUserId = null;
let currentSlideIndex = 0;

// Инициализация
async function init() {
    createSnow();
    try {
        const response = await fetch('profiles.json');
        allProfiles = await response.json();
        renderUserGrid();
    } catch (error) {
        console.error("Ошибка загрузки профилей:", error);
    }
}

// Генерация снега
function createSnow() {
    const container = document.getElementById('snow-container');
    const count = 50; // Увеличил количество снежинок
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '•';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = (Math.random() * 20 + 10) + 'px';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
        snowflake.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(snowflake);
    }
}

// Рендеринг сетки пользователей
function renderUserGrid() {
    const grid = document.getElementById('user-grid');
    grid.innerHTML = "";
    
    // Сортировка по рангу (если нужно) или просто вывод
    const sortedIds = Object.keys(allProfiles).sort((a, b) => {
        return allProfiles[a].stats.rank - allProfiles[b].stats.rank;
    });

    sortedIds.forEach((id, index) => {
        const user = allProfiles[id];
        const card = document.createElement('div');
        card.className = 'user-card';
        // Добавляем задержку анимации для каждого элемента (stagger effect)
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="user-photo-wrapper">
                 <img src="${user.photo}" alt="${user.name}" class="user-photo">
            </div>
            <h3>${user.name}</h3>
            <div style="font-size: 0.9rem; color: #aaa;">Ранг #${user.stats.rank}</div>
        `;
        card.onclick = () => startStory(id);
        grid.appendChild(card);
    });
}

function startStory(id) {
    currentUserId = id;
    currentSlideIndex = 0;
    document.getElementById('selection-screen').classList.remove('active');
    document.getElementById('story-screen').classList.add('active');
    renderSlide();
}

function closeStory() {
    document.getElementById('story-screen').classList.remove('active');
    document.getElementById('selection-screen').classList.add('active');
    currentUserId = null;
    currentSlideIndex = 0;
}

function getSlides() {
    const user = allProfiles[currentUserId];
    const s = user.stats;
    
    return [
        {
            title: `Здравствуй, ${user.name.split(' ')[0]}!`,
            content: "Давай вместе вспомним, каким был твой 2025 год в нашем теплом коллективе...",
            type: "text"
        },
        {
            title: "Твоя активность",
            val: s.messages,
            label: "сообщений отправлено",
            content: `В этом году ты занял(а) почетное <strong>${s.rank}-е место</strong> в топе писателей!`,
            type: "stat"
        },
        {
            title: "Родные души",
            content: s.couple.count > 0 
                ? `Особая связь у тебя сложилась с пользователем <br><strong style="font-size:1.5rem; color:var(--accent-gold)">${s.couple.target}</strong>.<br>Вы обменялись любезностями целых ${s.couple.count} раз!`
                : "Ты был(а) самостоятельным игроком, поддерживая беседу со всеми понемногу.",
            type: "text"
        },
        {
            title: "Твои достижения",
            items: [
                { name: "Перфекционизм (правок)", val: s.edits },
                { name: "Библиотекарь (файлов)", val: s.docs },
                { name: "Почемучка (вопросов)", val: s.questions },
                { name: "Вежливость (спасибо)", val: s.politeness }
            ],
            type: "list"
        },
        {
            title: "Твой ритм",
            val: s.avgLength,
            label: "символов в среднем",
            content: `Твое любимое время суток — <strong>${s.shift}</strong>. Именно тогда ты сияешь ярче всего!`,
            type: "stat"
        },
        {
            title: "С Новым Годом!",
            content: "Пусть 2026 принесет еще больше радостных моментов, ярких обсуждений и успеха во всех делах!",
            type: "final"
        }
    ];
}

function renderSlide() {
    const slides = getSlides();
    const slide = slides[currentSlideIndex];
    const container = document.getElementById('slide-content');
    
    // Сброс анимации контейнера (трюк с reflow)
    container.style.animation = 'none';
    container.offsetHeight; /* trigger reflow */
    container.style.animation = 'zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    // Обновляем прогресс-бар
    document.getElementById('progress-bar').style.width = ((currentSlideIndex + 1) / slides.length) * 100 + '%';

    let html = `<h2 class="slide-title">${slide.title}</h2>`;

    if (slide.type === "stat") {
        html += `
            <div class="big-number" id="anim-number">0</div>
            <div style="color:var(--accent-gold); margin-bottom:20px; letter-spacing:3px; text-transform:uppercase; font-size:0.8rem">${slide.label}</div>
            <p class="slide-text">${slide.content}</p>
        `;
    } else if (slide.type === "list") {
        html += `<div class="stat-list">`;
        slide.items.forEach((item, idx) => {
            // Убираем нули для красоты, если их нет
            if(item.val > 0) {
                html += `
                    <div class="stat-item" id="stat-item-${idx}">
                        <span>${item.name}</span>
                        <span style="color:var(--accent-gold); font-weight:700; font-size:1.2rem;">${item.val}</span>
                    </div>
                `;
            }
        });
        html += `</div>`;
    } else {
        html += `<p class="slide-text">${slide.content}</p>`;
    }

    if (slide.type === "final") {
        html += `<button onclick="closeStory()" class="final-btn">К списку участников</button>`;
    }

    container.innerHTML = html;

    // --- JS Анимации после рендера ---

    // 1. Анимация чисел (count up)
    if (slide.type === "stat") {
        const numEl = document.getElementById('anim-number');
        animateValue(numEl, 0, slide.val, 1500);
    }

    // 2. Анимация списка (поочередное появление)
    if (slide.type === "list") {
        const items = document.querySelectorAll('.stat-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 200 + 300); // задержка старта + интервал
        });
    }
}

// Функция плавного счета
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function nextSlide() {
    const slides = getSlides();
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        renderSlide();
    }
}

function prevSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        renderSlide();
    }
}

window.onload = init;