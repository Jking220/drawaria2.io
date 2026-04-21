// Chat functionality for Drawaria2.io

// Initialize chat
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    
    // Send message on button click
    sendChatBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add sample messages for demo
    addSampleMessages();
}

// Send message
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Check if the message is a correct guess
    if (isCorrectGuess(message)) {
        handleCorrectGuess(Drawaria2.getCurrentUser().username);
    } else {
        // Add message to chat
        addPlayerMessage(Drawaria2.getCurrentUser().username, message);
        
        // In a real game, this would be sent to other players via WebSocket
        // For demo, we'll simulate responses
        simulateResponse(message);
    }
    
    // Clear input
    chatInput.value = '';
}

// Check if message is a correct guess
function isCorrectGuess(message) {
    if (!window.GameManager || !window.GameManager.gameState) return false;
    
    const normalizedMessage = message.toLowerCase().trim();
    const normalizedWord = window.GameManager.gameState.currentWord.toLowerCase();
    
    return normalizedMessage === normalizedWord;
}

// Handle correct guess
function handleCorrectGuess(guesser) {
    if (window.GameManager && window.GameManager.handleCorrectGuess) {
        window.GameManager.handleCorrectGuess(guesser);
    }
}

// Add player message to chat
function addPlayerMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message player';
    messageElement.innerHTML = `
        <div class="message-sender">${sender}</div>
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate response from other players (for demo)
function simulateResponse(message) {
    // Only respond sometimes to make it feel natural
    if (Math.random() < 0.3) {
        const responses = [
            "Is it an animal?",
            "That's a tough one!",
            "I think I know what it is!",
            "Great drawing!",
            "Can you give us a hint?",
            "I'm stuck on this one",
            "Almost got it!",
            "This is fun!",
            "You're a good artist!",
            "I give up, what is it?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomPlayer = getRandomPlayer();
        
        setTimeout(() => {
            addPlayerMessage(randomPlayer, randomResponse);
        }, 1000 + Math.random() * 3000);
    }
}

// Get a random player (for demo)
function getRandomPlayer() {
    const players = ['ArtMaster123', 'CreativeKid', 'DrawPro', 'SketchWizard'];
    const currentUser = Drawaria2.getCurrentUser().username;
    
    // Filter out current user
    const otherPlayers = players.filter(p => p !== currentUser);
    
    if (otherPlayers.length === 0) return 'Player2';
    return otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
}

// Add sample messages for demo
function addSampleMessages() {
    const sampleMessages = [
        { sender: 'ArtMaster123', message: 'Hello everyone! Ready to play?' },
        { sender: 'CreativeKid', message: 'Yes! I love this game!' },
        { sender: 'System', message: 'Game will start in 10 seconds' }
    ];
    
    sampleMessages.forEach(msg => {
        if (msg.sender === 'System') {
            // Add system message
            const chatMessages = document.getElementById('chatMessages');
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message system';
            messageElement.innerHTML = `
                <div class="message-content">${msg.message}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            chatMessages.appendChild(messageElement);
        } else {
            addPlayerMessage(msg.sender, msg.message);
        }
    });
}

// Make functions available globally
window.ChatManager = {
    initializeChat,
    sendMessage,
    addPlayerMessage
};
