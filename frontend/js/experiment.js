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

const addObservationButton =
    document.getElementById("addObservationButton");

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

const exportDocxButton = 
    document.getElementById("exportDocxButton");

const historyButton =
    document.getElementById("historyButton");

const logoutButton =
    document.getElementById("logoutButton");

const brandIcon =
    document.querySelector(".app-brand-icon");


// VARIABLES

let currentExperiment = null;

let editMode = false;

let currentObservations = [];

let currentImages = [];


// NAVIGATION

if (historyButton) {

    historyButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "history.html";
        }
    );
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            const result =
                await supabaseClient.auth.signOut();

            const error =
                result.error;

            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                return;
            }

            window.location.href =
                "login.html";
        }
    );
}


if (brandIcon) {

    brandIcon.addEventListener(
        "click",
        function() {

            window.location.href =
                "process.html";
        }
    );
}


// GET SESSION ID

function getSessionId() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    return urlParams.get(
        "session_id"
    );
}


// UPDATE EDIT MODE UI

function updateEditModeUI() {

    if (!editModeButton) {

        return;
    }


    // Edit Experiment is always available.

    editModeButton.style.display =
        "inline-block";


    if (editMode) {

        editModeButton.textContent =
            "Done Editing";


        if (addObservationButton) {

            addObservationButton.style.display =
                "inline-flex";
        }


        if (imageUploadSection) {

            imageUploadSection.style.display =
                "flex";
        }

    } else {

        editModeButton.textContent =
            "Edit Experiment";


        if (addObservationButton) {

            addObservationButton.style.display =
                "none";
        }


        if (imageUploadSection) {

            imageUploadSection.style.display =
                "none";
        }
    }


    displayObservations(
        currentObservations
    );


    displayExperimentImages(
        currentImages
    );
}


// EDIT MODE BUTTON

if (editModeButton) {

    editModeButton.addEventListener(
        "click",
        function() {

            if (!currentExperiment) {

                return;
            }


            editMode =
                !editMode;


            updateEditModeUI();
        }
    );
}


// EXPORT DOCX BUTTON

if (exportDocxButton) {

    exportDocxButton.addEventListener(
        "click",
        exportExperimentToDocx
    );
}


// ADD OBSERVATION BUTTON

if (addObservationButton) {

    addObservationButton.addEventListener(
        "click",
        function() {

            if (!editMode) {

                return;
            }


            startNewObservation();
        }
    );
}

// LOAD EXPERIMENT

async function loadExperiment() {

    const sessionId =
        getSessionId();


    if (!sessionId) {

        console.error(
            "No session ID found."
        );


        if (experimentName) {

            experimentName.textContent =
                "Experiment not found";
        }


        if (experimentStatus) {

            experimentStatus.textContent =
                "No session ID provided.";
        }


        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/process-sessions/" +
                sessionId
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load experiment"
            );
        }


        console.log(
            "Process session API response:",
            data
        );


        let experiment =
            data;


        // HANDLE DIFFERENT API RESPONSE STRUCTURES

        if (
            data.data &&
            !Array.isArray(data.data)
        ) {

            experiment =
                data.data;
        }


        if (
            data.session &&
            !Array.isArray(data.session)
        ) {

            experiment =
                data.session;
        }


        if (
            data.processSession &&
            !Array.isArray(data.processSession)
        ) {

            experiment =
                data.processSession;
        }


        if (
            data.process_session &&
            !Array.isArray(data.process_session)
        ) {

            experiment =
                data.process_session;
        }


        if (
            data.processSessionData &&
            !Array.isArray(data.processSessionData)
        ) {

            experiment =
                data.processSessionData;
        }


        console.log(
            "Experiment object used by page:",
            experiment
        );


        if (
            !experiment ||
            typeof experiment !== "object"
        ) {

            throw new Error(
                "Experiment data was not found."
            );
        }


        // ALWAYS USE THE SESSION ID FROM THE URL

        const actualSessionId =
            sessionId;


        currentExperiment =
            experiment;


        currentExperiment.session_id =
            actualSessionId;


        displayExperiment(
            currentExperiment
        );


        await loadObservations(
            actualSessionId
        );


        await loadExperimentImages(
            actualSessionId
        );


        updateEditModeUI();


    } catch (error) {

        console.error(
            "Load experiment error:",
            error
        );


        if (experimentName) {

            experimentName.textContent =
                "Unable to load experiment";
        }


        if (experimentStatus) {

            experimentStatus.textContent =
                "Error loading experiment";
        }
    }
}


// DISPLAY EXPERIMENT

