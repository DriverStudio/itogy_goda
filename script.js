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
    const count = 50; 
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
    
    const sortedIds = Object.keys(allProfiles).sort((a, b) => {
        return allProfiles[a].stats.rank - allProfiles[b].stats.rank;
    });

    sortedIds.forEach((id, index) => {
        const user = allProfiles[id];
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const firstName = user.name.split(' ')[0];

        card.innerHTML = `
            <div class="user-photo-wrapper">
                 <img src="${user.photo}" alt="${user.name}" class="user-photo">
            </div>
            <h3>${firstName}</h3>
        `;
        card.onclick = () => startStory(id);
        grid.appendChild(card);
    });

    setTimeout(initScrollTracking, 100);
}

function startStory(id) {
    currentUserId = id;
    currentSlideIndex = 0;
    
    document.getElementById('selection-screen').classList.remove('active');
    document.getElementById('story-screen').classList.add('active');
    
    document.getElementById('progress-bar-container').style.display = 'block'; 

    renderSlide();
}

function closeStory() {
    document.getElementById('story-screen').classList.remove('active');
    document.getElementById('selection-screen').classList.add('active');
    
    document.getElementById('progress-bar-container').style.display = 'none';

    currentUserId = null;
    currentSlideIndex = 0;
}

function getSlides() {
    const user = allProfiles[currentUserId];
    const s = user.stats;
    
    const partnerNameFull = s.couple.target;
    const partnerFirstName = partnerNameFull.split(' ')[0];
    
    let partnerHtml = `<strong style="font-size:1.5rem; color:var(--accent-gold)">${partnerFirstName}</strong>`;
    
    const partnerId = Object.keys(allProfiles).find(key => allProfiles[key].name === partnerNameFull);
    
    if (partnerId) {
        const partnerPhotoUrl = allProfiles[partnerId].photo;
        partnerHtml = `<span style="white-space: nowrap;"><img src="${partnerPhotoUrl}" class="inline-avatar"> ${partnerHtml}</span>`;
    }

    return [
        {
            title: `Здравствуй, ${user.name.split(' ')[0]}!`,
            desc: "Время подводить итоги",
            content: "2025 прошел в работе и общении, обсуждениях, правках и движении вперед. В том, что мы делали вместе.<br>Давай вспомним, каким был этот год.",
            type: "text"
        },
        {
            title: "Твоя активность",
            desc: "Вклад в общее дело",
            val: s.messages,
            label: "сообщений отправлено",
            content: `В этом году почетное <nobr><strong>${s.rank}-е место</strong></nobr><br>в топе писателей – твое!`,
            type: "stat"
        },
        {
            title: "Родные души",
            desc: "Главный собеседник года",
            content: s.couple.count > 0 
                ? `В этом году вы были на одной волне с ${partnerHtml}.<br>Вы поддержали друг друга в ${s.couple.count} обсуждениях!`
                : "Ты был(а) самостоятельным игроком, поддерживая беседу со всеми понемногу.",
            type: "text"
        },
        {
            title: "Любопытные факты", 
            desc: "Нажми на пункт, чтобы узнать детали", // Подсказка пользователю
            items: [
                { 
                    name: "Перфекционизм", 
                    val: s.edits,
                    // Текст, который появится при клике:
                    detail: "Ты стремишься к идеалу! Столько раз ты редактировал свои сообщения, чтобы сформулировать мысль максимально точно."
                },
                { 
                    name: "Щедрость", 
                    val: s.docs,
                    detail: "Твоя библиотека впечатляет. Столько документов, фото и файлов ты отправил в чат, делясь полезным."
                }, 
                { 
                    name: "Любознательность", 
                    val: s.questions,
                    detail: "В споре рождается истина, а в вопросах – понимание. Ты не боишься уточнять детали!"
                },
                { 
                    name: "Вежливость", 
                    val: s.politeness,
                    detail: "Ты умеешь ценить чужой труд. Твое «спасибо» звучало в чатах чаще всего."
                }
            ],
            type: "list"
        },
        {
            title: "Твой стиль", 
            desc: "Ритм и продуктивность",
            val: s.avgLength,
            label: "символов в одном сообщении", 
            content: `Твой пик активности приходится на <strong>${s.shift}</strong>. Кажется, это твое идеальное время для работы!`,
            type: "stat"
        },
        {
            title: "С Новым Годом!",
            desc: "Вперед, в 2026!",
            content: "Пусть наступающий год принесет еще больше радостных моментов, ярких обсуждений и успеха во всех делах!",
            type: "final"
        }
    ];
}

