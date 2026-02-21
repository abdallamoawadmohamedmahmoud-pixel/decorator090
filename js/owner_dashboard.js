// Owner Dashboard JavaScript
<<<<<<< HEAD

// Initialize auth if not already done
let auth;
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من تسجيل الدخول
    if (typeof auth === 'undefined') {
        auth = new AuthSystem();
    }
    
    if (!auth.checkAuth() || !auth.isOwner()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize dashboard
    ownerDashboardManager = new OwnerDashboardManager();
});

=======
>>>>>>> 401b863b7737cc5748f410a704da02683e9b3f59
class OwnerDashboardManager {
    constructor() {
        this.auth = auth;
        this.currentSection = 'dashboard';
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.updateUserInfo();
        this.loadDashboardData();
        this.setupEventListeners();
        
        // Welcome owner
        this.showNotification('مرحباً بك في لوحة تحكم المالك 👑', 'success');
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
            if (userRole) userRole.textContent = '👑 مالك';
            if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

            // Update owner info section
            document.getElementById('ownerName').value = user.name;
            document.getElementById('ownerEmail').value = user.email;
            document.getElementById('ownerPhone').value = user.phone;
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
                    <td>${activity.user || '-'}</td>
                    <td>${activity.date}</td>
                    <td><span style="color: ${activity.color}">${activity.status}</span></td>
                </tr>
            `).join('');
        }
    }

    generateRecentActivities() {
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        
        const activities = [];
        
        // Add recent contacts
        contacts.slice(0, 3).forEach(contact => {
            activities.push({
                type: 'رسالة تواصل',
                details: `رسالة من ${contact.name}`,
                user: '-',
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
                user: '-',
                date: new Date(project.date).toLocaleDateString('ar-EG'),
                status: project.status,
                color: project.status === 'مكتمل' ? '#28a745' : '#17a2b8'
            });
        });

        // Add user registrations
        users.slice(0, 2).forEach(user => {
            if (!user.is_owner) {
                activities.push({
                    type: 'تسجيل مستخدم',
                    details: `انضم ${user.name} كـ ${user.role}`,
                    user: user.name,
                    date: new Date(user.createdAt).toLocaleDateString('ar-EG'),
                    status: 'نشط',
                    color: '#17a2b8'
                });
            }
        });

        return activities.slice(0, 5);
    }

    setupEventListeners() {
        // Search functionality
        const userSearch = document.getElementById('userSearch');
        const userFilter = document.getElementById('userFilter');
        
        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }
        
        if (userFilter) {
            userFilter.addEventListener('change', () => this.filterUsers());
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
            case 'projects':
                this.loadProjects();
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'system':
                this.loadSystemInfo();
                break;
        }
    }

    loadUsers() {
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
                    <td><span style="color: ${this.getRoleColor(user.role)}">${user.is_owner ? '👑 مالك' : 'مستخدم'}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="action-buttons">
                            ${!user.is_owner ? `<button class="btn-delete" onclick="deleteUser(${user.id})">حذف</button>` : ''}
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

    loadSystemInfo() {
        // Calculate system statistics
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        
        const storageSize = (JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2);
        
        this.showNotification(`حالة النظام: ${users.length} مستخدم، ${contacts.length} رسالة، ${projects.length} مشروع. استخدام التخزين: ${storageSize} MB`, 'info');
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
                filteredUsers = filteredUsers.filter(user => 
                    filterRole === 'owner' ? user.is_owner : !user.is_owner
                );
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
                    <td><span style="color: ${this.getRoleColor(user.role)}">${user.is_owner ? '👑 مالك' : 'مستخدم'}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                        <div class="action-buttons">
                            ${!user.is_owner ? `<button class="btn-delete" onclick="deleteUser(${user.id})">حذف</button>` : ''}
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

    // Owner-specific functions
    editOwnerInfo() {
        this.showNotification('بيانات المالك محمية ولا يمكن تعديلها من هنا', 'info');
    }

    showSystemBackup() {
        this.showNotification('جاري إنشاء نسخة احتياطية...', 'info');
        setTimeout(() => {
            this.backupDatabase();
        }, 1000);
    }

    sendNewsletter() {
        this.showNotification('سيتم تطوير إرسال النشرات الإخبارية قريباً', 'info');
    }

    viewLogs() {
        const logs = [
            '2024-01-15 10:30 - تسجيل دخول مالك النظام',
            '2024-01-15 11:45 - إضافة مستخدم جديد',
            '2024-01-15 14:20 - تلقي رسالة تواصل جديدة',
            '2024-01-15 16:10 - تحديث إعدادات النظام'
        ];
        
        alert('سجلات النظام:\n\n' + logs.join('\n'));
    }

    backupDatabase() {
        const data = {
            users: JSON.parse(localStorage.getItem('decorator_users') || '[]'),
            contacts: JSON.parse(localStorage.getItem('decorator_contacts') || '[]'),
            projects: JSON.parse(localStorage.getItem('decorator_projects') || '[]'),
            settings: JSON.parse(localStorage.getItem('decorator_settings') || '{}'),
            backupDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decorator-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showNotification('تم إنشاء نسخة احتياطية بنجاح', 'success');
    }

    clearCache() {
        // Clear cache and reload
        this.showNotification('جاري مسح الكاش...', 'info');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    exportUsers() {
        const result = this.auth.getAllUsers();
        if (result.success) {
            const blob = new Blob([JSON.stringify(result.users, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            this.showNotification('تم تصدير المستخدمين بنجاح', 'success');
        }
    }

    systemMaintenance() {
        this.showNotification('جاري تشغيل صيانة النظام...', 'info');
        setTimeout(() => {
            this.showNotification('تمت الصيانة بنجاح', 'success');
        }, 2000);
    }
}

// Global functions for onclick handlers
let ownerDashboardManager;

function showSection(sectionName) {
    if (ownerDashboardManager) {
        ownerDashboardManager.showSection(sectionName);
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

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        const result = auth.deleteUser(userId);
        if (result.success) {
            ownerDashboardManager.showNotification('تم حذف المستخدم بنجاح', 'success');
            ownerDashboardManager.loadUsers();
        } else {
            ownerDashboardManager.showNotification(result.message, 'error');
        }
    }
}

function markAsRead(contactId) {
    const result = markContactAsRead(contactId);
    if (result.success) {
        ownerDashboardManager.showNotification('تم تحديد الرسالة كمقروءة', 'success');
        ownerDashboardManager.loadContacts();
        ownerDashboardManager.loadDashboardData();
    }
}

function deleteContact(contactId) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
        const filteredContacts = contacts.filter(c => c.id !== contactId);
        localStorage.setItem('decorator_contacts', JSON.stringify(filteredContacts));
        
        ownerDashboardManager.showNotification('تم حذف الرسالة بنجاح', 'success');
        ownerDashboardManager.loadContacts();
        ownerDashboardManager.loadDashboardData();
    }
}

function editProject(projectId) {
    ownerDashboardManager.showNotification('سيتم تطوير وظيفة التعديل قريباً', 'info');
}

function deleteProject(projectId) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        const projects = JSON.parse(localStorage.getItem('decorator_projects') || '[]');
        const filteredProjects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('decorator_projects', JSON.stringify(filteredProjects));
        
        ownerDashboardManager.showNotification('تم حذف المشروع بنجاح', 'success');
        ownerDashboardManager.loadProjects();
        ownerDashboardManager.loadDashboardData();
    }
}

function markAllAsRead() {
    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
    contacts.forEach(contact => contact.read = true);
    localStorage.setItem('decorator_contacts', JSON.stringify(contacts));
    
    ownerDashboardManager.showNotification('تم تحديد جميع الرسائل كمقروءة', 'success');
    ownerDashboardManager.loadContacts();
    ownerDashboardManager.loadDashboardData();
}

function saveSettings() {
    const settings = {
        whatsappNumber: document.getElementById('whatsappNumber').value,
        notificationEmail: document.getElementById('notificationEmail').value,
        welcomeMessage: document.getElementById('welcomeMessage').value,
        allowRegistration: document.getElementById('allowRegistration').value
    };
    
    const result = updateSettings(settings);
    if (result.success) {
        ownerDashboardManager.showNotification('تم حفظ الإعدادات بنجاح', 'success');
    } else {
        ownerDashboardManager.showNotification(result.message, 'error');
    }
}

function refreshData() {
    ownerDashboardManager.refreshData();
}

// System functions
function backupDatabase() {
    ownerDashboardManager.backupDatabase();
}

function clearCache() {
    ownerDashboardManager.clearCache();
}

function exportUsers() {
    ownerDashboardManager.exportUsers();
}

function systemMaintenance() {
    ownerDashboardManager.systemMaintenance();
}

// Initialize owner dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ownerDashboardManager = new OwnerDashboardManager();
    
    // Handle add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userData = Object.fromEntries(formData);
            
            const result = auth.register(userData);
            if (result.success) {
                ownerDashboardManager.showNotification('تم إضافة المستخدم بنجاح', 'success');
                closeModal('addUserModal');
                ownerDashboardManager.loadUsers();
                this.reset();
            } else {
                ownerDashboardManager.showNotification(result.message, 'error');
            }
        });
    }
});