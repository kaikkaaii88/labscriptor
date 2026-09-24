const timerDisplay = document.getElementById("timer");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

const SUPABASE_URL = "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// FORMAT TIMESTAMP AS SINGAPORE TIME

function formatSingaporeTime(
    timestamp
) {

    if (!timestamp) {
        return "Not available";
    }

    return new Date(
        timestamp
    ).toLocaleString(
        "en-GB",
        {
            timeZone: "Asia/Singapore",
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
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
        fileName.length > 19
    ) {

        return (
            fileName.substring(
                0,
                22
            ) +
            "..."
        );
    }

    return fileName;
}

const headerTimer = document.getElementById("headerTimer");
const mainTimer = document.getElementById("timer");

window.addEventListener("scroll", function () {

    if (window.scrollY > 100) {
        headerTimer.classList.add("visible");
    } else {
        headerTimer.classList.remove("visible");
    }

});

let elapsedSeconds = 0;
let timerInterval = null;
let currentSessionId = localStorage.getItem("labscriptorSessionId");
let currentUserId = null;
let timerStarted = false;


/* =========================
   START PROCESS TIMER
   ========================= */

async function startProcessTimer(eventType) {
    if (timerInterval !== null) {
        return false;
    }

    if (currentSessionId === null) {
        console.error(
            "Cannot start timer because no process session exists."
        );

        alert(
            "Unable to start timer because no process session exists."
        );

        return false;
    }

    const timerEventCreated =
        await createTimerEvent(eventType);

    if (timerEventCreated === false) {
        return false;
    }

    timerInterval =
        setInterval(function () {
            elapsedSeconds++;

            updateTimerDisplay();
            updateExperimentSummary();

        }, 1000);

    return true;
}

/* =========================
   UPDATE TIMER DISPLAY
   ========================= */

function updateTimerDisplay() {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    const formattedTime =
        formattedHours + ":" +
        formattedMinutes + ":" +
        formattedSeconds;

    timerDisplay.textContent = formattedTime;
    headerTimer.textContent = formattedTime;
}


/* =========================
   START / RESUME TIMER
   ========================= */

startButton.addEventListener(
    "click",
    async function () {

        if (experimentActive === false) {

            alert(
                "Please start an experiment first."
            );

            return;
        }

        if (timerInterval !== null) {
            return;
        }

        let timerStartedSuccessfully = false;

        if (timerStarted === false) {

            timerStartedSuccessfully =
                await startProcessTimer("START");

        } else {

            timerStartedSuccessfully =
                await startProcessTimer("RESUME");
        }

        if (
            timerStartedSuccessfully === true
        ) {
            timerStarted = true;
        }
    }
);


/* =========================
   PAUSE TIMER
   ========================= */

pauseButton.addEventListener(
    "click",
    async function () {

        if (experimentActive === false) {
            return;
        }

        if (timerInterval === null) {
            return;
        }

        if (currentSessionId === null) {

            console.error(
                "Cannot pause timer because no process session exists."
            );

            return;
        }

        const timerEventCreated =
            await createTimerEvent("PAUSE");

        if (timerEventCreated === false) {
            return;
        }

        clearInterval(timerInterval);

        timerInterval = null;

        updateExperimentSummary();
    }
);


/* =========================
   RESET TIMER
   ========================= */

resetButton.addEventListener("click", function () {

    if (experimentActive === true) {

        const confirmation =
            confirm(
                "Reset the process timer? The recorded observations will not be deleted."
            );


        if (confirmation === false) {

            return;

        }

    }


    clearInterval(timerInterval);

    timerInterval = null;

    elapsedSeconds = 0;

    updateTimerDisplay();

    updateExperimentSummary();

});


/* =========================
   EXPERIMENT MANAGEMENT
   ========================= */

const experimentName =
    document.getElementById("experimentName");

const startExperimentButton =
    document.getElementById("startExperimentButton");

const finishExperimentButton =
    document.getElementById("finishExperimentButton");

const newExperimentButton =
    document.getElementById("newExperimentButton");

const experimentStatus =
    document.getElementById("experimentStatus");

let experimentActive = false;

const summaryExperimentName =
    document.getElementById("summaryExperimentName");

const summaryStatus =
    document.getElementById("summaryStatus");

const summaryDuration =
    document.getElementById("summaryDuration");

const summaryObservationCount =
    document.getElementById("summaryObservationCount");

const headerStatusDot =
    document.getElementById("headerStatusDot");

const headerStatusText =
    document.getElementById("headerStatusText");

const historyButton =
    document.getElementById("historyButton");

const reviewBanner =
    document.getElementById("reviewBanner");

const reviewTitle =
    document.getElementById("reviewTitle");

const reviewDescription =
    document.getElementById("reviewDescription");

const reviewExperimentCheck =
    document.getElementById("reviewExperimentCheck");

const reviewTimerCheck =
    document.getElementById("reviewTimerCheck");

const reviewObservationCheck =
    document.getElementById("reviewObservationCheck");


historyButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "history.html";
    }
);


