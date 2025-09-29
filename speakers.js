// Speakers Page JavaScript - MIT Media Lab Style

// DOM Elements
const speakerCards = document.querySelectorAll('.speaker-card');
const speakerDetails = document.querySelectorAll('.speaker-details');
const expandButtons = document.querySelectorAll('.speaker-card__expand');
const closeButtons = document.querySelectorAll('.speaker-details__close');

// Speaker Detail Modal Functionality
function openSpeakerDetails(targetId) {
    const detailModal = document.getElementById(`speaker-${targetId}`);
    if (detailModal) {
        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        const focusableElements = detailModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

function closeSpeakerDetails() {
    speakerDetails.forEach(detail => {
        detail.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// Event Listeners for Expand Buttons
expandButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.dataset.target;
        openSpeakerDetails(targetId);
        
        // Analytics tracking
        console.log(`Speaker details opened: ${targetId}`);
    });
});

// Event Listeners for Close Buttons
closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        closeSpeakerDetails();
    });
});

// Close modal when clicking outside
speakerDetails.forEach(detail => {
    detail.addEventListener('click', (e) => {
        if (e.target === detail) {
            closeSpeakerDetails();
        }
    });
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeSpeakerDetails();
    }
    
    // Navigate between speakers with arrow keys when modal is open
    const activeModal = document.querySelector('.speaker-details.active');
    if (activeModal) {
        const currentId = activeModal.id.replace('speaker-', '');
        const speakerIds = ['alexandre', 'mariangela', 'lucas', 'ricardo', 'rui', 'pedro'];
        const currentIndex = speakerIds.indexOf(currentId);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % speakerIds.length;
            closeSpeakerDetails();
            setTimeout(() => openSpeakerDetails(speakerIds[nextIndex]), 100);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? speakerIds.length - 1 : currentIndex - 1;
            closeSpeakerDetails();
            setTimeout(() => openSpeakerDetails(speakerIds[prevIndex]), 100);
        }
    }
});

// MIT Media Lab Style Scroll Effects (disabled: cards visible by default)
function initScrollEffects() {
    speakerCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.transition = '';
        card.style.transitionDelay = '';
    });
}

// MIT Style Parallax Effect for Floating Elements
function initParallaxEffects() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    if (floatingElements.length === 0) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        floatingElements.forEach((element, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

// Smooth hover effects for MIT style
function initHoverEffects() {
    speakerCards.forEach(card => {
        const photo = card.querySelector('.speaker__photo');
        const overlay = card.querySelector('.speaker-card__overlay');
        const socialLinks = card.querySelectorAll('.social-link');
        
        card.addEventListener('mouseenter', () => {
            // MIT style hover animation
            if (photo) {
                photo.style.transform = 'scale(1.02)';
                photo.style.filter = 'grayscale(0%) brightness(1)';
            }
            
            // Animate social links with stagger
            socialLinks.forEach((link, index) => {
                setTimeout(() => {
                    link.style.transform = 'translateY(0) scale(1)';
                    link.style.opacity = '1';
                }, index * 100);
            });
        });
        
        card.addEventListener('mouseleave', () => {
            if (photo) {
                photo.style.transform = 'scale(1)';
                photo.style.filter = 'grayscale(100%) brightness(0.95)';
            }
            
            socialLinks.forEach(link => {
                link.style.transform = 'translateY(20px) scale(0.9)';
                link.style.opacity = '0';
            });
        });
    });
}

// MIT Style typing effect for titles
function initTypingEffect() {
    const title = document.querySelector('.speakers-hero__main-title');
    if (!title) return;
    
    const text = title.textContent;
    title.textContent = '';
    title.style.opacity = '1';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    
    // Start typing effect after a delay
    setTimeout(typeWriter, 500);
}

// Initialize MIT Media Lab style interactions
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initParallaxEffects();
    initHoverEffects();
    initTypingEffect();
    
    // Add MIT style loading animation
    document.body.classList.add('loaded');
});

// MIT Style smooth scroll to speaker
function scrollToSpeaker(speakerId) {
    const speaker = document.querySelector(`[data-speaker="${speakerId}"]`);
    if (speaker) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = speaker.offsetTop - headerHeight - 50;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Analytics tracking for MIT style interactions
function trackSpeakerInteraction(action, speakerId) {
    console.log(`Speaker interaction: ${action} - ${speakerId}`);
    // Here you could integrate with analytics services like Google Analytics
}

// Social media sharing functionality
function shareSpeaker(speakerId, platform) {
    const speakerCard = document.querySelector(`[data-speaker="${speakerId}"]`);
    const speakerName = speakerCard?.querySelector('.speaker-card__name')?.textContent;
    
    const shareText = `Confira a palestra de ${speakerName} no V SANCA Week!`;
    const shareUrl = `${window.location.origin}/palestrantes.html#${speakerId}`;
    
    let url = '';
    
    switch (platform) {
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
            break;
        case 'linkedin':
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
        trackSpeakerInteraction('share', speakerId);
    }
}

// MIT Style loading states
window.addEventListener('load', () => {
    document.body.classList.add('fully-loaded');
    
    // Animate elements in sequence
    const elementsToAnimate = [
        '.speakers-hero__subtitle',
        '.speakers-hero__main-title',
        '.speakers-hero__description',
        '.floating-element'
    ];
    
    elementsToAnimate.forEach((selector, index) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });
});

console.log('MIT Media Lab inspired speakers page loaded successfully!');