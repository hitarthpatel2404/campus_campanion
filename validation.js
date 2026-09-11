// validation.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Helper Functions for Validation UI
    function showError(inputElement, message) {
        inputElement.classList.add('input-error');
        let errorDiv = inputElement.parentElement.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            inputElement.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    function clearErrors(formElement) {
        const inputs = formElement.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('input-error'));
        const errors = formElement.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Login Form Validation
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors(loginForm);
            let isValid = true;
            
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }
            
            if (passwordInput.value.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters long.');
                isValid = false;
            }
            
            if (isValid) {
                // Simulation of successful login
                window.location.href = 'dashboard.html';
            }
        });
        
        // Clear error on input typing
        loginForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                const err = input.parentElement.querySelector('.error-message');
                if (err) err.remove();
            });
        });
    }

    // Signup Form Validation
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors(signupForm);
            let isValid = true;

            const nameInput = signupForm.querySelector('input[type="text"]');
            const emailInput = signupForm.querySelector('input[type="email"]');
            const passwordInput = signupForm.querySelector('input[type="password"]');
            
            if (nameInput.value.trim() === '') {
                showError(nameInput, 'Please enter your full name.');
                isValid = false;
            }

            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }
            
            if (passwordInput.value.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters long.');
                isValid = false;
            }
            
            if (isValid) {
                // Simulation of successful signup
                window.location.href = 'dashboard.html';
            }
        });
        
        // Clear error on input typing
        signupForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                const err = input.parentElement.querySelector('.error-message');
                if (err) err.remove();
            });
        });
    }

    // Google Sign-in Mock Modal logic
    const googleBtns = document.querySelectorAll('.btn-google');
    const googleModal = document.getElementById('google-mock-modal');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (googleModal) {
                googleModal.classList.add('active');
            }
        });
    });

    window.loginWithGoogle = function(name) {
        if (googleModal) googleModal.classList.remove('active');
        const btns = document.querySelectorAll('.btn-google');
        btns.forEach(btn => {
            btn.innerHTML = 'Connecting...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';
        });
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    };

    // Chat Input Validation
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) {
        const chatInput = chatInputArea.querySelector('input[type="text"]');
        const askButton = chatInputArea.querySelector('.btn-ask');
        
        const handleChatSubmit = () => {
            const message = chatInput.value.trim();
            if (message === '') {
                // Highlight input instead of alert
                chatInput.style.borderColor = '#ef4444';
                setTimeout(() => chatInput.style.borderColor = '', 2000);
                return;
            }
            
            // Clear input after sending (simulation)
            chatInput.value = '';
            
            const originalText = askButton.textContent;
            askButton.textContent = 'Sent!';
            setTimeout(() => askButton.textContent = originalText, 1500);
        };

        if (askButton) {
            askButton.addEventListener('click', handleChatSubmit);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleChatSubmit();
                }
            });
            // Remove red border on input
            chatInput.addEventListener('input', () => {
                chatInput.style.borderColor = '';
            });
        }
    }
});

// Google Identity Services callback
window.handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    // You would typically send this token to your backend here
    // For now, redirect to dashboard as a mock login success
    window.location.href = 'dashboard.html';
};
