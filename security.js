// Security features for Drawaria2.io

// Initialize security features
function initializeSecurity() {
    console.log('Initializing security features...');
    
    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent dragging
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Detect DevTools opening
    detectDevTools();
    
    // Detect common hacking tools
    detectHackingTools();
    
    // Monitor for DOM changes (anti-tampering)
    monitorDOMChanges();
    
    // Validate user input
    setupInputValidation();
    
    // Secure session management
    setupSessionSecurity();
}

// Detect DevTools opening
function detectDevTools() {
    const threshold = 160;
    const checkDevTools = function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            // DevTools might be open
            handleSecurityViolation('DevTools detection');
        }
    };
    
    // Check periodically
    setInterval(checkDevTools, 1000);
    
    // Also check on resize
    window.addEventListener('resize', checkDevTools);
}

// Detect common hacking tools
function detectHackingTools() {
    // Check for Tampermonkey
    if (typeof tampermonkey !== 'undefined') {
        handleSecurityViolation('Tampermonkey detected');
    }
    
    // Check for Greasemonkey
    if (typeof GM_info !== 'undefined') {
        handleSecurityViolation('Greasemonkey detected');
    }
    
    // Check for common hacker extensions
    const blockedExtensions = [
        'tampermonkey',
        'greasemonkey',
        'violentmonkey',
        'requestly',
        'modheader'
    ];
    
    // This is a simplified check - in a real implementation,
    // you would need more sophisticated detection methods
    blockedExtensions.forEach(ext => {
        if (navigator.userAgent.toLowerCase().includes(ext)) {
            handleSecurityViolation(`Blocked extension detected: ${ext}`);
        }
    });
}

// Monitor for DOM changes (anti-tampering)
function monitorDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check for script injections
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'SCRIPT' && 
                        !node.getAttribute('src') && 
                        node.innerHTML.includes('tamper') || 
                        node.innerHTML.includes('monkey')) {
                        handleSecurityViolation('Unauthorized script injection detected');
                    }
                });
            }
            
            // Check for attribute changes that might indicate tampering
            if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'src' || mutation.attributeName === 'href') {
                    // Log the change for monitoring
                    console.log('DOM attribute changed:', mutation);
                }
            }
        });
    });
    
    // Start observing
    observer.observe(document.documentElement, {
        childList: true,
        attributes: true,
        subtree: true,
        attributeFilter: ['src', 'href', 'onclick', 'onload']
    });
}

// Setup input validation
function setupInputValidation() {
    // Validate username (alphanumeric and some special characters)
    const usernameInputs = document.querySelectorAll('input[type="text"][id*="username"], input[type="text"][id*="Username"]');
    usernameInputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value;
            // Allow alphanumeric, underscore, and hyphen
            if (!/^[a-zA-Z0-9_-]*$/.test(value)) {
                this.value = value.replace(/[^a-zA-Z0-9_-]/g, '');
                showSecurityWarning('Username can only contain letters, numbers, underscores, and hyphens.');
            }
            
            // Limit length
            if (value.length > 20) {
                this.value = value.substring(0, 20);
                showSecurityWarning('Username cannot exceed 20 characters.');
            }
        });
    });
    
    // Validate chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            const value = this.value;
            // Basic profanity filter (in a real app, this would be more sophisticated)
            const blockedWords = ['badword1', 'badword2', 'inappropriate'];
            blockedWords.forEach(word => {
                if (value.toLowerCase().includes(word)) {
                    this.value = value.replace(new RegExp(word, 'gi'), '***');
                    showSecurityWarning('Please keep the chat appropriate for all ages.');
                }
            });
            
            // Limit message length
            if (value.length > 200) {
                this.value = value.substring(0, 200);
                showSecurityWarning('Message cannot exceed 200 characters.');
            }
        });
    }
}

// Setup session security
function setupSessionSecurity() {
    // In a real application, you would:
    // 1. Use secure HTTP headers
    // 2. Implement proper session management
    // 3. Use CSRF tokens
    // 4. Validate all requests
    
    // For this demo, we'll implement basic client-side checks
    
    // Monitor for multiple login attempts
    let loginAttempts = 0;
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function() {
            loginAttempts++;
            if (loginAttempts > 5) {
                showSecurityWarning('Too many login attempts. Please try again later.');
                setTimeout(() => {
                    loginAttempts = 0;
                }, 300000); // Reset after 5 minutes
                return false;
            }
        });
    }
}

// Handle security violations
function handleSecurityViolation(violationType) {
    console.warn(`Security violation detected: ${violationType}`);
    
    // In a real application, you would:
    // 1. Log the violation to a secure server
    // 2. Possibly block the user
    // 3. Implement additional security measures
    
    // For this demo, we'll just show a warning
    showSecurityWarning(`Security issue detected: ${violationType}. Please do not attempt to modify the game.`);
    
    // In a severe case, you might want to redirect or disable functionality
    if (violationType.includes('script injection') || violationType.includes('extension detected')) {
        // Disable game functionality
        disableGameFeatures();
    }
}

// Show security warning
function showSecurityWarning(message) {
    // In a real app, this would use a more user-friendly notification system
    console.warn('Security Warning:', message);
    
    // Create a temporary warning message
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-weight: bold;
    `;
    warning.textContent = message;
    
    document.body.appendChild(warning);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(warning)) {
            document.body.removeChild(warning);
        }
    }, 5000);
}

// Disable game features (in case of severe security violation)
function disableGameFeatures() {
    // Disable all buttons
    document.querySelectorAll('button').forEach(button => {
        button.disabled = true;
    });
    
    // Disable all inputs
    document.querySelectorAll('input').forEach(input => {
        input.disabled = true;
    });
    
    // Show disabled message
    const disabledMessage = document.createElement('div');
    disabledMessage.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-size: 1.5rem;
        text-align: center;
        padding: 20px;
    `;
    disabledMessage.innerHTML = `
        <div>
            <h2>Security Issue Detected</h2>
            <p>Game features have been disabled due to a security violation.</p>
            <p>Please refresh the page and avoid using unauthorized modifications.</p>
        </div>
    `;
    
    document.body.appendChild(disabledMessage);
}

// Validate game data integrity
function validateGameData(data) {
    // In a real game, you would validate that game data hasn't been tampered with
    // This might include checksums, hashes, or server-side validation
    
    // For this demo, we'll implement a simple check
    if (data && typeof data === 'object') {
        // Check for expected properties
        const requiredProps = ['players', 'currentDrawer', 'currentWord', 'round', 'totalRounds'];
        for (let prop of requiredProps) {
            if (!data.hasOwnProperty(prop)) {
                handleSecurityViolation('Invalid game data structure');
                return false;
            }
        }
        
        return true;
    }
    
    return false;
}

// Secure score submission
function submitScore(scoreData) {
    // In a real game, scores would be validated server-side
    // This prevents clients from submitting fake scores
    
    // Basic client-side validation
    if (!scoreData || typeof scoreData !== 'object') {
        handleSecurityViolation('Invalid score data');
        return false;
    }
    
    if (scoreData.score < 0 || scoreData.score > 10000) {
        handleSecurityViolation('Suspicious score value');
        return false;
    }
    
    // In a real implementation, you would send the score to a secure server
    // with additional validation tokens
    
    console.log('Score submitted securely:', scoreData);
    return true;
}

// Initialize security when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSecurity);

// Make security functions available globally
window.SecurityManager = {
    initializeSecurity,
    validateGameData,
    submitScore,
    handleSecurityViolation
};