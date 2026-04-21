// Main JavaScript file for Drawaria2.io

// Global variables
let currentUser = null;
let userPoints = 0;
let userJkCoins = 0;
let isLoggedIn = false;
let afkTimer = null;
let adTimer = null;
let lastActivity = Date.now();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const playNowBtn = document.getElementById('playNowBtn');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const guestActions = document.getElementById('guestActions');
const usernameDisplay = document.getElementById('usernameDisplay');
const pointsCount = document.getElementById('pointsCount');
const jkCoinsCount = document.getElementById('jkCoinsCount');

// Modal elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const gameModal = document.getElementById('gameModal');
const afkModal = document.getElementById('afkModal');
const adModal = document.getElementById('adModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadLeaderboard();
    checkLoginStatus();
    startActivityMonitoring();
});

// Initialize app
function initializeApp() {
    console.log('Drawaria2.io initialized');
    
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('drawaria2_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateUIForLoggedInUser();
    }
    
    // Initialize tooltips and other UI elements
    initializeTooltips();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    loginBtn.addEventListener('click', showLoginModal);
    registerBtn.addEventListener('click', showRegisterModal);
    playNowBtn.addEventListener('click', handlePlayNow);
    createRoomBtn.addEventListener('click', handleCreateRoom);
    joinRoomBtn.addEventListener('click', handleJoinRoom);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Modal controls
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // Switch between login and register modals
    document.getElementById('switchToRegister').addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // AFK modal
    document.getElementById('stayInGame').addEventListener('click', cancelAfkWarning);
    
    // Ad modal
    document.getElementById('skipAdBtn').addEventListener('click', skipAd);
    
    // Join room buttons
    document.querySelectorAll('.join-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (isLoggedIn) {
                joinGameRoom(this.closest('.room-card').querySelector('h3').textContent);
            } else {
                showLoginModal();
            }
        });
    });
    
    // Activity monitoring
    document.addEventListener('mousemove', resetActivityTimer);
    document.addEventListener('keydown', resetActivityTimer);
    document.addEventListener('click', resetActivityTimer);
    document.addEventListener('touchstart', resetActivityTimer);
}

// Initialize tooltips and other UI enhancements
function initializeTooltips() {
    // Add tooltips to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        const title = button.getAttribute('title');
        if (title) {
            button.addEventListener('mouseenter', function(e) {
                // Tooltip implementation would go here
            });
        }
    });
}

// Check login status
function checkLoginStatus() {
    if (isLoggedIn) {
        updateUIForLoggedInUser();
    } else {
        updateUIForGuest();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    userInfo.classList.remove('hidden');
    guestActions.classList.add('hidden');
    usernameDisplay.textContent = currentUser.username;
    pointsCount.textContent = currentUser.points || 0;
    jkCoinsCount.textContent = currentUser.jkCoins || 0;
    
    // Update user points display
    userPoints = currentUser.points || 0;
    userJkCoins = currentUser.jkCoins || 0;
}

// Update UI for guest
function updateUIForGuest() {
    userInfo.classList.add('hidden');
    guestActions.classList.remove('hidden');
}

// Show login modal
function showLoginModal() {
    loginModal.style.display = 'flex';
}

// Show register modal
function showRegisterModal() {
    registerModal.style.display = 'flex';
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful login
    simulateLogin(username, password);
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const parentEmail = document.getElementById('parentEmail').value;
    const ageVerification = document.getElementById('ageVerification').checked;
    
    // Validation
    if (!username || !password || !confirmPassword || !parentEmail) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!ageVerification) {
        alert('You must confirm you are under 18 or have parental permission');
        return;
    }
    
    // In a real app, this would be an API call
    simulateRegistration(username, password, parentEmail);
}

