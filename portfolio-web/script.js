document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // SMOTH SCROLL BY LENISOnly on desktop for better performance
    // ===================================
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    }

    if (!isMobileDevice()) {
            const lenis = new Lenis({
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
    }

    // ===================================
    // NAVBAR SCROLL EFFECT
    // ===================================
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // User sudah scroll - navbar mengecil
            navbar.classList.add('scrolled');
        } else {
            // User di atas - navbar normal
            navbar.classList.remove('scrolled');
        }
    });

    // ===================================
    // FOOTER SCROLL ANIMATION
    // ===================================

    const footer = document.querySelector('.footer');
    let footerHasAnimated = false;

    // Options untuk Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.2 // Trigger saat 20% footer terlihat
    };

    // Callback function saat footer masuk/keluar viewport
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Footer MASUK viewport
                if (!footerHasAnimated) {
                    footer.classList.add('animate-in');
                    footerHasAnimated = true;
                }
            } else {
                // Footer KELUAR viewport (opsional: reset animasi)
                // Uncomment baris bawah kalau mau animasi ulang saat scroll balik
                footer.classList.remove('animate-in');
                footerHasAnimated = false;
            }
        });
    }, observerOptions);

    // Start observing footer
    if (footer) {
        footerObserver.observe(footer);
    }

    // ===================================
    // FIREFLY BACKGROUND ANIMATION
    // ===================================

    function createFireflies(containerId, count = 30) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Clear existing fireflies
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const firefly = document.createElement('div');
            firefly.classList.add('firefly');
            
            // Random position
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            // Random animation delay (agar tidak blink bersamaan)
            const floatDelay = Math.random() * 15;
            const blinkDelay = Math.random() * 3;
            
            // Random size variation
            const size = 3 + Math.random() * 3; // 3px - 6px
            
            firefly.style.left = `${left}%`;
            firefly.style.top = `${top}%`;
            firefly.style.width = `${size}px`;
            firefly.style.height = `${size}px`;
            firefly.style.animationDelay = `${floatDelay}s, ${blinkDelay}s`;
            
            container.appendChild(firefly);
        }
    }

    // Initialize fireflies untuk setiap section
        createFireflies('quoteFireflies', 40);
        createFireflies('contactFireflies', 50);

    // ===================================
    // THEME SWITCHER
    // ===================================
    const themeSwitcher = document.getElementById('themeSwitcher');
    const html = document.documentElement;

    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    // Toggle theme on click
    themeSwitcher.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update dot color based on theme
        updateDotColor();
    });

    // ===================================
    // DOT GRID ANIMATION
    // ===================================
    const canvas = document.getElementById('dotCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    const dotSpacing = 40;
    const glowRadius = 100;

    let mouseX = 0, mouseY = 0;
    let isCursorMoving = false;
    let cursorStopTimer;
    const stopThreshold = 150;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        isCursorMoving = true;

        clearTimeout(cursorStopTimer);
        cursorStopTimer = setTimeout(() => {
            isCursorMoving = false;
        }, stopThreshold);
    });

    function getDotColor() {
        const theme = html.getAttribute('data-theme');
        return theme === 'dark' 
            ? 'rgba(255, 255, 255, ' 
            : 'rgba(37, 99, 235, ';
    }

    function updateDotColor() {
        // Force redraw with new color
        animate();
    }
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createDots();
    }
    
    function createDots() {
        dots = [];
        const cols = Math.ceil(width / dotSpacing) + 1;
        const rows = Math.ceil(height / dotSpacing) + 1;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                dots.push({
                    x: i * dotSpacing,
                    y: j * dotSpacing,
                    baseX: i * dotSpacing,
                    baseY: j * dotSpacing,
                    currentSize: baseSize
                });
            }
        }
    }

    // ⚙️ PENGATURAN ANIMASI
    const fadeInSpeed = 1;   // Cepat: 0.1 - 0.3
    const fadeOutSpeed = 0.02; // Lambat: 0.01 - 0.05
    const maxSize = 2;         // Ukuran max saat glow
    const baseSize = 1.5;      // Ukuran dasar


    function animate() {
        ctx.clearRect(0, 0, width, height);

        const dotColor = getDotColor();

        dots.forEach(dot => {
            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Grid lurus
            dot.x = dot.baseX;
            dot.y = dot.baseY;
            
            // Tentukan target size berdasarkan: jarak + status cursor
            let targetSize = baseSize;
            
            if (distance < glowRadius) {
                if (isCursorMoving) {
                    // Cursor bergerak + dot dekat → GLOW (max size)
                    targetSize = maxSize;
                }
                // Jika cursor berhenti, targetSize tetap baseSize → fade out otomatis
            }
            
            // Smooth interpolation dengan kecepatan berbeda
            const speed = (targetSize > dot.currentSize) ? fadeInSpeed : fadeOutSpeed;
            dot.currentSize += (targetSize - dot.currentSize) * speed;
            
            // Hitung opacity berdasarkan ukuran saat ini
            const opacityFactor = (dot.currentSize - baseSize) / (maxSize - baseSize);
            const opacity = 0.15 + (opacityFactor * 0.85);
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = `${dotColor}${opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});