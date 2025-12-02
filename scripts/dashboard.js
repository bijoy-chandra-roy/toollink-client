/* Section: Dashboard Logic */
document.addEventListener('DOMContentLoaded', () => {
    const user = window.checkLogin();
    if (!user) return;

    window.fetchMyListings(user.userId);
});

document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem("loggedInUser");
    
    if (!userString) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userString);
    window.fetchMyListings(user.userId);
});

let myToolsData = [];

window.fetchMyListings = async (userId) => {
    const container = document.querySelector(".dashboard-list");
    
    try {
        const toolsResponse = await fetch(`http://localhost:5000/getMyListings/${userId}`);
        const tools = await toolsResponse.json();
        myToolsData = tools; 

        const statsResponse = await fetch(`http://localhost:5000/getLenderStats/${userId}`);
        const stats = await statsResponse.json();

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

            let rentalInfoHTML = "";
            if (tool.status === 'rented' && tool.renterName) {
                const start = new Date(tool.startDate).toLocaleDateString();
                const end = new Date(tool.endDate).toLocaleDateString();
                rentalInfoHTML = `
                    <div style="margin-top: 10px; padding-top:10px; border-top:1px solid #eee; font-size: 13px; color: #555;">
                        <p style="margin-bottom:4px;"><strong>Rented by:</strong> ${tool.renterName}</p>
                        <p><i class="fa-regular fa-calendar"></i> ${start} - ${end}</p>
                    </div>
                `;
            }

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
                            
                            ${rentalInfoHTML}
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

/* Section: Edit Functionality */
window.openEditModal = (index) => {
    const tool = myToolsData[index];
    
    document.getElementById("edit-tool-id").value = tool.toolId;
    document.getElementById("edit-name").value = tool.toolName;
    document.getElementById("edit-category").value = tool.category;
    document.getElementById("edit-price").value = tool.price;
    document.getElementById("edit-image").value = tool.toolImage; 

    document.getElementById("edit-modal").classList.add("active");
};

window.closeEditModal = () => {
    document.getElementById("edit-modal").classList.remove("active");
};

window.handleUpdateTool = async (e) => {
    e.preventDefault();
    
    const toolId = document.getElementById("edit-tool-id").value;
    const toolName = document.getElementById("edit-name").value;
    const category = document.getElementById("edit-category").value;
    const price = document.getElementById("edit-price").value;
    const toolImage = document.getElementById("edit-image").value; 

    try {
        const response = await fetch("http://localhost:5000/updateTool", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toolId, toolName, category, price, toolImage }) 
        });

        if (response.ok) {
            window.closeEditModal();

            window.showModal("Success", "Tool updated successfully!", () => {
                const user = JSON.parse(localStorage.getItem("loggedInUser"));
                window.fetchMyListings(user.userId);
            });
        } else {
            window.showModal("Error", "Failed to update tool.");
        }
    } catch (error) {
        console.error("Error updating tool:", error);
    }
};

/* Section: Delete Functionality */
window.deleteTool = async (toolId) => {
    try {
        const response = await fetch(`http://localhost:5000/deleteTool/${toolId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (response.ok) {
            const item = document.getElementById(`tool-${toolId}`);
            if (item) item.remove();
            
            const countElement = document.querySelectorAll('.stat-value')[1]; 
            if(countElement) countElement.innerText = parseInt(countElement.innerText) - 1;
            
            window.showModal("Deleted", "Tool deleted successfully.");
        } else {
            window.showModal("Action Blocked", data.message || "Failed to delete tool.");
        }
    } catch (error) {
        console.error("Error deleting tool:", error);
        window.showModal("Error", "Server connection failed.");
    }
};