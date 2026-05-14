// Authentication Check
if (!window.location.pathname.includes('login.html')) {
    if (!localStorage.getItem('wusool_logged_in')) {
        window.location.href = 'login.html';
    }
}

// Global Notification System (Toaster)
window.showToast = function (message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? 'fa-circle-xmark' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};

// Language & Translation Engine
window.currentLang = localStorage.getItem('wusool_lang') || 'ar';

window.setLanguage = function (lang) {
    window.currentLang = lang;
    localStorage.setItem('wusool_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations();
    // Update active state in UI if any language switcher exists
};

function applyTranslations() {
    if (typeof translations === 'undefined') return;
    const langData = translations[window.currentLang];
    if (!langData) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[key]) {
            // Special handling for login button when user is logged in
            if (key === 'nav_login' && localStorage.getItem('wusool_user_name')) {
                el.textContent = localStorage.getItem('wusool_user_name');
                return;
            }

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = langData[key];
            } else if (el.tagName === 'TITLE') {
                document.title = langData[key];
            } else {
                el.textContent = langData[key];
            }
        }
    });
}

// Global Accessibility Functions
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    document.documentElement.lang = window.currentLang;
    document.documentElement.dir = window.currentLang === 'ar' ? 'rtl' : 'ltr';
    const decBtn = document.getElementById('decreaseTextBtn');
    const incBtn = document.getElementById('increaseTextBtn');
    const contrastBtn = document.getElementById('contrastBtn');

    // font size
    let currentSize = 0; // 0 = base, -1 = sm, 1 = lg, 2 = xl
    incBtn?.addEventListener('click', () => {
        if (currentSize < 2) { currentSize++; applyFontSize(); }
    });
    decBtn?.addEventListener('click', () => {
        if (currentSize > -1) { currentSize--; applyFontSize(); }
    });

    function applyFontSize() {
        const html = document.documentElement;
        html.className = html.className.replace(/text-(sm|lg|xl)/g, '');
        if (currentSize === -1) html.classList.add('text-sm');
        if (currentSize === 1) html.classList.add('text-lg');
        if (currentSize === 2) html.classList.add('text-xl');
    }

    // contrast
    contrastBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // Counter Animation
    const counters = document.querySelectorAll('.stat-number');
    const speed = 100;

    counters.forEach(counter => {
        const target = +counter.innerText;
        if (isNaN(target) || target === 0) return;

        counter.innerText = '0';
        counter.setAttribute('data-target', target);

        const updateCount = () => {
            const tempTarget = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = tempTarget / speed;

            if (count < tempTarget) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 25);
            } else {
                counter.innerText = tempTarget;
            }
        };

        // Small delay to match entrance CSS animation
        setTimeout(updateCount, 400);
    });
});

