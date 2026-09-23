const SUPABASE_URL = "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        if (email === "" || password === "") {
            loginMessage.textContent =
                "Please enter your email and password.";

            return;
        }

        loginButton.disabled = true;

        loginMessage.textContent =
            "Logging in...";

        const result =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        const data =
            result.data;

        const error =
            result.error;

        if (error) {
            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "Login failed. Please check your email and password.";

            loginButton.disabled = false;

            return;
        }

        console.log(
            "Login successful:",
            data.user
        );

        window.location.href =
            "process.html";
    }
);


async function getCurrentUser() {
    const result =
        await supabaseClient.auth.getUser();

    const user =
        result.data.user;

    const error =
        result.error;

    if (error) {
        console.error(
            "Failed to get current user:",
            error
        );

        return null;
    }

    return user;
}