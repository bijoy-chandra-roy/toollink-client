// Switch between Login and Register tabs
const switchTab = (tab) => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabs = document.querySelectorAll('.auth-tab');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
    
    // Clear errors
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('reg-error').classList.add('hidden');
};

// Handle Login
const handleLogin = async (e) => {
    e.preventDefault();
    
    const userIdInput = document.getElementById("login-userid").value;
    const passwordInput = document.getElementById("login-password").value;
    const errorElement = document.getElementById("login-error");

    // Mocking fetch from server/database
    let users = localStorage.getItem("users");
    users = users ? JSON.parse(users) : [];

    // Add a demo user if database is empty
    if (users.length === 0) {
        users.push({ userId: "user1", userName: "Demo User", password: "1234" });
        localStorage.setItem("users", JSON.stringify(users));
    }

    const foundUser = users.find(u => u.userId === userIdInput && u.password === passwordInput);

    if (foundUser) {
        errorElement.classList.add("hidden");
        // Store session
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        
        // Redirect to home
        window.location.href = "index.html";
    } else {
        errorElement.classList.remove("hidden");
    }
};

// Handle Register
const handleRegister = async (e) => {
    e.preventDefault();

    const userIdInput = document.getElementById("reg-userid").value;
    const userNameInput = document.getElementById("reg-username").value;
    const passwordInput = document.getElementById("reg-password").value;
    const errorElement = document.getElementById("reg-error");

    let users = localStorage.getItem("users");
    users = users ? JSON.parse(users) : [];

    // Check uniqueness
    const exists = users.some(u => u.userId === userIdInput);

    if (exists) {
        errorElement.innerText = "User ID already exists! Please choose another.";
        errorElement.classList.remove("hidden");
        return;
    }

    const newUser = {
        userId: userIdInput,
        userName: userNameInput,
        password: passwordInput
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Auto login after register
    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    window.location.href = "index.html";
};