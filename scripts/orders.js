document.addEventListener('DOMContentLoaded', () => {
    const user = window.checkLogin();
    if (!user) return;

    fetchMyOrders(user.userId);
});

document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userString);
    fetchMyOrders(user.userId);
});

const fetchMyOrders = async (userId) => {
    const activeContainer = document.getElementById("active-orders-list");
    const pastContainer = document.getElementById("past-orders-list");
    const emptyMsg = document.getElementById("empty-orders-msg");
    const headings = document.querySelectorAll("section.orders-section h3");
    
    // 1. Reset UI
    activeContainer.innerHTML = "";
    pastContainer.innerHTML = "";
    emptyMsg.classList.add("hidden");
    headings.forEach(h => h.style.display = 'block'); // Show headings by default

    try {
        const response = await fetch(`http://localhost:5000/myRentals/${userId}`);
        const orders = await response.json();

        // 2. Handle completely empty state
        if (orders.length === 0) {
            emptyMsg.classList.remove("hidden");
            headings.forEach(h => h.style.display = 'none'); // Hide headings
            return;
        }

        // 3. Sort and Render Orders
        orders.forEach(order => {
            const start = new Date(order.startDate).toLocaleDateString();
            const end = new Date(order.endDate).toLocaleDateString();
            
            let statusClass = "status-active";
            let actionButton = `<button class="btn-primary-sm" onclick="handleReturnTool(${order.rentalId}, ${order.toolId})">Return Tool</button>`;

            if(order.status === 'completed') {
                statusClass = "status-completed";
                actionButton = `<button class="btn-outline" disabled>Returned</button>`;
            } else if(order.status === 'cancelled') {
                statusClass = "status-cancelled";
                actionButton = `<button class="btn-outline" disabled>Cancelled</button>`;
            }

            const card = `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-meta">
                            <span class="order-id">Order #TL-${order.rentalId}</span>
                            <span class="order-date">Rented on ${start}</span>
                        </div>
                        <div class="order-status ${statusClass}">${order.status}</div>
                    </div>
                    <div class="order-body">
                        <div class="order-image">
                            <img src="${order.toolImage}" alt="${order.toolName}" onerror="this.src='./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg'">
                        </div>
                        <div class="order-info">
                            <h3 class="tool-name">${order.toolName}</h3>
                            <p class="tool-category">${order.category}</p>
                            <div class="rental-period">
                                <i class="fa-regular fa-calendar"></i>
                                <span>Due: ${end}</span>
                            </div>
                        </div>
                        <div class="order-pricing">
                            <span class="price-label">Total</span>
                            <span class="price-amount">$${order.totalPrice}</span>
                        </div>
                    </div>
                    <div class="order-footer">
                        <button class="btn-outline">Report Issue</button>
                        ${actionButton}
                    </div>
                </div>
            `;

            // 4. Inject into correct container
            if (order.status === 'active') {
                activeContainer.innerHTML += card;
            } else {
                pastContainer.innerHTML += card;
            }
        });

        // 5. Handle empty sub-sections
        if (activeContainer.innerHTML === "") {
            activeContainer.innerHTML = `<p style="color:#777; font-style:italic;">No active rentals at the moment.</p>`;
        }
        if (pastContainer.innerHTML === "") {
            pastContainer.innerHTML = `<p style="color:#777; font-style:italic;">No past orders found.</p>`;
        }

    } catch (error) {
        console.error("Error fetching orders:", error);
    }
};

// --- New Function to Handle Return ---
const handleReturnTool = async (rentalId, toolId) => {
    if(!confirm("Are you sure you want to return this tool?")) return;

    try {
        const response = await fetch("http://localhost:5000/returnTool", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rentalId, toolId })
        });

        if (response.ok) {
            alert("Tool returned successfully!");
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            fetchMyOrders(user.userId); // Refresh list
        } else {
            alert("Failed to return tool.");
        }
    } catch (error) {
        console.error("Error returning tool:", error);
    }
};