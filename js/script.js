/**
 * NamiQuiz - Namibian Learning Quiz System
 * Complete JavaScript Implementation
 * Handles animations, interactions, data management, and user experience
 */

// ==========================================
// GLOBAL VARIABLES & CONFIGURATION
// ==========================================

const QuizApp = {
    config: {
        animationSpeed: 300,
        notificationDuration: 3000,
        autoSaveInterval: 30000, // 30 seconds
        maxRecentScores: 10
    },
    state: {
        isDarkMode: false,
        soundEnabled: true,
        currentPage: window.location.pathname.split('/').pop() || 'index.html'
    }
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🎓 NamiQuiz System Initialized', 'color: #667eea; font-size: 18px; font-weight: bold;');
    console.log('%cVersion 1.0 - Built for Namibian Education', 'color: #764ba2; font-size: 12px;');
    
    initializeApp();
    loadUserPreferences();
    setupEventListeners();
    animateOnScroll();
    
    // Check for saved quiz state
    checkForSavedQuizState();
});

function initializeApp() {
    // Add active class to current nav link
    highlightCurrentPage();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Load statistics if on home page
    if (QuizApp.state.currentPage === 'index.html' || QuizApp.state.currentPage === '') {
        loadQuizStatistics();
    }
}

// ==========================================
// NAVIGATION & PAGE MANAGEMENT
// ==========================================

function highlightCurrentPage() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPage = QuizApp.state.currentPage;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.style.color = '#667eea';
            link.style.fontWeight = '700';
        }
    });
}

function smoothScrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#667eea'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 500;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease ${duration - 300}ms;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 20px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
    
    // Play sound if enabled
    if (QuizApp.state.soundEnabled) {
        playNotificationSound(type);
    }
}