function displayExperiment(experiment) {
    if (!experiment) {
        return;
    }

    const experimentNameValue =
        experiment.process_name ||
        experiment.processName ||
        experiment.name ||
        "Unnamed Experiment";

    const startTimeValue =
        experiment.start_time ||
        experiment.startTime ||
        experiment.started_at ||
        experiment.startedAt;

    const endTimeValue =
        experiment.end_time ||
        experiment.endTime ||
        experiment.ended_at ||
        experiment.endedAt;

    experimentName.textContent =
        experimentNameValue;

    if (endTimeValue) {
        experimentStatus.textContent = "Experiment Completed";
    } else if (startTimeValue) {
        experimentStatus.textContent = "Experiment Active";
    } else {
        experimentStatus.textContent = "Ready";
    }

    startTime.textContent =
        formatDateTime(startTimeValue);

    endTime.textContent =
        formatDateTime(endTimeValue);

    duration.textContent =
        formatDuration(
            startTimeValue,
            endTimeValue
        );
}


// FORMAT DATE AND TIME

function formatDateTime(
    dateTime
) {

    if (!dateTime) {

        return "Not available";
    }


    const date =
        new Date(dateTime);


    if (isNaN(date.getTime())) {

        return "Not available";
    }


    return date.toLocaleString(
        "en-SG",
        {
            dateStyle: "medium",
            timeStyle: "medium"
        }
    );
}


// FORMAT DURATION

function formatDuration(
    start,
    end
) {

    const startDate =
        new Date(start);

    const endDate =
        new Date(end);


    if (
        isNaN(startDate.getTime()) ||
        isNaN(endDate.getTime())
    ) {

        return "Not available";
    }


    const difference =
        endDate.getTime() -
        startDate.getTime();


    if (difference < 0) {

        return "Not available";
    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    return formatDurationSeconds(
        totalSeconds
    );
}


// FORMAT STORED DURATION

function formatStoredDuration(
    storedDuration
) {

    if (
        storedDuration ===
            undefined ||
        storedDuration ===
            null ||
        storedDuration ===
            ""
    ) {

        return "Not available";
    }


    // DATABASE DURATION IS A NUMBER

    if (
        typeof storedDuration ===
        "number"
    ) {

        return formatDurationSeconds(
            Math.floor(
                storedDuration
            )
        );
    }


    // DATABASE DURATION IS TEXT

    if (
        typeof storedDuration ===
        "string"
    ) {

        // Already formatted duration

        if (
            storedDuration.includes("h") ||
            storedDuration.includes("m") ||
            storedDuration.includes("s")
        ) {

            return storedDuration;
        }


        const numericDuration =
            Number(
                storedDuration
            );


        if (
            !isNaN(numericDuration)
        ) {

            return formatDurationSeconds(
                Math.floor(
                    numericDuration
                )
            );
        }


        return storedDuration;
    }


    return "Not available";
}


// FORMAT DURATION SECONDS

function formatDurationSeconds(
    totalSeconds
) {

    if (
        isNaN(totalSeconds) ||
        totalSeconds < 0
    ) {

        return "Not available";
    }


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


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

// =========================
// OBSERVATIONS
// =========================


// CREATE OBSERVATION

async function createObservation(
    observation
) {

    if (!currentExperiment) {

        alert(
            "Unable to save the observation because the experiment information is unavailable."
        );

        return null;
    }


    if (!observation.trim()) {

        alert(
            "Observation cannot be empty."
        );

        return null;
    }


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/observations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        session_id:
                            currentExperiment.session_id,

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
                "Failed to create observation"
            );
        }


        /*
         * Return the created observation
         * so it can be added directly to
         * the current page.
         */

        if (data.observation) {

            return data.observation;
        }


        if (data.data) {

            return data.data;
        }


        return {
            observation:
                observation.trim()
        };


    } catch (error) {

        console.error(
            "Create observation error:",
            error
        );


        alert(
            error.message ||
            "Unable to add the observation."
        );


        return null;
    }
}


// LOAD OBSERVATIONS

async function loadObservations(
    sessionId
) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/observations/" +
                sessionId
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load observations"
            );
        }


        let observations = [];


        if (Array.isArray(data)) {

            observations =
                data;

        } else if (
            Array.isArray(
                data.observations
            )
        ) {

            observations =
                data.observations;

        } else if (
            data.data &&
            Array.isArray(data.data)
        ) {

            observations =
                data.data;

        } else if (
            data.data &&
            Array.isArray(
                data.data.observations
            )
        ) {

            observations =
                data.data.observations;
        }


        currentObservations =
            observations;


        if (observationCount) {

            observationCount.textContent =
                observations.length;
        }


        displayObservations(
            observations
        );


        return true;


    } catch (error) {

        console.error(
            "Load observations error:",
            error
        );


        /*
         * IMPORTANT:
         * Do NOT clear currentObservations here.
         *
         * If the GET request fails after an
         * observation has been saved or edited,
         * clearing the array makes the observation
         * disappear from the screen even though
         * it may still exist in the database.
         */

        if (observationMessage) {

            observationMessage.textContent =
                "Unable to refresh observations.";
        }


        return false;
    }
}


