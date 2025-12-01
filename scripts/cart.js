document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

const loadCart = () => {
    const container = document.querySelector(".cart-items");
    const summaryContainer = document.querySelector(".cart-summary");
    
    // Get cart from LocalStorage
    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<div class='empty-state'><p>Your cart is empty.</p><a href='tools.html' class='btn-primary-sm mt-3'>Browse Tools</a></div>";
        summaryContainer.style.display = "none"; // Hide summary if empty
        return;
    }

    summaryContainer.style.display = "block";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.days;
        subtotal += itemTotal;

        const html = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.toolImage}" alt="${item.toolName}" onerror="this.src='./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg'">
                </div>
                <div class="cart-item-details">
                    <p class="cart-item-category">${item.category}</p>
                    <h3 class="cart-item-title"><a href="#">${item.toolName}</a></h3>
                    <div class="cart-item-price">$${item.price} / day</div>
                </div>
                <div class="cart-item-controls">
                    <div class="date-picker-group">
                        <label>Duration</label>
                        <div class="rental-days-input">
                            <button class="qty-btn minus" onclick="updateDays(${index}, -1)">-</button>
                            <input type="number" value="${item.days}" min="1" readonly>
                            <button class="qty-btn plus" onclick="updateDays(${index}, 1)">+</button>
                        </div>
                        <span class="days-label">Days</span>
                    </div>
                    <div class="item-total-price">
                        $${itemTotal.toFixed(2)}
                    </div>
                    <button class="btn-remove" onclick="removeItem(${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });

    renderSummary(subtotal);
};

const updateDays = (index, change) => {
    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];
    
    let newDays = cart[index].days + change;
    if (newDays < 1) newDays = 1;
    
    cart[index].days = newDays;
    localStorage.setItem("toolLinkCart", JSON.stringify(cart));
    loadCart(); // Re-render
    updateCartBadge(); // Update navbar badge from script.js helper
};

const removeItem = (index) => {
    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("toolLinkCart", JSON.stringify(cart));
    loadCart();
    updateCartBadge();
};

const renderSummary = (subtotal) => {
    const serviceFee = subtotal * 0.05;
    const insurance = 5.00;
    const total = subtotal + serviceFee + insurance;

    document.querySelector(".summary-row:nth-child(2) span:last-child").innerText = `$${subtotal.toFixed(2)}`;
    document.querySelector(".summary-row:nth-child(3) span:last-child").innerText = `$${serviceFee.toFixed(2)}`;
    document.querySelector(".total-row span:last-child").innerText = `$${total.toFixed(2)}`;
};

// Make badge update global if needed, or just rely on page refresh
const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];
    const badge = document.querySelector('a[href="cart.html"] .badge');
    if (badge) badge.innerText = cart.length;
};

// Checkout logic (Mockup)
document.querySelector(".btn-checkout").addEventListener("click", () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        alert("Please login to checkout.");
        window.location.href = "login.html";
        return;
    }
    
    // Here you would loop through cart items and call the /rentTool API for each
    // For simplicity in this project:
    alert("Checkout functionality would loop through items and create rentals. \n\nFor this demo, please use 'Rent Now' on individual items.");
});