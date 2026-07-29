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

    document.getElementById('switchToRegister')
    .addEventListener('click', function(e) {

        e.preventDefault();

        loginModal.style.display = 'none';

        registerModal.style.display = 'flex';

    });



    document.getElementById('switchToLogin')
    .addEventListener('click', function(e) {

        e.preventDefault();

        registerModal.style.display = 'none';

        loginModal.style.display = 'flex';

    });



    // Form submissions

    document.getElementById('loginForm')
    .addEventListener('submit', handleLogin);


    document.getElementById('registerForm')
    .addEventListener('submit', handleRegister);



    // AFK modal

    document.getElementById('stayInGame')
    .addEventListener('click', cancelAfkWarning);



    // Ad modal

    document.getElementById('skipAdBtn')
    .addEventListener('click', skipAd);



    // Join room buttons

    document.querySelectorAll('.join-room-btn')
    .forEach(button => {

        button.addEventListener('click', function() {


            if (isLoggedIn) {

                joinGameRoom(
                    this.closest('.room-card')
                    .querySelector('h3')
                    .textContent
                );


            } else {

                showLoginModal();

            }


        });


    });



    // Activity monitoring

    document.addEventListener(
        'mousemove',
        resetActivityTimer
    );


    document.addEventListener(
        'keydown',
        resetActivityTimer
    );


    document.addEventListener(
        'click',
        resetActivityTimer
    );


    document.addEventListener(
        'touchstart',
        resetActivityTimer
    );

}


// Initialize tooltips and UI enhancements
function initializeTooltips() {


    const buttons =
        document.querySelectorAll('.btn');


    buttons.forEach(button => {


        const title =
            button.getAttribute('title');


        if (title) {


            button.addEventListener(
                'mouseenter',
                function(e) {

                    // Tooltip implementation would go here

                }
            );


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


    usernameDisplay.textContent =
        currentUser.username;


    pointsCount.textContent =
        currentUser.points || 0;


    jkCoinsCount.textContent =
        currentUser.jkCoins || 0;



    userPoints =
        currentUser.points || 0;


    userJkCoins =
        currentUser.jkCoins || 0;


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


    document.querySelectorAll('.modal')
    .forEach(modal => {

        modal.style.display = 'none';

    });



    // Handle login form submission
function handleLogin(e) {

    e.preventDefault();


    const username =
        document.getElementById('loginUsername').value;


    const password =
        document.getElementById('loginPassword').value;



    // Simple validation

    if (!username || !password) {

        alert('Please fill in all fields');

        return;

    }



    // In a real app, this would be an API call

    // For demo purposes, simulate successful login

    simulateLogin(username, password);

}



// Handle register form submission
function handleRegister(e) {

    e.preventDefault();



    const username =
        document.getElementById('registerUsername').value;


    const password =
        document.getElementById('registerPassword').value;


    const confirmPassword =
        document.getElementById('confirmPassword').value;


    const parentEmail =
        document.getElementById('parentEmail').value;


    const ageVerification =
        document.getElementById('ageVerification').checked;




    // Validation

    if (
        !username ||
        !password ||
        !confirmPassword ||
        !parentEmail
    ) {

        alert('Please fill in all fields');

        return;

    }



    if (password !== confirmPassword) {

        alert('Passwords do not match');

        return;

    }



    if (!ageVerification) {

        alert(
            'You must confirm you are under 18 or have parental permission'
        );

        return;

    }



    simulateRegistration(
        username,
        password,
        parentEmail
    );

}



// Simulate login (for demo purposes)
function simulateLogin(username, password) {


    // Check if user exists in localStorage

    const users =
        JSON.parse(
            localStorage.getItem('drawaria2_users') || '[]'
        );



    const user =
        users.find(
            u =>
            u.username === username &&
            u.password === password
        );



    if (user) {


        currentUser = user;

        isLoggedIn = true;



        localStorage.setItem(
            'drawaria2_user',
            JSON.stringify(user)
        );



        updateUIForLoggedInUser();


        closeAllModals();


        showSuccessMessage(
            `Welcome back, ${username}!`
        );



        checkDailyReward();



    } else {


        alert(
            'Invalid username or password. Please try again or register a new account.'
        );


    }


}



// Simulate registration (for demo purposes)
function simulateRegistration(
    username,
    password,
    parentEmail
) {


    // Check if username already exists

    const users =
        JSON.parse(
            localStorage.getItem('drawaria2_users') || '[]'
        );



    if (
        users.find(
            u => u.username === username
        )
    ) {


        alert(
            'Username already exists. Please choose a different one.'
        );


        return;


    }



    // Create new user

    const newUser = {

        username,

        password, // In a real app this should be hashed

        parentEmail,

        points: 100,

        jkCoins: 0,

        joinDate:
            new Date().toISOString(),

        lastLogin:
            new Date().toISOString()

    };



    users.push(newUser);



    localStorage.setItem(
        'drawaria2_users',
        JSON.stringify(users)
    );



    // Log user in

    currentUser = newUser;

    isLoggedIn = true;



    localStorage.setItem(
        'drawaria2_user',
        JSON.stringify(newUser)
    );



    updateUIForLoggedInUser();


    closeAllModals();


    showSuccessMessage(
        `Account created successfully! Welcome to Drawaria2, ${username}!`
    );


}



// Handle logout
function handleLogout() {


    if (
        confirm(
            'Are you sure you want to log out?'
        )
    ) {


        currentUser = null;


        isLoggedIn = false;



        localStorage.removeItem(
            'drawaria2_user'
        );



        updateUIForGuest();



        showSuccessMessage(
            'You have been logged out successfully.'
        );


    }


}



// Handle Play Now button
function handlePlayNow() {


    if (isLoggedIn) {


        joinGameRoom(
            'Public Room #1'
        );


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


        alert(
            'Room joining feature will be implemented in the full version'
        );


    } else {


        showLoginModal();


    }


}

}
