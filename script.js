/* ==========================================================================
   PORTFOLIO INTERACTIVE SCRIPTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. SPRING CURSOR PHYSICS
       ========================================== */
    const cursor = document.getElementById('custom-cursor');
    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    const springSpeed = 0.16; // Interpolation speed

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        if (cursorX === -100 && mouseX !== -100) {
            cursorX = mouseX;
            cursorY = mouseY;
        }

        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * springSpeed;
        cursorY += dy * springSpeed;

        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Expand cursor hover behavior on links, buttons and bento cards
    const hoverElements = document.querySelectorAll('a, button, input, textarea, .bento-card, #portrait-3d-card, .scroll-stack-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hovered');
        });
    });


    /* ==========================================
       2. LENIS SMOOTH SCROLLER INITIALIZATION
       ========================================== */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard expo easing
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    /* ==========================================
       3. SCROLL-STACKING PROJECT CARDS
       ========================================== */
    const cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    let initialTops = [];

    // Record static natural tops of cards on load
    function calculateInitialTops() {
        initialTops = cards.map(card => {
            // Temporarily reset transforms to read natural top coordinates
            const originalTransform = card.style.transform;
            card.style.transform = 'none';
            const rect = card.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            card.style.transform = originalTransform;
            return top;
        });
    }

    // Set card styles once at load
    cards.forEach((card, i) => {
        card.style.zIndex = `${i + 1}`;
        card.style.willChange = 'transform, filter';
        card.style.transformOrigin = 'top center';
    });

    // Main scroll handler loop
    function updateCardTransforms(scrollTop) {
        if (!initialTops.length) return;

        const containerHeight = window.innerHeight;
        const stackPositionPx = 0.15 * containerHeight; // pin at 15% top
        const scaleEndPositionPx = 0.06 * containerHeight; // shrink till 6% top
        
        const itemStackDistance = 28; // px between cards
        const baseScale = 0.88;
        const itemScale = 0.035;
        const blurAmountMultiplier = 2.0; // px of blur per underlying card depth

        const endElement = document.querySelector('.scroll-stack-end');
        const endElementTop = endElement ? endElement.getBoundingClientRect().top + window.scrollY : 0;
        const pinEnd = endElementTop - containerHeight / 2;

        cards.forEach((card, i) => {
            const cardTop = initialTops[i] || 0;
            const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPositionPx;
            const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

            // 1. Calculate scale progress
            let scaleProgress = 0;
            if (scrollTop < triggerStart) {
                scaleProgress = 0;
            } else if (scrollTop > triggerEnd) {
                scaleProgress = 1;
            } else {
                scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
            }

            const targetScale = baseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);

            // 2. Calculate blur depth based on top card stacked index
            let topCardIndex = 0;
            for (let j = 0; j < cards.length; j++) {
                const jCardTop = initialTops[j] || 0;
                const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
                if (scrollTop >= jTriggerStart) {
                    topCardIndex = j;
                }
            }

            let blur = 0;
            if (i < topCardIndex) {
                const depthInStack = topCardIndex - i;
                blur = Math.max(0, depthInStack * blurAmountMultiplier);
            }

            // 3. Translate pinning calculation
            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

            if (isPinned) {
                translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
            }

            // Apply transforms and styles
            card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        });
    }

    // Bind layout changes
    window.addEventListener('load', () => {
        calculateInitialTops();
        updateCardTransforms(window.scrollY);
    });

    window.addEventListener('resize', () => {
        calculateInitialTops();
        updateCardTransforms(window.scrollY);
    });

    // Run stack update on smooth scrolling scroll tick
    lenis.on('scroll', (e) => {
        updateCardTransforms(e.scroll);
    });


    /* ==========================================
       4. 3D PORTRAIT PARALLAX TILT & GLARE EFFECT
       ========================================== */
    const portraitCard = document.getElementById('portrait-3d-card');
    const glowRing = document.querySelector('.glow-ring');
    const laserSweep = document.querySelector('.laser-sweep');

    if (portraitCard) {
        portraitCard.addEventListener('mousemove', (e) => {
            const rect = portraitCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5; // [-0.5, 0.5]
            const y = (e.clientY - rect.top) / rect.height - 0.5; // [-0.5, 0.5]

            // Calculate card tilt angle
            const rotateX = -y * 22; // max tilt 22 deg
            const rotateY = x * 22;

            portraitCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Holographic spotlight sweeping glare gradient
            const glareX = e.clientX - rect.left;
            const glareY = e.clientY - rect.top;
            portraitCard.style.background = `radial-gradient(circle 220px at ${glareX}px ${glareY}px, rgba(255, 255, 255, 0.22), rgba(212, 175, 55, 0.08), transparent 85%), #120F0C`;

            // Drift backglow ring
            if (glowRing) {
                glowRing.style.transform = `scale(1.1) rotate(${x * 40}deg) translate(${x * 15}px, ${y * 15}px)`;
                glowRing.style.opacity = '0.35';
            }
        });

        portraitCard.addEventListener('mouseleave', () => {
            // Reset to defaults
            portraitCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
            portraitCard.style.background = '#120F0C';
            if (glowRing) {
                glowRing.style.transform = 'scale(1) rotate(0deg)';
                glowRing.style.opacity = '0.15';
            }
        });
    }


    /* ==========================================
       5. EXPERIENCE TIMELINE PROGRESS LINE
       ========================================== */
    const timeline = document.getElementById('experience-timeline');
    const progressBar = document.getElementById('timeline-progress-bar');

    function updateTimelineProgress() {
        if (!timeline || !progressBar) return;

        const rect = timeline.getBoundingClientRect();
        const startOffset = rect.top + window.scrollY - window.innerHeight * 0.7;
        const endOffset = rect.bottom + window.scrollY - window.innerHeight * 0.9;
        const scrollTop = window.scrollY;

        let progress = (scrollTop - startOffset) / (endOffset - startOffset);
        progress = Math.max(0, Math.min(1, progress));

        progressBar.style.height = `${progress * 100}%`;
    }

    lenis.on('scroll', () => {
        updateTimelineProgress();
    });
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress();


    /* ==========================================
       6. SIMULATED RETRO-TERMINAL CONTACT SENDER
       ========================================== */
    const contactForm = document.getElementById('terminal-contact-form');
    const loggerBox = document.getElementById('terminal-logger');
    const dispatchBtn = document.getElementById('dispatch-btn');

    if (contactForm && loggerBox && dispatchBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            // Make logger visible and clear previous text
            loggerBox.classList.remove('hidden');
            loggerBox.innerHTML = '';
            dispatchBtn.disabled = true;
            dispatchBtn.textContent = 'TRANSMITTING...';

            const logSequence = [
                { text: "INITIALIZING TRANSMISSION PROTOCOL...", color: "text-muted" },
                { text: "SECURE SOCKET CREATED [PORT 443] -> SSH CONNECTION INITIATED.", color: "text-secondary" },
                { text: "SENDER IDENTIFIER RESOLVED: name='" + name + "'", color: "text-secondary" },
                { text: "TUNNELLING CHANNEL ESTABLISHED: source='" + email + "'", color: "text-secondary" },
                { text: "ENCRYPTING DATA CORRIDOR [AES-256 BIT KEY GENERATED]...", color: "text-muted" },
                { text: "PACKET SIZE CALCULATION: " + Math.ceil(message.length * 1.25) + " Bytes payload.", color: "text-secondary" },
                { text: "DISPATCHING ENCRYPTED STRINGS...", color: "text-muted" },
                { text: "LOG: transmitting envelope payload data segment blocks...", color: "text-muted" },
                { text: "SUCCESS // PACKET TRANSMITTED AND REGISTERED TO DESTINATION ENDPOINT.", color: "text-gold" },
                { text: "TERMINAL CONNECTION DISCHARGED SECURELY. CLOSED.", color: "text-gold" }
            ];

            let lineIndex = 0;

            function printNextLine() {
                if (lineIndex < logSequence.length) {
                    const lineData = logSequence[lineIndex];
                    const p = document.createElement('p');
                    p.className = `logger-line ${lineData.color}`;
                    p.textContent = `Ø kushalraj@ide:~# ${lineData.text}`;
                    loggerBox.appendChild(p);

                    // Auto scroll logger box to bottom
                    loggerBox.scrollTop = loggerBox.scrollHeight;

                    lineIndex++;
                    setTimeout(printNextLine, 500); // 500ms delay per console line
                } else {
                    // Sequence done, show final successful block
                    setTimeout(() => {
                        const formContainer = contactForm.parentElement;
                        formContainer.innerHTML = `
                            <div class="py-16 text-center space-y-4">
                                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#D4AF37] text-[#D4AF37] text-lg mb-4" style="box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);">✓</div>
                                <h3 class="text-3xl text-white font-normal uppercase font-bebas">PACKET DISPATCH SUCCESS</h3>
                                <p class="text-xs text-[#A8988B] font-light font-body tracking-wider mt-2">
                                    Transmission registered successfully. Kushal Raj will respond to your channel soon.
                                </p>
                            </div>
                        `;
                    }, 400);
                }
            }

            setTimeout(printNextLine, 200);
        });
    }

    // Set initial calculate offsets
    setTimeout(() => {
        calculateInitialTops();
        updateCardTransforms(window.scrollY);
    }, 500);

});