/* =========================
   EXPERIMENT SUMMARY
   ========================= */

function updateExperimentSummary() {

    const name =
        experimentName.value.trim();


    /* =========================
       EXPERIMENT NAME
       ========================= */

    if (name === "") {

        summaryExperimentName.textContent =
            "-";

    } else {

        summaryExperimentName.textContent =
            name;

    }


    /* =========================
       EXPERIMENT STATUS
       ========================= */

    if (experimentActive === true) {

        summaryStatus.textContent =
            "In Progress";

    } else if (name !== "") {

        summaryStatus.textContent =
            "Completed";

    } else {

        summaryStatus.textContent =
            "No experiment";

    }


    /* =========================
       PROCESS DURATION
       ========================= */

    const hours =
        Math.floor(elapsedSeconds / 3600);

    const minutes =
        Math.floor(
            (elapsedSeconds % 3600) / 60
        );

    const seconds =
        elapsedSeconds % 60;


    const formattedHours =
        String(hours).padStart(2, "0");

    const formattedMinutes =
        String(minutes).padStart(2, "0");

    const formattedSeconds =
        String(seconds).padStart(2, "0");


    summaryDuration.textContent =
        formattedHours + ":" +
        formattedMinutes + ":" +
        formattedSeconds;


    /* =========================
       OBSERVATION COUNT
       ========================= */

    summaryObservationCount.textContent =
        observations.length;


    /* =========================
    HEADER STATUS
    ========================= */

    if (experimentActive === true) {

        headerStatusText.textContent =
            "Experiment In Progress";

        headerStatusDot.classList.add("active");

    } else if (name !== "") {

        headerStatusText.textContent =
            "Completed";

        headerStatusDot.classList.remove("active");

    } else {

        headerStatusText.textContent =
            "Ready";

        headerStatusDot.classList.remove("active");

    }


    /* =========================
       REVIEW BANNER
       ========================= */

    if (experimentActive === true) {

        headerStatusText.textContent =
            "Experiment Active";

        headerStatusDot.classList.add("active");

        headerStatusDot.parentElement.classList.add("active");

        headerStatusDot.parentElement.classList.remove(
            "completed"
        );

    } else if (name !== "") {

        headerStatusText.textContent =
            "Completed";

        headerStatusDot.classList.remove("active");

        headerStatusDot.parentElement.classList.remove(
            "active"
        );

        headerStatusDot.parentElement.classList.add(
            "completed"
        );

    } else {

        headerStatusText.textContent =
            "Ready";

        headerStatusDot.classList.remove("active");

        headerStatusDot.parentElement.classList.remove(
            "active"
        );

        headerStatusDot.parentElement.classList.remove(
            "completed"
        );

    }


    /* =========================
       REVIEW CHECKLIST
       ========================= */

    if (name !== "") {

        reviewExperimentCheck.textContent =
            "✓";

        reviewExperimentCheck.classList.add("complete");

    } else {

        reviewExperimentCheck.textContent =
            "○";

        reviewExperimentCheck.classList.remove("complete");

    }


    if (elapsedSeconds > 0) {

        reviewTimerCheck.textContent =
            "✓";

        reviewTimerCheck.classList.add("complete");

    } else {

        reviewTimerCheck.textContent =
            "○";

        reviewTimerCheck.classList.remove("complete");

    }


    if (
        observations.length > 0 ||
        imageList.querySelector("img") !== null
    ) {

        reviewObservationCheck.textContent =
            "✓";

        reviewObservationCheck.classList.add("complete");

    } else {

        reviewObservationCheck.textContent =
            "○";

        reviewObservationCheck.classList.remove("complete");

    }

}

/* =========================
   START EXPERIMENT
   ========================= */

startExperimentButton.addEventListener(
    "click",
    async function () {

        const name =
            experimentName.value.trim();

        if (name === "") {
            alert(
                "Please enter an experiment name before starting."
            );

            return;
        }

        if (experimentActive === true) {
            return;
        }

        experimentActive = true;

        experimentName.disabled = true;

        startExperimentButton.disabled = true;

        finishExperimentButton.disabled = false;

        observationText.disabled = false;

        saveObservationButton.disabled = false;

        experimentStatus.textContent =
            "Experiment active: " + name;

        experimentStatus.classList.add(
            "active"
        );

        experimentStatus.classList.remove(
            "finished"
        );

        elapsedSeconds = 0;

        updateTimerDisplay();

        updateExperimentSummary();

        const sessionCreated =
            await createProcessSession();

        if (sessionCreated === false) {

            experimentActive = false;

            experimentName.disabled = false;

            startExperimentButton.disabled = false;

            finishExperimentButton.disabled = true;

            observationText.disabled = true;

            saveObservationButton.disabled = true;

            experimentStatus.textContent =
                "No experiment started.";

            experimentStatus.classList.remove(
                "active"
            );

            return;
        }

        const timerStartedSuccessfully =
            await startProcessTimer("START");

        if (
            timerStartedSuccessfully === false
        ) {

            experimentActive = false;

            experimentName.disabled = false;

            startExperimentButton.disabled = false;

            finishExperimentButton.disabled = true;

            observationText.disabled = true;

            saveObservationButton.disabled = true;

            experimentStatus.textContent =
                "Unable to start experiment.";

            experimentStatus.classList.remove(
                "active"
            );

            return;
        }

        timerStarted = true;
    }
);


