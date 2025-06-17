class ChopsticksGamePro {
    constructor(soundManager = null) {
        this.soundManager = soundManager;
        this.gameState = {
            player: { left: 1, right: 1 },
            opponent: { left: 1, right: 1 },
            currentTurn: 'player',
            selectedHand: null,
            gameOver: false,
            winner: null,
            gameMode: 'computer', // 'computer' or 'friend'
            moveCount: 0
        };
        
        this.stats = {
            gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
            playerWins: parseInt(localStorage.getItem('playerWins') || '0'),
            playerLosses: parseInt(localStorage.getItem('playerLosses') || '0')
        };
        
        this.fingerEmoji = '👆';
        this.logs = [];
        
        this.initializeGame();
    }

    initializeGame() {
        this.loadTheme();
        this.preloadEffects();
        this.updateDisplay();
        this.updateStats();
        this.attachEventListeners();
        this.updateGameStatus();
        this.addLog('Game started! Good luck! 🎮', 'game-event');
    }

    attachEventListeners() {
        // Sidebar controls
        document.getElementById('sidebar-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('close-sidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
        document.getElementById('clear-logs').addEventListener('click', () => this.clearLogs());

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Game mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchGameMode(e.target.dataset.mode));
        });

        // Hand selection for player
        document.querySelectorAll('.player-hand').forEach(hand => {
            hand.addEventListener('click', (e) => this.handlePlayerHandClick(e));
        });

        // Opponent hand targeting and selection
        document.querySelectorAll('.opponent-hand').forEach(hand => {
            hand.addEventListener('click', (e) => this.handleOpponentHandClick(e));
        });

        // Add click handler for Player 2 to attack Player 1's hands in friend mode
        document.querySelectorAll('.player-hand').forEach(hand => {
            hand.addEventListener('click', (e) => this.handlePlayer2AttackClick(e));
        });

        // Action buttons
        document.getElementById('split-btn').addEventListener('click', () => this.handleSplit());
        if (document.getElementById('split-btn-p2')) {
            document.getElementById('split-btn-p2').addEventListener('click', () => this.handleSplitPlayer2());
        }
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Instructions toggle
        document.getElementById('instructions-toggle').addEventListener('click', () => this.toggleInstructions());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Theme Management
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.className = `${savedTheme}-theme`;
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.className = `${newTheme}-theme`;
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        
        this.addLog(`Switched to ${newTheme} theme`, 'game-event');
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Sidebar Management
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    }

    // Game Mode Management
    switchGameMode(mode) {
        // Game mode buttons are now disabled in the UI
        if (this.gameState.gameMode === mode) return;
        
        this.gameState.gameMode = mode;
        localStorage.setItem('gameMode', mode);
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide appropriate split buttons
        const splitBtn1 = document.getElementById('split-btn');
        const splitBtn2 = document.getElementById('split-btn-p2');
        
        if (mode === 'friend') {
            splitBtn1.innerHTML = '<i class="fas fa-cut"></i> Player 1 Split';
            if (splitBtn2) {
                splitBtn2.style.display = 'inline-flex';
            }
        } else {
            splitBtn1.innerHTML = '<i class="fas fa-cut"></i> Split Fingers';
            if (splitBtn2) {
                splitBtn2.style.display = 'none';
            }
        }
        
        // Update opponent info
        const opponentName = document.getElementById('opponent-name');
        const opponentAvatar = document.getElementById('opponent-avatar');
        const modeInfo = document.getElementById('mode-info');
        
        if (mode === 'computer') {
            opponentName.textContent = 'Computer';
            opponentAvatar.className = 'fas fa-robot';
            modeInfo.textContent = 'Playing against Computer';
        } else {
            opponentName.textContent = 'Player 2';
            opponentAvatar.className = 'fas fa-user';
            modeInfo.textContent = 'Playing with Friend';
        }
        
        this.addLog(`Switched to ${mode === 'computer' ? 'Computer' : 'Friend'} mode`, 'game-event');
        this.resetGame();
    }

    // Logging System
    addLog(message, type = 'game-event') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            message,
            type,
            timestamp,
            moveNumber: this.gameState.moveCount
        };
        
        this.logs.unshift(logEntry);
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }
        
        this.updateLogsDisplay();
    }

    updateLogsDisplay() {
        const logsList = document.getElementById('logs-list');
        
        if (this.logs.length === 0) {
            logsList.innerHTML = '<div class="log-item welcome">No moves yet. Start playing!</div>';
            return;
        }
        
        logsList.innerHTML = this.logs.map(log => `
            <div class="log-item ${log.type}">
                <div style="font-size: 0.8em; color: var(--text-muted); margin-bottom: 3px;">
                    ${log.timestamp} - Move #${log.moveNumber}
                </div>
                ${log.message}
            </div>
        `).join('');
    }

    clearLogs() {
        this.logs = [];
        this.updateLogsDisplay();
        this.addLog('Logs cleared', 'game-event');
    }

    // Stats Management
    updateStats() {
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('player-wins').textContent = this.stats.playerWins;
        document.getElementById('player-losses').textContent = this.stats.playerLosses;
    }

    saveStats() {
        localStorage.setItem('gamesPlayed', this.stats.gamesPlayed.toString());
        localStorage.setItem('playerWins', this.stats.playerWins.toString());
        localStorage.setItem('playerLosses', this.stats.playerLosses.toString());
    }

    // Game Logic
    handlePlayerHandClick(e) {
        if (this.gameState.gameOver) return;
        
        // In friend mode, only allow Player 1 to select their hands during their turn
        if (this.gameState.gameMode === 'friend') {
            if (this.gameState.currentTurn !== 'player') return;
        } else {
            // In computer mode, only allow during player turn
            if (this.gameState.currentTurn !== 'player') return;
        }

        const hand = e.currentTarget;
        const handSide = hand.dataset.hand;
        
        // Check if hand is dead
        if (this.gameState.player[handSide] === 5) return;
        
        // Play hand sound when player touches their hand - only in active game
        if (this.soundManager && !this.gameState.gameOver) {
            this.soundManager.play('hand');
        }

        // Toggle selection
        if (this.gameState.selectedHand === handSide) {
            this.gameState.selectedHand = null;
            hand.classList.remove('selected');
        } else {
            // Remove previous selection
            document.querySelectorAll('.hand').forEach(h => h.classList.remove('selected'));
            
            // Select new hand
            this.gameState.selectedHand = handSide;
            hand.classList.add('selected');
        }

        this.updateSplitButton();
        this.updateGameStatus();
    }

    handlePlayer2AttackClick(e) {
        if (this.gameState.gameOver || this.gameState.gameMode !== 'friend') return;
        
        // Only allow Player 2 to attack Player 1's hands when it's Player 2's turn and they have a hand selected
        if (this.gameState.currentTurn === 'opponent' && this.gameState.selectedHand) {
            const targetHand = e.currentTarget.dataset.hand;
            
            // Check if target hand is dead
            if (this.gameState.player[targetHand] === 5) return;
            
            // Play hand sound when player 2 attacks player 1's hand - only when actually performing an attack
            if (this.soundManager) {
                this.soundManager.play('hand');
            }
            
            this.performAttack('opponent', this.gameState.selectedHand, 'player', targetHand);
        }
    }

    handleOpponentHandClick(e) {
        if (this.gameState.gameOver) return;
        
        if (this.gameState.gameMode === 'friend') {
            // In friend mode, handle both attacking opponent's hand and selecting Player 2's hand
            if (this.gameState.currentTurn === 'player' && this.gameState.selectedHand) {
                // Player 1 attacking Player 2's hand
                const targetHand = e.currentTarget.dataset.hand;
                if (this.gameState.opponent[targetHand] === 5) return;
                
                // Play hand sound when player 1 attacks player 2's hand
                if (this.soundManager) {
                    this.soundManager.play('hand');
                }
                
                this.performAttack('player', this.gameState.selectedHand, 'opponent', targetHand);
            } else if (this.gameState.currentTurn === 'opponent') {
                // Player 2 selecting their hand
                const hand = e.currentTarget;
                const handSide = hand.dataset.hand;
                
                if (this.gameState.opponent[handSide] === 5) return;
                
                // Play hand sound when player 2 selects their hand
                if (this.soundManager) {
                    this.soundManager.play('hand');
                }

                // Toggle selection for Player 2
                if (this.gameState.selectedHand === handSide) {
                    this.gameState.selectedHand = null;
                    hand.classList.remove('selected');
                } else {
                    document.querySelectorAll('.hand').forEach(h => h.classList.remove('selected'));
                    this.gameState.selectedHand = handSide;
                    hand.classList.add('selected');
                }
                this.updateGameStatus();
            }
        } else {
            // Computer mode - only allow attacking during player turn
            if (this.gameState.currentTurn !== 'player' || !this.gameState.selectedHand) return;
            
            const targetHand = e.currentTarget.dataset.hand;
            if (this.gameState.opponent[targetHand] === 5) return;
            
            // Play hand sound when player attacks computer's hand
            if (this.soundManager) {
                this.soundManager.play('hand');
            }
            
            this.performAttack('player', this.gameState.selectedHand, 'opponent', targetHand);
        }
    }

    performAttack(attackerPlayer, attackerHand, targetPlayer, targetHand) {
        const attackerFingers = this.gameState[attackerPlayer][attackerHand];
        const targetFingers = this.gameState[targetPlayer][targetHand];
        
        // Calculate new finger count with rollover
        let newFingers = (attackerFingers + targetFingers) % 5;
        if (newFingers === 0) newFingers = 5;
        
        // Check if this attack will kill the hand
        const willKillHand = newFingers === 5 && targetFingers !== 5;

        this.gameState[targetPlayer][targetHand] = newFingers;
        this.gameState.moveCount++;
        
        // We'll play the dead sound in updateHandDisplay instead

        // Log the move
        const attackerName = attackerPlayer === 'player' ? 'Player 1' : 
                           (this.gameState.gameMode === 'computer' ? 'Computer' : 'Player 2');
        const targetName = targetPlayer === 'player' ? 'Player 1' : 
                          (this.gameState.gameMode === 'computer' ? 'Computer' : 'Player 2');
        
        this.addLog(
            `${attackerName} attacked ${targetName}'s ${targetHand} hand (${attackerFingers} + ${targetFingers} = ${newFingers})`,
            attackerPlayer === 'player' ? 'player-move' : 'opponent-move'
        );

        // Clear selection
        this.gameState.selectedHand = null;
        document.querySelectorAll('.hand').forEach(h => h.classList.remove('selected'));

        // Create attack effect
        this.createAttackEffect();

        // Update display with animation
        this.updateDisplay();
        this.animateFingerChange(targetPlayer, targetHand);

        // Check for game over
        if (this.checkGameOver()) {
            this.endGame();
        } else {
            // Switch turns
            this.gameState.currentTurn = this.gameState.currentTurn === 'player' ? 'opponent' : 'player';
            this.updateGameStatus();
            
            // Computer turn (only in computer mode)
            if (this.gameState.gameMode === 'computer' && this.gameState.currentTurn === 'opponent') {
                setTimeout(() => this.computerTurn(), 1500);
            }
        }

        this.updateSplitButton();
    }

    handleSplit() {
        if (this.gameState.gameOver || this.gameState.currentTurn !== 'player') return;
        
        // Check all possible split scenarios for Player 1
        const leftFingers = this.gameState.player.left;
        const rightFingers = this.gameState.player.right;
        
        // Valid split conditions:
        // 1. One hand has fingers, other hand is dead (5) or has space
        // 2. Can redistribute fingers between hands
        
        let splitPerformed = false;
        let newLeft = leftFingers;
        let newRight = rightFingers;
        let handRecovered = false;
        
        // Check if this split will recover a dead hand
        const willRecoverHand = (leftFingers === 5 && rightFingers > 0) || (rightFingers === 5 && leftFingers > 0);
        
        // Case 1: Left hand is dead, right hand has fingers
        if (leftFingers === 5 && rightFingers > 0) {
            newLeft = 1;
            newRight = rightFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        }
        // Case 2: Right hand is dead, left hand has fingers
        else if (rightFingers === 5 && leftFingers > 0) {
            newRight = 1;
            newLeft = leftFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        }
        // Case 3: Both hands have fingers, redistribute
        else if (leftFingers > 0 && rightFingers > 0) {
            // Redistribute to make them more balanced
            const total = leftFingers + rightFingers;
            newLeft = Math.floor(total / 2);
            newRight = total - newLeft;
            
            // Only count as split if distribution changed
            if (newLeft !== leftFingers) {
                splitPerformed = true;
            }
        }
        // Case 4: One hand has all fingers, other is empty
        else if ((leftFingers > 0 && rightFingers === 0) || (rightFingers > 0 && leftFingers === 0)) {
            const total = leftFingers + rightFingers;
            newLeft = Math.floor(total / 2);
            newRight = total - newLeft;
            splitPerformed = true;
        }
        
        if (splitPerformed) {
            // Create a visual effect for the split action
            this.createSplitEffect();
            
            // Apply the split
            this.gameState.player.left = newLeft;
            this.gameState.player.right = newRight;
            
            this.addLog(`Player 1 split: ${leftFingers}-${rightFingers} → ${newLeft}-${newRight}`, 'player-move');
            
            // Show recover hand effect if a hand was recovered
            if (willRecoverHand) {
                this.createRecoverHandEffect('player');
            }
            
            this.gameState.moveCount++;
            this.updateDisplay();
            this.animateFingerChange('player', 'left');
            this.animateFingerChange('player', 'right');

            // Switch turns
            this.gameState.currentTurn = 'opponent';
            this.updateGameStatus();
            this.updateSplitButton();

            // Computer turn (only in computer mode)
            if (this.gameState.gameMode === 'computer') {
                setTimeout(() => this.computerTurn(), 1500);
            }
        }
    }

    handleSplitPlayer2() {
        if (this.gameState.gameOver || this.gameState.gameMode !== 'friend') return;
        if (this.gameState.currentTurn !== 'opponent') return;
        
        // Check all possible split scenarios for Player 2
        const leftFingers = this.gameState.opponent.left;
        const rightFingers = this.gameState.opponent.right;
        
        // Valid split conditions:
        // 1. One hand has fingers, other hand is dead (5) or has space
        // 2. Can redistribute fingers between hands
        
        let splitPerformed = false;
        let newLeft = leftFingers;
        let newRight = rightFingers;
        let handRecovered = false;
        
        // Check if this split will recover a dead hand
        const willRecoverHand = (leftFingers === 5 && rightFingers > 0) || (rightFingers === 5 && leftFingers > 0);
        
        // Special case: Can't split when one hand is dead and the other has exactly 1 finger
        const deadHandWithOneFinger = (leftFingers === 5 && rightFingers === 1) || 
                                     (rightFingers === 5 && leftFingers === 1);
        
        if (deadHandWithOneFinger || leftFingers + rightFingers <= 1) {
            return; // Can't split in these cases
        }
        
        // Case 1: Left hand is dead, right hand has fingers
        if (leftFingers === 5 && rightFingers > 1) {
            newLeft = 1;
            newRight = rightFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        }
        // Case 2: Right hand is dead, left hand has fingers
        else if (rightFingers === 5 && leftFingers > 1) {
            newRight = 1;
            newLeft = leftFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        }
        // Case 3: Both hands have fingers, redistribute
        else if (leftFingers > 0 && rightFingers > 0) {
            // Redistribute to make them more balanced
            const total = leftFingers + rightFingers;
            newLeft = Math.floor(total / 2);
            newRight = total - newLeft;
            
            // Only count as split if distribution changed
            if (newLeft !== leftFingers) {
                splitPerformed = true;
            }
        }
        // Case 4: One hand has all fingers, other is empty
        else if ((leftFingers > 0 && rightFingers === 0) || (rightFingers > 0 && leftFingers === 0)) {
            const total = leftFingers + rightFingers;
            newLeft = Math.floor(total / 2);
            newRight = total - newLeft;
            splitPerformed = true;
        }
        
        if (splitPerformed) {
            // Create a visual effect for the split action
            this.createSplitEffect();
            
            // Apply the split
            this.gameState.opponent.left = newLeft;
            this.gameState.opponent.right = newRight;
            
            this.addLog(`Player 2 split: ${leftFingers}-${rightFingers} → ${newLeft}-${newRight}`, 'opponent-move');
            
            // Show recover hand effect if a hand was recovered
            if (willRecoverHand) {
                this.createRecoverHandEffect('opponent');
            }
            
            this.gameState.moveCount++;
            this.updateDisplay();
            this.animateFingerChange('opponent', 'left');
            this.animateFingerChange('opponent', 'right');

            // Switch turns
            this.gameState.currentTurn = 'player';
            this.updateGameStatus();
            this.updateSplitButton();
        }
    }

    computerTurn() {
        if (this.gameState.gameOver || this.gameState.gameMode !== 'computer') return;

        const moves = this.getValidMoves('opponent');
        
        if (moves.length === 0) {
            this.gameState.currentTurn = 'player';
            this.updateGameStatus();
            return;
        }

        // AI Strategy: Prioritize killing moves, then split if needed, then regular attacks
        const killingMoves = moves.filter(move => {
            if (move.type === 'attack') {
                const attackerFingers = this.gameState.opponent[move.attackerHand];
                const targetFingers = this.gameState.player[move.targetHand];
                let newFingers = (attackerFingers + targetFingers) % 5;
                if (newFingers === 0) newFingers = 5;
                return newFingers === 5;
            }
            return false;
        });

        const attackMoves = moves.filter(move => move.type === 'attack');
        const splitMoves = moves.filter(move => move.type === 'split');
        
        // Check if computer needs to split (has a dead hand or uneven distribution)
        const needsSplit = this.computerNeedsSplit();

        let selectedMove;
        if (killingMoves.length > 0) {
            // Prioritize killing moves
            selectedMove = killingMoves[Math.floor(Math.random() * killingMoves.length)];
        } else if (needsSplit && splitMoves.length > 0) {
            // Use split when needed
            selectedMove = splitMoves[0];
        } else if (attackMoves.length > 0) {
            // Regular attack moves
            selectedMove = attackMoves[Math.floor(Math.random() * attackMoves.length)];
        } else if (splitMoves.length > 0) {
            // Fall back to split if no attacks available
            selectedMove = splitMoves[0];
        } else {
            // Shouldn't reach here, but just in case
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
        }

        if (selectedMove.type === 'attack') {
            this.performAttack('opponent', selectedMove.attackerHand, 'player', selectedMove.targetHand);
        } else if (selectedMove.type === 'split') {
            this.performComputerSplit();
        }
    }
    
    computerNeedsSplit() {
        const leftFingers = this.gameState.opponent.left;
        const rightFingers = this.gameState.opponent.right;
        
        // Special case: Disable split when one hand is dead and the other has exactly 1 finger
        if ((leftFingers === 5 && rightFingers === 1) || (rightFingers === 5 && leftFingers === 1)) {
            return false;
        }
        
        // For other cases, check if computer has more than 1 finger total
        if (leftFingers + rightFingers <= 1) return false;
        
        // Computer should split if:
        // 1. One hand has all the fingers and the other is empty
        // 2. Fingers are distributed very unevenly
        if ((leftFingers > 0 && rightFingers === 0) || (rightFingers > 0 && leftFingers === 0)) return true;
        
        // Check for uneven distribution (difference of 2 or more)
        if (Math.abs(leftFingers - rightFingers) >= 2) return true;
        
        return false;
    }

    getValidMoves(player) {
        const moves = [];
        const opponent = player === 'player' ? 'opponent' : 'player';

        // Attack moves
        ['left', 'right'].forEach(attackerHand => {
            if (this.gameState[player][attackerHand] > 0 && this.gameState[player][attackerHand] < 5) {
                ['left', 'right'].forEach(targetHand => {
                    if (this.gameState[opponent][targetHand] > 0 && this.gameState[opponent][targetHand] < 5) {
                        moves.push({
                            type: 'attack',
                            attackerHand,
                            targetHand
                        });
                    }
                });
            }
        });

        // Split moves - can split when there's more than one finger total
        const leftFingers = this.gameState[player].left;
        const rightFingers = this.gameState[player].right;
        
        // Disable split when one hand is dead and the other has exactly 1 finger
        const deadHandWithOneFinger = (leftFingers === 5 && rightFingers === 1) || 
                                     (rightFingers === 5 && leftFingers === 1);
        
        // Allow split if there's more than one finger total and not in the special case
        if ((leftFingers + rightFingers > 1) && !deadHandWithOneFinger) {
            moves.push({
                type: 'split'
            });
        }

        return moves;
    }

    performComputerSplit() {
        const leftFingers = this.gameState.opponent.left;
        const rightFingers = this.gameState.opponent.right;
        
        const totalFingers = leftFingers + rightFingers;
        if (totalFingers === 0) return false;
        
        let newLeft, newRight;
        let splitPerformed = false;
        let handRecovered = false;
        
        // Check if this split will recover a dead hand
        const willRecoverHand = (leftFingers === 5 && rightFingers > 0) || (rightFingers === 5 && leftFingers > 0);
        
        // Computer strategy for splitting
        if (leftFingers === 5 && rightFingers > 0) {
            // Revive dead left hand
            newLeft = 1;
            newRight = rightFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        } else if (rightFingers === 5 && leftFingers > 0) {
            // Revive dead right hand
            newRight = 1;
            newLeft = leftFingers - 1;
            splitPerformed = true;
            handRecovered = true;
        } else if ((leftFingers > 0 && rightFingers === 0) || (rightFingers > 0 && leftFingers === 0)) {
            // One hand has all fingers, other is empty
            newLeft = Math.floor(totalFingers / 2);
            newRight = totalFingers - newLeft;
            splitPerformed = true;
        } else if (leftFingers > 0 && rightFingers > 0) {
            // Both hands have fingers, redistribute to make them more balanced
            newLeft = Math.floor(totalFingers / 2);
            newRight = totalFingers - newLeft;
            
            // Only count as split if distribution changed
            if (newLeft !== leftFingers) {
                splitPerformed = true;
            }
        }

        if (splitPerformed) {
            // Create a visual effect for the split action
            this.createSplitEffect();
            
            // Apply the split
            this.gameState.opponent.left = newLeft;
            this.gameState.opponent.right = newRight;
            
            this.addLog(`Computer split: ${leftFingers}-${rightFingers} → ${newLeft}-${newRight}`, 'opponent-move');
            
            // Show recover hand effect if a hand was recovered
            if (willRecoverHand) {
                this.createRecoverHandEffect('opponent');
            }
            
            this.gameState.moveCount++;
            this.updateDisplay();
            this.animateFingerChange('opponent', 'left');
            this.animateFingerChange('opponent', 'right');

            // Switch turns
            this.gameState.currentTurn = 'player';
            this.updateGameStatus();
            this.updateSplitButton();
            return true;
        }
        
        return false;
    }
    
    createSplitEffect() {
        const effectsContainer = document.getElementById('game-effects');
        const effect = document.createElement('div');
        effect.className = 'attack-effect';
        effect.innerHTML = '<i class="fas fa-cut"></i>';
        effectsContainer.appendChild(effect);
        
        // Play split sound
        if (this.soundManager) {
            this.soundManager.play('split');
        }
        
        setTimeout(() => {
            effectsContainer.removeChild(effect);
        }, 800);
    }
    
    createRecoverHandEffect(player) {
        // Find the dead hand that was recovered
        const handSide = player === 'player' ? 
            (this.gameState.player.left === 1 && this.gameState.player.right !== 1 ? 'left' : 'right') :
            (this.gameState.opponent.left === 1 && this.gameState.opponent.right !== 1 ? 'left' : 'right');
        
        const handElement = document.getElementById(`${player === 'player' ? 'player' : 'opponent'}-${handSide}`);
        
        // Play recover sound
        if (this.soundManager) {
            this.soundManager.play('recover');
        }
        
        // Create effect overlay
        const effectOverlay = document.createElement('div');
        effectOverlay.className = 'effect-overlay';
        
        // Create effect image
        const effectImg = document.createElement('img');
        effectImg.src = './effects/recover hand.gif';
        effectImg.style.width = '100%';
        effectImg.style.height = '100%';
        effectImg.style.objectFit = 'cover';
        effectImg.style.opacity = '0.8';
        effectImg.style.mixBlendMode = 'screen';
        
        // Add image to overlay and overlay to hand
        effectOverlay.appendChild(effectImg);
        handElement.appendChild(effectOverlay);
        
        // Remove the effect after animation completes
        setTimeout(() => {
            if (handElement.contains(effectOverlay)) {
                handElement.removeChild(effectOverlay);
            }
        }, 1500);
    }

    checkGameOver() {
        const playerDead = this.gameState.player.left === 5 && this.gameState.player.right === 5;
        const opponentDead = this.gameState.opponent.left === 5 && this.gameState.opponent.right === 5;

        if (playerDead) {
            this.gameState.winner = 'opponent';
            return true;
        } else if (opponentDead) {
            this.gameState.winner = 'player';
            return true;
        }

        return false;
    }

    endGame() {
        this.gameState.gameOver = true;
        this.stats.gamesPlayed++;
        
        if (this.gameState.winner === 'player') {
            this.stats.playerWins++;
            document.querySelector('.player1-section').classList.add('winner');
            this.updateGameStatus('🎉 Player 1 Wins! 🎉');
            this.addLog('🎉 Player 1 is victorious! 🎉', 'game-event');
            
            // Set result in localStorage and redirect to result page
            localStorage.setItem('gameResult', 'win');
            
            // Play winner sound
            if (this.soundManager) {
                console.log('Playing winner sound...');
                
                // Create a direct audio element for more reliable playback
                const winnerSound = new Audio('./sounds/winner.mp3');
                winnerSound.volume = 1.0;
                
                const playPromise = winnerSound.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => console.log('Winner sound started playing'))
                        .catch(err => console.error('Error playing winner sound:', err));
                }
                
                setTimeout(() => {
                    window.location.href = 'game-result.html';
                }, 2000);
            } else {
                setTimeout(() => {
                    window.location.href = 'game-result.html';
                }, 1500);
            }
        } else {
            this.stats.playerLosses++;
            document.querySelector('.opponent-section').classList.add('winner');
            const opponentName = this.gameState.gameMode === 'computer' ? 'Computer' : 'Player 2';
            this.updateGameStatus(`🏆 ${opponentName} Wins! 🏆`);
            this.addLog(`🏆 ${opponentName} is victorious! 🏆`, 'game-event');
            
            // Set result in localStorage and redirect to result page
            localStorage.setItem('gameResult', 'lose');
            
            // Play game over sound
            if (this.soundManager) {
                console.log('Playing game over sound...');
                
                // Create a direct audio element for more reliable playback
                const gameOverSound = new Audio('./sounds/game over.mp3');
                gameOverSound.volume = 1.0;
                
                const playPromise = gameOverSound.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => console.log('Game over sound started playing'))
                        .catch(err => console.error('Error playing game over sound:', err));
                }
                
                setTimeout(() => {
                    window.location.href = 'game-result.html';
                }, 2000);
            } else {
                setTimeout(() => {
                    window.location.href = 'game-result.html';
                }, 1500);
            }
        }

        this.saveStats();
        this.updateStats();

        // Disable interactions
        document.querySelectorAll('.hand').forEach(hand => {
            hand.style.pointerEvents = 'none';
        });
        document.getElementById('split-btn').disabled = true;
    }

    // UI Updates
    updateDisplay() {
        // Update player hands
        this.updateHandDisplay('player', 'left');
        this.updateHandDisplay('player', 'right');
        
        // Update opponent hands
        this.updateHandDisplay('opponent', 'left');
        this.updateHandDisplay('opponent', 'right');

        // Update turn indicator
        const turnElement = document.getElementById('current-turn');
        if (this.gameState.gameOver) {
            turnElement.textContent = 'Game Over';
        } else {
            if (this.gameState.gameMode === 'computer') {
                turnElement.textContent = this.gameState.currentTurn === 'player' ? 'Your Turn' : 'Computer\'s Turn';
            } else {
                turnElement.textContent = this.gameState.currentTurn === 'player' ? 'Player 1\'s Turn' : 'Player 2\'s Turn';
            }
        }
    }

    updateHandDisplay(player, hand) {
        const fingers = this.gameState[player][hand];
        const fingersElement = document.getElementById(`${player === 'opponent' ? 'opponent' : 'player'}-${hand}-fingers`);
        const countElement = fingersElement.parentElement.querySelector('.finger-count');
        const handElement = document.getElementById(`${player === 'opponent' ? 'opponent' : 'player'}-${hand}`);

        // Remove any existing effect overlay
        const existingOverlay = handElement.querySelector('.effect-overlay');
        if (existingOverlay) {
            handElement.removeChild(existingOverlay);
        }

        // Clear existing fingers
        fingersElement.innerHTML = '';
        
        if (fingers === 5) {
            // Don't show any fingers for dead hand
            fingersElement.innerHTML = '';
            
            // Only play sound if the hand wasn't already dead
            if (!handElement.classList.contains('dead') && this.soundManager) {
                this.soundManager.play('dead');
            }
            
            handElement.classList.add('dead');
            
            // Create effect overlay
            const effectOverlay = document.createElement('div');
            effectOverlay.className = 'effect-overlay';
            
            // Create effect image with proper path
            const effectImg = document.createElement('img');
            
            // Use dead hand effect for both players when hand is dead
            effectImg.src = './effects/dead hand.gif';
            
            effectImg.style.width = '100%';
            effectImg.style.height = '100%';
            effectImg.style.objectFit = 'cover';
            effectImg.style.opacity = '0.8';
            effectImg.style.mixBlendMode = 'screen';
            
            // Add image to overlay and overlay to hand
            effectOverlay.appendChild(effectImg);
            handElement.appendChild(effectOverlay);
            
            // Force image to load by setting onload handler
            effectImg.onload = () => console.log(`${player} effect loaded successfully`);
            effectImg.onerror = () => console.error(`Failed to load ${player} effect image`);
        } else if (fingers === 0) {
            // No fingers
            handElement.classList.remove('dead');
        } else {
            // Add finger elements based on count
            for (let i = 0; i < fingers; i++) {
                const fingerElement = document.createElement('div');
                fingerElement.className = 'finger';
                fingerElement.textContent = this.fingerEmoji;
                fingersElement.appendChild(fingerElement);
            }
            
            handElement.classList.remove('dead');
        }

        // Update count
        countElement.innerHTML = fingers === 5 ? '<i class="fas fa-skull"></i>' : fingers;
    }

    updateSplitButton() {
        const splitBtn1 = document.getElementById('split-btn');
        const splitBtn2 = document.getElementById('split-btn-p2');
        
        if (this.gameState.gameOver) {
            splitBtn1.disabled = true;
            if (splitBtn2) splitBtn2.disabled = true;
            return;
        }

        // Player 1 split button - enable only when player has more than one finger total
        if (this.gameState.currentTurn === 'player') {
            const leftFingers = this.gameState.player.left;
            const rightFingers = this.gameState.player.right;
            
            // Disable split when one hand is dead and the other has exactly 1 finger
            const deadHandWithOneFinger = (leftFingers === 5 && rightFingers === 1) || 
                                         (rightFingers === 5 && leftFingers === 1);
            
            // Can split if there's more than one finger total and not in the special case
            const canSplit = (leftFingers + rightFingers > 1) && !deadHandWithOneFinger;
            
            // Check if split would actually change anything
            const total = leftFingers + rightFingers;
            const newLeft = Math.floor(total / 2);
            const newRight = total - newLeft;
            const wouldChange = (leftFingers !== newLeft || rightFingers !== newRight) || 
                               (leftFingers === 5 || rightFingers === 5); // Always allow split if one hand is dead
            
            splitBtn1.disabled = !(canSplit && wouldChange);
            
            // Update button appearance based on whether split is possible
            if (!splitBtn1.disabled) {
                splitBtn1.classList.add('active-split');
            } else {
                splitBtn1.classList.remove('active-split');
            }
        } else {
            splitBtn1.disabled = true;
            splitBtn1.classList.remove('active-split');
        }

        // Player 2 split button (only in friend mode)
        if (splitBtn2) {
            // First ensure proper visibility based on game mode
            splitBtn2.style.display = this.gameState.gameMode === 'friend' ? 'inline-flex' : 'none';
            
            if (this.gameState.gameMode === 'friend') {
                if (this.gameState.currentTurn === 'opponent') {
                    const leftFingers = this.gameState.opponent.left;
                    const rightFingers = this.gameState.opponent.right;
                    
                    // Disable split when one hand is dead and the other has exactly 1 finger
                    const deadHandWithOneFinger = (leftFingers === 5 && rightFingers === 1) || 
                                                (rightFingers === 5 && leftFingers === 1);
                    
                    // Can split if there's more than one finger total and not in the special case
                    const canSplit = (leftFingers + rightFingers > 1) && !deadHandWithOneFinger;
                    
                    // Check if split would actually change anything
                    const total = leftFingers + rightFingers;
                    const newLeft = Math.floor(total / 2);
                    const newRight = total - newLeft;
                    const wouldChange = (leftFingers !== newLeft || rightFingers !== newRight) || 
                                    (leftFingers === 5 || rightFingers === 5); // Always allow split if one hand is dead
                    
                    splitBtn2.disabled = !(canSplit && wouldChange);
                    
                    // Update button appearance based on whether split is possible
                    if (!splitBtn2.disabled) {
                        splitBtn2.classList.add('active-split');
                    } else {
                        splitBtn2.classList.remove('active-split');
                    }
                } else {
                    splitBtn2.disabled = true;
                    splitBtn2.classList.remove('active-split');
                }
            }
        } else if (splitBtn2) {
            // Make sure Player 2 split button is hidden in computer mode
            splitBtn2.style.display = this.gameState.gameMode === 'friend' ? 'inline-flex' : 'none';
        }
    }

    updateGameStatus(customMessage = null) {
        const statusElement = document.getElementById('game-status');
        
        if (customMessage) {
            statusElement.textContent = customMessage;
            return;
        }

        if (this.gameState.gameOver) {
            statusElement.textContent = 'Game Over!';
        } else if (this.gameState.gameMode === 'friend') {
            // Friend mode instructions
            if (this.gameState.currentTurn === 'player') {
                if (this.gameState.selectedHand) {
                    statusElement.textContent = 'Player 1: Tap Player 2\'s hand to attack!';
                } else {
                    statusElement.textContent = 'Player 1: Select your hand, then attack or split';
                }
            } else {
                if (this.gameState.selectedHand) {
                    statusElement.textContent = 'Player 2: Tap Player 1\'s hand to attack!';
                } else {
                    statusElement.textContent = 'Player 2: Select your hand, then attack or split';
                }
            }
        } else {
            // Computer mode instructions
            if (this.gameState.currentTurn === 'player') {
                if (this.gameState.selectedHand) {
                    statusElement.textContent = 'Now tap computer\'s hand to attack!';
                } else {
                    statusElement.textContent = 'Select your hand, then tap computer\'s hand or split';
                }
            } else {
                statusElement.textContent = 'Computer is thinking...';
            }
        }
    }

    // Visual Effects
    createAttackEffect() {
        const effectsContainer = document.getElementById('game-effects');
        const effect = document.createElement('div');
        effect.className = 'attack-effect';
        effect.innerHTML = '<i class="fas fa-bolt"></i>';
        effectsContainer.appendChild(effect);
        
        // Play attack sound
        if (this.soundManager) {
            this.soundManager.play('attack');
        }
        
        setTimeout(() => {
            effectsContainer.removeChild(effect);
        }, 800);
    }
    
    // Preload effect images to ensure they're available when needed
    preloadEffects() {
        const deadHandImg = new Image();
        deadHandImg.src = './effects/dead hand.gif';
        
        const recoverHandImg = new Image();
        recoverHandImg.src = './effects/recover hand.gif';
        
        console.log('Preloading effect images');
    }

    animateFingerChange(player, hand) {
        const element = document.getElementById(`${player === 'opponent' ? 'opponent' : 'player'}-${hand}-fingers`);
        element.classList.add('finger-change');
        setTimeout(() => element.classList.remove('finger-change'), 600);
    }

    // Utility Functions
    toggleInstructions() {
        const content = document.querySelector('.instructions-content');
        const toggle = document.getElementById('instructions-toggle');
        
        content.classList.toggle('show');
        const icon = toggle.querySelector('i');
        icon.className = content.classList.contains('show') ? 'fas fa-chevron-up' : 'fas fa-question-circle';
    }

    handleKeyboard(e) {
        if (e.key === 'Escape') {
            this.closeSidebar();
        } else if (e.key === 'r' || e.key === 'R') {
            this.resetGame();
        } else if (e.key === 's' || e.key === 'S') {
            if (!document.getElementById('split-btn').disabled) {
                this.handleSplit();
            }
        } else if (e.key === 'h' || e.key === 'H') {
            this.toggleSidebar();
        }
    }

    resetGame() {
        this.gameState = {
            player: { left: 1, right: 1 },
            opponent: { left: 1, right: 1 },
            currentTurn: 'player',
            selectedHand: null,
            gameOver: false,
            winner: null,
            gameMode: this.gameState.gameMode,
            moveCount: 0
        };
        
        // Play start sound
        if (this.soundManager) {
            this.soundManager.play('start');
        }

        // Reset UI
        document.querySelectorAll('.hand').forEach(hand => {
            hand.classList.remove('selected', 'dead');
            hand.style.pointerEvents = 'auto';
            
            // Remove effect overlays
            const overlay = hand.querySelector('.effect-overlay');
            if (overlay) {
                hand.removeChild(overlay);
            }
        });
        
        document.querySelectorAll('.player-section').forEach(section => {
            section.classList.remove('winner');
        });

        this.updateDisplay();
        this.updateSplitButton();
        this.updateGameStatus();
        this.addLog('New game started! 🎮', 'game-event');
    }
}