// DISPLAY OBSERVATIONS

function displayObservations(
    observations
) {

    if (!observationList) {

        return;
    }


    observationList.innerHTML =
        "";


    if (
        !observations ||
        observations.length === 0
    ) {

        if (observationMessage) {

            if (editMode) {

                observationMessage.textContent =
                    "No observations recorded. You can add one now.";

            } else {

                observationMessage.textContent =
                    "No observations recorded.";
            }
        }


        if (observationCount) {

            observationCount.textContent =
                "0";
        }


        return;
    }


    if (observationMessage) {

        observationMessage.textContent =
            "";
    }


    if (observationCount) {

        observationCount.textContent =
            observations.length;
    }


    observations.forEach(
        function(
            observation,
            index
        ) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "observation-card";


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "observation-meta";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                "Observation " +
                (index + 1);


            const recordedAt =
                document.createElement(
                    "span"
                );


            if (observation.recorded_at) {

                recordedAt.textContent =
                    formatDateTime(
                        observation.recorded_at
                    );

            } else {

                recordedAt.textContent =
                    "Unknown time";
            }


            meta.appendChild(
                title
            );


            meta.appendChild(
                recordedAt
            );


            const text =
                document.createElement(
                    "p"
                );


            text.className =
                "observation-text";


            text.textContent =
                observation.observation ||
                observation.observation_text ||
                "";


            card.appendChild(
                meta
            );


            card.appendChild(
                text
            );


            if (editMode) {

                const actions =
                    document.createElement(
                        "div"
                    );


                actions.className =
                    "observation-actions";


                createObservationActionButtons(
                    observation,
                    card,
                    actions
                );


                card.appendChild(
                    actions
                );
            }


            observationList.appendChild(
                card
            );
        }
    );
}


// CREATE OBSERVATION ACTION BUTTONS

function createObservationActionButtons(
    observation,
    card,
    actions
) {

    const editButton =
        document.createElement(
            "button"
        );


    editButton.type =
        "button";


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


    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "delete-observation-button";


    deleteButton.textContent =
        "Delete";


    deleteButton.addEventListener(
        "click",
        function() {

            deleteObservation(
                observation.observation_id
            );
        }
    );


    actions.appendChild(
        editButton
    );


    actions.appendChild(
        deleteButton
    );
}


// START NEW OBSERVATION

function startNewObservation() {

    if (!editMode) {

        return;
    }


    if (!observationList) {

        return;
    }


    const existingEditor =
        document.querySelector(
            ".new-observation-editor"
        );


    if (existingEditor) {

        return;
    }


    const editor =
        document.createElement(
            "div"
        );


    editor.className =
        "new-observation-editor";


    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.className =
        "observation-edit-input";


    textarea.placeholder =
        "Enter observation...";


    textarea.rows =
        4;


    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "observation-actions";


    const saveButton =
        document.createElement(
            "button"
        );


    saveButton.type =
        "button";


    saveButton.className =
        "save-observation-button";


    saveButton.textContent =
        "Save Observation";


    const cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.type =
        "button";


    cancelButton.className =
        "cancel-observation-button";


    cancelButton.textContent =
        "Cancel";


    saveButton.addEventListener(
        "click",
        async function() {

            const observation =
                textarea.value.trim();


            if (!observation) {

                alert(
                    "Observation cannot be empty."
                );

                return;
            }


            saveButton.disabled =
                true;


            const created =
                await createObservation(
                    observation
                );


            if (created) {

                /*
                 * Add the new observation
                 * directly to the local array.
                 */

                currentObservations.push(
                    created
                );


                editor.remove();


                displayObservations(
                    currentObservations
                );

            } else {

                /*
                 * Keep the editor open
                 * when saving fails.
                 */

                saveButton.disabled =
                    false;
            }
        }
    );


    cancelButton.addEventListener(
        "click",
        function() {

            editor.remove();
        }
    );


    actions.appendChild(
        saveButton
    );


    actions.appendChild(
        cancelButton
    );


    editor.appendChild(
        textarea
    );


    editor.appendChild(
        actions
    );


    observationList.prepend(
        editor
    );


    textarea.focus();
}


// EDIT OBSERVATION

