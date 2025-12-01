// Global variable to store wishlist IDs
let userWishlistIds = [];

// --- Helper: Fetch User's Wishlist IDs ---
const fetchWishlistIds = async () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) return;
    const user = JSON.parse(userString);

    try {
        const response = await fetch(`http://localhost:5000/getWishlistIds/${user.userId}`);
        const data = await response.json();
        userWishlistIds = data.map(item => item.toolId);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
    }
};

// --- Shared: Toggle Wishlist Function ---
const toggleWishlist = async (toolId, btn) => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        alert("Please login to use the wishlist.");
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userString);
    const icon = btn.querySelector('i');
    const isLiked = icon.classList.contains('fa-solid');

    try {
        if (isLiked) {
            await fetch(`http://localhost:5000/removeFromWishlist/${user.userId}/${toolId}`, { method: "DELETE" });
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            btn.classList.remove('active');

            if (window.location.pathname.includes("wishlist.html")) {
                const card = btn.closest('.listing-card');
                if (card) card.remove();
                const grid = document.querySelector('.listings-grid');
                if (grid && grid.children.length === 0) grid.innerHTML = "<p>Your wishlist is empty.</p>";
            }
            if (typeof userWishlistIds !== 'undefined') userWishlistIds = userWishlistIds.filter(id => id !== toolId);
        } else {
            await fetch("http://localhost:5000/addToWishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, toolId })
            });
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('active');
            if (typeof userWishlistIds !== 'undefined') userWishlistIds.push(toolId);
        }
    } catch (error) {
        console.error("Wishlist toggle error:", error);
    }
};

// --- Shared: Add to Cart Function ---
const addToCart = (toolId, name, price, image, category) => {
    // 1. Get existing cart from LocalStorage
    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];

    // 2. Check if item already exists
    const existingItem = cart.find(item => item.toolId === toolId);

    if (existingItem) {
        alert("This item is already in your cart!");
        return;
    }

    // 3. Add new item
    cart.push({
        toolId,
        toolName: decodeURIComponent(name),
        price,
        toolImage: decodeURIComponent(image),
        category: decodeURIComponent(category),
        days: 1 // Default duration
    });

    // 4. Save back to LocalStorage
    localStorage.setItem("toolLinkCart", JSON.stringify(cart));

    // 5. Update Badge
    updateCartBadge();
    alert("Item added to cart!");
};

const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];
    const badge = document.querySelector('a[href="cart.html"] .badge');
    if (badge) badge.innerText = cart.length;
};

// --- NEW: Shared Card Generator Function ---
const createToolCard = (tool) => {
    // 1. Check User Identity
    const userString = localStorage.getItem("loggedInUser");
    const currentUser = userString ? JSON.parse(userString) : null;
    const isOwner = currentUser && tool.ownerId === currentUser.userId;

    // 2. Wishlist Logic
    const isWishlisted = userWishlistIds.includes(tool.toolId);
    const heartIconClass = isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const btnActiveClass = isWishlisted ? "active" : ""; 
    
    // 3. Safe string encoding for onclick arguments
    const safeName = encodeURIComponent(tool.toolName);
    const safeImage = encodeURIComponent(tool.toolImage);
    const safeCat = encodeURIComponent(tool.category);

    let statusBadge = "";
    let actionButtonsHTML = "";

    // 4. Determine Card State
    if (tool.status === 'available') {
        if (isOwner) {
            // Case A: User is the owner -> Show badge, hide rent buttons
            statusBadge = `<div style="position:absolute; top:10px; left:10px; background:#222; color:white; padding:2px 8px; font-size:12px; border-radius:4px; text-transform:uppercase; z-index: 10;">Your Listing</div>`;
            actionButtonsHTML = `<div class="listing-actions" style="transform: translateY(0); background: transparent; justify-content: center; padding-bottom: 15px;"><span style="font-size: 13px; font-weight: 600; color: #555;">You own this tool</span></div>`;
        } else {
            // Case B: Tool is available and user is NOT owner -> Show rent buttons
            actionButtonsHTML = `
                <div class="listing-actions">
                    <button class="btn-cart-action" onclick="addToCart(${tool.toolId}, '${safeName}', ${tool.price}, '${safeImage}', '${safeCat}')">Add to Cart</button>
                    <button class="btn-rent" onclick="rentTool(${tool.toolId})">Rent Now</button>
                </div>
            `;
        }
    } else {
        // Case C: Tool is rented/maintenance -> Show Status Badge
        let badgeColor = "#d63031"; // Default red
        if(tool.status === 'maintenance') badgeColor = "#e67e22"; // Orange
        
        statusBadge = `<div style="position:absolute; top:10px; left:10px; background:${badgeColor}; color:white; padding:2px 8px; font-size:12px; border-radius:4px; text-transform:uppercase; z-index: 10;">${tool.status}</div>`;
    }

    return `
        <div class="listing-card" id="card-${tool.toolId}">
            <div class="listing-image">
                ${statusBadge}
                <img src="${tool.toolImage}" alt="${tool.toolName}" onerror="this.src='./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg'">
                
                <button class="wishlist-btn ${btnActiveClass}" onclick="toggleWishlist(${tool.toolId}, this)">
                    <i class="${heartIconClass}"></i>
                </button>
                
                ${actionButtonsHTML}
            </div>
            <div class="listing-info">
                <p class="listing-category">${tool.category}</p>
                <h3 class="listing-title"><a href="tools.html?search=${safeName}">${tool.toolName}</a></h3>
                <div class="listing-price">$${tool.price} / day</div>
            </div>
        </div>
    `;
};

// ... (Keep fetchHomeTools, handleListTool, rentTool as they were) ...
// Only paste the surrounding code if you deleted it. 
// Ensure fetchHomeTools uses createToolCard inside.

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'list-tool') {
        const section = document.querySelector('.list-tool-section');
        if (section) setTimeout(() => section.classList.add('open'), 100);
    }

    // Initialize Cart Badge
    updateCartBadge();

    // Only fetch home tools if we are on the home page
    if (document.querySelector(".recent-listings-section")) {
        fetchHomeTools();
    }
});

// --- MISSING FUNCTIONS FROM PREVIOUS STEP RE-ADDED FOR SAFETY ---
/* scripts/script.js */

/* List Tool Function */

const rentTool = async (toolId) => {
    // ... (keep your existing rentTool logic) ...
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) { alert("Please login."); window.location.href = "login.html"; return; }
    const user = JSON.parse(userString);
    const days = prompt("Days?", "3");
    if (!days) return;

    // Simple fetch call...
    try {
        const response = await fetch("http://localhost:5000/rentTool", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toolId: toolId, renterId: user.userId, days: days })
        });
        if (response.ok) { alert("Success!"); window.location.href = "my-orders.html"; }
    } catch (error) { console.error(error); }
};

const fetchHomeTools = async () => {
    // ... (keep your logic, ensuring it uses createToolCard) ...
    const container = document.querySelector(".listings-grid");
    if (!container) return;
    await fetchWishlistIds();
    const response = await fetch("http://localhost:5000/getTools");
    const tools = await response.json();
    container.innerHTML = "";
    tools.slice(0, 4).forEach(tool => container.innerHTML += createToolCard(tool));
};