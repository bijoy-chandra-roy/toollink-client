document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem("loggedInUser");
    
    if (!userString) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userString);

    // Populate the form and display
    document.getElementById("profile-userid").value = user.userId;
    document.getElementById("profile-name").value = user.userName;
    document.getElementById("profile-image-input").value = user.userImage || "";
    
    // Update the visual header
    document.getElementById("display-name").innerText = user.userName;
    document.getElementById("display-id").innerText = `@${user.userId}`;
    
    if (user.userImage) {
        document.getElementById("profile-img-display").src = user.userImage;
    }
});

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const userString = localStorage.getItem("loggedInUser");
    if (!userString) return; // Safety check
    const currentUser = JSON.parse(userString);

    const newName = document.getElementById("profile-name").value;
    const newImage = document.getElementById("profile-image-input").value;
    const newPassword = document.getElementById("profile-password").value;
    const messageEl = document.getElementById("profile-message");

    try {
        const response = await fetch("http://localhost:5000/updateUser", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: currentUser.userId,
                userName: newName,
                userImage: newImage,
                userPassword: newPassword // Send it (server handles empty check)
            })
        });

        if (response.ok) {
            // Update LocalStorage with new data so the UI stays in sync
            const updatedUser = {
                ...currentUser,
                userName: newName,
                userImage: newImage || currentUser.userImage
            };
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

            // Update visual elements immediately
            document.getElementById("display-name").innerText = updatedUser.userName;
            if (updatedUser.userImage) {
                document.getElementById("profile-img-display").src = updatedUser.userImage;
            }

            // Show success message
            messageEl.classList.remove("hidden");
            setTimeout(() => {
                messageEl.classList.add("hidden");
                window.location.reload(); // Refresh to update navbar name
            }, 1000);
        } else {
            alert("Failed to update profile.");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};