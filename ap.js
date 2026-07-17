/**********************************************
 * Salud Ancestrale - Lógica completa
 **********************************************/

var SaludAncestral = SaludAncestral || {};

(function () {
    'use strict';

    function initNavigation() {
        var navLinks = document.querySelectorAll('.nav a');
        var sections = document.querySelectorAll('.section');

        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var target = this.getAttribute('data-section');
                sections.forEach(function (sec) { sec.classList.remove('active'); });
                navLinks.forEach(function (l) { l.classList.remove('active'); });
                var activeSection = document.getElementById('section-' + target);
                if (activeSection) activeSection.classList.add('active');
                this.classList.add('active');
            });
        });
    }

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

    // ---------- Donación PayPal (URL moderna con respaldo si se bloquea popup) ----------
    SaludAncestral.openPayPalDonation = function (email) {
        var url = 'https://www.paypal.com/donate?business=' +
                  encodeURIComponent(email) +
                  '&item_name=Apoyo+a+Salud+Ancestrale&currency_code=EUR';
        var newWindow = window.open(url, '_blank', 'noopener');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            window.location.href = url;
        }
    };

    function initLegalConsent() {
        var overlay = document.getElementById('legalOverlay');
        var btnAccept = document.getElementById('acceptLegalBtn');
        var btnReject = document.getElementById('rejectLegalBtn');
        var audio = document.getElementById('bgMusic');

        if (!localStorage.getItem('consentimientoLegal')) {
            overlay.classList.add('show');
        } else {
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

            if (audio) {
                audio.volume = 0.03;
                audio.play().catch(function (e) {
                    console.log('Error al reproducir música:', e);
                });
            }
        });

        btnReject.addEventListener('click', function () {
            localStorage.setItem('consentimientoLegal', 'rechazado');
            localStorage.setItem('cookiesAceptadas', 'false');
            overlay.classList.remove('show');
            console.log('El usuario ha rechazado cookies y análisis.');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initFloatingSpeakButton();
        initLegalConsent();

        var closeButtons = document.querySelectorAll('.legal-modal .btn-accept, .legal-modal .btn-reject');
        closeButtons.forEach(function (btn) {
            if (btn.id === 'acceptLegalBtn' || btn.id === 'rejectLegalBtn') return;
            btn.addEventListener('click', function () {
                var modal = this.closest('.legal-overlay');
                if (modal) modal.classList.remove('show');
            });
        });
    });

})();
