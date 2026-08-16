/* ==========================================
   OBSIDIAN INTERACTIVE SCRIPTS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Current Mode State: 'dev' or 'design'
    let currentMode = 'dev';
    document.body.setAttribute('data-mode', currentMode);

    // Elements
    const modeSwitchBtn = document.getElementById('mode-switch-btn');
    const bodyEl = document.body;
    
    // Toggle Mode Function
    function toggleMode() {
        currentMode = currentMode === 'dev' ? 'design' : 'dev';
        bodyEl.setAttribute('data-mode', currentMode);
        
        // Synchronize all mode switch button states (desktop + mobile)
        const sliders = document.querySelectorAll('.switch-slider');
        const devLabels = document.querySelectorAll('.switch-label-dev');
        const designLabels = document.querySelectorAll('.switch-label-design');
        
        if (currentMode === 'design') {
            sliders.forEach(s => s.style.transform = 'translateX(60px)');
            devLabels.forEach(l => l.style.color = 'var(--text-muted)');
            designLabels.forEach(l => l.style.color = 'var(--accent)');
        } else {
            sliders.forEach(s => s.style.transform = 'translateX(0)');
            devLabels.forEach(l => l.style.color = 'var(--accent)');
            designLabels.forEach(l => l.style.color = 'var(--text-muted)');
        }
    }

    // Bind click events on all mode switch buttons
    const allSwitchBtns = document.querySelectorAll('.switch-btn');
    allSwitchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMode();
        });
    });

    /* ==========================================
       MOBILE DRAWER NAVIGATION
       ========================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const drawer = document.getElementById('drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerClose = document.getElementById('drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-nav a');

    function openDrawer() {
        drawer.classList.add('active');
        drawerBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        drawerBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });

    /* ==========================================
       SCROLL REVEAL OBSERVER
       ========================================== */
    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));

    // Active Section Link Tracker
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
        let currentSec = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSec = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSec}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================
       COMMAND PALETTE (CTRL + M)
       ========================================== */
    const palette = document.getElementById('command-palette');
    const paletteInput = document.getElementById('palette-input');
    const paletteList = document.getElementById('palette-list');
    const paletteTrigger = document.getElementById('palette-trigger');

    const commands = [
        { title: 'Go to Home / Hero', icon: 'home', action: () => scrollToSection('hero') },
        { title: 'Go to About Me', icon: 'person', action: () => scrollToSection('about') },
        { title: 'Go to Featured Projects', icon: 'folder_open', action: () => scrollToSection('projects') },
        { title: 'Go to Internships & Education', icon: 'timeline', action: () => scrollToSection('experience') },
        { title: 'Go to Qualifications & Certs', icon: 'verified', action: () => scrollToSection('certifications') },
        { title: 'Go to Technical Skills Matrix', icon: 'code', action: () => scrollToSection('skills') },
        { title: 'Go to Contact Portal', icon: 'mail', action: () => scrollToSection('contact') },
        { title: 'Toggle DEV / DESIGN View Mode', icon: 'terminal', shortcut: 'M', action: () => toggleMode() },
        { title: 'Download Resume (PDF)', icon: 'download', shortcut: 'D', action: () => downloadResume() },
        { title: 'Open GitHub Profile', icon: 'link', action: () => window.open('https://github.com/Kushalraj123', '_blank') },
        { title: 'Open LinkedIn Profile', icon: 'link', action: () => window.open('https://www.linkedin.com/in/kushalrajm/', '_blank') }
    ];

    let selectedIndex = 0;
    let filteredCommands = [...commands];

    function scrollToSection(id) {
        const sec = document.getElementById(id);
        if (sec) {
            sec.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function downloadResume() {
        const link = document.createElement('a');
        link.href = '#'; // Put Kushal's resume URL here
        link.download = 'Kushal_Raj_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function togglePalette() {
        if (palette.classList.contains('active')) {
            closePalette();
        } else {
            openPalette();
        }
    }

    function openPalette() {
        palette.classList.add('active');
        paletteInput.value = '';
        renderResults();
        setTimeout(() => paletteInput.focus(), 50);
        document.body.style.overflow = 'hidden';
    }

    function closePalette() {
        palette.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Render results in palette
    function renderResults() {
        paletteList.innerHTML = '';
        if (filteredCommands.length === 0) {
            paletteList.innerHTML = `<div style="padding: 1.5rem; text-align: center; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">No commands matched your query</div>`;
            return;
        }

        filteredCommands.forEach((cmd, idx) => {
            const li = document.createElement('li');
            li.className = `palette-item ${idx === selectedIndex ? 'selected' : ''}`;
            
            let shortcutHtml = cmd.shortcut ? `<span class="palette-item-shortcut">${cmd.shortcut}</span>` : '';
            
            li.innerHTML = `
                <div class="palette-item-left">
                    <span class="material-symbols-outlined palette-item-icon">${cmd.icon}</span>
                    <span class="palette-item-title">${cmd.title}</span>
                </div>
                ${shortcutHtml}
            `;
            
            li.addEventListener('click', () => {
                cmd.action();
                closePalette();
            });

            // Hover updates active selection
            li.addEventListener('mouseenter', () => {
                selectedIndex = idx;
                updateSelection();
            });

            paletteList.appendChild(li);
        });

        // Ensure active item is scrolled into view
        const activeItem = paletteList.querySelector('.selected');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    function updateSelection() {
        const items = paletteList.querySelectorAll('.palette-item');
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // Keyboard trigger listener (Ctrl + M)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            togglePalette();
        }
        
        if (e.key === 'Escape' && palette.classList.contains('active')) {
            closePalette();
        }
    });

    if (paletteTrigger) {
        paletteTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openPalette();
        });
    }

    // Search filtering input handler
    paletteInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            filteredCommands = [...commands];
        } else {
            filteredCommands = commands.filter(cmd => 
                cmd.title.toLowerCase().includes(query)
            );
        }
        selectedIndex = 0;
        renderResults();
    });

    // Keyboard navigation within list
    paletteInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                closePalette();
            }
        }
    });
});
