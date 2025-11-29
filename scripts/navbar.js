const renderNavbar = () => {
    const navbarContainer = document.getElementById("navbar-container");
    const userString = localStorage.getItem("loggedInUser");
    const user = userString ? JSON.parse(userString) : null;

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
                        <strong>${user.userName}</strong>
                    </div>
                    <a href="lender-dashboard.html"><i class="fa-solid fa-toolbox"></i> My Listings</a>
                    <a href="my-orders.html"><i class="fa-solid fa-clipboard-list"></i> My Orders</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
                </div>
            </div>
        `;
    }

    navbarContainer.innerHTML = `
        <div class="navbar-content">
            <div class="logo">
                <a href="index.html">ToolLink</a>
            </div>

            <nav class="nav-links">
                <a href="index.html">Home</a>
                <a href="tools.html">Tools</a>
                ${user ? '<a href="lender-dashboard.html">Dashboard</a>' : ''}
            </nav>

            <div class="nav-actions">
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
        </div>

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
        if (link.getAttribute("href") === page) {
            link.classList.add("active");
        }
    });
};

/* --- List Tool Toggle Logic --- */
const toggleListSection = () => {
    const section = document.querySelector('.list-tool-section');
    
    if (section) {
        // If we are on a page that has the section, toggle it
        section.classList.toggle('open');
        
        // If opening, scroll to top smoothly
        if (section.classList.contains('open')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else {
        // If we are on a page without the section (e.g. My Orders), redirect to home and open it
        window.location.href = 'index.html?action=list-tool';
    }
};

/* --- Search Logic --- */
const openSearch = () => {
    const overlay = document.getElementById("search-overlay");
    overlay.classList.add("active");
    document.getElementById("search-input").focus();
};

const closeSearch = () => {
    const overlay = document.getElementById("search-overlay");
    overlay.classList.remove("active");
};

const handleSearch = (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value;
    if (query.trim()) {
        window.location.href = `tools.html?search=${encodeURIComponent(query)}`;
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
});

renderNavbar();