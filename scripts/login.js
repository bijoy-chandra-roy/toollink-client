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

    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('reg-error').classList.add('hidden');
};

const handleLogin = async (e) => {
    e.preventDefault();

    const userIdInput = document.getElementById("login-userid").value;
    const passwordInput = document.getElementById("login-password").value;
    const errorElement = document.getElementById("login-error");

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userIdInput, userPassword: passwordInput })
        });

        const data = await response.json();

        if (data.length > 0) {
            errorElement.classList.add("hidden");
            // We still save to localStorage to keep the user logged in across pages
            localStorage.setItem("loggedInUser", JSON.stringify(data[0]));
            window.location.href = "index.html";
        } else {
            errorElement.innerText = "Invalid User ID or Password";
            errorElement.classList.remove("hidden");
        }
    } catch (error) {
        console.error("Login Error:", error);
        errorElement.innerText = "Server connection failed.";
        errorElement.classList.remove("hidden");
    }
};

const handleRegister = async (e) => {
    e.preventDefault();

    const userIdInput = document.getElementById("reg-userid").value;
    const userNameInput = document.getElementById("reg-username").value;
    const userImageInput = document.getElementById("reg-image") ? document.getElementById("reg-image").value : "";
    const passwordInput = document.getElementById("reg-password").value;
    const errorElement = document.getElementById("reg-error");

    // Default image if none provided
    const finalImage = userImageInput.trim() !== "" ? userImageInput : "assets/user-placeholder-image.jpg";

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userIdInput,
                userName: userNameInput,
                userPassword: passwordInput,
                userImage: finalImage
            })
        });

        // If MySQL returns an error (like duplicate ID), response.ok will be true but result might contain error info
        // However, typically fetch only throws on network error. 
        // We check the backend response structure.
        const result = await response.json();

        if (result.code === 'ER_DUP_ENTRY') {
            errorElement.innerText = "User ID already exists! Please choose another.";
            errorElement.classList.remove("hidden");
        } else {
            // Auto-login after success
            const newUser = {
                userId: userIdInput,
                userName: userNameInput,
                userImage: finalImage
            };
            localStorage.setItem("loggedInUser", JSON.stringify(newUser));
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Registration Error:", error);
        errorElement.innerText = "Server connection failed.";
        errorElement.classList.remove("hidden");
    }
};

/* Password Visibility Toggle */
const togglePassword = (inputId, btn) => {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector("i");

    if (input.getAttribute("type") === "password") {
        input.setAttribute("type", "text");
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.setAttribute("type", "password");
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};