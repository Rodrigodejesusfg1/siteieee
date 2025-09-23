// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const carouselContainer = document.getElementById('carousel-container');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselDots = document.getElementById('carousel-dots');

// Navigation Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll', navMenu.classList.contains('active'));
        
        // Toggle hamburger to X
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// Countdown Timer
function updateCountdown() {
    // Event date: October 7, 2025, 4:00 PM (16:00)
    const eventDate = new Date('2025-10-07T16:00:00').getTime();
    const now = new Date().getTime();
    const timeLeft = eventDate - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Update DOM elements
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    } else {
        // Event has started or passed
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = '00';
        if (hoursElement) hoursElement.textContent = '00';
        if (minutesElement) minutesElement.textContent = '00';
        if (secondsElement) secondsElement.textContent = '00';

        // Could add event started message here
        console.log('Event has started!');
    }
}

// Initialize countdown and update every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel__slide');
const totalSlides = slides.length;

function updateCarousel() {
    if (!carouselContainer) return;
    // Read the actual CSS gap applied to the container for precise offset
    const styles = window.getComputedStyle(carouselContainer);
    const gap = parseFloat(styles.gap) || 24;
    const slideWidth = slides[0].offsetWidth + gap;
    const offset = -currentSlide * slideWidth;
    carouselContainer.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    updateCarouselDots();
}

function updateCarouselDots() {
    if (!carouselDots) return;
    
    // Clear existing dots
    carouselDots.innerHTML = '';
    
    // Create dots based on slides per view
    const slidesPerView = getSlidesPerView();
    const totalDots = Math.ceil(totalSlides / slidesPerView);
    
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel__dot');
        if (i === Math.floor(currentSlide / slidesPerView)) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            currentSlide = i * slidesPerView;
            updateCarousel();
        });
        carouselDots.appendChild(dot);
    }
}

function getSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
}

function nextSlide() {
    const slidesPerView = getSlidesPerView();
    if (currentSlide < totalSlides - slidesPerView) {
        currentSlide++;
    } else {
        currentSlide = 0; // Loop back to start
    }
    updateCarousel();
}

function prevSlide() {
    const slidesPerView = getSlidesPerView();
    if (currentSlide > 0) {
        currentSlide--;
    } else {
        currentSlide = totalSlides - slidesPerView; // Go to end
    }
    updateCarousel();
}

// Carousel Controls
if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
}

if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
}

// Auto-play carousel
let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

// Initialize carousel
if (slides.length > 0) {
    updateCarouselDots();
    startAutoPlay();
    
    // Pause auto-play on hover
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
}

// Touch support for carousel
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
            prevSlide(); // Swipe right - go to previous
        } else {
            nextSlide(); // Swipe left - go to next
        }
    }
}

if (carouselContainer) {
    // Touch events
    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopAutoPlay(); // Stop auto-play when user interacts
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
        startAutoPlay(); // Resume auto-play after interaction
    }, { passive: true });

    // Mouse events for desktop drag (optional enhancement)
    let isMouseDown = false;
    let mouseStartX = 0;

    carouselContainer.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        mouseStartX = e.clientX;
        stopAutoPlay();
        carouselContainer.style.cursor = 'grabbing';
    });

    carouselContainer.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
    });

    carouselContainer.addEventListener('mouseup', (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        carouselContainer.style.cursor = 'grab';
        
        const deltaX = e.clientX - mouseStartX;
        if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
        startAutoPlay();
    });

    carouselContainer.addEventListener('mouseleave', () => {
        if (isMouseDown) {
            isMouseDown = false;
            carouselContainer.style.cursor = 'grab';
            startAutoPlay();
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    updateCarousel();
    updateCarouselDots();
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 14, 26, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.3)';
    } else {
        header.style.background = 'rgba(10, 14, 26, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Programação: Tabs switching
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tabs .tab');
    const panels = document.querySelectorAll('.day-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.day;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('active');
        });
    });
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.timeline__item, .course__card, .sponsor__placeholder'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Optional: track CTA clicks (now generic, without hardcoded forms.gle)
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('a.nav__cta, .btn.btn--primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('CTA clicked:', button.textContent?.trim());
            button.style.transform = 'scale(0.98)';
            setTimeout(() => { button.style.transform = ''; }, 150);
        });
    });
});

// Error handling for images + safe fade-in (don't hide already-loaded images)
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Always set transition so future opacity changes are smooth
        img.style.transition = 'opacity 0.3s ease';

        // If image already loaded (from cache), show immediately
        if (img.complete && img.naturalWidth !== 0) {
            img.style.opacity = '1';
        } else {
            // Not loaded yet: start hidden, reveal on load
            img.style.opacity = '0';
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            }, { once: true });
        }

        // Error fallback
        img.addEventListener('error', () => {
            console.warn(`Failed to load image: ${img.src}`);
            // Optionally hide or replace with a placeholder
            img.style.display = 'none';
        }, { once: true });
    });
});

// Accessibility improvements
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
    
    // Arrow keys for carousel navigation when focused
    const carouselElement = document.querySelector('.carousel:focus-within');
    if (carouselElement) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    }
});

// Close mobile menu on outside click (tap outside menu area)
document.addEventListener('click', (e) => {
    if (!navMenu || !navToggle) return;
    const target = e.target;
    const clickedInsideMenu = navMenu.contains(target);
    const clickedToggle = navToggle.contains(target);
    if (navMenu.classList.contains('active') && !clickedInsideMenu && !clickedToggle) {
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    // For future lazy-loaded images, use data-src instead of src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

console.log('V SANCA Week website loaded successfully!');