/* =========================
   FINISH EXPERIMENT
   ========================= */

finishExperimentButton.addEventListener(
    "click",
    async function () {

        if (
            experimentActive === false ||
            currentSessionId === null
        ) {
            alert(
                "There is no active experiment to finish."
            );

            return;
        }

        const confirmation =
            confirm(
                "Finish this experiment? You will no longer be able to record observations until a new experiment is started."
            );

        if (confirmation === false) {
            return;
        }

        if (currentSessionId === null) {
            alert(
                "No process session is currently active."
            );

            return;
        }

        if (isRecording === true && recognition) {

            recognition.stop();

            voiceStatus.textContent =
                "Voice recording stopped.";

            voiceHint.textContent =
                "The experiment has been completed.";

        }

        const timerEventCreated =
            await createTimerEvent("STOP");

        if (timerEventCreated === false) {
            return;
        }

        const sessionCompleted =
            await completeProcessSession();

        if (sessionCompleted === false) {
            return;
        }

        if (timerInterval !== null) {

            clearInterval(timerInterval);

            timerInterval = null;
        }

        experimentActive = false;

        timerStarted = false;

        experimentName.disabled = false;

        startExperimentButton.disabled = false;

        finishExperimentButton.disabled = true;

        observationText.disabled = true;

        saveObservationButton.disabled = true;

        experimentStatus.textContent =
            "Experiment finished: " +
            experimentName.value;

        experimentStatus.classList.remove(
            "active"
        );

        experimentStatus.classList.add(
            "finished"
        );

        updateExperimentSummary();
    }
);

/* =========================
   NEW EXPERIMENT
   ========================= */

newExperimentButton.addEventListener("click", function () {

    if (experimentActive === true) {

        alert(
            "Please finish the current experiment before starting a new one."
        );

        return;

    }


    const confirmation =
        confirm(
            "Start a new experiment? The current experiment data will be cleared."
        );


    if (confirmation === false) {

        return;

    }


    /* Stop timer */

    clearInterval(timerInterval);

    timerInterval = null;


    /* Stop camera */

    stopCamera();


    /* Reset timer */

    elapsedSeconds = 0;

    updateTimerDisplay();


    /* Reset experiment state */

    experimentActive = false;

    localStorage.removeItem(
        "labscriptorSessionId"
    );

    imageList.innerHTML =
        "<p class=\"empty-message\">" +
        "No images recorded yet." +
        "</p>";

    imagePreview.src = "";
    imagePreview.style.display = "none";

    imagePreviewMessage.style.display = "block";
    imagePreviewMessage.textContent =
        "No image selected.";

    selectedImage = null;

    uploadImageButton.disabled = true;

    imageStatus.textContent =
        "No image selected.";

    timerStarted = false;


    /* Clear experiment name */

    experimentName.value = "";

    experimentName.disabled = false;


    /* Reset experiment buttons */

    startExperimentButton.disabled = false;

    finishExperimentButton.disabled = true;


    /* Reset experiment status */

    experimentStatus.textContent =
        "No experiment started.";

    experimentStatus.classList.remove("active");

    experimentStatus.classList.remove("finished");


    /* Clear observations */

    observations = [];

    observationText.value = "";

    observationText.disabled = false;

    saveObservationButton.disabled = false;

    displayObservations();


    /* Reset voice interface */

    if (recognition && isRecording === true) {

        recognition.stop();

    }

    isRecording = false;

    voiceButton.textContent =
        "🎙 Start Voice Recording";

    voiceButton.classList.remove("recording");

    voiceButton.classList.remove("success");


    voiceStatus.textContent =
        "Voice recording is currently inactive.";

    voiceHint.textContent =
        "Click the button and speak your observation.";


    /* Update summary */

    updateExperimentSummary();

});




/* =========================
   OBSERVATION RECORDING
   ========================= */

const observationText = document.getElementById("observationText");
const observationCharacterCount = document.getElementById("observationCharacterCount");
const saveObservationButton = document.getElementById("saveObservationButton");

const observationList = document.getElementById("observationList");
const observationCount = document.getElementById("observationCount");

