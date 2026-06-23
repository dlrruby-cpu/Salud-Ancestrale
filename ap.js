document.addEventListener('DOMContentLoaded', function() {
    // 1. Navegación
    const navLinks = document.querySelectorAll('#mainNav a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetSection = this.getAttribute('data-section');

            window.speechSynthesis.cancel();
            resetAudio();

            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            this.classList.add('active');
            document.getElementById('section-' + targetSection).classList.add('active');
        });
    });

    // 2. Aviso Legal
    const overlay = document.getElementById('legalOverlay');
    const acceptBtn = document.getElementById('acceptLegalBtn');

    if (!localStorage.getItem('legalAccepted')) {
        overlay.classList.add('show');
    }

    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('legalAccepted', 'true');
        overlay.classList.remove('show');
    });

    // 3. Audio
    window.toggleDetails = function(detailId, button) {
        const detailBlock = document.getElementById(detailId);
        if (detailBlock.classList.contains('show')) {
            detailBlock.classList.remove('show');
            button.textContent = "Ver estudio +";
        } else {
            detailBlock.classList.add('show');
            button.textContent = "Ocultar estudio -";
        }
    };

    function resetAudio() {
        const playingElements = document.querySelectorAll('.playing');
        playingElements.forEach(el => el.classList.remove('playing'));
    }

    function speakText(text, btn) {
        window.speechSynthesis.cancel();
        resetAudio();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';

        utterance.onstart = function() {
            btn.classList.add('playing');
        };
        utterance.onend = function() {
            btn.classList.remove('playing');
        };
        utterance.onerror = function() {
            btn.classList.remove('playing');
        };

        window.speechSynthesis.speak(utterance);
    }

    window.speakCard = function(cardId, button) {
        const card = document.getElementById(cardId);
        const title = card.querySelector('.medicine-name').innerText;
        const preview = card.querySelector('.curiosity-preview').innerText;
        const details = card.querySelector('.details').innerText;
        
        const fullText = title + ". " + preview + ". Detalles del estudio clínico: " + details;
        speakText(fullText, button);
    };

    window.speakSection = function(sectionId, button) {
        const section = document.getElementById(sectionId);
        const clonedSection = section.cloneNode(true);
        
        clonedSection.querySelectorAll('button, .img-credit, style, script').forEach(el => el.remove());
        
        speakText(clonedSection.innerText, button);
    };

    const speakBtn = document.getElementById('speakButton');
    if (speakBtn) {
        speakBtn.addEventListener('click', function() {
            const activeSection = document.querySelector('.section.active');
            if (activeSection) {
                const sectionId = activeSection.getAttribute('id');
                speakSection(sectionId, speakBtn);
            }
        });
    }
});
