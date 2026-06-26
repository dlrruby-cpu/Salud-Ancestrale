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
