// SUPABASE CONFIGURATION

const SUPABASE_URL = 
    "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// DOM ELEMENTS

const experimentName =
    document.getElementById("experimentName");

const experimentStatus =
    document.getElementById("experimentStatus");

const startTime =
    document.getElementById("startTime");

const endTime =
    document.getElementById("endTime");

const duration =
    document.getElementById("duration");

const observationCount =
    document.getElementById("observationCount");

const observationMessage =
    document.getElementById("observationMessage");

const observationList =
    document.getElementById("observationList");

const imageMessage =
    document.getElementById("imageMessage");

const imageList =
    document.getElementById("imageList");

const imageInput =
    document.getElementById("imageInput");

const uploadImageButton =
    document.getElementById("uploadImageButton");

const uploadImageMessage =
    document.getElementById("uploadImageMessage");

const imageUploadSection =
    document.getElementById("imageUploadSection");

const editModeButton =
    document.getElementById("editModeButton");

const historyButton =
    document.getElementById("historyButton");

const logoutButton =
    document.getElementById("logoutButton");


// VARIABLES

let currentExperiment = null;
let editMode = false;


// NAVIGATION

historyButton.addEventListener("click", function() {
    window.location.href = "history.html";
});

logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        return;
    }

    window.location.href = "login.html";
});


// GET SESSION ID

function getSessionId() {

    const urlParams =
        new URLSearchParams(window.location.search);

    return urlParams.get("session_id");
}


// CHECK EDIT MODE FROM URL

function checkEditModeFromUrl() {

    const urlParams =
        new URLSearchParams(window.location.search);

    const editParameter =
        urlParams.get("edit");

    if (editParameter === "true") {
        editMode = true;
    }
}


// CHECK IF EXPERIMENT IS COMPLETED

function isExperimentCompleted(status) {

    if (!status) {
        return false;
    }

    const normalizedStatus =
        status.toLowerCase();

    return (
        normalizedStatus === "completed" ||
        normalizedStatus === "finished"
    );
}


// UPDATE EDIT MODE UI

function updateEditModeUI() {

    if (!currentExperiment) {
        return;
    }

    const completed =
        isExperimentCompleted(
            currentExperiment.status
        );

    if (!completed) {

        editModeButton.style.display = "none";
        imageUploadSection.style.display = "none";

        return;
    }

    editModeButton.style.display = "inline-block";

    if (editMode) {

        editModeButton.textContent =
            "Done Editing";

        imageUploadSection.style.display =
            "flex";

    } else {

        editModeButton.textContent =
            "Edit Experiment";

        imageUploadSection.style.display =
            "none";
    }
}


// EDIT MODE BUTTON

editModeButton.addEventListener("click", function() {

    if (!currentExperiment) {
        return;
    }

    if (!isExperimentCompleted(currentExperiment.status)) {
        return;
    }

    editMode = !editMode;

    updateEditModeUI();

    if (currentExperiment.session_id) {
        loadObservations(
            currentExperiment.session_id
        );

        loadExperimentImages(
            currentExperiment.session_id
        );
    }
});


// LOAD EXPERIMENT

async function loadExperiment(sessionId) {

    try {

        const response = await fetch(
            "http://localhost:3000/api/process-sessions/" +
            sessionId
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load experiment"
            );
        }

        currentExperiment =
            data.processSession ||
            data.process_session ||
            data.session ||
            data;

        displayExperiment(
            currentExperiment
        );

        updateEditModeUI();

        await loadObservations(sessionId);

        await loadExperimentImages(sessionId);

    } catch (error) {

        console.error(
            "Load experiment error:",
            error
        );

        experimentName.textContent =
            "Unable to load experiment";

        experimentStatus.textContent =
            error.message;
    }
}


// DISPLAY EXPERIMENT

function displayExperiment(experiment) {

    if (!experiment) {

        experimentName.textContent =
            "Experiment not found";

        experimentStatus.textContent =
            "Unable to retrieve experiment details.";

        return;
    }

    experimentName.textContent =
        experiment.process_name || "Experiment";

    experimentStatus.textContent =
        experiment.status || "Unknown";

    if (experiment.start_time) {

        startTime.textContent =
            formatDateTime(
                experiment.start_time
            );

    } else {

        startTime.textContent =
            "Not available";
    }

    if (experiment.end_time) {

        endTime.textContent =
            formatDateTime(
                experiment.end_time
            );

    } else {

        endTime.textContent =
            "Not available";
    }

    if (
        experiment.start_time &&
        experiment.end_time
    ) {

        duration.textContent =
            formatDuration(
                experiment.start_time,
                experiment.end_time
            );

    } else {

        duration.textContent =
            "Not available";
    }
}