// Render School Cards
function createSchoolCard(school) {
    const emoji = school.gender === 'ذكور' ? '👦' : school.gender === 'إناث' ? '👧' : '👪';
    const stars = [1, 2, 3, 4, 5].map(i => `<span class="${i <= Math.round(school.rating) ? 'star' : 'star star-empty'}">★</span>`).join('');

    let rc = 'badge-gray', ri = '➖';
    if (school.readiness === 'مهيأة') { rc = 'badge-success'; ri = '✅'; }
    if (school.readiness === 'جزئي') { rc = 'badge-warning'; ri = '🔄'; }
    if (school.readiness === 'غير مهيأة') { rc = 'badge-danger'; ri = '❌'; }

    const imgIndex = school.name.length % 4;
    const images = [
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1546410531-bea5aad139c8?auto=format&fit=crop&w=600&q=80'
    ];

    const isFav = JSON.parse(localStorage.getItem('wusool_favorites') || '[]').includes(school.id);
    const favClass = isFav ? 'fa-solid fa-star fav-active' : 'fa-regular fa-star';

    // Prioritize specific school image, fallback to notfound placeholder
    const schoolImg = `assets/img/schools/${school.id}.jpg`;
    const notfoundPlaceholder = "assets/img/notfound.png";

    return `
    <div class="school-card fade-in" data-school-id="${school.id}">
        <div class="school-card-thumb" style="background-image: url('${schoolImg}'), url('${notfoundPlaceholder}'); background-color: #f8fafc;">
            <span class="gender-badge-glass">${emoji} ${school.gender}</span>
            <button class="fav-btn" onclick="toggleFavorite('${school.id}', event)" title="إضافة للمفضلة">
                <i class="${favClass}"></i>
            </button>
        </div>
        <div class="school-card-glass">
            <h3 class="school-card-name">${school.name}</h3>
            <div class="school-card-meta">
                <span class="badge ${rc}">${ri} ${school.readiness}</span>
                <span class="badge" style="background: rgba(0,0,0,0.05); color:#1a2942;">${school.type}</span>
                ${school.educationType === 'مهني' ? '<span class="badge" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color:white;">BTEC</span>' : ''}
            </div>
            <div class="district-info" style="margin-bottom: 12px;">
                <span><i class="fa-solid fa-location-dot" style="color:#e74c3c;"></i> ${school.district}</span>
                <div class="stars-minimal">${stars} <span>${school.rating.toFixed(1)}</span></div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="showSchoolDetails('${school.id}')" style="flex:1; min-width:80px; border:none; border-radius:20px; padding:8px 10px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.25s; display:flex; align-items:center; justify-content:center; gap:5px; background:linear-gradient(135deg, #1a2942, #2e3f5c); color:white; font-family:inherit;">
                    <i class="fa-solid fa-circle-info"></i> تفاصيل
                </button>
                <button onclick="callSchool('${school.phone}', '${school.name}')" style="flex:1; min-width:80px; border:none; border-radius:20px; padding:8px 10px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.25s; display:flex; align-items:center; justify-content:center; gap:5px; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; font-family:inherit;">
                    <i class="fa-solid fa-phone"></i> اتصال
                </button>
                <button onclick="window.location.href='map.html?id=${school.id}'" style="flex:1; min-width:80px; border:none; border-radius:20px; padding:8px 10px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.25s; display:flex; align-items:center; justify-content:center; gap:5px; background:#fef3c7; color:#d97706; border:1px solid #fde68a; font-family:inherit;">
                    <i class="fa-solid fa-map-location-dot"></i> الموقع
                </button>
            </div>
        </div>
    </div>`;
}

