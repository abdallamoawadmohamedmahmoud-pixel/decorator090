// Enhanced Registration Form JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');

    // Check if elements exist before attaching listeners
    if (!registerForm) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const termsCheckbox = document.getElementById('terms');

    // Show loading state
    function setLoading(loading) {
        if (!registerBtn) return;
        const btnText = document.getElementById('btnText');
        const loadingSpinner = registerBtn.querySelector('.loading');

        if (loading) {
            registerBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
        } else {
            registerBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    }

    // Real-time validation
    if (nameInput) {
        nameInput.addEventListener('blur', function () {
            const name = this.value.trim();
            if (name.length < 2) {
                showFieldError('name', 'الاسم يجب أن يكون حرفين على الأقل');
            } else {
                clearFieldError('name');
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            const email = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFieldError('email', 'البريد الإلكتروني غير صحيح');
            } else {
                clearFieldError('email');
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const password = this.value;
            if (password.length < 8) {
                showFieldError('password', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            } else {
                clearFieldError('password');
            }
        });
    }

    // Handle registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const terms = termsCheckbox ? termsCheckbox.checked : true;

        if (!name || !email || !password) {
            showAlert('يرجى إدخال جميع الحقول المطلوبة', 'error');
            return;
        }

        if (password.length < 8) {
            showAlert('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
            return;
        }

        if (termsCheckbox && !terms) {
            showAlert('يجب الموافقة على الشروط والأحكام', 'error');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const userData = {
                name: name,
                email: email.toLowerCase(),
                password: password,
                is_owner: (email.toLowerCase() === 'ramadan.nady1985@gmail.com'),
                createdAt: new Date().toISOString()
            };

            const result = auth.register(userData);
            setLoading(false);

            if (result.success) {
                showAlert('تم إنشاء الحساب بنجاح!', 'success');
                setTimeout(() => {
                    auth.login(email, password);
                    window.location.href = result.user.is_owner ? 'owner_dashboard.html' : 'user_dashboard.html';
                }, 1500);
            } else {
                showAlert(result.message, 'error');
            }
        }, 1000);
    });

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '0.85rem';
            errorDiv.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        field.style.borderColor = '#dc3545';
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
        field.style.borderColor = '#28a745';
    }

    function showAlert(msg, type = 'error') {
        const container = document.getElementById('alertContainer') || document.getElementById('alertBox');
        if (container) {
            container.innerHTML = `<div class="alert ${type}">${msg}</div>`;
        } else {
            alert(msg);
        }
    }
});