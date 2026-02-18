// User Dashboard JavaScript
class UserDashboardManager {
    constructor() {
        this.auth = auth;
        this.currentSection = 'dashboard';
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.updateUserInfo();
        this.loadDashboardData();
        this.setupEventListeners();
        
        // Welcome user
        const user = this.auth.getCurrentUser();
        document.getElementById('welcomeName').textContent = user.name;
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
            if (userRole) userRole.textContent = 'مستخدم عادي';
            if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();

            // Update user info section
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone;
        }
    }

    loadDashboardData() {
        this.loadStats();
        this.loadRecentActivities();
    }

    loadStats() {
        // Simulate user-specific data
        this.animateNumber('myProjects', 5);
        this.animateNumber('myMessages', 12);
        this.animateNumber('completedProjects', 3);
        this.animateNumber('pendingTasks', 2);
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
        const activities = this.generateUserActivities();
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

    generateUserActivities() {
        const activities = [
            {
                type: 'مشروع',
                details: 'إضافة مشروع جديد: تشطيب شقة',
                date: new Date().toLocaleDateString('ar-EG'),
                status: 'نشط',
                color: '#17a2b8'
            },
            {
                type: 'رسالة',
                details: 'استلام رسالة من فريق الدعم',
                date: new Date(Date.now() - 86400000).toLocaleDateString('ar-EG'),
                status: 'جديدة',
                color: '#ffc107'
            },
            {
                type: 'مهمة',
                details: 'إكمال مهمة: تقديم المستندات',
                date: new Date(Date.now() - 172800000).toLocaleDateString('ar-EG'),
                status: 'مكتملة',
                color: '#28a745'
            }
        ];

        return activities;
    }

    setupEventListeners() {
        // Search functionality
        const projectSearch = document.getElementById('projectSearch');
        const projectFilter = document.getElementById('projectFilter');
        
        if (projectSearch) {
            projectSearch.addEventListener('input', () => this.filterProjects());
        }
        
        if (projectFilter) {
            projectFilter.addEventListener('change', () => this.filterProjects());
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
            case 'userInfo':
                this.loadUserInfo();
                break;
            case 'myProjects':
                this.loadMyProjects();
                break;
            case 'messages':
                this.loadMessages();
                break;
            case 'support':
                this.loadSupport();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    loadUserInfo() {
        const user = this.auth.getCurrentUser();
        if (user) {
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone;
        }
    }

    loadMyProjects() {
        // Simulate user projects
        const projects = [
            {
                id: 1,
                name: 'تشطيب شقتي',
                service: 'تشطيب شقق',
                status: 'مكتمل',
                date: '2024-01-10'
            },
            {
                id: 2,
                name: 'تركيب سيراميك',
                service: 'سيراميك',
                status: 'قيد التنفيذ',
                date: '2024-01-15'
            },
            {
                id: 3,
                name: 'تجديد المطبخ',
                service: 'تجديد',
                status: 'معلق',
                date: '2024-01-20'
            }
        ];

        const tbody = document.getElementById('myProjectsTableBody');
        if (tbody) {
            tbody.innerHTML = projects.map(project => `
                <tr>
                    <td>${project.name}</td>
                    <td>${project.service}</td>
                    <td><span style="color: ${this.getStatusColor(project.status)}">${project.status}</span></td>
                    <td>${project.date}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProject(${project.id})">عرض</button>
                            <button class="btn-delete" onclick="deleteProject(${project.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadMessages() {
        // Simulate user messages
        const messages = [
            {
                id: 1,
                sender: 'فريق الدعم',
                subject: 'تحديثات النظام',
                message: 'تم تحديث لوحة التحكم بميزات جديدة...',
                date: '2024-01-15',
                read: false
            },
            {
                id: 2,
                sender: 'المالك',
                subject: 'مراجعة المشروع',
                message: 'تم مراجعة مشروعك والموافقة عليه...',
                date: '2024-01-14',
                read: true
            },
            {
                id: 3,
                sender: 'النظام',
                subject: 'تذكير',
                message: 'لا تنس إكمال بيانات مشروعك...',
                date: '2024-01-13',
                read: true
            }
        ];

        const tbody = document.getElementById('messagesTableBody');
        if (tbody) {
            tbody.innerHTML = messages.map(message => `
                <tr>
                    <td>${message.sender}</td>
                    <td>${message.subject}</td>
                    <td>${message.message.substring(0, 50)}...</td>
                    <td>${message.date}</td>
                    <td><span style="color: ${message.read ? '#28a745' : '#ffc107'}">${message.read ? 'مقروءة' : 'جديدة'}</span></td>
                    <td>
                        <div class="action-buttons">
                            ${!message.read ? `<button class="btn-edit" onclick="markAsRead(${message.id})">تحديد كمقروءة</button>` : ''}
                            <button class="btn-delete" onclick="deleteMessage(${message.id})">حذف</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadSupport() {
        // Load support form - no additional data needed
    }

    loadAnalytics() {
        // Analytics data is static in HTML for now
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

    filterProjects() {
        const searchTerm = document.getElementById('projectSearch').value.toLowerCase();
        const filterStatus = document.getElementById('projectFilter').value;
        
        // Get all projects and filter them
        const projects = [
            {
                id: 1,
                name: 'تشطيب شقتي',
                service: 'تشطيب شقق',
                status: 'مكتمل',
                date: '2024-01-10'
            },
            {
                id: 2,
                name: 'تركيب سيراميك',
                service: 'سيراميك',
                status: 'قيد التنفيذ',
                date: '2024-01-15'
            },
            {
                id: 3,
                name: 'تجديد المطبخ',
                service: 'تجديد',
                status: 'معلق',
                date: '2024-01-20'
            }
        ];
        
        let filteredProjects = projects;
        
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                project.service.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filterStatus) {
            filteredProjects = filteredProjects.filter(project => project.status === filterStatus);
        }
        
        // Re-render table with filtered results
        this.renderFilteredProjects(filteredProjects);
    }

    renderFilteredProjects(projects) {
        const tbody = document.getElementById('myProjectsTableBody');
        if (tbody) {
            tbody.innerHTML = projects.map(project => `
                <tr>
                    <td>${project.name}</td>
                    <td>${project.service}</td>
                    <td><span style="color: ${this.getStatusColor(project.status)}">${project.status}</span></td>
                    <td>${project.date}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="editProject(${project.id})">عرض</button>
                            <button class="btn-delete" onclick="deleteProject(${project.id})">حذف</button>
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

    // User-specific functions
    editUserInfo() {
        const user = this.auth.getCurrentUser();
        if (user) {
            document.getElementById('editName').value = user.name;
            document.getElementById('editPhone').value = user.phone;
            document.getElementById('editUserModal').classList.add('active');
        }
    }

    saveUserInfo() {
        const name = document.getElementById('editName').value;
        const phone = document.getElementById('editPhone').value;
        const password = document.getElementById('editPassword').value;
        const confirmPassword = document.getElementById('editConfirmPassword').value;
        
        if (password && password !== confirmPassword) {
            this.showNotification('كلمات المرور غير متطابقة', 'error');
            return;
        }
        
        // Update user info
        const user = this.auth.getCurrentUser();
        const updateData = { name, phone };
        if (password) {
            updateData.password = password;
        }
        
        const result = this.auth.updateUser(user.id, updateData);
        if (result.success) {
            this.showNotification('تم تحديث البيانات بنجاح', 'success');
            this.updateUserInfo();
            closeModal('editUserModal');
            document.getElementById('editUserForm').reset();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    submitSupport() {
        const type = document.getElementById('supportType').value;
        const subject = document.getElementById('supportSubject').value;
        const message = document.getElementById('supportMessage').value;
        const priority = document.getElementById('supportPriority').value;
        
        if (!subject || !message) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // Create support ticket
        const supportTickets = JSON.parse(localStorage.getItem('decorator_support_tickets') || '[]');
        const newTicket = {
            id: Date.now(),
            userId: this.auth.getCurrentUser().id,
            userName: this.auth.getCurrentUser().name,
            type,
            subject,
            message,
            priority,
            status: 'مفتوح',
            createdAt: new Date().toISOString()
        };
        
        supportTickets.push(newTicket);
        localStorage.setItem('decorator_support_tickets', JSON.stringify(supportTickets));
        
        this.showNotification('تم إرسال طلب الدعم بنجاح', 'success');
        
        // Reset form
        document.getElementById('supportSubject').value = '';
        document.getElementById('supportMessage').value = '';
        document.getElementById('supportPriority').value = 'medium';
    }

    viewSupportHistory() {
        const supportTickets = JSON.parse(localStorage.getItem('decorator_support_tickets') || '[]');
        const userTickets = supportTickets.filter(ticket => ticket.userId === this.auth.getCurrentUser().id);
        
        if (userTickets.length === 0) {
            this.showNotification('لا توجد طلبات دعم سابقة', 'info');
        } else {
            let history = 'سجل طلبات الدعم:\n\n';
            userTickets.forEach(ticket => {
                history += `الموضوع: ${ticket.subject}\n`;
                history += `الحالة: ${ticket.status}\n`;
                history += `التاريخ: ${new Date(ticket.createdAt).toLocaleDateString('ar-EG')}\n`;
                history += '---\n';
            });
            
            alert(history);
        }
    }
}

// Global functions for onclick handlers
let userDashboardManager;

function showSection(sectionName) {
    if (userDashboardManager) {
        userDashboardManager.showSection(sectionName);
    }
}

function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        auth.logout();
    }
}

function editUserInfo() {
    if (userDashboardManager) {
        userDashboardManager.editUserInfo();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function editProject(projectId) {
    userDashboardManager.showNotification('عرض تفاصيل المشروع - تحت التطوير', 'info');
}

function deleteProject(projectId) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        userDashboardManager.showNotification('تم حذف المشروع بنجاح', 'success');
        userDashboardManager.loadMyProjects();
    }
}

function markAsRead(messageId) {
    userDashboardManager.showNotification('تم تحديد الرسالة كمقروءة', 'success');
    userDashboardManager.loadMessages();
}

function deleteMessage(messageId) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        userDashboardManager.showNotification('تم حذف الرسالة بنجاح', 'success');
        userDashboardManager.loadMessages();
    }
}

function markAllAsRead() {
    userDashboardManager.showNotification('تم تحديد جميع الرسائل كمقروءة', 'success');
    userDashboardManager.loadMessages();
}

function submitSupport() {
    if (userDashboardManager) {
        userDashboardManager.submitSupport();
    }
}

function viewSupportHistory() {
    if (userDashboardManager) {
        userDashboardManager.viewSupportHistory();
    }
}

function refreshData() {
    userDashboardManager.refreshData();
}

// Initialize user dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    userDashboardManager = new UserDashboardManager();
    
    // Handle edit user form
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (userDashboardManager) {
                userDashboardManager.saveUserInfo();
            }
        });
    }
});