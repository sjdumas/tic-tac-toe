const Gameboard = (() => {
	let board = Array(9).fill(null);

	const getBoard = () => board;
	const setMove = (index, marker) => {
		if (!board[index]) {
			board[index] = marker;

			return true;
		}
		return false;
	};

	const resetBoard = () => board.fill(null);

	return { getBoard, setMove, resetBoard };
})();

const ScoreKeeper = (() => {
	let player1Score = 0;
	let player2Score = 0;
	let tieScore = 0;

	const updateScoreDisplay = () => {
		const scoreElements = document.getElementsByClassName("score");

		if (scoreElements[0]) {
			scoreElements[0].textContent = player1Score;
		}

		if (scoreElements[1]) {
			scoreElements[1].textContent = tieScore;
		}

		if (scoreElements[2]) {
			scoreElements[2].textContent = player2Score;
		}
	};

	const incrementPlayer1Score = () => {
		player1Score++;
		updateScoreDisplay();
	};

	const incrementPlayer2Score = () => {
		player2Score++;
		updateScoreDisplay();
	};

	const incrementTieScore = () => {
		tieScore++;
		updateScoreDisplay();
	};

	const resetScores = () => {
		player1Score = 0;
		player2Score = 0;
		tieScore = 0;
		updateScoreDisplay();
	};

	updateScoreDisplay();

	return {
		incrementPlayer1Score,
		incrementPlayer2Score,
		incrementTieScore,
		resetScores,
	};
})();

const Player = (name, marker) => {
	return { name, marker };
};

const GameController = (() => {
	let players = [];
	let currentPlayerIndex = 0;
	let gameOver = false;

	const addGamePlayers = (player1, player2) => {
		players = [player1, player2];
	};

	const switchPlayerTurn = () => {
		currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
	};

	const getCurrentPlayer = () => players[currentPlayerIndex];

	const checkForWinner = () => {
		const winningCombinations = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];

		const board = Gameboard.getBoard();

		for (const combo of winningCombinations) {
			const [a, b, c] = combo;
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				gameOver = true;
				return board[a]; // Return the winner
			}
		}
		if (!board.includes(null)) {
			gameOver = true;
			return "tie"; // Tie game
		}
		return null; // There is no winner yet
	};

	const resetGame = () => {
		currentPlayerIndex = 0;
		gameOver = false;
		Gameboard.resetBoard();
	};
	return {
		addGamePlayers,
		switchPlayerTurn,
		getCurrentPlayer,
		checkForWinner,
		resetGame,
	};
})();

const player1 = Player("Player 1", "X");
const player2 = Player("Player 2", "O");

GameController.addGamePlayers(player1, player2);

const DisplayController = (() => {
	const renderBoard = () => {
		const board = Gameboard.getBoard();
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell, index) => {
			const newValue = board[index] || "";
			if (cell.textContent !== newValue) {
				cell.textContent = newValue;
				cell.classList.add("cell-fade");
				setTimeout(() => {
					cell.classList.remove("cell-fade");
				}, 300);
			}
		});
	};

	const setupListeners = () => {
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell, index) => {
			cell.addEventListener("click", () => {
				if (!GameController.checkForWinner()) {
					const currentPlayer = GameController.getCurrentPlayer();
					if (Gameboard.setMove(index, currentPlayer.marker)) {
						const winner = GameController.checkForWinner();
						if (winner) {
							if (winner === "tie") {
								updateMessage("Looks like it's a tie!");
								ScoreKeeper.incrementTieScore();
							} else {
								if (currentPlayer.marker === player1.marker) {
									ScoreKeeper.incrementPlayer1Score();
								} else {
									ScoreKeeper.incrementPlayer2Score();
								}
								updateMessage(`${currentPlayer.name} wins!`);
							}
						} else {
							GameController.switchPlayerTurn();
							updateMessage(
								`It's ${
									GameController.getCurrentPlayer().name
								}'s turn.`
							);
						}
						renderBoard();
					}
				}
			});
		});
	};

	return { renderBoard, setupListeners };
})();

const displayPlayerInfo = () => {
	const player1Info = document.getElementById("player-1-name");
	const player2Info = document.getElementById("player-2-name");

	player1Info.textContent = player1.name;
	player2Info.textContent = player2.name;
};

displayPlayerInfo();

const updateMessage = (message) => {
	const messageDisplay = document.getElementById("message-display");
	messageDisplay.textContent = message;
};

document.getElementById("start-game").addEventListener("click", () => {
	const player1Name =
		document.getElementById("player1-input").value || "Player 1";
	const player2Name =
		document.getElementById("player2-input").value || "Player 2";

	player1.name = player1Name;
	player2.name = player2Name;

	GameController.addGamePlayers(player1, player2);
	displayPlayerInfo();

	GameController.resetGame();
	DisplayController.renderBoard();
	updateMessage(`Game started. ${player1.name}'s turn.`);

	document.getElementById("name-input-section").style.display = "none";
});

document.getElementById("restart").addEventListener("click", () => {
	GameController.resetGame();
	DisplayController.renderBoard();
	updateMessage(`${player1.name} is Player 1. Take your turn.`);
});

DisplayController.renderBoard();
DisplayController.setupListeners();
updateMessage(`Game has started. ${player1.name}, take your turn.`);

const ThemeController = (() => {
	const toggleIcon = () => {
		const icon = document.querySelector("#theme-toggle .material-icons");
		const currentTheme = document.body.dataset.theme;

		icon.textContent =
			currentTheme === "light" ? "dark_mode" : "light_mode";
	};

	const toggleTheme = () => {
		const currentTheme = document.body.dataset.theme;
		const newTheme = currentTheme === "light" ? "dark" : "light";

		document.body.dataset.theme = newTheme;
		localStorage.setItem("theme", newTheme);
		toggleIcon();
	};

	const initializeTheme = () => {
		const savedTheme = localStorage.getItem("theme") || "dark";

		document.body.dataset.theme = savedTheme;
		toggleIcon();
	};

	return { toggleTheme, initializeTheme };
})();

const FormValidator = (() => {
	const isValidName = (name) => {
		return /^[A-Za-z\s]*$/.test(name);
	};

	const validateInputs = (event) => {
		const input = event.target;
		const errorMessage = document.getElementById("validation-error");
		const startButton = document.getElementById("start-game");

		if (!isValidName(input.value)) {
			errorMessage.textContent =
				"Please use only letters and spaces for names";
			errorMessage.style.display = "block";
			input.classList.add("invalid");
			startButton.disabled = true;
		} else {
			errorMessage.style.display = "none";
			input.classList.remove("invalid");

			// Check if both inputs are valid
			const player1Input = document.getElementById("player1-input");
			const player2Input = document.getElementById("player2-input");
			const bothValid =
				isValidName(player1Input.value) &&
				isValidName(player2Input.value);
			startButton.disabled = !bothValid;
		}
	};

	return { validateInputs };
})();

document
	.getElementById("player1-input")
	.addEventListener("keyup", FormValidator.validateInputs);
document
	.getElementById("player2-input")
	.addEventListener("keyup", FormValidator.validateInputs);

document.addEventListener("DOMContentLoaded", () => {
	ThemeController.initializeTheme();

	const themeToggleBtn = document.getElementById("theme-toggle");

	if (themeToggleBtn) {
		themeToggleBtn.addEventListener("click", ThemeController.toggleTheme);
	}
});
