// --- Global Auth Guard (DRY Principle) ---
window.checkLogin = () => {
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        window.location.href = "login.html";
        return null;
    }
    return JSON.parse(userString);
};/* scripts/navbar.js */

const renderNavbar = () => {
    const navbarContainer = document.getElementById("navbar-container");
    const userString = localStorage.getItem("loggedInUser");
    const user = userString ? JSON.parse(userString) : null;

    /* --- 1. Dynamic Links (Middle Nav) --- */
    let navLinksHTML = `
        <a href="index.html">Home</a>
        <a href="tools.html">Tools</a>
    `;

    if (user) {
        navLinksHTML += `
            <a href="lender-dashboard.html">Dashboard</a>
            <a href="my-orders.html">My Orders</a>
        `;
    }

    /* --- 2. Auth Section (Right Icon) --- */
    let authMenu = `
        <a href="login.html" class="icon-btn" title="Login / Register">
            <i class="fa-regular fa-user"></i>
        </a>
    `;

    if (user) {
        authMenu = `
            <div class="user-dropdown">
                <a href="#" class="icon-btn" onclick="return false;">
                    <i class="fa-regular fa-user"></i>
                    <span class="nav-user-name">${user.userName.split(' ')[0]}</span>
                </a>
                <div class="dropdown-content">
                    <div class="dropdown-header">
                        <span>Signed in as</span>
                        <a href="profile.html"><strong>${user.userName}</strong></a>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                </div>
            </div>
        `;
    }

    /* --- 3. Render HTML --- */
    navbarContainer.innerHTML = `
        <div class="navbar-content">
            <div class="logo">
                <a href="index.html">ToolLink</a>
            </div>

            <nav class="nav-links desktop-nav">
                ${navLinksHTML}
            </nav>

            <div class="nav-actions desktop-actions">
                <div class="icon-btn" onclick="toggleListSection()" title="List a Tool">
                    <i class="fa-solid fa-plus"></i>
                </div>
                <div class="icon-btn search-btn" onclick="openSearch()">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <a href="wishlist.html" class="icon-btn">
                    <i class="fa-regular fa-heart"></i>
                    <span class="badge">3</span>
                </a>
                <a href="cart.html" class="icon-btn">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="badge">2</span>
                </a>
                ${authMenu}
            </div>

            <button class="hamburger-btn" onclick="toggleMobileMenu()">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>

        <div id="mobile-menu" class="mobile-menu">
            <div class="mobile-menu-header">
                <span class="mobile-menu-title">Menu</span>
                <button class="close-mobile-menu" onclick="toggleMobileMenu()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="mobile-links">
                ${navLinksHTML}
                <hr>
                <a href="#" onclick="toggleListSection(); toggleMobileMenu();">List a Tool</a>
                <a href="#" onclick="openSearch(); toggleMobileMenu();">Search</a>
                <a href="wishlist.html">Wishlist (3)</a>
                <a href="cart.html">Cart (2)</a>
                ${user ? `<a href="profile.html">Profile (${user.userName})</a>` : '<a href="login.html">Login / Register</a>'}
                ${user ? `<a href="#" onclick="handleLogout()" style="color:#d63031;">Logout</a>` : ''}
            </div>
        </div>

        <section class="list-tool-section">
            <div class="container">
                <div class="form-container">
                    <h3 class="form-title">List Your Tool</h3>
                    <form class="list-tool-form" onsubmit="handleListTool(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <input type="text" id="global-tool-name" class="form-control" placeholder="Tool Name (e.g. Hammer)" required>
                            </div>
                            <div class="form-group">
                                <select id="global-tool-category" class="form-control" required>
                                    <option value="" disabled selected hidden>Select Category</option>
                                    <option value="renovation">Renovation</option>
                                    <option value="power-tools">Power Tools</option>
                                    <option value="gardening">Gardening</option>
                                    <option value="auto">Auto Repair</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="hand-tools">Hand Tools</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <input type="number" id="global-tool-price" class="form-control" placeholder="Price per Day ($)" min="1" required>
                            </div>
                            <div class="form-group">
                                <input type="text" id="global-tool-image" class="form-control" placeholder="Image URL" required>
                            </div>
                        </div>
                        <button type="submit" class="btn-submit">List Tool</button>
                    </form>
                </div>
            </div>
        </section>

        <div id="search-overlay" class="search-overlay">
            <div class="search-container">
                <button class="close-search" onclick="closeSearch()"><i class="fa-solid fa-xmark"></i></button>
                <h3>What are you looking for?</h3>
                <form class="search-form" onsubmit="handleSearch(event)">
                    <input type="text" id="search-input" placeholder="Search for tools (e.g. Drill, Ladder)..." autocomplete="off">
                    <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
                </form>
            </div>
        </div>
    `;

    highlightActiveLink();
    
    // Auto-open list tool if URL param exists
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'list-tool') {
        setTimeout(() => {
            const section = document.querySelector('.list-tool-section');
            if(section) section.classList.add('open');
        }, 100);
    }
};

const toggleMobileMenu = () => {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("active");
};

const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
};

const highlightActiveLink = () => {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => {
        if (link.getAttribute("href") === page) link.classList.add("active");
    });
};

const toggleListSection = () => {
    const section = document.querySelector('.list-tool-section');
    if (section) section.classList.toggle('open');
};

const handleListTool = async (e) => {
    e.preventDefault();
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) {
        alert("You must be logged in to list a tool.");
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userString);

    const toolName = document.getElementById("global-tool-name").value;
    const category = document.getElementById("global-tool-category").value;
    const price = document.getElementById("global-tool-price").value;
    const toolImage = document.getElementById("global-tool-image").value;

    try {
        const response = await fetch("http://localhost:5000/addTool", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ownerId: user.userId,
                toolName, category, price, toolImage
            })
        });

        if (response.ok) {
            alert("Tool listed successfully!");
            e.target.reset();
            toggleListSection();
            if (typeof fetchHomeTools === 'function') fetchHomeTools();
            else if (typeof fetchMyListings === 'function') fetchMyListings(user.userId);
        } else {
            alert("Failed to list tool.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

const openSearch = () => {
    document.getElementById("search-overlay").classList.add("active");
    document.getElementById("search-input").focus();
};

const closeSearch = () => {
    document.getElementById("search-overlay").classList.remove("active");
};

const handleSearch = (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value;
    if (query.trim()) window.location.href = `tools.html?search=${encodeURIComponent(query)}`;
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
});

renderNavbar();