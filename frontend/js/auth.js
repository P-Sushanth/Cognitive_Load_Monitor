// Auth Logic

// Toggle Password Visibility
function togglePassword(fieldId, icon) {
    const input = document.getElementById(fieldId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Password Strength Checker
function checkStrength(password) {
    const meter = document.getElementById('strength-bar');
    const text = document.getElementById('strength-text');

    if (!meter || !text) return; // Only on register page

    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
        case 0:
        case 1:
            meter.style.width = '20%';
            meter.style.backgroundColor = '#cf6679'; // Red
            text.textContent = 'Weak (add numbers, symbols, uppercase)';
            text.style.color = '#cf6679';
            break;
        case 2:
        case 3:
            meter.style.width = '60%';
            meter.style.backgroundColor = '#ffd54f'; // Yellow
            text.textContent = 'Medium';
            text.style.color = '#ffd54f';
            break;
        case 4:
        case 5:
            meter.style.width = '100%';
            meter.style.backgroundColor = '#4caf50'; // Green
            text.textContent = 'Strong';
            text.style.color = '#4caf50';
            break;
    }

    return strength >= 4;
}

// Social Login Placeholder
function socialLogin(provider) {
    alert(`${provider} Login is currently in demonstration mode. In a production app, this would redirect to ${provider}'s OAuth consent screen.`);
}

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await api.request('/auth/login', 'POST', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        window.location.href = 'dashboard.html';
    } catch (err) {
        alert(err.message);
    }
}

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate Strength
    const strength = 0;
    // Recalculate strength to enforce validation
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 4) {
        alert("Please choose a stronger password (include numbers, symbols, uppercase).");
        return;
    }

    try {
        const data = await api.request('/auth/register', 'POST', { username, email, password });
        localStorage.setItem('token', data.token);
        alert('Registration successful! Please login.');
        window.location.href = 'index.html';
    } catch (err) {
        alert(err.message);
    }
}