function playNotificationSound(type) {
    // Create audio context for sound effects
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different notification types
        const frequencies = {
            success: 800,
            error: 400,
            warning: 600,
            info: 500
        };
        
        oscillator.frequency.value = frequencies[type] || frequencies.info;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ==========================================
// LOCAL STORAGE MANAGEMENT
// ==========================================

const StorageManager = {
    saveQuizProgress(data) {
        try {
            localStorage.setItem('quizProgress', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save progress:', e);
            return false;
        }
    },
    
    loadQuizProgress() {
        try {
            const data = localStorage.getItem('quizProgress');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load progress:', e);
            return null;
        }
    },
    
    clearQuizProgress() {
        localStorage.removeItem('quizProgress');
    },
    
    saveScore(scoreData) {
        try {
            let scores = this.getAllScores();
            scores.unshift(scoreData);
            
            // Keep only last 10 scores
            if (scores.length > QuizApp.config.maxRecentScores) {
                scores = scores.slice(0, QuizApp.config.maxRecentScores);
            }
            
            localStorage.setItem('recentScores', JSON.stringify(scores));
            return true;
        } catch (e) {
            console.error('Failed to save score:', e);
            return false;
        }
    },
    
    getAllScores() {
        try {
            const scores = localStorage.getItem('recentScores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            return [];
        }
    },
    
    getHighScore(categoryId) {
        const scores = this.getAllScores();
        const categoryScores = scores.filter(s => s.categoryId === categoryId);
        
        if (categoryScores.length === 0) return 0;
        
        return Math.max(...categoryScores.map(s => s.percentage));
    },
    
    saveUserPreferences(prefs) {
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
    },
    
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem('userPreferences');
            return prefs ? JSON.parse(prefs) : {
                soundEnabled: true,
                darkMode: false,
                fontSize: 'medium'
            };
        } catch (e) {
            return {
                soundEnabled: true,
                darkMode: false,
                fontSize: 'medium'
            };
        }
    }
};

function loadUserPreferences() {
    const prefs = StorageManager.getUserPreferences();
    QuizApp.state.soundEnabled = prefs.soundEnabled;
    QuizApp.state.isDarkMode = prefs.darkMode;
    
    if (prefs.darkMode) {
        enableDarkMode();
    }
}

function checkForSavedQuizState() {
    const savedProgress = StorageManager.loadQuizProgress();
    
    if (savedProgress && window.location.pathname.includes('quiz.html')) {
        const continueQuiz = confirm(
            `You have an incomplete quiz in ${savedProgress.categoryName}.\n` +
            `Question ${savedProgress.currentQuestion}/${savedProgress.totalQuestions}\n\n` +
            `Would you like to continue?`
        );
        
        if (continueQuiz) {
            // Restore quiz state (would need to be implemented in quiz.html)
            showNotification('Resuming your quiz...', 'info');
        } else {
            StorageManager.clearQuizProgress();
        }
    }
}

// ==========================================
// STATISTICS & ANALYTICS
// ==========================================

async function loadQuizStatistics() {
    try {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        const scores = StorageManager.getAllScores();
        
        if (scores.length > 0) {
            const totalQuizzes = scores.length;
            const averageScore = scores.reduce((sum, s) => sum + s.percentage, 0) / totalQuizzes;
            const bestScore = Math.max(...scores.map(s => s.percentage));
            
            statsContainer.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">Your Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 32px; color: #667eea; font-weight: bold;">${totalQuizzes}</div>
                            <div style="color: #666;">Quizzes Taken</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; color: #28a745; font-weight: bold;">${Math.round(averageScore)}%</div>
                            <div style="color: #666;">Average Score</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 32px; color: #ffc107; font-weight: bold;">${bestScore}%</div>
                            <div style="color: #666;">Best Score</div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error('Failed to load statistics:', e);
    }
}

function displayRecentScores() {
    const scores = StorageManager.getAllScores();
    
    if (scores.length === 0) {
        return '<p style="text-align: center; color: #666;">No recent scores available</p>';
    }
    
    let html = '<div style="max-width: 600px; margin: 0 auto;">';
    
    scores.forEach((score, index) => {
        const date = new Date(score.date);
        const dateStr = date.toLocaleDateString('en-NA', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        html += `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #667eea;">${score.categoryName}</strong>
                    <div style="font-size: 14px; color: #666;">${dateStr}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: bold; color: ${score.percentage >= 70 ? '#28a745' : '#dc3545'}">
                        ${score.percentage}%
                    </div>
                    <div style="font-size: 14px; color: #666;">${score.score}/${score.total}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ==========================================
// ANIMATION EFFECTS
// ==========================================

function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe all category cards and content sections
    document.querySelectorAll('.category-card, .content > *').forEach(el => {
        observer.observe(el);
    });
}

function addPulseEffect(element) {
    element.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function addShakeEffect(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// ==========================================
// FORM VALIDATION
// ==========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else if (input.type === 'email' && !validateEmail(input.value)) {
            input.style.borderColor = '#dc3545';
            showNotification('Please enter a valid email address', 'error');
            isValid = false;
        } else {
            input.style.borderColor = '#28a745';
        }
    });
    
    return isValid;
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K = Focus search (if exists)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }
        
        // Escape = Close modals or go back
        if (e.key === 'Escape') {
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.style.display = 'none');
        }
        
        // Arrow keys for navigation in quiz
        if (window.location.pathname.includes('quiz.html')) {
            if (e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn && nextBtn.style.display !== 'none') {
                    nextBtn.click();
                }
            }
        }
    });
}

// ==========================================
// TOOLTIPS
// ==========================================

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-popup';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10000;
                pointer-events: none;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
}

// ==========================================
// DARK MODE
// ==========================================

function toggleDarkMode() {
    QuizApp.state.isDarkMode = !QuizApp.state.isDarkMode;
    
    if (QuizApp.state.isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Save preference
    const prefs = StorageManager.getUserPreferences();
    prefs.darkMode = QuizApp.state.isDarkMode;
    StorageManager.saveUserPreferences(prefs);
}

function enableDarkMode() {
    document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    document.body.style.color = '#fff';
    
    const content = document.querySelectorAll('.content');
    content.forEach(c => {
        c.style.background = '#0f3460';
        c.style.color = '#fff';
    });
}

function disableDarkMode() {
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.color = '#333';
    
    const content = document.querySelectorAll('.content');
    content.forEach(c => {
        c.style.background = 'white';
        c.style.color = '#333';
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-NA', options);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Add hover effects to category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Form input animations
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ==========================================
// ADD CSS ANIMATIONS
// ==========================================

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    @keyframes shake {
        0%, 100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        75% {
            transform: translateX(10px);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styleSheet);

// ==========================================
// EXPORT FUNCTIONS (for use in HTML)
// ==========================================

window.QuizApp = QuizApp;
window.StorageManager = StorageManager;
window.showNotification = showNotification;
window.scrollToTop = scrollToTop;
window.toggleDarkMode = toggleDarkMode;
window.copyToClipboard = copyToClipboard;

console.log('%c✅ NamiQuiz JavaScript Loaded Successfully!', 'color: #28a745; font-size: 14px; font-weight: bold;');


// ===================================
// LOGOUT FUNCTION
// ===================================
async function logout(event) {
    if (event) event.preventDefault();
    
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (confirmed) {
        try {
            const response = await fetch('php/logout.php', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Logged out successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if there's an error
            window.location.href = 'php/logout.php';
        }
    }
}

// Make logout available globally
window.logout = logout;