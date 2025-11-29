// const initCategoryFilters = () => {
//     const categoryLinks = document.querySelectorAll('.category-list a');

//     categoryLinks.forEach(link => {
//         link.addEventListener('click', (e) => {
//             e.preventDefault(); 
//             categoryLinks.forEach(item => item.classList.remove('active'));
//             e.target.classList.add('active');
//         });
//     });
// };

// initCategoryFilters();

// Mock Data (in case localStorage is empty)
const defaultTools = [
    { id: 1, name: "Cordless Drill Set", category: "Power Tools", price: 15, image: "./assets/vecteezy_cordless-electric-drill-with-battery-pack-ideal-for-various_69716390.jpeg" },
    { id: 2, name: "Aluminum Step Ladder", category: "Renovation", price: 12, image: "./assets/vecteezy_step-ladder-in-a-frame-configuration-on-white-background_72123824.jpg" },
    { id: 3, name: "Gas Lawn Mower", category: "Gardening", price: 35, image: "./assets/vecteezy_red-gas-powered-lawn-mower-isolated-on-white-background_69896932.jpg" },
    { id: 4, name: "Industrial Vacuum", category: "Cleaning", price: 25, image: "./assets/vecteezy_vacuum-cleaner-isolated-on-white-background_50631786.jpg" },
    { id: 5, name: "Claw Hammer", category: "Hand Tools", price: 5, image: "./assets/vecteezy_claw-hammer-isolated-on-white-background_72123683.jpg" },
    { id: 6, name: "Torque Wrench", category: "Auto Repair", price: 8, image: "./assets/vecteezy_professional-metal-torque-wrench-with-black-handle-on-white_68632739.jpg" },
    { id: 7, name: "Cement Mixer", category: "Renovation", price: 40, image: "./assets/vecteezy_a-shovel-and-cement-in-a-mound_68033404.jpg" }
];

const loadTools = () => {
    // 1. Get Tools from LocalStorage or use Default
    let tools = localStorage.getItem("tools");
    if (tools) {
        tools = JSON.parse(tools);
        // Merge defaults if they aren't there (just for demo purposes)
        if(tools.length < defaultTools.length) {
             tools = [...defaultTools, ...tools];
        }
    } else {
        tools = defaultTools;
        localStorage.setItem("tools", JSON.stringify(tools));
    }

    // 2. Get URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase();
    const categoryQuery = urlParams.get('category')?.toLowerCase();

    // 3. Filter Tools
    let filteredTools = tools;

    if (searchQuery) {
        filteredTools = tools.filter(tool => 
            tool.name.toLowerCase().includes(searchQuery) || 
            tool.category.toLowerCase().includes(searchQuery)
        );
        document.querySelector('.page-title').innerText = `Search Results: "${searchQuery}"`;
    } 
    
    if (categoryQuery) {
        filteredTools = tools.filter(tool => 
            tool.category.toLowerCase().replace(/\s+/g, '-') === categoryQuery
        );
        // Update sidebar active state
        document.querySelectorAll('.category-list a').forEach(link => {
            link.classList.remove('active');
            if(link.href.includes(categoryQuery)) link.classList.add('active');
        });
    }

    // 4. Render
    renderToolsGrid(filteredTools);
    updateResultCount(filteredTools.length);
};

const renderToolsGrid = (tools) => {
    const grid = document.querySelector('.shop-grid');
    grid.innerHTML = "";

    if (tools.length === 0) {
        grid.innerHTML = `<div class="col-span-4 text-center py-5"><h3>No tools found matching your criteria.</h3></div>`;
        return;
    }

    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="listing-image">
                <img src="${tool.image}" alt="${tool.name}">
                <button class="wishlist-btn"><i class="fa-regular fa-heart"></i></button>
                <div class="listing-actions">
                    <button class="btn-cart-action">Add to Cart</button>
                    <button class="btn-rent">Rent Now</button>
                </div>
            </div>
            <div class="listing-info">
                <p class="listing-category">${tool.category}</p>
                <h3 class="listing-title"><a href="tool-details.html">${tool.name}</a></h3>
                <div class="listing-price">$${tool.price} / day</div>
            </div>
        `;
        grid.appendChild(card);
    });
};

const updateResultCount = (count) => {
    const countEl = document.querySelector('.result-count');
    if(countEl) countEl.innerText = `Showing ${count} results`;
};

// Initialize
document.addEventListener('DOMContentLoaded', loadTools);