function startObservationEdit(
    observation,
    card
) {

    if (!editMode) {

        return;
    }


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


    actions.innerHTML =
        "";


    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.className =
        "observation-edit-input";


    textarea.value =
        observation.observation ||
        observation.observation_text ||
        "";


    textarea.rows =
        4;


    const saveButton =
        document.createElement(
            "button"
        );


    saveButton.type =
        "button";


    saveButton.className =
        "save-observation-button";


    saveButton.textContent =
        "Save";


    const cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.type =
        "button";


    cancelButton.className =
        "cancel-observation-button";


    cancelButton.textContent =
        "Cancel";


    saveButton.addEventListener(
        "click",
        async function() {

            const newObservation =
                textarea.value.trim();


            if (!newObservation) {

                alert(
                    "Observation cannot be empty."
                );

                return;
            }


            saveButton.disabled =
                true;


            const updated =
                await updateObservation(
                    observation.observation_id,
                    newObservation
                );


            if (updated) {

                /*
                 * Update the existing observation
                 * directly in the local array.
                 */

                observation.observation =
                    updated.observation ||
                    newObservation;


                if (
                    updated.recorded_at
                ) {

                    observation.recorded_at =
                        updated.recorded_at;
                }


                displayObservations(
                    currentObservations
                );
            } else {

                /*
                 * Keep the editor open when
                 * the update fails.
                 */

                saveButton.disabled =
                    false;
            }
        }
    );


    cancelButton.addEventListener(
        "click",
        function() {

            textarea.remove();


            textElement.style.display =
                "";


            actions.innerHTML =
                "";


            createObservationActionButtons(
                observation,
                card,
                actions
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


    textarea.focus();
}


// UPDATE OBSERVATION

async function updateObservation(
    observationId,
    observation
) {

    if (!editMode) {

        return null;
    }


    if (!observation.trim()) {

        alert(
            "Observation cannot be empty."
        );

        return null;
    }


    if (!observationId) {

        alert(
            "Unable to update observation because the observation ID is missing."
        );

        return null;
    }


    try {

        const response =
            await fetch(
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


        if (data.observation) {

            return data.observation;
        }


        if (data.data) {

            return data.data;
        }


        return {
            observation_id:
                observationId,

            observation:
                observation.trim()
        };


    } catch (error) {

        console.error(
            "Update observation error:",
            error
        );


        alert(
            error.message ||
            "Unable to update observation."
        );


        return null;
    }
}


// DELETE OBSERVATION

async function deleteObservation(
    observationId
) {

    if (!editMode) {

        return;
    }


    if (!observationId) {

        alert(
            "Unable to delete observation because the observation ID is missing."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this observation?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:3000/api/observations/" +
                observationId,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete observation"
            );
        }


        /*
         * Remove only the successfully deleted
         * observation from the local array.
         */

        currentObservations =
            currentObservations.filter(
                function(item) {

                    return (
                        item.observation_id !==
                        observationId
                    );
                }
            );


        displayObservations(
            currentObservations
        );


    } catch (error) {

        console.error(
            "Delete observation error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete observation."
        );
    }
}


// =========================
// IMAGES
// =========================


// LOAD EXPERIMENT IMAGES

async function loadExperimentImages(
    sessionId
) {

    try {

        const response =
            await fetch(
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


        let images = [];


        if (Array.isArray(data)) {

            images =
                data;

        } else if (
            Array.isArray(
                data.images
            )
        ) {

            images =
                data.images;

        } else if (
            data.data &&
            Array.isArray(
                data.data.images
            )
        ) {

            images =
                data.data.images;

        } else if (
            data.data &&
            Array.isArray(data.data)
        ) {

            images =
                data.data;
        }


        currentImages =
            images;


        displayExperimentImages(
            images
        );


        return true;


    } catch (error) {

        console.error(
            "Load images error:",
            error
        );


        /*
         * Do not erase currentImages when
         * a refresh request fails.
         */

        if (imageMessage) {

            imageMessage.textContent =
                "Unable to refresh images.";
        }


        return false;
    }
}


function formatFileName(fileName) {
    if (!fileName) {
        return "Unnamed file";
    }

    if (fileName.length <= 33) {
        return fileName;
    }

    return fileName.substring(0, 30) + "...";
}


// DISPLAY EXPERIMENT IMAGES

function displayExperimentImages(
    images
) {

    if (!imageList) {

        return;
    }


    imageList.innerHTML =
        "";


    if (
        !images ||
        images.length === 0
    ) {

        if (imageMessage) {

            if (editMode) {

                imageMessage.textContent =
                    "No images uploaded. You can upload one now.";

            } else {

                imageMessage.textContent =
                    "No images uploaded.";
            }
        }


        return;
    }


    if (imageMessage) {

        imageMessage.textContent =
            "";
    }


    images.forEach(
        function(image) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "experiment-image-card";


            const imageElement =
                document.createElement(
                    "img"
                );


            imageElement.src =
                image.image_url;


            imageElement.alt =
                image.file_name ||
                "Experiment image";


            /*
             * Existing images can always
             * be clicked to enlarge.
             */

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
                document.createElement(
                    "p"
                );


            fileName.className =
                "image-file-name";


            fileName.textContent =
                formatFileName(
                    image.file_name
                );


            const recordedAt =
                document.createElement(
                    "p"
                );


            recordedAt.className =
                "image-recorded-time";


            if (image.recorded_at) {

                recordedAt.textContent =
                    formatDateTime(
                        image.recorded_at
                    );

            } else {

                recordedAt.textContent =
                    "Unknown time";
            }


            card.appendChild(
                imageElement
            );


            card.appendChild(
                fileName
            );


            card.appendChild(
                recordedAt
            );


            /*
             * DELETE IMAGE BUTTON
             */

            if (editMode) {

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "delete-image-button";


                deleteButton.textContent =
                    "Delete Image";


                deleteButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();


                        deleteImage(
                            image.image_id
                        );
                    }
                );


                card.appendChild(
                    deleteButton
                );
            }


            imageList.appendChild(
                card
            );
        }
    );
}


// UPLOAD IMAGE

if (uploadImageButton) {

    uploadImageButton.addEventListener(
        "click",
        async function() {

            if (!editMode) {

                return;
            }


            if (!imageInput) {

                return;
            }


            const file =
                imageInput.files[0];


            if (!file) {

                if (uploadImageMessage) {

                    uploadImageMessage.textContent =
                        "Please select an image first.";
                }

                return;
            }


            if (!file.type.startsWith("image/")) {

                if (uploadImageMessage) {

                    uploadImageMessage.textContent =
                        "Please select an image file.";
                }

                return;
            }


            if (!currentExperiment) {

                if (uploadImageMessage) {

                    uploadImageMessage.textContent =
                        "Experiment information is unavailable.";
                }

                return;
            }


            if (uploadImageMessage) {

                uploadImageMessage.textContent =
                    "Uploading image...";
            }


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


                const response =
                    await fetch(
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


                if (uploadImageMessage) {

                    uploadImageMessage.textContent =
                        "Image uploaded successfully.";
                }


                /*
                 * Only clear the selected file
                 * after successful upload.
                 */

                imageInput.value =
                    "";


                await loadExperimentImages(
                    currentExperiment.session_id
                );


            } catch (error) {

                console.error(
                    "Upload image error:",
                    error
                );


                if (uploadImageMessage) {

                    uploadImageMessage.textContent =
                        error.message ||
                        "Unable to upload image.";
                }

            } finally {

                uploadImageButton.disabled =
                    false;
            }
        }
    );
}


// DELETE IMAGE

async function deleteImage(
    imageId
) {

    if (!editMode) {

        return;
    }


    if (!imageId) {

        alert(
            "Unable to delete image because the image ID is missing."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this image?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
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


        /*
         * Remove the successfully deleted
         * image from the local array.
         */

        currentImages =
            currentImages.filter(
                function(item) {

                    return (
                        item.image_id !==
                        imageId
                    );
                }
            );


        displayExperimentImages(
            currentImages
        );


    } catch (error) {

        console.error(
            "Delete image error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete image."
        );
    }
}


// FORMAT DURATION

function formatDuration(startTime, endTime) {
    if (!startTime || !endTime) {
        return "Not available";
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return "Not available";
    }

    const difference = end.getTime() - start.getTime();

    if (difference < 0) {
        return "Not available";
    }

    const totalSeconds = Math.round(difference / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

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

    return totalSeconds + "s";
}


// =========================
// IMAGE VIEWER
// =========================


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


    closeButton.type =
        "button";


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
        fileName ||
        "Experiment image";


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

    if (overlay) {

        overlay.remove();
    }
}


// =========================
// DOCX EXPORT
// =========================

async function exportExperimentToDocx() {

    if (!currentExperiment) {
        alert("Unable to export experiment data.");
        return;
    }

    try {

        exportDocxButton.disabled = true;
        exportDocxButton.textContent = "Preparing...";


        const experimentTitle =
            getExperimentExportName(
                currentExperiment
            );


        const experimentStartTime =
            getExperimentStartTime(
                currentExperiment
            );


        const experimentEndTime =
            getExperimentEndTime(
                currentExperiment
            );


        const experimentStatus =
            getExperimentStatus(
                currentExperiment
            );


        const experimentDuration =
            getExperimentDuration(
                currentExperiment
            );


        const observationItems =
            currentObservations || [];


        const imageItems =
            currentImages || [];


        const children = [];


        // DOCUMENT TITLE

        children.push(
            new docx.Paragraph({
                text: "LabScriptor",
                heading: docx.HeadingLevel.TITLE,
                alignment: docx.AlignmentType.CENTER,
                spacing: {
                    after: 100
                }
            })
        );


        children.push(
            new docx.Paragraph({
                text: "Experiment Report",
                alignment: docx.AlignmentType.CENTER,
                spacing: {
                    after: 400
                },
                run: {
                    color: "666666",
                    size: 24
                }
            })
        );


        // EXPERIMENT NAME

        children.push(
            new docx.Paragraph({
                text: experimentTitle,
                heading: docx.HeadingLevel.HEADING_1,
                spacing: {
                    before: 200,
                    after: 200
                }
            })
        );


        // EXPERIMENT INFORMATION

        children.push(
            new docx.Paragraph({
                text: "Experiment Information",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: {
                    before: 200,
                    after: 150
                }
            })
        );


        const informationRows = [
            createDocxTableRow(
                "Status",
                experimentStatus
            ),
            createDocxTableRow(
                "Start Time",
                experimentStartTime
            ),
            createDocxTableRow(
                "End Time",
                experimentEndTime
            ),
            createDocxTableRow(
                "Duration",
                experimentDuration
            ),
            createDocxTableRow(
                "Observations",
                String(observationItems.length)
            ),
            createDocxTableRow(
                "Images",
                String(imageItems.length)
            )
        ];


        children.push(
            new docx.Table({
                width: {
                    size: 100,
                    type: docx.WidthType.PERCENTAGE
                },
                rows: informationRows
            })
        );


        // OBSERVATIONS

        children.push(
            new docx.Paragraph({
                text: "Observations",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: {
                    before: 500,
                    after: 150
                }
            })
        );


        if (observationItems.length === 0) {

            children.push(
                new docx.Paragraph({
                    text: "No observations were recorded for this experiment.",
                    spacing: {
                        after: 200
                    }
                })
            );

        } else {

            for (
                let index = 0;
                index < observationItems.length;
                index++
            ) {

                const observation =
                    observationItems[index];


                const observationNumber =
                    index + 1;


                const observationText =
                    getObservationText(
                        observation
                    );


                const observationTime =
                    getObservationTime(
                        observation
                    );


                children.push(
                    new docx.Paragraph({
                        text:
                            "Observation " +
                            observationNumber,
                        heading: docx.HeadingLevel.HEADING_3,
                        spacing: {
                            before: 200,
                            after: 50
                        }
                    })
                );


                children.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Recorded: ",
                                bold: true
                            }),
                            new docx.TextRun({
                                text: observationTime
                            })
                        ],
                        spacing: {
                            after: 75
                        }
                    })
                );


                children.push(
                    new docx.Paragraph({
                        text: observationText,
                        spacing: {
                            after: 200
                        }
                    })
                );
            }
        }


        // IMAGES

        children.push(
            new docx.Paragraph({
                text: "Images",
                heading: docx.HeadingLevel.HEADING_2,
                spacing: {
                    before: 500,
                    after: 150
                }
            })
        );


        if (imageItems.length === 0) {

            children.push(
                new docx.Paragraph({
                    text: "No images were recorded for this experiment.",
                    spacing: {
                        after: 200
                    }
                })
            );

        } else {

            for (
                let index = 0;
                index < imageItems.length;
                index++
            ) {

                const image =
                    imageItems[index];


                const imageName =
                    getImageExportName(
                        image
                    );


                const imageTime =
                    getImageExportTime(
                        image
                    );


                children.push(
                    new docx.Paragraph({
                        text:
                            "Image " +
                            (index + 1),
                        heading: docx.HeadingLevel.HEADING_3,
                        spacing: {
                            before: 200,
                            after: 50
                        }
                    })
                );


                children.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "File: ",
                                bold: true
                            }),
                            new docx.TextRun({
                                text: imageName
                            })
                        ],
                        spacing: {
                            after: 50
                        }
                    })
                );


                children.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Recorded: ",
                                bold: true
                            }),
                            new docx.TextRun({
                                text: imageTime
                            })
                        ],
                        spacing: {
                            after: 100
                        }
                    })
                );


                try {

                    const imageData =
                        await getImageDataForDocx(
                            image
                        );


                    if (imageData) {

                        children.push(
                            new docx.Paragraph({
                                children: [
                                    new docx.ImageRun({
                                        data: imageData.data,
                                        transformation: {
                                            width: 450,
                                            height: imageData.height
                                        },
                                        type: imageData.type
                                    })
                                ],
                                alignment:
                                    docx.AlignmentType.CENTER,
                                spacing: {
                                    after: 250
                                }
                            })
                        );

                    } else {

                        children.push(
                            new docx.Paragraph({
                                text:
                                    "Image could not be embedded.",
                                spacing: {
                                    after: 200
                                }
                            })
                        );
                    }

                } catch (imageError) {

                    console.error(
                        "Unable to embed image:",
                        imageError
                    );


                    children.push(
                        new docx.Paragraph({
                            text:
                                "Image could not be embedded.",
                            spacing: {
                                after: 200
                            }
                        })
                    );
                }
            }
        }


        // CREATE DOCUMENT

        const docxDocument =
            new docx.Document({
                creator: "LabScriptor",
                title: experimentTitle,
                description:
                    "LabScriptor experiment report",

                styles: {
                    default: {
                        document: {
                            run: {
                                font: "Arial"
                            }
                        }
                    }
                },

                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 1500,
                                    right: 1500,
                                    bottom: 1500,
                                    left: 1500
                                }
                            }
                        },
                        children: children
                    }
                ]
            });


        // GENERATE DOCX

        const blob =
            await docx.Packer.toBlob(
                docxDocument
            );


        // DOWNLOAD

        const fileName =
            createExportFileName(
                experimentTitle
            );


        const downloadUrl =
            URL.createObjectURL(blob);


        const downloadLink =
            document.createElement("a");


        downloadLink.href =
            downloadUrl;


        downloadLink.download =
            fileName;


        document.body.appendChild(
            downloadLink
        );


        downloadLink.click();


        document.body.removeChild(
            downloadLink
        );


        URL.revokeObjectURL(
            downloadUrl
        );


        exportDocxButton.disabled = false;
        exportDocxButton.innerHTML =
            '<i class="fa-solid fa-file-word"></i> Export DOCX';


    } catch (error) {

        console.error(
            "DOCX export error:",
            error
        );


        alert(
            "Unable to export the experiment as a Word document."
        );


        exportDocxButton.disabled = false;
        exportDocxButton.innerHTML =
            '<i class="fa-solid fa-file-word"></i> Export DOCX';
    }
}



