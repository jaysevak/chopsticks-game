// Fix for home button sound
document.addEventListener('DOMContentLoaded', function() {
    // Get the home button link
    const homeButton = document.querySelector('.home-btn-link');
    
    if (homeButton) {
        // Create a button sound
        const buttonSound = new Audio('./sounds/button.wav');
        
        // Preload the button sound
        buttonSound.load();
        
        // Function to check if sound is enabled
        function isSoundEnabled() {
            return localStorage.getItem('soundEnabled') !== 'false';
        }
        
        // Override the default link behavior
        homeButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default navigation
            
            if (isSoundEnabled()) {
                // Reset sound to beginning
                buttonSound.currentTime = 0;
                
                // Play sound and navigate after it completes
                const playPromise = buttonSound.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Sound played successfully, navigate after a short delay
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 300);
                    }).catch(err => {
                        // Error playing sound, navigate anyway
                        console.error('Error playing button sound:', err);
                        window.location.href = 'index.html';
                    });
                } else {
                    // Browser doesn't return a promise, use timeout
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 300);
                }
            } else {
                // Sound is disabled, navigate immediately
                window.location.href = 'index.html';
            }
        });
    }
});