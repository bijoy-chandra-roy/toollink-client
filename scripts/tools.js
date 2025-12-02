/* scripts/tools.js */

let allToolsData = []; // Store all tools to avoid refetching for sorting

const loadTools = async () => {
    try {
        // 1. Fetch Wishlist Status First
        if (window.fetchWishlistIds) await window.fetchWishlistIds();

        // 2. Fetch Tools (Only once if possible, but here we reload on page load)
        const response = await fetch("http://localhost:5000/getTools");
        const tools = await response.json();
        allToolsData = tools; // Save for sorting later

        // 3. Filter Logic
        applyFiltersAndSort();

    } catch (error) {
        console.error("Error fetching tools:", error);
    }
};

const applyFiltersAndSort = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase();
    const categoryQuery = urlParams.get('category')?.toLowerCase();
    const sortValue = document.querySelector('.sort-select').value;

    // --- Highlight Active Sidebar Link ---
    document.querySelectorAll('.category-list a').forEach(link => link.classList.remove('active'));

    if (categoryQuery) {
        const activeLink = document.getElementById(`cat-${categoryQuery}`);
        if (activeLink) activeLink.classList.add('active');
    } else {
        const allLink = document.getElementById('cat-all');
        if (allLink) allLink.classList.add('active');
    }

    // --- Filtering ---
    let filteredTools = allToolsData;

    // 1. Apply Search
    if (searchQuery) {
        filteredTools = filteredTools.filter(tool =>
            tool.toolName.toLowerCase().includes(searchQuery) ||
            tool.category.toLowerCase().includes(searchQuery)
        );
        document.querySelector('.page-title').innerText = `Search: "${searchQuery}"`;
    }

    // 2. Apply Category (Chain it!)
    if (categoryQuery) {
        filteredTools = filteredTools.filter(tool =>
            tool.category.toLowerCase() === categoryQuery
        );
        // Only update title if not searching
        if (!searchQuery) {
            document.querySelector('.page-title').innerText =
                categoryQuery.replace(/-/g, ' ').toUpperCase() + " TOOLS";
        }
    }

    // --- Sorting ---
    if (sortValue === "Price: Low to High") {
        filteredTools.sort((a, b) => a.price - b.price);
    } else if (sortValue === "Price: High to Low") {
        filteredTools.sort((a, b) => b.price - a.price);
    } else if (sortValue === "Newest First") {
        filteredTools.sort((a, b) => b.toolId - a.toolId);
    }

    // --- Render ---
    renderToolsGrid(filteredTools);
    updateResultCount(filteredTools.length);
};

const renderToolsGrid = (tools) => {
    const grid = document.querySelector('.shop-grid');
    grid.innerHTML = "";

    if (tools.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><h3>No tools found matching your criteria.</h3></div>`;
        return;
    }

    // Using the shared createToolCard from script.js (now global)
    tools.forEach(tool => {
        if (window.createToolCard) {
            grid.innerHTML += window.createToolCard(tool);
        }
    });
};

const updateResultCount = (count) => {
    const countEl = document.querySelector('.result-count');
    if (countEl) countEl.innerText = `Showing ${count} results`;
};

// Event Listener for Sorting
document.addEventListener('DOMContentLoaded', () => {
    loadTools();
    
    // Attach listener to the sort dropdown
    const sortSelect = document.querySelector('.sort-select');
    if(sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFiltersAndSort(); // Re-run logic without reloading page
        });
    }
});