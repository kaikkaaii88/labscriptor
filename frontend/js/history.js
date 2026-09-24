// SUPABASE CONFIGURATION

const SUPABASE_URL =
    "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// DOM ELEMENTS

const historyMessage =
    document.getElementById(
        "historyMessage"
    );

const experimentList =
    document.getElementById(
        "experimentList"
    );

const imageMessage =
    document.getElementById(
        "imageMessage"
    );

const imageList =
    document.getElementById(
        "imageList"
    );

const homeButton =
    document.getElementById(
        "homeButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const brandIcon =
    document.querySelector(".app-brand-icon");

// NAVIGATION

homeButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "process.html";
    }
);


logoutButton.addEventListener(
    "click",
    async function () {

        const result =
            await supabaseClient.auth.signOut();

        const error =
            result.error;

        if (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to log out."
            );

            return;
        }

        window.location.href =
            "login.html";
    }
);


// NAVIGATION

brandIcon.addEventListener(
    "click",
    function() {

        window.location.href =
            "process.html";
    }
);


homeButton.addEventListener(
    "click",
    function() {

        window.location.href =
            "process.html";
    }
);

// LOAD CURRENT USER

async function loadCurrentUser() {

    const result =
        await supabaseClient.auth.getUser();

    const user =
        result.data.user;

    const error =
        result.error;

    if (
        error ||
        !user
    ) {

        console.error(
            "No authenticated user found:",
            error
        );

        window.location.href =
            "login.html";

        return null;
    }

    return user;
}


// LOAD USER ID

async function loadUserId(user) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/users/" +
                encodeURIComponent(
                    user.email
                )
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Failed to load user:",
                data
            );

            return null;
        }

        return data.user.user_id;

    } catch (error) {

        console.error(
            "Error loading user:",
            error
        );

        return null;
    }
}


// LOAD EXPERIMENTS

async function loadExperiments(
    userId
) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/process-sessions"
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Failed to load experiments:",
                data
            );

            historyMessage.textContent =
                "Unable to load experiments.";

            return [];
        }

        const experiments =
            data.process_sessions.filter(
                function (session) {

                    return (
                        session.user_id ===
                        userId
                    );
                }
            );

        displayExperiments(
            experiments
        );

        return experiments;

    } catch (error) {

        console.error(
            "Error loading experiments:",
            error
        );

        historyMessage.textContent =
            "Unable to connect to the LabScriptor backend.";

        return [];
    }
}


// DISPLAY EXPERIMENTS

function displayExperiments(
    experiments
) {

    experimentList.innerHTML = "";

    if (
        experiments.length === 0
    ) {

        historyMessage.textContent =
            "No previous experiments found.";

        return;
    }

    historyMessage.textContent =
        experiments.length +
        " experiment(s) found.";


    experiments.forEach(
        function (experiment) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "experiment-card";


            // EXPERIMENT INFORMATION

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "experiment-info";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                experiment.process_name;


            const startTime =
                document.createElement(
                    "p"
                );

            if (
                experiment.start_time
            ) {

                startTime.textContent =
                    "Started: " +
                    new Date(
                        experiment.start_time
                    ).toLocaleString();

            } else {

                startTime.textContent =
                    "Started: Not available";
            }


            const status =
                document.createElement(
                    "p"
                );

            status.className =
                "experiment-status";

            status.textContent =
                "Status: " +
                experiment.status;


            info.appendChild(
                title
            );

            info.appendChild(
                startTime
            );

            info.appendChild(
                status
            );


            // EXPERIMENT ACTIONS

            const buttonContainer =
                document.createElement(
                    "div"
                );

            buttonContainer.className =
                "experiment-actions";


            const viewButton =
                document.createElement(
                    "button"
                );

            viewButton.className =
                "view-button";

            viewButton.textContent =
                "View";

            viewButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "experiment.html?session_id=" +
                        experiment.session_id;
                }
            );


            buttonContainer.appendChild(
                viewButton
            );


            // EDIT BUTTON

            if (
                experiment.status &&
                (
                    experiment.status.toLowerCase() ===
                        "completed" ||
                    experiment.status.toLowerCase() ===
                        "finished"
                )
            ) {

                const editButton =
                    document.createElement(
                        "button"
                    );

                editButton.className =
                    "edit-button";

                editButton.textContent =
                    "Edit";

                editButton.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            "experiment.html?session_id=" +
                            experiment.session_id +
                            "&edit=true";
                    }
                );

                buttonContainer.appendChild(
                    editButton
                );
            }


            // ADD CONTENT TO CARD

            card.appendChild(
                info
            );

            card.appendChild(
                buttonContainer
            );


            experimentList.appendChild(
                card
            );
        }
    );
}