function createDocxTableRow(label, value) {

    return new docx.TableRow({
        children: [

            new docx.TableCell({
                width: {
                    size: 30,
                    type: docx.WidthType.PERCENTAGE
                },
                shading: {
                    fill: "EAF0F6"
                },
                children: [
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: label,
                                bold: true
                            })
                        ]
                    })
                ]
            }),


            new docx.TableCell({
                width: {
                    size: 70,
                    type: docx.WidthType.PERCENTAGE
                },
                children: [
                    new docx.Paragraph({
                        text: value
                    })
                ]
            })

        ]
    });
}



function getExperimentExportName(experiment) {

    if (!experiment) {
        return "Experiment";
    }


    return (
        experiment.process_name ||
        experiment.processName ||
        experiment.name ||
        "Experiment"
    );
}


function getExperimentStartTime(experiment) {

    if (!experiment) {
        return "Not available";
    }


    const value =
        experiment.start_time ||
        experiment.startTime ||
        experiment.started_at ||
        experiment.startedAt;


    if (!value) {
        return "Not available";
    }


    return formatDateTime(value);
}


function getExperimentEndTime(experiment) {

    if (!experiment) {
        return "Not available";
    }


    const value =
        experiment.end_time ||
        experiment.endTime ||
        experiment.ended_at ||
        experiment.endedAt;


    if (!value) {
        return "Not available";
    }


    return formatDateTime(value);
}