let observations = [];


/* =========================
   IMAGE ELEMENTS
   ========================= */

const takePhotoButton =
    document.getElementById("takePhotoButton");

const capturePhotoButton =
    document.getElementById("capturePhotoButton");

const cancelCameraButton =
    document.getElementById("cancelCameraButton");

const cameraPreview =
    document.getElementById("cameraPreview");

const cameraActions =
    document.getElementById("cameraActions");

const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const imagePreviewMessage =
    document.getElementById("imagePreviewMessage");

const uploadImageButton =
    document.getElementById("uploadImageButton");

const imageStatus =
    document.getElementById("imageStatus");

const imageList =
    document.getElementById("imageList");

let selectedImage = null;

let cameraStream = null;

/* =========================
   START CAMERA
   ========================= */

async function startCamera() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            imageStatus.textContent =
                "Camera access is not supported by this browser.";

            return;

        }


        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });


        cameraPreview.srcObject =
            cameraStream;


        cameraPreview.style.display =
            "block";


        imagePreview.style.display =
            "none";


        imagePreviewMessage.style.display =
            "none";


        cameraActions.style.display =
            "flex";


        imageStatus.textContent =
            "Camera is ready. Position the experiment and capture a photo.";

    } catch (error) {

        console.error(
            "Camera access error:",
            error
        );


        if (error.name === "NotAllowedError") {

            imageStatus.textContent =
                "Camera access was denied. Please allow camera access in your browser.";

        } else if (error.name === "NotFoundError") {

            imageStatus.textContent =
                "No camera was found on this device.";

        } else {

            imageStatus.textContent =
                "Unable to access the camera.";

        }

    }

}


/* =========================
   STOP CAMERA
   ========================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        cameraStream = null;

    }


    cameraPreview.srcObject =
        null;

    cameraPreview.style.display =
        "none";


    cameraActions.style.display =
        "none";

}


/* =========================
   TAKE PHOTO
   ========================= */

takePhotoButton.addEventListener(
    "click",
    function () {

        startCamera();

    }
);


/* =========================
   CAPTURE PHOTO
   ========================= */

capturePhotoButton.addEventListener(
    "click",
    function () {

        if (!cameraStream) {

            imageStatus.textContent =
                "Camera is not active.";

            return;

        }


        if (
            cameraPreview.videoWidth === 0 ||
            cameraPreview.videoHeight === 0
        ) {

            imageStatus.textContent =
                "Camera is not ready yet. Please try again.";

            return;

        }


        const canvas =
            document.createElement("canvas");


        canvas.width =
            cameraPreview.videoWidth;

        canvas.height =
            cameraPreview.videoHeight;


        const context =
            canvas.getContext("2d");


        context.drawImage(
            cameraPreview,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            function (blob) {

                if (!blob) {

                    imageStatus.textContent =
                        "Unable to capture photo.";

                    return;

                }


                selectedImage =
                    new File(
                        [blob],
                        "experiment-photo-" +
                        Date.now() +
                        ".jpg",
                        {
                            type: "image/jpeg"
                        }
                    );


                const imageUrl =
                    URL.createObjectURL(
                        selectedImage
                    );


                imagePreview.src =
                    imageUrl;

                imagePreview.style.display =
                    "block";

                imagePreviewMessage.style.display =
                    "none";


                uploadImageButton.disabled =
                    false;


                imageStatus.textContent =
                    "Photo captured. Ready to upload.";


                /* CLOSE CAMERA AFTER CAPTURE */

                stopCamera();

            },
            "image/jpeg",
            0.9
        );

    }
);

/* =========================
   CANCEL CAMERA
   ========================= */

cancelCameraButton.addEventListener(
    "click",
    function () {

        stopCamera();

        imageStatus.textContent =
            "Camera cancelled.";

    }
);


/* =========================
   OBSERVATION CHARACTER COUNT
   ========================= */

observationText.addEventListener("input", function () {

    const characterLength =
        observationText.value.length;

    observationCharacterCount.textContent =
        characterLength + " / 1000";

});


/* =========================
   SAVE OBSERVATION
   ========================= */

saveObservationButton.addEventListener("click", async function () {

    if (experimentActive === false) {

        alert(
            "Please start an experiment before saving an observation."
        );

        return;

    }


    if (currentSessionId === null) {

        alert(
            "No process session is currently active."
        );

        return;

    }


    const observation =
        observationText.value.trim();


    if (observation === "") {

        alert(
            "Please enter an observation before saving."
        );

        return;

    }


    if (observation.length > 1000) {

        alert(
            "Observation is too long. Please keep it within 1000 characters."
        );

        return;

    }


    const observationSaved = await createObservation(observation);


    if (observationSaved === false) {

        return;

    }


    const hours =
        Math.floor(elapsedSeconds / 3600);

    const minutes =
        Math.floor(
            (elapsedSeconds % 3600) / 60
        );

    const seconds =
        elapsedSeconds % 60;


    const formattedHours =
        String(hours).padStart(2, "0");

    const formattedMinutes =
        String(minutes).padStart(2, "0");

    const formattedSeconds =
        String(seconds).padStart(2, "0");


    const processTime =
        formattedHours + ":" +
        formattedMinutes + ":" +
        formattedSeconds;


    const newObservation = {

        text:
            observation,

        processTime:
            processTime

    };


    observations.push(newObservation);


    observationText.value = "";

    observationCharacterCount.textContent =
        "0 / 1000";


    updateExperimentSummary();

    displayObservations();

});


