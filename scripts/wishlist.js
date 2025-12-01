document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userString);
    loadWishlistPage(user.userId);
});

const loadWishlistPage = async (userId) => {
    const container = document.querySelector(".wishlist-grid");
    
    try {
        // We ensure the global ID cache is populated so createToolCard works correctly
        await fetchWishlistIds(); 

        const response = await fetch(`http://localhost:5000/myWishlist/${userId}`);
        const tools = await response.json();

        container.innerHTML = "";

        if (tools.length === 0) {
            container.innerHTML = "<p>Your wishlist is empty.</p>";
            return;
        }

        tools.forEach(tool => {
            // Use shared function
            container.innerHTML += createToolCard(tool);
        });
    } catch (error) {
        console.error("Error loading wishlist:", error);
    }
};