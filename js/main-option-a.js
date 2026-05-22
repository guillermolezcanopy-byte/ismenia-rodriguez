// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Force scroll to top on reload (Bulletproof)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Initialize animations on DOM Load
window.addEventListener("load", () => {
    // Double check scroll to top
    setTimeout(() => window.scrollTo(0, 0), 10);
    
    // 0. Preloader
    const preloader = document.getElementById('preloader');

    // Force autoplay on all videos (mobile fix)
    // Force autoplay on non-hero videos (hero video is triggered after preloader)
    document.querySelectorAll('video:not(#heroVideo)').forEach(video => {
        video.muted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.play().catch(() => {
            const playOnce = () => {
                video.play();
                document.removeEventListener('touchstart', playOnce);
                document.removeEventListener('click', playOnce);
            };
            document.addEventListener('touchstart', playOnce);
            document.addEventListener('click', playOnce);
        });
    });

    // Hero Video Content Reveal — stop video at 2s, fade in white background and text/logo
    const heroVideo = document.getElementById('heroVideo');
    const videoOverlay = document.querySelector('.video-overlay');
    const whiteOverlay = document.querySelector('.white-overlay');
    const heroContent = document.querySelector('.hero-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    let contentRevealed = false;

    if (heroVideo) {
        heroVideo.addEventListener('timeupdate', () => {
            if (!contentRevealed && heroVideo.currentTime >= 2) {
                contentRevealed = true;
                
                // Pause the video right before the dress deconstructs
                heroVideo.pause();
                
                // Fade in the white background
                if (whiteOverlay) whiteOverlay.classList.add('visible');
                
                // Fade out the dark overlay
                if (videoOverlay) videoOverlay.classList.add('faded');
                
                // Fade in the hero content (title, subtitle, logo, btn)
                if (heroContent) heroContent.classList.add('revealed');
                
                // Fade in scroll indicator
                if (scrollIndicator) {
                    // Update scroll indicator color for white background
                    scrollIndicator.style.color = '#000';
                    const line = scrollIndicator.querySelector('.line');
                    if(line) {
                        line.style.backgroundColor = 'rgba(0,0,0,0.2)';
                    }
                    // Add dynamic style for the animated pseudo-element
                    const style = document.createElement('style');
                    style.innerHTML = '.scroll-indicator .line::after { background-color: #000; }';
                    document.head.appendChild(style);
                    
                    gsap.to(scrollIndicator, { opacity: 1, duration: 1.5, delay: 1, ease: "power2.out" });
                }
            }
        });
    }

    // Preloader Animation
    const initAnimations = () => {
        // Hero content reveal is now handled by the video timeupdate listener
        // No initial hero animations — content stays hidden until video ends
    };

    gsap.to(".preloader-logo", { opacity: 1, duration: 1, ease: "power2.inOut" });
    gsap.to(preloader, {
        opacity: 0, 
        duration: 1, 
        delay: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
            preloader.style.display = "none";
            initAnimations(); // Start hero animations after preloader finishes
            // Start hero video from the beginning after preloader disappears
            if (heroVideo) {
                heroVideo.currentTime = 0;
                heroVideo.play().catch(() => {
                    const playOnce = () => {
                        heroVideo.currentTime = 0;
                        heroVideo.play();
                        document.removeEventListener('touchstart', playOnce);
                        document.removeEventListener('click', playOnce);
                    };
                    document.addEventListener('touchstart', playOnce);
                    document.addEventListener('click', playOnce);
                });
            }
        }
    });

    // Hero Background Parallax
    gsap.to(".placeholder-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // 2. Slide Up Elements (Text, Forms)
    const slideUpElements = gsap.utils.toArray('.gsap-slide-up');
    slideUpElements.forEach(elem => {
        gsap.fromTo(elem,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%", // Trigger when element is 85% down viewport
                }
            }
        );
    });

    // 3. Image Reveal (Clipping Mask effect)
    const imageReveals = gsap.utils.toArray('.gsap-image-reveal');
    imageReveals.forEach(elem => {
        gsap.to(elem, {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
                trigger: elem,
                start: "top 80%",
            }
        });
        
        // Slight image scale down during reveal
        const img = elem.querySelector('.img-placeholder');
        if (img) {
            gsap.fromTo(img, 
                { scale: 1.2 },
                { 
                    scale: 1, 
                    duration: 1.5, 
                    ease: "power3.inOut",
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 80%"
                    }
                }
            );
        }
    });

    // 4. Staggered Reveal (Masonry Grid) - zoomInLeft effect with 0.8s stagger, images stay visible
    ScrollTrigger.batch(".gsap-fade-in", {
        onEnter: batch => gsap.fromTo(batch, 
            { opacity: 0, scale: 0.1, x: -300 }, 
            { opacity: 1, scale: 1, x: 0, stagger: 0.8, duration: 1, ease: "back.out(1.5)" }
        ),
        start: "top 85%",
        once: true // Ensures they only animate once and stay there
    });

    // Mini Carousels in Masonry Grid - Change image every 1 second
    const carousels = document.querySelectorAll('.img-carousel');
    carousels.forEach(carousel => {
        const layers = carousel.querySelectorAll('.img-layer');
        if (layers.length > 1) {
            let current = 0;
            setInterval(() => {
                layers[current].classList.remove('active');
                current = (current + 1) % layers.length;
                layers[current].classList.add('active');
            }, 2500); // 2.5 seconds
        }
    });

    // 5. WhatsApp Button Scale In
    gsap.fromTo(".whatsapp-float",
        { scale: 0, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".philosophy", // Wait until user scrolls past hero
                start: "top center",
                toggleActions: "play none none reverse"
            }
        }
    );

    // 6. Premium Form Submission
    const waitlistForm = document.querySelector('.waitlist-form');
    const waitlistSuccess = document.querySelector('.waitlist-success');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            
            // Simple fade out of the form and fade in of the success message
            gsap.to(waitlistForm, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                onComplete: () => {
                    waitlistForm.style.display = 'none';
                    waitlistSuccess.style.display = 'block';
                    gsap.fromTo(waitlistSuccess, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
                    );
                }
            });
        });
    }
});