function getExperimentStatus(experiment) {

    if (!experiment) {
        return "Unknown";
    }


    const endTime =
        experiment.end_time ||
        experiment.endTime ||
        experiment.ended_at ||
        experiment.endedAt;


    const startTime =
        experiment.start_time ||
        experiment.startTime ||
        experiment.started_at ||
        experiment.startedAt;


    if (endTime) {
        return "Completed";
    }


    if (startTime) {
        return "Active";
    }


    return "Ready";
}


function getExperimentDuration(experiment) {

    if (!experiment) {
        return "Not available";
    }


    const start =
        experiment.start_time ||
        experiment.startTime ||
        experiment.started_at ||
        experiment.startedAt;


    const end =
        experiment.end_time ||
        experiment.endTime ||
        experiment.ended_at ||
        experiment.endedAt;


    if (start && end) {
        return formatDuration(
            start,
            end
        );
    }


    const storedDuration =
        experiment.duration;


    if (
        storedDuration !== undefined &&
        storedDuration !== null
    ) {
        return formatStoredDuration(
            storedDuration
        );
    }


    return "Not available";
}



function getObservationText(observation) {

    if (!observation) {
        return "No observation text.";
    }


    return (
        observation.observation_text ||
        observation.observation ||
        observation.text ||
        observation.content ||
        "No observation text."
    );
}


