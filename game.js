// Game functionality for Drawaria2.io

// Game state
let gameState = {
    roomName: '',
    isHost: false,
    players: [],
    currentDrawer: null,
    currentWord: '',
    round: 1,
    totalRounds: 3,
    timeLeft: 80,
    timer: null,
    gameStarted: false,
    canvas: null,
    ctx: null,
    drawing: false,
    lastX: 0,
    lastY: 0,
    currentTool: 'pen',
    currentColor: '#000000',
    brushSize: 5,
    drawingHistory: [],
    historyIndex: -1
};

// Initialize game
function initializeGame(roomName, isHost = false) {
    gameState.roomName = roomName;
    gameState.isHost = isHost;
    
    // Update UI
    document.querySelector('.modal-header h2').textContent = `Drawaria2 - ${roomName}`;
    
    // Initialize canvas
    initializeCanvas();
    
    // Initialize players list
    initializePlayers();
    
    // Initialize game settings
    initializeGameSettings();
    
    // Initialize chat
    initializeChat();
    
    // If host, start the game
    if (isHost) {
        setTimeout(startGame, 2000);
    }
}

// Initialize canvas
function initializeCanvas() {
    gameState.canvas = document.getElementById('drawingCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // Set canvas background
    gameState.ctx.fillStyle = 'white';
    gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // Set up event listeners for drawing
    setupCanvasEvents();
    
    // Set up tool events
    setupToolEvents();
}

// Set up canvas events
function setupCanvasEvents() {
    gameState.canvas.addEventListener('mousedown', startDrawing);
    gameState.canvas.addEventListener('mousemove', draw);
    gameState.canvas.addEventListener('mouseup', stopDrawing);
    gameState.canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile devices
    gameState.canvas.addEventListener('touchstart', handleTouchStart);
    gameState.canvas.addEventListener('touchmove', handleTouchMove);
    gameState.canvas.addEventListener('touchend', stopDrawing);
}

// Set up tool events
function setupToolEvents() {
    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            setActiveTool(tool);
        });
    });
    
    // Color picker
    document.getElementById('colorPicker').addEventListener('change', function(e) {
        gameState.currentColor = e.target.value;
    });
    
    // Brush size
    document.getElementById('brushSize').addEventListener('input', function(e) {
        gameState.brushSize = e.target.value;
        document.getElementById('brushSizeValue').textContent = `${e.target.value}px`;
    });
    
    // Clear canvas
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    
    // Undo
    document.getElementById('undoBtn').addEventListener('click', undoDrawing);
}