// Simulate login (for demo purposes)
function simulateLogin(username, password) {
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('drawaria2_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        isLoggedIn = true;
        localStorage.setItem('drawaria2_user', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeAllModals();
        showSuccessMessage(`Welcome back, ${username}!`);
        
        // Check for daily reward
        checkDailyReward();
    } else {
        alert('Invalid username or password. Please try again or register a new account.');
    }
}

// Simulate registration (for demo purposes)
function simulateRegistration(username, password, parentEmail) {
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('drawaria2_users') || '[]');
    if (users.find(u => u.username === username)) {
        alert('Username already exists. Please choose a different one.');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password, // In a real app, this would be hashed
        parentEmail,
        points: 100, // Starting bonus
        jkCoins: 0,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('drawaria2_users', JSON.stringify(users));
    
    // Log the user in
    currentUser = newUser;
    isLoggedIn = true;
    localStorage.setItem('drawaria2_user', JSON.stringify(newUser));
    updateUIForLoggedInUser();
    closeAllModals();
    showSuccessMessage(`Account created successfully! Welcome to Drawaria2, ${username}!`);
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        currentUser = null;
        isLoggedIn = false;
        localStorage.removeItem('drawaria2_user');
        updateUIForGuest();
        showSuccessMessage('You have been logged out successfully.');
    }
}

// Handle Play Now button
function handlePlayNow() {
    if (isLoggedIn) {
        // Join a random public room
        joinGameRoom('Public Room #1');
    } else {
        showLoginModal();
    }
}

// Handle Create Room button
function handleCreateRoom() {
    if (isLoggedIn) {
        createGameRoom();
    } else {
        showLoginModal();
    }
}

// Handle Join Room button
function handleJoinRoom() {
    if (isLoggedIn) {
        // Show room joining interface
        alert('Room joining feature will be implemented in the full version');
    } else {
        showLoginModal();
    }
}