function getObservationTime(observation) {

    if (!observation) {
        return "Not available";
    }


    const value =
        observation.recorded_at ||
        observation.recordedAt ||
        observation.observation_time ||
        observation.observationTime ||
        observation.created_at ||
        observation.createdAt;


    if (!value) {
        return "Not available";
    }


    return formatDateTime(value);
}



function getImageExportName(image) {

    if (!image) {
        return "Unnamed image";
    }


    return (
        image.file_name ||
        image.fileName ||
        image.name ||
        "Unnamed image"
    );
}


function getImageExportTime(image) {

    if (!image) {
        return "Not available";
    }


    const value =
        image.recorded_at ||
        image.recordedAt ||
        image.created_at ||
        image.createdAt;


    if (!value) {
        return "Not available";
    }


    return formatDateTime(value);
}


function getImageExportUrl(image) {

    if (!image) {
        return null;
    }


    return (
        image.image_url ||
        image.imageUrl ||
        image.url ||
        image.public_url ||
        image.publicUrl ||
        image.file_url ||
        image.fileUrl ||
        null
    );
}


async function getImageDataForDocx(image) {

    const imageUrl =
        getImageExportUrl(image);


    if (!imageUrl) {
        return null;
    }


    const response =
        await fetch(imageUrl);


    if (!response.ok) {
        throw new Error(
            "Unable to download image."
        );
    }


    const blob =
        await response.blob();


    const arrayBuffer =
        await blob.arrayBuffer();


    const imageType =
        getDocxImageType(
            blob.type,
            imageUrl
        );


    const imageDimensions =
        await getImageDimensions(
            imageUrl
        );


    const maxWidth = 450;
    const originalWidth =
        imageDimensions.width;


    const originalHeight =
        imageDimensions.height;


    let finalWidth =
        maxWidth;


    let finalHeight =
        originalHeight;


    if (originalWidth > maxWidth) {

        finalHeight =
            Math.round(
                originalHeight *
                (maxWidth / originalWidth)
            );
    }


    return {
        data: new Uint8Array(arrayBuffer),
        type: imageType,
        height: finalHeight
    };
}


