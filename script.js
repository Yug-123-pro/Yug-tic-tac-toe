// **JavaScript for Tic-Tac-Toe Game Logic with Flexible Move History**

// --- Game State Variables ---
let board = ['', '', '', '', '', '', '', '', '']; // Represents the 9 cells of the board
let currentPlayer = 'X'; // 'X' or 'O'
let gameActive = true; // True while the game is ongoing (can be true even when viewing history if not a final state)
let history = []; // Stores the state of the board after each move
let currentMoveIndex = -1; // Points to the current state in the history array

// --- DOM Elements ---
const cells = document.querySelectorAll('.cell');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('resetButton');
const historyControls = document.getElementById('historyControls');

// --- Winning Conditions ---
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- Functions ---

// Initializes the game or resets it
function initializeGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    history = [];
    currentMoveIndex = -1;

    messageElement.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-mark', 'o-mark');
    });
    updateHistoryControls();
    saveCurrentState(); // Save the initial empty state
}

// Saves the current board state to history
function saveCurrentState() {
    // If we've gone back in history and then made a new move,
    // we need to discard all subsequent future moves from history.
    if (currentMoveIndex < history.length - 1) {
        history = history.slice(0, currentMoveIndex + 1);
    }
    history.push([...board]); // Push a copy of the current board
    currentMoveIndex = history.length - 1;
    updateHistoryControls();
}

// Renders a specific board state from history
function renderBoard(state) {
    state.forEach((cellValue, index) => {
        cells[index].textContent = cellValue;
        cells[index].classList.remove('x-mark', 'o-mark');
        if (cellValue === 'X') {
            cells[index].classList.add('x-mark');
        } else if (cellValue === 'O') {
            cells[index].classList.add('o-mark');
        }
    });
}

// Handles a player's move
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

    // Only allow moves if the game is considered "active" (not a final win/draw state)
    // AND the selected cell is empty.
    if (!gameActive || board[clickedCellIndex] !== '') {
        return;
    }

    // Update the board
    board[clickedCellIndex] = currentPlayer;

    // Save the new state before checking for a result or changing player
    saveCurrentState();

    // Now render the board with the new state (which is the last in history)
    renderBoard(board);

    // After a move, immediately check the result for the current board state.
    checkResult();
}

// Checks for a win or a draw for the current 'board' state
function checkResult() {
    let winnerFound = false;
    let winningPlayer = '';

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            winnerFound = true;
            winningPlayer = a;
            break;
        }
    }

    if (winnerFound) {
        messageElement.textContent = `Player ${winningPlayer} has won!`;
        gameActive = false; // Game ends
        return;
    }

    let isDraw = !board.includes('');
    if (isDraw) {
        messageElement.textContent = `It's a draw!`;
        gameActive = false; // Game ends
        return;
    }

    // If no win and no draw, switch to the next player
    changePlayer();
}

// Switches the current player
function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    messageElement.textContent = `Player ${currentPlayer}'s turn`;
}

// Updates the history control buttons
function updateHistoryControls() {
    historyControls.innerHTML = ''; // Clear previous buttons

    // Create buttons for each historical state
    for (let i = 0; i < history.length; i++) {
        const button = document.createElement('button');
        button.textContent = `Move ${i}`;
        button.classList.add('history-button');
        if (i === currentMoveIndex) {
            button.classList.add('active-history-button'); // Highlight current move
        }
        button.dataset.moveIndex = i;
        button.addEventListener('click', () => goToMove(i));
        historyControls.appendChild(button);
    }
}

// Navigates to a specific move in history
function goToMove(index) {
    if (index >= 0 && index < history.length) {
        currentMoveIndex = index;
        board = [...history[currentMoveIndex]]; // Load the board state

        renderBoard(board); // Update the visual board

        // Determine who's turn it would be IF the game were to resume from this state
        const xCount = board.filter(cell => cell === 'X').length;
        const oCount = board.filter(cell => cell === 'O').length;

        // If X has made the same number of moves as O, it's X's turn. Otherwise, it's O's.
        // This handles starting a new turn after going back.
        currentPlayer = (xCount === oCount) ? 'X' : 'O';

        // Check the result of THIS historical board state
        let isWinningState = false;
        let winningPlayer = '';
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];
            if (a !== '' && a === b && b === c) {
                isWinningState = true;
                winningPlayer = a;
                break;
            }
        }

        if (isWinningState) {
            messageElement.textContent = `Player ${winningPlayer} won on this move.`;
            gameActive = false; // If this state is a final win/draw, the game is NOT active for new moves
        } else if (!board.includes('') && !isWinningState) { // Check for draw
            messageElement.textContent = `This move resulted in a draw.`;
            gameActive = false; // Game is not active if it's a draw
        } else {
            // If it's not a final state, the game is active and waiting for the next player
            messageElement.textContent = `Viewing Move ${index}. Player ${currentPlayer}'s turn to resume.`;
            gameActive = true;
        }

        updateHistoryControls(); // Update button styling
    }
}

// --- Event Listeners ---
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', initializeGame);

// --- Initial Game Setup ---
initializeGame();