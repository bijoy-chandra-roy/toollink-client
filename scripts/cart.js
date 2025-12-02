document.addEventListener('DOMContentLoaded', () => {
    const user = window.checkLogin();
    if (!user) return;

    fetchMyOrders(user.userId);
});

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

const loadCart = () => {
    const container = document.querySelector(".cart-items");
    const summaryContainer = document.querySelector(".cart-summary");

    let cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<div class='empty-state'><p>Your cart is empty.</p><a href='tools.html' class='btn-primary-sm mt-3'>Browse Tools</a></div>";
        summaryContainer.style.display = "none";
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
    loadCart();
    updateCartBadge(); 
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


const updateCartBadge = () => {
    if (window.updateNavbarBadges) {
        window.updateNavbarBadges();
    }
};

/* Real Checkout Logic */
document.querySelector(".btn-checkout").addEventListener("click", async () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        alert("Please login to checkout.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userString);
    const cart = JSON.parse(localStorage.getItem("toolLinkCart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const checkoutBtn = document.querySelector(".btn-checkout");
    checkoutBtn.innerText = "Processing...";
    checkoutBtn.disabled = true;

    let successCount = 0;
    let failCount = 0;

    /* Loop through cart items and rent one by one */
    for (const item of cart) {
        try {
            const response = await fetch("http://localhost:5000/rentTool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolId: item.toolId,
                    renterId: user.userId,
                    days: item.days
                })
            });

            if (response.ok) {
                successCount++;
            } else {
                failCount++;
                console.error(`Failed to rent tool ${item.toolId}`);
            }
        } catch (error) {
            failCount++;
            console.error("Network error:", error);
        }
    }

    /* Post-Checkout Handling */
    checkoutBtn.innerText = "Proceed to Checkout";
    checkoutBtn.disabled = false;

    if (failCount === 0) {
        localStorage.removeItem("toolLinkCart");
        updateCartBadge();
        window.showModal("Order Complete", `Success! You have rented ${successCount} tools.`, () => {
            window.location.href = "my-orders.html";
        });
    } else {
        window.showModal("Order Status", `Checkout complete.\nSuccess: ${successCount}\nFailed: ${failCount}`, () => {
            window.location.href = "my-orders.html";
        });
    }
});