// Sound management
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    }

    loadSounds() {
        // Define sounds to load
        const soundFiles = {
            click: 'sounds/click.mp3',
            start: 'sounds/start.mp3',
            attack: 'sounds/attack.mp3',
            split: 'sounds/split.mp3',
            win: 'sounds/winner.mp3',
            lose: 'sounds/game over.mp3',
            button: 'sounds/button.wav',
            touch: 'sounds/touch.wav',
            dead: 'sounds/dead.wav',
            recover: 'sounds/recover.wav',
            hand: 'sounds/hand.wav'
        };

        // Load each sound
        for (const [name, path] of Object.entries(soundFiles)) {
            this.loadSound(name, path);
        }
    }

    loadSound(name, path) {
        try {
            const audio = new Audio(path);
            
            // Add event listeners for debugging
            audio.addEventListener('canplaythrough', () => {
                console.log(`Sound loaded successfully: ${name}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Error loading sound: ${name}`, e);
            });
            
            // Preload the audio
            audio.load();
            
            this.sounds[name] = audio;
        } catch (error) {
            console.error(`Failed to load sound: ${name}`, error);
        }
    }

    play(name) {
        if (!this.enabled || !this.sounds[name]) {
            console.error(`Sound not available or disabled: ${name}`);
            return;
        }
        
        try {
            // Stop and reset the sound if it's already playing
            const sound = this.sounds[name];
            sound.currentTime = 0;
            
            // Log before playing
            console.log(`Playing sound: ${name}`);
            
            // Play the sound with proper error handling
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Error playing sound: ${name}`, error);
                });
            }
        } catch (error) {
            console.error(`Error playing sound: ${name}`, error);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sound manager
    const soundManager = new SoundManager();
    soundManager.loadSounds();
    
    // Initialize game with the selected mode from localStorage
    const gameMode = localStorage.getItem('gameMode') || 'computer';
    const game = new ChopsticksGamePro(soundManager);
    game.switchGameMode(gameMode);
    
    // Add sound toggle button to the header
    const headerRight = document.querySelector('.header-right');
    const soundToggleBtn = document.createElement('button');
    soundToggleBtn.className = 'sound-toggle';
    soundToggleBtn.innerHTML = `<i class="fas ${soundManager.isEnabled() ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
    
    soundToggleBtn.addEventListener('click', () => {
        const enabled = soundManager.toggle();
        soundToggleBtn.innerHTML = `<i class="fas ${enabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
        // Don't play sound when toggling sound
    });
    
    headerRight.insertBefore(soundToggleBtn, headerRight.firstChild);
    
    // Add touch sound for general page touches
    document.addEventListener('touchstart', (e) => {
        // Only play touch sound if the target is not a button or interactive element
        if (!e.target.closest('button') && 
            !e.target.closest('a') && 
            !e.target.closest('.hand') && 
            !e.target.closest('.player-hand') && 
            !e.target.closest('.opponent-hand') &&
            soundManager.isEnabled()) {
            soundManager.play('touch');
        }
    });
    
    // Add button sound for all buttons except sound toggle
    document.querySelectorAll('button:not(.sound-toggle):not(#home-sound-toggle)').forEach(button => {
        button.addEventListener('click', () => {
            if (soundManager.isEnabled()) {
                soundManager.play('button');
            }
        });
    });
    
    // Add button sound for links that act as buttons
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (soundManager.isEnabled()) {
                soundManager.play('button');
            }
        });
    });
});
