// Objeto Global para evitar colisiones de alcance
const SaludAncestral = {
    speechInstance: null,

    init: function() {
        this.setupNavigation();
        this.setupLegalModal();
        this.setupFloatingAudioButton();
    },

    // Navegación interactiva por secciones de la app
    setupNavigation: function() {
        const navLinks = document.querySelectorAll('#mainNav a');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetSection = link.getAttribute('data-section');

                // Detener cualquier audio al cambiar de pestaña
                window.speechSynthesis.cancel();
                this.resetAudioButtons();

                // Quitar estados activos
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                // Activar pestaña elegida
                link.classList.add('active');
                document.getElementById(`section-${targetSection}`).classList.add('active');
            });
        });
    },

    // Gestión del aviso legal obligatorio
    setupLegalModal: function() {
        const overlay = document.getElementById('legalOverlay');
        const acceptBtn = document.getElementById('acceptLegalBtn');

        // Mostrar el modal si no ha sido aceptado con anterioridad
        if (!localStorage.getItem('legalAccepted')) {
            overlay.classList.add('show');
        }

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('legalAccepted', 'true');
            overlay.classList.remove('show');
        });
    },

    // Botón flotante derecho de lectura global
    setupFloatingAudioButton: function() {
        const floatBtn = document.getElementById('speakButton');
        floatBtn.addEventListener('click', () => {
            // Encuentra qué sección está visible actualmente en pantalla
            const activeSection = document.querySelector('.section.active');
            if (activeSection) {
                const sectionId = activeSection.getAttribute('id');
                this.speakSection(sectionId, floatBtn);
            }
        });
    },

    // Desplegar información oculta de las tarjetas
    toggleDetails: function(detailId, button) {
        const detailBlock = document.getElementById(detailId);
        if (detailBlock.classList.contains('show')) {
            detailBlock.classList.remove('show');
            button.textContent = "Ver estudio +";
        } else {
            detailBlock.classList.add('show');
            button.textContent = "Ocultar estudio -";
        }
    },

    // Detener clases visuales activas de los audios
    resetAudioButtons: function() {
        document.querySelectorAll('.btn-audio, .section-speak-btn, .speak-btn').forEach(btn => {
            btn.classList.remove('playing');
        });
    },

    // Sintetizar el texto y leerlo en voz alta
    speakText: function(text, buttonElement) {
        window.speechSynthesis.cancel();

        if (buttonElement.classList.contains('playing')) {
            this.resetAudioButtons();
            return;
        }

        this.resetAudioButtons();

        this.speechInstance = new SpeechSynthesisUtterance(text);
        this.speechInstance.lang = 'es-ES';
        this.speechInstance.rate = 1.0;

        this.speechInstance.onstart = () => {
            buttonElement.classList.add('playing');
        };

        this.speechInstance.onend = () => {
            buttonElement.classList.remove('playing');
        };

        this.speechInstance.onerror = () => {
            buttonElement.classList.remove('playing');
        };

        window.speechSynthesis.speak(this.speechInstance);
    },

    // Lector de una tarjeta en concreto
    speakCard: function(cardId, button) {
        const card = document.getElementById(cardId);
        const title = card.querySelector('.medicine-name').innerText;
        const preview = card.querySelector('.curiosity-preview').innerText;
        const details = card.querySelector('.details').innerText;
        
        const fullText = `${title}. ${preview}. Detalles del estudio clínico: ${details}`;
        this.speakText(fullText, button);
    },

    // Lector completo de la sección abierta
    speakSection: function(sectionId, button) {
        const section = document.getElementById(sectionId);
        // Filtra los botones y textos técnicos para que la lectura sea fluida
        const clonedSection = section.cloneNode(true);
        clonedSection.querySelectorAll('button, .img-credit, style, script').forEach(el => el.remove());
        
        this.speakText(clonedSection.innerText, button);
    }
};

// Arrancar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    SaludAncestral.init();
});
