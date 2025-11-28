const renderNavbar = () => {
    const navbarContainer = document.getElementById("navbar-container");
    let user = localStorage.getItem("loggedInUser");
    
    let profileLink = "login.html";
    let profileTitle = "Login / Register";

    if (user) {
        user = JSON.parse(user);
        profileLink = "account_dashboard.html"; 
        profileTitle = `Welcome, ${user.userName}`;
    }

    navbarContainer.innerHTML = `
        <div class="navbar-content">
            <div class="logo">
                <a href="index.html">ToolLink</a>
            </div>

            <nav class="nav-links">
                <a href="index.html">Home</a>
                <a href="browse.html">Tools</a>
            </nav>

            <div class="nav-actions">
                <div class="icon-btn search-btn">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>

                <a href="wishlist.html" class="icon-btn">
                    <i class="fa-regular fa-heart"></i>
                    <span class="badge">0</span>
                </a>

                <a href="cart.html" class="icon-btn">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="badge">0</span>
                </a>

                <a href="${profileLink}" class="icon-btn" title="${profileTitle}">
                    <i class="fa-regular fa-user"></i>
                </a>
            </div>
        </div>
    `;

    highlightActiveLink();
};

const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.reload();
};

const highlightActiveLink = () => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(".nav-links a");
    
    links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
};

renderNavbar();