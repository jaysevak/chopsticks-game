// Script to prevent scrolling and ensure the game fits perfectly on screen
document.addEventListener('DOMContentLoaded', function() {
    // Prevent all scrolling on the document
    document.body.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Set viewport height for mobile browsers
    function setViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Force redraw
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }
    
    // Set initial viewport height
    setViewportHeight();
    
    // Update viewport height on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function() {
        setTimeout(setViewportHeight, 100);
    });
    
    // Fix for iOS Safari address bar
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
    });
    
    // Additional fix for mobile browsers
    function preventScrolling(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    document.addEventListener('scroll', preventScrolling, { passive: false });
    document.addEventListener('wheel', preventScrolling, { passive: false });
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});