/* =========================
   DISPLAY OBSERVATIONS
   ========================= */

function displayObservations() {

    observationList.innerHTML = "";


    if (observations.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            "No observations recorded yet.";

        observationList.appendChild(emptyMessage);

    } else {

        observations.forEach(function (observation, index) {

            const observationItem =
                document.createElement("div");

            observationItem.className =
                "observation-item";


            /* Timeline marker */

            const observationMarker =
                document.createElement("div");

            observationMarker.className =
                "observation-marker";


            /* Observation content */

            const observationContentContainer =
                document.createElement("div");

            observationContentContainer.className =
                "observation-details";


            /* Observation number */

            const observationNumber =
                document.createElement("span");

            observationNumber.className =
                "observation-number";

            observationNumber.textContent =
                "Observation " + (index + 1);


            /* Process time */

            const observationTime =
                document.createElement("span");

            observationTime.className =
                "observation-time";

            observationTime.textContent =
                observation.processTime;


            /* Observation text */

            const observationTextContent =
                document.createElement("p");

            observationTextContent.className =
                "observation-content";

            observationTextContent.textContent =
                observation.text;


            /* Build observation details */

            const observationMeta =
                document.createElement("div");

            observationMeta.className =
                "observation-meta";


            observationMeta.appendChild(
                observationNumber
            );

            observationMeta.appendChild(
                observationTime
            );


            observationContentContainer.appendChild(
                observationMeta
            );

            observationContentContainer.appendChild(
                observationTextContent
            );


            /* Build observation item */

            observationItem.appendChild(
                observationMarker
            );

            observationItem.appendChild(
                observationContentContainer
            );


            observationList.appendChild(
                observationItem
            );

        });

    }


    /* Update observation count */

    observationCount.textContent =
        observations.length +
        (observations.length === 1
            ? " observation"
            : " observations");

}


/* =========================
   IMAGE PREVIEW
   ========================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];

        if (!file) {

            selectedImage = null;

            imagePreview.style.display =
                "none";

            imagePreviewMessage.style.display =
                "block";

            imagePreviewMessage.textContent =
                "No image selected.";

            uploadImageButton.disabled =
                true;

            imageStatus.textContent =
                "No image selected.";

            return;
        }


        if (!file.type.startsWith("image/")) {

            selectedImage = null;

            imagePreview.style.display =
                "none";

            imagePreviewMessage.style.display =
                "block";

            imagePreviewMessage.textContent =
                "Please select an image file.";

            uploadImageButton.disabled =
                true;

            imageStatus.textContent =
                "Invalid file type.";

            return;
        }


        selectedImage = file;


        const imageUrl =
            URL.createObjectURL(file);


        imagePreview.src =
            imageUrl;

        imagePreview.style.display =
            "block";

        imagePreviewMessage.style.display =
            "none";


        uploadImageButton.disabled =
            false;


        imageStatus.textContent =
            "Image selected. Ready to upload.";

    }
);


/* =========================
   IMAGE UPLOAD
   ========================= */

uploadImageButton.addEventListener(
    "click",
    async function () {

        if (!selectedImage) {
            imageStatus.textContent =
                "Please select an image first.";

            return;
        }

        if (!currentSessionId) {
            imageStatus.textContent =
                "Please start an experiment first.";

            return;
        }

        uploadImageButton.disabled = true;

        imageStatus.textContent =
            "Uploading image...";

        try {

            const formData =
                new FormData();

            formData.append(
                "image",
                selectedImage
            );

            formData.append(
                "session_id",
                currentSessionId
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

            imageStatus.textContent =
                "Image uploaded successfully.";

            loadExperimentImages(
                currentSessionId
            );

            console.log(
                "Uploaded image:",
                data
            );

        } catch (error) {

            console.error(
                "Image upload error:",
                error
            );

            imageStatus.textContent =
                "Failed to upload image.";

            uploadImageButton.disabled =
                false;

        }

    }
);

/* =========================
   LOAD EXPERIMENT IMAGES
   ========================= */

async function loadExperimentImages(sessionId) {

    if (!sessionId) {
        return;
    }

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

        displayExperimentImages(
            data.images
        );

    } catch (error) {

        console.error(
            "Load images error:",
            error
        );

        imageList.innerHTML =
            "<p>Unable to load experiment images.</p>";
    }
}


