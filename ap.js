/**
 * SALUD ANCESTRALE - Sistema de Navegación y Audio
 * Aplicación moderna de Single Page Application (SPA) con texto a voz
 * Versión 2.0 - Refactorización completa
 */

const SaludAncestral = {
    // ============================================================
    // ESTADO GLOBAL
    // ============================================================
    state: {
        currentAudioButton: null,
        currentUtterance: null,
        globalUtterance: null,
        legalConsent: null,
        sections: {},
        navLinks: []
    },

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================
    config: {
        speechLang: 'es-ES',
        defaultRate: 0.85,
        cardRate: 0.9,
        sectionRate: 0.7,
        storageKey: 'legalConsent',
        consentExpiry: 30 * 24 * 60 * 60 * 1000 // 30 días en ms
    },

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    init() {
        // Verificar que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    },

    setup() {
        console.log('Inicializando Salud Ancestrale...');
        
        // Caché de elementos DOM
        this.cacheDOMElements();
        
        // Verificar soporte de Speech Synthesis
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis no soportado en este navegador');
        }

        // Configurar eventos
        this.setupEventDelegation();
        this.setupNavigation();
        this.setupLegalConsent();
        
        // Establecer sección por defecto
        this.switchSection('inicio');
        
        console.log('✓ Salud Ancestrale iniciado correctamente');
    },

    cacheDOMElements() {
        this.state.navLinks = document.querySelectorAll('#mainNav a');
        this.state.sections = {
            inicio: document.getElementById('section-inicio'),
            medicinas: document.getElementById('section-medicinas'),
            articulos: document.getElementById('section-articulos'),
            papiro: document.getElementById('section-papiro'),
            sobre: document.getElementById('section-sobre')
        };
        this.elements = {
            legalOverlay: document.getElementById('legalOverlay'),
            acceptBtn: document.getElementById('acceptLegalBtn'),
            rejectBtn: document.getElementById('rejectLegalBtn'),
            globalSpeakBtn: document.querySelector('.speak-btn'),
            footerLinks: document.querySelector('.footer-links'),
            paypalBtn: document.querySelector('.btn-paypal'),
            mainNav: document.getElementById('mainNav')
        };
    },

    // ============================================================
    // EVENTOS - DELEGACIÓN Y MANEJO
    // ============================================================
    setupEventDelegation() {
        // Delegación centralizada de eventos en el documento
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (target) {
                const action = target.dataset.action;
                const arg = target.dataset.arg;
                if (typeof this[action] === 'function') {
                    this[action](arg, target);
                }
            }
        });

        // Manejo de botones específicos (backwards compatibility)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-expand')) {
                this.toggleDetails(e.target);
            } else if (e.target.classList.contains('btn-audio')) {
                this.speakCard(e.target);
            } else if (e.target.classList.contains('section-speak-btn')) {
                this.speakSection(e.target);
            }
        });

        // Cerrar modales haciendo clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('legal-overlay') && 
                !e.target.closest('.legal-modal')) {
                this.closeModal(e.target);
            }
        });

        // Botón PayPal
        this.elements.paypalBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openDonation();
        });

        // Botón de lectura global flotante
        this.elements.globalSpeakBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleGlobalSpeech();
        });
    },

    setupNavigation() {
        this.state.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.dataset.section;
                this.switchSection(sectionName);
            });
        });
    },

    // ============================================================
    // NAVEGACIÓN Y SECCIONES
    // ============================================================
    switchSection(sectionName) {
        if (!this.state.sections[sectionName]) {
            console.warn(`Sección '${sectionName}' no encontrada`);
            return;
        }

        // Actualizar elementos activos
        this.state.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionName);
        });

        Object.entries(this.state.sections).forEach(([key, section]) => {
            if (section) {
                section.classList.toggle('active', key === sectionName);
            }
        });

        // Detener cualquier audio en reproducción
        this.stopAllSpeech();
    },

    // ============================================================
    // EXPANSIÓN/COLAPSO DE DETALLES
    // ============================================================
    toggleDetails(button) {
        const card = button.closest('.card');
        if (!card) return;

        const details = card.querySelector('.details');
        if (!details) return;

        const isExpanded = details.classList.toggle('show');
        
        // Actualizar botón con ARIA
        button.setAttribute('aria-expanded', isExpanded);
        button.textContent = isExpanded ? '▼ Leer menos' : '+ Ver estudio';
        
        // Scroll suave para que el usuario vea el contenido
        if (isExpanded) {
            setTimeout(() => {
                details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 50);
        }
    },

    // ============================================================
    // TEXTO A VOZ - CARD INDIVIDUAL
    // ============================================================
    speakCard(button) {
        const card = button.closest('.card');
        if (!card) return;

        const text = this.extractCardText(card);
        if (!text) {
            this.showNotification('No hay texto para leer en esta tarjeta.');
            return;
        }

        this.speak(text, button, this.config.cardRate);
    },

    extractCardText(card) {
        const details = card.querySelector('.details');
        
        if (details && details.classList.contains('show')) {
            return details.textContent.trim();
        }
        
        const name = card.querySelector('.medicine-name')?.textContent.trim() || '';
        const preview = card.querySelector('.curiosity-preview')?.textContent.trim() || '';
        return (name + '. ' + preview).trim();
    },

    // ============================================================
    // TEXTO A VOZ - SECCIÓN COMPLETA
    // ============================================================
    speakSection(button) {
        const section = button.closest('.section');
        if (!section) return;

        const text = this.extractSectionText(section);
        if (!text) {
            this.showNotification('No hay contenido para leer en esta sección.');
            return;
        }

        this.speak(text, button, this.config.sectionRate);
    },

    extractSectionText(section) {
        const clone = section.cloneNode(true);
        
        // Eliminar elementos que no queremos leer
        const elementsToRemove = '.btn-expand, .btn-audio, .section-speak-btn, .btn-row, .donate-container';
        clone.querySelectorAll(elementsToRemove).forEach(el => el.remove());
        
        let text = clone.textContent.trim();
        // Limpiar espacios extra
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    },

    // ============================================================
    // LECTURA GLOBAL (BOTÓN FLOTANTE)
    // ============================================================
    toggleGlobalSpeech() {
        // Si está hablando, detener
        if (this.state.globalUtterance && window.speechSynthesis.speaking) {
            this.stopAllSpeech();
            this.elements.globalSpeakBtn.classList.remove('playing');
            this.resetGlobalButton();
            return;
        }

        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        const text = this.extractSectionText(activeSection);
        if (!text) {
            this.showNotification('No hay contenido para leer.');
            return;
        }

        this.speakGlobal(text);
    },

    speakGlobal(text) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Síntesis de voz no disponible en tu navegador.');
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.config.speechLang;
        utterance.rate = this.config.defaultRate;
        utterance.pitch = 1;

        utterance.onstart = () => {
            this.elements.globalSpeakBtn.classList.add('playing');
            this.elements.globalSpeakBtn.innerHTML = this.getPlayingIcon();
        };

        utterance.onend = () => {
            this.resetGlobalButton();
        };

        utterance.onerror = (e) => {
            console.error('Error en síntesis de voz:', e);
            this.resetGlobalButton();
        };

        this.state.globalUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    },

    resetGlobalButton() {
        this.elements.globalSpeakBtn?.classList.remove('playing');
        this.elements.globalSpeakBtn.innerHTML = this.getSpeakerIcon();
        this.state.globalUtterance = null;
    },

    // ============================================================
    // MOTOR CENTRAL DE SÍNTESIS DE VOZ
    // ============================================================
    speak(text, button, rate = this.config.defaultRate) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Síntesis de voz no disponible.');
            return;
        }

        // Limpiar texto
        text = this.cleanText(text);
        
        if (!text) {
            this.showNotification('No hay texto para leer.');
            return;
        }

        // Detener speech anterior
        this.stopAllSpeech();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.config.speechLang;
        utterance.rate = rate;
        utterance.pitch = 1;

        utterance.onstart = () => {
            button?.classList.add('playing');
            if (button?.textContent) {
                button.dataset.originalText = button.textContent;
                button.textContent = '🔊 Reproduciendo...';
            }
            this.state.currentAudioButton = button;
        };

        utterance.onend = () => {
            this.resetAudioButton(button);
        };

        utterance.onerror = (e) => {
            console.error('Error en síntesis de voz:', e);
            this.resetAudioButton(button);
        };

        this.state.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    },

    resetAudioButton(button) {
        if (!button) return;
        button.classList.remove('playing');
        button.textContent = button.dataset.originalText || '🔊 Escuchar';
        this.state.currentUtterance = null;
    },

    stopAllSpeech() {
        window.speechSynthesis?.cancel();
        
        // Reset de botones
        document.querySelectorAll('.btn-audio.playing').forEach(btn => {
            this.resetAudioButton(btn);
        });
        
        this.state.currentUtterance = null;
    },

    cleanText(text) {
        return text
            .replace(/\[.*?\]/g, '') // Remover [...] 
            .replace(/\s+/g, ' ')    // Espacios múltiples a uno
            .trim();
    },

    // ============================================================
    // MODAL LEGAL Y CONSENTIMIENTO
    // ============================================================
    setupLegalConsent() {
        const consent = this.getLegalConsent();

        if (consent && !this.isConsentExpired(consent)) {
            this.hideLegalOverlay();
        } else {
            this.showLegalOverlay();
        }

        // Event listeners
        this.elements.acceptBtn?.addEventListener('click', () => this.acceptConsent());
        this.elements.rejectBtn?.addEventListener('click', () => this.rejectConsent());

        // Footer links
        this.elements.footerLinks?.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const modalId = e.target.getAttribute('data-modal');
                this.openModal(modalId);
            }
        });
    },

    acceptConsent() {
        const consentData = {
            accepted: true,
            timestamp: Date.now(),
            expiry: Date.now() + this.config.consentExpiry
        };
        localStorage.setItem(this.config.storageKey, JSON.stringify(consentData));
        this.state.legalConsent = consentData;
        this.hideLegalOverlay();
        console.log('✓ Consentimiento aceptado');
    },

    rejectConsent() {
        const consentData = {
            accepted: false,
            timestamp: Date.now(),
            expiry: Date.now() + this.config.consentExpiry
        };
        localStorage.setItem(this.config.storageKey, JSON.stringify(consentData));
        this.state.legalConsent = consentData;
        this.hideLegalOverlay();
        console.log('⚠ Consentimiento rechazado - cookies/analytics deshabilitados');
    },

    getLegalConsent() {
        try {
            return JSON.parse(localStorage.getItem(this.config.storageKey));
        } catch (e) {
            console.error('Error al leer consentimiento:', e);
            return null;
        }
    },

    isConsentExpired(consent) {
        return consent?.expiry < Date.now();
    },

    showLegalOverlay() {
        if (this.elements.legalOverlay) {
            this.elements.legalOverlay.classList.add('show');
            this.elements.legalOverlay.style.display = 'flex';
        }
    },

    hideLegalOverlay() {
        if (this.elements.legalOverlay) {
            this.elements.legalOverlay.classList.remove('show');
            this.elements.legalOverlay.style.display = 'none';
        }
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    },

    closeModal(overlay) {
        overlay.classList.remove('show');
        overlay.style.display = 'none';
    },

    // ============================================================
    // DONACIÓN PAYPAL
    // ============================================================
    openDonation() {
        const donationLink = 'https://www.paypal.com/donate?business=dlrx75@gmail.com&currency_code=USD';
        window.open(donationLink, '_blank', 'noopener,noreferrer');
    },

    // ============================================================
    // UTILIDADES UI
    // ============================================================
    showNotification(message) {
        // Implementación simple - puedes mejorarla con un toast
        console.info(message);
    },

    getSpeakerIcon() {
        return `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    },

    getPlayingIcon() {
        return `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    },

    // ============================================================
    // MÉTODOS PÚBLICOS PARA BACKWARD COMPATIBILITY
    // ============================================================
    toggleDetails(element) {
        this.toggleDetails(element);
    },

    speakCard(element) {
        this.speakCard(element);
    },

    speakSection(element) {
        this.speakSection(element);
    }
};

// ============================================================
// INICIAR CUANDO EL DOCUMENTO ESTÉ LISTO
// ============================================================
SaludAncestral.init();
