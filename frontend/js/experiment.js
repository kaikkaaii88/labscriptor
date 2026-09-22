const SUPABASE_URL = "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const experimentName =
    document.getElementById(
        "experimentName"
    );

const experimentStatus =
    document.getElementById(
        "experimentStatus"
    );

const startTime =
    document.getElementById(
        "startTime"
    );

const endTime =
    document.getElementById(
        "endTime"
    );

const duration =
    document.getElementById(
        "duration"
    );

const observationCount =
    document.getElementById(
        "observationCount"
    );

const observationMessage =
    document.getElementById(
        "observationMessage"
    );

const observationList =
    document.getElementById(
        "observationList"
    );

const imageMessage =
    document.getElementById(
        "imageMessage"
    );

const imageList =
    document.getElementById(
        "imageList"
    );

const historyButton =
    document.getElementById(
        "historyButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================
   NAVIGATION
   ========================= */

historyButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "history.html";
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


/* =========================
   GET SESSION ID
   ========================= */

function getSessionId() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const sessionId =
        urlParams.get(
            "session_id"
        );

    return sessionId;
}


/* =========================
   LOAD EXPERIMENT
   ========================= */

async function loadExperiment(
    sessionId
) {

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
                "Failed to load experiment:",
                data
            );

            experimentName.textContent =
                "Unable to load experiment.";

            experimentStatus.textContent =
                data.message;

            return false;
        }


        const experiment =
            data.process_session;


        displayExperiment(
            experiment
        );


        await loadObservations(
            sessionId
        );

        await loadExperimentImages(
            sessionId
        );

        return true;


    } catch (error) {

        console.error(
            "Error loading experiment:",
            error
        );

        experimentName.textContent =
            "Unable to load experiment.";

        experimentStatus.textContent =
            "Unable to connect to the LabScriptor backend.";

        return false;
    }
}


/* =========================
   DISPLAY EXPERIMENT
   ========================= */

function displayExperiment(
    experiment
) {

    experimentName.textContent =
        experiment.process_name;


    experimentStatus.textContent =
        "Status: " +
        experiment.status;


    if (experiment.start_time) {

        startTime.textContent =
            new Date(
                experiment.start_time
            ).toLocaleString();

    } else {

        startTime.textContent =
            "Not available";
    }


    if (experiment.end_time) {

        endTime.textContent =
            new Date(
                experiment.end_time
            ).toLocaleString();

    } else {

        endTime.textContent =
            "Not completed";
    }


    if (
        experiment.start_time &&
        experiment.end_time
    ) {

        const start =
            new Date(
                experiment.start_time
            );

        const end =
            new Date(
                experiment.end_time
            );

        const durationMilliseconds =
            end - start;

        const durationSeconds =
            Math.floor(
                durationMilliseconds / 1000
            );


        duration.textContent =
            formatDuration(
                durationSeconds
            );

    } else {

        duration.textContent =
            "Not available";
    }

}


/* =========================
   FORMAT DURATION
   ========================= */

function formatDuration(
    totalSeconds
) {

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


    const formattedHours =
        String(hours).padStart(
            2,
            "0"
        );

    const formattedMinutes =
        String(minutes).padStart(
            2,
            "0"
        );

    const formattedSeconds =
        String(seconds).padStart(
            2,
            "0"
        );


    return (
        formattedHours +
        ":" +
        formattedMinutes +
        ":" +
        formattedSeconds
    );
}


/* =========================
   LOAD OBSERVATIONS
   ========================= */

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

            console.error(
                "Failed to load observations:",
                data
            );

            observationMessage.textContent =
                "Unable to load observations.";

            return false;
        }


        const observations =
            data.observations;


        observationCount.textContent =
            observations.length;


        displayObservations(
            observations
        );


        return true;


    } catch (error) {

        console.error(
            "Error loading observations:",
            error
        );

        observationMessage.textContent =
            "Unable to connect to the LabScriptor backend.";

        return false;
    }
}


/* =========================
   DISPLAY OBSERVATIONS
   ========================= */

function displayObservations(
    observations
) {

    observationList.innerHTML =
        "";


    if (
        observations.length === 0
    ) {

        observationMessage.textContent =
            "No observations were recorded.";

        return;
    }


    observationMessage.textContent =
        observations.length +
        " observation(s) recorded.";


    observations.forEach(
        function (
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


            const number =
                document.createElement(
                    "span"
                );

            number.textContent =
                "Observation " +
                (index + 1);


            const recordedTime =
                document.createElement(
                    "span"
                );


            if (
                observation.recorded_at
            ) {

                recordedTime.textContent =
                    new Date(
                        observation.recorded_at
                    ).toLocaleString();

            } else {

                recordedTime.textContent =
                    "Time unavailable";
            }


            const text =
                document.createElement(
                    "p"
                );

            text.className =
                "observation-text";

            text.textContent =
                observation.observation;


            meta.appendChild(
                number
            );

            meta.appendChild(
                recordedTime
            );


            card.appendChild(
                meta
            );

            card.appendChild(
                text
            );


            observationList.appendChild(
                card
            );
        }
    );
}


/* =========================
   LOAD EXPERIMENT IMAGES
   ========================= */

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

            console.error(
                "Failed to load images:",
                data
            );

            imageMessage.textContent =
                "Unable to load images.";

            return false;
        }


        const images =
            data.images;


        displayExperimentImages(
            images
        );


        return true;


    } catch (error) {

        console.error(
            "Error loading images:",
            error
        );

        imageMessage.textContent =
            "Unable to connect to the LabScriptor backend.";

        return false;
    }
}


/* =========================
   DISPLAY EXPERIMENT IMAGES
   ========================= */

function displayExperimentImages(
    images
) {

    imageList.innerHTML =
        "";


    if (
        !images ||
        images.length === 0
    ) {

        imageMessage.textContent =
            "No images uploaded.";

        return;
    }


    imageMessage.textContent =
        images.length +
        " image(s) uploaded.";


    images.forEach(
        function (image, index) {

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
                image.file_name;


            const imageNumber =
                document.createElement(
                    "h3"
                );

            imageNumber.textContent =
                "Image " +
                (index + 1);


            const fileName =
                document.createElement(
                    "p"
                );

            let displayFileName =
                image.file_name;

            if (
                displayFileName.length > 25
            ) {

                displayFileName =
                    displayFileName.substring(
                        0,
                        22
                    ) +
                    "...";
            }

            fileName.textContent =
                "File: " +
                displayFileName;


            const recordedTime =
                document.createElement(
                    "p"
                );


            if (
                image.recorded_at
            ) {

                recordedTime.textContent =
                    "Recorded: " +
                    new Date(
                        image.recorded_at
                    ).toLocaleString();

            } else {

                recordedTime.textContent =
                    "Recorded: Time unavailable";
            }


            card.appendChild(
                imageNumber
            );

            card.appendChild(
                imageElement
            );

            card.appendChild(
                fileName
            );

            card.appendChild(
                recordedTime
            );


            imageList.appendChild(
                card
            );

        }
    );
}


/* =========================
   INITIALISE PAGE
   ========================= */

async function initializeExperimentPage() {

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

        return;
    }


    const sessionId =
        getSessionId();


    if (!sessionId) {

        experimentName.textContent =
            "No experiment selected.";

        experimentStatus.textContent =
            "Please return to Experiment History.";

        return;
    }


    await loadExperiment(
        sessionId
    );
}


initializeExperimentPage();