function displayExperimentImages(images) {

    imageList.innerHTML = "";

    if (!images || images.length === 0) {

        imageList.innerHTML =
            "<p class=\"empty-message\">" +
            "No images recorded yet." +
            "</p>";

        return;
    }

    images.forEach(function (image) {

        const imageItem =
            document.createElement("div");

        imageItem.className =
            "image-list-item";

        const imageElement =
            document.createElement("img");

        imageElement.src =
            image.image_url;

        imageElement.alt =
            image.file_name;

        const fileName =
            document.createElement("p");

        fileName.textContent =
            formatFileName(
                image.file_name
            );

        const recordedTime =
            document.createElement("p");

        recordedTime.textContent =
            formatSingaporeTime(
                image.recorded_at
            );
        imageItem.appendChild(
            imageElement
        );

        imageItem.appendChild(
            fileName
        );

        imageItem.appendChild(
            recordedTime
        );

        imageList.appendChild(
            imageItem
        );

    });
}


/* =========================
   VOICE INPUT
   ========================= */

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceHint =
    document.getElementById("voiceHint");

let recognition;
let isRecording = false;


/* =========================
   CHECK BROWSER SUPPORT
   ========================= */

if ("SpeechRecognition" in window) {

    recognition =
        new SpeechRecognition();

} else if ("webkitSpeechRecognition" in window) {

    recognition =
        new webkitSpeechRecognition();

} else {

    voiceButton.disabled = true;

    voiceStatus.textContent =
        "Voice input is not supported by this browser.";

    voiceHint.textContent =
        "Please use a supported browser.";

}


/* =========================
   CONFIGURE RECOGNITION
   ========================= */

if (recognition) {

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.maxAlternatives = 1;


    /* =========================
       START / STOP RECORDING
       ========================= */

    voiceButton.addEventListener(
        "click",
        function () {

            if (experimentActive === false) {

                alert(
                    "Please start an experiment before using voice recording."
                );

                return;
            }


            if (isRecording === false) {

                try {
                    finalTranscript = "";

                    recognition.start();

                    isRecording = true;

                    voiceButton.textContent =
                        "⏹ Stop Voice Recording";

                    voiceButton.classList.add(
                        "recording"
                    );

                    voiceButton.classList.remove(
                        "success"
                    );

                    voiceStatus.textContent =
                        "Listening...";

                    voiceHint.textContent =
                        "Speak clearly about your laboratory observation.";

                } catch (error) {

                    console.error(
                        "Could not start speech recognition:",
                        error
                    );

                    isRecording = false;

                    voiceStatus.textContent =
                        "Unable to start voice recording.";

                    voiceHint.textContent =
                        "Please try again.";

                }

            } else {

                recognition.stop();

            }

        }
    );


    /* =========================
       SPEECH START
       ========================= */

    recognition.onspeechstart =
        function () {

            console.log(
                "Speech detected."
            );

            voiceStatus.textContent =
                "Recording your observation...";

            voiceHint.textContent =
                "Continue speaking or click Stop when finished.";

        };


    /* =========================
    SPEECH RESULT
    ========================= */

    let finalTranscript = "";

    recognition.onresult =
        function (event) {

            let interimTranscript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0].transcript;

                if (event.results[i].isFinal) {

                    finalTranscript =
                        finalTranscript +
                        transcript +
                        " ";

                } else {

                    interimTranscript =
                        interimTranscript +
                        transcript;

                }

            }

            const displayedTranscript =
                (
                    finalTranscript +
                    interimTranscript
                ).trim();

            console.log(
                "Speech result:",
                displayedTranscript
            );

            if (displayedTranscript !== "") {

                observationText.value =
                    displayedTranscript;

                observationCharacterCount.textContent =
                    observationText.value.length +
                    " / 1000";

                voiceStatus.textContent =
                    "Observation captured.";

                voiceHint.textContent =
                    "Review the text before saving.";

                voiceButton.classList.add(
                    "success"
                );

            }

        };


    /* =========================
    SPEECH END
    ========================= */

    recognition.onend =
        function () {

            console.log(
                "Speech recognition ended."
            );

            isRecording = false;

            voiceButton.textContent =
                "🎙 Start Voice Recording";

            voiceButton.classList.remove(
                "recording"
            );

            if (
                finalTranscript.trim() !== ""
            ) {

                voiceStatus.textContent =
                    "Observation captured.";

                voiceHint.textContent =
                    "Review the text before saving.";

            }

        };


