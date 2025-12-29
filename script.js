let allProfiles = {};
let currentUserId = null;
let currentSlideIndex = 0;
let timerInterval = null;

// --- ТВОИ ЛИЧНЫЕ ПОЗДРАВЛЕНИЯ ---
const personalWishes = {
    // "tatiana-mosunova": "Таня, ты наш главный двигатель! Спасибо за твою невероятную энергию, за 511 сообщений поддержки и за то, что с тобой любой проект обречен на успех. Сияй в 2026!",
    
    // "venera": "Венера, ты — надежность и спокойствие нашего чата. Спасибо, что всегда была рядом и поддерживала командный дух. Пусть Новый год принесет тебе гармонию и радость!",
    
    // "alexandra": "Саша, спасибо за твой вклад и ответственность! Твои 118 правок говорят о том, что ты всегда стремишься к идеалу. Желаю в новом году вдохновения и легких задач!",
    
    // "evgeniya": "Женя, ты делаешь наши утра добрее! Пусть в 2026 году каждый рабочий день начинается с улыбки и отличных новостей. Спасибо, что ты с нами!",
    
    // "polina": "Полина, спасибо за твою активность и креатив даже в вечерние часы! Желаю, чтобы в новом году у тебя было больше времени для себя и своих мечтаний.",
    
    // "natalya": "Наташа, спасибо за твою отзывчивость! Твои сообщения всегда по делу и с душой. Пусть наступающий год будет таким же светлым, как ты!",
    
    "sanyaa": "Это я"
};

// Текст для тех, кого нет в списке (на всякий случай)
const defaultWish = "С Новым Годом! Спасибо за этот год. Пусть 2026 принесет удачу, тепло, финансовый рост и новые профессиональные победы!";

