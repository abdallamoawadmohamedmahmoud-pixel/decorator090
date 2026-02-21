// Email Confirmation System
class EmailConfirmation {
    constructor() {
        this.confirmations = JSON.parse(localStorage.getItem('decorator_email_confirmations') || '{}');
    }

    // Generate confirmation token
    generateToken(email) {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.confirmations[email] = {
            token: token,
            createdAt: new Date().toISOString(),
            confirmed: false
        };
        localStorage.setItem('decorator_email_confirmations', JSON.stringify(this.confirmations));
        return token;
    }

    // Verify confirmation token
    verifyToken(email, token) {
        const confirmation = this.confirmations[email];
        if (!confirmation) {
            return { valid: false, message: 'رمز التأكيد غير موجود' };
        }

        if (confirmation.token !== token) {
            return { valid: false, message: 'رمز التأكيد غير صحيح' };
        }

        if (confirmation.confirmed) {
            return { valid: false, message: 'البريد الإلكتروني مؤكد بالفعل' };
        }

        // Check if token is expired (24 hours)
        const created = new Date(confirmation.createdAt);
        const now = new Date();
        const hoursDiff = (now - created) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            return { valid: false, message: 'رمز التأكيد منتهي الصلاحية' };
        }

        // Mark as confirmed
        this.confirmations[email].confirmed = true;
        localStorage.setItem('decorator_email_confirmations', JSON.stringify(this.confirmations));
        
        return { valid: true, message: 'تم تأكيد البريد الإلكتروني بنجاح' };
    }

    // Check if email is confirmed
    isConfirmed(email) {
        const confirmation = this.confirmations[email];
        return confirmation && confirmation.confirmed;
    }

    // Resend confirmation
    resendConfirmation(email) {
        const token = this.generateToken(email);
        const confirmationLink = `${window.location.origin}/confirm-email.html?email=${encodeURIComponent(email)}&token=${token}`;
        
        // Simulate sending email (in real implementation, this would send actual email)
        console.log('Email confirmation link:', confirmationLink);
        
        return { 
            success: true, 
            message: 'تم إعادة إرسال رسالة التأكيد',
            token: token,
            link: confirmationLink
        };
    }

    // Clean up expired tokens
    cleanupExpiredTokens() {
        const now = new Date();
        Object.keys(this.confirmations).forEach(email => {
            const confirmation = this.confirmations[email];
            const created = new Date(confirmation.createdAt);
            const hoursDiff = (now - created) / (1000 * 60 * 60);
            
            if (hoursDiff > 24 && !confirmation.confirmed) {
                delete this.confirmations[email];
            }
        });
        
        localStorage.setItem('decorator_email_confirmations', JSON.stringify(this.confirmations));
    }
}

// Enhanced Input Validation
class FormValidator {
    constructor() {
        this.rules = {
            email: {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'البريد الإلكتروني غير صحيح'
            },
            phone: {
                pattern: /^(?:\+20|0)?1[0125]\d{8}$/,
                message: 'رقم الهاتف يجب أن يكون رقم مصري صحيح'
            },
            password: {
                minLength: 6,
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: 'كلمة المرور يجب أن تحتوي على أحرف وأرقام'
            },
            name: {
                minLength: 3,
                pattern: /^[\u0600-\u06FF\sa-zA-Z\s]+$/,
                message: 'الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'
            }
        };
    }

    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return { valid: true };

        // Check minimum length
        if (rule.minLength && value.length < rule.minLength) {
            return { valid: false, message: `${fieldName} يجب أن يكون ${rule.minLength} أحرف على الأقل` };
        }

        // Check pattern
        if (rule.pattern && !rule.pattern.test(value)) {
            return { valid: false, message: rule.message };
        }

        return { valid: true };
    }

    validatePasswordStrength(password) {
        if (password.length < 6) {
            return { strength: 'weak', message: 'كلمة المرور ضعيفة' };
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let strength = 0;
        if (hasUpper) strength++;
        if (hasLower) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;
        if (password.length >= 8) strength++;

        if (strength <= 2) {
            return { strength: 'weak', message: 'كلمة المرور ضعيفة' };
        } else if (strength <= 3) {
            return { strength: 'medium', message: 'كلمة المرور متوسطة' };
        } else if (strength <= 4) {
            return { strength: 'strong', message: 'كلمة المرور قوية' };
        } else {
            return { strength: 'very-strong', message: 'كلمة المرور قوية جداً' };
        }
    }

    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const container = field.parentNode;
        
        // Remove existing error
        const existingError = container.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Show error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideDown 0.3s ease;
        `;
        errorDiv.innerHTML = `<span style="color: #dc3545;">⚠</span> ${message}`;
        
        container.appendChild(errorDiv);
        field.style.borderColor = '#dc3545';
    }

    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const container = field.parentNode;
        
        // Remove error
        const existingError = container.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.style.borderColor = '#28a745';
        
        // Add success icon
        const existingIcon = container.querySelector('.success-icon');
        if (!existingIcon) {
            const successIcon = document.createElement('span');
            successIcon.className = 'success-icon';
            successIcon.style.cssText = `
                position: absolute;
                left: 1rem;
                top: 3.6rem;
                color: #28a745;
                font-size: 1.3rem;
                animation: fadeIn 0.3s ease;
            `;
            successIcon.textContent = '✓';
            container.appendChild(successIcon);
        }
    }

    showPasswordStrength(strength, message) {
        const strengthBar = document.getElementById('passwordStrength');
        if (strengthBar) {
            const colors = {
                'weak': '#dc3545',
                'medium': '#ffc107',
                'strong': '#17a2b8',
                'very-strong': '#28a745'
            };
            
            const widths = {
                'weak': '25%',
                'medium': '50%',
                'strong': '75%',
                'very-strong': '100%'
            };
            
            strengthBar.style.width = widths[strength];
            strengthBar.style.backgroundColor = colors[strength];
            strengthBar.textContent = message;
        }
    }
}

// Initialize validator and email confirmation
const emailConfirmation = new EmailConfirmation();
const formValidator = new FormValidator();

// Make functions globally available
window.emailConfirmation = emailConfirmation;
window.formValidator = formValidator;