/* =========================
    SPEECH ERROR
    ========================= */

    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );

            if (event.error === "no-speech") {

                voiceStatus.textContent =
                    "No speech detected.";

                voiceHint.textContent =
                    "Make sure the correct microphone is selected and speak clearly.";

                return;
            }

            isRecording = false;

            voiceButton.textContent =
                "🎙 Start Voice Recording";

            voiceButton.classList.remove(
                "recording"
            );

            voiceButton.classList.remove(
                "success"
            );

            if (event.error === "not-allowed") {

                voiceStatus.textContent =
                    "Microphone permission was denied.";

                voiceHint.textContent =
                    "Please allow microphone access and try again.";

            } else if (event.error === "audio-capture") {

                voiceStatus.textContent =
                    "No microphone was detected.";

                voiceHint.textContent =
                    "Check your microphone and Windows input device.";

            } else if (event.error === "network") {

                voiceStatus.textContent =
                    "Network error during voice recognition.";

                voiceHint.textContent =
                    "Check your internet connection and try again.";

            } else {

                voiceStatus.textContent =
                    "Voice input could not be completed.";

                voiceHint.textContent =
                    "Please try recording again.";

            }

        };

}


/* =========================
   CREATE PROCESS SESSION
   ========================= */

async function createProcessSession() {

    if (currentUserId === null) {

        alert(
            "Unable to start the experiment because you are not logged in."
        );

        return false;
    }

    const name =
        experimentName.value.trim();

    if (name === "") {

        alert(
            "Please enter an experiment name before starting."
        );

        return false;
    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/process-sessions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user_id: currentUserId,
                        process_name: name,
                        description: "",
                        start_time: new Date().toISOString(),
                        status: "active"
                    })
                }
            );

        if (!response.ok) {

            let errorMessage =
                "Unable to create the process session.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {

                    errorMessage =
                        errorData.message;
                }

            } catch (parseError) {

                console.log(
                    "Could not read server error response.",
                    parseError
                );
            }

            console.error(
                "Create process session failed:",
                response.status,
                errorMessage
            );

            alert(errorMessage);

            return false;
        }

        const data =
            await response.json();


        /* =========================
           CHECK SERVER RESPONSE
           ========================= */

        if (
            !data.process_session ||
            !data.process_session.session_id
        ) {

            console.error(
                "Invalid process session response:",
                data
            );

            alert(
                "The experiment could not be started because the server returned invalid data."
            );

            return false;
        }


        /* =========================
           SAVE SESSION ID
           ========================= */

        currentSessionId =
            data.process_session.session_id;

        localStorage.setItem(
            "labscriptorSessionId",
            currentSessionId
        );

        console.log(
            "Process session created:",
            currentSessionId
        );

        return true;

    } catch (error) {

        console.error(
            "Network error while creating process session:",
            error
        );

        alert(
            "Unable to connect to the LabScriptor server. Please make sure the backend is running."
        );

        return false;
    }
}


/* =========================
   CREATE TIMER EVENT
   ========================= */

async function createTimerEvent(eventType) {

    if (currentSessionId === null) {

        alert(
            "Unable to record the timer event because no experiment session exists."
        );

        return false;
    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/timer-events",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        session_id: currentSessionId,
                        event_type: eventType
                    })
                }
            );

        if (!response.ok) {

            let errorMessage =
                "Unable to save the timer event.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {

                    errorMessage =
                        errorData.message;
                }

            } catch (parseError) {

                console.log(
                    "Could not read server error response.",
                    parseError
                );
            }

            console.error(
                "Create timer event failed:",
                response.status,
                errorMessage
            );

            alert(errorMessage);

            return false;
        }

        const data =
            await response.json();

        console.log(
            "Timer event created:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Network error while creating timer event:",
            error
        );

        alert(
            "Unable to connect to the LabScriptor server. The timer event was not saved."
        );

        return false;
    }
}


/* =========================
   COMPLETE PROCESS SESSION
   ========================= */

async function completeProcessSession() {

    if (currentSessionId === null) {

        alert(
            "Unable to finish the experiment because no process session exists."
        );

        return false;
    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/process-sessions/" +
                currentSessionId,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: "completed",
                        end_time: new Date().toISOString()
                    })
                }
            );

        if (!response.ok) {

            let errorMessage =
                "Unable to complete the experiment.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {

                    errorMessage =
                        errorData.message;
                }

            } catch (parseError) {

                console.log(
                    "Could not read server error response.",
                    parseError
                );
            }

            console.error(
                "Complete process session failed:",
                response.status,
                errorMessage
            );

            alert(errorMessage);

            return false;
        }

        const data =
            await response.json();

        console.log(
            "Process session completed:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Network error while completing process session:",
            error
        );

        alert(
            "Unable to connect to the LabScriptor server. The experiment could not be completed."
        );

        return false;
    }
}


/* =========================
   CREATE OBSERVATION
   ========================= */

