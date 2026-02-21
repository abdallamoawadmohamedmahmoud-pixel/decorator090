// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Before/After Slider
    const sliders = document.querySelectorAll('.slider-container');
    sliders.forEach(slider => {
        const sliderLine = slider.querySelector('.slider-line');
        const sliderAfter = slider.querySelector('.slider-after');
        let isDragging = false;
        
        function updateSliderPosition(x) {
            const rect = slider.getBoundingClientRect();
            let position = ((rect.right - x) / rect.width) * 100;
            position = Math.max(0, Math.min(100, position));
            
            sliderLine.style.left = `${100 - position}%`;
            sliderAfter.style.clipPath = `inset(0 ${position}% 0 0)`;
        }
        
        sliderLine.addEventListener('mousedown', () => isDragging = true);
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateSliderPosition(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', () => isDragging = false);
        
        // Touch support
        sliderLine.addEventListener('touchstart', () => isDragging = true);
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                updateSliderPosition(e.touches[0].clientX);
            }
        });
        
        document.addEventListener('touchend', () => isDragging = false);
    });
    
    // Smooth Scrolling
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
    
    // Form Submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const phone = this.querySelector('input[name="phone"]').value;
            const service = this.querySelector('select[name="service"]').value || 'عام';
            const message = this.querySelector('textarea[name="message"]').value;
            
            // Store in local storage for admin dashboard
            const contactData = { name, email, phone, service, message };
            
            // Try to store for dashboard
            try {
                if (typeof storeContact === 'function') {
                    storeContact(contactData);
                } else {
                    // Fallback storage
                    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
                    contacts.unshift({
                        ...contactData,
                        id: Date.now(),
                        createdAt: new Date().toISOString(),
                        read: false
                    });
                    localStorage.setItem('decorator_contacts', JSON.stringify(contacts));
                }
            } catch (error) {
                console.log('Dashboard storage not available');
            }
            
            // Create WhatsApp message
            const whatsappMessage = `🏠 رسالة جديدة من موقع Decorator:\n\n👤 الاسم: ${name}\n📧 البريد: ${email}\n📱 الهاتف: ${phone}\n🔧 الخدمة: ${service}\n📝 الرسالة: ${message}`;
            
            // Send to WhatsApp (replace with actual number)
            const whatsappNumber = '01099797984'; // Replace with actual number
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'تم إرسال رسالتك بنجاح! جاري فتح واتساب...';
            successMessage.style.cssText = `
                background: #25d366;
                color: white;
                padding: 1rem;
                border-radius: 5px;
                margin-bottom: 1rem;
                text-align: center;
            `;
            
            this.insertBefore(successMessage, this.firstChild);
            
            // Reset form
            this.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    }
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .service-card, .portfolio-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // WhatsApp button functionality
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function(e) {
            e.preventDefault();
            const whatsappNumber = '01099797984'; // Replace with actual number
            const message = 'مرحباً، أود الاستفسار عن خدمات تشطيب الشقق';
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Dynamic year in footer
document.addEventListener('DOMContentLoaded', function() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
});