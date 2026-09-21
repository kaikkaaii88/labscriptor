const SUPABASE_URL = "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const historyMessage =
    document.getElementById(
        "historyMessage"
    );

const experimentList =
    document.getElementById(
        "experimentList"
    );

const homeButton =
    document.getElementById(
        "homeButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


homeButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";
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

            return;
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

    } catch (error) {

        console.error(
            "Error loading experiments:",
            error
        );

        historyMessage.textContent =
            "Unable to connect to the LabScriptor backend.";
    }
}


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


            info.appendChild(title);

            info.appendChild(startTime);

            info.appendChild(status);


            card.appendChild(info);

            card.appendChild(viewButton);


            experimentList.appendChild(
                card
            );
        }
    );
}


async function initializeHistory() {

    const user =
        await loadCurrentUser();

    if (!user) {
        return;
    }

    const userId =
        await loadUserId(user);

    if (
        userId === null
    ) {

        historyMessage.textContent =
            "Unable to identify your LabScriptor account.";

        return;
    }

    await loadExperiments(
        userId
    );
}


initializeHistory();