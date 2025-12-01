document.addEventListener('DOMContentLoaded', () => {
    // ONE LINE AUTH CHECK
    const user = window.checkLogin(); 
    if (!user) return; // Stop if not logged in

    fetchMyListings(user.userId);
});

document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem("loggedInUser");
    
    if (!userString) {
        alert("Please login to view your dashboard.");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userString);
    fetchMyListings(user.userId);
});

// We store the fetched tools here so we can access data for the modal easily
let myToolsData = [];

const fetchMyListings = async (userId) => {
    const container = document.querySelector(".dashboard-list");
    
    try {
        // 1. Fetch Tools
        const toolsResponse = await fetch(`http://localhost:5000/getMyListings/${userId}`);
        const tools = await toolsResponse.json();
        myToolsData = tools; // Save for later use

        // 2. Fetch Stats
        const statsResponse = await fetch(`http://localhost:5000/getLenderStats/${userId}`);
        const stats = await statsResponse.json();

        // Update Stats UI
        const statValues = document.querySelectorAll('.stat-value');
        if(statValues.length >= 3) {
            statValues[0].innerText = `$${stats.totalEarnings.toFixed(2)}`;
            statValues[1].innerText = tools.length;
            statValues[2].innerText = stats.activeRentals;
        }

        container.innerHTML = ""; 

        if (tools.length === 0) {
            container.innerHTML = "<p>You haven't listed any tools yet.</p>";
            return;
        }

        tools.forEach((tool, index) => {
            let badgeClass = "status-available";
            if(tool.status === 'rented') badgeClass = "status-rented";
            if(tool.status === 'maintenance') badgeClass = "status-maintenance";

            const card = `
                <div class="lender-card" id="tool-${tool.toolId}">
                    <div class="lender-card-header">
                        <div class="tool-id">ID: #TL-${tool.toolId}</div>
                        <div class="status-badge ${badgeClass}">${tool.status}</div>
                    </div>
                    <div class="lender-card-body">
                        <div class="lender-image">
                             <img src="${tool.toolImage}" alt="${tool.toolName}" onerror="this.src='./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg'">
                        </div>
                        <div class="lender-info">
                            <h3 class="tool-name">${tool.toolName}</h3>
                            <p class="tool-category">${tool.category}</p>
                            <p class="maintenance-note">Price: $${tool.price}/day</p>
                        </div>
                        <div class="lender-pricing">
                            </div>
                    </div>
                    <div class="lender-card-footer">
                        <button class="btn-outline" onclick="openEditModal(${index})">Edit</button>
                        <button class="btn-outline text-red" onclick="deleteTool(${tool.toolId})">Delete</button>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Error fetching listings:", error);
    }
};

/* --- Edit Functionality --- */

const openEditModal = (index) => {
    const tool = myToolsData[index];
    
    // Pre-fill the form
    document.getElementById("edit-tool-id").value = tool.toolId;
    document.getElementById("edit-name").value = tool.toolName;
    document.getElementById("edit-category").value = tool.category;
    document.getElementById("edit-price").value = tool.price;
    // REMOVED: document.getElementById("edit-status").value = tool.status;

    // Show Modal
    document.getElementById("edit-modal").classList.add("active");
};

const closeEditModal = () => {
    document.getElementById("edit-modal").classList.remove("active");
};

const handleUpdateTool = async (e) => {
    e.preventDefault();

    const toolId = document.getElementById("edit-tool-id").value;
    const toolName = document.getElementById("edit-name").value;
    const category = document.getElementById("edit-category").value;
    const price = document.getElementById("edit-price").value;
    // REMOVED: const status = document.getElementById("edit-status").value;

    try {
        const response = await fetch("http://localhost:5000/updateTool", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            // REMOVED status from body
            body: JSON.stringify({ toolId, toolName, category, price })
        });

        if (response.ok) {
            alert("Tool updated successfully!");
            closeEditModal();
            const user = JSON.parse(localStorage.getItem("loggedInUser"));
            fetchMyListings(user.userId);
        } else {
            alert("Failed to update tool.");
        }
    } catch (error) {
        console.error("Error updating tool:", error);
    }
};

/* --- Delete Functionality --- */

const deleteTool = async (toolId) => {
    if(!confirm("Are you sure you want to delete this listing?")) return;

    try {
        const response = await fetch(`http://localhost:5000/deleteTool/${toolId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            const item = document.getElementById(`tool-${toolId}`);
            if (item) item.remove();
            
            // Update stats locally for instant feedback
            const countElement = document.querySelectorAll('.stat-value')[1]; 
            if(countElement) countElement.innerText = parseInt(countElement.innerText) - 1;
            
            alert("Tool deleted successfully.");
        } else {
            alert("Failed to delete tool.");
        }
    } catch (error) {
        console.error("Error deleting tool:", error);
    }
};