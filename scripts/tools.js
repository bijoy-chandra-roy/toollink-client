const loadTools = async () => {
    try {
        // 1. Fetch Wishlist Status First
        await fetchWishlistIds(); // Defined in script.js

        // 2. Fetch Tools
        const response = await fetch("http://localhost:5000/getTools");
        const tools = await response.json();

        // 3. Filter Logic
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search')?.toLowerCase();
        const categoryQuery = urlParams.get('category')?.toLowerCase();

        // --- Highlight Active Sidebar Link ---
        // Remove 'active' from all links first
        document.querySelectorAll('.category-list a').forEach(link => link.classList.remove('active'));

        if (categoryQuery) {
            // Highlight specific category
            const activeLink = document.getElementById(`cat-${categoryQuery}`);
            if (activeLink) activeLink.classList.add('active');
        } else {
            // Highlight "All Tools" if no category selected
            const allLink = document.getElementById('cat-all');
            if (allLink) allLink.classList.add('active');
        }
        // -------------------------------------

        let filteredTools = tools;

        if (searchQuery) {
            filteredTools = tools.filter(tool =>
                tool.toolName.toLowerCase().includes(searchQuery) ||
                tool.category.toLowerCase().includes(searchQuery)
            );
            document.querySelector('.page-title').innerText = `Search Results: "${searchQuery}"`;
        }

        if (categoryQuery) {
            filteredTools = tools.filter(tool =>
                // Database stores 'power-tools', 'renovation', etc.
                // We ensure both sides are formatted consistently
                tool.category.toLowerCase() === categoryQuery
            );

            // Update Title
            document.querySelector('.page-title').innerText =
                categoryQuery.replace(/-/g, ' ').toUpperCase() + " TOOLS";
        }

        renderToolsGrid(filteredTools);
        updateResultCount(filteredTools.length);

    } catch (error) {
        console.error("Error fetching tools:", error);
    }
};

const renderToolsGrid = (tools) => {
    const grid = document.querySelector('.shop-grid');
    grid.innerHTML = "";

    if (tools.length === 0) {
        grid.innerHTML = `<div class="col-span-4 text-center py-5"><h3>No tools found.</h3></div>`;
        return;
    }

    // Using the shared createToolCard from script.js
    tools.forEach(tool => {
        grid.innerHTML += createToolCard(tool);
    });
};

const updateResultCount = (count) => {
    const countEl = document.querySelector('.result-count');
    if (countEl) countEl.innerText = `Showing ${count} results`;
};

document.addEventListener('DOMContentLoaded', loadTools);