document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('action') === 'list-tool') {
        const section = document.querySelector('.list-tool-section');
        if (section) {
            // Small delay to ensure CSS is ready for transition
            setTimeout(() => {
                section.classList.add('open');
            }, 100);
        }
    }
    
    // Existing load logic...
    if (typeof fetchTools === 'function') {
        fetchTools();
    }
});