// Join a game room
function joinGameRoom(roomName) {
    if (!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    // Show the game modal
    gameModal.style.display = 'flex';
    
    // Initialize the game
    initializeGame(roomName);
    
    // Start AFK monitoring for the game
    startGameAfkMonitoring();
}

// Create a game room
function createGameRoom() {
    if (!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    const roomCode = generateRoomCode();
    const roomName = `Room ${roomCode}`;
    
    // Show the game modal with the new room
    gameModal.style.display = 'flex';
    
    // Initialize the game as room host
    initializeGame(roomName, true);
    
    // Start AFK monitoring for the game
    startGameAfkMonitoring();
    
    showSuccessMessage(`Room ${roomCode} created! Share this code with friends: ${roomCode}`);
}

// Generate a random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize game (placeholder - detailed implementation in game.js)
function initializeGame(roomName, isHost = false) {
    console.log(`Initializing game in room: ${roomName}, Host: ${isHost}`);
    // Game initialization will be handled in game.js
}

// Load leaderboard data
function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    // Sample leaderboard data
    const leaderboardData = [
        { rank: 1, username: 'ArtMaster123', points: 1250, drawings: 45, guesses: 38 },
        { rank: 2, username: 'CreativeKid', points: 1120, drawings: 52, guesses: 29 },
        { rank: 3, username: 'DrawPro', points: 980, drawings: 38, guesses: 35 },
        { rank: 4, username: 'SketchWizard', points: 875, drawings: 41, guesses: 27 },
        { rank: 5, username: 'ColorFan', points: 820, drawings: 36, guesses: 31 },
        { rank: 6, username: 'QuickDraw', points: 780, drawings: 39, guesses: 28 },
        { rank: 7, username: 'GuessMaster', points: 745, drawings: 32, guesses: 33 },
        { rank: 8, username: 'DoodleKing', points: 710, drawings: 44, guesses: 24 },
        { rank: 9, username: 'PixelArtist', points: 685, drawings: 37, guesses: 26 },
        { rank: 10, username: 'InkMaster', points: 650, drawings: 35, guesses: 25 }
    ];
    
    // Clear existing content
    leaderboardBody.innerHTML = '';
    
    // Populate leaderboard
    leaderboardData.forEach(player => {
        const row = document.createElement('tr');
        
        // Add rank class for styling
        if (player.rank <= 3) {
            row.classList.add(`rank-${player.rank}`);
        }
        
        row.innerHTML = `
            <td><span class="rank-badge">${player.rank}</span> ${player.rank <= 3 ? getRankEmoji(player.rank) : ''}</td>
            <td>${player.username}</td>
            <td>${player.points}</td>
            <td>${player.drawings}</td>
            <td>${player.guesses}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Get rank emoji
function getRankEmoji(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
}

// Check for daily reward
function checkDailyReward() {
    const lastRewardDate = localStorage.getItem('drawaria2_lastRewardDate');
    const today = new Date().toDateString();
    
    if (lastRewardDate !== today) {
        // Give daily reward
        const dailyReward = 50; // points
        userPoints += dailyReward;
        currentUser.points = userPoints;
        
        // Update localStorage
        localStorage.setItem('drawaria2_lastRewardDate', today);
        localStorage.setItem('drawaria2_user', JSON.stringify(currentUser));
        
        // Update UI
        pointsCount.textContent = userPoints;
        
        // Show reward message
        showSuccessMessage(`Daily reward! You received ${dailyReward} points!`);
    }
}

// Activity monitoring for AFK detection
function startActivityMonitoring() {
    // Reset activity timer every minute
    setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;
        
        // If user is inactive for 5 minutes and is in a game, show AFK warning
        if (timeSinceLastActivity > 5 * 60 * 1000 && gameModal.style.display === 'flex') {
            showAfkWarning();
        }
    }, 60 * 1000); // Check every minute
}

// Reset activity timer
function resetActivityTimer() {
    lastActivity = Date.now();
    
    // If AFK warning is showing, cancel it
    if (afkModal.style.display === 'flex') {
        cancelAfkWarning();
    }
}

// Show AFK warning
function showAfkWarning() {
    afkModal.style.display = 'flex';
    
    let countdown = 5;
    const countdownElement = document.getElementById('afkCountdown');
    
    afkTimer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(afkTimer);
            handleAfkTimeout();
        }
    }, 1000);
}

// Cancel AFK warning
function cancelAfkWarning() {
    clearInterval(afkTimer);
    afkModal.style.display = 'none';
    resetActivityTimer();
}

// Handle AFK timeout
function handleAfkTimeout() {
    // Mark player as AFK in the game
    markPlayerAsAfk();
    
    // Close the game modal after a delay
    setTimeout(() => {
        gameModal.style.display = 'none';
        showInfoMessage('You were removed from the game due to inactivity.');
    }, 2000);
}

// Mark player as AFK (placeholder)
function markPlayerAsAfk() {
    console.log('Player marked as AFK');
    // Implementation would update the player's status in the game
}

// Show ad modal
function showAdModal() {
    if (!isLoggedIn) {
        // Show ad immediately for guests
        displayAd();
    } else {
        // For logged in users, show ad after 25 minutes of gameplay
        const playTime = Date.now() - lastActivity;
        if (playTime > 25 * 60 * 1000) {
            displayAd();
            lastActivity = Date.now(); // Reset timer
        }
    }
}

// Display ad
function displayAd() {
    adModal.style.display = 'flex';
    
    let adCountdown = 15;
    let skipCountdown = 5;
    const adCountdownElement = document.getElementById('adCountdown');
    const skipTimerElement = document.getElementById('skipTimer');
    const skipAdBtn = document.getElementById('skipAdBtn');
    
    adTimer = setInterval(() => {
        adCountdown--;
        adCountdownElement.textContent = adCountdown;
        
        if (skipCountdown > 0) {
            skipCountdown--;
            skipTimerElement.textContent = skipCountdown;
        } else {
            skipAdBtn.disabled = false;
            skipAdBtn.textContent = 'Skip Ad';
        }
        
        if (adCountdown <= 0) {
            clearInterval(adTimer);
            closeAd();
        }
    }, 1000);
}

// Skip ad
function skipAd() {
    clearInterval(adTimer);
    closeAd();
}

// Close ad
function closeAd() {
    adModal.style.display = 'none';
    
    // Reward player for watching ad
    if (isLoggedIn) {
        userPoints += 10;
        currentUser.points = userPoints;
        localStorage.setItem('drawaria2_user', JSON.stringify(currentUser));
        pointsCount.textContent = userPoints;
        showSuccessMessage('Thanks for watching! You earned 10 points.');
    }
}

// Start AFK monitoring for game
function startGameAfkMonitoring() {
    // Reset the activity timer when game starts
    resetActivityTimer();
}

// Utility function to show success messages
function showSuccessMessage(message) {
    // In a real app, this would use a toast notification system
    console.log('Success: ' + message);
    alert(message);
}

// Utility function to show info messages
function showInfoMessage(message) {
    // In a real app, this would use a toast notification system
    console.log('Info: ' + message);
    alert(message);
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeAllModals();
    }
});

// Export functions for use in other modules
window.Drawaria2 = {
    joinGameRoom,
    createGameRoom,
    showAdModal,
    closeAllModals,
    getCurrentUser: () => currentUser,
    isLoggedIn: () => isLoggedIn
};