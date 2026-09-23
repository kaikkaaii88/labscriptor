document.addEventListener("DOMContentLoaded", function () {

    const navbarContainer = document.getElementById("navbar");

    fetch("/html/navbar.html")
        .then(function (response) {
            return response.text();
        })
        .then(function (html) {
            navbarContainer.innerHTML = html;
        })
        .catch(function (error) {
            console.error("Failed to load navbar:", error);
        });

});