// Global Back to Top Button
(function() {
    const btn = document.createElement('div');
    btn.className = 'back-to-top';
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    btn.onclick = () => {
        const container = document.querySelector('.main-container');
        if (container && container.style.overflowY !== 'hidden') {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    document.body.appendChild(btn);

    const target = document.querySelector('.main-container') || window;
    target.addEventListener('scroll', () => {
        const scrollTop = target.scrollTop || window.pageYOffset;
        if (scrollTop > 400) btn.classList.add('show');
        else btn.classList.remove('show');
    });
})();

// Global Favorite Logic
window.toggleFavorite = function(id, event) {
    if(event) event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('wusool_favorites') || '[]');
    const index = favs.indexOf(id);
    const school = schoolsData.find(s => s.id === id);
    
    if (index === -1) {
        favs.push(id);
        showToast(`تمت إضافة ${school ? school.name : ''} للمفضلة`, 'success');
        if(window.UISounds) window.UISounds.notify();
    } else {
        favs.splice(index, 1);
        showToast(`تمت إزالة ${school ? school.name : ''} من المفضلة`, 'info');
    }
    
    localStorage.setItem('wusool_favorites', JSON.stringify(favs));
    
    // Update all icons for this school ID on the page
    const cards = document.querySelectorAll(`.school-card[data-school-id="${id}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.fav-btn i');
        if (btn) {
            btn.className = index === -1 ? 'fa-solid fa-star fav-active' : 'fa-regular fa-star';
        }
    });

    // If we are on favorites page, refresh the list
    if (window.location.pathname.includes('favorites.html') && typeof renderFavorites === 'function') {
        renderFavorites();
    }
};

// Global Toast Function
window.showToast = function(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#1a2942';
    toast.classList.add('show');
    
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// Global Call Function
window.callSchool = function(phone, name) {
    const isInvalid = !phone || phone === "0" || phone === "لا يوجد" || phone.trim() === "" || phone === "0770000000";
    const cleanPhone = !isInvalid ? phone : null;
    
    if (cleanPhone) {
        if(window.UISounds) window.UISounds.notify();
        showToast(`رقم هاتف ${name}: ${cleanPhone}`, 'success');
        // Optional: Trigger tel link after a short delay if on mobile
        if(/Android|iPhone/i.test(navigator.userAgent)) {
            setTimeout(() => { window.location.href = `tel:${cleanPhone}`; }, 1500);
        }
    } else {
        if(window.UISounds) window.UISounds.error();
        showToast(`لا يوجد رقم تواصل لمدرسة ${name} حالياً`, 'error');
    }
};

function showSchoolDetails(id) {
    const school = schoolsData.find(s => s.id === id);
    if (!school) return;

    let modal = document.getElementById('detailsModal');
    if (!modal) {
        // Create modal dynamically if it doesn't exist
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'detailsModal';
        modal.innerHTML = `
            <div class="modal-box" style="max-width: 600px; text-align: right;">
                <div class="modal-header">
                    <h3 class="modal-title" id="detailsTitle">تفاصيل المدرسة</h3>
                    <i class="fa-solid fa-xmark modal-close" onclick="closeDetailsModal()"></i>
                </div>
                <div id="detailsContent" style="padding: 20px; color: #1a2942;"></div>
                <div style="padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="closeDetailsModal()" style="flex: 1;">إغلاق</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const title = document.getElementById('detailsTitle');
    const content = document.getElementById('detailsContent');

    title.textContent = school.name;
    content.innerHTML = `
        <div style="display:grid; gap:15px;">
            <div><strong>📍 الموقع:</strong> ${school.address}</div>
            <div><strong>♿ أنواع الإعاقة:</strong> ${school.details.disabilityTypes}</div>
            <div><strong>👥 عدد الطلبة ذوي الإعاقة:</strong> ${school.details.studentCount}</div>
            <hr style="border:0; border-top:1px solid #eee;">
            <div><strong>⚠️ التحديات:</strong> ${school.details.challenges}</div>
            <div><strong>💡 الاحتياجات:</strong> ${school.details.needs}</div>
            <div><strong>📅 خطط مستقبلية:</strong> ${school.details.futurePlans}</div>
        </div>
    `;
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.classList.remove('show');
}

// Logic for index.html
function renderHomePage() {
    // Categories rendering removed as per user request

    // Getting schools from our data.js (which defined schoolsData)
    const schools = typeof schoolsData !== 'undefined' ? schoolsData : [];

    const readyCount = schools.filter(s => s.readiness === 'مهيأة').length;
    const partialCount = schools.filter(s => s.readiness === 'جزئي').length;
    const notReadyCount = schools.filter(s => s.readiness === 'غير مهيأة').length;

    // Render Stats
    const statsRow = document.getElementById('statsRow');
    if (statsRow) {
        statsRow.innerHTML = `
            <div class="stat-box">
                <div class="stat-icon-circle"><i class="fa-solid fa-school"></i></div>
                <div>
                    <div class="stat-number">${schools.length}</div>
                    <div class="stat-label">إجمالي المدارس</div>
                </div>
            </div>
            <div class="stat-box ready">
                <div class="stat-icon-circle"><i class="fa-solid fa-check-double"></i></div>
                <div>
                    <div class="stat-number">${readyCount}</div>
                    <div class="stat-label">مدارس مهيأة</div>
                </div>
            </div>
            <div class="stat-box partial">
                <div class="stat-icon-circle"><i class="fa-solid fa-arrows-rotate"></i></div>
                <div>
                    <div class="stat-number">${partialCount}</div>
                    <div class="stat-label">جزئياً مهيأة</div>
                </div>
            </div>
            <div class="stat-box not-ready">
                <div class="stat-icon-circle"><i class="fa-solid fa-xmark"></i></div>
                <div>
                    <div class="stat-number">${notReadyCount}</div>
                    <div class="stat-label">غير مهيأة</div>
                </div>
            </div>
        `;
    }

    // Render Nearby List (First 5 schools)
    const nearbyList = document.getElementById('nearbyList');
    if (nearbyList) {
        nearbyList.innerHTML = schools.slice(0, 5).map(s => {
            let rc = s.readiness === 'مهيأة' ? 'status-green' : s.readiness === 'جزئي' ? 'status-orange' : 'status-red';
            return `
            <div class="school-list-item" onclick="showSchoolDetails('${s.id}')" style="cursor:pointer;">
                <div class="school-thumb" style="background-image: url('assets/img/schools/${s.id}.jpg'), url('assets/img/notfound.png'); background-color: #f8fafc;"></div>
                <div style="flex:1">
                    <div style="font-weight: 700; color: #1a2942; font-size: 14px;">${s.name}</div>
                    <div style="font-size: 11px; color: #64748b;"><i class="fa-solid fa-location-dot"></i> ${s.district}</div>
                    <span class="status-badge ${rc}">${s.readiness}</span>
                </div>
            </div>
            `;
        }).join('');
    }


    // Search Box Listener
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    searchBtn?.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `schools.html?q=${encodeURIComponent(query)}`;
        } else {
            if (window.UISounds) window.UISounds.error();
        }
    });
    // Allow Enter key to search
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `schools.html?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

// Logic for schools.html
// Note: renderSchoolsPage was removed as schools.html now handles its own rendering logic.

// Modal Registration & Profile Logic
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openRegisterBtn');
    const modal = document.getElementById('registerModal');
    const closeBtn = document.getElementById('closeModalBtn');

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const btnNextStep = document.getElementById('btnNextStep');
    const modalTitle = document.getElementById('modalTitle');

    // File upload display
    const fileInput = document.getElementById('profileImageInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                fileNameDisplay.textContent = this.files[0].name;
            } else {
                fileNameDisplay.textContent = 'اختر صورة من جهازك';
            }
        });
    }

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            if (localStorage.getItem('wusool_logged_in') || localStorage.getItem('wusool_user_name')) {
                let logoutModal = document.getElementById('logoutModal');
                if (!logoutModal) {
                    logoutModal = document.createElement('div');
                    logoutModal.className = 'modal-overlay';
                    logoutModal.id = 'logoutModal';
                    logoutModal.innerHTML = `
                        <div class="modal-box" style="max-width: 400px; text-align: center; border-radius: 24px; padding: 40px 30px;">
                            <div style="font-size: 50px; color: #e74c3c; margin-bottom: 20px; animation: floatUp 3s infinite alternate;">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <h3 style="color: #1a2942; margin-bottom: 15px; font-size: 24px; font-weight: 800;">تسجيل الخروج</h3>
                            <p style="color: #64748b; margin-bottom: 30px; font-size: 15px; line-height: 1.6;">هل أنت متأكد أنك تريد تسجيل الخروج من منصة وصول؟</p>
                            <div style="display: flex; gap: 15px;">
                                <button class="btn-secondary" id="cancelLogoutBtn" style="flex: 1; border-radius: 12px; font-size: 15px; padding: 12px;">إلغاء</button>
                                <button class="btn-primary" id="confirmLogoutBtn" style="flex: 1; border-radius: 12px; font-size: 15px; padding: 12px; background: linear-gradient(135deg, #e74c3c, #c0392b); box-shadow: 0 10px 20px rgba(231, 76, 60, 0.3);">تأكيد الخروج</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(logoutModal);

                    document.getElementById('cancelLogoutBtn').addEventListener('click', () => {
                        logoutModal.classList.remove('show');
                    });

                    document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
                        localStorage.removeItem('wusool_user_name');
                        localStorage.removeItem('wusool_user_image');
                        localStorage.removeItem('wusool_logged_in');
                        window.location.href = 'login.html';
                    });
                }
                setTimeout(() => logoutModal.classList.add('show'), 10);
            } else {
                modal.classList.add('show');
            }
        });
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            // Reset to step 1 smoothly
            setTimeout(() => {
                step1.classList.add('active');
                step2.classList.remove('active');
                modalTitle.textContent = "تسجيل حساب جديد";
                if (fileInput) fileInput.value = "";
                if (fileNameDisplay) fileNameDisplay.textContent = "اختر صورة من جهازك";
            }, 300);
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Transition to Step 2
    if (btnNextStep) {
        btnNextStep.addEventListener('click', () => {
            const nameInput = document.getElementById('userNameInput');
            const emailInput = document.querySelector('input[type="email"]');
            const passInput = document.querySelector('input[type="password"]');

            const nameValue = nameInput?.value.trim();
            const emailValue = emailInput?.value.trim();
            const passValue = passInput?.value.trim();

            // 1. Name Validation (Only English, Start with Capital, No Numbers, No All-Caps)
            const nameRegex = /^[A-Z][a-zA-Z\s]*$/;
            if (!nameValue) {
                if (window.UISounds) window.UISounds.error();
                nameInput.style.borderColor = "#e74c3c";
                showToast("يرجى إدخال الاسم الشخصي.", "error");
                return;
            } else if (!nameRegex.test(nameValue)) {
                if (window.UISounds) window.UISounds.error();
                nameInput.style.borderColor = "#e74c3c";
                showToast("يجب أن يبدأ الاسم بحرف كبير، وباللغة الإنجليزية فقط وبدون أرقام.", "error");
                return;
            } else { nameInput.style.borderColor = "#e2e8f0"; }

            // 2. Email Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailValue) {
                if (window.UISounds) window.UISounds.error();
                emailInput.style.borderColor = "#e74c3c";
                showToast("يرجى إدخال البريد الإلكتروني.", "error");
                return;
            } else if (!emailRegex.test(emailValue)) {
                if (window.UISounds) window.UISounds.error();
                emailInput.style.borderColor = "#e74c3c";
                showToast("صيغة البريد الإلكتروني غير صحيحة.", "error");
                return;
            } else { emailInput.style.borderColor = "#e2e8f0"; }

            // 3. Password Validation (8+ chars and must have numbers)
            const passHasNumber = /\d/.test(passValue);
            if (!passValue) {
                if (window.UISounds) window.UISounds.error();
                passInput.style.borderColor = "#e74c3c";
                showToast("يرجى إدخال كلمة المرور.", "error");
                return;
            } else if (passValue.length < 8) {
                if (window.UISounds) window.UISounds.error();
                passInput.style.borderColor = "#e74c3c";
                showToast("كلمة المرور قصيرة جداً (8 أحرف كحد أدنى).", "error");
                return;
            } else if (!passHasNumber) {
                if (window.UISounds) window.UISounds.error();
                passInput.style.borderColor = "#e74c3c";
                showToast("يجب أن تحتوي كلمة المرور على أرقام.", "error");
                return;
            } else { passInput.style.borderColor = "#e2e8f0"; }

            // If all valid, save preliminary data and proceed
            localStorage.setItem('wusool_user_name', nameValue);
            applyUserData();

            step1.classList.remove('active');
            step2.classList.add('active');

            if (window.UISounds) window.UISounds.notify(); // Success Chime
            modalTitle.textContent = `أهلاً بك، ${nameValue}!`;
        });
    }

    // Avatar Selection Logic
    const avatars = document.querySelectorAll('.avatar-item');
    avatars.forEach(item => {
        item.addEventListener('click', () => {
            avatars.forEach(a => a.classList.remove('selected'));
            item.classList.add('selected');

            // Save the selected image as user image
            const img = item.querySelector('img');
            if (img) {
                localStorage.setItem('wusool_user_image', img.src);
                applyUserData();
                if (window.UISounds) window.UISounds.notify();
            }
        });
    });



    // Prevent numbers in Name Input (Real-time)
    const userNameInput = document.getElementById('userNameInput');
    if (userNameInput) {
        userNameInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[0-9]/g, '');
        });
    }

    // Background Selection Logic
    const bgItems = document.querySelectorAll('.bg-item');
    bgItems.forEach(item => {
        item.addEventListener('click', () => {
            bgItems.forEach(b => b.classList.remove('selected'));
            item.classList.add('selected');
        });
    });

    // Skip / Save Buttons
    const btnSkip = document.getElementById('btnSkip');
    const btnSave = document.getElementById('btnSave');
    const nameInput = document.getElementById('userNameInput');
    // fileInput is already declared above

    // Function to apply user data to UI
    function applyUserData() {
        const savedName = localStorage.getItem('wusool_user_name');
        const savedImage = localStorage.getItem('wusool_user_image');

        // Fix for junk data or orphan images without names
        if (savedName === 'ف' || savedName === 'f' || (!savedName && savedImage)) {
            localStorage.removeItem('wusool_user_name');
            localStorage.removeItem('wusool_user_image');
            location.reload();
            return;
        }

        const loginTexts = document.querySelectorAll('.login-text');
        const userIcons = document.querySelectorAll('.user-icon');

        if (savedName) {
            loginTexts.forEach(el => el.textContent = savedName);
        } else {
            loginTexts.forEach(el => el.textContent = 'تسجيل الدخول');
        }

        if (savedImage) {
            userIcons.forEach(el => {
                let thumb = el.querySelector('.user-profile-thumb');
                if (!thumb) {
                    el.innerHTML = ''; // Clear the default icon
                    thumb = document.createElement('img');
                    thumb.className = 'user-profile-thumb';
                    el.appendChild(thumb);
                }
                thumb.src = savedImage;
            });
        } else {
            // Restore default icon if no image
            userIcons.forEach(el => {
                el.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
            });
        }
    }

    // Run on load
    applyUserData();

    // Instant Save Listeners
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    localStorage.setItem('wusool_user_image', re.target.result);
                    applyUserData();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (btnSkip) btnSkip.addEventListener('click', closeModal);
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            if (window.UISounds) window.UISounds.notify();
            closeModal();
        });
    }
});