// FORMAT DATE AND TIME

function formatDateTime(dateTime) {

    return new Date(dateTime).toLocaleString(
        "en-SG",
        {
            dateStyle: "medium",
            timeStyle: "medium"
        }
    );
}


// FORMAT DURATION

function formatDuration(start, end) {

    const startDate =
        new Date(start);

    const endDate =
        new Date(end);

    const difference =
        endDate.getTime() -
        startDate.getTime();

    if (difference < 0) {
        return "Not available";
    }

    const totalSeconds =
        Math.floor(difference / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {

        return (
            hours +
            "h " +
            minutes +
            "m " +
            seconds +
            "s"
        );
    }

    if (minutes > 0) {

        return (
            minutes +
            "m " +
            seconds +
            "s"
        );
    }

    return seconds + "s";
}


// LOAD OBSERVATIONS

async function loadObservations(sessionId) {

    try {

        const response = await fetch(
            "http://localhost:3000/api/observations/" +
            sessionId
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load observations"
            );
        }

        const observations =
            data.observations || [];

        observationCount.textContent =
            observations.length;

        displayObservations(
            observations
        );

    } catch (error) {

        console.error(
            "Load observations error:",
            error
        );

        observationMessage.textContent =
            "Unable to load observations.";
    }
}


// DISPLAY OBSERVATIONS

function displayObservations(observations) {

    observationList.innerHTML = "";

    if (observations.length === 0) {

        observationMessage.textContent =
            "No observations recorded.";

        return;
    }

    observationMessage.textContent = "";

    observations.forEach(function(observation, index) {

        const card =
            document.createElement("div");

        card.className =
            "observation-card";

        const meta =
            document.createElement("div");

        meta.className =
            "observation-meta";

        const title =
            document.createElement("strong");

        title.textContent =
            "Observation " + (index + 1);

        const recordedAt =
            document.createElement("span");

        recordedAt.textContent =
            observation.recorded_at
                ? formatDateTime(
                    observation.recorded_at
                )
                : "Unknown time";

        meta.appendChild(title);
        meta.appendChild(recordedAt);

        const text =
            document.createElement("p");

        text.className =
            "observation-text";

        text.textContent =
            observation.observation;

        card.appendChild(meta);
        card.appendChild(text);

        if (editMode) {

            const actions =
                document.createElement("div");

            actions.className =
                "observation-actions";

            const editButton =
                document.createElement("button");

            editButton.className =
                "edit-observation-button";

            editButton.textContent =
                "Edit";

            editButton.addEventListener(
                "click",
                function() {
                    startObservationEdit(
                        observation,
                        card
                    );
                }
            );

            actions.appendChild(editButton);

            card.appendChild(actions);
        }

        observationList.appendChild(card);
    });
}


// START OBSERVATION EDIT

function startObservationEdit(
    observation,
    card
) {

    const textElement =
        card.querySelector(
            ".observation-text"
        );

    const actions =
        card.querySelector(
            ".observation-actions"
        );

    if (!textElement || !actions) {
        return;
    }

    textElement.style.display =
        "none";

    actions.innerHTML = "";

    const textarea =
        document.createElement("textarea");

    textarea.className =
        "observation-edit-input";

    textarea.value =
        observation.observation;

    textarea.rows = 4;

    const saveButton =
        document.createElement("button");

    saveButton.className =
        "save-observation-button";

    saveButton.textContent =
        "Save";

    const cancelButton =
        document.createElement("button");

    cancelButton.className =
        "cancel-observation-button";

    cancelButton.textContent =
        "Cancel";

    saveButton.addEventListener(
        "click",
        function() {

            updateObservation(
                observation.observation_id,
                textarea.value
            );
        }
    );

    cancelButton.addEventListener(
        "click",
        function() {

            textElement.style.display =
                "";

            actions.innerHTML = "";

            const editButton =
                document.createElement("button");

            editButton.className =
                "edit-observation-button";

            editButton.textContent =
                "Edit";

            editButton.addEventListener(
                "click",
                function() {
                    startObservationEdit(
                        observation,
                        card
                    );
                }
            );

            actions.appendChild(
                editButton
            );
        }
    );

    card.insertBefore(
        textarea,
        textElement
    );

    actions.appendChild(
        saveButton
    );

    actions.appendChild(
        cancelButton
    );
}


// UPDATE OBSERVATION

