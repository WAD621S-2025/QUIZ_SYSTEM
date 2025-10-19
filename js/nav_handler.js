// Navigation Handler - Manages navigation bar based on login status
// This file should be placed in js/nav-handler.js

(async function() {
    try {
        // Check login status
        const response = await fetch('php/check_login_status.php');
        const data = await response.json();
        
        // Get all navigation elements
        const loginLink = document.querySelector('a[href="login.html"]');
        const signupLink = document.querySelector('a[href="signup.html"]');
        const profileLink = document.querySelector('#profileLink');
        const logoutLink = document.querySelector('a[onclick*="logout"]');
        
        if (data.success && data.isLoggedIn) {
            // User is logged in
            // Hide login and signup links
            if (loginLink && loginLink.parentElement) {
                loginLink.parentElement.style.display = 'none';
            }
            if (signupLink && signupLink.parentElement) {
                signupLink.parentElement.style.display = 'none';
            }
            
            // Show profile and logout links
            if (profileLink) {
                profileLink.style.display = 'block';
            }
            if (logoutLink && logoutLink.parentElement) {
                logoutLink.parentElement.style.display = 'block';
            }
        } else {
            // User is NOT logged in (guest)
            // Show login and signup links
            if (loginLink && loginLink.parentElement) {
                loginLink.parentElement.style.display = 'block';
            }
            if (signupLink && signupLink.parentElement) {
                signupLink.parentElement.style.display = 'block';
            }
            
            // Hide profile and logout links
            if (profileLink) {
                profileLink.style.display = 'none';
            }
            if (logoutLink && logoutLink.parentElement) {
                logoutLink.parentElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.log('Navigation handler error:', error);
        // On error, assume guest user - show login/signup, hide profile/logout
        const loginLink = document.querySelector('a[href="login.html"]');
        const signupLink = document.querySelector('a[href="signup.html"]');
        const profileLink = document.querySelector('#profileLink');
        const logoutLink = document.querySelector('a[onclick*="logout"]');
        
        if (loginLink && loginLink.parentElement) {
            loginLink.parentElement.style.display = 'block';
        }
        if (signupLink && signupLink.parentElement) {
            signupLink.parentElement.style.display = 'block';
        }
        if (profileLink) {
            profileLink.style.display = 'none';
        }
        if (logoutLink && logoutLink.parentElement) {
            logoutLink.parentElement.style.display = 'none';
        }
    }
})();

// Logout function (global scope)
async function logout(event) {
    if (event) event.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            await fetch('php/logout.php');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'index.html';
        }
    }
}