async function createObservation(observation) {

    if (currentSessionId === null) {

        alert(
            "Unable to save the observation because no experiment session exists."
        );

        return false;
    }

    if (observation.trim() === "") {

        alert(
            "Please enter an observation before saving."
        );

        return false;
    }

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/observations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        session_id: currentSessionId,
                        observation: observation
                    })
                }
            );

        if (!response.ok) {

            let errorMessage =
                "Unable to save the observation.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {

                    errorMessage =
                        errorData.message;
                }

            } catch (parseError) {

                console.log(
                    "Could not read server error response.",
                    parseError
                );
            }

            console.error(
                "Create observation failed:",
                response.status,
                errorMessage
            );

            alert(errorMessage);

            return false;
        }

        const data =
            await response.json();

        console.log(
            "Observation created:",
            data
        );

        return true;

    } catch (error) {

        console.error(
            "Network error while creating observation:",
            error
        );

        alert(
            "Unable to connect to the LabScriptor server. The observation was not saved."
        );

        return false;
    }
}


/* =========================
   LOAD OBSERVATIONS
   ========================= */

async function loadObservations() {

    try {

        if (currentSessionId === null) {

            console.error(
                "Cannot load observations because no process session exists."
            );

            return false;

        }


        const response =
            await fetch(
                "http://localhost:3000/api/observations/" +
                currentSessionId
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Failed to load observations:",
                data
            );


            alert(
                "Failed to load observations: " +
                data.message
            );


            return false;

        }


        observations = [];


        data.observations.forEach(
            function (observation) {

                const processTime =
                    formatSingaporeTime(
                        observation.recorded_at
                    );


                const newObservation = {

                    text:
                        observation.observation,

                    processTime:
                        processTime

                };


                observations.push(
                    newObservation
                );

            }
        );


        displayObservations();

        updateExperimentSummary();


        console.log(
            "Observations loaded:",
            data.observations
        );


        return true;


    } catch (error) {

        console.error(
            "Error loading observations:",
            error
        );


        alert(
            "Unable to connect to the LabScriptor backend."
        );


        return false;

    }

}

/* =========================
   LOAD PROCESS SESSION
   ========================= */

async function loadProcessSession(sessionId) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/process-sessions/" +
                sessionId
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Failed to load process session:",
                data
            );


            alert(
                "Failed to load process session: " +
                data.message
            );


            return false;

        }


        const session =
            data.process_session;


        currentSessionId =
            session.session_id;

        localStorage.setItem(
            "labscriptorSessionId",
            currentSessionId
        );

        experimentName.value =
            session.process_name;


        if (session.status === "active") {

            experimentActive = true;

            experimentName.disabled = true;

            startExperimentButton.disabled = true;

            finishExperimentButton.disabled = false;

            observationText.disabled = false;

            saveObservationButton.disabled = false;

            experimentStatus.textContent =
                "Experiment active: " +
                session.process_name;

            experimentStatus.classList.add(
                "active"
            );

            experimentStatus.classList.remove(
                "finished"
            );

        } else {

            experimentActive = false;

            experimentName.disabled = false;

            startExperimentButton.disabled = false;

            finishExperimentButton.disabled = true;

            observationText.disabled = true;

            saveObservationButton.disabled = true;

            experimentStatus.textContent =
                "Experiment finished: " +
                session.process_name;

            experimentStatus.classList.remove(
                "active"
            );

            experimentStatus.classList.add(
                "finished"
            );

        }

        await loadObservations();

        await loadExperimentImages(
            currentSessionId
        );

        console.log(
            "Process session loaded:",
            session
        );


        return true;


    } catch (error) {

        console.error(
            "Error loading process session:",
            error
        );


        alert(
            "Unable to connect to the LabScriptor backend."
        );


        return false;

    }

}



async function loadCurrentUser() {
    try {
        const result =
            await supabaseClient.auth.getUser();

        const user =
            result.data.user;

        const error =
            result.error;

        if (error || !user) {
            console.error(
                "No authenticated user found:",
                error
            );

            window.location.href =
                "login.html";

            return false;
        }

        const response =
            await fetch(
                "http://localhost:3000/api/users/" +
                encodeURIComponent(user.email)
            );

        const data =
            await response.json();

        if (!response.ok) {
            console.error(
                "Failed to load LabScriptor user:",
                data
            );

            alert(
                "Unable to load your LabScriptor account."
            );

            return false;
        }

        currentUserId =
            data.user.user_id;

        console.log(
            "Current LabScriptor user:",
            data.user
        );

        return true;

    } catch (error) {
        console.error(
            "Error loading current user:",
            error
        );

        alert(
            "Unable to connect to the LabScriptor backend."
        );

        return false;
    }
}


async function initializeLabScriptor() {

    const userLoaded =
        await loadCurrentUser();

    if (userLoaded === false) {
        return;
    }

    if (currentSessionId !== null) {

        await loadProcessSession(
            currentSessionId
        );

    }

}

initializeLabScriptor();