// --- ЛОГИКА ЗАГРУЗКИ ---
document.addEventListener("DOMContentLoaded", () => {
    const loaderScreen = document.getElementById('loader-screen');
    const progressBar = document.getElementById('progress-bar-fill');
    const percentText = document.getElementById('loading-text');
    
    // Эмодзи, которые будут меняться по ходу
    const icons = ["🎅", "🎁", "🎄", "⛄", "❄️"];
    const mainIcon = document.querySelector('.loader-icon-main');

    let width = 0;
    const interval = setInterval(() => {
        // Логика "умного" торможения
        // Сначала быстро, потом медленнее, чтобы ждать реальной загрузки
        if (width >= 90) {
            // Ждем window.onload, не растем дальше 90%
        } else if (width >= 60) {
            width += 0.5; // Медленно
        } else {
            width += 2; // Быстро
        }
        
        updateLoader(width);
    }, 50); // Обновляем каждые 50мс

    // Функция обновления вида
    function updateLoader(w) {
        progressBar.style.width = w + '%';
        percentText.innerText = Math.floor(w) + '%';
        
        // Меняем иконку каждые 20%
        const iconIndex = Math.floor(w / 20) % icons.length;
        if(mainIcon) mainIcon.innerText = icons[iconIndex];
    }

    // Когда ВСЁ (картинки, стили, скрипты) загрузилось
    window.addEventListener('load', () => {
        clearInterval(interval);
        
        // Быстро добиваем до 100%
        let endWidth = width;
        const endInterval = setInterval(() => {
            if (endWidth >= 100) {
                clearInterval(endInterval);
                updateLoader(100);
                
                // Убираем экран через полсекунды
                setTimeout(() => {
                    loaderScreen.classList.add('fade-out');
                    // Удаляем из DOM, чтобы не мешал кликам
                    setTimeout(() => loaderScreen.remove(), 500);
                }, 500);
                
            } else {
                endWidth += 2; // Очень быстро заполняем остаток
                updateLoader(endWidth);
            }
        }, 10);
    });
});

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

    // setTimeout(initScrollTracking, 100);
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
            content: "2025 прошел в работе и общении, обсуждениях, правках <nobr>и движении вперед.</nobr> В том, что мы делали вместе.<br>Давай вспомним, каким был этот год.",
            type: "text"
        },
        {
            title: "Твоя активность",
            val: s.messages,
            label: "сообщений отправлено",
            content: `В этом году почетное <nobr><strong>${s.rank}-е место</strong></nobr><br>в топе писателей – твое!`,
            type: "stat"
        },
        {
            title: "Родные души",
            desc: "Главный собеседник года",
            content: s.couple.count > 0 
                ? `В этом году вы были на одной волне с ${partnerHtml}.<br>В ${s.couple.count} обсуждениях твои ответы были на сообщения этого коллеги.`
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
                    name: "Не текстом единым", 
                    val: s.docs,
                    detail: "Иногда слов оказывается недостаточно, и тогда в ход идут документы, фото и файлы. Именно столько их в чате за год от тебя!"
                }, 
                { 
                    name: "Мне только спросить", 
                    val: s.questions,
                    detail: "Ты не стесняешься уточнять нюансы, и это круто! Столько вопросов в чате от тебя получили коллеги."
                },
                { 
                    name: "Вежливость", 
                    val: s.politeness,
                    detail: "Доброе слово всегда к месту. Твои благодарности делают общение в чате теплее и приятнее для всех."
                }
            ],
            type: "list"
        },
        {
            title: "Ритм и продуктивность", 
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
        // {
        //     title: "Тайный санта?",
        //     desc: "У меня есть кое-что для тебя...",
        //     // ВСТАВЛЯЕМ СЮДА КОРОБКУ
        //     content: `
        //         <div class="gift-container">
        //             <div id="gift-box-el" class="gift-box" onclick="tryOpenGift()">
        //                 <div class="gift-lid"></div>
        //                 <div class="gift-bow"></div>
        //             </div>
        //             <div id="gift-msg-el" class="gift-text">Нажми, чтобы открыть</div>
                    
        //             <div id="polaroid-place"></div>
        //         </div>
        //     `,
        //     type: "final" // Тип можно оставить final или text, главное content
        // }
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
            <div style="color:var(--accent-gold); margin-bottom:20px; font-size:0.9rem">${slide.label}</div>
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

    updateNavButtons(slides.length);
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

function tryOpenGift() {
    const box = document.getElementById('gift-box-el');
    const msg = document.getElementById('gift-msg-el');
    const place = document.getElementById('polaroid-place');
    
    // Эффекты
    const sound = document.getElementById('camera-sound');
    const flash = document.getElementById('camera-flash');

    const unlockDate = new Date('2026-01-01T00:00:00'); 
    
    // !!! ТЕСТ: РАСКОММЕНТИРУЙ ДЛЯ ПРОВЕРКИ, ПОТОМ УБЕРИ !!!
    const now = new Date('2026-01-02'); 
    // const now = new Date(); 

    if (now >= unlockDate) {
        // --- ОТКРЫТИЕ ---
        
        // Останавливаем таймер, если он шел
        if (timerInterval) clearInterval(timerInterval);

        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed"));

        if (flash) {
            flash.classList.add('flash-active');
            setTimeout(() => flash.classList.remove('flash-active'), 600);
        }

        box.style.display = 'none';
        msg.style.display = 'none';
        
        // Показываем открытку
        place.innerHTML = generateWarmCard();
        const card = place.querySelector('.warm-card');
        card.style.display = 'block';
        
    } else {
        // --- РАНО: ЗАПУСКАЕМ ОБРАТНЫЙ ОТСЧЕТ ---
        
        box.classList.add('shake-anim');
        setTimeout(() => box.classList.remove('shake-anim'), 500);
        
        // Функция обновления текста
        const updateTimer = () => {
            const currentTime = new Date();
            const diff = unlockDate - currentTime;
            
            if (diff <= 0) {
                // Если время вышло, перезагружаем страницу или просто меняем текст
                location.reload(); 
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            
            // Красивый вывод с ведущими нулями (05 сек вместо 5 сек)
            const hStr = hours.toString().padStart(2, '0');
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');
            
            msg.innerHTML = `
                До открытия подарка:<br>
                <span style="font-size:1.2em; color:#fff;">${days} дн. ${hStr}:${mStr}:${sStr}</span>
            `;
            msg.style.color = '#ff6b6b';
        };

        // Запускаем обновление сразу и потом каждую секунду
        updateTimer();
        if (timerInterval) clearInterval(timerInterval); // сброс старого
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function generateWarmCard() {
    const user = allProfiles[currentUserId];
    let message = personalWishes[currentUserId];
    if (!message) message = defaultWish;

    const signs = ["С теплом, твой коллега", "Happy New Year 2026", "Твой Тайный Санта"];
    const randomSign = signs[Math.floor(Math.random() * signs.length)];

    return `
        <div class="warm-card" id="polaroid-card">
            <div class="decor-corner top-right">❄️</div>
            <div class="decor-corner bottom-left">🎄</div>

            <div class="polaroid-frame">
                <img src="${user.photo}" class="polaroid-img" alt="Фото">
            </div>
            
            <div class="handwritten-msg">«${message}»</div>
            <div class="handwritten-sign">~ ${randomSign} ~</div>
        </div>
        
        <button onclick="saveCardAsImage()" class="save-btn">Сохранить открытку</button>`;
}

function saveCardAsImage() {
    // 1. Убираем вспышку
    const flash = document.getElementById('camera-flash');
    if (flash) flash.style.display = 'none';

    // 2. Берем данные
    const realCard = document.getElementById("polaroid-card");
    const photoSrc = realCard.querySelector('.polaroid-img').src;
    const msgText = realCard.querySelector('.handwritten-msg').innerText;
    const signText = realCard.querySelector('.handwritten-sign').innerText;

    // 3. Создаем ИДЕАЛЬНУЮ ПРАЗДНИЧНУЮ КОПИЮ
    const exportBox = document.createElement('div');
    
    // --- СТИЛИ ФОНА КАРТОЧКИ ---
    exportBox.style.position = 'fixed';
    exportBox.style.top = '-9999px';
    exportBox.style.left = '0';
    exportBox.style.width = '340px'; 
    // Задаем явный цвет фона, чтобы градиент ложился на него
    exportBox.style.backgroundColor = '#fdfbf7'; 
    // Упрощенный паттерн (точки), который html2canvas лучше понимает
    exportBox.style.backgroundImage = 'radial-gradient(#d7ccc8 1px, transparent 1px)';
    exportBox.style.backgroundSize = '20px 20px';
    
    exportBox.style.padding = '30px 30px 60px 30px';
    exportBox.style.zIndex = '999999';
    exportBox.style.textAlign = 'center';
    exportBox.style.fontFamily = "'Marck Script', cursive";
    exportBox.style.boxSizing = 'border-box';

    exportBox.innerHTML = `
        <div style="position:absolute; top:15px; right:15px; font-size:40px; transform: rotate(15deg); display: inline-block;">❄️</div>
        <div style="position:absolute; bottom:15px; left:15px; font-size:50px; transform: rotate(-15deg); display: inline-block;">🎄</div>

        <div style="
            position:absolute; top:-15px; left:50%; transform:translateX(-50%) rotate(2deg);
            width:120px; height:40px; 
            background-color: rgba(211, 47, 47, 0.9);
            background: linear-gradient(45deg, 
                rgba(211,47,47,1) 25%, 
                rgba(255,255,255,0.2) 25%, 
                rgba(255,255,255,0.2) 50%, 
                rgba(211,47,47,1) 50%, 
                rgba(211,47,47,1) 75%, 
                rgba(255,255,255,0.2) 75%, 
                rgba(255,255,255,0.2) 100%
            );
            background-size: 20px 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        "></div>

        <div style="
            background:#fff; padding:15px; 
            border:1px solid #ddd; 
            outline: 3px solid #d4af37; outline-offset: -8px;
            margin-bottom: 25px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        ">
            <div style="
                width: 100%; 
                height: 280px; 
                background-image: url('${photoSrc}');
                background-size: cover;
                background-position: center top;
                background-repeat: no-repeat;
            "></div>
        </div>
        
        <div style="font-size: 26px; color: #3e2723; font-weight: bold; line-height: 1.4; margin-bottom: 20px;">
            ${msgText}
        </div>
        
        <div style="font-size: 20px; color: #b71c1c; font-weight: bold; text-align: right;">
            ${signText}
        </div>
    `;

    document.body.appendChild(exportBox);

    // 4. Фотографируем
    html2canvas(exportBox, {
        scale: 4, 
        // Явно указываем цвет фона для канваса, иначе может стать прозрачным
        backgroundColor: "#fdfbf7", 
        useCORS: true,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `HappyNewYear_2026.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        document.body.removeChild(exportBox);
        if (flash) flash.style.display = '';
    }).catch(err => {
        console.error(err);
        document.body.removeChild(exportBox);
        if (flash) flash.style.display = '';
    });
}

// --- НОВАЯ ФУНКЦИЯ УПРАВЛЕНИЯ КНОПКАМИ ---
function updateNavButtons(totalSlides) {
    const prevBtn = document.getElementById('prev-arrow');
    const nextBtn = document.getElementById('next-arrow');

    if (!prevBtn || !nextBtn) return;

    // 1. ЛЕВАЯ КНОПКА (Назад)
    if (currentSlideIndex === 0) {
        // Если это первый слайд — скрываем кнопку
        prevBtn.style.opacity = '0';
        prevBtn.style.pointerEvents = 'none'; // Чтобы нельзя было нажать
    } else {
        // Иначе показываем
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
    }

    // 2. ПРАВАЯ КНОПКА (Вперед / Выход)
    if (currentSlideIndex === totalSlides - 1) {
        // Если это последний слайд — превращаем в КРЕСТИК
        nextBtn.innerHTML = '<i class="fas fa-times"></i>'; 
        nextBtn.onclick = closeStory; // Меняем действие на "Закрыть"
        
        // Опционально: можно добавить стиль, чтобы он отличался
        // nextBtn.style.color = '#ff6b6b'; 
    } else {
        // Если обычный слайд — возвращаем СТРЕЛКУ
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = nextSlide; // Возвращаем действие "Вперед"
        // nextBtn.style.color = ''; 
    }
}

// --- ЗВУКИ ПРИ НАВЕДЕНИИ ---

// Ждем полной загрузки страницы, чтобы найти все карточки
// --- "ЖИВОЙ" ЗВУК ПРИ НАВЕДЕНИИ ---

document.addEventListener('DOMContentLoaded', () => {
    const hoverSound = document.getElementById('hover-sound');
    
    // ГРОМКОСТЬ: Ставим очень тихо (10-15%), чтобы было на грани восприятия
    if (hoverSound) {
        hoverSound.volume = 0.15; 
    }

    const grid = document.getElementById('user-grid');
    
    if (grid) {
        grid.addEventListener('mouseover', (event) => {
            // Проверка, что мышь зашла на карточку
            const card = event.target.closest('.user-card');
            
            if (card && !card.contains(event.relatedTarget)) {
                playPopSound();
            }
        });
    }

    function playPopSound() {
        // Проверяем, что это ПК (на телефонах звуков не надо)
        if (window.matchMedia('(hover: hover)').matches && hoverSound) {
            
            // --- МАГИЯ "ПУПЫРКИ" ---
            // Каждый раз звук будет чуть-чуть отличаться по высоте (от 0.9 до 1.2 скорости)
            // Это создает эффект, будто лопаются разные пузырьки
            const randomRate = 0.9 + Math.random() * 0.4;
            hoverSound.playbackRate = randomRate;

            // Сбрасываем время, чтобы звук прерывался и начинался заново (для быстрых движений)
            hoverSound.currentTime = 0;
            
            // Пытаемся воспроизвести
            hoverSound.play().catch(() => {}); 
        }
    }
});

window.onload = init;