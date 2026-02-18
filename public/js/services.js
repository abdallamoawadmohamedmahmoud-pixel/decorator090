// services.js - Main JavaScript for services functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Alpine.js if not available
    if (typeof Alpine === 'undefined') {
        console.warn('Alpine.js not loaded. Falling back to vanilla JavaScript');
        initVanillaJS();
    } else {
        initAlpineJS();
    }
});

// Alpine.js initialization
function initAlpineJS() {
    console.warn('Alpine.js not implemented yet. Using vanilla JS fallback.');
    initVanillaJS();
}

    // Vanilla JS fallback
    function initVanillaJS() {
        // Simple implementation for when Alpine.js is not available
        window.servicesData = {
            services: [],
            loading: false,
            category: '',
            activeFilters: []
        };

        // Load initial services
        loadServicesVanilla();
    }

    function loadServicesVanilla() {
        fetch('http://localhost:5001/api/services')
            .then(response => response.json())
            .then(data => {
                window.servicesData.services = data;
                window.servicesData.loading = false;
                renderServicesVanilla();
            })
            .catch(error => {
                console.error('Error loading services:', error);
                window.servicesData.loading = false;
                renderServicesVanilla();
            });
    }

    function renderServicesVanilla() {
        const container = document.querySelector('.services-grid');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;

        const services = window.servicesData.services;
        const activeFilters = window.servicesData.activeFilters;
        
        // Show/hide loading and empty states
        if (window.servicesData.loading) {
            loadingState.style.display = 'block';
            emptyState.style.display = 'none';
            container.style.display = 'none';
            return;
        }
        
        loadingState.style.display = 'none';
        
        const filteredServices = services.filter(service => 
            activeFilters.length === 0 || activeFilters.includes(service.category)
        );
        
        if (filteredServices.length === 0) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        container.style.display = 'grid';
        
        container.innerHTML = filteredServices.map(service => `
            <div class="service-card" data-id="${service.id}">
                <div class="service-image-container">
                    <img src="${service.image_url}" alt="${service.title}">
                    <span class="service-badge">${getCategoryIcon(service.category)}</span>
                </div>
                <div class="service-content">
                    <h3>${service.title}</h3>
                    <span class="service-category">${service.category}</span>
                    <p>${service.description}</p>
                    <div class="service-footer">
                        ${service.price ? `
                            <i class="fas fa-coins"></i>
                            <span>${service.price} جنيه</span>
                        ` : 'سعر حسب الاتفاق'}
                    </div>
                    <div class="service-actions">
                        <button class="btn-service btn-outline" onclick="openServiceDetail(${service.id})">تفاصيل</button>
                        <button class="btn-service btn-primary" onclick="contactForService('${service.title}')">استشارة</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

        // Add click handlers
        container.addEventListener('click', (e) => {
            const serviceCard = e.target.closest('.service-card');
            if (serviceCard) {
                const serviceId = serviceCard.dataset.id;
                openServiceDetail(serviceId);
            }
        });
    }

    function getCategoryIcon(category) {
        const icons = {
            'تصميم وتطوير': '💻',
            'تسويق': '📈',
            'أخرى': '📋'
        };
        return icons[category] || '📋';
    }

    function setCategoryFilter(category) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const filterBtn = document.getElementById(`filter-${category}`);
        if (filterBtn) {
            filterBtn.classList.add('active');
        }
        
        // Update active filters and re-render
        if (category === '') {
            window.servicesData.activeFilters = [];
        } else {
            window.servicesData.activeFilters = [category];
        }
        
        renderServicesVanilla();
    }

    function openServiceDetail(serviceId) {
        const service = window.servicesData.services.find(s => s.id === parseInt(serviceId));
        if (service) {
            showModal(service);
        }
    }

    function showModal(service) {
        const modal = document.getElementById('serviceModal');
        document.getElementById('modalTitle').textContent = service.title;
        document.getElementById('modalTitle2').textContent = service.title;
        document.getElementById('modalCategory').textContent = service.category;
        document.getElementById('modalDescription').textContent = service.description;
        document.getElementById('modalImage').src = service.image_url;
        document.getElementById('modalImage').alt = service.title;
        
        if (service.price) {
            document.getElementById('modalPrice').style.display = 'block';
            document.getElementById('modalPriceText').textContent = `${service.price} جنيه`;
        } else {
            document.getElementById('modalPrice').style.display = 'none';
        }
        
        modal.style.display = 'block';
    }

    function contactForService(serviceTitle) {
        const message = `مرحباً، أود الاستفسار عن خدمة: ${serviceTitle}`;
        const whatsappUrl = `https://wa.me/01099797984?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Contact functions
    function closeModal() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Initialize page
    loadServicesVanilla();
}

// Load services function
function loadServices() {
    fetch('http://localhost:5001/api/services')
        .then(response => response.json())
        .then(data => {
            window.servicesData.services = data;
            window.servicesData.loading = false;
            renderServicesVanilla();
        })
        .catch(error => {
            console.error('Error loading services:', error);
            window.servicesData.loading = false;
        });
}

// Intersection Observer for animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });
});

// Smooth scroll behavior
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

// Image lazy loading
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));