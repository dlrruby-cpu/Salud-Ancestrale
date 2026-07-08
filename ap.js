// ============================================================
// LÓGICA CENTRALIZADA DE SALUD ANCESTRALE (ap.js)
// ============================================================

// Declarar el objeto global esperado por las llamadas inline del HTML
window.SaludAncestral = {
    currentAudio: null,
    globalUtterance: null,

    // Detener instantáneamente cualquier síntesis de voz en reproducción
    stopAllAudio: function() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.currentAudio = null;
        this.globalUtterance = null;
        
        // Restaurar estados visuales de todos los botones
        document.querySelectorAll('.btn-audio').forEach(b => {
            b.classList.remove('playing');
            b.textContent = '🔊 Escuchar';
        });
        
        const globalSpeakBtn = document.querySelector('.speak-btn');
        if (globalSpeakBtn) {
            globalSpeakBtn.classList.remove('playing');
            globalSpeakBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        }
    },

    // 1. Alternar visualización de los detalles de la tarjeta (Leer Más)
    toggleDetails: function(idDetail, btn) {
        const details = document.getElementById(idDetail);
        if (details) {
            details.classList.toggle('show');
            btn.textContent = details.classList.contains('show') ? 'Leer menos' : 'Ver estudio +';
        }
    },

    // 2. Lectura Text-to-Speech focalizada para una sola tarjeta
    speakCard: function(cardId, btn) {
        const card = document.getElementById(cardId);
        if (!card) return;

        let textToSpeak = '';
        const details = card.querySelector('.details');
        
        if (details && details.classList.contains('show')) {
            // Si está expandido, clonamos el bloque para remover las etiquetas "GRADE" o botones visuales
            const clone = details.cloneNode(true);
            clone.querySelectorAll('.grade-badge, button').forEach(el => el.remove());
            textToSpeak = clone.textContent.trim();
        } else {
            // Si está cerrado, lee el encabezado básico y la preview
            const name = card.querySelector('.medicine-name')?.textContent.trim() || '';
            const preview = card.querySelector('.curiosity-preview')?.textContent.trim() || '';
            textToSpeak = name + '. ' + preview;
        }

        if (!textToSpeak) return;

        // Detener reproducción previa
        this.stopAllAudio();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => {
            btn.classList.add('playing');
            btn.textContent = '🔊 Leyendo...';
        };
        utterance.onend = () => {
            btn.classList.remove('playing');
            btn.textContent = '🔊 Escuchar';
            this.currentAudio = null;
        };
        utterance.onerror = () => {
            btn.classList.remove('playing');
            btn.textContent = '🔊 Escuchar';
            this.currentAudio = null;
        };

        this.currentAudio = utterance;
        window.speechSynthesis.speak(utterance);
    },

    // 3. Lectura integral de una sección completa
    speakSection: function(sectionId, btn) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        this.stopAllAudio();

        const clone = section.cloneNode(true);
        // Limpieza proactiva de basura visual e interactiva
        clone.querySelectorAll('.btn-expand, .btn-audio, .section-speak-btn, .btn-row, .donation-box, .grade-badge').forEach(el => el.remove());
        
        let text = clone.textContent.trim().replace(/\s+/g, ' ');
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.88;
        
        window.speechSynthesis.speak(utterance);
    }
};

// ============================================================
// MANEJADORES DE INTERFAZ DOM AL CARGAR LA PÁGINA
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

    // Navegación por Pestañas nativa
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            SaludAncestral.stopAllAudio(); // Limpiar audios al cambiar de sección
            
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

    // Control del Botón Flotante de lectura Global
    const globalSpeakBtn = document.querySelector('.speak-btn');
    if (globalSpeakBtn) {
        globalSpeakBtn.addEventListener('click', function () {
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                SaludAncestral.stopAllAudio();
                return;
            }

            const activeSection = document.querySelector('.section.active');
            if (!activeSection) return;

            SaludAncestral.speakSection(activeSection.id, this);
            
            // Animación del botón flotante (icono de pausa) mientras habla
            globalSpeakBtn.classList.add('playing');
            globalSpeakBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
        });
    }

    // Ventanas modales del Footer
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

    // Cerrar los modales haciendo click fuera de la caja
    document.querySelectorAll('.legal-overlay:not(#legalOverlay)').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.style.display = 'none';
                this.classList.remove('show');
            }
        });
    });
});
