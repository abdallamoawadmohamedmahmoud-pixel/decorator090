// Website Enhancements and Utilities
class WebsiteEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addLazyLoading();
        this.addSmoothScrolling();
        this.addBackToTop();
        this.addLoadingSpinner();
        this.addNotifications();
        this.addFormEnhancements();
        this.addImageOptimizations();
    }

    // Lazy Loading for Images
    addLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Smooth Scrolling
    addSmoothScrolling() {
        // Add smooth scroll behavior to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Back to Top Button
    addBackToTop() {
        const backToTopButton = document.createElement('a');
        backToTopButton.href = '#';
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '↑';
        backToTopButton.setAttribute('aria-label', 'العودة للأعلى');
        
        document.body.appendChild(backToTopButton);

        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Smooth scroll to top
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Loading Spinner
    addLoadingSpinner() {
        window.showPageLoading = () => {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'page-loading';
            loadingDiv.innerHTML = '<div class="page-loading-spinner"></div>';
            loadingDiv.id = 'pageLoading';
            document.body.appendChild(loadingDiv);
        };

        window.hidePageLoading = () => {
            const loading = document.getElementById('pageLoading');
            if (loading) {
                loading.remove();
            }
        };
    }

    // Notification Toast System
    addNotifications() {
        window.showNotification = (message, type = 'success', duration = 3000) => {
            const notification = document.createElement('div');
            notification.className = `notification-toast ${type}`;
            notification.innerHTML = `
                <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
                ${message}
            `;
            
            document.body.appendChild(notification);

            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            // Hide notification
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 400);
            }, duration);
        };
    }

    // Form Enhancements
    addFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add submit prevention for double submission
            let isSubmitting = false;
            
            form.addEventListener('submit', (e) => {
                if (isSubmitting) {
                    e.preventDefault();
                    return false;
                }
                
                isSubmitting = true;
                const submitButton = form.querySelector('button[type="submit"]');
                
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="loading"></span> جاري الإرسال...';
                }
                
                // Reset after 5 seconds (in case of errors)
                setTimeout(() => {
                    isSubmitting = false;
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.innerHTML = submitButton.dataset.originalText || 'إرسال';
                    }
                }, 5000);
            });

            // Store original button text
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.dataset.originalText = submitButton.innerHTML;
            }
        });
    }

    // Image Optimizations
    addImageOptimizations() {
        // Add error handling for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14">!</text></svg>';
                this.alt = 'صورة غير متاحة';
            });

            // Add loading placeholder
            if (!img.complete) {
                img.style.background = 'linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
            }
        });
    }

    // Performance Monitoring
    addPerformanceMonitoring() {
        // Simple performance metrics
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Show performance notification in development
            if (window.location.hostname === 'localhost') {
                if (loadTime > 1000) {
                    console.warn('Page load time is above 1 second');
                }
            }
        });
    }

    // Offline Detection
    addOfflineDetection() {
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                document.body.classList.remove('offline');
            } else {
                document.body.classList.add('offline');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    // Accessibility Enhancements
    addAccessibilityEnhancements() {
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-dark);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
    }

    // SEO Enhancements
    addSEOEnhancements() {
        // Add structured data for search engines
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Decorator - From Door To Full Decor",
            "description": "شركة متخصصة في تشطيب الشقق وتركيب السيراميك في الفيوم والمسلة",
            "url": window.location.href,
            "logo": window.location.origin + '/logo.jpg',
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+01099797984",
                "contactType": "customer service",
                "availableLanguage": "Arabic"
            },
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "الفيوم",
                "addressCountry": "مصر"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
}

// Cookie Consent Management
class CookieConsent {
    constructor() {
        this.consentGiven = localStorage.getItem('cookie-consent');
        this.init();
    }

    init() {
        if (!this.consentGiven) {
            this.showConsentBanner();
        }
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <p>نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار فإنك توافق على استخدامنا.</p>
                <div class="cookie-consent-buttons">
                    <button onclick="cookieConsent.accept()" class="cookie-accept">قبول</button>
                    <button onclick="cookieConsent.decline()" class="cookie-decline">رفض</button>
                </div>
            </div>
        `;

        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--primary-dark);
            color: white;
            padding: 1rem;
            z-index: 10000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(banner);

        // Show banner with animation
        setTimeout(() => {
            banner.style.transform = 'translateY(0)';
        }, 100);
    }

    accept() {
        localStorage.setItem('cookie-consent', 'accepted');
        this.hideBanner();
    }

    decline() {
        localStorage.setItem('cookie-consent', 'declined');
        this.hideBanner();
    }

    hideBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    new WebsiteEnhancements();
    window.cookieConsent = new CookieConsent();
});

// Add CSS for new elements
const enhancedCSS = `
    .skip-link:focus {
        outline: 2px solid var(--primary-turquoise);
    }
    
    .offline .notification-toast {
        background: #dc3545 !important;
    }
    
    .cookie-consent-banner {
        box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
    }
    
    .cookie-consent-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
    }
    
    .cookie-consent-buttons {
        display: flex;
        gap: 1rem;
    }
    
    .cookie-accept, .cookie-decline {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .cookie-accept {
        background: var(--primary-turquoise);
        color: white;
    }
    
    .cookie-accept:hover {
        background: #30c0b0;
        transform: translateY(-2px);
    }
    
    .cookie-decline {
        background: transparent;
        color: white;
        border: 1px solid white;
    }
    
    .cookie-decline:hover {
        background: rgba(255,255,255,0.1);
    }
    
    @media (max-width: 768px) {
        .cookie-consent-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
        .cookie-consent-buttons {
            justify-content: center;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedCSS;
document.head.appendChild(styleSheet);