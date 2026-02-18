// Enhanced Authentication System with is_owner property
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.initializeData();
        this.checkAuth();
    }

    // Initialize local storage data
    initializeData() {
        if (!localStorage.getItem('decorator_users')) {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'المالك',
                    email: 'ramadan.nady1985@gmail.com',
                    password: '01099797984',
                    is_owner: true,
                    role: 'owner',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('decorator_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('decorator_contacts')) {
            localStorage.setItem('decorator_contacts', JSON.stringify([]));
        }

        if (!localStorage.getItem('decorator_projects')) {
            const defaultProjects = [
                {
                    id: 1,
                    name: 'تشطيب شقة في الفيوم',
                    client: 'أحمد محمد',
                    service: 'تشطيب شقق',
                    status: 'مكتمل',
                    date: new Date().toISOString().split('T')[0]
                },
                {
                    id: 2,
                    name: 'تركيب سيراميك',
                    client: 'علي إبراهيم',
                    service: 'سيراميك',
                    status: 'قيد التنفيذ',
                    date: new Date().toISOString().split('T')[0]
                }
            ];
            localStorage.setItem('decorator_projects', JSON.stringify(defaultProjects));
        }

        if (!localStorage.getItem('decorator_settings')) {
            const defaultSettings = {
                whatsappNumber: '01099797984',
                notificationEmail: 'info@decorator.com',
                welcomeMessage: 'مرحباً بك في Decorator! كيف يمكننا مساعدتك اليوم؟'
            };
            localStorage.setItem('decorator_settings', JSON.stringify(defaultSettings));
        }
    }

    // Check if user is authenticated
    checkAuth() {
        const token = localStorage.getItem('decorator_token');
        if (token) {
            const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
            const user = users.find(u => u.id === parseInt(token));
            if (user) {
                this.currentUser = user;
                return true;
            }
        }
        return false;
    }

    // Enhanced email validation
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'البريد الإلكتروني غير صحيح' };
        }

        // Check for common email providers
        const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
        const domain = email.split('@')[1];

        if (domain === 'ramadan.nady1985@gmail.com'.split('@')[1]) {
            return { valid: true, message: 'البريد الإلكتروني صحيح' };
        }

        return { valid: true, message: 'البريد الإلكتروني صحيح' };
    }

    // Enhanced phone validation for Egyptian numbers
    validatePhone(phone) {
        const phoneRegex = /^(?:\+20|0)?1[0125]\d{8}$/;
        return phoneRegex.test(phone);
    }

    // Enhanced password validation
    validatePassword(password) {
        return password.length >= 6;
    }

    // Register new user with enhanced validation
    register(userData) {
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');

        // Enhanced validation
        const emailValidation = this.validateEmail(userData.email);
        if (!emailValidation.valid) {
            return { success: false, message: emailValidation.message };
        }

        if (!this.validatePhone(userData.phone)) {
            return { success: false, message: 'رقم الهاتف غير صحيح. يجب أن يكون رقم مصري' };
        }

        if (!this.validatePassword(userData.password)) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'كلمة المرور وتأكيدها غير متطابقين' };
        }

        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'البريد الإلكتروني مسجل بالفعل' };
        }

        // Check if phone already exists
        if (users.find(u => u.phone === userData.phone)) {
            return { success: false, message: 'رقم الهاتف مسجل بالفعل' };
        }

        // Special handling for owner email
        let isOwner = false;
        let phoneToUse = userData.phone;

        if (userData.email.toLowerCase() === 'ramadan.nady1985@gmail.com') {
            isOwner = true;
            phoneToUse = '01099797984'; // Force owner phone
        }

        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // Should be hashed in production
            phone: phoneToUse,
            is_owner: isOwner,
            role: isOwner ? 'owner' : 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('decorator_users', JSON.stringify(users));

        return { success: true, user: newUser };
    }

    // Login function with role-based redirection
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const user = users.find(u => u.email === email.toLowerCase() && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('decorator_token', user.id.toString());
            localStorage.setItem('decorator_current_user', JSON.stringify(user));
            return { success: true, user };
        } else {
            return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
    }

    // Logout function
    logout() {
        localStorage.removeItem('decorator_token');
        localStorage.removeItem('decorator_current_user');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // Get current user
    getCurrentUser() {
        if (!this.currentUser) {
            const userStr = localStorage.getItem('decorator_current_user');
            if (userStr) {
                this.currentUser = JSON.parse(userStr);
            }
        }
        return this.currentUser;
    }

    // Check if user is owner
    isOwner() {
        const user = this.getCurrentUser();
        return user && user.is_owner === true;
    }

    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.is_owner === true);
    }

    // Update user
    updateUser(userId, userData) {
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            localStorage.setItem('decorator_users', JSON.stringify(users));
            return { success: true, user: users[userIndex] };
        }

        return { success: false, message: 'المستخدم غير موجود' };
    }

    // Delete user (only owner can do this)
    deleteUser(userId) {
        if (!this.isOwner()) {
            return { success: false, message: 'غير مصرح لك بحذف المستخدمين' };
        }

        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);

        if (filteredUsers.length < users.length) {
            localStorage.setItem('decorator_users', JSON.stringify(filteredUsers));
            return { success: true };
        }

        return { success: false, message: 'المستخدم غير موجود' };
    }

    // Get all users
    getAllUsers() {
        if (!this.isAdmin()) {
            return { success: false, message: 'غير مصرح لك بعرض المستخدمين' };
        }

        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        // Remove passwords from response for security
        const safeUsers = users.map(({ password, ...user }) => user);
        return { success: true, users: safeUsers };
    }

    // Get user statistics
    getUserStats() {
        const users = JSON.parse(localStorage.getItem('decorator_users') || '[]');
        const ownerCount = users.filter(u => u.is_owner === true).length;
        const regularUserCount = users.filter(u => u.is_owner !== true).length;
        const totalUsers = users.length;

        return {
            success: true,
            stats: {
                total: totalUsers,
                owners: ownerCount,
                regularUsers: regularUserCount
            }
        };
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Show alert function
function showAlert(message, type = 'error', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    container.innerHTML = '';
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Store contact form submissions
function storeContact(contactData) {
    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
    const newContact = {
        id: Date.now(),
        ...contactData,
        createdAt: new Date().toISOString(),
        read: false
    };
    contacts.unshift(newContact);
    localStorage.setItem('decorator_contacts', JSON.stringify(contacts));
    return { success: true, contact: newContact };
}

// Get all contacts
function getContacts() {
    if (!auth.isAdmin()) {
        return { success: false, message: 'غير مصرح لك بعرض رسائل التواصل' };
    }

    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
    return { success: true, contacts };
}

// Mark contact as read
function markContactAsRead(contactId) {
    const contacts = JSON.parse(localStorage.getItem('decorator_contacts') || '[]');
    const contactIndex = contacts.findIndex(c => c.id === contactId);

    if (contactIndex !== -1) {
        contacts[contactIndex].read = true;
        localStorage.setItem('decorator_contacts', JSON.stringify(contacts));
        return { success: true };
    }

    return { success: false };
}

// Get settings
function getSettings() {
    const settings = JSON.parse(localStorage.getItem('decorator_settings') || '{}');
    return { success: true, settings };
}

// Update settings
function updateSettings(settings) {
    if (!auth.isOwner()) {
        return { success: false, message: 'غير مصرح لك بتعديل الإعدادات' };
    }

    localStorage.setItem('decorator_settings', JSON.stringify(settings));
    return { success: true };
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;

    // If user is on any dashboard page but not authenticated, redirect to login
    if ((currentPath.includes('dashboard.html') || currentPath.includes('owner_dashboard.html') || currentPath.includes('user_dashboard.html')) && !auth.checkAuth()) {
        window.location.href = 'login.html';
    }

    // If user is on login page but already authenticated, redirect based on role
    if (currentPath.includes('login.html') && auth.checkAuth()) {
        const user = auth.getCurrentUser();
        if (user.is_owner) {
            window.location.href = 'owner_dashboard.html';
        } else {
            window.location.href = 'user_dashboard.html';
        }
    }

    // If user is on register page but already authenticated, redirect to appropriate dashboard
    if (currentPath.includes('register.html') && auth.checkAuth()) {
        const user = auth.getCurrentUser();
        if (user.is_owner) {
            window.location.href = 'owner_dashboard.html';
        } else {
            window.location.href = 'user_dashboard.html';
        }
    }

    // Redirect old dashboard.html to appropriate dashboard
    if (currentPath.includes('dashboard.html')) {
        const user = auth.getCurrentUser();
        if (user) {
            if (user.is_owner) {
                window.location.href = 'owner_dashboard.html';
            } else {
                window.location.href = 'user_dashboard.html';
            }
        }
    }
});