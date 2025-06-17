// Sound control for all pages
document.addEventListener('DOMContentLoaded', () => {
    // Create audio elements
    const buttonSound = new Audio('./sounds/button.wav');
    const touchSound = new Audio('./sounds/touch.wav');
    
    // Function to check if sound is enabled (real-time check)
    function isSoundEnabled() {
        return localStorage.getItem('soundEnabled') !== 'false';
    }
    
    // Add touch sound for general page touches
    document.addEventListener('touchstart', (e) => {
        // Only play touch sound if the target is not a button or interactive element
        if (!e.target.closest('button') && 
            !e.target.closest('a') && 
            !e.target.closest('.hand') && 
            !e.target.closest('.player-hand') && 
            !e.target.closest('.opponent-hand') &&
            isSoundEnabled()) {
            touchSound.currentTime = 0;
            touchSound.play().catch(err => console.error('Error playing touch sound:', err));
        }
    });
    
    // Add click sound for general page clicks (desktop)
    document.addEventListener('click', (e) => {
        // Only play touch sound if the target is not a button or interactive element
        if (!e.target.closest('button') && 
            !e.target.closest('a') && 
            !e.target.closest('.hand') && 
            !e.target.closest('.player-hand') && 
            !e.target.closest('.opponent-hand') &&
            isSoundEnabled()) {
            touchSound.currentTime = 0;
            touchSound.play().catch(err => console.error('Error playing touch sound:', err));
        }
    });
    
    // Add button sound for all buttons (except navigation buttons on index page and sound toggle buttons)
    document.querySelectorAll('button:not(#start-game):not(#vs-computer-mode):not(#vs-friend-mode):not(#back-to-home):not(#home-sound-toggle):not(.sound-toggle)').forEach(button => {
        button.addEventListener('click', () => {
            if (isSoundEnabled()) {
                buttonSound.currentTime = 0;
                buttonSound.play().catch(err => console.error('Error playing button sound:', err));
            }
        });
    });
    
    // Add button sound for links that act as buttons
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Skip if it's a navigation link (handled by index-script.js)
            if (link.classList.contains('home-link')) return;
            
            if (isSoundEnabled()) {
                // For navigation links, play sound and then navigate after a delay
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    e.preventDefault();
                    buttonSound.currentTime = 0;
                    buttonSound.play().catch(err => console.error('Error playing button sound:', err));
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                } else {
                    // For non-navigation links, just play the sound
                    buttonSound.currentTime = 0;
                    buttonSound.play().catch(err => console.error('Error playing button sound:', err));
                }
            } else if (href && !href.startsWith('#')) {
                // If sound is disabled but it's a navigation link, navigate immediately
                window.location.href = href;
            }
        });
    });
});