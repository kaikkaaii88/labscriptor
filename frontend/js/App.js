const timerDisplay = document.getElementById("timer");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

let elapsedSeconds = 0;
let timerInterval = null;


/* =========================
   START PROCESS TIMER
   ========================= */

function startProcessTimer() {

    if (timerInterval !== null) {

        return;

    }


    timerInterval = setInterval(function () {

        elapsedSeconds++;

        updateTimerDisplay();

        updateExperimentSummary();

    }, 1000);

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

    timerDisplay.textContent =
        formattedHours + ":" +
        formattedMinutes + ":" +
        formattedSeconds;
}


/* =========================
   START TIMER
   ========================= */

startButton.addEventListener("click", function () {

    if (experimentActive === false) {

        alert(
            "Please start an experiment first."
        );

        return;

    }


    startProcessTimer();

});


/* =========================
   PAUSE TIMER
   ========================= */

pauseButton.addEventListener("click", function () {

    if (timerInterval === null) {

        return;

    }


    clearInterval(timerInterval);

    timerInterval = null;

    updateExperimentSummary();

});


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
            "Experiment Active";

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

        reviewBanner.classList.remove("completed");

        reviewTitle.textContent =
            "Experiment in progress";

        reviewDescription.textContent =
            "Continue recording observations while the experiment is active.";

    } else if (name !== "") {

        reviewBanner.classList.add("completed");

        reviewTitle.textContent =
            "Experiment completed";

        reviewDescription.textContent =
            "The experiment has been completed. Review the recorded information below.";

    } else {

        reviewBanner.classList.remove("completed");

        reviewTitle.textContent =
            "No experiment to review";

        reviewDescription.textContent =
            "Start an experiment to begin recording laboratory information.";

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


    if (observations.length > 0) {

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

startExperimentButton.addEventListener("click", function () {

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


    experimentStatus.textContent =
        "Experiment active: " + name;

    experimentStatus.classList.add("active");

    experimentStatus.classList.remove("finished");


    /* Start process timer */
    startProcessTimer();

});


/* =========================
   FINISH EXPERIMENT
   ========================= */

finishExperimentButton.addEventListener("click", function () {

    if (experimentActive === false) {

        return;

    }


    const confirmation =
        confirm(
            "Finish this experiment? You will no longer be able to record observations until a new experiment is started."
        );


    if (confirmation === false) {

        return;

    }


    clearInterval(timerInterval);

    timerInterval = null;


    experimentActive = false;


    experimentName.disabled = false;

    startExperimentButton.disabled = false;

    finishExperimentButton.disabled = true;

    observationText.disabled = true;

    saveObservationButton.disabled = true;


    experimentStatus.textContent =
        "Experiment finished: " +
        experimentName.value;

    experimentStatus.classList.remove("active");

    experimentStatus.classList.add("finished");


    updateExperimentSummary();

});

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


    /* Reset timer */

    elapsedSeconds = 0;

    updateTimerDisplay();


    /* Reset experiment state */

    experimentActive = false;


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

saveObservationButton.addEventListener("click", function () {

    if (experimentActive === false) {

        alert(
            "Please start an experiment before saving an observation."
        );

        return;

    }

    const observation = observationText.value.trim();


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

    /* Get current process timer */

    const hours = Math.floor(elapsedSeconds / 3600);

    const minutes =
        Math.floor((elapsedSeconds % 3600) / 60);

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


    /* Create observation */

    const newObservation = {
        text: observation,
        processTime: processTime
    };


    /* Add observation to list */

    observations.push(newObservation);

    updateExperimentSummary();


    /* Display updated observations */

    displayObservations();


    /* Clear textarea */

    observationText.value = "";

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
   VOICE INPUT
   ========================= */

const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");
const voiceHint = document.getElementById("voiceHint");

let recognition;
let isRecording = false;


/* =========================
   CHECK BROWSER SUPPORT
   ========================= */

if ("SpeechRecognition" in window) {

    recognition = new SpeechRecognition();

} else if ("webkitSpeechRecognition" in window) {

    recognition = new webkitSpeechRecognition();

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

    voiceButton.addEventListener("click", function () {

        if (experimentActive === false) {

            alert(
                "Please start an experiment before using voice recording."
            );

            return;

        }

        if (isRecording === false) {

            try {

                recognition.start();

                isRecording = true;

                voiceButton.textContent =
                    "⏹ Stop Voice Recording";

                voiceButton.classList.add("recording");

                voiceButton.classList.remove("success");

                voiceStatus.textContent =
                    "Listening...";

                voiceHint.textContent =
                    "Speak clearly about your laboratory observation.";

            } catch (error) {

                console.log(
                    "Could not start speech recognition:",
                    error
                );

            }

        } else {

            recognition.stop();

        }

    });


    /* =========================
       SPEECH START
       ========================= */

    recognition.onspeechstart = function () {

        console.log("Speech detected.");

        voiceStatus.textContent =
            "Recording your observation...";

        voiceHint.textContent =
            "Continue speaking or click Stop when finished.";

    };


    /* =========================
       SPEECH RESULT
       ========================= */

    recognition.onresult = function (event) {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            transcript =
                transcript +
                event.results[i][0].transcript;

        }

        console.log(
            "Speech result:",
            transcript
        );

        observationText.value = transcript;

        voiceStatus.textContent =
            "Observation captured.";

        voiceHint.textContent =
            "Review the text before saving.";

        voiceButton.classList.remove("recording");

        voiceButton.classList.add("success");

    };


    /* =========================
       SPEECH END
       ========================= */

    recognition.onend = function () {

        console.log("Speech recognition ended.");

        isRecording = false;

        voiceButton.textContent =
            "🎙 Start Voice Recording";

        voiceButton.classList.remove("recording");

    };


    /* =========================
       SPEECH ERROR
       ========================= */

    recognition.onerror = function (event) {

        console.log(
            "Speech recognition error:",
            event.error
        );

        isRecording = false;

        voiceButton.textContent =
            "🎙 Start Voice Recording";

        voiceButton.classList.remove("recording");

        voiceButton.classList.remove("success");

        if (event.error === "no-speech") {

            voiceStatus.textContent =
                "No speech detected.";

        } else if (event.error === "not-allowed") {

            voiceStatus.textContent =
                "Microphone permission was denied.";

        } else if (event.error === "audio-capture") {

            voiceStatus.textContent =
                "No microphone was detected.";

        } else {

            voiceStatus.textContent =
                "Voice input could not be completed.";

        }

        voiceHint.textContent =
            "Please try recording again.";

    };

}