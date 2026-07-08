// ============================================================
// SALUD ANCESTRALE - MOTOR JAVASCRIPT DE INTERFAZ Y AUDIO
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('#mainNav a');
    const sections = {
        inicio: document.getElementById('section-inicio'),
        medicinas: document.getElementById('section-medicinas'),
        articulos: document.getElementById('section-articulos'),
        papiro: document.getElementById('section-papiro'),
        sobre: document.getElementById('section-sobre')
    };

    // 1. GESTIÓN DE NAVEGACIÓN (Pestañas estáticas)
    Object.values(sections).forEach(sec => {
        if(sec) sec.classList.remove('active');
    });
    if(sections.inicio) sections.inicio.classList.add('active');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionName = this.dataset.section;
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            Object.keys(sections).forEach(key => {
                if(sections[key]) {
                    sections[key].classList.toggle('active', key === sectionName);
                }
            });
        });
    });

    // 2. BOTONES DE DESPLEGAR CONTENIDO ("Leer más")
    const expandBtns = document.querySelectorAll('.btn-expand');
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card');
            const details = card.querySelector('.details');
            if (details) {
                details.classList.toggle('show');
                this.textContent = details.classList.contains('show') ? 'Leer menos' : 'Leer más';
            }
        });
    });

    // 3. LECTURA ASISTIDA POR TARJETA (Texto a Voz optimizado)
    const audioBtns = document.querySelectorAll('.btn-audio');
    let currentAudio = null;

    audioBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card');
            let textToSpeak = '';
            
            const title = card.querySelector('.medicine-name')?.textContent.trim() || '';
            const story = card.querySelector('.story-pills')?.textContent.trim() || '';
            const preview = card.querySelector('.curiosity-preview')?.textContent.trim() || '';
            const analysis = card.querySelector('.technical-analysis')?.textContent.trim() || '';
            
            const details = card.querySelector('.details');
            if (details && details.classList.contains('show')) {
                const detailsText = details.textContent.trim();
                textToSpeak = `${title}. ${story}. ${preview} ${analysis} ${detailsText}`;
            } else {
                textToSpeak = `${title}. ${story}. ${preview} ${analysis}`;
            }

            if (currentAudio) {
                window.speechSynthesis.cancel();
                currentAudio = null;
                document.querySelectorAll('.btn-audio').forEach(b => {
                    b.classList.remove('playing');
                    b.textContent = '🔊 Escuchar';
                });
            }

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'es-ES';
            utterance.rate = 0.92;
            utterance.pitch = 1;

            utterance.onstart = function () {
                btn.classList.add('playing');
                btn.textContent = '⏸ Detener';
            };
            utterance.onend = function () {
                btn.classList.remove('playing');
                btn.textContent = '🔊 Escuchar';
                currentAudio = null;
            };
            utterance.onerror = function () {
                btn.classList.remove('playing');
                btn.textContent = '🔊 Escuchar';
                currentAudio = null;
            };

            currentAudio = utterance;
            window.speechSynthesis.speak(utterance);
        });
    });

    // 4. BOTÓN GLOBAL FLOTANTE (Lectura completa de la pantalla)
    const globalSpeakBtn = document.querySelector('.speak-btn');

    if (globalSpeakBtn) {
        globalSpeakBtn.addEventListener('click', function () {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                this.classList.remove('playing');
                this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
                return;
            }

            const activeSection = document.querySelector('.section.active');
            if (!activeSection) return;

            const clone = activeSection.cloneNode(true);
            clone.querySelectorAll('.btn-expand, .btn-audio, .section-speak-btn, .btn-row, .donation-section, .science-links').forEach(el => el.remove());
            
            let fullText = clone.textContent.trim().replace(/\s+/g, ' ');

            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'es-ES';
            utterance.rate = 0.90;

            utterance.onstart = () => {
                this.classList.add('playing');
                this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
            };
            utterance.onend = () => {
                this.classList.remove('playing');
                this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            };

            window.speechSynthesis.speak(utterance);
        });
    }

    // 5. CONTROL DEL BANNER DE CONSENTIMIENTO (SessionStorage técnico)
    const legalOverlay = document.getElementById('legalOverlay');
    const acceptBtn = document.getElementById('acceptLegalBtn');

    if (sessionStorage.getItem('ancestraleLegalAccepted') === 'true') {
        if(legalOverlay) {
            legalOverlay.classList.remove('show');
            legalOverlay.style.display = 'none';
        }
    } else {
        if(legalOverlay) {
            legalOverlay.classList.add('show');
            legalOverlay.style.display = 'flex';
        }
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            sessionStorage.setItem('ancestraleLegalAccepted', 'true');
            if(legalOverlay) {
                legalOverlay.classList.remove('show');
                legalOverlay.style.display = 'none';
            }
        });
    }

    // 6. VENTANAS EMERGENTES INLINE (Footer Legal)
    document.querySelector('.footer-links')?.addEventListener('click', function (e) {
        const target = e.target;
        if (target.tagName === 'A') {
            e.preventDefault();
            const id = target.getAttribute('data-modal');
            if (id) {
                const modal = document.getElementById(id);
                if (modal) {
                    modal.style.display = 'flex';
                    modal.classList.add('show');
                }
            }
        }
    });

    document.querySelectorAll('.legal-overlay:not(#legalOverlay)').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
                this.classList.remove('show');
            }
        });
    });
});

const SaludAncestral = {
    speakSection: function (sectionId, buttonElement) {
        window.speechSynthesis.cancel();
        const sec = document.getElementById(sectionId);
        if(!sec) return;
        
        const clone = sec.cloneNode(true);
        clone.querySelectorAll('.btn-expand, .btn-audio, .section-speak-btn, .btn-row, .donation-section, .science-links').forEach(el => el.remove());
        const text = clone.textContent.trim().replace(/\s+/g, ' ');
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.90;
        window.speechSynthesis.speak(utterance);
    }
};