function renderSlide() {
    const slides = getSlides();
    const slide = slides[currentSlideIndex];
    const container = document.getElementById('slide-content');
    
    const user = allProfiles[currentUserId];

    container.style.animation = 'none';
    container.offsetHeight; 
    container.style.animation = 'zoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    document.getElementById('progress-bar').style.width = ((currentSlideIndex + 1) / slides.length) * 100 + '%';

    let html = `<img src="${user.photo}" class="slide-user-photo">`;
    html += `<h2 class="slide-title">${slide.title}</h2>`;
    
    if (slide.desc) {
        html += `<p class="slide-desc" style="opacity: 0.7; margin-top: -10px; margin-bottom: 20px; font-size: 0.95rem;">${slide.desc}</p>`;
    }

    if (slide.type === "stat") {
        html += `
            <div class="big-number" id="anim-number">0</div>
            <div style="color:var(--accent-gold); margin-bottom:20px; letter-spacing:3px; text-transform:uppercase; font-size:0.9rem">${slide.label}</div>
            <p class="slide-text">${slide.content}</p>
        `;
    } else if (slide.type === "list") {
        html += `<div class="stat-list" style="width: 100%;">`; 
        slide.items.forEach((item, idx) => {
            if(item.val > 0) {
                // Передаем текст описания в функцию showStatInfo
                // Используем replace для кавычек, чтобы не поломать HTML
                const detailSafe = item.detail.replace(/"/g, '&quot;');
                html += `
                    <div class="stat-item" id="stat-item-${idx}" onclick="showStatInfo(this, '${detailSafe}')">
                        <span>${item.name}</span>
                        <span style="color:var(--accent-gold); font-weight:700;">${item.val}</span>
                    </div>
                `;
            }
        });
        html += `</div>`;
        // --- НОВОЕ: Блок для вывода описания ---
        html += `<div id="stat-details-box" style="margin-top: 20px; min-height: 60px; font-size: 0.95rem; line-height: 1.4; color: #ddd; opacity: 0; transition: opacity 0.3s;"></div>`;
        
    } else {
        html += `<p class="slide-text">${slide.content}</p>`;
    }

    if (slide.type === "final") {
        html += `<button onclick="closeStory()" class="final-btn">К списку участников</button>`;
    }

    container.innerHTML = html;

    if (slide.type === "stat") {
        const numEl = document.getElementById('anim-number');
        animateValue(numEl, 0, slide.val, 1500);
    }

    if (slide.type === "list") {
        const items = document.querySelectorAll('.stat-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 200 + 300);
        });
    }
}

// --- НОВАЯ ФУНКЦИЯ: Показ информации ---
function showStatInfo(element, text) {
    // 1. Убираем подсветку со всех элементов
    const allItems = document.querySelectorAll('.stat-item');
    allItems.forEach(el => {
        el.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        el.style.transform = "scale(1)";
        el.style.borderColor = "rgba(255, 255, 255, 0.1)";
    });

    // 2. Подсвечиваем активный элемент
    element.style.transition = "all 0.3s";
    element.style.backgroundColor = "rgba(255, 215, 0, 0.15)"; // Золотистый оттенок
    element.style.borderColor = "var(--accent-gold)";
    element.style.transform = "scale(1.02)";

    // 3. Выводим текст в нижний блок
    const box = document.getElementById('stat-details-box');
    
    // Эффект исчезновения старого текста -> появление нового
    box.style.opacity = 0;
    
    setTimeout(() => {
        box.innerHTML = text;
        box.style.opacity = 1;
    }, 200);
}

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

let lastScrollTop = 0;

function trackCenterCard() {
    const screen = document.getElementById('selection-screen');
    const cards = document.querySelectorAll('.user-card');
    const screenCenter = window.innerHeight / 2;

    let currentScrollTop = screen.scrollTop;
    let directionClass = 'dir-down'; 

    if (currentScrollTop < lastScrollTop) {
        directionClass = 'dir-up';
    } else {
        directionClass = 'dir-down';
    }
    
    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; 

    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + (rect.height / 2);
        const distance = Math.abs(screenCenter - cardCenter);

        card.classList.remove('highlighted', 'dir-up', 'dir-down');

        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });

    if (closestCard) {
        closestCard.classList.add('highlighted');
        closestCard.classList.add(directionClass);
    }
}

function initScrollTracking() {
    const screen = document.getElementById('selection-screen');
    screen.addEventListener('scroll', trackCenterCard);
    trackCenterCard();
}

window.onload = init;