// Set active tool
function setActiveTool(tool) {
    gameState.currentTool = tool;
    
    // Update UI
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tool-btn[data-tool="${tool}"]`).classList.add('active');
    
    // Update cursor
    switch(tool) {
        case 'pen':
            gameState.canvas.style.cursor = 'crosshair';
            break;
        case 'eraser':
            gameState.canvas.style.cursor = 'cell';
            break;
        case 'fill':
            gameState.canvas.style.cursor = 'grab';
            break;
    }
}

// Start drawing
function startDrawing(e) {
    if (!gameState.gameStarted || gameState.currentDrawer !== Drawaria2.getCurrentUser().username) {
        return;
    }
    
    gameState.drawing = true;
    const pos = getMousePos(e);
    [gameState.lastX, gameState.lastY] = [pos.x, pos.y];
    
    // Save canvas state for undo
    saveCanvasState();
}

// Draw
function draw(e) {
    if (!gameState.drawing) return;
    
    const pos = getMousePos(e);
    const currentX = pos.x;
    const currentY = pos.y;
    
    gameState.ctx.lineJoin = 'round';
    gameState.ctx.lineCap = 'round';
    
    switch(gameState.currentTool) {
        case 'pen':
            gameState.ctx.strokeStyle = gameState.currentColor;
            gameState.ctx.lineWidth = gameState.brushSize;
            gameState.ctx.beginPath();
            gameState.ctx.moveTo(gameState.lastX, gameState.lastY);
            gameState.ctx.lineTo(currentX, currentY);
            gameState.ctx.stroke();
            break;
            
        case 'eraser':
            gameState.ctx.strokeStyle = 'white';
            gameState.ctx.lineWidth = gameState.brushSize * 2;
            gameState.ctx.beginPath();
            gameState.ctx.moveTo(gameState.lastX, gameState.lastY);
            gameState.ctx.lineTo(currentX, currentY);
            gameState.ctx.stroke();
            break;
            
        case 'fill':
            // Fill tool would be implemented here
            break;
    }
    
    [gameState.lastX, gameState.lastY] = [currentX, currentY];
}

// Stop drawing
function stopDrawing() {
    gameState.drawing = false;
}

// Get mouse position
function getMousePos(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    let x, y;
    
    if (e.type.includes('touch')) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    // Scale coordinates for canvas resolution
    x = (x / rect.width) * gameState.canvas.width;
    y = (y / rect.height) * gameState.canvas.height;
    
    return { x, y };
}

// Handle touch start
function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
}

// Handle touch move
function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
}

// Clear canvas
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        gameState.ctx.fillStyle = 'white';
        gameState.ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
        saveCanvasState();
    }
}

// Save canvas state for undo
function saveCanvasState() {
    // Limit history size
    if (gameState.drawingHistory.length > 20) {
        gameState.drawingHistory.shift();
    }
    
    gameState.drawingHistory.push(gameState.canvas.toDataURL());
    gameState.historyIndex = gameState.drawingHistory.length - 1;
}

// Undo drawing
function undoDrawing() {
    if (gameState.historyIndex > 0) {
        gameState.historyIndex--;
        const img = new Image();
        img.onload = function() {
            gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
            gameState.ctx.drawImage(img, 0, 0);
        };
        img.src = gameState.drawingHistory[gameState.historyIndex];
    } else {
        clearCanvas();
    }
}

// Initialize players list
function initializePlayers() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    // Add current user
    addPlayerToUI(Drawaria2.getCurrentUser().username, true);
    
    // Add some sample players (in a real game, these would come from the server)
    const samplePlayers = ['ArtMaster123', 'CreativeKid', 'DrawPro', 'SketchWizard'];
    samplePlayers.forEach(player => {
        if (player !== Drawaria2.getCurrentUser().username) {
            addPlayerToUI(player);
        }
    });
    
    // Set first player as drawer for demo
    gameState.currentDrawer = Drawaria2.getCurrentUser().username;
    document.getElementById('currentDrawer').textContent = gameState.currentDrawer;
    
    // Update drawer indicator in UI
    updateDrawerIndicator();
}

// Add player to UI
function addPlayerToUI(username, isCurrentUser = false) {
    const playersList = document.getElementById('playersList');
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    if (isCurrentUser) playerItem.classList.add('current-user');
    
    playerItem.innerHTML = `
        <div class="player-avatar">${username.charAt(0).toUpperCase()}</div>
        <div class="player-name">${username}</div>
        <div class="player-score">0</div>
    `;
    
    playersList.appendChild(playerItem);
    gameState.players.push({ username, score: 0, isDrawer: false });
}

// Update drawer indicator
function updateDrawerIndicator() {
    document.querySelectorAll('.player-item').forEach(item => {
        const playerName = item.querySelector('.player-name').textContent;
        if (playerName === gameState.currentDrawer) {
            item.classList.add('player-drawer');
        } else {
            item.classList.remove('player-drawer');
        }
    });
}

// Initialize game settings
function initializeGameSettings() {
    // Rounds slider
    const roundsSlider = document.getElementById('roundsSlider');
    const roundsCount = document.getElementById('roundsCount');
    
    roundsSlider.addEventListener('input', function() {
        roundsCount.textContent = this.value;
        gameState.totalRounds = parseInt(this.value);
    });
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    const timeCount = document.getElementById('timeCount');
    
    timeSlider.addEventListener('input', function() {
        timeCount.textContent = this.value;
        gameState.timeLeft = parseInt(this.value);
        document.getElementById('gameTimer').textContent = this.value;
    });
    
    // Set initial values
    document.getElementById('currentRound').textContent = gameState.round;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    document.getElementById('gameTimer').textContent = gameState.timeLeft;
}

// Initialize chat
function initializeChat() {
    // This will be handled in chat.js
}

// Start the game
function startGame() {
    gameState.gameStarted = true;
    
    // Start the first round
    startRound();
    
    // Add system message
    addSystemMessage('Game started! Get ready to draw and guess!');
}

// Start a round
function startRound() {
    // Reset timer
    gameState.timeLeft = parseInt(document.getElementById('timeSlider').value);
    document.getElementById('gameTimer').textContent = gameState.timeLeft;
    
    // Select a word for the drawer
    if (gameState.currentDrawer === Drawaria2.getCurrentUser().username) {
        selectWord();
    } else {
        document.getElementById('currentWord').textContent = '_______';
    }
    
    // Clear canvas if current user is drawer
    if (gameState.currentDrawer === Drawaria2.getCurrentUser().username) {
        clearCanvas();
    }
    
    // Start the timer
    startTimer();
    
    // Add system message
    addSystemMessage(`Round ${gameState.round} started! ${gameState.currentDrawer} is drawing.`);
}

// Select a word for drawing
function selectWord() {
    // Sample word list
    const words = [
        'Elephant', 'Sunflower', 'Bicycle', 'Pizza', 'Rainbow',
        'Butterfly', 'Castle', 'Dragon', 'Ice Cream', 'Robot',
        'Treehouse', 'Kite', 'Guitar', 'Ocean', 'Rocket'
    ];
    
    // Select a random word
    const randomIndex = Math.floor(Math.random() * words.length);
    gameState.currentWord = words[randomIndex];
    
    // Display the word (only to the drawer)
    document.getElementById('currentWord').textContent = gameState.currentWord;
}

// Start the timer
function startTimer() {
    clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        document.getElementById('gameTimer').textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            endRound();
        }
    }, 1000);
}

// End the round
function endRound() {
    clearInterval(gameState.timer);
    
    // Add system message
    addSystemMessage(`Time's up! The word was: ${gameState.currentWord}`);
    
    // Move to next round or end game
    if (gameState.round < gameState.totalRounds) {
        gameState.round++;
        document.getElementById('currentRound').textContent = gameState.round;
        
        // Select next drawer
        selectNextDrawer();
        
        // Start next round after a delay
        setTimeout(startRound, 3000);
    } else {
        endGame();
    }
}