// FORMAT FILE NAME

function formatFileName(
    fileName
) {

    if (!fileName) {
        return "Unknown file";
    }

    if (
        fileName.length > 23
    ) {

        return (
            fileName.substring(
                0,
                20
            ) +
            "..."
        );
    }

    return fileName;
}


// LOAD ALL HISTORY IMAGES

async function loadAllHistoryImages(
    experiments
) {

    imageList.innerHTML = "";

    if (
        !experiments ||
        experiments.length === 0
    ) {

        imageMessage.textContent =
            "No images available.";

        return;
    }


    imageMessage.textContent =
        "Loading images...";


    let allImages = [];


    for (
        let i = 0;
        i < experiments.length;
        i++
    ) {

        const experiment =
            experiments[i];

        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/images/" +
                    experiment.session_id
                );

            const data =
                await response.json();

            if (!response.ok) {

                console.error(
                    "Failed to load images for session:",
                    experiment.session_id,
                    data
                );

                continue;
            }


            const images =
                data.images || [];


            images.forEach(
                function (image) {

                    allImages.push({
                        image: image,
                        experiment: experiment
                    });

                }
            );

        } catch (error) {

            console.error(
                "Error loading images for session:",
                experiment.session_id,
                error
            );
        }
    }


    imageList.innerHTML = "";


    if (
        allImages.length === 0
    ) {

        imageMessage.textContent =
            "No images uploaded.";

        return;
    }


    imageMessage.textContent =
        allImages.length +
        " image(s) found.";


    allImages.forEach(
        function (item) {

            const image =
                item.image;

            const experiment =
                item.experiment;


            const imageItem =
                document.createElement(
                    "div"
                );

            imageItem.className =
                "history-image-item";


            const imageElement =
                document.createElement(
                    "img"
                );

            imageElement.src =
                image.image_url;

            imageElement.alt =
                image.file_name;

            imageElement.addEventListener(
                "click",
                function () {

                    openImageViewer(
                        image.image_url,
                        image.file_name
                    );
                }
            );


            const fileName =
                document.createElement(
                    "p"
                );

            fileName.className =
                "history-image-file-name";

            fileName.textContent =
                formatFileName(
                    image.file_name
                );


            const experimentName =
                document.createElement(
                    "p"
                );

            experimentName.className =
                "history-image-experiment";

            experimentName.textContent =
                experiment.process_name;


            const recordedTime =
                document.createElement(
                    "p"
                );

            recordedTime.className =
                "history-image-time";

            if (
                image.recorded_at
            ) {

                recordedTime.textContent =
                    new Date(
                        image.recorded_at
                    ).toLocaleString();

            } else {

                recordedTime.textContent =
                    "Unknown time";
            }


            imageItem.appendChild(
                imageElement
            );

            imageItem.appendChild(
                fileName
            );

            imageItem.appendChild(
                experimentName
            );

            imageItem.appendChild(
                recordedTime
            );


            imageList.appendChild(
                imageItem
            );
        }
    );
}


// OPEN IMAGE VIEWER

function openImageViewer(
    imageUrl,
    fileName
) {

    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "image-viewer-overlay";


    const viewer =
        document.createElement(
            "div"
        );

    viewer.className =
        "image-viewer";


    const closeButton =
        document.createElement(
            "button"
        );

    closeButton.className =
        "image-viewer-close";

    closeButton.textContent =
        "×";

    closeButton.setAttribute(
        "aria-label",
        "Close image"
    );


    const largeImage =
        document.createElement(
            "img"
        );

    largeImage.className =
        "image-viewer-image";

    largeImage.src =
        imageUrl;

    largeImage.alt =
        fileName;


    closeButton.addEventListener(
        "click",
        function () {

            closeImageViewer(
                overlay
            );
        }
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                closeImageViewer(
                    overlay
                );
            }
        }
    );


    viewer.appendChild(
        closeButton
    );

    viewer.appendChild(
        largeImage
    );

    overlay.appendChild(
        viewer
    );

    document.body.appendChild(
        overlay
    );
}


// CLOSE IMAGE VIEWER

function closeImageViewer(
    overlay
) {

    overlay.remove();
}


// INITIALIZE HISTORY

async function initializeHistory() {

    const user =
        await loadCurrentUser();

    if (!user) {
        return;
    }


    const userId =
        await loadUserId(
            user
        );

    if (
        userId === null
    ) {

        historyMessage.textContent =
            "Unable to identify your LabScriptor account.";

        return;
    }


    const experiments =
        await loadExperiments(
            userId
        );


    await loadAllHistoryImages(
        experiments
    );
}


// START

initializeHistory();