async function updateObservation(
    observationId,
    observation
) {

    if (!observation.trim()) {

        alert(
            "Observation cannot be empty."
        );

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/observations/" +
            observationId,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    observation:
                        observation.trim()
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update observation"
            );
        }

        await loadObservations(
            currentExperiment.session_id
        );

    } catch (error) {

        console.error(
            "Update observation error:",
            error
        );

        alert(
            "Unable to update observation."
        );
    }
}


// LOAD EXPERIMENT IMAGES

async function loadExperimentImages(sessionId) {

    try {

        const response = await fetch(
            "http://localhost:3000/api/images/" +
            sessionId
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load images"
            );
        }

        displayExperimentImages(
            data.images || []
        );

    } catch (error) {

        console.error(
            "Load images error:",
            error
        );

        imageMessage.textContent =
            "Unable to load images.";
    }
}


// DISPLAY EXPERIMENT IMAGES

function displayExperimentImages(images) {

    imageList.innerHTML = "";

    if (images.length === 0) {

        imageMessage.textContent =
            "No images uploaded.";

        return;
    }

    imageMessage.textContent = "";

    images.forEach(function(image) {

        const card =
            document.createElement("div");

        card.className =
            "experiment-image-card";

        const imageElement =
            document.createElement("img");

        imageElement.src =
            image.image_url;

        imageElement.alt =
            image.file_name;

        imageElement.addEventListener(
            "click",
            function() {

                openImageViewer(
                    image.image_url,
                    image.file_name
                );
            }
        );

        const fileName =
            document.createElement("p");

        fileName.className =
            "image-file-name";

        fileName.textContent =
            formatFileName(
                image.file_name
            );

        const recordedAt =
            document.createElement("p");

        recordedAt.className =
            "image-recorded-time";

        recordedAt.textContent =
            image.recorded_at
                ? formatDateTime(
                    image.recorded_at
                )
                : "Unknown time";

        card.appendChild(
            imageElement
        );

        card.appendChild(
            fileName
        );

        card.appendChild(
            recordedAt
        );

        if (editMode) {

            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-image-button";

            deleteButton.textContent =
                "Delete Image";

            deleteButton.addEventListener(
                "click",
                function() {

                    deleteImage(
                        image.image_id
                    );
                }
            );

            card.appendChild(
                deleteButton
            );
        }

        imageList.appendChild(card);
    });
}


// UPLOAD IMAGE

uploadImageButton.addEventListener(
    "click",
    async function() {

        const file =
            imageInput.files[0];

        if (!file) {

            uploadImageMessage.textContent =
                "Please select an image first.";

            return;
        }

        if (!currentExperiment) {

            uploadImageMessage.textContent =
                "Experiment information is unavailable.";

            return;
        }

        uploadImageMessage.textContent =
            "Uploading image...";

        uploadImageButton.disabled =
            true;

        try {

            const formData =
                new FormData();

            formData.append(
                "image",
                file
            );

            formData.append(
                "session_id",
                currentExperiment.session_id
            );

            const response = await fetch(
                "http://localhost:3000/api/images",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to upload image"
                );
            }

            uploadImageMessage.textContent =
                "Image uploaded successfully.";

            imageInput.value = "";

            await loadExperimentImages(
                currentExperiment.session_id
            );

        } catch (error) {

            console.error(
                "Upload image error:",
                error
            );

            uploadImageMessage.textContent =
                error.message ||
                "Unable to upload image.";

        } finally {

            uploadImageButton.disabled =
                false;
        }
    }
);


// DELETE IMAGE

async function deleteImage(imageId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this image?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/images/" +
            imageId,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete image"
            );
        }

        await loadExperimentImages(
            currentExperiment.session_id
        );

    } catch (error) {

        console.error(
            "Delete image error:",
            error
        );

        alert(
            "Unable to delete image."
        );
    }
}


// FORMAT FILE NAME

function formatFileName(fileName) {

    if (!fileName) {
        return "Unknown file";
    }

    if (fileName.length <= 25) {
        return fileName;
    }

    return (
        fileName.substring(0, 22) +
        "..."
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
        function() {

            closeImageViewer(
                overlay
            );
        }
    );


    overlay.addEventListener(
        "click",
        function(event) {

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

// INITIALIZE

async function initializeExperimentPage() {

    checkEditModeFromUrl();

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (!session) {

        window.location.href =
            "login.html";

        return;
    }

    const sessionId =
        getSessionId();

    if (!sessionId) {

        experimentName.textContent =
            "Experiment not found";

        experimentStatus.textContent =
            "No session ID provided.";

        editModeButton.style.display =
            "none";

        return;
    }

    await loadExperiment(
        sessionId
    );
}

initializeExperimentPage();