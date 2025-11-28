const renderFooter = () => {
    const footerContainer = document.getElementById("footer-container");
    const year = new Date().getFullYear();

    footerContainer.innerHTML = `
        <div class="footer-top">
            <div class="footer-column">
                <a href="index.html" class="footer-logo">ToolLink</a>
                <p>123 Maker Street, Craft Town</p>
                <p><strong>support@toollink.com</strong></p>
                <div class="social-links">
                    <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>

            <div class="footer-column">
                <h4>Company</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">How it Works</a></li>
                    <li><a href="#">Careers</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4>Discover</h4>
                <ul>
                    <li><a href="browse.html">Browse Tools</a></li>
                    <li><a href="#">New Arrivals</a></li>
                    <li><a href="#">Popular Categories</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4>Help</h4>
                <ul>
                    <li><a href="#">Support Center</a></li>
                    <li><a href="#">Safety Guidelines</a></li>
                    <li><a href="#">Terms & Privacy</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; ${year} ToolLink. All rights reserved.</p>
        </div>
    `;
};

renderFooter();