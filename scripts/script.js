/* ... Global Variables ... */
let userWishlistIds = [];
let currentToolIdForRent = null;

/* Section: Wishlist Logic */
// CHANGE THIS LINE:
window.fetchWishlistIds = async () => { 
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

window.toggleWishlist = async (toolId, btn) => {
    const user = window.checkLogin();
    if (!user) return;

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
                if(card) card.remove();
                if(document.querySelector('.listings-grid').children.length === 0) {
                    document.querySelector('.listings-grid').innerHTML = "<p>Your wishlist is empty.</p>";
                }
            }
            userWishlistIds = userWishlistIds.filter(id => id !== toolId);
        } else {
            await fetch("http://localhost:5000/addToWishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.userId, toolId })
            });
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            btn.classList.add('active');
            userWishlistIds.push(toolId);
        }
        if(window.updateNavbarBadges) window.updateNavbarBadges();
    } catch (error) {
        console.error("Wishlist error:", error);
    }
};

/* Section: Cart Logic */
window.addToCart = (toolId, name, price, image, category) => {
    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];
    const existingItem = cart.find(item => item.toolId === toolId);

    if (existingItem) {
        window.showModal("Cart", "This item is already in your cart!");
        return;
    }

    cart.push({
        toolId,
        toolName: decodeURIComponent(name),
        price,
        toolImage: decodeURIComponent(image),
        category: decodeURIComponent(category),
        days: 1
    });

    localStorage.setItem("toolLinkCart", JSON.stringify(cart));
    window.showModal("Added", "Item added to cart!"); 
    if(window.updateNavbarBadges) window.updateNavbarBadges();
};

/* Section: Rent Now Logic */
window.rentTool = (toolId) => {
    const user = window.checkLogin();
    if (!user) return;

    currentToolIdForRent = toolId;
    document.getElementById("rent-modal").classList.add("active");
    document.getElementById("rent-days-input").focus();
};

window.closeRentModal = () => {
    document.getElementById("rent-modal").classList.remove("active");
    currentToolIdForRent = null;
};

window.handleConfirmRent = async (btn) => {
    const daysInput = document.getElementById("rent-days-input");
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const days = daysInput.value;

    if (btn.disabled) return; 

    if (!days || days < 1) {
        window.showModal("Error", "Please enter a valid duration.");
        return;
    }

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.style.opacity = "0.7";

    try {
        const response = await fetch("http://localhost:5000/rentTool", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                toolId: currentToolIdForRent, 
                renterId: user.userId, 
                days: days 
            })
        });

        const data = await response.json();

        if (response.ok) {
            window.closeRentModal();
            window.showModal("Success", "Tool rented successfully!", () => {
                window.location.href = "my-orders.html";
            });
        } else {
            window.showModal("Error", data.message || "Failed to rent tool.");
            resetRentButton(btn, originalText);
        }
    } catch (error) {
        console.error("Rent error:", error);
        window.showModal("Error", "Server connection failed.");
        resetRentButton(btn, originalText);
    }
};

const resetRentButton = (btn, originalText) => {
    if(!btn) return;
    btn.disabled = false;
    btn.innerText = originalText || "Confirm & Pay";
    btn.style.opacity = "1";
};

/* Section: Card Generator */
window.createToolCard = (tool) => {
    const userString = localStorage.getItem("loggedInUser");
    const currentUser = userString ? JSON.parse(userString) : null;
    
    // 1. Check ownership
    const isOwner = currentUser && tool.ownerId === currentUser.userId;

    // FIX: Changed tool.userImage to tool.ownerImage to match the backend alias
    const ownerName = tool.ownerName || "ToolLink User";
    const ownerImage = tool.ownerImage || "./assets/user-placeholder-image.jpg";
    const ownerNickname = ownerName.split(' ')[0];
    
    const isWishlisted = userWishlistIds.includes(tool.toolId);
    const heartIconClass = isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const btnActiveClass = isWishlisted ? "active" : "";
    
    const safeName = encodeURIComponent(tool.toolName);
    const safeImage = encodeURIComponent(tool.toolImage);
    const safeCat = encodeURIComponent(tool.category);

    let statusBadge = "";
    let actionButtonsHTML = "";

    // 2. Logic for Action Buttons (Add to Cart / Rent)
    if (tool.status === 'available') {
        if (isOwner) {
            statusBadge = `<div style="position:absolute; top:10px; left:10px; background:#222; color:white; padding:2px 8px; font-size:12px; border-radius:4px; text-transform:uppercase; z-index: 10;">Your Listing</div>`;
            actionButtonsHTML = `<div class="listing-actions" style="transform: translateY(0); background: transparent; justify-content: center; padding-bottom: 15px;"><span style="font-size: 13px; font-weight: 600; color: #555;">You own this tool</span></div>`;
        } else {
            actionButtonsHTML = `
                <div class="listing-actions">
                    <button class="btn-cart-action" onclick="addToCart(${tool.toolId}, '${safeName}', ${tool.price}, '${safeImage}', '${safeCat}')">
                        <span>Add to Cart</span>
                    </button>
                    <button class="btn-rent" onclick="rentTool(${tool.toolId})">
                        <span>Rent Now</span>
                    </button>
                </div>
            `;
        }
    } else {
        let badgeColor = "#d63031"; 
        if(tool.status === 'maintenance') badgeColor = "#e67e22"; 
        statusBadge = `<div style="position:absolute; top:10px; left:10px; background:${badgeColor}; color:white; padding:2px 8px; font-size:12px; border-radius:4px; text-transform:uppercase; z-index: 10;">${tool.status}</div>`;
    }

    // 3. Logic to ONLY show heart button if NOT owner
    // We use a ternary operator: if (isOwner) show nothing, else show button
    const wishlistBtn = isOwner ? '' : `
        <button class="wishlist-btn ${btnActiveClass}" onclick="toggleWishlist(${tool.toolId}, this)">
            <i class="${heartIconClass}"></i>
        </button>
    `;

    // NEW: Owner Info HTML Block
    const ownerInfoHTML = `
        <div class="listing-owner-info">
            <img src="${ownerImage}" alt="${ownerName}" class="owner-avatar" onerror="this.src='./assets/user-placeholder-image.jpg'">
            <span class="owner-name">From: ${ownerNickname}</span>
        </div>
    `;

    return `
        <div class="listing-card" id="card-${tool.toolId}">
            <div class="listing-image">
                ${statusBadge}
                <img src="${tool.toolImage}" alt="${tool.toolName}" onerror="this.src='./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg'">
                
                ${wishlistBtn} ${actionButtonsHTML}
            </div>
            <div class="listing-info">
                <p class="listing-category">${tool.category}</p>
                <h3 class="listing-title"><a href="tools.html?search=${safeName}">${tool.toolName}</a></h3>
                ${ownerInfoHTML}
                <div class="listing-price">$${tool.price} / day</div>
            </div>
        </div>
    `;
};

/* Section: Homepage Logic */
window.fetchHomeTools = async () => {
    const container = document.querySelector(".listings-grid");
    if (!container) return;
    await fetchWishlistIds();
    try {
        const response = await fetch("http://localhost:5000/getTools");
        const tools = await response.json();
        container.innerHTML = "";
        tools.slice(0, 4).forEach(tool => container.innerHTML += window.createToolCard(tool));
    } catch (error) { console.error("Error loading home tools:", error); }
};

/* Section: Initialize */
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector(".recent-listings-section")) window.fetchHomeTools();
    if(window.updateNavbarBadges) window.updateNavbarBadges();
});