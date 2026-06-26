/**
 * Salud Ancestral
 * by LópezTools&Book's™
 * 
 * Funciones expuestas:
 *   SaludAncestral.toggleDetails(id, btn)   → expandir/colapsar estudio
 *   SaludAncestral.speakCard(cardId, btn)   → leer solo una tarjeta
 *   SaludAncestral.speakSection(sectionId, btn) → leer toda una sección
 */

window.SaludAncestrale= {};

// ============ NAVEGACIÓN ENTRE SECCIONES ============
(function() {
    var navLinks = document.querySelectorAll('#mainNav a');
    var sections = document.querySelectorAll('.section');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            var sectionId = this.getAttribute('data-section');

            navLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');

            sections.forEach(function(s) { s.classList.remove('active'); });
            var target = document.getElementById('section-' + sectionId);
            if (target) {
                target.classList.add('active');
            }
        });
    });
})();

// ============ EXPANDIR DETALLES ============
SaludAncestral.toggleDetails = function(id, btn) {
    var detailDiv = document.getElementById(id);
    if (detailDiv.classList.contains('show')) {
        detailDiv.classList.remove('show');
        btn.textContent = 'Ver estudio +';
    } else {
        detailDiv.classList.add('show');
        btn.textContent = 'Ocultar -';
    }
};

// ============ AVISO LEGAL ============
var legalOverlay = document.getElementById('legalOverlay');
var acceptBtn = document.getElementById('acceptLegalBtn');
var legalAccepted = false;

setTimeout(function() {
    if (!legalAccepted) {
        legalOverlay.classList.add('show');
    }
}, 6000);

acceptBtn.addEventListener('click', function() {
    legalAccepted = true;
    legalOverlay.classList.remove('show');
});

// ============ LECTOR DE VOZ UNIFICADO ============
(function() {
    var availableVoices = [];
    var voicesReady = false;
    var currentUtterance = null;
    var currentButton = null; // botón que inició la lectura

    function initVoices() {
        availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            voicesReady = true;
        }
    }

    initVoices();
    speechSynthesis.addEventListener('voiceschanged', initVoices);

    function getSpanishVoice() {
        if (!voicesReady || availableVoices.length === 0) {
            initVoices();
        }

        var voice = null;
        for (var i = 0; i < availableVoices.length; i++) {
            if (availableVoices[i].lang === 'es-MX') { voice = availableVoices[i]; break; }
        }
        if (voice) return voice;
        for (var i = 0; i < availableVoices.length; i++) {
            if (availableVoices[i].lang === 'es-US') { voice = availableVoices[i]; break; }
        }
        if (voice) return voice;
        for (var i = 0; i < availableVoices.length; i++) {
            if (availableVoices[i].lang.indexOf('es') === 0) { voice = availableVoices[i]; break; }
        }
        if (voice) return voice;
        return availableVoices.length > 0 ? availableVoices[0] : null;
    }

    // Detener cualquier lectura activa y restaurar botones
    function stopAll() {
        if (currentUtterance) {
            speechSynthesis.cancel();
            currentUtterance = null;
        }
        // Restaurar todos los botones
        var allAudioBtns = document.querySelectorAll('.btn-audio, .section-speak-btn');
        allAudioBtns.forEach(function(b) {
            b.classList.remove('playing');
            if (b.classList.contains('section-speak-btn')) {
                b.textContent = '🔊 Escuchar toda la sección';
            } else if (b.classList.contains('btn-audio')) {
                b.textContent = '🔊 Escuchar estudio';
            }
        });
        var floatBtn = document.getElementById('speakButton');
        if (floatBtn) floatBtn.classList.remove('playing');
        currentButton = null;
    }

    // Función genérica para leer texto
    function speakText(text, btnElement, originalText) {
        if (currentUtterance && currentButton === btnElement) {
            // Si pulsamos el mismo botón, detenemos
            stopAll();
            return;
        }

        // Detener cualquier lectura previa
        stopAll();

        if (!legalAccepted && legalOverlay.classList.contains('show')) return;

        if (!text || text.trim() === '') return;

        var voice = getSpanishVoice();
        if (!voice) {
            alert('No se encontraron voces en español. Prueba con Chrome o Edge.');
            return;
        }

        speechSynthesis.cancel();

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.voice = voice;
        currentUtterance.lang = voice.lang;
        currentUtterance.rate = 0.9;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 0.5;

        // Marcar botón como activo
        if (btnElement) {
            btnElement.classList.add('playing');
            btnElement.textContent = '⏹ Detener';
            currentButton = btnElement;
        }

        currentUtterance.onstart = function() {
            var floatBtn = document.getElementById('speakButton');
            if (floatBtn) floatBtn.classList.add('playing');
        };

        currentUtterance.onend = function() {
            stopAll();
        };

        currentUtterance.onerror = function() {
            stopAll();
        };

        speechSynthesis.speak(currentUtterance);
    }

    // ============ FUNCIÓN PÚBLICA: LEER TARJETA ============
    SaludAncestral.speakCard = function(cardId, btnElement) {
        var card = document.getElementById(cardId);
        if (!card) return;
        // Leer solo el texto de la tarjeta (incluye detalles si están expandidos)
        var text = card.innerText;
        speakText(text, btnElement, '🔊 Escuchar estudio');
    };

    // ============ FUNCIÓN PÚBLICA: LEER SECCIÓN ============
    SaludAncestral.speakSection = function(sectionId, btnElement) {
        var section = document.getElementById(sectionId);
        if (!section) return;
        var text = section.innerText;
        speakText(text, btnElement, '🔊 Escuchar toda la sección');
    };

    // ============ BOTÓN FLOTANTE PRINCIPAL ============
    var speakBtn = document.getElementById('speakButton');
    speakBtn.addEventListener('click', function() {
        if (currentUtterance) {
            stopAll();
            return;
        }
        var activeSection = document.querySelector('.section.active');
        if (activeSection) {
            var sectionBtn = activeSection.querySelector('.section-speak-btn');
            SaludAncestral.speakSection(activeSection.id, sectionBtn);
        }
    });

    window.addEventListener('beforeunload', function() {
        if (currentUtterance) speechSynthesis.cancel();
    });
})();
