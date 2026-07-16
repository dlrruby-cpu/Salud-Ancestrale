/**********************************************
 * Salud Ancestrale - Lógica completa
 **********************************************/

// Objeto global que usa el HTML
var SaludAncestral = SaludAncestral || {};

(function () {
    'use strict';

    // ---------- Navegación entre secciones ----------
    function initNavigation() {
        var navLinks = document.querySelectorAll('.nav a');
        var sections = document.querySelectorAll('.section');

        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var target = this.getAttribute('data-section');
                // Desactivar todas las secciones y enlaces
                sections.forEach(function (sec) { sec.classList.remove('active'); });
                navLinks.forEach(function (l) { l.classList.remove('active'); });
                // Activar la sección correspondiente
                var activeSection = document.getElementById('section-' + target);
                if (activeSection) activeSection.classList.add('active');
                this.classList.add('active');
            });
        });
    }

    // ---------- Expansión de detalles ----------
    SaludAncestral.toggleDetails = function (detailId, btn) {
        var detail = document.getElementById(detailId);
        if (!detail) return;
        var isOpen = detail.classList.contains('show');
        if (isOpen) {
            detail.classList.remove('show');
            if (btn) btn.textContent = '📜 Ver historia +';
        } else {
            detail.classList.add('show');
            if (btn) btn.textContent = '📜 Ocultar historia -';
        }
    };

    // ---------- Lectura en voz alta (tarjetas y secciones) ----------
    var speechSynth = window.speechSynthesis;
    var speaking = false;
    var currentUtterance = null;

    function stopSpeaking() {
        if (speechSynth.speaking || speechSynth.pending) {
            speechSynth.cancel();
        }
        speaking = false;
    }

    function speakText(text, buttonElement) {
        stopSpeaking();
        if (!text) return;
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.onstart = function () {
            speaking = true;
            if (buttonElement) {
                buttonElement.classList.add('playing');
                buttonElement.textContent = '🔊 Detener';
            }
        };
        utterance.onend = function () {
            speaking = false;
            if (buttonElement) {
                buttonElement.classList.remove('playing');
                buttonElement.textContent = buttonElement.getAttribute('data-original-text') || '🔊 Escuchar';
            }
        };
        utterance.onerror = function () {
            speaking = false;
            if (buttonElement) {
                buttonElement.classList.remove('playing');
            }
        };
        currentUtterance = utterance;
        speechSynth.speak(utterance);
    }

    SaludAncestral.speakCard = function (cardId, btn) {
        var card = document.getElementById(cardId);
        if (!card) return;
        // Extraer todo el texto visible de la tarjeta
        var text = card.innerText || card.textContent;
        if (btn) {
            btn.setAttribute('data-original-text', btn.textContent);
        }
        speakText(text, btn);
    };

    SaludAncestral.speakSection = function (sectionId, btn) {
        var section = document.getElementById(sectionId);
        if (!section) return;
        var text = section.innerText || section.textContent;
        if (btn) {
            btn.setAttribute('data-original-text', btn.textContent);
        }
        speakText(text, btn);
    };

    // Botón flotante global (lee la sección activa)
    function initFloatingSpeakButton() {
        var speakBtn = document.getElementById('speakButton');
        if (!speakBtn) return;
        speakBtn.addEventListener('click', function () {
            var activeSection = document.querySelector('.section.active');
            if (!activeSection) return;
            var text = activeSection.innerText || activeSection.textContent;
            speakText(text, speakBtn);
        });
    }

    // ---------- Donación PayPal ----------
    SaludAncestral.openPayPalDonation = function (email) {
        var url = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=' +
                  encodeURIComponent(email) +
                  '&item_name=Apoyo+a+Salud+Ancestrale&currency_code=EUR';
        window.open(url, '_blank');
    };

    // ---------- Aviso legal y reproducción de música ----------
    function initLegalConsent() {
        var overlay = document.getElementById('legalOverlay');
        var btnAccept = document.getElementById('acceptLegalBtn');
        var btnReject = document.getElementById('rejectLegalBtn');
        var audio = document.getElementById('bgMusic');

        // Mostrar overlay si no hay consentimiento guardado
        if (!localStorage.getItem('consentimientoLegal')) {
            overlay.classList.add('show');
        } else {
            // Si ya aceptó, intentar reproducir música automáticamente
            if (localStorage.getItem('consentimientoLegal') === 'aceptado' && audio) {
                audio.volume = 0.03;
                audio.play().catch(function (e) {
                    console.log('Autoplay bloqueado, esperando interacción.');
                });
            }
        }

        btnAccept.addEventListener('click', function () {
            localStorage.setItem('consentimientoLegal', 'aceptado');
            localStorage.setItem('cookiesAceptadas', 'true');
            localStorage.setItem('fechaConsentimiento', new Date().toISOString());
            overlay.classList.remove('show');

            // Iniciar hilo musical
            if (audio) {
                audio.volume = 0.03;
                audio.play().catch(function (e) {
                    console.log('Error al reproducir música:', e);
                });
            }

            // Aquí puedes añadir inicialización de analytics si lo deseas
            // SaludAncestral.initializeAnalytics();
        });

        btnReject.addEventListener('click', function () {
            localStorage.setItem('consentimientoLegal', 'rechazado');
            localStorage.setItem('cookiesAceptadas', 'false');
            overlay.classList.remove('show');
            console.log('El usuario ha rechazado cookies y análisis.');
        });
    }

    // ---------- Inicialización general ----------
    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initFloatingSpeakButton();
        initLegalConsent();

        // También permitir cerrar los modales de aviso legal, privacidad y cookies
        var closeButtons = document.querySelectorAll('.legal-modal .btn-accept, .legal-modal .btn-reject');
        closeButtons.forEach(function (btn) {
            if (btn.id === 'acceptLegalBtn' || btn.id === 'rejectLegalBtn') return; // ya gestionados
            btn.addEventListener('click', function () {
                var modal = this.closest('.legal-overlay');
                if (modal) modal.classList.remove('show');
            });
        });
    });

})();
