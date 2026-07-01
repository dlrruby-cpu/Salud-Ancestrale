// ============================================================
// 1. NAVEGACIÓN POR SECCIONES (pestañas)
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

    // Ocultar todas las secciones menos la activa por defecto
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections.inicio.classList.add('active');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionName = this.dataset.section;
            // Cambiar clase activa en los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // Mostrar la sección correspondiente
            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle('active', key === sectionName);
            });
        });
    });

    // ============================================================
    // 2. BOTONES "LEER MÁS" (expandir detalles)
    // ============================================================
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

    // ============================================================
    // 3. BOTONES DE AUDIO (texto a voz) - por card
    // ============================================================
    const audioBtns = document.querySelectorAll('.btn-audio');
    let currentAudio = null;

    audioBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card');
            // Buscar el texto que se va a leer: puede ser el contenido de .details o .card-content
            let textToSpeak = '';
            const details = card.querySelector('.details');
            if (details && details.classList.contains('show')) {
                textToSpeak = details.textContent.trim();
            } else {
                // Si no está expandido, leemos el nombre y la curiosidad
                const name = card.querySelector('.medicine-name')?.textContent.trim() || '';
                const preview = card.querySelector('.curiosity-preview')?.textContent.trim() || '';
                textToSpeak = name + '. ' + preview;
            }

            if (!textToSpeak) {
                alert('No hay texto para leer en esta tarjeta.');
                return;
            }

            // Detener cualquier audio anterior
            if (currentAudio) {
                window.speechSynthesis.cancel();
                currentAudio = null;
                document.querySelectorAll('.btn-audio').forEach(b => b.classList.remove('playing'));
            }

            // Crear y reproducir
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onstart = function () {
                btn.classList.add('playing');
                btn.textContent = '🔊 Reproduciendo...';
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

    // ============================================================
    // 4. BOTÓN FLOTANTE DE LECTURA GLOBAL (texto completo de la sección activa)
    // ============================================================
    const globalSpeakBtn = document.querySelector('.speak-btn');
    let globalUtterance = null;

    globalSpeakBtn.addEventListener('click', function () {
        // Si ya está sonando, lo detenemos
        if (globalUtterance && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            globalUtterance = null;
            this.classList.remove('playing');
            this.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            return;
        }

        // Obtener la sección activa
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        // Extraer texto legible: excluir botones, etc.
        const clones = activeSection.cloneNode(true);
        // Eliminar elementos que no queremos leer (botones, etc.)
        clones.querySelectorAll('.btn-expand, .btn-audio, .section-speak-btn, .btn-row').forEach(el => el.remove());
        let fullText = clones.textContent.trim();
        // Limpiar espacios extras
        fullText = fullText.replace(/\s+/g, ' ').trim();

        if (!fullText) {
            alert('No hay contenido para leer en esta sección.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.pitch = 1;

        utterance.onstart = function () {
            globalSpeakBtn.classList.add('playing');
            globalSpeakBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        };
        utterance.onend = function () {
            globalSpeakBtn.classList.remove('playing');
            globalSpeakBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            globalUtterance = null;
        };
        utterance.onerror = function () {
            globalSpeakBtn.classList.remove('playing');
            globalSpeakBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
            globalUtterance = null;
        };

        globalUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    });

    // ============================================================
    // 5. BOTÓN DE LECTURA POR SECCIÓN (dentro de cada sección)
    // ============================================================
    const sectionSpeakBtns = document.querySelectorAll('.section-speak-btn');
    sectionSpeakBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const section = this.closest('.section');
            if (!section) return;
            // Clonar para eliminar botones
            const clone = section.cloneNode(true);
            clone.querySelectorAll('.btn-expand, .btn-audio, .section-speak-btn, .btn-row').forEach(el => el.remove());
            let text = clone.textContent.trim().replace(/\s+/g, ' ');
            if (!text) return;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.7;
            window.speechSynthesis.speak(utterance);
        });
    });

    // ============================================================
    // 6. MODAL LEGAL (consentimiento de cookies/privacidad)
    // ============================================================
    const legalOverlay = document.getElementById('legalOverlay');
    const acceptBtn = document.getElementById('acceptLegalBtn');

    // Comprobar si ya se aceptó (usamos sessionStorage para que dure solo en la sesión)
    if (sessionStorage.getItem('legalAccepted') === 'true') {
        legalOverlay.classList.remove('show');
        legalOverlay.style.display = 'none';
    } else {
        legalOverlay.classList.add('show');
        legalOverlay.style.display = 'flex';
    }

    acceptBtn.addEventListener('click', function () {
        sessionStorage.setItem('legalAccepted', 'true');
        legalOverlay.classList.remove('show');
        legalOverlay.style.display = 'none';
    });

    // ============================================================
    // 7. ENLACES DEL FOOTER (Aviso Legal, Política de Privacidad, Cookies)
    // ============================================================
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

    // Cerrar modales secundarios con el botón "Cerrar" (ya tienen onclick inline)
    // También se puede cerrar haciendo clic fuera del modal
    document.querySelectorAll('.legal-overlay:not(#legalOverlay)').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
                this.classList.remove('show');
            }
        });
    });
});
