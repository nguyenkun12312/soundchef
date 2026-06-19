// ĐƯỜNG DẪN ÂM THANH 
const AUDIO_ASSETS = {
    clickSound: new Audio('sound/1.mp3'),
    guideInstruction: new Audio('sound/2.mp3'),
    recipe_trung:     new Audio('sound/3.mp3'),
    recipe_comHen:    new Audio('sound/4.mp3'),
    recipe_cheBap:    new Audio('sound/5.mp3')
};

let currentPlayingAudio = null;
let isMuted = false;

function playTargetAudio(audioObject) {
    if (!audioObject) return;
    stopAllAudio();
    currentPlayingAudio = audioObject;
    currentPlayingAudio.muted = isMuted;
    currentPlayingAudio.play().catch(err => {
        console.log("Cần click vào web trước để kích hoạt âm thanh.");
    });
}

function stopAllAudio() {
    Object.values(AUDIO_ASSETS).forEach(audio => {
        if (audio && audio !== AUDIO_ASSETS.clickSound) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
    currentPlayingAudio = null;
}


//CHUYỂN TRANG SINGLE PAGE 
const sections = {
    'Trang Chủ': document.getElementById('home'),
    'Hướng dẫn': document.getElementById('guide'),
    'Nấu ăn': document.getElementById('cooking'),
    'Blogs': document.getElementById('page-blog'),
    'Liên Hệ': document.getElementById('pg-ct')
};

const navButtons = document.querySelectorAll('nav ul li button');

function switchPage(targetPageName) {
    stopAllAudio();

    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden-section');
    });
    
    const activeSection = sections[targetPageName];
    if (activeSection) {
        activeSection.classList.remove('hidden-section');
        
        if (targetPageName === 'Nấu ăn') {
            document.getElementById('cooking-menu').classList.remove('hidden-section');
            document.getElementById('cooking-details').classList.add('hidden-section');
        }
        window.scrollTo(0, 0);
    }

    navButtons.forEach(btn => {
        if (btn.textContent.trim() === targetPageName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (targetPageName === 'Hướng dẫn') {
        playTargetAudio(AUDIO_ASSETS.guideInstruction);
    } else {
        speakAccessibilityFeedback(`Bạn đang ở trang ${targetPageName}`);
    }
}

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchPage(btn.textContent.trim());
    });
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        switchPage('Trang Chủ');
    });
});


//  CHI TIẾT MÓN ĂN 
function showRecipe(recipeKey) {
    document.getElementById('cooking-menu').classList.add('hidden-section');
    document.getElementById('cooking-details').classList.remove('hidden-section');
    
    document.querySelectorAll('.recipe-full').forEach(el => el.style.display = 'none');
    
    const targetRecipeBox = document.getElementById(`detail-${recipeKey}`);
    if (targetRecipeBox) {
        targetRecipeBox.style.display = 'block';
    }

    if (recipeKey === 'trung') playTargetAudio(AUDIO_ASSETS.recipe_trung);
    if (recipeKey === 'com-hen') playTargetAudio(AUDIO_ASSETS.recipe_comHen);
    if (recipeKey === 'che-bap') playTargetAudio(AUDIO_ASSETS.recipe_cheBap);

    speakAccessibilityFeedback("Đang hiển thị công thức chi tiết. Âm thanh nấu ăn đang được phát.");
    if (document.activeElement) document.activeElement.blur();
}

document.querySelectorAll('.top-list .card').forEach((card, index) => {
    card.addEventListener('click', () => {
        card.blur(); 
        switchPage('Nấu ăn');
        if (index === 0) showRecipe('trung');
        if (index === 1) showRecipe('com-hen');
        if (index === 2) showRecipe('che-bap');
    });
});

const guideAudioBtn = document.querySelector('.btn-audio');
if (guideAudioBtn) {
    guideAudioBtn.addEventListener('click', () => {
        playTargetAudio(AUDIO_ASSETS.guideInstruction);
    });
}


// ACCESSIBILITY PANEL 
function toggleAccessPanel() {
    const panelContent = document.querySelector('.panel-content');
    const toggleBtn = document.getElementById('panel-toggle');
    if (!panelContent || !toggleBtn) return;

    if (panelContent.style.display === 'none') {
        panelContent.style.display = 'flex';
        toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
        panelContent.style.display = 'none';
        toggleBtn.setAttribute('aria-expanded', 'false');
    }
}

function togglePlayPause() {
    if (!currentPlayingAudio) return;

    if (currentPlayingAudio.paused) {
        currentPlayingAudio.play();
        speakAccessibilityFeedback("Tiếp tục phát âm thanh");
    } else {
        currentPlayingAudio.pause();
        speakAccessibilityFeedback("Đã tạm dừng âm thanh");
    }
}

function replayCurrentAudio() {
    if (!currentPlayingAudio) return;
    currentPlayingAudio.currentTime = 0;
    currentPlayingAudio.play();
    speakAccessibilityFeedback("Đang phát lại âm thanh từ đầu");
}

function toggleHighContrast() {
    document.body.classList.toggle('high-contrast-mode');
    const isActive = document.body.classList.contains('high-contrast-mode');
    speakAccessibilityFeedback(isActive ? "Đã bật tương phản cao" : "Đã tắt tương phản cao");
}

let textScale = 100; 
function changeFontSize(direction) {
    if (direction === 'increase' && textScale < 150) {
        textScale += 10;
    } else if (direction === 'decrease' && textScale > 90) {
        textScale -= 10;
    }
    document.body.style.fontSize = `${textScale}%`;
    speakAccessibilityFeedback(`Cỡ chữ hiện tại là ${textScale} phần trăm`);
}


// BỘ LẮNG NGHE PHÍM TẮT TOÀN CỤC 
window.addEventListener('keydown', (e) => {
    const pressedKey = e.key.toLowerCase();
    if (document.activeElement.id === 'searchInput') return;

    // Phím Enter
    if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.classList.contains('card')) {
            e.preventDefault();
            activeEl.click();
            activeEl.blur();
            return;
        }
        if (activeEl && activeEl.tagName === 'BUTTON' && activeEl.closest('nav')) {
            e.preventDefault();
            activeEl.click();
            activeEl.blur();
            return;
        }
    }

    // Phím M
    if (pressedKey === 'm') {
        e.preventDefault();
        isMuted = !isMuted;
        Object.values(AUDIO_ASSETS).forEach(audio => {
            if (audio) audio.muted = isMuted;
        });
        speakAccessibilityFeedback(isMuted ? "Đã tắt âm" : "Đã mở âm");
    }
    
    // Phím Spacebar
    else if (e.key === ' ') {
        e.preventDefault(); 
        togglePlayPause();
    }
    
    // Phím Escape
    else if (e.key === 'Escape') {
        e.preventDefault();
        switchPage('Trang Chủ');
    }
});


//TRÌNH ĐỌC VĂN BẢN 
function speakAccessibilityFeedback(message) {
    if (isMuted) return;
    window.speechSynthesis.cancel(); 
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'vi-VN';
    speech.rate = 1.1; 
    window.speechSynthesis.speak(speech);
}


//  HIỆU ỨNG TIẾNG CLICK CHO TOÀN BỘ NÚT BẤM 
document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .card, .menu-item');
    if (target && !isMuted && AUDIO_ASSETS.clickSound) {
        AUDIO_ASSETS.clickSound.currentTime = 0;
        AUDIO_ASSETS.clickSound.play().catch(err => console.log(err));
    }
});


// KHỞI CHẠY TRANG WEB 
document.addEventListener('DOMContentLoaded', () => {
    switchPage('Trang Chủ');
});