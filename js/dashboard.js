// Dashboard JavaScript
class DashboardManager {
    constructor() {
        this.auth = auth;
        this.currentSection = 'dashboard';
        this.services = [];
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.updateUserInfo();
        this.loadDashboardData();
        this.loadServices();
        this.setupEventListeners();
        
        // Check user permissions
        this.checkPermissions();
    }

    updateUserInfo() {
        const user = this.auth.getCurrentUser();
        if (user) {
            // Update user info in sidebar
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userRole = document.getElementById('userRole');
            const userAvatar = document.getElementById('userAvatar');

            if (userName) userName.textContent = user.name;
            if (userEmail) userEmail.textContent = user.email;
            if (userRole) userRole.textContent = this.getRoleName(user.role);
            if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }

    getRoleName(role) {
        const roles = {
            'owner': 'مالك',
            'admin': 'مدير',
            'user': 'مستخدم عادي'
        };
        return roles[role] || 'مستخدم';
    }

    checkPermissions() {
        const user = this.auth.getCurrentUser();
        
        // Hide admin features from regular users
        if (!this.auth.isAdmin()) {
            const usersMenuItem = document.querySelector('a[onclick*="showSection(\'users\')"]');
            const settingsMenuItem = document.querySelector('a[onclick*="showSection(\'settings\')"]');
            
            if (usersMenuItem) usersMenuItem.parentElement.style.display = 'none';
            if (settingsMenuItem) settingsMenuItem.parentElement.style.display = 'none';
        }

        // Only owner can access certain features
        if (!this.auth.isOwner()) {
            // Additional restrictions can be added here
            this.showNotification('مرحباً! لديك صلاحيات محدودة كـ ' + this.getRoleName(user.role), 'info');
        }
    }

    loadDashboardData() {
        this.loadStats();
        this.loadRecentActivities();
    }

    loadStats() {
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');

        // Update dashboard stats
        this.animateNumber('totalUsers', users.length);
        this.animateNumber('totalContacts', contacts.filter(c => !c.read).length);
        this.animateNumber('totalProjects', projects.filter(p => p.status === 'مكتمل').length);
        this.animateNumber('totalWhatsApp', contacts.length * 2); // Estimated
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 30);
    }

    loadRecentActivities() {
        const activities = this.generateRecentActivities();
        const tbody = document.getElementById('recentActivities');
        
        if (tbody) {
            tbody.innerHTML = activities.map(activity => `
                <tr>
                    <td>${activity.type}</td>
                    <td>${activity.details}</td>
                    <td>${activity.date}</td>
                    <td><span style="color: ${activity.color}">${activity.status}</span></td>
                </tr>
            `).join('');
        }
    }

    generateRecentActivities() {
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        
        const activities = [];
        
        // Add recent contacts
        contacts.slice(0, 3).forEach(contact => {
            activities.push({
                type: 'رسالة تواصل',
                details: `رسالة من ${contact.name}`,
                date: new Date(contact.createdAt).toLocaleDateString('ar-EG'),
                status: contact.read ? 'مقروءة' : 'جديدة',
                color: contact.read ? '#28a745' : '#ffc107'
            });
        });

        // Add recent projects
        projects.slice(0, 2).forEach(project => {
            activities.push({
                type: 'مشروع',
                details: `${project.name} - ${project.client}`,
                date: new Date(project.date).toLocaleDateString('ar-EG'),
                status: project.status,
                color: project.status === 'مكتمل' ? '#28a745' : '#17a2b8'
            });
        });

        return activities.slice(0, 5);
    }

    setupEventListeners() {
        // Search functionality
        const userSearch = document.getElementById('userSearch');
        const userFilter = document.getElementById('userFilter');
        const serviceSearch = document.getElementById('serviceSearch');
        const serviceFilter = document.getElementById('serviceFilter');
        
        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }
        
        if (userFilter) {
            userFilter.addEventListener('change', () => this.filterUsers());
        }
        