function getDocxImageType(mimeType, imageUrl) {

    if (
        mimeType === "image/jpeg" ||
        mimeType === "image/jpg"
    ) {
        return "jpg";
    }


    if (mimeType === "image/gif") {
        return "gif";
    }


    if (mimeType === "image/bmp") {
        return "bmp";
    }


    if (mimeType === "image/svg+xml") {
        return "svg";
    }


    if (
        mimeType === "image/png" ||
        imageUrl.toLowerCase().includes(".png")
    ) {
        return "png";
    }


    if (
        imageUrl.toLowerCase().includes(".jpg") ||
        imageUrl.toLowerCase().includes(".jpeg")
    ) {
        return "jpg";
    }


    return "png";
}


function getImageDimensions(imageUrl) {

    return new Promise(
        function(resolve, reject) {

            const image =
                new Image();


            image.onload =
                function() {

                    resolve({
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    });
                };


            image.onerror =
                function() {

                    resolve({
                        width: 800,
                        height: 500
                    });
                };


            image.src =
                imageUrl;
        }
    );
}


function createExportFileName(experimentName) {

    let safeName =
        experimentName ||
        "Experiment";


    safeName =
        safeName
            .replace(/[<>:"/\\|?*]/g, "")
            .replace(/\s+/g, "_")
            .trim();


    if (!safeName) {
        safeName = "Experiment";
    }


    return (
        "LabScriptor_" +
        safeName +
        ".docx"
    );
}


// =========================
// INITIALIZE
// =========================

async function initializeExperimentPage() {

    const sessionResult =
        await supabaseClient.auth.getSession();


    const session =
        sessionResult.data.session;


    if (!session) {

        window.location.href =
            "login.html";

        return;
    }


    const sessionId =
        getSessionId();


    if (!sessionId) {

        if (experimentName) {

            experimentName.textContent =
                "Experiment not found";
        }


        if (experimentStatus) {

            experimentStatus.textContent =
                "No session ID provided.";
        }


        return;
    }


    /*
     * Always start in normal read-only mode.
     */

    editMode =
        false;


    await loadExperiment();
}


initializeExperimentPage();