// Select next drawer
function selectNextDrawer() {
    const currentIndex = gameState.players.findIndex(p => p.username === gameState.currentDrawer);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    gameState.currentDrawer = gameState.players[nextIndex].username;
    
    document.getElementById('currentDrawer').textContent = gameState.currentDrawer;
    updateDrawerIndicator();
}

// End the game
function endGame() {
    gameState.gameStarted = false;
    
    // Calculate winner
    const winner = gameState.players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
    );
    
    // Add system message
    addSystemMessage(`Game over! ${winner.username} wins with ${winner.score} points!`);
    
    // Update scores in UI
    updateScores();
    
    // Show game over message
    setTimeout(() => {
        alert(`Game Over! ${winner.username} is the winner!`);
    }, 1000);
}

// Update scores in UI
function updateScores() {
    document.querySelectorAll('.player-item').forEach(item => {
        const playerName = item.querySelector('.player-name').textContent;
        const playerScore = item.querySelector('.player-score');
        const player = gameState.players.find(p => p.username === playerName);
        
        if (player) {
            // Add some random points for demo
            player.score += Math.floor(Math.random() * 100) + 50;
            playerScore.textContent = player.score;
        }
    });
    
    // Update player's own score display
    document.getElementById('playerScore').textContent = 
        gameState.players.find(p => p.username === Drawaria2.getCurrentUser().username).score;
}

// Add system message to chat
function addSystemMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message system';
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle correct guess
function handleCorrectGuess(guesser) {
    // Calculate points based on time left
    const points = Math.floor(gameState.timeLeft / 10) * 10 + 50;
    
    // Update player score
    const player = gameState.players.find(p => p.username === guesser);
    if (player) {
        player.score += points;
    }
    
    // Update drawer score
    const drawer = gameState.players.find(p => p.username === gameState.currentDrawer);
    if (drawer) {
        drawer.score += Math.floor(points / 2);
    }
    
    // Add correct guess message
    addCorrectGuessMessage(guesser, gameState.currentWord, points);
    
    // Update UI
    updateScores();
    
    // End round early
    endRound();
}

// Add correct guess message
function addCorrectGuessMessage(guesser, word, points) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message correct';
    messageElement.innerHTML = `
        <div class="message-sender">${guesser}</div>
        <div class="message-content">guessed the word "${word}" and earned ${points} points!</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make functions available globally
window.GameManager = {
    initializeGame,
    handleCorrectGuess
};