// Dynamic Settings Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Settings Modal HTML into body to work across all pages
    const settingsModalHTML = `
    <div class="modal-overlay" id="settingsModal">
        <div class="modal-box modal-box-animated" style="max-width: 380px;">
            <div class="modal-header">
                <h3 class="modal-title" data-i18n="settings_title">⚙️ إعدادات المنصة</h3>
                <i class="fa-solid fa-xmark modal-close" id="closeSettingsBtn"></i>
            </div>
            <div class="modal-body-custom">
                <div class="setting-row">
                    <span class="setting-label" data-i18n="setting_dark">الوضع الليلي</span>
                    <button class="btn-secondary glow-moon" id="toggleDarkModeBtn" data-i18n="btn_enable">تفعيل</button>
                </div>
                <div class="setting-row">
                    <span class="setting-label" data-i18n="setting_font">حجم الخط</span>
                    <div class="font-controls">
                        <button class="btn-secondary" id="decreaseFontBtnSettings">- A</button>
                        <button class="btn-secondary" id="increaseFontBtnSettings">+ A</button>
                    </div>
                </div>
                <div class="setting-row">
                    <span class="setting-label" data-i18n="setting_contrast">التباين العالي</span>
                    <button class="btn-secondary" id="toggleContrastBtnSettings" data-i18n="btn_enable">تفعيل</button>
                </div>
                <div class="setting-row">
                    <span class="setting-label" data-i18n="setting_voice">القارئ الصوتي التفاعلي</span>
                    <button class="btn-secondary" id="toggleVoiceReaderBtn" data-i18n="btn_enable">تفعيل</button>
                </div>
            </div>
            <button class="btn-primary pulse-save" id="saveSettingsBtn" style="margin-top:25px; width:100%;" data-i18n="btn_save_close">حفظ وإغلاق</button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', settingsModalHTML);
    if (window.updateLanguage) window.updateLanguage();

    // 2. Attach events
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
    const toggleContrastBtn = document.getElementById('toggleContrastBtnSettings');

    // Target the hamburger icon in the sidebar
    const barsIcon = document.querySelector('.sidebar-item .fa-bars');
    if (barsIcon) {
        const barsBtn = barsIcon.parentElement;
        barsBtn.style.cursor = 'pointer';
        barsBtn.addEventListener('click', () => {
            settingsModal.classList.add('show');
        });
    }

    function closeSettings() {
        if (settingsModal) settingsModal.classList.remove('show');
    }

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', closeSettings);
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }

    // Filter toggles (Dark Mode & High Contrast)
    let isDark = localStorage.getItem('dark-mode') === 'true';
    let isHighContrast = localStorage.getItem('high-contrast') === 'true';

    function getLangText(key) {
        const lang = localStorage.getItem('selectedLang') || 'ar';
        return (translations && translations[lang] && translations[lang][key]) ? translations[lang][key] : (key === 'btn_enable' ? 'تفعيل' : 'إيقاف');
    }

    function updateBtnTexts() {
        if (toggleDarkModeBtn) {
            toggleDarkModeBtn.textContent = isDark ? getLangText('btn_disable') + " ☀️" : getLangText('btn_enable') + " 🌙";
        }
        if (toggleContrastBtn) {
            toggleContrastBtn.textContent = isHighContrast ? getLangText('btn_disable') + " 💡" : getLangText('btn_enable') + " 💡";
        }
    }

    // Initial Apply
    if (isDark) document.documentElement.classList.add('dark-theme');
    if (isHighContrast) document.body.classList.add('high-contrast-mode');
    updateBtnTexts();

    function applyFilters() {
        if (isDark) {
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('dark-mode', 'true');
        } else {
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('dark-mode', 'false');
        }

        if (isHighContrast) {
            document.body.classList.add('high-contrast-mode');
            localStorage.setItem('high-contrast', 'true');
        } else {
            document.body.classList.remove('high-contrast-mode');
            localStorage.setItem('high-contrast', 'false');
        }
        updateBtnTexts();
    }

    if (toggleDarkModeBtn) {
        toggleDarkModeBtn.addEventListener('click', () => {
            isDark = !isDark;
            applyFilters();
        });
    }

    if (toggleContrastBtn) {
        toggleContrastBtn.addEventListener('click', () => {
            isHighContrast = !isHighContrast;
            applyFilters();
        });
    }

    // Font size controls
    let fontSizeLevel = 0;
    const incFS = document.getElementById('increaseFontBtnSettings');
    const decFS = document.getElementById('decreaseFontBtnSettings');
    if (incFS && decFS) {
        incFS.addEventListener('click', () => {
            if (fontSizeLevel < 2) fontSizeLevel++;
            updateFontSize();
        });
        decFS.addEventListener('click', () => {
            if (fontSizeLevel > -1) fontSizeLevel--;
            updateFontSize();
        });

        function updateFontSize() {
            document.body.style.zoom = fontSizeLevel === 1 ? '1.1' : fontSizeLevel === 2 ? '1.2' : fontSizeLevel === -1 ? '0.9' : '1';
        }
    }

    // Voice Reader Logic
    let voiceReaderEnabled = false;
    let tooltipElement = document.createElement('div');
    tooltipElement.className = 'reader-tooltip';
    tooltipElement.innerHTML = '<i class="fa-solid fa-volume-high" style="margin-left: 10px; color: #1a2942; font-size: 14px;"></i><div class="soundwave"><span></span><span></span><span></span><span></span></div>';
    document.body.appendChild(tooltipElement);

    const synth = window.speechSynthesis;
    let voices = [];
    const loadVoices = () => { voices = synth.getVoices(); };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    const setArabicVoice = (msg) => {
        msg.lang = 'ar-SA';

        let arVoice = null;

        // 1. Give priority to Google's online Arabic voice (highest quality on Chrome/Linux)
        arVoice = voices.find(v => v.name.includes('Google') && (v.name.includes('Arabic') || v.name.includes('العربية')));

        // 2. Fallback to known local male voices
        if (!arVoice) {
            arVoice = voices.find(v => v.name.includes('Naayf') || v.name.includes('Maged') || v.name.includes('Majed') || v.name.includes('Tarik'));
        }

        // 3. Fallback to ANY voice where language starts with 'ar'
        if (!arVoice) {
            arVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
        }

        // 4. Fallback to ANY voice with Arabic in the name
        if (!arVoice) {
            arVoice = voices.find(v => v.name.toLowerCase().includes('arabic') || v.name.includes('العربية'));
        }

        if (arVoice) {
            msg.voice = arVoice;
            msg.lang = arVoice.lang; // match the exact language code of the voice
        } else {
            msg.lang = 'ar'; // hard fallback for OS mapping
        }

        msg.pitch = 0.85;
        msg.rate = 0.85;
    };

    const toggleVoiceReaderBtn = document.getElementById('toggleVoiceReaderBtn');
    if (toggleVoiceReaderBtn) {
        toggleVoiceReaderBtn.addEventListener('click', () => {
            voiceReaderEnabled = !voiceReaderEnabled;
            toggleVoiceReaderBtn.textContent = voiceReaderEnabled ? "إيقاف 🔊" : "تفعيل 🔊";
            if (!voiceReaderEnabled) {
                window.speechSynthesis.cancel();
                tooltipElement.style.opacity = '0';
                document.querySelectorAll('.reader-highlight').forEach(el => el.classList.remove('reader-highlight'));
            } else {
                const msg = new SpeechSynthesisUtterance("تم تفعيل القارئ الصوتي");
                setArabicVoice(msg);
                window.speechSynthesis.speak(msg);
            }
        });
    }

    let currentReaderElement = null;
    let fallbackTimer = null;
    const readableSelectors = 'h1, h2, h3, h4, p, a, button, .sidebar-item, .stat-box, .school-card, .district-info, span.badge';

    document.addEventListener('mousemove', (e) => {
        if (voiceReaderEnabled && tooltipElement.style.opacity === '1') {
            tooltipElement.style.left = (e.pageX + 15) + 'px';
            tooltipElement.style.top = (e.pageY - 40) + 'px';
        }
    });

    document.body.addEventListener('mouseover', (e) => {
        if (!voiceReaderEnabled) return;
        const target = e.target.closest(readableSelectors);
        if (target && target !== currentReaderElement) {
            currentReaderElement = target;
            target.classList.add('reader-highlight');

            tooltipElement.style.opacity = '1';
            tooltipElement.classList.add('active');
            tooltipElement.style.left = (e.pageX + 15) + 'px';
            tooltipElement.style.top = (e.pageY - 40) + 'px';

            synth.cancel();
            clearTimeout(fallbackTimer);

            const textToSpeak = target.innerText || target.textContent;
            if (textToSpeak.trim() !== '') {
                const msg = new SpeechSynthesisUtterance(textToSpeak.trim());
                setArabicVoice(msg);

                msg.onend = () => {
                    tooltipElement.classList.remove('active');
                };

                synth.speak(msg);

                // fallback if ending fails occasionally
                fallbackTimer = setTimeout(() => {
                    tooltipElement.classList.remove('active');
                }, textToSpeak.length * 150 + 1000);
            } else {
                tooltipElement.classList.remove('active');
            }
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (!voiceReaderEnabled) return;
        const target = e.target.closest(readableSelectors);
        if (target && currentReaderElement === target) {
            target.classList.remove('reader-highlight');
            currentReaderElement = null;
            tooltipElement.style.opacity = '0';
            tooltipElement.classList.remove('active');
            synth.cancel();
            clearTimeout(fallbackTimer);
        }
    });

    // 3. Coming Soon Modal Injection & Logic
    const comingSoonHTML = `
    <div class="modal-overlay" id="comingSoonModal">
        <div class="modal-box coming-soon-box">
            <div class="lock-icon-container">
                <i class="fa-solid fa-lock" style="animation: lockShake 1.5s infinite ease-in-out;"></i>
            </div>
            <h2 class="soon-text" style="font-family: 'Kufam', sans-serif; font-size: 32px; font-weight: 800; color: #1a2942; margin: 10px 0; text-transform: uppercase; letter-spacing: 4px;">soon</h2>
            <p class="soon-subtext" style="color: #64748b; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">هذه الصفحة قيد التطوير حالياً في منصة وصول، سنكون معكم قريباً!</p>
            <button class="btn-primary" id="closeSoonBtn">فهمت ذلك</button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', comingSoonHTML);

    const comingSoonModal = document.getElementById('comingSoonModal');
    const closeSoonBtn = document.getElementById('closeSoonBtn');

    if (closeSoonBtn) {
        closeSoonBtn.addEventListener('click', () => comingSoonModal.classList.remove('show'));
    }

    if (comingSoonModal) {
        comingSoonModal.addEventListener('click', (e) => {
            if (e.target === comingSoonModal) comingSoonModal.classList.remove('show');
        });
    }

    // Contact page is now ready — no blocking needed
    // Coming Soon modal is kept only for truly incomplete features

    // Add Drag-to-Scroll (Swipe emulation) to Sidebar and Categories
    const scrollableElements = document.querySelectorAll('.sidebar, .categories-grid');
    scrollableElements.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'pointer';
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'pointer';
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast multiplier
            slider.scrollLeft = scrollLeft - walk;
        });
    });
});
