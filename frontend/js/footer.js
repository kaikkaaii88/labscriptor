document.addEventListener("DOMContentLoaded", function () {

    const footerContainer = document.getElementById("footer");

    fetch("/html/footer.html")
        .then(function (response) {
            return response.text();
        })
        .then(function (html) {
            footerContainer.innerHTML = html;
        })
        .catch(function (error) {
            console.error("Failed to load footer:", error);
        });

});