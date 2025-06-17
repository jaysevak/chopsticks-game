// Home page navigation script
document.addEventListener('DOMContentLoaded', function() {
    // Get references to buttons
    const startGameBtn = document.getElementById('start-game');
    const showRulesBtn = document.getElementById('show-rules');
    const closeRulesBtn = document.getElementById('close-rules');
    const backToHomeBtn = document.getElementById('back-to-home');
    const vsComputerBtn = document.getElementById('vs-computer-mode');
    const vsFriendBtn = document.getElementById('vs-friend-mode');
    const homeSoundToggle = document.getElementById('home-sound-toggle');
    const homeThemeToggle = document.getElementById('home-theme-toggle');
    const rulesModal = document.getElementById('rules-modal');
    const homeScreen = document.getElementById('home-screen');
    const modeScreen = document.getElementById('mode-screen');
    
    // Sound management
    const buttonSound = new Audio('./sounds/button.wav');
    
    // Function to check if sound is enabled (real-time check)
    function isSoundEnabled() {
        return localStorage.getItem('soundEnabled') !== 'false';
    }
    
    const soundEnabled = isSoundEnabled();
    
    // Function to play sound and then navigate
    function playAndNavigate(url, delay = 300) {
        if (isSoundEnabled()) {
            buttonSound.play();
            setTimeout(() => {
                window.location.href = url;
            }, delay);
        } else {
            window.location.href = url;
        }
    }
    
    // Start Game button - show mode selection screen
    startGameBtn.addEventListener('click', function() {
        if (isSoundEnabled()) {
            buttonSound.play();
            setTimeout(() => {
                homeScreen.style.display = 'none';
                modeScreen.style.display = 'flex';
            }, 300);
        } else {
            homeScreen.style.display = 'none';
            modeScreen.style.display = 'flex';
        }
    });
    
    // Show Rules button
    showRulesBtn.addEventListener('click', function() {
        if (isSoundEnabled()) buttonSound.play();
        rulesModal.style.display = 'flex';
    });
    
    // Close Rules button
    closeRulesBtn.addEventListener('click', function() {
        if (isSoundEnabled()) buttonSound.play();
        rulesModal.style.display = 'none';
    });
    
    // Back to Home button
    backToHomeBtn.addEventListener('click', function() {
        if (isSoundEnabled()) {
            buttonSound.play();
            setTimeout(() => {
                modeScreen.style.display = 'none';
                homeScreen.style.display = 'flex';
            }, 300);
        } else {
            modeScreen.style.display = 'none';
            homeScreen.style.display = 'flex';
        }
    });
    
    // VS Computer button
    vsComputerBtn.addEventListener('click', function() {
        localStorage.setItem('gameMode', 'computer');
        playAndNavigate('game.html');
    });
    
    // VS Friend button
    vsFriendBtn.addEventListener('click', function() {
        localStorage.setItem('gameMode', 'friend');
        playAndNavigate('game.html');
    });
    
    // Sound toggle
    homeSoundToggle.addEventListener('click', function() {
        const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        localStorage.setItem('soundEnabled', !soundEnabled ? 'true' : 'false');
        
        homeSoundToggle.innerHTML = `<i class="fas ${!soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
        
        // Don't play sound when toggling to mute
    });
    
    // Theme toggle
    homeThemeToggle.addEventListener('click', function() {
        // Play sound if enabled
        if (isSoundEnabled()) buttonSound.play();
        
        // Toggle theme
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply theme to both body and html elements
        document.body.className = `${newTheme}-theme`;
        document.documentElement.className = `${newTheme}-theme`;
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        homeThemeToggle.innerHTML = `<i class="fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        
        console.log(`Theme changed to: ${newTheme}`);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log(`Loading saved theme: ${savedTheme}`);
    document.body.className = `${savedTheme}-theme`;
    homeThemeToggle.innerHTML = `<i class="fas ${savedTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
    
    // Update sound icon based on current setting
    const soundSetting = localStorage.getItem('soundEnabled') !== 'false';
    homeSoundToggle.innerHTML = `<i class="fas ${soundSetting ? 'fa-volume-up' : 'fa-volume-mute'}"></i>`;
    
    // Close rules modal when clicking outside
    rulesModal.addEventListener('click', function(e) {
        if (e.target === rulesModal) {
            rulesModal.style.display = 'none';
        }
    });
});