        if (serviceSearch) {
            serviceSearch.addEventListener('input', () => this.filterServices());
        }
        
        if (serviceFilter) {
            serviceFilter.addEventListener('change', () => this.filterServices());
        }
        
        // Service forms
        const addServiceForm = document.getElementById('addServiceForm');
        const editServiceForm = document.getElementById('editServiceForm');
        
        if (addServiceForm) {
            addServiceForm.addEventListener('submit', (e) => this.handleAddService(e));
        }
        
        if (editServiceForm) {
            editServiceForm.addEventListener('submit', (e) => this.handleEditService(e));
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionName + 'Section');
        if (selectedSection) {
            selectedSection.style.display = 'block';
            this.currentSection = sectionName;
        }

        // Update menu active state
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`a[onclick*="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'users':
                this.loadUsers();
                break;
            case 'contacts':
                this.loadContacts();
                break;
            case 'services':
                this.loadServices();
                break;
            case 'projects':
                this.loadProjects();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadUsers() {
        if (!this.auth.isAdmin()) return;

        const result = this.auth.getAllUsers();
        if (!result.success) {
            this.showNotification(result.message, 'error');
            return;
        }

        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = result.users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || '-'}</td>
                    <td><span style="color: ${this.getRoleColor(user.role)}">${this.getRoleName(user.role)}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="action-buttons">
                            ${this.auth.isOwner() ? `<button class="btn-edit" onclick="editUser(${user.id})">تعديل</button>` : ''}
                            ${this.auth.isOwner() && user.id !== this.auth.getCurrentUser().id ? `<button class="btn-delete" onclick="deleteUser(${user.id})">حذف</button>` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadContacts() {
        const result = getContacts();
        if (!result.success) {
            this.showNotification(result.message, 'error');
            return;
        }

        const tbody = document.getElementById('contactsTableBody');
        if (tbody) {
            tbody.innerHTML = result.contacts.map(contact => `
                <tr>
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.message.substring(0, 50)}...</td>
                    <td>${new Date(contact.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td><span style="color: ${contact.read ? '#28a745' : '#ffc107'}">${contact.read ? 'مقروءة' : 'جديدة'}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${!contact.read ? `<button class="btn-edit" onclick="markAsRead(${contact.id})">تحديد كمقروءة</button>` : ''}
                            <button class="btn-delete" onclick="deleteContact(${contact.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    async loadServices() {
        try {
            const response = await fetch('http://localhost:5001/api/services');
            if (response.ok) {
                this.services = await response.json();
                this.renderServicesTable();
            } else {
                this.showNotification('فشل تحميل الخدمات', 'error');
            }
        } catch (error) {
            console.error('Error loading services:', error);
            this.showNotification('حدث خطأ أثناء تحميل الخدمات', 'error');
        }
    }

    renderServicesTable() {
        const tbody = document.getElementById('servicesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.services.map(service => `
            <tr>
                <td><img src="${service.image_url}" alt="${service.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${service.title}</td>
                <td><span style="color: #17a2b8">${service.category}</span></td>
                <td>${service.price ? `${service.price} جنيه` : 'سعر حسب الاتفاق'}</td>
                <td><span style="color: ${service.status === 'active' ? '#28a745' : '#dc3545'}">${service.status === 'active' ? 'نشطة' : 'غير نشطة'}</span></td>
                <td>${new Date(service.created_at).toLocaleDateString('ar-EG')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="dashboard.editService(${service.id})">تعديل</button>
                        <button class="btn-delete" onclick="dashboard.deleteService(${service.id})">حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async handleAddService(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const serviceData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: formData.get('price') ? parseFloat(formData.get('price')) : null,
            image_url: formData.get('image_url') || 'https://picsum.photos/seed/default/400/300'
        };

        try {
            const response = await fetch('http://localhost:5001/admin/services/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(serviceData)
            });

            if (response.ok) {
                this.showNotification('تم إضافة الخدمة بنجاح', 'success');
                this.closeModal('addServiceModal');
                this.loadServices();
                e.target.reset();
            } else {
                this.showNotification('فشل إضافة الخدمة', 'error');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            this.showNotification('حدث خطأ أثناء إضافة الخدمة', 'error');
        }
    }

    async handleEditService(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const serviceId = formData.get('id');
        const serviceData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: formData.get('price') ? parseFloat(formData.get('price')) : null,
            image_url: formData.get('image_url')
        };

        try {
            const response = await fetch(`http://localhost:5001/admin/services/${serviceId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(serviceData)
            });

            if (response.ok) {
                this.showNotification('تم تحديث الخدمة بنجاح', 'success');
                this.closeModal('editServiceModal');
                this.loadServices();
            } else {
                this.showNotification('فشل تحديث الخدمة', 'error');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            this.showNotification('حدث خطأ أثناء تحديث الخدمة', 'error');
        }
    }

    editService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        document.getElementById('editServiceId').value = service.id;
        document.getElementById('editServiceTitle').value = service.title;
        document.getElementById('editServiceDescription').value = service.description;
        document.getElementById('editServiceCategory').value = service.category;
        document.getElementById('editServicePrice').value = service.price || '';
        document.getElementById('editServiceImageUrl').value = service.image_url;

        this.openModal('editServiceModal');
    }

    async deleteService(serviceId) {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

        try {
            const response = await fetch(`http://localhost:5001/admin/services/${serviceId}/delete`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showNotification('تم حذف الخدمة بنجاح', 'success');
                this.loadServices();
            } else {
                this.showNotification('فشل حذف الخدمة', 'error');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            this.showNotification('حدث خطأ أثناء حذف الخدمة', 'error');
        }
    }

    filterServices() {
        const searchTerm = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('serviceFilter')?.value || '';

        const filteredServices = this.services.filter(service => {
            const matchesSearch = !searchTerm || 
                service.title.toLowerCase().includes(searchTerm) || 
                service.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || service.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });

        // Temporarily replace services array for rendering
        const originalServices = this.services;
        this.services = filteredServices;
        this.renderServicesTable();
        this.services = originalServices;
    }

    loadProjects() {
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        const tbody = document.getElementById('projectsTableBody');
        
        if (tbody) {
            tbody.innerHTML = projects.map(project => `
                <tr>
                    <td>${project.name}</td>
                    <td>${project.client}</td>
                    <td>${project.service}</td>
                    <td><span style="color: ${this.getStatusColor(project.status)}">${project.status}</span></td>
                    <td>${new Date(project.date).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProject(${project.id})">تعديل</button>
                            <button class="btn-delete" onclick="deleteProject(${project.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadSettings() {
        const result = getSettings();
        if (result.success) {
            const settings = result.settings;
            document.getElementById('whatsappNumber').value = settings.whatsappNumber;
            document.getElementById('notificationEmail').value = settings.notificationEmail;
            document.getElementById('welcomeMessage').value = settings.welcomeMessage;
        }
    }

    getRoleColor(role) {
        const colors = {
            'owner': '#dc3545',
            'admin': '#ffc107',
            'user': '#28a745'
        };
        return colors[role] || '#6c757d';
    }

    getStatusColor(status) {
        const colors = {
            'مكتمل': '#28a745',
            'قيد التنفيذ': '#17a2b8',
            'معلق': '#ffc107',
            'ملغي': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    filterUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const filterRole = document.getElementById('userFilter').value;
        const result = this.auth.getAllUsers();
        
        if (result.success) {
            let filteredUsers = result.users;
            
            if (searchTerm) {
                filteredUsers = filteredUsers.filter(user => 
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm)
                );
            }
            
            if (filterRole) {
                filteredUsers = filteredUsers.filter(user => user.role === filterRole);
            }
            
            // Re-render table with filtered results
            this.renderFilteredUsers(filteredUsers);
        }
    }

    renderFilteredUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || '-'}</td>
                    <td><span style="color: ${this.getRoleColor(user.role)}">${this.getRoleName(user.role)}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="action-buttons">
                            ${this.auth.isOwner() ? `<button class="btn-edit" onclick="editUser(${user.id})">تعديل</button>` : ''}
                            ${this.auth.isOwner() && user.id !== this.auth.getCurrentUser().id ? `<button class="btn-delete" onclick="deleteUser(${user.id})">حذف</button>` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    refreshData() {
        this.loadDashboardData();
        this.showNotification('تم تحديث البيانات بنجاح', 'success');
    }
}

// Global functions for onclick handlers
let dashboardManager;

function showSection(sectionName) {
    if (dashboardManager) {
        dashboardManager.showSection(sectionName);
    }
}

function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        auth.logout();
    }
}

function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

function editUser(userId) {
    dashboardManager.showNotification('سيتم تطوير وظيفة التعديل قريباً', 'info');
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        const result = auth.deleteUser(userId);
        if (result.success) {
            dashboardManager.showNotification('تم حذف المستخدم بنجاح', 'success');
            dashboardManager.loadUsers();
        } else {
            dashboardManager.showNotification(result.message, 'error');
        }
    }
}

function markAsRead(contactId) {
    const result = markContactAsRead(contactId);
    if (result.success) {
        dashboardManager.showNotification('تم تحديد الرسالة كمقروءة', 'success');
        dashboardManager.loadContacts();
        dashboardManager.loadDashboardData();
    }
}

function deleteContact(contactId) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const filteredContacts = contacts.filter(c => c.id !== contactId);
        localStorage.setItem('decorator_contacts', JSON.stringify(filteredContacts));
        
        dashboardManager.showNotification('تم حذف الرسالة بنجاح', 'success');
        dashboardManager.loadContacts();
        dashboardManager.loadDashboardData();
    }
}

function editProject(projectId) {
    dashboardManager.showNotification('سيتم تطوير وظيفة التعديل قريباً', 'info');
}

function deleteProject(projectId) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        const filteredProjects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('decorator_projects', JSON.stringify(filteredProjects));
        
        dashboardManager.showNotification('تم حذف المشروع بنجاح', 'success');
        dashboardManager.loadProjects();
        dashboardManager.loadDashboardData();
    }
}

function showAddServiceModal() {
    dashboardManager.openModal('addServiceModal');
}

function showEditServiceModal(serviceId) {
    dashboardManager.editService(serviceId);
}

function markAllAsRead() {
    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
    contacts.forEach(contact => contact.read = true);
    localStorage.setItem('decorator_contacts', JSON.stringify(contacts));
    
    dashboardManager.showNotification('تم تحديد جميع الرسائل كمقروءة', 'success');
    dashboardManager.loadContacts();
    dashboardManager.loadDashboardData();
}

function saveSettings() {
    const settings = {
        whatsappNumber: document.getElementById('whatsappNumber').value,
        notificationEmail: document.getElementById('notificationEmail').value,
        welcomeMessage: document.getElementById('welcomeMessage').value
    };
    
    const result = updateSettings(settings);
    if (result.success) {
        dashboardManager.showNotification('تم حفظ الإعدادات بنجاح', 'success');
    } else {
        dashboardManager.showNotification(result.message, 'error');
    }
}

function refreshData() {
    dashboardManager.refreshData();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    dashboardManager = new DashboardManager();
    
    // Handle add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userData = Object.fromEntries(formData);
            
            const result = auth.register(userData);
            if (result.success) {
                dashboardManager.showNotification('تم إضافة المستخدم بنجاح', 'success');
                closeModal('addUserModal');
                dashboardManager.loadUsers();
                this.reset();
            } else {
                dashboardManager.showNotification(result.message, 'error');
            }
        });
    }
});