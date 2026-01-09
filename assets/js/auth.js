// assets/js/auth.js

// Check if user is logged in
const user = localStorage.getItem('user');
if (!user) {
    window.location.href = 'login.html';
}

// Logout function
function logout() {
    if(confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}