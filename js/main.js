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

    // Hero Video Content Reveal — let video loop, fade in text at 1.0s
    const heroVideo = document.getElementById('heroVideo');
    const heroContent = document.querySelector('.hero-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    let contentRevealed = false;

    if (heroVideo) {
        heroVideo.addEventListener('timeupdate', () => {
            if (!contentRevealed && heroVideo.currentTime >= 1.0) {
                contentRevealed = true;
                
                // Fade in the hero content (title, subtitle, btn)
                if (heroContent) heroContent.classList.add('revealed');
                
                // Fade in scroll indicator
                if (scrollIndicator) {
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

    // Mini Carousels in Masonry Grid - Change image every 2.5 seconds
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

    // 4.b Collections Group Carousel (9 Collections) - Manual Switch Only
    const groups = document.querySelectorAll('.collection-group');
    const dots = document.querySelectorAll('.carousel-dot');
    if (groups.length > 1) {
        let currentGroup = 0;

        function showGroup(index) {
            groups.forEach((g, i) => {
                if (i === index) {
                    g.classList.add('active');
                    // Refresh ScrollTrigger so that subsequent page elements recalculate their scroll positions
                    setTimeout(() => {
                        ScrollTrigger.refresh();
                    }, 50);
                } else {
                    g.classList.remove('active');
                }
            });
            dots.forEach((d, i) => {
                if (i === index) {
                    d.classList.add('active');
                } else {
                    d.classList.remove('active');
                }
            });
            currentGroup = index;
        }

        // Dot click interaction
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showGroup(index);
            });
        });

        // Mobile swipe gestures
        let touchStartX = 0;
        let touchEndX = 0;
        const carouselContainer = document.querySelector('.collection-carousel');

        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const threshold = 60; // minimum pixels to count as swipe
            if (touchEndX < touchStartX - threshold) {
                // Swiped Left -> Show next group
                const nextIndex = (currentGroup + 1) % groups.length;
                showGroup(nextIndex);
            } else if (touchEndX > touchStartX + threshold) {
                // Swiped Right -> Show previous group
                const prevIndex = (currentGroup - 1 + groups.length) % groups.length;
                showGroup(prevIndex);
            }
        }
    }




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
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page reload
            
            const submitBtn = waitlistForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            };

            try {
                // Send data to GHL Webhook
                await fetch('https://services.leadconnectorhq.com/hooks/Tonfzi9ULpYjVs5xROQs/webhook-trigger/043962cc-4e3f-4dfc-8da2-a2aed7ebbd3c', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
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
            } catch (error) {
                console.error('Error submitting form:', error);
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                alert('Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');
            }
        });
    }
});
